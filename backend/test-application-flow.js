import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, 'backend/.env.development') });

// Import models
const Job = (await import('./backend/models/Job.js')).default;
const Application = (await import('./backend/models/unified/Application.js')).default;
const { BaseUser } = await import('./backend/models/UserModels.js');

console.log('🔧 Starting Automated Application Flow Test...\n');

// Connect to database
const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://bhargavmakwana1508:Bhargav%401508@cluster0.4vnlmzp.mongodb.net/finautojobs?appName=Cluster0';
console.log('📍 Connecting to MongoDB...');
await mongoose.connect(mongoUri);
console.log('✅ Connected to MongoDB\n');

// Test configuration
let testJobId = null;
let testApplicationId = null;
let recruiterUser = null;
let applicantUser = null;

async function cleanup() {
  console.log('🧹 Cleaning up previous test data...');
  
  // Delete test applications
  const deletedApps = await Application.deleteMany({ 
    'jobSnapshot.jobTitle': 'AUTOMATED_TEST_JOB' 
  });
  console.log(`   Deleted ${deletedApps.deletedCount} test applications`);
  
  // Delete test jobs
  const deletedJobs = await Job.deleteMany({ 
    jobTitle: 'AUTOMATED_TEST_JOB' 
  });
  console.log(`   Deleted ${deletedJobs.deletedCount} test jobs`);
  
  console.log('✅ Cleanup complete\n');
}

async function findTestUsers() {
  console.log('👥 Finding test users...');
  
  // Find a recruiter
  recruiterUser = await BaseUser.findOne({ role: 'recruiter' });
  if (!recruiterUser) {
    throw new Error('❌ No recruiter found in database');
  }
  console.log(`   ✓ Found recruiter: ${recruiterUser.email}`);
  
  // Find an applicant
  applicantUser = await BaseUser.findOne({ role: 'applicant' });
  if (!applicantUser) {
    throw new Error('❌ No applicant found in database');
  }
  console.log(`   ✓ Found applicant: ${applicantUser.email}`);
  console.log('✅ Test users found\n');
}

async function createTestJob() {
  console.log('📝 Creating test job post...');
  
  const jobData = {
    jobTitle: 'AUTOMATED_TEST_JOB',
    companyName: 'Test Company',
    location: 'Test Location',
    jobType: 'Full Time',
    workMode: 'Remote',
    experience: { min: 2, max: 5 },
    salary: { min: 50000, max: 80000, currency: 'USD' },
    description: 'This is an automated test job',
    requirements: ['Test requirement 1', 'Test requirement 2'],
    responsibilities: ['Test responsibility 1', 'Test responsibility 2'],
    skills: ['JavaScript', 'Node.js', 'MongoDB'],
    benefits: ['Test benefit 1', 'Test benefit 2'],
    applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    postedBy: recruiterUser._id,
    status: 'active',
    jobUrgency: 'Normal Priority'
  };
  
  const job = new Job(jobData);
  await job.save();
  testJobId = job._id;
  
  console.log(`   ✓ Job created with ID: ${testJobId}`);
  console.log('✅ Test job created\n');
  
  return job;
}

