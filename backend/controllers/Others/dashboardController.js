import { BaseUser } from '../../models/UserModels.js';
import Application from '../models/Application.js';
import Job from '../models/Job.js';
import Company from '../models/Company.js';
import SavedJob from '../models/SavedJob.js';
import Notification from '../models/Notification.js';
import Interview from '../models/Interview.js';
import CompanyAnalytic from '../models/CompanyAnalytic.js';
import UserActivityLog from '../models/UserActivityLog.js';
import { format, subDays } from 'date-fns';



// Get applicant dashboard data
export const getApplicantDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user profile with all details
    const user = await BaseUser.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get application statistics
    const applicationStatsResult = await Application.aggregate([
      { $match: { applicant: userId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          reviewed: { $sum: { $cond: [{ $eq: ['$status', 'reviewed'] }, 1, 0] } },
          shortlisted: { $sum: { $cond: [{ $eq: ['$status', 'shortlisted'] }, 1, 0] } },
          rejected: { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } },
          hired: { $sum: { $cond: [{ $eq: ['$status', 'hired'] }, 1, 0] } }
        }
      }
    ]);
    const applicationStats = applicationStatsResult[0] || { total: 0, pending: 0, reviewed: 0, shortlisted: 0, rejected: 0, hired: 0 };

    // Get recent applications with job details
    const recentApplications = await Application.find({ applicant: userId })
        .populate({
            path: 'job',
            select: 'title location salaryMin salaryMax jobType companyId',
            populate: {
                path: 'companyId',
                model: 'Company',
                select: 'name'
            }
        })
        .sort({ appliedAt: -1 })
        .limit(10);

    // Get saved jobs
    const savedJobs = await SavedJob.find({ userId: userId })
      .populate({
        path: 'jobId',
        select: 'title location salaryMin salaryMax jobType workMode companyId',
        populate: {
          path: 'companyId',
          model: 'Company',
          select: 'name'
        }
      })
      .sort({ createdAt: -1 })
      .limit(10);

    // Get recommended jobs based on user skills and preferences
    const userSkills = user.skills.primary || [];
    let recommendedJobs = [];
    
    if (userSkills.length > 0) {
        recommendedJobs = await Job.find({
            status: 'active',
            // A simple recommendation logic: find jobs that require at least one of the user's skills
            skillsRequired: { $in: userSkills.map(skill => new RegExp(skill, 'i')) }
        })
        .populate('companyId', 'name')
        .sort({ createdAt: -1 })
        .limit(10);
    }

    // Get upcoming interviews (mock data for now)
    const upcomingInterviews = [];

    // Get notifications (mock data for now)
    const notifications = [];

    const transformedRecentApplications = recentApplications.map(app => ({
        id: app._id,
        status: app.status,
        appliedAt: app.appliedAt,
        jobTitle: app.job.title,
        companyName: app.job.companyId.name,
        location: app.job.location,
        salaryMin: app.job.salaryMin,
        salaryMax: app.job.salaryMax,
        jobType: app.job.jobType
    }));

    const transformedSavedJobs = savedJobs.map(saved => ({
        id: saved._id,
        savedAt: saved.createdAt,
        jobId: saved.jobId._id,
        jobTitle: saved.jobId.title,
        companyName: saved.jobId.companyId.name,
        location: saved.jobId.location,
        salaryMin: saved.jobId.salaryMin,
        salaryMax: saved.jobId.salaryMax,
        jobType: saved.jobId.jobType,
        workMode: saved.jobId.workMode
    }));
    
    const transformedRecommendedJobs = recommendedJobs.map(job => ({
        id: job._id,
        title: job.title,
        companyName: job.companyId.name,
        location: job.location,
        salaryMin: job.salaryMin,
        salaryMax: job.salaryMax,
        jobType: job.jobType,
        workMode: job.workMode,
        skillsRequired: job.skillsRequired,
        postedAt: job.createdAt
    }));

    res.json({
      user: {
        id: user._id,
        fullName: `${user.firstName} ${user.lastName}`,
        email: user.email,
        phone: user.phone,
        location: user.location,
        bio: user.bio,
        skills: user.skills,
        qualification: user.education,
        experienceYears: user.yearsOfExperience,
        resumeUrl: user.documents?.resumeUrl,
        profilePicture: user.profileImage,
        linkedinUrl: user.linkedin_url,
        githubUrl: user.github_url,
        portfolioUrl: user.portfolio_url
      },
      stats: {
        applications: applicationStats,
        savedJobs: savedJobs.length,
        profileViews: 0, // TODO: Implement profile views tracking
        profileCompletion: calculateProfileCompletion(user)
      },
      recentApplications: transformedRecentApplications,
      savedJobs: transformedSavedJobs,
      recommendedJobs: transformedRecommendedJobs,
      upcomingInterviews,
      notifications: notifications.map(n => ({
        ...n,
        isRead: Boolean(n.read)
      }))
    });

  } catch (error) {
    console.error('Error fetching applicant dashboard:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get recruiter dashboard data
export const getRecruiterDashboard = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get user profile
    const user = await BaseUser.findById(userId).populate('companyId');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const company = user.companyId;

    // Get job statistics
    const jobStatsResult = await Job.aggregate([
        { $match: { postedBy: userId } },
        {
            $group: {
                _id: null,
                total: { $sum: 1 },
                active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
                draft: { $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] } },
                closed: { $sum: { $cond: [{ $eq: ['$status', 'closed'] }, 1, 0] } }
            }
        }
    ]);
    const jobStats = jobStatsResult[0] || { total: 0, active: 0, draft: 0, closed: 0 };

    // Get application statistics for recruiter's jobs
    const recruiterJobs = await Job.find({ postedBy: userId }).select('_id');
    const recruiterJobIds = recruiterJobs.map(job => job._id);

    const applicationStatsResult = await Application.aggregate([
        { $match: { job: { $in: recruiterJobIds } } },
        {
            $group: {
                _id: null,
                total: { $sum: 1 },
                pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
                reviewed: { $sum: { $cond: [{ $eq: ['$status', 'reviewed'] }, 1, 0] } },
                shortlisted: { $sum: { $cond: [{ $eq: ['$status', 'shortlisted'] }, 1, 0] } },
                rejected: { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } },
                hired: { $sum: { $cond: [{ $eq: ['$status', 'hired'] }, 1, 0] } }
            }
        }
    ]);
    const applicationStats = applicationStatsResult[0] || { total: 0, pending: 0, reviewed: 0, shortlisted: 0, rejected: 0, hired: 0 };

    // Get recent applications
    const recentApplications = await Application.find({ job: { $in: recruiterJobIds } })
        .populate('job', 'title')
        .populate('applicant', 'firstName lastName email')
        .sort({ appliedAt: -1 })
        .limit(10);

    // Get active jobs
    const activeJobs = await Job.find({ postedBy: userId })
        .sort({ createdAt: -1 })
        .limit(10);

    // Get upcoming interviews
    const upcomingInterviews = await Interview.find({ recruiterId: userId, status: 'scheduled' })
        .populate('jobId', 'title')
        .populate('candidateId', 'firstName lastName')
        .sort({ scheduledDate: 1 })
        .limit(5);

    // Get company analytics (last 30 days)
    const thirtyDaysAgo = subDays(new Date(), 30);
    const companyAnalytics = company ? await CompanyAnalytic.find({
        companyId: company._id,
        date: { $gte: thirtyDaysAgo }
    }).sort({ date: 1 }) : [];

    const transformedRecentApplications = recentApplications.map(app => ({
        id: app._id,
        status: app.status,
        appliedAt: app.appliedAt,
        jobTitle: app.job.title,
        applicantName: `${app.applicant.firstName} ${app.applicant.lastName}`,
        applicantEmail: app.applicant.email,
        resumeUrl: app.resume // Assuming resume is a field in Application model
    }));
    
    const transformedUpcomingInterviews = upcomingInterviews.map(interview => ({
        id: interview._id,
        title: interview.title,
        scheduledAt: interview.scheduledDate,
        duration: interview.duration,
        type: interview.type,
        jobTitle: interview.jobId.title,
        applicantName: `${interview.candidateId.firstName} ${interview.candidateId.lastName}`
    }));

    res.json({
      user: {
        id: user._id,
        fullName: `${user.firstName} ${user.lastName}`,
        email: user.email,
        phone: user.phone,
        location: user.location,
        companyName: user.companyInfo?.companyName,
        position: user.companyInfo?.designation,
        linkedinUrl: user.linkedin_url
      },
      company: company,
      stats: {
        jobs: jobStats,
        applications: applicationStats,
        interviews: upcomingInterviews.length
      },
      recentApplications: transformedRecentApplications,
      activeJobs,
      upcomingInterviews: transformedUpcomingInterviews,
      analytics: companyAnalytics
    });

  } catch (error) {
    console.error('Error fetching recruiter dashboard:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get admin dashboard data
export const getAdminDashboard = async (req, res) => {
  try {
    // Get overall system statistics
    const userStatsResult = await BaseUser.aggregate([
        {
            $group: {
                _id: null,
                total: { $sum: 1 },
                jobseekers: { $sum: { $cond: [{ $eq: ['$role', 'jobseeker'] }, 1, 0] } },
                employers: { $sum: { $cond: [{ $eq: ['$role', 'employer'] }, 1, 0] } },
                active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
                inactive: { $sum: { $cond: [{ $eq: ['$status', 'inactive'] }, 1, 0] } }
            }
        }
    ]);
    const userStats = userStatsResult[0] || { total: 0, jobseekers: 0, employers: 0, active: 0, inactive: 0 };

    const jobStatsResult = await Job.aggregate([
        {
            $group: {
                _id: null,
                total: { $sum: 1 },
                active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
                closed: { $sum: { $cond: [{ $eq: ['$status', 'closed'] }, 1, 0] } },
                draft: { $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] } }
            }
        }
    ]);
    const jobStats = jobStatsResult[0] || { total: 0, active: 0, closed: 0, draft: 0 };

    const applicationStatsResult = await Application.aggregate([
        {
            $group: {
                _id: null,
                total: { $sum: 1 },
                pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
                hired: { $sum: { $cond: [{ $eq: ['$status', 'hired'] }, 1, 0] } }
            }
        }
    ]);
    const applicationStats = applicationStatsResult[0] || { total: 0, pending: 0, hired: 0 };

    const companyStatsResult = await Company.aggregate([
        {
            $group: {
                _id: null,
                total: { $sum: 1 },
                verified: { $sum: { $cond: [{ $eq: ['$verified', true] }, 1, 0] } }
            }
        }
    ]);
    const companyStats = companyStatsResult[0] || { total: 0, verified: 0 };

    // Get recent users
    const recentUsers = await BaseUser.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .select('firstName lastName email role status createdAt');

    // Get recent jobs
    const recentJobs = await Job.find()
        .populate('companyId', 'name')
        .sort({ createdAt: -1 })
        .limit(10);

    // Get system activity logs
    const recentActivity = await UserActivityLog.find()
        .populate('userId', 'firstName lastName')
        .sort({ createdAt: -1 })
        .limit(20);

    const transformedRecentUsers = recentUsers.map(user => ({
        id: user._id,
        fullName: `${user.firstName} ${user.lastName}`,
        email: user.email,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt
    }));

    const transformedRecentJobs = recentJobs.map(job => ({
        id: job._id,
        title: job.title,
        companyName: job.companyId.name,
        location: job.location,
        status: job.status,
        applicationsCount: job.applicationsCount,
        createdAt: job.createdAt
    }));

    const transformedRecentActivity = recentActivity.map(activity => ({
        id: activity._id,
        action: activity.action,
        userName: activity.userId ? `${activity.userId.firstName} ${activity.userId.lastName}` : 'System',
        createdAt: activity.createdAt
    }));

    res.json({
      stats: {
        users: userStats,
        jobs: jobStats,
        applications: applicationStats,
        companies: companyStats
      },
      recentUsers: transformedRecentUsers,
      recentJobs: transformedRecentJobs,
      recentActivity: transformedRecentActivity
    });

  } catch (error) {
    console.error('Error fetching admin dashboard:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Helper function to calculate profile completion percentage
const calculateProfileCompletion = (user) => {
  const fields = [
    user.firstName,
    user.email,
    user.phone,
    user.location,
    user.bio,
    user.skills,
    user.education,
    user.documents?.resumeUrl,
    user.linkedin_url
  ];
  
  let completedFields = 0;
  fields.forEach(field => {
    if (field && (typeof field === 'string' ? field.trim() !== '' : true)) {
      completedFields++;
    }
  });
  
  return Math.round((completedFields / fields.length) * 100);
};

// Update user preferences
export const updateUserPreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const preferences = req.body;

    await NotificationSetting.findOneAndUpdate(
        { userId: userId },
        preferences,
        { upsert: true, new: true, runValidators: true }
    );

    res.json({ message: 'Preferences updated successfully' });

  } catch (error) {
    console.error('Error updating user preferences:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get user preferences
export const getUserPreferences = async (req, res) => {
  try {
    const userId = req.user.id;

    const preferences = await NotificationSetting.findOne({ userId: userId });

    if (!preferences) {
      // Return default preferences
      return res.json({
        theme: 'light',
        fontSize: 'medium',
        language: 'en',
        emailNotifications: true,
        pushNotifications: true,
        jobAlerts: true,
        dashboardLayout: 'grid',
        timezone: 'Asia/Kolkata'
      });
    }

    res.json(preferences);

  } catch (error) {
    console.error('Error fetching user preferences:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
