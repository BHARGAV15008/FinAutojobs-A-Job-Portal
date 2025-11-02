#!/usr/bin/env node

/**
 * Frontend-Backend Integration Test
 * Simulates real user flow: Login → Create Job → Apply → Verify
 */

import fetch from 'node-fetch';
import FormData from 'form-data';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env.development') });

const API_BASE = 'http://localhost:5000/api';
let recruiterToken = '';
let applicantToken = '';
let jobId = '';
let applicationId = '';

// Test credentials (use existing accounts from your database)
const RECRUITER_EMAIL = 'bhargavgohil2520@gmail.com'; // Existing recruiter
const RECRUITER_PASSWORD = 'Bhargav@123'; // Update if different
const APPLICANT_EMAIL = 'hohnjohn567@gmail.com'; // Existing applicant
const APPLICANT_PASSWORD = 'Hohn@123'; // Update if different

// Helper function to make API calls
const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  
  const data = await response.json();
  return { status: response.status, data };
};

// Step 1: Login as recruiter
const loginRecruiter = async () => {
  console.log('\n📝 Step 1: Logging in as recruiter...');
  console.log(`   Email: ${RECRUITER_EMAIL}`);
  
  const { status, data } = await apiCall('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: RECRUITER_EMAIL,
      password: RECRUITER_PASSWORD,
    }),
  });
  
  if (status === 200 && data.token) {
    recruiterToken = data.token;
    console.log(`✅ Recruiter logged in successfully`);
    console.log(`   Token: ${recruiterToken.substring(0, 20)}...`);
    return true;
  } else {
    console.error(`❌ Recruiter login failed:`, data.message);
    return false;
  }
};

// Step 2: Create job post
const createJob = async () => {
  console.log('\n📝 Step 2: Creating job post...');
  
  const jobData = {
    jobTitle: `Test Job ${Date.now()}`,
    companyName: 'Test Company',
    location: 'Mumbai, India',
    jobType: 'Full Time',
    experience: { min: 3, max: 5 },
    salary: { min: 800000, max: 1200000 },
    skills: ['JavaScript', 'React', 'Node.js'],
    description: 'Test job description for integration testing',
    status: 'active',
    applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  };
  
  const { status, data } = await apiCall('/jobs', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${recruiterToken}`,
    },
    body: JSON.stringify(jobData),
  });
  
  if (status === 201 && data.data) {
    jobId = data.data._id || data.data.id;
    console.log(`✅ Job created successfully`);
    console.log(`   Job ID: ${jobId}`);
    console.log(`   Title: ${jobData.jobTitle}`);
    return true;
  } else {
    console.error(`❌ Job creation failed:`, data.message);
    return false;
  }
};

// Step 3: Login as applicant
const loginApplicant = async () => {
  console.log('\n📝 Step 3: Logging in as applicant...');
  console.log(`   Email: ${APPLICANT_EMAIL}`);
  
  const { status, data } = await apiCall('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: APPLICANT_EMAIL,
      password: APPLICANT_PASSWORD,
    }),
  });
  
  if (status === 200 && data.token) {
    applicantToken = data.token;
    console.log(`✅ Applicant logged in successfully`);
    console.log(`   Token: ${applicantToken.substring(0, 20)}...`);
    return true;
  } else {
    console.error(`❌ Applicant login failed:`, data.message);
    return false;
  }
};

// Step 4: Fetch applicant profile
const fetchApplicantProfile = async () => {
  console.log('\n📝 Step 4: Fetching applicant profile...');
  
  const { status, data } = await apiCall('/profile/application-data', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${applicantToken}`,
    },
  });
  
  if (status === 200 && data) {
    console.log(`✅ Profile fetched successfully`);
    console.log(`   Name: ${data.firstName} ${data.lastName}`);
    console.log(`   Email: ${data.email}`);
    console.log(`   Education entries: ${data.education?.length || 0}`);
    console.log(`   Work experience entries: ${data.workExperience?.length || 0}`);
    console.log(`   Primary skills: ${data.primarySkills?.length || 0}`);
    return data;
  } else {
    console.error(`❌ Profile fetch failed:`, data.message);
    return null;
  }
};

