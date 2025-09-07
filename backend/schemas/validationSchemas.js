import { z } from 'zod';

// Common validation utilities
export const commonSchemas = {
  // Email validation
  email: z.string()
    .email('Invalid email format')
    .max(255, 'Email must be less than 255 characters'),
  
  // Phone validation
  phone: z.string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
    .optional(),
  
  // URL validation
  url: z.string()
    .url('Invalid URL format')
    .optional(),
  
  // Password validation
  password: z.string()
    .min(8, 'Password must be at least 8 characters long')
    .max(128, 'Password must be less than 128 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  
  // Name validation
  name: z.string()
    .min(1, 'Name is required')
    .max(50, 'Name must be less than 50 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes'),
  
  // Description validation
  description: z.string()
    .max(2000, 'Description must be less than 2000 characters')
    .optional(),
  
  // Location validation
  location: z.string()
    .max(100, 'Location must be less than 100 characters')
    .optional(),
  
  // Skills validation
  skills: z.array(z.string().max(50))
    .max(20, 'Maximum 20 skills allowed')
    .optional(),
  
  // File validation
  file: z.object({
    originalname: z.string(),
    mimetype: z.string(),
    size: z.number(),
    buffer: z.any()
  }).optional()
};

// Applicant Profile Validation Schemas
export const applicantProfileSchemas = {
  // Personal information
  personalInfo: z.object({
    firstName: commonSchemas.name,
    lastName: commonSchemas.name,
    email: commonSchemas.email,
    mobile: commonSchemas.phone,
    location: commonSchemas.location,
    bio: z.string()
      .max(500, 'Bio must be less than 500 characters')
      .optional(),
    profilePicture: z.string()
      .url('Invalid profile picture URL')
      .optional()
  }),
  
  // Professional links
  professionalLinks: z.object({
    githubUrl: z.string()
      .url('Invalid GitHub URL')
      .regex(/^https:\/\/github\.com\/[\w-]+/, 'Invalid GitHub profile URL')
      .optional(),
    linkedinUrl: z.string()
      .url('Invalid LinkedIn URL')
      .regex(/^https:\/\/(www\.)?linkedin\.com\/in\/[\w-]+/, 'Invalid LinkedIn profile URL')
      .optional(),
    portfolioUrl: commonSchemas.url
  }),
  
  // Education information
  education: z.object({
    highestQualification: z.enum([
      'high_school', 'associate', 'bachelor', 'master', 'phd', 'other'
    ], {
      errorMap: () => ({ message: 'Invalid education level' })
    }),
    institution: z.string()
      .max(100, 'Institution name must be less than 100 characters')
      .optional(),
    fieldOfStudy: z.string()
      .max(100, 'Field of study must be less than 100 characters')
      .optional(),
    graduationYear: z.number()
      .min(1950, 'Invalid graduation year')
      .max(new Date().getFullYear() + 5, 'Graduation year cannot be in the distant future')
      .optional()
  }),
  
  // Experience information
  experience: z.object({
    isExperienced: z.boolean(),
    experienceYears: z.number()
      .min(0, 'Experience years cannot be negative')
      .max(50, 'Experience years cannot exceed 50')
      .optional(),
    currentRole: z.string()
      .max(100, 'Current role must be less than 100 characters')
      .optional(),
    companyName: z.string()
      .max(100, 'Company name must be less than 100 characters')
      .optional(),
    currentSalary: z.number()
      .min(0, 'Salary cannot be negative')
      .optional()
  }).refine((data) => {
    // If experienced, experience details are required
    if (data.isExperienced && (!data.experienceYears || !data.currentRole)) {
      return false;
    }
    return true;
  }, {
    message: 'Experience details are required for experienced professionals',
    path: ['experienceYears']
  }),
  
  // Resume upload
  resumeUpload: z.object({
    resume: commonSchemas.file.refine(
      (file) => !file || ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.mimetype),
      'Only PDF, DOC, and DOCX files are allowed'
    ).refine(
      (file) => !file || file.size <= 5 * 1024 * 1024, // 5MB
      'File size must be less than 5MB'
    )
  }),
  
  // Complete profile validation
  completeProfile: z.object({
    personalInfo: z.object({
      firstName: commonSchemas.name,
      lastName: commonSchemas.name,
      email: commonSchemas.email,
      mobile: commonSchemas.phone,
      location: commonSchemas.location,
      bio: z.string()
        .max(500, 'Bio must be less than 500 characters')
        .optional(),
      profilePicture: z.string()
        .url('Invalid profile picture URL')
        .optional()
    }),
    professionalLinks: z.object({
      githubUrl: z.string()
        .url('Invalid GitHub URL')
        .regex(/^https:\/\/github\.com\/[\w-]+/, 'Invalid GitHub profile URL')
        .optional(),
      linkedinUrl: z.string()
        .url('Invalid LinkedIn URL')
        .regex(/^https:\/\/(www\.)?linkedin\.com\/in\/[\w-]+/, 'Invalid LinkedIn profile URL')
        .optional(),
      portfolioUrl: commonSchemas.url
    }),
    education: z.object({
      highestQualification: z.enum([
        'high_school', 'associate', 'bachelor', 'master', 'phd', 'other'
      ], {
        errorMap: () => ({ message: 'Invalid education level' })
      }),
      institution: z.string()
        .max(100, 'Institution name must be less than 100 characters')
        .optional(),
      fieldOfStudy: z.string()
        .max(100, 'Field of study must be less than 100 characters')
        .optional(),
      graduationYear: z.number()
        .min(1950, 'Invalid graduation year')
        .max(new Date().getFullYear() + 5, 'Graduation year cannot be in the distant future')
        .optional()
    }),
    experience: z.object({
      isExperienced: z.boolean(),
      experienceYears: z.number()
        .min(0, 'Experience years cannot be negative')
        .max(50, 'Experience years cannot exceed 50')
        .optional(),
      currentRole: z.string()
        .max(100, 'Current role must be less than 100 characters')
        .optional(),
      companyName: z.string()
        .max(100, 'Company name must be less than 100 characters')
        .optional(),
      currentSalary: z.number()
        .min(0, 'Salary cannot be negative')
        .optional()
    }).refine((data) => {
      // If experienced, experience details are required
      if (data.isExperienced && (!data.experienceYears || !data.currentRole)) {
        return false;
      }
      return true;
    }, {
      message: 'Experience details are required for experienced professionals',
      path: ['experienceYears']
    }),
    skills: commonSchemas.skills
  })
};

