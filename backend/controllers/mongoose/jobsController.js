/**
 * Jobs Controller
 * 
 * Handles job posting, searching, applications, and job-related operations
 * using Mongoose models and comprehensive job schemas.
 * 
 * @author FinAutoJobs Team
 * @version 1.0.0
 */

import { 
  getJobModel, 
  searchJobs, 
  getJobRecommendations,
  getApplicationStats,
  jobAnalytics 
} from '../../models/schemas/jobs/JobFactory.js';
import { trackActivity } from '../../models/schemas/activities/ActivityFactory.js';
import { notificationManager } from '../../models/schemas/system/SystemFactory.js';

// Get all jobs with filtering and pagination
export const getJobs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      keywords,
      location,
      employmentType,
      experienceLevel,
      salaryMin,
      salaryMax,
      skills,
      company,
      industry,
      sortBy = 'publishedAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filters
    const filters = {};
    
    if (keywords) filters.keywords = keywords;
    if (location) filters.location = { city: location };
    if (employmentType) filters.employmentType = employmentType.split(',');
    if (experienceLevel) filters.experienceLevel = experienceLevel.split(',');
    if (salaryMin || salaryMax) {
      filters.salary = {};
      if (salaryMin) filters.salary.min = parseInt(salaryMin);
      if (salaryMax) filters.salary.max = parseInt(salaryMax);
    }
    if (skills) filters.skills = skills.split(',');
    if (company) filters.company = company;
    if (industry) filters.industry = industry;

    // Build options
    const options = {
      limit: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit),
      sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 }
    };

    const result = await searchJobs(filters, options);

    // Track search activity if user is authenticated
    if (req.user) {
      await trackActivity({
        user: {
          userId: req.user.userId,
          role: req.user.userRole,
          email: req.user.email
        },
        activity: {
          type: 'job_search',
          category: 'search',
          action: 'Job search performed',
          description: `Searched for jobs with filters: ${JSON.stringify(filters)}`
        },
        context: {
          searchContext: {
            query: keywords || '',
            filters,
            results: {
              count: result.jobs.length,
              totalPages: Math.ceil(result.totalCount / parseInt(limit)),
              page: parseInt(page)
            }
          }
        }
      });
    }

    res.json({
      success: true,
      data: {
        jobs: result.jobs,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(result.totalCount / parseInt(limit)),
          totalCount: result.totalCount,
          hasMore: result.hasMore
        },
        filters: result.filters
      }
    });

  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching jobs'
    });
  }
};

// Get job by ID
export const getJobById = async (req, res) => {
  try {
    const { jobId } = req.params;
    
    const JobModel = getJobModel('job');
    const job = await JobModel.findById(jobId)
      .populate('company.companyId', 'name logo website industry')
      .populate('postedBy.recruiterId', 'firstName lastName email');

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Increment view count
    job.analytics.views += 1;
    job.analytics.lastViewed = new Date();
    await job.save();

    // Track job view activity if user is authenticated
    if (req.user) {
      await trackActivity({
        user: {
          userId: req.user.userId,
          role: req.user.userRole,
          email: req.user.email
        },
        activity: {
          type: 'job_view',
          category: 'engagement',
          action: 'Job viewed',
          description: `Viewed job: ${job.title}`
        },
        context: {
          resource: {
            type: 'job',
            id: job._id.toString(),
            title: job.title,
            url: `/jobs/${job._id}`
          }
        }
      });
    }

    res.json({
      success: true,
      data: {
        job: job.toObject()
      }
    });

  } catch (error) {
    console.error('Get job by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching job'
    });
  }
};

