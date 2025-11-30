#!/usr/bin/env node

/**
 * Create Test Accounts Script for FinAutoJobs
 * Creates multiple test accounts for comprehensive testing
 */

import fetch from 'node-fetch';

const CONFIG = {
    API_BASE_URL: 'http://192.168.41.134:5000/api',
    FRONTEND_URL: 'http://192.168.41.134:3000'
};

const TEST_ACCOUNTS = [
    {
        name: 'Applicant 1',
        email: 'applicant1.test@gmail.com',
        password: 'TestPass123!',
        firstName: 'John',
        lastName: 'Doe',
        phone: '9876543210',
        role: 'applicant'
    },
    {
        name: 'Applicant 2',
        email: 'applicant2.test@gmail.com',
        password: 'TestPass123!',
        firstName: 'Jane',
        lastName: 'Smith',
        phone: '9876543211',
        role: 'applicant'
    },
    {
        name: 'Recruiter 1',
        email: 'recruiter1.test@gmail.com',
        password: 'TestPass123!',
        firstName: 'Mike',
        lastName: 'Johnson',
        phone: '9876543212',
        role: 'recruiter'
    },
    {
        name: 'Recruiter 2',
        email: 'recruiter2.test@gmail.com',
        password: 'TestPass123!',
        firstName: 'Sarah',
        lastName: 'Wilson',
        phone: '9876543213',
        role: 'recruiter'
    }
];

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

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

function logHeader(message) {
    log(`\n${'='.repeat(60)}`, 'cyan');
    log(`${message}`, 'cyan');
    log(`${'='.repeat(60)}`, 'cyan');
}

async function createAccount(accountData) {
    try {
        logInfo(`Creating account: ${accountData.name} (${accountData.email})`);
        
        const response = await fetch(`${CONFIG.API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(accountData)
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            logSuccess(`Account created successfully: ${accountData.name}`);
            return {
                success: true,
                account: accountData,
                result: result
            };
        } else {
            logError(`Failed to create account ${accountData.name}: ${result.message || 'Unknown error'}`);
            return {
                success: false,
                account: accountData,
                error: result.message || 'Unknown error'
            };
        }
        
    } catch (error) {
        logError(`Error creating account ${accountData.name}: ${error.message}`);
        return {
            success: false,
            account: accountData,
            error: error.message
        };
    }
}

async function testLogin(accountData) {
    try {
        logInfo(`Testing login for: ${accountData.email}`);
        
        const response = await fetch(`${CONFIG.API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                identifier: accountData.email,
                password: accountData.password,
                role: accountData.role
            })
        });
        
        const result = await response.json();
        
        if (response.ok && result.success) {
            logSuccess(`Login successful: ${accountData.email}`);
            return {
                success: true,
                token: result.data.token,
                user: result.data.user
            };
        } else {
            logError(`Login failed for ${accountData.email}: ${result.message || 'Unknown error'}`);
            return {
                success: false,
                error: result.message || 'Unknown error'
            };
        }
        
    } catch (error) {
        logError(`Error testing login for ${accountData.email}: ${error.message}`);
        return {
            success: false,
            error: error.message
        };
    }
}

async function checkServerHealth() {
    try {
        logInfo('Checking server health...');
        
        const response = await fetch(`${CONFIG.API_BASE_URL}/health`);
        const result = await response.json();
        
        if (response.ok && result.status === 'OK') {
            logSuccess('Server is healthy and ready');
            return true;
        } else {
            logError('Server health check failed');
            return false;
        }
        
    } catch (error) {
        logError(`Server health check error: ${error.message}`);
        return false;
    }
}

async function createAllTestAccounts() {
    logHeader('CREATING TEST ACCOUNTS FOR FINAUTOJOBS');
    
    // Check server health first
    const serverHealthy = await checkServerHealth();
    if (!serverHealthy) {
        logError('Server is not healthy. Please ensure the backend is running.');
        return;
    }
    
    const results = {
        created: 0,
        failed: 0,
        loginTested: 0,
        accounts: []
    };
    
    // Create accounts
    for (const accountData of TEST_ACCOUNTS) {
        const createResult = await createAccount(accountData);
        
        if (createResult.success) {
            results.created++;
            
            // Test login immediately
            await new Promise(resolve => setTimeout(resolve, 1000)); // Brief delay
            const loginResult = await testLogin(accountData);
            
            if (loginResult.success) {
                results.loginTested++;
            }
            
            results.accounts.push({
                ...createResult,
                loginTest: loginResult
            });
        } else {
            results.failed++;
            results.accounts.push(createResult);
        }
        
        // Brief delay between account creations
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // Print summary
    logHeader('ACCOUNT CREATION SUMMARY');
    logSuccess(`Accounts Created: ${results.created}/${TEST_ACCOUNTS.length}`);
    logError(`Accounts Failed: ${results.failed}`);
    logSuccess(`Login Tests Passed: ${results.loginTested}/${results.created}`);
    
    // Print account details
    logHeader('ACCOUNT DETAILS');
    results.accounts.forEach((result, index) => {
        const account = result.account;
        log(`\n👤 ${account.name}:`, 'cyan');
        log(`   Email: ${account.email}`, 'blue');
        log(`   Password: ${account.password}`, 'blue');
        log(`   Role: ${account.role}`, 'blue');
        log(`   Status: ${result.success ? '✅ Created' : '❌ Failed'}`, result.success ? 'green' : 'red');
        
        if (result.loginTest) {
            log(`   Login: ${result.loginTest.success ? '✅ Working' : '❌ Failed'}`, result.loginTest.success ? 'green' : 'red');
        }
    });
    
    // Frontend testing instructions
    logHeader('FRONTEND TESTING INSTRUCTIONS');
    logInfo(`Frontend URL: ${CONFIG.FRONTEND_URL}`);
    logInfo('You can now use these accounts to test all forms in the frontend:');
    log('1. Open the frontend in your browser', 'yellow');
    log('2. Test registration forms with new data', 'yellow');
    log('3. Test login forms with the created accounts', 'yellow');
    log('4. Test profile forms after logging in', 'yellow');
    log('5. Test job application forms', 'yellow');
    log('6. Test all other forms and interactions', 'yellow');
    
    return results;
}

// Run the script
if (import.meta.url === `file://${process.argv[1]}`) {
    createAllTestAccounts().catch(error => {
        logError(`Fatal error: ${error.message}`);
        process.exit(1);
    });
}

export default { createAllTestAccounts, TEST_ACCOUNTS, CONFIG };
