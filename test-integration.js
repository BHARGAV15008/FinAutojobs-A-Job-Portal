#!/usr/bin/env node

/**
 * Integration Test for FinAutoJobs Authentication System
 * Tests the login and register functionality between frontend and backend
 */

import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:5000/api';
const FRONTEND_URL = 'http://localhost:3001';

// Test data
const testUser = {
  firstName: 'Integration',
  lastName: 'Test',
  email: `integration.test.${Date.now()}@example.com`,
  password: 'SecurePass123!',
  role: 'applicant'
};

async function testHealthCheck() {
  console.log('🔍 Testing backend health check...');
  try {
    const response = await fetch('http://localhost:5000/health');
    const data = await response.json();
    if (data.success) {
      console.log('✅ Backend health check passed');
      return true;
    } else {
      console.log('❌ Backend health check failed');
      return false;
    }
  } catch (error) {
    console.log('❌ Backend health check failed:', error.message);
    return false;
  }
}

async function testFrontendAccess() {
  console.log('🔍 Testing frontend accessibility...');
  try {
    const response = await fetch(FRONTEND_URL);
    if (response.ok) {
      console.log('✅ Frontend is accessible');
      return true;
    } else {
      console.log('❌ Frontend is not accessible');
      return false;
    }
  } catch (error) {
    console.log('❌ Frontend access failed:', error.message);
    return false;
  }
}

async function testUserRegistration() {
  console.log('🔍 Testing user registration...');
  try {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testUser)
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ User registration successful');
      console.log(`   User ID: ${data.data.user._id}`);
      console.log(`   Email: ${data.data.user.email}`);
      console.log(`   Role: ${data.data.user.role}`);
      return { success: true, token: data.data.token, user: data.data.user };
    } else {
      console.log('❌ User registration failed:', data.message);
      return { success: false, error: data.message };
    }
  } catch (error) {
    console.log('❌ User registration failed:', error.message);
    return { success: false, error: error.message };
  }
}

async function testUserLogin() {
  console.log('🔍 Testing user login...');
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testUser.email,
        password: testUser.password
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ User login successful');
      console.log(`   User ID: ${data.data.user._id}`);
      console.log(`   Email: ${data.data.user.email}`);
      console.log(`   Role: ${data.data.user.role}`);
      return { success: true, token: data.data.token, user: data.data.user };
    } else {
      console.log('❌ User login failed:', data.message);
      return { success: false, error: data.message };
    }
  } catch (error) {
    console.log('❌ User login failed:', error.message);
    return { success: false, error: error.message };
  }
}

async function testAuthenticatedRequest(token) {
  console.log('🔍 Testing authenticated request...');
  try {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      }
    });
    
    const data = await response.json();
    
    if (data.success) {
      console.log('✅ Authenticated request successful');
      console.log(`   Profile loaded for: ${data.data.email}`);
      return true;
    } else {
      console.log('❌ Authenticated request failed:', data.message);
      return false;
    }
  } catch (error) {
    console.log('❌ Authenticated request failed:', error.message);
    return false;
  }
}

async function runIntegrationTests() {
  console.log('🚀 Starting FinAutoJobs Integration Tests\n');
  
  const results = {
    healthCheck: false,
    frontendAccess: false,
    registration: false,
    login: false,
    authenticatedRequest: false
  };
  
  // Test 1: Backend Health Check
  results.healthCheck = await testHealthCheck();
  console.log('');
  
  // Test 2: Frontend Access
  results.frontendAccess = await testFrontendAccess();
  console.log('');
  
  // Test 3: User Registration
  const registrationResult = await testUserRegistration();
  results.registration = registrationResult.success;
  console.log('');
  
  // Test 4: User Login
  const loginResult = await testUserLogin();
  results.login = loginResult.success;
  console.log('');
  
  // Test 5: Authenticated Request
  if (loginResult.success && loginResult.token) {
    results.authenticatedRequest = await testAuthenticatedRequest(loginResult.token);
  } else {
    console.log('⏭️  Skipping authenticated request test (login failed)');
  }
  console.log('');
  
  // Summary
  console.log('📊 Integration Test Results:');
  console.log('================================');
  console.log(`Backend Health Check: ${results.healthCheck ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Frontend Access: ${results.frontendAccess ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`User Registration: ${results.registration ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`User Login: ${results.login ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Authenticated Request: ${results.authenticatedRequest ? '✅ PASS' : '❌ FAIL'}`);
  
  const passedTests = Object.values(results).filter(Boolean).length;
  const totalTests = Object.keys(results).length;
  
  console.log(`\n🎯 Overall Result: ${passedTests}/${totalTests} tests passed`);
  
  if (passedTests === totalTests) {
    console.log('🎉 All integration tests passed! The authentication system is working correctly.');
  } else {
    console.log('⚠️  Some tests failed. Please check the backend and frontend configuration.');
  }
  
  return results;
}

// Run the tests
runIntegrationTests().catch(console.error);
