import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function checkJobs() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/finauto-jobs');
    console.log('✅ Connected to MongoDB');
    
    // Find all jobs and group by status
    const jobs = await mongoose.connection.db.collection('jobs').find({}).toArray();
    console.log('Total jobs found:', jobs.length);
    
    const jobsByStatus = {};
    jobs.forEach(job => {
      const status = job.status || 'Unknown';
      if (!jobsByStatus[status]) {
        jobsByStatus[status] = [];
      }
      jobsByStatus[status].push({
        title: job.jobTitle,
        company: job.companyName,
        postedBy: job.postedBy?.toString()
      });
    });
    
    console.log('\n📊 Jobs by Status:');
    Object.keys(jobsByStatus).forEach(status => {
      console.log(`${status}: ${jobsByStatus[status].length} jobs`);
      jobsByStatus[status].forEach(job => {
        console.log(`  - ${job.title} at ${job.company}`);
      });
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

checkJobs();
