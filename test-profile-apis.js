#!/usr/bin/env node

/**
 * Profile Management API Testing Script
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://192.168.41.134:5000/api';

async function testProfileAPIs() {
  console.log('👤 Testing Profile Management APIs...\n');
  
  try {
    // Create a test user and get token
    const testEmail = 'profile-test' + Date.now() + '@example.com';
    console.log('Creating test user:', testEmail);
    
    const registerResponse = await fetch(BASE_URL + '/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: testEmail,
        password: 'TestPassword123!',
        firstName: 'Profile',
        lastName: 'Test',
        role: 'applicant',
        phone: '9876543210'
      })
    });
    
    if (!registerResponse.ok) {
      console.log('❌ Registration failed');
      return;
    }
    
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
    if (!loginResponse.ok) {
      console.log('❌ Login failed:', loginData.message);
      return;
    }
    
    const token = loginData.data.token;
    console.log('✅ Test user created and logged in\n');
    
    // Test profile endpoints
    const profileEndpoints = [
      { method: 'GET', path: '/auth/profile', name: 'Get Profile' },
      { method: 'GET', path: '/users/me', name: 'Get User Info' },
      { method: 'GET', path: '/dashboard', name: 'Get Dashboard Data' },
      { method: 'GET', path: '/applications', name: 'Get Applications' },
      { method: 'GET', path: '/notifications', name: 'Get Notifications' }
    ];
    
    for (const endpoint of profileEndpoints) {
      try {
        const response = await fetch(BASE_URL + endpoint.path, {
          method: endpoint.method,
          headers: {
            'Authorization': 'Bearer ' + token,
            'Content-Type': 'application/json'
          }
        });
        
        console.log('✅', endpoint.name, '- Status:', response.status);
        
        if (response.ok) {
          const data = await response.json();
          console.log('   Success:', data.success);
          
          if (endpoint.path === '/auth/profile' && data.data) {
            console.log('   User role:', data.data.role);
            console.log('   User email:', data.data.email);
          }
          
          if (endpoint.path === '/applications' && data.data) {
            console.log('   Applications count:', data.data.length || 0);
          }
          
          if (endpoint.path === '/notifications' && data.data) {
            console.log('   Notifications count:', data.data.length || 0);
          }
        } else {
          const errorData = await response.json();
          console.log('   Error:', errorData.message);
        }
      } catch (error) {
        console.log('❌', endpoint.name, '- Error:', error.message);
      }
    }
    
    console.log('\n✅ Profile API testing completed!');
    
  } catch (error) {
    console.log('❌ Profile API test error:', error.message);
  }
}

// Run the test
testProfileAPIs().catch(error => {
  console.error('❌ Test failed:', error.message);
  process.exit(1);
});
