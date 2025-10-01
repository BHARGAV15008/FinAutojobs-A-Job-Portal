import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Application from '../models/unified/Application.js';
import Job from '../models/Job.js';
// Import the correct user model that other routes use
import { BaseUser } from '../models/UserModels.js';
import CleanUser from '../models/CleanUser.js';
import Notification from '../models/Notification.js';
import { sendInterviewUpdate } from '../services/notifications.js';
import joi from 'joi';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = 'uploads/applications/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'resume-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, and DOCX files are allowed!'));
    }
  }
});

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  try {
    console.log('🔐 Authentication middleware hit for:', req.method, req.url);
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      console.log('❌ Auth failed: No token provided');
      return res.status(401).json({
        success: false,
        message: 'Access token is required'
      });
    }
    
    const jwt = await import('jsonwebtoken');
    const jwtSecret = process.env.JWT_SECRET || 'your-jwt-secret-key-change-this-in-production';
    
    // Log warning if using default secret (for development only)
    if (!process.env.JWT_SECRET) {
      console.warn('⚠️ Using default JWT secret - configure JWT_SECRET in environment variables for production');
    }
    
    const decoded = jwt.default.verify(token, jwtSecret);
    
    console.log('🔍 JWT decoded successfully, looking up user:', decoded.userId);
    console.log('🔍 Decoded token data:', JSON.stringify(decoded, null, 2));
    
    // Try multiple lookup methods for user identification
    let user = null;
    
    // Method 1: Try BaseUser first (primary user collection)
    try {
      user = await BaseUser.findById(decoded.userId);
      console.log('🔍 BaseUser lookup by _id result:', user ? 'Found' : 'Not found');
    } catch (error) {
      console.log('⚠️ BaseUser lookup by _id failed:', error.message);
    }
    
    // Method 2: Try BaseUser by email if available in token
    if (!user && decoded.email) {
      try {
        user = await BaseUser.findOne({ email: decoded.email });
        console.log('🔍 BaseUser lookup by email result:', user ? 'Found' : 'Not found');
      } catch (error) {
        console.log('⚠️ BaseUser lookup by email failed:', error.message);
      }
    }
    
    // Method 3: Try BaseUser by username if available in token
    if (!user && decoded.username) {
      try {
        user = await BaseUser.findOne({ username: decoded.username });
        console.log('🔍 BaseUser lookup by username result:', user ? 'Found' : 'Not found');
      } catch (error) {
        console.log('⚠️ BaseUser lookup by username failed:', error.message);
      }
    }
    
    // Method 4: Try alternative ID field if exists
    if (!user && decoded.id) {
      try {
        user = await BaseUser.findById(decoded.id);
        console.log('🔍 BaseUser lookup by alternative id result:', user ? 'Found' : 'Not found');
      } catch (error) {
        console.log('⚠️ BaseUser lookup by alternative id failed:', error.message);
      }
    }
    
    // Method 5: Fallback to CleanUser (legacy)
    if (!user) {
      try {
        user = await CleanUser.findById(decoded.userId);
        console.log('🔍 CleanUser fallback lookup result:', user ? 'Found' : 'Not found');
        if (!user && decoded.email) {
          user = await CleanUser.findOne({ email: decoded.email });
          console.log('🔍 CleanUser fallback by email result:', user ? 'Found' : 'Not found');
        }
      } catch (error) {
        console.log('⚠️ CleanUser fallback lookup failed:', error.message);
      }
    }
    
    if (!user) {
      console.log('❌ Auth failed: User not found with any method');
      console.log('🔍 Available decoded fields:', Object.keys(decoded));
      console.log('🔍 Tried user models: BaseUser, CleanUser');
      return res.status(401).json({
        success: false,
        message: 'Invalid token - user not found'
      });
    }

    console.log('✅ Auth successful for user:', user.email, 'role:', user.role);
    req.user = {
      userId: user._id.toString(), // Convert ObjectId to string for consistency
      role: user.role,
      email: user.email
    };
    
    console.log('🔄 Auth middleware completed, calling next()');
    next();
  } catch (error) {
    console.error('❌ Authentication error:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

const createApplicationSchema = joi.object({
  jobId: joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
  coverLetter: joi.string().max(5000).optional()
});

// POST /api/applications - Create a new job application
router.post('/', upload.single('resume'), authenticateToken, async (req, res) => {
  try {
    console.log('🔍 Creating new application...');
    console.log('🔍 User:', req.user);
    console.log('🔍 Body fields:', Object.keys(req.body));
    console.log('🔍 File:', req.file ? 'Uploaded' : 'No file');

    // Validate required fields
    const { jobId, jobTitle, companyName } = req.body;
    
    if (!jobId || !jobTitle || !companyName) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: jobId, jobTitle, companyName'
      });
    }

    // Check if user has already applied to this job
    const existingApplication = await Application.findOne({
      applicantId: req.user.userId,
      jobId: jobId
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied to this job'
      });
    }

    // Verify job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Create application data
    const applicationData = {
      applicantId: req.user.userId,
      jobId: jobId,
      recruiterId: job.postedBy, // Get recruiter ID from job
      jobTitle: jobTitle,
      companyName: companyName,
      applicationStatus: 'pending',
      appliedAt: new Date(),
      
      // Personal Information
      personalInfo: {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        phone: req.body.phone,
        location: req.body.location
      },

      // Professional Information
      professionalInfo: {
        currentJobTitle: req.body.currentJobTitle,
        currentCompany: req.body.currentCompany,
        experience: req.body.experience,
        expectedSalary: req.body.expectedSalary,
        noticePeriod: req.body.noticePeriod
      },

      // Skills
      skills: {
        primary: req.body.primarySkills ? req.body.primarySkills.split(',').map(s => s.trim()) : [],
        technical: req.body.technicalSkills ? req.body.technicalSkills.split(',').map(s => s.trim()) : [],
        soft: req.body.softSkills ? req.body.softSkills.split(',').map(s => s.trim()) : []
      },

      // Additional Information
      additionalInfo: {
        coverLetter: req.body.coverLetter,
        portfolioUrl: req.body.portfolioUrl,
        linkedinUrl: req.body.linkedinUrl,
        githubUrl: req.body.githubUrl,
        willingToRelocate: req.body.willingToRelocate === 'true',
        remoteWorkPreference: req.body.remoteWorkPreference === 'true',
        referralSource: req.body.referralSource,
        bio: req.body.bio,
        languages: req.body.languages ? req.body.languages.split(',').map(s => s.trim()) : []
      },

      // Documents
      documents: {
        resumeUrl: req.file ? `/uploads/applications/${req.file.filename}` : '',
        coverLetterUrl: req.body.coverLetterUrl || ''
      },

      // Timeline
      timeline: [{
        status: 'pending',
        timestamp: new Date(),
        notes: 'Application submitted'
      }],

      // Applicant Snapshot (required fields)
      applicantSnapshot: {
        fullName: `${req.body.firstName} ${req.body.lastName}`,
        email: req.body.email,
        phone: req.body.phone,
        location: req.body.location,
        currentJobTitle: req.body.currentJobTitle,
        currentCompany: req.body.currentCompany,
        experience: req.body.experience,
        skills: req.body.primarySkills ? req.body.primarySkills.split(',').map(s => s.trim()) : []
      },

      // Job Snapshot (required fields)
      jobSnapshot: {
        jobTitle: job.jobTitle,
        companyName: job.companyName,
        location: job.location,
        jobType: job.jobType
      }
    };

    // Handle education and work experience (if provided as JSON strings)
    if (req.body.education) {
      try {
        applicationData.education = typeof req.body.education === 'string' 
          ? JSON.parse(req.body.education) 
          : req.body.education;
      } catch (e) {
        console.warn('Failed to parse education data:', e.message);
      }
    }

    if (req.body.workExperience) {
      try {
        applicationData.workExperience = typeof req.body.workExperience === 'string' 
          ? JSON.parse(req.body.workExperience) 
          : req.body.workExperience;
      } catch (e) {
        console.warn('Failed to parse work experience data:', e.message);
      }
    }

    // Create the application
    const application = new Application(applicationData);
    await application.save();

    console.log('✅ Application created successfully:', application._id);

    // Create notification for recruiter
    try {
      const notification = new Notification({
        userId: job.postedBy,
        type: 'new_application',
        title: 'New Job Application',
        message: `${req.body.firstName} ${req.body.lastName} applied for ${jobTitle}`,
        data: {
          applicationId: application._id,
          jobId: jobId,
          applicantName: `${req.body.firstName} ${req.body.lastName}`
        }
      });
      await notification.save();
      console.log('✅ Notification created for recruiter');
    } catch (notifError) {
      console.warn('⚠️ Failed to create notification:', notifError.message);
    }

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: {
        applicationId: application._id,
        status: application.applicationStatus,
        appliedAt: application.appliedAt
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

// GET /api/applications - Get applications with optional filtering
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { userId, status, page = 1, limit = 10 } = req.query;
    let query = {};

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
        .populate('jobId', 'title company location type jobTitle companyName')
        .populate({
          path: 'applicantId',
          select: 'firstName lastName email',
          model: 'BaseUser'
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Application.countDocuments(query)
    ]);

    const transformedApplications = applications.map(application => ({
      _id: application._id,
      id: application._id,
      jobId: application.jobId?._id || application.jobId,
      
      // Job snapshot - use populated data first, then snapshot as fallback
      jobSnapshot: {
        title: application.jobId?.title || application.jobId?.jobTitle || application.jobSnapshot?.jobTitle || 'Unknown Position',
        company: application.jobId?.company || application.jobId?.companyName || application.jobSnapshot?.companyName || 'Unknown Company',
        location: application.jobId?.location || application.jobSnapshot?.location || 'Unknown Location',
        type: application.jobId?.type || application.jobSnapshot?.jobType || 'Unknown Type'
      },
      
      // Applicant snapshot - use populated data first, then snapshot as fallback
      applicantSnapshot: application.applicantId ? {
        fullName: `${application.applicantId.firstName} ${application.applicantId.lastName}`,
        email: application.applicantId.email,
        phone: application.applicantSnapshot?.phone || application.applicationData?.phone || '',
        location: application.applicantSnapshot?.location || application.applicationData?.location || ''
      } : (application.applicantSnapshot || null),
      
      // Application data
      applicationData: application.applicationData || {},
      
      status: application.applicationStatus,
      appliedAt: application.createdAt || application.appliedAt,
      updatedAt: application.updatedAt,
      
      // Recruiter notes
      recruiterNotes: application.recruiterNotes || ''
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
      .populate({
        path: 'applicantId',
        select: 'firstName lastName email phone resume_url',
        model: 'BaseUser'
      })
      .populate({
        path: 'recruiterId',
        select: 'firstName lastName email',
        model: 'BaseUser'
      })
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

// POST /api/applications - Create new application with file upload
router.post('/', (req, res, next) => {
  console.log('🎯 POST /api/applications route hit - before middleware');
  next();
}, authenticateToken, (req, res, next) => {
  console.log('🔄 About to run multer middleware');
  upload.single('resume')(req, res, (err) => {
    if (err) {
      console.error('❌ Multer error:', err);
      return res.status(400).json({ success: false, message: err.message });
    }
    console.log('✅ Multer middleware completed successfully');
    next();
  });
}, async (req, res) => {
  try {
    console.log('🚀 APPLICATION ROUTE HIT - POST /api/applications');
    console.log('🔍 Application submission request:', {
      body: req.body,
      file: req.file ? req.file.filename : 'No file',
      user: req.user ? req.user.userId : 'No user',
      headers: req.headers
    });

    if (req.user.role !== 'applicant') {
      return res.status(403).json({
        success: false,
        message: 'Only applicants can submit applications'
      });
    }

    const { jobId, jobTitle, companyName } = req.body;
    console.log('🔍 Extracted jobId:', jobId);

    if (!jobId) {
      console.log('❌ No jobId provided');
      return res.status(400).json({
        success: false,
        message: 'Job ID is required'
      });
    }

    console.log('🔍 Looking up job with ID:', jobId);
    const job = await Job.findById(jobId);
    console.log('🔍 Job lookup result:', job ? 'Found' : 'Not found');
    
    if (!job || job.status !== 'Active') {
      console.log('❌ Job not found or inactive. Job status:', job?.status);
      return res.status(400).json({
        success: false,
        message: 'Job not found or not accepting applications'
      });
    }
    console.log('✅ Job found and active');

    // Check for duplicate application
    const existingApplication = await Application.findOne({
      applicantId: req.user.userId,
      jobId: jobId
    });

    if (existingApplication) {
      console.log('❌ Duplicate application found');
      return res.status(409).json({
        success: false,
        message: 'You have already applied to this job'
      });
    }
    console.log('✅ No duplicate application found');

    // Prepare application data
    console.log('🔍 Preparing application data...');
    const applicationData = {
      resumeUrl: req.file ? `/uploads/applications/${req.file.filename}` : req.user.resume_url || '',
      coverLetter: req.body.coverLetter || '',
      portfolioUrl: req.body.portfolioUrl || '',
      linkedinUrl: req.body.linkedinUrl || '',
      expectedSalary: req.body.expectedSalary || '',
      noticePeriod: req.body.noticePeriod || '',
      willingToRelocate: req.body.willingToRelocate === 'true',
      remoteWorkPreference: req.body.remoteWorkPreference === 'true',
      additionalInfo: req.body.additionalInfo || '',
      referralSource: req.body.referralSource || '',
      customAnswers: []
    };

    // Get applicant user data
    console.log('🔍 Fetching applicant user data...');
    console.log('🔍 req.user object:', JSON.stringify(req.user, null, 2));
    console.log('🔍 Looking up user with ID:', req.user.userId);
    console.log('🔍 User ID type:', typeof req.user.userId);
    
    let applicantUser = await BaseUser.findById(req.user.userId);
    console.log('🔍 BaseUser lookup result:', applicantUser ? 'Found' : 'Not found');
    
    if (!applicantUser) {
      console.log('❌ Applicant user not found in BaseUser for ID:', req.user.userId);
      
      // Try CleanUser as fallback
      console.log('🔄 Trying CleanUser fallback lookup...');
      applicantUser = await CleanUser.findById(req.user.userId);
      console.log('🔍 CleanUser fallback result:', applicantUser ? 'Found' : 'Not found');
      
      if (!applicantUser) {
        return res.status(400).json({
          success: false,
          message: 'Applicant user not found'
        });
      }
    }

    // Create comprehensive applicant snapshot
    const applicantSnapshot = {
      fullName: `${req.body.firstName || applicantUser.firstName || ''} ${req.body.lastName || applicantUser.lastName || ''}`,
      email: req.body.email || applicantUser.email,
      phone: req.body.phone || applicantUser.phone || '',
      location: req.body.location || applicantUser.currentLocation?.city || applicantUser.location || '',
      currentJobTitle: req.body.currentJobTitle || applicantUser.careerInfo?.currentJobTitle || '',
      currentCompany: req.body.currentCompany || applicantUser.careerInfo?.currentCompany || '',
      experience: req.body.experience || applicantUser.yearsOfExperience || '',
      skills: Array.isArray(applicantUser.skills?.primary) ? applicantUser.skills.primary : (applicantUser.skills || []),
      education: Array.isArray(applicantUser.education) ? applicantUser.education.map(edu => ({
        degree: edu.degree || '',
        institution: edu.institution || '',
        fieldOfStudy: edu.fieldOfStudy || ''
      })) : [],
      workExperience: Array.isArray(applicantUser.workExperience) ? applicantUser.workExperience.map(exp => ({
        jobTitle: exp.jobTitle || '',
        companyName: exp.companyName || '',
        description: exp.description || ''
      })) : []
    };

    // Create application
    console.log('🔍 Creating new application...');
    const newApplication = new Application({
      applicantId: req.user.userId,
      jobId: jobId,
      recruiterId: job.postedBy,
      applicationStatus: 'pending',
      applicationData: applicationData,
      applicantSnapshot: applicantSnapshot,
      jobSnapshot: {
        jobTitle: job.jobTitle,
        companyName: job.companyName,
        location: job.location,
        jobType: job.jobType
      },
      timeline: [{
        status: 'pending',
        timestamp: new Date(),
        updatedBy: req.user.userId,
        notes: 'Application submitted'
      }]
    });

    console.log('🔍 Saving application to database...');
    const savedApplication = await newApplication.save();
    console.log('✅ Application saved successfully with ID:', savedApplication._id);

    // Update job application count
    console.log('🔍 Updating job application count...');
    await Job.findByIdAndUpdate(jobId, {
      $inc: { applicationsCount: 1 }
    });
    console.log('✅ Job application count updated');

    console.log('✅ Application created successfully:', savedApplication._id);

    // Create notification for recruiter
    console.log('🔍 Creating notification for recruiter...');
    try {
      await Notification.createApplicationReceived(
        job.postedBy,
        {
          _id: savedApplication._id,
          applicantName: applicantSnapshot.fullName
        },
        {
          _id: job._id,
          title: job.jobTitle || job.title
        }
      );
      console.log('✅ Notification created successfully');
    } catch (notificationError) {
      console.log('⚠️ Notification creation failed:', notificationError.message);
      // Don't fail the application if notification fails
    }

    // Emit real-time notification
    const io = req.app.get('io');
    if (io) {
      io.to(`user-${job.postedBy}`).emit('new-application-received', {
        message: 'New application received',
        application: {
          id: savedApplication._id,
          jobTitle: job.jobTitle,
          applicantName: applicantSnapshot.fullName
        },
        timestamp: new Date()
      });
      console.log('✅ Real-time notification emitted');
    }

    console.log('🎉 Sending success response to frontend');
    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: {
        application: {
          id: savedApplication._id,
          status: savedApplication.applicationStatus,
          appliedAt: savedApplication.appliedAt
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
    console.log('🔄 Application status update request:', {
      applicationId: req.params.id,
      body: req.body,
      user: req.user
    });

    if (req.user.role !== 'recruiter') {
      console.log('❌ Access denied: User is not a recruiter');
      return res.status(403).json({
        success: false,
        message: 'Only recruiters can update application status'
      });
    }

    const applicationId = req.params.id;
    const { status, notes } = req.body;

    console.log('🔍 Extracted data:', { applicationId, status, notes });

    if (!applicationId.match(/^[0-9a-fA-F]{24}$/)) {
      console.log('❌ Invalid application ID format');
      return res.status(400).json({
        success: false,
        message: 'Invalid application ID format'
      });
    }

    console.log('🔍 Looking up application...');
    const application = await Application.findById(applicationId)
      .populate('jobId', 'postedBy')
      .populate({
        path: 'applicantId',
        select: 'firstName lastName email',
        model: 'BaseUser'
      });

    console.log('🔍 Application lookup result:', application ? 'Found' : 'Not found');

    if (!application) {
      console.log('❌ Application not found');
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    console.log('🔍 Application details:', {
      id: application._id,
      jobId: application.jobId?._id,
      postedBy: application.jobId?.postedBy,
      currentUserId: req.user.userId
    });

    // Verify ownership
    if (application.jobId?.postedBy?.toString() !== req.user.userId) {
      console.log('❌ Access denied: User does not own this job');
      return res.status(403).json({
        success: false,
        message: 'You can only update applications for your jobs'
      });
    }

    console.log('🔄 Updating application status...');
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
            notes: notes || ''
          }
        }
      },
      { new: true }
    );

    console.log('✅ Application updated successfully:', updatedApplication ? 'Success' : 'Failed');

    // Add recruiter notes if provided
    if (notes) {
      console.log('🔄 Adding recruiter notes...');
      await Application.findByIdAndUpdate(applicationId, {
        recruiterNotes: notes
      });
    }

    // Create notification for applicant
    console.log('🔄 Creating notification for applicant...');
    try {
      await Notification.createApplicationStatusUpdate(
        application.applicantId._id || application.applicantId,
        application._id,
        status,
        application.jobSnapshot?.jobTitle || application.jobId?.title || 'Unknown Position'
      );
      console.log('✅ Notification created successfully');
    } catch (notificationError) {
      console.error('❌ Failed to create notification:', notificationError);
    }

    // Emit real-time notification to applicant
    console.log('🔄 Emitting real-time notification...');
    const io = req.app.get('io');
    if (io && application.applicantId?._id) {
      io.to(`user-${application.applicantId._id}`).emit('application-status-changed', {
        message: `Application status updated to: ${status}`,
        application: {
          id: application._id,
          jobTitle: application.jobSnapshot?.jobTitle || 'Unknown Position',
          status: status
        },
        timestamp: new Date()
      });
      console.log('✅ Real-time notification emitted');
    }

    // Send email notification to applicant
    try {
      const applicant = await BaseUser.findById(updatedApplication.applicantId);
      const job = await Job.findById(updatedApplication.jobId);
      if (applicant && job) {
        await sendInterviewUpdate(applicant.email, status, job.title);
      }
    } catch (notificationError) {
      console.error('Notification error:', notificationError);
    }

    console.log('✅ Sending success response');
    res.json({
      success: true,
      message: 'Application status updated successfully',
      data: {
        application: {
          id: updatedApplication._id,
          status: updatedApplication.applicationStatus,
          notes: notes || ''
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
      .populate({
        path: 'applicantId',
        select: 'firstName lastName email phone resume_url',
        model: 'BaseUser'
      })
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

// GET /api/applications/job/:jobId - Get all applications for a specific job (recruiter only)
router.get('/job/:jobId', authenticateToken, async (req, res) => {
  try {
    const { jobId } = req.params;
    console.log('🔍 Fetching applications for job:', jobId);
    console.log('🔍 Requester role:', req.user.role);

    // Verify job exists and user is the recruiter who posted it
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if user is the recruiter who posted this job
    if (req.user.role !== 'recruiter' || job.postedBy.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view applications for your own jobs.'
      });
    }

    // Fetch applications for this job
    const applications = await Application.find({ jobId: jobId })
      .populate({
        path: 'applicantId',
        select: 'firstName lastName email phone profileImage'
      })
      .sort({ appliedAt: -1 });

    console.log(`🔍 Found ${applications.length} applications for job ${jobId}`);

    // Transform applications for frontend
    const transformedApplications = applications.map(app => ({
      _id: app._id,
      id: app._id,
      applicantId: app.applicantId._id,
      jobId: app.jobId,
      applicationStatus: app.applicationStatus,
      appliedAt: app.appliedAt,
      
      // Applicant info
      applicant: {
        id: app.applicantId._id,
        name: `${app.applicantId.firstName} ${app.applicantId.lastName}`,
        firstName: app.applicantId.firstName,
        lastName: app.applicantId.lastName,
        email: app.applicantId.email,
        phone: app.applicantId.phone,
        profileImage: app.applicantId.profileImage
      },

      // Application data
      applicationData: app.applicationData,
      applicantSnapshot: app.applicantSnapshot,
      timeline: app.timeline,

      // For compatibility
      personalInfo: app.personalInfo,
      professionalInfo: app.professionalInfo,
      skills: app.skills,
      additionalInfo: app.additionalInfo,
      documents: app.documents
    }));

    res.json({
      success: true,
      data: {
        applications: transformedApplications,
        total: transformedApplications.length,
        job: {
          _id: job._id,
          jobTitle: job.jobTitle,
          companyName: job.companyName,
          location: job.location
        }
      }
    });

  } catch (error) {
    console.error('❌ Error fetching applications for job:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch applications',
      error: error.message
    });
  }
});

// GET /api/applications/check - Check if user has applied to a job
router.get('/check', authenticateToken, async (req, res) => {
  try {
    const { jobId, userId } = req.query;
    
    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: 'Job ID is required'
      });
    }

    const application = await Application.findOne({
      applicantId: userId || req.user.userId,
      jobId: jobId
    });

    res.json({
      success: true,
      data: {
        hasApplied: !!application,
        applicationId: application?._id,
        status: application?.applicationStatus,
        appliedAt: application?.appliedAt
      }
    });
  } catch (error) {
    console.error('❌ Error checking application status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to check application status',
      error: error.message
    });
  }
});

// Health check route for applications
router.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Applications API is healthy',
    timestamp: new Date().toISOString()
  });
});

export default router;
