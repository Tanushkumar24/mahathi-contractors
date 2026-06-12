import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import nodemailer from 'nodemailer';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from './cloudinary.js';
import { supabase } from './supabase.js';
import { getLatestQr, getWhatsAppStatus, logoutWhatsApp, restartWhatsAppClient, sendWhatsApp } from './whatsapp.js';
import { verifyToken, verifyAdmin } from './authMiddleware.js';
import admin from './firebase-admin.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.set('trust proxy', 1);

const JWT_SECRET = process.env.JWT_SECRET;
const ADMIN_NUMBERS = (process.env.ADMIN_NUMBERS || '8688074469,9398158902').split(',');
const ADMIN_EMAILS = [
  'mahathicontractors@gmail.com',
  'devigayatri2002@gmail.com',
  'tanushkumar2006@gmail.com',
  'simhadri.tanushkumar@gmail.com'
];

function ensureCloudinaryConfigured() {
  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    throw new Error('Cloudinary environment variables are missing.');
  }
}

const cloudinaryStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    ensureCloudinaryConfigured();
    const isVideo = file.mimetype.startsWith('video/');
    return {
      folder: 'mahathi-contractors',
      resource_type: isVideo ? 'video' : 'image',
      allowed_formats: isVideo ? ['mp4', 'webm'] : ['jpg', 'jpeg', 'png', 'webp', 'gif', 'avif']
    };
  }
});

const upload = multer({
  storage: cloudinaryStorage,
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
      cb(null, true);
      return;
    }
    cb(new Error('Only image and video uploads are allowed.'));
  }
});

function getOptimizedCloudinaryUrl(url, resourceType) {
  if (!url || resourceType === 'video') return url;
  return url.replace('/upload/', '/upload/f_auto,q_auto/');
}

const smtpPort = Number(process.env.SMTP_PORT || 587);
const mailTransporter = process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    })
  : null;

// Security: HTTP headers protection
app.use(helmet());

// Security: CORS configuration with credentials support for HttpOnly cookies
const whitelist = [
  'https://mahathicontractors.in',
  'http://localhost:5173',
  'http://localhost:5000'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(cookieParser());

// Security: Global Rate Limiting (DDoS and abuse prevention)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests from this IP, please try again after 15 minutes.' }
});
app.use(globalLimiter);

// Security: Auth specific Rate Limiting (Brute-force protection)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // limit each IP to 15 auth requests per windowMs
  message: { error: 'Too many login attempts. Please try again after 15 minutes.' }
});
app.use('/api/auth/', authLimiter);

// Security: Input Sanitization Middleware (XSS and script injection prevention)
function sanitizeInput(req, res, next) {
  const sanitize = (val) => {
    if (typeof val === 'string') {
      return val
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
    }
    if (typeof val === 'object' && val !== null) {
      for (const key in val) {
        val[key] = sanitize(val[key]);
      }
    }
    return val;
  };
  req.body = sanitize(req.body);
  req.query = sanitize(req.query);
  req.params = sanitize(req.params);
  next();
}
app.use(sanitizeInput);

// JWT & Refresh Token Helpers
const generateAccessToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      mobile_number: user.mobile_number,
      email: user.email,
      role: user.role,
      name: user.name
    },
    JWT_SECRET,
    { expiresIn: '7d' } // JWT expiry (7 days)
  );
};

const generateAndSetRefreshToken = async (req, res, userId) => {
  const refreshToken = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days

  // Store in database
  const { error } = await supabase
    .from('refresh_tokens')
    .insert({
      user_id: userId,
      token: refreshToken,
      expires_at: expiresAt
    });

  if (error) throw error;

  // Set HttpOnly, Secure, SameSite=Strict cookie
  const cookieDomain = process.env.COOKIE_DOMAIN || undefined;
  res.cookie('mbc_refresh_token', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production' || req.secure || req.headers['x-forwarded-proto'] === 'https',
    sameSite: 'strict',
    path: '/',
    domain: cookieDomain,
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
  });

  return refreshToken;
};

// ============================================================================
// AUTHENTICATION ENDPOINTS
// ============================================================================

function extractMobile(phoneNumber) {
  if (!phoneNumber) return null;
  const cleaned = phoneNumber.replace(/\D/g, '');
  if (cleaned.startsWith('91') && cleaned.length === 12) {
    return `+${cleaned}`;
  }
  if (cleaned.length === 10) {
    return `+91${cleaned}`;
  }
  return cleaned ? `+${cleaned}` : null;
}

const normalizeEmail = (email) => (email || '').trim().toLowerCase();

const generateEmailOtp = () => String(Math.floor(100000 + Math.random() * 900000));

