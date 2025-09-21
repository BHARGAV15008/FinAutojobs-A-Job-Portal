// Application constants and configuration

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    PROFILE: '/auth/profile',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
  },
  DASHBOARD: {
    APPLICANT: '/dashboard/applicant',
    RECRUITER: '/dashboard/recruiter',
    ADMIN: '/dashboard/admin',
    ANALYTICS: '/dashboard/analytics',
    PREFERENCES: '/dashboard/preferences',
  },
  JOBS: {
    BASE: '/jobs',
    SEARCH: '/jobs/search',
    SAVED: '/jobs/saved',
    RECOMMENDED: '/jobs/recommended',
    APPLY: (id) => `/jobs/${id}/apply`,
    SAVE: (id) => `/jobs/${id}/save`,
    ANALYTICS: (id) => `/jobs/${id}/analytics`,
  },
  APPLICATIONS: {
    BASE: '/applications',
    BY_JOB: (jobId) => `/jobs/${jobId}/applications`,
    STATUS: (id) => `/applications/${id}/status`,
    BULK_UPDATE: '/applications/bulk-update',
  },
  USERS: {
    BASE: '/users',
    ANALYTICS: '/users/analytics',
    EXPORT: '/users/export',
    STATUS: (id) => `/users/${id}/status`,
  },
  FILES: {
    RESUME: '/files/resume',
    PROFILE_PICTURE: '/files/profile-picture',
    COMPANY_LOGO: '/files/company-logo',
    DELETE: (id) => `/files/${id}`,
  },
  NOTIFICATIONS: {
    BASE: '/notifications',
    READ: (id) => `/notifications/${id}/read`,
    READ_ALL: '/notifications/read-all',
    SETTINGS: '/notifications/settings',
    BULK: '/notifications/bulk',
  },
};

export const USER_ROLES = {
  APPLICANT: 'applicant',
  RECRUITER: 'recruiter',
  EMPLOYER: 'employer',
  ADMIN: 'admin',
};

export const JOB_TYPES = {
  FULL_TIME: 'full-time',
  PART_TIME: 'part-time',
  CONTRACT: 'contract',
  INTERNSHIP: 'internship',
  FREELANCE: 'freelance',
};

export const EXPERIENCE_LEVELS = {
  ENTRY: 'entry',
  MID: 'mid',
  SENIOR: 'senior',
  EXECUTIVE: 'executive',
};

export const APPLICATION_STATUS = {
  PENDING: 'pending',
  REVIEWED: 'reviewed',
  SHORTLISTED: 'shortlisted',
  INTERVIEWED: 'interviewed',
  OFFERED: 'offered',
  HIRED: 'hired',
  REJECTED: 'rejected',
  WITHDRAWN: 'withdrawn',
};

export const NOTIFICATION_TYPES = {
  APPLICATION_STATUS: 'application_status',
  NEW_APPLICATION: 'new_application',
  INTERVIEW_SCHEDULED: 'interview_scheduled',
  JOB_MATCH: 'job_match',
  MESSAGE: 'message',
  SYSTEM: 'system',
};

export const FILE_TYPES = {
  RESUME: {
    ALLOWED: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
  },
  IMAGE: {
    ALLOWED: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    MAX_SIZE: 2 * 1024 * 1024, // 2MB
  },
};

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
};

export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
};

export const FONT_SIZES = {
  SMALL: 'small',
  MEDIUM: 'medium',
  LARGE: 'large',
};

export const LANGUAGES = {
  EN: 'en',
  HI: 'hi',
  MR: 'mr',
  GU: 'gu',
  TA: 'ta',
  TE: 'te',
  KN: 'kn',
  ML: 'ml',
};

export const COMPANY_SIZES = {
  STARTUP: '1-10',
  SMALL: '11-50',
  MEDIUM: '51-200',
  LARGE: '201-500',
  ENTERPRISE: '501-1000',
  CORPORATION: '1000+',
};

export const INDUSTRIES = [
  'Technology',
  'Finance',
  'Healthcare',
  'Education',
  'Manufacturing',
  'Retail',
  'Consulting',
  'Media',
  'Real Estate',
  'Transportation',
  'Energy',
  'Government',
  'Non-profit',
  'Other',
];

export const SKILLS_CATEGORIES = {
  TECHNICAL: 'technical',
  SOFT: 'soft',
  LANGUAGE: 'language',
  CERTIFICATION: 'certification',
};

