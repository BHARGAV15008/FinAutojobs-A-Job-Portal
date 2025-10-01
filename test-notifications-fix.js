#!/usr/bin/env node

/**
 * Test Script: Verify Notifications Endpoint Fix
 * 
 * This script tests that the notifications endpoint now works correctly
 * after fixing the JWT secret and user lookup logic.
 */

import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

// Test user credentials
const testUser = {
  email: 'bhargavjani008@gmail.com',
  password: 'password123'
};

async function testNotificationsEndpoint() {
  console.log('🧪 Testing Notifications Endpoint Fix...\n');

  try {
    // Step 1: Login to get JWT token
    console.log('1️⃣ Logging in to get JWT token...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, testUser);
    
    if (!loginResponse.data.success) {
      throw new Error('Login failed');
    }
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful, token received');

    // Step 2: Test notifications endpoint
    console.log('\n2️⃣ Testing notifications endpoint...');
    const notificationsResponse = await axios.get(`${BASE_URL}/notifications`, {
      headers: {
        'Authorization': `Bearer ${token}`
      },
      params: {
        limit: 5
      }
    });

    if (notificationsResponse.data.success) {
      console.log('✅ Notifications endpoint working correctly!');
      console.log(`📊 Response data:`, {
        notifications: notificationsResponse.data.data.notifications.length,
        unreadCount: notificationsResponse.data.data.unreadCount,
        total: notificationsResponse.data.data.total
      });
    } else {
      console.log('❌ Notifications endpoint returned unsuccessful response');
    }

  } catch (error) {
    if (error.response) {
      console.log('❌ Notifications endpoint error:', {
        status: error.response.status,
        message: error.response.data?.message || 'Unknown error',
        data: error.response.data
      });
    } else {
      console.log('❌ Network or other error:', error.message);
    }
  }
}

// Run the test
testNotificationsEndpoint()
  .then(() => {
    console.log('\n🎉 Notifications endpoint test completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Test failed:', error);
    process.exit(1);
  });