async function sendVerificationEmail(email, otp) {
  if (!mailTransporter) {
    console.error('[Email OTP] SMTP is not configured. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM_NAME, and SMTP_FROM_EMAIL.');
    throw new Error('Email service is not configured.');
  }

  const fromName = process.env.SMTP_FROM_NAME || 'Mahathi Contractors';
  const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER;

  await mailTransporter.sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to: email,
    subject: 'Your Mahathi Contractors verification code',
    text: `Your verification code is ${otp}. It is valid for 10 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #111827;">
        <h2 style="margin-bottom: 8px;">Mahathi Contractors</h2>
        <p>Your verification code is <strong style="font-size: 24px; letter-spacing: 4px;">${otp}</strong>.</p>
        <p>It is valid for 10 minutes.</p>
      </div>
    `
  });
}

async function hasVerifiedEmailOtp(email) {
  const { data, error } = await supabase
    .from('email_otps')
    .select('id')
    .eq('email', email)
    .eq('verified', true)
    .gt('expires_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) throw error;
  return Boolean(data && data.length > 0);
}

const isMissingEmailVerifiedColumn = (error) =>
  /email_verified|schema cache.*email_verified/i.test(error?.message || '');

const OPTIONAL_USER_COLUMNS = ['firebase_uid', 'photo_url', 'email_verified', 'city', 'mobile_number'];

const isSupabasePermissionDenied = (error) => error?.code === '42501' || /permission denied/i.test(error?.message || '');

const supabasePermissionError = (action, error) => ({
  code: 'SUPABASE_PERMISSION_DENIED',
  error: `Database permission denied while trying to ${action}.`,
  details: error?.message || 'permission denied',
  hint: 'Run the service_role GRANT statements from server/supabase_migration.sql in the Supabase SQL editor.'
});

const removePayloadKeys = (payload, keys) => {
  const next = { ...payload };
  keys.forEach((key) => {
    delete next[key];
  });
  return next;
};

const getMissingUserColumns = (error) => {
  const message = error?.message || '';
  const knownMissingColumns = OPTIONAL_USER_COLUMNS.filter((column) =>
    new RegExp(`${column}|schema cache.*${column}|column .*${column}`, 'i').test(message)
  );
  const quotedColumn = message.match(/'([^']+)' column|column "([^"]+)"/i);
  const parsedColumn = quotedColumn?.[1] || quotedColumn?.[2];

  if (parsedColumn && OPTIONAL_USER_COLUMNS.includes(parsedColumn) && !knownMissingColumns.includes(parsedColumn)) {
    knownMissingColumns.push(parsedColumn);
  }

  return knownMissingColumns;
};

async function insertUserProfile(payload) {
  let createPayload = { ...payload };
  let result = await supabase.from('users').insert(createPayload).select();

  for (let retries = 0; result.error && retries < OPTIONAL_USER_COLUMNS.length; retries += 1) {
    const missingColumns = getMissingUserColumns(result.error);
    if (missingColumns.length === 0) break;

    console.warn('[users] Optional columns missing. Retrying user insert without:', missingColumns);
    createPayload = removePayloadKeys(createPayload, missingColumns);
    result = await supabase.from('users').insert(createPayload).select();
  }

  if (result.error && /mobile_number|null/i.test(result.error.message || '') && !createPayload.mobile_number) {
    console.warn('[users] mobile_number appears required. Retrying user insert with generated placeholder:', result.error.message);
    createPayload = {
      ...createPayload,
      mobile_number: `9${String(Date.now()).slice(-9)}`
    };
    result = await supabase.from('users').insert(createPayload).select();
  }

  return result;
}

async function updateUserProfile(userId, payload) {
  let updatePayload = { ...payload };
  let result = await supabase.from('users').update(updatePayload).eq('id', userId);

  const missingColumns = getMissingUserColumns(result.error);
  if (result.error && missingColumns.length > 0) {
    console.warn('[users] Optional columns missing. Retrying user update without:', missingColumns);
    updatePayload = removePayloadKeys(updatePayload, missingColumns);
    result = await supabase.from('users').update(updatePayload).eq('id', userId);
  }

  return result;
}

function buildUserProfilePayload({ uid, email, name, picture = '', mobileNumber = '', role }) {
  return {
    firebase_uid: uid || null,
    email,
    name: name || email?.split('@')[0] || 'Customer',
    role,
    mobile_number: mobileNumber || null,
    city: 'Not provided',
    email_verified: true,
    photo_url: picture || ''
  };
}

async function findUserProfileByEmail(email) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .limit(1);

  if (error) {
    console.error('Supabase error:', error);
    console.error('[users] Supabase select by email failed:', { email, error });
    return { user: null, error };
  }

  return { user: data?.[0] || null, error: null };
}

async function findUserProfileById(id) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .limit(1);

  if (error) {
    console.error('Supabase error:', error);
    console.error('[users] Supabase select by id failed:', { id, error });
    return { user: null, error };
  }

  return { user: data?.[0] || null, error: null };
}

async function createUserProfile(profile) {
  const result = await insertUserProfile(profile);

  if (result.error) {
    console.error('Supabase error:', result.error);
    console.error('[users] Supabase insert failed:', { profile, error: result.error });
    return { user: null, error: result.error };
  }

  return { user: result.data?.[0] || null, error: null };
}

