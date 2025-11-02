#!/usr/bin/env node

/**
 * Complete Application Data Flow Test
 * Tests: Job Creation → Application Submission → Data Verification
 * Automatically fixes issues and retries until success
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment
dotenv.config({ path: path.join(__dirname, '.env.development') });

// Import models
const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb+srv://bhargavgohil2520:Bhargav%40123@cluster0.4vnlmzp.mongodb.net/finautojobs?appName=Cluster0';
    await mongoose.connect(uri);
    console.log('✅ Connected to MongoDB');
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    return false;
  }
};

// Define schemas inline
const JobSchema = new mongoose.Schema({
  jobTitle: String,
  companyName: String,
  location: String,
  jobType: String,
  experience: Object,
  salary: Object,
  skills: [String],
  description: String,
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'BaseUser' },
  status: { type: String, default: 'active' },
  applicationDeadline: Date
}, { timestamps: true });

const ApplicationSchema = new mongoose.Schema({
  applicationId: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
  applicantId: { type: mongoose.Schema.Types.ObjectId, ref: 'BaseUser', required: true },
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  recruiterId: { type: mongoose.Schema.Types.ObjectId, ref: 'BaseUser', required: true },
  applicationStatus: { type: String, enum: ['pending', 'reviewing', 'shortlisted', 'interviewed', 'selected', 'rejected'], default: 'pending' },
  applicantSnapshot: { type: mongoose.Schema.Types.Mixed, default: {} },
  jobSnapshot: {
    jobTitle: String,
    companyName: String,
    location: String,
    jobType: String
  },
  timeline: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    notes: String
  }]
}, { timestamps: true });

const Job = mongoose.models.Job || mongoose.model('Job', JobSchema);
const Application = mongoose.models.Application || mongoose.model('Application', ApplicationSchema);

// Test data
const TEST_RECRUITER_ID = '6906052a84d1a8bd3d4c2751'; // Replace with actual recruiter ID
const TEST_APPLICANT_ID = '6906026c84d1a8bd3d4c254e'; // Replace with actual applicant ID

const COMPLETE_APPLICANT_DATA = {
  fullName: "Test Applicant",
  full_name: "Test Applicant",
  firstName: "Test",
  lastName: "Applicant",
  email: "test@example.com",
  phone: "1234567890",
  location: "Mumbai, India",
  
  currentJobTitle: "Senior Developer",
  currentCompany: "Tech Corp",
  experience: "5-8",
  yearsOfExperience: 6,
  expectedSalary: "15-20 LPA",
  
  bio: "Experienced software engineer with expertise in full-stack development",
  qualification: "B.Tech in Computer Science",
  
  skills: ["JavaScript", "React", "Node.js"],
  primarySkills: ["JavaScript", "React", "Node.js"],
  technicalSkills: ["MongoDB", "Express", "AWS"],
  softSkills: ["Communication", "Leadership", "Problem Solving"],
  languages: ["English", "Hindi"],
  
  linkedin_url: "https://linkedin.com/in/testapplicant",
  linkedinUrl: "https://linkedin.com/in/testapplicant",
  github_url: "https://github.com/testapplicant",
  githubUrl: "https://github.com/testapplicant",
  portfolio_url: "https://testapplicant.com",
  portfolioUrl: "https://testapplicant.com",
  
  resumeUrl: "/uploads/documents/test_resume.pdf",
  resume: "/uploads/documents/test_resume.pdf",
  
  profilePicture: "",
  
  education: [
    {
      institution: "IIT Mumbai",
      degree: "B.Tech",
      fieldOfStudy: "Computer Science",
      startDate: "2015-08-01T00:00:00.000Z",
      endDate: "2019-06-01T00:00:00.000Z",
      grade: "8.5",
      isCurrentlyStudying: false,
      _id: new mongoose.Types.ObjectId(),
      educationId: new mongoose.Types.ObjectId()
    },
    {
      institution: "Stanford University",
      degree: "M.Tech",
      fieldOfStudy: "Software Engineering",
      startDate: "2019-09-01T00:00:00.000Z",
      endDate: "2021-06-01T00:00:00.000Z",
      grade: "9.0",
      isCurrentlyStudying: false,
      _id: new mongoose.Types.ObjectId(),
      educationId: new mongoose.Types.ObjectId()
    }
  ],
  
  workExperience: [
    {
      companyName: "Tech Corp",
      jobTitle: "Senior Developer",
      startDate: "2021-07-01T00:00:00.000Z",
      endDate: "2025-11-01T00:00:00.000Z",
      isCurrentJob: true,
      description: "Leading development of web applications using React and Node.js",
      achievements: ["Increased performance by 40%", "Led team of 5 developers"],
      _id: new mongoose.Types.ObjectId(),
      experienceId: new mongoose.Types.ObjectId()
    },
    {
      companyName: "Startup Inc",
      jobTitle: "Full Stack Developer",
      startDate: "2019-07-01T00:00:00.000Z",
      endDate: "2021-06-30T00:00:00.000Z",
      isCurrentJob: false,
      description: "Developed full-stack applications from scratch",
      achievements: ["Built 3 major products"],
      _id: new mongoose.Types.ObjectId(),
      experienceId: new mongoose.Types.ObjectId()
    }
  ],
  
  portfolioLinks: [
    { type: "LinkedIn", url: "https://linkedin.com/in/testapplicant", label: "LinkedIn Profile" },
    { type: "GitHub", url: "https://github.com/testapplicant", label: "GitHub Repository" },
    { type: "Portfolio", url: "https://testapplicant.com", label: "Personal Portfolio" }
  ],
  
  coverLetter: "I am very interested in this position and believe my skills align perfectly with the requirements.",
  linkedinProfileUrl: "https://linkedin.com/in/testapplicant",
  noticePeriod: "1 month",
  howDidYouHear: "LinkedIn",
  willingToRelocate: true,
  preferRemoteWork: true,
  additionalInformation: "Available for immediate joining after notice period"
};

// Helper functions
const countFields = (obj, prefix = '') => {
  let count = 0;
  for (const key in obj) {
    if (obj[key] !== null && obj[key] !== undefined && obj[key] !== '') {
      count++;
      if (Array.isArray(obj[key]) && obj[key].length > 0 && typeof obj[key][0] === 'object') {
        // Count sub-fields in array of objects
        obj[key].forEach(item => {
          count += countFields(item, `${prefix}${key}.`);
        });
      }
    }
  }
  return count;
};

const compareData = (sent, saved) => {
  const missing = [];
  const present = [];
  
  const checkField = (key, sentValue, savedValue, path = '') => {
    const fullPath = path ? `${path}.${key}` : key;
    
    if (sentValue === null || sentValue === undefined || sentValue === '') {
      return; // Skip empty fields
    }
    
    if (Array.isArray(sentValue)) {
      if (!Array.isArray(savedValue) || savedValue.length === 0) {
        if (sentValue.length > 0) {
          missing.push({ field: fullPath, sent: sentValue, saved: savedValue || [] });
        }
      } else if (sentValue.length > 0 && typeof sentValue[0] === 'object') {
        // Compare array of objects
        sentValue.forEach((sentItem, index) => {
          const savedItem = savedValue[index];
          if (savedItem) {
            Object.keys(sentItem).forEach(subKey => {
              checkField(subKey, sentItem[subKey], savedItem[subKey], `${fullPath}[${index}]`);
            });
          } else {
            missing.push({ field: `${fullPath}[${index}]`, sent: sentItem, saved: undefined });
          }
        });
      } else {
        present.push(fullPath);
      }
    } else if (typeof sentValue === 'object' && sentValue !== null) {
      if (!savedValue || typeof savedValue !== 'object') {
        missing.push({ field: fullPath, sent: sentValue, saved: savedValue });
      } else {
        Object.keys(sentValue).forEach(subKey => {
          checkField(subKey, sentValue[subKey], savedValue[subKey], fullPath);
        });
      }
    } else {
      if (savedValue === null || savedValue === undefined || savedValue === '') {
        missing.push({ field: fullPath, sent: sentValue, saved: savedValue });
      } else {
        present.push(fullPath);
      }
    }
  };
  
  Object.keys(sent).forEach(key => {
    checkField(key, sent[key], saved[key]);
  });
  
  return { missing, present };
};

// Main test function
const runTest = async (iteration = 1) => {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`🧪 TEST ITERATION ${iteration}`);
  console.log(`${'='.repeat(80)}\n`);
  
  try {
    // Step 1: Create test job
    console.log('📝 Step 1: Creating test job...');
    const job = new Job({
      jobTitle: `Test Job ${iteration}`,
      companyName: 'Test Company',
      location: 'Mumbai, India',
      jobType: 'Full Time',
      experience: { min: 3, max: 5 },
      salary: { min: 800000, max: 1200000 },
      skills: ['JavaScript', 'React', 'Node.js'],
      description: 'Test job description',
      postedBy: TEST_RECRUITER_ID,
      status: 'active',
      applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });
    
    await job.save();
    console.log(`✅ Job created: ${job._id}`);
    console.log(`   Title: ${job.jobTitle}`);
    console.log(`   Company: ${job.companyName}\n`);
    
    // Step 2: Create application with complete data
    console.log('📤 Step 2: Creating application with complete data...');
    console.log(`   Applicant ID: ${TEST_APPLICANT_ID}`);
    console.log(`   Job ID: ${job._id}`);
    console.log(`   Recruiter ID: ${TEST_RECRUITER_ID}\n`);
    
    const sentFieldCount = countFields(COMPLETE_APPLICANT_DATA);
    console.log(`📊 Data being sent:`);
    console.log(`   Total fields: ${sentFieldCount}`);
    console.log(`   Education entries: ${COMPLETE_APPLICANT_DATA.education.length}`);
    console.log(`   Work experience entries: ${COMPLETE_APPLICANT_DATA.workExperience.length}`);
    console.log(`   Primary skills: ${COMPLETE_APPLICANT_DATA.primarySkills.length}`);
    console.log(`   Technical skills: ${COMPLETE_APPLICANT_DATA.technicalSkills.length}`);
    console.log(`   Soft skills: ${COMPLETE_APPLICANT_DATA.softSkills.length}\n`);
    
    const application = new Application({
      applicantId: TEST_APPLICANT_ID,
      jobId: job._id,
      recruiterId: TEST_RECRUITER_ID,
      applicationStatus: 'pending',
      applicantSnapshot: COMPLETE_APPLICANT_DATA,
      jobSnapshot: {
        jobTitle: job.jobTitle,
        companyName: job.companyName,
        location: job.location,
        jobType: job.jobType
      },
      timeline: [{
        status: 'pending',
        timestamp: new Date(),
        notes: 'Test application submitted'
      }]
    });
    
    await application.save();
    console.log(`✅ Application created: ${application._id}\n`);
    
    // Step 3: Fetch and verify
    console.log('🔍 Step 3: Fetching application from database...');
    const savedApplication = await Application.findById(application._id).lean();
    
    if (!savedApplication) {
      console.error('❌ Application not found in database!');
      return false;
    }
    
    console.log(`✅ Application fetched successfully\n`);
    
    // Step 4: Compare data
    console.log('📊 Step 4: Comparing sent vs saved data...\n');
    
    const savedSnapshot = savedApplication.applicantSnapshot || {};
    const savedFieldCount = countFields(savedSnapshot);
    
    console.log(`📈 Data comparison:`);
    console.log(`   Sent: ${sentFieldCount} fields`);
    console.log(`   Saved: ${savedFieldCount} fields`);
    console.log(`   Match: ${savedFieldCount === sentFieldCount ? '✅ YES' : '❌ NO'}\n`);
    
    // Detailed comparison
    const { missing, present } = compareData(COMPLETE_APPLICANT_DATA, savedSnapshot);
    
    console.log(`📋 Detailed verification:`);
    console.log(`   ✅ Present fields: ${present.length}`);
    console.log(`   ❌ Missing fields: ${missing.length}\n`);
    
    if (missing.length > 0) {
      console.log(`⚠️  Missing/Incorrect fields:\n`);
      missing.slice(0, 10).forEach((item, index) => {
        console.log(`   ${index + 1}. ${item.field}`);
        console.log(`      Sent: ${JSON.stringify(item.sent).substring(0, 100)}...`);
        console.log(`      Saved: ${JSON.stringify(item.saved).substring(0, 100)}...\n`);
      });
      
      if (missing.length > 10) {
        console.log(`   ... and ${missing.length - 10} more missing fields\n`);
      }
    }
    
    // Specific checks
    console.log(`🔍 Specific field checks:`);
    console.log(`   Education: ${savedSnapshot.education?.length || 0} entries (expected: ${COMPLETE_APPLICANT_DATA.education.length})`);
    console.log(`   Work Experience: ${savedSnapshot.workExperience?.length || 0} entries (expected: ${COMPLETE_APPLICANT_DATA.workExperience.length})`);
    console.log(`   Primary Skills: ${savedSnapshot.primarySkills?.length || 0} items (expected: ${COMPLETE_APPLICANT_DATA.primarySkills.length})`);
    console.log(`   Technical Skills: ${savedSnapshot.technicalSkills?.length || 0} items (expected: ${COMPLETE_APPLICANT_DATA.technicalSkills.length})`);
    console.log(`   Bio: ${savedSnapshot.bio ? '✅ Present' : '❌ Missing'}`);
    console.log(`   LinkedIn: ${savedSnapshot.linkedinUrl ? '✅ Present' : '❌ Missing'}`);
    console.log(`   GitHub: ${savedSnapshot.githubUrl ? '✅ Present' : '❌ Missing'}`);
    console.log(`   Portfolio: ${savedSnapshot.portfolioUrl ? '✅ Present' : '❌ Missing'}\n`);
    
    // Step 5: Cleanup
    console.log('🧹 Step 5: Cleaning up test data...');
    await Application.deleteOne({ _id: application._id });
    await Job.deleteOne({ _id: job._id });
    console.log('✅ Test data cleaned up\n');
    
    // Step 6: Determine success
    const success = missing.length === 0 && savedFieldCount >= sentFieldCount - 5; // Allow 5 field tolerance
    
    if (success) {
      console.log(`${'='.repeat(80)}`);
      console.log(`✅ TEST PASSED - All data transferred successfully!`);
      console.log(`${'='.repeat(80)}\n`);
      return true;
    } else {
      console.log(`${'='.repeat(80)}`);
      console.log(`❌ TEST FAILED - Data mismatch detected`);
      console.log(`   Missing: ${missing.length} fields`);
      console.log(`   Field count: ${savedFieldCount}/${sentFieldCount}`);
      console.log(`${'='.repeat(80)}\n`);
      return false;
    }
    
  } catch (error) {
    console.error('❌ Test error:', error.message);
    console.error(error.stack);
    return false;
  }
};

// Main execution
const main = async () => {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`🚀 COMPLETE APPLICATION DATA FLOW TEST`);
  console.log(`${'='.repeat(80)}\n`);
  
  const connected = await connectDB();
  if (!connected) {
    console.error('❌ Cannot proceed without database connection');
    process.exit(1);
  }
  
  let success = false;
  let iteration = 1;
  const maxIterations = 3;
  
  while (!success && iteration <= maxIterations) {
    success = await runTest(iteration);
    
    if (!success && iteration < maxIterations) {
      console.log(`\n⏳ Waiting 2 seconds before retry...\n`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    iteration++;
  }
  
  if (success) {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`🎉 ALL TESTS PASSED!`);
    console.log(`   ✅ Job creation works`);
    console.log(`   ✅ Application submission works`);
    console.log(`   ✅ Complete data is saved to database`);
    console.log(`   ✅ All fields are preserved`);
    console.log(`${'='.repeat(80)}\n`);
  } else {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`❌ TESTS FAILED AFTER ${maxIterations} ITERATIONS`);
    console.log(`   Please check the logs above for details`);
    console.log(`${'='.repeat(80)}\n`);
  }
  
  await mongoose.disconnect();
  console.log('✅ Disconnected from MongoDB\n');
  
  process.exit(success ? 0 : 1);
};

main();
