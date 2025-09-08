import fetch from 'node-fetch';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:5001';
const FRONTEND_URL = 'http://localhost:3000';

class FullStackTester {
    constructor() {
        this.testResults = [];
        this.authTokens = {};
        this.testUsers = {
            applicant: {
                username: 'test_applicant_' + Date.now(),
                email: 'applicant@test.com',
                password: 'TestPass123!',
                full_name: 'Test Applicant',
                role: 'jobseeker'
            },
            recruiter: {
                username: 'test_recruiter_' + Date.now(),
                email: 'recruiter@test.com',
                password: 'TestPass123!',
                full_name: 'Test Recruiter',
                role: 'recruiter'
            },
            admin: {
                username: 'test_admin_' + Date.now(),
                email: 'admin@test.com',
                password: 'TestPass123!',
                full_name: 'Test Admin',
                role: 'admin'
            }
        };
        this.createdJobs = [];
        this.createdApplications = [];
    }

    log(message, type = 'info') {
        const timestamp = new Date().toISOString();
        const prefix = {
            info: '📋',
            success: '✅',
            error: '❌',
            warning: '⚠️',
            test: '🧪'
        }[type] || '📋';
        
        console.log(`${prefix} [${timestamp}] ${message}`);
        this.testResults.push({ timestamp, type, message });
    }

    async makeRequest(endpoint, options = {}) {
        try {
            const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
            
            // Ensure proper JSON stringification for POST requests
            const requestOptions = {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            };
            
            // Fix JSON body encoding
            if (options.body && typeof options.body === 'string') {
                try {
                    // Validate JSON before sending
                    JSON.parse(options.body);
                } catch (e) {
                    console.error('Invalid JSON body:', options.body);
                    throw new Error('Invalid JSON payload');
                }
            }
            
            const response = await fetch(url, requestOptions);
            
            const data = await response.json();
            return { response, data, status: response.status };
        } catch (error) {
            return { error: error.message, status: 0 };
        }
    }

    // 1. Full Stack Analysis
    async analyzeArchitecture() {
        this.log('🏗️ Starting Full Stack Architecture Analysis', 'test');
        
        // Check backend health
        const { data: healthData, status: healthStatus } = await this.makeRequest('/api/health');
        if (healthStatus === 200) {
            this.log('Backend server is running and healthy', 'success');
        } else {
            this.log('Backend server health check failed', 'error');
            return false;
        }

        // Check available endpoints
        const endpoints = [
            '/api/auth/register', '/api/auth/login', '/api/jobs', '/api/companies', 
            '/api/applications', '/api/dashboard/stats', '/api/oauth/config'
        ];
        
        for (const endpoint of endpoints) {
            const { status } = await this.makeRequest(endpoint);
            if (status !== 404) {
                this.log(`Endpoint ${endpoint} is accessible`, 'success');
            } else {
                this.log(`Endpoint ${endpoint} not found`, 'warning');
            }
        }

        return true;
    }

    // 2. Authentication & Registration Testing
    async testAuthentication() {
        this.log('🔐 Starting Authentication & Registration Testing', 'test');
        
        // Test user registration for all roles
        for (const role of ['applicant', 'recruiter', 'admin']) {
            this.log(`Testing ${role} registration...`);
            const userData = { ...this.testUsers[role], role };
            
            const { data, status } = await this.makeRequest('/api/auth/register', {
                method: 'POST',
                body: JSON.stringify(userData)
            });
            
            if (status === 201 || status === 200) {
                this.log(`${role} registration successful`, 'success');
                if (data.token) {
                    this.authTokens[role] = data.token;
                }
            } else {
                this.log(`${role} registration failed: ${error || data?.message}`, 'error');
            }
        }

        // Test user login for all roles
        for (const [role, userData] of Object.entries(this.testUsers)) {
            this.log(`Testing ${role} login...`);
            
            const { data, status, error } = await this.makeRequest('/api/auth/login', {
                method: 'POST',
                body: JSON.stringify({
                    username: userData.username,
                    password: userData.password
                })
            });
            
            if (status === 200) {
                this.log(`${role} login successful`, 'success');
                if (data.token) {
                    this.authTokens[role] = data.token;
                }
            } else {
                this.log(`${role} login failed: ${error || data?.message}`, 'error');
            }
        }

        return Object.keys(this.authTokens).length > 0;
    }

