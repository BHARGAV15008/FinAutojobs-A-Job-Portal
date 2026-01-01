import { db } from '../config/database.js';

// Migration to add role-specific fields to users table
export async function addRoleSpecificFields() {
  try {
    console.log('Adding role-specific fields to users table...');
    
    // Add new columns to users table
    await db.run(`
      ALTER TABLE users ADD COLUMN skills TEXT;
    `);
    
    await db.run(`
      ALTER TABLE users ADD COLUMN qualification TEXT;
    `);
    
    await db.run(`
      ALTER TABLE users ADD COLUMN company_name TEXT;
    `);
    
    await db.run(`
      ALTER TABLE users ADD COLUMN position TEXT;
    `);
    
    console.log('✅ Successfully added role-specific fields to users table');
  } catch (error) {
    console.error('❌ Error adding role-specific fields:', error.message);
    throw error;
  }
}

// Run migration if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  addRoleSpecificFields()
    .then(() => {
      console.log('Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}