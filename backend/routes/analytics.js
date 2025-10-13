import express from 'express';
import Application from '../models/unified/Application.js';
import Job from '../models/unified/Job.js';
import { BaseUser } from '../models/UserModels.js';
import mongoose from 'mongoose';

const router = express.Router();

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access token required' 
      });
    }

    const jwt = await import('jsonwebtoken');
    const decoded = jwt.default.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // Look up user by email (more reliable than _id)
    const user = await BaseUser.findOne({ email: decoded.email });
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    req.user = {
      userId: user._id.toString(),
      role: user.role,
      email: user.email
    };
    
    next();
  } catch (error) {
    console.error('❌ Authentication error:', error);
    return res.status(403).json({ 
      success: false, 
      message: 'Invalid or expired token' 
    });
  }
};

// Get comprehensive dashboard analytics
router.get('/dashboard/:role?', authenticateToken, async (req, res) => {
  try {
    const userRole = req.params.role || req.user.role;
    const userId = req.user.userId;

    console.log('📊 Calculating analytics for:', { userRole, userId });

    let analytics = {};

    switch (userRole) {
      case 'applicant':
        analytics = await calculateApplicantAnalytics(userId);
        break;
      case 'recruiter':
        analytics = await calculateRecruiterAnalytics(userId);
        break;
      case 'admin':
        analytics = await calculateAdminAnalytics();
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid role specified'
        });
    }

    res.json({
      success: true,
      data: {
        role: userRole,
        userId,
        analytics,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Analytics calculation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate analytics',
      error: error.message
    });
  }
});

// Calculate applicant-specific analytics
async function calculateApplicantAnalytics(applicantId) {
  try {
    // Get all applications for this applicant (without populate to avoid reference issues)
    const applications = await Application.find({ applicantId }).lean();

    // Get applicant profile for completion calculation
    const applicant = await BaseUser.findById(applicantId).lean();

    // Calculate application statistics
    const totalApplications = applications.length;
    const appliedJobs = applications.filter(app => {
      const status = app.status || app.applicationStatus;
      return status === 'applied' || status === 'pending';
    }).length;
    const shortlisted = applications.filter(app => {
      const status = app.status || app.applicationStatus;
      return status === 'shortlisted';
    }).length;
    const interviews = applications.filter(app => {
      const status = app.status || app.applicationStatus;
      return status === 'interview' || status === 'interviewed';
    }).length;
    const rejected = applications.filter(app => {
      const status = app.status || app.applicationStatus;
      return status === 'rejected';
    }).length;
    const hired = applications.filter(app => {
      const status = app.status || app.applicationStatus;
      return status === 'hired' || status === 'selected';
    }).length;

    // Calculate success rates
    const shortlistRate = totalApplications > 0 ? ((shortlisted / totalApplications) * 100).toFixed(1) : 0;
    const interviewRate = totalApplications > 0 ? ((interviews / totalApplications) * 100).toFixed(1) : 0;
    const hireRate = totalApplications > 0 ? ((hired / totalApplications) * 100).toFixed(1) : 0;

    // Calculate profile completion
    const profileCompletion = calculateProfileCompletion(applicant, 'applicant');

    // Recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentApplications = applications.filter(app => 
      new Date(app.appliedAt) >= thirtyDaysAgo
    ).length;

    // Application timeline data (simplified without job details)
    const applicationTimeline = applications.map(app => ({
      date: app.appliedAt || app.createdAt,
      status: app.status || app.applicationStatus,
      applicationId: app._id
    })).sort((a, b) => new Date(b.date) - new Date(a.date));

    // Get total active jobs for market insights
    const totalActiveJobs = await Job.countDocuments({ status: 'active' });

    return {
      overview: {
        totalApplications,
        appliedJobs,
        shortlisted,
        interviews,
        rejected,
        hired,
        profileCompletion
      },
      performance: {
        shortlistRate: parseFloat(shortlistRate),
        interviewRate: parseFloat(interviewRate),
        hireRate: parseFloat(hireRate),
        recentApplications
      },
      timeline: applicationTimeline.slice(0, 10), // Last 10 applications
      marketInsights: {
        totalActiveJobs,
        applicationToJobRatio: totalActiveJobs > 0 ? ((totalApplications / totalActiveJobs) * 100).toFixed(2) : 0
      }
    };

  } catch (error) {
    console.error('❌ Applicant analytics error:', error);
    throw error;
  }
}

