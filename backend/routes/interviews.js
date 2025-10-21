import express from 'express';
import jwt from 'jsonwebtoken';
import Interview from '../models/Interview.js';
import { BaseUser } from '../models/UserModels.js';
import Job from '../models/Job.js';
import Application from '../models/unified/Application.js';
import { body, validationResult, param } from 'express-validator';
import { NotificationService } from '../services/notifications.js';

const router = express.Router();

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ success: false, message: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-jwt-secret-key-change-this-in-production');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ success: false, message: 'Invalid or expired token' });
  }
};

// Apply authentication middleware to all routes
router.use(authenticateToken);

// GET /api/interviews - Get all interviews for the authenticated user
router.get('/', async (req, res) => {
  try {
    const { status, upcoming, page = 1, limit = 10 } = req.query;
    const userId = req.user.userId;
    const userRole = req.user.role;

    // Build query based on user role
    let query = {};
    if (userRole === 'recruiter') {
      query.recruiterId = userId;
    } else if (userRole === 'applicant') {
      query.candidateId = userId;
    } else {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only recruiters and applicants can view interviews.'
      });
    }

    // Add status filter if provided
    if (status) {
      query.status = status;
    }

    // Add upcoming filter if provided
    if (upcoming === 'true') {
      query.scheduledDate = { $gte: new Date() };
      query.status = { $in: ['scheduled', 'confirmed'] };
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Fetch interviews with populated data
    console.log('🔍 Fetching interviews with query:', query);
    const interviews = await Interview.find(query)
      .populate('candidateId', 'firstName lastName email phone profilePicture')
      .populate('jobId', 'title companyName location')
      .populate('recruiterId', 'firstName lastName email')
      .sort({ scheduledDate: 1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    console.log('📊 Found interviews:', interviews.length);
    
    // Transform interviews to include basic info without population for now
    const transformedInterviews = interviews.map((interview, index) => ({
      _id: interview._id,
      id: interview._id,
      title: interview.title,
      description: interview.description,
      scheduledDate: interview.scheduledDate,
      scheduledTime: interview.scheduledTime,
      duration: interview.duration,
      status: interview.status,
      interviewType: interview.interviewType,
      location: interview.location,
      meetingLink: interview.meetingLink,
      candidateId: interview.candidateId,
      recruiterId: interview.recruiterId,
      jobId: interview.jobId,
      applicationId: interview.applicationId,
      // Frontend expected fields
      candidateName: interview.candidateId ? `${interview.candidateId.firstName || ''} ${interview.candidateId.lastName || ''}`.trim() : 'Unknown Candidate',
      candidateEmail: interview.candidateId?.email || 'No email available',
      jobTitle: interview.jobId?.title || 'Position not available',
      companyName: interview.jobId?.companyName || 'Company not available',
      interviewDate: interview.scheduledDate.toISOString().split('T')[0],
      interviewTime: interview.scheduledTime,
      interviewer: 'John Recruiter',
      round: interview.round || 1,
      avatar: '👤',
      candidate: {
        id: interview.candidateId?._id || interview.candidateId,
        name: interview.candidateId ? `${interview.candidateId.firstName || ''} ${interview.candidateId.lastName || ''}`.trim() : 'Unknown Candidate',
        email: interview.candidateId?.email || 'No email available',
        phone: interview.candidateId?.phone || 'No phone available'
      }
    }));

    // Get total count for pagination
    const total = await Interview.countDocuments(query);

    res.json({
      success: true,
      data: transformedInterviews,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching interviews:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch interviews',
      error: error.message
    });
  }
});

// GET /api/interviews/:id - Get specific interview
router.get('/:id', [
  param('id').isMongoId().withMessage('Invalid interview ID')
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

    const interviewId = req.params.id;
    const userId = req.user.id;
    const userRole = req.user.role;

    const interview = await Interview.findById(interviewId)
      .populate('candidateId', 'firstName lastName email phone profilePicture skills')
      .populate('recruiterId', 'firstName lastName email company')
      .populate('jobId', 'title company location requirements')
      .populate('applicationId', 'status appliedAt coverLetter');

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    // Check if user has access to this interview
    const hasAccess = (userRole === 'recruiter' && interview.recruiterId._id.toString() === userId) ||
                     (userRole === 'applicant' && interview.candidateId._id.toString() === userId);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: interview
    });
  } catch (error) {
    console.error('Error fetching interview:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch interview',
      error: error.message
    });
  }
});

