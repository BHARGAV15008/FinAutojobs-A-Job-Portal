#!/usr/bin/env node

/**
 * Create Multiple Admin Users
 * Creates admin users with different formats and passwords to ensure compatibility
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// MongoDB Connection
const MONGODB_URI = 'mongodb+srv://hiddenshadow032025_db_user:nJNHickmLkFtwcIY@cluster0.nvq1gwn.mongodb.net/finautojobs';

async function createMultipleAdmins() {
  try {
    console.log('🚀 Creating Multiple Admin Users...');
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get the raw MongoDB collection
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // Different password options
    const passwords = [
      'SuperAdmin@2025!',
      'admin123',
      'password123',
      'Admin@123'
    ];

    // Create admin users with different combinations
    const adminUsers = [];

    for (let i = 0; i < passwords.length; i++) {
      const password = passwords[i];
      const hashedPassword = await bcrypt.hash(password, 12);

      adminUsers.push({
        email: `admin${i + 1}@finautojobs.com`,
        password: hashedPassword,
        firstName: 'Admin',
        lastName: `User${i + 1}`,
        username: `admin${i + 1}`,
        fullName: `Admin User${i + 1}`,
        phone: `+91999999999${i}`,
        role: 'admin',
        isActive: true,
        isVerified: true,
        emailVerified: true,
        phoneVerified: false,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
        adminInfo: {
          permissions: ['all'],
          accessLevel: 'super_admin',
          canManageUsers: true,
          canManageJobs: true,
          canViewAnalytics: true,
          canManageSystem: true
        },
        // Add metadata for tracking
        _passwordPlainText: password, // For reference only
        _createdBy: 'multiple-admins-script'
      });
    }

    // Also create the main admin with the expected credentials
    const mainAdminPassword = await bcrypt.hash('SuperAdmin@2025!', 12);
    adminUsers.push({
      email: 'admin@finautojobs.com',
      password: mainAdminPassword,
      firstName: 'Super',
      lastName: 'Admin',
      username: 'admin',
      fullName: 'Super Admin',
      phone: '+919999999999',
      role: 'admin',
      isActive: true,
      isVerified: true,
      emailVerified: true,
      phoneVerified: false,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
      adminInfo: {
        permissions: ['all'],
        accessLevel: 'super_admin',
        canManageUsers: true,
        canManageJobs: true,
        canViewAnalytics: true,
        canManageSystem: true
      },
      _passwordPlainText: 'SuperAdmin@2025!',
      _createdBy: 'multiple-admins-script'
    });

    // Remove all existing admin users
    console.log('🗑️ Removing existing admin users...');
    await usersCollection.deleteMany({ role: 'admin' });

    // Insert all admin users
    console.log('📝 Creating multiple admin users...');
    const result = await usersCollection.insertMany(adminUsers);
    
    console.log(`🎉 Created ${result.insertedCount} admin users!`);

    // Display all created admin users
    console.log('\n📋 Created Admin Users:');
    for (let i = 0; i < adminUsers.length; i++) {
      const admin = adminUsers[i];
      console.log(`\n   ${i + 1}. ${admin.email}`);
      console.log(`      👤 Username: ${admin.username}`);
      console.log(`      🔐 Password: ${admin._passwordPlainText}`);
      console.log(`      🔑 Role: ${admin.role}`);
      console.log(`      ✅ Active: ${admin.isActive}`);
    }

    // Test each admin user
    console.log('\n🧪 Testing each admin user...');
    for (const admin of adminUsers) {
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

    console.log('\n🎯 Login Options:');
    console.log('   🌐 URL: https://finautojobs-a-job-portal-pivn.onrender.com/admin-login');
    console.log('\n   Try any of these combinations:');
    adminUsers.forEach((admin, index) => {
      console.log(`   ${index + 1}. Email: ${admin.email} | Password: ${admin._passwordPlainText}`);
    });

  } catch (error) {
    console.error('❌ Error creating multiple admins:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  }
}

createMultipleAdmins()
  .then(() => {
    console.log('\n🚀 Multiple admin creation completed!');
    console.log('🔄 Try logging in with any of the admin accounts above!');
  })
  .catch(console.error);
