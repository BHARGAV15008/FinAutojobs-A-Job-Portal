#!/usr/bin/env node

/**
 * Create Super Admin Account Script
 * Creates a super admin account with full system privileges
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env') });

// Import user models
import { BaseUser, Applicant, Recruiter, Admin } from '../models/UserModels.js';

// Super Admin Configuration
const SUPER_ADMIN_CONFIG = {
  email: 'hiddenshadow032025@gmail.com',
  password: 'SuperAdmin@2025!', // Strong default password - CHANGE THIS!
  firstName: 'Super',
  lastName: 'Admin',
  username: 'superadmin',
  role: 'admin',
  isActive: true,
  isVerified: true,
  emailVerified: true,
  phoneVerified: false,
  createdBy: 'system',
  
  // Admin-specific configuration
  adminInfo: {
    permissions: ['all'], // All permissions
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
};

async function createSuperAdmin() {
  try {
    console.log('🚀 Starting Super Admin Creation Process...');
    
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 
                     process.env.DATABASE_URL || 
                     'mongodb+srv://hiddenshadow032025_db_user:nJNHickmLkFtwcIY@cluster0.nvq1gwn.mongodb.net/finautojobs?retryWrites=true&w=majority&appName=Cluster0';
    
    if (!mongoUri) {
      throw new Error('MongoDB URI not found in environment variables');
    }

    console.log('🔄 Connecting to MongoDB...');
    console.log('📍 MongoDB URI:', mongoUri.replace(/\/\/.*:.*@/, '//***:***@')); // Hide credentials
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB successfully');

    // Check if super admin already exists
    console.log('🔍 Checking if super admin already exists...');
    const existingAdmin = await BaseUser.findOne({ 
      email: SUPER_ADMIN_CONFIG.email 
    });

    if (existingAdmin) {
      console.log('⚠️ Super admin already exists with this email');
      console.log('📧 Email:', existingAdmin.email);
      console.log('👤 Role:', existingAdmin.role);
      console.log('🆔 ID:', existingAdmin._id);
      
      // Ask if user wants to update existing admin
      console.log('\n🔄 Updating existing admin to super admin status...');
      
      existingAdmin.role = 'admin';
      existingAdmin.isActive = true;
      existingAdmin.isVerified = true;
      existingAdmin.emailVerified = true;
      existingAdmin.updatedAt = new Date();
      
      // Update admin-specific fields if it's an admin
      if (existingAdmin.adminInfo) {
        existingAdmin.adminInfo.permissions = SUPER_ADMIN_CONFIG.adminInfo.permissions;
        existingAdmin.adminInfo.accessLevel = SUPER_ADMIN_CONFIG.adminInfo.accessLevel;
        existingAdmin.adminInfo.canManageUsers = SUPER_ADMIN_CONFIG.adminInfo.canManageUsers;
        existingAdmin.adminInfo.canManageJobs = SUPER_ADMIN_CONFIG.adminInfo.canManageJobs;
        existingAdmin.adminInfo.canViewAnalytics = SUPER_ADMIN_CONFIG.adminInfo.canViewAnalytics;
        existingAdmin.adminInfo.canManageSystem = SUPER_ADMIN_CONFIG.adminInfo.canManageSystem;
      }
      
      await existingAdmin.save();
      
      console.log('✅ Existing user updated to Super Admin successfully!');
      console.log('📊 Super Admin Details:');
      console.log('   📧 Email:', existingAdmin.email);
      console.log('   👤 Name:', `${existingAdmin.firstName} ${existingAdmin.lastName}`);
      console.log('   🆔 Username:', existingAdmin.username);
      console.log('   🔑 Role:', existingAdmin.role);
      console.log('   🛡️ Super Admin:', existingAdmin.isSuperAdmin);
      console.log('   📅 Updated:', existingAdmin.updatedAt);
      
      return existingAdmin;
    }

    // Hash password
    console.log('🔐 Hashing password...');
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(SUPER_ADMIN_CONFIG.password, saltRounds);

    // Create super admin user
    console.log('👤 Creating super admin user...');
    const superAdmin = new Admin({
      email: SUPER_ADMIN_CONFIG.email,
      password: hashedPassword,
      firstName: SUPER_ADMIN_CONFIG.firstName,
      lastName: SUPER_ADMIN_CONFIG.lastName,
      username: SUPER_ADMIN_CONFIG.username,
      role: SUPER_ADMIN_CONFIG.role,
      isActive: SUPER_ADMIN_CONFIG.isActive,
      isVerified: SUPER_ADMIN_CONFIG.isVerified,
      emailVerified: SUPER_ADMIN_CONFIG.emailVerified,
      phoneVerified: SUPER_ADMIN_CONFIG.phoneVerified,
      createdBy: SUPER_ADMIN_CONFIG.createdBy,
      adminInfo: SUPER_ADMIN_CONFIG.adminInfo,
      adminActivity: SUPER_ADMIN_CONFIG.adminActivity,
      adminPreferences: SUPER_ADMIN_CONFIG.adminPreferences,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Save to database
    console.log('💾 Saving to database...');
    await superAdmin.save();

    console.log('🎉 Super Admin created successfully!');
    console.log('\n📊 Super Admin Details:');
    console.log('   📧 Email:', superAdmin.email);
    console.log('   👤 Name:', `${superAdmin.firstName} ${superAdmin.lastName}`);
    console.log('   🆔 Username:', superAdmin.username);
    console.log('   🔑 Role:', superAdmin.role);
    console.log('   🛡️ Super Admin:', superAdmin.isSuperAdmin);
    console.log('   🔐 Password:', SUPER_ADMIN_CONFIG.password);
    console.log('   📅 Created:', superAdmin.createdAt);
    console.log('   🆔 MongoDB ID:', superAdmin._id);

    console.log('\n🔒 SECURITY NOTICE:');
    console.log('   ⚠️ Please change the default password after first login!');
    console.log('   🔐 Default Password:', SUPER_ADMIN_CONFIG.password);
    console.log('   🌐 Login URL: /admin/login');

    console.log('\n🛡️ Admin Permissions:');
    console.log(`   🔑 Access Level: ${superAdmin.adminInfo.accessLevel}`);
    console.log(`   📋 Permissions: ${superAdmin.adminInfo.permissions.join(', ')}`);
    console.log(`   👥 Manage Users: ${superAdmin.adminInfo.canManageUsers}`);
    console.log(`   💼 Manage Jobs: ${superAdmin.adminInfo.canManageJobs}`);
    console.log(`   📊 View Analytics: ${superAdmin.adminInfo.canViewAnalytics}`);
    console.log(`   ⚙️ Manage System: ${superAdmin.adminInfo.canManageSystem}`);

    return superAdmin;

  } catch (error) {
    console.error('❌ Error creating super admin:', error);
    throw error;
  } finally {
    // Close database connection
    console.log('\n🔄 Closing database connection...');
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
  }
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
  createSuperAdmin()
    .then(() => {
      console.log('\n🎯 Super Admin creation completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Super Admin creation failed:', error.message);
      process.exit(1);
    });
}

export default createSuperAdmin;
