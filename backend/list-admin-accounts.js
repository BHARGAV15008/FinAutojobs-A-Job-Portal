import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '.env') });

const userSchema = new mongoose.Schema({
  email: String,
  role: String,
  profile: {
    firstName: String,
    lastName: String
  },
  adminLevel: String,
  permissions: {
    canManageUsers: Boolean,
    canManageJobs: Boolean,
    canManageSettings: Boolean,
    canManageRecruiters: Boolean,
    canManageApplicants: Boolean,
    canManageCompanies: Boolean,
    canManageReports: Boolean,
    canManageAnalytics: Boolean,
    canManageModeration: Boolean,
    canManageSystem: Boolean
  },
  isActive: Boolean,
  isVerified: Boolean,
  createdAt: Date,
  lastLogin: Date
});

const User = mongoose.model('User', userSchema);

async function listAdmins() {
  try {
    console.log('🔄 Connecting to MongoDB...\n');
    
    const mongoUri = process.env.MONGODB_URI || process.env.DATABASE_URL || process.env.MONGO_URL;
    
    if (!mongoUri) {
      throw new Error('MongoDB URI not found in environment variables');
    }

    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000
    });

    console.log('✅ Connected to MongoDB\n');
    console.log('═'.repeat(100));
    console.log('🔐 ADMIN ACCOUNTS LIST');
    console.log('═'.repeat(100) + '\n');

    const admins = await User.find({ role: 'admin' }).sort({ adminLevel: 1, email: 1 });

    if (admins.length === 0) {
      console.log('⚠️  No admin accounts found in the database.\n');
      return;
    }

    console.log(`Found ${admins.length} admin account(s):\n`);

    admins.forEach((admin, index) => {
      const levelEmoji = admin.adminLevel === 'super-admin' ? '👑' : admin.adminLevel === 'admin' ? '🔑' : '🛡️';
      const statusEmoji = admin.isActive ? '✅' : '❌';
      const verifiedEmoji = admin.isVerified ? '✅' : '⚠️';
      
      console.log(`${index + 1}. ${levelEmoji} ${admin.adminLevel?.toUpperCase() || 'ADMIN'}`);
      console.log(`   Email:       ${admin.email}`);
      console.log(`   Name:        ${admin.profile?.firstName || 'N/A'} ${admin.profile?.lastName || ''}`);
      console.log(`   Status:      ${statusEmoji} ${admin.isActive ? 'Active' : 'Inactive'}`);
      console.log(`   Verified:    ${verifiedEmoji} ${admin.isVerified ? 'Yes' : 'No'}`);
      console.log(`   Created:     ${admin.createdAt?.toLocaleDateString() || 'N/A'}`);
      console.log(`   Last Login:  ${admin.lastLogin?.toLocaleString() || 'Never'}`);
      
      if (admin.permissions) {
        const activePermissions = Object.entries(admin.permissions)
          .filter(([_, value]) => value === true)
          .map(([key]) => key.replace('canManage', ''));
        
        if (activePermissions.length > 0) {
          console.log(`   Permissions: ${activePermissions.join(', ')}`);
        }
      }
      
      console.log('');
    });

    console.log('═'.repeat(100));
    
    // Summary by level
    const superAdmins = admins.filter(a => a.adminLevel === 'super-admin');
    const regularAdmins = admins.filter(a => a.adminLevel === 'admin');
    const moderators = admins.filter(a => a.adminLevel === 'moderator');
    const unspecified = admins.filter(a => !a.adminLevel);
    
    console.log('\n📊 SUMMARY BY LEVEL:\n');
    console.log(`   👑 Super Admins:  ${superAdmins.length}`);
    console.log(`   🔑 Admins:        ${regularAdmins.length}`);
    console.log(`   🛡️  Moderators:    ${moderators.length}`);
    if (unspecified.length > 0) {
      console.log(`   ❓ Unspecified:   ${unspecified.length}`);
    }
    
    // Active vs Inactive
    const activeCount = admins.filter(a => a.isActive).length;
    const inactiveCount = admins.length - activeCount;
    
    console.log('\n📊 SUMMARY BY STATUS:\n');
    console.log(`   ✅ Active:   ${activeCount}`);
    console.log(`   ❌ Inactive: ${inactiveCount}`);
    console.log('');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed\n');
  }
}

listAdmins()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
