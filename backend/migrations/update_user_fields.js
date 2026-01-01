import { db } from '../config/database.js';

// Migration to update user fields to match schema
export async function updateUserFields() {
  try {
    console.log('Updating user fields to match schema...');
    
    // Add education field that's missing
    await db.run(`
      ALTER TABLE users ADD COLUMN education TEXT;
    `);
    
    // Add experience_years field if missing
    await db.run(`
      ALTER TABLE users ADD COLUMN experience_years INTEGER;
    `);
    
    // Update education field to be JSON string compatible
    await db.run(`
      UPDATE users 
      SET education = CASE 
        WHEN education IS NULL THEN '[]'
        WHEN json_valid(education) = 0 THEN json_array(education)
        ELSE education
      END;
    `);
    
    // Add email_verified and phone_verified if missing
    await db.run(`
      ALTER TABLE users ADD COLUMN email_verified INTEGER DEFAULT 0;
    `);
    
    await db.run(`
      ALTER TABLE users ADD COLUMN phone_verified INTEGER DEFAULT 0;
    `);
    
    console.log('✅ Successfully updated user fields');
  } catch (error) {
    console.error('❌ Error updating user fields:', error.message);
    if (!error.message.includes('duplicate column name')) {
      throw error;
    }
  }
}

// Run migration if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  updateUserFields()
    .then(() => {
      console.log('Migration completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration failed:', error);
      process.exit(1);
    });
}
