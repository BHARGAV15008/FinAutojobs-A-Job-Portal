import mongoose from 'mongoose';
import { UserManager } from '../models/unified/UserManager.js';

/**
 * Migration script to unified backend structure
 */
async function migrateToUnified() {
  try {
    console.log('🔄 Starting migration to unified backend structure...');
    
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/finautojobs');
    console.log('✅ Connected to database');
    
    // Get existing collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📋 Found collections:', collections.map(c => c.name));
    
    // Backup existing data
    console.log('💾 Creating backup...');
    const backupData = {};
    
    for (const collection of collections) {
      const data = await mongoose.connection.db.collection(collection.name).find({}).toArray();
      backupData[collection.name] = data;
      console.log(`✅ Backed up ${collection.name}: ${data.length} documents`);
    }
    
    // Clear existing collections
    console.log('🗑️ Clearing existing collections...');
    for (const collection of collections) {
      await mongoose.connection.db.collection(collection.name).deleteMany({});
      console.log(`✅ Cleared ${collection.name}`);
    }
    
    // Migrate users to unified structure
    console.log('🔄 Migrating users to unified structure...');
    let migratedCount = 0;
    
    // Migrate from backup data
    if (backupData.users) {
      for (const oldUser of backupData.users) {
        try {
          const userData = {
            firstName: oldUser.firstName || oldUser.first_name,
            lastName: oldUser.lastName || oldUser.last_name,
            email: oldUser.email,
            password: oldUser.password, // Already hashed
            phone: oldUser.phone,
            role: oldUser.role,
            companyName: oldUser.companyName || oldUser.company,
            position: oldUser.position || oldUser.jobTitle
          };
          
          // Create user with unified structure
          const UserModel = UserManager.getModel(userData.role);
          const unifiedData = UserManager.transformRegistrationData(userData);
          
          // Preserve existing password hash
          unifiedData.password = oldUser.password;
          
          const newUser = new UserModel(unifiedData);
          await newUser.save({ validateBeforeSave: false });
          
          migratedCount++;
          console.log(`✅ Migrated user: ${userData.email} (${userData.role})`);
          
        } catch (error) {
          console.error(`❌ Failed to migrate user ${oldUser.email}:`, error.message);
        }
      }
    }
    
    console.log(`🎉 Migration completed! Migrated ${migratedCount} users`);
    
    // Verify migration
    console.log('🔍 Verifying migration...');
    const totalUsers = await UserManager.getModel('applicant').countDocuments();
    const recruiters = await UserManager.getModel('recruiter').countDocuments();
    const applicants = await UserManager.getModel('applicant').countDocuments();
    
    console.log(`📊 Migration Results:`);
    console.log(`   Total Users: ${totalUsers}`);
    console.log(`   Recruiters: ${recruiters}`);
    console.log(`   Applicants: ${applicants}`);
    
    await mongoose.connection.close();
    console.log('✅ Migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  migrateToUnified();
}

export default migrateToUnified;
