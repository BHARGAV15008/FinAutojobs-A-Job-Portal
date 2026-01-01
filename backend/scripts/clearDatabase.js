import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Configure dotenv
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

// Database connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/finautojobs', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

// Clear all collections
const clearAllCollections = async () => {
  try {
    console.log('🔄 Starting database cleanup...');
    
    // Get all collection names
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`📊 Found ${collections.length} collections`);
    
    // Drop each collection
    for (const collection of collections) {
      const collectionName = collection.name;
      try {
        await mongoose.connection.db.collection(collectionName).drop();
        console.log(`✅ Cleared collection: ${collectionName}`);
      } catch (error) {
        if (error.code === 26) {
          console.log(`⚠️  Collection ${collectionName} doesn't exist (already cleared)`);
        } else {
          console.error(`❌ Error clearing collection ${collectionName}:`, error.message);
        }
      }
    }
    
    console.log('🎉 Database cleanup completed successfully!');
    
    // Show final status
    const remainingCollections = await mongoose.connection.db.listCollections().toArray();
    console.log(`📊 Remaining collections: ${remainingCollections.length}`);
    
  } catch (error) {
    console.error('❌ Error during database cleanup:', error);
  }
};

// Main execution
const main = async () => {
  console.log('🚀 FinAutoJobs Database Cleanup Tool');
  console.log('=====================================');
  
  // Connect to database
  await connectDB();
  
  // Clear all collections
  await clearAllCollections();
  
  // Close connection
  await mongoose.connection.close();
  console.log('✅ Database connection closed');
  
  process.exit(0);
};

// Run the script
main().catch((error) => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});
