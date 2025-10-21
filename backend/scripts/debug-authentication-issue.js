#!/usr/bin/env node

/**
 * Debug Authentication Issue
 * Deep dive into why admin authentication is failing
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// MongoDB Connection
const MONGODB_URI = 'mongodb+srv://hiddenshadow032025_db_user:nJNHickmLkFtwcIY@cluster0.nvq1gwn.mongodb.net/finautojobs';

async function debugAuthenticationIssue() {
  try {
    console.log('🔍 Deep Debugging Authentication Issue...');
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get the database instance
    const db = mongoose.connection.db;
    const baseUsersCollection = db.collection('baseusers');

    // Test credentials that should work
    const testCredentials = [
      { email: 'admin@admin.com', password: 'admin123', role: 'Admin' },
      { email: 'mainadmin@finautojobs.com', password: 'SuperAdmin@2025!', role: 'Admin' },
      { email: 'hiddenshadow032025@gmail.com', password: 'SuperAdmin@2025!', role: 'Admin' }
    ];

    console.log('\n🧪 Testing Each Credential Step by Step...');

    for (let i = 0; i < testCredentials.length; i++) {
      const cred = testCredentials[i];
      console.log(`\n--- Testing ${i + 1}: ${cred.email} ---`);

      // Step 1: Check if user exists by email only
      console.log('🔍 Step 1: Finding user by email only...');
      const userByEmail = await baseUsersCollection.findOne({ email: cred.email });
      if (userByEmail) {
        console.log('   ✅ User found by email');
        console.log('   📧 Email:', userByEmail.email);
        console.log('   🔑 Role:', userByEmail.role);
        console.log('   👤 Username:', userByEmail.username);
        console.log('   ✅ Active:', userByEmail.isActive);
        console.log('   📊 Status:', userByEmail.status);
      } else {
        console.log('   ❌ User NOT found by email');
        continue;
      }

      // Step 2: Check exact backend authentication query
      console.log('🔍 Step 2: Testing exact backend authentication query...');
      const backendQuery = {
        $and: [
          {
            $or: [
              { email: cred.email },
              { username: cred.email },
              { phone: cred.email }
            ]
          },
          { role: cred.role }
        ]
      };
      
      console.log('   Query:', JSON.stringify(backendQuery, null, 2));
      const userByBackendQuery = await baseUsersCollection.findOne(backendQuery);
      
      if (userByBackendQuery) {
        console.log('   ✅ User found by backend query');
      } else {
        console.log('   ❌ User NOT found by backend query');
        
        // Debug why backend query failed
        console.log('   🔍 Debugging backend query failure...');
        
        // Test each part of the OR condition
        const emailMatch = await baseUsersCollection.findOne({ email: cred.email });
        const usernameMatch = await baseUsersCollection.findOne({ username: cred.email });
        const phoneMatch = await baseUsersCollection.findOne({ phone: cred.email });
        
        console.log('   📧 Email match:', emailMatch ? '✅' : '❌');
        console.log('   👤 Username match:', usernameMatch ? '✅' : '❌');
        console.log('   📞 Phone match:', phoneMatch ? '✅' : '❌');
        
        // Test role condition
        const roleMatch = await baseUsersCollection.findOne({ role: cred.role });
        console.log('   🔑 Role match:', roleMatch ? '✅' : '❌');
        
        // Test combined email + role
        const emailRoleMatch = await baseUsersCollection.findOne({ 
          email: cred.email, 
          role: cred.role 
        });
        console.log('   📧+🔑 Email + Role match:', emailRoleMatch ? '✅' : '❌');
        
        if (!emailRoleMatch && emailMatch) {
          console.log('   ⚠️ ISSUE: User exists but role mismatch!');
          console.log('   Expected role:', cred.role);
          console.log('   Actual role:', emailMatch.role);
        }
      }

      // Step 3: Test password verification
      if (userByEmail) {
        console.log('🔍 Step 3: Testing password verification...');
        try {
          const passwordMatch = await bcrypt.compare(cred.password, userByEmail.password);
          console.log('   🔐 Password verification:', passwordMatch ? '✅ CORRECT' : '❌ INCORRECT');
          
          if (!passwordMatch) {
            console.log('   🔍 Password hash details:');
            console.log('   Hash length:', userByEmail.password ? userByEmail.password.length : 'undefined');
            console.log('   Hash starts with:', userByEmail.password ? userByEmail.password.substring(0, 10) + '...' : 'undefined');
          }
        } catch (error) {
          console.log('   ❌ Password verification error:', error.message);
        }
      }

      // Step 4: Simulate exact backend authentication logic
      console.log('🔍 Step 4: Simulating exact backend authentication...');
      try {
        const user = await baseUsersCollection.findOne({
          $and: [
            {
              $or: [
                { email: cred.email },
                { username: cred.email },
                { phone: cred.email }
              ]
            },
            { role: cred.role }
          ]
        });

        if (!user) {
          console.log(`   ❌ Backend would return: "No ${cred.role.toLowerCase()} account found with these credentials"`);
        } else {
          const passwordMatch = await bcrypt.compare(cred.password, user.password);
          if (!passwordMatch) {
            console.log('   ❌ Backend would return: "Invalid credentials"');
          } else {
            console.log('   ✅ Backend would return: "Authentication successful"');
          }
        }
      } catch (error) {
        console.log('   ❌ Backend simulation error:', error.message);
      }
    }

    // Additional debugging: Check all admin users and their exact roles
    console.log('\n📊 All Admin Users in Database:');
    const allAdmins = await baseUsersCollection.find({}).toArray();
    const adminUsers = allAdmins.filter(user => 
      user.role && (
        user.role.toLowerCase() === 'admin' || 
        user.role === 'Admin' || 
        user.role === 'ADMIN'
      )
    );

    console.log(`Found ${adminUsers.length} potential admin users:`);
    adminUsers.forEach((admin, index) => {
      console.log(`   ${index + 1}. Email: ${admin.email}`);
      console.log(`      Role: "${admin.role}" (type: ${typeof admin.role})`);
      console.log(`      Username: ${admin.username}`);
      console.log(`      Active: ${admin.isActive}`);
      console.log(`      Status: ${admin.status}`);
    });

    // Check for role case sensitivity issues
    console.log('\n🔍 Role Case Sensitivity Check:');
    const roleVariations = ['admin', 'Admin', 'ADMIN'];
    for (const roleVar of roleVariations) {
      const count = await baseUsersCollection.countDocuments({ role: roleVar });
      console.log(`   Role "${roleVar}": ${count} users`);
    }

  } catch (error) {
    console.error('❌ Error debugging authentication:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  }
}

debugAuthenticationIssue()
  .then(() => console.log('\n🎯 Authentication debugging completed!'))
  .catch(console.error);