// Calculate recruiter-specific analytics
async function calculateRecruiterAnalytics(recruiterId) {
  try {
    // Get all jobs posted by this recruiter
    const jobs = await Job.find({ postedBy: recruiterId }).lean();
    const jobIds = jobs.map(job => job._id);

    // Get all applications for recruiter's jobs (without populate to avoid reference issues)
    const applications = await Application.find({ jobId: { $in: jobIds } }).lean();

    // Get recruiter profile
    const recruiter = await BaseUser.findById(recruiterId).lean();

    // Calculate job statistics
    const totalJobs = jobs.length;
    const activeJobs = jobs.filter(job => job.status === 'active').length;
    const closedJobs = jobs.filter(job => job.status === 'closed').length;
    const draftJobs = jobs.filter(job => job.status === 'draft').length;

    // Calculate application statistics
    const totalApplications = applications.length;
    const pendingApplications = applications.filter(app => {
      const status = app.status || app.applicationStatus;
      return status === 'pending' || status === 'applied';
    }).length;
    const shortlisted = applications.filter(app => {
      const status = app.status || app.applicationStatus;
      return status === 'shortlisted';
    }).length;
    const interviewed = applications.filter(app => {
      const status = app.status || app.applicationStatus;
      return status === 'interview' || status === 'interviewed';
    }).length;
    const hired = applications.filter(app => {
      const status = app.status || app.applicationStatus;
      return status === 'hired' || status === 'selected';
    }).length;
    const rejected = applications.filter(app => {
      const status = app.status || app.applicationStatus;
      return status === 'rejected';
    }).length;

    // Calculate performance metrics
    const avgApplicationsPerJob = totalJobs > 0 ? (totalApplications / totalJobs).toFixed(1) : 0;
    const hireRate = totalApplications > 0 ? ((hired / totalApplications) * 100).toFixed(1) : 0;
    const shortlistRate = totalApplications > 0 ? ((shortlisted / totalApplications) * 100).toFixed(1) : 0;

    // Profile completion
    const profileCompletion = calculateProfileCompletion(recruiter, 'recruiter');

    // Recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentApplications = applications.filter(app => 
      new Date(app.appliedAt) >= thirtyDaysAgo
    ).length;

    const recentJobs = jobs.filter(job => 
      new Date(job.createdAt) >= thirtyDaysAgo
    ).length;

    // Top performing jobs
    const jobPerformance = jobs.map(job => {
      const jobApplications = applications.filter(app => 
        app.jobId.toString() === job._id.toString()
      );
      return {
        jobId: job._id,
        title: job.jobTitle || job.title,
        totalApplications: jobApplications.length,
        hired: jobApplications.filter(app => (app.status || app.applicationStatus) === 'hired').length,
        shortlisted: jobApplications.filter(app => (app.status || app.applicationStatus) === 'shortlisted').length,
        createdAt: job.createdAt
      };
    }).sort((a, b) => b.totalApplications - a.totalApplications).slice(0, 5);

    // Application funnel data
    const funnelData = {
      applied: totalApplications,
      shortlisted,
      interviewed,
      hired
    };

    return {
      overview: {
        totalJobs,
        activeJobs,
        closedJobs,
        draftJobs,
        totalApplications,
        pendingApplications,
        shortlisted,
        interviewed,
        hired,
        rejected,
        profileCompletion
      },
      performance: {
        avgApplicationsPerJob: parseFloat(avgApplicationsPerJob),
        hireRate: parseFloat(hireRate),
        shortlistRate: parseFloat(shortlistRate),
        recentApplications,
        recentJobs
      },
      topJobs: jobPerformance,
      funnel: funnelData
    };

  } catch (error) {
    console.error('❌ Recruiter analytics error:', error);
    throw error;
  }
}

