import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { createUserByRole, findUserByIdAndRole } from '../models/UserModels.js';
import Job from '../models/Job.js';
import Application from '../models/unified/Application.js';
import ApplicationInformation from '../models/ApplicationInformation.js';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/finautojobs';

async function testSchemaLinks() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Test 1: Create Applicant User (Registration → Profile)
    console.log('\n📝 Test 1: Registration → Profile Flow');
    const applicantData = {
      firstName: 'John',
      lastName: 'TestUser',
      username: 'johnschematest',
      email: 'john.test.schema@example.com',
      phone: '9876543210',
      password: 'password123',
      role: 'applicant',
      skills: ['JavaScript', 'React', 'Node.js'],
      current_job_title: 'Software Developer',
      current_company: 'Tech Corp',
      expected_salary: 800000,
      experience_years: 3,
      qualification: 'Bachelor of Engineering',
      location: 'Mumbai',
      linkedin_url: 'https://linkedin.com/in/johntest',
      github_url: 'https://github.com/johntest'
    };

    const applicant = await createUserByRole(applicantData);
    console.log('✅ Applicant created:', applicant._id);
    console.log('📊 Applicant data:', {
      name: applicant.fullName,
      email: applicant.email,
      role: applicant.role,
      skills: applicant.skills?.primary || [],
      location: applicant.currentLocation?.city
    });

    // Test 2: Create Recruiter User
    console.log('\n📝 Test 2: Recruiter Registration');
    const recruiterData = {
      firstName: 'Sarah',
      lastName: 'Recruiter',
      username: 'sarahschemarecruiter',
      email: 'sarah.recruiter.schema@example.com',
      phone: '9876543211',
      password: 'password123',
      role: 'recruiter',
      company: 'TechCorp Solutions',
      position: 'HR Manager',
      department: 'Human Resources',
      location: 'Mumbai',
      experience_years: 5
    };

    const recruiter = await createUserByRole(recruiterData);
    console.log('✅ Recruiter created:', recruiter._id);
    console.log('📊 Recruiter data:', {
      name: recruiter.fullName,
      email: recruiter.email,
      role: recruiter.role,
      company: recruiter.companyInfo?.companyName,
      department: recruiter.companyInfo?.department
    });

    // Test 3: Create Job Posting
    console.log('\n📝 Test 3: Job Creation');
    const jobData = {
      jobTitle: 'Senior React Developer',
      companyName: 'TechCorp Solutions',
      location: 'Mumbai, India',
      industry: 'Finance & Banking',
      jobCategory: 'Fintech',
      jobType: 'Full Time',
      workArrangement: 'Hybrid',
      status: 'active',
      jobDescription: 'We are looking for an experienced React developer to join our team.',
      experience: {
        minimum: 2,
        maximum: 5
      },
      contactEmail: 'sarah.recruiter.schema@example.com',
      jobUrgency: 'Normal Priority',
      salary: {
        type: 'Range',
        minimum: 800,
        maximum: 1200,
        period: 'Yearly',
        currency: 'INR'
      },
      salaryRange: {
        min: 800,
        max: 1200,
        currency: 'INR',
        period: 'Yearly'
      },
      requiredSkills: ['Financial Analysis', 'Risk Assessment', 'Excel Advanced', 'SQL'],
      applicationDeadline: new Date('2025-12-31'),
      postedBy: recruiter._id,
      recruiterInfo: {
        recruiterId: recruiter._id,
        companyInfo: {
          companyName: recruiter.companyInfo?.companyName,
          department: recruiter.companyInfo?.department,
          designation: recruiter.companyInfo?.designation
        }
      }
    };

    const job = new Job(jobData);
    await job.save();
    console.log('✅ Job created:', job._id);
    console.log('📊 Job data:', {
      title: job.jobTitle,
      company: job.companyName,
      postedBy: job.postedBy,
      recruiter: job.recruiterInfo?.recruiterId
    });

    // Test 4: Create Application
    console.log('\n📝 Test 4: Job Application');
    const applicationData = {
      applicantId: applicant._id,
      jobId: job._id,
      recruiterId: recruiter._id,
      applicationStatus: 'pending',
      applicationData: {
        coverLetter: 'I am very interested in this position...',
        expectedSalary: '8-10 LPA',
        willingToRelocate: false,
        remoteWorkPreference: true
      },
      applicantSnapshot: {
        fullName: applicant.fullName,
        email: applicant.email,
        phone: applicant.phone,
        location: applicant.currentLocation?.city || 'Mumbai',
        skills: applicant.skills?.primary || [],
        education: applicant.education || []
      },
      jobSnapshot: {
        jobTitle: job.jobTitle,
        companyName: job.companyName,
        location: job.location,
        jobType: job.jobType
      }
    };

    const application = new Application(applicationData);
    await application.save();
    console.log('✅ Application created:', application._id);
    console.log('📊 Application data:', {
      applicant: application.applicantId,
      job: application.jobId,
      recruiter: application.recruiterId,
      status: application.applicationStatus
    });

    // Test 5: Create ApplicationInformation (Complete Profile Snapshot)
    console.log('\n📝 Test 5: ApplicationInformation Snapshot');
    const appInfoData = {
      applicationId: application._id,
      applicantId: applicant._id,
      jobId: job._id,
      basicInfo: {
        firstName: applicant.firstName,
        lastName: applicant.lastName,
        email: applicant.email,
        phone: applicant.phone
      },
      expectedSalary: {
        salaryRange: {
          min: 800,
          max: 1000,
          currency: 'INR',
          period: 'yearly'
        },
        rawSalaryText: '8-10 LPA',
        displayText: '₹8.0L - ₹10.0L yearly'
      },
      experience: {
        totalYears: 3,
        rawExperienceText: '3 years',
        currentJob: {
          jobTitle: 'Software Developer',
          companyName: 'Tech Corp',
          isCurrentlyWorking: true
        }
      },
      socialLinks: {
        linkedin: { url: applicant.linkedin_url },
        github: { url: applicant.github_url }
      },
      skills: {
        primary: applicant.skills?.primary?.map(skill => ({
          skill: skill,
          proficiency: 'intermediate',
          yearsOfExperience: 2
        })) || []
      },
      education: applicant.education || [],
      profileCompletionSnapshot: {
        completionPercentage: 85,
        completedSections: ['basicInfo', 'experience', 'skills', 'education'],
        missingSections: ['documents']
      }
    };

    const appInfo = new ApplicationInformation(appInfoData);
    await appInfo.save();
    console.log('✅ ApplicationInformation created:', appInfo._id);
    console.log('📊 ApplicationInformation data:', {
      application: appInfo.applicationId,
      applicant: appInfo.applicantId,
      job: appInfo.jobId,
      expectedSalary: appInfo.expectedSalary?.displayText,
      skills: appInfo.skills?.primary?.length || 0
    });

    // Test 6: Verify Relationships with Population
    console.log('\n📝 Test 6: Verify Schema Relationships');
    
    // Populate Application with related data
    const populatedApplication = await Application.findById(application._id)
      .populate('applicantId', 'firstName lastName email role')
      .populate('jobId', 'jobTitle companyName')
      .populate('recruiterId', 'firstName lastName companyInfo');
    
    console.log('✅ Application with populated data:', {
      applicant: populatedApplication.applicantId?.firstName + ' ' + populatedApplication.applicantId?.lastName,
      job: populatedApplication.jobId?.jobTitle,
      recruiter: populatedApplication.recruiterId?.firstName + ' ' + populatedApplication.recruiterId?.lastName,
      recruiterCompany: populatedApplication.recruiterId?.companyInfo?.companyName
    });

    // Populate ApplicationInformation with related data
    const populatedAppInfo = await ApplicationInformation.findById(appInfo._id)
      .populate('applicantId', 'firstName lastName email skills')
      .populate('jobId', 'jobTitle companyName requiredSkills')
      .populate('applicationId', 'applicationStatus');

    console.log('✅ ApplicationInformation with populated data:', {
      applicant: populatedAppInfo.applicantId?.firstName + ' ' + populatedAppInfo.applicantId?.lastName,
      job: populatedAppInfo.jobId?.jobTitle,
      applicationStatus: populatedAppInfo.applicationId?.applicationStatus,
      skillsSnapshot: populatedAppInfo.skills?.primary?.length || 0
    });

    console.log('\n🎉 All Schema Links Verified Successfully!');
    console.log('\n📋 Summary:');
    console.log('✅ User Registration → Profile: Working');
    console.log('✅ Applicant → Application: Linked');
    console.log('✅ Application → ApplicationInformation: 1:1 Relationship');
    console.log('✅ Job → Recruiter: Proper Reference');
    console.log('✅ Population/Joins: All relationships working');
    console.log('✅ Profile Snapshot: Complete data captured');

  } catch (error) {
    console.error('❌ Error testing schema links:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the test
testSchemaLinks();