// Job Validation Schemas
export const jobSchemas = {
  // Job creation
  createJob: z.object({
    title: z.string()
      .min(1, 'Job title is required')
      .max(100, 'Job title must be less than 100 characters'),
    description: z.string()
      .min(10, 'Job description must be at least 10 characters long')
      .max(5000, 'Job description must be less than 5000 characters'),
    requirements: z.string()
      .min(10, 'Job requirements must be at least 10 characters long')
      .max(2000, 'Job requirements must be less than 2000 characters'),
    salaryMin: z.number()
      .min(0, 'Minimum salary cannot be negative')
      .optional(),
    salaryMax: z.number()
      .min(0, 'Maximum salary cannot be negative')
      .optional(),
    location: commonSchemas.location,
    jobType: z.enum(['full_time', 'part_time', 'contract', 'internship', 'freelance'], {
      errorMap: () => ({ message: 'Invalid job type' })
    }),
    experienceLevel: z.enum(['entry', 'mid', 'senior', 'executive'], {
      errorMap: () => ({ message: 'Invalid experience level' })
    }),
    workMode: z.enum(['remote', 'hybrid', 'onsite'], {
      errorMap: () => ({ message: 'Invalid work mode' })
    }),
    skillsRequired: commonSchemas.skills,
    applicationDeadline: z.string()
      .datetime('Invalid application deadline')
      .optional(),
    isActive: z.boolean().default(true)
  }).refine((data) => {
    // If salary range is provided, max should be greater than min
    if (data.salaryMin && data.salaryMax) {
      return data.salaryMax >= data.salaryMin;
    }
    return true;
  }, {
    message: 'Maximum salary must be greater than or equal to minimum salary',
    path: ['salaryMax']
  }),
  
  // Job update
  updateJob: z.object({
    title: z.string()
      .min(1, 'Job title is required')
      .max(100, 'Job title must be less than 100 characters')
      .optional(),
    description: z.string()
      .min(10, 'Job description must be at least 10 characters long')
      .max(5000, 'Job description must be less than 5000 characters')
      .optional(),
    requirements: z.string()
      .min(10, 'Job requirements must be at least 10 characters long')
      .max(2000, 'Job requirements must be less than 2000 characters')
      .optional(),
    salaryMin: z.number()
      .min(0, 'Minimum salary cannot be negative')
      .optional(),
    salaryMax: z.number()
      .min(0, 'Maximum salary cannot be negative')
      .optional(),
    location: commonSchemas.location.optional(),
    jobType: z.enum(['full_time', 'part_time', 'contract', 'internship', 'freelance'])
      .optional(),
    experienceLevel: z.enum(['entry', 'mid', 'senior', 'executive'])
      .optional(),
    workMode: z.enum(['remote', 'hybrid', 'onsite'])
      .optional(),
    skillsRequired: commonSchemas.skills.optional(),
    applicationDeadline: z.string()
      .datetime('Invalid application deadline')
      .optional(),
    status: z.enum(['active', 'paused', 'closed'])
      .optional()
  }),
  
  // Job search filters
  searchFilters: z.object({
    keyword: z.string()
      .max(100, 'Search keyword must be less than 100 characters')
      .optional(),
    location: z.string()
      .max(100, 'Location must be less than 100 characters')
      .optional(),
    jobType: z.enum(['full_time', 'part_time', 'contract', 'internship', 'freelance'])
      .optional(),
    workMode: z.enum(['remote', 'hybrid', 'onsite'])
      .optional(),
    experienceLevel: z.enum(['entry', 'mid', 'senior', 'executive'])
      .optional(),
    salaryMin: z.number()
      .min(0, 'Minimum salary cannot be negative')
      .optional(),
    salaryMax: z.number()
      .min(0, 'Maximum salary cannot be negative')
      .optional(),
    skills: z.array(z.string().max(50))
      .max(10, 'Maximum 10 skills allowed')
      .optional(),
    page: z.number()
      .min(1, 'Page must be at least 1')
      .default(1),
    limit: z.number()
      .min(1, 'Limit must be at least 1')
      .max(100, 'Limit cannot exceed 100')
      .default(10),
    sortBy: z.enum(['relevance', 'date', 'salary'])
      .default('relevance'),
    sortOrder: z.enum(['asc', 'desc'])
      .default('desc')
  })
};