app.post('/api/auth/send-email-otp', async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const name = req.body.name || email?.split('@')[0] || 'Customer';

  if (!email) {
    return res.status(400).json({ error: 'Email is required.' });
  }

  try {
    const otp = generateEmailOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    const { error } = await supabase
      .from('email_otps')
      .insert({
        email,
        otp,
        expires_at: expiresAt,
        verified: false,
        attempts: 0
      });

    if (error) throw error;

    await sendVerificationEmail(email, otp);

    return res.status(200).json({
      message: 'Verification code sent.',
      email,
      name
    });
  } catch (err) {
    console.error('Error sending email OTP:', err);
    return res.status(500).json({ error: err.message || 'Failed to send verification email.' });
  }
});

app.post('/api/auth/verify-email-otp', async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const otp = String(req.body.otp || '').replace(/\D/g, '');

  if (!email || otp.length !== 6) {
    return res.status(400).json({ error: 'Email and 6-digit verification code are required.' });
  }

  try {
    const { data: records, error } = await supabase
      .from('email_otps')
      .select('*')
      .eq('email', email)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) throw error;

    const record = records?.[0];
    if (!record) {
      return res.status(404).json({ error: 'No verification code found. Please resend code.' });
    }

    if (record.verified) {
      return res.status(200).json({ verified: true, message: 'Email already verified.' });
    }

    if (new Date(record.expires_at) < new Date()) {
      return res.status(410).json({ code: 'EMAIL_OTP_EXPIRED', error: 'Verification code expired. Please resend code.' });
    }

    const attempts = Number(record.attempts || 0) + 1;
    if (record.otp !== otp) {
      await supabase.from('email_otps').update({ attempts }).eq('id', record.id);
      return res.status(400).json({ error: 'Invalid verification code.' });
    }

    await supabase.from('email_otps').update({ verified: true, attempts }).eq('id', record.id);
    await supabase.from('users').update({ email_verified: true }).eq('email', email);

    return res.status(200).json({ verified: true, message: 'Email verified successfully.' });
  } catch (err) {
    console.error('Error verifying email OTP:', err);
    return res.status(500).json({ error: 'Failed to verify email code.' });
  }
});

/**
 * Endpoint: Firebase Auth Login
 * POST /api/auth/firebase-login
 */
app.post('/api/auth/firebase-login', async (req, res) => {
  const { firebaseToken, profile = {} } = req.body;

  if (!firebaseToken) {
    return res.status(400).json({ error: 'Firebase token is required.' });
  }

  try {
    const missingEnvVars = [
      'JWT_SECRET',
      'FIREBASE_PROJECT_ID',
      'FIREBASE_CLIENT_EMAIL',
      'FIREBASE_PRIVATE_KEY',
      'SUPABASE_URL',
      'SUPABASE_SERVICE_ROLE_KEY'
    ].filter((name) => !process.env[name]);

    if (missingEnvVars.length > 0) {
      console.error('[firebase-login] Missing required environment variables:', missingEnvVars);
      return res.status(500).json({
        code: 'MISSING_ENV_VARS',
        error: `Backend auth is missing required environment variables: ${missingEnvVars.join(', ')}`
      });
    }

    let decodedToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(firebaseToken);
    } catch (error) {
      console.error('[firebase-login] Firebase token verify error:', error);
      return res.status(401).json({
        code: 'FIREBASE_TOKEN_VERIFY_FAILED',
        error: 'Firebase token verification failed.'
      });
    }

    const uid = decodedToken.uid;
    const email = (decodedToken.email || '').trim().toLowerCase();
    const name = profile.name || decodedToken.name || decodedToken.displayName || email.split('@')[0] || 'Customer';
    const picture = decodedToken.picture || profile.picture || '';
    const mobileNumber = extractMobile(profile.mobileNumber || decodedToken.phone_number || '');

    if (!uid || !email) {
      console.error('[firebase-login] Firebase token missing uid or email:', {
        uid,
        email,
        tokenProvider: decodedToken.firebase?.sign_in_provider
      });
      return res.status(400).json({ error: 'Firebase token must include a user id and email.' });
    }

    const role = ADMIN_EMAILS.includes(email) ? 'admin' : 'user';

    const { user: existingUser, error: queryError } = await findUserProfileByEmail(email);

    if (queryError) {
      console.warn('[firebase-login] User lookup failed. Attempting profile create as fallback.', {
        email,
        message: queryError.message,
        details: queryError.details,
        hint: queryError.hint,
        code: queryError.code
      });
    }

    let user = existingUser;
    const createdUser = !user;

    if (!user) {
      const profilePayload = buildUserProfilePayload({
        uid,
        name,
        email,
        picture,
        mobileNumber,
        role,
      });
      const createResult = await createUserProfile(profilePayload);

      if (createResult.error) {
        if (isSupabasePermissionDenied(createResult.error)) {
          return res.status(500).json(supabasePermissionError('create user profile', createResult.error));
        }

        return res.status(500).json({
          code: 'SUPABASE_USER_INSERT_FAILED',
          error: 'Failed to create user profile.',
          details: createResult.error.message,
          supabaseCode: createResult.error.code,
          hint: createResult.error.hint
        });
      }

      user = createResult.user;
    } else if (user.role !== role || user.name !== name || user.email_verified !== true) {
      const updatePayload = {
        name: user.name || name,
        role,
        email_verified: true
      };
      const { error: updateError } = await updateUserProfile(user.id, updatePayload);

      if (updateError) {
        console.error('Supabase error:', updateError);
        console.error('[firebase-login] Supabase user update error:', updateError);
      } else {
        user = {
          ...user,
          ...updatePayload
        };
      }
    }

    if (!user?.id) {
      console.error('[firebase-login] Supabase returned no user after load/create:', { email, uid });
      return res.status(500).json({ error: 'User profile was not returned by database.' });
    }

    const normalizedUser = {
      ...user,
      email,
      name: user.name || name,
      role,
      email_verified: true,
      picture
    };

    let token;
    try {
      token = generateAccessToken(normalizedUser);
    } catch (error) {
      console.error('[firebase-login] JWT creation error:', error);
      return res.status(500).json({ error: 'Failed to create login session.' });
    }

    try {
      await generateAndSetRefreshToken(req, res, normalizedUser.id);
    } catch (error) {
      console.error('[firebase-login] Refresh token creation error:', error);
    }

    return res.status(createdUser ? 201 : 200).json({
      token,
      user: normalizedUser
    });
  } catch (err) {
    console.error('[firebase-login] Unexpected error:', err);
    return res.status(500).json({ error: 'Authentication failed.' });
  }
});

