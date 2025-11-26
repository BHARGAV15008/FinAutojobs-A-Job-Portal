import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import SimpleUser from './models/User.js';
import { BaseUser } from './models/UserModels.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

async function debugAdminAuth() {
  try {
    console.log('🔄 Connecting to MongoDB...\n');
    
    const mongoUri = process.env.MONGODB_URI || process.env.DATABASE_URL || process.env.MONGO_URL;
    
    if (!mongoUri) {
      throw new Error('MongoDB URI not found in environment variables');
    }

    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000
    });

    console.log('✅ Connected to MongoDB\n');
    console.log('═'.repeat(80));
    console.log('🔍 DEBUGGING ADMIN AUTHENTICATION');
    console.log('═'.repeat(80) + '\n');

    // Test email to search for
    const testEmail = 'admin@finautojobs.com';
    
    console.log(`1. Searching for admin with email: ${testEmail}\n`);
    
    // Try SimpleUser (User model)
    console.log('📌 Testing SimpleUser model:');
    const simpleUserResult = await SimpleUser.findOne({ 
      email: testEmail.toLowerCase(), 
      role: 'admin' 
    });
    console.log('   Collection:', SimpleUser.collection.name);
    console.log('   Result:', simpleUserResult ? '✅ FOUND' : '❌ NOT FOUND');
    if (simpleUserResult) {
      console.log('   Details:', {
        id: simpleUserResult._id,
        email: simpleUserResult.email,
        role: simpleUserResult.role,
        hasPassword: !!simpleUserResult.password,
        isActive: simpleUserResult.isActive
      });
    }
    console.log('');

    // Try BaseUser
    console.log('📌 Testing BaseUser model:');
    const baseUserResult = await BaseUser.findOne({ 
      email: testEmail.toLowerCase(), 
      role: 'admin' 
    });
    console.log('   Collection:', BaseUser.collection.name);
    console.log('   Result:', baseUserResult ? '✅ FOUND' : '❌ NOT FOUND');
    if (baseUserResult) {
      console.log('   Details:', {
        id: baseUserResult._id,
        email: baseUserResult.email,
        role: baseUserResult.role
      });
    }
    console.log('');

    // List all collections
    console.log('📌 Available collections in database:');
    const collections = await mongoose.connection.db.listCollections().toArray();
    collections.forEach(coll => {
      console.log(`   - ${coll.name}`);
    });
    console.log('');

    // Count admin users in 'users' collection
    console.log('📌 Counting admin users in "users" collection:');
    const adminCount = await SimpleUser.countDocuments({ role: 'admin' });
    console.log(`   Total admin users: ${adminCount}\n`);

    if (adminCount > 0) {
      console.log('📌 All admin users in "users" collection:');
      const allAdmins = await SimpleUser.find({ role: 'admin' }).select('email role adminLevel isActive');
      allAdmins.forEach((admin, index) => {
        console.log(`   ${index + 1}. ${admin.email} (${admin.adminLevel || 'N/A'}) - Active: ${admin.isActive}`);
      });
    }

    console.log('\n' + '═'.repeat(80));
    console.log('🔍 AUTHENTICATION TEST');
    console.log('═'.repeat(80) + '\n');

    if (simpleUserResult) {
      const testPassword = 'Admin@2025!';
      console.log(`Testing password comparison for: ${testEmail}`);
      console.log(`Test password: ${testPassword}`);
      
      const isValid = await simpleUserResult.comparePassword(testPassword);
      console.log(`Password match: ${isValid ? '✅ VALID' : '❌ INVALID'}`);
      
      if (!isValid) {
        console.log('\n⚠️  Password does not match! This could be the issue.');
        console.log('   Possible reasons:');
        console.log('   1. Password was not hashed during creation');
        console.log('   2. comparePassword method has an issue');
        console.log('   3. Wrong password being tested');
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed\n');
  }
}

debugAdminAuth()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
