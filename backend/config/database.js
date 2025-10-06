import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Environment variables should already be loaded by server.js
// This is just a fallback in case database.js is called directly
if (!process.env.MONGODB_URI && !process.env.DATABASE_URL) {
  dotenv.config({ path: './.env' });
}

// MongoDB connection string with cloud-first fallback
const MONGODB_URI = process.env.MONGODB_URI || 
                   process.env.DATABASE_URL || 
                   process.env.MONGO_URL ||
                   // Only use localhost as last resort for development
                   (process.env.NODE_ENV === 'development' ? 'mongodb://localhost:27017/finautojobs' : null);

// Validate MongoDB URI exists
if (!MONGODB_URI) {
  console.error('❌ No MongoDB URI found in environment variables');
  console.error('Required environment variables: MONGODB_URI, DATABASE_URL, or MONGO_URL');
  process.exit(1);
}

// Database connection instance
let db = null;

const initializeDatabase = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    console.log('📍 MongoDB URI:', MONGODB_URI.replace(/\/\/.*:.*@/, '//***:***@'));
    
    // Connect to MongoDB with simplified options for cloud deployment
    const connectionOptions = {
      serverSelectionTimeoutMS: 30000, // 30 seconds
      socketTimeoutMS: 45000, // 45 seconds
      bufferCommands: false,
      maxPoolSize: 10,
      minPoolSize: 2,
      maxIdleTimeMS: 30000
    };

    await mongoose.connect(MONGODB_URI, connectionOptions);
    
    // Set up database connection event listeners
    db = mongoose.connection;
    
    db.on('disconnected', () => {
      console.log('⚠️ Database disconnected');
    });
    
    db.on('error', (error) => {
      console.error('❌ Database error:', error);
    });
    
    console.log('✅ Database connected successfully to MongoDB Atlas');
    
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    console.error('Error details:', error.message);
    throw error;
  }
};

// Health check function
const checkDatabaseHealth = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      return { status: 'healthy', message: 'Database connection is working' };
    } else {
      return { status: 'unhealthy', message: 'Database connection is not ready' };
    }
  } catch (error) {
    return { status: 'unhealthy', message: error.message };
  }
};

// Export functions
export { 
  db,
  initializeDatabase, 
  checkDatabaseHealth
};