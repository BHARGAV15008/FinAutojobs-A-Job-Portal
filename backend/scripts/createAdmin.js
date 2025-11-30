import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Configure dotenv
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

// Import BaseUser model
import { BaseUser } from '../models/UserModels.js';

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://192.168.41.134:27017/finauto_jobs', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Create admin user
const createAdminUser = async () => {
  try {
    // Check if admin already exists
    const existingAdmin = await BaseUser.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('⚠️ Admin user already exists:', existingAdmin.email);
      return existingAdmin;
    }

    // Admin user data
    const adminData = {
      firstName: 'Admin',
      lastName: 'User',
      username: 'admin',
      email: 'admin@finautojobs.com',
      phone: '+91 98765 43210',
      password: 'admin123', // This will be hashed
      role: 'admin',
      bio: 'System Administrator for FinAutoJobs platform',
      location: 'Mumbai, Maharashtra',
      address: {
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
        postalCode: '400001'
      },
      isEmailVerified: true,
      isPhoneVerified: true,
      status: 'active',
      adminInfo: {
        permissions: ['all'],
        department: 'IT Administration',
        accessLevel: 'super_admin',
        canManageUsers: true,
        canManageJobs: true,
        canViewAnalytics: true,
        canManageSystem: true
      }
    };

    // Hash password
    const salt = await bcrypt.genSalt(10);
    adminData.password = await bcrypt.hash(adminData.password, salt);

    // Create admin user
    const adminUser = new BaseUser(adminData);
    await adminUser.save();

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email:', adminUser.email);
    console.log('🔑 Password: admin123');
    console.log('👤 Username:', adminUser.username);
    console.log('🆔 User ID:', adminUser._id);

    return adminUser;
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    throw error;
  }
};

// Create multiple admin users if needed
const createMultipleAdmins = async () => {
  const admins = [
    {
      firstName: 'Super',
      lastName: 'Admin',
      username: 'superadmin',
      email: 'superadmin@finautojobs.com',
      phone: '+91 98765 43211',
      password: 'superadmin123',
      role: 'admin',
      bio: 'Super Administrator with full system access',
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
      firstName: 'HR',
      lastName: 'Admin',
      username: 'hradmin',
      email: 'hr@finautojobs.com',
      phone: '+91 98765 43212',
      password: 'hradmin123',
      role: 'admin',
      bio: 'HR Administrator for user and job management',
      adminInfo: {
        permissions: ['users', 'jobs', 'analytics'],
        accessLevel: 'admin',
        canManageUsers: true,
        canManageJobs: true,
        canViewAnalytics: true,
        canManageSystem: false
      }
    },
    {
      firstName: 'Analytics',
      lastName: 'Admin',
      username: 'analyticsadmin',
      email: 'analytics@finautojobs.com',
      phone: '+91 98765 43213',
      password: 'analytics123',
      role: 'admin',
      bio: 'Analytics Administrator for reports and insights',
      adminInfo: {
        permissions: ['analytics', 'reports'],
        accessLevel: 'admin',
        canManageUsers: false,
        canManageJobs: false,
        canViewAnalytics: true,
        canManageSystem: false
      }
    }
  ];

  for (const adminData of admins) {
    try {
      // Check if admin already exists
      const existingAdmin = await BaseUser.findOne({ 
        $or: [
          { email: adminData.email },
          { username: adminData.username }
        ]
      });

      if (existingAdmin) {
        console.log(`⚠️ Admin already exists: ${adminData.email}`);
        continue;
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      adminData.password = await bcrypt.hash(adminData.password, salt);

      // Set common fields
      adminData.location = 'Mumbai, Maharashtra';
      adminData.address = {
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
        postalCode: '400001'
      };
      adminData.isEmailVerified = true;
      adminData.isPhoneVerified = true;
      adminData.status = 'active';

      // Create admin user
      const adminUser = new BaseUser(adminData);
      await adminUser.save();

      console.log(`✅ Admin created: ${adminData.email} (${adminData.username})`);
    } catch (error) {
      console.error(`❌ Error creating admin ${adminData.email}:`, error.message);
    }
  }
};

// Main execution
const main = async () => {
  try {
    await connectDB();
    
    console.log('🚀 Creating admin users...\n');
    
    // Create main admin
    await createAdminUser();
    
    console.log('\n🚀 Creating additional admin users...\n');
    
    // Create additional admins
    await createMultipleAdmins();
    
    console.log('\n✅ Admin creation process completed!');
    console.log('\n📋 Admin Login Credentials:');
    console.log('1. Main Admin:');
    console.log('   Email: admin@finautojobs.com');
    console.log('   Password: admin123');
    console.log('\n2. Super Admin:');
    console.log('   Email: superadmin@finautojobs.com');
    console.log('   Password: superadmin123');
    console.log('\n3. HR Admin:');
    console.log('   Email: hr@finautojobs.com');
    console.log('   Password: hradmin123');
    console.log('\n4. Analytics Admin:');
    console.log('   Email: analytics@finautojobs.com');
    console.log('   Password: analytics123');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Script execution failed:', error);
    process.exit(1);
  }
};

// Run the script
main();
