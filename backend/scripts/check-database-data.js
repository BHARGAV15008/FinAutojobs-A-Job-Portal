import fetch from 'node-fetch';

const API_BASE = 'https://finautojobs-a-job-portal-hk5c.onrender.com/api';

// Check what data exists in the database
const checkDatabaseData = async () => {
  try {
    console.log('🔍 Checking database data...\n');

    // Test login with one of our demo users
    console.log('1. Testing login...');
    const loginResponse = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'john.doe@email.com',
        password: 'Password123!'
      })
    });

    if (!loginResponse.ok) {
      console.log('❌ Login failed');
      return;
    }

    const loginData = await loginResponse.json();
    const token = loginData.data.token;
    const user = loginData.data.user;
    
    console.log(`✅ Login successful for: ${user.firstName} ${user.lastName}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   Email: ${user.email}\n`);

    // Check jobs
    console.log('2. Checking jobs...');
    const jobsResponse = await fetch(`${API_BASE}/jobs`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (jobsResponse.ok) {
      const jobsData = await jobsResponse.json();
      console.log('Jobs response:', JSON.stringify(jobsData, null, 2));
      const jobs = Array.isArray(jobsData.data) ? jobsData.data : [];
      console.log(`✅ Found ${jobs.length} jobs in database`);
      if (jobs.length > 0) {
        jobs.forEach((job, index) => {
          console.log(`   ${index + 1}. ${job.title || 'Unknown'} at ${job.company || 'Unknown'}`);
        });
      }
    } else {
      console.log('❌ Failed to fetch jobs');
    }

    // Check applications
    console.log('\n3. Checking applications...');
    const appsResponse = await fetch(`${API_BASE}/applications`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (appsResponse.ok) {
      const appsData = await appsResponse.json();
      const applications = appsData.data || [];
      console.log(`✅ Found ${applications.length} applications in database`);
      applications.forEach((app, index) => {
        console.log(`   ${index + 1}. ${app.jobTitle || 'Unknown Job'} - Status: ${app.status}`);
      });
    } else {
      console.log('❌ Failed to fetch applications');
    }

    // Check companies
    console.log('\n4. Checking companies...');
    const companiesResponse = await fetch(`${API_BASE}/companies`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    if (companiesResponse.ok) {
      const companiesData = await companiesResponse.json();
      const companies = companiesData.data || [];
      console.log(`✅ Found ${companies.length} companies in database`);
      companies.forEach((company, index) => {
        console.log(`   ${index + 1}. ${company.name} - ${company.industry || 'Unknown Industry'}`);
      });
    } else {
      console.log('❌ Failed to fetch companies');
    }

    // Check user profile data
    console.log('\n5. Checking user profile...');
    console.log(`   Profile Completion: ${user.profileCompletion?.percentage || 0}%`);
    console.log(`   Skills: ${user.skills?.technical?.length || 0} technical skills`);
    console.log(`   Experience: ${user.totalExperience?.years || 0} years`);
    console.log(`   Applications: ${user.applicationStats?.totalApplications || 0}`);

    console.log('\n📊 Database Data Summary:');
    console.log(`   👥 Users: At least 1 (logged in user)`);
    console.log(`   💼 Jobs: ${jobsResponse.ok ? (await jobsResponse.json()).data?.length || 0 : 0}`);
    console.log(`   📝 Applications: ${appsResponse.ok ? (await appsResponse.json()).data?.length || 0 : 0}`);
    console.log(`   🏢 Companies: ${companiesResponse.ok ? (await companiesResponse.json()).data?.length || 0 : 0}`);

  } catch (error) {
    console.error('❌ Error checking database:', error.message);
  }
};

// Check if server is running
const checkServer = async () => {
  try {
    const response = await fetch('https://finautojobs-a-job-portal-hk5c.onrender.com/health');
    if (response.ok) {
      console.log('✅ Backend server is running\n');
      return true;
    }
  } catch (error) {
    console.error('❌ Backend server is not running. Please start it first.');
    return false;
  }
};

// Main function
const main = async () => {
  const serverRunning = await checkServer();
  if (serverRunning) {
    await checkDatabaseData();
  }
};

main();
