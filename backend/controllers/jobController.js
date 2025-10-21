import { validationResult } from 'express-validator';
import Job from '../models/Job.js';
import User from '../models/User.js';
import Application from '../models/Application.js';
import { logActivity } from '../services/activityLogger.js';
import { sendNotification } from '../services/notificationService.js';
import { calculateJobMatchScore } from '../services/matchingService.js';
import { generateJobRecommendations } from '../services/recommendationService.js';

// Enhanced error handling utility
const handleError = (res, error, statusCode = 500) => {
  console.error('Job Controller Error:', error);
  
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: Object.values(error.errors).map(err => err.message)
    });
  }
  
  if (error.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format'
    });
  }
  
  return res.status(statusCode).json({
    success: false,
    message: error.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
};

// @desc    Get all jobs with advanced filtering and pagination
// @route   GET /api/jobs
// @access  Public
export const getJobs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      location,
      jobType,
      experienceLevel,
      salaryMin,
      salaryMax,
      industry,
      company,
      remote,
      skills,
      postedWithin,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter object
    const filter = { status: 'active' };

    // Text search across multiple fields
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'company.name': { $regex: search, $options: 'i' } },
        { skills: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Location filter
    if (location) {
      filter.$or = filter.$or || [];
      filter.$or.push(
        { 'location.city': { $regex: location, $options: 'i' } },
        { 'location.state': { $regex: location, $options: 'i' } },
        { 'location.country': { $regex: location, $options: 'i' } }
      );
    }

    // Job type filter
    if (jobType) {
      filter.jobType = { $in: Array.isArray(jobType) ? jobType : [jobType] };
    }

    // Experience level filter
    if (experienceLevel) {
      filter.experienceLevel = { $in: Array.isArray(experienceLevel) ? experienceLevel : [experienceLevel] };
    }

    // Salary range filter
    if (salaryMin || salaryMax) {
      filter['salary.min'] = {};
      if (salaryMin) filter['salary.min'].$gte = parseInt(salaryMin);
      if (salaryMax) filter['salary.max'] = { $lte: parseInt(salaryMax) };
    }

    // Industry filter
    if (industry) {
      filter.industry = { $in: Array.isArray(industry) ? industry : [industry] };
    }

    // Company filter
    if (company) {
      filter['company.name'] = { $regex: company, $options: 'i' };
    }

    // Remote work filter
    if (remote !== undefined) {
      filter.isRemote = remote === 'true';
    }

    // Skills filter
    if (skills) {
      const skillsArray = Array.isArray(skills) ? skills : skills.split(',');
      filter.skills = { $in: skillsArray.map(skill => new RegExp(skill.trim(), 'i')) };
    }

    // Posted within filter
    if (postedWithin) {
      const days = parseInt(postedWithin);
      const dateThreshold = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      filter.createdAt = { $gte: dateThreshold };
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Execute query with population
    const jobs = await Job.find(filter)
      .populate('postedBy', 'firstName lastName company.name company.logo')
      .sort(sort)
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Get total count for pagination
    const totalJobs = await Job.countDocuments(filter);
    const totalPages = Math.ceil(totalJobs / limitNum);

    // Calculate match scores if user is authenticated
    let jobsWithScores = jobs;
    if (req.user && req.user.role === 'applicant') {
      const userProfile = await User.findById(req.user.id).select('profile skills experience');
      jobsWithScores = await Promise.all(
        jobs.map(async (job) => {
          const matchScore = await calculateJobMatchScore(userProfile, job);
          return { ...job, matchScore };
        })
      );
    }

    // Add application status if user is authenticated
    if (req.user) {
      const userApplications = await Application.find({
        applicant: req.user.id,
        job: { $in: jobs.map(job => job._id) }
      }).select('job status');

      const applicationMap = userApplications.reduce((acc, app) => {
        acc[app.job.toString()] = app.status;
        return acc;
      }, {});

      jobsWithScores = jobsWithScores.map(job => ({
        ...job,
        applicationStatus: applicationMap[job._id.toString()] || null
      }));
    }

    res.json({
      success: true,
      data: {
        jobs: jobsWithScores,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalJobs,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1,
          limit: limitNum
        },
        filters: {
          search,
          location,
          jobType,
          experienceLevel,
          salaryRange: { min: salaryMin, max: salaryMax },
          industry,
          company,
          remote,
          skills,
          postedWithin
        }
      }
    });

  } catch (error) {
    handleError(res, error);
  }
};

