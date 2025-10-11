#!/usr/bin/env node

/**
 * Fix Admin User Script
 * Ensures admin user is properly created with correct model structure
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { BaseUser, Admin } from '../models/UserModels.js';

// MongoDB Connection
const MONGODB_URI = 'mongodb+srv://hiddenshadow032025_db_user:nJNHickmLkFtwcIY@cluster0.nvq1gwn.mongodb.net/finautojobs?retryWrites=true&w=majority&appName=Cluster0';

// Admin Configuration
const ADMIN_CONFIG = {
  email: 'hiddenshadow032025@gmail.com',
  password: 'SuperAdmin@2025!',
  firstName: 'Super',
  lastName: 'Admin',
  username: 'superadmin',
  phone: '+919999999999', // Required field
  role: 'admin'
};

async function fixAdminUser() {
  try {
    console.log('🔧 Fixing Admin User...');
    
    // Connect to MongoDB
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected successfully');

    // Find existing admin user
    console.log('🔍 Looking for existing admin user...');
    const existingAdmin = await BaseUser.findOne({ 
      email: ADMIN_CONFIG.email 
    });

    if (existingAdmin) {
      console.log('⚠️ Found existing admin user');
      console.log('📧 Email:', existingAdmin.email);
      console.log('🔑 Role:', existingAdmin.role);
      console.log('🆔 ID:', existingAdmin._id);
      console.log('📋 Model:', existingAdmin.constructor.modelName);
      
      // Check if it has comparePassword method
      console.log('🔍 Testing comparePassword method...');
      try {
        const hasMethod = typeof existingAdmin.comparePassword === 'function';
        console.log('🔧 Has comparePassword method:', hasMethod);
        
        if (hasMethod) {
          const passwordTest = await existingAdmin.comparePassword(ADMIN_CONFIG.password);
          console.log('🔐 Password test result:', passwordTest);
          
          if (passwordTest) {
            console.log('✅ Admin user is working correctly!');
            console.log('⚠️ The issue might be elsewhere in the authentication flow');
            return existingAdmin;
          }
        }
      } catch (error) {
        console.log('❌ Error testing comparePassword:', error.message);
      }
      
      console.log('🗑️ Removing existing admin user to recreate properly...');
      await BaseUser.findByIdAndDelete(existingAdmin._id);
    }

    // Create new admin with proper Admin model (password will be hashed by pre-save hook)
    console.log('👤 Creating new admin user with Admin model...');
    const newAdmin = new Admin({
      email: ADMIN_CONFIG.email,
      password: ADMIN_CONFIG.password, // Let the pre-save hook hash this
      firstName: ADMIN_CONFIG.firstName,
      lastName: ADMIN_CONFIG.lastName,
      username: ADMIN_CONFIG.username,
      phone: ADMIN_CONFIG.phone,
      // role is automatically set by Admin discriminator
      fullName: `${ADMIN_CONFIG.firstName} ${ADMIN_CONFIG.lastName}`,
      isActive: true,
      isVerified: true,
      isEmailVerified: true,
      emailVerified: true,
      phoneVerified: false,
      
      // Admin-specific fields
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
      
      adminActivity: {
        actionsPerformed: [],
        lastActiveDate: new Date()
      },
      
      adminPreferences: {
        dashboardLayout: 'grid',
        notificationSettings: {
          emailNotifications: true,
          systemAlerts: true,
          userRegistrations: true,
          jobPostings: true
        },
        defaultFilters: {
          userStatus: 'all',
          jobStatus: 'all',
          dateRange: 'month'
        }
      }
    });

    // Save to database
    console.log('💾 Saving admin user...');
    await newAdmin.save();

    console.log('🎉 Admin user fixed successfully!');
    console.log('\n📊 Admin Details:');
    console.log('   📧 Email:', newAdmin.email);
    console.log('   👤 Name:', `${newAdmin.firstName} ${newAdmin.lastName}`);
    console.log('   🆔 Username:', newAdmin.username);
    console.log('   📱 Phone:', newAdmin.phone);
    console.log('   🔑 Role:', newAdmin.role);
    console.log('   📋 Model:', newAdmin.constructor.modelName);
    console.log('   🆔 MongoDB ID:', newAdmin._id);

    // Test the comparePassword method
    console.log('\n🧪 Testing comparePassword method...');
    const passwordTest = await newAdmin.comparePassword(ADMIN_CONFIG.password);
    console.log('🔐 Password test result:', passwordTest);

    console.log('\n🛡️ Admin Info:');
    console.log('   🔑 Access Level:', newAdmin.adminInfo.accessLevel);
    console.log('   📋 Permissions:', newAdmin.adminInfo.permissions);
    console.log('   👥 Can Manage Users:', newAdmin.adminInfo.canManageUsers);

    console.log('\n🔒 SECURITY NOTICE:');
    console.log('   🔐 Password:', ADMIN_CONFIG.password);
    console.log('   ⚠️ Please change after first login!');

    return newAdmin;

  } catch (error) {
    console.error('❌ Error fixing admin user:', error);
    throw error;
  } finally {
    console.log('\n🔄 Closing database connection...');
    await mongoose.connection.close();
    console.log('✅ Connection closed');
  }
}

// Run the script
fixAdminUser()
  .then(() => {
    console.log('\n🎯 Admin user fix completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Admin user fix failed:', error.message);
    process.exit(1);
  });
