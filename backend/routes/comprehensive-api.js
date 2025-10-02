import express from 'express';
import mongoose from 'mongoose';
import Job from '../models/Job.js';
import Application from '../models/unified/Application.js';
import ApplicationDetails from '../models/ApplicationDetails.js';
import Interview from '../models/Interview.js';
import { BaseUser, Applicant, Recruiter } from '../models/UserModels.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// ============================================================================
// JOB MANAGEMENT ROUTES
// ============================================================================

// Enhanced job creation with automatic status management
router.post('/jobs', authenticateToken, async (req, res) => {
  try {
    const { role, userId } = req.user;
    
    if (role !== 'recruiter') {
      return res.status(403).json({
        success: false,
        message: 'Only recruiters can post jobs'
      });
    }

    const jobData = {
      ...req.body,
      postedBy: userId,
      recruiterInfo: {
        recruiterId: userId
      }
    };

    // Automatic status management based on deadline
    if (jobData.applicationDeadline) {
      const deadline = new Date(jobData.applicationDeadline);
      const now = new Date();
      
      if (deadline < now) {
        // If deadline is in past, force to closed status
        jobData.status = 'closed';
      } else if (jobData.status === 'active') {
        // If deadline is in future and user wants active, allow it
        jobData.status = 'active';
      }
      // If user explicitly wants draft, keep as draft regardless of deadline
    }

    const job = new Job(jobData);
    await job.save();

    // Populate recruiter info
    await job.populate('postedBy', 'firstName lastName companyInfo');

    res.status(201).json({
      success: true,
      message: 'Job posted successfully',
      data: { job }
    });

  } catch (error) {
    console.error('Job creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create job',
      error: error.message
    });
  }
});

// Enhanced job update with deadline management
router.put('/jobs/:id', authenticateToken, async (req, res) => {
  try {
    const { role, userId } = req.user;
    const { id } = req.params;

    if (role !== 'recruiter') {
      return res.status(403).json({
        success: false,
        message: 'Only recruiters can update jobs'
      });
    }

    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    if (job.postedBy.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own jobs'
      });
    }

    // Handle deadline and status logic
    const updateData = { ...req.body };
    
    if (updateData.applicationDeadline || updateData.status) {
      const deadline = new Date(updateData.applicationDeadline || job.applicationDeadline);
      const now = new Date();
      
      if (updateData.status === 'active' && deadline < now) {
        // If trying to make active but deadline passed, force to closed
        updateData.status = 'closed';
      } else if (updateData.status === 'draft') {
        // If explicitly setting to draft, allow regardless of deadline
        updateData.status = 'draft';
      }
    }

    const updatedJob = await Job.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate('postedBy', 'firstName lastName companyInfo');

    res.json({
      success: true,
      message: 'Job updated successfully',
      data: { job: updatedJob }
    });

  } catch (error) {
    console.error('Job update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update job',
      error: error.message
    });
  }
});

