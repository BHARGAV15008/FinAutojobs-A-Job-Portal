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
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/finauto_jobs', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Test admin login
const testAdminLogin = async () => {
  try {
    // Find admin user
    const adminUser = await BaseUser.findOne({ 
      email: 'admin@finautojobs.com',
      role: 'admin'
    });

    if (!adminUser) {
      console.log('❌ Admin user not found');
      return;
    }

    console.log('✅ Admin user found:');
    console.log('- ID:', adminUser._id);
    console.log('- Email:', adminUser.email);
    console.log('- Username:', adminUser.username);
    console.log('- Role:', adminUser.role);
    console.log('- Password Hash:', adminUser.password.substring(0, 20) + '...');

    // Test password verification
    const testPassword = 'admin123';
    const isValidPassword = await bcrypt.compare(testPassword, adminUser.password);
    
    console.log('🔑 Password test:');
    console.log('- Test password:', testPassword);
    console.log('- Password valid:', isValidPassword);

    if (!isValidPassword) {
      console.log('⚠️ Password verification failed. Updating password...');
      
      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(testPassword, salt);
      
      // Update user password
      await BaseUser.findByIdAndUpdate(adminUser._id, {
        password: hashedPassword
      });
      
      console.log('✅ Password updated successfully');
      
      // Test again
      const updatedUser = await BaseUser.findById(adminUser._id);
      const isValidAfterUpdate = await bcrypt.compare(testPassword, updatedUser.password);
      console.log('✅ Password verification after update:', isValidAfterUpdate);
    }

  } catch (error) {
    console.error('❌ Error testing admin login:', error);
  }
};

// List all admin users
const listAdminUsers = async () => {
  try {
    const adminUsers = await BaseUser.find({ role: 'admin' });
    
    console.log(`\n📋 Found ${adminUsers.length} admin users:`);
    
    adminUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} (${user.username}) - ${user.firstName} ${user.lastName}`);
    });
    
  } catch (error) {
    console.error('❌ Error listing admin users:', error);
  }
};

// Main execution
const main = async () => {
  try {
    await connectDB();
    
    console.log('🧪 Testing admin login system...\n');
    
    await listAdminUsers();
    await testAdminLogin();
    
    console.log('\n✅ Admin login test completed!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Script execution failed:', error);
    process.exit(1);
  }
};

// Run the script
main();