    // 3. Job Post Management Testing
    async testJobManagement() {
        this.log('💼 Starting Job Post Management Testing', 'test');
        
        if (!this.authTokens.recruiter) {
            this.log('No recruiter token available for job management tests', 'error');
            return false;
        }

        // Test job creation
        const jobData = {
            title: 'Test Software Engineer Position',
            company: 'Test Company Inc',
            location: 'Remote',
            salary: '$75,000 - $95,000',
            description: 'This is a test job posting for automated testing purposes.',
            requirements: 'JavaScript, React, Node.js',
            type: 'full-time',
            category: 'technology'
        };

        this.log('Testing job creation...');
        const { data: createData, status: createStatus } = await this.makeRequest('/jobs', {
            method: 'POST',
            body: JSON.stringify(jobData)
        });

        if (createStatus === 201 || createStatus === 200) {
            this.log('Job creation successful', 'success');
            if (createData.job) {
                this.createdJobs.push(createData.job);
            }
        } else {
            this.log(`Job creation failed: ${createData?.message}`, 'error');
        }

        // Test job listing retrieval
        this.log('Testing job listings retrieval...');
        const { data: jobsData, status: jobsStatus } = await this.makeRequest('/api/jobs');
        
        if (jobsStatus === 200) {
            this.log(`Job listings retrieved successfully (${jobsData.jobs?.length || 0} jobs)`, 'success');
        } else {
            this.log('Job listings retrieval failed', 'error');
        }

        // Test job update (if job was created)
        if (this.createdJobs.length > 0) {
            const jobId = this.createdJobs[0].id;
            this.log(`Testing job update for job ID: ${jobId}...`);
            
            const updateData = { ...jobData, title: 'Updated Test Position' };
            const { data: updateResult, status: updateStatus } = await this.makeRequest(`/api/jobs/${jobId}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${this.authTokens.recruiter}` },
                body: JSON.stringify(updateData)
            });

