import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

import JobSchema from '../models/schemas/jobs/JobSchema.js';
import CompanySchema from '../models/schemas/companies/CompanySchema.js';
import JobApplicationSchema from '../models/schemas/jobs/JobApplicationSchema.js';

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/finautojobs');
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

// Sample data
const sampleUsers = [
  // Applicants
  {
    email: 'john.doe@email.com',
    password: 'Password123',
    role: 'applicant',
    profile: {
      name: 'John Doe',
      phone: '+1234567890',
      location: 'New York, NY',
      bio: 'Experienced software developer with 5 years in full-stack development',
      skills: ['JavaScript', 'React', 'Node.js', 'Python', 'MongoDB'],
      experience: 5,
      qualification: 'Bachelor in Computer Science',
      linkedin: 'https://linkedin.com/in/johndoe',
      github: 'https://github.com/johndoe',
      portfolio: 'https://johndoe.dev'
    }
  },
  {
    email: 'sarah.wilson@email.com',
    password: 'Password123',
    role: 'applicant',
    profile: {
      name: 'Sarah Wilson',
      phone: '+1234567891',
      location: 'San Francisco, CA',
      bio: 'UI/UX Designer passionate about creating intuitive user experiences',
      skills: ['Figma', 'Adobe XD', 'Sketch', 'Prototyping', 'User Research'],
      experience: 3,
      qualification: 'Master in Design',
      linkedin: 'https://linkedin.com/in/sarahwilson',
      portfolio: 'https://sarahwilson.design'
    }
  },
  {
    email: 'mike.johnson@email.com',
    password: 'Password123',
    role: 'applicant',
    profile: {
      name: 'Mike Johnson',
      phone: '+1234567892',
      location: 'Austin, TX',
      bio: 'Data scientist with expertise in machine learning and analytics',
      skills: ['Python', 'R', 'TensorFlow', 'SQL', 'Tableau'],
      experience: 4,
      qualification: 'PhD in Data Science',
      linkedin: 'https://linkedin.com/in/mikejohnson',
      github: 'https://github.com/mikejohnson'
    }
  },
  {
    email: 'emily.brown@email.com',
    password: 'Password123',
    role: 'applicant',
    profile: {
      name: 'Emily Brown',
      phone: '+1234567893',
      location: 'Seattle, WA',
      bio: 'DevOps engineer focused on cloud infrastructure and automation',
      skills: ['AWS', 'Docker', 'Kubernetes', 'Jenkins', 'Terraform'],
      experience: 6,
      qualification: 'Bachelor in Information Technology',
      linkedin: 'https://linkedin.com/in/emilybrown',
      github: 'https://github.com/emilybrown'
    }
  },
  // Recruiters
  {
    email: 'alex.recruiter@techcorp.com',
    password: 'Password123',
    role: 'recruiter',
    profile: {
      name: 'Alex Thompson',
      phone: '+1234567894',
      location: 'Boston, MA',
      bio: 'Senior Technical Recruiter at TechCorp with 8 years of experience',
      company: 'TechCorp Solutions',
      department: 'Human Resources',
      experience: 8,
      linkedin: 'https://linkedin.com/in/alexthompson'
    }
  },
  {
    email: 'lisa.hr@innovate.com',
    password: 'Password123',
    role: 'recruiter',
    profile: {
      name: 'Lisa Garcia',
      phone: '+1234567895',
      location: 'Los Angeles, CA',
      bio: 'HR Manager specializing in startup talent acquisition',
      company: 'Innovate Labs',
      department: 'Talent Acquisition',
      experience: 5,
      linkedin: 'https://linkedin.com/in/lisagarcia'
    }
  },
  // Admin
  {
    email: 'admin@finautojobs.com',
    password: 'Password123',
    role: 'admin',
    profile: {
      name: 'System Administrator',
      phone: '+1234567896',
      location: 'Remote',
      bio: 'Platform administrator managing FinAutoJobs system',
      department: 'System Administration',
      accessLevel: 'Super Admin',
      experience: 10,
      linkedin: 'https://linkedin.com/in/admin'
    }
  }
];

const sampleCompanies = [
  {
    name: 'TechCorp Solutions',
    description: 'Leading technology solutions provider specializing in enterprise software',
    industry: 'Technology',
    size: '201-500',
    location: 'Boston, MA',
    website: 'https://techcorp.com',
    logo: 'https://via.placeholder.com/150x150?text=TechCorp',
    verified: true,
    rating: 4.5,
    benefits: ['Health Insurance', 'Remote Work', '401k', 'Flexible Hours'],
    culture: 'Innovation-driven culture with focus on work-life balance'
  },
  {
    name: 'Innovate Labs',
    description: 'Startup accelerator and product development company',
    industry: 'Startup',
    size: '11-50',
    location: 'Los Angeles, CA',
    website: 'https://innovatelabs.com',
    logo: 'https://via.placeholder.com/150x150?text=Innovate',
    verified: true,
    rating: 4.2,
    benefits: ['Equity Options', 'Flexible PTO', 'Learning Budget', 'Gym Membership'],
    culture: 'Fast-paced startup environment with opportunities for growth'
  },
  {
    name: 'DataFlow Analytics',
    description: 'Data analytics and business intelligence solutions',
    industry: 'Analytics',
    size: '51-200',
    location: 'Austin, TX',
    website: 'https://dataflow.com',
    logo: 'https://via.placeholder.com/150x150?text=DataFlow',
    verified: true,
    rating: 4.3,
    benefits: ['Health Insurance', 'Stock Options', 'Professional Development', 'Remote Work'],
    culture: 'Data-driven culture focused on continuous learning'
  }
];

