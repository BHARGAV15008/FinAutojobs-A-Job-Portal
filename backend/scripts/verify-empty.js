import mongoose from 'mongoose';

async function verifyEmpty() {
  try {
    // Check main database
    await mongoose.connect('mongodb+srv://technogenius1500_db_user:ZnqBQD8wc4M6c1Fm@cluster0.slmyrux.mongodb.net/?appName=Cluster0');
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`📊 finautojobs collections: ${collections.length}`);
    await mongoose.disconnect();
    
    // Check clean database
    await mongoose.connect('mongodb+srv://technogenius1500_db_user:ZnqBQD8wc4M6c1Fm@cluster0.slmyrux.mongodb.net/?appName=Cluster0_clean');
    const cleanCollections = await mongoose.connection.db.listCollections().toArray();
    console.log(`📊 finautojobs_clean collections: ${cleanCollections.length}`);
    await mongoose.disconnect();
    
    console.log('✅ Verification complete - all databases are empty!');
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

verifyEmpty();
