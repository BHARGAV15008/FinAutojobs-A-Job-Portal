import fetch from 'node-fetch';
import pkg from 'node-fetch';
const { Response } = pkg;

const API_BASE = 'http://localhost:5000/api';
let authToken = '';
let testApplicationId = '';

async function testApplicationsAndProfile() {
    console.log('🧪 Testing Applications and Profile Operations\n');

    // Login as a jobseeker first
    try {
        const loginResponse = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'jobseeker@test.com',
                password: 'TestPass123!'
            })
        });
        const loginData = await loginResponse.json();
        authToken = loginData.token;
        console.log('✅ Jobseeker Login:', {
            success: !!loginData.token
        });
    } catch (error) {
        console.log('❌ Jobseeker Login Failed:', error.message);
        return;
    }

    // Test 1: Update Profile
    try {
        const profileData = {
            full_name: 'Updated Test User',
            phone: '+1234567890',
            location: 'Mumbai, India',
            skills: JSON.stringify(['JavaScript', 'React', 'Node.js']),
            bio: 'Experienced software developer...',
            linkedin_url: 'https://linkedin.com/in/testuser'
        };

        const response = await fetch(`${API_BASE}/users/profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(profileData)
        });
        const data = await response.json();
        console.log('✅ Update Profile Test:', {
            status: response.status,
            success: !!data.user,
            updatedName: data.user?.full_name
        });
    } catch (error) {
        console.log('❌ Update Profile Test Failed:', error.message);
    }

    // Test 2: Apply for Job
    try {
        const applicationData = {
            job_id: 1, // Using an existing job ID
            cover_letter: 'I am very interested in this position...',
            resume_url: 'https://example.com/resume.pdf'
        };

        const response = await fetch(`${API_BASE}/applications`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(applicationData)
        });
        const data = await response.json();
        testApplicationId = data.application?.id;
        console.log('✅ Job Application Test:', {
            status: response.status,
            success: !!data.application,
            applicationId: testApplicationId
        });
    } catch (error) {
        console.log('❌ Job Application Test Failed:', error.message);
    }

    // Test 3: Get Application Status
    if (testApplicationId) {
        try {
            const response = await fetch(`${API_BASE}/applications/${testApplicationId}`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });
            const data = await response.json();
            console.log('✅ Get Application Status Test:', {
                status: response.status,
                success: !!data.application,
                applicationStatus: data.application?.status
            });
        } catch (error) {
            console.log('❌ Get Application Status Test Failed:', error.message);
        }
    }

    // Test 4: Get All Applications
    try {
        const response = await fetch(`${API_BASE}/applications`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        const data = await response.json();
        console.log('✅ Get All Applications Test:', {
            status: response.status,
            success: true,
            applicationsCount: data.applications?.length || 0
        });
    } catch (error) {
        console.log('❌ Get All Applications Test Failed:', error.message);
    }

    // Test 5: Withdraw Application
    if (testApplicationId) {
        try {
            const response = await fetch(`${API_BASE}/applications/${testApplicationId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });
            const data = await response.json();
            console.log('✅ Withdraw Application Test:', {
                status: response.status,
                success: data.success
            });
        } catch (error) {
            console.log('❌ Withdraw Application Test Failed:', error.message);
        }
    }

    console.log('\n🎯 Applications and Profile Testing Complete!');
}

// Run the tests
testApplicationsAndProfile().catch(console.error);
