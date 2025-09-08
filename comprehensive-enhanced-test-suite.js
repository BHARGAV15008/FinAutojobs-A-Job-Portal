// Comprehensive Enhanced Test Suite for FinAutoJobs
// Target: 95%+ success rate across all test categories

class ComprehensiveEnhancedTestSuite {
    constructor() {
        this.baseURL = 'http://localhost:5000';
        this.frontendURL = 'http://localhost:3002';
        this.results = {
            total: 0,
            passed: 0,
            failed: 0,
            warnings: 0,
            categories: {}
        };
        this.testData = {
            users: {
                applicant: {
                    email: 'test.applicant@example.com',
                    password: 'Test123!@#',
                    role: 'jobseeker'
                },
                recruiter: {
                    email: 'test.recruiter@example.com',
                    password: 'Test123!@#',
                    role: 'recruiter'
                },
                admin: {
                    email: 'test.admin@example.com',
                    password: 'Test123!@#',
                    role: 'admin'
                }
            },
            jobs: [
                {
                    title: 'Senior Frontend Developer',
                    description: 'We are looking for a skilled frontend developer',
                    company: 'Tech Corp',
                    location: 'San Francisco, CA',
                    salary: '$120,000 - $150,000',
                    type: 'full-time'
                },
                {
                    title: 'Backend Engineer',
                    description: 'Experienced backend engineer needed',
                    company: 'StartupXYZ',
                    location: 'Remote',
                    salary: '$100,000 - $130,000',
                    type: 'remote'
                }
            ]
        };
        this.tokens = {};
    }

    // Test category management
    startCategory(categoryName) {
        if (!this.results.categories[categoryName]) {
            this.results.categories[categoryName] = {
                total: 0,
                passed: 0,
                failed: 0,
                warnings: 0,
                tests: []
            };
        }
        console.log(`\n🧪 Starting Test Category: ${categoryName}`);
    }

    async runTest(testName, testFunction, category = 'General') {
        this.startCategory(category);
        this.results.total++;
        this.results.categories[category].total++;
        
        const startTime = Date.now();
        
        try {
            const result = await testFunction();
            const duration = Date.now() - startTime;
            
            if (result.success) {
                this.results.passed++;
                this.results.categories[category].passed++;
                console.log(`✅ ${testName} - Passed (${duration}ms)`);
                this.results.categories[category].tests.push({
                    name: testName,
                    status: 'PASSED',
                    duration,
                    details: result.details || null
                });
            } else {
                this.results.failed++;
                this.results.categories[category].failed++;
                console.log(`❌ ${testName} - Failed: ${result.error} (${duration}ms)`);
                this.results.categories[category].tests.push({
                    name: testName,
                    status: 'FAILED',
                    duration,
                    error: result.error
                });
            }
        } catch (error) {
            const duration = Date.now() - startTime;
            this.results.failed++;
            this.results.categories[category].failed++;
            console.log(`❌ ${testName} - Error: ${error.message} (${duration}ms)`);
            this.results.categories[category].tests.push({
                name: testName,
                status: 'ERROR',
                duration,
                error: error.message
            });
        }
    }

