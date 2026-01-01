#!/usr/bin/env node

/**
 * Test Validation Details
 * Tests the exact validation error details
 */

import fetch from 'node-fetch';

const BACKEND_URL = 'https://finautojobs-backend.onrender.com/api';

async function testValidationDetails() {
  console.log('🧪 Testing Validation Details...\n');

  // Test different request formats to see which one causes validation errors
  const testCases = [
    {
      name: 'Complete Request (Analytics Admin)',
      data: {
        identifier: 'analyticsadmin@finautojobs.com',
        password: 'SuperAdmin@2025!',
        role: 'admin'
      }
    },
    {
      name: 'Missing Role',
      data: {
        identifier: 'analyticsadmin@finautojobs.com',
        password: 'SuperAdmin@2025!'
      }
    },
    {
      name: 'Empty Identifier',
      data: {
        identifier: '',
        password: 'SuperAdmin@2025!',
        role: 'admin'
      }
    },
    {
      name: 'Empty Password',
      data: {
        identifier: 'analyticsadmin@finautojobs.com',
        password: '',
        role: 'admin'
      }
    },
    {
      name: 'Invalid Role',
      data: {
        identifier: 'analyticsadmin@finautojobs.com',
        password: 'SuperAdmin@2025!',
        role: 'invalid'
      }
    },
    {
      name: 'Super Admin',
      data: {
        identifier: 'superadmin@finautojobs.com',
        password: 'SuperAdmin@2025!',
        role: 'admin'
      }
    },
    {
      name: 'Main Admin',
      data: {
        identifier: 'mainadmin@finautojobs.com',
        password: 'SuperAdmin@2025!',
        role: 'admin'
      }
    }
  ];

  for (const testCase of testCases) {
    console.log(`🔍 Testing: ${testCase.name}`);
    console.log(`   Data:`, JSON.stringify(testCase.data, null, 2));

    try {
      const response = await fetch(`${BACKEND_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'https://finautojobs-a-job-portal-pivn.onrender.com',
          'User-Agent': 'Mozilla/5.0 (compatible; ValidationTest/1.0)'
        },
        body: JSON.stringify(testCase.data)
      });

      const responseData = await response.json();
      
      console.log(`   Status: ${response.status}`);
      console.log(`   Message: ${responseData.message}`);

      if (response.status === 400 && responseData.errors) {
        console.log('   ❌ Validation Errors:');
        responseData.errors.forEach((error, index) => {
          console.log(`      ${index + 1}. Field: ${error.path || error.param || error.field || 'unknown'}`);
          console.log(`         Message: ${error.msg || error.message}`);
          console.log(`         Value: ${error.value !== undefined ? error.value : 'undefined'}`);
          console.log(`         Location: ${error.location || 'unknown'}`);
        });
      }

    } catch (error) {
      console.log(`   ❌ Request Error: ${error.message}`);
    }

    console.log(''); // Empty line between tests
  }

  // Test with exact browser request format
  console.log('🌐 Testing with Browser-like Request...');
  
  try {
    const browserRequest = {
      identifier: 'analyticsadmin@finautojobs.com',
      password: 'SuperAdmin@2025!',
      role: 'admin'
    };

    const response = await fetch(`${BACKEND_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9',
        'Origin': 'https://finautojobs-a-job-portal-pivn.onrender.com',
        'Referer': 'https://finautojobs-a-job-portal-pivn.onrender.com/',
        'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      },
      body: JSON.stringify(browserRequest)
    });

    const responseData = await response.json();
    
    console.log(`   Browser-like Status: ${response.status}`);
    console.log(`   Browser-like Response:`, JSON.stringify(responseData, null, 2));

  } catch (error) {
    console.log(`   ❌ Browser-like Request Error: ${error.message}`);
  }
}

testValidationDetails()
  .then(() => console.log('\n🎯 Validation details test completed!'))
  .catch(console.error);
