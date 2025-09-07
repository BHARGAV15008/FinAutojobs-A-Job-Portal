import fetch from 'node-fetch';
import pkg from 'node-fetch';
const { Response } = pkg;

const API_BASE = 'http://localhost:5000/api';
let authToken = '';
let testAlertId = '';

async function testNotificationsAndAlerts() {
    console.log('🧪 Testing Notifications and Alerts\n');

    // Login first
    try {
        const loginResponse = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'test@example.com',
                password: 'TestPass123!'
            })
        });
        const loginData = await loginResponse.json();
        authToken = loginData.token;
        console.log('✅ User Login:', {
            success: !!loginData.token
        });
    } catch (error) {
        console.log('❌ User Login Failed:', error.message);
        return;
    }

    // Test 1: Create Job Alert
    try {
        const alertData = {
            title: 'Software Engineer Jobs',
            keywords: 'software engineer,developer',
            location: 'Mumbai',
            salary_min: 1200000,
            salary_max: 2500000,
            job_type: 'Full Time',
            experience_min: 2,
            experience_max: 5,
            skills: JSON.stringify(['JavaScript', 'React', 'Node.js']),
            frequency: 'daily'
        };

        const response = await fetch(`${API_BASE}/job-alerts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify(alertData)
        });
        const data = await response.json();
        testAlertId = data.alert?.id;
        console.log('✅ Create Job Alert Test:', {
            status: response.status,
            success: !!data.alert,
            alertId: testAlertId
        });
    } catch (error) {
        console.log('❌ Create Job Alert Test Failed:', error.message);
    }

    // Test 2: Get All Notifications
    try {
        const response = await fetch(`${API_BASE}/notifications`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        const data = await response.json();
        console.log('✅ Get Notifications Test:', {
            status: response.status,
            success: true,
            notificationsCount: data.notifications?.length || 0
        });
    } catch (error) {
        console.log('❌ Get Notifications Test Failed:', error.message);
    }

    // Test 3: Mark Notification as Read
    try {
        const response = await fetch(`${API_BASE}/notifications/1/read`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        const data = await response.json();
        console.log('✅ Mark Notification Read Test:', {
            status: response.status,
            success: data.success
        });
    } catch (error) {
        console.log('❌ Mark Notification Read Test Failed:', error.message);
    }

    // Test 4: Update Job Alert
    if (testAlertId) {
        try {
            const updateData = {
                keywords: 'software engineer,developer,full stack',
                salary_max: 3000000
            };

            const response = await fetch(`${API_BASE}/job-alerts/${testAlertId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify(updateData)
            });
            const data = await response.json();
            console.log('✅ Update Job Alert Test:', {
                status: response.status,
                success: !!data.alert
            });
        } catch (error) {
            console.log('❌ Update Job Alert Test Failed:', error.message);
        }
    }

    // Test 5: Delete All Notifications
    try {
        const response = await fetch(`${API_BASE}/notifications`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });
        const data = await response.json();
        console.log('✅ Delete All Notifications Test:', {
            status: response.status,
            success: data.success
        });
    } catch (error) {
        console.log('❌ Delete All Notifications Test Failed:', error.message);
    }

    // Test 6: Delete Job Alert
    if (testAlertId) {
        try {
            const response = await fetch(`${API_BASE}/job-alerts/${testAlertId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });
            const data = await response.json();
            console.log('✅ Delete Job Alert Test:', {
                status: response.status,
                success: data.success
            });
        } catch (error) {
            console.log('❌ Delete Job Alert Test Failed:', error.message);
        }
    }

    console.log('\n🎯 Notifications and Alerts Testing Complete!');
}

// Run the tests
testNotificationsAndAlerts().catch(console.error);
