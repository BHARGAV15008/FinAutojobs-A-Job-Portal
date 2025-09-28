import express from 'express';
import EnhancedApplication from '../models/EnhancedApplication.js';
import Job from '../models/Job.js';
import { BaseUser } from '../models/UserModels.js';
import { 
  validateApplication, 
  getApplicationValidationSummary 
} from '../middleware/applicationValidation.js';
import jwt from 'jsonwebtoken';

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
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-jwt-secret-key-change-this-in-production');
    
    const user = await BaseUser.findById(decoded.userId);
    
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

// GET /api/enhanced-applications/validate/:jobId - Get application validation summary
router.get('/validate/:jobId', authenticateToken, getApplicationValidationSummary);

// POST /api/enhanced-applications/apply/:jobId - Submit job application with full validation
router.post('/apply/:jobId', authenticateToken, validateApplication, async (req, res) => {
  try {
    const { jobId } = req.params;
    const { applicationData, documents } = req.body;
    const user = req.userData;
    const job = req.jobData;

    // Create comprehensive application record
    const newApplication = new EnhancedApplication({
      jobId: jobId,
      applicantId: user._id,
      recruiterId: job.postedBy,
      applicationStatus: 'submitted',
      priority: 'medium',
      
      applicationData: {
        personalInfo: {
          fullName: applicationData.personalInfo.fullName,
          email: applicationData.personalInfo.email,
          phone: applicationData.personalInfo.phone,
          address: applicationData.personalInfo.address,
          dateOfBirth: applicationData.personalInfo.dateOfBirth,
          nationality: applicationData.personalInfo.nationality || 'Indian'
        },
        
        professionalInfo: {
          currentJobTitle: applicationData.professionalInfo.currentJobTitle,
          currentCompany: applicationData.professionalInfo.currentCompany,
          totalExperience: applicationData.professionalInfo.totalExperience,
          relevantExperience: applicationData.professionalInfo.relevantExperience,
          currentSalary: applicationData.professionalInfo.currentSalary,
          expectedSalary: applicationData.professionalInfo.expectedSalary,
          noticePeriod: applicationData.professionalInfo.noticePeriod,
          availabilityDate: applicationData.professionalInfo.availabilityDate,
          willingToRelocate: applicationData.professionalInfo.willingToRelocate,
          preferredLocation: applicationData.professionalInfo.preferredLocation
        },
        
        jobSpecificAnswers: applicationData.jobSpecificAnswers || [],
        
        skills: {
          technical: user.skills?.technical || [],
          soft: user.skills?.soft || [],
          languages: user.skills?.languages || [],
          certifications: user.skills?.certifications || []
        },
        
        education: user.education || [],
        workExperience: user.workExperience || [],
        
        additionalInfo: {
          coverLetter: applicationData.additionalInfo.coverLetter,
          whyInterested: applicationData.additionalInfo.whyInterested,
          careerGoals: applicationData.additionalInfo.careerGoals,
          additionalComments: applicationData.additionalInfo.additionalComments,
          referralSource: applicationData.additionalInfo.referralSource,
          portfolioUrl: applicationData.additionalInfo.portfolioUrl,
          linkedinUrl: applicationData.additionalInfo.linkedinUrl,
          githubUrl: applicationData.additionalInfo.githubUrl
        }
      },
      
      documents: {
        resume: documents?.resume || {
          fileUrl: user.resume_url,
          originalName: 'Resume from profile',
          uploadedAt: new Date()
        },
        coverLetter: documents?.coverLetter,
        portfolio: documents?.portfolio || [],
        additionalDocuments: documents?.additional || []
      },
      
      // AI Scoring (initial placeholder - will be calculated by background job)
      aiScoring: {
        overallScore: 0,
        skillsMatch: { score: 0, matchedSkills: [], missingSkills: [] },
        experienceMatch: { score: 0, yearsMatch: false, relevantExperience: false },
        educationMatch: { score: 0, degreeMatch: false, fieldMatch: false },
        keywordAnalysis: {
          resumeKeywords: [],
          jobKeywords: job.requiredSkills || [],
          matchedKeywords: [],
          matchPercentage: 0
        },
        lastAnalyzed: new Date()
      },
      
      // Initial timeline entry
      timeline: [{
        status: 'submitted',
        timestamp: new Date(),
        action: 'Application submitted',
        note: 'Application submitted successfully',
        systemGenerated: true
      }],
      
      // Metadata
      metadata: {
        source: 'direct',
        deviceInfo: {
          userAgent: req.headers['user-agent'],
          ipAddress: req.ip,
          timestamp: new Date()
        },
        applicationDuration: applicationData.applicationDuration || 0,
        viewCount: 0
      }
    });

    // Save application
    const savedApplication = await newApplication.save();

    // Update job application count
    await Job.findByIdAndUpdate(jobId, {
      $inc: { applicationsCount: 1 }
    });

    // Trigger background processes
    try {
      // 1. AI Scoring (async)
      calculateAIScoring(savedApplication._id);
      
      // 2. Email notifications (async)
      sendApplicationNotifications(savedApplication._id);
      
      // 3. Resume parsing (async)
      if (documents?.resume) {
        parseResumeContent(savedApplication._id, documents.resume);
      }
      
    } catch (backgroundError) {
      console.warn('⚠️ Background process error:', backgroundError);
      // Don't fail the main application submission
    }

    // Real-time notification to recruiter
    const io = req.app.get('io');
    if (io) {
      io.to(`user-${job.postedBy}`).emit('new-application', {
        type: 'new_application',
        message: `New application received for ${job.jobTitle}`,
        data: {
          applicationId: savedApplication.applicationId,
          jobTitle: job.jobTitle,
          applicantName: applicationData.personalInfo.fullName,
          submittedAt: new Date()
        }
      });
    }

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: {
        applicationId: savedApplication.applicationId,
        status: savedApplication.applicationStatus,
        submittedAt: savedApplication.applicationDate,
        confirmationNumber: savedApplication.applicationId,
        expectedResponse: '5-7 business days',
        nextSteps: [
          'Your application is being reviewed by our team',
          'You will receive an email confirmation shortly',
          'Track your application status in your dashboard',
          'We will contact you if your profile matches our requirements'
        ]
      }
    });

  } catch (error) {
    console.error('❌ Enhanced application submission error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit application',
      code: 'SUBMISSION_ERROR',
      error: error.message
    });
  }
});

