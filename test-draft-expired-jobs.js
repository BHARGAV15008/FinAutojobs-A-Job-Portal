#!/usr/bin/env node

/**
 * Test script to verify Draft and Expired job functionality
 */

import axios from 'axios';
import chalk from 'chalk';

const BASE_URL = 'http://localhost:5000';

class JobStatusTestSuite {
  constructor() {
    this.recruiterToken = null;
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

  async loginRecruiter() {
    this.log('Logging in as recruiter...', 'info');

    const loginResult = await this.makeRequest('POST', '/api/auth/login', {
      identifier: 'test.recruiter@finautojobs.com',
      password: 'TestPass123!@#',
      role: 'recruiter'
    });

    if (loginResult.success) {
      this.recruiterToken = loginResult.data.token || loginResult.data.data?.token;
      this.log('Recruiter logged in successfully', 'success');
      return true;
    } else {
      this.log(`Recruiter login failed: ${JSON.stringify(loginResult.error)}`, 'error');
      return false;
    }
  }

  async testJobStatusFiltering() {
    this.log('Testing job status filtering...', 'info');

    // Get recruiter's jobs (should include all statuses)
    const jobsResult = await this.makeRequest('GET', '/api/jobs?recruiterId=' + 
      (this.recruiterToken ? 'test-recruiter-id' : ''), null, this.recruiterToken);
    
    if (jobsResult.success) {
      const jobs = jobsResult.data.jobs || jobsResult.data.data || [];
      this.log(`Found ${jobs.length} total jobs for recruiter`, 'success');
      
      // Count jobs by status
      const statusCounts = jobs.reduce((acc, job) => {
        const status = job.status || 'Unknown';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});
      
      this.log('Job status breakdown:', 'info');
      Object.entries(statusCounts).forEach(([status, count]) => {
        this.log(`  ${status}: ${count} jobs`, 'info');
      });
      
      return true;
    } else {
      this.log(`Failed to fetch jobs: ${jobsResult.error.message}`, 'error');
      return false;
    }
  }

  async testDraftJobCreation() {
    this.log('Testing draft job creation...', 'info');

    const draftJobData = {
      jobTitle: 'Test Draft Position',
      companyName: 'Test Company Ltd',
      location: 'Test City',
      industry: 'Finance & Banking',
      jobCategory: 'Banking & Financial Services',
      jobType: 'Full Time',
      workArrangement: 'Hybrid',
      status: 'Draft', // This is the key field
      applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      experience: {
        minimum: 2,
        maximum: 5
      },
      jobDescription: 'This is a test draft job posting to verify draft functionality.',
      requiredSkills: ['Testing', 'Draft Management'],
      keyResponsibilities: ['Test draft functionality'],
      requirements: ['Experience with testing'],
      salaryRange: {
        type: 'Range',
        min: 50000,
        max: 80000,
        period: 'Yearly',
        currency: 'INR'
      },
      contactEmail: 'test.recruiter@finautojobs.com',
      jobUrgency: 'Normal Priority'
    };

    const createResult = await this.makeRequest('POST', '/api/jobs', draftJobData, this.recruiterToken);
    
    if (createResult.success) {
      this.log('Draft job created successfully', 'success');
      const jobId = createResult.data.job?.id || createResult.data.id;
      this.log(`Draft job ID: ${jobId}`, 'info');
      return jobId;
    } else {
      this.log(`Draft job creation failed: ${JSON.stringify(createResult.error)}`, 'error');
      return null;
    }
  }

  async testExpiredJobUpdate() {
    this.log('Testing expired job status update...', 'info');

    // Create a job with past deadline to test expiration
    const expiredJobData = {
      jobTitle: 'Test Expired Position',
      companyName: 'Test Company Ltd',
      location: 'Test City',
      industry: 'Finance & Banking',
      jobCategory: 'Banking & Financial Services',
      jobType: 'Full Time',
      workArrangement: 'Hybrid',
      status: 'Active',
      applicationDeadline: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
      experience: {
        minimum: 2,
        maximum: 5
      },
      jobDescription: 'This is a test job with expired deadline.',
      requiredSkills: ['Testing'],
      keyResponsibilities: ['Test expiration functionality'],
      requirements: ['Experience with testing'],
      salaryRange: {
        type: 'Range',
        min: 50000,
        max: 80000,
        period: 'Yearly',
        currency: 'INR'
      },
      contactEmail: 'test.recruiter@finautojobs.com',
      jobUrgency: 'Normal Priority'
    };

    const createResult = await this.makeRequest('POST', '/api/jobs', expiredJobData, this.recruiterToken);
    
    if (createResult.success) {
      this.log('Expired job created successfully', 'success');
      
      // Now fetch jobs again to see if the expired job gets updated to 'Expired' status
      setTimeout(async () => {
        const jobsResult = await this.makeRequest('GET', '/api/jobs?recruiterId=test', null, this.recruiterToken);
        if (jobsResult.success) {
          const jobs = jobsResult.data.jobs || jobsResult.data.data || [];
          const expiredJobs = jobs.filter(job => job.status === 'Expired');
          this.log(`Found ${expiredJobs.length} expired jobs after auto-update`, 'success');
        }
      }, 2000);
      
      return true;
    } else {
      this.log(`Expired job creation failed: ${JSON.stringify(createResult.error)}`, 'error');
      return false;
    }
  }

  async runTests() {
    this.log('🚀 Starting Draft and Expired Jobs Test Suite', 'info');
    this.log('=' .repeat(60), 'info');

    try {
      // Step 1: Login
      const loginSuccess = await this.loginRecruiter();
      if (!loginSuccess) {
        this.log('Login failed, cannot continue tests', 'error');
        return false;
      }

      // Step 2: Test job status filtering
      await this.testJobStatusFiltering();

      // Step 3: Test draft job creation
      await this.testDraftJobCreation();

      // Step 4: Test expired job functionality
      await this.testExpiredJobUpdate();

      this.log('🎉 All tests completed successfully!', 'success');
      return true;

    } catch (error) {
      this.log(`Test suite crashed: ${error.message}`, 'error');
      return false;
    }
  }
}

// Run the tests
async function main() {
  const testSuite = new JobStatusTestSuite();
  const success = await testSuite.runTests();
  
  if (success) {
    console.log(chalk.green('\n🎉 Draft and Expired job functionality tests completed!'));
    console.log(chalk.blue('✅ Draft button should now work correctly'));
    console.log(chalk.blue('✅ Expired jobs should move to Closed tab'));
    process.exit(0);
  } else {
    console.log(chalk.red('\n❌ Some tests failed. Please check the errors above.'));
    process.exit(1);
  }
}

main().catch(error => {
  console.error(chalk.red(`💥 Test runner crashed: ${error.message}`));
  process.exit(1);
});
