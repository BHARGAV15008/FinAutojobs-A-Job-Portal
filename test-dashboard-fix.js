


const API_BASE_URL = 'http://localhost:5000/api';

const RECRUITER_CREDS = {
    email: 'recruiter1test@gmail.com',
    password: 'TestPass123!',
    role: 'recruiter'
};

const APPLICANT_CREDS = {
    email: 'applicant1test@gmail.com',
    password: 'TestPass123!',
    role: 'applicant'
};

async function login(creds) {
    console.log(`Logging in as ${creds.role}...`);
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            identifier: creds.email,
            password: creds.password,
            role: creds.role
        })
    });
    const data = await response.json();
    if (!data.success) {
        console.error('Login failed:', data.message);
        return null;
    }
    return data.data.token;
}

async function testRecruiterDashboard(token) {
    console.log('Testing Recruiter Dashboard API...');
    const response = await fetch(`${API_BASE_URL}/dashboard/recruiter`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    
    if (data.stats && data.stats.jobs && typeof data.stats.jobs.active === 'number') {
        console.log('✅ stats.jobs.active present');
    } else {
        console.error('❌ stats.jobs.active MISSING', data);
    }

    if (Array.isArray(data.activeJobs)) {
         console.log('✅ activeJobs is array');
    } else {
         console.error('❌ activeJobs MISSING or not array', data);
    }

    if (Array.isArray(data.recentApplications)) {
         console.log('✅ recentApplications is array');
    } else {
         console.error('❌ recentApplications MISSING or not array', data);
    }
}

async function testApplicantDashboard(token) {
    console.log('Testing Applicant Dashboard API...');
    const response = await fetch(`${API_BASE_URL}/dashboard/applicant`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();

    if (data.stats && data.stats.applications && typeof data.stats.applications.total === 'number') {
        console.log('✅ stats.applications.total present');
    } else {
        console.error('❌ stats.applications.total MISSING', data);
    }

    if (Array.isArray(data.recentApplications)) {
         console.log('✅ recentApplications is array');
    } else {
         console.error('❌ recentApplications MISSING or not array', data);
    }
}

async function run() {
    try {
        const recruiterToken = await login(RECRUITER_CREDS);
        if (recruiterToken) {
            await testRecruiterDashboard(recruiterToken);
        } else {
            console.log('Skipping recruiter test due to login failure. (Run create-test-accounts.js if needed)');
        }

        const applicantToken = await login(APPLICANT_CREDS);
        if (applicantToken) {
            await testApplicantDashboard(applicantToken);
        } else {
            console.log('Skipping applicant test due to login failure.');
        }
    } catch (error) {
        console.error('Test failed:', error);
    }
}

run();
