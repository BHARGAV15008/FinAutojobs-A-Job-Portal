import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from '../../models/schema.js';

// Create an in-memory SQLite database for testing
const sqlite = new Database(':memory:');

// Create drizzle database instance
const db = drizzle(sqlite, { schema });
export default db;

// Initialize tables
  sqlite.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    full_name TEXT,
    phone TEXT,
    role TEXT NOT NULL DEFAULT 'jobseeker' CHECK (role IN ('jobseeker', 'employer', 'admin')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    bio TEXT,
    location TEXT,
    profile_picture TEXT,
    linkedin_url TEXT,
    github_url TEXT,
    portfolio_url TEXT,
    skills TEXT,
    qualification TEXT,
    experience_years INTEGER,
    resume_url TEXT,
    company_name TEXT,
    position TEXT,
    company_id INTEGER,
    email_verified INTEGER NOT NULL DEFAULT 0 CHECK (email_verified IN (0, 1)),
    phone_verified INTEGER NOT NULL DEFAULT 0 CHECK (phone_verified IN (0, 1)),
    reset_token TEXT,
    reset_token_expires TEXT,
    google_id TEXT,
    microsoft_id TEXT,
    apple_id TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );  CREATE TABLE IF NOT EXISTS companies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    logo_url TEXT,
    website TEXT,
    location TEXT,
    industry TEXT,
    size TEXT,
    founded_year INTEGER,
    email TEXT,
    phone TEXT,
    address TEXT,
    linkedin_url TEXT,
    twitter_url TEXT,
    facebook_url TEXT,
    benefits TEXT,
    culture TEXT,
    mission TEXT,
    vision TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    verified INTEGER DEFAULT 0,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    company_id INTEGER NOT NULL,
    category_id INTEGER,
    location TEXT,
    salary_min INTEGER,
    salary_max INTEGER,
    salary_currency TEXT NOT NULL DEFAULT 'INR',
    job_type TEXT NOT NULL DEFAULT 'Full Time' CHECK (job_type IN ('Full Time', 'Part Time', 'Contract', 'Internship', 'Freelance')),
    work_mode TEXT NOT NULL DEFAULT 'Work from Office' CHECK (work_mode IN ('Work from Office', 'Work from Home', 'Hybrid')),
    experience_min INTEGER NOT NULL DEFAULT 0,
    experience_max INTEGER,
    english_level TEXT,
    description TEXT,
    requirements TEXT,
    benefits TEXT,
    skills_required TEXT,
    responsibilities TEXT,
    education_level TEXT,
    salary_type TEXT NOT NULL DEFAULT 'annual',
    other_languages TEXT,
    application_deadline TEXT,
    positions_available INTEGER NOT NULL DEFAULT 1,
    applications_count INTEGER NOT NULL DEFAULT 0,
    category TEXT,
    tags TEXT,
    priority TEXT NOT NULL DEFAULT 'normal',
    featured INTEGER NOT NULL DEFAULT 0 CHECK (featured IN (0, 1)),
    remote_friendly INTEGER NOT NULL DEFAULT 0 CHECK (remote_friendly IN (0, 1)),
    slug TEXT UNIQUE,
    meta_title TEXT,
    meta_description TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'closed', 'draft')),
    posted_by INTEGER,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    published_at TEXT,
    FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
    FOREIGN KEY (posted_by) REFERENCES users(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS applications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'shortlisted', 'rejected', 'hired')),
    cover_letter TEXT,
    resume_url TEXT,
    applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(job_id, user_id)
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    type TEXT NOT NULL,
    message TEXT NOT NULL,
    read INTEGER NOT NULL DEFAULT 0 CHECK (read IN (0, 1)),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS user_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token TEXT NOT NULL,
    refresh_token TEXT,
    expires_at TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    ip_address TEXT,
    user_agent TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_used TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS saved_jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    job_id INTEGER NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
    UNIQUE(user_id, job_id)
  );
`);

