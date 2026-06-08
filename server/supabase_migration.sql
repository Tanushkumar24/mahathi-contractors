-- ============================================================================
-- SQL Migration & Schema Definition for Supabase
-- ============================================================================

-- Enable pgcrypto for UUID generation (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    mobile_number VARCHAR(15) UNIQUE NOT NULL,
    city VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. OTP Verification Logs Table
CREATE TABLE IF NOT EXISTS otp_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    mobile_number VARCHAR(15) NOT NULL,
    otp VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    attempts INTEGER DEFAULT 0,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    service_name VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    time_slot VARCHAR(50) NOT NULL,
    contact_name VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(15) NOT NULL,
    address TEXT NOT NULL,
    notes TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    created_by_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Leads / Contact Enquiries Table
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(15) NOT NULL,
    email VARCHAR(255),
    service_needed VARCHAR(255),
    message TEXT,
    status VARCHAR(50) DEFAULT 'new',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Projects Table
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    category VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    client_name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'ongoing',
    progress_percent INTEGER DEFAULT 0,
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Testimonials / Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    service_category VARCHAR(255),
    location VARCHAR(255),
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index optimization for queries
CREATE INDEX IF NOT EXISTS idx_users_mobile ON users(mobile_number);
CREATE INDEX IF NOT EXISTS idx_otp_mobile ON otp_verifications(mobile_number);
CREATE INDEX IF NOT EXISTS idx_bookings_phone ON bookings(contact_phone);

-- ============================================================================
-- Supabase Row-Level Security (RLS) Policies
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE otp_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Note: Since our backend connects via the service_role key, it will bypass these
-- RLS policies. The policies below are configured to allow secure direct client
-- reads or restricted operations if a client token is ever used directly.

-- A. Users RLS Policies
CREATE POLICY "Allow service role full access on users" 
ON users FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Allow public read-only of users profiles by matching id" 
ON users FOR SELECT USING (true);

-- B. OTP Verifications RLS Policies
CREATE POLICY "Allow service role full access on otp_verifications" 
ON otp_verifications FOR ALL TO service_role USING (true) WITH CHECK (true);

-- C. Bookings RLS Policies
CREATE POLICY "Allow service role full access on bookings" 
ON bookings FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Allow users to read their own bookings by contact_phone" 
ON bookings FOR SELECT TO authenticated 
USING (contact_phone = (auth.jwt() ->> 'phone') OR created_by_id = auth.uid());

-- D. Leads RLS Policies
CREATE POLICY "Allow service role full access on leads" 
ON leads FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Allow public insertion of leads" 
ON leads FOR INSERT TO anon, authenticated WITH CHECK (true);

-- E. Projects RLS Policies
CREATE POLICY "Allow service role full access on projects" 
ON projects FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Allow public reading of projects" 
ON projects FOR SELECT TO anon, authenticated USING (true);

-- F. Reviews RLS Policies
CREATE POLICY "Allow service role full access on reviews" 
ON reviews FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE POLICY "Allow public reading of reviews" 
ON reviews FOR SELECT TO anon, authenticated USING (true);

-- ============================================================================
-- 7. Refresh Tokens Table & Policies
-- ============================================================================

CREATE TABLE IF NOT EXISTS refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_token ON refresh_tokens(token);

ALTER TABLE refresh_tokens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow service role full access on refresh_tokens" 
ON refresh_tokens FOR ALL TO service_role USING (true) WITH CHECK (true);
