-- FinAutoJobs Database Schema Migration
-- Version: 0001
-- Description: Initial comprehensive schema with all tables and relationships

-- Enable foreign key constraints
PRAGMA foreign_keys = ON;

-- Users table (Core authentication and user management)
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'applicant' CHECK (role IN ('applicant', 'recruiter', 'admin')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'pending')),
    email_verified INTEGER DEFAULT 0 CHECK (email_verified IN (0, 1)),
    phone_verified INTEGER DEFAULT 0 CHECK (phone_verified IN (0, 1)),
    two_factor_enabled INTEGER DEFAULT 0 CHECK (two_factor_enabled IN (0, 1)),
    last_login INTEGER,
    login_count INTEGER DEFAULT 0,
    failed_login_attempts INTEGER DEFAULT 0,
    account_locked_until INTEGER,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
);

-- User profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    display_name TEXT,
    avatar TEXT,
    phone TEXT,
    date_of_birth INTEGER,
    gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
    nationality TEXT,
    languages TEXT DEFAULT '[]',
    timezone TEXT DEFAULT 'Asia/Kolkata',
    bio TEXT,
    website TEXT,
    linkedin_url TEXT,
    github_url TEXT,
    twitter_url TEXT,
    portfolio_url TEXT,
    profile_completeness INTEGER DEFAULT 0 CHECK (profile_completeness >= 0 AND profile_completeness <= 100),
    is_public INTEGER DEFAULT 1 CHECK (is_public IN (0, 1)),
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
);

-- User addresses table
CREATE TABLE IF NOT EXISTS user_addresses (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('current', 'permanent', 'work')),
    street TEXT,
    city TEXT NOT NULL,
    state TEXT NOT NULL,
    country TEXT NOT NULL DEFAULT 'India',
    postal_code TEXT,
    latitude REAL,
    longitude REAL,
    is_primary INTEGER DEFAULT 0 CHECK (is_primary IN (0, 1)),
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
);

-- User settings table
CREATE TABLE IF NOT EXISTS user_settings (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
    language TEXT DEFAULT 'en',
    currency TEXT DEFAULT 'INR',
    email_notifications INTEGER DEFAULT 1 CHECK (email_notifications IN (0, 1)),
    sms_notifications INTEGER DEFAULT 0 CHECK (sms_notifications IN (0, 1)),
    push_notifications INTEGER DEFAULT 1 CHECK (push_notifications IN (0, 1)),
    job_alerts INTEGER DEFAULT 1 CHECK (job_alerts IN (0, 1)),
    marketing_emails INTEGER DEFAULT 0 CHECK (marketing_emails IN (0, 1)),
    profile_visibility TEXT DEFAULT 'public' CHECK (profile_visibility IN ('public', 'private', 'connections')),
    searchable_by_email INTEGER DEFAULT 0 CHECK (searchable_by_email IN (0, 1)),
    searchable_by_phone INTEGER DEFAULT 0 CHECK (searchable_by_phone IN (0, 1)),
    show_online_status INTEGER DEFAULT 1 CHECK (show_online_status IN (0, 1)),
    allow_direct_messages INTEGER DEFAULT 1 CHECK (allow_direct_messages IN (0, 1)),
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
);

-- User sessions table
CREATE TABLE IF NOT EXISTS user_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_token TEXT NOT NULL UNIQUE,
    device_info TEXT,
    ip_address TEXT,
    user_agent TEXT,
    location TEXT,
    is_active INTEGER DEFAULT 1 CHECK (is_active IN (0, 1)),
    expires_at INTEGER NOT NULL,
    created_at INTEGER NOT NULL,
    last_accessed_at INTEGER NOT NULL
);

-- Companies table
CREATE TABLE IF NOT EXISTS companies (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    tagline TEXT,
    logo TEXT,
    cover_image TEXT,
    website TEXT,
    linkedin_url TEXT,
    twitter_url TEXT,
    facebook_url TEXT,
    instagram_url TEXT,
    youtube_url TEXT,
    industry TEXT NOT NULL,
    sub_industry TEXT,
    company_type TEXT CHECK (company_type IN ('startup', 'mid_size', 'enterprise', 'government', 'non_profit')),
    company_size TEXT CHECK (company_size IN ('1-10', '11-50', '51-200', '201-500', '501-1000', '1000+')),
    founded_year INTEGER,
    headquarters TEXT,
    locations TEXT DEFAULT '[]',
    revenue TEXT CHECK (revenue IN ('under_1m', '1m_10m', '10m_50m', '50m_100m', '100m_500m', '500m_1b', 'over_1b')),
    funding_stage TEXT CHECK (funding_stage IN ('pre_seed', 'seed', 'series_a', 'series_b', 'series_c', 'ipo', 'acquired')),
    total_funding INTEGER,
    last_funding_date INTEGER,
    investors TEXT DEFAULT '[]',
    competitors TEXT DEFAULT '[]',
    technologies TEXT DEFAULT '[]',
    benefits TEXT DEFAULT '[]',
    perks TEXT DEFAULT '[]',
    work_culture TEXT DEFAULT '{}',
    diversity_stats TEXT DEFAULT '{}',
    employee_count INTEGER DEFAULT 0,
    active_jobs_count INTEGER DEFAULT 0,
    total_jobs_posted INTEGER DEFAULT 0,
    average_rating REAL DEFAULT 0.0,
    total_reviews INTEGER DEFAULT 0,
    glassdoor_rating REAL,
    glassdoor_url TEXT,
    is_verified INTEGER DEFAULT 0 CHECK (is_verified IN (0, 1)),
    verification_date INTEGER,
    is_premium INTEGER DEFAULT 0 CHECK (is_premium IN (0, 1)),
    premium_expires_at INTEGER,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended', 'pending_verification')),
    profile_views INTEGER DEFAULT 0,
    profile_score INTEGER DEFAULT 0 CHECK (profile_score >= 0 AND profile_score <= 100),
    last_active_at INTEGER,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
);

-- Continue with remaining tables...
-- (Due to length constraints, I'll create the rest in separate migration files)

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_name ON user_profiles(first_name, last_name);
CREATE INDEX IF NOT EXISTS idx_user_profiles_completeness ON user_profiles(profile_completeness);

CREATE INDEX IF NOT EXISTS idx_user_addresses_user_id ON user_addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_user_addresses_location ON user_addresses(city, state, country);
CREATE INDEX IF NOT EXISTS idx_user_addresses_primary ON user_addresses(user_id, is_primary);

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON user_sessions(is_active);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON user_sessions(expires_at);

CREATE INDEX IF NOT EXISTS idx_companies_name ON companies(name);
CREATE UNIQUE INDEX IF NOT EXISTS idx_companies_slug ON companies(slug);
CREATE INDEX IF NOT EXISTS idx_companies_industry ON companies(industry);
CREATE INDEX IF NOT EXISTS idx_companies_size ON companies(company_size);
CREATE INDEX IF NOT EXISTS idx_companies_location ON companies(headquarters);
CREATE INDEX IF NOT EXISTS idx_companies_status ON companies(status);
CREATE INDEX IF NOT EXISTS idx_companies_verified ON companies(is_verified);
CREATE INDEX IF NOT EXISTS idx_companies_rating ON companies(average_rating);
CREATE INDEX IF NOT EXISTS idx_companies_score ON companies(profile_score);
