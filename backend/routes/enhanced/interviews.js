import express from 'express';
import { body, validationResult } from 'express-validator';
import Interview from '../../models/Interview.js';
import Application from '../../models/unified/Application.js';
import Job from '../../models/Job.js';
import { BaseUser } from '../../models/UserModels.js';
import { authenticateToken } from '../../middleware/auth.js';
import emailService from '../../services/emailService.js';
import { sendNotification } from '../../services/enhanced/notificationService.js';

const router = express.Router();

// Validation schemas
const interviewValidation = [
  body('applicationId')
    .isMongoId()
    .withMessage('Valid application ID is required'),
  body('title')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Interview title must be between 3 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description must not exceed 1000 characters'),
  body('scheduledDate')
    .isISO8601()
    .withMessage('Valid scheduled date is required'),
  body('scheduledTime')
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Valid time format (HH:MM) is required'),
  body('duration')
    .isInt({ min: 15, max: 480 })
    .withMessage('Duration must be between 15 and 480 minutes'),
  body('interviewType')
    .isIn(['screening', 'technical', 'behavioral', 'final', 'hr', 'panel'])
    .withMessage('Invalid interview type'),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Location must not exceed 200 characters'),
  body('meetingLink')
    .optional()
    .isURL()
    .withMessage('Meeting link must be a valid URL'),
];

