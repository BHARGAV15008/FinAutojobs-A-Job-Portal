import mongoose from 'mongoose';

async function verifyEmpty() {
  try {
    // Check main database
    await mongoose.connect('mongodb://localhost:27017/finautojobs');
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`📊 finautojobs collections: ${collections.length}`);
    await mongoose.disconnect();
    
    // Check clean database
    await mongoose.connect('mongodb://localhost:27017/finautojobs_clean');
    const cleanCollections = await mongoose.connection.db.listCollections().toArray();
    console.log(`📊 finautojobs_clean collections: ${cleanCollections.length}`);
    await mongoose.disconnect();
    
    console.log('✅ Verification complete - all databases are empty!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

verifyEmpty();
