#!/usr/bin/env node

/**
 * Test Script for Modular Schema System
 * Tests basic functionality of the new modular models
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import {
  User,
  Company,
  Job,
  Application,
  Interview,
  initializeModels,
  getModelStats
} from '../models/mongoose/index.js';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/finautojobs';

console.log('🧪 Testing Modular Schema System...');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
};

// Test User model
const testUserModel = async () => {
  console.log('\n👤 Testing User Model...');
  
  try {
    // Test user creation
    const testUser = new User({
      username: 'testuser123',
      email: 'testuser123@example.com',
      password_hash: 'password123',
      first_name: 'Test',
      last_name: 'User',
      role: 'applicant',
      phone: '+91-9876543210'
    });
    
    await testUser.save();
    console.log('  ✅ User created successfully');
    
    // Test password comparison
    const isPasswordValid = await testUser.comparePassword('password123');
    console.log(`  ✅ Password validation: ${isPasswordValid ? 'PASS' : 'FAIL'}`);
    
    // Test user search
    const users = await User.searchUsers('test', { limit: 5 });
    console.log(`  ✅ User search returned ${users.length} results`);
    
    // Test email verification
    const verificationToken = testUser.createEmailVerificationToken();
    await testUser.save();
    console.log(`  ✅ Email verification token created: ${verificationToken.substring(0, 10)}...`);
    
    return testUser;
  } catch (error) {
    console.error('  ❌ User model test failed:', error.message);
    return null;
  }
};

// Test Company model
const testCompanyModel = async (testUser) => {
  console.log('\n🏢 Testing Company Model...');
  
  try {
    // Test company creation
    const testCompany = new Company({
      name: 'Test Tech Solutions',
      slug: 'test-tech-solutions',
      tagline: 'Innovation at its best',
      description: 'A test company for the modular schema system',
      industry: 'Technology',
      company_type: 'startup',
      size: '11-50',
      founded_year: 2020,
      email: 'contact@testtech.com',
      city: 'Mumbai',
      country: 'India',
      website: 'https://testtech.com',
      is_verified: true,
      administrators: [{
        user_id: testUser._id,
        role: 'owner',
        permissions: ['all']
      }]
    });
    
    await testCompany.save();
    console.log('  ✅ Company created successfully');
    
    // Test administrator methods
    const isAdmin = testCompany.isAdministrator(testUser._id);
    console.log(`  ✅ Administrator check: ${isAdmin ? 'PASS' : 'FAIL'}`);
    
    // Test trust score calculation
    const trustScore = testCompany.calculateTrustScore();
    console.log(`  ✅ Trust score calculated: ${trustScore}`);
    
    // Test company search
    const companies = await Company.searchCompanies('tech', { limit: 5 });
    console.log(`  ✅ Company search returned ${companies.length} results`);
    
    return testCompany;
  } catch (error) {
    console.error('  ❌ Company model test failed:', error.message);
    return null;
  }
};

// Test Job model
const testJobModel = async (testUser, testCompany) => {
  console.log('\n💼 Testing Job Model...');
  
  try {
    // Test job creation
    const testJob = new Job({
      title: 'Senior Full Stack Developer',
      slug: 'senior-full-stack-developer-test',
      company_id: testCompany._id,
      posted_by: testUser._id,
      description: 'We are looking for an experienced full stack developer to join our team.',
      job_type: 'full_time',
      employment_type: 'permanent',
      work_mode: 'hybrid',
      city: 'Mumbai',
      country: 'India',
      experience_min: 3,
      experience_max: 7,
      required_skills: [
        { name: 'JavaScript', proficiency_level: 'advanced', years_required: 3 },
        { name: 'React', proficiency_level: 'advanced', years_required: 2 },
        { name: 'Node.js', proficiency_level: 'intermediate', years_required: 2 }
      ],
      preferred_skills: [
        { name: 'TypeScript', proficiency_level: 'intermediate' },
        { name: 'MongoDB', proficiency_level: 'intermediate' }
      ],
      salary_min: 800000,
      salary_max: 1500000,
      salary_currency: 'INR',
      salary_type: 'annual',
      benefits: [
        { name: 'Health Insurance', category: 'health' },
        { name: 'Flexible Working Hours', category: 'time_off' }
      ],
      status: 'active',
      published_at: new Date()
    });
    
    await testJob.save();
    console.log('  ✅ Job created successfully');
    
    // Test job search
    const jobs = await Job.searchJobs('developer', { 
      location: 'mumbai',
      work_mode: 'hybrid',
      limit: 5 
    });
    console.log(`  ✅ Job search returned ${jobs.length} results`);
    
    // Test skills matching
    const matchScore = testJob.calculateMatchScore(['JavaScript', 'React', 'Python']);
    console.log(`  ✅ Skills match score: ${matchScore}%`);
    
    // Test view increment
    await testJob.incrementViews();
    console.log(`  ✅ Views incremented to: ${testJob.views_count}`);
    
    return testJob;
  } catch (error) {
    console.error('  ❌ Job model test failed:', error.message);
    return null;
  }
};

// Test Application model
const testApplicationModel = async (testUser, testCompany, testJob) => {
  console.log('\n📝 Testing Application Model...');
  
  try {
    // Create a second user for application
    const applicantUser = new User({
      username: 'applicant123',
      email: 'applicant123@example.com',
      password_hash: 'password123',
      first_name: 'John',
      last_name: 'Applicant',
      role: 'applicant'
    });
    await applicantUser.save();
    
    // Test application creation
    const testApplication = new Application({
      job_id: testJob._id,
      applicant_id: applicantUser._id,
      company_id: testCompany._id,
      cover_letter: 'I am very interested in this position and believe I would be a great fit.',
      resume_url: 'https://example.com/resume.pdf',
      screening_responses: [
        {
          question_id: '1',
          question: 'What is your experience with React?',
          answer: '3 years of professional experience',
          answer_type: 'text'
        }
      ],
      expected_salary: 1200000,
      salary_currency: 'INR',
      willing_to_relocate: false,
      status: 'pending',
      stage: 'applied'
    });
    
    await testApplication.save();
    console.log('  ✅ Application created successfully');
    
    // Test status update
    await testApplication.updateStatus('reviewed', 'screening', testUser._id, 'Initial review completed');
    console.log('  ✅ Application status updated');
    
    // Test communication addition
    await testApplication.addCommunication({
      type: 'email',
      direction: 'outbound',
      subject: 'Application Received',
      content: 'Thank you for your application. We will review it shortly.',
      sent_by: testUser._id,
      sent_to: applicantUser._id
    });
    console.log('  ✅ Communication added to application');
    
    // Test skills matching
    await testApplication.calculateSkillsMatch();
    console.log(`  ✅ Skills match calculated: ${testApplication.skills_match?.match_percentage || 0}%`);
    
    return testApplication;
  } catch (error) {
    console.error('  ❌ Application model test failed:', error.message);
    return null;
  }
};

// Test Interview model
const testInterviewModel = async (testApplication, testUser) => {
  console.log('\n🎤 Testing Interview Model...');
  
  try {
    // Test interview creation
    const testInterview = new Interview({
      application_id: testApplication._id,
      job_id: testApplication.job_id,
      candidate_id: testApplication.applicant_id,
      company_id: testApplication.company_id,
      title: 'Technical Interview - Full Stack Developer',
      description: 'Technical assessment and coding interview',
      interview_type: 'video',
      interview_round: 1,
      scheduled_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      scheduled_time: '14:30',
      duration_minutes: 90,
      meeting_url: 'https://zoom.us/j/123456789',
      interviewers: [{
        user_id: testUser._id,
        role: 'primary',
        name: `${testUser.first_name} ${testUser.last_name}`,
        email: testUser.email,
        is_lead: true
      }],
      questions: [
        {
          question: 'Explain the difference between let, const, and var in JavaScript',
          category: 'technical',
          difficulty: 'medium',
          order: 1
        },
        {
          question: 'How do you handle state management in React applications?',
          category: 'technical',
          difficulty: 'medium',
          order: 2
        }
      ],
      status: 'scheduled'
    });
    
    await testInterview.save();
    console.log('  ✅ Interview created successfully');
    
    // Test interview feedback
    await testInterview.addInterviewerFeedback({
      interviewer_id: testUser._id,
      interviewer_name: `${testUser.first_name} ${testUser.last_name}`,
      rating: 8,
      strengths: ['Strong technical skills', 'Good communication'],
      weaknesses: ['Could improve system design knowledge'],
      comments: 'Solid candidate with good potential',
      recommendation: 'hire'
    });
    console.log('  ✅ Interview feedback added');
    
    // Test interview completion
    await testInterview.markAsCompleted();
    console.log('  ✅ Interview marked as completed');
    
    // Test decision making
    await testInterview.makeDecision('proceed', testUser._id, 'Moving to next round');
    console.log('  ✅ Interview decision recorded');
    
    return testInterview;
  } catch (error) {
    console.error('  ❌ Interview model test failed:', error.message);
    return null;
  }
};

// Test model statistics
const testModelStats = async () => {
  console.log('\n📊 Testing Model Statistics...');
  
  try {
    const stats = await getModelStats();
    
    console.log('  📈 Model Statistics:');
    Object.entries(stats).forEach(([modelName, modelStats]) => {
      if (modelStats.error) {
        console.log(`    ❌ ${modelName}: Error - ${modelStats.error}`);
      } else {
        console.log(`    ✅ ${modelName}: ${modelStats.total} total, ${modelStats.active} active`);
      }
    });
    
    return stats;
  } catch (error) {
    console.error('  ❌ Model stats test failed:', error.message);
    return null;
  }
};

// Main test function
const runTests = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Initialize models
    initializeModels();
    
    // Run individual tests
    const testUser = await testUserModel();
    if (!testUser) return;
    
    const testCompany = await testCompanyModel(testUser);
    if (!testCompany) return;
    
    const testJob = await testJobModel(testUser, testCompany);
    if (!testJob) return;
    
    const testApplication = await testApplicationModel(testUser, testCompany, testJob);
    if (!testApplication) return;
    
    const testInterview = await testInterviewModel(testApplication, testUser);
    if (!testInterview) return;
    
    // Test statistics
    await testModelStats();
    
    console.log('\n🎉 All tests completed successfully!');
    console.log('✅ Modular schema system is working correctly');
    
  } catch (error) {
    console.error('💥 Test suite failed:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
};

// Run tests if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests();
}

export default runTests;
