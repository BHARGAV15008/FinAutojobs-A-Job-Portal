import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class FinAutoJobsTester {
    constructor() {
        this.backendProcess = null;
        this.frontendProcess = null;
        this.testResults = {
            backend: { status: 'pending', errors: [], logs: [] },
            frontend: { status: 'pending', errors: [], logs: [] },
            api: { status: 'pending', tests: [] },
            integration: { status: 'pending', tests: [] }
        };
    }

    log(section, message) {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] [${section.toUpperCase()}] ${message}`);
        this.testResults[section]?.logs?.push(`${timestamp}: ${message}`);
    }

    async startBackend() {
        return new Promise((resolve, reject) => {
            this.log('backend', 'Starting backend server...');
            
            const backendPath = join(__dirname, 'backend');
            this.backendProcess = spawn('node', ['start-server.js'], {
                cwd: backendPath,
                stdio: ['pipe', 'pipe', 'pipe']
            });

            let startupTimeout = setTimeout(() => {
                this.log('backend', 'Backend startup timeout');
                this.testResults.backend.status = 'timeout';
                reject(new Error('Backend startup timeout'));
            }, 10000);

            this.backendProcess.stdout.on('data', (data) => {
                const output = data.toString();
                this.log('backend', `STDOUT: ${output.trim()}`);
                
                if (output.includes('FinAutoJobs Backend Server running')) {
                    clearTimeout(startupTimeout);
                    this.testResults.backend.status = 'running';
                    this.log('backend', 'Backend server started successfully');
                    resolve();
                }
            });

            this.backendProcess.stderr.on('data', (data) => {
                const error = data.toString();
                this.log('backend', `STDERR: ${error.trim()}`);
                this.testResults.backend.errors.push(error.trim());
            });

            this.backendProcess.on('error', (error) => {
                clearTimeout(startupTimeout);
                this.log('backend', `Process error: ${error.message}`);
                this.testResults.backend.status = 'error';
                this.testResults.backend.errors.push(error.message);
                reject(error);
            });

            this.backendProcess.on('exit', (code) => {
                clearTimeout(startupTimeout);
                this.log('backend', `Process exited with code ${code}`);
                this.testResults.backend.status = 'exited';
            });
        });
    }

    async startFrontend() {
        return new Promise((resolve, reject) => {
            this.log('frontend', 'Starting frontend server...');
            
            const frontendPath = join(__dirname, 'frontend');
            this.frontendProcess = spawn('npm', ['start'], {
                cwd: frontendPath,
                stdio: ['pipe', 'pipe', 'pipe']
            });

            let startupTimeout = setTimeout(() => {
                this.log('frontend', 'Frontend startup timeout');
                this.testResults.frontend.status = 'timeout';
                reject(new Error('Frontend startup timeout'));
            }, 30000);

            this.frontendProcess.stdout.on('data', (data) => {
                const output = data.toString();
                this.log('frontend', `STDOUT: ${output.trim()}`);
                
                if (output.includes('webpack compiled') || output.includes('Local:')) {
                    clearTimeout(startupTimeout);
                    this.testResults.frontend.status = 'running';
                    this.log('frontend', 'Frontend server started successfully');
                    resolve();
                }
            });

            this.frontendProcess.stderr.on('data', (data) => {
                const error = data.toString();
                this.log('frontend', `STDERR: ${error.trim()}`);
                this.testResults.frontend.errors.push(error.trim());
            });

            this.frontendProcess.on('error', (error) => {
                clearTimeout(startupTimeout);
                this.log('frontend', `Process error: ${error.message}`);
                this.testResults.frontend.status = 'error';
                this.testResults.frontend.errors.push(error.message);
                reject(error);
            });
        });
    }

    async testAPI() {
        this.log('api', 'Starting API tests...');
        const baseUrl = 'http://localhost:5000/api';
        
        const tests = [
            {
                name: 'Health Check',
                method: 'GET',
                url: `${baseUrl}/health`,
                expectedStatus: 200
            },
            {
                name: 'OAuth Config',
                method: 'GET',
                url: `${baseUrl}/oauth/config`,
                expectedStatus: 200
            },
            {
                name: 'Get Jobs',
                method: 'GET',
                url: `${baseUrl}/jobs`,
                expectedStatus: 200
            },
            {
                name: 'Get Companies',
                method: 'GET',
                url: `${baseUrl}/companies`,
                expectedStatus: 200
            }
        ];

        for (const test of tests) {
            try {
                this.log('api', `Testing: ${test.name}`);
                const response = await fetch(test.url, { method: test.method });
                const data = await response.json();
                
                const result = {
                    name: test.name,
                    status: response.status === test.expectedStatus ? 'pass' : 'fail',
                    statusCode: response.status,
                    response: data
                };
                
                this.testResults.api.tests.push(result);
                this.log('api', `${test.name}: ${result.status} (${response.status})`);
            } catch (error) {
                const result = {
                    name: test.name,
                    status: 'error',
                    error: error.message
                };
                this.testResults.api.tests.push(result);
                this.log('api', `${test.name}: ERROR - ${error.message}`);
            }
        }
        
        this.testResults.api.status = 'completed';
    }

    async testAuthentication() {
        this.log('integration', 'Testing authentication flow...');
        const baseUrl = 'http://localhost:5000/api';
        
        try {
            // Test registration
            const registerData = {
                username: `testuser_${Date.now()}`,
                email: `test_${Date.now()}@example.com`,
                password: 'TestPass123!',
                full_name: 'Test User',
                role: 'jobseeker'
            };
            
            const registerResponse = await fetch(`${baseUrl}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(registerData)
            });
            
            const registerResult = await registerResponse.json();
            this.testResults.integration.tests.push({
                name: 'User Registration',
                status: registerResponse.ok ? 'pass' : 'fail',
                response: registerResult
            });
            
            if (registerResponse.ok) {
                // Test login
                const loginResponse = await fetch(`${baseUrl}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        username: registerData.username,
                        password: registerData.password
                    })
                });
                
                const loginResult = await loginResponse.json();
                this.testResults.integration.tests.push({
                    name: 'User Login',
                    status: loginResponse.ok ? 'pass' : 'fail',
                    response: loginResult
                });
            }
        } catch (error) {
            this.testResults.integration.tests.push({
                name: 'Authentication Flow',
                status: 'error',
                error: error.message
            });
        }
        
        this.testResults.integration.status = 'completed';
    }

    async generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                backend: this.testResults.backend.status,
                frontend: this.testResults.frontend.status,
                apiTests: this.testResults.api.tests.filter(t => t.status === 'pass').length,
                totalApiTests: this.testResults.api.tests.length,
                integrationTests: this.testResults.integration.tests.filter(t => t.status === 'pass').length,
                totalIntegrationTests: this.testResults.integration.tests.length
            },
            details: this.testResults
        };
        
        await fs.writeFile(
            join(__dirname, 'test-report.json'),
            JSON.stringify(report, null, 2)
        );
        
        console.log('\n' + '='.repeat(80));
        console.log('FINAUTOJOBS COMPREHENSIVE TEST REPORT');
        console.log('='.repeat(80));
        console.log(`Backend Status: ${report.summary.backend}`);
        console.log(`Frontend Status: ${report.summary.frontend}`);
        console.log(`API Tests: ${report.summary.apiTests}/${report.summary.totalApiTests} passed`);
        console.log(`Integration Tests: ${report.summary.integrationTests}/${report.summary.totalIntegrationTests} passed`);
        console.log('='.repeat(80));
        
        if (this.testResults.backend.errors.length > 0) {
            console.log('\nBackend Errors:');
            this.testResults.backend.errors.forEach(error => console.log(`  - ${error}`));
        }
        
        if (this.testResults.frontend.errors.length > 0) {
            console.log('\nFrontend Errors:');
            this.testResults.frontend.errors.forEach(error => console.log(`  - ${error}`));
        }
        
        console.log(`\nDetailed report saved to: test-report.json`);
    }

    async cleanup() {
        if (this.backendProcess) {
            this.backendProcess.kill();
        }
        if (this.frontendProcess) {
            this.frontendProcess.kill();
        }
    }

    async run() {
        try {
            console.log('🚀 Starting FinAutoJobs Comprehensive Testing...\n');
            
            // Start backend
            await this.startBackend();
            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for full startup
            
            // Test API endpoints
            await this.testAPI();
            
            // Test authentication
            await this.testAuthentication();
            
            // Start frontend (optional, for manual testing)
            try {
                await this.startFrontend();
            } catch (error) {
                this.log('frontend', `Frontend startup failed: ${error.message}`);
            }
            
            // Generate report
            await this.generateReport();
            
            console.log('\n✅ Testing completed! Servers are running for manual testing.');
            console.log('Press Ctrl+C to stop servers and exit.');
            
            // Keep process alive for manual testing
            process.on('SIGINT', async () => {
                console.log('\n🛑 Shutting down...');
                await this.cleanup();
                process.exit(0);
            });
            
        } catch (error) {
            console.error('❌ Testing failed:', error.message);
            await this.cleanup();
            process.exit(1);
        }
    }
}

// Run the comprehensive test
const tester = new FinAutoJobsTester();
tester.run();
