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

const listLockedAccounts = async () => {
  try {
    console.log('🔍 Checking for locked accounts...\n');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Find all users with failed login attempts or locked accounts
    const lockedUsers = await BaseUser.find({
      $or: [
        { loginAttempts: { $gt: 0 } },
        { lockUntil: { $exists: true } },
        { accountLocked: true }
      ]
    }).select('firstName lastName email role loginAttempts lockUntil accountLocked');

    if (lockedUsers.length === 0) {
      console.log('✅ No locked accounts found!');
      process.exit(0);
    }

    console.log(`Found ${lockedUsers.length} account(s) with login issues:\n`);
    console.log('═══════════════════════════════════════════════════════════════');

    lockedUsers.forEach((user, index) => {
      console.log(`\n${index + 1}. ${user.firstName} ${user.lastName}`);
      console.log(`   Email: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Login attempts: ${user.loginAttempts || 0}`);
      console.log(`   Account locked: ${user.accountLocked || false}`);
      
      if (user.lockUntil) {
        const now = new Date();
        if (user.lockUntil > now) {
          const minutesRemaining = Math.ceil((user.lockUntil - now) / (1000 * 60));
          console.log(`   🔒 Locked until: ${user.lockUntil.toLocaleString()} (${minutesRemaining} minutes remaining)`);
        } else {
          console.log(`   ⏰ Lock expired: ${user.lockUntil.toLocaleString()}`);
        }
      }
      
      console.log(`   To unlock: node unlock-account.js ${user.email}`);
    });

    console.log('\n═══════════════════════════════════════════════════════════════\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error listing locked accounts:', error);
    process.exit(1);
  }
};

listLockedAccounts();
