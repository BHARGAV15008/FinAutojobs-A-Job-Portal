import fetch from 'node-fetch';
import fs from 'fs';

const BASE_URL = 'http://localhost:5000/api';
const FRONTEND_URL = 'http://localhost:3002';

class NavigationFlowTester {
    constructor() {
        this.testResults = [];
        this.authTokens = {};
        this.testUsers = {
            applicant: {
                username: 'nav_test_applicant_' + Date.now(),
                email: 'applicant@navtest.com',
                password: 'NavTest123!',
                full_name: 'Navigation Test Applicant',
                role: 'jobseeker'
            },
            recruiter: {
                username: 'nav_test_recruiter_' + Date.now(),
                email: 'recruiter@navtest.com',
                password: 'NavTest123!',
                full_name: 'Navigation Test Recruiter',
                role: 'recruiter'
            }
        };
    }

    log(message, type = 'info') {
        const timestamp = new Date().toISOString();
        const prefix = {
            info: '🧭',
            success: '✅',
            error: '❌',
            warning: '⚠️',
            test: '🧪'
        }[type] || '🧭';
        
        console.log(`${prefix} [${timestamp}] ${message}`);
        this.testResults.push({ timestamp, type, message });
    }

    async makeRequest(endpoint, options = {}) {
        try {
            const url = endpoint.startsWith('http') ? endpoint : `${BASE_URL}${endpoint}`;
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

    // Test 1: Registration to Login Flow
    async testRegistrationToLoginFlow() {
        this.log('🔐 Testing Registration → Login Flow', 'test');
        
        for (const [role, userData] of Object.entries(this.testUsers)) {
            this.log(`Testing ${role} registration flow...`);
            
            // Step 1: Register user
            const { data: regData, status: regStatus } = await this.makeRequest('/auth/register', {
                method: 'POST',
                body: JSON.stringify(userData)
            });
            
            if (regStatus === 201 || regStatus === 200) {
                this.log(`${role} registration successful`, 'success');
                
                // Step 2: Attempt login with same credentials
                const { data: loginData, status: loginStatus } = await this.makeRequest('/auth/login', {
                    method: 'POST',
                    body: JSON.stringify({
                        username: userData.username,
                        password: userData.password
                    })
                });
                
                if (loginStatus === 200) {
                    this.log(`${role} login after registration successful`, 'success');
                    this.authTokens[role] = loginData.token;
                } else {
                    this.log(`${role} login after registration failed`, 'error');
                }
            } else {
                this.log(`${role} registration failed`, 'error');
            }
        }
    }

    // Test 2: Login to Dashboard Redirection
    async testLoginToDashboardFlow() {
        this.log('📊 Testing Login → Dashboard Redirection', 'test');
        
        for (const [role, token] of Object.entries(this.authTokens)) {
            this.log(`Testing ${role} dashboard access...`);
            
            const { data, status } = await this.makeRequest('/dashboard/stats', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (status === 200) {
                this.log(`${role} dashboard access successful`, 'success');
                this.log(`Dashboard data: Jobs: ${data.totalJobs}, Users: ${data.totalUsers}`);
            } else {
                this.log(`${role} dashboard access failed`, 'error');
            }
        }
    }

    // Test 3: Job Application Flow
    async testJobApplicationFlow() {
        this.log('💼 Testing Job Application Flow', 'test');
        
        if (!this.authTokens.applicant) {
            this.log('No applicant token available for job application test', 'error');
            return;
        }

        // Step 1: Get available jobs
        const { data: jobsData, status: jobsStatus } = await this.makeRequest('/jobs');
        
        if (jobsStatus === 200 && jobsData.jobs && jobsData.jobs.length > 0) {
            const job = jobsData.jobs[0];
            this.log(`Found job to apply for: ${job.title} at ${job.company}`, 'success');
            
            // Step 2: Apply for the job
            const applicationData = {
                job_id: job.id,
                cover_letter: 'This is a test application for navigation flow testing.',
                resume_url: 'https://example.com/test-resume.pdf'
            };
            
            const { data: appData, status: appStatus } = await this.makeRequest('/applications', {
                method: 'POST',
                body: JSON.stringify(applicationData)
            });
            
            if (appStatus === 201 || appStatus === 200) {
                this.log('Job application submitted successfully', 'success');
                
                // Step 3: Verify application appears in applicant's applications
                const { data: myApps, status: myAppsStatus } = await this.makeRequest('/applications', {
                    headers: { 'Authorization': `Bearer ${this.authTokens.applicant}` }
                });
                
                if (myAppsStatus === 200) {
                    this.log(`Application retrieval successful (${myApps.applications?.length || 0} applications)`, 'success');
                } else {
                    this.log('Failed to retrieve applications after submission', 'error');
                }
            } else {
                this.log(`Job application failed: ${appData?.message}`, 'error');
            }
        } else {
            this.log('No jobs available for application testing', 'warning');
        }
    }

    // Test 4: Job Posting Management Flow
    async testJobPostingFlow() {
        this.log('📝 Testing Job Posting Management Flow', 'test');
        
        if (!this.authTokens.recruiter) {
            this.log('No recruiter token available for job posting test', 'error');
            return;
        }

        // Step 1: Create a new job posting
        const jobData = {
            title: 'Navigation Test Position',
            company: 'Test Navigation Corp',
            location: 'Remote Testing',
            salary: '$70,000 - $90,000',
            description: 'This is a test job posting for navigation flow testing.',
            requirements: 'Testing skills, Navigation experience',
            type: 'full-time',
            category: 'testing'
        };

        const { data: createData, status: createStatus } = await this.makeRequest('/jobs', {
            method: 'POST',
            body: JSON.stringify(jobData)
        });

        if (createStatus === 201 || createStatus === 200) {
            this.log('Job posting created successfully', 'success');
            const jobId = createData.job.id;
            
            // Step 2: Verify job appears in job listings
            const { data: listData, status: listStatus } = await this.makeRequest('/jobs');
            
            if (listStatus === 200) {
                const createdJob = listData.jobs.find(job => job.id === jobId);
                if (createdJob) {
                    this.log('Created job appears in job listings', 'success');
                    
                    // Step 3: Update the job posting
                    const updateData = { ...jobData, title: 'Updated Navigation Test Position' };
                    const { data: updateResult, status: updateStatus } = await this.makeRequest(`/jobs/${jobId}`, {
                        method: 'PUT',
                        headers: { 'Authorization': `Bearer ${this.authTokens.recruiter}` },
                        body: JSON.stringify(updateData)
                    });

                    if (updateStatus === 200) {
                        this.log('Job posting updated successfully', 'success');
                        
                        // Step 4: Delete the job posting
                        const { status: deleteStatus } = await this.makeRequest(`/jobs/${jobId}`, {
                            method: 'DELETE',
                            headers: { 'Authorization': `Bearer ${this.authTokens.recruiter}` }
                        });

                        if (deleteStatus === 200) {
                            this.log('Job posting deleted successfully', 'success');
                        } else {
                            this.log('Job posting deletion failed', 'error');
                        }
                    } else {
                        this.log('Job posting update failed', 'error');
                    }
                } else {
                    this.log('Created job not found in job listings', 'error');
                }
            } else {
                this.log('Failed to retrieve job listings', 'error');
            }
        } else {
            this.log(`Job posting creation failed: ${createData?.message}`, 'error');
        }
    }

    // Test 5: Profile Management Flow
    async testProfileManagementFlow() {
        this.log('👤 Testing Profile Management Flow', 'test');
        
        for (const [role, token] of Object.entries(this.authTokens)) {
            this.log(`Testing ${role} profile management...`);
            
            // Step 1: Get current profile
            const { data: profileData, status: profileStatus } = await this.makeRequest('/users/profile', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (profileStatus === 200) {
                this.log(`${role} profile retrieved successfully`, 'success');
                
                // Step 2: Update profile
                const updateData = {
                    full_name: `Updated ${role} Name`,
                    bio: `Updated bio for ${role} navigation testing`,
                    skills: ['Navigation Testing', 'Flow Validation'],
                    experience: 'Updated experience'
                };
                
                const { data: updateResult, status: updateStatus } = await this.makeRequest('/users/profile', {
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
    }

    // Test 6: OAuth Integration Flow
    async testOAuthFlow() {
        this.log('🔗 Testing OAuth Integration Flow', 'test');
        
        // Test OAuth configuration
        const { data: configData, status: configStatus } = await this.makeRequest('/oauth/config');
        
        if (configStatus === 200) {
            this.log('OAuth configuration retrieved successfully', 'success');
            
            // Test each OAuth provider
            const providers = ['google', 'microsoft', 'apple'];
            for (const provider of providers) {
                this.log(`Testing ${provider} OAuth flow...`);
                
                const { data: oauthData, status: oauthStatus } = await this.makeRequest(`/oauth/${provider}`, {
                    method: 'POST',
                    body: JSON.stringify({ token: `test-${provider}-token-${Date.now()}` })
                });
                
                if (oauthStatus === 200) {
                    this.log(`${provider} OAuth flow successful`, 'success');
                } else {
                    this.log(`${provider} OAuth flow failed: ${oauthData?.message}`, 'error');
                }
            }
        } else {
            this.log('OAuth configuration retrieval failed', 'error');
        }
    }

    // Test 7: Notification Flow
    async testNotificationFlow() {
        this.log('🔔 Testing Notification Flow', 'test');
        
        for (const [role, token] of Object.entries(this.authTokens)) {
            this.log(`Testing ${role} notifications...`);
            
            const { data, status } = await this.makeRequest('/notifications', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (status === 200) {
                this.log(`${role} notifications retrieved successfully (${data.notifications?.length || 0} notifications)`, 'success');
            } else {
                this.log(`${role} notifications retrieval failed`, 'error');
            }
        }
    }

    // Test 8: Error Handling and Edge Cases
    async testErrorHandling() {
        this.log('⚠️ Testing Error Handling and Edge Cases', 'test');
        
        // Test invalid login
        const { status: invalidLoginStatus } = await this.makeRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username: 'invalid', password: 'invalid' })
        });
        
        if (invalidLoginStatus === 401) {
            this.log('Invalid login properly rejected', 'success');
        } else {
            this.log('Invalid login not properly handled', 'error');
        }
        
        // Test unauthorized access
        const { status: unauthorizedStatus } = await this.makeRequest('/dashboard/stats');
        
        if (unauthorizedStatus === 401 || unauthorizedStatus === 403) {
            this.log('Unauthorized access properly blocked', 'success');
        } else {
            this.log('Unauthorized access not properly handled', 'warning');
        }
        
        // Test non-existent endpoints
        const { status: notFoundStatus } = await this.makeRequest('/nonexistent');
        
        if (notFoundStatus === 404) {
            this.log('Non-existent endpoint properly returns 404', 'success');
        } else {
            this.log('Non-existent endpoint handling needs improvement', 'warning');
        }
    }

    async generateNavigationReport() {
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                totalTests: this.testResults.length,
                successful: this.testResults.filter(r => r.type === 'success').length,
                failed: this.testResults.filter(r => r.type === 'error').length,
                warnings: this.testResults.filter(r => r.type === 'warning').length
            },
            flows_tested: [
                'Registration → Login',
                'Login → Dashboard',
                'Job Application Flow',
                'Job Posting Management',
                'Profile Management',
                'OAuth Integration',
                'Notification Flow',
                'Error Handling'
            ],
            results: this.testResults,
            authTokensObtained: Object.keys(this.authTokens)
        };

        const reportPath = 'NAVIGATION_FLOW_TEST_REPORT.json';
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        
        this.log(`Navigation flow test report generated: ${reportPath}`, 'success');
        return report;
    }

    // Main test runner
    async runNavigationFlowTests() {
        console.log('🧭 Starting Comprehensive Navigation Flow Testing\n');
        
        try {
            // 1. Registration to Login Flow
            await this.testRegistrationToLoginFlow();
            
            // 2. Login to Dashboard Flow
            await this.testLoginToDashboardFlow();
            
            // 3. Job Application Flow
            await this.testJobApplicationFlow();
            
            // 4. Job Posting Management Flow
            await this.testJobPostingFlow();
            
            // 5. Profile Management Flow
            await this.testProfileManagementFlow();
            
            // 6. OAuth Integration Flow
            await this.testOAuthFlow();
            
            // 7. Notification Flow
            await this.testNotificationFlow();
            
            // 8. Error Handling
            await this.testErrorHandling();
            
            // Generate final report
            const report = await this.generateNavigationReport();
            
            console.log('\n🏁 Navigation Flow Testing Completed!');
            console.log(`📊 Results: ${report.summary.successful} successful, ${report.summary.failed} failed, ${report.summary.warnings} warnings`);
            
            return report;
            
        } catch (error) {
            this.log(`Critical error during navigation testing: ${error.message}`, 'error');
            throw error;
        }
    }
}

// Run the navigation flow tests
const tester = new NavigationFlowTester();
tester.runNavigationFlowTests().catch(console.error);

export default NavigationFlowTester;
