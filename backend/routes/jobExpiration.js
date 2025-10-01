import express from 'express';
import { updateExpiredJobs, getJobExpirationStats, getJobsExpiringSoon } from '../utils/jobExpiration.js';
import { authenticateToken } from '../middlewares/Others/auth.js';

const router = express.Router();

/**
 * GET /api/job-expiration/stats
 * Get job expiration statistics for the authenticated recruiter
 */
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const recruiterId = req.user.userId;
    const stats = await getJobExpirationStats(recruiterId);
    
    res.json({
      success: true,
      data: {
        stats,
        message: 'Job expiration statistics retrieved successfully'
      }
    });
  } catch (error) {
    console.error('❌ Error getting job expiration stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get job expiration statistics',
      error: error.message
    });
  }
});

/**
 * GET /api/job-expiration/expiring-soon
 * Get jobs that will expire soon for the authenticated recruiter
 */
router.get('/expiring-soon', authenticateToken, async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const recruiterId = req.user.userId;
    
    // Get all jobs expiring soon, then filter by recruiter
    const allExpiringSoon = await getJobsExpiringSoon(parseInt(days));
    const recruiterExpiringSoon = allExpiringSoon.filter(
      job => job.postedBy.toString() === recruiterId
    );
    
    res.json({
      success: true,
      data: {
        jobs: recruiterExpiringSoon,
        count: recruiterExpiringSoon.length,
        days: parseInt(days),
        message: `Found ${recruiterExpiringSoon.length} jobs expiring within ${days} days`
      }
    });
  } catch (error) {
    console.error('❌ Error getting jobs expiring soon:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get jobs expiring soon',
      error: error.message
    });
  }
});

/**
 * POST /api/job-expiration/update
 * Manually trigger job expiration update (admin/recruiter only)
 */
router.post('/update', authenticateToken, async (req, res) => {
  try {
    const result = await updateExpiredJobs();
    
    res.json({
      success: true,
      data: {
        modifiedCount: result.modifiedCount,
        message: result.modifiedCount > 0 
          ? `Updated ${result.modifiedCount} expired jobs`
          : 'No expired jobs found to update'
      }
    });
  } catch (error) {
    console.error('❌ Error manually updating expired jobs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update expired jobs',
      error: error.message
    });
  }
});

/**
 * GET /api/job-expiration/admin/stats
 * Get global job expiration statistics (admin only)
 */
router.get('/admin/stats', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin role required.'
      });
    }
    
    const globalStats = await getJobExpirationStats();
    
    res.json({
      success: true,
      data: {
        stats: globalStats,
        message: 'Global job expiration statistics retrieved successfully'
      }
    });
  } catch (error) {
    console.error('❌ Error getting global job expiration stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get global job expiration statistics',
      error: error.message
    });
  }
});

export default router;
