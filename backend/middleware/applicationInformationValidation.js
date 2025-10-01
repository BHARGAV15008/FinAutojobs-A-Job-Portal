import Joi from 'joi';
import ApplicationInformation from '../models/ApplicationInformation.js';
import Job from '../models/Job.js';
import { Applicant } from '../models/UserModels.js';

/**
 * Validation middleware for ApplicationInformation operations
 * Ensures data integrity and proper format for application information
 */

// Joi schema for salary validation
const salarySchema = Joi.object({
  salaryRange: Joi.object({
    min: Joi.number().min(0).max(10000).optional(), // In thousands (0-10000K = 0-100L)
    max: Joi.number().min(0).max(10000).optional(),
    isNegotiable: Joi.boolean().default(false),
    currency: Joi.string().valid('INR', 'USD', 'EUR', 'GBP').default('INR'),
    period: Joi.string().valid('hourly', 'monthly', 'yearly').default('yearly')
  }).optional(),
  rawSalaryText: Joi.string().max(100).optional(),
  displayText: Joi.string().max(100).optional()
});

// Joi schema for experience validation
const experienceSchema = Joi.object({
  totalYears: Joi.number().min(0).max(50).default(0),
  experienceRange: Joi.object({
    min: Joi.number().min(0).max(50).default(0),
    max: Joi.number().min(0).max(50).optional(),
    isPlus: Joi.boolean().default(false)
  }).optional(),
  rawExperienceText: Joi.string().max(100).optional(),
  currentJob: Joi.object({
    jobTitle: Joi.string().max(100).optional(),
    companyName: Joi.string().max(100).optional(),
    isCurrentlyWorking: Joi.boolean().default(false),
    startDate: Joi.date().optional(),
    endDate: Joi.date().optional()
  }).optional()
});

// Joi schema for education validation
const educationSchema = Joi.array().items(
  Joi.object({
    institution: Joi.string().required().max(200),
    degree: Joi.string().required().max(100),
    fieldOfStudy: Joi.string().max(100).optional(),
    startDate: Joi.date().optional(),
    endDate: Joi.date().optional(),
    grade: Joi.string().max(20).optional(),
    percentage: Joi.number().min(0).max(100).optional(),
    cgpa: Joi.number().min(0).max(10).optional(),
    isCurrentlyStudying: Joi.boolean().default(false),
    achievements: Joi.array().items(Joi.string().max(200)).optional(),
    relevantCoursework: Joi.array().items(Joi.string().max(100)).optional()
  })
).optional();

// Joi schema for skills validation
const skillsSchema = Joi.object({
  primary: Joi.array().items(
    Joi.object({
      skill: Joi.string().required().max(50),
      proficiency: Joi.string().valid('beginner', 'intermediate', 'advanced', 'expert').default('intermediate'),
      yearsOfExperience: Joi.number().min(0).max(50).default(0)
    })
  ).max(10).optional(),
  technical: Joi.array().items(
    Joi.object({
      skill: Joi.string().required().max(50),
      proficiency: Joi.string().valid('beginner', 'intermediate', 'advanced', 'expert').default('intermediate'),
      yearsOfExperience: Joi.number().min(0).max(50).default(0),
      category: Joi.string().max(50).optional()
    })
  ).max(20).optional(),
  soft: Joi.array().items(
    Joi.object({
      skill: Joi.string().required().max(50),
      proficiency: Joi.string().valid('beginner', 'intermediate', 'advanced', 'expert').default('intermediate')
    })
  ).max(10).optional(),
  languages: Joi.array().items(
    Joi.object({
      language: Joi.string().required().max(50),
      proficiency: Joi.string().valid('basic', 'intermediate', 'advanced', 'native').default('intermediate'),
      canRead: Joi.boolean().default(true),
      canWrite: Joi.boolean().default(true),
      canSpeak: Joi.boolean().default(true)
    })
  ).max(10).optional()
});

// Joi schema for social links validation
const socialLinksSchema = Joi.object({
  linkedin: Joi.object({
    url: Joi.string().uri().optional(),
    isVerified: Joi.boolean().default(false)
  }).optional(),
  github: Joi.object({
    url: Joi.string().uri().optional(),
    isVerified: Joi.boolean().default(false)
  }).optional(),
  portfolio: Joi.object({
    url: Joi.string().uri().optional(),
    isVerified: Joi.boolean().default(false)
  }).optional(),
  twitter: Joi.string().uri().optional(),
  behance: Joi.string().uri().optional(),
  dribbble: Joi.string().uri().optional(),
  stackoverflow: Joi.string().uri().optional(),
  personalWebsite: Joi.string().uri().optional()
});

