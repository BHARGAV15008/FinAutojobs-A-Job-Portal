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
        full_name TEXT NOT NULL,
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
        company_name TEXT,
        position TEXT,
        email_verified BOOLEAN DEFAULT FALSE,
        phone_verified BOOLEAN DEFAULT FALSE,
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
        status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'closed')),
        posted_by INTEGER,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
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
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    console.log('✅ Database tables created successfully');
  } catch (error) {
    console.error('Error creating tables:', error);
    throw error;
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
      { title: 'ServiceNow Developer', company_id: 1, location: 'Bengaluru/Bangalore', salary_min: 149999, salary_max: 149999, salary_currency: 'INR', job_type: 'Full Time', work_mode: 'Work from Office', experience_min: 5, experience_max: 5, english_level: 'Basic English', description: 'We are looking for a skilled ServiceNow Developer to join our dynamic team. The ideal candidate will have experience in ServiceNow platform development and customization.', requirements: '5+ years of experience in ServiceNow development\nStrong knowledge of JavaScript, HTML, CSS\nExperience with ServiceNow modules like ITSM, ITOM, etc.\nBachelor\'s degree in Computer Science or related field', benefits: 'Competitive salary\nHealth insurance\nProfessional development opportunities' },
      { title: 'Senior Automation Engineer', company_id: 1, location: 'Bengaluru/Bangalore', salary_min: 149999, salary_max: 149999, salary_currency: 'INR', job_type: 'Full Time', work_mode: 'Work from Office', experience_min: 2, experience_max: 2, english_level: 'Good (Intermediate / Advanced) English', description: 'Looking for a Senior Automation Engineer to design and implement automated testing frameworks and processes.', requirements: '2+ years of automation testing experience\nProficiency in Selenium, TestNG, or similar tools\nKnowledge of CI/CD pipelines\nStrong programming skills in Java or Python', benefits: 'Flexible work hours\nRemote work options\nLearning and development programs' },
      { title: 'Full Stack Engineer', company_id: 1, location: 'Bengaluru/Bangalore', salary_min: 149999, salary_max: 149999, salary_currency: 'INR', job_type: 'Full Time', work_mode: 'Work from Office', experience_min: 5, experience_max: 5, english_level: 'Basic English', description: 'Seeking a Full Stack Engineer to develop and maintain both frontend and backend applications using modern technologies.', requirements: '5+ years of full stack development experience\nProficiency in React, Node.js, and databases\nExperience with cloud platforms (AWS/Azure)\nStrong problem-solving skills', benefits: 'Competitive compensation\nStock options\nModern tech stack' },
      { title: 'Senior Manager', company_id: 2, location: 'Mylapore, Chennai', salary_min: 30000, salary_max: 149999, salary_currency: 'INR', job_type: 'Full Time', work_mode: 'Work from Office', experience_min: 5, experience_max: 5, english_level: 'Basic English', description: 'Looking for an experienced Senior Manager to lead our operations team and drive business growth.', requirements: '5+ years of management experience\nStrong leadership and communication skills\nMBA or equivalent preferred\nExperience in operations management', benefits: 'Leadership opportunities\nPerformance bonuses\nCareer growth path' },
      { title: 'React Developer', company_id: 3, location: 'Mumbai, Maharashtra', salary_min: 80000, salary_max: 120000, salary_currency: 'INR', job_type: 'Full Time', work_mode: 'Work from Home', experience_min: 3, experience_max: 3, english_level: 'Good English', description: 'Join our frontend team as a React Developer to build scalable web applications using modern React ecosystem.', requirements: '3+ years of React development experience\nStrong knowledge of JavaScript ES6+\nExperience with Redux or Context API\nFamiliarity with modern build tools', benefits: 'Remote work\nFlexible schedule\nLatest technologies' },
      { title: 'Data Scientist', company_id: 4, location: 'Hyderabad, Telangana', salary_min: 100000, salary_max: 180000, salary_currency: 'INR', job_type: 'Full Time', work_mode: 'Hybrid', experience_min: 4, experience_max: 4, english_level: 'Advanced English', description: 'Seeking a Data Scientist to analyze complex datasets and build machine learning models for business insights.', requirements: '4+ years of data science experience\nProficiency in Python, R, or SQL\nExperience with ML frameworks like TensorFlow or PyTorch\nStrong statistical analysis skills', benefits: 'Cutting-edge projects\nResearch opportunities\nCompetitive benefits' }
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
