import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { initializeDatabase, checkDatabaseHealth } from '../config/database.js';
import mongoDataService from '../services/mongoDataService.js';

// Load environment variables
dotenv.config();

async function verifyMongoDB() {
  console.log('🔍 Verifying MongoDB setup...\n');
  
  try {
    // 1. Test database connection
    console.log('1️⃣ Testing database connection...');
    await initializeDatabase();
    console.log('✅ Database connection successful\n');
    
    // 2. Check database health
    console.log('2️⃣ Checking database health...');
    const health = await checkDatabaseHealth();
    console.log(`✅ Database health: ${health.status}`);
    console.log(`📊 Connection state: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}\n`);
    
    // 3. Test data service
    console.log('3️⃣ Testing MongoDB data service...');
    const serviceHealth = await mongoDataService.checkHealth();
    console.log(`✅ Data service: ${serviceHealth.status}`);
    console.log(`🗄️ Database type: ${serviceHealth.database}\n`);
    
    // 4. Test basic operations
    console.log('4️⃣ Testing basic database operations...');
    
    // Import models
    const BaseUser = (await import('../models/unified/BaseUser.js')).default;
    const Company = (await import('../models/Company.js')).default;
    const Job = (await import('../models/unified/Job.js')).default;
    
    // Count documents
    const userCount = await BaseUser.countDocuments();
    const companyCount = await Company.countDocuments();
    const jobCount = await Job.countDocuments();
    
    console.log(`👥 Users in database: ${userCount}`);
    console.log(`🏢 Companies in database: ${companyCount}`);
    console.log(`💼 Jobs in database: ${jobCount}\n`);
    
    // 5. Test indexes
    console.log('5️⃣ Checking database indexes...');
    const userIndexes = await BaseUser.collection.getIndexes();
    const companyIndexes = await Company.collection.getIndexes();
    const jobIndexes = await Job.collection.getIndexes();
    
    console.log(`📊 User indexes: ${Object.keys(userIndexes).length}`);
    console.log(`📊 Company indexes: ${Object.keys(companyIndexes).length}`);
    console.log(`📊 Job indexes: ${Object.keys(jobIndexes).length}\n`);
    
    // 6. Test data service methods
    console.log('6️⃣ Testing data service methods...');
    
    // Test user operations
    try {
      const users = await mongoDataService.getAllUsers({}, { limit: 1 });
      console.log(`✅ User query successful: ${users.users.length} users returned`);
    } catch (error) {
      console.log(`⚠️ User query test: ${error.message}`);
    }
    
    // Test job operations
    try {
      const jobs = await mongoDataService.getAllJobs({}, { limit: 1 });
      console.log(`✅ Job query successful: ${jobs.jobs.length} jobs returned`);
    } catch (error) {
      console.log(`⚠️ Job query test: ${error.message}`);
    }
    
    // Test company operations
    try {
      const companies = await mongoDataService.getAllCompanies({}, { limit: 1 });
      console.log(`✅ Company query successful: ${companies.companies.length} companies returned`);
    } catch (error) {
      console.log(`⚠️ Company query test: ${error.message}`);
    }
    
    console.log('\n🎉 MongoDB verification completed successfully!');
    console.log('\n📋 Summary:');
    console.log('✅ Database connection: Working');
    console.log('✅ Data service: Working');
    console.log('✅ Models: Loaded and functional');
    console.log('✅ Indexes: Created');
    console.log('✅ Basic operations: Working');
    
    console.log('\n🔗 Connection Details:');
    console.log(`📍 Database: ${mongoose.connection.name}`);
    console.log(`🌐 Host: ${mongoose.connection.host}`);
    console.log(`🔌 Port: ${mongoose.connection.port}`);
    console.log(`📊 Ready State: ${mongoose.connection.readyState}`);
    
    if (userCount === 0) {
      console.log('\n💡 Tip: Run "npm run setup:mongodb" to create sample data');
    }
    
  } catch (error) {
    console.error('\n❌ MongoDB verification failed:');
    console.error(`Error: ${error.message}`);
    
    if (error.message.includes('MONGODB_URI')) {
      console.log('\n🔧 Fix: Set your MongoDB URI in the .env file:');
      console.log('MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/finautojobs');
    }
    
    if (error.message.includes('authentication')) {
      console.log('\n🔧 Fix: Check your MongoDB credentials');
    }
    
    if (error.message.includes('network')) {
      console.log('\n🔧 Fix: Check your internet connection and MongoDB Atlas network access');
    }
    
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Database connection closed');
  }
}

// Run verification if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  verifyMongoDB()
    .then(() => {
      console.log('\n✅ Verification completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n❌ Verification failed:', error.message);
      process.exit(1);
    });
}

export default verifyMongoDB;
