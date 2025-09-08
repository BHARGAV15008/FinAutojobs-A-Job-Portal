import fetch from 'node-fetch';

const BACKEND_URL = 'http://localhost:5000/api';
const FRONTEND_URL = 'http://localhost:3002';

class FrontendBackendIntegrationTester {
    constructor() {
        this.results = [];
        this.authToken = null;
    }

    log(message, type = 'info') {
        const timestamp = new Date().toISOString();
        const prefix = {
            info: '🔗',
            success: '✅',
            error: '❌',
            warning: '⚠️'
        }[type] || '🔗';
        
        console.log(`${prefix} ${message}`);
        this.results.push({ timestamp, type, message });
    }

    async makeRequest(endpoint, options = {}) {
        try {
            const url = endpoint.startsWith('http') ? endpoint : `${BACKEND_URL}${endpoint}`;
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    'Origin': FRONTEND_URL,
                    ...options.headers
                },
                ...options
            });
            
            const data = await response.json();
            return { response, data, status: response.status, headers: response.headers };
        } catch (error) {
            return { error: error.message, status: 0 };
        }
    }

    async testFrontendBackendIntegration() {
        console.log('🔗 Testing Frontend-Backend Integration\n');

        // 1. Test CORS Configuration
        this.log('Testing CORS configuration with OPTIONS request');
        const { response: corsResponse, status: corsStatus } = await this.makeRequest('/health', {
            method: 'OPTIONS',
            headers: {
                'Origin': FRONTEND_URL,
                'Access-Control-Request-Method': 'POST',
                'Access-Control-Request-Headers': 'Content-Type, Authorization'
            }
        });

        if (corsResponse && corsResponse.headers.get('access-control-allow-origin')) {
            this.log('CORS configuration working correctly', 'success');
        } else {
            this.log('CORS configuration may need adjustment', 'warning');
        }

        // 2. Test Authentication Flow
        this.log('Testing authentication flow integration');
        const userData = {
            username: 'integration_test_' + Date.now(),
            email: 'integration@test.com',
            password: 'Integration123!',
            full_name: 'Integration Test User',
            role: 'jobseeker'
        };

        // Register user
        const { data: regData, status: regStatus } = await this.makeRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });

        if (regStatus === 201 || regStatus === 200) {
            this.log('User registration integration successful', 'success');
            
            // Login user
            const { data: loginData, status: loginStatus } = await this.makeRequest('/auth/login', {
                method: 'POST',
                body: JSON.stringify({
                    username: userData.username,
                    password: userData.password
                })
            });

            if (loginStatus === 200 && loginData.token) {
                this.log('User login integration successful', 'success');
                this.authToken = loginData.token;
            } else {
                this.log('User login integration failed', 'error');
            }
        } else {
            this.log('User registration integration failed', 'error');
        }

        // 3. Test Protected Routes
        if (this.authToken) {
            this.log('Testing protected route access with JWT token');
            const { data: profileData, status: profileStatus } = await this.makeRequest('/users/profile', {
                headers: { 'Authorization': `Bearer ${this.authToken}` }
            });

            if (profileStatus === 200) {
                this.log('Protected route access successful', 'success');
            } else {
                this.log('Protected route access failed', 'error');
            }
        }

        // 4. Test Data Consistency
        this.log('Testing data consistency between requests');
        const { data: jobs1 } = await this.makeRequest('/jobs');
        const { data: jobs2 } = await this.makeRequest('/jobs');

        if (JSON.stringify(jobs1) === JSON.stringify(jobs2)) {
            this.log('Data consistency maintained across requests', 'success');
        } else {
            this.log('Data inconsistency detected', 'warning');
        }

        // 5. Test Error Handling
        this.log('Testing error handling integration');
        const { data: errorData, status: errorStatus } = await this.makeRequest('/nonexistent-endpoint');
        
        if (errorStatus === 404 && errorData.message) {
            this.log('Error handling working correctly', 'success');
        } else {
            this.log('Error handling needs improvement', 'warning');
        }

        // 6. Test JSON Response Format
        this.log('Testing JSON response format consistency');
        const endpoints = ['/health', '/jobs', '/companies', '/oauth/config'];
        let formatConsistent = true;

        for (const endpoint of endpoints) {
            const { data, status } = await this.makeRequest(endpoint);
            if (status === 200 && typeof data === 'object') {
                this.log(`${endpoint} returns valid JSON`, 'success');
            } else {
                this.log(`${endpoint} JSON format issue`, 'warning');
                formatConsistent = false;
            }
        }

        if (formatConsistent) {
            this.log('All endpoints return consistent JSON format', 'success');
        }

        // 7. Test Real-time Features Simulation
        this.log('Testing real-time features simulation');
        if (this.authToken) {
            // Simulate dashboard stats request
            const { data: stats1 } = await this.makeRequest('/dashboard/stats', {
                headers: { 'Authorization': `Bearer ${this.authToken}` }
            });

            // Wait a moment and request again
            await new Promise(resolve => setTimeout(resolve, 100));
            
            const { data: stats2 } = await this.makeRequest('/dashboard/stats', {
                headers: { 'Authorization': `Bearer ${this.authToken}` }
            });

            if (stats1 && stats2) {
                this.log('Real-time dashboard stats simulation working', 'success');
            }
        }

        // 8. Test Frontend URL Accessibility
        this.log('Testing frontend server accessibility');
        try {
            const frontendResponse = await fetch(FRONTEND_URL);
            if (frontendResponse.status === 200) {
                this.log('Frontend server is accessible', 'success');
            } else {
                this.log('Frontend server accessibility issue', 'warning');
            }
        } catch (error) {
            this.log('Frontend server not accessible', 'error');
        }

        // Summary
        const successful = this.results.filter(r => r.type === 'success').length;
        const failed = this.results.filter(r => r.type === 'error').length;
        const warnings = this.results.filter(r => r.type === 'warning').length;
        const total = successful + failed + warnings;
        
        console.log(`\n📊 Frontend-Backend Integration Testing Complete!`);
        console.log(`✅ Successful: ${successful}/${total} (${((successful/total)*100).toFixed(1)}%)`);
        console.log(`❌ Failed: ${failed}/${total} (${((failed/total)*100).toFixed(1)}%)`);
        console.log(`⚠️ Warnings: ${warnings}/${total} (${((warnings/total)*100).toFixed(1)}%)`);
        
        return { successful, failed, warnings, total, results: this.results };
    }
}

const tester = new FrontendBackendIntegrationTester();
tester.testFrontendBackendIntegration().catch(console.error);