// Create new job (Recruiter only)
export const createJob = async (req, res) => {
  try {
    const { userId, userRole } = req.user;

    if (userRole !== 'recruiter' && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only recruiters and admins can create jobs'
      });
    }

    const jobData = {
      ...req.body,
      postedBy: {
        recruiterId: userId,
        role: userRole
      },
      status: 'active',
      publishedAt: new Date()
    };

    const JobModel = getJobModel('job');
    const job = new JobModel(jobData);
    await job.save();

    // Track job creation activity
    await trackActivity({
      user: {
        userId,
        role: userRole,
        email: req.user.email
      },
      activity: {
        type: 'job_post',
        category: 'job',
        action: 'Job posted',
        description: `Posted new job: ${job.title}`
      },
      context: {
        resource: {
          type: 'job',
          id: job._id.toString(),
          title: job.title
        }
      },
      conversion: {
        isConversion: true,
        conversionType: 'job_posting'
      }
    });

    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      data: {
        job: job.toObject()
      }
    });

  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while creating job'
    });
  }
};

// Update job (Recruiter only)
export const updateJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { userId, userRole } = req.user;

    const JobModel = getJobModel('job');
    const job = await JobModel.findById(jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if user can update this job
    if (userRole !== 'admin' && job.postedBy.recruiterId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own jobs'
      });
    }

    // Update job
    const updateData = {
      ...req.body,
      lastModifiedAt: new Date()
    };

    const updatedJob = await JobModel.findByIdAndUpdate(
      jobId,
      updateData,
      { new: true, runValidators: true }
    );

    // Track job update activity
    await trackActivity({
      user: {
        userId,
        role: userRole,
        email: req.user.email
      },
      activity: {
        type: 'job_edit',
        category: 'job',
        action: 'Job updated',
        description: `Updated job: ${updatedJob.title}`
      },
      context: {
        resource: {
          type: 'job',
          id: updatedJob._id.toString(),
          title: updatedJob.title
        },
        changes: {
          fields: Object.keys(req.body)
        }
      }
    });

    res.json({
      success: true,
      message: 'Job updated successfully',
      data: {
        job: updatedJob.toObject()
      }
    });

  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while updating job'
    });
  }
};

// Delete job (Recruiter only)
export const deleteJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { userId, userRole } = req.user;

    const JobModel = getJobModel('job');
    const job = await JobModel.findById(jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if user can delete this job
    if (userRole !== 'admin' && job.postedBy.recruiterId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own jobs'
      });
    }

    // Soft delete by updating status
    job.status = 'deleted';
    job.lastModifiedAt = new Date();
    await job.save();

    // Track job deletion activity
    await trackActivity({
      user: {
        userId,
        role: userRole,
        email: req.user.email
      },
      activity: {
        type: 'job_delete',
        category: 'job',
        action: 'Job deleted',
        description: `Deleted job: ${job.title}`
      },
      context: {
        resource: {
          type: 'job',
          id: job._id.toString(),
          title: job.title
        }
      }
    });

    res.json({
      success: true,
      message: 'Job deleted successfully'
    });

  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while deleting job'
    });
  }
};

// Apply to job (Applicant only)
export const applyToJob = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { userId, userRole } = req.user;

    if (userRole !== 'applicant') {
      return res.status(403).json({
        success: false,
        message: 'Only applicants can apply to jobs'
      });
    }

    const JobModel = getJobModel('job');
    const ApplicationModel = getJobModel('application');

    // Check if job exists and is active
    const job = await JobModel.findById(jobId);
    if (!job || job.status !== 'active') {
      return res.status(404).json({
        success: false,
        message: 'Job not found or not available'
      });
    }

    // Check if already applied
    const existingApplication = await ApplicationModel.findOne({
      'job.jobId': jobId,
      'applicant.applicantId': userId
    });

    if (existingApplication) {
      return res.status(409).json({
        success: false,
        message: 'You have already applied to this job'
      });
    }

    // Create application
    const applicationData = {
      job: {
        jobId: job._id,
        title: job.title,
        company: job.company.name,
        companyId: job.company.companyId
      },
      applicant: {
        applicantId: userId,
        name: `${req.user.firstName} ${req.user.lastName}`,
        email: req.user.email
      },
      recruiter: {
        recruiterId: job.postedBy.recruiterId
      },
      status: 'submitted',
      submittedAt: new Date(),
      ...req.body
    };

    const application = new ApplicationModel(applicationData);
    await application.save();

    // Update job application stats
    job.applicationStats.totalApplications += 1;
    job.applicationStats.lastApplicationDate = new Date();
    await job.save();

    // Track application activity
    await trackActivity({
      user: {
        userId,
        role: userRole,
        email: req.user.email
      },
      activity: {
        type: 'job_apply',
        category: 'application',
        action: 'Applied to job',
        description: `Applied to job: ${job.title}`
      },
      context: {
        resource: {
          type: 'job',
          id: job._id.toString(),
          title: job.title
        }
      },
      conversion: {
        isConversion: true,
        conversionType: 'job_application'
      }
    });

    // Send notification to recruiter
    await notificationManager.send({
      recipient: {
        userId: job.postedBy.recruiterId,
        role: 'recruiter'
      },
      content: {
        type: 'application_received',
        category: 'application',
        priority: 'medium',
        title: 'New Job Application',
        message: `${req.user.firstName} ${req.user.lastName} has applied to your job: ${job.title}`,
        actionText: 'View Application',
        actionUrl: `/applications/${application._id}`
      },
      context: {
        resourceType: 'application',
        resourceId: application._id.toString()
      }
    });

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: {
        application: application.toObject()
      }
    });

  } catch (error) {
    console.error('Apply to job error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while applying to job'
    });
  }
};