// Get jobs with filtering by status (Active, Draft, Closed)
router.get('/jobs', authenticateToken, async (req, res) => {
  try {
    const { role, userId } = req.user;
    const { status, page = 1, limit = 10 } = req.query;

    let query = {};
    
    if (role === 'recruiter') {
      query.postedBy = userId;
      if (status) {
        query.status = status.toLowerCase();
      }
    } else if (role === 'applicant') {
      // Applicants see only active jobs
      query.status = 'active';
      query.applicationDeadline = { $gt: new Date() };
    }

    const jobs = await Job.find(query)
      .populate('postedBy', 'firstName lastName companyInfo')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Job.countDocuments(query);

    res.json({
      success: true,
      data: {
        jobs,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('Jobs fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch jobs',
      error: error.message
    });
  }
});

// ============================================================================
// APPLICATION MANAGEMENT ROUTES
// ============================================================================

// Enhanced job application with comprehensive details
router.post('/applications', authenticateToken, async (req, res) => {
  try {
    const { role, userId } = req.user;
    const { jobId, applicationData } = req.body;

    if (role !== 'applicant') {
      return res.status(403).json({
        success: false,
        message: 'Only applicants can apply for jobs'
      });
    }

    // Check if job exists and is active
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    if (job.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'This job is not accepting applications'
      });
    }

    if (job.applicationDeadline && new Date(job.applicationDeadline) < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Application deadline has passed'
      });
    }

    // Check for duplicate application
    const existingApplication = await Application.findOne({
      jobId,
      applicantId: userId
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this job'
      });
    }

    // Create main application record
    const application = new Application({
      jobId,
      applicantId: userId,
      status: 'applied',
      appliedAt: new Date()
    });

    await application.save();

    // Create comprehensive application details
    const applicant = await BaseUser.findById(userId);
    
    const applicationDetails = new ApplicationDetails({
      applicationId: application._id,
      applicantId: userId,
      jobId,
      personalInfo: {
        firstName: applicant.firstName,
        lastName: applicant.lastName,
        email: applicant.email,
        phone: applicant.phone,
        currentLocation: applicant.currentLocation || {},
        profilePicture: applicant.profilePicture || {}
      },
      education: applicant.education || [],
      workExperience: applicant.workExperience || [],
      skills: applicant.skills || { technical: [], soft: [], languages: [] },
      careerInfo: {
        ...applicant.careerInfo,
        ...applicationData.careerInfo
      },
      resumeInfo: {
        currentResume: {
          url: applicant.documents?.resumeUrl || applicant.resume_url,
          filename: applicant.documents?.resumeFilename,
          uploadedAt: applicant.documents?.resumeUploadedAt
        }
      },
      applicationSpecific: {
        coverLetter: applicationData.coverLetter,
        whyInterestedInRole: applicationData.whyInterestedInRole,
        whyInterestedInCompany: applicationData.whyInterestedInCompany,
        availabilityForInterview: applicationData.availabilityForInterview
      },
      consent: {
        dataProcessing: true,
        contactForFutureOpportunities: applicationData.contactForFutureOpportunities || true
      }
    });

    await applicationDetails.save();

    // Update job application count
    await Job.findByIdAndUpdate(jobId, { $inc: { applicationsCount: 1 } });

    // Send notification to recruiter (implement notification system)
    // await sendNotificationToRecruiter(job.postedBy, application);

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: { 
        application,
        applicationDetails: applicationDetails._id
      }
    });

  } catch (error) {
    console.error('Application submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit application',
      error: error.message
    });
  }
});

// Get applications for a specific job (Recruiter view)
router.get('/jobs/:jobId/applications', authenticateToken, async (req, res) => {
  try {
    const { role, userId } = req.user;
    const { jobId } = req.params;

    if (role !== 'recruiter') {
      return res.status(403).json({
        success: false,
        message: 'Only recruiters can view job applications'
      });
    }

    // Verify job ownership
    const job = await Job.findById(jobId);
    if (!job || job.postedBy.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only view applications for your own jobs'
      });
    }

    const applications = await Application.find({ jobId })
      .populate('applicantId', 'firstName lastName email phone profilePicture')
      .populate('jobId', 'jobTitle companyName')
      .sort({ appliedAt: -1 });

    // Get detailed application data
    const applicationsWithDetails = await Promise.all(
      applications.map(async (app) => {
        const details = await ApplicationDetails.findOne({ applicationId: app._id });
        return {
          ...app.toObject(),
          details
        };
      })
    );

    res.json({
      success: true,
      data: {
        job: {
          _id: job._id,
          jobTitle: job.jobTitle,
          companyName: job.companyName
        },
        applications: applicationsWithDetails,
        totalApplications: applications.length
      }
    });

  } catch (error) {
    console.error('Applications fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch applications',
      error: error.message
    });
  }
});

// Update application status
router.put('/applications/:id/status', authenticateToken, async (req, res) => {
  try {
    const { role, userId } = req.user;
    const { id } = req.params;
    const { status, notes } = req.body;

    if (role !== 'recruiter') {
      return res.status(403).json({
        success: false,
        message: 'Only recruiters can update application status'
      });
    }

    const application = await Application.findById(id)
      .populate('jobId', 'postedBy jobTitle companyName')
      .populate('applicantId', 'firstName lastName email');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Verify job ownership
    if (application.jobId.postedBy.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only update applications for your own jobs'
      });
    }

    const validStatuses = ['applied', 'reviewing', 'shortlisted', 'interview', 'rejected', 'hired'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    // Update application
    application.status = status;
    application.updatedAt = new Date();
    
    // Add to timeline
    application.timeline.push({
      status,
      timestamp: new Date(),
      updatedBy: userId,
      notes: notes || ''
    });

    await application.save();

    // If status is interview, create interview record
    if (status === 'interview') {
      const existingInterview = await Interview.findOne({
        applicationId: application._id
      });

      if (!existingInterview) {
        const interview = new Interview({
          candidateId: application.applicantId._id,
          recruiterId: userId,
          jobId: application.jobId._id,
          applicationId: application._id,
          title: `Interview for ${application.jobId.jobTitle}`,
          status: 'scheduled',
          round: 1,
          type: 'initial'
        });

        await interview.save();
      }
    }

    // Send notification to applicant
    // await sendNotificationToApplicant(application.applicantId._id, status, application);

    res.json({
      success: true,
      message: 'Application status updated successfully',
      data: { application }
    });

  } catch (error) {
    console.error('Application status update error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update application status',
      error: error.message
    });
  }
});

