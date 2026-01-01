#!/usr/bin/env node

/**
 * Test Analytics Admin
 * Tests the specific analytics admin account that the user tried
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// MongoDB Connection
const MONGODB_URI = 'mongodb+srv://hiddenshadow032025_db_user:nJNHickmLkFtwcIY@cluster0.nvq1gwn.mongodb.net/finautojobs';

async function testAnalyticsAdmin() {
  try {
    console.log('🧪 Testing Analytics Admin Account...');
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get the raw MongoDB collection
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // Test the exact backend search query for analytics admin
    const analyticsAdminEmail = 'analyticsadmin@finautojobs.com';
    
    console.log(`\n🔍 Testing backend search for: ${analyticsAdminEmail}`);
    
    const backendQuery = {
      $and: [
        {
          $or: [
            { email: analyticsAdminEmail },
            { username: analyticsAdminEmail },
            { phone: analyticsAdminEmail }
          ]
        },
        { role: 'admin' }
      ]
    };
    
    console.log('🔍 Backend Query:', JSON.stringify(backendQuery, null, 2));
    const searchResult = await usersCollection.findOne(backendQuery);
    
    if (searchResult) {
      console.log('✅ Analytics Admin FOUND by backend query!');
      console.log('   📧 Email:', searchResult.email);
      console.log('   👤 Username:', searchResult.username);
      console.log('   🔑 Role:', searchResult.role);
      console.log('   ✅ Active:', searchResult.isActive);
      console.log('   🆔 ID:', searchResult._id);
      
      // Test password verification
      console.log('\n🔐 Testing password verification...');
      const passwordTest = await bcrypt.compare('SuperAdmin@2025!', searchResult.password);
      console.log('   Password verification:', passwordTest ? '✅ CORRECT' : '❌ INCORRECT');
      
      if (passwordTest) {
        console.log('\n🎉 ANALYTICS ADMIN ACCOUNT IS FULLY WORKING!');
        console.log('   📧 Email: analyticsadmin@finautojobs.com');
        console.log('   🔐 Password: SuperAdmin@2025!');
        console.log('   🔑 Role: admin');
        console.log('   ✅ Backend can find this user');
        console.log('   ✅ Password verification works');
      }
      
    } else {
      console.log('❌ Analytics Admin NOT FOUND by backend query');
      
      // Try simpler queries to debug
      console.log('\n🔍 Debugging with simpler queries...');
      
      const emailOnly = await usersCollection.findOne({ email: analyticsAdminEmail });
      console.log('   Email only search:', emailOnly ? '✅ FOUND' : '❌ NOT FOUND');
      
      const roleOnly = await usersCollection.findOne({ role: 'admin' });
      console.log('   Role only search:', roleOnly ? '✅ FOUND' : '❌ NOT FOUND');
      
      if (emailOnly) {
        console.log('   📧 Found user email:', emailOnly.email);
        console.log('   🔑 Found user role:', emailOnly.role);
        console.log('   ✅ Found user active:', emailOnly.isActive);
      }
    }

    // Test all admin accounts
    console.log('\n🔍 Testing all admin accounts...');
    const allAdmins = await usersCollection.find({ role: 'admin' }).toArray();
    
    for (const admin of allAdmins) {
      const testQuery = {
        $and: [
          {
            $or: [
              { email: admin.email },
              { username: admin.email },
              { phone: admin.email }
            ]
          },
          { role: 'admin' }
        ]
      };
      
      const found = await usersCollection.findOne(testQuery);
      console.log(`   ${admin.email}: ${found ? '✅ FOUND' : '❌ NOT FOUND'}`);
    }

  } catch (error) {
    console.error('❌ Error testing analytics admin:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  }
}

testAnalyticsAdmin()
  .then(() => console.log('\n🎯 Analytics admin test completed!'))
  .catch(console.error);
