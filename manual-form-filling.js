#!/usr/bin/env node

/**
 * Manual Form Filling Guide for FinAutoJobs
 * Step-by-step form testing with user interaction
 */

import puppeteer from 'puppeteer';
import readline from 'readline';

const CONFIG = {
    BASE_URL: 'http://localhost:3000',
    TIMEOUT: 30000
};

const TEST_ACCOUNTS = {
    applicant: {
        email: 'applicant1test@gmail.com',
        password: 'TestPass123!',
        name: 'John Doe'
    },
    recruiter: {
        email: 'recruiter1test@gmail.com',
        password: 'TestPass123!',
        name: 'Mike Johnson'
    }
};

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(prompt) {
    return new Promise((resolve) => {
        rl.question(prompt, resolve);
    });
}

function log(message, color = '\x1b[0m') {
    console.log(`${color}${message}\x1b[0m`);
}

function logInfo(message) {
    log(`ℹ️  ${message}`, '\x1b[34m');
}

function logSuccess(message) {
    log(`✅ ${message}`, '\x1b[32m');
}

function logHeader(message) {
    log(`\n${'='.repeat(60)}`, '\x1b[36m');
    log(`${message}`, '\x1b[36m');
    log(`${'='.repeat(60)}`, '\x1b[36m');
}

function logInstruction(message) {
    log(`📋 ${message}`, '\x1b[33m');
}

