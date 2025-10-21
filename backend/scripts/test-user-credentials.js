#!/usr/bin/env node

/**
 * Test User Credentials
 * Tests the exact credentials the user tried
 */

import fetch from 'node-fetch';

const BACKEND_URL = 'https://finautojobs-backend.onrender.com/api';

const TEST_CREDENTIALS = [
  {
    name: 'First attempt (superadmin@finautojobs.com)',
    credentials: {
      identifier: 'superadmin@finautojobs.com',
      password: 'SuperAdmin@2025!',
      role: 'admin'
    }
  },
  {
    name: 'Second attempt (hiddenshadow032025@gmail.com)',
    credentials: {
      identifier: 'hiddenshadow032025@gmail.com',
      password: 'SuperAdmin@2025!',
      role: 'admin'
    }
  }
];

async function testCredentials() {
  console.log('🧪 Testing User Credentials...\n');

  for (const test of TEST_CREDENTIALS) {
    console.log(`🔍 ${test.name}`);
    console.log(`   📧 Identifier: ${test.credentials.identifier}`);
    console.log(`   🔑 Role: ${test.credentials.role}`);

    try {
      const response = await fetch(`${BACKEND_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'https://finautojobs-a-job-portal-pivn.onrender.com'
        },
        body: JSON.stringify(test.credentials)
      });

      console.log(`   📊 Status: ${response.status}`);
      
      const responseData = await response.json();
      console.log(`   📄 Response:`, JSON.stringify(responseData, null, 2));

      if (response.status === 400 && responseData.errors) {
        console.log('   ❌ Validation Errors:');
        responseData.errors.forEach((error, index) => {
          console.log(`      ${index + 1}. Field: ${error.path || error.param}`);
          console.log(`         Message: ${error.msg || error.message}`);
          console.log(`         Value: ${error.value}`);
        });
      }

    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }

    console.log(''); // Empty line between tests
  }
}

testCredentials()
  .then(() => console.log('🎯 Credential testing completed!'))
  .catch(console.error);
