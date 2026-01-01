import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { sql } from 'drizzle-orm';
import * as schema from '../schema.js';

async function setupDatabase() {
  try {
    console.log('🗄️ Setting up database...');

    // Create database connection
    const sqlite = new Database(':memory:');
    const db = drizzle(sqlite);

    // Create tables
    await sqlite.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        full_name TEXT,
        phone TEXT,
        role TEXT NOT NULL DEFAULT 'jobseeker',
        status TEXT NOT NULL DEFAULT 'active',
        bio TEXT,
        location TEXT,
        profile_picture TEXT,
        linkedin_url TEXT,
        github_url TEXT,
        portfolio_url TEXT,
        skills TEXT,
        qualification TEXT,
        experience_years INTEGER,
        education TEXT,
        resume_url TEXT,
        company_name TEXT,
        position TEXT,
        company_id INTEGER,
        email_verified INTEGER DEFAULT 0,
        phone_verified INTEGER DEFAULT 0,
        reset_token TEXT,
        reset_token_expires TEXT,
        google_id TEXT,
        microsoft_id TEXT,
        apple_id TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS companies (
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
        job_type TEXT NOT NULL DEFAULT 'Full Time',
        work_mode TEXT NOT NULL DEFAULT 'Work from Office',
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
        featured INTEGER DEFAULT 0,
        remote_friendly INTEGER DEFAULT 0,
        slug TEXT UNIQUE,
        meta_title TEXT,
        meta_description TEXT,
        status TEXT NOT NULL DEFAULT 'active',
        posted_by INTEGER,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        published_at TEXT,
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
        FOREIGN KEY (category_id) REFERENCES job_categories(id) ON DELETE SET NULL,
        FOREIGN KEY (posted_by) REFERENCES users(id) ON DELETE SET NULL
      );

      CREATE TABLE IF NOT EXISTS applications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        job_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        cover_letter TEXT,
        resume_url TEXT,
        expected_salary REAL,
        available_from TEXT,
        notice_period TEXT,
        custom_responses TEXT,
        stage TEXT NOT NULL DEFAULT 'applied',
        hr_notes TEXT,
        feedback TEXT,
        rating INTEGER,
        interview_scheduled TEXT,
        interview_type TEXT,
        interview_notes TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        reviewed_at TEXT,
        responded_at TEXT,
        FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(job_id, user_id)
      );

      CREATE TABLE IF NOT EXISTS notifications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        type TEXT NOT NULL,
        message TEXT NOT NULL,
        read INTEGER NOT NULL DEFAULT 0,
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

    // Create indices for performance
    await sqlite.exec(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
      CREATE INDEX IF NOT EXISTS idx_jobs_company_id ON jobs(company_id);
      CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
      CREATE INDEX IF NOT EXISTS idx_applications_job_id ON applications(job_id);
      CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id);
      CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
      CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
      CREATE INDEX IF NOT EXISTS idx_saved_jobs_user_id ON saved_jobs(user_id);
    `);

    // Insert test data
    const insertTestData = async () => {
      // Insert test users
      await db.insert(schema.users).values([
        {
          username: 'testapplicant',
          email: 'testapplicant@test.com',
          password: '$2a$10$test_hash',
          full_name: 'Test Applicant',
          role: 'jobseeker',
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          username: 'testrecruiter',
          email: 'testrecruiter@test.com',
          password: '$2a$10$test_hash',
          full_name: 'Test Recruiter',
          role: 'recruiter',
          status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]);
    };

    await insertTestData();
    console.log('✅ Database setup complete!');

    return db;
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    throw error;
  }
}

export default setupDatabase;
