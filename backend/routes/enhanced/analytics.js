import express from 'express';
import { UserAnalytics, JobAnalytics, SystemAnalytics } from '../../models/enhanced/Analytics.js';
import Job from '../../models/Job.js';
import Application from '../../models/unified/Application.js';
import Interview from '../../models/Interview.js';
import { BaseUser } from '../../models/UserModels.js';
import { authenticateToken, requireRole } from '../../middleware/auth.js';

const router = express.Router();

// @route   GET /api/analytics/dashboard/:role
// @desc    Get comprehensive dashboard analytics
// @access  Private
router.get('/dashboard/:role', authenticateToken, async (req, res) => {
  try {
    const { role } = req.params;
    const userId = req.user.userId;

    // Verify user can access this role's analytics
    if (req.user.role !== role && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this analytics data'
      });
    }

    let analytics = {};

    if (role === 'applicant') {
      analytics = await getApplicantAnalytics(userId);
    } else if (role === 'recruiter') {
      analytics = await getRecruiterAnalytics(userId);
    } else if (role === 'admin') {
      analytics = await getAdminAnalytics();
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid role specified'
      });
    }

    res.json({
      success: true,
      data: {
        role,
        userId,
        analytics,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error fetching dashboard analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/analytics/realtime/:role
// @desc    Get real-time statistics
// @access  Private
router.get('/realtime/:role', authenticateToken, async (req, res) => {
  try {
    const { role } = req.params;
    const userId = req.user.userId;

    // Verify user can access this role's analytics
    if (req.user.role !== role && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this analytics data'
      });
    }

    let stats = {};

    if (role === 'applicant') {
      stats = await getApplicantRealtimeStats(userId);
    } else if (role === 'recruiter') {
      stats = await getRecruiterRealtimeStats(userId);
    } else if (role === 'admin') {
      stats = await getAdminRealtimeStats();
    }

    res.json({
      success: true,
      data: {
        role,
        userId,
        analytics: stats,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error fetching realtime analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/analytics/profile-views/:userId
// @desc    Get profile view analytics
// @access  Private
router.get('/profile-views/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { period = '30d' } = req.query;

    // Verify user can access this profile's analytics
    if (req.user.userId !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this profile analytics'
      });
    }

    const analytics = await UserAnalytics.findOne({ userId });
    if (!analytics) {
      return res.status(404).json({
        success: false,
        message: 'Analytics data not found'
      });
    }

    // Get time-series data for profile views
    const timeSeriesData = await getProfileViewTimeSeries(userId, period);

    res.json({
      success: true,
      data: {
        profileViews: analytics.profileViews,
        timeSeries: timeSeriesData,
        period
      }
    });

  } catch (error) {
    console.error('Error fetching profile view analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/analytics/job-performance/:jobId
// @desc    Get job performance analytics
// @access  Private (Recruiter only)
router.get('/job-performance/:jobId', authenticateToken, requireRole(['recruiter']), async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.user.userId;

    // Verify job ownership
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    if (job.postedBy.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this job analytics'
      });
    }

    // Get job analytics
    const jobAnalytics = await JobAnalytics.findOne({ jobId });
    
    // Get application metrics
    const applicationMetrics = await getJobApplicationMetrics(jobId);
    
    // Get time-series data
    const timeSeriesData = await getJobViewTimeSeries(jobId, '30d');

    res.json({
      success: true,
      data: {
        job: {
          _id: job._id,
          jobTitle: job.jobTitle,
          companyName: job.companyName,
          status: job.status,
          createdAt: job.createdAt
        },
        analytics: jobAnalytics || {},
        applicationMetrics,
        timeSeries: timeSeriesData
      }
    });

  } catch (error) {
    console.error('Error fetching job performance analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/analytics/application-funnel/:userId
// @desc    Get application funnel analytics
// @access  Private
router.get('/application-funnel/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { period = '30d' } = req.query;

    // Verify access
    if (req.user.userId !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this analytics data'
      });
    }

    const funnel = await getApplicationFunnel(userId, period);

    res.json({
      success: true,
      data: {
        funnel,
        period
      }
    });

  } catch (error) {
    console.error('Error fetching application funnel:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/analytics/track-view
// @desc    Track profile or job view
// @access  Private
router.post('/track-view', authenticateToken, async (req, res) => {
  try {
    const { type, targetId, metadata = {} } = req.body;
    const viewerId = req.user.userId;

    if (!['profile', 'job'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid view type. Must be "profile" or "job"'
      });
    }

    if (type === 'profile') {
      await trackProfileView(targetId, viewerId, metadata);
    } else if (type === 'job') {
      await trackJobView(targetId, viewerId, metadata);
    }

    res.json({
      success: true,
      message: 'View tracked successfully'
    });

  } catch (error) {
    console.error('Error tracking view:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Helper functions for analytics calculations

const getApplicantAnalytics = async (userId) => {
  const [applications, userAnalytics, interviews] = await Promise.all([
    Application.find({ applicantId: userId }).populate('jobId', 'jobTitle companyName salaryRange location'),
    UserAnalytics.findOne({ userId }),
    Interview.find({ candidateId: userId })
  ]);

  const totalApplications = applications.length;
  const statusCounts = applications.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {});

  const shortlisted = statusCounts.shortlisted || 0;
  const interviewed = statusCounts.interviewed || 0;
  const hired = statusCounts.hired || 0;
  const rejected = statusCounts.rejected || 0;

  return {
    applications: {
      total: totalApplications,
      pending: statusCounts.pending || 0,
      reviewing: statusCounts.reviewing || 0,
      shortlisted,
      interviewed,
      hired,
      rejected,
      shortlistRate: totalApplications > 0 ? ((shortlisted / totalApplications) * 100).toFixed(1) : 0,
      interviewRate: totalApplications > 0 ? ((interviewed / totalApplications) * 100).toFixed(1) : 0,
      hireRate: totalApplications > 0 ? ((hired / totalApplications) * 100).toFixed(1) : 0
    },
    profile: {
      views: userAnalytics?.profileViews || { total: 0, thisMonth: 0, thisWeek: 0 },
      completeness: userAnalytics?.profileCompleteness || 0
    },
    interviews: {
      total: interviews.length,
      scheduled: interviews.filter(i => i.status === 'scheduled').length,
      completed: interviews.filter(i => i.status === 'completed').length,
      cancelled: interviews.filter(i => i.status === 'cancelled').length
    },
    trends: await getApplicantTrends(userId)
  };
};

const getRecruiterAnalytics = async (userId) => {
  const [jobs, applications, userAnalytics, interviews] = await Promise.all([
    Job.find({ postedBy: userId }),
    Application.find().populate('jobId').then(apps => 
      apps.filter(app => app.jobId && app.jobId.postedBy.toString() === userId)
    ),
    UserAnalytics.findOne({ userId }),
    Interview.find({ recruiterId: userId })
  ]);

  const totalJobs = jobs.length;
  const activeJobs = jobs.filter(job => job.status === 'active').length;
  const totalApplications = applications.length;
  
  const statusCounts = applications.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {});

  const hired = statusCounts.hired || 0;

  return {
    jobs: {
      total: totalJobs,
      active: activeJobs,
      draft: jobs.filter(job => job.status === 'draft').length,
      closed: jobs.filter(job => job.status === 'closed').length,
      avgApplicationsPerJob: totalJobs > 0 ? (totalApplications / totalJobs).toFixed(1) : 0
    },
    applications: {
      total: totalApplications,
      pending: statusCounts.pending || 0,
      reviewing: statusCounts.reviewing || 0,
      shortlisted: statusCounts.shortlisted || 0,
      interviewed: statusCounts.interviewed || 0,
      hired,
      rejected: statusCounts.rejected || 0,
      hireRate: totalApplications > 0 ? ((hired / totalApplications) * 100).toFixed(1) : 0
    },
    interviews: {
      total: interviews.length,
      scheduled: interviews.filter(i => i.status === 'scheduled').length,
      completed: interviews.filter(i => i.status === 'completed').length,
      cancelled: interviews.filter(i => i.status === 'cancelled').length
    },
    profile: {
      views: userAnalytics?.profileViews || { total: 0, thisMonth: 0, thisWeek: 0 },
      completeness: userAnalytics?.profileCompleteness || 0
    },
    trends: await getRecruiterTrends(userId)
  };
};

const getAdminAnalytics = async () => {
  const [totalUsers, totalJobs, totalApplications, totalInterviews] = await Promise.all([
    BaseUser.countDocuments(),
    Job.countDocuments(),
    Application.countDocuments(),
    Interview.countDocuments()
  ]);

  const [applicants, recruiters] = await Promise.all([
    BaseUser.countDocuments({ role: 'applicant' }),
    BaseUser.countDocuments({ role: 'recruiter' })
  ]);

  return {
    users: {
      total: totalUsers,
      applicants,
      recruiters,
      admins: totalUsers - applicants - recruiters
    },
    jobs: {
      total: totalJobs,
      active: await Job.countDocuments({ status: 'active' }),
      draft: await Job.countDocuments({ status: 'draft' }),
      closed: await Job.countDocuments({ status: 'closed' })
    },
    applications: {
      total: totalApplications,
      thisMonth: await Application.countDocuments({
        createdAt: { $gte: new Date(new Date().setDate(1)) }
      })
    },
    interviews: {
      total: totalInterviews,
      thisMonth: await Interview.countDocuments({
        createdAt: { $gte: new Date(new Date().setDate(1)) }
      })
    },
    systemHealth: await getSystemHealthMetrics()
  };
};

const getApplicantRealtimeStats = async (userId) => {
  const applications = await Application.find({ applicantId: userId });
  const interviews = await Interview.find({ candidateId: userId });

  return {
    totalApplications: applications.length,
    pendingApplications: applications.filter(app => app.status === 'pending').length,
    shortlisted: applications.filter(app => app.status === 'shortlisted').length,
    upcomingInterviews: interviews.filter(i => 
      i.status === 'scheduled' && new Date(i.scheduledDate) > new Date()
    ).length
  };
};

const getRecruiterRealtimeStats = async (userId) => {
  const jobs = await Job.find({ postedBy: userId });
  const jobIds = jobs.map(job => job._id);
  const applications = await Application.find({ jobId: { $in: jobIds } });
  const interviews = await Interview.find({ recruiterId: userId });

  return {
    totalJobs: jobs.length,
    activeJobs: jobs.filter(job => job.status === 'active').length,
    totalApplications: applications.length,
    pendingApplications: applications.filter(app => app.status === 'pending').length,
    shortlisted: applications.filter(app => app.status === 'shortlisted').length,
    upcomingInterviews: interviews.filter(i => 
      i.status === 'scheduled' && new Date(i.scheduledDate) > new Date()
    ).length
  };
};

const getAdminRealtimeStats = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return {
    newUsersToday: await BaseUser.countDocuments({ createdAt: { $gte: today } }),
    newJobsToday: await Job.countDocuments({ createdAt: { $gte: today } }),
    newApplicationsToday: await Application.countDocuments({ createdAt: { $gte: today } }),
    activeUsers: await BaseUser.countDocuments({ 
      lastLogin: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    })
  };
};

const getApplicantTrends = async (userId) => {
  // Get last 6 months of application data
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const applications = await Application.find({
    applicantId: userId,
    createdAt: { $gte: sixMonthsAgo }
  });

  const monthlyData = {};
  applications.forEach(app => {
    const month = app.createdAt.toISOString().slice(0, 7); // YYYY-MM
    if (!monthlyData[month]) {
      monthlyData[month] = { applications: 0, shortlisted: 0, hired: 0 };
    }
    monthlyData[month].applications++;
    if (app.status === 'shortlisted') monthlyData[month].shortlisted++;
    if (app.status === 'hired') monthlyData[month].hired++;
  });

  return Object.entries(monthlyData).map(([month, data]) => ({
    month,
    ...data
  }));
};

const getRecruiterTrends = async (userId) => {
  // Get last 6 months of job and application data
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const [jobs, applications] = await Promise.all([
    Job.find({ postedBy: userId, createdAt: { $gte: sixMonthsAgo } }),
    Application.find({ createdAt: { $gte: sixMonthsAgo } })
      .populate('jobId')
      .then(apps => apps.filter(app => app.jobId && app.jobId.postedBy.toString() === userId))
  ]);

  const monthlyData = {};
  
  jobs.forEach(job => {
    const month = job.createdAt.toISOString().slice(0, 7);
    if (!monthlyData[month]) {
      monthlyData[month] = { jobs: 0, applications: 0, hires: 0 };
    }
    monthlyData[month].jobs++;
  });

  applications.forEach(app => {
    const month = app.createdAt.toISOString().slice(0, 7);
    if (!monthlyData[month]) {
      monthlyData[month] = { jobs: 0, applications: 0, hires: 0 };
    }
    monthlyData[month].applications++;
    if (app.status === 'hired') monthlyData[month].hires++;
  });

  return Object.entries(monthlyData).map(([month, data]) => ({
    month,
    ...data
  }));
};

const trackProfileView = async (profileId, viewerId, metadata) => {
  // Don't track self-views
  if (profileId === viewerId) return;

  const analytics = await UserAnalytics.findOne({ userId: profileId });
  if (analytics) {
    await analytics.incrementProfileView();
  }
};

const trackJobView = async (jobId, viewerId, metadata) => {
  const jobAnalytics = await JobAnalytics.findOne({ jobId });
  if (jobAnalytics) {
    await jobAnalytics.incrementView(true); // Assume unique view for now
  }
};

const getSystemHealthMetrics = async () => {
  return {
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage(),
    cpuUsage: process.cpuUsage(),
    timestamp: new Date().toISOString()
  };
};

const getProfileViewTimeSeries = async (userId, period) => {
  // Placeholder for time-series data
  // In a real implementation, you'd store daily/hourly view counts
  return [];
};

const getJobViewTimeSeries = async (jobId, period) => {
  // Placeholder for time-series data
  return [];
};

const getJobApplicationMetrics = async (jobId) => {
  const applications = await Application.find({ jobId });
  
  return {
    total: applications.length,
    byStatus: applications.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {}),
    conversionRate: applications.length > 0 ? 
      ((applications.filter(app => app.status === 'hired').length / applications.length) * 100).toFixed(1) : 0
  };
};

const getApplicationFunnel = async (userId, period) => {
  // Calculate application funnel stages
  const applications = await Application.find({ applicantId: userId });
  
  return {
    applied: applications.length,
    reviewed: applications.filter(app => ['reviewing', 'shortlisted', 'interviewed', 'hired'].includes(app.status)).length,
    shortlisted: applications.filter(app => ['shortlisted', 'interviewed', 'hired'].includes(app.status)).length,
    interviewed: applications.filter(app => ['interviewed', 'hired'].includes(app.status)).length,
    hired: applications.filter(app => app.status === 'hired').length
  };
};

export default router;
