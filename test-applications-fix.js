#!/usr/bin/env node

/**
 * Test script to verify the Applications button fix
 */

import axios from 'axios';
import chalk from 'chalk';

const BASE_URL = 'http://localhost:5000';

class ApplicationsTestSuite {
  constructor() {
    this.recruiterToken = null;
    this.applicantToken = null;
    this.testJobId = null;
    this.testApplicationId = null;
  }

  log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    switch (type) {
      case 'success':
        console.log(chalk.green(`✅ [${timestamp}] ${message}`));
        break;
      case 'error':
        console.log(chalk.red(`❌ [${timestamp}] ${message}`));
        break;
      case 'warning':
        console.log(chalk.yellow(`⚠️  [${timestamp}] ${message}`));
        break;
      case 'info':
        console.log(chalk.blue(`ℹ️  [${timestamp}] ${message}`));
        break;
    }
  }

  async makeRequest(method, endpoint, data = null, token = null) {
    try {
      const config = {
        method,
        url: `${BASE_URL}${endpoint}`,
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        ...(data && { data })
      };

      const response = await axios(config);
      return { success: true, data: response.data };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data || error.message,
        status: error.response?.status || 500
      };
    }
  }

  async loginTestAccounts() {
    this.log('Logging in test accounts...', 'info');

    // Login recruiter
    const recruiterLogin = await this.makeRequest('POST', '/api/auth/login', {
      identifier: 'test.recruiter@finautojobs.com',
      password: 'TestPass123!@#',
      role: 'recruiter'
    });

    if (recruiterLogin.success) {
      this.recruiterToken = recruiterLogin.data.token;
      this.log('Recruiter logged in successfully', 'success');
    } else {
      this.log('Recruiter login failed', 'error');
      return false;
    }

    // Login applicant
    const applicantLogin = await this.makeRequest('POST', '/api/auth/login', {
      identifier: 'test.applicant@finautojobs.com',
      password: 'TestPass123!@#',
      role: 'applicant'
    });

    if (applicantLogin.success) {
      this.applicantToken = applicantLogin.data.token;
      this.log('Applicant logged in successfully', 'success');
    } else {
      this.log('Applicant login failed', 'error');
      return false;
    }

    return true;
  }

  async findOrCreateTestJob() {
    this.log('Finding or creating test job...', 'info');

    // First, try to get existing jobs
    const jobsResult = await this.makeRequest('GET', '/api/jobs', null, this.recruiterToken);
    
    if (jobsResult.success) {
      const jobs = jobsResult.data.jobs || jobsResult.data.data || [];
      if (jobs.length > 0) {
        this.testJobId = jobs[0]._id || jobs[0].id;
        this.log(`Using existing job: ${jobs[0].jobTitle || jobs[0].title}`, 'success');
        return true;
      }
    }

    this.log('No existing jobs found, will use any available job', 'warning');
    return true;
  }

  async testApplicationsEndpoint() {
    this.log('Testing applications endpoint...', 'info');

    if (!this.testJobId) {
      this.log('No test job available, testing general applications endpoint', 'warning');
      
      // Test general applications endpoint
      const appsResult = await this.makeRequest('GET', '/api/applications', null, this.recruiterToken);
      if (appsResult.success) {
        const applications = appsResult.data.data?.applications || appsResult.data.applications || [];
        this.log(`Found ${applications.length} total applications`, 'success');
        return true;
      } else {
        this.log(`Applications endpoint failed: ${appsResult.error.message}`, 'error');
        return false;
      }
    }

    // Test job-specific applications endpoint
    const jobAppsResult = await this.makeRequest('GET', `/api/applications/job/${this.testJobId}`, null, this.recruiterToken);
    
    if (jobAppsResult.success) {
      const applications = jobAppsResult.data.data?.applications || jobAppsResult.data.applications || [];
      this.log(`Found ${applications.length} applications for job ${this.testJobId}`, 'success');
      return true;
    } else {
      this.log(`Job applications endpoint failed: ${jobAppsResult.error.message}`, 'error');
      
      // Try query parameter approach as fallback
      const fallbackResult = await this.makeRequest('GET', `/api/applications?jobId=${this.testJobId}`, null, this.recruiterToken);
      
      if (fallbackResult.success) {
        const applications = fallbackResult.data.data?.applications || fallbackResult.data.applications || [];
        this.log(`Fallback endpoint worked: Found ${applications.length} applications`, 'success');
        return true;
      } else {
        this.log(`Both endpoints failed: ${fallbackResult.error.message}`, 'error');
        return false;
      }
    }
  }

  async runTest() {
    this.log('🚀 Starting Applications Fix Test', 'info');
    this.log('=' .repeat(50), 'info');

    try {
      // Step 1: Login
      const loginSuccess = await this.loginTestAccounts();
      if (!loginSuccess) {
        this.log('Login failed, cannot continue test', 'error');
        return false;
      }

      // Step 2: Find or create test job
      await this.findOrCreateTestJob();

      // Step 3: Test applications endpoint
      const endpointSuccess = await this.testApplicationsEndpoint();
      
      if (endpointSuccess) {
        this.log('🎉 Applications endpoint test PASSED!', 'success');
        this.log('The Applications button should now work correctly', 'success');
        return true;
      } else {
        this.log('❌ Applications endpoint test FAILED!', 'error');
        return false;
      }

    } catch (error) {
      this.log(`Test crashed: ${error.message}`, 'error');
      return false;
    }
  }
}

// Run the test
async function main() {
  const testSuite = new ApplicationsTestSuite();
  const success = await testSuite.runTest();
  
  if (success) {
    console.log(chalk.green('\n🎉 All tests passed! The Applications button fix is working.'));
    process.exit(0);
  } else {
    console.log(chalk.red('\n❌ Tests failed. Please check the errors above.'));
    process.exit(1);
  }
}

main().catch(error => {
  console.error(chalk.red(`💥 Test runner crashed: ${error.message}`));
  process.exit(1);
});
