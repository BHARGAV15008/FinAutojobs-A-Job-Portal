import fetch from 'node-fetch';

const API_BASE = 'http://localhost:5000/api';

// Sample data
const sampleUsers = [
  // Applicants
  {
    email: 'john.doe@email.com',
    password: 'Password123!',
    role: 'applicant',
    firstName: 'John',
    lastName: 'Doe',
    phone: '+1234567890',
    bio: 'Experienced software developer with 5 years in full-stack development',
    skills: ['JavaScript', 'React', 'Node.js', 'Python', 'MongoDB'],
    experience: 5,
    location: 'New York, NY'
  },
  {
    email: 'sarah.wilson@email.com',
    password: 'Password123!',
    role: 'applicant',
    firstName: 'Sarah',
    lastName: 'Wilson',
    phone: '+1234567891',
    bio: 'UI/UX Designer passionate about creating intuitive user experiences',
    skills: ['Figma', 'Adobe XD', 'Sketch', 'Prototyping', 'User Research'],
    experience: 3,
    location: 'San Francisco, CA'
  },
  {
    email: 'mike.johnson@email.com',
    password: 'Password123!',
    role: 'applicant',
    firstName: 'Mike',
    lastName: 'Johnson',
    phone: '+1234567892',
    bio: 'Data scientist with expertise in machine learning and analytics',
    skills: ['Python', 'R', 'TensorFlow', 'SQL', 'Tableau'],
    experience: 4,
    location: 'Austin, TX'
  },
  {
    email: 'emily.brown@email.com',
    password: 'Password123!',
    role: 'applicant',
    firstName: 'Emily',
    lastName: 'Brown',
    phone: '+1234567893',
    bio: 'DevOps engineer focused on cloud infrastructure and automation',
    skills: ['AWS', 'Docker', 'Kubernetes', 'Jenkins', 'Terraform'],
    experience: 6,
    location: 'Seattle, WA'
  },
  {
    email: 'alex.smith@email.com',
    password: 'Password123!',
    role: 'applicant',
    firstName: 'Alex',
    lastName: 'Smith',
    phone: '+1234567897',
    bio: 'Frontend developer specializing in React and modern web technologies',
    skills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS', 'GraphQL'],
    experience: 3,
    location: 'Chicago, IL'
  },
  // Recruiters
  {
    email: 'alex.recruiter@techcorp.com',
    password: 'Password123!',
    role: 'recruiter',
    firstName: 'Alex',
    lastName: 'Thompson',
    phone: '+1234567894',
    bio: 'Senior Technical Recruiter at TechCorp with 8 years of experience',
    company: 'TechCorp Solutions',
    department: 'Human Resources'
  },
  {
    email: 'lisa.hr@innovate.com',
    password: 'Password123!',
    role: 'recruiter',
    firstName: 'Lisa',
    lastName: 'Garcia',
    phone: '+1234567895',
    bio: 'HR Manager specializing in startup talent acquisition',
    company: 'Innovate Labs',
    department: 'Talent Acquisition'
  },
  {
    email: 'david.recruiter@dataflow.com',
    password: 'Password123!',
    role: 'recruiter',
    firstName: 'David',
    lastName: 'Chen',
    phone: '+1234567898',
    bio: 'Technical recruiter focused on data science and analytics roles',
    company: 'DataFlow Analytics',
    department: 'Talent Acquisition'
  },
  // Admin
  {
    email: 'admin@finautojobs.com',
    password: 'Password123!',
    role: 'admin',
    firstName: 'System',
    lastName: 'Administrator',
    phone: '+1234567896',
    bio: 'Platform administrator managing FinAutoJobs system',
    department: 'System Administration'
  }
];

