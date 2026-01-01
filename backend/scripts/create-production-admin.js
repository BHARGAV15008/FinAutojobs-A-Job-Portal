#!/usr/bin/env node

/**
 * Create Production Admin User
 * Creates admin user directly on production database using simple schema
 * This bypasses model issues and creates a working admin immediately
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// MongoDB Connection (same as production)
const MONGODB_URI = 'mongodb+srv://hiddenshadow032025_db_user:nJNHickmLkFtwcIY@cluster0.nvq1gwn.mongodb.net/finautojobs?retryWrites=true&w=majority&appName=Cluster0';

// Admin Configuration
const ADMIN_CONFIG = {
  email: 'hiddenshadow032025@gmail.com',
  password: 'SuperAdmin@2025!',
  firstName: 'Super',
  lastName: 'Admin',
  username: 'superadmin',
  phone: '+919999999999',
  role: 'admin' // lowercase to match backend expectations
};

async function createProductionAdmin() {
  try {
    console.log('🚀 Creating Production Admin User...');
    
    // Connect to MongoDB
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected successfully');

    // Use simple schema that matches exactly what backend expects
    const userSchema = new mongoose.Schema({
      email: { type: String, required: true, lowercase: true },
      password: { type: String, required: true },
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      username: { type: String, required: true, lowercase: true },
      phone: { type: String, required: true },
      role: { type: String, required: true },
      fullName: String,
      isActive: { type: Boolean, default: true },
      isVerified: { type: Boolean, default: true },
      emailVerified: { type: Boolean, default: true },
      phoneVerified: { type: Boolean, default: false },
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now },
      
      // Admin specific fields
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

    // Add comparePassword method
    userSchema.methods.comparePassword = async function(password) {
      return await bcrypt.compare(password, this.password);
    };

    // Add pre-save hook for password hashing
    userSchema.pre('save', async function(next) {
      if (!this.isModified('password')) return next();
      this.password = await bcrypt.hash(this.password, 12);
      next();
    });

    const User = mongoose.model('User', userSchema);

    // Remove any existing admin users first
    console.log('🗑️ Removing existing admin users...');
    await User.deleteMany({ email: ADMIN_CONFIG.email });
    console.log('✅ Existing admin users removed');

    // Create new admin user
    console.log('👤 Creating new production admin...');
    const adminUser = new User({
      email: ADMIN_CONFIG.email,
      password: ADMIN_CONFIG.password, // Will be hashed by pre-save hook
      firstName: ADMIN_CONFIG.firstName,
      lastName: ADMIN_CONFIG.lastName,
      username: ADMIN_CONFIG.username,
      phone: ADMIN_CONFIG.phone,
      role: ADMIN_CONFIG.role,
      fullName: `${ADMIN_CONFIG.firstName} ${ADMIN_CONFIG.lastName}`,
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
        lastLogin: null,
        loginCount: 0
      }
    });

    // Save to database
    console.log('💾 Saving admin user...');
    await adminUser.save();

    console.log('🎉 Production admin created successfully!');
    console.log('\n📊 Admin Details:');
    console.log('   📧 Email:', adminUser.email);
    console.log('   👤 Name:', adminUser.fullName);
    console.log('   🆔 Username:', adminUser.username);
    console.log('   📱 Phone:', adminUser.phone);
    console.log('   🔑 Role:', adminUser.role);
    console.log('   🆔 MongoDB ID:', adminUser._id);

    // Test password immediately
    console.log('\n🧪 Testing password verification...');
    const passwordTest = await adminUser.comparePassword(ADMIN_CONFIG.password);
    console.log('🔐 Password test result:', passwordTest);

    // Test the exact backend search query
    console.log('\n🔍 Testing backend search query...');
    const searchResult = await User.findOne({
      $and: [
        {
          $or: [
            { email: ADMIN_CONFIG.email.toLowerCase() },
            { username: ADMIN_CONFIG.email.toLowerCase() },
            { phone: ADMIN_CONFIG.email }
          ]
        },
        { role: 'admin' }
      ]
    });

    if (searchResult) {
      console.log('✅ Backend search query works!');
      console.log('   📧 Found:', searchResult.email);
      console.log('   🔑 Role:', searchResult.role);
      
      // Test password on found user
      const foundPasswordTest = await searchResult.comparePassword(ADMIN_CONFIG.password);
      console.log('   🔐 Password works:', foundPasswordTest);
    } else {
      console.log('❌ Backend search query failed');
    }

    console.log('\n🎯 Admin Login Ready:');
    console.log('   📧 Email:', ADMIN_CONFIG.email);
    console.log('   🔐 Password:', ADMIN_CONFIG.password);
    console.log('   🌐 URL: https://finautojobs-a-job-portal-pivn.onrender.com/admin-login');
    console.log('   ⚠️ Try logging in now - should work immediately!');

  } catch (error) {
    console.error('❌ Error creating production admin:', error);
    throw error;
  } finally {
    console.log('\n🔄 Closing database connection...');
    await mongoose.connection.close();
    console.log('✅ Connection closed');
  }
}

// Run the script
createProductionAdmin()
  .then(() => {
    console.log('\n🎯 Production admin creation completed!');
    console.log('🚀 Try logging in now - it should work immediately!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Production admin creation failed:', error.message);
    process.exit(1);
  });
