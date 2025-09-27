import express from 'express';
import Application from '../models/unified/Application.js';
import Job from '../models/Job.js';
import CleanUser from '../models/CleanUser.js';
import joi from 'joi';

const router = express.Router();

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required'
      });
    }
    
    const jwt = await import('jsonwebtoken');
    const decoded = jwt.default.verify(token, process.env.JWT_SECRET || 'your-jwt-secret-key-change-this-in-production');
    
    const user = await CleanUser.findById(decoded.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    req.user = {
      ...decoded,
      ...user.toObject(),
      userId: decoded.userId || user._id,
      _id: user._id
    };
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

// Validation schemas
const createApplicationSchema = joi.object({
  jobId: joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
  coverLetter: joi.string().max(5000).optional()
});

// GET /api/applications - Get applications for current user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    
    const query = {};
    
    // Role-based filtering
    if (req.user.role === 'applicant') {
      query.applicantId = req.user.userId;
    } else if (req.user.role === 'recruiter') {
      const userJobs = await Job.find({ postedBy: req.user.userId }).select('_id');
      query.jobId = { $in: userJobs.map(job => job._id) };
    }
    
    if (status) {
      query.applicationStatus = status;
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const [applications, totalCount] = await Promise.all([
      Application.find(query)
        .populate('jobId', 'title company location type')
        .populate('applicantId', 'firstName lastName email')
        .sort({ appliedAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Application.countDocuments(query)
    ]);

    const transformedApplications = applications.map(application => ({
      id: application._id,
      jobId: application.jobId._id,
      job: {
        title: application.jobId.title,
        company: application.jobId.company,
        location: application.jobId.location,
        type: application.jobId.type
      },
      applicant: application.applicantId ? {
        id: application.applicantId._id,
        name: `${application.applicantId.firstName} ${application.applicantId.lastName}`,
        email: application.applicantId.email
      } : null,
      status: application.applicationStatus,
      resumeUrl: application.applicationData?.resumeUrl,
      coverLetter: application.applicationData?.coverLetter,
      appliedAt: application.appliedAt,
      updatedAt: application.updatedAt
    }));

    res.json({
      success: true,
      data: {
        applications: transformedApplications,
        total: totalCount,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalCount / limitNum)
      }
    });
  } catch (error) {
    console.error('❌ Error fetching applications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch applications',
      error: error.message
    });
  }
});

// GET /api/applications/:id - Get application by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const applicationId = req.params.id;

    if (!applicationId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid application ID format'
      });
    }

    const application = await Application.findById(applicationId)
      .populate('jobId', 'title company location type description')
      .populate('applicantId', 'firstName lastName email phone resume_url')
      .populate('recruiterId', 'firstName lastName email')
      .lean();

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check permissions
    const canView = req.user.role === 'admin' ||
                   req.user.userId === application.applicantId._id.toString() ||
                   (req.user.role === 'recruiter' && req.user.userId === application.recruiterId?.toString());

    if (!canView) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const transformedApplication = {
      id: application._id,
      jobId: application.jobId._id,
      job: {
        title: application.jobId.title,
        company: application.jobId.company,
        location: application.jobId.location,
        type: application.jobId.type,
        description: application.jobId.description
      },
      applicant: {
        id: application.applicantId._id,
        name: `${application.applicantId.firstName} ${application.applicantId.lastName}`,
        email: application.applicantId.email,
        phone: application.applicantId.phone,
        resumeUrl: application.applicantId.resume_url
      },
      status: application.applicationStatus,
      applicationData: application.applicationData,
      timeline: application.timeline,
      appliedAt: application.appliedAt,
      updatedAt: application.updatedAt
    };

    res.json({
      success: true,
      data: { application: transformedApplication }
    });
  } catch (error) {
    console.error('❌ Error fetching application:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch application',
      error: error.message
    });
  }
});