// ============================================================================
// INTERVIEW MANAGEMENT ROUTES
// ============================================================================

// Get interviews for recruiter
router.get('/interviews', authenticateToken, async (req, res) => {
  try {
    const { role, userId } = req.user;
    const { status } = req.query;

    let query = {};
    
    if (role === 'recruiter') {
      query.recruiterId = userId;
    } else if (role === 'applicant') {
      query.candidateId = userId;
    }

    if (status) {
      query.status = status;
    }

    // Exclude completed interviews
    if (!status) {
      query.status = { $ne: 'completed' };
    }

    const interviews = await Interview.find(query)
      .populate('candidateId', 'firstName lastName email phone')
      .populate('jobId', 'jobTitle companyName')
      .populate('applicationId', 'status appliedAt')
      .sort({ scheduledDate: 1 });

    res.json({
      success: true,
      data: { interviews }
    });

  } catch (error) {
    console.error('Interviews fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch interviews',
      error: error.message
    });
  }
});

// Schedule interview
router.post('/interviews/:applicationId/schedule', authenticateToken, async (req, res) => {
  try {
    const { role, userId } = req.user;
    const { applicationId } = req.params;
    const { scheduledDate, type, round, notes } = req.body;

    if (role !== 'recruiter') {
      return res.status(403).json({
        success: false,
        message: 'Only recruiters can schedule interviews'
      });
    }

    const application = await Application.findById(applicationId)
      .populate('jobId', 'postedBy jobTitle')
      .populate('applicantId', 'firstName lastName email');

    if (!application || application.jobId.postedBy.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const interview = new Interview({
      candidateId: application.applicantId._id,
      recruiterId: userId,
      jobId: application.jobId._id,
      applicationId,
      title: `${type} Interview - ${application.jobId.jobTitle}`,
      scheduledDate: new Date(scheduledDate),
      type,
      round,
      status: 'scheduled',
      notes
    });

    await interview.save();

    // Update application status to interview
    application.status = 'interview';
    await application.save();

    res.status(201).json({
      success: true,
      message: 'Interview scheduled successfully',
      data: { interview }
    });

  } catch (error) {
    console.error('Interview scheduling error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to schedule interview',
      error: error.message
    });
  }
});

// Complete interview and remove from active list
router.put('/interviews/:id/complete', authenticateToken, async (req, res) => {
  try {
    const { role, userId } = req.user;
    const { id } = req.params;
    const { feedback, rating, nextSteps } = req.body;

    if (role !== 'recruiter') {
      return res.status(403).json({
        success: false,
        message: 'Only recruiters can complete interviews'
      });
    }

    const interview = await Interview.findById(id);
    if (!interview || interview.recruiterId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    interview.status = 'completed';
    interview.completedAt = new Date();
    interview.feedback = feedback;
    interview.rating = rating;
    interview.nextSteps = nextSteps;

    await interview.save();

    res.json({
      success: true,
      message: 'Interview completed successfully',
      data: { interview }
    });

  } catch (error) {
    console.error('Interview completion error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete interview',
      error: error.message
    });
  }
});

// ============================================================================
// UNIFIED BUTTON FUNCTIONALITY ROUTES
// ============================================================================

// View job details (unified for all View/View Job/View Details buttons)
router.get('/jobs/:id/details', async (req, res) => {
  try {
    const { id } = req.params;
    
    const job = await Job.findById(id)
      .populate('postedBy', 'firstName lastName companyInfo profilePicture');

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Increment view count
    await job.incrementViews();

    res.json({
      success: true,
      data: { job }
    });

  } catch (error) {
    console.error('Job details fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch job details',
      error: error.message
    });
  }
});

// ============================================================================
// NETWORK ACCESS CONFIGURATION
// ============================================================================

// Health check endpoint for network testing
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

export default router;
