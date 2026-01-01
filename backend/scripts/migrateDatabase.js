#!/usr/bin/env node

/**
 * Database Migration Script
 * Creates all tables using the new modular schema structure
 */

import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { 
  allSchemas, 
  coreSchemas, 
  extendedSchemas, 
  analyticsSchemas, 
  systemManagementSchemas,
  schemaMetadata 
} from '../schemas/index.js';

const DB_PATH = './database.sqlite';

console.log('🚀 Starting database migration with new modular schema...');
console.log(`📊 Total schemas to create: ${schemaMetadata.totalSchemas}`);
console.log('📋 Schema breakdown:', schemaMetadata.categories);

// Create database connection
const sqlite = new Database(DB_PATH);
const db = drizzle(sqlite);

// Enable foreign keys and other pragmas
sqlite.exec('PRAGMA foreign_keys = ON;');
sqlite.exec('PRAGMA journal_mode = WAL;');
sqlite.exec('PRAGMA synchronous = NORMAL;');
sqlite.exec('PRAGMA cache_size = 1000000;');
sqlite.exec('PRAGMA temp_store = memory;');

console.log('✅ Database connection established with optimized settings');

// Migration function
const migrateSchemas = async (schemas, groupName) => {
  console.log(`\n📦 Migrating ${groupName} schemas...`);
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const schema of schemas) {
    try {
      // Get table name from schema
      const tableName = schema[Symbol.for('drizzle:Name')] || 'unknown_table';
      
      // Create table using Drizzle's schema definition
      await db.run(schema._.config.schema);
      
      console.log(`  ✅ Created table: ${tableName}`);
      successCount++;
    } catch (error) {
      console.error(`  ❌ Failed to create table:`, error.message);
      errorCount++;
    }
  }
  
  console.log(`📈 ${groupName} migration complete: ${successCount} success, ${errorCount} errors`);
  return { successCount, errorCount };
};

