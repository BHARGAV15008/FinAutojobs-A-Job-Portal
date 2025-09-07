const BASE_URL = 'http://localhost:5000/api';

// Test API endpoints
async function testAPI() {
    console.log('🚀 Starting FinAutoJobs API Testing...\n');

    // Test 1: Health Check
    try {
        console.log('1. Testing Health Check...');
        const response = await fetch(`${BASE_URL}/health`);
        const data = await response.json();
        console.log('✅ Health Check:', data);
    } catch (error) {
        console.log('❌ Health Check Failed:', error.message);
    }

    // Test 2: User Registration
    try {
        console.log('\n2. Testing User Registration...');
        const registerData = {
            username: 'testuser123',
            email: 'test@example.com',
            password: 'TestPass123!',
            full_name: 'Test User',
            role: 'jobseeker'
        };
        
        const response = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(registerData)
        });
        
        const data = await response.json();
        console.log('✅ Registration Response:', data);
    } catch (error) {
        console.log('❌ Registration Failed:', error.message);
    }

    // Test 3: User Login
    try {
        console.log('\n3. Testing User Login...');
        const loginData = {
            username: 'testuser123',
            password: 'TestPass123!'
        };
        
        const response = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(loginData)
        });
        
        const data = await response.json();
        console.log('✅ Login Response:', data);
        
        if (data.token) {
            global.authToken = data.token;
        }
    } catch (error) {
        console.log('❌ Login Failed:', error.message);
    }

    // Test 4: Get Jobs
    try {
        console.log('\n4. Testing Get Jobs...');
        const response = await fetch(`${BASE_URL}/jobs`);
        const data = await response.json();
        console.log('✅ Jobs Response:', data);
    } catch (error) {
        console.log('❌ Get Jobs Failed:', error.message);
    }

    // Test 5: Get Companies
    try {
        console.log('\n5. Testing Get Companies...');
        const response = await fetch(`${BASE_URL}/companies`);
        const data = await response.json();
        console.log('✅ Companies Response:', data);
    } catch (error) {
        console.log('❌ Get Companies Failed:', error.message);
    }

    // Test 6: OAuth Config
    try {
        console.log('\n6. Testing OAuth Config...');
        const response = await fetch(`${BASE_URL}/oauth/config`);
        const data = await response.json();
        console.log('✅ OAuth Config:', data);
    } catch (error) {
        console.log('❌ OAuth Config Failed:', error.message);
    }

    // Test 7: Protected Route (Dashboard)
    if (global.authToken) {
        try {
            console.log('\n7. Testing Protected Dashboard Route...');
            const response = await fetch(`${BASE_URL}/dashboard/stats`, {
                headers: { 'Authorization': `Bearer ${global.authToken}` }
            });
            const data = await response.json();
            console.log('✅ Dashboard Stats:', data);
        } catch (error) {
            console.log('❌ Dashboard Stats Failed:', error.message);
        }
    }

    console.log('\n🏁 API Testing Complete!');
}

// Run tests
testAPI().catch(console.error);
