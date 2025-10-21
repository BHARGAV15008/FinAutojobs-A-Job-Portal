import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const resetJobsCollection = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/finautojobs');
    console.log('Connected to MongoDB');

    // Drop the jobs collection if it exists
    try {
      await mongoose.connection.db.collection('jobs').drop();
      console.log('✅ Jobs collection dropped successfully');
    } catch (error) {
      if (error.code === 26) {
        console.log('ℹ️ Jobs collection does not exist, nothing to drop');
      } else {
        throw error;
      }
    }

    // Drop any existing indexes
    try {
      await mongoose.connection.db.collection('jobs').dropIndexes();
      console.log('✅ All indexes dropped');
    } catch (error) {
      console.log('ℹ️ No indexes to drop');
    }

    console.log('✅ Jobs collection reset complete');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error resetting jobs collection:', error);
    process.exit(1);
  }
};

resetJobsCollection();
