import { db } from './config/database.js';
import { users, companies } from './schema.js';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';

async function setupTestUsers() {
    try {
        // Clean up existing test users first
        await db.delete(users).where(eq(users.email, 'employer@test.com'));
        await db.delete(users).where(eq(users.email, 'jobseeker@test.com'));
        await db.delete(companies).where(eq(companies.name, 'Test Company'));
        console.log('Cleaned up existing test data');
    } catch (error) {
        console.log('Clean up error (can be ignored):', error.message);
    }
    try {
        // Create test employer
        const employerPassword = await bcrypt.hash('TestPass123!', 12);
        const [employer] = await db.insert(users).values({
            username: 'testemployer',
            email: 'employer@test.com',
            password: employerPassword,
            full_name: 'Test Employer',
            role: 'employer',
            status: 'active',
            email_verified: true,
            company_name: 'Test Company'
        }).returning();

        // Create test company
        const [company] = await db.insert(companies).values({
            name: 'Test Company',
            description: 'Test company for automated testing',
            location: 'Mumbai',
            industry: 'Technology',
            status: 'active',
            verified: true
        }).returning();

        // Update employer with company
        await db.update(users)
            .set({ company_id: company.id })
            .where(eq(users.id, employer.id));

        // Create test jobseeker
        const jobseekerPassword = await bcrypt.hash('TestPass123!', 12);
        const [jobseeker] = await db.insert(users).values({
            username: 'testjobseeker',
            email: 'jobseeker@test.com',
            password: jobseekerPassword,
            full_name: 'Test Jobseeker',
            role: 'jobseeker',
            status: 'active',
            email_verified: true,
            skills: JSON.stringify(['JavaScript', 'React', 'Node.js'])
        }).returning();

        console.log('✅ Test users created successfully:', {
            employer: {
                id: employer.id,
                email: employer.email
            },
            jobseeker: {
                id: jobseeker.id,
                email: jobseeker.email
            },
            company: {
                id: company.id,
                name: company.name
            }
        });

    } catch (error) {
        console.error('Error setting up test users:', error);
    }
}

// Run setup
setupTestUsers();