// POST /api/applications - Create new application
router.post('/', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'applicant') {
      return res.status(403).json({
        success: false,
        message: 'Only applicants can submit applications'
      });
    }

    const { error, value } = createApplicationSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.details
      });
    }

    const { jobId, coverLetter } = value;

    const job = await Job.findById(jobId);
    if (!job || job.status !== 'active') {
      return res.status(404).json({
        success: false,
        message: 'Job not found or not accepting applications'
      });
    }

    // Check for duplicate application
    const existingApplication = await Application.findOne({
      applicantId: req.user.userId,
      jobId: jobId
    });

    if (existingApplication) {
      return res.status(409).json({
        success: false,
        message: 'You have already applied to this job'
      });
    }

    // Create application
    const newApplication = new Application({
      applicantId: req.user.userId,
      jobId: jobId,
      recruiterId: job.postedBy,
      applicationStatus: 'pending',
      applicationData: {
        resumeUrl: req.user.resume_url || '',
        coverLetter: coverLetter || '',
        customAnswers: []
      },
      applicantSnapshot: {
        fullName: `${req.user.firstName} ${req.user.lastName}`,
        email: req.user.email,
        phone: req.user.phone
      },
      jobSnapshot: {
        jobTitle: job.title,
        companyName: job.company
      },
      timeline: [{
        status: 'pending',
        timestamp: new Date(),
        updatedBy: req.user.userId
      }]
    });

    const savedApplication = await newApplication.save();

    // Update job application count
    await Job.findByIdAndUpdate(jobId, {
      $inc: { applications: 1 }
    });

    // Emit real-time notification
    const io = req.app.get('io');
    if (io) {
      io.to(`user-${job.postedBy}`).emit('new-application-received', {
        message: 'New application received',
        application: {
          id: savedApplication._id,
          jobTitle: job.title
        },
        timestamp: new Date()
      });
    }

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: {
        application: {
          id: savedApplication._id,
          status: savedApplication.applicationStatus
        }
      }
    });
  } catch (error) {
    console.error('❌ Error creating application:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit application',
      error: error.message
    });
  }
});

// PUT /api/applications/:id/status - Update application status
router.put('/:id/status', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'recruiter') {
      return res.status(403).json({
        success: false,
        message: 'Only recruiters can update application status'
      });
    }

    const applicationId = req.params.id;
    const { status, notes } = req.body;

    if (!applicationId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid application ID format'
      });
    }

    const application = await Application.findById(applicationId)
      .populate('jobId', 'postedBy')
      .populate('applicantId', 'firstName lastName email');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Verify ownership
    if (application.jobId.postedBy.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only update applications for your jobs'
      });
    }

    // Update application
    const updatedApplication = await Application.findByIdAndUpdate(
      applicationId,
      {
        applicationStatus: status,
        $push: {
          timeline: {
            status: status,
            timestamp: new Date(),
            updatedBy: req.user.userId,
            note: notes || ''
          }
        }
      },
      { new: true }
    );

    // Emit real-time notification to applicant
    const io = req.app.get('io');
    if (io) {
      io.to(`user-${application.applicantId._id}`).emit('application-status-changed', {
        message: `Application status updated to: ${status}`,
        application: {
          id: application._id,
          jobTitle: application.jobId.title,
          status: status
        },
        timestamp: new Date()
      });
    }

    res.json({
      success: true,
      message: 'Application status updated successfully',
      data: {
        application: {
          id: updatedApplication._id,
          status: updatedApplication.applicationStatus
        }
      }
    });
  } catch (error) {
    console.error('❌ Error updating application status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update application status',
      error: error.message
    });
  }
});

// GET /api/applications/job/:jobId - Get applications for specific job
router.get('/job/:jobId', authenticateToken, async (req, res) => {
  try {
    const { jobId } = req.params;

    if (!jobId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid job ID format'
      });
    }

    // Verify job ownership for recruiters
    if (req.user.role === 'recruiter') {
      const job = await Job.findById(jobId);
      if (!job || job.postedBy.toString() !== req.user.userId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    }

    const applications = await Application.find({ jobId })
      .populate('applicantId', 'firstName lastName email phone resume_url')
      .sort({ appliedAt: -1 })
      .lean();

    const transformedApplications = applications.map(application => ({
      id: application._id,
      applicant: {
        id: application.applicantId._id,
        name: `${application.applicantId.firstName} ${application.applicantId.lastName}`,
        email: application.applicantId.email,
        phone: application.applicantId.phone,
        resumeUrl: application.applicantId.resume_url
      },
      status: application.applicationStatus,
      coverLetter: application.applicationData?.coverLetter,
      appliedAt: application.appliedAt,
      timeline: application.timeline
    }));

    res.json({
      success: true,
      data: {
        applications: transformedApplications,
        total: applications.length
      }
    });
  } catch (error) {
    console.error('❌ Error fetching job applications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch job applications',
      error: error.message
    });
  }
});

export default router;
