import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env') });

// Import models
import BaseUser from '../models/unified/BaseUser.js';

const unlockAccount = async () => {
  try {
    console.log('🔓 Starting account unlock process...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get email from command line argument
    const email = process.argv[2];
    
    if (!email) {
      console.log('❌ Please provide an email address');
      console.log('Usage: node unlock-account.js <email>');
      process.exit(1);
    }

    console.log(`🔍 Looking for user with email: ${email}`);

    // Find the user
    const user = await BaseUser.findOne({ email: email.toLowerCase() });

    if (!user) {
      console.log('❌ User not found');
      process.exit(1);
    }

    console.log(`✅ Found user: ${user.firstName} ${user.lastName} (${user.role})`);
    console.log(`📊 Current status:`);
    console.log(`   - Login attempts: ${user.loginAttempts || 0}`);
    console.log(`   - Lock until: ${user.lockUntil || 'Not locked'}`);
    console.log(`   - Account locked: ${user.accountLocked || false}`);

    // Unlock the account
    const updateData = {
      loginAttempts: 0,
      accountLocked: false,
      $unset: { lockUntil: 1 }
    };

    await BaseUser.findByIdAndUpdate(user._id, updateData);

    console.log('✅ Account unlocked successfully!');
    console.log('🎉 You can now login with your credentials');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error unlocking account:', error);
    process.exit(1);
  }
};

unlockAccount();
