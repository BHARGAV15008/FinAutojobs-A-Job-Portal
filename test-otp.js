#!/usr/bin/env node

/**
 * Test OTP functionality
 * Run with: node test-otp.js
 */

import fetch from 'node-fetch';

const API_BASE = 'https://finautojobs-backend.onrender.com/api';
const TEST_EMAIL = 'technogenius1500@gmail.com';

console.log('🧪 Testing FinAutoJobs OTP System...\n');

// Test 1: Health Check
async function testHealthCheck() {
  try {
    console.log('1️⃣ Testing Health Check...');
    const response = await fetch(`${API_BASE}/health`);
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Health Check: PASSED');
      console.log(`   Status: ${data.status}`);
      console.log(`   Email Service: ${data.services?.email || 'unknown'}`);
      console.log(`   OTP Service: ${data.services?.otp || 'unknown'}`);
      return true;
    } else {
      console.log('❌ Health Check: FAILED');
      return false;
    }
  } catch (error) {
    console.log('❌ Health Check: ERROR -', error.message);
    return false;
  }
}

// Test 2: Send OTP
async function testSendOTP() {
  try {
    console.log('\n2️⃣ Testing Send OTP...');
    const response = await fetch(`${API_BASE}/otp/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: TEST_EMAIL,
        purpose: 'registration',
        userData: {
          firstName: 'Test',
          lastName: 'User'
        }
      })
    });
    
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Send OTP: PASSED');
      console.log(`   Email: ${data.data?.email}`);
      console.log(`   Purpose: ${data.data?.purpose}`);
      console.log(`   Expiry: ${data.data?.expiryMinutes} minutes`);
      console.log('📧 Check your email for the OTP code!');
      return true;
    } else {
      console.log('❌ Send OTP: FAILED');
      console.log(`   Error: ${data.message}`);
      return false;
    }
  } catch (error) {
    console.log('❌ Send OTP: ERROR -', error.message);
    return false;
  }
}

// Test 3: Verify OTP (interactive)
async function testVerifyOTP() {
  try {
    console.log('\n3️⃣ Testing Verify OTP...');
    console.log('Enter the OTP you received in your email:');
    
    // Simple prompt for OTP
    const readline = await import('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    return new Promise((resolve) => {
      rl.question('OTP Code: ', async (otp) => {
        rl.close();
        
        if (!otp || otp.length !== 6) {
          console.log('❌ Invalid OTP format. Should be 6 digits.');
          resolve(false);
          return;
        }
        
        try {
          const response = await fetch(`${API_BASE}/otp/verify`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: TEST_EMAIL,
              otp: otp,
              purpose: 'registration'
            })
          });
          
          const data = await response.json();
          
          if (response.ok) {
            console.log('✅ Verify OTP: PASSED');
            console.log(`   Message: ${data.message}`);
            console.log(`   Verified At: ${data.data?.verifiedAt}`);
            resolve(true);
          } else {
            console.log('❌ Verify OTP: FAILED');
            console.log(`   Error: ${data.message}`);
            console.log(`   Code: ${data.code}`);
            resolve(false);
          }
        } catch (error) {
          console.log('❌ Verify OTP: ERROR -', error.message);
          resolve(false);
        }
      });
    });
  } catch (error) {
    console.log('❌ Verify OTP: ERROR -', error.message);
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('🎯 Target API:', API_BASE);
  console.log('📧 Test Email:', TEST_EMAIL);
  console.log('=' .repeat(50));
  
  const healthPassed = await testHealthCheck();
  
  if (!healthPassed) {
    console.log('\n❌ Health check failed. Make sure your backend is running.');
    process.exit(1);
  }
  
  const otpSent = await testSendOTP();
  
  if (!otpSent) {
    console.log('\n❌ OTP sending failed. Check your email configuration.');
    process.exit(1);
  }
  
  console.log('\n⏳ Waiting 5 seconds for email delivery...');
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  const otpVerified = await testVerifyOTP();
  
  console.log('\n' + '=' .repeat(50));
  console.log('📊 Test Results:');
  console.log(`   Health Check: ${healthPassed ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   Send OTP: ${otpSent ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`   Verify OTP: ${otpVerified ? '✅ PASS' : '❌ FAIL'}`);
  
  if (healthPassed && otpSent && otpVerified) {
    console.log('\n🎉 All tests passed! Your OTP system is working perfectly!');
  } else {
    console.log('\n⚠️ Some tests failed. Check the errors above.');
  }
}

// Run the tests
runTests().catch(error => {
  console.error('💥 Test runner error:', error);
  process.exit(1);
});
