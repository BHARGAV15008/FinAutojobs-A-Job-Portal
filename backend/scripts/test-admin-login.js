#!/usr/bin/env node

/**
 * Test Admin Login Script
 * Tests admin login directly against the database
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// MongoDB Connection
const MONGODB_URI = 'mongodb+srv://hiddenshadow032025_db_user:nJNHickmLkFtwcIY@cluster0.nvq1gwn.mongodb.net/finautojobs?retryWrites=true&w=majority&appName=Cluster0';

// Admin credentials to test
const ADMIN_EMAIL = 'hiddenshadow032025@gmail.com';
const ADMIN_PASSWORD = 'SuperAdmin@2025!';

async function testAdminLogin() {
  try {
    console.log('🔍 Testing Admin Login...');
    
    // Connect to MongoDB
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected successfully');

    // Define user schema for querying
    const userSchema = new mongoose.Schema({}, { strict: false });
    const User = mongoose.model('User', userSchema);

    // Find admin user
    console.log('🔍 Looking for admin user...');
    const adminUser = await User.findOne({ 
      email: ADMIN_EMAIL 
    });

    if (!adminUser) {
      console.log('❌ Admin user not found!');
      console.log('📧 Searched for email:', ADMIN_EMAIL);
      
      // List all users to debug
      const allUsers = await User.find({}, { email: 1, role: 1, _id: 1 });
      console.log('\n📋 All users in database:');
      allUsers.forEach(user => {
        console.log(`   - ${user.email} (${user.role}) - ID: ${user._id}`);
      });
      
      return;
    }

    console.log('✅ Admin user found!');
    console.log('📊 User Details:');
    console.log('   📧 Email:', adminUser.email);
    console.log('   👤 Name:', `${adminUser.firstName} ${adminUser.lastName}`);
    console.log('   🔑 Role:', adminUser.role);
    console.log('   🆔 ID:', adminUser._id);
    console.log('   ✅ Active:', adminUser.isActive);
    console.log('   ✅ Verified:', adminUser.isVerified);
    console.log('   📧 Email Verified:', adminUser.emailVerified);

    // Test password
    console.log('\n🔐 Testing password...');
    const passwordMatch = await bcrypt.compare(ADMIN_PASSWORD, adminUser.password);
    
    if (passwordMatch) {
      console.log('✅ Password matches!');
    } else {
      console.log('❌ Password does not match!');
      console.log('🔐 Expected password:', ADMIN_PASSWORD);
      console.log('🔐 Stored hash:', adminUser.password.substring(0, 20) + '...');
    }

    // Check admin info
    if (adminUser.adminInfo) {
      console.log('\n🛡️ Admin Info:');
      console.log('   🔑 Access Level:', adminUser.adminInfo.accessLevel);
      console.log('   📋 Permissions:', adminUser.adminInfo.permissions);
      console.log('   👥 Can Manage Users:', adminUser.adminInfo.canManageUsers);
      console.log('   💼 Can Manage Jobs:', adminUser.adminInfo.canManageJobs);
      console.log('   📊 Can View Analytics:', adminUser.adminInfo.canViewAnalytics);
      console.log('   ⚙️ Can Manage System:', adminUser.adminInfo.canManageSystem);
    } else {
      console.log('\n⚠️ No admin info found - this might be the issue!');
    }

    // Test login validation
    console.log('\n🧪 Testing login validation...');
    const loginData = {
      identifier: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      role: 'admin'
    };

    console.log('📤 Login data that would be sent:');
    console.log('   identifier:', loginData.identifier);
    console.log('   password: [HIDDEN]');
    console.log('   role:', loginData.role);

    // Validate each field
    console.log('\n✅ Validation checks:');
    console.log('   identifier not empty:', !!loginData.identifier && loginData.identifier.trim().length > 0);
    console.log('   password not empty:', !!loginData.password && loginData.password.length > 0);
    console.log('   role is valid:', ['applicant', 'recruiter', 'admin'].includes(loginData.role));
    console.log('   email format valid:', /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginData.identifier));

    console.log('\n🎯 Summary:');
    if (adminUser && passwordMatch) {
      console.log('✅ Admin login should work - credentials are correct');
      console.log('⚠️ If login fails, check backend validation or authentication logic');
    } else {
      console.log('❌ Admin login will fail - credentials issue detected');
    }

  } catch (error) {
    console.error('❌ Error testing admin login:', error);
  } finally {
    console.log('\n🔄 Closing database connection...');
    await mongoose.connection.close();
    console.log('✅ Connection closed');
  }
}

// Run the test
testAdminLogin()
  .then(() => {
    console.log('\n🎯 Admin login test completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Admin login test failed:', error.message);
    process.exit(1);
  });
