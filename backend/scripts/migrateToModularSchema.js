#!/usr/bin/env node

/**
 * Database Migration Script - Modular Schema
 * Migrates from old schema to new modular schema structure
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import {
  initializeModels,
  validateModels,
  cleanupDatabase,
  seedDatabase,
  getModelStats,
  User,
  Company,
  Job,
  Application,
  Interview
} from '../models/mongoose/index.js';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/finautojobs';

console.log('🚀 Starting migration to modular schema...');
console.log(`📍 Database URI: ${MONGODB_URI}`);

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
};

// Backup existing data (optional)
const backupExistingData = async () => {
  console.log('\n📦 Backing up existing data...');
  
  try {
    const collections = await mongoose.connection.db.listCollections().toArray();
    const backup = {};
    
    for (const collection of collections) {
      const collectionName = collection.name;
      if (!collectionName.startsWith('system.')) {
        const data = await mongoose.connection.db.collection(collectionName).find({}).toArray();
        backup[collectionName] = data;
        console.log(`  ✅ Backed up ${collectionName}: ${data.length} documents`);
      }
    }
    
    // Save backup to file (optional)
    const fs = await import('fs');
    const backupPath = `./backup_${Date.now()}.json`;
    fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2));
    console.log(`📁 Backup saved to: ${backupPath}`);
    
    return backup;
  } catch (error) {
    console.error('❌ Backup failed:', error);
    return null;
  }
};

// Clear existing collections
const clearExistingData = async () => {
  console.log('\n🧹 Clearing existing collections...');
  
  try {
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    for (const collection of collections) {
      const collectionName = collection.name;
      if (!collectionName.startsWith('system.')) {
        await mongoose.connection.db.collection(collectionName).drop();
        console.log(`  ✅ Dropped collection: ${collectionName}`);
      }
    }
    
    console.log('🎯 All existing collections cleared');
  } catch (error) {
    console.error('❌ Failed to clear collections:', error);
    throw error;
  }
};

// Create indexes for all models
const createIndexes = async () => {
  console.log('\n🔍 Creating database indexes...');
  
  try {
    // User indexes
    await User.collection.createIndex({ email: 1 }, { unique: true });
    await User.collection.createIndex({ username: 1 }, { unique: true });
    await User.collection.createIndex({ role: 1, status: 1 });
    await User.collection.createIndex({ created_at: -1 });
    console.log('  ✅ User indexes created');
    
    // Company indexes
    await Company.collection.createIndex({ slug: 1 }, { unique: true });
    await Company.collection.createIndex({ name: 1 });
    await Company.collection.createIndex({ industry: 1, status: 1 });
    await Company.collection.createIndex({ is_verified: 1, status: 1 });
    console.log('  ✅ Company indexes created');
    
    // Job indexes
    await Job.collection.createIndex({ slug: 1 }, { unique: true });
    await Job.collection.createIndex({ company_id: 1, status: 1 });
    await Job.collection.createIndex({ status: 1, published_at: -1 });
    await Job.collection.createIndex({ work_mode: 1, job_type: 1 });
    await Job.collection.createIndex({ city: 1, work_mode: 1 });
    console.log('  ✅ Job indexes created');
    
    // Application indexes
    await Application.collection.createIndex({ job_id: 1, applicant_id: 1 }, { unique: true });
    await Application.collection.createIndex({ applicant_id: 1, submitted_at: -1 });
    await Application.collection.createIndex({ company_id: 1, status: 1 });
    await Application.collection.createIndex({ status: 1, submitted_at: -1 });
    console.log('  ✅ Application indexes created');
    
    // Interview indexes
    await Interview.collection.createIndex({ application_id: 1, interview_round: 1 });
    await Interview.collection.createIndex({ candidate_id: 1, scheduled_date: -1 });
    await Interview.collection.createIndex({ company_id: 1, scheduled_date: -1 });
    await Interview.collection.createIndex({ status: 1, scheduled_date: 1 });
    console.log('  ✅ Interview indexes created');
    
    console.log('🎯 All indexes created successfully');
  } catch (error) {
    console.error('❌ Index creation failed:', error);
    throw error;
  }
};

// Migrate existing data to new schema (if backup exists)
const migrateExistingData = async (backup) => {
  if (!backup) {
    console.log('\n⏭️  No backup data to migrate');
    return;
  }
  
  console.log('\n🔄 Migrating existing data to new schema...');
  
  try {
    let migratedCount = 0;
    
    // Migrate users
    if (backup.users && backup.users.length > 0) {
      for (const userData of backup.users) {
        try {
          const user = new User({
            username: userData.username || userData.email?.split('@')[0] || `user_${userData._id}`,
            email: userData.email,
            password_hash: userData.password || userData.password_hash || 'temp123',
            first_name: userData.first_name || userData.firstName || 'Unknown',
            last_name: userData.last_name || userData.lastName || 'User',
            role: userData.role || 'applicant',
            email_verified: userData.email_verified || userData.isVerified || false,
            phone: userData.phone,
            status: userData.status || 'active',
            created_at: userData.created_at || userData.createdAt || new Date(),
            updated_at: userData.updated_at || userData.updatedAt || new Date()
          });
          
          await user.save();
          migratedCount++;
        } catch (error) {
          console.log(`    ⚠️  Failed to migrate user ${userData.email}: ${error.message}`);
        }
      }
      console.log(`  ✅ Migrated ${migratedCount} users`);
    }
    
    // Migrate companies
    migratedCount = 0;
    if (backup.companies && backup.companies.length > 0) {
      for (const companyData of backup.companies) {
        try {
          const company = new Company({
            name: companyData.name,
            slug: companyData.slug || companyData.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            description: companyData.description,
            industry: companyData.industry || 'Technology',
            company_type: companyData.company_type || companyData.type || 'startup',
            size: companyData.size || '1-10',
            email: companyData.email,
            phone: companyData.phone,
            website: companyData.website,
            city: companyData.city || companyData.location,
            country: companyData.country || 'India',
            logo_url: companyData.logo_url || companyData.logo,
            is_verified: companyData.is_verified || false,
            status: companyData.status || 'active',
            created_at: companyData.created_at || companyData.createdAt || new Date(),
            updated_at: companyData.updated_at || companyData.updatedAt || new Date()
          });
          
          await company.save();
          migratedCount++;
        } catch (error) {
          console.log(`    ⚠️  Failed to migrate company ${companyData.name}: ${error.message}`);
        }
      }
      console.log(`  ✅ Migrated ${migratedCount} companies`);
    }
    
    // Migrate jobs
    migratedCount = 0;
    if (backup.jobs && backup.jobs.length > 0) {
      for (const jobData of backup.jobs) {
        try {
          // Find corresponding company
          const company = await Company.findOne({ 
            name: jobData.company_name || jobData.company 
          });
          
          if (!company) {
            console.log(`    ⚠️  Company not found for job: ${jobData.title}`);
            continue;
          }
          
          const job = new Job({
            title: jobData.title,
            slug: jobData.slug || `${jobData.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`,
            company_id: company._id,
            posted_by: company.administrators[0]?.user_id || company._id,
            description: jobData.description,
            job_type: jobData.job_type || jobData.type || 'full_time',
            employment_type: jobData.employment_type || 'permanent',
            work_mode: jobData.work_mode || jobData.remote_policy || 'onsite',
            experience_min: jobData.experience_min || jobData.min_experience || 0,
            experience_max: jobData.experience_max || jobData.max_experience,
            city: jobData.city || jobData.location,
            country: jobData.country || 'India',
            salary_min: jobData.salary_min || jobData.min_salary,
            salary_max: jobData.salary_max || jobData.max_salary,
            salary_currency: jobData.salary_currency || 'INR',
            required_skills: jobData.required_skills?.map(skill => ({
              name: typeof skill === 'string' ? skill : skill.name,
              proficiency_level: skill.level || 'intermediate'
            })) || [],
            status: jobData.status || 'active',
            published_at: jobData.published_at || jobData.createdAt || new Date(),
            created_at: jobData.created_at || jobData.createdAt || new Date(),
            updated_at: jobData.updated_at || jobData.updatedAt || new Date()
          });
          
          await job.save();
          migratedCount++;
        } catch (error) {
          console.log(`    ⚠️  Failed to migrate job ${jobData.title}: ${error.message}`);
        }
      }
      console.log(`  ✅ Migrated ${migratedCount} jobs`);
    }
    
    console.log('🎯 Data migration completed');
  } catch (error) {
    console.error('❌ Data migration failed:', error);
    throw error;
  }
};

// Main migration function
const runMigration = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Initialize models
    initializeModels();
    
    // Validate models
    console.log('\n🔍 Validating new models...');
    const validationResults = await validateModels();
    const invalidModels = Object.entries(validationResults)
      .filter(([name, result]) => result.status === 'invalid');
    
    if (invalidModels.length > 0) {
      console.error('❌ Some models are invalid:', invalidModels);
      process.exit(1);
    }
    
    // Backup existing data
    const backup = await backupExistingData();
    
    // Clear existing data
    await clearExistingData();
    
    // Create indexes
    await createIndexes();
    
    // Migrate existing data
    await migrateExistingData(backup);
    
    // Seed with initial data
    console.log('\n🌱 Seeding initial data...');
    const seedResult = await seedDatabase();
    console.log('✅ Initial data seeded:', seedResult);
    
    // Get final statistics
    console.log('\n📊 Final database statistics:');
    const stats = await getModelStats();
    
    console.log('\n🎉 Migration completed successfully!');
    console.log('📝 Summary:');
    console.log('  ✅ Database cleared and restructured');
    console.log('  ✅ New modular schema implemented');
    console.log('  ✅ Indexes created for performance');
    console.log('  ✅ Initial data seeded');
    console.log('  ✅ All models validated and ready');
    
  } catch (error) {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run migration if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigration();
}

export default runMigration;
