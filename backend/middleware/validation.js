import { z } from 'zod';

// Strong password pattern with good mix of requirements
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const phonePattern = /^\+?[\d\s-()]{10,15}$/;
const urlPattern = /^https?:\/\/.+/i;

// Base schema for all requests with common fields
const baseSchema = {
    email: z.string()
        .email('Invalid email format')
        .min(5, 'Email must be at least 5 characters')
        .max(255, 'Email must not exceed 255 characters')
        .transform(val => val.toLowerCase().trim()),
    
    password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .max(100, 'Password must not exceed 100 characters')
        .regex(passwordPattern, 'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character'),
    
    phone: z.string()
        .regex(phonePattern, 'Invalid phone number format')
        .optional(),
    
    name: z.string()
        .min(2, 'Name must be at least 2 characters')
        .max(100, 'Name must not exceed 100 characters')
        .transform(val => val.trim()),
    
    url: z.string()
        .regex(urlPattern, 'Invalid URL format')
        .optional(),
};

// Registration schema
export const registrationSchema = z.object({
    username: z.string()
        .min(3, 'Username must be at least 3 characters')
        .max(50, 'Username must not exceed 50 characters')
        .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores and hyphens')
        .transform(val => val.toLowerCase()),
    email: baseSchema.email,
    password: baseSchema.password,
    confirmPassword: baseSchema.password,
    fullName: baseSchema.name,
    phone: baseSchema.phone,
    role: z.enum(['jobseeker', 'recruiter', 'admin'])
        .default('jobseeker'),
}).refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"]
});

// Login schema
export const loginSchema = z.object({
    email: baseSchema.email,
    password: z.string().min(1, 'Password is required')
});

// Password change schema
export const passwordChangeSchema = z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: baseSchema.password,
    confirmNewPassword: baseSchema.password
}).refine(data => data.newPassword === data.confirmNewPassword, {
    message: "New passwords don't match",
    path: ["confirmNewPassword"]
});

// Profile update schema
export const profileUpdateSchema = z.object({
    fullName: baseSchema.name.optional(),
    phone: baseSchema.phone,
    bio: z.string().max(500, 'Bio must not exceed 500 characters').optional(),
    location: z.string().max(100, 'Location must not exceed 100 characters').optional(),
    linkedinUrl: baseSchema.url,
    githubUrl: baseSchema.url,
    portfolioUrl: baseSchema.url,
    skills: z.array(z.string()).optional(),
    experienceYears: z.number().min(0).max(50).optional(),
    education: z.array(z.object({
        degree: z.string(),
        institution: z.string(),
        year: z.number()
    })).optional()
});

// Job posting schema
export const jobPostingSchema = z.object({
    title: z.string()
        .min(5, 'Title must be at least 5 characters')
        .max(100, 'Title must not exceed 100 characters'),
    description: z.string()
        .min(50, 'Description must be at least 50 characters')
        .max(5000, 'Description must not exceed 5000 characters'),
    companyId: z.number().positive(),
    location: z.string()
        .min(2, 'Location must be at least 2 characters')
        .max(100, 'Location must not exceed 100 characters'),
    requirements: z.array(z.string()).min(1, 'At least one requirement is needed'),
    responsibilities: z.array(z.string()).min(1, 'At least one responsibility is needed'),
    experienceMin: z.number().min(0),
    experienceMax: z.number().min(0),
    salaryMin: z.number().optional(),
    salaryMax: z.number().optional(),
    skills: z.array(z.string()).min(1, 'At least one skill is required'),
    workMode: z.enum(['office', 'remote', 'hybrid']),
    jobType: z.enum(['full-time', 'part-time', 'contract', 'internship']),
    deadline: z.string().datetime().optional()
}).refine(data => {
    if (data.salaryMin && data.salaryMax) {
        return data.salaryMax >= data.salaryMin;
    }
    return true;
}, {
    message: "Maximum salary must be greater than or equal to minimum salary",
    path: ["salaryMax"]
}).refine(data => {
    return data.experienceMax >= data.experienceMin;
}, {
    message: "Maximum experience must be greater than or equal to minimum experience",
    path: ["experienceMax"]
});

// Company profile schema
export const companyProfileSchema = z.object({
    name: z.string()
        .min(2, 'Company name must be at least 2 characters')
        .max(100, 'Company name must not exceed 100 characters'),
    description: z.string()
        .min(50, 'Description must be at least 50 characters')
        .max(2000, 'Description must not exceed 2000 characters'),
    website: baseSchema.url,
    location: z.string()
        .min(2, 'Location must be at least 2 characters')
        .max(100, 'Location must not exceed 100 characters'),
    industry: z.string()
        .min(2, 'Industry must be at least 2 characters')
        .max(50, 'Industry must not exceed 50 characters'),
    size: z.enum(['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']),
    foundedYear: z.number().min(1800).max(new Date().getFullYear()),
    email: baseSchema.email,
    phone: baseSchema.phone,
    linkedinUrl: baseSchema.url,
    twitterUrl: baseSchema.url,
    facebookUrl: baseSchema.url
});

// Application schema
export const applicationSchema = z.object({
    jobId: z.number().positive(),
    userId: z.number().positive(),
    coverLetter: z.string()
        .min(50, 'Cover letter must be at least 50 characters')
        .max(2000, 'Cover letter must not exceed 2000 characters'),
    resumeUrl: baseSchema.url,
    portfolioUrl: baseSchema.url,
    expectedSalary: z.number().positive().optional(),
    availableFrom: z.string().datetime(),
    noticePeriod: z.enum(['immediate', '15days', '30days', '60days', '90days']),
    customResponses: z.record(z.string()).optional()
});

// OTP validation schema
export const otpSchema = z.object({
    email: baseSchema.email,
    otp: z.string()
        .length(6, 'OTP must be exactly 6 characters')
        .regex(/^\d+$/, 'OTP must contain only numbers')
});

// Export validation middleware factory
export const validateRequest = (schema) => async (req, res, next) => {
    try {
        const validatedData = await schema.parseAsync(req.body);
        req.validatedData = validatedData;
        next();
    } catch (error) {
        return res.status(400).json({
            error: 'Validation failed',
            details: error.errors.map(err => ({
                field: err.path.join('.'),
                message: err.message
            }))
        });
    }
};