// GET /api/enhanced-applications - Get applications for current user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { 
      status, 
      page = 1, 
      limit = 20, 
      sortBy = 'applicationDate', 
      sortOrder = 'desc',
      search 
    } = req.query;
    
    const query = {};
    
    // Role-based filtering
    if (req.user.role === 'applicant') {
      query.applicantId = req.user.userId;
    } else if (req.user.role === 'recruiter') {
      query.recruiterId = req.user.userId;
    } else {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }
    
    // Status filter
    if (status) {
      query.applicationStatus = status;
    }
    
    // Search filter
    if (search) {
      query.$or = [
        { 'applicationData.personalInfo.fullName': { $regex: search, $options: 'i' } },
        { 'applicationData.professionalInfo.currentCompany': { $regex: search, $options: 'i' } }
      ];
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build sort object
    const sortObj = {};
    sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const [applications, totalCount] = await Promise.all([
      EnhancedApplication.find(query)
        .populate('jobId', 'jobTitle companyName location jobType salaryRange')
        .populate('applicantId', 'firstName lastName email phone')
        .populate('recruiterId', 'firstName lastName email companyInfo')
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      EnhancedApplication.countDocuments(query)
    ]);

    // Transform applications for response
    const transformedApplications = applications.map(application => ({
      id: application._id,
      applicationId: application.applicationId,
      
      job: {
        id: application.jobId._id,
        title: application.jobId.jobTitle,
        company: application.jobId.companyName,
        location: application.jobId.location,
        type: application.jobId.jobType,
        salary: application.jobId.salaryRange
      },
      
      applicant: req.user.role === 'recruiter' ? {
        id: application.applicantId._id,
        name: `${application.applicantId.firstName} ${application.applicantId.lastName}`,
        email: application.applicantId.email,
        phone: application.applicantId.phone
      } : null,
      
      status: application.applicationStatus,
      priority: application.priority,
      appliedAt: application.applicationDate,
      lastUpdated: application.lastUpdated,
      
      aiScoring: {
        overallScore: application.aiScoring.overallScore,
        skillsMatchPercentage: application.aiScoring.skillsMatch.score,
        experienceMatch: application.aiScoring.experienceMatch.score
      },
      
      timeline: application.timeline.slice(-3), // Last 3 status changes
      
      metadata: {
        viewCount: application.metadata.viewCount,
        source: application.metadata.source,
        daysInCurrentStatus: Math.floor((new Date() - application.lastUpdated) / (1000 * 60 * 60 * 24))
      }
    }));

    res.json({
      success: true,
      data: {
        applications: transformedApplications,
        pagination: {
          total: totalCount,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(totalCount / limitNum),
          hasNext: pageNum < Math.ceil(totalCount / limitNum),
          hasPrev: pageNum > 1
        }
      }
    });

  } catch (error) {
    console.error('❌ Error fetching enhanced applications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch applications',
      error: error.message
    });
  }
});

// GET /api/enhanced-applications/:id - Get detailed application
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const application = await EnhancedApplication.findById(id)
      .populate('jobId')
      .populate('applicantId', 'firstName lastName email phone resume_url')
      .populate('recruiterId', 'firstName lastName email companyInfo')
      .populate('timeline.updatedBy', 'firstName lastName')
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
                   req.user.userId === application.recruiterId._id.toString();

    if (!canView) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Update view count
    await EnhancedApplication.findByIdAndUpdate(id, {
      $inc: { 'metadata.viewCount': 1 },
      'metadata.lastViewed': new Date()
    });

    res.json({
      success: true,
      data: { application }
    });

  } catch (error) {
    console.error('❌ Error fetching application details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch application details',
      error: error.message
    });
  }
});

