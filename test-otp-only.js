#!/usr/bin/env node

/**
 * OTP Testing Script for FinAutoJobs
 * Focused testing of OTP sending and verification
 * Email: technogenius1500@gmail.com
 */

import fetch from 'node-fetch';
import readline from 'readline';

// Configuration
const CONFIG = {
    BASE_URL: 'http://localhost:5000/api',
    TEST_EMAIL: 'technogenius1500@gmail.com',
    TIMEOUT: 30000
};

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
    log(`\n${'='.repeat(50)}`, 'cyan');
    log(`${message}`, 'cyan');
    log(`${'='.repeat(50)}`, 'cyan');
}

/**
 * HTTP Request Helper
 */
async function makeRequest(endpoint, options = {}) {
    const url = `${CONFIG.BASE_URL}${endpoint}`;
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        timeout: CONFIG.TIMEOUT
    };

    const requestOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers
        }
    };

    try {
        logInfo(`Making ${requestOptions.method || 'GET'} request to: ${endpoint}`);
        const response = await fetch(url, requestOptions);
        const data = await response.json();
        
        return {
            status: response.status,
            ok: response.ok,
            data,
            headers: response.headers
        };
    } catch (error) {
        logError(`Request failed: ${error.message}`);
        return {
            status: 0,
            ok: false,
            data: { error: error.message },
            headers: null
        };
    }
}

/**
 * Wait for user input
 */
function waitForInput(question) {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            rl.close();
            resolve(answer.trim());
        });
    });
}

/**
 * Test OTP Send
 */
async function testOTPSend() {
    logHeader('TESTING OTP SEND');
    
    const requestData = {
        email: CONFIG.TEST_EMAIL,
        purpose: 'verification',
        userData: {
            firstName: 'Test',
            lastName: 'User'
        }
    };
    
    logInfo(`Sending OTP to: ${CONFIG.TEST_EMAIL}`);
    console.log('Request data:', JSON.stringify(requestData, null, 2));
    
    const response = await makeRequest('/otp/send', {
        method: 'POST',
        body: JSON.stringify(requestData)
    });
    
    if (response.ok) {
        logSuccess('OTP sent successfully!');
        console.log('Response:', JSON.stringify(response.data, null, 2));
        return true;
    } else {
        logError('Failed to send OTP');
        console.log('Error response:', JSON.stringify(response.data, null, 2));
        return false;
    }
}

/**
 * Test OTP Verification
 */
async function testOTPVerification() {
    logHeader('TESTING OTP VERIFICATION');
    
    const otp = await waitForInput('Please enter the OTP you received via email: ');
    
    if (!otp) {
        logError('No OTP provided');
        return false;
    }
    
    const requestData = {
        email: CONFIG.TEST_EMAIL,
        otp: otp,
        purpose: 'verification'
    };
    
    logInfo(`Verifying OTP: ${otp}`);
    console.log('Request data:', JSON.stringify(requestData, null, 2));
    
    const response = await makeRequest('/otp/verify', {
        method: 'POST',
        body: JSON.stringify(requestData)
    });
    
    if (response.ok) {
        logSuccess('OTP verified successfully!');
        console.log('Response:', JSON.stringify(response.data, null, 2));
        return true;
    } else {
        logError('Failed to verify OTP');
        console.log('Error response:', JSON.stringify(response.data, null, 2));
        return false;
    }
}

/**
 * Test OTP Stats
 */
async function testOTPStats() {
    logHeader('TESTING OTP STATS');
    
    const response = await makeRequest('/otp/stats');
    
    if (response.ok) {
        logSuccess('OTP stats retrieved successfully!');
        console.log('Stats:', JSON.stringify(response.data, null, 2));
        return true;
    } else {
        logError('Failed to get OTP stats');
        console.log('Error response:', JSON.stringify(response.data, null, 2));
        return false;
    }
}

/**
 * Test OTP Resend
 */
async function testOTPResend() {
    logHeader('TESTING OTP RESEND');
    
    const requestData = {
        email: CONFIG.TEST_EMAIL,
        purpose: 'verification',
        userData: {
            firstName: 'Test',
            lastName: 'User'
        }
    };
    
    logInfo(`Resending OTP to: ${CONFIG.TEST_EMAIL}`);
    
    const response = await makeRequest('/otp/resend', {
        method: 'POST',
        body: JSON.stringify(requestData)
    });
    
    if (response.ok) {
        logSuccess('OTP resent successfully!');
        console.log('Response:', JSON.stringify(response.data, null, 2));
        return true;
    } else {
        logError('Failed to resend OTP');
        console.log('Error response:', JSON.stringify(response.data, null, 2));
        return false;
    }
}

/**
 * Check server health
 */
async function checkServerHealth() {
    logInfo('Checking if server is running...');
    try {
        const response = await makeRequest('/health');
        if (response.ok) {
            logSuccess('Server is running and healthy!');
            console.log('Health check response:', JSON.stringify(response.data, null, 2));
            return true;
        } else {
            logError('Server is not responding properly');
            return false;
        }
    } catch (error) {
        logError(`Cannot connect to server: ${error.message}`);
        logInfo('Please make sure the server is running on http://localhost:5002');
        return false;
    }
}

/**
 * Main OTP Test Runner
 */
async function runOTPTests() {
    console.clear();
    logHeader('FINAUTOJOBS OTP TESTING');
    logInfo(`Testing against: ${CONFIG.BASE_URL}`);
    logInfo(`Test email: ${CONFIG.TEST_EMAIL}`);
    
    // Check server health first
    const serverHealthy = await checkServerHealth();
    if (!serverHealthy) {
        process.exit(1);
    }
    
    let testsPassed = 0;
    let totalTests = 0;
    
    // Test 1: Send OTP
    totalTests++;
    if (await testOTPSend()) {
        testsPassed++;
        
        // Test 2: Verify OTP (only if send was successful)
        totalTests++;
        if (await testOTPVerification()) {
            testsPassed++;
        }
    }
    
    // Test 3: Get OTP Stats
    totalTests++;
    if (await testOTPStats()) {
        testsPassed++;
    }
    
    // Test 4: Resend OTP
    const shouldTestResend = await waitForInput('\nDo you want to test OTP resend? (y/n): ');
    if (shouldTestResend.toLowerCase() === 'y') {
        totalTests++;
        if (await testOTPResend()) {
            testsPassed++;
            
            // Test verification of resent OTP
            const shouldVerifyResent = await waitForInput('Do you want to verify the resent OTP? (y/n): ');
            if (shouldVerifyResent.toLowerCase() === 'y') {
                totalTests++;
                if (await testOTPVerification()) {
                    testsPassed++;
                }
            }
        }
    }
    
    // Print results
    logHeader('OTP TEST RESULTS');
    log(`Total Tests: ${totalTests}`, 'cyan');
    log(`Passed: ${testsPassed}`, 'green');
    log(`Failed: ${totalTests - testsPassed}`, 'red');
    log(`Success Rate: ${((testsPassed / totalTests) * 100).toFixed(1)}%`, 'cyan');
    
    if (testsPassed === totalTests) {
        logSuccess('All OTP tests passed! 🎉');
    } else {
        logError(`${totalTests - testsPassed} test(s) failed`);
    }
    
    return testsPassed === totalTests;
}

// Main execution
async function main() {
    try {
        const success = await runOTPTests();
        process.exit(success ? 0 : 1);
    } catch (error) {
        logError(`Fatal error: ${error.message}`);
        process.exit(1);
    }
}

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
    logError(`Unhandled Rejection: ${reason}`);
    process.exit(1);
});

// Run the tests
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export default { runOTPTests, CONFIG };
