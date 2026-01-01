#!/usr/bin/env node

/**
 * Create Simple Admin User
 * Creates the most basic admin user possible that any backend version should recognize
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// MongoDB Connection
const MONGODB_URI = 'mongodb+srv://hiddenshadow032025_db_user:nJNHickmLkFtwcIY@cluster0.nvq1gwn.mongodb.net/finautojobs?retryWrites=true&w=majority&appName=Cluster0';

async function createSimpleAdmin() {
  try {
    console.log('🔧 Creating Simple Admin User...');
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get the raw MongoDB collection
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // Hash password manually
    const hashedPassword = await bcrypt.hash('SuperAdmin@2025!', 12);

    // Create the simplest possible admin user document
    const adminUser = {
      email: 'hiddenshadow032025@gmail.com',
      password: hashedPassword,
      firstName: 'Super',
      lastName: 'Admin',
      username: 'superadmin',
      phone: '+919999999999',
      role: 'admin',
      fullName: 'Super Admin',
      isActive: true,
      isVerified: true,
      emailVerified: true,
      phoneVerified: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      
      // Add all possible variations
      isEmailVerified: true,
      status: 'active',
      
      // Admin info
      adminInfo: {
        permissions: ['all'],
        accessLevel: 'super_admin',
        canManageUsers: true,
        canManageJobs: true,
        canViewAnalytics: true,
        canManageSystem: true
      }
    };

    // Remove existing admin users
    console.log('🗑️ Removing existing admin users...');
    await usersCollection.deleteMany({ email: 'hiddenshadow032025@gmail.com' });

    // Insert the new admin user directly
    console.log('📝 Inserting simple admin user...');
    const result = await usersCollection.insertOne(adminUser);
    
    console.log('✅ Simple admin user created!');
    console.log('🆔 Inserted ID:', result.insertedId);

    // Verify the user was created
    const createdUser = await usersCollection.findOne({ email: 'hiddenshadow032025@gmail.com' });
    if (createdUser) {
      console.log('✅ Verification successful:');
      console.log('   📧 Email:', createdUser.email);
      console.log('   🔑 Role:', createdUser.role);
      console.log('   ✅ Active:', createdUser.isActive);
    }

    // Test the search query that backend uses
    console.log('\n🔍 Testing backend search patterns...');
    
    // Pattern 1: Exact email + role
    const search1 = await usersCollection.findOne({
      email: 'hiddenshadow032025@gmail.com',
      role: 'admin'
    });
    console.log('Pattern 1 (email + role):', search1 ? '✅ Found' : '❌ Not found');

    // Pattern 2: Backend's complex query
    const search2 = await usersCollection.findOne({
      $and: [
        {
          $or: [
            { email: 'hiddenshadow032025@gmail.com' },
            { username: 'hiddenshadow032025@gmail.com' },
            { phone: 'hiddenshadow032025@gmail.com' }
          ]
        },
        { role: 'admin' }
      ]
    });
    console.log('Pattern 2 (backend query):', search2 ? '✅ Found' : '❌ Not found');

    // Pattern 3: Case insensitive
    const search3 = await usersCollection.findOne({
      email: { $regex: new RegExp('^hiddenshadow032025@gmail.com$', 'i') },
      role: 'admin'
    });
    console.log('Pattern 3 (case insensitive):', search3 ? '✅ Found' : '❌ Not found');

    console.log('\n🎯 Admin Login Details:');
    console.log('   📧 Email: hiddenshadow032025@gmail.com');
    console.log('   🔐 Password: SuperAdmin@2025!');
    console.log('   🌐 URL: https://finautojobs-a-job-portal-pivn.onrender.com/admin-login');

  } catch (error) {
    console.error('❌ Error creating simple admin:', error);
  } finally {
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
  }
}

createSimpleAdmin()
  .then(() => {
    console.log('\n🚀 Simple admin creation completed!');
    console.log('🔄 Try logging in now - this should work with any backend version!');
  })
  .catch(console.error);