const sampleJobs = [
  {
    title: 'Senior Full Stack Developer',
    company: 'TechCorp Solutions',
    location: 'Boston, MA',
    type: 'full-time',
    workMode: 'hybrid',
    description: 'We are looking for a Senior Full Stack Developer to join our growing team. You will be responsible for developing and maintaining web applications using modern technologies.',
    requirements: [
      '5+ years of experience in full-stack development',
      'Proficiency in JavaScript, React, Node.js',
      'Experience with databases (MongoDB, PostgreSQL)',
      'Knowledge of cloud platforms (AWS, Azure)',
      'Strong problem-solving skills'
    ],
    skills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'AWS'],
    salary: {
      min: 90000,
      max: 130000,
      currency: 'USD'
    },
    benefits: ['Health Insurance', 'Remote Work', '401k', 'Flexible Hours'],
    status: 'active',
    postedDate: new Date('2024-01-15'),
    applicationDeadline: new Date('2024-02-15')
  },
  {
    title: 'UI/UX Designer',
    company: 'Innovate Labs',
    location: 'Los Angeles, CA',
    type: 'full-time',
    workMode: 'remote',
    description: 'Join our design team to create beautiful and intuitive user experiences for our products. You will work closely with product managers and developers.',
    requirements: [
      '3+ years of UI/UX design experience',
      'Proficiency in Figma, Adobe XD, Sketch',
      'Strong portfolio demonstrating design skills',
      'Experience with user research and testing',
      'Knowledge of design systems'
    ],
    skills: ['Figma', 'Adobe XD', 'Sketch', 'Prototyping', 'User Research'],
    salary: {
      min: 70000,
      max: 95000,
      currency: 'USD'
    },
    benefits: ['Equity Options', 'Flexible PTO', 'Learning Budget', 'Remote Work'],
    status: 'active',
    postedDate: new Date('2024-01-20'),
    applicationDeadline: new Date('2024-02-20')
  },
  {
    title: 'Data Scientist',
    company: 'DataFlow Analytics',
    location: 'Austin, TX',
    type: 'full-time',
    workMode: 'hybrid',
    description: 'We are seeking a Data Scientist to analyze complex datasets and build predictive models to drive business insights.',
    requirements: [
      'PhD or Master in Data Science, Statistics, or related field',
      'Strong programming skills in Python and R',
      'Experience with machine learning frameworks',
      'Knowledge of SQL and database systems',
      'Excellent analytical and communication skills'
    ],
    skills: ['Python', 'R', 'TensorFlow', 'SQL', 'Machine Learning'],
    salary: {
      min: 100000,
      max: 140000,
      currency: 'USD'
    },
    benefits: ['Health Insurance', 'Stock Options', 'Professional Development', 'Remote Work'],
    status: 'active',
    postedDate: new Date('2024-01-25'),
    applicationDeadline: new Date('2024-02-25')
  },
  {
    title: 'DevOps Engineer',
    company: 'TechCorp Solutions',
    location: 'Boston, MA',
    type: 'full-time',
    workMode: 'hybrid',
    description: 'Looking for a DevOps Engineer to manage our cloud infrastructure and implement CI/CD pipelines.',
    requirements: [
      '4+ years of DevOps experience',
      'Expertise in AWS, Docker, Kubernetes',
      'Experience with CI/CD tools (Jenkins, GitLab)',
      'Knowledge of Infrastructure as Code (Terraform)',
      'Strong scripting skills (Bash, Python)'
    ],
    skills: ['AWS', 'Docker', 'Kubernetes', 'Jenkins', 'Terraform'],
    salary: {
      min: 95000,
      max: 125000,
      currency: 'USD'
    },
    benefits: ['Health Insurance', 'Remote Work', '401k', 'Flexible Hours'],
    status: 'active',
    postedDate: new Date('2024-01-30'),
    applicationDeadline: new Date('2024-03-01')
  },
  {
    title: 'Frontend Developer',
    company: 'Innovate Labs',
    location: 'Los Angeles, CA',
    type: 'contract',
    workMode: 'remote',
    description: 'Contract position for an experienced Frontend Developer to work on exciting new projects.',
    requirements: [
      '3+ years of frontend development experience',
      'Expert knowledge of React and modern JavaScript',
      'Experience with state management (Redux, Context API)',
      'Knowledge of testing frameworks (Jest, Cypress)',
      'Strong attention to detail'
    ],
    skills: ['React', 'JavaScript', 'Redux', 'CSS', 'Testing'],
    salary: {
      min: 60000,
      max: 80000,
      currency: 'USD'
    },
    benefits: ['Flexible Schedule', 'Remote Work', 'Project Bonuses'],
    status: 'active',
    postedDate: new Date('2024-02-01'),
    applicationDeadline: new Date('2024-02-28')
  }
];

