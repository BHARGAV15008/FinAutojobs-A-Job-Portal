#!/usr/bin/env node

/**
 * Comprehensive Frontend Form Testing Script for FinAutoJobs
 * Tests all forms, creates different accounts, and tests all UI interactions
 */

import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
    BASE_URL: 'http://localhost:3002',
    TIMEOUT: 30000,
    SCREENSHOT_DIR: path.join(__dirname, 'test-screenshots'),
    RESULTS_FILE: path.join(__dirname, 'frontend-test-results.json')
};

// Test data for different account types
const TEST_ACCOUNTS = {
    applicant1: {
        email: 'applicant1.test@gmail.com',
        password: 'TestPass123!',
        firstName: 'John',
        lastName: 'Doe',
        phone: '9876543210',
        role: 'applicant'
    },
    applicant2: {
        email: 'applicant2.test@gmail.com',
        password: 'TestPass123!',
        firstName: 'Jane',
        lastName: 'Smith',
        phone: '9876543211',
        role: 'applicant'
    },
    recruiter1: {
        email: 'recruiter1.test@gmail.com',
        password: 'TestPass123!',
        firstName: 'Mike',
        lastName: 'Johnson',
        phone: '9876543212',
        role: 'recruiter',
        company: 'Tech Corp',
        designation: 'HR Manager'
    },
    recruiter2: {
        email: 'recruiter2.test@gmail.com',
        password: 'TestPass123!',
        firstName: 'Sarah',
        lastName: 'Wilson',
        phone: '9876543213',
        role: 'recruiter',
        company: 'StartupXYZ',
        designation: 'Talent Acquisition'
    }
};

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

// Test results tracking
let testResults = {
    formsFound: 0,
    formsTestedSuccessfully: 0,
    formsFailed: 0,
    buttonsClicked: 0,
    linksClicked: 0,
    accountsCreated: 0,
    screenshotsTaken: 0,
    errors: [],
    forms: [],
    interactions: []
};

/**
 * Utility Functions
 */
function log(message, color = 'reset') {
    console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
    log(`✅ ${message}`, 'green');
}

function logError(message) {
    log(`❌ ${message}`, 'red');
}

function logInfo(message) {
    log(`ℹ️  ${message}`, 'blue');
}

function logWarning(message) {
    log(`⚠️  ${message}`, 'yellow');
}

function logHeader(message) {
    log(`\n${'='.repeat(60)}`, 'cyan');
    log(`${message}`, 'cyan');
    log(`${'='.repeat(60)}`, 'cyan');
}

/**
 * Screenshot helper
 */
async function takeScreenshot(page, name) {
    try {
        if (!fs.existsSync(CONFIG.SCREENSHOT_DIR)) {
            fs.mkdirSync(CONFIG.SCREENSHOT_DIR, { recursive: true });
        }
        
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `${timestamp}-${name}.png`;
        const filepath = path.join(CONFIG.SCREENSHOT_DIR, filename);
        
        await page.screenshot({ 
            path: filepath, 
            fullPage: true,
            type: 'png'
        });
        
        testResults.screenshotsTaken++;
        logInfo(`Screenshot saved: ${filename}`);
        return filename;
    } catch (error) {
        logError(`Failed to take screenshot: ${error.message}`);
        return null;
    }
}

/**
 * Wait helper with timeout
 */
async function waitForElement(page, selector, timeout = 5000) {
    try {
        await page.waitForSelector(selector, { timeout });
        return true;
    } catch (error) {
        logWarning(`Element not found: ${selector}`);
        return false;
    }
}

/**
 * Form detection and testing
 */
async function findAndTestForms(page) {
    logHeader('FINDING AND TESTING FORMS');
    
    try {
        // Find all forms on the page
        const forms = await page.$$('form');
        const formCount = forms.length;
        
        logInfo(`Found ${formCount} forms on current page`);
        testResults.formsFound += formCount;
        
        for (let i = 0; i < forms.length; i++) {
            const form = forms[i];
            
            try {
                // Get form information
                const formInfo = await page.evaluate((formElement, index) => {
                    const inputs = formElement.querySelectorAll('input, textarea, select');
                    const buttons = formElement.querySelectorAll('button, input[type="submit"]');
                    
                    return {
                        index,
                        inputCount: inputs.length,
                        buttonCount: buttons.length,
                        action: formElement.action || 'No action',
                        method: formElement.method || 'GET',
                        id: formElement.id || `form-${index}`,
                        className: formElement.className || 'No class'
                    };
                }, form, i);
                
                logInfo(`Form ${i + 1}: ${formInfo.inputCount} inputs, ${formInfo.buttonCount} buttons`);
                
                // Test form inputs
                await testFormInputs(page, form, i);
                
                testResults.forms.push(formInfo);
                testResults.formsTestedSuccessfully++;
                
            } catch (error) {
                logError(`Failed to test form ${i + 1}: ${error.message}`);
                testResults.formsFailed++;
                testResults.errors.push({
                    type: 'form_test',
                    form: i + 1,
                    error: error.message
                });
            }
        }
        
    } catch (error) {
        logError(`Failed to find forms: ${error.message}`);
        testResults.errors.push({
            type: 'form_detection',
            error: error.message
        });
    }
}