// POST /api/interviews - Create new interview (recruiters only)
router.post('/', [
  body('candidateId').isMongoId().withMessage('Valid candidate ID is required'),
  body('jobId').isMongoId().withMessage('Valid job ID is required'),
  body('applicationId').isMongoId().withMessage('Valid application ID is required'),
  body('title').trim().isLength({ min: 1 }).withMessage('Interview title is required'),
  body('scheduledDate').isISO8601().withMessage('Valid scheduled date is required'),
  body('scheduledTime').trim().isLength({ min: 1 }).withMessage('Scheduled time is required'),
  body('type').isIn(['video', 'phone', 'in-person', 'online']).withMessage('Invalid interview type'),
  body('duration').optional().isInt({ min: 15, max: 480 }).withMessage('Duration must be between 15 and 480 minutes')
], async (req, res) => {
  try {
    console.log('📝 Creating interview with body:', req.body);
    console.log('👤 User info:', { id: req.user.id, userId: req.user.userId, role: req.user.role });
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    if (req.user.role !== 'recruiter') {
      return res.status(403).json({
        success: false,
        message: 'Only recruiters can schedule interviews'
      });
    }

    const {
      candidateId,
      jobId,
      applicationId,
      title,
      description,
      scheduledDate,
      scheduledTime,
      duration,
      type,
      location,
      meetingLink,
      interviewType,
      round
    } = req.body;

    // Verify the application exists and belongs to the candidate and job
    const application = await Application.findOne({
      _id: applicationId,
      applicantId: candidateId,
      jobId: jobId
    });

    if (!application) {
      return res.status(400).json({
        success: false,
        message: 'Invalid application or application does not match candidate and job'
      });
    }

    // Create the interview
    const interview = new Interview({
      candidateId,
      recruiterId: req.user.userId || req.user.id,
      jobId,
      applicationId,
      title,
      description,
      scheduledDate,
      scheduledTime,
      duration: duration || 60,
      type: type || 'video',
      location,
      meetingLink,
      interviewType: interviewType || 'screening',
      round: round || 1,
      createdBy: req.user.id
    });

    await interview.save();

    // Populate the created interview
    const populatedInterview = await Interview.findById(interview._id)
      .populate('candidateId', 'firstName lastName email')
      .populate('jobId', 'title company');

    // Send notification to applicant
    try {
      await NotificationService.notifyInterviewScheduled(
        applicationId,
        candidateId,
        scheduledDate,
        scheduledTime,
        type || 'video'
      );
      console.log('✅ Interview scheduled notification sent');
    } catch (notificationError) {
      console.error('❌ Failed to send interview notification:', notificationError);
      // Don't fail the request if notification fails
    }

    res.status(201).json({
      success: true,
      message: 'Interview scheduled successfully',
      data: populatedInterview
    });
  } catch (error) {
    console.error('Error creating interview:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to schedule interview',
      error: error.message
    });
  }
});

