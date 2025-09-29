import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Application from './models/unified/Application.js';
import Job from './models/Job.js';
import { BaseUser, Applicant, Recruiter } from './models/UserModels.js';

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/finauto_jobs', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function createTestData() {
  try {
    console.log('🔄 Creating test data...\n');
    
    // Create test recruiter
    const hashedPassword = await bcrypt.hash('password123', 10);
    
    const recruiter = new Recruiter({
      firstName: 'John',
      lastName: 'Recruiter',
      email: 'recruiter@test.com',
      username: 'johnrecruiter',
      password: hashedPassword,
      phone: '+91 9876543210',
      role: 'recruiter',
      companyInfo: {
        companyName: 'Tech Corp',
        department: 'HR',
        designation: 'Senior Recruiter'
      },
      officeLocation: {
        city: 'Mumbai'
      }
    });
    await recruiter.save();
    console.log('✅ Created test recruiter:', recruiter._id);
    
    // Create test applicant
    const applicant = new Applicant({
      firstName: 'Jane',
      lastName: 'Applicant',
      email: 'applicant@test.com',
      username: 'janeapplicant',
      password: hashedPassword,
      phone: '+91 9876543211',
      role: 'applicant',
      skills: {
        primary: ['JavaScript', 'React', 'Node.js'],
        technical: ['MongoDB', 'Express.js'],
        soft: ['Communication', 'Teamwork']
      },
      currentLocation: {
        city: 'Delhi'
      }
    });
    await applicant.save();
    console.log('✅ Created test applicant:', applicant._id);
    
    // Create test job
    const job = new Job({
      jobTitle: 'Financial Analyst',
      companyName: 'Tech Corp',
      location: 'Mumbai',
      industry: 'Finance & Banking',
      jobCategory: 'Banking & Financial Services',
      jobType: 'Full Time',
      workArrangement: 'Hybrid',
      salary: {
        type: 'Range',
        minimum: 500000,
        maximum: 800000,
        period: 'Annual',
        currency: 'INR'
      },
      experience: {
        minimum: 2,
        maximum: 5
      },
      requiredSkills: ['Financial Analysis', 'Excel Advanced', 'Financial Modeling'],
      jobDescription: 'We are looking for a skilled Financial Analyst to join our team.',
      keyResponsibilities: ['Analyze financial data', 'Prepare financial reports'],
      requirements: ['2+ years experience', 'Strong analytical skills'],
      status: 'Active',
      postedBy: recruiter._id,
      contactEmail: 'recruiter@test.com',
      applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    });
    await job.save();
    console.log('✅ Created test job:', job._id);
    
    // Create test application
    const application = new Application({
      jobId: job._id,
      applicantId: applicant._id,
      applicationStatus: 'pending',
      jobSnapshot: {
        jobTitle: job.jobTitle,
        companyName: job.companyName,
        location: job.location,
        jobType: job.jobType
      },
      applicantSnapshot: {
        fullName: `${applicant.firstName} ${applicant.lastName}`,
        email: applicant.email,
        phone: '+91 9876543210',
        location: applicant.currentLocation?.city || 'Delhi'
      },
      applicationData: {
        coverLetter: 'I am very interested in this position...',
        phone: '+91 9876543210',
        location: 'Delhi',
        experience: '3 years',
        skills: ['JavaScript', 'React', 'Node.js']
      },
      appliedAt: new Date(),
      createdAt: new Date()
    });
    await application.save();
    console.log('✅ Created test application:', application._id);
    
    // Create another application with different status
    const application2 = new Application({
      jobId: job._id,
      applicantId: applicant._id,
      applicationStatus: 'shortlisted',
      jobSnapshot: {
        jobTitle: job.jobTitle,
        companyName: job.companyName,
        location: job.location,
        jobType: job.jobType
      },
      applicantSnapshot: {
        fullName: 'Mike Developer',
        email: 'mike@test.com',
        phone: '+91 9876543211',
        location: 'Bangalore'
      },
      applicationData: {
        coverLetter: 'I have extensive experience in frontend development...',
        phone: '+91 9876543211',
        location: 'Bangalore',
        experience: '4 years',
        skills: ['JavaScript', 'React', 'Vue.js']
      },
      appliedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    });
    await application2.save();
    console.log('✅ Created second test application:', application2._id);
    
    console.log('\n🎉 Test data created successfully!');
    console.log('\n📋 Summary:');
    console.log(`👤 Recruiter: ${recruiter.email} (ID: ${recruiter._id})`);
    console.log(`👤 Applicant: ${applicant.email} (ID: ${applicant._id})`);
    console.log(`💼 Job: ${job.title} (ID: ${job._id})`);
    console.log(`📝 Applications: 2 created`);
    
    console.log('\n🔑 Login Credentials:');
    console.log('Recruiter: recruiter@test.com / password123');
    console.log('Applicant: applicant@test.com / password123');
    
  } catch (error) {
    console.error('❌ Error creating test data:', error);
  } finally {
    mongoose.connection.close();
  }
}

createTestData();