// Main ApplicationInformation validation schema
const applicationInformationSchema = Joi.object({
  jobId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).required(),
  applicationData: Joi.object({
    // Expected salary validation
    expectedSalary: salarySchema.optional(),
    
    // Experience validation
    experience: experienceSchema.optional(),
    
    // Education validation
    education: educationSchema.optional(),
    
    // Social links validation
    socialLinks: socialLinksSchema.optional(),
    
    // Skills validation
    skills: skillsSchema.optional(),
    
    // Work experience validation
    workExperience: Joi.array().items(
      Joi.object({
        companyName: Joi.string().required().max(100),
        jobTitle: Joi.string().required().max(100),
        employmentType: Joi.string().valid('full-time', 'part-time', 'contract', 'internship', 'freelance').default('full-time'),
        startDate: Joi.date().required(),
        endDate: Joi.date().optional(),
        isCurrentJob: Joi.boolean().default(false),
        location: Joi.object({
          city: Joi.string().max(50).optional(),
          state: Joi.string().max(50).optional(),
          country: Joi.string().max(50).optional(),
          isRemote: Joi.boolean().default(false)
        }).optional(),
        description: Joi.string().max(1000).optional(),
        keyResponsibilities: Joi.array().items(Joi.string().max(200)).optional(),
        achievements: Joi.array().items(Joi.string().max(200)).optional(),
        skillsUsed: Joi.array().items(Joi.string().max(50)).optional()
      })
    ).optional(),
    
    // Location validation
    location: Joi.object({
      current: Joi.object({
        city: Joi.string().max(50).optional(),
        state: Joi.string().max(50).optional(),
        country: Joi.string().max(50).default('India'),
        address: Joi.string().max(200).optional(),
        pincode: Joi.string().max(10).optional()
      }).optional(),
      preferences: Joi.object({
        preferredLocations: Joi.array().items(Joi.string().max(50)).optional(),
        willingToRelocate: Joi.boolean().default(false),
        remoteWorkPreference: Joi.string().valid('no', 'hybrid', 'fully-remote').default('no'),
        maxCommuteDistance: Joi.number().min(0).max(200).optional()
      }).optional()
    }).optional(),
    
    // Job preferences validation
    jobPreferences: Joi.object({
      preferredJobTypes: Joi.array().items(
        Joi.string().valid('full-time', 'part-time', 'contract', 'internship', 'freelance')
      ).optional(),
      preferredIndustries: Joi.array().items(Joi.string().max(50)).optional(),
      preferredCompanySize: Joi.string().valid('startup', 'small', 'medium', 'large', 'enterprise').optional(),
      preferredWorkCulture: Joi.array().items(Joi.string().max(50)).optional(),
      noticePeriod: Joi.string().valid('immediate', '15days', '1month', '2months', '3months', 'negotiable').optional(),
      availabilityDate: Joi.date().optional()
    }).optional(),
    
    // Documents validation
    documents: Joi.object({
      resume: Joi.object({
        url: Joi.string().uri().optional(),
        fileName: Joi.string().max(100).optional(),
        fileSize: Joi.number().min(0).max(10485760).optional(), // 10MB max
        fileType: Joi.string().valid('pdf', 'doc', 'docx').optional()
      }).optional(),
      coverLetter: Joi.object({
        url: Joi.string().uri().optional(),
        fileName: Joi.string().max(100).optional(),
        content: Joi.string().max(2000).optional()
      }).optional(),
      portfolio: Joi.object({
        url: Joi.string().uri().optional(),
        fileName: Joi.string().max(100).optional()
      }).optional(),
      certificates: Joi.array().items(
        Joi.object({
          name: Joi.string().required().max(100),
          url: Joi.string().uri().optional(),
          issuedBy: Joi.string().max(100).optional(),
          issuedDate: Joi.date().optional(),
          expiryDate: Joi.date().optional(),
          credentialId: Joi.string().max(100).optional()
        })
      ).optional()
    }).optional(),
    
    // Application details validation
    applicationDetails: Joi.object({
      motivation: Joi.string().max(1000).optional(),
      referralSource: Joi.string().max(100).optional(),
      additionalInfo: Joi.string().max(1000).optional(),
      customQuestions: Joi.array().items(
        Joi.object({
          question: Joi.string().required().max(500),
          answer: Joi.string().required().max(1000)
        })
      ).optional(),
      interviewAvailability: Joi.object({
        preferredDays: Joi.array().items(
          Joi.string().valid('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday')
        ).optional(),
        preferredTimes: Joi.array().items(Joi.string().max(50)).optional(),
        timeZone: Joi.string().default('Asia/Kolkata')
      }).optional()
    }).optional()
  }).required()
});

/**
 * Validate application information creation request
 */
