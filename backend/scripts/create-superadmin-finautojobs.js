#!/usr/bin/env node

/**
 * Create SuperAdmin with finautojobs.com email
 * Creates admin user with the email format the user tried
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// MongoDB Connection
const MONGODB_URI = 'mongodb+srv://hiddenshadow032025_db_user:nJNHickmLkFtwcIY@cluster0.nvq1gwn.mongodb.net/finautojobs?retryWrites=true&w=majority&appName=Cluster0';

async function createSuperAdminFinAutoJobs() {
  try {
    console.log('🚀 Creating SuperAdmin@finautojobs.com...');
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get the raw MongoDB collection
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // Hash password manually
    const hashedPassword = await bcrypt.hash('SuperAdmin@2025!', 12);

    // Create admin users with both email formats
    const adminUsers = [
      {
        email: 'superadmin@finautojobs.com',
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
        adminInfo: {
          permissions: ['all'],
          accessLevel: 'super_admin',
          canManageUsers: true,
          canManageJobs: true,
          canViewAnalytics: true,
          canManageSystem: true
        }
      },
      {
        email: 'admin@finautojobs.com',
        password: hashedPassword,
        firstName: 'Admin',
        lastName: 'User',
        username: 'admin',
        phone: '+919999999998',
        role: 'admin',
        fullName: 'Admin User',
        isActive: true,
        isVerified: true,
        emailVerified: true,
        phoneVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        adminInfo: {
          permissions: ['all'],
          accessLevel: 'super_admin',
          canManageUsers: true,
          canManageJobs: true,
          canViewAnalytics: true,
          canManageSystem: true
        }
      }
    ];

    // Remove existing admin users with these emails
    console.log('🗑️ Removing existing admin users...');
    await usersCollection.deleteMany({ 
      email: { $in: ['superadmin@finautojobs.com', 'admin@finautojobs.com'] }
    });

    // Insert the new admin users
    console.log('📝 Creating multiple admin users...');
    const result = await usersCollection.insertMany(adminUsers);
    
    console.log('✅ Admin users created!');
    console.log('🆔 Inserted IDs:', result.insertedIds);

    // Verify the users were created
    for (const adminUser of adminUsers) {
      const createdUser = await usersCollection.findOne({ email: adminUser.email });
      if (createdUser) {
        console.log(`✅ ${adminUser.email}:`);
        console.log(`   🔑 Role: ${createdUser.role}`);
        console.log(`   ✅ Active: ${createdUser.isActive}`);
        console.log(`   🆔 ID: ${createdUser._id}`);
      }
    }

    console.log('\n🎯 Admin Login Options:');
    console.log('   📧 Email: superadmin@finautojobs.com');
    console.log('   📧 Email: admin@finautojobs.com');
    console.log('   📧 Email: hiddenshadow032025@gmail.com (still available)');
    console.log('   🔐 Password: SuperAdmin@2025!');
    console.log('   🌐 URL: https://finautojobs-a-job-portal-pivn.onrender.com/admin-login');

  } catch (error) {
    console.error('❌ Error creating admin users:', error);
  } finally {
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
  }
}

createSuperAdminFinAutoJobs()
  .then(() => {
    console.log('\n🚀 SuperAdmin creation completed!');
    console.log('🔄 Try logging in with superadmin@finautojobs.com now!');
  })
  .catch(console.error);
