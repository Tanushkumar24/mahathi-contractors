import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { supabase } from './supabase.js';
import { sendSMS } from './sms.js';
import { verifyToken, verifyAdmin } from './authMiddleware.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;
const ADMIN_NUMBERS = (process.env.ADMIN_NUMBERS || '8688074469,9398158902').split(',');

app.use(cors({
  origin: '*', // Allow all origins for API accessibility (can be restricted in production)
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Request validator utility
const isValidMobile = (num) => /^[6-9]\d{9}$/.test(num);

// ============================================================================
// AUTHENTICATION ENDPOINTS
// ============================================================================

/**
 * Endpoint: Send OTP
 * POST /api/auth/send-otp
 */
app.post('/api/auth/send-otp', async (req, res) => {
  const { mobile_number } = req.body;

  if (!mobile_number || !isValidMobile(mobile_number)) {
    return res.status(400).json({ error: 'Invalid mobile number. Please enter a valid 10-digit number.' });
  }

  try {
    // 1. Rate Limiting: Check if OTP was sent to this phone in the last 60 seconds
    const oneMinAgo = new Date(Date.now() - 60 * 1000).toISOString();
    const { data: recentOtps, error: rateError } = await supabase
      .from('otp_verifications')
      .select('created_at')
      .eq('mobile_number', mobile_number)
      .gt('created_at', oneMinAgo);

    if (rateError) throw rateError;

    if (recentOtps && recentOtps.length > 0) {
      return res.status(429).json({ error: 'Please wait 60 seconds before requesting a new OTP.' });
    }

    // 2. Spam Check: Max 5 OTP requests per 15 minutes
    const fifteenMinAgo = new Date(Date.now() - 15 * 60 * 1000).toISOString();
    const { count: spamCount, error: spamError } = await supabase
      .from('otp_verifications')
      .select('id', { count: 'exact', head: true })
      .eq('mobile_number', mobile_number)
      .gt('created_at', fifteenMinAgo);

    if (spamError) throw spamError;

    if (spamCount && spamCount >= 5) {
      return res.status(429).json({ error: 'Too many requests. Please try again after 15 minutes.' });
    }

    // 3. Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString(); // 5 min expiry

    // 4. Save to Supabase
    const { error: insertError } = await supabase
      .from('otp_verifications')
      .insert({
        mobile_number,
        otp,
        expires_at: expiresAt,
        verified: false,
        attempts: 0
      });

    if (insertError) throw insertError;

    // 5. Send SMS OTP (mock in development, MSG91/Twilio in production)
    await sendSMS(mobile_number, otp);

    return res.status(200).json({ message: 'OTP sent successfully.' });
  } catch (err) {
    console.error('Error in send-otp:', err);
    return res.status(500).json({ error: 'Failed to send OTP. Please try again.' });
  }
});

/**
 * Endpoint: Verify OTP
 * POST /api/auth/verify-otp
 */
app.post('/api/auth/verify-otp', async (req, res) => {
  const { mobile_number, otp } = req.body;

  if (!mobile_number || !isValidMobile(mobile_number) || !otp || otp.length !== 6) {
    return res.status(400).json({ error: 'Mobile number and 6-digit OTP code are required.' });
  }

  try {
    // 1. Fetch the latest unverified OTP code
    const { data: records, error: fetchError } = await supabase
      .from('otp_verifications')
      .select('*')
      .eq('mobile_number', mobile_number)
      .eq('verified', false)
      .order('created_at', { ascending: false })
      .limit(1);

    if (fetchError) throw fetchError;

    if (!records || records.length === 0) {
      return res.status(400).json({ error: 'No OTP requested for this mobile number or OTP already used.' });
    }

    const activeOtp = records[0];

    // 2. Anti-brute force: check attempts
    if (activeOtp.attempts >= 3) {
      return res.status(400).json({ error: 'This OTP is locked due to too many failed attempts. Please request a new one.' });
    }

    // 3. Expiry Check
    if (new Date() > new Date(activeOtp.expires_at)) {
      return res.status(400).json({ error: 'OTP expired. Please request a new code.' });
    }

    // 4. Match validation
    if (activeOtp.otp !== otp) {
      // Increment failed attempts
      await supabase
        .from('otp_verifications')
        .update({ attempts: activeOtp.attempts + 1 })
        .eq('id', activeOtp.id);

      const remaining = 3 - (activeOtp.attempts + 1);
      return res.status(400).json({ error: `Incorrect OTP. ${remaining} attempts remaining.` });
    }

    // 5. Success: mark verified to prevent reuse
    const { error: updateError } = await supabase
      .from('otp_verifications')
      .update({ verified: true })
      .eq('id', activeOtp.id);

    if (updateError) throw updateError;

    // 6. Check if user already exists
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('mobile_number', mobile_number)
      .limit(1);

    if (userError) throw userError;

    if (users && users.length > 0) {
      // Existing User -> Issue JWT session
      const user = users[0];
      const token = jwt.sign(
        { id: user.id, mobile_number: user.mobile_number, role: user.role, name: user.name },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      return res.status(200).json({ userExists: true, token, user });
    } else {
      // First time user -> Redirect to profile completion
      return res.status(200).json({ userExists: false, verifiedMobile: mobile_number });
    }
  } catch (err) {
    console.error('Error in verify-otp:', err);
    return res.status(500).json({ error: 'Failed to verify OTP. Please try again.' });
  }
});

/**
 * Endpoint: Register User Profile (For first-time OTP verified users)
 * POST /api/auth/register
 */
app.post('/api/auth/register', async (req, res) => {
  const { mobile_number, name, city } = req.body;

  if (!mobile_number || !isValidMobile(mobile_number) || !name || !city) {
    return res.status(400).json({ error: 'All fields (Name, Mobile, City) are required.' });
  }

  try {
    // 1. Confirm mobile was verified (OTP verified within last 10 minutes)
    const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const { data: verifyLogs, error: logError } = await supabase
      .from('otp_verifications')
      .select('id')
      .eq('mobile_number', mobile_number)
      .eq('verified', true)
      .gt('created_at', tenMinAgo)
      .limit(1);

    if (logError) throw logError;

    if (!verifyLogs || verifyLogs.length === 0) {
      return res.status(400).json({ error: 'Authentication timeout. Please verify your mobile number via OTP again.' });
    }

    // 2. Prevent duplicate user profiles
    const { data: checkUsers, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('mobile_number', mobile_number)
      .limit(1);

    if (checkError) throw checkError;

    if (checkUsers && checkUsers.length > 0) {
      return res.status(400).json({ error: 'This mobile number is already registered.' });
    }

    // 3. Assign role ('admin' if number is in ADMIN_NUMBERS, else 'user')
    const role = ADMIN_NUMBERS.includes(mobile_number) ? 'admin' : 'user';

    // 4. Create user row
    const { data: newUser, error: registerError } = await supabase
      .from('users')
      .insert({
        name,
        mobile_number,
        city,
        role
      })
      .select();

    if (registerError) throw registerError;

    const user = newUser[0];

    // 5. Generate JWT token
    const token = jwt.sign(
      { id: user.id, mobile_number: user.mobile_number, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({ token, user });
  } catch (err) {
    console.error('Error in register:', err);
    return res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
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
  const { service_name, date, time_slot, contact_name, contact_phone, address, notes, created_by_id } = req.body;

  if (!service_name || !date || !time_slot || !contact_name || !contact_phone || !address) {
    return res.status(400).json({ error: 'Required booking details are missing.' });
  }

  try {
    const { data: newBooking, error } = await supabase
      .from('bookings')
      .insert({
        service_name,
        date,
        time_slot,
        contact_name,
        contact_phone,
        address,
        notes,
        status: 'pending',
        created_by_id: created_by_id || null
      })
      .select();

    if (error) throw error;
    return res.status(201).json(newBooking[0]);
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

    return res.status(200).json(updatedBooking[0]);
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
      const cleanPhone = u.mobile_number.replace(/\D/g, '');
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

    // 3. Get recent verified OTP requests (OTP Logins)
    const { data: recentLogins, error: otpError } = await supabase
      .from('otp_verifications')
      .select('mobile_number, created_at')
      .eq('verified', true)
      .order('created_at', { ascending: false })
      .limit(10);

    if (otpError) throw otpError;

    return res.status(200).json({
      totalUsers: userCount || 0,
      bookings,
      recentLogins: recentLogins || []
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

// Start Server
app.listen(PORT, () => {
  console.log(`\n==================================================`);
  console.log(`🚀 Node.js/Express Server running on port: ${PORT}`);
  console.log(`==================================================\n`);
});
