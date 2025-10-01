import { JobAnalytics, UserAnalytics } from '../../models/enhanced/Analytics.js';

// Middleware to track job views
export const trackJobView = async (req, res, next) => {
  try {
    const jobId = req.params.id;
    const userId = req.user?.userId;
    
    if (jobId && jobId.match(/^[0-9a-fA-F]{24}$/)) {
      // Track job view asynchronously
      setImmediate(async () => {
        try {
          let jobAnalytics = await JobAnalytics.findOne({ jobId });
          
          if (!jobAnalytics) {
            // Create analytics record if it doesn't exist
            jobAnalytics = new JobAnalytics({
              jobId,
              recruiterId: null // Will be populated when job is fetched
            });
          }

          // Increment view count
          jobAnalytics.views.total += 1;
          jobAnalytics.views.today += 1;
          jobAnalytics.views.thisWeek += 1;
          jobAnalytics.views.thisMonth += 1;

          // Track unique views (simplified - in production, use more sophisticated tracking)
          if (userId) {
            jobAnalytics.views.unique += 1;
          }

          // Track device type
          const userAgent = req.headers['user-agent'] || '';
          if (userAgent.includes('Mobile')) {
            jobAnalytics.deviceStats.mobile += 1;
          } else if (userAgent.includes('Tablet')) {
            jobAnalytics.deviceStats.tablet += 1;
          } else {
            jobAnalytics.deviceStats.desktop += 1;
          }

          // Track traffic source
          const referer = req.headers['referer'] || req.headers['referrer'] || '';
          let source = 'direct';
          
          if (referer.includes('google.com')) source = 'search';
          else if (referer.includes('facebook.com') || referer.includes('twitter.com') || referer.includes('linkedin.com')) source = 'social';
          else if (referer && !referer.includes(req.headers.host)) source = 'referral';

          const sourceIndex = jobAnalytics.trafficSources.findIndex(s => s.source === source);
          if (sourceIndex >= 0) {
            jobAnalytics.trafficSources[sourceIndex].views += 1;
          } else {
            jobAnalytics.trafficSources.push({ source, views: 1, applications: 0 });
          }

          await jobAnalytics.save();
        } catch (error) {
          console.error('Error tracking job view:', error);
        }
      });
    }

    next();
  } catch (error) {
    // Don't fail the request if analytics tracking fails
    console.error('Analytics middleware error:', error);
    next();
  }
};

// Middleware to track profile views
export const trackProfileView = async (req, res, next) => {
  try {
    const profileUserId = req.params.userId || req.params.id;
    const viewerId = req.user?.userId;
    
    // Don't track self-views
    if (profileUserId && viewerId && profileUserId !== viewerId && profileUserId.match(/^[0-9a-fA-F]{24}$/)) {
      // Track profile view asynchronously
      setImmediate(async () => {
        try {
          let userAnalytics = await UserAnalytics.findOne({ userId: profileUserId });
          
          if (!userAnalytics) {
            // Create analytics record if it doesn't exist
            userAnalytics = new UserAnalytics({
              userId: profileUserId,
              userRole: 'applicant' // Will be updated when user is fetched
            });
          }

          // Increment profile view count
          userAnalytics.profileViews.total += 1;
          userAnalytics.profileViews.today += 1;
          userAnalytics.profileViews.thisWeek += 1;
          userAnalytics.profileViews.thisMonth += 1;

          await userAnalytics.save();
        } catch (error) {
          console.error('Error tracking profile view:', error);
        }
      });
    }

    next();
  } catch (error) {
    // Don't fail the request if analytics tracking fails
    console.error('Profile analytics middleware error:', error);
    next();
  }
};

// Middleware to track application submissions
export const trackApplicationSubmission = async (req, res, next) => {
  try {
    const jobId = req.body.jobId;
    const applicantId = req.user?.userId;
    
    if (jobId && applicantId) {
      // Track application submission asynchronously
      setImmediate(async () => {
        try {
          // Update job analytics
          const jobAnalytics = await JobAnalytics.findOne({ jobId });
          if (jobAnalytics) {
            jobAnalytics.applications.total += 1;
            jobAnalytics.applications.thisMonth += 1;
            jobAnalytics.applications.thisWeek += 1;
            jobAnalytics.applications.conversionRate = 
              (jobAnalytics.applications.total / jobAnalytics.views.total) * 100;

            // Update traffic source applications
            const referer = req.headers['referer'] || req.headers['referrer'] || '';
            let source = 'direct';
            
            if (referer.includes('google.com')) source = 'search';
            else if (referer.includes('facebook.com') || referer.includes('twitter.com') || referer.includes('linkedin.com')) source = 'social';
            else if (referer && !referer.includes(req.headers.host)) source = 'referral';

            const sourceIndex = jobAnalytics.trafficSources.findIndex(s => s.source === source);
            if (sourceIndex >= 0) {
              jobAnalytics.trafficSources[sourceIndex].applications += 1;
            }

            await jobAnalytics.save();
          }

          // Update user analytics
          const userAnalytics = await UserAnalytics.findOne({ userId: applicantId });
          if (userAnalytics) {
            userAnalytics.applicantMetrics.applicationsSubmitted.total += 1;
            userAnalytics.applicantMetrics.applicationsSubmitted.thisMonth += 1;
            userAnalytics.applicantMetrics.applicationsSubmitted.thisWeek += 1;
            userAnalytics.applicantMetrics.applicationStatus.pending += 1;

            await userAnalytics.save();
          }
        } catch (error) {
          console.error('Error tracking application submission:', error);
        }
      });
    }

    next();
  } catch (error) {
    // Don't fail the request if analytics tracking fails
    console.error('Application analytics middleware error:', error);
    next();
  }
};

