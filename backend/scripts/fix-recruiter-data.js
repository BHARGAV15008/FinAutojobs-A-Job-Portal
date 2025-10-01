import mongoose from 'mongoose';
import { BaseUser, Recruiter } from '../models/UserModels.js';

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/finautojobs');
    console.log('✅ MongoDB connected for data fix');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Fix recruiter data
const fixRecruiterData = async () => {
  try {
    console.log('🔍 Finding recruiters with missing companyInfo...');
    
    // Find all recruiters
    const recruiters = await BaseUser.find({ role: 'recruiter' });
    console.log(`📊 Found ${recruiters.length} recruiter accounts`);
    
    let updatedCount = 0;
    
    for (const recruiter of recruiters) {
      let needsUpdate = false;
      const updates = {};
      
      // Check if companyInfo exists and has companyName
      if (!recruiter.companyInfo || !recruiter.companyInfo.companyName) {
        needsUpdate = true;
        updates['companyInfo.companyName'] = recruiter.companyName || recruiter.company || 'Company Name Not Provided';
        console.log(`🔧 Adding companyName for ${recruiter.email}: ${updates['companyInfo.companyName']}`);
      }
      
      // Check if companyInfo.jobTitle exists
      if (!recruiter.companyInfo || !recruiter.companyInfo.jobTitle) {
        needsUpdate = true;
        updates['companyInfo.jobTitle'] = recruiter.position || recruiter.designation || 'Recruiter';
        console.log(`🔧 Adding jobTitle for ${recruiter.email}: ${updates['companyInfo.jobTitle']}`);
      }
      
      // Update if needed
      if (needsUpdate) {
        await BaseUser.updateOne(
          { _id: recruiter._id },
          { $set: updates }
        );
        updatedCount++;
        console.log(`✅ Updated recruiter: ${recruiter.email}`);
      }
    }
    
    console.log(`🎉 Successfully updated ${updatedCount} recruiter accounts`);
    
  } catch (error) {
    console.error('❌ Error fixing recruiter data:', error);
  }
};

// Main execution
const main = async () => {
  await connectDB();
  await fixRecruiterData();
  
  console.log('✅ Data fix completed. You can now try logging in again.');
  process.exit(0);
};

main().catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});