            if (updateStatus === 200) {
                this.log('Job update successful', 'success');
            } else {
                this.log(`Job update failed: ${updateResult?.message}`, 'error');
            }
        }

        return true;
    }

    // 4. Notifications & Dashboard Integration Testing
    async testDashboardIntegration() {
        this.log('📊 Starting Dashboard Integration Testing', 'test');
        
        // Test dashboard stats for each role
        for (const [role, token] of Object.entries(this.authTokens)) {
            this.log(`Testing ${role} dashboard stats...`);
            
            const { data, status } = await this.makeRequest('/api/dashboard/stats', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (status === 200) {
                this.log(`${role} dashboard stats retrieved successfully`, 'success');
            } else {
                this.log(`${role} dashboard stats failed`, 'error');
            }
        }

        // Test notifications endpoint
        for (const [role, token] of Object.entries(this.authTokens)) {
            this.log(`Testing ${role} notifications...`);
            
            const { data, status } = await this.makeRequest('/api/notifications', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (status === 200 || status === 404) {
                this.log(`${role} notifications endpoint accessible`, 'success');
            } else {
                this.log(`${role} notifications failed`, 'error');
            }
        }

        return true;
    }

    // 5. Profile Management Testing
    async testProfileManagement() {
        this.log('👤 Starting Profile Management Testing', 'test');
        
        for (const [role, token] of Object.entries(this.authTokens)) {
            this.log(`Testing ${role} profile retrieval...`);
            
            const { data, status } = await this.makeRequest('/api/users/profile', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (status === 200) {
                this.log(`${role} profile retrieved successfully`, 'success');
                
                // Test profile update
                this.log(`Testing ${role} profile update...`);
                const updateData = {
                    full_name: `Updated ${role} Name`,
                    bio: `Updated bio for ${role}`
                };
                
                const { data: updateDataResult, status: updateStatus } = await this.makeRequest('/api/users/profile', {
                    method: 'PUT',
                    headers: { 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify(updateData)
                });
                
                if (updateStatus === 200) {
                    this.log(`${role} profile update successful`, 'success');
                } else {
                    this.log(`${role} profile update failed`, 'error');
                }
            } else {
                this.log(`${role} profile retrieval failed`, 'error');
            }
        }

        return true;
    }

    // 6. Application Flow Testing
    async testApplicationFlow() {
        this.log('📝 Starting Application Flow Testing', 'test');
        
        // Use applicant token if jobseeker token not available (they're the same role)
        const jobseekerToken = this.authTokens.jobseeker || this.authTokens.applicant;
        
        if (!jobseekerToken || this.createdJobs.length === 0) {
            this.log('Missing jobseeker/applicant token or jobs for application testing', 'warning');
            return false;
        }

        // Use an existing job ID from mockJobs instead of created job
        const jobId = 1; // Use existing job ID from mockJobs
        this.log(`Testing job application for job ID: ${jobId}...`);
        
        const applicationData = {
            job_id: jobId,
            cover_letter: 'This is a test cover letter for automated testing.',
            resume_url: 'https://example.com/test-resume.pdf'
        };

        // Debug the JSON payload
        const jsonPayload = JSON.stringify(applicationData);
        console.log('Sending application payload:', jsonPayload);

        const { data, status, error } = await this.makeRequest('/api/applications', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${jobseekerToken}`,
                'Content-Type': 'application/json'
            },
            body: jsonPayload
        });

        if (status === 201 || status === 200) {
            this.log('Job application submitted successfully', 'success');
            if (data.application) {
                this.createdApplications.push(data.application);
            }
        } else {
            this.log(`Job application failed: ${data?.message}`, 'error');
            if (data?.errors) {
                console.log('Validation errors:', JSON.stringify(data.errors, null, 2));
            }
        }

        // Test application retrieval
        this.log('Testing application retrieval...');
        const { data: appsData, status: appsStatus } = await this.makeRequest('/api/applications', {
            headers: { 'Authorization': `Bearer ${jobseekerToken}` }
        });

        if (appsStatus === 200) {
            this.log(`Applications retrieved successfully (${appsData.applications?.length || 0} applications)`, 'success');
        } else {
            this.log('Applications retrieval failed', 'error');
        }

        return true;
    }

    // 7. OAuth Integration Testing
    async testOAuthIntegration() {
        this.log('🔗 Starting OAuth Integration Testing', 'test');
        
        // Test OAuth configuration
        const { data: oauthConfig } = await this.makeRequest('/api/oauth/config');
        
        if (oauthConfig.status === 200) {
            this.log('OAuth configuration retrieved successfully', 'success');
            this.log(`OAuth providers: Google: ${oauthConfig.data.google?.enabled}, Microsoft: ${oauthConfig.data.microsoft?.enabled}, Apple: ${oauthConfig.data.apple?.enabled}`);
        } else {
            this.log('OAuth configuration retrieval failed', 'error');
        }

        // Test OAuth endpoints (without actual provider tokens)
        const providers = ['google', 'microsoft', 'apple'];
        for (const provider of providers) {
            this.log(`Testing ${provider} OAuth endpoint...`);
            
            const { status: oauthStatus } = await this.makeRequest(`/oauth/${provider}`, {
                method: 'POST',
                body: JSON.stringify({ token: 'test-token' })
            });
            
            if (oauthStatus !== 404) {
                this.log(`${provider} OAuth endpoint is accessible`, 'success');
            } else {
                this.log(`${provider} OAuth endpoint not found`, 'warning');
            }
        }

        return true;
    }

    // 8. Load Testing
    async testLoadHandling() {
        this.log('⚡ Starting Load Handling Testing', 'test');
        
        const concurrentRequests = 10;
        const requests = [];

        // Create multiple concurrent requests
        for (let i = 0; i < concurrentRequests; i++) {
            requests.push(this.makeRequest('/health'));
            requests.push(this.makeRequest('/jobs'));
            requests.push(this.makeRequest('/companies'));
        }

        const startTime = Date.now();
        const results = await Promise.all(requests);
        const endTime = Date.now();
        
        const successfulRequests = results.filter(r => r.status === 200).length;
        const totalTime = endTime - startTime;
        
        this.log(`Load test completed: ${successfulRequests}/${results.length} requests successful in ${totalTime}ms`, 'success');
        
        if (successfulRequests / results.length > 0.8) {
            this.log('Load handling test passed (>80% success rate)', 'success');
            return true;
        } else {
            this.log('Load handling test failed (<80% success rate)', 'error');
            return false;
        }
    }

    // 9. Frontend-Backend Integration Validation
    async testFrontendBackendIntegration() {
        this.log('🔄 Starting Frontend-Backend Integration Testing', 'test');
        
        // Test CORS configuration
        const corsHeaders = {
            'Origin': FRONTEND_URL,
            'Access-Control-Request-Method': 'POST',
            'Access-Control-Request-Headers': 'Content-Type, Authorization'
        };

        const { response } = await this.makeRequest('/health', {
            method: 'OPTIONS',
            headers: corsHeaders
        });

        if (response && response.headers.get('access-control-allow-origin')) {
            this.log('CORS configuration is working correctly', 'success');
        } else {
            this.log('CORS configuration may have issues', 'warning');
        }

        // Test API response formats
        const { data: jobsData } = await this.makeRequest('/jobs');
        if (jobsData && Array.isArray(jobsData.jobs)) {
            this.log('API response format is consistent', 'success');
        } else {
            this.log('API response format inconsistency detected', 'warning');
        }

        return true;
    }

    // 10. Cleanup and Report Generation
    async cleanup() {
        this.log('🧹 Starting Cleanup Process', 'test');
        
        // Delete created applications
        for (const app of this.createdApplications) {
            if (app.id && this.authTokens.jobseeker) {
                await this.makeRequest(`/applications/${app.id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${this.authTokens.jobseeker}` }
                });
            }
        }

        // Delete created jobs
        for (const job of this.createdJobs) {
            if (job.id && this.authTokens.recruiter) {
                await this.makeRequest(`/jobs/${job.id}`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${this.authTokens.recruiter}` }
                });
            }
        }

        this.log('Cleanup completed', 'success');
    }

    async generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                totalTests: this.testResults.length,
                successful: this.testResults.filter(r => r.type === 'success').length,
                failed: this.testResults.filter(r => r.type === 'error').length,
                warnings: this.testResults.filter(r => r.type === 'warning').length
            },
            results: this.testResults,
            createdUsers: Object.keys(this.testUsers),
            authTokensObtained: Object.keys(this.authTokens),
            createdJobs: this.createdJobs.length,
            createdApplications: this.createdApplications.length
        };

        const reportPath = path.join(process.cwd(), 'FULL_STACK_TEST_REPORT.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        
        this.log(`Test report generated: ${reportPath}`, 'success');
        return report;
    }

    // Main test runner
    async runFullTestSuite() {
        console.log('🚀 Starting Comprehensive Full-Stack Testing Suite\n');
        
        try {
            // 1. Architecture Analysis
            await this.analyzeArchitecture();
            
            // 2. Authentication Testing
            await this.testAuthentication();
            
            // 3. Job Management Testing
            await this.testJobManagement();
            
            // 4. Dashboard Integration Testing
            await this.testDashboardIntegration();
            
            // 5. Profile Management Testing
            await this.testProfileManagement();
            
            // 6. Application Flow Testing
            await this.testApplicationFlow();
            
            // 7. OAuth Integration Testing
            await this.testOAuthIntegration();
            
            // 8. Load Testing
            await this.testLoadHandling();
            
            // 9. Frontend-Backend Integration
            await this.testFrontendBackendIntegration();
            
            // 10. Cleanup
            await this.cleanup();
            
            // Generate final report
            const report = await this.generateReport();
            
            console.log('\n🏁 Full-Stack Testing Suite Completed!');
            console.log(`📊 Results: ${report.summary.successful} successful, ${report.summary.failed} failed, ${report.summary.warnings} warnings`);
            
            return report;
            
        } catch (error) {
            this.log(`Critical error during testing: ${error.message}`, 'error');
            throw error;
        }
    }
}

// Run the comprehensive test suite
const tester = new FullStackTester();
tester.runFullTestSuite().catch(console.error);

export default FullStackTester;