export const SALARY_RANGES = [
  '0-3 LPA',
  '3-6 LPA',
  '6-10 LPA',
  '10-15 LPA',
  '15-25 LPA',
  '25-40 LPA',
  '40+ LPA',
];

export const LOCATIONS = [
  'Mumbai',
  'Delhi',
  'Bangalore',
  'Hyderabad',
  'Chennai',
  'Pune',
  'Kolkata',
  'Ahmedabad',
  'Surat',
  'Jaipur',
  'Remote',
  'Other',
];

export const EDUCATION_LEVELS = [
  'High School',
  'Diploma',
  'Bachelor\'s Degree',
  'Master\'s Degree',
  'PhD',
  'Professional Certification',
];

export const INTERVIEW_TYPES = {
  PHONE: 'phone',
  VIDEO: 'video',
  IN_PERSON: 'in-person',
  TECHNICAL: 'technical',
  HR: 'hr',
  BEHAVIORAL: 'behavioral',
  FINAL: 'final',
};

export const INTERVIEW_STATUS = {
  SCHEDULED: 'scheduled',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  RESCHEDULED: 'rescheduled',
  NO_SHOW: 'no_show',
};

export const PRIORITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
};

export const DATE_FORMATS = {
  SHORT: 'MMM DD, YYYY',
  LONG: 'MMMM DD, YYYY',
  WITH_TIME: 'MMM DD, YYYY HH:mm',
  TIME_ONLY: 'HH:mm',
};

export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  EMAIL: 'Please enter a valid email address',
  PASSWORD: 'Password must be at least 8 characters with uppercase, lowercase, number and special character',
  PHONE: 'Please enter a valid phone number',
  URL: 'Please enter a valid URL',
  MIN_LENGTH: (min) => `Must be at least ${min} characters`,
  MAX_LENGTH: (max) => `Must be less than ${max} characters`,
  MIN_VALUE: (min) => `Must be at least ${min}`,
  MAX_VALUE: (max) => `Must be less than ${max}`,
  FILE_SIZE: (max) => `File size must be less than ${max}MB`,
  FILE_TYPE: (types) => `Allowed file types: ${types.join(', ')}`,
};

export const LOCAL_STORAGE_KEYS = {
  TOKEN: 'token',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
  THEME: 'theme',
  FONT_SIZE: 'fontSize',
  LANGUAGE: 'language',
  SIDEBAR_COLLAPSED: 'sidebarCollapsed',
  RECENT_SEARCHES: 'recentSearches',
  DRAFT_APPLICATION: 'draftApplication',
};

export const FEATURE_FLAGS = {
  REAL_TIME_NOTIFICATIONS: import.meta.env.VITE_ENABLE_REAL_TIME_NOTIFICATIONS === 'true',
  FILE_UPLOADS: import.meta.env.VITE_ENABLE_FILE_UPLOADS === 'true',
  SOCIAL_LOGIN: import.meta.env.VITE_ENABLE_SOCIAL_LOGIN === 'true',
  PREMIUM_FEATURES: import.meta.env.VITE_ENABLE_PREMIUM_FEATURES === 'true',
  ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
  DEBUG: import.meta.env.VITE_DEBUG === 'true',
};

export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  TIMEOUT: 10000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
};

export const APP_CONFIG = {
  NAME: import.meta.env.VITE_APP_NAME || 'FinAutoJobs',
  VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
  ENVIRONMENT: import.meta.env.VITE_NODE_ENV || 'development',
  SUPPORT_EMAIL: 'support@finautojobs.com',
  CONTACT_PHONE: '+91 9876543210',
  COMPANY_ADDRESS: 'Mumbai, Maharashtra, India',
};

export default {
  API_ENDPOINTS,
  USER_ROLES,
  JOB_TYPES,
  EXPERIENCE_LEVELS,
  APPLICATION_STATUS,
  NOTIFICATION_TYPES,
  FILE_TYPES,
  PAGINATION,
  THEMES,
  FONT_SIZES,
  LANGUAGES,
  COMPANY_SIZES,
  INDUSTRIES,
  SKILLS_CATEGORIES,
  SALARY_RANGES,
  LOCATIONS,
  EDUCATION_LEVELS,
  INTERVIEW_TYPES,
  INTERVIEW_STATUS,
  PRIORITY_LEVELS,
  DATE_FORMATS,
  VALIDATION_MESSAGES,
  LOCAL_STORAGE_KEYS,
  FEATURE_FLAGS,
  API_CONFIG,
  APP_CONFIG,
};
