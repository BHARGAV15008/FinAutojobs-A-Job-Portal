#!/usr/bin/env node

/**
 * Frontend-Backend Connection Test Script
 * Tests all critical API endpoints and verifies data flow
 */

import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:5000/api';
const TEST_RESULTS_FILE = path.join(__dirname, 'api-test-results.json');

// ANSI color codes
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
};

const log = {
    info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
    success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
    error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
    warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
    section: (msg) => console.log(`\n${colors.cyan}${colors.bright}━━━ ${msg} ━━━${colors.reset}\n`),
};

// Test results storage
const results = {
    timestamp: new Date().toISOString(),
    apiBaseUrl: API_BASE_URL,
    tests: [],
    summary: {
        total: 0,
        passed: 0,
        failed: 0,
        warnings: 0,
    },
};

/**
 * Test an API endpoint
 */
async function testEndpoint(name, endpoint, options = {}) {
    const test = {
        name,
        endpoint,
        method: options.method || 'GET',
        status: 'pending',
        responseTime: 0,
        statusCode: null,
        error: null,
    };

    results.tests.push(test);
    results.summary.total++;

    const startTime = Date.now();

    try {
        log.info(`Testing: ${name}`);
        
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: options.method || 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...(options.headers || {}),
            },
            body: options.body ? JSON.stringify(options.body) : undefined,
        });

        test.responseTime = Date.now() - startTime;
        test.statusCode = response.status;

        const data = await response.json();

        if (response.ok) {
            test.status = 'passed';
            test.response = data;
            results.summary.passed++;
            log.success(`${name} - ${test.responseTime}ms - Status: ${response.status}`);
            
            // Validate response structure if validator provided
            if (options.validator) {
                const validationResult = options.validator(data);
                if (!validationResult.valid) {
                    test.status = 'warning';
                    test.validationError = validationResult.error;
                    results.summary.warnings++;
                    log.warning(`${name} - Response validation warning: ${validationResult.error}`);
                }
            }
        } else {
            test.status = 'failed';
            test.error = data.message || `HTTP ${response.status}`;
            results.summary.failed++;
            log.error(`${name} - Failed: ${test.error}`);
        }
    } catch (error) {
        test.responseTime = Date.now() - startTime;
        test.status = 'failed';
        test.error = error.message;
        results.summary.failed++;
        log.error(`${name} - Error: ${error.message}`);
    }

    return test;
}

/**
 * Run all API tests
 */
async function runTests() {
    log.section('Starting API Connection Tests');
    log.info(`API Base URL: ${API_BASE_URL}`);

    // Test 1: Health Check
    log.section('1. Health Check');
    await testEndpoint(
        'API Health Check',
        '/health',
        {
            validator: (data) => {
                if (!data.status) return { valid: false, error: 'Missing status field' };
                if (data.status !== 'OK') return { valid: false, error: 'Status is not OK' };
                return { valid: true };
            },
        }
    );

    // Test 2: Jobs Endpoint
    log.section('2. Jobs API');
    await testEndpoint(
        'Get All Jobs',
        '/jobs?limit=10',
        {
            validator: (data) => {
                if (!data.success) return { valid: false, error: 'Success flag is false' };
                if (!data.data) return { valid: false, error: 'No data field' };
                if (!data.data.jobs) return { valid: false, error: 'No jobs array' };
                if (!Array.isArray(data.data.jobs)) return { valid: false, error: 'Jobs is not an array' };
                return { valid: true };
            },
        }
    );

    // Test 3: Companies Endpoint
    log.section('3. Companies API');
    await testEndpoint(
        'Get All Companies',
        '/companies?limit=10',
        {
            validator: (data) => {
                if (!data.success && !Array.isArray(data)) {
                    return { valid: false, error: 'Invalid response format' };
                }
                return { valid: true };
            },
        }
    );

    // Test 4: Auth Endpoints
    log.section('4. Authentication API');
    await testEndpoint('Auth Validation (No Token)', '/auth/validate-token');

    // Test 5: Applications Endpoint
    log.section('5. Applications API');
    await testEndpoint('Get Applications (Unauthorized)', '/applications');

    // Test 6: Dashboard Endpoint
    log.section('6. Dashboard API');
    await testEndpoint('Dashboard Stats (Unauthorized)', '/dashboard/stats');

    // Test 7: Notifications Endpoint
    log.section('7. Notifications API');
    await testEndpoint('Get Notifications (Unauthorized)', '/notifications');

    // Test 8: Saved Jobs Endpoint
    log.section('8. Saved Jobs API');
    await testEndpoint('Get Saved Jobs (Unauthorized)', '/saved-jobs');

    // Generate Report
    log.section('Test Summary');
    console.log(`Total Tests: ${results.summary.total}`);
    console.log(`${colors.green}Passed: ${results.summary.passed}${colors.reset}`);
    console.log(`${colors.red}Failed: ${results.summary.failed}${colors.reset}`);
    console.log(`${colors.yellow}Warnings: ${results.summary.warnings}${colors.reset}`);
    
    const successRate = ((results.summary.passed / results.summary.total) * 100).toFixed(2);
    console.log(`\nSuccess Rate: ${successRate}%`);

    // Save results to file
    fs.writeFileSync(TEST_RESULTS_FILE, JSON.stringify(results, null, 2));
    log.success(`Test results saved to: ${TEST_RESULTS_FILE}`);

    // Exit with appropriate code
    if (results.summary.failed > 0) {
        log.error('Some tests failed. Please check the results above.');
        process.exit(1);
    } else if (results.summary.warnings > 0) {
        log.warning('All tests passed but with warnings.');
        process.exit(0);
    } else {
        log.success('All tests passed successfully!');
        process.exit(0);
    }
}

// Run tests
runTests().catch((error) => {
    log.error(`Test suite failed: ${error.message}`);
    console.error(error);
    process.exit(1);
});
