#!/usr/bin/env node

/**
 * Comprehensive API Testing Script for FinAutoJobs
 * Tests all API endpoints including OTP functionality
 * Email: technogenius1500@gmail.com
 */

import fetch from 'node-fetch';
import readline from 'readline';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
    BASE_URL: 'http://localhost:5000/api',
    TEST_EMAIL: 'technogenius1500@gmail.com',
    TEST_PASSWORD: 'TestPassword123!',
    TEST_PHONE: '+919876543210',
    TIMEOUT: 30000
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
    total: 0,
    passed: 0,
    failed: 0,
    skipped: 0,
    results: []
};

// Global variables for storing tokens and data
let authTokens = {
    applicant: null,
    recruiter: null,
    admin: null
};

let testData = {
    userId: null,
    jobId: null,
    applicationId: null,
    companyId: null
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
 * Test Helper Functions
 */
function recordTest(name, passed, message = '', data = null) {
    testResults.total++;
    if (passed) {
        testResults.passed++;
        logSuccess(`${name}: ${message}`);
    } else {
        testResults.failed++;
        logError(`${name}: ${message}`);
    }
    
    testResults.results.push({
        name,
        passed,
        message,
        data,
        timestamp: new Date().toISOString()
    });
}

async function testEndpoint(name, endpoint, options = {}, expectedStatus = 200) {
    try {
        const response = await makeRequest(endpoint, options);
        const passed = response.status === expectedStatus;
        
        recordTest(
            name,
            passed,
            passed ? `Status ${response.status}` : `Expected ${expectedStatus}, got ${response.status}`,
            response.data
        );
        
        return response;
    } catch (error) {
        recordTest(name, false, error.message);
        return null;
    }
}

/**
 * Wait for user input (for OTP verification)
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
 * Test Suites
 */

// 1. Health Check Tests
async function testHealthChecks() {
    logHeader('HEALTH CHECK TESTS');
    
    await testEndpoint('Root Health Check', '/');
    await testEndpoint('API Health Check', '/health');
}

// 2. OTP Tests
async function testOTPFunctionality() {
    logHeader('OTP FUNCTIONALITY TESTS');
    
    // Test OTP send
    logInfo('Testing OTP send functionality...');
    const otpSendResponse = await testEndpoint(
        'Send OTP',
        '/otp/send',
        {
            method: 'POST',
            body: JSON.stringify({
                email: CONFIG.TEST_EMAIL,
                purpose: 'verification',
                userData: {
                    firstName: 'Test',
                    lastName: 'User'
                }
            })
        }
    );

    if (otpSendResponse && otpSendResponse.ok) {
        logSuccess('OTP sent successfully! Check your email.');
        
        // Wait for user to enter OTP
        const otp = await waitForInput('Please enter the OTP you received: ');
        
        if (otp) {
            // Test OTP verification
            await testEndpoint(
                'Verify OTP',
                '/otp/verify',
                {
                    method: 'POST',
                    body: JSON.stringify({
                        email: CONFIG.TEST_EMAIL,
                        otp: otp,
                        purpose: 'verification'
                    })
                }
            );
        } else {
            recordTest('Verify OTP', false, 'No OTP provided by user');
        }
    }

    // Test OTP stats
    await testEndpoint('Get OTP Stats', '/otp/stats');

    // Test OTP resend
    await testEndpoint(
        'Resend OTP',
        '/otp/resend',
        {
            method: 'POST',
            body: JSON.stringify({
                email: CONFIG.TEST_EMAIL,
                purpose: 'verification'
            })
        }
    );
}

// 3. Authentication Tests
async function testAuthentication() {
    logHeader('AUTHENTICATION TESTS');
    
    // Test user registration
    const registerResponse = await testEndpoint(
        'Register User',
        '/auth/register',
        {
            method: 'POST',
            body: JSON.stringify({
                email: CONFIG.TEST_EMAIL,
                password: CONFIG.TEST_PASSWORD,
                firstName: 'Test',
                lastName: 'User',
                role: 'applicant',
                contactNumber: CONFIG.TEST_PHONE
            })
        },
        201
    );

    if (registerResponse && registerResponse.ok) {
        testData.userId = registerResponse.data.data?.user?.id;
    }

    // Test user login
    const loginResponse = await testEndpoint(
        'Login User',
        '/auth/login',
        {
            method: 'POST',
            body: JSON.stringify({
                email: CONFIG.TEST_EMAIL,
                password: CONFIG.TEST_PASSWORD
            })
        }
    );

    if (loginResponse && loginResponse.ok) {
        authTokens.applicant = loginResponse.data.data?.token;
    }

    // Test profile fetch
    if (authTokens.applicant) {
        await testEndpoint(
            'Get User Profile',
            '/auth/profile',
            {
                headers: {
                    'Authorization': `Bearer ${authTokens.applicant}`
                }
            }
        );
    }

    // Test logout
    if (authTokens.applicant) {
        await testEndpoint(
            'Logout User',
            '/auth/logout',
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authTokens.applicant}`
                }
            }
        );
    }
}

// 4. Jobs API Tests
async function testJobsAPI() {
    logHeader('JOBS API TESTS');
    
    // Test get all jobs
    await testEndpoint('Get All Jobs', '/jobs');
    
    // Test job search
    await testEndpoint('Search Jobs', '/jobs/search?q=developer&location=mumbai');
    
    // Test job filters
    await testEndpoint('Filter Jobs', '/jobs/filter?experience=2-5&salary=500000-1000000');
    
    // Test job categories
    await testEndpoint('Get Job Categories', '/jobs/categories');
    
    // Test job locations
    await testEndpoint('Get Job Locations', '/jobs/locations');
}

// 5. Applications API Tests
async function testApplicationsAPI() {
    logHeader('APPLICATIONS API TESTS');
    
    if (!authTokens.applicant) {
        logWarning('No auth token available, skipping applications tests');
        return;
    }
    
    // Test get user applications
    await testEndpoint(
        'Get User Applications',
        '/applications',
        {
            headers: {
                'Authorization': `Bearer ${authTokens.applicant}`
            }
        }
    );
    
    // Test application statistics
    await testEndpoint(
        'Get Application Stats',
        '/applications/stats',
        {
            headers: {
                'Authorization': `Bearer ${authTokens.applicant}`
            }
        }
    );
}

// 6. Companies API Tests
async function testCompaniesAPI() {
    logHeader('COMPANIES API TESTS');
    
    // Test get all companies
    await testEndpoint('Get All Companies', '/companies');
    
    // Test company search
    await testEndpoint('Search Companies', '/companies/search?q=tech');
    
    // Test company details
    await testEndpoint('Get Company Details', '/companies/featured');
}

// 7. Dashboard API Tests
async function testDashboardAPI() {
    logHeader('DASHBOARD API TESTS');
    
    if (!authTokens.applicant) {
        logWarning('No auth token available, skipping dashboard tests');
        return;
    }
    
    // Test dashboard data
    await testEndpoint(
        'Get Dashboard Data',
        '/dashboard',
        {
            headers: {
                'Authorization': `Bearer ${authTokens.applicant}`
            }
        }
    );
}

// 8. Notifications API Tests
async function testNotificationsAPI() {
    logHeader('NOTIFICATIONS API TESTS');
    
    if (!authTokens.applicant) {
        logWarning('No auth token available, skipping notifications tests');
        return;
    }
    
    // Test get notifications
    await testEndpoint(
        'Get Notifications',
        '/notifications',
        {
            headers: {
                'Authorization': `Bearer ${authTokens.applicant}`
            }
        }
    );
}

// 9. Messages API Tests
async function testMessagesAPI() {
    logHeader('MESSAGES API TESTS');
    
    if (!authTokens.applicant) {
        logWarning('No auth token available, skipping messages tests');
        return;
    }
    
    // Test get messages
    await testEndpoint(
        'Get Messages',
        '/messages',
        {
            headers: {
                'Authorization': `Bearer ${authTokens.applicant}`
            }
        }
    );
}

// 10. Analytics API Tests
async function testAnalyticsAPI() {
    logHeader('ANALYTICS API TESTS');
    
    // Test public analytics
    await testEndpoint('Get Public Analytics', '/analytics/public');
}

// 11. Recommendations API Tests
async function testRecommendationsAPI() {
    logHeader('RECOMMENDATIONS API TESTS');
    
    if (!authTokens.applicant) {
        logWarning('No auth token available, skipping recommendations tests');
        return;
    }
    
    // Test get recommendations
    await testEndpoint(
        'Get Job Recommendations',
        '/recommendations',
        {
            headers: {
                'Authorization': `Bearer ${authTokens.applicant}`
            }
        }
    );
}

// 12. SMS OTP Tests
async function testSMSOTP() {
    logHeader('SMS OTP TESTS');
    
    // Test send SMS OTP
    await testEndpoint(
        'Send SMS OTP',
        '/sms-otp/send',
        {
            method: 'POST',
            body: JSON.stringify({
                phoneNumber: CONFIG.TEST_PHONE
            })
        }
    );
}

// 13. Phone Auth Tests
async function testPhoneAuth() {
    logHeader('PHONE AUTHENTICATION TESTS');
    
    // Test phone auth initialization
    await testEndpoint(
        'Initialize Phone Auth',
        '/phone-auth/init',
        {
            method: 'POST',
            body: JSON.stringify({
                phoneNumber: CONFIG.TEST_PHONE
            })
        }
    );
}

// 14. Error Handling Tests
async function testErrorHandling() {
    logHeader('ERROR HANDLING TESTS');
    
    // Test 404 endpoint
    await testEndpoint('Test 404 Error', '/nonexistent-endpoint', {}, 404);
    
    // Test invalid JSON
    await testEndpoint(
        'Test Invalid JSON',
        '/auth/login',
        {
            method: 'POST',
            body: 'invalid json'
        },
        400
    );
    
    // Test missing required fields
    await testEndpoint(
        'Test Missing Fields',
        '/auth/login',
        {
            method: 'POST',
            body: JSON.stringify({})
        },
        400
    );
}

/**
 * Main Test Runner
 */
async function runAllTests() {
    logHeader('FINAUTOJOBS API COMPREHENSIVE TESTING');
    logInfo(`Testing against: ${CONFIG.BASE_URL}`);
    logInfo(`Test email: ${CONFIG.TEST_EMAIL}`);
    
    const startTime = Date.now();
    
    try {
        // Run all test suites
        await testHealthChecks();
        await testOTPFunctionality();
        await testAuthentication();
        await testJobsAPI();
        await testApplicationsAPI();
        await testCompaniesAPI();
        await testDashboardAPI();
        await testNotificationsAPI();
        await testMessagesAPI();
        await testAnalyticsAPI();
        await testRecommendationsAPI();
        await testSMSOTP();
        await testPhoneAuth();
        await testErrorHandling();
        
    } catch (error) {
        logError(`Test execution failed: ${error.message}`);
    }
    
    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);
    
    // Print final results
    logHeader('TEST RESULTS SUMMARY');
    log(`Total Tests: ${testResults.total}`, 'bright');
    log(`Passed: ${testResults.passed}`, 'green');
    log(`Failed: ${testResults.failed}`, 'red');
    log(`Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`, 'cyan');
    log(`Duration: ${duration}s`, 'yellow');
    
    // Print failed tests
    if (testResults.failed > 0) {
        logHeader('FAILED TESTS');
        testResults.results
            .filter(result => !result.passed)
            .forEach(result => {
                logError(`${result.name}: ${result.message}`);
            });
    }
    
    // Save results to file
    const resultsFile = path.join(__dirname, 'test-results.json');
    const fs = await import('fs');
    fs.writeFileSync(resultsFile, JSON.stringify({
        summary: {
            total: testResults.total,
            passed: testResults.passed,
            failed: testResults.failed,
            successRate: ((testResults.passed / testResults.total) * 100).toFixed(1),
            duration: duration,
            timestamp: new Date().toISOString()
        },
        results: testResults.results
    }, null, 2));
    
    logInfo(`Detailed results saved to: ${resultsFile}`);
    
    return testResults.failed === 0;
}

// Check if server is running
async function checkServerHealth() {
    logInfo('Checking if server is running...');
    try {
        const response = await makeRequest('/health');
        if (response.ok) {
            logSuccess('Server is running and healthy!');
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

// Main execution
async function main() {
    console.clear();
    logHeader('FINAUTOJOBS API TESTING SUITE');
    
    // Check server health first
    const serverHealthy = await checkServerHealth();
    if (!serverHealthy) {
        process.exit(1);
    }
    
    // Run all tests
    const success = await runAllTests();
    
    // Exit with appropriate code
    process.exit(success ? 0 : 1);
}

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
    logError(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
    process.exit(1);
});

// Run the tests
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(error => {
        logError(`Fatal error: ${error.message}`);
        process.exit(1);
    });
}

export default {
    runAllTests,
    testOTPFunctionality,
    testAuthentication,
    CONFIG
};
