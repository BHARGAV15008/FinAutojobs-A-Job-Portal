import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { sql } from 'drizzle-orm';
import path from 'path';
import { fileURLToPath } from 'url';
import { AppError } from '../middleware/errorHandler.js';

// Get current directory in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Schema imports
import * as schema from '../schema.js';

// Database file path
const dbPath = path.join(__dirname, '../data/finautojobs.db');

// Create SQLite database connection
const sqlite = new Database(dbPath);

// Enable foreign keys
sqlite.pragma('foreign_keys = ON');

// Create Drizzle ORM instance
const db = drizzle(sqlite, { schema });

// Database health check
export const checkDatabaseHealth = async () => {
  try {
    await db.select({ result: sql`1` });
    return { healthy: true, message: 'Database connection successful' };
  } catch (error) {
    return { healthy: false, message: error.message };
  }
};

// Initialize database and seed data
const initializeDatabase = async () => {
  try {
    // Ensure database connection
    await db.select({ result: sql`1` });
    console.log('✅ Connected to SQLite database with Drizzle ORM');
    
    // Ensure tables exist with proper error handling
    await ensureTablesExist();
    
    // Check if data already exists
    try {
      const companyCountResult = await db.select({ count: sql`COUNT(*)` })
        .from(schema.companies);
      const companyCount = companyCountResult[0];
      
      if (companyCount.count === 0) {
        console.log('📊 Inserting sample data...');
        await insertSampleData();
      }
    } catch (error) {
      // If tables don't exist, create them and then insert sample data
      console.log('📊 Creating tables and inserting sample data...');
      await insertSampleData();
    }
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
};

// Ensure tables exist with proper error handling
const ensureTablesExist = async () => {
  try {
    console.log('🔧 Ensuring database tables exist...');
    
    // Create users table
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        full_name TEXT,
        phone TEXT,
        role TEXT DEFAULT 'jobseeker' CHECK (role IN ('jobseeker', 'employer', 'admin')),
        status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
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
        email_verified BOOLEAN DEFAULT FALSE,
        phone_verified BOOLEAN DEFAULT FALSE,
        reset_token TEXT,
        reset_token_expires TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Add indexes for performance
    sqlite.exec(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
      CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
      CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
    `);

    // Create companies table
    sqlite.exec(`
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
        status TEXT DEFAULT 'active',
        verified BOOLEAN DEFAULT FALSE,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Add indexes for companies
    sqlite.exec(`
      CREATE INDEX IF NOT EXISTS idx_companies_name ON companies(name);
      CREATE INDEX IF NOT EXISTS idx_companies_industry ON companies(industry);
      CREATE INDEX IF NOT EXISTS idx_companies_location ON companies(location);
      CREATE INDEX IF NOT EXISTS idx_companies_status ON companies(status);
    `);

    // Create job_categories table
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS job_categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT UNIQUE NOT NULL,
        description TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create jobs table
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS jobs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        company_id INTEGER NOT NULL,
        category_id INTEGER,
        location TEXT,
        salary_min INTEGER,
        salary_max INTEGER,
        salary_currency TEXT DEFAULT 'INR',
        job_type TEXT DEFAULT 'Full Time' CHECK (job_type IN ('Full Time', 'Part Time', 'Contract', 'Internship', 'Freelance')),
        work_mode TEXT DEFAULT 'Work from Office' CHECK (work_mode IN ('Work from Office', 'Work from Home', 'Hybrid')),
        experience_min INTEGER DEFAULT 0,
        experience_max INTEGER,
        english_level TEXT,
        description TEXT,
        requirements TEXT,
        benefits TEXT,
        skills_required TEXT,
        responsibilities TEXT,
        education_level TEXT,
        salary_type TEXT DEFAULT 'annual',
        other_languages TEXT,
        application_deadline TEXT,
        positions_available INTEGER DEFAULT 1,
        applications_count INTEGER DEFAULT 0,
        category TEXT,
        tags TEXT,
        priority TEXT DEFAULT 'normal',
        featured BOOLEAN DEFAULT FALSE,
        remote_friendly BOOLEAN DEFAULT FALSE,
        slug TEXT UNIQUE,
        meta_title TEXT,
        meta_description TEXT,
        status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'closed', 'draft')),
        posted_by INTEGER,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        published_at TEXT,
        FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
        FOREIGN KEY (category_id) REFERENCES job_categories(id) ON DELETE SET NULL,
        FOREIGN KEY (posted_by) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    // Add indexes for jobs
    sqlite.exec(`
      CREATE INDEX IF NOT EXISTS idx_jobs_company_id ON jobs(company_id);
      CREATE INDEX IF NOT EXISTS idx_jobs_category_id ON jobs(category_id);
      CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
      CREATE INDEX IF NOT EXISTS idx_jobs_location ON jobs(location);
      CREATE INDEX IF NOT EXISTS idx_jobs_job_type ON jobs(job_type);
      CREATE INDEX IF NOT EXISTS idx_jobs_work_mode ON jobs(work_mode);
      CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at);
    `);

    // Create applications table
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS applications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        job_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'shortlisted', 'rejected', 'hired')),
        cover_letter TEXT,
        resume_url TEXT,
        applied_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(job_id, user_id)
      )
    `);

    // Add indexes for applications
    sqlite.exec(`
      CREATE INDEX IF NOT EXISTS idx_applications_job_id ON applications(job_id);
      CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id);
      CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
      CREATE INDEX IF NOT EXISTS idx_applications_applied_at ON applications(applied_at);
    `);

    // Create saved_jobs table
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS saved_jobs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        job_id INTEGER NOT NULL,
        saved_at TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
        UNIQUE(user_id, job_id)
      )
    `);

    // Add indexes for saved_jobs
    sqlite.exec(`
      CREATE INDEX IF NOT EXISTS idx_saved_jobs_user_id ON saved_jobs(user_id);
      CREATE INDEX IF NOT EXISTS idx_saved_jobs_job_id ON saved_jobs(job_id);
    `);

    // Create user_sessions table
    sqlite.exec(`
      CREATE TABLE IF NOT EXISTS user_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        token TEXT NOT NULL,
        refresh_token TEXT,
        expires_at TEXT NOT NULL,
        status TEXT DEFAULT 'active' CHECK (status IN ('active', 'revoked', 'expired')),
        ip_address TEXT,
        user_agent TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        last_used TEXT DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Add indexes for user_sessions
    sqlite.exec(`
      CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
      CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(token);
      CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);
    `);

    console.log('✅ Database tables created successfully');
  } catch (error) {
    console.error('❌ Error creating tables:', error);
    throw new AppError('Database initialization failed', 500);
  }
};

// Insert sample data using Drizzle
const insertSampleData = async () => {
  try {
    // Insert sample companies
    const companies = [
      { name: 'Taggd', description: 'Leading recruitment and HR solutions provider', logo_url: 'https://apna-organization-logos.gumlet.io/production/541608?w=128', website: 'https://taggd.com', location: 'Bengaluru', industry: 'HR & Recruitment', size: '500-1000', founded_year: 2015 },
      { name: 'Aarthi Associates', description: 'Professional services and consulting firm', logo_url: null, website: 'https://aarthiassociates.com', location: 'Chennai', industry: 'Consulting', size: '50-200', founded_year: 2010 },
      { name: 'TechCorp Solutions', description: 'Technology solutions and software development', logo_url: null, website: 'https://techcorp.com', location: 'Mumbai', industry: 'Technology', size: '200-500', founded_year: 2018 },
      { name: 'Analytics Pro', description: 'Data analytics and business intelligence', logo_url: null, website: 'https://analyticspro.com', location: 'Hyderabad', industry: 'Analytics', size: '100-300', founded_year: 2019 }
    ];
    
    for (const company of companies) {
      await db.insert(schema.companies).values(company);
    }
    
    // Insert sample jobs
    const jobs = [
      { 
        title: 'ServiceNow Developer', 
        company_id: 1, 
        location: 'Bengaluru/Bangalore', 
        salary_min: 1200000, 
        salary_max: 1800000, 
        salary_currency: 'INR', 
        job_type: 'Full Time', 
        work_mode: 'Work from Office', 
        experience_min: 5, 
        experience_max: 7, 
        english_level: 'Basic English', 
        description: 'We are looking for a skilled ServiceNow Developer to join our dynamic team. The ideal candidate will have experience in ServiceNow platform development and customization.',
        requirements: '5+ years of experience in ServiceNow development\nStrong knowledge of JavaScript, HTML, CSS\nExperience with ServiceNow modules like ITSM, ITOM, etc.\nBachelor\'s degree in Computer Science or related field', 
        benefits: 'Competitive salary\nHealth insurance\nProfessional development opportunities',
        skills_required: '["ServiceNow", "JavaScript", "HTML", "CSS", "ITSM", "ITOM"]',
        category: 'Technology',
        featured: true
      },
      { 
        title: 'Senior Financial Analyst', 
        company_id: 2, 
        location: 'Mumbai, Maharashtra', 
        salary_min: 800000, 
        salary_max: 1200000, 
        salary_currency: 'INR', 
        job_type: 'Full Time', 
        work_mode: 'Hybrid', 
        experience_min: 3, 
        experience_max: 5, 
        english_level: 'Good English', 
        description: 'Looking for a Senior Financial Analyst to join our finance team and provide strategic financial insights.',
        requirements: '3+ years of financial analysis experience\nStrong knowledge of Excel and financial modeling\nExperience with financial reporting\nBachelor\'s degree in Finance or related field', 
        benefits: 'Competitive salary\nHealth insurance\nFlexible work arrangements',
        skills_required: '["Excel", "Financial Modeling", "Financial Analysis", "SQL", "Python"]',
        category: 'Finance',
        featured: true
      },
      { 
        title: 'Automotive Design Engineer', 
        company_id: 3, 
        location: 'Pune, Maharashtra', 
        salary_min: 600000, 
        salary_max: 1000000, 
        salary_currency: 'INR', 
        job_type: 'Full Time', 
        work_mode: 'Work from Office', 
        experience_min: 2, 
        experience_max: 4, 
        english_level: 'Basic English', 
        description: 'Seeking an Automotive Design Engineer to work on next-generation vehicle designs and systems.',
        requirements: '2+ years of automotive design experience\nProficiency in CAD software like CATIA or SolidWorks\nKnowledge of automotive systems\nBachelor\'s degree in Mechanical Engineering', 
        benefits: 'Competitive compensation\nLearning opportunities\nModern facilities',
        skills_required: '["CAD", "CATIA", "SolidWorks", "Automotive Systems", "Mechanical Engineering"]',
        category: 'Automotive',
        featured: false
      },
      { 
        title: 'Investment Banking Associate', 
        company_id: 4, 
        location: 'Mumbai, Maharashtra', 
        salary_min: 1500000, 
        salary_max: 2500000, 
        salary_currency: 'INR', 
        job_type: 'Full Time', 
        work_mode: 'Work from Office', 
        experience_min: 2, 
        experience_max: 4, 
        english_level: 'Advanced English', 
        description: 'Looking for an Investment Banking Associate to work on M&A transactions and capital markets deals.',
        requirements: '2+ years of investment banking experience\nStrong financial modeling skills\nExperience with M&A transactions\nMBA or equivalent preferred', 
        benefits: 'High compensation\nPerformance bonuses\nCareer advancement',
        skills_required: '["Financial Modeling", "Valuation", "M&A", "Excel", "PowerPoint", "Due Diligence"]',
        category: 'Finance',
        featured: true
      },
      { 
        title: 'Electric Vehicle Engineer', 
        company_id: 1, 
        location: 'Bangalore, Karnataka', 
        salary_min: 800000, 
        salary_max: 1400000, 
        salary_currency: 'INR', 
        job_type: 'Full Time', 
        work_mode: 'Work from Office', 
        experience_min: 3, 
        experience_max: 6, 
        english_level: 'Good English', 
        description: 'Join our EV team to work on cutting-edge electric vehicle technology and battery management systems.',
        requirements: '3+ years of EV or automotive experience\nKnowledge of battery technology\nExperience with electric motors and power electronics\nBachelor\'s degree in Electrical or Mechanical Engineering', 
        benefits: 'Innovative projects\nStock options\nLearning opportunities',
        skills_required: '["Battery Technology", "Electric Motors", "Power Electronics", "MATLAB", "Python"]',
        category: 'Automotive',
        featured: true
      },
      { 
        title: 'Risk Management Specialist', 
        company_id: 2, 
        location: 'Mumbai, Maharashtra', 
        salary_min: 1000000, 
        salary_max: 1600000, 
        salary_currency: 'INR', 
        job_type: 'Full Time', 
        work_mode: 'Hybrid', 
        experience_min: 4, 
        experience_max: 7, 
        english_level: 'Advanced English', 
        description: 'Seeking a Risk Management Specialist to assess and mitigate financial risks across business segments.',
        requirements: '4+ years of risk management experience\nStrong analytical skills\nKnowledge of regulatory compliance\nMaster\'s degree preferred', 
        benefits: 'Competitive package\nProfessional development\nFlexible work',
        skills_required: '["Risk Assessment", "Compliance", "Analytics", "Regulations", "Python", "SQL"]',
        category: 'Finance',
        featured: false
      }
    ];
    
    for (const job of jobs) {
      await db.insert(schema.jobs).values(job);
    }
    
    console.log('✅ Sample data inserted successfully');
  } catch (error) {
    console.error('Error inserting sample data:', error);
  }
};

export { db, initializeDatabase, checkDatabaseHealth };
