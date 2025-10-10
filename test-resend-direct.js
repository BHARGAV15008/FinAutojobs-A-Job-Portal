#!/usr/bin/env node

/**
 * Direct test of Resend email service
 * Tests the hardcoded Resend configuration
 */

import { Resend } from 'resend';

// Hardcoded Resend configuration (same as in emailService.js)
const RESEND_API_KEY = 're_2fxYbcm8_GDPHGcTP1cNXQFvJ5DBHx5iC';
const FROM_EMAIL = 'noreply@finautojobs.com';
const FROM_NAME = 'FinAutoJobs Team';
const TEST_EMAIL = 'technogenius1500@gmail.com';

console.log('🧪 Testing Resend Email Service Directly...\n');

async function testResendService() {
  try {
    console.log('📧 Initializing Resend...');
    const resend = new Resend(RESEND_API_KEY);
    
    console.log('📤 Sending test OTP email...');
    
    // Generate a test OTP
    const testOTP = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Create test email content
    const subject = `Your FinAutoJobs Test OTP: ${testOTP}`;
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Test OTP Email</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #2196F3; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background: #f9f9f9; }
          .otp-code { 
            font-size: 32px; 
            font-weight: bold; 
            color: #2196F3; 
            text-align: center; 
            padding: 20px; 
            background: white; 
            border-radius: 8px; 
            margin: 20px 0; 
            letter-spacing: 4px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🧪 Test Email from FinAutoJobs</h1>
          </div>
          <div class="content">
            <h2>Hello!</h2>
            <p>This is a test email to verify that the Resend email service is working correctly.</p>
            
            <div class="otp-code">${testOTP}</div>
            
            <p><strong>Test Details:</strong></p>
            <ul>
              <li>Email Service: Resend</li>
              <li>From: ${FROM_NAME} &lt;${FROM_EMAIL}&gt;</li>
              <li>API Key: ${RESEND_API_KEY.substring(0, 10)}...</li>
              <li>Test Time: ${new Date().toISOString()}</li>
            </ul>
            
            <p>If you received this email, the Resend configuration is working perfectly! ✅</p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    // Send the email
    const result = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: [TEST_EMAIL],
      subject: subject,
      html: html
    });
    
    console.log('✅ Email sent successfully!');
    console.log('📊 Result:', {
      id: result.data?.id,
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to: TEST_EMAIL,
      subject: subject
    });
    
    console.log('\n🎉 Resend email service is working correctly!');
    console.log('📧 Check your email at:', TEST_EMAIL);
    console.log('🔍 Look for the test OTP:', testOTP);
    
    return true;
    
  } catch (error) {
    console.log('❌ Email sending failed!');
    console.error('Error details:', error);
    
    if (error.message.includes('API key')) {
      console.log('🔑 Issue: Invalid API key');
    } else if (error.message.includes('domain')) {
      console.log('🌐 Issue: Domain not verified in Resend');
    } else if (error.message.includes('rate')) {
      console.log('⏱️ Issue: Rate limiting');
    }
    
    return false;
  }
}

// Run the test
console.log('🎯 Target Email:', TEST_EMAIL);
console.log('📤 From Email:', `${FROM_NAME} <${FROM_EMAIL}>`);
console.log('🔑 API Key:', RESEND_API_KEY.substring(0, 10) + '...');
console.log('=' .repeat(50));

testResendService().then(success => {
  if (success) {
    console.log('\n✅ Test completed successfully!');
    process.exit(0);
  } else {
    console.log('\n❌ Test failed!');
    process.exit(1);
  }
}).catch(error => {
  console.error('💥 Test runner error:', error);
  process.exit(1);
});