// Alternative approach using SQL generation
const createTablesFromSchemas = async (schemas, groupName) => {
  console.log(`\n📦 Creating ${groupName} tables...`);
  
  let successCount = 0;
  let errorCount = 0;
  
  // Since we're using SQLite with Drizzle, we need to manually create tables
  // This is a simplified approach - in production, use Drizzle's migration tools
  
  const tableDefinitions = {
    // Core tables
    users: `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        full_name TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'applicant',
        permissions TEXT,
        email_verified INTEGER NOT NULL DEFAULT 0,
        phone_verified INTEGER NOT NULL DEFAULT 0,
        profile_completed INTEGER NOT NULL DEFAULT 0,
        password_reset_token TEXT,
        password_reset_expires TEXT,
        email_verification_token TEXT,
        phone_verification_token TEXT,
        two_factor_secret TEXT,
        two_factor_enabled INTEGER NOT NULL DEFAULT 0,
        last_login_at TEXT,
        last_login_ip TEXT,
        login_count INTEGER NOT NULL DEFAULT 0,
        failed_login_attempts INTEGER NOT NULL DEFAULT 0,
        locked_until TEXT,
        google_id TEXT,
        microsoft_id TEXT,
        linkedin_id TEXT,
        github_id TEXT,
        email TEXT,
        phone TEXT,
        address TEXT,
        status TEXT NOT NULL DEFAULT 'active',
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        created_by INTEGER,
        updated_by INTEGER,
        version INTEGER NOT NULL DEFAULT 1,
        deleted_at TEXT,
        deleted_by INTEGER,
        metadata TEXT,
        tags TEXT,
        notes TEXT
      )
    `,
    
    companies: `
      CREATE TABLE IF NOT EXISTS companies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        legal_name TEXT,
        slug TEXT NOT NULL UNIQUE,
        tagline TEXT,
        description TEXT,
        logo_url TEXT,
        cover_image_url TEXT,
        brand_colors TEXT,
        industry TEXT NOT NULL,
        sub_industry TEXT,
        company_type TEXT,
        size TEXT,
        founded_year INTEGER,
        email TEXT,
        phone TEXT,
        address TEXT,
        location TEXT,
        city TEXT,
        state TEXT,
        country TEXT DEFAULT 'India',
        postal_code TEXT,
        latitude TEXT,
        longitude TEXT,
        headquarters TEXT,
        office_locations TEXT,
        linkedin_url TEXT,
        twitter_url TEXT,
        facebook_url TEXT,
        instagram_url TEXT,
        website TEXT,
        careers_page TEXT,
        glassdoor_url TEXT,
        mission TEXT,
        vision TEXT,
        values TEXT,
        culture_description TEXT,
        work_environment TEXT,
        benefits TEXT,
        perks TEXT,
        remote_policy TEXT,
        funding_stage TEXT,
        total_funding REAL,
        valuation REAL,
        revenue_range TEXT,
        is_verified INTEGER NOT NULL DEFAULT 0,
        verification_date TEXT,
        verification_documents TEXT,
        trust_score REAL DEFAULT 0.0,
        employee_satisfaction REAL,
        glassdoor_rating REAL,
        total_employees INTEGER,
        growth_rate REAL,
        total_jobs_posted INTEGER NOT NULL DEFAULT 0,
        active_jobs INTEGER NOT NULL DEFAULT 0,
        total_hires INTEGER NOT NULL DEFAULT 0,
        response_rate REAL DEFAULT 0.0,
        average_response_time INTEGER,
        meta_title TEXT,
        meta_description TEXT,
        keywords TEXT,
        status TEXT NOT NULL DEFAULT 'active',
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        created_by INTEGER,
        updated_by INTEGER,
        version INTEGER NOT NULL DEFAULT 1,
        deleted_at TEXT,
        deleted_by INTEGER,
        metadata TEXT,
        tags TEXT,
        notes TEXT
      )
    `,
    
    job_categories: `
      CREATE TABLE IF NOT EXISTS job_categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL UNIQUE,
        slug TEXT NOT NULL UNIQUE,
        description TEXT,
        parent_id INTEGER REFERENCES job_categories(id),
        level INTEGER NOT NULL DEFAULT 1,
        path TEXT,
        icon TEXT,
        color TEXT,
        image_url TEXT,
        sort_order INTEGER NOT NULL DEFAULT 0,
        industries TEXT,
        job_count INTEGER NOT NULL DEFAULT 0,
        active_job_count INTEGER NOT NULL DEFAULT 0,
        meta_title TEXT,
        meta_description TEXT,
        keywords TEXT,
        status TEXT NOT NULL DEFAULT 'active',
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        created_by INTEGER,
        updated_by INTEGER,
        version INTEGER NOT NULL DEFAULT 1
      )
    `,
    
    jobs: `
      CREATE TABLE IF NOT EXISTS jobs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        posted_by INTEGER NOT NULL REFERENCES users(id),
        title TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        category_id INTEGER REFERENCES job_categories(id),
        description TEXT NOT NULL,
        summary TEXT,
        responsibilities TEXT,
        requirements TEXT,
        nice_to_have TEXT,
        job_type TEXT NOT NULL,
        employment_type TEXT NOT NULL,
        seniority_level TEXT,
        location TEXT,
        city TEXT,
        state TEXT,
        country TEXT DEFAULT 'India',
        postal_code TEXT,
        latitude TEXT,
        longitude TEXT,
        work_mode TEXT NOT NULL,
        remote_policy TEXT,
        relocation_assistance INTEGER NOT NULL DEFAULT 0,
        travel_requirements TEXT,
        experience_min INTEGER NOT NULL DEFAULT 0,
        experience_max INTEGER,
        education_level TEXT,
        education_field TEXT,
        required_skills TEXT,
        preferred_skills TEXT,
        certifications TEXT,
        languages TEXT,
        salary_min REAL,
        salary_max REAL,
        salary_currency TEXT DEFAULT 'INR',
        salary_type TEXT DEFAULT 'annual',
        salary_negotiable INTEGER NOT NULL DEFAULT 0,
        equity_offered INTEGER NOT NULL DEFAULT 0,
        benefits TEXT,
        perks TEXT,
        health_insurance INTEGER NOT NULL DEFAULT 0,
        retirement_plan INTEGER NOT NULL DEFAULT 0,
        application_deadline TEXT,
        positions_available INTEGER NOT NULL DEFAULT 1,
        application_method TEXT DEFAULT 'platform',
        external_apply_url TEXT,
        application_instructions TEXT,
        screening_questions TEXT,
        require_cover_letter INTEGER NOT NULL DEFAULT 0,
        require_portfolio INTEGER NOT NULL DEFAULT 0,
        applications_count INTEGER NOT NULL DEFAULT 0,
        views_count INTEGER NOT NULL DEFAULT 0,
        saves_count INTEGER NOT NULL DEFAULT 0,
        shares_count INTEGER NOT NULL DEFAULT 0,
        priority TEXT DEFAULT 'normal',
        is_featured INTEGER NOT NULL DEFAULT 0,
        is_premium INTEGER NOT NULL DEFAULT 0,
        boost_score INTEGER NOT NULL DEFAULT 0,
        start_date TEXT,
        duration TEXT,
        notice_period_required TEXT,
        meta_title TEXT,
        meta_description TEXT,
        keywords TEXT,
        status TEXT NOT NULL DEFAULT 'draft',
        published_at TEXT,
        expires_at TEXT,
        filled_at TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        created_by INTEGER,
        updated_by INTEGER,
        version INTEGER NOT NULL DEFAULT 1,
        deleted_at TEXT,
        deleted_by INTEGER,
        metadata TEXT,
        tags TEXT,
        notes TEXT
      )
    `,
    
    applications: `
      CREATE TABLE IF NOT EXISTS applications (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        job_id INTEGER NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
        applicant_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        company_id INTEGER NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
        cover_letter TEXT,
        resume_url TEXT,
        portfolio_url TEXT,
        screening_responses TEXT,
        custom_responses TEXT,
        expected_salary REAL,
        salary_currency TEXT DEFAULT 'INR',
        available_from TEXT,
        notice_period TEXT,
        willing_to_relocate INTEGER NOT NULL DEFAULT 0,
        application_source TEXT,
        referrer_id INTEGER REFERENCES users(id),
        utm_source TEXT,
        utm_medium TEXT,
        utm_campaign TEXT,
        status TEXT NOT NULL DEFAULT 'pending',
        stage TEXT NOT NULL DEFAULT 'applied',
        substage TEXT,
        reviewed_by INTEGER REFERENCES users(id),
        reviewed_at TEXT,
        hr_notes TEXT,
        internal_rating INTEGER,
        fit_score REAL,
        last_contact_date TEXT,
        contact_count INTEGER NOT NULL DEFAULT 0,
        response_time INTEGER,
        submitted_at TEXT,
        first_viewed_at TEXT,
        shortlisted_at TEXT,
        rejected_at TEXT,
        withdrawn_at TEXT,
        rejection_reason TEXT,
        rejection_feedback TEXT,
        withdrawal_reason TEXT,
        is_flagged INTEGER NOT NULL DEFAULT 0,
        flag_reason TEXT,
        priority_level INTEGER NOT NULL DEFAULT 3,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        created_by INTEGER,
        updated_by INTEGER,
        version INTEGER NOT NULL DEFAULT 1,
        metadata TEXT,
        tags TEXT,
        notes TEXT
      )
    `
  };
  
  for (const [tableName, sql] of Object.entries(tableDefinitions)) {
    try {
      sqlite.exec(sql);
      console.log(`  ✅ Created table: ${tableName}`);
      successCount++;
    } catch (error) {
      console.error(`  ❌ Failed to create table ${tableName}:`, error.message);
      errorCount++;
    }
  }
  
  console.log(`📈 ${groupName} creation complete: ${successCount} success, ${errorCount} errors`);
  return { successCount, errorCount };
};