// Step 5: Submit application
const submitApplication = async (profileData) => {
  console.log('\n📝 Step 5: Submitting application...');
  
  // Create complete applicant snapshot (same as frontend)
  const applicantSnapshot = {
    fullName: `${profileData.firstName || ''} ${profileData.lastName || ''}`.trim(),
    full_name: `${profileData.firstName || ''} ${profileData.lastName || ''}`.trim(),
    firstName: profileData.firstName || '',
    lastName: profileData.lastName || '',
    email: profileData.email || '',
    phone: profileData.phone || '',
    location: profileData.location || '',
    
    currentJobTitle: profileData.currentJobTitle || '',
    currentCompany: profileData.currentCompany || '',
    experience: profileData.experience || '',
    yearsOfExperience: profileData.yearsOfExperience || 0,
    expectedSalary: '15-20 LPA',
    
    bio: profileData.bio || '',
    qualification: profileData.highestEducation || '',
    
    skills: profileData.primarySkills || [],
    primarySkills: profileData.primarySkills || [],
    technicalSkills: profileData.technicalSkills || [],
    softSkills: profileData.softSkills || [],
    languages: profileData.languages || [],
    
    linkedin_url: profileData.linkedinUrl || '',
    linkedinUrl: profileData.linkedinUrl || '',
    github_url: profileData.githubUrl || '',
    githubUrl: profileData.githubUrl || '',
    portfolio_url: profileData.portfolioUrl || '',
    portfolioUrl: profileData.portfolioUrl || '',
    
    resumeUrl: profileData.resumeUrl || '',
    resume: profileData.resumeUrl || '',
    
    profilePicture: profileData.profilePicture || '',
    workExperience: profileData.workExperience || [],
    education: profileData.education || [],
    
    coverLetter: 'I am very interested in this position and believe my skills align perfectly with the requirements. This is a test application.',
    linkedinProfileUrl: profileData.linkedinUrl || '',
    portfolioLinks: [
      ...(profileData.linkedinUrl ? [{ type: 'LinkedIn', url: profileData.linkedinUrl, label: 'LinkedIn Profile' }] : []),
      ...(profileData.githubUrl ? [{ type: 'GitHub', url: profileData.githubUrl, label: 'GitHub Repository' }] : []),
      ...(profileData.portfolioUrl ? [{ type: 'Portfolio', url: profileData.portfolioUrl, label: 'Personal Portfolio' }] : [])
    ],
    
    noticePeriod: '1 month',
    howDidYouHear: 'LinkedIn',
    willingToRelocate: true,
    preferRemoteWork: true,
    additionalInformation: 'Available for immediate joining after notice period'
  };
  
  console.log(`📊 Application data prepared:`);
  console.log(`   Total fields: ${Object.keys(applicantSnapshot).length}`);
  console.log(`   Education entries: ${applicantSnapshot.education?.length || 0}`);
  console.log(`   Work experience entries: ${applicantSnapshot.workExperience?.length || 0}`);
  console.log(`   Primary skills: ${applicantSnapshot.primarySkills?.length || 0}`);
  
  // Create FormData (same as frontend)
  const formData = new FormData();
  formData.append('jobId', jobId);
  formData.append('jobTitle', 'Test Job');
  formData.append('companyName', 'Test Company');
  formData.append('firstName', applicantSnapshot.firstName);
  formData.append('lastName', applicantSnapshot.lastName);
  formData.append('email', applicantSnapshot.email);
  formData.append('phone', applicantSnapshot.phone);
  formData.append('coverLetter', applicantSnapshot.coverLetter);
  formData.append('applicantSnapshot', JSON.stringify(applicantSnapshot));
  
  const response = await fetch(`${API_BASE}/applications`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${applicantToken}`,
      ...formData.getHeaders(),
    },
    body: formData,
  });
  
  const data = await response.json();
  
  if (response.status === 201 && data.success) {
    applicationId = data.data.applicationId;
    console.log(`✅ Application submitted successfully`);
    console.log(`   Application ID: ${applicationId}`);
    return true;
  } else {
    console.error(`❌ Application submission failed:`, data.message);
    return false;
  }
};

// Step 6: Verify saved data
const verifyApplication = async () => {
  console.log('\n📝 Step 6: Verifying saved application data...');
  
  // Connect to MongoDB directly to verify
  const uri = process.env.MONGODB_URI || 'mongodb+srv://bhargavgohil2520:Bhargav%40123@cluster0.4vnlmzp.mongodb.net/finautojobs?appName=Cluster0';
  await mongoose.connect(uri);
  
  const Application = mongoose.model('Application', new mongoose.Schema({}, { strict: false, collection: 'applications' }));
  
  const application = await Application.findById(applicationId).lean();
  
  if (!application) {
    console.error(`❌ Application not found in database!`);
    await mongoose.disconnect();
    return false;
  }
  
  console.log(`✅ Application found in database`);
  
  const snapshot = application.applicantSnapshot || {};
  
  console.log(`\n📊 Verification Results:`);
  console.log(`   Total fields in snapshot: ${Object.keys(snapshot).length}`);
  console.log(`   Education entries: ${snapshot.education?.length || 0}`);
  console.log(`   Work experience entries: ${snapshot.workExperience?.length || 0}`);
  console.log(`   Primary skills: ${snapshot.primarySkills?.length || 0}`);
  console.log(`   Technical skills: ${snapshot.technicalSkills?.length || 0}`);
  console.log(`   Soft skills: ${snapshot.softSkills?.length || 0}`);
  console.log(`   Bio: ${snapshot.bio ? '✅ Present' : '❌ Missing'}`);
  console.log(`   LinkedIn: ${snapshot.linkedinUrl ? '✅ Present' : '❌ Missing'}`);
  console.log(`   GitHub: ${snapshot.githubUrl ? '✅ Present' : '❌ Missing'}`);
  console.log(`   Portfolio: ${snapshot.portfolioUrl ? '✅ Present' : '❌ Missing'}`);
  console.log(`   Cover Letter: ${snapshot.coverLetter ? '✅ Present' : '❌ Missing'}`);
  console.log(`   Resume URL: ${snapshot.resumeUrl ? '✅ Present' : '❌ Missing'}`);
  
  // Detailed education check
  if (snapshot.education && snapshot.education.length > 0) {
    console.log(`\n📚 Education Details:`);
    snapshot.education.forEach((edu, index) => {
      console.log(`   Entry ${index + 1}:`);
      console.log(`     Institution: ${edu.institution || 'N/A'}`);
      console.log(`     Degree: ${edu.degree || 'N/A'}`);
      console.log(`     Field: ${edu.fieldOfStudy || 'N/A'}`);
      console.log(`     Start Date: ${edu.startDate ? '✅' : '❌'}`);
      console.log(`     End Date: ${edu.endDate ? '✅' : '❌'}`);
      console.log(`     Grade: ${edu.grade || 'N/A'}`);
    });
  }
  
  // Detailed work experience check
  if (snapshot.workExperience && snapshot.workExperience.length > 0) {
    console.log(`\n💼 Work Experience Details:`);
    snapshot.workExperience.forEach((work, index) => {
      console.log(`   Entry ${index + 1}:`);
      console.log(`     Company: ${work.companyName || 'N/A'}`);
      console.log(`     Title: ${work.jobTitle || 'N/A'}`);
      console.log(`     Start Date: ${work.startDate ? '✅' : '❌'}`);
      console.log(`     End Date: ${work.endDate ? '✅' : '❌'}`);
      console.log(`     Description: ${work.description ? '✅' : '❌'}`);
    });
  }
  
  // Check if all critical fields are present
  const criticalFields = {
    'Basic Info': ['fullName', 'email', 'phone', 'location'],
    'Professional': ['currentJobTitle', 'currentCompany', 'experience'],
    'Profile': ['bio'],
    'Skills': ['primarySkills', 'technicalSkills', 'softSkills'],
    'Social': ['linkedinUrl', 'githubUrl', 'portfolioUrl'],
    'Education': ['education'],
    'Work Experience': ['workExperience'],
    'Application': ['coverLetter', 'resumeUrl']
  };
  
  let allPresent = true;
  const missing = [];
  
  console.log(`\n🔍 Critical Fields Check:`);
  for (const [category, fields] of Object.entries(criticalFields)) {
    console.log(`\n   ${category}:`);
    for (const field of fields) {
      const value = snapshot[field];
      const isPresent = value && (Array.isArray(value) ? value.length > 0 : true);
      console.log(`     ${field}: ${isPresent ? '✅' : '❌'}`);
      if (!isPresent) {
        missing.push(`${category}.${field}`);
        allPresent = false;
      }
    }
  }
  
  await mongoose.disconnect();
  
  return { success: allPresent, missing, snapshot };
};

// Step 7: Cleanup
const cleanup = async () => {
  console.log('\n📝 Step 7: Cleaning up test data...');
  
  const uri = process.env.MONGODB_URI || 'mongodb+srv://bhargavgohil2520:Bhargav%40123@cluster0.4vnlmzp.mongodb.net/finautojobs?appName=Cluster0';
  await mongoose.connect(uri);
  
  const Application = mongoose.model('Application', new mongoose.Schema({}, { strict: false, collection: 'applications' }));
  const Job = mongoose.model('Job', new mongoose.Schema({}, { strict: false, collection: 'jobs' }));
  
  if (applicationId) {
    await Application.deleteOne({ _id: applicationId });
    console.log(`✅ Deleted application: ${applicationId}`);
  }
  
  if (jobId) {
    await Job.deleteOne({ _id: jobId });
    console.log(`✅ Deleted job: ${jobId}`);
  }
  
  await mongoose.disconnect();
};

// Main test flow
const runIntegrationTest = async (iteration = 1) => {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`🧪 FRONTEND-BACKEND INTEGRATION TEST - ITERATION ${iteration}`);
  console.log(`${'='.repeat(80)}`);
  
  try {
    // Step 1: Login as recruiter
    if (!await loginRecruiter()) {
      return false;
    }
    
    // Step 2: Create job
    if (!await createJob()) {
      return false;
    }
    
    // Step 3: Login as applicant
    if (!await loginApplicant()) {
      return false;
    }
    
    // Step 4: Fetch profile
    const profileData = await fetchApplicantProfile();
    if (!profileData) {
      return false;
    }
    
    // Step 5: Submit application
    if (!await submitApplication(profileData)) {
      return false;
    }
    
    // Wait for data to be saved
    console.log('\n⏳ Waiting 2 seconds for data to be saved...');
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Step 6: Verify
    const verification = await verifyApplication();
    
    // Step 7: Cleanup
    await cleanup();
    
    if (verification.success) {
      console.log(`\n${'='.repeat(80)}`);
      console.log(`✅ TEST PASSED - All data transferred successfully!`);
      console.log(`${'='.repeat(80)}\n`);
      return true;
    } else {
      console.log(`\n${'='.repeat(80)}`);
      console.log(`❌ TEST FAILED - Missing fields:`);
      verification.missing.forEach(field => console.log(`   - ${field}`));
      console.log(`${'='.repeat(80)}\n`);
      return false;
    }
    
  } catch (error) {
    console.error('\n❌ Test error:', error.message);
    console.error(error.stack);
    
    // Cleanup on error
    try {
      await cleanup();
    } catch (cleanupError) {
      console.error('Cleanup error:', cleanupError.message);
    }
    
    return false;
  }
};

// Main execution
const main = async () => {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`🚀 FRONTEND-BACKEND INTEGRATION TEST`);
  console.log(`   Testing real user flow: Login → Create Job → Apply → Verify`);
  console.log(`${'='.repeat(80)}\n`);
  
  console.log(`⚠️  Prerequisites:`);
  console.log(`   1. Backend server must be running on http://localhost:5000`);
  console.log(`   2. Recruiter account must exist: ${RECRUITER_EMAIL}`);
  console.log(`   3. Applicant account must exist: ${APPLICANT_EMAIL}`);
  console.log(`   4. MongoDB must be accessible\n`);
  
  console.log(`⏳ Checking if backend is running...`);
  try {
    const response = await fetch(`${API_BASE}/health`);
    if (response.ok) {
      console.log(`✅ Backend is running\n`);
    } else {
      console.error(`❌ Backend returned status: ${response.status}`);
      process.exit(1);
    }
  } catch (error) {
    console.error(`❌ Backend is not running. Please start it with: npm run dev`);
    process.exit(1);
  }
  
  let success = false;
  let iteration = 1;
  const maxIterations = 3;
  
  while (!success && iteration <= maxIterations) {
    success = await runIntegrationTest(iteration);
    
    if (!success && iteration < maxIterations) {
      console.log(`\n⏳ Retrying in 3 seconds...\n`);
      await new Promise(resolve => setTimeout(resolve, 3000));
    }
    
    iteration++;
  }
  
  if (success) {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`🎉 ALL INTEGRATION TESTS PASSED!`);
    console.log(`   ✅ Recruiter can create jobs`);
    console.log(`   ✅ Applicant can fetch profile`);
    console.log(`   ✅ Applicant can submit application`);
    console.log(`   ✅ Complete data is saved to database`);
    console.log(`   ✅ Frontend-backend integration works perfectly`);
    console.log(`${'='.repeat(80)}\n`);
  } else {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`❌ INTEGRATION TESTS FAILED AFTER ${maxIterations} ITERATIONS`);
    console.log(`   Please check the logs above for details`);
    console.log(`${'='.repeat(80)}\n`);
  }
  
  process.exit(success ? 0 : 1);
};

main();
