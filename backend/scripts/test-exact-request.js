#!/usr/bin/env node

/**
 * Test Exact Request
 * Tests the exact request format that should work
 */

import fetch from 'node-fetch';

const BACKEND_URL = 'https://finautojobs-backend.onrender.com/api';

async function testExactRequest() {
  console.log('🧪 Testing Exact Admin Login Request...\n');

  // Test the exact format the frontend should send
  const adminCredentials = {
    identifier: 'analyticsadmin@finautojobs.com',
    password: 'SuperAdmin@2025!',
    role: 'admin'
  };

  console.log('📤 Sending request with credentials:');
  console.log('   identifier:', adminCredentials.identifier);
  console.log('   password: [HIDDEN]');
  console.log('   role:', adminCredentials.role);

  try {
    const response = await fetch(`${BACKEND_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'https://finautojobs-a-job-portal-pivn.onrender.com',
        'User-Agent': 'Mozilla/5.0 (compatible; AdminTest/1.0)'
      },
      body: JSON.stringify(adminCredentials)
    });

    console.log('\n📊 Response Details:');
    console.log('   Status:', response.status);
    console.log('   Status Text:', response.statusText);
    
    const responseData = await response.json();
    console.log('   Response Body:', JSON.stringify(responseData, null, 2));

    if (response.status === 400 && responseData.errors) {
      console.log('\n❌ Validation Errors:');
      responseData.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. Field: ${error.path || error.param || error.field}`);
        console.log(`      Message: ${error.msg || error.message}`);
        console.log(`      Value: ${error.value}`);
        console.log(`      Location: ${error.location || 'unknown'}`);
      });
    }

    // Test with different role values
    console.log('\n🔄 Testing with different role values...');
    
    const roleTests = ['admin', 'applicant', 'recruiter'];
    
    for (const testRole of roleTests) {
      console.log(`\n🧪 Testing role: "${testRole}"`);
      
      const testCredentials = {
        ...adminCredentials,
        role: testRole
      };

      try {
        const testResponse = await fetch(`${BACKEND_URL}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Origin': 'https://finautojobs-a-job-portal-pivn.onrender.com'
          },
          body: JSON.stringify(testCredentials)
        });

        const testData = await testResponse.json();
        console.log(`   Status: ${testResponse.status}`);
        console.log(`   Message: ${testData.message}`);

      } catch (error) {
        console.log(`   Error: ${error.message}`);
      }
    }

  } catch (error) {
    console.error('❌ Request failed:', error.message);
  }
}

testExactRequest()
  .then(() => console.log('\n🎯 Exact request test completed!'))
  .catch(console.error);
