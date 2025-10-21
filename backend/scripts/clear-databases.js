import mongoose from 'mongoose';

/**
 * Clear All Database Data Script
 * This will remove all data from all collections in the databases
 */

const databases = [
  'mongodb://localhost:27017/finautojobs',      // Main database
  'mongodb://localhost:27017/finautojobs_clean' // Clean database
];

async function clearDatabase(uri) {
  try {
    console.log(`🔄 Connecting to: ${uri}`);
    await mongoose.connect(uri);
    
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    
    console.log(`📋 Found ${collections.length} collections in ${db.databaseName}`);
    
    if (collections.length === 0) {
      console.log(`✅ Database ${db.databaseName} is already empty`);
      return;
    }
    
    // Drop all collections
    for (const collection of collections) {
      try {
        await db.collection(collection.name).drop();
        console.log(`🗑️  Dropped collection: ${collection.name}`);
      } catch (error) {
        if (error.code === 26) {
          console.log(`⚠️  Collection ${collection.name} doesn't exist (already dropped)`);
        } else {
          console.error(`❌ Error dropping ${collection.name}:`, error.message);
        }
      }
    }
    
    console.log(`✅ Cleared all data from database: ${db.databaseName}`);
    
  } catch (error) {
    console.error(`❌ Error clearing database ${uri}:`, error.message);
  } finally {
    await mongoose.disconnect();
  }
}

async function clearAllDatabases() {
  console.log('🚨 CLEARING ALL DATABASE DATA 🚨');
  console.log('This will permanently delete all data from all databases!');
  console.log('');
  
  for (const dbUri of databases) {
    await clearDatabase(dbUri);
    console.log(''); // Empty line for readability
  }
  
  console.log('🎉 All databases cleared successfully!');
  console.log('');
  console.log('📝 Summary:');
  console.log('- All user accounts deleted');
  console.log('- All job postings deleted');
  console.log('- All applications deleted');
  console.log('- All sessions cleared');
  console.log('- Database is now completely clean');
}

// Run the script
clearAllDatabases().catch(console.error);
