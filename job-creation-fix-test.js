import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000/api';

class JobCreationTester {
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

    async testJobCreation() {
        console.log('🧪 Testing Job Creation with Proper Data\n');

        // Test 1: Valid job creation
        this.log('Testing valid job creation with all required fields');
        const validJob = {
            title: 'Senior Software Engineer',
            company: 'TechCorp Inc',
            location: 'San Francisco, CA',
            description: 'We are looking for a senior software engineer...',
            requirements: 'Bachelor degree in Computer Science, 5+ years experience',
            salary: '$120,000 - $150,000',
            type: 'full-time'
        };
        
        const { data: jobResult, status: jobStatus } = await this.makeRequest('/jobs', {
            method: 'POST',
            body: JSON.stringify(validJob)
        });
        
        if (jobStatus === 201 || jobStatus === 200) {
            this.log('Job creation successful with valid data', 'success');
        } else {
            this.log(`Job creation failed: ${jobResult.message || 'Unknown error'}`, 'error');
        }

        // Test 2: Job creation with minimal required fields
        this.log('Testing job creation with minimal required fields');
        const minimalJob = {
            title: 'Frontend Developer',
            company: 'StartupXYZ',
            location: 'Remote'
        };
        
        const { data: minimalResult, status: minimalStatus } = await this.makeRequest('/jobs', {
            method: 'POST',
            body: JSON.stringify(minimalJob)
        });
        
        if (minimalStatus === 201 || minimalStatus === 200) {
            this.log('Job creation successful with minimal data', 'success');
        } else {
            this.log(`Minimal job creation failed: ${minimalResult.message || 'Unknown error'}`, 'error');
        }

        // Test 3: Test application creation with valid job ID
        this.log('Testing application creation with valid job ID');
        const validApplication = {
            job_id: 1, // Using existing job ID
            applicant_id: 1,
            cover_letter: 'I am very interested in this position...',
            resume_url: 'https://example.com/resume.pdf'
        };
        
        const { data: appResult, status: appStatus } = await this.makeRequest('/applications', {
            method: 'POST',
            body: JSON.stringify(validApplication)
        });
        
        if (appStatus === 201 || appStatus === 200) {
            this.log('Application creation successful with valid data', 'success');
        } else {
            this.log(`Application creation failed: ${appResult.message || 'Unknown error'}`, 'error');
        }

        // Test 4: Test job update
        this.log('Testing job update functionality');
        const jobUpdate = {
            title: 'Senior Software Engineer (Updated)',
            company: 'TechCorp Inc',
            location: 'San Francisco, CA (Hybrid)',
            description: 'Updated job description...'
        };
        
        const { data: updateResult, status: updateStatus } = await this.makeRequest('/jobs/1', {
            method: 'PUT',
            body: JSON.stringify(jobUpdate)
        });
        
        if (updateStatus === 200) {
            this.log('Job update successful', 'success');
        } else {
            this.log(`Job update failed: ${updateResult?.message || 'Unknown error'}`, 'warning');
        }

        // Test 5: Test job deletion
        this.log('Testing job deletion functionality');
        const { data: deleteResult, status: deleteStatus } = await this.makeRequest('/jobs/999', {
            method: 'DELETE'
        });
        
        if (deleteStatus === 200 || deleteStatus === 404) {
            this.log('Job deletion endpoint accessible', 'success');
        } else {
            this.log(`Job deletion failed: ${deleteResult?.message || 'Unknown error'}`, 'warning');
        }

        // Summary
        const successful = this.results.filter(r => r.type === 'success').length;
        const warnings = this.results.filter(r => r.type === 'warning').length;
        const errors = this.results.filter(r => r.type === 'error').length;
        const total = successful + warnings + errors;
        
        console.log(`\n📊 Job Management Testing Complete!`);
        console.log(`✅ Successful: ${successful}/${total} (${((successful/total)*100).toFixed(1)}%)`);
        console.log(`⚠️ Warnings: ${warnings}/${total} (${((warnings/total)*100).toFixed(1)}%)`);
        console.log(`❌ Errors: ${errors}/${total} (${((errors/total)*100).toFixed(1)}%)`);
        
        return { successful, warnings, errors, total, results: this.results };
    }
}

const tester = new JobCreationTester();
tester.testJobCreation().catch(console.error);
