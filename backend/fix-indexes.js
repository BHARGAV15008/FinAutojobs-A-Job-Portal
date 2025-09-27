import mongoose from 'mongoose';
import User from './models/UserMongoose.js';

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/finautojobs');
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

// Fix indexes to allow same email/phone for different roles
const fixIndexes = async () => {
  try {
    await connectDB();
    
    console.log('🔧 Fixing database indexes...');
    
    // Get the collection
    const collection = User.collection;
    
    // Drop existing unique indexes on email and phone
    try {
      await collection.dropIndex('email_1');
      console.log('✅ Dropped email unique index');
    } catch (error) {
      console.log('ℹ️ Email index not found or already dropped');
    }
    
    try {
      await collection.dropIndex('phone_1');
      console.log('✅ Dropped phone unique index');
    } catch (error) {
      console.log('ℹ️ Phone index not found or already dropped');
    }
    
    // Create new compound unique indexes
    await collection.createIndex({ email: 1, role: 1 }, { unique: true });
    console.log('✅ Created compound unique index on email + role');
    
    await collection.createIndex({ phone: 1, role: 1 }, { unique: true });
    console.log('✅ Created compound unique index on phone + role');
    
    console.log('🎉 Database indexes fixed successfully!');
    console.log('Now users can have the same email/phone for different roles.');
    
  } catch (error) {
    console.error('❌ Error fixing indexes:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

fixIndexes();
