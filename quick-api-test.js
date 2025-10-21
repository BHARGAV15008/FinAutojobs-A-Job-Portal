#!/usr/bin/env node

/**
 * Quick API Testing Script
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000/api';

async function testBasicEndpoints() {
  console.log('🧪 Testing Basic API Endpoints...\n');
  
  const endpoints = [
    '/health',
    '/oauth/status', 
    '/oauth/config',
    '/jobs',
    '/companies'
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(BASE_URL + endpoint);
      const data = await response.json();
      console.log('✅', endpoint, '- Status:', response.status);
      
      if (endpoint === '/oauth/status') {
        console.log('   OAuth providers:', Object.keys(data.providers || {}));
      }
    } catch (error) {
      console.log('❌', endpoint, '- Error:', error.message);
    }
  }
}

async function testAuthentication() {
  console.log('\n🔐 Testing Authentication...\n');
  
  try {
    const testEmail = 'test' + Date.now() + '@example.com';
    console.log('Testing with email:', testEmail);
    
    // Test registration
    const registerResponse = await fetch(BASE_URL + '/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'TestPassword123!',
        firstName: 'Test',
        lastName: 'User',
        role: 'applicant',
        phone: '9876543210'
      })
    });
    
    const registerData = await registerResponse.json();
    console.log('Registration Status:', registerResponse.status);
    
    if (registerResponse.ok) {
      console.log('✅ Registration successful!');
      console.log('   User ID:', registerData.data?.user?.id);
      
      // Test login
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
      console.log('Login Status:', loginResponse.status);
      
      if (loginResponse.ok) {
        console.log('✅ Login successful!');
        console.log('   Token received:', !!loginData.data?.token);
        
        // Test profile fetch
        const profileResponse = await fetch(BASE_URL + '/auth/profile', {
          headers: {
            'Authorization': 'Bearer ' + loginData.data.token
          }
        });
        
        const profileData = await profileResponse.json();
        console.log('Profile fetch Status:', profileResponse.status);
        
        if (profileResponse.ok) {
          console.log('✅ Profile fetch successful!');
          console.log('   User role:', profileData.data?.role);
        } else {
          console.log('❌ Profile fetch failed:', profileData.message);
        }
        
      } else {
        console.log('❌ Login failed:', loginData.message);
      }
    } else {
      console.log('❌ Registration failed:', registerData.message);
      if (registerData.errors) {
        console.log('   Validation errors:', registerData.errors);
      }
    }
    
  } catch (error) {
    console.log('❌ Authentication test error:', error.message);
  }
}

async function testOAuthEndpoints() {
  console.log('\n🔗 Testing OAuth Endpoints...\n');
  
  try {
    // Test OAuth debug endpoint
    const debugResponse = await fetch(BASE_URL + '/oauth/debug');
    const debugData = await debugResponse.json();
    console.log('OAuth Debug Status:', debugResponse.status);
    
    if (debugResponse.ok) {
      console.log('✅ OAuth debug successful!');
      console.log('   Google Client ID configured:', !!debugData.debug?.googleClientId);
    }
    
    // Test test OAuth endpoints (development only)
    const testOAuthResponse = await fetch(BASE_URL + '/test-oauth/simulate/google?role=applicant');
    console.log('Test OAuth Status:', testOAuthResponse.status);
    
    if (testOAuthResponse.ok) {
      console.log('✅ Test OAuth endpoint working!');
    }
    
  } catch (error) {
    console.log('❌ OAuth test error:', error.message);
  }
}

async function runAllTests() {
  console.log('🚀 FinAutoJobs API Quick Test Suite\n');
  console.log('=' .repeat(50));
  
  await testBasicEndpoints();
  await testAuthentication();
  await testOAuthEndpoints();
  
  console.log('\n' + '=' .repeat(50));
  console.log('✅ Quick API tests completed!');
}

// Run tests
runAllTests().catch(error => {
  console.error('❌ Test suite failed:', error.message);
  process.exit(1);
});
