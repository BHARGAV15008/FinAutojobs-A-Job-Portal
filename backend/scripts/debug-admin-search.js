#!/usr/bin/env node

/**
 * Debug Admin Search
 * Checks exactly how the backend searches for admin users
 */

import mongoose from 'mongoose';
import { BaseUser } from '../models/UserModels.js';

// MongoDB Connection
const MONGODB_URI = 'mongodb+srv://hiddenshadow032025_db_user:nJNHickmLkFtwcIY@cluster0.nvq1gwn.mongodb.net/finautojobs?retryWrites=true&w=majority&appName=Cluster0';

async function debugAdminSearch() {
  try {
    console.log('🔍 Debugging Admin Search...');
    
    // Connect to MongoDB
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected successfully');

    const identifier = 'hiddenshadow032025@gmail.com';
    const role = 'admin';

    console.log('\n🔍 Searching for admin user exactly like backend does...');
    console.log('📧 Identifier:', identifier);
    console.log('🔑 Role:', role);

    // This is exactly how the backend searches (from authenticateUser function)
    const user = await BaseUser.findOne({
      $and: [
        {
          $or: [
            { email: identifier.toLowerCase() },
            { username: identifier.toLowerCase() },
            { phone: identifier }
          ]
        },
        { role: role }
      ]
    });

    if (user) {
      console.log('\n✅ User found with backend search logic!');
      console.log('📊 User Details:');
      console.log('   📧 Email:', user.email);
      console.log('   👤 Username:', user.username);
      console.log('   📱 Phone:', user.phone);
      console.log('   🔑 Role:', user.role);
      console.log('   🆔 ID:', user._id);
      console.log('   📋 Model:', user.constructor.modelName);
      console.log('   ✅ Active:', user.isActive);
      console.log('   ✅ Verified:', user.isVerified);
    } else {
      console.log('\n❌ User NOT found with backend search logic!');
      
      // Let's try different searches to debug
      console.log('\n🔍 Debugging different search methods...');
      
      // Search by email only
      const emailUser = await BaseUser.findOne({ email: identifier.toLowerCase() });
      console.log('📧 Email search result:', emailUser ? 'FOUND' : 'NOT FOUND');
      if (emailUser) {
        console.log('   Role:', emailUser.role, '(expected: admin)');
      }
      
      // Search by role only
      const roleUsers = await BaseUser.find({ role: role });
      console.log('🔑 Role search results:', roleUsers.length, 'users found');
      roleUsers.forEach((u, i) => {
        console.log(`   ${i + 1}. ${u.email} (${u.role})`);
      });
      
      // Search all users
      const allUsers = await BaseUser.find({}, { email: 1, role: 1, username: 1 });
      console.log('\n📋 All users in database:');
      allUsers.forEach((u, i) => {
        console.log(`   ${i + 1}. ${u.email} - Role: ${u.role} - Username: ${u.username}`);
      });
    }

    // Test the exact query components
    console.log('\n🧪 Testing query components...');
    console.log('   identifier.toLowerCase():', identifier.toLowerCase());
    console.log('   role:', role);
    
    // Test each OR condition separately
    const emailMatch = await BaseUser.findOne({ email: identifier.toLowerCase() });
    const usernameMatch = await BaseUser.findOne({ username: identifier.toLowerCase() });
    const phoneMatch = await BaseUser.findOne({ phone: identifier });
    
    console.log('   Email match:', emailMatch ? 'YES' : 'NO');
    console.log('   Username match:', usernameMatch ? 'YES' : 'NO');
    console.log('   Phone match:', phoneMatch ? 'YES' : 'NO');

  } catch (error) {
    console.error('❌ Error debugging admin search:', error);
  } finally {
    console.log('\n🔄 Closing database connection...');
    await mongoose.connection.close();
    console.log('✅ Connection closed');
  }
}

// Run the debug
debugAdminSearch()
  .then(() => {
    console.log('\n🎯 Admin search debug completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Admin search debug failed:', error.message);
    process.exit(1);
  });
