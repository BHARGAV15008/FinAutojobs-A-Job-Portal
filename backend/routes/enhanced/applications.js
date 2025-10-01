import express from 'express';
import { body, validationResult } from 'express-validator';
import Application from '../../models/unified/Application.js';
import Job from '../../models/Job.js';
import Resume from '../../models/enhanced/Resume.js';
import User from '../../models/unified/BaseUser.js';
import Interview from '../../models/Interview.js';
import { UserAnalytics } from '../../models/enhanced/Analytics.js';
import { authenticateToken, requireRole } from '../../middleware/auth.js';
import emailService from '../../services/emailService.js';
import notificationService from '../../services/enhanced/notificationService.js';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Validation schemas
const applicationValidation = [
  body('jobId')
    .isMongoId()
    .withMessage('Valid job ID is required'),
  body('resumeId')
    .optional()
    .isMongoId()
    .withMessage('Valid resume ID is required'),
  body('coverLetter')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Cover letter must not exceed 2000 characters'),
  body('expectedSalary')
    .optional()
    .isNumeric()
    .withMessage('Expected salary must be a number'),
  body('availabilityDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid availability date format'),
];

const statusUpdateValidation = [
  body('status')
    .isIn(['pending', 'reviewing', 'shortlisted', 'interviewed', 'offered', 'hired', 'rejected', 'withdrawn'])
    .withMessage('Invalid application status'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes must not exceed 1000 characters'),
  body('feedback')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Feedback must not exceed 2000 characters'),
];

// @route   POST /api/applications
// @desc    Submit a job application
// @access  Private (Applicant only)
router.post('/', authenticateToken, applicationValidation, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Verify user is an applicant
    if (req.user.role !== 'applicant') {
      return res.status(403).json({
        success: false,
        message: 'Only applicants can submit job applications'
      });
    }

    const { jobId, resumeId, coverLetter, expectedSalary, availabilityDate, customResponses } = req.body;
    const applicantId = req.user.userId;

    // Check if job exists and is active
    const job = await Job.findById(jobId).populate('postedBy', 'firstName lastName email companyName');
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    if (job.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'This job is no longer accepting applications'
      });
    }

    // Check application deadline
    if (job.applicationDeadline && new Date(job.applicationDeadline) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Application deadline has passed'
      });
    }

    // Check if user already applied
    const existingApplication = await Application.findOne({
      jobId,
      applicantId,
      status: { $ne: 'withdrawn' }
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this job'
      });
    }

    // Get applicant profile for snapshot
    const applicant = await BaseUser.findById(applicantId);
    if (!applicant) {
      return res.status(404).json({
        success: false,
        message: 'Applicant profile not found'
      });
    }

    // Get resume if provided
    let resumeData = null;
    if (resumeId) {
      const resume = await Resume.findOne({ _id: resumeId, userId: applicantId });
      if (!resume) {
        return res.status(400).json({
          success: false,
          message: 'Resume not found or access denied'
        });
      }
      resumeData = {
        resumeId: resume._id,
        fileName: resume.fileName,
        fileUrl: resume.fileUrl
      };
    } else {
      // Try to get default resume
      const defaultResume = await Resume.findOne({ userId: applicantId, isDefault: true });
      if (defaultResume) {
        resumeData = {
          resumeId: defaultResume._id,
          fileName: defaultResume.fileName,
          fileUrl: defaultResume.fileUrl
        };
      }
    }

    // Create application
    const applicationData = {
      jobId,
      applicantId,
      recruiterId: job.postedBy._id,
      
      // Snapshots for data integrity
      jobSnapshot: {
        title: job.jobTitle,
        company: job.companyName,
        location: job.location,
        salary: job.salary,
        jobType: job.jobType,
        workType: job.workType
      },
      applicantSnapshot: {
        fullName: `${applicant.firstName} ${applicant.lastName}`,
        email: applicant.email,
        phone: applicant.phone,
        location: applicant.currentLocation || applicant.address
      },
      
      // Application data
      applicationData: {
        coverLetter,
        expectedSalary,
        availabilityDate,
        customResponses: customResponses || {},
        resumeData
      },
      
      // Status and timeline
      status: 'pending',
      timeline: [{
        status: 'pending',
        timestamp: new Date(),
        notes: 'Application submitted'
      }],
      
      // Metadata
      source: 'website',
      appliedAt: new Date()
    };

    const application = new Application(applicationData);
    await application.save();

    // Update job applications count
    await Job.findByIdAndUpdate(jobId, {
      $inc: { applicationsCount: 1 },
      $set: { lastApplicationDate: new Date() }
    });

    // Update user analytics
    try {
      const analytics = await UserAnalytics.findOne({ userId: applicantId });
      if (analytics) {
        analytics.applicantMetrics.applicationsSubmitted.total += 1;
        analytics.applicantMetrics.applicationsSubmitted.thisMonth += 1;
        analytics.applicantMetrics.applicationsSubmitted.thisWeek += 1;
        analytics.applicantMetrics.applicationStatus.pending += 1;
        await analytics.save();
      }
    } catch (analyticsError) {
      console.error('Error updating applicant analytics:', analyticsError);
    }

    // Send notification to recruiter
    try {
      await sendNotification({
        userId: job.postedBy._id,
        type: 'new_application',
        title: 'New Job Application',
        message: `${applicant.firstName} ${applicant.lastName} applied for ${job.jobTitle}`,
        data: {
          applicationId: application._id,
          jobId: job._id,
          applicantName: `${applicant.firstName} ${applicant.lastName}`
        }
      });

      // Send email to recruiter
      await emailService.sendEmail({
        to: job.postedBy.email,
        subject: `New Application for ${job.jobTitle}`,
        template: 'new-application',
        data: {
          recruiterName: job.postedBy.firstName,
          jobTitle: job.jobTitle,
          applicantName: `${applicant.firstName} ${applicant.lastName}`,
          applicationLink: `${process.env.FRONTEND_URL}/recruiter-dashboard/applications/${application._id}`
        }
      });
    } catch (notificationError) {
      console.error('Error sending notifications:', notificationError);
    }

    // Send confirmation email to applicant
    try {
      await emailService.sendEmail({
        to: applicant.email,
        subject: `Application Submitted - ${job.jobTitle}`,
        template: 'application-confirmation',
        data: {
          applicantName: applicant.firstName,
          jobTitle: job.jobTitle,
          companyName: job.companyName,
          applicationId: application._id
        }
      });
    } catch (emailError) {
      console.error('Error sending confirmation email:', emailError);
    }

    // Populate response
    await application.populate([
      { path: 'jobId', select: 'jobTitle companyName location salary' },
      { path: 'applicantId', select: 'firstName lastName email' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: { application }
    });

  } catch (error) {
    console.error('Error submitting application:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during application submission',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/applications
// @desc    Get applications (role-based filtering)
// @access  Private
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, status, jobId, search, sortBy = 'appliedAt', sortOrder = 'desc' } = req.query;
    const userId = req.user.userId;
    const userRole = req.user.role;

    // Build query based on user role
    let query = {};
    
    if (userRole === 'applicant') {
      query.applicantId = userId;
    } else if (userRole === 'recruiter') {
      // Get recruiter's jobs
      const recruiterJobs = await Job.find({ postedBy: userId }).select('_id');
      const jobIds = recruiterJobs.map(job => job._id);
      query.jobId = { $in: jobIds };
    } else {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Additional filters
    if (status) {
      const statuses = Array.isArray(status) ? status : [status];
      query.status = { $in: statuses };
    }

    if (jobId) {
      query.jobId = jobId;
    }

    if (search) {
      if (userRole === 'applicant') {
        query.$or = [
          { 'jobSnapshot.title': new RegExp(search, 'i') },
          { 'jobSnapshot.company': new RegExp(search, 'i') }
        ];
      } else {
        query.$or = [
          { 'applicantSnapshot.fullName': new RegExp(search, 'i') },
          { 'applicantSnapshot.email': new RegExp(search, 'i') }
        ];
      }
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    console.log('🔍 Applications query:', JSON.stringify(query, null, 2));
    console.log('📊 User role:', userRole, 'User ID:', userId);
    console.log('🎯 Filters - JobId:', jobId, 'Status:', status, 'Search:', search);

    // Execute query with enhanced population
    const [applications, totalApplications] = await Promise.all([
      Application.find(query)
        .populate({
          path: 'jobId',
          select: 'jobTitle companyName location salary status description postedBy',
          populate: {
            path: 'postedBy',
            select: 'firstName lastName companyName'
          }
        })
        .populate({
          path: 'applicantId',
          select: 'firstName lastName email phone profilePicture dateOfBirth address education experience skills'
        })
        .populate('resumeId', 'fileName filePath title')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Application.countDocuments(query)
    ]);

    console.log('📋 Found applications:', applications.length);

    // Enrich applications with additional data and frontend compatibility
    const enrichedApplications = applications.map((app, index) => {
      const appliedDate = new Date(app.appliedAt);
      const daysAgo = Math.floor((Date.now() - appliedDate.getTime()) / (1000 * 60 * 60 * 24));
      
      return {
        ...app,
        // Frontend compatibility fields
        id: app._id,
        applicantName: app.applicantId ? 
          `${app.applicantId.firstName} ${app.applicantId.lastName}` : 
          `Applicant ${index + 1}`,
        applicantEmail: app.applicantId?.email || 'N/A',
        jobTitle: app.jobId?.jobTitle || 'Position',
        companyName: app.jobId?.companyName || 'Company',
        appliedDate: appliedDate.toISOString().split('T')[0],
        appliedTime: appliedDate.toLocaleTimeString(),
        statusBadge: app.status.charAt(0).toUpperCase() + app.status.slice(1),
        
        // Time calculations
        daysAgo,
        timeAgo: daysAgo === 0 ? 'Today' : 
                daysAgo === 1 ? '1 day ago' : 
                daysAgo < 7 ? `${daysAgo} days ago` :
                daysAgo < 30 ? `${Math.floor(daysAgo / 7)} weeks ago` :
                `${Math.floor(daysAgo / 30)} months ago`,
        
        // Action permissions
        canWithdraw: userRole === 'applicant' && ['pending', 'reviewing'].includes(app.status),
        canUpdateStatus: userRole === 'recruiter' && !['hired', 'rejected', 'withdrawn'].includes(app.status),
        canScheduleInterview: userRole === 'recruiter' && ['shortlisted'].includes(app.status),
        canContact: userRole === 'recruiter',
        canViewDetails: true,
        canDownloadResume: userRole === 'recruiter' && (app.resumeId || app.applicantId),
        
        // Enhanced applicant info
        applicant: {
          id: app.applicantId?._id || app.applicantId,
          name: app.applicantId ? 
            `${app.applicantId.firstName} ${app.applicantId.lastName}` : 
            'Unknown Applicant',
          email: app.applicantId?.email || 'N/A',
          phone: app.applicantId?.phone || 'N/A',
          avatar: app.applicantId?.profilePicture || '👤',
          experience: app.applicantId?.experience?.length || 0,
          skills: app.applicantId?.skills || [],
          education: app.applicantId?.education || []
        },
        
        // Enhanced job info
        job: {
          id: app.jobId?._id || app.jobId,
          title: app.jobId?.jobTitle || 'Position',
          company: app.jobId?.companyName || 'Company',
          location: app.jobId?.location || {},
          status: app.jobId?.status || 'unknown'
        },
        
        // Resume info
        resume: app.resumeId ? {
          id: app.resumeId._id,
          fileName: app.resumeId.fileName,
          title: app.resumeId.title,
          hasFile: !!app.resumeId.filePath
        } : null
      };
    });

    // Calculate pagination info
    const totalPages = Math.ceil(totalApplications / parseInt(limit));

    res.json({
      success: true,
      data: {
        applications: enrichedApplications,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalApplications,
          hasNextPage: parseInt(page) < totalPages,
          hasPrevPage: parseInt(page) > 1,
          limit: parseInt(limit)
        },
        summary: {
          total: totalApplications,
          byStatus: await getApplicationsByStatus(query)
        }
      }
    });

  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/applications/:id
// @desc    Get single application
// @access  Private
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.role;

    // Validate ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid application ID format'
      });
    }

    const application = await Application.findById(id)
      .populate('jobId', 'jobTitle companyName location salary status postedBy')
      .populate('applicantId', 'firstName lastName email phone profilePicture')
      .populate('recruiterId', 'firstName lastName companyName email');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check access permissions
    const hasAccess = 
      (userRole === 'applicant' && application.applicantId._id.toString() === userId) ||
      (userRole === 'recruiter' && application.recruiterId._id.toString() === userId);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Get resume data if available
    let resumeData = null;
    if (application.applicationData?.resumeData?.resumeId) {
      resumeData = await Resume.findById(application.applicationData.resumeData.resumeId);
    }

    // Enrich application data
    const enrichedApplication = {
      ...application.toObject(),
      resumeData,
      daysAgo: Math.floor((Date.now() - new Date(application.appliedAt).getTime()) / (1000 * 60 * 60 * 24)),
      canWithdraw: userRole === 'applicant' && ['pending', 'reviewing'].includes(application.status),
      canUpdateStatus: userRole === 'recruiter' && !['hired', 'rejected', 'withdrawn'].includes(application.status)
    };

    res.json({
      success: true,
      data: { application: enrichedApplication }
    });

  } catch (error) {
    console.error('Error fetching application:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   PUT /api/applications/:id/status
// @desc    Update application status
// @access  Private (Recruiter only)
router.put('/:id/status', authenticateToken, statusUpdateValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Verify user is a recruiter
    if (req.user.role !== 'recruiter') {
      return res.status(403).json({
        success: false,
        message: 'Only recruiters can update application status'
      });
    }

    const { id } = req.params;
    const { status, notes, feedback, interviewDate, offerDetails } = req.body;
    const recruiterId = req.user.userId;

    // Find application and verify ownership
    const application = await Application.findById(id)
      .populate('jobId', 'postedBy jobTitle companyName')
      .populate('applicantId', 'firstName lastName email');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    if (application.jobId.postedBy.toString() !== recruiterId) {
      return res.status(403).json({
        success: false,
        message: 'You can only update applications for your jobs'
      });
    }

    // Validate status transition
    const validTransitions = {
      'pending': ['reviewing', 'shortlisted', 'rejected'],
      'reviewing': ['shortlisted', 'interviewed', 'rejected'],
      'shortlisted': ['interviewed', 'rejected'],
      'interviewed': ['offered', 'rejected'],
      'offered': ['hired', 'rejected'],
      'hired': [],
      'rejected': [],
      'withdrawn': []
    };

    if (!validTransitions[application.status]?.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot change status from ${application.status} to ${status}`
      });
    }

    // Update application
    const updateData = {
      status,
      $push: {
        timeline: {
          status,
          timestamp: new Date(),
          updatedBy: recruiterId,
          notes: notes || '',
          feedback: feedback || ''
        }
      }
    };

    // Add status-specific data
    if (status === 'interviewed' && interviewDate) {
      updateData.interviewDate = new Date(interviewDate);
    }

    if (status === 'offered' && offerDetails) {
      updateData.offerDetails = offerDetails;
    }

    const updatedApplication = await Application.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('applicantId', 'firstName lastName email');

    // Update analytics
    try {
      const analytics = await UserAnalytics.findOne({ userId: application.applicantId._id });
      if (analytics) {
        // Update old status count
        if (analytics.applicantMetrics.applicationStatus[application.status] > 0) {
          analytics.applicantMetrics.applicationStatus[application.status] -= 1;
        }
        // Update new status count
        analytics.applicantMetrics.applicationStatus[status] = 
          (analytics.applicantMetrics.applicationStatus[status] || 0) + 1;
        await analytics.save();
      }
    } catch (analyticsError) {
      console.error('Error updating analytics:', analyticsError);
    }

    // Send notification to applicant
    try {
      await sendNotification({
        userId: application.applicantId._id,
        type: 'application_status_update',
        title: 'Application Status Updated',
        message: `Your application for ${application.jobId.jobTitle} has been ${status}`,
        data: {
          applicationId: application._id,
          jobTitle: application.jobId.jobTitle,
          status,
          notes
        }
      });

      // Send email notification
      await emailService.sendEmail({
        to: application.applicantId.email,
        subject: `Application Update - ${application.jobId.jobTitle}`,
        template: 'application-status-update',
        data: {
          applicantName: application.applicantId.firstName,
          jobTitle: application.jobId.jobTitle,
          companyName: application.jobId.companyName,
          status,
          notes,
          feedback
        }
      });
    } catch (notificationError) {
      console.error('Error sending status update notifications:', notificationError);
    }

    res.json({
      success: true,
      message: 'Application status updated successfully',
      data: { application: updatedApplication }
    });

  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   PUT /api/applications/:id/withdraw
// @desc    Withdraw application
// @access  Private (Applicant only)
router.put('/:id/withdraw', authenticateToken, async (req, res) => {
  try {
    // Verify user is an applicant
    if (req.user.role !== 'applicant') {
      return res.status(403).json({
        success: false,
        message: 'Only applicants can withdraw applications'
      });
    }

    const { id } = req.params;
    const { reason } = req.body;
    const applicantId = req.user.userId;

    // Find application and verify ownership
    const application = await Application.findById(id)
      .populate('jobId', 'jobTitle companyName postedBy')
      .populate('applicantId', 'firstName lastName');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    if (application.applicantId._id.toString() !== applicantId) {
      return res.status(403).json({
        success: false,
        message: 'You can only withdraw your own applications'
      });
    }

    // Check if application can be withdrawn
    if (['hired', 'rejected', 'withdrawn'].includes(application.status)) {
      return res.status(400).json({
        success: false,
        message: 'This application cannot be withdrawn'
      });
    }

    // Update application status
    const updatedApplication = await Application.findByIdAndUpdate(
      id,
      {
        status: 'withdrawn',
        $push: {
          timeline: {
            status: 'withdrawn',
            timestamp: new Date(),
            updatedBy: applicantId,
            notes: reason || 'Application withdrawn by applicant'
          }
        }
      },
      { new: true }
    );

    // Update job applications count
    await Job.findByIdAndUpdate(application.jobId._id, {
      $inc: { applicationsCount: -1 }
    });

    // Send notification to recruiter
    try {
      await sendNotification({
        userId: application.jobId.postedBy,
        type: 'application_withdrawn',
        title: 'Application Withdrawn',
        message: `${application.applicantId.firstName} ${application.applicantId.lastName} withdrew their application for ${application.jobId.jobTitle}`,
        data: {
          applicationId: application._id,
          jobTitle: application.jobId.jobTitle,
          applicantName: `${application.applicantId.firstName} ${application.applicantId.lastName}`,
          reason
        }
      });
    } catch (notificationError) {
      console.error('Error sending withdrawal notification:', notificationError);
    }

    res.json({
      success: true,
      message: 'Application withdrawn successfully',
      data: { application: updatedApplication }
    });

  } catch (error) {
    console.error('Error withdrawing application:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/v2/applications/:id/details
// @desc    Get complete application details with full applicant data
// @access  Private (Recruiter only)
router.get('/:id/details', authenticateToken, requireRole('recruiter'), async (req, res) => {
  try {
    const applicationId = req.params.id;

    // Find application with complete population
    const application = await Application.findById(applicationId)
      .populate({
        path: 'applicantId',
        select: 'firstName lastName email phone profilePicture dateOfBirth address education experience skills certifications socialLinks preferences analytics createdAt'
      })
      .populate({
        path: 'jobId',
        select: 'jobTitle companyName location salary jobType workType description requirements benefits postedBy'
      })
      .populate({
        path: 'resumeId',
        select: 'title fileName filePath fileSize uploadDate parsedContent skills experience education'
      });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Verify recruiter owns this job
    const job = await Job.findById(application.jobId._id);
    if (job.postedBy.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied - you can only view applications for your jobs'
      });
    }

    // Get applicant's other applications for context
    const otherApplications = await Application.find({
      applicantId: application.applicantId._id,
      _id: { $ne: applicationId }
    })
    .populate('jobId', 'jobTitle companyName')
    .select('status appliedAt jobId')
    .limit(5)
    .sort({ appliedAt: -1 });

    // Get applicant's resume if available
    let resumeData = null;
    if (application.resumeId) {
      resumeData = application.resumeId;
    } else {
      // Try to find default resume
      const defaultResume = await Resume.findOne({
        userId: application.applicantId._id,
        isDefault: true
      });
      if (defaultResume) {
        resumeData = defaultResume;
      }
    }

    // Calculate match score (simple algorithm)
    const matchScore = calculateMatchScore(application.applicantId, application.jobId);

    res.json({
      success: true,
      data: {
        application: {
          ...application.toObject(),
          matchScore,
          resumeData,
          otherApplications,
          applicantProfile: {
            ...application.applicantId.toObject(),
            totalApplications: otherApplications.length + 1,
            profileCompleteness: calculateProfileCompleteness(application.applicantId)
          }
        }
      }
    });

  } catch (error) {
    console.error('Error fetching application details:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/v2/applications/:id/resume/download
// @desc    Download applicant's resume
// @access  Private (Recruiter only)
router.get('/:id/resume/download', authenticateToken, requireRole('recruiter'), async (req, res) => {
  try {
    const applicationId = req.params.id;

    // Find application
    const application = await Application.findById(applicationId)
      .populate('jobId', 'postedBy')
      .populate('resumeId');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Verify recruiter owns this job
    if (application.jobId.postedBy.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    let resumeFile = null;

    // Try to get resume from application
    if (application.resumeId && application.resumeId.filePath) {
      resumeFile = application.resumeId;
    } else {
      // Try to find default resume
      const defaultResume = await Resume.findOne({
        userId: application.applicantId,
        isDefault: true
      });
      
      if (defaultResume && defaultResume.filePath) {
        resumeFile = defaultResume;
      }
    }

    if (!resumeFile) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found for this application'
      });
    }

    // Check if file exists
    const filePath = path.resolve(resumeFile.filePath);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Resume file not found on server'
      });
    }

    // Update download analytics
    try {
      await Resume.findByIdAndUpdate(resumeFile._id, {
        $inc: { 'analytics.downloads': 1 },
        $push: {
          'analytics.downloadHistory': {
            downloadedBy: req.user.userId,
            downloadedAt: new Date(),
            ipAddress: req.ip
          }
        }
      });
    } catch (analyticsError) {
      console.error('Error updating resume analytics:', analyticsError);
    }

    // Set appropriate headers
    res.setHeader('Content-Type', resumeFile.mimeType || 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${resumeFile.fileName}"`);
    
    // Send file
    res.sendFile(filePath);

  } catch (error) {
    console.error('Error downloading resume:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/v2/applications/:id/contact
// @desc    Send email to applicant and create message thread
// @access  Private (Recruiter only)
router.post('/:id/contact', authenticateToken, requireRole('recruiter'), [
  body('subject').trim().isLength({ min: 1, max: 200 }).withMessage('Subject is required and must be less than 200 characters'),
  body('message').trim().isLength({ min: 1, max: 2000 }).withMessage('Message is required and must be less than 2000 characters'),
  body('type').optional().isIn(['email', 'message', 'both']).withMessage('Invalid contact type')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const applicationId = req.params.id;
    const { subject, message, type = 'both' } = req.body;

    // Find application
    const application = await Application.findById(applicationId)
      .populate('applicantId', 'firstName lastName email')
      .populate('jobId', 'jobTitle companyName postedBy');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Verify recruiter owns this job
    if (application.jobId.postedBy.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const recruiter = await User.findById(req.user.userId).select('firstName lastName email companyName');
    const applicant = application.applicantId;

    // Send email if requested
    if (type === 'email' || type === 'both') {
      try {
        await emailService.sendEmail({
          to: applicant.email,
          subject: `${subject} - ${application.jobId.jobTitle}`,
          template: 'recruiter-contact',
          data: {
            applicantName: `${applicant.firstName} ${applicant.lastName}`,
            recruiterName: `${recruiter.firstName} ${recruiter.lastName}`,
            companyName: recruiter.companyName || application.jobId.companyName,
            jobTitle: application.jobId.jobTitle,
            subject,
            message,
            replyUrl: `${process.env.FRONTEND_URL}/applicant-dashboard/messages`
          }
        });
      } catch (emailError) {
        console.error('Error sending email:', emailError);
      }
    }

    // Create message thread if requested
    if (type === 'message' || type === 'both') {
      try {
        // Import Message model
        const Message = (await import('../models/Message.js')).default;
        
        // Find or create conversation
        let conversation = await Message.findOne({
          participants: { $all: [req.user.userId, applicant._id] }
        });

        if (!conversation) {
          conversation = new Message({
            participants: [req.user.userId, applicant._id],
            messages: [],
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }

        // Add message
        conversation.messages.push({
          sender: req.user.userId,
          content: message,
          subject: subject,
          messageType: 'text',
          timestamp: new Date(),
          relatedApplication: applicationId
        });

        conversation.updatedAt = new Date();
        await conversation.save();

        // Send real-time notification
        await notificationService.sendNotification({
          userId: applicant._id,
          type: 'new_message',
          title: 'New Message from Recruiter',
          message: `${recruiter.firstName} ${recruiter.lastName} sent you a message about ${application.jobId.jobTitle}`,
          data: {
            conversationId: conversation._id,
            senderId: req.user.userId,
            senderName: `${recruiter.firstName} ${recruiter.lastName}`,
            jobTitle: application.jobId.jobTitle,
            redirectUrl: '/applicant-dashboard/messages'
          }
        });

      } catch (messageError) {
        console.error('Error creating message:', messageError);
      }
    }

    res.json({
      success: true,
      message: 'Contact sent successfully',
      data: {
        emailSent: type === 'email' || type === 'both',
        messageSent: type === 'message' || type === 'both',
        redirectUrl: '/recruiter-dashboard/messages'
      }
    });

  } catch (error) {
    console.error('Error contacting applicant:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/v2/applications/:id/schedule-interview
// @desc    Schedule interview for application
// @access  Private (Recruiter only)
router.post('/:id/schedule-interview', authenticateToken, requireRole('recruiter'), [
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Interview title is required'),
  body('scheduledDate').isISO8601().withMessage('Valid scheduled date is required'),
  body('scheduledTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid time format required (HH:MM)'),
  body('duration').isInt({ min: 15, max: 480 }).withMessage('Duration must be between 15 and 480 minutes'),
  body('interviewType').isIn(['phone', 'video', 'in-person']).withMessage('Invalid interview type'),
  body('location').optional().trim(),
  body('meetingLink').optional().isURL().withMessage('Invalid meeting link'),
  body('description').optional().trim().isLength({ max: 1000 }).withMessage('Description too long')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const applicationId = req.params.id;
    const {
      title,
      scheduledDate,
      scheduledTime,
      duration,
      interviewType,
      location,
      meetingLink,
      description,
      round = 1
    } = req.body;

    // Find application
    const application = await Application.findById(applicationId)
      .populate('applicantId', 'firstName lastName email phone')
      .populate('jobId', 'jobTitle companyName postedBy');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Verify recruiter owns this job
    if (application.jobId.postedBy.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const recruiter = await User.findById(req.user.userId).select('firstName lastName email companyName');

    // Create interview
    const interview = new Interview({
      title,
      description,
      scheduledDate: new Date(scheduledDate),
      scheduledTime,
      duration,
      status: 'scheduled',
      interviewType,
      location: interviewType === 'in-person' ? location : undefined,
      meetingLink: interviewType === 'video' ? meetingLink : undefined,
      round,
      candidateId: application.applicantId._id,
      recruiterId: req.user.userId,
      jobId: application.jobId._id,
      applicationId: applicationId,
      candidateInfo: {
        name: `${application.applicantId.firstName} ${application.applicantId.lastName}`,
        email: application.applicantId.email,
        phone: application.applicantId.phone
      },
      jobInfo: {
        title: application.jobId.jobTitle,
        company: application.jobId.companyName
      },
      recruiterInfo: {
        name: `${recruiter.firstName} ${recruiter.lastName}`,
        email: recruiter.email,
        company: recruiter.companyName || application.jobId.companyName
      },
      createdBy: req.user.userId,
      updatedBy: req.user.userId
    });

    await interview.save();

    // Update application status to 'interviewed'
    application.status = 'interviewed';
    application.statusHistory.push({
      status: 'interviewed',
      changedBy: req.user.userId,
      changedAt: new Date(),
      notes: `Interview scheduled for ${scheduledDate} at ${scheduledTime}`
    });
    await application.save();

    // Send email to applicant
    try {
      await emailService.sendInterviewScheduledEmail({
        applicantEmail: application.applicantId.email,
        applicantName: `${application.applicantId.firstName} ${application.applicantId.lastName}`,
        jobTitle: application.jobId.jobTitle,
        companyName: application.jobId.companyName,
        interviewDate: scheduledDate,
        interviewTime: scheduledTime,
        duration,
        interviewType,
        location,
        meetingLink,
        interviewers: `${recruiter.firstName} ${recruiter.lastName}`,
        contactEmail: recruiter.email,
        calendarLink: `${process.env.FRONTEND_URL}/calendar/add?interview=${interview._id}`
      });
    } catch (emailError) {
      console.error('Error sending interview email:', emailError);
    }

    // Send notification to applicant
    try {
      await notificationService.sendNotification({
        userId: application.applicantId._id,
        type: 'interview_scheduled',
        title: 'Interview Scheduled',
        message: `Your interview for ${application.jobId.jobTitle} has been scheduled for ${scheduledDate} at ${scheduledTime}`,
        data: {
          interviewId: interview._id,
          applicationId: applicationId,
          jobTitle: application.jobId.jobTitle,
          scheduledDate,
          scheduledTime,
          redirectUrl: '/applicant-dashboard/interviews'
        }
      });
    } catch (notificationError) {
      console.error('Error sending interview notification:', notificationError);
    }

    res.status(201).json({
      success: true,
      message: 'Interview scheduled successfully',
      data: {
        interview,
        application: {
          _id: application._id,
          status: application.status
        }
      }
    });

  } catch (error) {
    console.error('Error scheduling interview:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Helper function to calculate match score
const calculateMatchScore = (applicant, job) => {
  let score = 0;
  let factors = 0;

  // Skills matching
  if (applicant.skills && job.requiredSkills) {
    const applicantSkills = applicant.skills.map(s => s.toLowerCase());
    const jobSkills = job.requiredSkills.map(s => s.toLowerCase());
    const matchingSkills = applicantSkills.filter(skill => 
      jobSkills.some(jobSkill => jobSkill.includes(skill) || skill.includes(jobSkill))
    );
    score += (matchingSkills.length / jobSkills.length) * 40;
    factors++;
  }

  // Experience level matching
  if (applicant.experience && job.experienceLevel) {
    const expYears = applicant.experience.reduce((total, exp) => {
      const start = new Date(exp.startDate);
      const end = exp.endDate ? new Date(exp.endDate) : new Date();
      return total + (end.getFullYear() - start.getFullYear());
    }, 0);

    const requiredExp = {
      'entry': 0,
      'junior': 2,
      'mid': 4,
      'senior': 7,
      'lead': 10
    };

    const required = requiredExp[job.experienceLevel] || 0;
    if (expYears >= required) {
      score += 30;
    } else {
      score += (expYears / required) * 30;
    }
    factors++;
  }

  // Education matching
  if (applicant.education && job.requirements) {
    score += 20; // Basic education score
    factors++;
  }

  // Location preference
  if (applicant.preferences && applicant.preferences.preferredLocations && job.location) {
    const isLocationMatch = applicant.preferences.preferredLocations.some(loc => 
      loc.city === job.location.city || loc.state === job.location.state
    );
    if (isLocationMatch) {
      score += 10;
    }
    factors++;
  }

  return factors > 0 ? Math.round(score / factors) : 0;
};

// Helper function to calculate profile completeness
const calculateProfileCompleteness = (user) => {
  let completeness = 0;
  const fields = [
    'firstName', 'lastName', 'email', 'phone', 'profilePicture',
    'education', 'experience', 'skills', 'certifications'
  ];

  fields.forEach(field => {
    if (user[field] && user[field].length > 0) {
      completeness += 100 / fields.length;
    }
  });

  return Math.round(completeness);
};

// Helper function to get applications by status
const getApplicationsByStatus = async (baseQuery) => {
  const statusCounts = await Application.aggregate([
    { $match: baseQuery },
    { $group: { _id: '$status', count: { $sum: 1 } } }
  ]);

  const result = {};
  statusCounts.forEach(item => {
    result[item._id] = item.count;
  });

  return result;
};

// @route   GET /api/v2/applications/job/:jobId
// @desc    Get applications for a specific job (Recruiter only)
// @access  Private (Recruiter only)
router.get('/job/:jobId', authenticateToken, requireRole('recruiter'), async (req, res) => {
  try {
    const { jobId } = req.params;
    const { page = 1, limit = 20, status, search, sortBy = 'appliedAt', sortOrder = 'desc' } = req.query;
    const recruiterId = req.user.userId;

    // Verify job belongs to recruiter
    const job = await Job.findOne({ _id: jobId, postedBy: recruiterId });
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found or access denied'
      });
    }

    // Build query for applications to this specific job
    const query = { jobId: jobId };

    // Status filter
    if (status) {
      const statuses = Array.isArray(status) ? status : [status];
      query.status = { $in: statuses };
    }

    // Search in applicant details
    if (search) {
      query.$or = [
        { 'applicantSnapshot.fullName': new RegExp(search, 'i') },
        { 'applicantSnapshot.email': new RegExp(search, 'i') },
        { coverLetter: new RegExp(search, 'i') }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    console.log('🔍 Job applications query:', JSON.stringify(query, null, 2));
    console.log('📊 Job ID:', jobId, 'Recruiter ID:', recruiterId);

    // Execute query
    const [applications, totalApplications] = await Promise.all([
      Application.find(query)
        .populate({
          path: 'applicantId',
          select: 'firstName lastName email phone profilePicture dateOfBirth address education experience skills certifications'
        })
        .populate('resumeId', 'fileName filePath title fileSize uploadDate')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Application.countDocuments(query)
    ]);

    console.log('📋 Found applications for job:', applications.length);

    // Enrich applications with job-specific data
    const enrichedApplications = applications.map((app, index) => {
      const appliedDate = new Date(app.appliedAt);
      const daysAgo = Math.floor((Date.now() - appliedDate.getTime()) / (1000 * 60 * 60 * 24));
      
      return {
        ...app,
        // Frontend compatibility
        id: app._id,
        applicantName: app.applicantId ? 
          `${app.applicantId.firstName} ${app.applicantId.lastName}` : 
          `Applicant ${index + 1}`,
        applicantEmail: app.applicantId?.email || 'N/A',
        appliedDate: appliedDate.toISOString().split('T')[0],
        statusBadge: app.status.charAt(0).toUpperCase() + app.status.slice(1),
        daysAgo,
        timeAgo: daysAgo === 0 ? 'Today' : 
                daysAgo === 1 ? '1 day ago' : 
                daysAgo < 7 ? `${daysAgo} days ago` :
                `${Math.floor(daysAgo / 7)} weeks ago`,
        
        // Enhanced applicant details
        applicant: {
          id: app.applicantId?._id,
          name: app.applicantId ? 
            `${app.applicantId.firstName} ${app.applicantId.lastName}` : 
            'Unknown',
          email: app.applicantId?.email || 'N/A',
          phone: app.applicantId?.phone || 'N/A',
          avatar: app.applicantId?.profilePicture || '👤',
          experience: app.applicantId?.experience || [],
          skills: app.applicantId?.skills || [],
          education: app.applicantId?.education || [],
          certifications: app.applicantId?.certifications || []
        },
        
        // Resume details
        resume: app.resumeId ? {
          id: app.resumeId._id,
          fileName: app.resumeId.fileName,
          title: app.resumeId.title,
          fileSize: app.resumeId.fileSize,
          uploadDate: app.resumeId.uploadDate,
          hasFile: !!app.resumeId.filePath
        } : null,
        
        // Action flags
        canViewDetails: true,
        canUpdateStatus: !['hired', 'rejected', 'withdrawn'].includes(app.status),
        canScheduleInterview: ['shortlisted'].includes(app.status),
        canContact: true,
        canDownloadResume: !!(app.resumeId || app.applicantId)
      };
    });

    // Get status summary for this job
    const statusSummary = await Application.aggregate([
      { $match: { jobId: jobId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const summary = {
      total: totalApplications,
      pending: 0,
      reviewing: 0,
      shortlisted: 0,
      interviewed: 0,
      offered: 0,
      hired: 0,
      rejected: 0,
      withdrawn: 0
    };

    statusSummary.forEach(item => {
      summary[item._id] = item.count;
    });

    res.json({
      success: true,
      data: {
        applications: enrichedApplications,
        job: {
          id: job._id,
          title: job.jobTitle,
          company: job.companyName,
          status: job.status,
          postedDate: job.createdAt,
          deadline: job.applicationDeadline
        },
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalApplications / parseInt(limit)),
          totalApplications,
          hasNextPage: parseInt(page) < Math.ceil(totalApplications / parseInt(limit)),
          hasPrevPage: parseInt(page) > 1,
          limit: parseInt(limit)
        },
        summary,
        filters: {
          status: status ? (Array.isArray(status) ? status : [status]) : [],
          search
        }
      }
    });

  } catch (error) {
    console.error('Error fetching job applications:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;