// @desc    Get single job by ID
// @route   GET /api/jobs/:id
// @access  Public
export const getJobById = async (req, res) => {
  try {
    const { id } = req.params;

    const job = await Job.findById(id)
      .populate('postedBy', 'firstName lastName company.name company.logo company.description')
      .populate({
        path: 'applications',
        select: 'applicant status createdAt',
        populate: {
          path: 'applicant',
          select: 'firstName lastName profile.avatar'
        }
      });

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Increment view count
    job.views = (job.views || 0) + 1;
    job.lastViewed = new Date();
    await job.save();

    // Calculate match score if user is authenticated applicant
    let matchScore = null;
    if (req.user && req.user.role === 'applicant') {
      const userProfile = await User.findById(req.user.id).select('profile skills experience');
      matchScore = await calculateJobMatchScore(userProfile, job);
    }

    // Check if user has applied
    let applicationStatus = null;
    if (req.user) {
      const application = await Application.findOne({
        applicant: req.user.id,
        job: job._id
      }).select('status');
      applicationStatus = application?.status || null;
    }

    // Get similar jobs
    const similarJobs = await Job.find({
      _id: { $ne: job._id },
      $or: [
        { skills: { $in: job.skills } },
        { industry: job.industry },
        { jobType: job.jobType }
      ],
      status: 'active'
    })
    .limit(5)
    .select('title company location salary jobType createdAt')
    .populate('postedBy', 'company.name company.logo');

    // Log activity if user is authenticated
    if (req.user) {
      await logActivity({
        userId: req.user.id,
        action: 'JOB_VIEWED',
        details: { jobId: job._id, jobTitle: job.title },
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      });
    }

    res.json({
      success: true,
      data: {
        job: {
          ...job.toObject(),
          matchScore,
          applicationStatus
        },
        similarJobs
      }
    });

  } catch (error) {
    handleError(res, error);
  }
};

// @desc    Create new job posting
// @route   POST /api/jobs
// @access  Private (Recruiter only)
export const createJob = async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Verify user is recruiter
    if (req.user.role !== 'recruiter') {
      return res.status(403).json({
        success: false,
        message: 'Only recruiters can post jobs'
      });
    }

    const jobData = {
      ...req.body,
      postedBy: req.user.id,
      company: {
        name: req.user.company?.name || req.body.company?.name,
        logo: req.user.company?.logo || req.body.company?.logo,
        description: req.user.company?.description || req.body.company?.description
      },
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Validate required fields
    const requiredFields = ['title', 'description', 'location', 'jobType', 'experienceLevel'];
    const missingFields = requiredFields.filter(field => !jobData[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        missingFields
      });
    }

    const job = new Job(jobData);
    await job.save();

    // Populate the created job
    await job.populate('postedBy', 'firstName lastName company.name company.logo');

    // Generate recommendations for matching candidates
    if (job.status === 'active') {
      setTimeout(async () => {
        try {
          await generateJobRecommendations(job._id);
        } catch (error) {
          console.error('Error generating job recommendations:', error);
        }
      }, 1000);
    }

    // Log activity
    await logActivity({
      userId: req.user.id,
      action: 'JOB_CREATED',
      details: { jobId: job._id, jobTitle: job.title },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.status(201).json({
      success: true,
      message: 'Job posted successfully',
      data: { job }
    });

  } catch (error) {
    handleError(res, error);
  }
};

// @desc    Update job posting
// @route   PUT /api/jobs/:id
// @access  Private (Recruiter - own jobs only)
export const updateJob = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const job = await Job.findById(id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check ownership or admin privileges
    if (job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this job'
      });
    }

    // Update job data
    const updateData = {
      ...req.body,
      updatedAt: new Date()
    };

    // Remove fields that shouldn't be updated directly
    delete updateData.postedBy;
    delete updateData.createdAt;
    delete updateData.applications;
    delete updateData.views;

    const updatedJob = await Job.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('postedBy', 'firstName lastName company.name company.logo');

    // Log activity
    await logActivity({
      userId: req.user.id,
      action: 'JOB_UPDATED',
      details: { jobId: job._id, jobTitle: job.title },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Job updated successfully',
      data: { job: updatedJob }
    });

  } catch (error) {
    handleError(res, error);
  }
};

