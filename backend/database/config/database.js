const { drizzle } = require('drizzle-orm/better-sqlite3');
const Database = require('better-sqlite3');
const { migrate } = require('drizzle-orm/better-sqlite3/migrator');
const path = require('path');

// Database configuration
const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../finautojobs.db');

// Create database connection
const sqlite = new Database(DB_PATH);

// Enable foreign keys and WAL mode for better performance
sqlite.pragma('foreign_keys = ON');
sqlite.pragma('journal_mode = WAL');
sqlite.pragma('synchronous = NORMAL');
sqlite.pragma('cache_size = 1000000');
sqlite.pragma('temp_store = memory');

// Create drizzle instance
const db = drizzle(sqlite);

// Migration function
const runMigrations = async () => {
  try {
    await migrate(db, { migrationsFolder: path.join(__dirname, '../migrations') });
    console.log('✅ Database migrations completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
};

// Database health check
const healthCheck = () => {
  try {
    const result = sqlite.prepare('SELECT 1 as health').get();
    return result.health === 1;
  } catch (error) {
    console.error('❌ Database health check failed:', error);
    return false;
  }
};

// Graceful shutdown
const closeDatabase = () => {
  try {
    sqlite.close();
    console.log('✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error closing database:', error);
  }
};

// Handle process termination
process.on('SIGINT', closeDatabase);
process.on('SIGTERM', closeDatabase);

module.exports = {
  db,
  sqlite,
  runMigrations,
  healthCheck,
  closeDatabase
};