const statusUpdateValidation = [
  body('status')
    .isIn(['scheduled', 'confirmed', 'rescheduled', 'completed', 'cancelled', 'no-show'])
    .withMessage('Invalid interview status'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes must not exceed 1000 characters'),
];

// @route   POST /api/interviews
// @desc    Schedule a new interview
// @access  Private (Recruiter only)
router.post('/', authenticateToken, interviewValidation, async (req, res) => {
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
        message: 'Only recruiters can schedule interviews'
      });
    }

    const {
      applicationId,
      title,
      description,
      scheduledDate,
      scheduledTime,
      duration,
      interviewType,
      location,
      meetingLink,
      interviewers,
      timezone = 'UTC'
    } = req.body;

    const recruiterId = req.user.userId;

    // Find and verify application
    const application = await Application.findById(applicationId)
      .populate('jobId', 'jobTitle companyName postedBy')
      .populate('applicantId', 'firstName lastName email phone');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Verify recruiter owns the job
    if (application.jobId.postedBy.toString() !== recruiterId) {
      return res.status(403).json({
        success: false,
        message: 'You can only schedule interviews for your job postings'
      });
    }

    // Check if application is in valid status for interview
    if (!['shortlisted', 'reviewing'].includes(application.status)) {
      return res.status(400).json({
        success: false,
        message: 'Application must be shortlisted or under review to schedule interview'
      });
    }

    // Validate scheduled date is in the future
    const interviewDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
    if (interviewDateTime <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Interview must be scheduled for a future date and time'
      });
    }

    // Check for scheduling conflicts
    const conflictingInterview = await Interview.findOne({
      $or: [
        { candidateId: application.applicantId._id },
        { recruiterId }
      ],
      scheduledDate: {
        $gte: new Date(interviewDateTime.getTime() - 30 * 60 * 1000), // 30 min before
        $lte: new Date(interviewDateTime.getTime() + (duration + 30) * 60 * 1000) // duration + 30 min after
      },
      status: { $in: ['scheduled', 'confirmed'] }
    });

    if (conflictingInterview) {
      return res.status(400).json({
        success: false,
        message: 'There is a scheduling conflict with another interview'
      });
    }

    // Create interview
    const interviewData = {
      candidateId: application.applicantId._id,
      recruiterId,
      jobId: application.jobId._id,
      applicationId,
      title,
      description: description || '',
      scheduledDate: interviewDateTime,
      scheduledTime,
      duration,
      timezone,
      interviewType,
      location: location || '',
      meetingLink: meetingLink || '',
      status: 'scheduled',
      round: await getNextInterviewRound(applicationId),
      createdBy: recruiterId,
      
      // Store snapshot data
      candidateInfo: {
        name: `${application.applicantId.firstName} ${application.applicantId.lastName}`,
        email: application.applicantId.email,
        phone: application.applicantId.phone
      },
      jobInfo: {
        title: application.jobId.jobTitle,
        company: application.jobId.companyName
      },
      
      // Interviewers
      interviewers: interviewers || []
    };

    const interview = new Interview(interviewData);
    await interview.save();

    // Update application status
    await Application.findByIdAndUpdate(applicationId, {
      status: 'interviewed',
      interviewDate: interviewDateTime,
      $push: {
        timeline: {
          status: 'interviewed',
          timestamp: new Date(),
          updatedBy: recruiterId,
          notes: `Interview scheduled for ${scheduledDate} at ${scheduledTime}`
        }
      }
    });

    // Send notifications
    try {
      // Email to candidate
      await emailService.sendEmail({
        to: application.applicantId.email,
        subject: `Interview Scheduled - ${application.jobId.jobTitle}`,
        template: 'interview-scheduled',
        data: {
          candidateName: application.applicantId.firstName,
          jobTitle: application.jobId.jobTitle,
          companyName: application.jobId.companyName,
          interviewDate: scheduledDate,
          interviewTime: scheduledTime,
          duration: `${duration} minutes`,
          interviewType,
          location: location || 'Online',
          meetingLink,
          interviewerName: `${req.user.firstName} ${req.user.lastName}`
        }
      });

      // Push notification to candidate
      await sendNotification({
        userId: application.applicantId._id,
        type: 'interview_scheduled',
        title: 'Interview Scheduled',
        message: `Your interview for ${application.jobId.jobTitle} has been scheduled`,
        data: {
          interviewId: interview._id,
          jobTitle: application.jobId.jobTitle,
          scheduledDate,
          scheduledTime
        }
      });
    } catch (notificationError) {
      console.error('Error sending interview notifications:', notificationError);
    }

    // Populate response
    await interview.populate([
      { path: 'candidateId', select: 'firstName lastName email phone' },
      { path: 'recruiterId', select: 'firstName lastName email companyName' },
      { path: 'jobId', select: 'jobTitle companyName location' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Interview scheduled successfully',
      data: { interview }
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

// @route   GET /api/interviews
// @desc    Get interviews (role-based filtering)
// @access  Private
router.get('/', authenticateToken, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      upcoming,
      interviewType,
      startDate,
      endDate,
      sortBy = 'scheduledDate',
      sortOrder = 'asc'
    } = req.query;

    const userId = req.user.userId;
    const userRole = req.user.role;

    // Build query based on user role
    let query = {};
    
    if (userRole === 'applicant') {
      query.candidateId = userId;
    } else if (userRole === 'recruiter') {
      query.recruiterId = userId;
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

    if (upcoming === 'true') {
      query.scheduledDate = { $gte: new Date() };
      query.status = { $in: ['scheduled', 'confirmed'] };
    }

    if (interviewType) {
      const types = Array.isArray(interviewType) ? interviewType : [interviewType];
      query.interviewType = { $in: types };
    }

    // Date range filter
    if (startDate || endDate) {
      query.scheduledDate = {};
      if (startDate) query.scheduledDate.$gte = new Date(startDate);
      if (endDate) query.scheduledDate.$lte = new Date(endDate);
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    console.log('🔍 Interview query:', JSON.stringify(query, null, 2));
    console.log('📊 User role:', userRole, 'User ID:', userId);

    // Execute query with enhanced population
    const [interviews, totalInterviews] = await Promise.all([
      Interview.find(query)
        .populate({
          path: 'candidateId',
          select: 'firstName lastName email phone profilePicture address experience skills'
        })
        .populate({
          path: 'recruiterId', 
          select: 'firstName lastName email companyName phone profilePicture'
        })
        .populate({
          path: 'jobId',
          select: 'jobTitle companyName location salary jobType workType description'
        })
        .populate({
          path: 'applicationId',
          select: 'status appliedAt coverLetter expectedSalary'
        })
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Interview.countDocuments(query)
    ]);

    console.log('📋 Found interviews:', interviews.length);

    // Enrich interviews with additional data and fallback values
    const enrichedInterviews = interviews.map((interview, index) => {
      const now = new Date();
      const interviewDate = new Date(interview.scheduledDate);
      
      return {
        ...interview,
        // Frontend compatibility fields
        id: interview._id,
        candidateName: interview.candidateId ? 
          `${interview.candidateId.firstName} ${interview.candidateId.lastName}` : 
          interview.candidateInfo?.name || `Candidate ${index + 1}`,
        candidateEmail: interview.candidateId?.email || interview.candidateInfo?.email || 'N/A',
        jobTitle: interview.jobId?.jobTitle || interview.jobInfo?.title || 'Position',
        companyName: interview.jobId?.companyName || interview.jobInfo?.company || 'Company',
        interviewer: interview.recruiterId ? 
          `${interview.recruiterId.firstName} ${interview.recruiterId.lastName}` : 
          interview.recruiterInfo?.name || 'Interviewer',
        interviewDate: interview.scheduledDate.toISOString().split('T')[0],
        interviewTime: interview.scheduledTime,
        round: interview.round || 1,
        avatar: interview.candidateId?.profilePicture || '👤',
        
        // Status and action flags
        isUpcoming: interviewDate > now,
        isPast: interviewDate < now,
        daysUntil: Math.ceil((interviewDate - now) / (1000 * 60 * 60 * 24)),
        canReschedule: ['scheduled', 'confirmed'].includes(interview.status) && 
                      interviewDate > new Date(Date.now() + 24 * 60 * 60 * 1000),
        canCancel: ['scheduled', 'confirmed'].includes(interview.status),
        canComplete: ['scheduled', 'confirmed'].includes(interview.status) && interviewDate <= now,
        
        // Enhanced candidate info
        candidate: {
          id: interview.candidateId?._id || interview.candidateId,
          name: interview.candidateId ? 
            `${interview.candidateId.firstName} ${interview.candidateId.lastName}` : 
            interview.candidateInfo?.name || 'Unknown',
          email: interview.candidateId?.email || interview.candidateInfo?.email || 'N/A',
          phone: interview.candidateId?.phone || interview.candidateInfo?.phone || 'N/A',
          avatar: interview.candidateId?.profilePicture || '👤',
          experience: interview.candidateId?.experience || [],
          skills: interview.candidateId?.skills || []
        },
        
        // Enhanced job info
        job: {
          id: interview.jobId?._id || interview.jobId,
          title: interview.jobId?.jobTitle || interview.jobInfo?.title || 'Position',
          company: interview.jobId?.companyName || interview.jobInfo?.company || 'Company',
          location: interview.jobId?.location || 'Location TBD',
          type: interview.jobId?.jobType || 'full-time'
        },
        
        // Enhanced recruiter info
        recruiter: {
          id: interview.recruiterId?._id || interview.recruiterId,
          name: interview.recruiterId ? 
            `${interview.recruiterId.firstName} ${interview.recruiterId.lastName}` : 
            interview.recruiterInfo?.name || 'Recruiter',
          email: interview.recruiterId?.email || interview.recruiterInfo?.email || 'N/A',
          company: interview.recruiterId?.companyName || interview.recruiterInfo?.company || 'Company'
        }
      };
    });

    // Get summary statistics
    const summary = await getInterviewsSummary(query);

    res.json({
      success: true,
      data: {
        interviews: enrichedInterviews,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalInterviews / parseInt(limit)),
          totalInterviews,
          limit: parseInt(limit)
        },
        summary,
        filters: {
          status: status ? (Array.isArray(status) ? status : [status]) : [],
          upcoming: upcoming === 'true',
          interviewType: interviewType ? (Array.isArray(interviewType) ? interviewType : [interviewType]) : [],
          dateRange: { startDate, endDate }
        }
      }
    });

  } catch (error) {
    console.error('Error fetching interviews:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/interviews/:id
// @desc    Get single interview
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
        message: 'Invalid interview ID format'
      });
    }

    const interview = await Interview.findById(id)
      .populate('candidateId', 'firstName lastName email phone profilePicture')
      .populate('recruiterId', 'firstName lastName email companyName')
      .populate('jobId', 'jobTitle companyName location salary')
      .populate('applicationId', 'status appliedAt');

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    // Check access permissions
    const hasAccess = 
      (userRole === 'applicant' && interview.candidateId._id.toString() === userId) ||
      (userRole === 'recruiter' && interview.recruiterId._id.toString() === userId);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Enrich interview data
    const enrichedInterview = {
      ...interview.toObject(),
      isUpcoming: new Date(interview.scheduledDate) > new Date(),
      isPast: new Date(interview.scheduledDate) < new Date(),
      daysUntil: Math.ceil((new Date(interview.scheduledDate) - Date.now()) / (1000 * 60 * 60 * 24)),
      canReschedule: ['scheduled', 'confirmed'].includes(interview.status) && 
                    new Date(interview.scheduledDate) > new Date(Date.now() + 24 * 60 * 60 * 1000),
      canCancel: ['scheduled', 'confirmed'].includes(interview.status),
      canProvideFeedback: userRole === 'recruiter' && interview.status === 'completed'
    };

    res.json({
      success: true,
      data: { interview: enrichedInterview }
    });

  } catch (error) {
    console.error('Error fetching interview:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   PUT /api/interviews/:id
// @desc    Update interview (reschedule)
// @access  Private (Recruiter only)
router.put('/:id', authenticateToken, [
  body('scheduledDate')
    .optional()
    .isISO8601()
    .withMessage('Valid scheduled date is required'),
  body('scheduledTime')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Valid time format (HH:MM) is required'),
  body('duration')
    .optional()
    .isInt({ min: 15, max: 480 })
    .withMessage('Duration must be between 15 and 480 minutes'),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Location must not exceed 200 characters'),
  body('meetingLink')
    .optional()
    .isURL()
    .withMessage('Meeting link must be a valid URL'),
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

    // Verify user is a recruiter
    if (req.user.role !== 'recruiter') {
      return res.status(403).json({
        success: false,
        message: 'Only recruiters can update interviews'
      });
    }

    const { id } = req.params;
    const recruiterId = req.user.userId;

    // Find interview and verify ownership
    const interview = await Interview.findById(id)
      .populate('candidateId', 'firstName lastName email')
      .populate('jobId', 'jobTitle companyName');

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    if (interview.recruiterId.toString() !== recruiterId) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own scheduled interviews'
      });
    }

    // Check if interview can be updated
    if (!['scheduled', 'confirmed'].includes(interview.status)) {
      return res.status(400).json({
        success: false,
        message: 'Only scheduled or confirmed interviews can be updated'
      });
    }

    const { scheduledDate, scheduledTime, duration, location, meetingLink, notes } = req.body;

    // If rescheduling, validate new date/time
    if (scheduledDate || scheduledTime) {
      const newDate = scheduledDate || interview.scheduledDate.toISOString().split('T')[0];
      const newTime = scheduledTime || interview.scheduledTime;
      const newDateTime = new Date(`${newDate}T${newTime}`);

      if (newDateTime <= new Date()) {
        return res.status(400).json({
          success: false,
          message: 'Interview must be rescheduled for a future date and time'
        });
      }

      // Check for conflicts
      const conflictingInterview = await Interview.findOne({
        _id: { $ne: id },
        $or: [
          { candidateId: interview.candidateId._id },
          { recruiterId }
        ],
        scheduledDate: {
          $gte: new Date(newDateTime.getTime() - 30 * 60 * 1000),
          $lte: new Date(newDateTime.getTime() + ((duration || interview.duration) + 30) * 60 * 1000)
        },
        status: { $in: ['scheduled', 'confirmed'] }
      });

      if (conflictingInterview) {
        return res.status(400).json({
          success: false,
          message: 'There is a scheduling conflict with another interview'
        });
      }
    }

    // Update interview
    const updateData = {};
    if (scheduledDate) {
      updateData.scheduledDate = new Date(`${scheduledDate}T${interview.scheduledTime}`);
    }
    if (scheduledTime) {
      updateData.scheduledTime = scheduledTime;
      if (updateData.scheduledDate) {
        updateData.scheduledDate = new Date(`${scheduledDate}T${scheduledTime}`);
      } else {
        updateData.scheduledDate = new Date(`${interview.scheduledDate.toISOString().split('T')[0]}T${scheduledTime}`);
      }
    }
    if (duration) updateData.duration = duration;
    if (location !== undefined) updateData.location = location;
    if (meetingLink !== undefined) updateData.meetingLink = meetingLink;

    // If date/time changed, mark as rescheduled
    if (scheduledDate || scheduledTime) {
      updateData.status = 'rescheduled';
    }

    const updatedInterview = await Interview.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate([
      { path: 'candidateId', select: 'firstName lastName email' },
      { path: 'jobId', select: 'jobTitle companyName' }
    ]);

    // Send rescheduling notifications
    if (scheduledDate || scheduledTime) {
      try {
        await emailService.sendEmail({
          to: interview.candidateId.email,
          subject: `Interview Rescheduled - ${interview.jobId.jobTitle}`,
          template: 'interview-rescheduled',
          data: {
            candidateName: interview.candidateId.firstName,
            jobTitle: interview.jobId.jobTitle,
            companyName: interview.jobId.companyName,
            oldDate: interview.scheduledDate.toISOString().split('T')[0],
            oldTime: interview.scheduledTime,
            newDate: updatedInterview.scheduledDate.toISOString().split('T')[0],
            newTime: updatedInterview.scheduledTime,
            duration: `${updatedInterview.duration} minutes`,
            location: updatedInterview.location || 'Online',
            meetingLink: updatedInterview.meetingLink,
            notes
          }
        });

        await sendNotification({
          userId: interview.candidateId._id,
          type: 'interview_rescheduled',
          title: 'Interview Rescheduled',
          message: `Your interview for ${interview.jobId.jobTitle} has been rescheduled`,
          data: {
            interviewId: interview._id,
            jobTitle: interview.jobId.jobTitle,
            newDate: updatedInterview.scheduledDate.toISOString().split('T')[0],
            newTime: updatedInterview.scheduledTime
          }
        });
      } catch (notificationError) {
        console.error('Error sending reschedule notifications:', notificationError);
      }
    }

    res.json({
      success: true,
      message: 'Interview updated successfully',
      data: { interview: updatedInterview }
    });

  } catch (error) {
    console.error('Error updating interview:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   PUT /api/interviews/:id/status
// @desc    Update interview status
// @access  Private
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

    const { id } = req.params;
    const { status, notes, feedback } = req.body;
    const userId = req.user.userId;
    const userRole = req.user.role;

    // Find interview
    const interview = await Interview.findById(id)
      .populate('candidateId', 'firstName lastName email')
      .populate('recruiterId', 'firstName lastName email')
      .populate('jobId', 'jobTitle companyName');

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    // Check permissions
    const canUpdate = 
      (userRole === 'recruiter' && interview.recruiterId._id.toString() === userId) ||
      (userRole === 'applicant' && interview.candidateId._id.toString() === userId && 
       ['confirmed', 'cancelled'].includes(status));

    if (!canUpdate) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions to update interview status'
      });
    }

    // Validate status transitions
    const validTransitions = {
      'scheduled': ['confirmed', 'rescheduled', 'cancelled'],
      'confirmed': ['completed', 'cancelled', 'no-show'],
      'rescheduled': ['confirmed', 'cancelled'],
      'completed': [],
      'cancelled': [],
      'no-show': []
    };

    if (!validTransitions[interview.status]?.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot change status from ${interview.status} to ${status}`
      });
    }

    // Update interview
    const updateData = {
      status,
      updatedBy: userId
    };

    if (notes) {
      updateData.interviewerNotes = notes;
    }

    if (status === 'completed' && feedback) {
      updateData.feedback = feedback;
    }

    const updatedInterview = await Interview.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    // Update application status if interview completed
    if (status === 'completed') {
      await Application.findByIdAndUpdate(interview.applicationId, {
        $push: {
          timeline: {
            status: 'interviewed',
            timestamp: new Date(),
            updatedBy: userId,
            notes: `Interview completed: ${interview.title}`
          }
        }
      });
    }

    // Send notifications
    try {
      const recipientId = userRole === 'recruiter' ? interview.candidateId._id : interview.recruiterId._id;
      const recipientEmail = userRole === 'recruiter' ? interview.candidateId.email : interview.recruiterId.email;
      const senderName = userRole === 'recruiter' ? 
        `${interview.recruiterId.firstName} ${interview.recruiterId.lastName}` :
        `${interview.candidateId.firstName} ${interview.candidateId.lastName}`;

      await sendNotification({
        userId: recipientId,
        type: 'interview_status_update',
        title: 'Interview Status Updated',
        message: `Interview status changed to ${status}`,
        data: {
          interviewId: interview._id,
          jobTitle: interview.jobId.jobTitle,
          status,
          notes
        }
      });

      // Send email for important status changes
      if (['cancelled', 'completed'].includes(status)) {
        await emailService.sendEmail({
          to: recipientEmail,
          subject: `Interview ${status.charAt(0).toUpperCase() + status.slice(1)} - ${interview.jobId.jobTitle}`,
          template: 'interview-status-update',
          data: {
            recipientName: userRole === 'recruiter' ? interview.candidateId.firstName : interview.recruiterId.firstName,
            jobTitle: interview.jobId.jobTitle,
            companyName: interview.jobId.companyName,
            status,
            notes,
            senderName
          }
        });
      }
    } catch (notificationError) {
      console.error('Error sending status update notifications:', notificationError);
    }

    res.json({
      success: true,
      message: 'Interview status updated successfully',
      data: { interview: updatedInterview }
    });

  } catch (error) {
    console.error('Error updating interview status:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Helper functions
const getNextInterviewRound = async (applicationId) => {
  const existingInterviews = await Interview.countDocuments({ applicationId });
  return existingInterviews + 1;
};

const getInterviewsSummary = async (baseQuery) => {
  const summary = await Interview.aggregate([
    { $match: baseQuery },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        scheduled: { $sum: { $cond: [{ $eq: ['$status', 'scheduled'] }, 1, 0] } },
        confirmed: { $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] } },
        completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
        cancelled: { $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] } },
        upcoming: { $sum: { $cond: [{ $gte: ['$scheduledDate', new Date()] }, 1, 0] } },
        past: { $sum: { $cond: [{ $lt: ['$scheduledDate', new Date()] }, 1, 0] } }
      }
    }
  ]);

  return summary[0] || {
    total: 0,
    scheduled: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
    upcoming: 0,
    past: 0
  };
};

// @route   PUT /api/v2/interviews/:id/reschedule
// @desc    Reschedule an interview
// @access  Private (Recruiter only)
router.put('/:id/reschedule', authenticateToken, [
  body('scheduledDate').isISO8601().withMessage('Valid scheduled date is required'),
  body('scheduledTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid time format required (HH:MM)'),
  body('reason').optional().trim().isLength({ max: 500 }).withMessage('Reason must not exceed 500 characters')
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

    const { id } = req.params;
    const { scheduledDate, scheduledTime, reason } = req.body;
    const userId = req.user.userId;

    // Find interview
    const interview = await Interview.findById(id)
      .populate('candidateId', 'firstName lastName email')
      .populate('recruiterId', 'firstName lastName email companyName')
      .populate('jobId', 'jobTitle companyName');

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    // Check permissions
    if (req.user.role === 'recruiter' && interview.recruiterId._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if interview can be rescheduled
    if (!['scheduled', 'confirmed'].includes(interview.status)) {
      return res.status(400).json({
        success: false,
        message: 'Only scheduled or confirmed interviews can be rescheduled'
      });
    }

    // Store old schedule for notification
    const oldDate = interview.scheduledDate;
    const oldTime = interview.scheduledTime;

    // Update interview
    const updatedInterview = await Interview.findByIdAndUpdate(
      id,
      {
        scheduledDate: new Date(scheduledDate),
        scheduledTime,
        status: 'rescheduled',
        updatedBy: userId,
        updatedAt: new Date(),
        $push: {
          statusHistory: {
            status: 'rescheduled',
            timestamp: new Date(),
            updatedBy: userId,
            notes: reason || `Rescheduled from ${oldDate.toISOString().split('T')[0]} ${oldTime} to ${scheduledDate} ${scheduledTime}`
          }
        }
      },
      { new: true }
    ).populate([
      { path: 'candidateId', select: 'firstName lastName email' },
      { path: 'recruiterId', select: 'firstName lastName email companyName' },
      { path: 'jobId', select: 'jobTitle companyName' }
    ]);

    // Send notifications to both parties
    try {
      const candidateNotification = {
        userId: interview.candidateId._id,
        type: 'interview_rescheduled',
        title: 'Interview Rescheduled',
        message: `Your interview for ${interview.jobId.jobTitle} has been rescheduled to ${scheduledDate} at ${scheduledTime}`,
        data: {
          interviewId: interview._id,
          jobTitle: interview.jobId.jobTitle,
          oldDate: oldDate.toISOString().split('T')[0],
          oldTime,
          newDate: scheduledDate,
          newTime: scheduledTime,
          reason
        }
      };

      await sendNotification(candidateNotification);

      // Send email to candidate
      await emailService.sendEmail({
        to: interview.candidateId.email,
        subject: `Interview Rescheduled - ${interview.jobId.jobTitle}`,
        template: 'interview-rescheduled',
        data: {
          candidateName: interview.candidateId.firstName,
          jobTitle: interview.jobId.jobTitle,
          companyName: interview.jobId.companyName,
          oldDate: oldDate.toISOString().split('T')[0],
          oldTime,
          newDate: scheduledDate,
          newTime: scheduledTime,
          reason,
          recruiterName: `${interview.recruiterId.firstName} ${interview.recruiterId.lastName}`
        }
      });

    } catch (notificationError) {
      console.error('Error sending reschedule notifications:', notificationError);
    }

    res.json({
      success: true,
      message: 'Interview rescheduled successfully',
      data: { interview: updatedInterview }
    });

  } catch (error) {
    console.error('Error rescheduling interview:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   DELETE /api/v2/interviews/:id
// @desc    Cancel an interview
// @access  Private (Recruiter only)
router.delete('/:id', authenticateToken, [
  body('reason').optional().trim().isLength({ max: 500 }).withMessage('Reason must not exceed 500 characters')
], async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user.userId;

    // Find interview
    const interview = await Interview.findById(id)
      .populate('candidateId', 'firstName lastName email')
      .populate('recruiterId', 'firstName lastName email companyName')
      .populate('jobId', 'jobTitle companyName');

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    // Check permissions
    if (req.user.role === 'recruiter' && interview.recruiterId._id.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Check if interview can be cancelled
    if (['completed', 'cancelled'].includes(interview.status)) {
      return res.status(400).json({
        success: false,
        message: 'Interview is already completed or cancelled'
      });
    }

    // Update interview status to cancelled
    const updatedInterview = await Interview.findByIdAndUpdate(
      id,
      {
        status: 'cancelled',
        updatedBy: userId,
        updatedAt: new Date(),
        $push: {
          statusHistory: {
            status: 'cancelled',
            timestamp: new Date(),
            updatedBy: userId,
            notes: reason || 'Interview cancelled'
          }
        }
      },
      { new: true }
    );

    // Send notifications
    try {
      await sendNotification({
        userId: interview.candidateId._id,
        type: 'interview_cancelled',
        title: 'Interview Cancelled',
        message: `Your interview for ${interview.jobId.jobTitle} has been cancelled`,
        data: {
          interviewId: interview._id,
          jobTitle: interview.jobId.jobTitle,
          scheduledDate: interview.scheduledDate.toISOString().split('T')[0],
          scheduledTime: interview.scheduledTime,
          reason
        }
      });

      // Send email to candidate
      await emailService.sendEmail({
        to: interview.candidateId.email,
        subject: `Interview Cancelled - ${interview.jobId.jobTitle}`,
        template: 'interview-cancelled',
        data: {
          candidateName: interview.candidateId.firstName,
          jobTitle: interview.jobId.jobTitle,
          companyName: interview.jobId.companyName,
          scheduledDate: interview.scheduledDate.toISOString().split('T')[0],
          scheduledTime: interview.scheduledTime,
          reason,
          recruiterName: `${interview.recruiterId.firstName} ${interview.recruiterId.lastName}`
        }
      });

    } catch (notificationError) {
      console.error('Error sending cancellation notifications:', notificationError);
    }

    res.json({
      success: true,
      message: 'Interview cancelled successfully',
      data: { interview: updatedInterview }
    });

  } catch (error) {
    console.error('Error cancelling interview:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/v2/interviews/debug
// @desc    Debug interviews data for troubleshooting
// @access  Private
router.get('/debug', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const userRole = req.user.role;

    console.log('🔍 Debug interviews for user:', userId, 'Role:', userRole);

    // Get all interviews in database
    const allInterviews = await Interview.find({}).lean();
    
    // Get interviews for this user
    const userQuery = userRole === 'recruiter' ? { recruiterId: userId } : { candidateId: userId };
    const userInterviews = await Interview.find(userQuery).lean();
    
    // Get interviews with populated data
    const populatedInterviews = await Interview.find(userQuery)
      .populate('candidateId', 'firstName lastName email')
      .populate('recruiterId', 'firstName lastName companyName')
      .populate('jobId', 'jobTitle companyName')
      .populate('applicationId', 'status')
      .lean();

    console.log('📊 Total interviews in DB:', allInterviews.length);
    console.log('📊 User interviews found:', userInterviews.length);
    console.log('📊 Populated interviews:', populatedInterviews.length);

    res.json({
      success: true,
      debug: {
        userId,
        userRole,
        totalInterviewsInDB: allInterviews.length,
        userInterviewsFound: userInterviews.length,
        populatedInterviews: populatedInterviews.length,
        sampleInterviews: userInterviews.slice(0, 3).map(interview => ({
          _id: interview._id,
          candidateId: interview.candidateId,
          recruiterId: interview.recruiterId,
          jobId: interview.jobId,
          scheduledDate: interview.scheduledDate,
          status: interview.status,
          interviewType: interview.interviewType
        })),
        allInterviewsUserIds: allInterviews.map(interview => ({
          candidateId: interview.candidateId,
          recruiterId: interview.recruiterId,
          status: interview.status
        }))
      }
    });

  } catch (error) {
    console.error('Error in interviews debug:', error);
    res.status(500).json({
      success: false,
      message: 'Debug error',
      error: error.message
    });
  }
});

export default router;
