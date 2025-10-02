// Simple test script to debug job alerts API
const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';

// Test data
const testAlert = {
  title: 'React Developer Alert',
  keywords: ['React', 'JavaScript', 'Frontend'],
  location: 'Mumbai',
  salaryRange: {
    min: 800000,
    max: 1500000,
    period: 'yearly'
  },
  frequency: 'daily'
};

async function testJobAlertsAPI() {
  try {
    console.log('🔍 Testing Job Alerts API...');
    
    // First, let's test if we can reach the endpoint
    console.log('\n1. Testing GET /api/job-alerts (should return 401 without auth)');
    try {
      const response = await axios.get(`${API_BASE}/job-alerts`);
      console.log('✅ Response:', response.status, response.data);
    } catch (error) {
      console.log('❌ Expected 401 error:', error.response?.status, error.response?.data?.message);
    }

    // Test with a dummy token (should fail)
    console.log('\n2. Testing with invalid token');
    try {
      const response = await axios.get(`${API_BASE}/job-alerts`, {
        headers: {
          'Authorization': 'Bearer invalid-token'
        }
      });
      console.log('✅ Response:', response.status, response.data);
    } catch (error) {
      console.log('❌ Expected auth error:', error.response?.status, error.response?.data?.message);
    }

    // Test POST endpoint structure
    console.log('\n3. Testing POST structure (without auth)');
    try {
      const response = await axios.post(`${API_BASE}/job-alerts`, testAlert);
      console.log('✅ Response:', response.status, response.data);
    } catch (error) {
      console.log('❌ Expected auth error:', error.response?.status, error.response?.data?.message);
    }

    console.log('\n✅ Job Alerts API endpoint tests completed');
    console.log('📝 Next steps:');
    console.log('   1. Login as applicant to get valid JWT token');
    console.log('   2. Test with valid authentication');
    console.log('   3. Check browser console for detailed error messages');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testJobAlertsAPI();