export const validateApplicationInformationCreation = async (req, res, next) => {
  try {
    // Validate request body structure
    const { error, value } = applicationInformationSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
      allowUnknown: false
    });

    if (error) {
      const validationErrors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    // Additional business logic validations
    const { jobId, applicationData } = value;

    // Check if job exists and is active
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    if (job.status !== 'active' && job.status !== 'Active') {
      return res.status(400).json({
        success: false,
        message: 'Job is not accepting applications',
        jobStatus: job.status
      });
    }

    // Check application deadline
    if (job.applicationDeadline && new Date() > new Date(job.applicationDeadline)) {
      return res.status(400).json({
        success: false,
        message: 'Application deadline has passed',
        deadline: job.applicationDeadline
      });
    }

    // Validate salary range consistency
    if (applicationData.expectedSalary?.salaryRange) {
      const { min, max } = applicationData.expectedSalary.salaryRange;
      if (min && max && min > max) {
        return res.status(400).json({
          success: false,
          message: 'Minimum salary cannot be greater than maximum salary'
        });
      }
    }

    // Validate experience range consistency
    if (applicationData.experience?.experienceRange) {
      const { min, max } = applicationData.experience.experienceRange;
      if (min && max && min > max) {
        return res.status(400).json({
          success: false,
          message: 'Minimum experience cannot be greater than maximum experience'
        });
      }
    }

    // Validate education dates
    if (applicationData.education) {
      for (const edu of applicationData.education) {
        if (edu.startDate && edu.endDate && new Date(edu.startDate) > new Date(edu.endDate)) {
          return res.status(400).json({
            success: false,
            message: 'Education start date cannot be after end date',
            institution: edu.institution
          });
        }
      }
    }

    // Validate work experience dates
    if (applicationData.workExperience) {
      for (const work of applicationData.workExperience) {
        if (work.startDate && work.endDate && new Date(work.startDate) > new Date(work.endDate)) {
          return res.status(400).json({
            success: false,
            message: 'Work experience start date cannot be after end date',
            company: work.companyName
          });
        }
      }
    }

    // Attach validated data to request
    req.validatedData = value;
    next();

  } catch (error) {
    console.error('Application information validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Validation error occurred',
      error: error.message
    });
  }
};

/**
 * Validate application information update request
 */
export const validateApplicationInformationUpdate = async (req, res, next) => {
  try {
    // Create a partial schema for updates (all fields optional)
    const updateSchema = applicationInformationSchema.fork(
      ['jobId', 'applicationData'],
      (schema) => schema.optional()
    );

    const { error, value } = updateSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
      allowUnknown: false
    });

    if (error) {
      const validationErrors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationErrors
      });
    }

    // Check if application information exists
    const { applicationId } = req.params;
    const existingAppInfo = await ApplicationInformation.findOne({ applicationId });
    
    if (!existingAppInfo) {
      return res.status(404).json({
        success: false,
        message: 'Application information not found'
      });
    }

    // Attach validated data to request
    req.validatedData = value;
    next();

  } catch (error) {
    console.error('Application information update validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Validation error occurred',
      error: error.message
    });
  }
};

/**
 * Validate search parameters for application information
 */
export const validateApplicationInformationSearch = (req, res, next) => {
  try {
    const searchSchema = Joi.object({
      jobId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).optional(),
      skills: Joi.string().max(200).optional(),
      experience: Joi.string().pattern(/^\d+(-\d+)?$/).optional(), // Format: "2" or "2-5"
      location: Joi.string().max(50).optional(),
      salaryRange: Joi.string().pattern(/^\d+(-\d+)?$/).optional(), // Format: "50" or "50-100"
      education: Joi.string().max(100).optional(),
      status: Joi.string().valid('pending', 'reviewing', 'shortlisted', 'interviewed', 'offered', 'rejected').optional(),
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(10)
    });

    const { error, value } = searchSchema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const validationErrors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }));

      return res.status(400).json({
        success: false,
        message: 'Search validation failed',
        errors: validationErrors
      });
    }

    req.validatedQuery = value;
    next();

  } catch (error) {
    console.error('Application information search validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Search validation error occurred',
      error: error.message
    });
  }
};

/**
 * Validate file uploads for application information
 */
export const validateApplicationDocuments = (req, res, next) => {
  try {
    const allowedFileTypes = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png'];
    const maxFileSize = 10 * 1024 * 1024; // 10MB

    if (req.files) {
      for (const [fieldName, files] of Object.entries(req.files)) {
        const fileArray = Array.isArray(files) ? files : [files];
        
        for (const file of fileArray) {
          // Check file size
          if (file.size > maxFileSize) {
            return res.status(400).json({
              success: false,
              message: `File ${file.name} exceeds maximum size of 10MB`,
              field: fieldName
            });
          }

          // Check file type
          const fileExtension = file.name.split('.').pop().toLowerCase();
          if (!allowedFileTypes.includes(fileExtension)) {
            return res.status(400).json({
              success: false,
              message: `File type ${fileExtension} is not allowed for ${fieldName}`,
              allowedTypes: allowedFileTypes,
              field: fieldName
            });
          }
        }
      }
    }

    next();

  } catch (error) {
    console.error('Document validation error:', error);
    res.status(500).json({
      success: false,
      message: 'Document validation error occurred',
      error: error.message
    });
  }
};

export default {
  validateApplicationInformationCreation,
  validateApplicationInformationUpdate,
  validateApplicationInformationSearch,
  validateApplicationDocuments
};
