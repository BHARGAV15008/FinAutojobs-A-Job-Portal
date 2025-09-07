import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// Basic schema for testing
export const createTables = async (db) => {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      full_name TEXT,
      phone TEXT,
      role TEXT NOT NULL DEFAULT 'applicant',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS companies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      website TEXT,
      location TEXT,
      industry TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS jobs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_id INTEGER,
      recruiter_id INTEGER,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      location TEXT,
      type TEXT,
      experience_level TEXT,
      salary_min INTEGER,
      salary_max INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id),
      FOREIGN KEY (recruiter_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      job_id INTEGER,
      applicant_id INTEGER,
      status TEXT DEFAULT 'pending',
      cover_letter TEXT,
      resume_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (job_id) REFERENCES jobs(id),
      FOREIGN KEY (applicant_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      type TEXT NOT NULL,
      message TEXT NOT NULL,
      read BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );
  `);
};

export const seedTestData = async (db) => {
  await db.exec(`
    -- Insert test users
    INSERT INTO users (username, email, password_hash, full_name, role)
    VALUES 
      ('testapplicant', 'testapplicant@test.com', '$2a$10$test_hash', 'Test Applicant', 'applicant'),
      ('testrecruiter', 'testrecruiter@test.com', '$2a$10$test_hash', 'Test Recruiter', 'recruiter');

    -- Insert test company
    INSERT INTO companies (name, description, location, industry)
    VALUES ('Test Company', 'A test company', 'Test Location', 'Technology');

    -- Insert test job
    INSERT INTO jobs (
      company_id,
      recruiter_id,
      title,
      description,
      location,
      type,
      experience_level,
      salary_min,
      salary_max
    )
    SELECT 
      c.id,
      u.id,
      'Test Developer Position',
      'A test job posting',
      'Test Location',
      'Full-time',
      'Mid-level',
      50000,
      80000
    FROM companies c, users u
    WHERE u.role = 'recruiter'
    LIMIT 1;
  `);
};
