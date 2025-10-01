import Job from '../models/Job.js';
import Application from '../models/Application.js';

/**
 * Automatic Job Expiration System
 * Handles moving expired jobs from Active to Expired status
 * AND updates related applications
 */

export const updateExpiredJobs = async () => {
  try {
    console.log('🔄 Checking for expired jobs...');
    
    // First, find jobs that need to be expired
    const expiredJobs = await Job.find({
      status: 'Active',
      applicationDeadline: { $lt: new Date() }
    }).select('_id jobTitle companyName applicationDeadline');
    
    if (expiredJobs.length === 0) {
      console.log('✅ No expired jobs found');
      return { modifiedCount: 0, applicationsUpdated: 0 };
    }
    
    console.log(`📊 Found ${expiredJobs.length} jobs to expire:`, 
      expiredJobs.map(job => ({ title: job.jobTitle, company: job.companyName }))
    );
    
    // Update jobs to expired status
    const jobUpdateResult = await Job.updateMany(
      {
        status: 'Active',
        applicationDeadline: { $lt: new Date() }
      },
      {
        $set: { 
          status: 'Expired',
          updatedAt: new Date()
        }
      }
    );
    
    console.log(`✅ Updated ${jobUpdateResult.modifiedCount} jobs to Expired status`);
    
    // Update related applications for each expired job
    let totalApplicationsUpdated = 0;
    
    for (const job of expiredJobs) {
      try {
        const appUpdateResult = await Application.handleJobExpiration(job._id, {
          title: job.jobTitle,
          company: job.companyName,
          deadline: job.applicationDeadline
        });
        
        totalApplicationsUpdated += appUpdateResult.modifiedCount;
      } catch (appError) {
        console.error(`❌ Error updating applications for job ${job._id}:`, appError);
      }
    }
    
    console.log(`✅ Updated ${totalApplicationsUpdated} applications for expired jobs`);
    
    return {
      modifiedCount: jobUpdateResult.modifiedCount,
      applicationsUpdated: totalApplicationsUpdated,
      expiredJobs: expiredJobs.map(job => ({
        id: job._id,
        title: job.jobTitle,
        company: job.companyName
      }))
    };
  } catch (error) {
    console.error('❌ Error updating expired jobs:', error);
    throw error;
  }
};

/**
 * Get jobs that will expire soon (within specified days)
 */
export const getJobsExpiringSoon = async (days = 3) => {
  try {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    
    const expiringSoonJobs = await Job.find({
      status: 'Active',
      applicationDeadline: {
        $gte: new Date(),
        $lte: futureDate
      }
    }).populate('postedBy', 'firstName lastName email');
    
    console.log(`📅 Found ${expiringSoonJobs.length} jobs expiring within ${days} days`);
    return expiringSoonJobs;
  } catch (error) {
    console.error('❌ Error getting jobs expiring soon:', error);
    throw error;
  }
};

/**
 * Start periodic job expiration check
 * Runs every hour to check for expired jobs
 */
export const startJobExpirationScheduler = () => {
  console.log('🚀 Starting job expiration scheduler...');
  
  // Run immediately on startup
  updateExpiredJobs();
  
  // Run every hour (3600000 ms)
  const intervalId = setInterval(async () => {
    try {
      await updateExpiredJobs();
    } catch (error) {
      console.error('❌ Scheduled job expiration check failed:', error);
    }
  }, 3600000); // 1 hour
  
  console.log('✅ Job expiration scheduler started (runs every hour)');
  
  return intervalId;
};

/**
 * Get job expiration statistics
 */
export const getJobExpirationStats = async (recruiterId = null) => {
  try {
    const baseQuery = recruiterId ? { postedBy: recruiterId } : {};
    
    const stats = await Job.aggregate([
      { $match: baseQuery },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const result = {
      active: 0,
      expired: 0,
      closed: 0,
      draft: 0,
      paused: 0,
      total: 0
    };
    
    stats.forEach(stat => {
      const status = stat._id.toLowerCase();
      result[status] = stat.count;
      result.total += stat.count;
    });
    
    // Get jobs expiring within next 7 days
    const expiringSoon = await getJobsExpiringSoon(7);
    result.expiringSoon = expiringSoon.length;
    
    return result;
  } catch (error) {
    console.error('❌ Error getting job expiration stats:', error);
    throw error;
  }
};

export default {
  updateExpiredJobs,
  getJobsExpiringSoon,
  startJobExpirationScheduler,
  getJobExpirationStats
};
