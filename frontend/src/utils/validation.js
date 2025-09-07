import { z } from 'zod';

// Common validation schemas
export const emailSchema = z.string().email('Invalid email address');
export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and number');

export const phoneSchema = z.string()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format');

// User validation schemas
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required')
});

export const registerSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .max(50, 'Username must be less than 50 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  full_name: z.string().min(1, 'Full name is required').max(100),
  phone: phoneSchema.optional(),
  role: z.enum(['jobseeker', 'employer']),
  skills: z.array(z.string()).optional(),
  qualification: z.string().optional(),
  company_name: z.string().optional(),
  position: z.string().optional()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
}).refine((data) => {
  if (data.role === 'employer' && !data.company_name) {
    return false;
  }
  return true;
}, {
  message: "Company name is required for employers",
  path: ["company_name"],
});

// Job validation schemas
export const jobSearchSchema = z.object({
  search: z.string().optional(),
  location: z.string().optional(),
  job_type: z.string().optional(),
  work_mode: z.string().optional(),
  salary_min: z.number().min(0).optional(),
  salary_max: z.number().min(0).optional(),
  experience_min: z.number().min(0).optional(),
  experience_max: z.number().min(0).optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(10)
});

export const jobApplicationSchema = z.object({
  job_id: z.number().positive(),
  cover_letter: z.string().min(50, 'Cover letter must be at least 50 characters').optional(),
  resume_url: z.string().url('Invalid resume URL').optional()
});

// Validation helper functions
export const validateForm = (schema, data) => {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.reduce((acc, err) => {
        const field = err.path.join('.');
        acc[field] = err.message;
        return acc;
      }, {});
      
      return { success: false, errors };
    }
    
    return { success: false, errors: { general: 'Validation failed' } };
  }
};

// Input sanitization
export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim();
};

// XSS protection for displaying user content
export const sanitizeForDisplay = (content) => {
  if (typeof content !== 'string') return content;
  
  return content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
};

// File validation
export const validateFile = (file, options = {}) => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'],
    allowedExtensions = ['.jpg', '.jpeg', '.png', '.pdf']
  } = options;

  const errors = [];

  if (file.size > maxSize) {
    errors.push(`File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`);
  }

  if (!allowedTypes.includes(file.type)) {
    errors.push(`File type ${file.type} is not allowed`);
  }

  const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
  if (!allowedExtensions.includes(extension)) {
    errors.push(`File extension ${extension} is not allowed`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

export default {
  emailSchema,
  passwordSchema,
  phoneSchema,
  loginSchema,
  registerSchema,
  jobSearchSchema,
  jobApplicationSchema,
  validateForm,
  sanitizeInput,
  sanitizeForDisplay,
  validateFile
};