import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db } from './config/database.js';
import { users } from './schema.js';

async function testTokenHandling() {
    try {
        // Generate a test user
        const password = 'TestPass123!';
        const hashedPassword = await bcrypt.hash(password, 12);
        
        const testUser = {
            username: 'testuser_' + Date.now(),
            email: `test${Date.now()}@example.com`,
            password: hashedPassword,
            full_name: 'Test User',
            role: 'jobseeker'
        };

        // Insert test user
        const [newUser] = await db.insert(users).values(testUser).returning();
        console.log('Test user created:', {
            id: newUser.id,
            username: newUser.username,
            email: newUser.email
        });

        // Generate token
        const token = jwt.sign(
            { 
                userId: newUser.id, 
                username: newUser.username,
                email: newUser.email,
                role: newUser.role
            },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        console.log('Token verification:', {
            success: true,
            decoded: {
                userId: decoded.userId,
                username: decoded.username,
                email: decoded.email
            }
        });

    } catch (error) {
        console.error('Token handling error:', error);
    }
}

testTokenHandling();
