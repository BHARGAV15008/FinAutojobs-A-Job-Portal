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
                   (process.env.NODE_ENV === 'development' ? 'mongodb+srv://technogenius1500_db_user:ZnqBQD8wc4M6c1Fm@cluster0.slmyrux.mongodb.net/?appName=Cluster0' : null);

// Check if we should use mock data mode
if (process.env.USE_MOCK_DATA === 'true') {
  console.log('🎭 Running in MOCK DATA mode - no database connection needed');
  console.log('📝 See SETUP_MONGODB.md for production database setup');
  
  // Export mock functions
  export const initializeDatabase = async () => {
    console.log('✅ Mock database initialized');
    return Promise.resolve();
  };
  
  export const checkDatabaseHealth = async () => {
    return { status: 'healthy', message: 'Mock database is working' };
  };
  
  export { null as db };
} else {
  if (!MONGODB_URI) {
    console.error('❌ No MongoDB URI found in environment variables');
    console.error('📖 See SETUP_MONGODB.md for setup instructions');
    console.error('🎭 Or set USE_MOCK_DATA=true for testing');
    process.exit(1);
    console.log('🔄 Connecting to MongoDB...');
    console.log('📍 MongoDB URI:', MONGODB_URI.replace(/\/\/.*:.*@/, '//***:***@'));
    
    // Minimal connection options for Render compatibility
    const connectionOptions = {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
      maxPoolSize: 10,
      retryWrites: true,
      w: 'majority'
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