async function createTestApplication() {
  console.log('📋 Creating test application...');
  
  // Simulate complete applicant snapshot
  const applicantSnapshot = {
    // Basic Information
    fullName: `${applicantUser.firstName || 'Test'} ${applicantUser.lastName || 'User'}`,
    full_name: `${applicantUser.firstName || 'Test'} ${applicantUser.lastName || 'User'}`,
    firstName: applicantUser.firstName || 'Test',
    lastName: applicantUser.lastName || 'User',
    email: applicantUser.email,
    phone: applicantUser.phone || '1234567890',
    location: 'Test City, Test Country',
    
    // Professional Information
    currentJobTitle: 'Senior Developer',
    currentCompany: 'Tech Corp',
    experience: '3-5',
    yearsOfExperience: 4,
    expectedSalary: '$60,000 - $70,000',
    
    // Profile Details
    bio: 'Experienced software developer with passion for coding',
    qualification: 'Bachelor of Technology',
    
    // Skills
    skills: ['JavaScript', 'React', 'Node.js'],
    primarySkills: ['JavaScript', 'React', 'Node.js'],
    technicalSkills: ['MongoDB', 'Express', 'Git'],
    softSkills: ['Communication', 'Teamwork', 'Problem Solving'],
    languages: ['English', 'Hindi'],
    
    // Social Links
    linkedin_url: 'https://linkedin.com/in/testuser',
    linkedinUrl: 'https://linkedin.com/in/testuser',
    github_url: 'https://github.com/testuser',
    githubUrl: 'https://github.com/testuser',
    portfolio_url: 'https://testuser.com',
    portfolioUrl: 'https://testuser.com',
    
    // Resume
    resumeUrl: '/uploads/documents/test_resume.pdf',
    resume: '/uploads/documents/test_resume.pdf',
    
    // Education
    education: [
      {
        institution: 'Test University',
        degree: 'B.Tech',
        fieldOfStudy: 'Computer Science',
        startDate: '2015-08-01T00:00:00.000Z',
        endDate: '2019-06-01T00:00:00.000Z',
        grade: '8.5',
        isCurrentlyStudying: false,
        _id: new mongoose.Types.ObjectId(),
        educationId: new mongoose.Types.ObjectId()
      },
      {
        institution: 'Test Institute',
        degree: 'M.Tech',
        fieldOfStudy: 'Software Engineering',
        startDate: '2019-08-01T00:00:00.000Z',
        endDate: '2021-06-01T00:00:00.000Z',
        grade: '9.0',
        isCurrentlyStudying: false,
        _id: new mongoose.Types.ObjectId(),
        educationId: new mongoose.Types.ObjectId()
      }
    ],
    
    // Work Experience
    workExperience: [
      {
        companyName: 'Tech Corp',
        jobTitle: 'Senior Developer',
        startDate: '2021-07-01T00:00:00.000Z',
        endDate: '2024-12-31T00:00:00.000Z',
        isCurrentJob: true,
        description: 'Developing web applications using modern technologies',
        achievements: ['Led team of 5 developers', 'Improved performance by 40%'],
        _id: new mongoose.Types.ObjectId(),
        experienceId: new mongoose.Types.ObjectId()
      }
    ],
    
    // Portfolio Links
    portfolioLinks: [
      { type: 'LinkedIn', url: 'https://linkedin.com/in/testuser', label: 'LinkedIn Profile' },
      { type: 'GitHub', url: 'https://github.com/testuser', label: 'GitHub Repository' },
      { type: 'Portfolio', url: 'https://testuser.com', label: 'Personal Portfolio' }
    ],
    
    // Application Specific
    coverLetter: 'I am very interested in this position and believe I would be a great fit...',
    linkedinProfileUrl: 'https://linkedin.com/in/testuser',
    
    // Preferences
    noticePeriod: '1 month',
    howDidYouHear: 'Job Board',
    willingToRelocate: true,
    preferRemoteWork: true,
    additionalInformation: 'Available for immediate joining'
  };
  
  const applicationData = {
    applicantId: applicantUser._id,
    jobId: testJobId,
    recruiterId: recruiterUser._id,
    applicationStatus: 'pending',
    
    applicationData: {
      coverLetter: applicantSnapshot.coverLetter,
      resumeUrl: applicantSnapshot.resumeUrl,
      willingToRelocate: applicantSnapshot.willingToRelocate,
      remoteWorkPreference: applicantSnapshot.preferRemoteWork,
      customAnswers: []
    },
    
    applicantSnapshot: applicantSnapshot,
    
    jobSnapshot: {
      jobTitle: 'AUTOMATED_TEST_JOB',
      companyName: 'Test Company',
      location: 'Test Location',
      jobType: 'Full Time'
    },
    
    timeline: [{
      status: 'pending',
      timestamp: new Date(),
      notes: 'Application submitted'
    }],
    
    source: 'automated_test'
  };
  
  const application = new Application(applicationData);
  await application.save();
  testApplicationId = application._id;
  
  console.log(`   ✓ Application created with ID: ${testApplicationId}`);
  console.log('✅ Test application created\n');
  
  return application;
}

