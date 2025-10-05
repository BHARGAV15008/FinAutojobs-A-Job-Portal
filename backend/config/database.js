import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Environment variables should already be loaded by server.js
// This is just a fallback in case database.js is called directly
if (!process.env.MONGODB_URI && !process.env.DATABASE_URL) {
  dotenv.config({ path: './config.env' });
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

// Initialize database connection
const initializeDatabase = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    console.log('📍 MongoDB URI:', MONGODB_URI.replace(/\/\/.*:.*@/, '//***:***@'));
    
    // Updated connection without deprecated options
    await mongoose.connect(MONGODB_URI);
    
    db = mongoose.connection;
    console.log('✅ Database connected successfully');
    
    // Handle connection events
    db.on('error', (error) => {
      console.error('❌ Database connection error:', error);
    });
    
    db.on('disconnected', () => {
      console.log('⚠️ Database disconnected');
    });
    
    return db;
    
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