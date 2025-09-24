#!/usr/bin/env node

/**
 * Authentication Test Script
 * Tests the authentication system with the new modular schema
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/mongoose/index.js';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/finautojobs';

console.log('🧪 Testing Authentication System...');

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

// Create test users
const createTestUsers = async () => {
  console.log('\n👥 Creating test users...');
  
  try {
    // Create admin user
    const adminUser = new User({
      username: 'admin',
      email: 'admin@finautojobs.com',
      password_hash: 'Admin123!',
      first_name: 'Admin',
      last_name: 'User',
      role: 'admin',
      email_verified: true,
      status: 'active'
    });
    
    await adminUser.save();
    console.log('  ✅ Admin user created: admin@finautojobs.com / Admin123!');
    
    // Create recruiter user
    const recruiterUser = new User({
      username: 'recruiter',
      email: 'recruiter@finautojobs.com',
      password_hash: 'Recruiter123!',
      first_name: 'John',
      last_name: 'Recruiter',
      role: 'recruiter',
      email_verified: true,
      status: 'active'
    });
    
    await recruiterUser.save();
    console.log('  ✅ Recruiter user created: recruiter@finautojobs.com / Recruiter123!');
    
    // Create applicant user
    const applicantUser = new User({
      username: 'applicant',
      email: 'applicant@finautojobs.com',
      password_hash: 'Applicant123!',
      first_name: 'Jane',
      last_name: 'Applicant',
      role: 'applicant',
      email_verified: true,
      status: 'active'
    });
    
    await applicantUser.save();
    console.log('  ✅ Applicant user created: applicant@finautojobs.com / Applicant123!');
    
    return { adminUser, recruiterUser, applicantUser };
    
  } catch (error) {
    if (error.code === 11000) {
      console.log('  ℹ️  Test users already exist, skipping creation');
      
      // Fetch existing users
      const adminUser = await User.findOne({ email: 'admin@finautojobs.com' });
      const recruiterUser = await User.findOne({ email: 'recruiter@finautojobs.com' });
      const applicantUser = await User.findOne({ email: 'applicant@finautojobs.com' });
      
      return { adminUser, recruiterUser, applicantUser };
    } else {
      console.error('  ❌ Failed to create test users:', error.message);
      throw error;
    }
  }
};

// Test authentication endpoints
const testAuthEndpoints = async () => {
  console.log('\n🔐 Testing authentication endpoints...');
  
  const API_BASE = 'http://localhost:5000/api';
  
  // Test regular login
  console.log('\n📝 Testing regular login...');
  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'applicant@finautojobs.com',
        password: 'Applicant123!'
      })
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('  ✅ Regular login successful');
      console.log(`  👤 User: ${data.data.user.first_name} ${data.data.user.last_name} (${data.data.user.role})`);
    } else {
      console.log('  ❌ Regular login failed:', data.message);
    }
  } catch (error) {
    console.log('  ❌ Regular login error:', error.message);
  }
  
  // Test admin login
  console.log('\n🔒 Testing admin login...');
  try {
    const response = await fetch(`${API_BASE}/auth/admin-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@finautojobs.com',
        password: 'Admin123!'
      })
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      console.log('  ✅ Admin login successful');
      console.log(`  👤 User: ${data.data.user.first_name} ${data.data.user.last_name} (${data.data.user.role})`);
    } else {
      console.log('  ❌ Admin login failed:', data.message);
    }
  } catch (error) {
    console.log('  ❌ Admin login error:', error.message);
  }
  
  // Test admin login with non-admin user (should fail)
  console.log('\n🚫 Testing admin login with non-admin user...');
  try {
    const response = await fetch(`${API_BASE}/auth/admin-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'applicant@finautojobs.com',
        password: 'Applicant123!'
      })
    });
    
    const data = await response.json();
    
    if (!response.ok || !data.success) {
      console.log('  ✅ Admin login correctly rejected non-admin user');
      console.log(`  📝 Message: ${data.message}`);
    } else {
      console.log('  ❌ Admin login incorrectly allowed non-admin user');
    }
  } catch (error) {
    console.log('  ❌ Admin login test error:', error.message);
  }
};

// Main test function
const runTests = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Create test users
    await createTestUsers();
    
    // Test authentication endpoints
    await testAuthEndpoints();
    
    console.log('\n🎉 Authentication tests completed!');
    console.log('\n📋 Test Users Created:');
    console.log('  🔑 Admin: admin@finautojobs.com / Admin123!');
    console.log('  🏢 Recruiter: recruiter@finautojobs.com / Recruiter123!');
    console.log('  👤 Applicant: applicant@finautojobs.com / Applicant123!');
    console.log('\n🌐 You can now test the frontend with these credentials!');
    
  } catch (error) {
    console.error('💥 Test suite failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run tests if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests();
}

export default runTests;