// Hash password function
const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

// Populate database function
const populateDatabase = async () => {
  try {
    console.log('🧹 Clearing existing data...');
    
    // Clear existing data
    await UserFactory.deleteMany({});
    await mongoose.model('Company', CompanySchema).deleteMany({});
    await mongoose.model('Job', JobSchema).deleteMany({});
    await mongoose.model('JobApplication', JobApplicationSchema).deleteMany({});

    console.log('👥 Creating users...');
    
    // Create users
    const createdUsers = [];
    for (const userData of sampleUsers) {
      const hashedPassword = await hashPassword(userData.password);
      
      const user = await UserFactory.create({
        email: userData.email,
        password: hashedPassword,
        role: userData.role,
        profile: userData.profile,
        isEmailVerified: true,
        status: 'active'
      });
      
      createdUsers.push(user);
      console.log(`✅ Created ${userData.role}: ${userData.profile.name}`);
    }

    console.log('🏢 Creating companies...');
    
    // Create companies
    const Company = mongoose.model('Company', CompanySchema);
    const createdCompanies = [];
    for (const companyData of sampleCompanies) {
      const company = await Company.create({
        ...companyData,
        foundedYear: 2010,
        employees: companyData.size === '11-50' ? 25 : companyData.size === '51-200' ? 100 : 300,
        socialMedia: {
          linkedin: `https://linkedin.com/company/${companyData.name.toLowerCase().replace(/\s+/g, '-')}`,
          twitter: `https://twitter.com/${companyData.name.toLowerCase().replace(/\s+/g, '')}`
        }
      });
      
      createdCompanies.push(company);
      console.log(`✅ Created company: ${company.name}`);
    }

    console.log('💼 Creating jobs...');
    
    // Create jobs
    const Job = mongoose.model('Job', JobSchema);
    const createdJobs = [];
    for (const jobData of sampleJobs) {
      // Find the company for this job
      const company = createdCompanies.find(c => c.name === jobData.company);
      // Find a recruiter from this company
      const recruiter = createdUsers.find(u => 
        u.role === 'recruiter' && 
        u.profile.company === jobData.company
      );

      const job = await Job.create({
        ...jobData,
        companyId: company._id,
        recruiterId: recruiter ? recruiter._id : createdUsers.find(u => u.role === 'recruiter')._id,
        applicationsCount: 0,
        viewsCount: Math.floor(Math.random() * 100) + 50
      });
      
      createdJobs.push(job);
      console.log(`✅ Created job: ${job.title} at ${job.company}`);
    }

    console.log('📝 Creating job applications...');
    
    // Create some job applications
    const JobApplication = mongoose.model('JobApplication', JobApplicationSchema);
    const applicants = createdUsers.filter(u => u.role === 'applicant');
    
    let applicationCount = 0;
    for (const job of createdJobs.slice(0, 3)) { // Apply to first 3 jobs
      for (const applicant of applicants.slice(0, 2)) { // First 2 applicants apply
        const application = await JobApplication.create({
          jobId: job._id,
          applicantId: applicant._id,
          recruiterId: job.recruiterId,
          companyId: job.companyId,
          status: ['applied', 'reviewed', 'shortlisted'][Math.floor(Math.random() * 3)],
          appliedDate: new Date(),
          coverLetter: `I am very interested in the ${job.title} position at ${job.company}. My skills in ${applicant.profile.skills.slice(0, 3).join(', ')} make me a great fit for this role.`,
          resume: {
            filename: `${applicant.profile.name.replace(/\s+/g, '_')}_Resume.pdf`,
            url: `https://example.com/resumes/${applicant._id}.pdf`
          }
        });
        
        applicationCount++;
        console.log(`✅ Created application: ${applicant.profile.name} -> ${job.title}`);
      }
    }

    console.log('\n🎉 Database populated successfully!');
    console.log(`📊 Summary:`);
    console.log(`   👥 Users: ${createdUsers.length}`);
    console.log(`   🏢 Companies: ${createdCompanies.length}`);
    console.log(`   💼 Jobs: ${createdJobs.length}`);
    console.log(`   📝 Applications: ${applicationCount}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error populating database:', error);
    process.exit(1);
  }
};

// Run the script
const main = async () => {
  await connectDB();
  await populateDatabase();
};

main();