// Application Validation Schemas
export const applicationSchemas = {
  // Create application
  createApplication: z.object({
    jobId: z.number()
      .min(1, 'Job ID is required'),
    coverLetter: z.string()
      .max(2000, 'Cover letter must be less than 2000 characters')
      .optional(),
    resumeUrl: z.string()
      .url('Invalid resume URL')
      .optional(),
    expectedSalary: z.number()
      .min(0, 'Expected salary cannot be negative')
      .optional(),
    availableFrom: z.string()
      .datetime('Invalid available date')
      .optional(),
    noticePeriod: z.string()
      .max(100, 'Notice period must be less than 100 characters')
      .optional()
  }),
  
  // Update application status (for recruiters)
  updateStatus: z.object({
    status: z.enum(['pending', 'under_review', 'shortlisted', 'interview_scheduled', 'interview_completed', 'selected', 'rejected', 'withdrawn'], {
      errorMap: () => ({ message: 'Invalid application status' })
    }),
    recruiterNotes: z.string()
      .max(1000, 'Recruiter notes must be less than 1000 characters')
      .optional()
  }),
  
  // Bulk application update
  bulkUpdate: z.object({
    applicationIds: z.array(z.number())
      .min(1, 'At least one application ID is required')
      .max(50, 'Cannot update more than 50 applications at once'),
    status: z.enum(['under_review', 'shortlisted', 'rejected'], {
      errorMap: () => ({ message: 'Invalid bulk update status' })
    }),
    recruiterNotes: z.string()
      .max(1000, 'Recruiter notes must be less than 1000 characters')
      .optional()
  })
};

// Interview Validation Schemas
export const interviewSchemas = {
  // Schedule interview
  scheduleInterview: z.object({
    applicationId: z.number()
      .min(1, 'Application ID is required'),
    title: z.string()
      .min(1, 'Interview title is required')
      .max(100, 'Interview title must be less than 100 characters'),
    description: z.string()
      .max(1000, 'Interview description must be less than 1000 characters')
      .optional(),
    scheduledDate: z.string()
      .datetime('Invalid scheduled date'),
    scheduledTime: z.string()
      .regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
    duration: z.number()
      .min(15, 'Duration must be at least 15 minutes')
      .max(480, 'Duration cannot exceed 8 hours')
      .default(60),
    type: z.enum(['technical', 'hr', 'behavioral', 'case_study', 'group'], {
      errorMap: () => ({ message: 'Invalid interview type' })
    }),
    mode: z.enum(['video', 'phone', 'in_person', 'online_test'], {
      errorMap: () => ({ message: 'Invalid interview mode' })
    }),
    meetingLink: z.string()
      .url('Invalid meeting link URL')
      .optional(),
    location: z.string()
      .max(200, 'Location must be less than 200 characters')
      .optional(),
    interviewerName: z.string()
      .max(100, 'Interviewer name must be less than 100 characters')
      .optional(),
    interviewerEmail: commonSchemas.email.optional(),
    interviewerPhone: commonSchemas.phone.optional()
  }),
  
  // Update interview status
  updateStatus: z.object({
    status: z.enum(['scheduled', 'confirmed', 'completed', 'cancelled', 'rescheduled', 'no_show'], {
      errorMap: () => ({ message: 'Invalid interview status' })
    }),
    feedback: z.string()
      .max(2000, 'Feedback must be less than 2000 characters')
      .optional(),
    rating: z.number()
      .min(1, 'Rating must be at least 1')
      .max(10, 'Rating cannot exceed 10')
      .optional(),
    technicalScore: z.number()
      .min(0, 'Technical score must be between 0 and 100')
      .max(100, 'Technical score must be between 0 and 100')
      .optional(),
    communicationScore: z.number()
      .min(0, 'Communication score must be between 0 and 100')
      .max(100, 'Communication score must be between 0 and 100')
      .optional(),
    recommendation: z.enum(['proceed', 'reject', 'hold'], {
      errorMap: () => ({ message: 'Invalid recommendation' })
    }).optional()
  })
};

