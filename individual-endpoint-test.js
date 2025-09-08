import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5001';

class IndividualEndpointTester {
    constructor() {
        this.results = [];
        this.authToken = null;
    }

    log(message, type = 'info') {
        const timestamp = new Date().toISOString();
        const prefix = {
            info: '🔍',
            success: '✅',
            error: '❌',
            warning: '⚠️'
        }[type] || '🔍';
        
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

    async testAllEndpoints() {
        console.log('🔍 Testing All API Endpoints Individually\n');

        // 1. Health Check
        this.log('Testing GET /api/health');
        const { data: health, status: healthStatus } = await this.makeRequest('/health');
        if (healthStatus === 200) {
            this.log(`Health check successful: ${health.message}`, 'success');
        } else {
            this.log('Health check failed', 'error');
        }

        // 2. User Registration
        this.log('Testing POST /api/auth/register');
        const registerData = {
            username: 'endpoint_test_' + Date.now(),
            email: 'endpoint@test.com',
            password: 'Test123!',
            full_name: 'Endpoint Test User',
            role: 'jobseeker'
        };
        
        const { data: regResult, status: regStatus } = await this.makeRequest('/auth/register', {
            method: 'POST',
            body: JSON.stringify(registerData)
        });
        
        if (regStatus === 201 || regStatus === 200) {
            this.log('User registration successful', 'success');
            this.authToken = regResult.token;
        } else {
            this.log(`Registration failed: ${regResult?.message}`, 'error');
        }

        // 3. User Login
        this.log('Testing POST /api/auth/login');
        const { data: loginResult, status: loginStatus } = await this.makeRequest('/auth/login', {
            method: 'POST',
            body: JSON.stringify({
                username: registerData.username,
                password: registerData.password
            })
        });
        
        if (loginStatus === 200) {
            this.log('User login successful', 'success');
            if (loginResult.token) {
                this.authToken = loginResult.token;
            }
        } else {
            this.log(`Login failed: ${loginResult?.message}`, 'error');
        }

        // 4. Get Jobs
        this.log('Testing GET /api/jobs');
        const { data: jobs, status: jobsStatus } = await this.makeRequest('/jobs');
        if (jobsStatus === 200) {
            this.log(`Jobs retrieved successfully (${jobs.jobs?.length || 0} jobs)`, 'success');
        } else {
            this.log('Jobs retrieval failed', 'error');
        }

        // 5. Create Job
        this.log('Testing POST /api/jobs');
        const jobData = {
            title: 'Test Job Position',
            company: 'Test Company',
            location: 'Test Location',
            salary: '$50,000',
            description: 'Test job description',
            requirements: 'Test requirements',
            type: 'full-time',
            category: 'testing'
        };
        
        const { data: createJob, status: createStatus } = await this.makeRequest('/jobs', {
            method: 'POST',
            body: JSON.stringify(jobData)
        });
        
        if (createStatus === 201 || createStatus === 200) {
            this.log('Job creation successful', 'success');
        } else {
            this.log(`Job creation failed: ${createJob?.message}`, 'error');
        }

        // 6. Get Companies
        this.log('Testing GET /api/companies');
        const { data: companies, status: companiesStatus } = await this.makeRequest('/companies');
        if (companiesStatus === 200) {
            this.log(`Companies retrieved successfully (${companies.companies?.length || 0} companies)`, 'success');
        } else {
            this.log('Companies retrieval failed', 'error');
        }

        // 7. Get Applications
        this.log('Testing GET /api/applications');
        const { data: apps, status: appsStatus } = await this.makeRequest('/applications');
        if (appsStatus === 200) {
            this.log(`Applications retrieved successfully (${apps.applications?.length || 0} applications)`, 'success');
        } else {
            this.log('Applications retrieval failed', 'error');
        }

        // 8. Create Application
        this.log('Testing POST /api/applications');
        const appData = {
            job_id: 1,
            cover_letter: 'Test cover letter',
            resume_url: 'https://example.com/resume.pdf',
            applicant_id: 1
        };
        
        const { data: createApp, status: createAppStatus } = await this.makeRequest('/applications', {
            method: 'POST',
            body: JSON.stringify(appData)
        });
        
        if (createAppStatus === 201 || createAppStatus === 200) {
            this.log('Application creation successful', 'success');
        } else {
            this.log(`Application creation failed: ${createApp?.message}`, 'error');
        }

        // 9. Get Profile
        if (this.authToken) {
            this.log('Testing GET /api/users/profile');
            const { data: profile, status: profileStatus } = await this.makeRequest('/users/profile', {
                headers: { 'Authorization': `Bearer ${this.authToken}` }
            });
            if (profileStatus === 200) {
                this.log('Profile retrieval successful', 'success');
            } else {
                this.log('Profile retrieval failed', 'error');
            }
        }

        // 10. Update Profile
        if (this.authToken) {
            this.log('Testing PUT /api/users/profile');
            const updateData = {
                full_name: 'Updated Test User',
                bio: 'Updated bio for testing'
            };
            
            const { data: updateProfile, status: updateStatus } = await this.makeRequest('/users/profile', {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${this.authToken}` },
                body: JSON.stringify(updateData)
            });
            
            if (updateStatus === 200) {
                this.log('Profile update successful', 'success');
            } else {
                this.log('Profile update failed', 'error');
            }
        }

        // 11. Get Notifications
        if (this.authToken) {
            this.log('Testing GET /api/notifications');
            const { data: notifications, status: notifStatus } = await this.makeRequest('/notifications', {
                headers: { 'Authorization': `Bearer ${this.authToken}` }
            });
            if (notifStatus === 200) {
                this.log(`Notifications retrieved successfully (${notifications.notifications?.length || 0} notifications)`, 'success');
            } else {
                this.log('Notifications retrieval failed', 'error');
            }
        }

        // 12. Dashboard Stats
        if (this.authToken) {
            this.log('Testing GET /api/dashboard/stats');
            const { data: stats, status: statsStatus } = await this.makeRequest('/dashboard/stats', {
                headers: { 'Authorization': `Bearer ${this.authToken}` }
            });
            if (statsStatus === 200) {
                this.log(`Dashboard stats retrieved: Jobs: ${stats.totalJobs}, Users: ${stats.totalUsers}`, 'success');
            } else {
                this.log('Dashboard stats retrieval failed', 'error');
            }
        }

        // 13. OAuth Config
        this.log('Testing GET /api/oauth/config');
        const { data: oauthConfig, status: oauthStatus } = await this.makeRequest('/oauth/config');
        if (oauthStatus === 200) {
            this.log(`OAuth config retrieved: Google: ${oauthConfig.google?.enabled}, Microsoft: ${oauthConfig.microsoft?.enabled}, Apple: ${oauthConfig.apple?.enabled}`, 'success');
        } else {
            this.log('OAuth config retrieval failed', 'error');
        }

        // 14-16. OAuth Endpoints
        const providers = ['google', 'microsoft', 'apple'];
        for (const provider of providers) {
            this.log(`Testing POST /api/oauth/${provider}`);
            const { data: oauthResult, status: oauthProviderStatus } = await this.makeRequest(`/oauth/${provider}`, {
                method: 'POST',
                body: JSON.stringify({ token: `test-${provider}-token` })
            });
            
            if (oauthProviderStatus === 200) {
                this.log(`${provider} OAuth successful`, 'success');
            } else {
                this.log(`${provider} OAuth failed: ${oauthResult?.message}`, 'error');
            }
        }

        // Summary
        const successful = this.results.filter(r => r.type === 'success').length;
        const failed = this.results.filter(r => r.type === 'error').length;
        const total = this.results.filter(r => r.type === 'success' || r.type === 'error').length;
        
        console.log(`\n📊 Individual Endpoint Testing Complete!`);
        console.log(`✅ Successful: ${successful}/${total} (${((successful/total)*100).toFixed(1)}%)`);
        console.log(`❌ Failed: ${failed}/${total} (${((failed/total)*100).toFixed(1)}%)`);
        
        return { successful, failed, total, results: this.results };
    }
}

const tester = new IndividualEndpointTester();
tester.testAllEndpoints().catch(console.error);