    // HTTP Request helper
    async request(endpoint, options = {}) {
        const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
            }
        };

        if (this.tokens.applicant && options.auth !== false) {
            defaultOptions.headers.Authorization = `Bearer ${this.tokens.applicant}`;
        }

        const config = { ...defaultOptions, ...options };
        
        try {
            const response = await fetch(url, config);
            const data = await response.json().catch(() => ({}));
            
            return {
                status: response.status,
                data,
                headers: Object.fromEntries(response.headers.entries())
            };
        } catch (error) {
            throw new Error(`Request failed: ${error.message}`);
        }
    }

    // Enhanced OAuth Tests
    async testOAuthConfiguration() {
        this.startCategory('OAuth Configuration');
        
        // Test OAuth config endpoint
        await this.runTest('Get OAuth Configuration', async () => {
            const response = await this.request('/api/oauth/config');
            
            if (response.status !== 200) {
                return { success: false, error: `Expected 200, got ${response.status}` };
            }
            
            const { google, microsoft, apple } = response.data;
            
            if (!google || !microsoft || !apple) {
                return { success: false, error: 'Missing OAuth provider configurations' };
            }
            
            if (typeof google.enabled !== 'boolean' || 
                typeof microsoft.enabled !== 'boolean' || 
                typeof apple.enabled !== 'boolean') {
                return { success: false, error: 'Invalid enabled flags in OAuth config' };
            }
            
            return { 
                success: true, 
                details: {
                    google: google.enabled ? 'Configured' : 'Not configured',
                    microsoft: microsoft.enabled ? 'Configured' : 'Not configured',
                    apple: apple.enabled ? 'Configured' : 'Not configured'
                }
            };
        });

        // Test Google OAuth with mock token
        await this.runTest('Google OAuth Validation', async () => {
            const mockToken = 'mock_google_token';
            
            const response = await this.request('/api/oauth/google', {
                method: 'POST',
                body: JSON.stringify({
                    token: mockToken,
                    role: 'jobseeker'
                }),
                auth: false
            });
            
            // Should fail with mock token but return proper error structure
            if (response.status === 200) {
                return { success: false, error: 'Should not succeed with mock token' };
            }
            
            if (!response.data.code) {
                return { success: false, error: 'Missing error code in response' };
            }
            
            return { 
                success: true, 
                details: `Properly rejected mock token with code: ${response.data.code}`
            };
        });

        // Test Microsoft OAuth with mock token
        await this.runTest('Microsoft OAuth Validation', async () => {
            const mockToken = 'mock_microsoft_token';
            
            const response = await this.request('/api/oauth/microsoft', {
                method: 'POST',
                body: JSON.stringify({
                    token: mockToken,
                    role: 'recruiter'
                }),
                auth: false
            });
            
            if (response.status === 200) {
                return { success: false, error: 'Should not succeed with mock token' };
            }
            
            if (!response.data.code) {
                return { success: false, error: 'Missing error code in response' };
            }
            
            return { 
                success: true, 
                details: `Properly rejected mock token with code: ${response.data.code}`
            };
        });

        // Test Apple OAuth with mock token
        await this.runTest('Apple OAuth Validation', async () => {
            const mockToken = 'mock.apple.identity.token';
            
            const response = await this.request('/api/oauth/apple', {
                method: 'POST',
                body: JSON.stringify({
                    identityToken: mockToken,
                    role: 'jobseeker'
                }),
                auth: false
            });
            
            if (response.status === 200) {
                return { success: false, error: 'Should not succeed with mock token' };
            }
            
            if (!response.data.code) {
                return { success: false, error: 'Missing error code in response' };
            }
            
            return { 
                success: true, 
                details: `Properly rejected mock token with code: ${response.data.code}`
            };
        });

        // Test OAuth input validation
        await this.runTest('OAuth Input Validation', async () => {
            const response = await this.request('/api/oauth/google', {
                method: 'POST',
                body: JSON.stringify({}),
                auth: false
            });
            
            if (response.status !== 400) {
                return { success: false, error: `Expected 400 for empty request, got ${response.status}` };
            }
            
            if (!response.data.code || response.data.code !== 'VALIDATION_ERROR') {
                return { success: false, error: 'Expected validation error code' };
            }
            
            return { 
                success: true, 
                details: 'Properly validated empty OAuth request'
            };
        });
    }

    // Enhanced Authentication Tests
    async testEnhancedAuthentication() {
        this.startCategory('Enhanced Authentication');
        
        // Test user registration for all roles
        for (const [userType, userData] of Object.entries(this.testData.users)) {
            await this.runTest(`Register ${userType}`, async () => {
                const response = await this.request('/api/auth/register', {
                    method: 'POST',
                    body: JSON.stringify({
                        ...userData,
                        username: userData.email.split('@')[0],
                        full_name: `Test ${userType.charAt(0).toUpperCase() + userType.slice(1)}`
                    }),
                    auth: false
                });
                
                if (response.status !== 201 && response.status !== 200) {
                    return { success: false, error: `Registration failed: ${response.data.message}` };
                }
                
                if (!response.data.user || !response.data.token) {
                    return { success: false, error: 'Missing user data or token in response' };
                }
                
                this.tokens[userType] = response.data.token;
                
                return { 
                    success: true, 
                    details: `Successfully registered ${userType} with ID: ${response.data.user.id}`
                };
            });
        }

        // Test user login
        for (const [userType, userData] of Object.entries(this.testData.users)) {
            await this.runTest(`Login ${userType}`, async () => {
                const response = await this.request('/api/auth/login', {
                    method: 'POST',
                    body: JSON.stringify({
                        email: userData.email,
                        password: userData.password
                    }),
                    auth: false
                });
                
                if (response.status !== 200) {
                    return { success: false, error: `Login failed: ${response.data.message}` };
                }
                
                if (!response.data.user || !response.data.token) {
                    return { success: false, error: 'Missing user data or token in response' };
                }
                
                this.tokens[userType] = response.data.token;
                
                return { 
                    success: true, 
                    details: `Successfully logged in ${userType}`
                };
            });
        }

        // Test token validation
        await this.runTest('Token Validation', async () => {
            const response = await this.request('/api/auth/validate');
            
            if (response.status !== 200) {
                return { success: false, error: `Token validation failed: ${response.data.message}` };
            }
            
            if (!response.data.valid) {
                return { success: false, error: 'Token marked as invalid' };
            }
            
            return { 
                success: true, 
                details: 'Token successfully validated'
            };
        });
    }

    // Enhanced Job Management Tests
    async testEnhancedJobManagement() {
        this.startCategory('Enhanced Job Management');
        
        // Test job creation
        await this.runTest('Create Job Posting', async () => {
            const jobData = this.testData.jobs[0];
            
            const response = await this.request('/api/jobs', {
                method: 'POST',
                body: JSON.stringify(jobData),
                headers: {
                    'Authorization': `Bearer ${this.tokens.recruiter}`
                }
            });
            
            if (response.status !== 201) {
                return { success: false, error: `Job creation failed: ${response.data.message}` };
            }
            
            if (!response.data.job || !response.data.job.id) {
                return { success: false, error: 'Missing job data in response' };
            }
            
            // Store job ID for later tests
            this.createdJobId = response.data.job.id;
            
            return { 
                success: true, 
                details: `Successfully created job with ID: ${response.data.job.id}`
            };
        });

        // Test job retrieval
        await this.runTest('Get Job Listings', async () => {
            const response = await this.request('/api/jobs');
            
            if (response.status !== 200) {
                return { success: false, error: `Failed to get jobs: ${response.data.message}` };
            }
            
            if (!Array.isArray(response.data.jobs)) {
                return { success: false, error: 'Jobs response is not an array' };
            }
            
            return { 
                success: true, 
                details: `Retrieved ${response.data.jobs.length} job listings`
            };
        });

        // Test job update
        await this.runTest('Update Job Posting', async () => {
            if (!this.createdJobId) {
                return { success: false, error: 'No job ID available for update test' };
            }
            
            const updateData = {
                title: 'Updated Senior Frontend Developer',
                salary: '$130,000 - $160,000'
            };
            
            const response = await this.request(`/api/jobs/${this.createdJobId}`,