// @desc    Delete job posting
// @route   DELETE /api/jobs/:id
// @access  Private (Recruiter - own jobs only)
export const deleteJob = async (req, res) => {
  try {
    const { id } = req.params;
    const job = await Job.findById(id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check ownership or admin privileges
    if (job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this job'
      });
    }

    // Soft delete - change status to 'deleted'
    job.status = 'deleted';
    job.deletedAt = new Date();
    await job.save();

    // Notify applicants about job deletion
    const applications = await Application.find({ job: job._id, status: { $in: ['pending', 'reviewing'] } });
    
    for (const application of applications) {
      await sendNotification({
        userId: application.applicant,
        type: 'job_deleted',
        title: 'Job Posting Removed',
        message: `The job "${job.title}" you applied for has been removed by the employer.`,
        data: { jobId: job._id, jobTitle: job.title }
      });
      
      // Update application status
      application.status = 'job_deleted';
      await application.save();
    }

    // Log activity
    await logActivity({
      userId: req.user.id,
      action: 'JOB_DELETED',
      details: { jobId: job._id, jobTitle: job.title },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: 'Job deleted successfully'
    });

  } catch (error) {
    handleError(res, error);
  }
};

// @desc    Get jobs posted by current recruiter
// @route   GET /api/jobs/my-jobs
// @access  Private (Recruiter only)
export const getMyJobs = async (req, res) => {
  try {
    if (req.user.role !== 'recruiter') {
      return res.status(403).json({
        success: false,
        message: 'Only recruiters can access this endpoint'
      });
    }

    const {
      page = 1,
      limit = 10,
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filter
    const filter = { postedBy: req.user.id };
    if (status) {
      filter.status = status;
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Get jobs with application counts
    const jobs = await Job.aggregate([
      { $match: filter },
      {
        $lookup: {
          from: 'applications',
          localField: '_id',
          foreignField: 'job',
          as: 'applications'
        }
      },
      {
        $addFields: {
          totalApplications: { $size: '$applications' },
          pendingApplications: {
            $size: {
              $filter: {
                input: '$applications',
                cond: { $eq: ['$$this.status', 'pending'] }
              }
            }
          },
          shortlistedApplications: {
            $size: {
              $filter: {
                input: '$applications',
                cond: { $eq: ['$$this.status', 'shortlisted'] }
              }
            }
          }
        }
      },
      { $sort: sort },
      { $skip: skip },
      { $limit: limitNum }
    ]);

    // Get total count
    const totalJobs = await Job.countDocuments(filter);
    const totalPages = Math.ceil(totalJobs / limitNum);

    res.json({
      success: true,
      data: {
        jobs,
        pagination: {
          currentPage: pageNum,
          totalPages,
          totalJobs,
          hasNextPage: pageNum < totalPages,
          hasPrevPage: pageNum > 1,
          limit: limitNum
        }
      }
    });

  } catch (error) {
    handleError(res, error);
  }
};

// @desc    Get job analytics
// @route   GET /api/jobs/:id/analytics
// @access  Private (Recruiter - own jobs only)
export const getJobAnalytics = async (req, res) => {
  try {
    const { id } = req.params;
    const job = await Job.findById(id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check ownership
    if (job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view analytics for this job'
      });
    }

    // Get application statistics
    const applicationStats = await Application.aggregate([
      { $match: { job: job._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get daily application trends (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const dailyApplications = await Application.aggregate([
      {
        $match: {
          job: job._id,
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    // Get source statistics
    const sourceStats = await Application.aggregate([
      { $match: { job: job._id } },
      {
        $group: {
          _id: '$source',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        jobId: job._id,
        title: job.title,
        views: job.views || 0,
        totalApplications: await Application.countDocuments({ job: job._id }),
        applicationStats: applicationStats.reduce((acc, stat) => {
          acc[stat._id] = stat.count;
          return acc;
        }, {}),
        dailyApplications,
        sourceStats: sourceStats.reduce((acc, stat) => {
          acc[stat._id || 'direct'] = stat.count;
          return acc;
        }, {}),
        conversionRate: job.views > 0 ? 
          ((await Application.countDocuments({ job: job._id })) / job.views * 100).toFixed(2) : 0
      }
    });

  } catch (error) {
    handleError(res, error);
  }
};

// @desc    Toggle job status (active/paused)
// @route   PATCH /api/jobs/:id/toggle-status
// @access  Private (Recruiter - own jobs only)
export const toggleJobStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const job = await Job.findById(id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check ownership
    if (job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this job'
      });
    }

    // Toggle status
    const newStatus = job.status === 'active' ? 'paused' : 'active';
    job.status = newStatus;
    job.updatedAt = new Date();
    await job.save();

    // Log activity
    await logActivity({
      userId: req.user.id,
      action: 'JOB_STATUS_CHANGED',
      details: { jobId: job._id, jobTitle: job.title, newStatus },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });

    res.json({
      success: true,
      message: `Job ${newStatus === 'active' ? 'activated' : 'paused'} successfully`,
      data: { status: newStatus }
    });

  } catch (error) {
    handleError(res, error);
  }
};

export default {
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  getMyJobs,
  getJobAnalytics,
  toggleJobStatus
};
