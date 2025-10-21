import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Database Configuration for Separated Architecture
const DB_CONFIG = {
  // Main database for core system data
  MAIN: {
    name: 'finautojobs_main',
    uri: process.env.MAIN_DB_URI || 'mongodb://localhost:27017/finautojobs_main',
    connection: null
  },
  
  // Applicant-specific database
  APPLICANTS: {
    name: 'finautojobs_applicants',
    uri: process.env.APPLICANTS_DB_URI || 'mongodb://localhost:27017/finautojobs_applicants',
    connection: null
  },
  
  // Recruiter-specific database
  RECRUITERS: {
    name: 'finautojobs_recruiters',
    uri: process.env.RECRUITERS_DB_URI || 'mongodb://localhost:27017/finautojobs_recruiters',
    connection: null
  },
  
  // Admin-specific database
  ADMINS: {
    name: 'finautojobs_admins',
    uri: process.env.ADMINS_DB_URI || 'mongodb://localhost:27017/finautojobs_admins',
    connection: null
  },
  
  // Analytics and reporting database
  ANALYTICS: {
    name: 'finautojobs_analytics',
    uri: process.env.ANALYTICS_DB_URI || 'mongodb://localhost:27017/finautojobs_analytics',
    connection: null
  }
};

// Connection options
const CONNECTION_OPTIONS = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  bufferCommands: false,
  bufferMaxEntries: 0
};

// Initialize all database connections
export const initializeDatabases = async () => {
  try {
    console.log('🔄 Initializing separated database architecture...');
    
    // Initialize each database connection
    for (const [key, config] of Object.entries(DB_CONFIG)) {
      try {
        console.log(`🔄 Connecting to ${config.name}...`);
        
        config.connection = mongoose.createConnection(config.uri, CONNECTION_OPTIONS);
        
        config.connection.on('connected', () => {
          console.log(`✅ ${config.name} connected successfully`);
        });
        
        config.connection.on('error', (error) => {
          console.error(`❌ ${config.name} connection error:`, error);
        });
        
        config.connection.on('disconnected', () => {
          console.log(`⚠️ ${config.name} disconnected`);
        });
        
        // Wait for connection to be established
        await new Promise((resolve, reject) => {
          config.connection.once('open', resolve);
          config.connection.once('error', reject);
        });
        
      } catch (error) {
        console.error(`❌ Failed to connect to ${config.name}:`, error);
        throw error;
      }
    }
    
    console.log('✅ All databases connected successfully');
    return DB_CONFIG;
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
};

// Get specific database connection
export const getDatabase = (dbName) => {
  const config = DB_CONFIG[dbName.toUpperCase()];
  if (!config || !config.connection) {
    throw new Error(`Database ${dbName} not found or not connected`);
  }
  return config.connection;
};

// Health check for all databases
export const checkDatabasesHealth = async () => {
  const health = {};
  
  for (const [key, config] of Object.entries(DB_CONFIG)) {
    try {
      if (config.connection && config.connection.readyState === 1) {
        // Get basic stats
        const stats = await config.connection.db.stats();
        health[key] = {
          status: 'healthy',
          name: config.name,
          collections: stats.collections || 0,
          dataSize: stats.dataSize || 0,
          indexes: stats.indexes || 0
        };
      } else {
        health[key] = {
          status: 'unhealthy',
          name: config.name,
          error: 'Connection not established'
        };
      }
    } catch (error) {
      health[key] = {
        status: 'unhealthy',
        name: config.name,
        error: error.message
      };
    }
  }
  
  return health;
};

// Get database statistics
export const getDatabaseStats = async () => {
  const stats = {};
  
  for (const [key, config] of Object.entries(DB_CONFIG)) {
    try {
      if (config.connection && config.connection.readyState === 1) {
        const collections = await config.connection.db.listCollections().toArray();
        const collectionStats = {};
        
        for (const collection of collections) {
          const count = await config.connection.db.collection(collection.name).countDocuments();
          collectionStats[collection.name] = count;
        }
        
        stats[key] = {
          name: config.name,
          collections: collectionStats,
          totalCollections: collections.length
        };
      }
    } catch (error) {
      stats[key] = {
        name: config.name,
        error: error.message
      };
    }
  }
  
  return stats;
};

// Close all database connections
export const closeDatabases = async () => {
  try {
    console.log('🔄 Closing all database connections...');
    
    for (const [key, config] of Object.entries(DB_CONFIG)) {
      if (config.connection) {
        await config.connection.close();
        console.log(`✅ ${config.name} connection closed`);
      }
    }
    
    console.log('✅ All database connections closed');
  } catch (error) {
    console.error('❌ Error closing database connections:', error);
    throw error;
  }
};

// Clear all databases (for development/testing)
export const clearAllDatabases = async () => {
  try {
    console.log('🗑️ Clearing all databases...');
    
    for (const [key, config] of Object.entries(DB_CONFIG)) {
      if (config.connection && config.connection.readyState === 1) {
        const collections = await config.connection.db.listCollections().toArray();
        
        for (const collection of collections) {
          await config.connection.db.collection(collection.name).deleteMany({});
          console.log(`✅ Cleared collection: ${config.name}.${collection.name}`);
        }
      }
    }
    
    console.log('✅ All databases cleared successfully');
  } catch (error) {
    console.error('❌ Error clearing databases:', error);
    throw error;
  }
};

export default DB_CONFIG;
