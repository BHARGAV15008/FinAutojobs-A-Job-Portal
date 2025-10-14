#!/usr/bin/env node

/**
 * Simple Frontend Accessibility Test
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3001';

async function testFrontendPages() {
  console.log('🌐 Testing Frontend Page Accessibility...\n');
  
  const pages = [
    '/',
    '/login',
    '/register',
    '/admin-login',
    '/jobs',
    '/companies',
    '/about',
    '/contact'
  ];

  let passedTests = 0;
  let totalTests = pages.length;

  for (const page of pages) {
    try {
      const response = await fetch(BASE_URL + page);
      const html = await response.text();
      
      if (response.ok && html.includes('<!doctype html')) {
        console.log('✅', page, '- Status:', response.status, '- HTML page loaded');
        passedTests++;
      } else {
        console.log('❌', page, '- Status:', response.status, '- Invalid response');
      }
    } catch (error) {
      console.log('❌', page, '- Error:', error.message);
    }
  }

  console.log(`\n📊 Frontend Test Results:`);
  console.log(`✅ Passed: ${passedTests}/${totalTests}`);
  console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests}`);
  console.log(`📈 Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

  return passedTests === totalTests;
}

// Test authentication forms by checking if they contain expected elements
async function testAuthenticationForms() {
  console.log('\n🔐 Testing Authentication Form Elements...\n');
  
  const authPages = [
    { url: '/login', expectedElements: ['email', 'password', 'login'] },
    { url: '/register', expectedElements: ['email', 'password', 'firstName', 'lastName'] },
    { url: '/admin-login', expectedElements: ['email', 'password', 'admin'] }
  ];

  let passedTests = 0;
  let totalTests = authPages.length;

  for (const page of authPages) {
    try {
      const response = await fetch(BASE_URL + page.url);
      const html = await response.text();
      
      if (response.ok) {
        let elementsFound = 0;
        for (const element of page.expectedElements) {
          if (html.toLowerCase().includes(element.toLowerCase())) {
            elementsFound++;
          }
        }
        
        if (elementsFound >= page.expectedElements.length - 1) { // Allow 1 missing element
          console.log('✅', page.url, `- Found ${elementsFound}/${page.expectedElements.length} expected elements`);
          passedTests++;
        } else {
          console.log('❌', page.url, `- Only found ${elementsFound}/${page.expectedElements.length} expected elements`);
        }
      } else {
        console.log('❌', page.url, '- Page not accessible');
      }
    } catch (error) {
      console.log('❌', page.url, '- Error:', error.message);
    }
  }

  console.log(`\n📊 Authentication Form Test Results:`);
  console.log(`✅ Passed: ${passedTests}/${totalTests}`);
  console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests}`);
  console.log(`📈 Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);

  return passedTests === totalTests;
}

async function runAllTests() {
  console.log('🚀 FinAutoJobs Frontend Simple Test Suite\n');
  console.log('=' .repeat(50));
  
  const frontendPassed = await testFrontendPages();
  const authFormsPassed = await testAuthenticationForms();
  
  console.log('\n' + '=' .repeat(50));
  console.log('📋 Overall Results:');
  console.log('Frontend Pages:', frontendPassed ? '✅ PASSED' : '❌ FAILED');
  console.log('Auth Forms:', authFormsPassed ? '✅ PASSED' : '❌ FAILED');
  console.log('✅ Simple frontend tests completed!');
  
  return frontendPassed && authFormsPassed;
}

// Run tests
runAllTests().catch(error => {
  console.error('❌ Test suite failed:', error.message);
  process.exit(1);
});
