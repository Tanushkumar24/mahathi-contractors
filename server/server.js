import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { supabase } from './supabase.js';
import { sendWhatsApp } from './whatsapp.js';
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
    const decodedToken = await admin.auth().verifyIdToken(firebaseToken);
    const email = (decodedToken.email || profile.email || '').toLowerCase();
    const name = profile.name || decodedToken.name || decodedToken.displayName || email?.split('@')[0] || 'Customer';
    const mobileNumber = extractMobile(profile.mobileNumber || decodedToken.phone_number || '');

    if (!email) {
      return res.status(400).json({ error: 'A verified email is required to login.' });
    }

    const role = ADMIN_EMAILS.includes(email) ? 'admin' : 'user';
    const { data: allUsers, error: userError } = await supabase.from('users').select('*');

    if (userError) throw userError;

    const user = (allUsers || []).find((item) => {
      const itemEmail = (item.email || '').toLowerCase();
      const itemPhone = (item.mobile_number || '').replace(/\D/g, '');
      return itemEmail === email || (mobileNumber && itemPhone === mobileNumber);
    });

    if (user) {
      const normalizedUser = {
        ...user,
        email: user.email || email,
        mobile_number: user.mobile_number || mobileNumber,
        role
      };

      if (user.role !== role || !user.email || (mobileNumber && !user.mobile_number)) {
        await supabase
          .from('users')
          .update({
            name: user.name || name,
            email,
            mobile_number: user.mobile_number || mobileNumber || null,
            role
          })
          .eq('id', user.id)
          .then(({ error }) => {
            if (error) {
              console.warn('User profile update skipped:', error.message);
            }
          });
      }

      const token = generateAccessToken(normalizedUser);
      await generateAndSetRefreshToken(req, res, user.id);
      return res.status(200).json({ token, user: normalizedUser });
    }

    const insertPayload = {
      name,
      email,
      mobile_number: mobileNumber || null,
      city: profile.city || 'Not provided',
      role
    };

    let { data: newUser, error: registerError } = await supabase
      .from('users')
      .insert(insertPayload)
      .select();

    if (registerError && /email|mobile_number|null/i.test(registerError.message || '')) {
      const fallbackMobile = mobileNumber || `9${String(Date.now()).slice(-9)}`;
      const fallbackInsert = {
        name,
        mobile_number: fallbackMobile,
        city: profile.city || 'Not provided',
        role
      };
      const fallbackResult = await supabase.from('users').insert(fallbackInsert).select();
      newUser = fallbackResult.data;
      registerError = fallbackResult.error;
    }

    if (registerError) throw registerError;

    const createdUser = {
      ...newUser[0],
      email,
      mobile_number: newUser[0].mobile_number || mobileNumber || ''
    };

    const token = generateAccessToken(createdUser);
    await generateAndSetRefreshToken(req, res, createdUser.id);
    return res.status(201).json({ token, user: createdUser });
  } catch (err) {
    console.error('Error in firebase-login:', err);
    if (err.code === 'auth/id-token-expired') {
      return res.status(401).json({ error: 'Firebase token expired. Please login again.' });
    }
    if (err.code === 'auth/argument-error') {
      return res.status(400).json({ error: 'Invalid Firebase token format.' });
    }
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
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', req.user.id)
      .limit(1);

    if (error) throw error;

    if (!users || users.length === 0) {
      return res.status(404).json({ error: 'User profile not found.' });
    }

    return res.status(200).json(users[0]);
  } catch (err) {
    console.error('Error in auth/me:', err);
    return res.status(500).json({ error: 'Failed to retrieve profile.' });
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
    notes,
    created_by_id,
    send_whatsapp_updates = true
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
      notes,
      send_whatsapp_updates,
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

    if (error) throw error;

    const created = newBooking[0];
    const bookingId = created.id.slice(-6).toUpperCase();

    // Generate WhatsApp Notification Messages
    const customerMsg = `🏗️ MBC - Mahathi Building Contractors

Hello ${contact_name},

Your booking has been successfully received.

🔖 Booking ID: ${bookingId}
🛠️ Service: ${service_name}
📅 Date: ${date}
🕐 Time: ${time_slot}
📍 Location: ${address}

Our team will contact you shortly.
Thank you for choosing MBC.

"Today Under Construction. Tomorrow Your Dream Home."`;

    const adminMsg = `🔔 New Booking Alert — MBC

Booking ID: ${bookingId}
Service: ${service_name}
Customer: ${contact_name}
Phone: ${contact_phone}
Date: ${date} | ${time_slot}
Location: ${address}
Status: Pending`;

    // Trigger WhatsApp Delivery asynchronously (do not block client HTTP response)
    if (send_whatsapp_updates) {
      sendWhatsApp(contact_phone, customerMsg).catch(err => console.error('Error sending customer WhatsApp:', err));
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
