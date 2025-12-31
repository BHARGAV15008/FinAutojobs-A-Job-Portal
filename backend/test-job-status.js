import mongoose from 'mongoose';
import Job from './models/Job.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testJobStatus() {
  try {
    console.log('🔄 Testing Job model with status field...');

    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/finautojobs';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Test creating a job with different statuses
    const testJobs = [
      { status: 'draft', jobTitle: 'Draft Job', companyName: 'Test Company' },
      { status: 'active', jobTitle: 'Active Job', companyName: 'Test Company' },
      { status: 'closed', jobTitle: 'Closed Job', companyName: 'Test Company' },
      { status: 'paused', jobTitle: 'Paused Job', companyName: 'Test Company' }
    ];

    for (const jobData of testJobs) {
      const job = new Job({
        ...jobData,
        jobId: `test-${Date.now()}-${Math.random()}`,
        industry: 'Finance & Banking',
        jobCategory: 'Banking & Financial Services',
        workArrangement: 'On-site',
        experience: { minimum: 1, maximum: 5 },
        requiredSkills: ['JavaScript'],
        salary: { type: 'Negotiable' },
        jobDescription: 'Test job description',
        contactEmail: 'test@example.com',
        applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        postedBy: new mongoose.Types.ObjectId(),
        recruiterInfo: {
          recruiterId: new mongoose.Types.ObjectId(),
          companyInfo: { companyName: 'Test Company' }
        }
      });

      await job.save();
      console.log(`✅ Created job with status: ${job.status}`);
    }

    // Test querying jobs by status
    const activeJobs = await Job.find({ status: 'active' });
    const draftJobs = await Job.find({ status: 'draft' });
    const closedJobs = await Job.find({ status: 'closed' });

    console.log(`📊 Found ${activeJobs.length} active jobs`);
    console.log(`📊 Found ${draftJobs.length} draft jobs`);
    console.log(`📊 Found ${closedJobs.length} closed jobs`);

    // Clean up test jobs
    await Job.deleteMany({ jobTitle: { $in: ['Draft Job', 'Active Job', 'Closed Job', 'Paused Job'] } });
    console.log('🧹 Cleaned up test jobs');

    console.log('✅ All job status tests passed!');

  } catch (error) {
    console.error('❌ Job status test failed:', error.message);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

testJobStatus().catch(console.error);