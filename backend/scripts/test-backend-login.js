#!/usr/bin/env node

/**
 * Test Backend Login API
 * Tests the actual backend login endpoint to see validation errors
 */

import fetch from 'node-fetch';

const BACKEND_URL = 'https://finautojobs-backend.onrender.com/api';
const ADMIN_CREDENTIALS = {
  identifier: 'hiddenshadow032025@gmail.com',
  password: 'SuperAdmin@2025!',
  role: 'admin'
};

async function testBackendLogin() {
  try {
    console.log('🔍 Testing Backend Login API...');
    console.log('🌐 Backend URL:', BACKEND_URL);
    console.log('📤 Sending login request...');
    
    const response = await fetch(`${BACKEND_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://finautojobs-a-job-portal-pivn.onrender.com'
      },
      body: JSON.stringify(ADMIN_CREDENTIALS)
    });

    console.log('📊 Response Status:', response.status);
    console.log('📊 Response Headers:', Object.fromEntries(response.headers.entries()));

    const responseData = await response.json();
    console.log('📊 Response Data:', JSON.stringify(responseData, null, 2));

    if (response.status === 400 && responseData.errors) {
      console.log('\n❌ Validation Errors:');
      responseData.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. Field: ${error.path || error.param}`);
        console.log(`      Message: ${error.msg || error.message}`);
        console.log(`      Value: ${error.value}`);
      });
    }

    if (response.status === 200) {
      console.log('✅ Login successful!');
    } else {
      console.log('❌ Login failed with status:', response.status);
    }

  } catch (error) {
    console.error('❌ Error testing backend login:', error.message);
    
    if (error.code === 'ENOTFOUND') {
      console.log('🌐 Backend server might be down or unreachable');
    } else if (error.code === 'ECONNREFUSED') {
      console.log('🔌 Connection refused - backend not responding');
    }
  }
}

// Test CORS preflight
async function testCORS() {
  try {
    console.log('\n🔍 Testing CORS preflight...');
    
    const response = await fetch(`${BACKEND_URL}/auth/login`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'https://finautojobs-a-job-portal-pivn.onrender.com',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    });

    console.log('📊 CORS Status:', response.status);
    console.log('📊 CORS Headers:', Object.fromEntries(response.headers.entries()));

    if (response.headers.get('access-control-allow-origin')) {
      console.log('✅ CORS: Origin allowed');
    } else {
      console.log('❌ CORS: Origin not allowed');
    }

  } catch (error) {
    console.error('❌ CORS test failed:', error.message);
  }
}

// Run tests
console.log('🚀 Starting Backend API Tests...\n');

testBackendLogin()
  .then(() => testCORS())
  .then(() => {
    console.log('\n🎯 Backend API tests completed!');
  })
  .catch((error) => {
    console.error('\n💥 Backend API tests failed:', error.message);
  });
