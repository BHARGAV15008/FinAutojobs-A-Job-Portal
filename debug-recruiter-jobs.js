


const API_BASE_URL = 'http://localhost:5000/api';

const RECRUITER_CREDS = {
    email: 'recruiter1test@gmail.com',
    password: 'TestPass123!',
    role: 'recruiter'
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

async function getJobs(token) {
    console.log('Fetching recruiter jobs...');
    // Simulate the query used in EnhancedJobsTab
    // queryParams = { postedBy: currentUser._id, limit: 100 }
    
    // First get profile to get user ID
    const profileRes = await fetch(`${API_BASE_URL}/auth/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const profile = await profileRes.json();
    const userId = profile.data._id;
    console.log('User ID:', userId);

    const response = await fetch(`${API_BASE_URL}/jobs?postedBy=${userId}&limit=100`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    
    if (data.success) {
        const jobs = data.data.jobs;
        console.log(`Fetched ${jobs.length} jobs.`);
        if (jobs.length > 0) {
            const job = jobs[0];
            console.log('Sample Job Structure:', JSON.stringify(job, null, 2));
            
            // Check specific fields needed for editing
            console.log('--- Verification ---');
            console.log('experience:', job.experience);
            console.log('salaryRange:', job.salaryRange);
            console.log('salary:', job.salary);
            console.log('requiredSkills:', job.requiredSkills);
            console.log('skills:', job.skills);
            console.log('description:', job.description);
            console.log('jobDescription:', job.jobDescription);
        } else {
            console.log('No jobs found. Creating one for testing...');
            await createTestJob(token);
        }
    } else {
        console.error('Failed to fetch jobs:', data.message);
    }
}

async function createTestJob(token) {
    const jobData = {
        jobTitle: "Senior React Developer",
        companyName: "Tech Corp",
        location: "Remote",
        industry: "Finance & Banking",
        jobCategory: "Finance",
        jobType: "Full Time",
        workArrangement: "Remote",
        applicationDeadline: new Date(Date.now() + 86400000 * 30).toISOString(),
        experience: { minimum: 3, maximum: 5 },
        requiredSkills: ["React", "Node.js", "MongoDB"],
        salaryRange: {
            type: "Range",
            min: 500000,
            max: 1000000,
            period: "Yearly",
            currency: "INR"
        },
        jobDescription: "This is a test job description for debugging purposes.",
        keyResponsibilities: ["Develop UI", "Fix bugs"],
        requirements: ["BS CS", "3+ years exp"],
        contactEmail: "hr@techcorp.com",
        jobUrgency: "Normal Priority",
        status: "active",
        vacancy: 1
    };

    const response = await fetch(`${API_BASE_URL}/jobs`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(jobData)
    });
    
    const data = await response.json();
    console.log('Create Job Response:', data);
    if (data.success) {
        console.log('Test job created. Re-fetching jobs...');
        await getJobs(token);
    }
}

async function run() {
    try {
        const token = await login(RECRUITER_CREDS);
        if (token) {
            await getJobs(token);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

run();
