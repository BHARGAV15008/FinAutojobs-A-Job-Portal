import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: './config.env' });

// MongoDB connection string with fallback
const MONGODB_URI = process.env.MONGODB_URI || 
                   process.env.DATABASE_URL || 
                   'mongodb://localhost:27017/finautojobs';

// Initialize database connection
const initializeDatabase = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Database connected successfully');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
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

// Get database statistics
const getDatabaseStats = async () => {
  try {
    const stats = {};
    
    // Get collection counts
    const collections = await mongoose.connection.db.listCollections().toArray();
    for (const collection of collections) {
      const count = await mongoose.connection.db.collection(collection.name).countDocuments();
      stats[collection.name] = count;
    }
    
    return stats;
  } catch (error) {
    console.error('Error getting database stats:', error);
    return {};
  }
};

// Cleanup function for graceful shutdown
const closeDatabase = async () => {
  try {
    await mongoose.connection.close();
    console.log('📊 Database connection closed');
  } catch (error) {
    console.error('Error closing database:', error);
  }
};

export { 
  initializeDatabase, 
  checkDatabaseHealth, 
  getDatabaseStats, 
  closeDatabase 
};