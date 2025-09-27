// Test script for profile update functionality
const API_BASE_URL = 'http://localhost:5000/api';

// Test data
const testProfileData = {
  firstName: 'John',
  lastName: 'Doe',
  companyInfo: {
    companyName: 'Tech Corp',
    department: 'HR',
    designation: 'Senior Recruiter'
  },
  specialization: ['Technical Recruiting', 'Executive Search'],
  industryExpertise: ['IT', 'Software'],
  yearsOfExperience: 5,
  professionalLinks: {
    linkedin: 'https://linkedin.com/in/johndoe',
    companyWebsite: 'https://techcorp.com'
  },
  officeLocation: {
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India'
  }
};

async function testProfileUpdate() {
  try {
    console.log('🔍 Testing profile update...');
    
    // First, try to login (you'll need to replace with actual credentials)
    const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'test@example.com', // Replace with actual test email
        password: 'password123',   // Replace with actual test password
        role: 'recruiter'
      })
    });
    
    if (!loginResponse.ok) {
      console.log('❌ Login failed. Please create a test recruiter account first.');
      console.log('Response:', await loginResponse.text());
      return;
    }
    
    const loginData = await loginResponse.json();
    const token = loginData.data.token;
    
    console.log('✅ Login successful');
    
    // Test profile update
    const updateResponse = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testProfileData)
    });
    
    if (!updateResponse.ok) {
      console.log('❌ Profile update failed');
      console.log('Response:', await updateResponse.text());
      return;
    }
    
    const updateData = await updateResponse.json();
    console.log('✅ Profile update successful');
    console.log('Updated user:', JSON.stringify(updateData.data.user, null, 2));
    
    // Test profile fetch
    const fetchResponse = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!fetchResponse.ok) {
      console.log('❌ Profile fetch failed');
      console.log('Response:', await fetchResponse.text());
      return;
    }
    
    const fetchData = await fetchResponse.json();
    console.log('✅ Profile fetch successful');
    console.log('Fetched user:', JSON.stringify(fetchData.data.user, null, 2));
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Run the test
testProfileUpdate();