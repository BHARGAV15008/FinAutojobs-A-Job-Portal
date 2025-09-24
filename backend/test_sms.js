import fetch from 'node-fetch';

const API_URL = 'http://localhost:3001/api/auth/send-otp-sms';

async function testSmsOtp() {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phone: '+1 (123) 456-7890' }),
    });

    const data = await response.json();
    console.log('Response:', data);
  } catch (error) {
    console.error('Error:', error);
  }
}

testSmsOtp();
