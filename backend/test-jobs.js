import fetch from 'node-fetch';
import pkg from 'node-fetch';
const { Response } = pkg;

const API_BASE = 'http://localhost:5000/api';
let authToken = '';
let testJobId = '';

async function testJobOperations() {
    console.log('🧪 Testing Job Operations\n');

    // Login as an employer first
    try {
        const loginResponse = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'employer@test.com',
                password: 'TestPass123!'
            })
        });
        const loginData = await loginResponse.json();
        authToken = loginData.token;
        console.log('✅ Employer Login:', {
            success: !!loginData.token
        });
    } catch (error) {
        console.log('❌ Employer Login Failed:', error.message);
        return;
    }

    // Test 1: Create Job Post
    try {
        const jobData = {
            title: 'Senior Software Engineer',
            description: 'Looking for an experienced software engineer...',
            requirements: 'At least 5 years of experience in JavaScript...',
            location: 'Mumbai, India',
            salary_min: 1500000,
            salary_max: 2500000,
            job_type: 'Full Time',
            work_mode: 'Hybrid',
            skills_required: JSON.stringify(['JavaScript', 'React', 'Node.js']),
            category: 'Technology'
        };

        const response = await fetch(`${API_BASE}/jobs`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(jobData)
        });
        const data = await response.json();
        testJobId = data.job?.id;
        console.log('✅ Create Job Test:', {
            status: response.status,
            success: !!data.job,
            jobId: testJobId
        });
    } catch (error) {
        console.log('❌ Create Job Test Failed:', error.message);
    }

    // Test 2: Update Job Post
    if (testJobId) {
        try {
            const updateData = {
                title: 'Senior Software Engineer (Updated)',
                salary_max: 2800000
            };

            const response = await fetch(`${API_BASE}/jobs/${testJobId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify(updateData)
            });
            const data = await response.json();
            console.log('✅ Update Job Test:', {
                status: response.status,
                success: !!data.job,
                updatedTitle: data.job?.title
            });
        } catch (error) {
            console.log('❌ Update Job Test Failed:', error.message);
        }
    }

    // Test 3: Get Job Details
    if (testJobId) {
        try {
            const response = await fetch(`${API_BASE}/jobs/${testJobId}`);
            const data = await response.json();
            console.log('✅ Get Job Details Test:', {
                status: response.status,
                success: !!data.job,
                title: data.job?.title
            });
        } catch (error) {
            console.log('❌ Get Job Details Test Failed:', error.message);
        }
    }

    // Test 4: Search Jobs
    try {
        const response = await fetch(`${API_BASE}/jobs/search?q=software&location=Mumbai`);
        const data = await response.json();
        console.log('✅ Search Jobs Test:', {
            status: response.status,
            success: true,
            resultsCount: data.jobs?.length || 0
        });
    } catch (error) {
        console.log('❌ Search Jobs Test Failed:', error.message);
    }

    // Test 5: Delete Job Post
    if (testJobId) {
        try {
            const response = await fetch(`${API_BASE}/jobs/${testJobId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });
            const data = await response.json();
            console.log('✅ Delete Job Test:', {
                status: response.status,
                success: data.success
            });
        } catch (error) {
            console.log('❌ Delete Job Test Failed:', error.message);
        }
    }

    console.log('\n🎯 Job Operations Testing Complete!');
}

// Run the tests
testJobOperations().catch(console.error);
