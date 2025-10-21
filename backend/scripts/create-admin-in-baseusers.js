#!/usr/bin/env node

/**
 * Create Admin in BaseUsers Collection
 * Creates admin users in the correct 'baseusers' collection that the backend actually uses
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// MongoDB Connection
const MONGODB_URI = 'mongodb+srv://hiddenshadow032025_db_user:nJNHickmLkFtwcIY@cluster0.nvq1gwn.mongodb.net/finautojobs';

async function createAdminInBaseUsers() {
  try {
    console.log('🚀 Creating Admin in BaseUsers Collection...');
    
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get the raw MongoDB collection (the one backend actually uses)
    const db = mongoose.connection.db;
    const baseUsersCollection = db.collection('baseusers');

    console.log('\n📊 Current BaseUsers Collection Status:');
    const currentUsers = await baseUsersCollection.find({}).toArray();
    console.log(`   Total users: ${currentUsers.length}`);
    
    // Show current users by role
    const roleStats = {};
    currentUsers.forEach(user => {
      roleStats[user.role] = (roleStats[user.role] || 0) + 1;
    });
    
    console.log('   Users by role:');
    Object.entries(roleStats).forEach(([role, count]) => {
      console.log(`      ${role}: ${count}`);
    });

    // Check if there are existing admin users
    const existingAdmins = await baseUsersCollection.find({ role: 'Admin' }).toArray();
    console.log(`\n🔍 Existing Admin users: ${existingAdmins.length}`);
    
    if (existingAdmins.length > 0) {
      console.log('   Existing admin accounts:');
      existingAdmins.forEach((admin, index) => {
        console.log(`      ${index + 1}. ${admin.email} (${admin.firstName} ${admin.lastName})`);
      });
    }

    // Create multiple admin users with different credentials
    const adminUsers = [
      {
        email: 'admin@admin.com',
        password: 'admin123',
        firstName: 'Simple',
        lastName: 'Admin',
        username: 'admin'
      },
      {
        email: 'superadmin@finautojobs.com',
        password: 'SuperAdmin@2025!',
        firstName: 'Super',
        lastName: 'Admin',
        username: 'superadmin'
      },
      {
        email: 'mainadmin@finautojobs.com',
        password: 'SuperAdmin@2025!',
        firstName: 'Main',
        lastName: 'Admin',
        username: 'mainadmin'
      }
    ];

    console.log('\n📝 Creating admin users in baseusers collection...');

    for (let i = 0; i < adminUsers.length; i++) {
      const adminData = adminUsers[i];
      
      // Check if user already exists
      const existingUser = await baseUsersCollection.findOne({ 
        $or: [
          { email: adminData.email },
          { username: adminData.username }
        ]
      });

      if (existingUser) {
        console.log(`   ⚠️ User ${adminData.email} already exists, updating password...`);
        
        // Update existing user's password
        const hashedPassword = await bcrypt.hash(adminData.password, 12);
        await baseUsersCollection.updateOne(
          { _id: existingUser._id },
          { 
            $set: { 
              password: hashedPassword,
              role: 'Admin', // Ensure role is Admin
              isActive: true,
              status: 'active',
              updatedAt: new Date()
            }
          }
        );
        console.log(`   ✅ Updated ${adminData.email}`);
      } else {
        // Create new admin user
        const hashedPassword = await bcrypt.hash(adminData.password, 12);
        
        const newAdmin = {
          // Basic Info
          firstName: adminData.firstName,
          lastName: adminData.lastName,
          username: adminData.username,
          email: adminData.email,
          phone: `+91999999${String(i).padStart(3, '0')}`,
          password: hashedPassword,
          fullName: `${adminData.firstName} ${adminData.lastName}`,
          
          // Role & Status
          role: 'Admin', // Note: Capital 'A' as seen in existing data
          status: 'active',
          isActive: true,
          isVerified: true,
          isEmailVerified: true,
          isPhoneVerified: false,
          isDeleted: false,
          
          // IDs
          userId: new mongoose.Types.ObjectId(),
          
          // Security
          loginAttempts: 0,
          
          // Timestamps
          createdAt: new Date(),
          updatedAt: new Date(),
          
          // Additional fields to match existing structure
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
          
          // Admin specific
          _createdBy: 'baseusers-admin-script'
        };

        const result = await baseUsersCollection.insertOne(newAdmin);
        console.log(`   ✅ Created ${adminData.email} with ID: ${result.insertedId}`);
      }
    }

    // Verify all admin users
    console.log('\n🧪 Verifying admin users in baseusers collection...');
    const allAdmins = await baseUsersCollection.find({ role: 'Admin' }).toArray();
    
    console.log(`✅ Total Admin users: ${allAdmins.length}`);
    allAdmins.forEach((admin, index) => {
      console.log(`   ${index + 1}. ${admin.email} (${admin.firstName} ${admin.lastName})`);
      console.log(`      Username: ${admin.username}`);
      console.log(`      Active: ${admin.isActive}`);
      console.log(`      Status: ${admin.status}`);
    });

    // Test backend authentication queries
    console.log('\n🔍 Testing backend authentication queries...');
    
    for (const adminData of adminUsers) {
      const backendQuery = {
        $and: [
          {
            $or: [
              { email: adminData.email },
              { username: adminData.email },
              { phone: adminData.email }
            ]
          },
          { role: 'Admin' }
        ]
      };

      const found = await baseUsersCollection.findOne(backendQuery);
      console.log(`   ${adminData.email}: ${found ? '✅ FOUND' : '❌ NOT FOUND'}`);
      
      if (found) {
        // Test password verification
        const passwordMatch = await bcrypt.compare(adminData.password, found.password);
        console.log(`      Password verification: ${passwordMatch ? '✅ CORRECT' : '❌ INCORRECT'}`);
      }
    }

    console.log('\n🎯 Admin Login Credentials (for baseusers collection):');
    adminUsers.forEach((admin, index) => {
      console.log(`   ${index + 1}. Email: ${admin.email}`);
      console.log(`      Password: ${admin.password}`);
      console.log(`      Role: Admin`);
    });

  } catch (error) {
    console.error('❌ Error creating admin in baseusers:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  }
}

createAdminInBaseUsers()
  .then(() => {
    console.log('\n🚀 Admin creation in baseusers collection completed!');
    console.log('🎯 Try logging in with any of the admin credentials above');
  })
  .catch(console.error);
