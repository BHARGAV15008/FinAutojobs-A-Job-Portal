/**
 * Unified Naming Conventions for FinAutoJobs
 * This file defines all naming standards across the entire backend
 */

export const NAMING_CONVENTIONS = {
  // Database Names
  DATABASES: {
    MAIN: 'finautojobs_main',
    USERS: 'finautojobs_users', 
    JOBS: 'finautojobs_jobs',
    APPLICATIONS: 'finautojobs_applications',
    ANALYTICS: 'finautojobs_analytics'
  },

  // Collection Names (Consistent across all databases)
  COLLECTIONS: {
    // User Collections
    USERS: 'users',
    APPLICANTS: 'applicants',
    RECRUITERS: 'recruiters', 
    ADMINS: 'admins',
    
    // Job Collections
    JOBS: 'jobs',
    JOB_CATEGORIES: 'job_categories',
    COMPANIES: 'companies',
    
    // Application Collections
    APPLICATIONS: 'applications',
    INTERVIEWS: 'interviews',
    ASSESSMENTS: 'assessments',
    
    // System Collections
    NOTIFICATIONS: 'notifications',
    ANALYTICS: 'analytics',
    AUDIT_LOGS: 'audit_logs'
  },

  // Field Names (Standardized across all schemas)
  FIELDS: {
    // Primary Keys
    ID: '_id',
    USER_ID: 'userId',
    APPLICANT_ID: 'applicantId',
    RECRUITER_ID: 'recruiterId',
    ADMIN_ID: 'adminId',
    JOB_ID: 'jobId',
    APPLICATION_ID: 'applicationId',
    COMPANY_ID: 'companyId',

    // Personal Information
    FIRST_NAME: 'firstName',
    LAST_NAME: 'lastName',
    FULL_NAME: 'fullName',
    EMAIL: 'email',
    PHONE: 'phone',
    DATE_OF_BIRTH: 'dateOfBirth',
    GENDER: 'gender',

    // Address Fields
    STREET_ADDRESS: 'streetAddress',
    CITY: 'city',
    STATE: 'state',
    COUNTRY: 'country',
    POSTAL_CODE: 'postalCode',
    COORDINATES: 'coordinates',

    // Professional Fields
    COMPANY_NAME: 'companyName',
    JOB_TITLE: 'jobTitle',
    DEPARTMENT: 'department',
    YEARS_OF_EXPERIENCE: 'yearsOfExperience',
    CURRENT_SALARY: 'currentSalary',
    EXPECTED_SALARY: 'expectedSalary',

    // Social Links
    LINKEDIN_URL: 'linkedinUrl',
    GITHUB_URL: 'githubUrl',
    PORTFOLIO_URL: 'portfolioUrl',
    TWITTER_URL: 'twitterUrl',

    // Status Fields
    STATUS: 'status',
    IS_ACTIVE: 'isActive',
    IS_VERIFIED: 'isVerified',
    IS_DELETED: 'isDeleted',

    // Timestamps
    CREATED_AT: 'createdAt',
    UPDATED_AT: 'updatedAt',
    DELETED_AT: 'deletedAt'
  },

  // API Endpoints (RESTful conventions)
  API_ENDPOINTS: {
    // Authentication
    AUTH: {
      BASE: '/api/auth',
      REGISTER: '/register',
      LOGIN: '/login',
      LOGOUT: '/logout',
      PROFILE: '/profile',
      REFRESH: '/refresh-token'
    },

    // Users
    USERS: {
      BASE: '/api/users',
      BY_ID: '/:userId',
      PROFILE: '/:userId/profile',
      SETTINGS: '/:userId/settings'
    },

    // Jobs
    JOBS: {
      BASE: '/api/jobs',
      BY_ID: '/:jobId',
      BY_RECRUITER: '/recruiter/:recruiterId',
      SEARCH: '/search',
      CATEGORIES: '/categories'
    },

    // Applications
    APPLICATIONS: {
      BASE: '/api/applications',
      BY_ID: '/:applicationId',
      BY_JOB: '/job/:jobId',
      BY_APPLICANT: '/applicant/:applicantId',
      BY_RECRUITER: '/recruiter/:recruiterId'
    }
  },

  // Status Enums
  STATUS_ENUMS: {
    USER_STATUS: ['active', 'inactive', 'suspended', 'pending'],
    APPLICATION_STATUS: ['pending', 'reviewing', 'shortlisted', 'interviewed', 'selected', 'rejected'],
    JOB_STATUS: ['draft', 'active', 'paused', 'closed', 'expired'],
    INTERVIEW_STATUS: ['scheduled', 'completed', 'cancelled', 'rescheduled']
  },

  // Validation Rules
  VALIDATION: {
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE_REGEX: /^[\+]?[1-9][\d]{0,15}$/,
    PASSWORD_MIN_LENGTH: 8,
    NAME_MAX_LENGTH: 50,
    BIO_MAX_LENGTH: 2000
  }
};

// Helper functions for consistent naming
export const formatFieldName = (name) => {
  return name.charAt(0).toLowerCase() + name.slice(1);
};

export const formatCollectionName = (name) => {
  return name.toLowerCase().replace(/\s+/g, '_');
};

export const formatDatabaseName = (name) => {
  return `finautojobs_${name.toLowerCase()}`;
};

export default NAMING_CONVENTIONS;