// PUT /api/enhanced-applications/:id/status - Update application status
router.put('/:id/status', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'recruiter') {
      return res.status(403).json({
        success: false,
        message: 'Only recruiters can update application status'
      });
    }

    const { id } = req.params;
    const { status, note } = req.body;

    const application = await EnhancedApplication.findById(id)
      .populate('jobId', 'postedBy jobTitle')
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

    // Update application using instance method
    await application.updateStatus(status, req.user.userId, note);

    // Real-time notification to applicant
    const io = req.app.get('io');
    if (io) {
      io.to(`user-${application.applicantId._id}`).emit('application-status-update', {
        type: 'status_update',
        message: `Your application status has been updated to: ${status}`,
        data: {
          applicationId: application.applicationId,
          jobTitle: application.jobId.jobTitle,
          newStatus: status,
          note: note,
          updatedAt: new Date()
        }
      });
    }

    // Send email notification (async)
    try {
      sendStatusUpdateNotification(application._id, status, note);
    } catch (emailError) {
      console.warn('⚠️ Email notification error:', emailError);
    }

    res.json({
      success: true,
      message: 'Application status updated successfully',
      data: {
        applicationId: application.applicationId,
        newStatus: status,
        updatedAt: new Date()
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

// POST /api/enhanced-applications/:id/notes - Add recruiter note
router.post('/:id/notes', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'recruiter') {
      return res.status(403).json({
        success: false,
        message: 'Only recruiters can add notes'
      });
    }

    const { id } = req.params;
    const { content, isPrivate = true, tags = [] } = req.body;

    const application = await EnhancedApplication.findById(id)
      .populate('jobId', 'postedBy');

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
        message: 'Access denied'
      });
    }

    // Add note using instance method
    await application.addNote(req.user.userId, content, isPrivate, tags);

    res.json({
      success: true,
      message: 'Note added successfully'
    });

  } catch (error) {
    console.error('❌ Error adding note:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add note',
      error: error.message
    });
  }
});

// GET /api/enhanced-applications/stats/dashboard - Get application statistics
router.get('/stats/dashboard', authenticateToken, async (req, res) => {
  try {
    const query = {};
    
    if (req.user.role === 'applicant') {
      query.applicantId = req.user.userId;
    } else if (req.user.role === 'recruiter') {
      query.recruiterId = req.user.userId;
    } else {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const [
      totalApplications,
      statusBreakdown,
      recentApplications,
      averageResponseTime
    ] = await Promise.all([
      EnhancedApplication.countDocuments(query),
      
      EnhancedApplication.aggregate([
        { $match: query },
        { $group: { _id: '$applicationStatus', count: { $sum: 1 } } }
      ]),
      
      EnhancedApplication.find(query)
        .populate('jobId', 'jobTitle companyName')
        .sort({ applicationDate: -1 })
        .limit(5)
        .lean(),
        
      EnhancedApplication.aggregate([
        { $match: { ...query, applicationStatus: { $ne: 'submitted' } } },
        { $project: {
          responseTime: {
            $subtract: [
              { $arrayElemAt: ['$timeline.timestamp', 1] },
              { $arrayElemAt: ['$timeline.timestamp', 0] }
            ]
          }
        }},
        { $group: {
          _id: null,
          avgResponseTime: { $avg: '$responseTime' }
        }}
      ])
    ]);

    const stats = {
      totalApplications,
      statusBreakdown: statusBreakdown.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      recentApplications: recentApplications.map(app => ({
        id: app._id,
        applicationId: app.applicationId,
        jobTitle: app.jobId.jobTitle,
        company: app.jobId.companyName,
        status: app.applicationStatus,
        appliedAt: app.applicationDate
      })),
      averageResponseTime: averageResponseTime[0]?.avgResponseTime || 0
    };

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('❌ Error fetching application stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch application statistics',
      error: error.message
    });
  }
});

// Background processing functions (implement as needed)
async function calculateAIScoring(applicationId) {
  // Implement AI scoring logic
  console.log(`🤖 Calculating AI score for application: ${applicationId}`);
}

async function sendApplicationNotifications(applicationId) {
  // Implement email notification logic
  console.log(`📧 Sending notifications for application: ${applicationId}`);
}

async function parseResumeContent(applicationId, resumeData) {
  // Implement resume parsing logic
  console.log(`📄 Parsing resume for application: ${applicationId}`);
}

async function sendStatusUpdateNotification(applicationId, status, note) {
  // Implement status update email logic
  console.log(`📧 Sending status update notification: ${applicationId} -> ${status}`);
}

export default router;
