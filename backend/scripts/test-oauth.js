#!/usr/bin/env node

/**
 * OAuth Integration Test Script
 * 
 * This script tests the OAuth implementation without requiring actual provider credentials.
 * It verifies that all OAuth routes are properly configured and accessible.
 */

import fetch from 'node-fetch';
import chalk from 'chalk';

const BASE_URL = process.env.BASE_URL || 'https://finautojobs-a-job-portal-hk5c.onrender.com';

console.log(chalk.blue.bold('\n🔐 OAuth Integration Test Suite\n'));

const tests = [
  {
    name: 'OAuth Status Endpoint',
    url: `${BASE_URL}/api/oauth/status`,
    method: 'GET',
    expectedStatus: 200,
    description: 'Check if OAuth service is running'
  },
  {
    name: 'Google OAuth Initiation',
    url: `${BASE_URL}/api/oauth/google?role=applicant`,
    method: 'GET',
    expectedStatus: 302,
    description: 'Test Google OAuth redirect (should redirect to Google)'
  },
  {
    name: 'Microsoft OAuth Initiation',
    url: `${BASE_URL}/api/oauth/microsoft?role=recruiter`,
    method: 'GET',
    expectedStatus: 302,
    description: 'Test Microsoft OAuth redirect (should redirect to Microsoft)'
  },
  {
    name: 'Apple OAuth Initiation',
    url: `${BASE_URL}/api/oauth/apple?role=applicant`,
    method: 'GET',
    expectedStatus: 302,
    description: 'Test Apple OAuth redirect (should redirect to frontend)'
  }
];

async function runTest(test) {
  try {
    console.log(chalk.yellow(`\n🧪 Testing: ${test.name}`));
    console.log(chalk.gray(`   ${test.description}`));
    console.log(chalk.gray(`   ${test.method} ${test.url}`));

    const response = await fetch(test.url, {
      method: test.method,
      redirect: 'manual' // Don't follow redirects automatically
    });

    const success = response.status === test.expectedStatus;
    
    if (success) {
      console.log(chalk.green(`   ✅ PASS - Status: ${response.status}`));
      
      // Additional checks for specific endpoints
      if (test.url.includes('/status')) {
        try {
          const data = await response.json();
          console.log(chalk.gray(`   📊 Providers configured:`));
          Object.entries(data.providers || {}).forEach(([provider, config]) => {
            const status = config.enabled ? '✅ Enabled' : '❌ Disabled';
            console.log(chalk.gray(`      ${provider}: ${status}`));
          });
        } catch (e) {
          console.log(chalk.yellow(`   ⚠️  Could not parse response JSON`));
        }
      }
      
      if (response.status === 302) {
        const location = response.headers.get('location');
        if (location) {
          console.log(chalk.gray(`   🔗 Redirects to: ${location.substring(0, 50)}...`));
        }
      }
    } else {
      console.log(chalk.red(`   ❌ FAIL - Expected: ${test.expectedStatus}, Got: ${response.status}`));
      
      try {
        const errorText = await response.text();
        console.log(chalk.red(`   📝 Response: ${errorText.substring(0, 100)}...`));
      } catch (e) {
        console.log(chalk.red(`   📝 Could not read response body`));
      }
    }

    return success;
  } catch (error) {
    console.log(chalk.red(`   ❌ ERROR - ${error.message}`));
    return false;
  }
}

async function runAllTests() {
  console.log(chalk.blue(`🎯 Testing OAuth endpoints at: ${BASE_URL}`));
  
  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    const success = await runTest(test);
    if (success) {
      passed++;
    } else {
      failed++;
    }
  }

  console.log(chalk.blue.bold('\n📊 Test Results:'));
  console.log(chalk.green(`   ✅ Passed: ${passed}`));
  console.log(chalk.red(`   ❌ Failed: ${failed}`));
  console.log(chalk.blue(`   📈 Total:  ${passed + failed}`));

  if (failed === 0) {
    console.log(chalk.green.bold('\n🎉 All OAuth tests passed!'));
    console.log(chalk.green('✅ OAuth implementation is working correctly'));
    console.log(chalk.yellow('📝 Next steps:'));
    console.log(chalk.yellow('   1. Configure OAuth provider credentials'));
    console.log(chalk.yellow('   2. Test with real OAuth providers'));
    console.log(chalk.yellow('   3. Deploy to production'));
  } else {
    console.log(chalk.red.bold('\n❌ Some tests failed'));
    console.log(chalk.red('🔧 Please check your OAuth implementation'));
    console.log(chalk.yellow('💡 Troubleshooting tips:'));
    console.log(chalk.yellow('   1. Ensure the backend server is running'));
    console.log(chalk.yellow('   2. Check OAuth routes are properly mounted'));
    console.log(chalk.yellow('   3. Verify environment variables are set'));
  }

  return failed === 0;
}

// Additional utility functions for OAuth testing
async function testOAuthStatus() {
  console.log(chalk.blue.bold('\n🔍 Detailed OAuth Status Check\n'));
  
  try {
    const response = await fetch(`${BASE_URL}/api/oauth/status`);
    const data = await response.json();
    
    console.log(chalk.green('📊 OAuth Service Status:'));
    console.log(chalk.gray(`   Service: ${data.success ? '✅ Running' : '❌ Down'}`));
    console.log(chalk.gray(`   Message: ${data.message}`));
    
    if (data.providers) {
      console.log(chalk.green('\n🔌 Provider Configuration:'));
      Object.entries(data.providers).forEach(([provider, config]) => {
        const status = config.enabled ? '✅ Configured' : '⚠️  Not configured';
        console.log(chalk.gray(`   ${provider.padEnd(10)}: ${status}`));
        console.log(chalk.gray(`   Auth URL: ${config.authUrl}`));
      });
    }
    
    return true;
  } catch (error) {
    console.log(chalk.red(`❌ Failed to check OAuth status: ${error.message}`));
    return false;
  }
}

// Run tests based on command line arguments
const args = process.argv.slice(2);

if (args.includes('--status')) {
  testOAuthStatus();
} else if (args.includes('--help')) {
  console.log(chalk.blue.bold('OAuth Test Script Usage:'));
  console.log(chalk.yellow('  node test-oauth.js          # Run all tests'));
  console.log(chalk.yellow('  node test-oauth.js --status # Check OAuth status only'));
  console.log(chalk.yellow('  node test-oauth.js --help   # Show this help'));
  console.log(chalk.gray('\nEnvironment Variables:'));
  console.log(chalk.gray('  BASE_URL - Backend server URL (default: https://finautojobs-a-job-portal-hk5c.onrender.com)'));
} else {
  runAllTests().then(success => {
    process.exit(success ? 0 : 1);
  });
}
