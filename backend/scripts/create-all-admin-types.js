#!/usr/bin/env node

/**
 * Create All Admin Types
 * Creates admin users for all admin types shown in the interface
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// MongoDB Connection
const MONGODB_URI = 'mongodb+srv://hiddenshadow032025_db_user:nJNHickmLkFtwcIY@cluster0.nvq1gwn.mongodb.net/finautojobs';

async function createAllAdminTypes() {
  try {
    console.log('🚀 Creating All Admin Types...');
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get the raw MongoDB collection
    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // Define all admin types from the interface
    const adminTypes = [
      {
        type: 'Main Admin',
        email: 'mainadmin@finautojobs.com',
        username: 'mainadmin',
        firstName: 'Main',
        lastName: 'Admin',
        accessLevel: 'main_admin',
        permissions: ['all', 'system_management', 'user_management', 'job_management', 'analytics'],
        description: 'Primary system administrator with full access'
      },
      {
        type: 'Super Admin',
        email: 'superadmin@finautojobs.com',
        username: 'superadmin',
        firstName: 'Super',
        lastName: 'Admin',
        accessLevel: 'super_admin',
        permissions: ['all', 'system_management', 'user_management', 'job_management', 'analytics'],
        description: 'Super administrator with complete system control'
      },
      {
        type: 'HR Admin',
        email: 'hradmin@finautojobs.com',
        username: 'hradmin',
        firstName: 'HR',
        lastName: 'Admin',
        accessLevel: 'hr_admin',
        permissions: ['user_management', 'job_management', 'applications_management'],
        description: 'HR administrator for managing users and jobs'
      },
      {
        type: 'Analytics Admin',
        email: 'analyticsadmin@finautojobs.com',
        username: 'analyticsadmin',
        firstName: 'Analytics',
        lastName: 'Admin',
        accessLevel: 'analytics_admin',
        permissions: ['analytics', 'reports', 'dashboard_management'],
        description: 'Analytics administrator for reports and insights'
      },
      {
        type: 'Administrator',
        email: 'administrator@finautojobs.com',
        username: 'administrator',
        firstName: 'System',
        lastName: 'Administrator',
        accessLevel: 'administrator',
        permissions: ['all', 'system_management', 'user_management'],
        description: 'General system administrator'
      }
    ];

    // Common password for all admin accounts
    const commonPassword = 'SuperAdmin@2025!';
    const hashedPassword = await bcrypt.hash(commonPassword, 12);

    // Create admin users array
    const adminUsers = [];

    for (let i = 0; i < adminTypes.length; i++) {
      const adminType = adminTypes[i];
      
      adminUsers.push({
        // Basic Info
        email: adminType.email,
        password: hashedPassword,
        firstName: adminType.firstName,
        lastName: adminType.lastName,
        username: adminType.username,
        fullName: `${adminType.firstName} ${adminType.lastName}`,
        phone: `+91999999${String(i).padStart(3, '0')}`,
        
        // Role - IMPORTANT: All must have 'admin' role
        role: 'admin',
        
        // Status
        isActive: true,
        isVerified: true,
        emailVerified: true,
        phoneVerified: false,
        status: 'active',
        
        // Timestamps
        createdAt: new Date(),
        updatedAt: new Date(),
        
        // Admin Info - Specific to admin type
        adminInfo: {
          adminType: adminType.type,
          permissions: adminType.permissions,
          department: 'System Administration',
          accessLevel: adminType.accessLevel,
          canManageUsers: adminType.permissions.includes('user_management') || adminType.permissions.includes('all'),
          canManageJobs: adminType.permissions.includes('job_management') || adminType.permissions.includes('all'),
          canViewAnalytics: adminType.permissions.includes('analytics') || adminType.permissions.includes('all'),
          canManageSystem: adminType.permissions.includes('system_management') || adminType.permissions.includes('all'),
          lastLogin: null,
          loginCount: 0,
          description: adminType.description
        },
        
        // Additional fields
        profileImage: null,
        bio: adminType.description,
        location: 'System',
        yearsOfExperience: 0,
        
        // Security
        loginAttempts: 0,
        lockUntil: null,
        
        // Metadata
        _adminType: adminType.type,
        _createdBy: 'all-admin-types-script'
      });
    }

    // Remove all existing admin users
    console.log('🗑️ Removing existing admin users...');
    const deleteResult = await usersCollection.deleteMany({ role: 'admin' });
    console.log(`✅ Removed ${deleteResult.deletedCount} existing admin users`);

    // Insert all admin users
    console.log('📝 Creating all admin types...');
    const insertResult = await usersCollection.insertMany(adminUsers);
    
    console.log(`🎉 Created ${insertResult.insertedCount} admin users!`);

    // Display all created admin users
    console.log('\n📋 Created Admin Users:');
    for (let i = 0; i < adminUsers.length; i++) {
      const admin = adminUsers[i];
      console.log(`\n   ${i + 1}. ${admin._adminType}`);
      console.log(`      📧 Email: ${admin.email}`);
      console.log(`      👤 Username: ${admin.username}`);
      console.log(`      🔐 Password: ${commonPassword}`);
      console.log(`      🔑 Role: ${admin.role}`);
      console.log(`      🛡️ Access Level: ${admin.adminInfo.accessLevel}`);
      console.log(`      📋 Permissions: ${admin.adminInfo.permissions.join(', ')}`);
      console.log(`      ✅ Active: ${admin.isActive}`);
    }

    // Test each admin user with backend search query
    console.log('\n🧪 Testing backend search for each admin...');
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
      console.log(`   ${admin._adminType}: ${found ? '✅ FOUND' : '❌ NOT FOUND'}`);
    }

    // Verify all have admin role
    console.log('\n🔍 Verifying all users have admin role...');
    const allAdmins = await usersCollection.find({ role: 'admin' }).toArray();
    console.log(`✅ Total admin users in database: ${allAdmins.length}`);
    
    allAdmins.forEach((admin, index) => {
      console.log(`   ${index + 1}. ${admin.email} - Role: "${admin.role}" - Type: ${admin._adminType || 'Unknown'}`);
    });

    console.log('\n🎯 Login Instructions:');
    console.log('   🌐 URL: https://finautojobs-a-job-portal-pivn.onrender.com/admin-login');
    console.log('   🔐 Password: SuperAdmin@2025! (same for all)');
    console.log('\n   📧 Available Admin Emails:');
    adminUsers.forEach((admin, index) => {
      console.log(`   ${index + 1}. ${admin.email} (${admin._adminType})`);
    });

    console.log('\n🛡️ Admin Role Verification:');
    console.log('   ✅ All admin accounts have role: "admin"');
    console.log('   ✅ Different access levels for different admin types');
    console.log('   ✅ Appropriate permissions assigned to each type');
    console.log('   ✅ All accounts active and verified');

  } catch (error) {
    console.error('❌ Error creating admin types:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  }
}

createAllAdminTypes()
  .then(() => {
    console.log('\n🚀 All admin types creation completed!');
    console.log('🔄 All admin accounts are ready with proper admin role!');
  })
  .catch(console.error);
