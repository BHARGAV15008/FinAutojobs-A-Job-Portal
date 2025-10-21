import Job from '../models/Job.js';
import EnhancedApplication from '../models/EnhancedApplication.js';
import { BaseUser } from '../models/UserModels.js';

/**
 * Pre-application validation middleware
 * Implements comprehensive validation as per job portal data flow
 */

// 1. Initial Click Event Validations
export const validateInitialApplication = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const userId = req.user.userId;

    // Validate job ID format
    if (!jobId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid job ID format',
        code: 'INVALID_JOB_ID'
      });
    }

    // Check if user is logged in (should be handled by auth middleware)
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'AUTH_REQUIRED',
        redirectTo: '/login'
      });
    }

    // Verify job exists and is active
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
        code: 'JOB_NOT_FOUND'
      });
    }

    if (job.status !== 'Active') {
      return res.status(400).json({
        success: false,
        message: 'This job is no longer accepting applications',
        code: 'JOB_INACTIVE',
        jobStatus: job.status
      });
    }

    // Check application deadline
    if (job.applicationDeadline && new Date() > job.applicationDeadline) {
      return res.status(400).json({
        success: false,
        message: 'Application deadline has passed',
        code: 'DEADLINE_PASSED',
        deadline: job.applicationDeadline
      });
    }

    // Check if user has already applied
    const existingApplication = await EnhancedApplication.findOne({
      jobId: jobId,
      applicantId: userId
    });

    if (existingApplication) {
      return res.status(409).json({
        success: false,
        message: 'You have already applied for this position',
        code: 'DUPLICATE_APPLICATION',
        applicationId: existingApplication.applicationId,
        applicationStatus: existingApplication.applicationStatus,
        appliedDate: existingApplication.applicationDate
      });
    }

    // Verify user account status
    const user = await BaseUser.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User account not found',
        code: 'USER_NOT_FOUND'
      });
    }

    if (user.accountStatus === 'suspended' || user.accountStatus === 'deactivated') {
      return res.status(403).json({
        success: false,
        message: 'Your account is not active. Please contact support.',
        code: 'ACCOUNT_INACTIVE',
        accountStatus: user.accountStatus
      });
    }

    // Add job and user data to request for next middleware
    req.jobData = job;
    req.userData = user;
    
    next();
  } catch (error) {
    console.error('❌ Initial application validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Validation failed',
      code: 'VALIDATION_ERROR',
      error: error.message
    });
  }
};

// 2. Profile Completion Check
export const validateProfileCompletion = async (req, res, next) => {
  try {
    const user = req.userData;
    const job = req.jobData;

    // Define required fields based on user role and job requirements
    const requiredFields = [
      'firstName',
      'lastName',
      'email',
      'phone'
    ];

    // Check for missing mandatory fields
    const missingFields = [];
    requiredFields.forEach(field => {
      if (!user[field] || user[field].toString().trim() === '') {
        missingFields.push(field);
      }
    });

    // Check for resume (critical for applications)
    if (!user.resume_url && !user.documents?.resume) {
      missingFields.push('resume');
    }

    // Calculate profile completion percentage
    const totalFields = requiredFields.length + 1; // +1 for resume
    const completedFields = totalFields - missingFields.length;
    const completionPercentage = Math.round((completedFields / totalFields) * 100);

    // Minimum completion threshold (configurable)
    const minimumCompletion = 70;

    if (completionPercentage < minimumCompletion) {
      return res.status(400).json({
        success: false,
        message: 'Please complete your profile before applying',
        code: 'PROFILE_INCOMPLETE',
        data: {
          completionPercentage,
          minimumRequired: minimumCompletion,
          missingFields,
          redirectTo: '/profile'
        }
      });
    }

    // Add profile completion data to request
    req.profileCompletion = {
      percentage: completionPercentage,
      missingFields
    };

    next();
  } catch (error) {
    console.error('❌ Profile completion validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Profile validation failed',
      code: 'PROFILE_VALIDATION_ERROR',
      error: error.message
    });
  }
};

