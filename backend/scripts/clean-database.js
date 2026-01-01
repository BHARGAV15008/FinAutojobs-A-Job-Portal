import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/finautojobs';

async function cleanDatabase() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get the database
    const db = mongoose.connection.db;
    
    // Get all collections
    const collections = await db.listCollections().toArray();
    console.log(`📊 Found ${collections.length} collections`);

    // Drop all collections
    for (const collection of collections) {
      const collectionName = collection.name;
      console.log(`🗑️ Dropping collection: ${collectionName}`);
      await db.collection(collectionName).drop();
      console.log(`✅ Dropped: ${collectionName}`);
    }

    console.log('🎉 All collections dropped successfully!');
    console.log('📊 Database is now clean and ready for fresh data');

    // Verify database is empty
    const remainingCollections = await db.listCollections().toArray();
    console.log(`📊 Remaining collections: ${remainingCollections.length}`);

    if (remainingCollections.length === 0) {
      console.log('✅ Database cleanup completed successfully!');
    } else {
      console.log('⚠️ Some collections still exist:');
      remainingCollections.forEach(col => console.log(`  - ${col.name}`));
    }

  } catch (error) {
    console.error('❌ Error cleaning database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the cleanup
cleanDatabase();