// Company Validation Schemas
export const companySchemas = {
  // Company creation
  createCompany: z.object({
    name: z.string()
      .min(1, 'Company name is required')
      .max(100, 'Company name must be less than 100 characters'),
    description: z.string()
      .max(2000, 'Company description must be less than 2000 characters')
      .optional(),
    website: commonSchemas.url,
    industry: z.string()
      .max(100, 'Industry must be less than 100 characters')
      .optional(),
    size: z.enum(['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'], {
      errorMap: () => ({ message: 'Invalid company size' })
    }),
    location: commonSchemas.location,
    logoUrl: z.string()
      .url('Invalid logo URL')
      .optional()
  }),
  
  // Company update
  updateCompany: z.object({
    name: z.string()
      .min(1, 'Company name is required')
      .max(100, 'Company name must be less than 100 characters')
      .optional(),
    description: z.string()
      .max(2000, 'Company description must be less than 2000 characters')
      .optional(),
    website: commonSchemas.url.optional(),
    industry: z.string()
      .max(100, 'Industry must be less than 100 characters')
      .optional(),
    size: z.enum(['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'])
      .optional(),
    location: commonSchemas.location.optional(),
    logoUrl: z.string()
      .url('Invalid logo URL')
      .optional()
  })
};

// Settings Validation Schemas
export const settingsSchemas = {
  // User settings
  userSettings: z.object({
    theme: z.enum(['light', 'dark', 'auto'], {
      errorMap: () => ({ message: 'Invalid theme' })
    }),
    fontSize: z.enum(['small', 'medium', 'large'], {
      errorMap: () => ({ message: 'Invalid font size' })
    }),
    language: z.string()
      .length(2, 'Language code must be 2 characters')
      .default('en'),
    timezone: z.string()
      .max(50, 'Timezone must be less than 50 characters')
      .default('Asia/Kolkata'),
    emailNotifications: z.boolean().default(true),
    pushNotifications: z.boolean().default(true),
    jobAlertNotifications: z.boolean().default(true),
    interviewReminders: z.boolean().default(true),
    dashboardLayout: z.enum(['grid', 'list', 'compact']).default('grid'),
    sidebarCollapsed: z.boolean().default(false)
  }),
  
  // Notification preferences
  notificationPreferences: z.object({
    emailNotifications: z.boolean().default(true),
    pushNotifications: z.boolean().default(true),
    jobAlertNotifications: z.boolean().default(true),
    interviewReminders: z.boolean().default(true),
    applicationUpdates: z.boolean().default(true),
    marketingEmails: z.boolean().default(false)
  })
};