async function verifyData() {
  console.log('🔍 Verifying saved data...\n');
  
  // Fetch the application from database
  const savedApplication = await Application.findById(testApplicationId);
  
  if (!savedApplication) {
    throw new Error('❌ Application not found in database!');
  }
  
  console.log('📊 VERIFICATION RESULTS:\n');
  
  // Check applicantSnapshot exists
  if (!savedApplication.applicantSnapshot) {
    console.log('❌ CRITICAL: applicantSnapshot is missing!');
    return false;
  }
  console.log('✅ applicantSnapshot exists');
  
  const snapshot = savedApplication.applicantSnapshot;
  const issues = [];
  const successes = [];
  
  // Verify basic fields
  if (snapshot.fullName) successes.push('fullName'); else issues.push('fullName missing');
  if (snapshot.email) successes.push('email'); else issues.push('email missing');
  if (snapshot.phone) successes.push('phone'); else issues.push('phone missing');
  if (snapshot.location) successes.push('location'); else issues.push('location missing');
  
  // Verify professional fields
  if (snapshot.currentJobTitle) successes.push('currentJobTitle'); else issues.push('currentJobTitle missing');
  if (snapshot.currentCompany) successes.push('currentCompany'); else issues.push('currentCompany missing');
  if (snapshot.experience) successes.push('experience'); else issues.push('experience missing');
  if (snapshot.expectedSalary) successes.push('expectedSalary'); else issues.push('expectedSalary missing');
  
  // Verify profile details
  if (snapshot.bio) successes.push('bio'); else issues.push('bio missing');
  if (snapshot.qualification) successes.push('qualification'); else issues.push('qualification missing');
  
  // Verify skills
  if (snapshot.primarySkills && Array.isArray(snapshot.primarySkills)) {
    successes.push(`primarySkills (${snapshot.primarySkills.length} items)`);
  } else {
    issues.push('primarySkills missing or not array');
  }
  
  if (snapshot.technicalSkills && Array.isArray(snapshot.technicalSkills)) {
    successes.push(`technicalSkills (${snapshot.technicalSkills.length} items)`);
  } else {
    issues.push('technicalSkills missing or not array');
  }
  
  if (snapshot.softSkills && Array.isArray(snapshot.softSkills)) {
    successes.push(`softSkills (${snapshot.softSkills.length} items)`);
  } else {
    issues.push('softSkills missing or not array');
  }
  
  // Verify education
  if (snapshot.education && Array.isArray(snapshot.education) && snapshot.education.length > 0) {
    successes.push(`education (${snapshot.education.length} entries)`);
    console.log(`   📚 Education entries: ${snapshot.education.length}`);
    snapshot.education.forEach((edu, idx) => {
      console.log(`      ${idx + 1}. ${edu.degree} in ${edu.fieldOfStudy} from ${edu.institution}`);
      if (edu.startDate) successes.push(`   education[${idx}].startDate`);
      if (edu.endDate) successes.push(`   education[${idx}].endDate`);
      if (edu.grade) successes.push(`   education[${idx}].grade`);
    });
  } else {
    issues.push('education missing or empty');
  }
  
  // Verify work experience
  if (snapshot.workExperience && Array.isArray(snapshot.workExperience) && snapshot.workExperience.length > 0) {
    successes.push(`workExperience (${snapshot.workExperience.length} entries)`);
    console.log(`   💼 Work experience entries: ${snapshot.workExperience.length}`);
    snapshot.workExperience.forEach((work, idx) => {
      console.log(`      ${idx + 1}. ${work.jobTitle} at ${work.companyName}`);
      if (work.startDate) successes.push(`   workExperience[${idx}].startDate`);
      if (work.endDate) successes.push(`   workExperience[${idx}].endDate`);
      if (work.description) successes.push(`   workExperience[${idx}].description`);
    });
  } else {
    issues.push('workExperience missing or empty');
  }
  
  // Verify social links
  if (snapshot.linkedinUrl) successes.push('linkedinUrl'); else issues.push('linkedinUrl missing');
  if (snapshot.githubUrl) successes.push('githubUrl'); else issues.push('githubUrl missing');
  if (snapshot.portfolioUrl) successes.push('portfolioUrl'); else issues.push('portfolioUrl missing');
  
  // Verify portfolio links
  if (snapshot.portfolioLinks && Array.isArray(snapshot.portfolioLinks) && snapshot.portfolioLinks.length > 0) {
    successes.push(`portfolioLinks (${snapshot.portfolioLinks.length} entries)`);
  } else {
    issues.push('portfolioLinks missing or empty');
  }
  
  // Verify resume
  if (snapshot.resumeUrl) successes.push('resumeUrl'); else issues.push('resumeUrl missing');
  
  // Verify application specific
  if (snapshot.coverLetter) successes.push('coverLetter'); else issues.push('coverLetter missing');
  if (snapshot.noticePeriod) successes.push('noticePeriod'); else issues.push('noticePeriod missing');
  
  // Print results
  console.log('\n✅ SUCCESSFUL FIELDS:', successes.length);
  successes.forEach(field => console.log(`   ✓ ${field}`));
  
  if (issues.length > 0) {
    console.log('\n❌ MISSING/FAILED FIELDS:', issues.length);
    issues.forEach(issue => console.log(`   ✗ ${issue}`));
    return false;
  }
  
  console.log('\n🎉 ALL FIELDS VERIFIED SUCCESSFULLY!');
  
  // Print summary statistics
  console.log('\n📊 SUMMARY STATISTICS:');
  console.log(`   Total fields in snapshot: ${Object.keys(snapshot).length}`);
  console.log(`   Education entries: ${snapshot.education?.length || 0}`);
  console.log(`   Work experience entries: ${snapshot.workExperience?.length || 0}`);
  console.log(`   Portfolio links: ${snapshot.portfolioLinks?.length || 0}`);
  console.log(`   Primary skills: ${snapshot.primarySkills?.length || 0}`);
  console.log(`   Technical skills: ${snapshot.technicalSkills?.length || 0}`);
  console.log(`   Soft skills: ${snapshot.softSkills?.length || 0}`);
  
  return true;
}

async function runTest() {
  try {
    // Step 1: Cleanup
    await cleanup();
    
    // Step 2: Find test users
    await findTestUsers();
    
    // Step 3: Create test job
    await createTestJob();
    
    // Step 4: Create test application
    await createTestApplication();
    
    // Step 5: Verify data
    const isValid = await verifyData();
    
    if (isValid) {
      console.log('\n✅ ========================================');
      console.log('✅ ALL TESTS PASSED!');
      console.log('✅ Data is being saved correctly!');
      console.log('✅ ========================================\n');
    } else {
      console.log('\n❌ ========================================');
      console.log('❌ TESTS FAILED!');
      console.log('❌ Some data is not being saved correctly!');
      console.log('❌ ========================================\n');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('\n❌ TEST ERROR:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    // Cleanup and disconnect
    console.log('🧹 Final cleanup...');
    await cleanup();
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    console.log('\n🏁 Test completed!\n');
  }
}

// Run the test
runTest();
