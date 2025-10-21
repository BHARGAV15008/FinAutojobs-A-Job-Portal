#!/usr/bin/env node

/**
 * Complete OAuth Testing Script
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000/api';

async function testOAuthEndpoints() {
  console.log('🔗 Testing OAuth Integration...\n');
  
  const tests = [];
  
  try {
    // Test OAuth status
    console.log('Testing OAuth status endpoint...');
    const statusResponse = await fetch(BASE_URL + '/oauth/status');
    const statusData = await statusResponse.json();
    
    tests.push({
      name: 'OAuth Status',
      passed: statusResponse.ok,
      status: statusResponse.status,
      data: statusData
    });
    
    if (statusResponse.ok) {
      console.log('✅ OAuth Status - Available providers:', Object.keys(statusData.providers || {}));
    } else {
      console.log('❌ OAuth Status failed');
    }

    // Test OAuth config
    console.log('Testing OAuth config endpoint...');
    const configResponse = await fetch(BASE_URL + '/oauth/config');
    const configData = await configResponse.json();
    
    tests.push({
      name: 'OAuth Config',
      passed: configResponse.ok,
      status: configResponse.status,
      data: configData
    });
    
    if (configResponse.ok) {
      console.log('✅ OAuth Config - Providers configured:', Object.keys(configData.providers || {}));
    } else {
      console.log('❌ OAuth Config failed');
    }

    // Test OAuth debug
    console.log('Testing OAuth debug endpoint...');
    const debugResponse = await fetch(BASE_URL + '/oauth/debug');
    const debugData = await debugResponse.json();
    
    tests.push({
      name: 'OAuth Debug',
      passed: debugResponse.ok,
      status: debugResponse.status,
      data: debugData
    });
    
    if (debugResponse.ok) {
      console.log('✅ OAuth Debug - Environment:', debugData.debug?.environment);
      console.log('   Google Client ID configured:', !!debugData.debug?.googleClientId);
      console.log('   Callback URLs:', debugData.debug?.callbackUrls);
    } else {
      console.log('❌ OAuth Debug failed');
    }

    // Test OAuth simulation endpoints (development only)
    console.log('\nTesting OAuth simulation endpoints...');
    
    const providers = ['google', 'microsoft', 'linkedin'];
    const roles = ['applicant', 'recruiter'];
    
    for (const provider of providers) {
      for (const role of roles) {
        try {
          console.log(`Testing ${provider} OAuth simulation for ${role}...`);
          const simResponse = await fetch(`${BASE_URL}/test-oauth/simulate/${provider}?role=${role}`);
          
          tests.push({
            name: `OAuth Simulation ${provider} ${role}`,
            passed: simResponse.status === 302 || simResponse.ok, // 302 redirect is expected
            status: simResponse.status,
            provider,
            role
          });
          
          if (simResponse.status === 302) {
            const location = simResponse.headers.get('location');
            console.log(`✅ ${provider} ${role} simulation - Redirects to:`, location?.substring(0, 100) + '...');
          } else if (simResponse.ok) {
            console.log(`✅ ${provider} ${role} simulation - Status:`, simResponse.status);
          } else {
            console.log(`❌ ${provider} ${role} simulation failed - Status:`, simResponse.status);
          }
        } catch (error) {
          console.log(`❌ ${provider} ${role} simulation error:`, error.message);
          tests.push({
            name: `OAuth Simulation ${provider} ${role}`,
            passed: false,
            error: error.message
          });
        }
      }
    }

  } catch (error) {
    console.log('❌ OAuth testing error:', error.message);
    tests.push({
      name: 'OAuth Testing',
      passed: false,
      error: error.message
    });
  }

  return tests;
}

async function testJobsAndCompaniesAPI() {
  console.log('\n💼 Testing Jobs and Companies API...\n');
  
  const tests = [];
  
  try {
    // Test jobs endpoints
    const jobsEndpoints = [
      '/jobs',
      '/jobs/search?q=developer',
      '/jobs/categories',
      '/jobs/locations',
      '/jobs/filter?experience=2-5'
    ];
    
    for (const endpoint of jobsEndpoints) {
      try {
        const response = await fetch(BASE_URL + endpoint);
        const data = await response.json();
        
        tests.push({
          name: `Jobs API ${endpoint}`,
          passed: response.ok,
          status: response.status,
          dataLength: Array.isArray(data) ? data.length : Object.keys(data).length
        });
        
        if (response.ok) {
          console.log(`✅ ${endpoint} - Status: ${response.status}`);
        } else {
          console.log(`❌ ${endpoint} - Status: ${response.status}`);
        }
      } catch (error) {
        console.log(`❌ ${endpoint} - Error:`, error.message);
        tests.push({
          name: `Jobs API ${endpoint}`,
          passed: false,
          error: error.message
        });
      }
    }

    // Test companies endpoints
    const companiesEndpoints = [
      '/companies',
      '/companies/search?q=tech',
      '/companies/featured'
    ];
    
    for (const endpoint of companiesEndpoints) {
      try {
        const response = await fetch(BASE_URL + endpoint);
        const data = await response.json();
        
        tests.push({
          name: `Companies API ${endpoint}`,
          passed: response.ok,
          status: response.status,
          dataLength: Array.isArray(data) ? data.length : Object.keys(data).length
        });
        
        if (response.ok) {
          console.log(`✅ ${endpoint} - Status: ${response.status}`);
        } else {
          console.log(`❌ ${endpoint} - Status: ${response.status}`);
        }
      } catch (error) {
        console.log(`❌ ${endpoint} - Error:`, error.message);
        tests.push({
          name: `Companies API ${endpoint}`,
          passed: false,
          error: error.message
        });
      }
    }

  } catch (error) {
    console.log('❌ Jobs/Companies API testing error:', error.message);
  }

  return tests;
}

async function testDatabaseConnections() {
  console.log('\n🗄️ Testing Database Connections...\n');
  
  const tests = [];
  
  try {
    // Test health endpoint which includes database status
    const healthResponse = await fetch(BASE_URL + '/health');
    const healthData = await healthResponse.json();
    
    tests.push({
      name: 'Database Connection',
      passed: healthResponse.ok && healthData.services?.database === 'connected',
      status: healthResponse.status,
      databaseStatus: healthData.services?.database
    });
    
    if (healthResponse.ok && healthData.services?.database === 'connected') {
      console.log('✅ Database Connection - Status: Connected');
      console.log('   Environment:', healthData.env);
      console.log('   Services:', Object.keys(healthData.services || {}));
    } else {
      console.log('❌ Database Connection - Status:', healthData.services?.database);
    }

    // Test some database operations through API
    const dbTestEndpoints = [
      '/jobs', // Should query jobs collection
      '/companies', // Should query companies collection
    ];
    
    for (const endpoint of dbTestEndpoints) {
      try {
        const response = await fetch(BASE_URL + endpoint);
        const data = await response.json();
        
        tests.push({
          name: `Database Query ${endpoint}`,
          passed: response.ok,
          status: response.status,
          hasData: Array.isArray(data) ? data.length > 0 : Object.keys(data).length > 0
        });
        
        if (response.ok) {
          console.log(`✅ Database Query ${endpoint} - Working`);
        } else {
          console.log(`❌ Database Query ${endpoint} - Failed`);
        }
      } catch (error) {
        console.log(`❌ Database Query ${endpoint} - Error:`, error.message);
        tests.push({
          name: `Database Query ${endpoint}`,
          passed: false,
          error: error.message
        });
      }
    }

  } catch (error) {
    console.log('❌ Database testing error:', error.message);
  }

  return tests;
}

async function runCompleteTests() {
  console.log('🧪 FinAutoJobs Complete API & OAuth Test Suite\n');
  console.log('=' .repeat(60));
  
  const startTime = Date.now();
  
  // Run all test suites
  const oauthTests = await testOAuthEndpoints();
  const jobsTests = await testJobsAndCompaniesAPI();
  const dbTests = await testDatabaseConnections();
  
  const allTests = [...oauthTests, ...jobsTests, ...dbTests];
  
  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);
  
  // Calculate results
  const totalTests = allTests.length;
  const passedTests = allTests.filter(test => test.passed).length;
  const failedTests = totalTests - passedTests;
  const successRate = ((passedTests / totalTests) * 100).toFixed(1);
  
  console.log('\n' + '=' .repeat(60));
  console.log('📊 COMPLETE TEST RESULTS SUMMARY');
  console.log('=' .repeat(60));
  console.log(`Total Tests: ${totalTests}`);
  console.log(`✅ Passed: ${passedTests}`);
  console.log(`❌ Failed: ${failedTests}`);
  console.log(`📈 Success Rate: ${successRate}%`);
  console.log(`⏱️ Duration: ${duration}s`);
  
  // Show failed tests
  const failed = allTests.filter(test => !test.passed);
  if (failed.length > 0) {
    console.log('\n❌ FAILED TESTS:');
    failed.forEach((test, index) => {
      console.log(`${index + 1}. ${test.name} - ${test.error || `Status: ${test.status}`}`);
    });
  }
  
  // Show OAuth specific results
  const oauthPassed = oauthTests.filter(test => test.passed).length;
  console.log(`\n🔗 OAuth Tests: ${oauthPassed}/${oauthTests.length} passed`);
  
  // Show Jobs API specific results
  const jobsPassed = jobsTests.filter(test => test.passed).length;
  console.log(`💼 Jobs/Companies API Tests: ${jobsPassed}/${jobsTests.length} passed`);
  
  // Show Database specific results
  const dbPassed = dbTests.filter(test => test.passed).length;
  console.log(`🗄️ Database Tests: ${dbPassed}/${dbTests.length} passed`);
  
  console.log('\n✅ Complete testing finished!');
  
  return {
    totalTests,
    passedTests,
    failedTests,
    successRate: parseFloat(successRate),
    duration: parseFloat(duration),
    allTests
  };
}

// Run tests
runCompleteTests().catch(error => {
  console.error('❌ Test suite failed:', error.message);
  process.exit(1);
});
