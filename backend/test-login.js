#!/usr/bin/env node

/**
 * Test Login Flow
 * This script tests the complete login flow to identify logout issues
 */

import axios from 'axios';

const API_BASE = 'https://finautojobs-a-job-portal-hk5c.onrender.com/api';

console.log('🔍 ===== TESTING LOGIN FLOW =====');

// Test credentials - you can change these to your actual test account
const testCredentials = {
  identifier: 'test@example.com', // Change this to your test email
  password: 'password123',        // Change this to your test password
  role: 'applicant'              // Change this to your test role
};

async function testLoginFlow() {
  try {
    console.log('\n🔍 Step 1: Testing login...');
    const loginResponse = await axios.post(`${API_BASE}/auth/login`, testCredentials);
    
    if (loginResponse.data.success) {
      const { token, user } = loginResponse.data.data;
      console.log('✅ Login successful!');
      console.log('🔍 User:', user.email, '- Role:', user.role);
      console.log('🔍 Token (first 50 chars):', token.substring(0, 50) + '...');
      
      // Test token validation
      console.log('\n🔍 Step 2: Testing token validation...');
      const validateResponse = await axios.get(`${API_BASE}/auth/validate-token`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (validateResponse.data.success) {
        console.log('✅ Token validation successful!');
        console.log('🔍 Token data:', validateResponse.data.data);
        
        // Test profile endpoint
        console.log('\n🔍 Step 3: Testing profile endpoint...');
        const profileResponse = await axios.get(`${API_BASE}/auth/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (profileResponse.data.success) {
          console.log('✅ Profile fetch successful!');
          console.log('🔍 Profile data keys:', Object.keys(profileResponse.data.data));
        } else {
          console.log('❌ Profile fetch failed:', profileResponse.data.message);
        }
        
      } else {
        console.log('❌ Token validation failed:', validateResponse.data.message);
      }
      
    } else {
      console.log('❌ Login failed:', loginResponse.data.message);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('💡 This might be why you\'re getting logged out - 401 Unauthorized');
    }
    
    if (error.response?.status === 404) {
      console.log('💡 User not found - check if the test credentials exist in database');
    }
  }
}

console.log('🔍 Testing with credentials:');
console.log('   Email:', testCredentials.identifier);
console.log('   Role:', testCredentials.role);
console.log('   (Make sure this user exists in your database)');

await testLoginFlow();

console.log('\n🔍 ===== TEST COMPLETE =====');
console.log('💡 If login works but you still get logged out:');
console.log('   1. Check browser console for errors');
console.log('   2. Check if frontend is clearing localStorage');
console.log('   3. Check if token is being sent correctly in requests');
console.log('   4. Check if CORS is causing issues');
