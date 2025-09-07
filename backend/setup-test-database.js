import { initializeDatabase } from './config/database.js';
import { createTables, seedTestData } from './models/schema.js';

async function setupTestDatabase() {
  try {
    console.log('Setting up test database...');
    
    // Initialize the database connection
    const db = await initializeDatabase();
    
    // Create all tables
    await createTables(db);
    
    // Seed test data
    await seedTestData(db);
    
    console.log('Test database setup complete!');
    process.exit(0);
  } catch (error) {
    console.error('Error setting up test database:', error);
    process.exit(1);
  }
}

setupTestDatabase();
