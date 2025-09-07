import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import Database from 'better-sqlite3';
import { sql } from 'drizzle-orm';
import path from 'path';
import { fileURLToPath } from 'url';

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

// Initialize database and seed data
const initializeDatabase = async () => {
  try {
    // Ensure database connection
    await db.select({ result: sql`1` });
    console.log('✅ Connected to SQLite database with Drizzle ORM');
    
    // Create tables if they don't exist (using raw SQL for initial setup)
    await createTables();
    
    // Run migrations to add missing columns
    await runMigrations();
    
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

// Create tables using raw SQL (temporary solution until proper migrations)
const createTables = async () => {
  try {
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

    console.log('✅ Database tables created successfully');
  } catch (error) {
    console.error('Error creating tables:', error);
    throw error;
  }
};

// Run migrations to add missing columns
const runMigrations = async () => {
  try {
    // Check if reset_token columns exist, if not add them
    try {
      const testQuery = sqlite.prepare("SELECT reset_token FROM users LIMIT 1");
      testQuery.all();
    } catch (error) {
      if (error.message.includes('no such column: reset_token')) {
        console.log('Adding reset_token columns...');
        sqlite.exec(`
          ALTER TABLE users ADD COLUMN reset_token TEXT;
          ALTER TABLE users ADD COLUMN reset_token_expires TEXT;
        `);
        console.log('✅ Reset token columns added successfully');
      }
    }
    
    // Check if resume_url column exists, if not add it
    try {
      const testQuery = sqlite.prepare("SELECT resume_url FROM users LIMIT 1");
      testQuery.all();
    } catch (error) {
      if (error.message.includes('no such column: resume_url')) {
        console.log('Adding resume_url column...');
        sqlite.exec(`ALTER TABLE users ADD COLUMN resume_url TEXT;`);
        console.log('✅ Resume URL column added successfully');
      }
    }
    
    // Check if company_id column exists, if not add it
    try {
      const testQuery = sqlite.prepare("SELECT company_id FROM users LIMIT 1");
      testQuery.all();
    } catch (error) {
      if (error.message.includes('no such column: company_id')) {
        console.log('Adding company_id column...');
        sqlite.exec(`ALTER TABLE users ADD COLUMN company_id INTEGER;`);
        console.log('✅ Company ID column added successfully');
      }
    }
    
    // Fix full_name NOT NULL constraint by recreating the table
    try {
      const tableInfo = sqlite.prepare("PRAGMA table_info(users)").all();
      const fullNameColumn = tableInfo.find(col => col.name === 'full_name');
      
      if (fullNameColumn && fullNameColumn.notnull === 1) {
        console.log('Fixing full_name NOT NULL constraint...');
        
        // Create new table without NOT NULL constraint
        sqlite.exec(`
          CREATE TABLE users_new (
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
          );
          
          INSERT INTO users_new SELECT * FROM users;
          DROP TABLE users;
          ALTER TABLE users_new RENAME TO users;
        `);
        
        console.log('✅ Full name constraint fixed successfully');
      }
    } catch (error) {
      console.error('Error fixing full_name constraint:', error);
    }
    
    // Add last_used column to user_sessions table if missing
    try {
      const testQuery = sqlite.prepare("SELECT last_used FROM user_sessions LIMIT 1");
      testQuery.all();
    } catch (error) {
      if (error.message.includes('no such column: last_used')) {
        console.log('Adding last_used column to user_sessions...');
        sqlite.exec(`ALTER TABLE user_sessions ADD COLUMN last_used TEXT DEFAULT CURRENT_TIMESTAMP;`);
        console.log('✅ Last used column added successfully');
      }
    }
    
  } catch (error) {
    console.error('Migration error:', error);
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

export { db, initializeDatabase };
