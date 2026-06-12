-- ============================================================================
-- SQL Migration & Schema Definition for Supabase
-- ============================================================================

-- Enable pgcrypto for UUID generation (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    firebase_uid VARCHAR(255) UNIQUE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    email_verified BOOLEAN DEFAULT FALSE,
    mobile_number VARCHAR(15) UNIQUE,
    city VARCHAR(255) DEFAULT 'Not provided',
    role VARCHAR(50) DEFAULT 'user',
    photo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS firebase_uid VARCHAR(255) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- 2. Email OTP Verification Table
CREATE TABLE IF NOT EXISTS email_otps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL,
    otp VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    attempts INTEGER DEFAULT 0,
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
    latitude NUMERIC,
    longitude NUMERIC,
    location_accuracy NUMERIC,
    notes TEXT,
    send_whatsapp_updates BOOLEAN DEFAULT TRUE,
    whatsapp_opt_in BOOLEAN DEFAULT FALSE,
    status VARCHAR(50) DEFAULT 'pending',
    created_by_id UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS latitude NUMERIC;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS longitude NUMERIC;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS location_accuracy NUMERIC;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS whatsapp_opt_in BOOLEAN DEFAULT FALSE;

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

ALTER TABLE projects ADD COLUMN IF NOT EXISTS media_urls JSONB DEFAULT '[]'::jsonb;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS image_urls JSONB DEFAULT '[]'::jsonb;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS video_urls JSONB DEFAULT '[]'::jsonb;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'completed';
ALTER TABLE projects ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS image_url TEXT;

-- 6. Services Table
CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    category VARCHAR(255),
    description TEXT,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE services ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS icon TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS approx_price TEXT;
ALTER TABLE services ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT TRUE;
ALTER TABLE services ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active';

-- 7. Testimonials / Reviews Table
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

ALTER TABLE reviews ADD COLUMN IF NOT EXISTS rating INTEGER;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS customer_name TEXT;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS review_text TEXT;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS photo_url TEXT;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT TRUE;

-- 8. Media Gallery Table
CREATE TABLE IF NOT EXISTS media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT,
    url TEXT NOT NULL,
    public_id TEXT,
    resource_type TEXT,
    linked_type TEXT,
    linked_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index optimization for queries
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_firebase_uid ON users(firebase_uid);
CREATE INDEX IF NOT EXISTS idx_users_mobile ON users(mobile_number);
CREATE INDEX IF NOT EXISTS idx_email_otps_email ON email_otps(email);
CREATE INDEX IF NOT EXISTS idx_bookings_phone ON bookings(contact_phone);

-- ============================================================================
-- Supabase Row-Level Security (RLS) Policies
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_otps ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;

-- Note: Since our backend connects via the service_role key, it will bypass these
-- RLS policies. The policies below are configured to allow secure direct client
-- reads or restricted operations if a client token is ever used directly.

-- A. Users RLS Policies
DROP POLICY IF EXISTS "Allow service role full access on users" ON users;
CREATE POLICY "Allow service role full access on users" 
ON users FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read-only of users profiles by matching id" ON users;
CREATE POLICY "Allow public read-only of users profiles by matching id" 
ON users FOR SELECT USING (true);

-- B. Email OTP RLS Policies
DROP POLICY IF EXISTS "Allow service role full access on email_otps" ON email_otps;
CREATE POLICY "Allow service role full access on email_otps" 
ON email_otps FOR ALL TO service_role USING (true) WITH CHECK (true);

-- C. Bookings RLS Policies
DROP POLICY IF EXISTS "Allow service role full access on bookings" ON bookings;
CREATE POLICY "Allow service role full access on bookings" 
ON bookings FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow users to read their own bookings by contact_phone" ON bookings;
CREATE POLICY "Allow users to read their own bookings by contact_phone" 
ON bookings FOR SELECT TO authenticated 
USING (contact_phone = (auth.jwt() ->> 'phone') OR created_by_id = auth.uid());

-- D. Leads RLS Policies
DROP POLICY IF EXISTS "Allow service role full access on leads" ON leads;
CREATE POLICY "Allow service role full access on leads" 
ON leads FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public insertion of leads" ON leads;
CREATE POLICY "Allow public insertion of leads" 
ON leads FOR INSERT TO anon, authenticated WITH CHECK (true);

-- E. Projects RLS Policies
DROP POLICY IF EXISTS "Allow service role full access on projects" ON projects;
CREATE POLICY "Allow service role full access on projects" 
ON projects FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public reading of projects" ON projects;
CREATE POLICY "Allow public reading of projects" 
ON projects FOR SELECT TO anon, authenticated USING (true);

-- F. Services RLS Policies
DROP POLICY IF EXISTS "Allow service role full access on services" ON services;
CREATE POLICY "Allow service role full access on services" 
ON services FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public reading of services" ON services;
CREATE POLICY "Allow public reading of services" 
ON services FOR SELECT TO anon, authenticated USING (true);

-- G. Reviews RLS Policies
DROP POLICY IF EXISTS "Allow service role full access on reviews" ON reviews;
CREATE POLICY "Allow service role full access on reviews" 
ON reviews FOR ALL TO service_role USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public reading of reviews" ON reviews;
CREATE POLICY "Allow public reading of reviews" 
ON reviews FOR SELECT TO anon, authenticated USING (true);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'media'
      AND policyname = 'Allow service role full access on media'
  ) THEN
    CREATE POLICY "Allow service role full access on media"
    ON media FOR ALL TO service_role USING (true) WITH CHECK (true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'media'
      AND policyname = 'Allow public reading of media'
  ) THEN
    CREATE POLICY "Allow public reading of media"
    ON media FOR SELECT TO anon, authenticated USING (true);
  END IF;
END $$;

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

DROP POLICY IF EXISTS "Allow service role full access on refresh_tokens" ON refresh_tokens;
CREATE POLICY "Allow service role full access on refresh_tokens" 
ON refresh_tokens FOR ALL TO service_role USING (true) WITH CHECK (true);

-- ============================================================================
-- Service Role Grants
-- ============================================================================

-- Required for the Express backend when Supabase table privileges have been
-- tightened. The service_role key bypasses RLS, but it still needs SQL grants.
GRANT USAGE ON SCHEMA public TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO service_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
GRANT USAGE, SELECT ON SEQUENCES TO service_role;