/**
 * Endpoint: Register User Profile
 * POST /api/auth/register
 */
app.post('/api/auth/register', async (req, res) => {
  const { firebaseToken, profile = {} } = req.body;

  if (!firebaseToken) {
    return res.status(400).json({ error: 'Firebase token is required.' });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(firebaseToken);
    const email = (decodedToken.email || profile.email || '').toLowerCase();
    const name = profile.name || decodedToken.name || email?.split('@')[0] || 'Customer';
    const mobileNumber = extractMobile(profile.mobileNumber || decodedToken.phone_number || '');
    const role = ADMIN_EMAILS.includes(email) ? 'admin' : 'user';

    const { data: newUser, error: registerError } = await supabase
      .from('users')
      .insert({
        name,
        email,
        mobile_number: mobileNumber || null,
        city: profile.city || 'Not provided',
        role
      })
      .select();

    if (registerError) throw registerError;

    const user = newUser[0];
      const token = generateAccessToken(user);
      await generateAndSetRefreshToken(req, res, user.id);
    return res.status(201).json({ token, user });
  } catch (err) {
    console.error('Error in register:', err);
    return res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

/**
 * Endpoint: Refresh Access Token using HttpOnly cookie
 * POST /api/auth/refresh
 */
app.post('/api/auth/refresh', async (req, res) => {
  const refreshToken = req.cookies.mbc_refresh_token;

  if (!refreshToken) {
    return res.status(401).json({ error: 'Refresh token missing.' });
  }

  try {
    // 1. Fetch active refresh token from Supabase
    const { data: records, error: fetchError } = await supabase
      .from('refresh_tokens')
      .select('*')
      .eq('token', refreshToken)
      .limit(1);

    if (fetchError) throw fetchError;

    if (!records || records.length === 0) {
      return res.status(401).json({ error: 'Invalid refresh token.' });
    }

    const activeToken = records[0];

    // 2. Expiry Check
    if (new Date() > new Date(activeToken.expires_at)) {
      // Delete expired token
      await supabase.from('refresh_tokens').delete().eq('id', activeToken.id);
      res.clearCookie('mbc_refresh_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production' || req.secure || req.headers['x-forwarded-proto'] === 'https',
        sameSite: 'strict',
        path: '/',
        domain: process.env.COOKIE_DOMAIN || undefined
      });
      return res.status(401).json({ error: 'Refresh token expired.' });
    }

    // 3. Fetch user details
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', activeToken.user_id)
      .limit(1);

    if (userError) throw userError;

    if (!users || users.length === 0) {
      return res.status(401).json({ error: 'User profile not found.' });
    }

    const user = users[0];

    // 4. Delete old refresh token (refresh token rotation)
    await supabase.from('refresh_tokens').delete().eq('id', activeToken.id);

    // 5. Generate new access token and fresh refresh token
    const token = generateAccessToken(user);
    await generateAndSetRefreshToken(req, res, user.id);

    return res.status(200).json({ token, user });
  } catch (err) {
    console.error('Error in refresh-token:', err);
    return res.status(500).json({ error: 'Failed to refresh token.' });
  }
});

/**
 * Endpoint: Logout User (Clears HttpOnly cookie & DB refresh record)
 * POST /api/auth/logout
 */
app.post('/api/auth/logout', async (req, res) => {
  const refreshToken = req.cookies.mbc_refresh_token;
  if (refreshToken) {
    try {
      await supabase.from('refresh_tokens').delete().eq('token', refreshToken);
    } catch (err) {
      console.error('Failed to purge refresh token on logout:', err);
    }
  }
  res.clearCookie('mbc_refresh_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production' || req.secure || req.headers['x-forwarded-proto'] === 'https',
    sameSite: 'strict',
    path: '/',
    domain: process.env.COOKIE_DOMAIN || undefined
  });
  return res.status(200).json({ message: 'Logged out successfully.' });
});

/**
 * Endpoint: Load profile from token
 * GET /api/auth/me
 */
app.get('/api/auth/me', verifyToken, async (req, res) => {
  try {
    const email = (req.user.email || '').trim().toLowerCase();
    const role = ADMIN_EMAILS.includes(email) ? 'admin' : (req.user.role || 'user');

    let { user, error } = await findUserProfileById(req.user.id);

    if (error) {
      if (isSupabasePermissionDenied(error)) {
        return res.status(500).json(supabasePermissionError('load user profile', error));
      }

      return res.status(500).json({
        code: 'SUPABASE_USER_SELECT_FAILED',
        error: 'Could not load user profile from database.',
        details: error.message
      });
    }

    if (!user && email) {
      const byEmail = await findUserProfileByEmail(email);

      if (byEmail.error) {
        if (isSupabasePermissionDenied(byEmail.error)) {
          return res.status(500).json(supabasePermissionError('load user profile by email', byEmail.error));
        }

        return res.status(500).json({
          code: 'SUPABASE_USER_SELECT_FAILED',
          error: 'Could not load user profile by email.',
          details: byEmail.error.message
        });
      }

      user = byEmail.user;
    }

    if (!user && email) {
      console.warn('[auth/me] Profile missing. Creating user profile from JWT claims:', {
        id: req.user.id,
        email,
        role
      });

      const profilePayload = buildUserProfilePayload({
        uid: null,
        email,
        name: req.user.name,
        role,
        mobileNumber: req.user.mobile_number
      });
      const createResult = await createUserProfile(profilePayload);

      if (createResult.error) {
        if (isSupabasePermissionDenied(createResult.error)) {
          return res.status(500).json(supabasePermissionError('recreate missing user profile', createResult.error));
        }

        return res.status(500).json({
          code: 'SUPABASE_USER_INSERT_FAILED',
          error: 'User profile was missing and could not be recreated.',
          details: createResult.error.message
        });
      }

      user = createResult.user;
    }

    if (!user) {
      console.error('[auth/me] User profile missing and JWT has no email:', req.user);
      return res.status(404).json({
        code: 'USER_PROFILE_NOT_FOUND',
        error: 'User profile not found and cannot be recreated without email.'
      });
    }

    const normalizedUser = {
      ...user,
      role
    };

    return res.status(200).json(normalizedUser);
  } catch (err) {
    console.error('[auth/me] Unexpected error:', err);
    return res.status(500).json({
      code: 'AUTH_ME_FAILED',
      error: 'Failed to retrieve profile.',
      details: err.message
    });
  }
});

// ============================================================================
// BOOKINGS ENDPOINTS
// ============================================================================

/**
 * Endpoint: List bookings
 * GET /api/bookings
 */
app.get('/api/bookings', verifyToken, async (req, res) => {
  try {
    let query = supabase.from('bookings').select('*');

    // Secure data visibility: Normal users only see their own phone bookings. Admins see all.
    if (req.user.role !== 'admin') {
      query = query.eq('contact_phone', req.user.mobile_number);
    }

    const { data: bookings, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return res.status(200).json(bookings);
  } catch (err) {
    console.error('Error fetching bookings:', err);
    return res.status(500).json({ error: 'Failed to load bookings.' });
  }
});

/**
 * Endpoint: Create Booking
 * POST /api/bookings
 */
app.post('/api/bookings', async (req, res) => {
  const {
    service_name,
    date,
    time_slot,
    contact_name,
    contact_phone,
    address,
    latitude,
    longitude,
    location_accuracy,
    notes,
    created_by_id,
    send_whatsapp_updates = true,
    whatsapp_opt_in = send_whatsapp_updates === true
  } = req.body;

  if (!service_name || !date || !time_slot || !contact_name || !contact_phone || !address) {
    return res.status(400).json({ error: 'Required booking details are missing.' });
  }

  try {
    const bookingPayload = {
      service_name,
      date,
      time_slot,
      contact_name,
      contact_phone,
      address,
      latitude: latitude ?? null,
      longitude: longitude ?? null,
      location_accuracy: location_accuracy ?? null,
      notes,
      send_whatsapp_updates,
      whatsapp_opt_in,
      status: 'pending',
      created_by_id: created_by_id || null
    };

    let { data: newBooking, error } = await supabase
      .from('bookings')
      .insert(bookingPayload)
      .select();

    if (error && /send_whatsapp_updates/i.test(error.message || '')) {
      const { send_whatsapp_updates: _unused, ...fallbackPayload } = bookingPayload;
      const fallbackResult = await supabase.from('bookings').insert(fallbackPayload).select();
      newBooking = fallbackResult.data;
      error = fallbackResult.error;
    }

    if (error && /whatsapp_opt_in|latitude|longitude|location_accuracy/i.test(error.message || '')) {
      const {
        whatsapp_opt_in: _whatsappOptIn,
        latitude: _latitude,
        longitude: _longitude,
        location_accuracy: _locationAccuracy,
        ...fallbackPayload
      } = bookingPayload;
      const fallbackResult = await supabase.from('bookings').insert(fallbackPayload).select();
      newBooking = fallbackResult.data;
      error = fallbackResult.error;
    }

    if (error) throw error;

    const created = newBooking[0];
    const bookingId = created.id.slice(-6).toUpperCase();

    // Customer WhatsApp confirmation via whatsapp-web.js.
    // WARNING: This uses unofficial WhatsApp Web automation and may require
    // occasional QR re-scanning if the personal WhatsApp session disconnects.
    const customerMsg = `Hello ${contact_name} \u{1F44B}

Your booking with Mahathi Building Contractors has been received successfully.

Service: ${service_name}
Date: ${date}

Our team will contact you shortly.

- Mahathi Building Contractors`;

    const adminMsg = `🔔 New Booking Alert — MBC

Booking ID: ${bookingId}
Service: ${service_name}
Customer: ${contact_name}
Phone: ${contact_phone}
Date: ${date} | ${time_slot}
Location: ${address}
Status: Pending`;

    // Trigger WhatsApp Delivery asynchronously (do not block client HTTP response)
    const whatsAppStatus = getWhatsAppStatus({ start: false });
    if (whatsapp_opt_in && whatsAppStatus.connected) {
      sendWhatsApp(contact_phone, customerMsg).catch(err => console.error('Error sending customer WhatsApp:', err));
    } else if (whatsapp_opt_in) {
      console.warn('[WhatsApp] WhatsApp not connected. Customer booking confirmation was not sent.');
    } else {
      console.log('[WhatsApp] Customer did not opt in. Booking confirmation not sent.');
    }

    const adminPhones = (process.env.ADMIN_NUMBERS || '8688074469,9398158902').split(',');
    adminPhones.forEach(adminPhone => {
      sendWhatsApp(adminPhone, adminMsg).catch(err => console.error(`Error sending admin WhatsApp to ${adminPhone}:`, err));
    });

    return res.status(201).json(created);
  } catch (err) {
    console.error('Error creating booking:', err);
    return res.status(500).json({ error: 'Booking submission failed.' });
  }
});

/**
 * Endpoint: Update Booking Status (Admin only)
 * PATCH /api/bookings/:id
 */
app.patch('/api/bookings/:id', verifyToken, verifyAdmin, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ error: 'Status is required.' });
  }

  try {
    const { data: updatedBooking, error } = await supabase
      .from('bookings')
      .update({ status })
      .eq('id', id)
      .select();

    if (error) throw error;
    
    if (!updatedBooking || updatedBooking.length === 0) {
      return res.status(404).json({ error: 'Booking not found.' });
    }

    const updated = updatedBooking[0];
    const bookingId = updated.id.slice(-6).toUpperCase();

    // Trigger WhatsApp notifications based on new status
    if (status === 'confirmed') {
      const custMsg = `🏗️ MBC - Mahathi Building Contractors

Hello ${updated.contact_name},

Your booking has been CONFIRMED!

🔖 Booking ID: ${bookingId}
🛠️ Service: ${updated.service_name}
📅 Date: ${updated.date}
🕐 Time: ${updated.time_slot}
📍 Location: ${updated.address}

We look forward to serving you.
For queries: 📞 8688074469`;

      sendWhatsApp(updated.contact_phone, custMsg).catch(err => console.error('Error sending customer confirm WhatsApp:', err));
    } else if (status === 'completed') {
      const custMsg = `🏗️ MBC - Mahathi Building Contractors

Hello ${updated.contact_name},

Your booking has been marked as COMPLETED!

🔖 Booking ID: ${bookingId}
🛠️ Service: ${updated.service_name}
📅 Date: ${updated.date}

Thank you for choosing Mahathi Building Contractors. We hope you are satisfied with our services!
For feedback: 📞 8688074469`;

      sendWhatsApp(updated.contact_phone, custMsg).catch(err => console.error('Error sending customer complete WhatsApp:', err));
    } else if (status === 'cancelled') {
      const adminMsg = `❌ Booking Cancelled Alert — MBC

Booking ID: ${bookingId}
Service: ${updated.service_name}
Customer: ${updated.contact_name}
Phone: ${updated.contact_phone}
Date: ${updated.date} | ${updated.time_slot}
Status: Cancelled`;

      const adminPhones = (process.env.ADMIN_NUMBERS || '8688074469,9398158902').split(',');
      adminPhones.forEach(adminPhone => {
        sendWhatsApp(adminPhone, adminMsg).catch(err => console.error(`Error sending cancel admin WhatsApp to ${adminPhone}:`, err));
      });
    }

    return res.status(200).json(updated);
  } catch (err) {
    console.error('Error updating booking:', err);
    return res.status(500).json({ error: 'Failed to update booking status.' });
  }
});

