import mongoose from 'mongoose';
import { BaseUser } from '../models/UserModels.js';

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/finautojobs');
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Delete test user
const deleteTestUser = async () => {
  try {
    const email = 'lotawe4515@reifide.com';
    
    const result = await BaseUser.deleteOne({ email, role: 'recruiter' });
    
    if (result.deletedCount > 0) {
      console.log(`✅ Deleted recruiter account: ${email}`);
    } else {
      console.log(`❌ No recruiter account found with email: ${email}`);
    }
    
  } catch (error) {
    console.error('❌ Error deleting user:', error);
  }
};

// Main execution
const main = async () => {
  await connectDB();
  await deleteTestUser();
  
  console.log('✅ User deletion completed.');
  process.exit(0);
};

main().catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});
