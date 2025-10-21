#!/usr/bin/env node

/**
 * Check Database Users
 * Checks what users actually exist in the database
 */

import mongoose from 'mongoose';

// MongoDB Connection
const MONGODB_URI = 'mongodb+srv://hiddenshadow032025_db_user:nJNHickmLkFtwcIY@cluster0.nvq1gwn.mongodb.net/finautojobs';

async function checkDatabaseUsers() {
  try {
    console.log('🔍 Checking Database Users...');
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get the raw MongoDB collection
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // Get all users
    console.log('\n📋 All users in database:');
    const allUsers = await usersCollection.find({}).toArray();
    
    if (allUsers.length === 0) {
      console.log('❌ No users found in database!');
      
      // Check if we're connected to the right database
      console.log('\n🔍 Database info:');
      console.log('   Database name:', db.databaseName);
      console.log('   Collection name: users');
      
      // List all collections
      const collections = await db.listCollections().toArray();
      console.log('\n📂 Available collections:');
      collections.forEach((col, index) => {
        console.log(`   ${index + 1}. ${col.name}`);
      });
      
    } else {
      console.log(`✅ Found ${allUsers.length} users:`);
      
      allUsers.forEach((user, index) => {
        console.log(`\n   ${index + 1}. User ID: ${user._id}`);
        console.log(`      📧 Email: ${user.email}`);
        console.log(`      👤 Username: ${user.username || 'N/A'}`);
        console.log(`      🔑 Role: ${user.role}`);
        console.log(`      ✅ Active: ${user.isActive}`);
        console.log(`      ✅ Verified: ${user.isVerified || user.emailVerified}`);
        console.log(`      📅 Created: ${user.createdAt}`);
        console.log(`      🔐 Password Hash: ${user.password ? user.password.substring(0, 20) + '...' : 'N/A'}`);
      });
      
      // Check specifically for admin users
      console.log('\n🔍 Admin users specifically:');
      const adminUsers = allUsers.filter(user => user.role === 'admin');
      
      if (adminUsers.length === 0) {
        console.log('❌ No admin users found!');
        
        // Check for users with similar roles
        const similarRoles = allUsers.filter(user => 
          user.role && user.role.toLowerCase().includes('admin')
        );
        
        if (similarRoles.length > 0) {
          console.log('\n🔍 Users with admin-like roles:');
          similarRoles.forEach(user => {
            console.log(`   📧 ${user.email} - Role: "${user.role}"`);
          });
        }
        
      } else {
        console.log(`✅ Found ${adminUsers.length} admin users:`);
        adminUsers.forEach(admin => {
          console.log(`   📧 ${admin.email} - Active: ${admin.isActive}`);
        });
      }
    }

    // Test the exact search query the backend uses
    console.log('\n🧪 Testing backend search query...');
    const backendQuery = {
      $and: [
        {
          $or: [
            { email: 'admin@finautojobs.com' },
            { username: 'admin@finautojobs.com' },
            { phone: 'admin@finautojobs.com' }
          ]
        },
        { role: 'admin' }
      ]
    };
    
    console.log('🔍 Query:', JSON.stringify(backendQuery, null, 2));
    const searchResult = await usersCollection.findOne(backendQuery);
    
    if (searchResult) {
      console.log('✅ Backend query found user:', searchResult.email);
    } else {
      console.log('❌ Backend query found no users');
      
      // Try simpler queries to debug
      console.log('\n🔍 Debugging simpler queries...');
      
      const emailOnly = await usersCollection.findOne({ email: 'admin@finautojobs.com' });
      console.log('   Email only:', emailOnly ? 'FOUND' : 'NOT FOUND');
      
      const roleOnly = await usersCollection.findOne({ role: 'admin' });
      console.log('   Role only:', roleOnly ? 'FOUND' : 'NOT FOUND');
    }

  } catch (error) {
    console.error('❌ Error checking database users:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  }
}

checkDatabaseUsers()
  .then(() => console.log('\n🎯 Database user check completed!'))
  .catch(console.error);
