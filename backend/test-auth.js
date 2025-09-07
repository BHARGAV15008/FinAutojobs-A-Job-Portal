import fetch from 'node-fetch';
import pkg from 'node-fetch';
const { Response } = pkg;

const API_BASE = 'http://localhost:5000/api';
let authToken = '';
let refreshToken = '';

async function testAuthSystem() {
    console.log('🧪 Testing Authentication System\n');

    // Test 1: Registration with invalid data
    try {
        const response = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'test',
                email: 'invalid-email',
                password: 'short'
            })
        });
        const data = await response.json();
        console.log('✅ Invalid Registration Test:', {
            status: response.status,
            message: data.message,
            field: data.field
        });
    } catch (error) {
        console.log('❌ Invalid Registration Test Failed:', error.message);
    }

    // Test 2: Registration with valid data
    try {
        const response = await fetch(`${API_BASE}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'testuser123',
                email: 'test123@example.com',
                password: 'SecurePass123!',
                full_name: 'Test User',
                phone: '+1234567890',
                role: 'jobseeker'
            })
        });
        const data = await response.json();
        console.log('✅ Valid Registration Test:', {
            status: response.status,
            success: true,
            userId: data.user?.id
        });
    } catch (error) {
        console.log('❌ Valid Registration Test Failed:', error.message);
    }

    // Test 3: Login with invalid credentials
    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'wrong@example.com',
                password: 'WrongPass123!'
            })
        });
        const data = await response.json();
        console.log('✅ Invalid Login Test:', {
            status: response.status,
            message: data.message
        });
    } catch (error) {
        console.log('❌ Invalid Login Test Failed:', error.message);
    }

    // Test 4: Login with valid credentials
    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'test123@example.com',
                password: 'SecurePass123!'
            })
        });
        const data = await response.json();
        if (data.token && data.refreshToken) {
            authToken = data.token;
            refreshToken = data.refreshToken;
        }
        console.log('✅ Valid Login Test:', {
            status: response.status,
            success: !!data.token,
            hasRefreshToken: !!data.refreshToken
        });
    } catch (error) {
        console.log('❌ Valid Login Test Failed:', error.message);
    }

    // Test 5: Get profile with valid token
    if (authToken) {
        try {
            const response = await fetch(`${API_BASE}/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });
            const data = await response.json();
            console.log('✅ Get Profile Test:', {
                status: response.status,
                success: !!data.user,
                email: data.user?.email
            });
        } catch (error) {
            console.log('❌ Get Profile Test Failed:', error.message);
        }
    }

    // Test 6: Refresh token
    if (refreshToken) {
        try {
            const response = await fetch(`${API_BASE}/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refreshToken })
            });
            const data = await response.json();
            console.log('✅ Refresh Token Test:', {
                status: response.status,
                success: !!data.token
            });
        } catch (error) {
            console.log('❌ Refresh Token Test Failed:', error.message);
        }
    }

    // Test 7: Logout
    if (authToken) {
        try {
            const response = await fetch(`${API_BASE}/auth/logout`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ refreshToken })
            });
            const data = await response.json();
            console.log('✅ Logout Test:', {
                status: response.status,
                message: data.message
            });
        } catch (error) {
            console.log('❌ Logout Test Failed:', error.message);
        }
    }

    console.log('\n🎯 Authentication Testing Complete!');
}

// Run the tests
testAuthSystem().catch(console.error);