async function startManualFormTesting() {
    logHeader('FINAUTOJOBS MANUAL FORM TESTING');
    
    const browser = await puppeteer.launch({ 
        headless: false,
        defaultViewport: { width: 1920, height: 1080 },
        args: ['--start-maximized']
    });
    
    const page = await browser.newPage();
    
    try {
        logInfo('Opening FinAutoJobs frontend...');
        await page.goto(CONFIG.BASE_URL, { waitUntil: 'networkidle0' });
        logSuccess('Frontend opened successfully!');
        
        // Test Home Page Forms
        logHeader('TESTING HOME PAGE');
        logInstruction('Check the home page for any search forms or newsletter signup forms');
        await question('Press Enter after exploring the home page...');
        
        // Test Registration Form
        logHeader('TESTING REGISTRATION FORM');
        await page.goto(`${CONFIG.BASE_URL}/register`, { waitUntil: 'networkidle0' });
        logSuccess('Navigated to registration page');
        
        logInstruction('Now test the registration form:');
        logInstruction('1. Fill out all fields with test data');
        logInstruction('2. Test both Applicant and Recruiter roles');
        logInstruction('3. Test form validation (try invalid emails, weak passwords)');
        logInstruction('4. Test terms and conditions checkbox');
        logInstruction('5. Test password visibility toggle');
        
        await question('Press Enter when you have finished testing the registration form...');
        
        // Test Login Form
        logHeader('TESTING LOGIN FORM');
        await page.goto(`${CONFIG.BASE_URL}/login`, { waitUntil: 'networkidle0' });
        logSuccess('Navigated to login page');
        
        logInstruction('Test the login form with these accounts:');
        logInstruction(`Applicant: ${TEST_ACCOUNTS.applicant.email} / ${TEST_ACCOUNTS.applicant.password}`);
        logInstruction(`Recruiter: ${TEST_ACCOUNTS.recruiter.email} / ${TEST_ACCOUNTS.recruiter.password}`);
        logInstruction('Test form validation and error messages');
        
        await question('Press Enter when you have finished testing the login form...');
        
        // Login as Applicant for further testing
        logHeader('LOGGING IN AS APPLICANT');
        logInstruction('Please login as the applicant to test profile and application forms');
        logInstruction(`Email: ${TEST_ACCOUNTS.applicant.email}`);
        logInstruction(`Password: ${TEST_ACCOUNTS.applicant.password}`);
        
        await question('Press Enter after logging in as applicant...');
        
        // Test Profile Forms
        logHeader('TESTING PROFILE FORMS');
        logInstruction('Navigate to your profile/dashboard and test:');
        logInstruction('1. Profile editing form');
        logInstruction('2. Personal information updates');
        logInstruction('3. Skills and experience forms');
        logInstruction('4. Education details form');
        logInstruction('5. Profile picture upload');
        logInstruction('6. Resume upload');
        logInstruction('7. Social links (LinkedIn, GitHub, Portfolio)');
        
        await question('Press Enter when you have finished testing profile forms...');
        
        // Test Job Application Forms
        logHeader('TESTING JOB APPLICATION FORMS');
        await page.goto(`${CONFIG.BASE_URL}/jobs`, { waitUntil: 'networkidle0' });
        logSuccess('Navigated to jobs page');
        
        logInstruction('Test job application process:');
        logInstruction('1. Browse available jobs');
        logInstruction('2. Click "Apply" on any job');
        logInstruction('3. Fill out the application form completely:');
        logInstruction('   - Personal information');
        logInstruction('   - Professional background');
        logInstruction('   - Expected salary');
        logInstruction('   - Cover letter');
        logInstruction('   - Resume upload');
        logInstruction('   - Portfolio links');
        logInstruction('4. Test form validation');
        logInstruction('5. Submit the application');
        
        await question('Press Enter when you have finished testing job applications...');
        
        // Test Search Forms
        logHeader('TESTING SEARCH FORMS');
        logInstruction('Test various search functionalities:');
        logInstruction('1. Job search with keywords');
        logInstruction('2. Location-based filtering');
        logInstruction('3. Salary range filters');
        logInstruction('4. Experience level filters');
        logInstruction('5. Company search');
        logInstruction('6. Advanced search options');
        
        await question('Press Enter when you have finished testing search forms...');
        
        // Logout and Login as Recruiter
        logHeader('TESTING AS RECRUITER');
        logInstruction('Please logout and login as recruiter to test recruiter-specific forms');
        logInstruction(`Recruiter Email: ${TEST_ACCOUNTS.recruiter.email}`);
        logInstruction(`Recruiter Password: ${TEST_ACCOUNTS.recruiter.password}`);
        
        await question('Press Enter after logging in as recruiter...');
        
        // Test Job Posting Forms
        logHeader('TESTING JOB POSTING FORMS');
        logInstruction('Test recruiter functionalities:');
        logInstruction('1. Navigate to dashboard/job posting section');
        logInstruction('2. Fill out job posting form:');
        logInstruction('   - Job title');
        logInstruction('   - Job description');
        logInstruction('   - Company information');
        logInstruction('   - Location');
        logInstruction('   - Salary range');
        logInstruction('   - Required skills');
        logInstruction('   - Experience requirements');
        logInstruction('   - Application deadline');
        logInstruction('3. Test form validation');
        logInstruction('4. Save as draft');
        logInstruction('5. Publish the job');
        
        await question('Press Enter when you have finished testing job posting...');
        
        // Test Company Profile Forms
        logHeader('TESTING COMPANY PROFILE FORMS');
        logInstruction('Test company profile management:');
        logInstruction('1. Company information form');
        logInstruction('2. Company description');
        logInstruction('3. Company logo upload');
        logInstruction('4. Office locations');
        logInstruction('5. Company culture information');
        logInstruction('6. Benefits and perks');
        
        await question('Press Enter when you have finished testing company forms...');
        
        // Test Other Forms
        logHeader('TESTING OTHER FORMS');
        
        // Contact Form
        await page.goto(`${CONFIG.BASE_URL}/contact`, { waitUntil: 'networkidle0' });
        logSuccess('Navigated to contact page');
        
        logInstruction('Test the contact form:');
        logInstruction('1. Fill out name, email, subject, message');
        logInstruction('2. Test form validation');
        logInstruction('3. Submit the form');
        
        await question('Press Enter when you have finished testing contact form...');
        
        // Test Settings Forms
        logHeader('TESTING SETTINGS FORMS');
        logInstruction('Test account settings forms:');
        logInstruction('1. Password change form');
        logInstruction('2. Email preferences');
        logInstruction('3. Notification settings');
        logInstruction('4. Privacy settings');
        logInstruction('5. Account deletion form');
        
        await question('Press Enter when you have finished testing settings forms...');
        
        // Test Forgot Password Flow
        logHeader('TESTING PASSWORD RESET FLOW');
        logInstruction('Test password reset process:');
        logInstruction('1. Logout from current account');
        logInstruction('2. Go to login page');
        logInstruction('3. Click "Forgot Password"');
        logInstruction('4. Enter email address');
        logInstruction('5. Check email for reset link (if email service is working)');
        logInstruction('6. Test password reset form');
        
        await question('Press Enter when you have finished testing password reset...');
        
        // Final Summary
        logHeader('TESTING COMPLETE');
        logSuccess('Manual form testing session completed!');
        
        const formsToDocument = await question('How many forms did you successfully test? ');
        const issuesFound = await question('How many issues/bugs did you find? ');
        
        logSuccess(`Forms tested: ${formsToDocument}`);
        if (parseInt(issuesFound) > 0) {
            logInstruction(`Issues found: ${issuesFound}`);
            logInstruction('Please document any issues you found for the development team');
        } else {
            logSuccess('No issues found - all forms working correctly!');
        }
        
        logHeader('FORM TESTING SUMMARY');
        logInstruction('Forms that should have been tested:');
        logInstruction('✓ Registration form');
        logInstruction('✓ Login form');
        logInstruction('✓ Profile editing forms');
        logInstruction('✓ Job application forms');
        logInstruction('✓ Job posting forms (recruiter)');
        logInstruction('✓ Search and filter forms');
        logInstruction('✓ Contact form');
        logInstruction('✓ Settings forms');
        logInstruction('✓ Password reset forms');
        logInstruction('✓ Company profile forms');
        
        await question('Press Enter to close the browser and exit...');
        
    } catch (error) {
        console.error('Error during testing:', error);
    } finally {
        await browser.close();
        rl.close();
    }
}

// Run manual testing
startManualFormTesting().catch(console.error);