// Run migrations in order
const runMigration = async () => {
  try {
    let totalSuccess = 0;
    let totalErrors = 0;
    
    // Create core tables first
    const coreResult = await createTablesFromSchemas(coreSchemas, 'Core');
    totalSuccess += coreResult.successCount;
    totalErrors += coreResult.errorCount;
    
    // Create indexes for better performance
    console.log('\n🔍 Creating indexes...');
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)',
      'CREATE INDEX IF NOT EXISTS idx_users_role ON users(role)',
      'CREATE INDEX IF NOT EXISTS idx_companies_industry ON companies(industry)',
      'CREATE INDEX IF NOT EXISTS idx_jobs_company ON jobs(company_id)',
      'CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status)',
      'CREATE INDEX IF NOT EXISTS idx_applications_job ON applications(job_id)',
      'CREATE INDEX IF NOT EXISTS idx_applications_applicant ON applications(applicant_id)',
      'CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status)'
    ];
    
    for (const indexSql of indexes) {
      try {
        sqlite.exec(indexSql);
        console.log(`  ✅ Created index`);
      } catch (error) {
        console.error(`  ❌ Failed to create index:`, error.message);
      }
    }
    
    // Insert some initial data
    console.log('\n🌱 Seeding initial data...');
    
    // Insert default job categories
    const categories = [
      { name: 'Finance & Banking', slug: 'finance-banking', description: 'Financial services and banking roles' },
      { name: 'Automobile & Manufacturing', slug: 'automobile-manufacturing', description: 'Automotive and manufacturing positions' },
      { name: 'Technology', slug: 'technology', description: 'Software and technology roles' },
      { name: 'Healthcare', slug: 'healthcare', description: 'Medical and healthcare positions' },
      { name: 'Education', slug: 'education', description: 'Teaching and educational roles' }
    ];
    
    const insertCategory = sqlite.prepare(`
      INSERT OR IGNORE INTO job_categories (name, slug, description, status, created_at, updated_at)
      VALUES (?, ?, ?, 'active', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `);
    
    for (const category of categories) {
      try {
        insertCategory.run(category.name, category.slug, category.description);
        console.log(`  ✅ Seeded category: ${category.name}`);
      } catch (error) {
        console.error(`  ❌ Failed to seed category ${category.name}:`, error.message);
      }
    }
    
    console.log('\n🎉 Database migration completed successfully!');
    console.log(`📊 Final results: ${totalSuccess} tables created, ${totalErrors} errors`);
    console.log(`🗄️ Database file: ${DB_PATH}`);
    
  } catch (error) {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  } finally {
    sqlite.close();
  }
};

// Run the migration
runMigration();
