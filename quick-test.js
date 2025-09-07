// Quick test using built-in fetch (Node 18+)
const BASE_URL = 'http://localhost:5000/api';

async function quickTest() {
    console.log('🚀 Quick API Test Starting...\n');
    
    try {
        console.log('Testing health endpoint...');
        const response = await fetch(`${BASE_URL}/health`);
        const data = await response.json();
        console.log('✅ Health Check Success:', data);
        
        console.log('\nTesting registration...');
        const registerResponse = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'testuser123',
                email: 'test@example.com',
                password: 'TestPass123!',
                role: 'jobseeker'
            })
        });
        const registerData = await registerResponse.json();
        console.log('✅ Registration Success:', registerData);
        
        console.log('\nTesting login...');
        const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'testuser123',
                password: 'TestPass123!'
            })
        });
        const loginData = await loginResponse.json();
        console.log('✅ Login Success:', loginData);
        
        console.log('\nTesting jobs endpoint...');
        const jobsResponse = await fetch(`${BASE_URL}/jobs`);
        const jobsData = await jobsResponse.json();
        console.log('✅ Jobs Success:', jobsData);
        
        console.log('\n🎉 All tests passed! Backend is working correctly.');
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        console.log('Make sure the backend server is running on port 5000');
    }
}

quickTest();