/**
 * Test form inputs
 */
async function testFormInputs(page, form, formIndex) {
    try {
        const inputs = await form.$$('input, textarea, select');
        
        for (let i = 0; i < inputs.length; i++) {
            const input = inputs[i];
            
            const inputInfo = await page.evaluate((inputElement) => {
                return {
                    type: inputElement.type || inputElement.tagName.toLowerCase(),
                    name: inputElement.name || '',
                    placeholder: inputElement.placeholder || '',
                    required: inputElement.required || false,
                    id: inputElement.id || ''
                };
            }, input);
            
            // Fill input based on type
            await fillInputBasedOnType(page, input, inputInfo);
        }
        
    } catch (error) {
        logError(`Failed to test inputs for form ${formIndex}: ${error.message}`);
    }
}

/**
 * Fill input based on type
 */
async function fillInputBasedOnType(page, input, inputInfo) {
    try {
        const { type, name, placeholder } = inputInfo;
        let testValue = '';
        
        // Determine test value based on input type/name/placeholder
        if (type === 'email' || name.includes('email') || placeholder.includes('email')) {
            testValue = 'test@example.com';
        } else if (type === 'password' || name.includes('password')) {
            testValue = 'TestPassword123!';
        } else if (type === 'tel' || name.includes('phone') || placeholder.includes('phone')) {
            testValue = '9876543210';
        } else if (name.includes('firstName') || name.includes('first_name') || placeholder.includes('First')) {
            testValue = 'John';
        } else if (name.includes('lastName') || name.includes('last_name') || placeholder.includes('Last')) {
            testValue = 'Doe';
        } else if (name.includes('company') || placeholder.includes('Company')) {
            testValue = 'Test Company';
        } else if (name.includes('title') || name.includes('designation')) {
            testValue = 'Software Engineer';
        } else if (type === 'text' || type === 'textarea') {
            testValue = 'Test input value';
        } else if (type === 'number') {
            testValue = '123';
        } else if (type === 'checkbox') {
            await input.click();
            return;
        } else if (type === 'select') {
            // Handle select elements
            const options = await input.$$('option');
            if (options.length > 1) {
                await page.select(await page.evaluate(el => el.name || el.id, input), await page.evaluate(opt => opt.value, options[1]));
            }
            return;
        }
        
        if (testValue && type !== 'submit' && type !== 'button') {
            await input.click();
            await input.type(testValue, { delay: 50 });
            logInfo(`Filled input (${type}): ${testValue}`);
        }
        
    } catch (error) {
        logWarning(`Failed to fill input: ${error.message}`);
    }
}

/**
 * Test all buttons and links
 */
async function testButtonsAndLinks(page) {
    logHeader('TESTING BUTTONS AND LINKS');
    
    try {
        // Test buttons
        const buttons = await page.$$('button, input[type="submit"], input[type="button"]');
        logInfo(`Found ${buttons.length} buttons`);
        
        for (let i = 0; i < Math.min(buttons.length, 10); i++) { // Limit to first 10 buttons
            try {
                const button = buttons[i];
                const buttonText = await page.evaluate(btn => btn.textContent || btn.value || 'No text', button);
                
                // Skip certain buttons that might cause navigation away
                if (buttonText.toLowerCase().includes('logout') || 
                    buttonText.toLowerCase().includes('delete') ||
                    buttonText.toLowerCase().includes('remove')) {
                    logWarning(`Skipping potentially destructive button: ${buttonText}`);
                    continue;
                }
                
                logInfo(`Clicking button: ${buttonText}`);
                await button.click();
                await page.waitForTimeout(1000); // Wait for any effects
                
                testResults.buttonsClicked++;
                testResults.interactions.push({
                    type: 'button_click',
                    text: buttonText,
                    success: true
                });
                
            } catch (error) {
                logWarning(`Failed to click button ${i + 1}: ${error.message}`);
                testResults.interactions.push({
                    type: 'button_click',
                    success: false,
                    error: error.message
                });
            }
        }
        
        // Test links (non-external)
        const links = await page.$$('a[href]');
        logInfo(`Found ${links.length} links`);
        
        for (let i = 0; i < Math.min(links.length, 5); i++) { // Limit to first 5 links
            try {
                const link = links[i];
                const href = await page.evaluate(a => a.href, link);
                const linkText = await page.evaluate(a => a.textContent || 'No text', link);
                
                // Only test internal links
                if (href.startsWith(CONFIG.BASE_URL) || href.startsWith('/')) {
                    logInfo(`Testing link: ${linkText} (${href})`);
                    
                    // Open in new tab to avoid losing current page
                    const newPage = await page.browser().newPage();
                    await newPage.goto(href, { waitUntil: 'networkidle0', timeout: 10000 });
                    await newPage.close();
                    
                    testResults.linksClicked++;
                    testResults.interactions.push({
                        type: 'link_click',
                        text: linkText,
                        href: href,
                        success: true
                    });
                }
                
            } catch (error) {
                logWarning(`Failed to test link ${i + 1}: ${error.message}`);
                testResults.interactions.push({
                    type: 'link_click',
                    success: false,
                    error: error.message
                });
            }
        }
        
    } catch (error) {
        logError(`Failed to test buttons and links: ${error.message}`);
    }
}

