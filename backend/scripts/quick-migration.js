import mongoose from 'mongoose';
import UnifiedUser from '../models/final/UnifiedUser.js';
import RecruiterProfile from '../models/final/RecruiterProfile.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://technogenius1500_db_user:ZnqBQD8wc4M6c1Fm@cluster0.slmyrux.mongodb.net/?appName=Cluster0';

async function quickMigration() {
  try {
    console.log('🚀 Starting Quick Migration...');
    
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Backup existing data
    const existingUsers = await mongoose.connection.db.collection('users').find({}).toArray();
    console.log(`📋 Found ${existingUsers.length} existing users`);
    
    // Clear collections
    await mongoose.connection.db.collection('users').deleteMany({});
    await mongoose.connection.db.collection('unified_users').deleteMany({});
    console.log('🗑️ Cleared existing collections');
    
    // Migrate users
    let migrated = 0;
    for (const oldUser of existingUsers) {
      try {
        const userData = {
          firstName: oldUser.firstName || oldUser.first_name || '',
          lastName: oldUser.lastName || oldUser.last_name || '',
          email: oldUser.email,
          password: oldUser.password, // Keep existing hash
          phone: oldUser.phone,
          role: oldUser.role,
          bio: oldUser.bio || '',
          
          // Social links with unified naming
          socialLinks: {
            linkedinUrl: oldUser.linkedin_url || oldUser.socialLinks?.linkedinUrl || '',
            githubUrl: oldUser.github_url || oldUser.socialLinks?.githubUrl || '',
            portfolioUrl: oldUser.portfolio_url || oldUser.socialLinks?.portfolioUrl || ''
          },
          
          // Address
          address: {
            city: oldUser.city || oldUser.address?.city || '',
            state: oldUser.state || oldUser.address?.state || '',
            country: oldUser.country || oldUser.address?.country || 'India'
          }
        };
        
        let newUser;
        if (oldUser.role === 'recruiter') {
          userData.companyInfo = {
            companyName: oldUser.companyName || oldUser.companyInfo?.companyName || '',
            jobTitle: oldUser.position || oldUser.jobTitle || oldUser.companyInfo?.designation || ''
          };
          userData.recruitingStats = {
            totalJobsPosted: 0,
            activeJobs: 0,
            totalHires: 0
          };
          newUser = new RecruiterProfile(userData);
        } else {
          newUser = new UnifiedUser(userData);
        }
        
        await newUser.save({ validateBeforeSave: false });
        migrated++;
        console.log(`✅ Migrated: ${oldUser.email}`);
        
      } catch (error) {
        console.error(`❌ Failed: ${oldUser.email} - ${error.message}`);
      }
    }
    
    console.log(`🎉 Migration completed: ${migrated}/${existingUsers.length} users migrated`);
    
    // Verify
    const newCount = await UnifiedUser.countDocuments();
    console.log(`✅ Verification: ${newCount} users in unified collection`);
    
    await mongoose.connection.close();
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  quickMigration();
}

export default quickMigration;
