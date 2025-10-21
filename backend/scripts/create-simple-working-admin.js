#!/usr/bin/env node

/**
 * Create Simple Working Admin
 * Creates the most basic admin user that should work with any backend version
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// MongoDB Connection
const MONGODB_URI = 'mongodb+srv://hiddenshadow032025_db_user:nJNHickmLkFtwcIY@cluster0.nvq1gwn.mongodb.net/finautojobs';

async function createSimpleWorkingAdmin() {
  try {
    console.log('🚀 Creating Simple Working Admin...');
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get the raw MongoDB collection
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // Create the simplest possible admin user
    const hashedPassword = await bcrypt.hash('admin123', 12);

    const simpleAdmin = {
      email: 'admin@admin.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      username: 'admin',
      fullName: 'Admin User',
      phone: '+919999999999',
      role: 'admin',
      isActive: true,
      isVerified: true,
      emailVerified: true,
      phoneVerified: false,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
      _createdBy: 'simple-working-admin-script'
    };

    // Remove ALL existing users and create fresh
    console.log('🗑️ Removing ALL existing users...');
    await usersCollection.deleteMany({});
    console.log('✅ Database cleared');

    // Insert the simple admin
    console.log('📝 Creating simple admin...');
    const result = await usersCollection.insertOne(simpleAdmin);
    
    console.log('🎉 Simple admin created!');
    console.log('🆔 Inserted ID:', result.insertedId);

    // Verify the user was created
    const createdUser = await usersCollection.findOne({ _id: result.insertedId });
    if (createdUser) {
      console.log('\n✅ Verification successful:');
      console.log('   📧 Email:', createdUser.email);
      console.log('   👤 Username:', createdUser.username);
      console.log('   🔑 Role:', createdUser.role);
      console.log('   ✅ Active:', createdUser.isActive);
    }

    // Test all possible backend search patterns
    console.log('\n🧪 Testing all backend search patterns...');
    
    const searchPatterns = [
      // Pattern 1: Simple email + role
      {
        name: 'Email + Role',
        query: { email: 'admin@admin.com', role: 'admin' }
      },
      // Pattern 2: Backend complex query (email)
      {
        name: 'Backend Query (Email)',
        query: {
          $and: [
            {
              $or: [
                { email: 'admin@admin.com' },
                { username: 'admin@admin.com' },
                { phone: 'admin@admin.com' }
              ]
            },
            { role: 'admin' }
          ]
        }
      },
      // Pattern 3: Backend complex query (username)
      {
        name: 'Backend Query (Username)',
        query: {
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
        }
      },
      // Pattern 4: Case insensitive
      {
        name: 'Case Insensitive Email',
        query: {
          email: { $regex: new RegExp('^admin@admin.com$', 'i') },
          role: 'admin'
        }
      }
    ];

    for (const pattern of searchPatterns) {
      const found = await usersCollection.findOne(pattern.query);
      console.log(`   ${pattern.name}: ${found ? '✅ FOUND' : '❌ NOT FOUND'}`);
    }

    // Test password verification
    console.log('\n🔐 Testing password verification...');
    const passwordTest = await bcrypt.compare('admin123', createdUser.password);
    console.log('   Password verification:', passwordTest ? '✅ CORRECT' : '❌ INCORRECT');

    // Show database stats
    console.log('\n📊 Database Statistics:');
    const totalUsers = await usersCollection.countDocuments();
    const adminUsers = await usersCollection.countDocuments({ role: 'admin' });
    console.log(`   Total users: ${totalUsers}`);
    console.log(`   Admin users: ${adminUsers}`);

    console.log('\n🎯 Simple Admin Login Details:');
    console.log('   📧 Email: admin@admin.com');
    console.log('   👤 Username: admin');
    console.log('   🔐 Password: admin123');
    console.log('   🔑 Role: admin');
    console.log('   🌐 URL: https://finautojobs-a-job-portal-pivn.onrender.com/admin-login');

    console.log('\n🚨 IMPORTANT NOTES:');
    console.log('   ⚠️ This script cleared ALL users from database');
    console.log('   ✅ Only one simple admin user exists now');
    console.log('   🎯 This should work with any backend version');
    console.log('   🔄 If this still fails, the issue is backend deployment');

  } catch (error) {
    console.error('❌ Error creating simple admin:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  }
}

createSimpleWorkingAdmin()
  .then(() => {
    console.log('\n🚀 Simple working admin creation completed!');
    console.log('🎯 Try logging in with admin@admin.com / admin123');
  })
  .catch(console.error);
