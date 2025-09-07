import { db } from './config/database.js';
import { users } from './schema.js';

async function testDatabaseConnection() {
    try {
        // Test database connection
        const result = await db.select().from(users).limit(1);
        console.log('Database connection test:', {
            success: true,
            foundUsers: result.length > 0
        });
    } catch (error) {
        console.error('Database connection error:', error);
    }
}

testDatabaseConnection();
