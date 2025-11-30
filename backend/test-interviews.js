// Quick test to verify interview routes are working
import fetch from 'node-fetch';

const BASE_URL = 'http://192.168.41.134:5000/api';

async function testInterviewRoutes() {
  console.log('🧪 Testing Interview Routes...');
  
  try {
    // Test GET /api/interviews (should require auth)
    const response = await fetch(`${BASE_URL}/interviews`);
    console.log('📊 GET /api/interviews status:', response.status);
    
    if (response.status === 401) {
      console.log('✅ Interview routes are working (401 Unauthorized as expected without token)');
    } else if (response.status === 404) {
      console.log('❌ Interview routes not found - routes not registered properly');
    } else {
      console.log('🔍 Unexpected response:', response.status, await response.text());
    }
  } catch (error) {
    console.error('❌ Error testing interview routes:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('🔌 Server is not running on port 5000');
    }
  }
}

testInterviewRoutes();