// Get job recommendations (Applicant only)
export const getRecommendations = async (req, res) => {
  try {
    const { userId, userRole } = req.user;
    const { limit = 10 } = req.query;

    if (userRole !== 'applicant') {
      return res.status(403).json({
        success: false,
        message: 'Job recommendations are only available for applicants'
      });
    }

    const recommendations = await getJobRecommendations(userId, userRole, parseInt(limit));

    // Track recommendation view activity
    await trackActivity({
      user: {
        userId,
        role: userRole,
        email: req.user.email
      },
      activity: {
        type: 'job_recommendation',
        category: 'engagement',
        action: 'Viewed job recommendations',
        description: `Viewed ${recommendations.length} job recommendations`
      }
    });

    res.json({
      success: true,
      data: {
        recommendations,
        count: recommendations.length
      }
    });

  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching recommendations'
    });
  }
};

// Get job analytics (Recruiter/Admin only)
export const getJobAnalytics = async (req, res) => {
  try {
    const { jobId } = req.params;
    const { userId, userRole } = req.user;

    if (userRole !== 'recruiter' && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only recruiters and admins can view job analytics'
      });
    }

    const JobModel = getJobModel('job');
    const job = await JobModel.findById(jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if user can view analytics for this job
    if (userRole !== 'admin' && job.postedBy.recruiterId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only view analytics for your own jobs'
      });
    }

    // Get application statistics
    const applicationStats = await getApplicationStats({ jobId });

    // Get trending data
    const trendingJobs = await jobAnalytics.getTrendingJobs(7, 5);
    const isJobTrending = trendingJobs.some(tJob => tJob._id.toString() === jobId);

    res.json({
      success: true,
      data: {
        job: {
          id: job._id,
          title: job.title,
          status: job.status,
          publishedAt: job.publishedAt,
          expiresAt: job.expiresAt
        },
        analytics: job.analytics,
        applicationStats: job.applicationStats,
        detailedStats: applicationStats,
        trending: {
          isTrending: isJobTrending,
          rank: isJobTrending ? trendingJobs.findIndex(tJob => tJob._id.toString() === jobId) + 1 : null
        }
      }
    });

  } catch (error) {
    console.error('Get job analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching job analytics'
    });
  }
};

// Get trending jobs
export const getTrendingJobs = async (req, res) => {
  try {
    const { days = 7, limit = 10 } = req.query;

    const trendingJobs = await jobAnalytics.getTrendingJobs(parseInt(days), parseInt(limit));

    res.json({
      success: true,
      data: {
        trendingJobs,
        period: `${days} days`,
        count: trendingJobs.length
      }
    });

  } catch (error) {
    console.error('Get trending jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching trending jobs'
    });
  }
};

export default {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  applyToJob,
  getRecommendations,
  getJobAnalytics,
  getTrendingJobs
};
