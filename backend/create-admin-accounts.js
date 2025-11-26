import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '.env') });

// User Schema (inline for this script)
const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, sparse: true },
  password: { type: String },
  phoneNumber: { type: String, unique: true, sparse: true },
  role: { type: String, enum: ['admin', 'recruiter', 'applicant'], required: true },
  profile: {
    firstName: { type: String },
    lastName: { type: String },
    phone: { type: String },
    avatar: { type: String },
    location: {
      city: { type: String },
      state: { type: String },
      country: { type: String },
      coordinates: { type: [Number] }
    }
  },
  verification: {
    email: { type: Boolean, default: false },
    phone: { type: Boolean, default: false },
    emailToken: { type: String },
    phoneToken: { type: String }
  },
  authProviders: {
    google: { type: String },
    phone: { type: Boolean, default: false },
    firebase: { type: String }
  },
  permissions: {
    canManageUsers: { type: Boolean, default: false },
    canManageJobs: { type: Boolean, default: false },
    canManageSettings: { type: Boolean, default: false },
    canManageRecruiters: { type: Boolean, default: false },
    canManageApplicants: { type: Boolean, default: false },
    canManageCompanies: { type: Boolean, default: false },
    canManageReports: { type: Boolean, default: false },
    canManageAnalytics: { type: Boolean, default: false },
    canManageModeration: { type: Boolean, default: false },
    canManageSystem: { type: Boolean, default: false }
  },
  adminLevel: { 
    type: String, 
    enum: ['super-admin', 'admin', 'moderator'], 
    default: 'admin' 
  },
  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
  lastLogin: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const User = mongoose.model('User', userSchema);

// Admin accounts to create
const adminAccounts = [
  {
    email: 'superadmin@finautojobs.com',
    password: 'SuperAdmin@2025!',
    role: 'admin',
    adminLevel: 'super-admin',
    profile: {
      firstName: 'Super',
      lastName: 'Admin'
    },
    permissions: {
      canManageUsers: true,
      canManageJobs: true,
      canManageSettings: true,
      canManageRecruiters: true,
      canManageApplicants: true,
      canManageCompanies: true,
      canManageReports: true,
      canManageAnalytics: true,
      canManageModeration: true,
      canManageSystem: true
    },
    verification: {
      email: true,
      phone: true
    },
    isVerified: true
  },
  {
    email: 'admin@finautojobs.com',
    password: 'Admin@2025!',
    role: 'admin',
    adminLevel: 'admin',
    profile: {
      firstName: 'System',
      lastName: 'Administrator'
    },
    permissions: {
      canManageUsers: true,
      canManageJobs: true,
      canManageSettings: true,
      canManageRecruiters: true,
      canManageApplicants: true,
      canManageCompanies: true,
      canManageReports: true,
      canManageAnalytics: true,
      canManageModeration: false,
      canManageSystem: false
    },
    verification: {
      email: true,
      phone: true
    },
    isVerified: true
  },
  {
    email: 'moderator@finautojobs.com',
    password: 'Moderator@2025!',
    role: 'admin',
    adminLevel: 'moderator',
    profile: {
      firstName: 'Content',
      lastName: 'Moderator'
    },
    permissions: {
      canManageUsers: false,
      canManageJobs: true,
      canManageSettings: false,
      canManageRecruiters: true,
      canManageApplicants: true,
      canManageCompanies: true,
      canManageReports: true,
      canManageAnalytics: true,
      canManageModeration: true,
      canManageSystem: false
    },
    verification: {
      email: true,
      phone: true
    },
    isVerified: true
  },
  {
    email: 'hr.admin@finautojobs.com',
    password: 'HRAdmin@2025!',
    role: 'admin',
    adminLevel: 'admin',
    profile: {
      firstName: 'HR',
      lastName: 'Administrator'
    },
    permissions: {
      canManageUsers: true,
      canManageJobs: true,
      canManageSettings: false,
      canManageRecruiters: true,
      canManageApplicants: true,
      canManageCompanies: true,
      canManageReports: true,
      canManageAnalytics: true,
      canManageModeration: false,
      canManageSystem: false
    },
    verification: {
      email: true,
      phone: true
    },
    isVerified: true
  },
  {
    email: 'support.admin@finautojobs.com',
    password: 'Support@2025!',
    role: 'admin',
    adminLevel: 'moderator',
    profile: {
      firstName: 'Support',
      lastName: 'Administrator'
    },
    permissions: {
      canManageUsers: true,
      canManageJobs: false,
      canManageSettings: false,
      canManageRecruiters: false,
      canManageApplicants: true,
      canManageCompanies: false,
      canManageReports: true,
      canManageAnalytics: true,
      canManageModeration: true,
      canManageSystem: false
    },
    verification: {
      email: true,
      phone: true
    },
    isVerified: true
  }
];