// Admin Validation Schemas
export const adminSchemas = {
  // User management
  userManagement: z.object({
    userId: z.number()
      .min(1, 'User ID is required'),
    role: z.enum(['jobseeker', 'employer', 'admin'], {
      errorMap: () => ({ message: 'Invalid user role' })
    }),
    status: z.enum(['active', 'inactive', 'suspended', 'deleted'], {
      errorMap: () => ({ message: 'Invalid user status' })
    })
  }),
  
  // Bulk user operations
  bulkUserOperation: z.object({
    userIds: z.array(z.number())
      .min(1, 'At least one user ID is required')
      .max(100, 'Cannot operate on more than 100 users at once'),
    operation: z.enum(['activate', 'deactivate', 'suspend', 'delete'], {
      errorMap: () => ({ message: 'Invalid operation' })
    })
  }),
  
  // System settings
  systemSettings: z.object({
    maintenanceMode: z.boolean().default(false),
    registrationEnabled: z.boolean().default(true),
    jobPostingEnabled: z.boolean().default(true),
    maxFileSize: z.number()
      .min(1, 'Max file size must be at least 1 byte')
      .max(50 * 1024 * 1024, 'Max file size cannot exceed 50MB')
      .default(10 * 1024 * 1024),
    allowedFileTypes: z.array(z.string())
      .default(['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']),
    rateLimitWindow: z.number()
      .min(60000, 'Rate limit window must be at least 1 minute')
      .max(3600000, 'Rate limit window cannot exceed 1 hour')
      .default(900000),
    rateLimitMax: z.number()
      .min(1, 'Rate limit max must be at least 1')
      .max(1000, 'Rate limit max cannot exceed 1000')
      .default(100)
  }),
  
  // Content moderation
  contentModeration: z.object({
    contentId: z.number()
      .min(1, 'Content ID is required'),
    contentType: z.enum(['job', 'company', 'user_profile'], {
      errorMap: () => ({ message: 'Invalid content type' })
    }),
    action: z.enum(['approve', 'reject', 'flag'], {
      errorMap: () => ({ message: 'Invalid moderation action' })
    }),
    reason: z.string()
      .max(500, 'Reason must be less than 500 characters')
      .optional()
  })
};

// Query Parameter Validation Schemas
export const querySchemas = {
  // Pagination
  pagination: z.object({
    page: z.string()
      .regex(/^\d+$/, 'Page must be a number')
      .transform(Number)
      .refine(n => n >= 1, 'Page must be at least 1')
      .default('1'),
    limit: z.string()
      .regex(/^\d+$/, 'Limit must be a number')
      .transform(Number)
      .refine(n => n >= 1 && n <= 100, 'Limit must be between 1 and 100')
      .default('10')
  }),
  
  // Search
  search: z.object({
    q: z.string()
      .max(100, 'Search query must be less than 100 characters')
      .optional(),
    page: z.string()
      .regex(/^\d+$/, 'Page must be a number')
      .transform(Number)
      .refine(n => n >= 1, 'Page must be at least 1')
      .default('1'),
    limit: z.string()
      .regex(/^\d+$/, 'Limit must be a number')
      .transform(Number)
      .refine(n => n >= 1 && n <= 100, 'Limit must be between 1 and 100')
      .default('10')
  }),
  
  // Date range
  dateRange: z.object({
    startDate: z.string()
      .datetime('Invalid start date')
      .optional(),
    endDate: z.string()
      .datetime('Invalid end date')
      .optional()
  }).refine((data) => {
    if (data.startDate && data.endDate) {
      return new Date(data.startDate) <= new Date(data.endDate);
    }
    return true;
  }, {
    message: 'Start date must be before or equal to end date',
    path: ['endDate']
  })
};

// Helper functions for validation
export const validationHelpers = {
  // Validate and sanitize user input
  validateInput: (schema, data) => {
    try {
      const result = schema.safeParse(data);
      if (result.success) {
        return { success: true, data: result.data };
      } else {
        return { 
          success: false, 
          errors: result.error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message
          }))
        };
      }
    } catch (error) {
      return { 
        success: false, 
        errors: [{ field: 'general', message: 'Validation failed' }] 
      };
    }
  },
  
  // Sanitize string input
  sanitizeString: (input, maxLength = 255) => {
    if (typeof input !== 'string') return '';
    return input.trim().slice(0, maxLength);
  },
  
  // Validate email format
  isValidEmail: (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },
  
  // Validate phone number format
  isValidPhone: (phone) => {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone);
  },
  
  // Validate URL format
  isValidUrl: (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },
  
  // Calculate profile completion percentage
  calculateProfileCompletion: (profile) => {
    const fields = [
      'firstName', 'lastName', 'email', 'mobile', 'location',
      'highestQualification', 'skills', 'bio'
    ];
    
    const completedFields = fields.filter(field => 
      profile[field] && profile[field].toString().trim() !== ''
    ).length;
    
    return Math.round((completedFields / fields.length) * 100);
  }
};

// Export all schemas for easy importing
export const allSchemas = {
  common: commonSchemas,
  applicantProfile: applicantProfileSchemas,
  job: jobSchemas,
  application: applicationSchemas,
  interview: interviewSchemas,
  company: companySchemas,
  settings: settingsSchemas,
  admin: adminSchemas,
  query: querySchemas,
  helpers: validationHelpers
};

export default allSchemas;