const sampleJobs = [
  {
    title: 'Senior Full Stack Developer',
    company: 'TechCorp Solutions',
    location: 'Boston, MA',
    type: 'full-time',
    description: 'We are looking for a Senior Full Stack Developer to join our growing team. You will be responsible for developing and maintaining web applications using modern technologies.',
    requirements: 'Experience with JavaScript, React, Node.js, MongoDB, AWS',
    salary: '$90,000 - $130,000',
    skills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'AWS']
  },
  {
    title: 'UI/UX Designer',
    company: 'Innovate Labs',
    location: 'Los Angeles, CA',
    type: 'full-time',
    description: 'Join our design team to create beautiful and intuitive user experiences for our products. You will work closely with product managers and developers.',
    requirements: 'Experience with Figma, Adobe XD, Sketch, User Research',
    salary: '$70,000 - $95,000',
    skills: ['Figma', 'Adobe XD', 'Sketch', 'Prototyping', 'User Research']
  },
  {
    title: 'Data Scientist',
    company: 'DataFlow Analytics',
    location: 'Austin, TX',
    type: 'full-time',
    description: 'We are seeking a Data Scientist to analyze complex datasets and build predictive models to drive business insights.',
    requirements: 'PhD or Master in Data Science, Python, R, Machine Learning',
    salary: '$100,000 - $140,000',
    skills: ['Python', 'R', 'TensorFlow', 'SQL', 'Machine Learning']
  },
  {
    title: 'DevOps Engineer',
    company: 'TechCorp Solutions',
    location: 'Boston, MA',
    type: 'full-time',
    description: 'Looking for a DevOps Engineer to manage our cloud infrastructure and implement CI/CD pipelines.',
    requirements: 'Experience with AWS, Docker, Kubernetes, Jenkins, Terraform',
    salary: '$95,000 - $125,000',
    skills: ['AWS', 'Docker', 'Kubernetes', 'Jenkins', 'Terraform']
  },
  {
    title: 'Frontend Developer',
    company: 'Innovate Labs',
    location: 'Los Angeles, CA',
    type: 'contract',
    description: 'Contract position for an experienced Frontend Developer to work on exciting new projects.',
    requirements: 'Experience with React, JavaScript, Redux, CSS, Testing',
    salary: '$60,000 - $80,000',
    skills: ['React', 'JavaScript', 'Redux', 'CSS', 'Testing']
  }
];

// Helper function to make API requests
const apiRequest = async (endpoint, method = 'GET', data = null, token = null) => {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (token) {
    options.headers.Authorization = `Bearer ${token}`;
  }

  if (data) {
    options.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, options);
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || `HTTP ${response.status}`);
    }
    
    return result;
  } catch (error) {
    console.error(`API Error (${method} ${endpoint}):`, error.message);
    throw error;
  }
};

// Populate database function
const populateDatabase = async () => {
  try {
    console.log('🚀 Starting database population...\n');

    // Create users and collect tokens
    console.log('👥 Creating users...');
    const userTokens = [];
    
    for (const userData of sampleUsers) {
      try {
        // Try to register user (skip if already exists)
        try {
          const registerResult = await apiRequest('/auth/register', 'POST', userData);
          console.log(`✅ Registered ${userData.role}: ${userData.firstName} ${userData.lastName}`);
        } catch (regError) {
          if (regError.message.includes('already exists')) {
            console.log(`ℹ️  User ${userData.email} already exists, skipping registration`);
          } else {
            console.log(`⚠️  Registration failed for ${userData.email}: ${regError.message}`);
            continue; // Skip login if registration failed with other error
          }
        }
        
        // Login to get token
        const loginResult = await apiRequest('/auth/login', 'POST', {
          email: userData.email,
          password: 'Password123!'
        });
        
        userTokens.push({
          ...userData,
          token: loginResult.data.token,
          userId: loginResult.data.user.id
        });
        
        console.log(`🔑 Logged in: ${userData.firstName} ${userData.lastName}`);
      } catch (error) {
        console.log(`⚠️  Login failed for ${userData.email}: ${error.message}`);
      }
    }

    console.log(`\n📊 Created ${userTokens.length} users successfully\n`);

    // Create jobs using available tokens (try with any user for now)
    console.log('💼 Creating jobs...');
    const availableTokens = userTokens.filter(u => u.token);
    
    if (availableTokens.length === 0) {
      console.log('⚠️  No user tokens available, skipping job creation');
      return;
    }

    console.log(`📋 Using ${availableTokens.length} available user tokens to create jobs...`);

    let jobCount = 0;
    for (const jobData of sampleJobs) {
      try {
        // Use a random available token
        const userToken = availableTokens[jobCount % availableTokens.length];
        
        const jobResult = await apiRequest('/jobs', 'POST', jobData, userToken.token);
        console.log(`✅ Created job: ${jobData.title} at ${jobData.company}`);
        jobCount++;
      } catch (error) {
        console.log(`⚠️  Error creating job ${jobData.title}: ${error.message}`);
      }
    }

    console.log('\n🎉 Database populated successfully!');
    console.log(`📊 Summary:`);
    console.log(`   👥 Users: ${userTokens.length}`);
    console.log(`   💼 Jobs: ${jobCount}`);
    console.log('\n🌐 You can now test the application with these sample accounts:');
    
    userTokens.forEach(user => {
      console.log(`   ${user.role.toUpperCase()}: ${user.email} / Password123`);
    });
    
  } catch (error) {
    console.error('❌ Error populating database:', error);
  }
};

// Check if server is running
const checkServer = async () => {
  try {
    const response = await fetch('http://localhost:5000/health');
    if (response.ok) {
      console.log('✅ Server is running, proceeding with population...\n');
      return true;
    }
  } catch (error) {
    console.error('❌ Server is not running. Please start the backend server first.');
    console.error('   Run: npm start (in the backend directory)');
    return false;
  }
};

// Main function
const main = async () => {
  const serverRunning = await checkServer();
  if (serverRunning) {
    await populateDatabase();
  }
};

main();
