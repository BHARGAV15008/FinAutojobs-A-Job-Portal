// Direct API test to check if backend is sending applicantSnapshot
import fetch from 'node-fetch';

const API_URL = 'http://localhost:5000/api';
const JOB_ID = '690605d784d1a8bd3d4c2843';

// Get token from your browser console: localStorage.getItem('token')
const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5MDYwNTJhODRkMWE4YmQzZDRjMjc1MSIsInVzZXJJZCI6IjY5MDYwNTJhODRkMWE4YmQzZDRjMjc1MyIsInJvbGUiOiJyZWNydWl0ZXIiLCJlbWFpbCI6InZpamF5bWFsdTY2MkBnbWFpbC5jb20iLCJpYXQiOjE3NjIwNjU5NzIsImV4cCI6MTc2MjE1MjM3Mn0.n8eQbhkakcYd2gsFhh8YGygvPIMKjCIVSsQsf1aHD7Y';

async function testAPI() {
  try {
    console.log('🔍 Testing API: GET /api/applications/job/' + JOB_ID);
    console.log('🔍 Adding cache buster:', Date.now());
    
    const response = await fetch(`${API_URL}/applications/job/${JOB_ID}?_t=${Date.now()}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });
    
    console.log('📊 Response status:', response.status);
    
    const data = await response.json();
    
    console.log('\n✅ Response received!');
    console.log('Success:', data.success);
    console.log('Total applications:', data.data?.applications?.length || 0);
    
    if (data.data?.applications?.[0]) {
      const app = data.data.applications[0];
      console.log('\n📋 First Application:');
      console.log('  ID:', app._id || app.id);
      console.log('  Has applicantSnapshot?', !!app.applicantSnapshot);
      
      if (app.applicantSnapshot) {
        console.log('\n✅ applicantSnapshot EXISTS!');
        console.log('  Total fields:', Object.keys(app.applicantSnapshot).length);
        console.log('  Education entries:', app.applicantSnapshot.education?.length || 0);
        console.log('  Work Experience entries:', app.applicantSnapshot.workExperience?.length || 0);
        console.log('  Has bio?', !!app.applicantSnapshot.bio);
        
        // Save to file
        const fs = await import('fs');
        fs.writeFileSync(
          'api-test-result.json',
          JSON.stringify(app.applicantSnapshot, null, 2),
          'utf8'
        );
        console.log('\n📝 Full snapshot saved to: api-test-result.json');
      } else {
        console.log('\n❌ applicantSnapshot is MISSING in API response!');
        console.log('Available fields:', Object.keys(app));
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testAPI();
