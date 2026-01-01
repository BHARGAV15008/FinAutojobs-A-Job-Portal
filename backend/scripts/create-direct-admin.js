#!/usr/bin/env node

/**
 * Create Direct Admin User
 * Creates admin user directly in the specified MongoDB database
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// MongoDB Connection - Your specified URI
const MONGODB_URI = 'mongodb+srv://hiddenshadow032025_db_user:nJNHickmLkFtwcIY@cluster0.nvq1gwn.mongodb.net/finautojobs';

async function createDirectAdmin() {
  try {
    console.log('🚀 Creating Direct Admin User in MongoDB...');
    console.log('🌐 Database:', MONGODB_URI.replace(/\/\/.*@/, '//***:***@'));
    
    // Connect to MongoDB
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected successfully to finautojobs database');

    // Get the raw MongoDB collection
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // Hash password
    console.log('🔐 Hashing password...');
    const hashedPassword = await bcrypt.hash('SuperAdmin@2025!', 12);

    // Create admin user document
    const adminUser = {
      // Basic Info
      email: 'admin@finautojobs.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      username: 'admin',
      fullName: 'Admin User',
      phone: '+919999999999',
      
      // Role and Status
      role: 'admin',
      isActive: true,
      isVerified: true,
      emailVerified: true,
      phoneVerified: false,
      status: 'active',
      
      // Timestamps
      createdAt: new Date(),
      updatedAt: new Date(),
      
      // Admin Info
      adminInfo: {
        permissions: ['all'],
        department: 'System Administration',
        accessLevel: 'super_admin',
        canManageUsers: true,
        canManageJobs: true,
        canViewAnalytics: true,
        canManageSystem: true,
        lastLogin: null,
        loginCount: 0
      },
      
      // Additional fields that might be expected
      profileImage: null,
      bio: 'System Administrator',
      location: 'System',
      yearsOfExperience: 0,
      
      // Social Links
      linkedin_url: null,
      github_url: null,
      portfolio_url: null,
      
      // Security
      loginAttempts: 0,
      lockUntil: null
    };

    // Remove existing admin users first
    console.log('🗑️ Removing existing admin users...');
    const deleteResult = await usersCollection.deleteMany({ 
      $or: [
        { email: 'admin@finautojobs.com' },
        { email: 'superadmin@finautojobs.com' },
        { email: 'hiddenshadow032025@gmail.com' },
        { role: 'admin' }
      ]
    });
    console.log(`✅ Removed ${deleteResult.deletedCount} existing admin users`);

    // Insert the new admin user
    console.log('📝 Creating new admin user...');
    const insertResult = await usersCollection.insertOne(adminUser);
    
    console.log('🎉 Admin user created successfully!');
    console.log('🆔 Inserted ID:', insertResult.insertedId);

    // Verify the user was created
    const createdUser = await usersCollection.findOne({ _id: insertResult.insertedId });
    if (createdUser) {
      console.log('\n✅ Verification successful:');
      console.log('   📧 Email:', createdUser.email);
      console.log('   👤 Name:', createdUser.fullName);
      console.log('   🆔 Username:', createdUser.username);
      console.log('   🔑 Role:', createdUser.role);
      console.log('   ✅ Active:', createdUser.isActive);
      console.log('   ✅ Verified:', createdUser.isVerified);
      console.log('   🆔 MongoDB ID:', createdUser._id);
    }

    // Test all possible search patterns
    console.log('\n🔍 Testing backend search patterns...');
    
    // Pattern 1: Email + role
    const search1 = await usersCollection.findOne({
      email: 'admin@finautojobs.com',
      role: 'admin'
    });
    console.log('✅ Email + role search:', search1 ? 'FOUND' : 'NOT FOUND');

    // Pattern 2: Backend's complex query (email)
    const search2 = await usersCollection.findOne({
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
    });
    console.log('✅ Backend query (email):', search2 ? 'FOUND' : 'NOT FOUND');

    // Pattern 3: Backend's complex query (username)
    const search3 = await usersCollection.findOne({
      $and: [
        {
          $or: [
            { email: 'admin' },
            { username: 'admin' },
            { phone: 'admin' }
          ]
        },
        { role: 'admin' }
      ]
    });
    console.log('✅ Backend query (username):', search3 ? 'FOUND' : 'NOT FOUND');

    // Test password verification
    console.log('\n🧪 Testing password verification...');
    const passwordMatch = await bcrypt.compare('SuperAdmin@2025!', createdUser.password);
    console.log('🔐 Password verification:', passwordMatch ? '✅ CORRECT' : '❌ INCORRECT');

    // Show all users in database
    console.log('\n📋 All users in database:');
    const allUsers = await usersCollection.find({}, { 
      email: 1, 
      username: 1, 
      role: 1, 
      isActive: 1 
    }).toArray();
    
    allUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email} (${user.username}) - Role: ${user.role} - Active: ${user.isActive}`);
    });

    console.log('\n🎯 Admin Login Details:');
    console.log('   📧 Email: admin@finautojobs.com');
    console.log('   🆔 Username: admin');
    console.log('   🔐 Password: SuperAdmin@2025!');
    console.log('   🌐 Login URL: https://finautojobs-a-job-portal-pivn.onrender.com/admin-login');
    console.log('   🌐 Alt URL: https://finautojobs-a-job-portal-pivn.onrender.com/login');

  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    throw error;
  } finally {
    console.log('\n🔄 Closing database connection...');
    await mongoose.connection.close();
    console.log('✅ Connection closed');
  }
}

// Run the script
createDirectAdmin()
  .then(() => {
    console.log('\n🎯 Direct admin creation completed successfully!');
    console.log('🚀 Admin user is ready - try logging in now!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Direct admin creation failed:', error.message);
    process.exit(1);
  });
