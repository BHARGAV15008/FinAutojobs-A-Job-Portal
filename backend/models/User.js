import { z } from 'zod';

// User registration validation schema
export const userRegistrationSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters long')
    .max(50, 'Username must be less than 50 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: z.string()
    .email('Invalid email format')
    .max(255, 'Email must be less than 255 characters'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters long')
    .max(128, 'Password must be less than 128 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
  role: z.enum(['jobseeker', 'employer'], {
    errorMap: () => ({ message: 'Role must be either jobseeker or employer' })
  }),
  first_name: z.string()
    .min(1, 'First name is required')
    .max(50, 'First name must be less than 50 characters')
    .optional(),
  last_name: z.string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be less than 50 characters')
    .optional(),
  phone: z.string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
    .optional(),
  company_name: z.string()
    .min(1, 'Company name is required for employers')
    .max(100, 'Company name must be less than 100 characters')
    .optional(),
  job_title: z.string()
    .max(100, 'Job title must be less than 100 characters')
    .optional()
}).refine((data) => {
  // If role is employer, company_name is required
  if (data.role === 'employer' && !data.company_name) {
    return false;
  }
  return true;
}, {
  message: 'Company name is required for employers',
  path: ['company_name']
});

// User login validation schema
export const userLoginSchema = z.object({
  email: z.string()
    .email('Invalid email format'),
  password: z.string()
    .min(1, 'Password is required')
});

// User profile update validation schema
export const userProfileUpdateSchema = z.object({
  first_name: z.string()
    .min(1, 'First name is required')
    .max(50, 'First name must be less than 50 characters')
    .optional(),
  last_name: z.string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be less than 50 characters')
    .optional(),
  phone: z.string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
    .optional(),
  bio: z.string()
    .max(1000, 'Bio must be less than 1000 characters')
    .optional(),
  location: z.string()
    .max(100, 'Location must be less than 100 characters')
    .optional(),
  website: z.string()
    .url('Invalid website URL')
    .optional(),
  linkedin_url: z.string()
    .url('Invalid LinkedIn URL')
    .optional(),
  github_url: z.string()
    .url('Invalid GitHub URL')
    .optional(),
  // Jobseeker specific fields
  skills: z.array(z.string().max(50))
    .max(20, 'Maximum 20 skills allowed')
    .optional(),
  experience_years: z.number()
    .min(0, 'Experience years cannot be negative')
    .max(50, 'Experience years cannot exceed 50')
    .optional(),
  education_level: z.enum(['high_school', 'associate', 'bachelor', 'master', 'phd', 'other'])
    .optional(),
  preferred_job_type: z.enum(['full_time', 'part_time', 'contract', 'internship', 'freelance'])
    .optional(),
  preferred_work_mode: z.enum(['remote', 'hybrid', 'onsite'])
    .optional(),
  expected_salary_min: z.number()
    .min(0, 'Minimum salary cannot be negative')
    .optional(),
  expected_salary_max: z.number()
    .min(0, 'Maximum salary cannot be negative')
    .optional(),
  salary_currency: z.string()
    .length(3, 'Currency code must be 3 characters')
    .optional(),
  // Employer specific fields
  company_name: z.string()
    .min(1, 'Company name is required')
    .max(100, 'Company name must be less than 100 characters')
    .optional(),
  job_title: z.string()
    .max(100, 'Job title must be less than 100 characters')
    .optional(),
  company_size: z.enum(['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'])
    .optional(),
  industry: z.string()
    .max(100, 'Industry must be less than 100 characters')
    .optional()
}).refine((data) => {
  // If salary range is provided, max should be greater than min
  if (data.expected_salary_min && data.expected_salary_max) {
    return data.expected_salary_max >= data.expected_salary_min;
  }
  return true;
}, {
  message: 'Maximum salary must be greater than or equal to minimum salary',
  path: ['expected_salary_max']
});

// Password change validation schema
export const passwordChangeSchema = z.object({
  current_password: z.string()
    .min(1, 'Current password is required'),
  new_password: z.string()
    .min(8, 'New password must be at least 8 characters long')
    .max(128, 'New password must be less than 128 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'New password must contain at least one lowercase letter, one uppercase letter, and one number'),
  confirm_password: z.string()
    .min(1, 'Password confirmation is required')
}).refine((data) => {
  return data.new_password === data.confirm_password;
}, {
  message: 'Password confirmation does not match',
  path: ['confirm_password']
}).refine((data) => {
  return data.current_password !== data.new_password;
}, {
  message: 'New password must be different from current password',
  path: ['new_password']
});

// User status update validation schema (admin only)
export const userStatusUpdateSchema = z.object({
  status: z.enum(['active', 'inactive', 'suspended', 'deleted'], {
    errorMap: () => ({ message: 'Status must be one of: active, inactive, suspended, deleted' })
  })
});

// User query parameters validation schema
export const userQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  search: z.string().max(100).optional(),
  role: z.enum(['jobseeker', 'employer', 'admin']).optional(),
  status: z.enum(['active', 'inactive', 'suspended', 'deleted']).optional(),
  sort_by: z.enum(['created_at', 'updated_at', 'username', 'email']).optional(),
  sort_order: z.enum(['asc', 'desc']).optional()
});

// User model helper functions
export const UserModel = {
  // Validate user registration data
  validateRegistration: (data) => {
    return userRegistrationSchema.safeParse(data);
  },

  // Validate user login data
  validateLogin: (data) => {
    return userLoginSchema.safeParse(data);
  },

  // Validate user profile update data
  validateProfileUpdate: (data) => {
    return userProfileUpdateSchema.safeParse(data);
  },

  // Validate password change data
  validatePasswordChange: (data) => {
    return passwordChangeSchema.safeParse(data);
  },

  // Validate user status update data
  validateStatusUpdate: (data) => {
    return userStatusUpdateSchema.safeParse(data);
  },

  // Validate query parameters
  validateQuery: (data) => {
    return userQuerySchema.safeParse(data);
  },

  // Sanitize user data for public display
  sanitizeForPublic: (user) => {
    const {
      password,
      refresh_token,
      reset_token,
      reset_token_expires,
      ...publicUser
    } = user;
    return publicUser;
  },

  // Sanitize user data for profile display
  sanitizeForProfile: (user) => {
    const {
      password,
      refresh_token,
      reset_token,
      reset_token_expires,
      ...profileUser
    } = user;
    return profileUser;
  },

  // Check if user has required role
  hasRole: (user, requiredRole) => {
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(user.role);
    }
    return user.role === requiredRole;
  },

  // Check if user is active
  isActive: (user) => {
    return user.status === 'active';
  },

  // Get user display name
  getDisplayName: (user) => {
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    if (user.first_name) {
      return user.first_name;
    }
    return user.username;
  }
};