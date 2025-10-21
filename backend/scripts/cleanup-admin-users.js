#!/usr/bin/env node

/**
 * Cleanup Admin Users
 * Removes duplicate admin users and ensures only one correct admin exists
 */

import mongoose from 'mongoose';

// MongoDB Connection
const MONGODB_URI = 'mongodb+srv://hiddenshadow032025_db_user:nJNHickmLkFtwcIY@cluster0.nvq1gwn.mongodb.net/finautojobs?retryWrites=true&w=majority&appName=Cluster0';

async function cleanupAdminUsers() {
  try {
    console.log('🧹 Cleaning up Admin Users...');
    
    // Connect to MongoDB
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected successfully');

    // Define a basic schema for direct operations
    const userSchema = new mongoose.Schema({}, { strict: false });
    const User = mongoose.model('User', userSchema);

    // Find ALL users with the admin email
    console.log('🔍 Finding all users with admin email...');
    const adminUsers = await User.find({ 
      email: 'hiddenshadow032025@gmail.com'
    });

    console.log(`📊 Found ${adminUsers.length} users with admin email:`);
    adminUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. ID: ${user._id}`);
      console.log(`      Role: ${user.role}`);
      console.log(`      Username: ${user.username}`);
      console.log(`      Model: ${user.__t || 'BaseUser'}`);
      console.log(`      Created: ${user.createdAt}`);
      console.log('');
    });

    if (adminUsers.length > 1) {
      console.log('⚠️ Multiple admin users found - cleaning up...');
      
      // Keep the most recent one with proper admin role
      const correctAdmin = adminUsers.find(u => u.role === 'admin') || adminUsers[adminUsers.length - 1];
      const toDelete = adminUsers.filter(u => u._id.toString() !== correctAdmin._id.toString());
      
      console.log(`✅ Keeping admin user: ${correctAdmin._id} (Role: ${correctAdmin.role})`);
      console.log(`🗑️ Deleting ${toDelete.length} duplicate users...`);
      
      for (const user of toDelete) {
        console.log(`   Deleting: ${user._id} (Role: ${user.role})`);
        await User.findByIdAndDelete(user._id);
      }
      
      console.log('✅ Cleanup completed!');
    }

    // Ensure the remaining admin user has correct role
    const finalAdmin = await User.findOne({ email: 'hiddenshadow032025@gmail.com' });
    if (finalAdmin) {
      console.log('\n🔧 Final admin user check:');
      console.log('   📧 Email:', finalAdmin.email);
      console.log('   🔑 Role:', finalAdmin.role);
      console.log('   🆔 ID:', finalAdmin._id);
      
      if (finalAdmin.role !== 'admin') {
        console.log('🔄 Fixing role to lowercase admin...');
        await User.updateOne(
          { _id: finalAdmin._id },
          { $set: { role: 'admin' } }
        );
        console.log('✅ Role fixed!');
      }
    }

    // Test the backend search one more time
    console.log('\n🧪 Final test of backend search logic...');
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
      console.log('✅ Backend search logic works!');
      console.log('   📧 Email:', searchResult.email);
      console.log('   🔑 Role:', searchResult.role);
      console.log('   🆔 ID:', searchResult._id);
    } else {
      console.log('❌ Backend search logic still not working');
    }

  } catch (error) {
    console.error('❌ Error cleaning up admin users:', error);
  } finally {
    console.log('\n🔄 Closing database connection...');
    await mongoose.connection.close();
    console.log('✅ Connection closed');
  }
}

// Run the cleanup
cleanupAdminUsers()
  .then(() => {
    console.log('\n🎯 Admin users cleanup completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Admin users cleanup failed:', error.message);
    process.exit(1);
  });
