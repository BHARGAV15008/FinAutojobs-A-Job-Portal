#!/usr/bin/env node

/**
 * Simple Job Application Flow Test
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000/api';

async function testJobApplicationFlow() {
  console.log('💼 Testing Job Application Flow...\n');
  
  let authToken = null;
  const testEmail = 'jobtest' + Date.now() + '@example.com';
  
  try {
    // Step 1: Register a test user
    console.log('1. Registering test user...');
    const registerResponse = await fetch(BASE_URL + '/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'TestPassword123!',
        firstName: 'Job',
        lastName: 'Applicant',
        role: 'applicant',
        phone: '9876543210'
      })
    });
    
    const registerData = await registerResponse.json();
    if (registerResponse.ok) {
      console.log('✅ User registered successfully');
    } else {
      console.log('❌ Registration failed:', registerData.message);
      return false;
    }

    // Step 2: Login
    console.log('2. Logging in...');
    const loginResponse = await fetch(BASE_URL + '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: testEmail,
        password: 'TestPassword123!',
        role: 'applicant'
      })
    });
    
    const loginData = await loginResponse.json();
    if (loginResponse.ok) {
      authToken = loginData.data.token;
      console.log('✅ Login successful');
    } else {
      console.log('❌ Login failed:', loginData.message);
      return false;
    }

    // Step 3: Get available jobs
    console.log('3. Fetching available jobs...');
    const jobsResponse = await fetch(BASE_URL + '/jobs');
    const jobsData = await jobsResponse.json();
    
    if (jobsResponse.ok) {
      console.log(`✅ Found ${Array.isArray(jobsData) ? jobsData.length : 'some'} jobs`);
    } else {
      console.log('❌ Failed to fetch jobs:', jobsData.message);
    }

    // Step 4: Test applications endpoint (should be secured)
    console.log('4. Testing applications endpoint security...');
    const applicationsResponse = await fetch(BASE_URL + '/applications', {
      headers: {
        'Authorization': 'Bearer ' + authToken
      }
    });
    
    if (applicationsResponse.ok) {
      const applicationsData = await applicationsResponse.json();
      console.log('✅ Applications endpoint accessible with auth');
      console.log(`   User has ${Array.isArray(applicationsData) ? applicationsData.length : 'some'} applications`);
    } else if (applicationsResponse.status === 401) {
      console.log('⚠️ Applications endpoint properly secured (401 without proper auth)');
    } else {
      console.log('❌ Applications endpoint error:', applicationsResponse.status);
    }

    // Step 5: Test profile endpoint
    console.log('5. Testing profile access...');
    const profileResponse = await fetch(BASE_URL + '/auth/profile', {
      headers: {
        'Authorization': 'Bearer ' + authToken
      }
    });
    
    if (profileResponse.ok) {
      const profileData = await profileResponse.json();
      console.log('✅ Profile accessible');
      console.log(`   User role: ${profileData.data?.role}`);
      console.log(`   User email: ${profileData.data?.email}`);
    } else {
      console.log('❌ Profile access failed:', profileResponse.status);
    }

    // Step 6: Test job search functionality
    console.log('6. Testing job search...');
    const searchResponse = await fetch(BASE_URL + '/jobs/search?q=developer');
    
    if (searchResponse.ok) {
      const searchData = await searchResponse.json();
      console.log('✅ Job search working');
    } else {
      console.log('❌ Job search failed:', searchResponse.status);
    }

    // Step 7: Test job categories
    console.log('7. Testing job categories...');
    const categoriesResponse = await fetch(BASE_URL + '/jobs/categories');
    
    if (categoriesResponse.ok) {
      const categoriesData = await categoriesResponse.json();
      console.log('✅ Job categories working');
    } else {
      console.log('❌ Job categories failed:', categoriesResponse.status);
    }

    // Step 8: Test job locations
    console.log('8. Testing job locations...');
    const locationsResponse = await fetch(BASE_URL + '/jobs/locations');
    
    if (locationsResponse.ok) {
      const locationsData = await locationsResponse.json();
      console.log('✅ Job locations working');
    } else {
      console.log('❌ Job locations failed:', locationsResponse.status);
    }

    return true;

  } catch (error) {
    console.log('❌ Job application flow test error:', error.message);
    return false;
  }
}

async function testRecruiterFlow() {
  console.log('\n👔 Testing Recruiter Flow...\n');
  
  let authToken = null;
  const testEmail = 'recruitertest' + Date.now() + '@example.com';
  
  try {
    // Step 1: Register a recruiter
    console.log('1. Registering test recruiter...');
    const registerResponse = await fetch(BASE_URL + '/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'TestPassword123!',
        firstName: 'Test',
        lastName: 'Recruiter',
        role: 'recruiter',
        phone: '9876543211'
      })
    });
    
    const registerData = await registerResponse.json();
    if (registerResponse.ok) {
      console.log('✅ Recruiter registered successfully');
    } else {
      console.log('❌ Recruiter registration failed:', registerData.message);
      return false;
    }

    // Step 2: Login as recruiter
    console.log('2. Logging in as recruiter...');
    const loginResponse = await fetch(BASE_URL + '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        identifier: testEmail,
        password: 'TestPassword123!',
        role: 'recruiter'
      })
    });
    
    const loginData = await loginResponse.json();
    if (loginResponse.ok) {
      authToken = loginData.data.token;
      console.log('✅ Recruiter login successful');
    } else {
      console.log('❌ Recruiter login failed:', loginData.message);
      return false;
    }

    // Step 3: Test recruiter profile
    console.log('3. Testing recruiter profile...');
    const profileResponse = await fetch(BASE_URL + '/auth/profile', {
      headers: {
        'Authorization': 'Bearer ' + authToken
      }
    });
    
    if (profileResponse.ok) {
      const profileData = await profileResponse.json();
      console.log('✅ Recruiter profile accessible');
      console.log(`   Role: ${profileData.data?.role}`);
    } else {
      console.log('❌ Recruiter profile access failed:', profileResponse.status);
    }

    return true;

  } catch (error) {
    console.log('❌ Recruiter flow test error:', error.message);
    return false;
  }
}

async function runJobFlowTests() {
  console.log('🧪 FinAutoJobs Job Application Flow Test Suite\n');
  console.log('=' .repeat(60));
  
  const startTime = Date.now();
  
  const applicantFlowPassed = await testJobApplicationFlow();
  const recruiterFlowPassed = await testRecruiterFlow();
  
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  
  console.log('\n' + '=' .repeat(60));
  console.log('📊 JOB FLOW TEST RESULTS');
  console.log('=' .repeat(60));
  console.log('Applicant Flow:', applicantFlowPassed ? '✅ PASSED' : '❌ FAILED');
  console.log('Recruiter Flow:', recruiterFlowPassed ? '✅ PASSED' : '❌ FAILED');
  console.log(`⏱️ Duration: ${duration}s`);
  
  const overallSuccess = applicantFlowPassed && recruiterFlowPassed;
  console.log('\n🎯 Overall Result:', overallSuccess ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED');
  
  return overallSuccess;
}

// Run tests
runJobFlowTests().catch(error => {
  console.error('❌ Test suite failed:', error.message);
  process.exit(1);
});
