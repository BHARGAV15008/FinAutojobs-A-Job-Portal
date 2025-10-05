import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: './config.env' });

// MongoDB connection string with fallback
const MONGODB_URI = process.env.MONGODB_URI || 
                   process.env.DATABASE_URL || 
                   'mongodb://localhost:27017/finautojobs';

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