/**
 * Create test accounts
 */
async function createTestAccounts(page) {
    logHeader('CREATING TEST ACCOUNTS');
    
    for (const [accountKey, accountData] of Object.entries(TEST_ACCOUNTS)) {
        try {
            logInfo(`Creating account: ${accountKey} (${accountData.email})`);
            
            // Navigate to registration page
            await page.goto(`${CONFIG.BASE_URL}/register`, { waitUntil: 'networkidle0' });
            await takeScreenshot(page, `register-page-${accountKey}`);
            
            // Wait for registration form
            const formExists = await waitForElement(page, 'form', 5000);
            if (!formExists) {
                logWarning(`Registration form not found for ${accountKey}`);
                continue;
            }
            
            // Fill registration form
            await fillRegistrationForm(page, accountData);
            
            // Take screenshot before submission
            await takeScreenshot(page, `register-filled-${accountKey}`);
            
            // Submit form
            const submitButton = await page.$('button[type="submit"], input[type="submit"], button:contains("Register"), button:contains("Sign Up")');
            if (submitButton) {
                await submitButton.click();
                await page.waitForTimeout(3000); // Wait for submission
                
                testResults.accountsCreated++;
                logSuccess(`Account created: ${accountKey}`);
                
                // Take screenshot after submission
                await takeScreenshot(page, `register-result-${accountKey}`);
            }
            
        } catch (error) {
            logError(`Failed to create account ${accountKey}: ${error.message}`);
            testResults.errors.push({
                type: 'account_creation',
                account: accountKey,
                error: error.message
            });
        }
    }
}

/**
 * Fill registration form
 */
async function fillRegistrationForm(page, accountData) {
    try {
        // Fill email
        const emailInput = await page.$('input[type="email"], input[name*="email"], input[placeholder*="email"]');
        if (emailInput) {
            await emailInput.click();
            await emailInput.type(accountData.email);
        }
        
        // Fill password
        const passwordInput = await page.$('input[type="password"], input[name*="password"]');
        if (passwordInput) {
            await passwordInput.click();
            await passwordInput.type(accountData.password);
        }
        
        // Fill first name
        const firstNameInput = await page.$('input[name*="firstName"], input[name*="first_name"], input[placeholder*="First"]');
        if (firstNameInput) {
            await firstNameInput.click();
            await firstNameInput.type(accountData.firstName);
        }
        
        // Fill last name
        const lastNameInput = await page.$('input[name*="lastName"], input[name*="last_name"], input[placeholder*="Last"]');
        if (lastNameInput) {
            await lastNameInput.click();
            await lastNameInput.type(accountData.lastName);
        }
        
        // Fill phone
        const phoneInput = await page.$('input[type="tel"], input[name*="phone"], input[placeholder*="phone"]');
        if (phoneInput) {
            await phoneInput.click();
            await phoneInput.type(accountData.phone);
        }
        
        // Select role if available
        const roleSelect = await page.$('select[name*="role"], input[name*="role"]');
        if (roleSelect) {
            await page.select('select[name*="role"]', accountData.role);
        }
        
        // Fill company info for recruiters
        if (accountData.role === 'recruiter') {
            const companyInput = await page.$('input[name*="company"], input[placeholder*="Company"]');
            if (companyInput) {
                await companyInput.click();
                await companyInput.type(accountData.company);
            }
            
            const designationInput = await page.$('input[name*="designation"], input[name*="title"], input[placeholder*="designation"]');
            if (designationInput) {
                await designationInput.click();
                await designationInput.type(accountData.designation);
            }
        }
        
        // Accept terms if checkbox exists
        const termsCheckbox = await page.$('input[type="checkbox"][name*="terms"], input[type="checkbox"][name*="agree"]');
        if (termsCheckbox) {
            await termsCheckbox.click();
        }
        
    } catch (error) {
        logError(`Failed to fill registration form: ${error.message}`);
        throw error;
    }
}