// 3. Job-Specific Requirements Validation
export const validateJobRequirements = async (req, res, next) => {
  try {
    const user = req.userData;
    const job = req.jobData;

    const warnings = [];
    const blockers = [];

    // Experience validation
    if (job.experience && job.experience.minimum) {
      const userExperience = user.yearsOfExperience || 0;
      if (userExperience < job.experience.minimum) {
        if (job.experience.minimum - userExperience > 2) {
          blockers.push({
            type: 'experience',
            message: `This position requires ${job.experience.minimum}+ years of experience. You have ${userExperience} years.`,
            required: job.experience.minimum,
            current: userExperience
          });
        } else {
          warnings.push({
            type: 'experience',
            message: `This position prefers ${job.experience.minimum}+ years of experience. You have ${userExperience} years.`,
            required: job.experience.minimum,
            current: userExperience
          });
        }
      }
    }

    // Skills validation
    if (job.requiredSkills && job.requiredSkills.length > 0) {
      const userSkills = [
        ...(user.skills?.technical || []),
        ...(user.skills?.soft || [])
      ].map(skill => skill.toLowerCase());

      const requiredSkills = job.requiredSkills.map(skill => skill.toLowerCase());
      const matchedSkills = requiredSkills.filter(skill => 
        userSkills.some(userSkill => userSkill.includes(skill) || skill.includes(userSkill))
      );

      const skillMatchPercentage = (matchedSkills.length / requiredSkills.length) * 100;

      if (skillMatchPercentage < 30) {
        blockers.push({
          type: 'skills',
          message: `Limited skill match (${Math.round(skillMatchPercentage)}%). Consider developing required skills.`,
          requiredSkills: job.requiredSkills,
          matchedSkills: matchedSkills,
          matchPercentage: skillMatchPercentage
        });
      } else if (skillMatchPercentage < 60) {
        warnings.push({
          type: 'skills',
          message: `Partial skill match (${Math.round(skillMatchPercentage)}%). You may want to highlight relevant experience.`,
          requiredSkills: job.requiredSkills,
          matchedSkills: matchedSkills,
          matchPercentage: skillMatchPercentage
        });
      }
    }

    // Location validation
    if (job.location && user.address?.city) {
      const jobLocation = job.location.toLowerCase();
      const userLocation = user.address.city.toLowerCase();
      
      if (!jobLocation.includes(userLocation) && !userLocation.includes(jobLocation)) {
        warnings.push({
          type: 'location',
          message: `This position is located in ${job.location}. You are currently in ${user.address.city}.`,
          jobLocation: job.location,
          userLocation: user.address.city
        });
      }
    }

    // Education validation (if specified)
    if (job.qualifications && user.education) {
      // Basic education level check
      const jobQualifications = job.qualifications.toLowerCase();
      const hasRelevantEducation = user.education.some(edu => 
        jobQualifications.includes(edu.degree?.toLowerCase()) ||
        jobQualifications.includes(edu.fieldOfStudy?.toLowerCase())
      );

      if (!hasRelevantEducation && jobQualifications.includes('required')) {
        warnings.push({
          type: 'education',
          message: 'Your educational background may not match the preferred qualifications.',
          required: job.qualifications
        });
      }
    }

    // If there are blockers, prevent application
    if (blockers.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Your profile does not meet the minimum requirements for this position',
        code: 'REQUIREMENTS_NOT_MET',
        data: {
          blockers,
          warnings,
          canProceed: false
        }
      });
    }

    // Add validation results to request
    req.requirementValidation = {
      warnings,
      blockers,
      canProceed: true
    };

    next();
  } catch (error) {
    console.error('❌ Job requirements validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Requirements validation failed',
      code: 'REQUIREMENTS_VALIDATION_ERROR',
      error: error.message
    });
  }
};

// 4. Application Rate Limiting
export const validateApplicationRateLimit = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const timeWindow = 24 * 60 * 60 * 1000; // 24 hours
    const maxApplicationsPerDay = 10; // Configurable limit

    const recentApplications = await EnhancedApplication.countDocuments({
      applicantId: userId,
      applicationDate: {
        $gte: new Date(Date.now() - timeWindow)
      }
    });

    if (recentApplications >= maxApplicationsPerDay) {
      return res.status(429).json({
        success: false,
        message: `You have reached the daily application limit of ${maxApplicationsPerDay}. Please try again tomorrow.`,
        code: 'RATE_LIMIT_EXCEEDED',
        data: {
          applicationsToday: recentApplications,
          maxAllowed: maxApplicationsPerDay,
          resetTime: new Date(Date.now() + timeWindow)
        }
      });
    }

    req.applicationCount = {
      today: recentApplications,
      remaining: maxApplicationsPerDay - recentApplications
    };

    next();
  } catch (error) {
    console.error('❌ Application rate limit validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Rate limit validation failed',
      code: 'RATE_LIMIT_VALIDATION_ERROR',
      error: error.message
    });
  }
};

// 5. Company Blacklist Check
export const validateCompanyBlacklist = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const job = req.jobData;

    // Check if user has been blacklisted by this company
    const blacklistEntry = await EnhancedApplication.findOne({
      applicantId: userId,
      'jobSnapshot.companyName': job.companyName,
      'metadata.flags.type': 'blacklisted',
      'metadata.flags.resolved': false
    });

    if (blacklistEntry) {
      return res.status(403).json({
        success: false,
        message: 'You are not eligible to apply for positions at this company',
        code: 'COMPANY_BLACKLISTED',
        data: {
          company: job.companyName,
          reason: 'Previous application flagged'
        }
      });
    }

    next();
  } catch (error) {
    console.error('❌ Company blacklist validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Blacklist validation failed',
      code: 'BLACKLIST_VALIDATION_ERROR',
      error: error.message
    });
  }
};

// Combined validation middleware
export const validateApplication = [
  validateInitialApplication,
  validateProfileCompletion,
  validateJobRequirements,
  validateApplicationRateLimit,
  validateCompanyBlacklist
];

// Validation summary endpoint
export const getApplicationValidationSummary = async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.user.userId;

    // Run all validations and collect results
    const validationResults = {
      canApply: true,
      blockers: [],
      warnings: [],
      profileCompletion: 0,
      requirements: {
        met: [],
        missing: [],
        warnings: []
      }
    };

    // Get job and user data
    const job = await Job.findById(jobId);
    const user = await BaseUser.findById(userId);

    if (!job || !user) {
      return res.status(404).json({
        success: false,
        message: 'Job or user not found'
      });
    }

    // Check existing application
    const existingApplication = await EnhancedApplication.findOne({
      jobId: jobId,
      applicantId: userId
    });

    if (existingApplication) {
      validationResults.canApply = false;
      validationResults.blockers.push({
        type: 'duplicate',
        message: 'Already applied',
        applicationId: existingApplication.applicationId
      });
    }

    // Profile completion check
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'resume_url'];
    const missingFields = requiredFields.filter(field => !user[field]);
    validationResults.profileCompletion = Math.round(((requiredFields.length - missingFields.length) / requiredFields.length) * 100);

    if (missingFields.length > 0) {
      validationResults.warnings.push({
        type: 'profile',
        message: 'Profile incomplete',
        missingFields
      });
    }

    res.json({
      success: true,
      data: validationResults
    });

  } catch (error) {
    console.error('❌ Validation summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get validation summary',
      error: error.message
    });
  }
};
