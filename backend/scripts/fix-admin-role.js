#!/usr/bin/env node

/**
 * Fix Admin Role Case
 * Updates admin user role from "Admin" to "admin"
 */

import mongoose from 'mongoose';

// MongoDB Connection
const MONGODB_URI = 'mongodb+srv://hiddenshadow032025_db_user:nJNHickmLkFtwcIY@cluster0.nvq1gwn.mongodb.net/finautojobs?retryWrites=true&w=majority&appName=Cluster0';

async function fixAdminRole() {
  try {
    console.log('🔧 Fixing Admin Role Case...');
    
    // Connect to MongoDB
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected successfully');

    // Define a basic schema for direct updates
    const userSchema = new mongoose.Schema({}, { strict: false });
    const User = mongoose.model('User', userSchema);

    // Find admin user by email (regardless of role case)
    console.log('🔍 Looking for admin user by email...');
    const adminUser = await User.findOne({ 
      email: 'hiddenshadow032025@gmail.com'
    });

    if (!adminUser) {
      console.log('❌ Admin user not found');
      return;
    }

    console.log('✅ Found admin user with capital role');
    console.log('📧 Email:', adminUser.email);
    console.log('🔑 Current Role:', adminUser.role);
    console.log('🆔 ID:', adminUser._id);

    // Update role to lowercase
    console.log('🔄 Updating role to lowercase...');
    const result = await User.updateOne(
      { _id: adminUser._id },
      { $set: { role: 'admin' } } // lowercase a
    );

    console.log('📊 Update result:', result);

    if (result.modifiedCount > 0) {
      console.log('✅ Admin role updated successfully!');
      
      // Verify the update
      const updatedUser = await User.findById(adminUser._id);
      console.log('🔍 Verification - New role:', updatedUser.role);
      
      // Test the backend search logic
      console.log('\n🧪 Testing backend search logic...');
      const searchResult = await User.findOne({
        $and: [
          {
            $or: [
              { email: 'hiddenshadow032025@gmail.com' },
              { username: 'hiddenshadow032025@gmail.com' },
              { phone: 'hiddenshadow032025@gmail.com' }
            ]
          },
          { role: 'admin' }
        ]
      });

      if (searchResult) {
        console.log('✅ Backend search logic now works!');
        console.log('📧 Found user:', searchResult.email);
        console.log('🔑 Role:', searchResult.role);
      } else {
        console.log('❌ Backend search logic still not working');
      }

    } else {
      console.log('❌ No documents were modified');
    }

  } catch (error) {
    console.error('❌ Error fixing admin role:', error);
  } finally {
    console.log('\n🔄 Closing database connection...');
    await mongoose.connection.close();
    console.log('✅ Connection closed');
  }
}

// Run the fix
fixAdminRole()
  .then(() => {
    console.log('\n🎯 Admin role fix completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Admin role fix failed:', error.message);
    process.exit(1);
  });