async function createAdminAccounts() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    
    const mongoUri = process.env.MONGODB_URI || process.env.DATABASE_URL || process.env.MONGO_URL;
    
    if (!mongoUri) {
      throw new Error('MongoDB URI not found in environment variables');
    }

    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000
    });

    console.log('✅ Connected to MongoDB\n');

    console.log('📊 Creating admin accounts...\n');
    console.log('═'.repeat(80));

    const createdAccounts = [];
    const skippedAccounts = [];
    const errors = [];

    for (const adminData of adminAccounts) {
      try {
        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: adminData.email });

        if (existingAdmin) {
          console.log(`⚠️  Admin already exists: ${adminData.email}`);
          skippedAccounts.push(adminData.email);
          continue;
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(adminData.password, 10);

        // Create admin user
        const admin = new User({
          ...adminData,
          password: hashedPassword
        });

        await admin.save();

        createdAccounts.push({
          email: adminData.email,
          password: adminData.password, // Store plain password for display
          adminLevel: adminData.adminLevel,
          name: `${adminData.profile.firstName} ${adminData.profile.lastName}`
        });

        console.log(`✅ Created: ${adminData.email} (${adminData.adminLevel})`);
        console.log(`   Name: ${adminData.profile.firstName} ${adminData.profile.lastName}`);
        console.log(`   Permissions: ${Object.entries(adminData.permissions).filter(([_, v]) => v).map(([k]) => k).join(', ')}\n`);

      } catch (error) {
        console.error(`❌ Error creating ${adminData.email}:`, error.message);
        errors.push({ email: adminData.email, error: error.message });
      }
    }

    console.log('═'.repeat(80));
    console.log('\n📋 SUMMARY\n');
    console.log(`✅ Created: ${createdAccounts.length}`);
    console.log(`⚠️  Skipped: ${skippedAccounts.length}`);
    console.log(`❌ Errors: ${errors.length}`);

    if (createdAccounts.length > 0) {
      console.log('\n' + '═'.repeat(80));
      console.log('🔑 ADMIN CREDENTIALS (SAVE THESE SECURELY!)');
      console.log('═'.repeat(80) + '\n');

      createdAccounts.forEach((account, index) => {
        console.log(`${index + 1}. ${account.adminLevel.toUpperCase()}`);
        console.log(`   Name:     ${account.name}`);
        console.log(`   Email:    ${account.email}`);
        console.log(`   Password: ${account.password}`);
        console.log(`   Level:    ${account.adminLevel}`);
        console.log('');
      });

      console.log('═'.repeat(80));
      console.log('⚠️  SECURITY WARNING: Change these passwords after first login!');
      console.log('═'.repeat(80));
    }

    if (skippedAccounts.length > 0) {
      console.log('\n⚠️  Skipped accounts (already exist):');
      skippedAccounts.forEach(email => console.log(`   - ${email}`));
    }

    if (errors.length > 0) {
      console.log('\n❌ Errors encountered:');
      errors.forEach(({ email, error }) => {
        console.log(`   - ${email}: ${error}`);
      });
    }

  } catch (error) {
    console.error('❌ Fatal error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
  }
}

// Run the script
createAdminAccounts()
  .then(() => {
    console.log('\n✅ Admin account creation complete!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });
