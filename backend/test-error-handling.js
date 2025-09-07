// Test script for enhanced error handling
import fetch from 'node-fetch';

const API_BASE = 'http://localhost:5000/api';

async function testErrorHandling() {
    console.log('🧪 Testing Enhanced Error Handling\n');

    // Test 1: Health check (should succeed)
    try {
        const response = await fetch(`${API_BASE}/health`);
        const data = await response.json();
        console.log('✅ Health Check:', data.status);
    } catch (error) {
        console.log('❌ Health Check Failed:', error.message);
    }

    // Test 2: General error (should return structured error)
    try {
        const response = await fetch(`${API_BASE}/test/general-error`);
        const data = await response.json();
        console.log('✅ General Error Test:', {
            status: response.status,
            success: data.success,
            error: data.error,
            timestamp: data.timestamp
        });
    } catch (error) {
        console.log('❌ General Error Test Failed:', error.message);
    }

    // Test 3: Not found error (should return 404)
    try {
        const response = await fetch(`${API_BASE}/test/not-found`);
        const data = await response.json();
        console.log('✅ Not Found Error Test:', {
            status: response.status,
            success: data.success,
            error: data.error,
            timestamp: data.timestamp
        });
    } catch (error) {
        console.log('❌ Not Found Error Test Failed:', error.message);
    }

    // Test 4: Validation error with invalid data
    try {
        const response = await fetch(`${API_BASE}/test/validation`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                firstName: 'John',
                lastName: 'Doe',
                email: 'invalid-email', // This should trigger validation error
                mobile: '123',
                location: 'New York'
            })
        });
        const data = await response.json();
        console.log('✅ Validation Error Test:', {
            status: response.status,
            success: data.success,
            error: data.error,
            details: data.details,
            timestamp: data.timestamp
        });
    } catch (error) {
        console.log('❌ Validation Error Test Failed:', error.message);
    }

    // Test 5: Validation error with valid data (should succeed)
    try {
        const response = await fetch(`${API_BASE}/test/validation`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                firstName: 'John',
                lastName: 'Doe',
                email: 'john.doe@example.com',
                mobile: '+1234567890',
                location: 'New York'
            })
        });
        const data = await response.json();
        console.log('✅ Valid Data Test:', {
            status: response.status,
            success: data.success,
            message: data.message,
            timestamp: data.timestamp
        });
    } catch (error) {
        console.log('❌ Valid Data Test Failed:', error.message);
    }

    // Test 6: Job validation error
    try {
        const response = await fetch(`${API_BASE}/test/job-validation`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                title: '', // Empty title should trigger validation error
                description: 'short', // Too short description
                requirements: 'requirements',
                location: 'Location'
            })
        });
        const data = await response.json();
        console.log('✅ Job Validation Error Test:', {
            status: response.status,
            success: data.success,
            error: data.error,
            details: data.details,
            timestamp: data.timestamp
        });
    } catch (error) {
        console.log('❌ Job Validation Error Test Failed:', error.message);
    }

    console.log('\n🎯 Error Handling Testing Complete!');
}

// Run the tests
testErrorHandling().catch(console.error);