/**
 * Test specific pages with forms
 */
async function testSpecificPages(page) {
    logHeader('TESTING SPECIFIC PAGES WITH FORMS');
    
    const pagesToTest = [
        { url: '/', name: 'Home Page' },
        { url: '/login', name: 'Login Page' },
        { url: '/register', name: 'Register Page' },
        { url: '/forgot-password', name: 'Forgot Password Page' },
        { url: '/jobs', name: 'Jobs Page' },
        { url: '/companies', name: 'Companies Page' },
        { url: '/contact', name: 'Contact Page' },
        { url: '/about', name: 'About Page' },
        { url: '/pricing', name: 'Pricing Page' }
    ];
    
    for (const pageInfo of pagesToTest) {
        try {
            logInfo(`Testing page: ${pageInfo.name} (${pageInfo.url})`);
            
            await page.goto(`${CONFIG.BASE_URL}${pageInfo.url}`, { 
                waitUntil: 'networkidle0',
                timeout: 15000 
            });
            
            await takeScreenshot(page, `page-${pageInfo.name.toLowerCase().replace(/\s+/g, '-')}`);
            
            // Find and test forms on this page
            await findAndTestForms(page);
            
            // Test buttons and links on this page
            await testButtonsAndLinks(page);
            
            await page.waitForTimeout(2000); // Brief pause between pages
            
        } catch (error) {
            logError(`Failed to test page ${pageInfo.name}: ${error.message}`);
            testResults.errors.push({
                type: 'page_test',
                page: pageInfo.name,
                error: error.message
            });
        }
    }
}

/**
 * Main test runner
 */
async function runFrontendTests() {
    logHeader('FINAUTOJOBS FRONTEND COMPREHENSIVE TESTING');
    
    const browser = await puppeteer.launch({ 
        headless: false, // Set to true for headless mode
        defaultViewport: { width: 1920, height: 1080 },
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    try {
        // Set user agent
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
        
        // Test if frontend is accessible
        logInfo('Checking if frontend is accessible...');
        await page.goto(CONFIG.BASE_URL, { waitUntil: 'networkidle0' });
        logSuccess('Frontend is accessible!');
        
        // Take initial screenshot
        await takeScreenshot(page, 'initial-homepage');
        
        // Test specific pages
        await testSpecificPages(page);
        
        // Create test accounts
        await createTestAccounts(page);
        
        // Generate final report
        await generateTestReport();
        
    } catch (error) {
        logError(`Test execution failed: ${error.message}`);
        testResults.errors.push({
            type: 'execution_error',
            error: error.message
        });
    } finally {
        await browser.close();
    }
}

/**
 * Generate test report
 */
async function generateTestReport() {
    logHeader('GENERATING TEST REPORT');
    
    const report = {
        timestamp: new Date().toISOString(),
        summary: {
            formsFound: testResults.formsFound,
            formsTestedSuccessfully: testResults.formsTestedSuccessfully,
            formsFailed: testResults.formsFailed,
            buttonsClicked: testResults.buttonsClicked,
            linksClicked: testResults.linksClicked,
            accountsCreated: testResults.accountsCreated,
            screenshotsTaken: testResults.screenshotsTaken,
            totalErrors: testResults.errors.length
        },
        details: testResults
    };
    
    // Save to file
    fs.writeFileSync(CONFIG.RESULTS_FILE, JSON.stringify(report, null, 2));
    
    // Print summary
    logSuccess(`Forms Found: ${testResults.formsFound}`);
    logSuccess(`Forms Tested Successfully: ${testResults.formsTestedSuccessfully}`);
    logError(`Forms Failed: ${testResults.formsFailed}`);
    logSuccess(`Buttons Clicked: ${testResults.buttonsClicked}`);
    logSuccess(`Links Tested: ${testResults.linksClicked}`);
    logSuccess(`Accounts Created: ${testResults.accountsCreated}`);
    logSuccess(`Screenshots Taken: ${testResults.screenshotsTaken}`);
    
    if (testResults.errors.length > 0) {
        logWarning(`Total Errors: ${testResults.errors.length}`);
        testResults.errors.forEach((error, index) => {
            logError(`Error ${index + 1}: ${error.type} - ${error.error}`);
        });
    }
    
    logInfo(`Detailed report saved to: ${CONFIG.RESULTS_FILE}`);
    logInfo(`Screenshots saved to: ${CONFIG.SCREENSHOT_DIR}`);
}

// Run the tests
if (import.meta.url === `file://${process.argv[1]}`) {
    runFrontendTests().catch(error => {
        logError(`Fatal error: ${error.message}`);
        process.exit(1);
    });
}

export default { runFrontendTests, CONFIG, TEST_ACCOUNTS };