// Middleware to track search queries
export const trackSearch = async (req, res, next) => {
  try {
    const searchQuery = req.query.search || req.query.q;
    const userId = req.user?.userId;
    
    if (searchQuery && userId) {
      // Track search asynchronously
      setImmediate(async () => {
        try {
          const userAnalytics = await UserAnalytics.findOne({ userId });
          if (userAnalytics) {
            userAnalytics.applicantMetrics.searchesPerformed += 1;
            await userAnalytics.save();
          }
        } catch (error) {
          console.error('Error tracking search:', error);
        }
      });
    }

    next();
  } catch (error) {
    // Don't fail the request if analytics tracking fails
    console.error('Search analytics middleware error:', error);
    next();
  }
};

// Middleware to track user activity
export const trackActivity = (activityType) => {
  return async (req, res, next) => {
    try {
      const userId = req.user?.userId;
      
      if (userId) {
        // Track activity asynchronously
        setImmediate(async () => {
          try {
            const userAnalytics = await UserAnalytics.findOne({ userId });
            if (userAnalytics) {
              // Update last activity timestamp
              userAnalytics.lastLoginDate = new Date();
              
              // Track specific activities
              switch (activityType) {
                case 'job_view':
                  userAnalytics.applicantMetrics.jobsViewed.total += 1;
                  userAnalytics.applicantMetrics.jobsViewed.thisMonth += 1;
                  break;
                case 'job_save':
                  userAnalytics.applicantMetrics.jobsSaved += 1;
                  break;
                case 'resume_download':
                  userAnalytics.applicantMetrics.resumeDownloads += 1;
                  break;
                case 'skill_assessment':
                  userAnalytics.applicantMetrics.skillAssessmentsTaken += 1;
                  break;
                case 'interview_attended':
                  userAnalytics.applicantMetrics.interviewsAttended += 1;
                  break;
              }

              await userAnalytics.save();
            }
          } catch (error) {
            console.error(`Error tracking ${activityType} activity:`, error);
          }
        });
      }

      next();
    } catch (error) {
      // Don't fail the request if analytics tracking fails
      console.error('Activity analytics middleware error:', error);
      next();
    }
  };
};

// Middleware to calculate and update profile completion
export const updateProfileCompletion = async (req, res, next) => {
  try {
    const userId = req.user?.userId;
    const userRole = req.user?.role;
    
    if (userId && userRole) {
      // Update profile completion asynchronously
      setImmediate(async () => {
        try {
          const user = await BaseUser.findById(userId);
          if (user) {
            const completionPercentage = calculateProfileCompletion(user, userRole);
            
            const userAnalytics = await UserAnalytics.findOne({ userId });
            if (userAnalytics) {
              userAnalytics.profileCompleteness = completionPercentage;
              await userAnalytics.save();
            }

            // Also update the user record
            user.profileCompleteness = completionPercentage;
            await user.save();
          }
        } catch (error) {
          console.error('Error updating profile completion:', error);
        }
      });
    }

    next();
  } catch (error) {
    // Don't fail the request if analytics tracking fails
    console.error('Profile completion middleware error:', error);
    next();
  }
};

// Helper function to calculate profile completion percentage
const calculateProfileCompletion = (user, role) => {
  let completedFields = 0;
  let totalFields = 0;

  // Common fields for all users
  const commonFields = ['firstName', 'lastName', 'email', 'phone'];
  commonFields.forEach(field => {
    totalFields++;
    if (user[field]) completedFields++;
  });

  if (role === 'applicant') {
    // Applicant-specific fields
    const applicantFields = [
      'bio', 'currentLocation', 'skills', 'education', 
      'workExperience', 'resume', 'jobPreferences'
    ];
    
    applicantFields.forEach(field => {
      totalFields++;
      if (user[field] && 
          (Array.isArray(user[field]) ? user[field].length > 0 : true)) {
        completedFields++;
      }
    });
  } else if (role === 'recruiter') {
    // Recruiter-specific fields
    const recruiterFields = [
      'bio', 'companyName', 'companyInfo', 'yearsOfExperience', 
      'officeLocation', 'professionalLinks'
    ];
    
    recruiterFields.forEach(field => {
      totalFields++;
      if (user[field] && 
          (typeof user[field] === 'object' ? Object.keys(user[field]).length > 0 : true)) {
        completedFields++;
      }
    });
  }

  return Math.round((completedFields / totalFields) * 100);
};

export default {
  trackJobView,
  trackProfileView,
  trackApplicationSubmission,
  trackSearch,
  trackActivity,
  updateProfileCompletion
};
