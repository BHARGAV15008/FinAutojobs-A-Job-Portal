import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000/api';

class EdgeCaseTester {
    constructor() {
        this.results = [];
    }

    log(message, type = 'info') {
        const timestamp = new Date().toISOString();
        const prefix = {
            info: '🧪',
            success: '✅',
            error: '❌',
            warning: '⚠️'
        }[type] || '🧪';
        
        console.log(`${prefix} ${message}`);
        this.results.push({ timestamp, type, message });
    }

    async makeRequest(endpoint, options = {}) {
        try {
            const url = `${BASE_URL}${endpoint}`;
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });
            
            const data = await response.json();
            return { response, data, status: response.status };
        } catch (error) {
            return { error: error.message, status: 0 };
        }
    }

    async testEdgeCases() {
        console.log('🧪 Testing Edge Cases and Error Scenarios\n');

        // Test 1: Invalid JSON payload
        this.log('Testing invalid JSON payload');
        const { status: invalidJsonStatus } = await this.makeRequest('/auth/register', {
            method: 'POST',
            body: 'invalid json{'
        });
        
        if (invalidJsonStatus === 400 || invalidJsonStatus === 500) {
            this.log('Invalid JSON properly handled', 'success');
        } else {
            this.log('Invalid JSON handling needs improvement', 'warning');
        }

        // Test 2: Missing required fields
        this.log('Testing missing required fields in registration');
        const { data: missingFields, status: missingStatus } = await this.makeRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ username: 'test' }) // Missing email and password
        });
        
        if (missingStatus === 400 && missingFields.message) {
            this.log('Missing fields validation working', 'success');
        } else {
            this.log('Missing fields validation needs improvement', 'warning');
        }

        // Test 3: Extremely long input strings
        this.log('Testing extremely long input strings');
        const longString = 'a'.repeat(10000);
        const { status: longStringStatus } = await this.makeRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify({
                username: longString,
                email: 'test@example.com',
                password: 'Test123!'
            })
        });
        
        if (longStringStatus === 400 || longStringStatus === 413) {
            this.log('Long input strings properly handled', 'success');
        } else {
            this.log('Long input string handling could be improved', 'warning');
        }

        // Test 4: SQL injection attempts
        this.log('Testing SQL injection prevention');
        const sqlInjection = "'; DROP TABLE users; --";
        const { status: sqlStatus } = await this.makeRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify({
                username: sqlInjection,
                email: 'test@example.com',
                password: 'Test123!'
            })
        });
        
        if (sqlStatus !== 500) {
            this.log('SQL injection attempts properly handled', 'success');
        } else {
            this.log('SQL injection handling needs attention', 'error');
        }

        // Test 5: XSS attempts
        this.log('Testing XSS prevention');
        const xssPayload = '<script>alert("xss")</script>';
        const { data: xssResult, status: xssStatus } = await this.makeRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify({
                username: xssPayload,
                email: 'test@example.com',
                password: 'Test123!'
            })
        });
        
        if (xssStatus === 201 || xssStatus === 200) {
            // Check if XSS payload is sanitized in response
            if (!JSON.stringify(xssResult).includes('<script>')) {
                this.log('XSS payload properly sanitized', 'success');
            } else {
                this.log('XSS sanitization needs improvement', 'warning');
            }
        }

        // Test 6: Invalid email formats
        this.log('Testing invalid email format validation');
        const invalidEmails = ['invalid', 'test@', '@example.com', 'test..test@example.com'];
        let emailValidationWorking = true;
        
        for (const email of invalidEmails) {
            const { status } = await this.makeRequest('/auth/register', {
                method: 'POST',
                body: JSON.stringify({
                    username: 'testuser',
                    email: email,
                    password: 'Test123!'
                })
            });
            
            if (status === 201 || status === 200) {
                emailValidationWorking = false;
                break;
            }
        }
        
        if (emailValidationWorking) {
            this.log('Email format validation working', 'success');
        } else {
            this.log('Email format validation needs improvement', 'warning');
        }

        // Test 7: Weak password handling
        this.log('Testing weak password validation');
        const weakPasswords = ['123', 'password', 'abc'];
        let passwordValidationWorking = true;
        
        for (const password of weakPasswords) {
            const { status } = await this.makeRequest('/auth/register', {
                method: 'POST',
                body: JSON.stringify({
                    username: 'testuser' + Date.now(),
                    email: 'test@example.com',
                    password: password
                })
            });
            
            if (status === 201 || status === 200) {
                passwordValidationWorking = false;
                break;
            }
        }
        
        if (passwordValidationWorking) {
            this.log('Password strength validation working', 'success');
        } else {
            this.log('Password strength validation could be enhanced', 'warning');
        }

        // Test 8: Duplicate user registration
        this.log('Testing duplicate user registration');
        const duplicateUser = {
            username: 'duplicate_test_' + Date.now(),
            email: 'duplicate@test.com',
            password: 'Test123!'
        };
        
        // Register first time
        await this.makeRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify(duplicateUser)
        });
        
        // Try to register again
        const { status: duplicateStatus } = await this.makeRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify(duplicateUser)
        });
        
        if (duplicateStatus === 400 || duplicateStatus === 409) {
            this.log('Duplicate user registration properly prevented', 'success');
        } else {
            this.log('Duplicate user registration handling needs improvement', 'warning');
        }

        // Test 9: Invalid authentication token
        this.log('Testing invalid authentication token');
        const { status: invalidTokenStatus } = await this.makeRequest('/users/profile', {
            headers: { 'Authorization': 'Bearer invalid-token-123' }
        });
        
        if (invalidTokenStatus === 401 || invalidTokenStatus === 403) {
            this.log('Invalid token properly rejected', 'success');
        } else {
            this.log('Invalid token handling needs improvement', 'warning');
        }

        // Test 10: Malformed authorization header
        this.log('Testing malformed authorization header');
        const { status: malformedAuthStatus } = await this.makeRequest('/users/profile', {
            headers: { 'Authorization': 'InvalidFormat token123' }
        });
        
        if (malformedAuthStatus === 401 || malformedAuthStatus === 400) {
            this.log('Malformed auth header properly handled', 'success');
        } else {
            this.log('Malformed auth header handling could be improved', 'warning');
        }

        // Test 11: Large file upload simulation
        this.log('Testing large payload handling');
        const largePayload = {
            username: 'test',
            email: 'test@example.com',
            password: 'Test123!',
            bio: 'x'.repeat(100000) // 100KB string
        };
        
        const { status: largePayloadStatus } = await this.makeRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify(largePayload)
        });
        
        if (largePayloadStatus === 413 || largePayloadStatus === 400) {
            this.log('Large payload properly limited', 'success');
        } else {
            this.log('Large payload handling working (no limits detected)', 'warning');
        }

        // Test 12: Concurrent duplicate operations
        this.log('Testing concurrent duplicate operations');
        const concurrentUser = {
            username: 'concurrent_test_' + Date.now(),
            email: 'concurrent@test.com',
            password: 'Test123!'
        };
        
        const concurrentPromises = [];
        for (let i = 0; i < 5; i++) {
            concurrentPromises.push(this.makeRequest('/auth/register', {
                method: 'POST',
                body: JSON.stringify(concurrentUser)
            }));
        }
        
        const concurrentResults = await Promise.all(concurrentPromises);
        const successfulRegistrations = concurrentResults.filter(r => r.status === 201 || r.status === 200).length;
        
        if (successfulRegistrations <= 1) {
            this.log('Concurrent duplicate operations properly handled', 'success');
        } else {
            this.log(`Multiple concurrent registrations succeeded (${successfulRegistrations}/5)`, 'warning');
        }

        // Summary
        const successful = this.results.filter(r => r.type === 'success').length;
        const warnings = this.results.filter(r => r.type === 'warning').length;
        const errors = this.results.filter(r => r.type === 'error').length;
        const total = successful + warnings + errors;
        
        console.log(`\n📊 Edge Case Testing Complete!`);
        console.log(`✅ Successful: ${successful}/${total} (${((successful/total)*100).toFixed(1)}%)`);
        console.log(`⚠️ Warnings: ${warnings}/${total} (${((warnings/total)*100).toFixed(1)}%)`);
        console.log(`❌ Errors: ${errors}/${total} (${((errors/total)*100).toFixed(1)}%)`);
        
        return { successful, warnings, errors, total, results: this.results };
    }
}

const tester = new EdgeCaseTester();
tester.testEdgeCases().catch(console.error);
