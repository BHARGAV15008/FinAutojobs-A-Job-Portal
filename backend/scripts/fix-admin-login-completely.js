#!/usr/bin/env node

/**
 * Fix Admin Login Completely
 * Comprehensive fix for all admin login issues
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// MongoDB Connection
const MONGODB_URI = 'mongodb+srv://hiddenshadow032025_db_user:nJNHickmLkFtwcIY@cluster0.nvq1gwn.mongodb.net/finautojobs';

async function fixAdminLoginCompletely() {
  try {
    console.log('🔧 Fixing Admin Login Completely...');
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get the database instance
    const db = mongoose.connection.db;
    const baseUsersCollection = db.collection('baseusers');

    console.log('\n🔍 Step 1: Analyzing current admin users...');
    const currentAdmins = await baseUsersCollection.find({
      role: { $regex: /^admin$/i }
    }).toArray();
    
    console.log(`Found ${currentAdmins.length} admin users with case-insensitive search`);
    
    // Fix role case for all admin users
    console.log('\n🔧 Step 2: Standardizing admin roles to lowercase...');
    const updateResult = await baseUsersCollection.updateMany(
      { role: { $regex: /^admin$/i } },
      { $set: { role: 'admin' } }
    );
    console.log(`✅ Updated ${updateResult.modifiedCount} admin users to lowercase 'admin' role`);

    // Create/update standard admin accounts
    console.log('\n📝 Step 3: Creating/updating standard admin accounts...');
    
    const adminAccounts = [
      {
        email: 'admin@admin.com',
        password: 'admin123',
        firstName: 'Admin',
        lastName: 'User',
        username: 'admin'
      },
      {
        email: 'superadmin@finautojobs.com',
        password: 'SuperAdmin@2025!',
        firstName: 'Super',
        lastName: 'Admin',
        username: 'superadmin2'
      },
      {
        email: 'hiddenshadow032025@gmail.com',
        password: 'SuperAdmin@2025!',
        firstName: 'System',
        lastName: 'Admin',
        username: 'hiddenshadow'
      }
    ];

    for (const adminData of adminAccounts) {
      const existingUser = await baseUsersCollection.findOne({ 
        email: adminData.email 
      });

      const hashedPassword = await bcrypt.hash(adminData.password, 12);

      if (existingUser) {
        // Update existing user
        await baseUsersCollection.updateOne(
          { email: adminData.email },
          { 
            $set: { 
              password: hashedPassword,
              role: 'admin', // Ensure lowercase
              isActive: true,
              status: 'active',
              isVerified: true,
              isEmailVerified: true,
              updatedAt: new Date()
            }
          }
        );
        console.log(`   ✅ Updated: ${adminData.email}`);
      } else {
        // Create new user
        const newAdmin = {
          firstName: adminData.firstName,
          lastName: adminData.lastName,
          username: adminData.username,
          email: adminData.email,
          phone: `+919999999${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
          password: hashedPassword,
          fullName: `${adminData.firstName} ${adminData.lastName}`,
          role: 'admin', // Lowercase
          status: 'active',
          isActive: true,
          isVerified: true,
          isEmailVerified: true,
          isPhoneVerified: false,
          isDeleted: false,
          userId: new mongoose.Types.ObjectId(),
          loginAttempts: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
          address: {},
          socialLinks: {},
          yearsOfExperience: 0,
          currentLocation: {},
          careerInfo: {},
          skills: {},
          education: {},
          documents: {},
          jobPreferences: {},
          profileCompletion: {},
          appliedJobs: [],
          savedJobs: [],
          scheduledInterviews: [],
          languages: [],
          workExperience: {},
          oauthProviders: [],
          activeSessions: [],
          _createdBy: 'complete-fix-script'
        };

        await baseUsersCollection.insertOne(newAdmin);
        console.log(`   ✅ Created: ${adminData.email}`);
      }
    }

    console.log('\n🧪 Step 4: Testing all admin accounts...');
    
    for (const adminData of adminAccounts) {
      // Test exact backend authentication query (with lowercase role)
      const backendQuery = {
        $and: [
          {
            $or: [
              { email: adminData.email.toLowerCase() },
              { username: adminData.email.toLowerCase() },
              { phone: adminData.email }
            ]
          },
          { role: 'admin' } // Lowercase role
        ]
      };

      const user = await baseUsersCollection.findOne(backendQuery);
      if (user) {
        const passwordMatch = await bcrypt.compare(adminData.password, user.password);
        console.log(`   ${adminData.email}: ${user ? '✅ FOUND' : '❌ NOT FOUND'} | Password: ${passwordMatch ? '✅ CORRECT' : '❌ INCORRECT'}`);
      } else {
        console.log(`   ${adminData.email}: ❌ NOT FOUND`);
      }
    }

    // Final verification
    console.log('\n📊 Step 5: Final verification...');
    const allAdmins = await baseUsersCollection.find({ role: 'admin' }).toArray();
    console.log(`✅ Total admin users with lowercase 'admin' role: ${allAdmins.length}`);
    
    allAdmins.forEach((admin, index) => {
      console.log(`   ${index + 1}. ${admin.email} (${admin.firstName} ${admin.lastName})`);
      console.log(`      Role: "${admin.role}" | Active: ${admin.isActive} | Status: ${admin.status}`);
    });

    console.log('\n🎯 Ready Admin Credentials:');
    adminAccounts.forEach((admin, index) => {
      console.log(`   ${index + 1}. Email: ${admin.email}`);
      console.log(`      Password: ${admin.password}`);
      console.log(`      Role: admin (lowercase)`);
    });

    console.log('\n🚀 Admin Login URLs:');
    console.log('   Local: http://192.168.41.134:3000/admin-login');
    console.log('   Deployed: https://finautojobs-a-job-portal-pivn.onrender.com/admin-login');

  } catch (error) {
    console.error('❌ Error fixing admin login:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  }
}

fixAdminLoginCompletely()
  .then(() => {
    console.log('\n🎉 Admin login fix completed successfully!');
    console.log('🔧 All admin users now have lowercase "admin" role');
    console.log('🎯 Try logging in with any of the credentials above');
  })
  .catch(console.error);
