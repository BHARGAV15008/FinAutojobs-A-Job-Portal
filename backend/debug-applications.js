import mongoose from 'mongoose';
import Application from './models/unified/Application.js';
import Job from './models/Job.js';
import { BaseUser } from './models/UserModels.js';

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/finauto_jobs', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function debugApplications() {
  try {
    console.log('🔍 Debugging Applications Database...\n');
    
    // Check total applications
    const totalApplications = await Application.countDocuments();
    console.log(`📊 Total Applications in DB: ${totalApplications}`);
    
    // Check total jobs
    const totalJobs = await Job.countDocuments();
    console.log(`📊 Total Jobs in DB: ${totalJobs}`);
    
    // Check total users
    const totalUsers = await BaseUser.countDocuments();
    console.log(`📊 Total Users in DB: ${totalUsers}\n`);
    
    // Get sample applications
    const applications = await Application.find().limit(5).lean();
    console.log('📋 Sample Applications:');
    applications.forEach((app, index) => {
      console.log(`${index + 1}. Application ID: ${app._id}`);
      console.log(`   Job ID: ${app.jobId}`);
      console.log(`   Applicant ID: ${app.applicantId}`);
      console.log(`   Status: ${app.applicationStatus || app.status}`);
      console.log(`   Created: ${app.createdAt}\n`);
    });
    
    // Get sample jobs with their postedBy field
    const jobs = await Job.find().limit(5).select('_id title postedBy').lean();
    console.log('💼 Sample Jobs:');
    jobs.forEach((job, index) => {
      console.log(`${index + 1}. Job ID: ${job._id}`);
      console.log(`   Title: ${job.title}`);
      console.log(`   Posted By: ${job.postedBy}\n`);
    });
    
    // Get sample users
    const users = await BaseUser.find().limit(5).select('_id firstName lastName role').lean();
    console.log('👥 Sample Users:');
    users.forEach((user, index) => {
      console.log(`${index + 1}. User ID: ${user._id}`);
      console.log(`   Name: ${user.firstName} ${user.lastName}`);
      console.log(`   Role: ${user.role}\n`);
    });
    
  } catch (error) {
    console.error('❌ Error debugging applications:', error);
  } finally {
    mongoose.connection.close();
  }
}

debugApplications();
