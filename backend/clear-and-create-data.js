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

async function clearAndCreateData() {
  try {
    console.log('🔄 Clearing existing data...\n');
    
    // Clear existing data
    await Application.deleteMany({});
    await Job.deleteMany({});
    await BaseUser.deleteMany({});
    
    console.log('✅ Cleared all existing data\n');
    
    console.log('🔄 Creating fresh test data...\n');
    
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
        primary: ['Financial Analysis', 'Excel Advanced'],
        technical: ['Financial Modeling', 'Risk Assessment'],
        soft: ['Communication', 'Teamwork']
      },
      currentLocation: {
        city: 'Delhi'
      }
    });
    await applicant.save();
    console.log('✅ Created test applicant:', applicant._id);
    
    // Create second applicant
    const applicant2 = new Applicant({
      firstName: 'Mike',
      lastName: 'Developer',
      email: 'mike@test.com',
      username: 'mikedeveloper',
      password: hashedPassword,
      phone: '+91 9876543212',
      role: 'applicant',
      skills: {
        primary: ['Financial Analysis', 'Risk Assessment'],
        technical: ['Financial Modeling', 'Portfolio Management'],
        soft: ['Leadership', 'Problem Solving']
      },
      currentLocation: {
        city: 'Bangalore'
      }
    });
    await applicant2.save();
    console.log('✅ Created second test applicant:', applicant2._id);
    
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
        period: 'Yearly',
        currency: 'INR'
      },
      salaryRange: {
        min: 500000,
        max: 800000,
        type: 'Range',
        period: 'Yearly',
        currency: 'INR'
      },
      experience: {
        minimum: 2,
        maximum: 5
      },
      requiredSkills: ['Financial Analysis', 'Excel Advanced', 'Financial Modeling'],
      jobDescription: 'We are looking for a skilled Financial Analyst to join our team. The ideal candidate will have strong analytical skills and experience in financial modeling.',
      keyResponsibilities: ['Analyze financial data', 'Prepare financial reports'],
      requirements: ['2+ years experience', 'Strong analytical skills'],
      status: 'Active',
      postedBy: recruiter._id,
      recruiterInfo: {
        recruiterId: recruiter._id,
        companyInfo: {
          companyName: 'Tech Corp',
          department: 'Finance',
          designation: 'Senior Recruiter'
        }
      },
      contactEmail: 'recruiter@test.com',
      applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
    });
    await job.save();
    console.log('✅ Created test job:', job._id);
    
    // Create test application from first applicant
    const application = new Application({
      jobId: job._id,
      applicantId: applicant._id,
      recruiterId: recruiter._id,
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
        coverLetter: 'I am very interested in this Financial Analyst position...',
        phone: '+91 9876543210',
        location: 'Delhi',
        experience: '3 years',
        skills: ['Financial Analysis', 'Excel Advanced', 'Financial Modeling']
      },
      appliedAt: new Date(),
      createdAt: new Date()
    });
    await application.save();
    console.log('✅ Created test application:', application._id);
    
    // Create another application from second applicant with different status
    const application2 = new Application({
      jobId: job._id,
      applicantId: applicant2._id,
      recruiterId: recruiter._id,
      applicationStatus: 'shortlisted',
      jobSnapshot: {
        jobTitle: job.jobTitle,
        companyName: job.companyName,
        location: job.location,
        jobType: job.jobType
      },
      applicantSnapshot: {
        fullName: `${applicant2.firstName} ${applicant2.lastName}`,
        email: applicant2.email,
        phone: '+91 9876543212',
        location: applicant2.currentLocation?.city || 'Bangalore'
      },
      applicationData: {
        coverLetter: 'I have extensive experience in financial analysis...',
        phone: '+91 9876543212',
        location: 'Bangalore',
        experience: '4 years',
        skills: ['Financial Analysis', 'Risk Assessment', 'Portfolio Management']
      },
      appliedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    });
    await application2.save();
    console.log('✅ Created second test application:', application2._id);
    
    console.log('\n🎉 Fresh test data created successfully!');
    console.log('\n📋 Summary:');
    console.log(`👤 Recruiter: ${recruiter.email} (ID: ${recruiter._id})`);
    console.log(`👤 Applicant 1: ${applicant.email} (ID: ${applicant._id})`);
    console.log(`👤 Applicant 2: ${applicant2.email} (ID: ${applicant2._id})`);
    console.log(`💼 Job: ${job.jobTitle} (ID: ${job._id})`);
    console.log(`📝 Applications: 2 created`);
    
    console.log('\n🔑 Login Credentials:');
    console.log('Recruiter: recruiter@test.com / password123');
    console.log('Applicant 1: applicant@test.com / password123');
    console.log('Applicant 2: mike@test.com / password123');
    
  } catch (error) {
    console.error('❌ Error creating test data:', error);
  } finally {
    mongoose.connection.close();
  }
}

clearAndCreateData();
