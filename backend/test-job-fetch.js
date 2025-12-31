import mongoose from 'mongoose';
import Job from './models/Job.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testJobFetch() {
  try {
    console.log('🔄 Testing job fetching...');

    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/finautojobs';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Count total jobs
    const totalJobs = await Job.countDocuments();
    console.log(`📊 Total jobs in database: ${totalJobs}`);

    // Count jobs by status
    const activeJobs = await Job.countDocuments({ status: 'active' });
    const draftJobs = await Job.countDocuments({ status: 'draft' });
    const closedJobs = await Job.countDocuments({ status: 'closed' });
    const pausedJobs = await Job.countDocuments({ status: 'paused' });

    console.log(`📊 Active jobs: ${activeJobs}`);
    console.log(`📊 Draft jobs: ${draftJobs}`);
    console.log(`📊 Closed jobs: ${closedJobs}`);
    console.log(`📊 Paused jobs: ${pausedJobs}`);

    // Check for jobs with future deadlines
    const now = new Date();
    const futureDeadlineJobs = await Job.countDocuments({
      applicationDeadline: { $gt: now }
    });
    console.log(`📊 Jobs with future deadlines: ${futureDeadlineJobs}`);

    // Get a sample of jobs
    const sampleJobs = await Job.find().limit(3).select('jobTitle status applicationDeadline postedBy').lean();
    console.log('📋 Sample jobs:');
    sampleJobs.forEach((job, index) => {
      console.log(`  ${index + 1}. ${job.jobTitle} - Status: ${job.status} - Deadline: ${job.applicationDeadline} - Posted by: ${job.postedBy}`);
    });

    // Test recruiter-specific query (assuming we have a recruiter ID)
    if (sampleJobs.length > 0) {
      const recruiterId = sampleJobs[0].postedBy;
      const recruiterJobs = await Job.find({ postedBy: recruiterId }).select('jobTitle status').lean();
      console.log(`📊 Jobs for recruiter ${recruiterId}: ${recruiterJobs.length}`);
      recruiterJobs.forEach((job, index) => {
        console.log(`  ${index + 1}. ${job.jobTitle} - Status: ${job.status}`);
      });
    }

    console.log('✅ Job fetch test completed!');

  } catch (error) {
    console.error('❌ Job fetch test failed:', error.message);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

testJobFetch().catch(console.error);