// PUT /api/interviews/:id - Update interview
router.put('/:id', [
  param('id').isMongoId().withMessage('Invalid interview ID'),
  body('title').optional().trim().isLength({ min: 1 }).withMessage('Title cannot be empty'),
  body('scheduledDate').optional().isISO8601().withMessage('Valid scheduled date is required'),
  body('scheduledTime').optional().trim().isLength({ min: 1 }).withMessage('Scheduled time cannot be empty'),
  body('status').optional().isIn(['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'rescheduled', 'no-show']).withMessage('Invalid status'),
  body('type').optional().isIn(['video', 'phone', 'in-person', 'online']).withMessage('Invalid interview type')
], async (req, res) => {
  try {
    console.log('🔄 Updating interview with body:', req.body);
    console.log('👤 User info:', { id: req.user.id, userId: req.user.userId, role: req.user.role });
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('❌ Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const interviewId = req.params.id;
    const userId = req.user.userId || req.user.id;
    const userRole = req.user.role;

    const interview = await Interview.findById(interviewId);
    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    // Check if user has permission to update
    const canUpdate = (userRole === 'recruiter' && interview.recruiterId.toString() === userId) ||
                     (userRole === 'applicant' && interview.candidateId.toString() === userId);

    if (!canUpdate) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Store original values for notification comparison
    const originalStatus = interview.status;
    const originalDate = interview.scheduledDate;
    const originalTime = interview.scheduledTime;

    // Update fields
    const updateFields = { ...req.body, updatedBy: userId };
    
    const updatedInterview = await Interview.findByIdAndUpdate(
      interviewId,
      updateFields,
      { new: true, runValidators: true }
    ).populate('candidateId', 'firstName lastName email')
     .populate('recruiterId', 'firstName lastName email company')
     .populate('jobId', 'title company location');

    // Send notifications based on changes
    try {
      const newStatus = updatedInterview.status;
      const newDate = updatedInterview.scheduledDate;
      const newTime = updatedInterview.scheduledTime;

      // Check if interview was cancelled
      if (originalStatus !== 'cancelled' && newStatus === 'cancelled') {
        await NotificationService.notifyInterviewCancelled(
          interview.applicationId,
          interview.candidateId,
          req.body.reason || 'No reason provided'
        );
        console.log('✅ Interview cancelled notification sent');
      }
      // Check if interview was rescheduled (date or time changed)
      else if ((originalDate?.getTime() !== newDate?.getTime() || originalTime !== newTime) && 
               originalStatus !== 'cancelled' && newStatus !== 'cancelled') {
        await NotificationService.notifyInterviewRescheduled(
          interview.applicationId,
          interview.candidateId,
          newDate,
          newTime,
          updatedInterview.type
        );
        console.log('✅ Interview rescheduled notification sent');
      }
    } catch (notificationError) {
      console.error('❌ Failed to send interview update notification:', notificationError);
      // Don't fail the request if notification fails
    }

    res.json({
      success: true,
      message: 'Interview updated successfully',
      data: updatedInterview
    });
  } catch (error) {
    console.error('Error updating interview:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update interview',
      error: error.message
    });
  }
});

// PUT /api/interviews/:id/feedback - Add feedback to interview (recruiters only)
router.put('/:id/feedback', [
  param('id').isMongoId().withMessage('Invalid interview ID'),
  body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('recommendation').optional().isIn(['hire', 'reject', 'next-round', 'hold']).withMessage('Invalid recommendation')
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

    if (req.user.role !== 'recruiter') {
      return res.status(403).json({
        success: false,
        message: 'Only recruiters can add feedback'
      });
    }

    const interviewId = req.params.id;
    const interview = await Interview.findById(interviewId);

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    if (interview.recruiterId.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Update feedback
    interview.feedback = { ...interview.feedback, ...req.body };
    interview.updatedBy = req.user.userId;
    await interview.save();

    res.json({
      success: true,
      message: 'Feedback added successfully',
      data: interview
    });
  } catch (error) {
    console.error('Error adding feedback:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add feedback',
      error: error.message
    });
  }
});

// DELETE /api/interviews/:id - Delete interview (recruiters only)
router.delete('/:id', [
  param('id').isMongoId().withMessage('Invalid interview ID')
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

    if (req.user.role !== 'recruiter') {
      return res.status(403).json({
        success: false,
        message: 'Only recruiters can delete interviews'
      });
    }

    const interviewId = req.params.id;
    const interview = await Interview.findById(interviewId);

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    if (interview.recruiterId.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Send cancellation notification before deleting
    try {
      await NotificationService.notifyInterviewCancelled(
        interview.applicationId,
        interview.candidateId,
        'Interview has been cancelled and removed'
      );
      console.log('✅ Interview deletion notification sent');
    } catch (notificationError) {
      console.error('❌ Failed to send interview deletion notification:', notificationError);
      // Don't fail the request if notification fails
    }

    await Interview.findByIdAndDelete(interviewId);

    res.json({
      success: true,
      message: 'Interview deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting interview:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete interview',
      error: error.message
    });
  }
});

export default router;
