#!/usr/bin/env node

/**
 * Simple Super Admin Creation Script
 * Creates a super admin account directly in MongoDB
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// MongoDB Connection
const MONGODB_URI = 'mongodb+srv://hiddenshadow032025_db_user:nJNHickmLkFtwcIY@cluster0.nvq1gwn.mongodb.net/finautojobs?retryWrites=true&w=majority&appName=Cluster0';

// Super Admin Configuration
const ADMIN_CONFIG = {
  email: 'hiddenshadow032025@gmail.com',
  password: 'SuperAdmin@2025!',
  firstName: 'Super',
  lastName: 'Admin',
  username: 'superadmin',
  role: 'admin'
};

async function createAdmin() {
  try {
    console.log('🚀 Creating Super Admin Account...');
    
    // Connect to MongoDB
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected successfully');

    // Define a simple user schema for direct insertion
    const userSchema = new mongoose.Schema({
      email: String,
      password: String,
      firstName: String,
      lastName: String,
      username: String,
      role: String,
      isActive: { type: Boolean, default: true },
      isVerified: { type: Boolean, default: true },
      emailVerified: { type: Boolean, default: true },
      phoneVerified: { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now },
      
      // Admin-specific fields
      adminInfo: {
        permissions: [String],
        department: String,
        accessLevel: String,
        canManageUsers: Boolean,
        canManageJobs: Boolean,
        canViewAnalytics: Boolean,
        canManageSystem: Boolean,
        lastLogin: Date,
        loginCount: { type: Number, default: 0 }
      }
    });

    const User = mongoose.model('User', userSchema);

    // Check if admin already exists
    console.log('🔍 Checking for existing admin...');
    const existingAdmin = await User.findOne({ email: ADMIN_CONFIG.email });

    if (existingAdmin) {
      console.log('⚠️ Admin already exists!');
      console.log('📧 Email:', existingAdmin.email);
      console.log('👤 Name:', `${existingAdmin.firstName} ${existingAdmin.lastName}`);
      console.log('🔑 Role:', existingAdmin.role);
      console.log('🆔 ID:', existingAdmin._id);
      
      // Update existing user to admin
      existingAdmin.role = 'admin';
      existingAdmin.isActive = true;
      existingAdmin.isVerified = true;
      existingAdmin.emailVerified = true;
      existingAdmin.adminInfo = {
        permissions: ['all'],
        department: 'System Administration',
        accessLevel: 'super_admin',
        canManageUsers: true,
        canManageJobs: true,
        canViewAnalytics: true,
        canManageSystem: true,
        loginCount: 0
      };
      existingAdmin.updatedAt = new Date();
      
      await existingAdmin.save();
      console.log('✅ Updated existing user to Super Admin!');
      return existingAdmin;
    }

    // Hash password
    console.log('🔐 Hashing password...');
    const hashedPassword = await bcrypt.hash(ADMIN_CONFIG.password, 12);

    // Create new admin
    console.log('👤 Creating new admin user...');
    const newAdmin = new User({
      email: ADMIN_CONFIG.email,
      password: hashedPassword,
      firstName: ADMIN_CONFIG.firstName,
      lastName: ADMIN_CONFIG.lastName,
      username: ADMIN_CONFIG.username,
      role: ADMIN_CONFIG.role,
      isActive: true,
      isVerified: true,
      emailVerified: true,
      phoneVerified: false,
      adminInfo: {
        permissions: ['all'],
        department: 'System Administration',
        accessLevel: 'super_admin',
        canManageUsers: true,
        canManageJobs: true,
        canViewAnalytics: true,
        canManageSystem: true,
        loginCount: 0
      }
    });

    // Save to database
    console.log('💾 Saving to database...');
    await newAdmin.save();

    console.log('🎉 Super Admin created successfully!');
    console.log('\n📊 Admin Details:');
    console.log('   📧 Email:', newAdmin.email);
    console.log('   👤 Name:', `${newAdmin.firstName} ${newAdmin.lastName}`);
    console.log('   🆔 Username:', newAdmin.username);
    console.log('   🔑 Role:', newAdmin.role);
    console.log('   🔐 Password:', ADMIN_CONFIG.password);
    console.log('   📅 Created:', newAdmin.createdAt);
    console.log('   🆔 MongoDB ID:', newAdmin._id);

    console.log('\n🛡️ Admin Permissions:');
    console.log('   🔑 Access Level: super_admin');
    console.log('   📋 Permissions: all');
    console.log('   👥 Manage Users: true');
    console.log('   💼 Manage Jobs: true');
    console.log('   📊 View Analytics: true');
    console.log('   ⚙️ Manage System: true');

    console.log('\n🔒 SECURITY NOTICE:');
    console.log('   ⚠️ Please change the default password after first login!');
    console.log('   🔐 Default Password:', ADMIN_CONFIG.password);
    console.log('   🌐 Login at: /login (use admin role)');

    return newAdmin;

  } catch (error) {
    console.error('❌ Error creating admin:', error);
    throw error;
  } finally {
    console.log('\n🔄 Closing database connection...');
    await mongoose.connection.close();
    console.log('✅ Connection closed');
  }
}

// Run the script
createAdmin()
  .then(() => {
    console.log('\n🎯 Admin creation completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Admin creation failed:', error.message);
    process.exit(1);
  });
