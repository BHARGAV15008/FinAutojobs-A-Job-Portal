#!/usr/bin/env node

/**
 * Manual Form Testing Guide for FinAutoJobs
 * Opens browser and provides guided testing
 */

import puppeteer from 'puppeteer';
import readline from 'readline';

const CONFIG = {
    BASE_URL: 'http://localhost:3000',
    TIMEOUT: 30000
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

async function startManualTesting() {
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
        
        // Test Home Page
        logHeader('TESTING HOME PAGE');
        await question('Press Enter to continue to test the home page forms...');
        
        const homeForms = await page.$$eval('form', forms => forms.length);
        logInfo(`Found ${homeForms} forms on home page`);
        
        // Test Registration Page
        logHeader('TESTING REGISTRATION PAGE');
        await question('Press Enter to navigate to registration page...');
        
        await page.goto(`${CONFIG.BASE_URL}/register`, { waitUntil: 'networkidle0' });
        logSuccess('Navigated to registration page');
        
        const regForms = await page.$$eval('form', forms => forms.length);
        logInfo(`Found ${regForms} forms on registration page`);
        
        // Guide user through registration
        logInfo('Now you can manually test the registration form:');
        logInfo('1. Try filling out the form with test data');
        logInfo('2. Test form validation');
        logInfo('3. Test role selection (applicant/recruiter)');
        logInfo('4. Test password visibility toggle');
        logInfo('5. Test terms and conditions checkbox');
        
        await question('Press Enter when you have finished testing the registration form...');
        
        // Test Login Page
        logHeader('TESTING LOGIN PAGE');
        await page.goto(`${CONFIG.BASE_URL}/login`, { waitUntil: 'networkidle0' });
        logSuccess('Navigated to login page');
        
        const loginForms = await page.$$eval('form', forms => forms.length);
        logInfo(`Found ${loginForms} forms on login page`);
        
        logInfo('Test the login form:');
        logInfo('1. Test email/username input');
        logInfo('2. Test password input');
        logInfo('3. Test role selection');
        logInfo('4. Test remember me checkbox');
        logInfo('5. Test forgot password link');
        
        await question('Press Enter when you have finished testing the login form...');
        
        // Test other pages
        const pagesToTest = [
            { url: '/forgot-password', name: 'Forgot Password' },
            { url: '/contact', name: 'Contact' },
            { url: '/jobs', name: 'Jobs Search' },
            { url: '/companies', name: 'Companies' }
        ];
        
        for (const pageInfo of pagesToTest) {
            try {
                logHeader(`TESTING ${pageInfo.name.toUpperCase()} PAGE`);
                await page.goto(`${CONFIG.BASE_URL}${pageInfo.url}`, { waitUntil: 'networkidle0' });
                
                const forms = await page.$$eval('form', forms => forms.length);
                logInfo(`Found ${forms} forms on ${pageInfo.name} page`);
                
                if (forms > 0) {
                    logInfo(`Please test all forms on the ${pageInfo.name} page`);
                    await question('Press Enter when finished testing this page...');
                }
            } catch (error) {
                logInfo(`Could not access ${pageInfo.name} page: ${error.message}`);
            }
        }
        
        // Summary
        logHeader('TESTING COMPLETE');
        logSuccess('Manual testing session completed!');
        logInfo('Please check the browser for any remaining forms or interactions to test');
        
        await question('Press Enter to close the browser and exit...');
        
    } catch (error) {
        console.error('Error during testing:', error);
    } finally {
        await browser.close();
        rl.close();
    }
}

// Run manual testing
startManualTesting().catch(console.error);