// ============================================================================
// LEADS ENDPOINTS
// ============================================================================

app.get('/api/leads', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { data: leads, error } = await supabase.from('leads').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return res.status(200).json(leads);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/leads', async (req, res) => {
  const { name, phone, email, service_needed, message } = req.body;
  try {
    const { data, error } = await supabase
      .from('leads')
      .insert({ name, phone, email, service_needed, message, status: 'new' })
      .select();
    if (error) throw error;
    return res.status(201).json(data[0]);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.patch('/api/leads/:id', verifyToken, verifyAdmin, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    const { data, error } = await supabase.from('leads').update({ status }).eq('id', id).select();
    if (error) throw error;
    return res.status(200).json(data[0]);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ============================================================================
// PROJECTS ENDPOINTS
// ============================================================================

app.get('/api/projects', async (req, res) => {
  try {
    const { data: projects, error } = await supabase.from('projects').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return res.status(200).json(projects);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ============================================================================
// ADMIN MEDIA UPLOADS (Cloudinary)
// ============================================================================

app.post('/api/admin/upload', verifyToken, verifyAdmin, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const resourceType = req.file.mimetype?.startsWith('video/') ? 'video' : 'image';
    const secureUrl = getOptimizedCloudinaryUrl(req.file.path, resourceType);
    const publicId = req.file.filename;
    const payload = {
      title: req.body.title || req.file.originalname,
      url: secureUrl,
      public_id: publicId,
      resource_type: resourceType,
      linked_type: req.body.linked_type || null,
      linked_id: req.body.linked_id || null
    };

    const { data, error } = await supabase.from('media').insert(payload).select();
    if (error) {
      console.error('[media] Failed to save upload metadata:', error);
      return res.status(201).json({
        secure_url: secureUrl,
        public_id: publicId,
        resource_type: resourceType,
        warning: 'Uploaded to Cloudinary, but media metadata was not saved. Run the media table migration.'
      });
    }

    return res.status(201).json({
      ...data[0],
      secure_url: secureUrl,
      public_id: publicId,
      resource_type: resourceType
    });
  } catch (err) {
    console.error('[media] Upload failed:', err);
    return res.status(500).json({ error: err.message || 'Upload failed.' });
  }
});

app.get('/api/media', async (req, res) => {
  try {
    const { data, error } = await supabase.from('media').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.delete('/api/admin/media/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { data: existing, error: fetchError } = await supabase.from('media').select('*').eq('id', req.params.id).single();
    if (fetchError) throw fetchError;

    if (existing?.public_id) {
      try {
        await cloudinary.uploader.destroy(existing.public_id, { resource_type: existing.resource_type || 'image' });
      } catch (cloudinaryError) {
        console.error('[media] Cloudinary delete failed:', cloudinaryError);
      }
    }

    const { error } = await supabase.from('media').delete().eq('id', req.params.id);
    if (error) throw error;
    return res.status(200).json({ message: 'Media deleted successfully.' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/projects', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase.from('projects').insert(req.body).select();
    if (error) throw error;
    return res.status(201).json(data[0]);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.put('/api/projects/:id', verifyToken, verifyAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const { data, error } = await supabase.from('projects').update(req.body).eq('id', id).select();
    if (error) throw error;
    return res.status(200).json(data[0]);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.delete('/api/projects/:id', verifyToken, verifyAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) throw error;
    return res.status(200).json({ message: 'Project deleted successfully.' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ============================================================================
// SERVICES ENDPOINTS
// ============================================================================

app.get('/api/services', async (req, res) => {
  try {
    const { data: services, error } = await supabase.from('services').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return res.status(200).json(services);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/services', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase.from('services').insert(req.body).select();
    if (error) throw error;
    return res.status(201).json(data[0]);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.put('/api/services/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase.from('services').update(req.body).eq('id', req.params.id).select();
    if (error) throw error;
    return res.status(200).json(data[0]);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.delete('/api/services/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { error } = await supabase.from('services').delete().eq('id', req.params.id);
    if (error) throw error;
    return res.status(200).json({ message: 'Service deleted successfully.' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ============================================================================
// TESTIMONIALS / REVIEWS ENDPOINTS
// ============================================================================

app.get('/api/reviews', async (req, res) => {
  try {
    const { data: reviews, error } = await supabase.from('reviews').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return res.status(200).json(reviews);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/reviews', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase.from('reviews').insert(req.body).select();
    if (error) throw error;
    return res.status(201).json(data[0]);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.put('/api/reviews/:id', verifyToken, verifyAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const { data, error } = await supabase.from('reviews').update(req.body).eq('id', id).select();
    if (error) throw error;
    return res.status(200).json(data[0]);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

app.delete('/api/reviews/:id', verifyToken, verifyAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const { error } = await supabase.from('reviews').delete().eq('id', id);
    if (error) throw error;
    return res.status(200).json({ message: 'Review deleted successfully.' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// ============================================================================
// ADMIN CONSOLE ENDPOINTS
// ============================================================================

app.get('/api/admin/whatsapp/status', verifyToken, verifyAdmin, async (req, res) => {
  try {
    return res.status(200).json(getWhatsAppStatus());
  } catch (err) {
    console.error('[WhatsApp] Failed to read status:', err);
    return res.status(500).json({ error: 'Failed to read WhatsApp status.' });
  }
});

app.get('/api/admin/whatsapp/qr', verifyToken, verifyAdmin, async (req, res) => {
  try {
    if (req.query.refresh === 'true') {
      await restartWhatsAppClient();
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }

    return res.status(200).json({
      qr: getLatestQr(),
      status: getWhatsAppStatus()
    });
  } catch (err) {
    console.error('[WhatsApp] Failed to read QR:', err);
    return res.status(500).json({ error: 'Failed to read WhatsApp QR.' });
  }
});

app.post('/api/admin/whatsapp/logout', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const status = await logoutWhatsApp();
    return res.status(200).json(status);
  } catch (err) {
    console.error('[WhatsApp] Failed to logout:', err);
    return res.status(500).json({ error: 'Failed to disconnect WhatsApp.' });
  }
});

/**
 * Endpoint: List registered users with booking counts
 * GET /api/admin/users
 */
app.get('/api/admin/users', verifyToken, verifyAdmin, async (req, res) => {
  try {
    // 1. Get all users
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (userError) throw userError;

    // 2. Get all bookings to map counts
    const { data: bookings, error: bookingError } = await supabase
      .from('bookings')
      .select('contact_phone');

    if (bookingError) throw bookingError;

    // 3. Compute count hash map
    const bookingCounts = {};
    bookings.forEach(b => {
      const ph = b.contact_phone.replace(/\D/g, '');
      bookingCounts[ph] = (bookingCounts[ph] || 0) + 1;
    });

    // 4. Enrich user profiles
    const enrichedUsers = users.map(u => {
      const cleanPhone = (u.mobile_number || '').replace(/\D/g, '');
      return {
        ...u,
        booking_count: bookingCounts[cleanPhone] || 0
      };
    });

    return res.status(200).json(enrichedUsers);
  } catch (err) {
    console.error('Error fetching admin user list:', err);
    return res.status(500).json({ error: 'Failed to retrieve user list.' });
  }
});

/**
 * Endpoint: Get stats overview for admin dashboard
 * GET /api/admin/stats
 */
app.get('/api/admin/stats', verifyToken, verifyAdmin, async (req, res) => {
  try {
    // 1. Get user counts
    const { count: userCount, error: userError } = await supabase
      .from('users')
      .select('id', { count: 'exact', head: true });

    if (userError) throw userError;

    // 2. Get bookings counts & lists
    const { data: bookings, error: bookingError } = await supabase
      .from('bookings')
      .select('id, status, created_at, contact_name, service_name');

    if (bookingError) throw bookingError;

    // 3. Get recent user registrations
    const { data: recentUsers, error: usersError } = await supabase
      .from('users')
      .select('mobile_number, created_at, name')
      .order('created_at', { ascending: false })
      .limit(10);

    if (usersError) throw usersError;

    return res.status(200).json({
      totalUsers: userCount || 0,
      bookings,
      recentLogins: recentUsers || []
    });
  } catch (err) {
    console.error('Error fetching stats overview:', err);
    return res.status(500).json({ error: 'Failed to retrieve overview statistics.' });
  }
});

// ============================================================================
// AI COMPANION CHAT ENDPOINT
// ============================================================================
app.post('/api/ai/chat', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Prompt is required.' });

  try {
    // Mock response or basic LLM mapping for MBC AI
    const reply = "Thank you for asking! Mahathi Building Contractors offers top-tier construction and design services in Andhra Pradesh. For custom pricing or specific inquiries, we highly recommend booking a free consultation at our Book page, or contacting Simhadri Sampath Kumar directly at +91 86880 74469.";
    return res.status(200).json({ result: reply });
  } catch (err) {
    return res.status(500).json({ error: 'AI Companion unavailable.' });
  }
});

app.get('/', (req, res) => {
  res.json({
    status: 'success',
    message: 'Mahathi Contractors API Running',
    version: '1.0.0'
  });
});
// Start Server
app.listen(PORT, () => {
  console.log(`\n==================================================`);
  console.log(`🚀 Node.js/Express Server running on port: ${PORT}`);
  console.log(`==================================================\n`);

});