// Calculate admin analytics
async function calculateAdminAnalytics() {
  try {
    // Get counts from all collections
    const [totalUsers, totalJobs, totalApplications] = await Promise.all([
      BaseUser.countDocuments(),
      Job.countDocuments(),
      Application.countDocuments()
    ]);

    // Get role distribution
    const roleDistribution = await BaseUser.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    // Convert role distribution to object for easier access
    const roleStats = {};
    roleDistribution.forEach(role => {
      roleStats[role._id] = role.count;
    });

    // Get job status distribution
    const jobStatusDistribution = await Job.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Convert job status distribution to object
    const jobStats = {};
    jobStatusDistribution.forEach(status => {
      jobStats[status._id] = status.count;
    });

    // Get application status distribution
    const applicationStatusDistribution = await Application.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Convert application status distribution to object
    const appStats = {};
    applicationStatusDistribution.forEach(status => {
      appStats[status._id] = status.count;
    });

    // Recent activity (last 30 days for monthly stats)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [recentUsers, newJobs, newApplications, pendingUsers, activeUsers] = await Promise.all([
      BaseUser.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      Job.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      Application.countDocuments({ appliedAt: { $gte: thirtyDaysAgo } }),
      BaseUser.countDocuments({ isVerified: false }),
      BaseUser.countDocuments({ isActive: { $ne: false }, isVerified: true })
    ]);

    // System health metrics
    const activeJobs = await Job.countDocuments({ status: 'active' });
    const systemHealth = Math.min(100, Math.max(0, 
      (activeJobs / Math.max(1, totalJobs)) * 100
    ));

    return {
      overview: {
        totalUsers,
        totalJobs,
        totalApplications,
        activeJobs,
        systemHealth: Math.round(systemHealth),
        // Role-specific counts for frontend
        recruiters: roleStats.recruiter || 0,
        applicants: roleStats.applicant || 0,
        admins: roleStats.admin || 0,
        // User status counts
        pendingUsers,
        activeUsers,
        recentUsers,
        // Job status counts
        approvedJobs: jobStats.active || 0,
        pendingJobs: jobStats.pending || 0,
        rejectedJobs: jobStats.rejected || 0,
        // Application status counts
        pendingApplications: appStats.pending || 0,
        shortlistedApplications: appStats.shortlisted || 0,
        hiredApplications: (appStats.hired || 0) + (appStats.accepted || 0)
      },
      distributions: {
        roles: roleDistribution,
        jobStatuses: jobStatusDistribution,
        applicationStatuses: applicationStatusDistribution
      },
      recentActivity: {
        newUsers: recentUsers,
        newJobs,
        newApplications
      }
    };

  } catch (error) {
    console.error('❌ Admin analytics error:', error);
    throw error;
  }
}

// Calculate profile completion percentage
function calculateProfileCompletion(user, role) {
  if (!user) return 0;

  let completedFields = 0;
  let totalFields = 0;

  // Common fields for all roles
  const commonFields = ['firstName', 'lastName', 'email', 'phone'];
  commonFields.forEach(field => {
    totalFields++;
    if (user[field]) completedFields++;
  });

  if (role === 'applicant') {
    // Applicant-specific fields
    const applicantFields = [
      'bio', 'currentLocation', 'skills', 'education', 
      'workExperience', 'resume_url'
    ];
    
    applicantFields.forEach(field => {
      totalFields++;
      if (field === 'skills' && user.skills && (
        user.skills.primary?.length > 0 || 
        user.skills.technical?.length > 0
      )) {
        completedFields++;
      } else if (field === 'education' && user.education?.length > 0) {
        completedFields++;
      } else if (field === 'workExperience' && user.workExperience?.length > 0) {
        completedFields++;
      } else if (field === 'currentLocation' && user.currentLocation?.city) {
        completedFields++;
      } else if (user[field]) {
        completedFields++;
      }
    });
  } else if (role === 'recruiter') {
    // Recruiter-specific fields
    const recruiterFields = [
      'bio', 'companyInfo', 'yearsOfExperience', 
      'officeLocation', 'linkedin_url'
    ];
    
    recruiterFields.forEach(field => {
      totalFields++;
      if (field === 'companyInfo' && user.companyInfo?.companyName) {
        completedFields++;
      } else if (field === 'officeLocation' && user.officeLocation?.city) {
        completedFields++;
      } else if (user[field]) {
        completedFields++;
      }
    });
  }

  return Math.round((completedFields / totalFields) * 100);
}

// Get real-time statistics for dashboard
router.get('/realtime/:role?', authenticateToken, async (req, res) => {
  try {
    const userRole = req.params.role || req.user.role;
    const userId = req.user.userId;

    let stats = {};

    if (userRole === 'applicant') {
      const applications = await Application.find({ applicantId: userId });
      stats = {
        totalApplications: applications.length,
        pending: applications.filter(app => app.status === 'pending' || app.status === 'applied').length,
        shortlisted: applications.filter(app => app.status === 'shortlisted').length,
        interviews: applications.filter(app => app.status === 'interview').length,
        hired: applications.filter(app => app.status === 'hired').length,
        rejected: applications.filter(app => app.status === 'rejected').length
      };
    } else if (userRole === 'recruiter') {
      const jobs = await Job.find({ postedBy: userId });
      const jobIds = jobs.map(job => job._id);
      const applications = await Application.find({ jobId: { $in: jobIds } });
      
      stats = {
        totalJobs: jobs.length,
        activeJobs: jobs.filter(job => job.status === 'active').length,
        totalApplications: applications.length,
        pending: applications.filter(app => app.status === 'pending' || app.status === 'applied').length,
        shortlisted: applications.filter(app => app.status === 'shortlisted').length,
        interviewed: applications.filter(app => app.status === 'interview').length,
        hired: applications.filter(app => app.status === 'hired').length
      };
    }

    res.json({
      success: true,
      data: {
        stats,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Real-time stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get real-time statistics'
    });
  }
});

export default router;
