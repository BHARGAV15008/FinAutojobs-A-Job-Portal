import { body, validationResult } from 'express-validator';

// Strong password pattern with good mix of requirements
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const phonePattern = /^\+?[\d\s-()]{10,15}$/;
const urlPattern = /^https?:\/\/.+/i;

// Validation middleware function
export const validateRequest = (validationRules) => {
  return async (req, res, next) => {
    // If validationRules is an object with body, query, params
    if (validationRules.body) {
      const rules = [];
      
      // Convert validation rules to express-validator format
      for (const [field, rule] of Object.entries(validationRules.body)) {
        let validator = body(field);
        
        if (rule.notEmpty) validator = validator.notEmpty().withMessage(`${field} is required`);
        if (rule.isEmail) validator = validator.isEmail().withMessage('Invalid email format');
        if (rule.isLength) validator = validator.isLength(rule.isLength.options).withMessage(rule.errorMessage || `Invalid ${field} length`);
        if (rule.matches) validator = validator.matches(rule.matches.options).withMessage(rule.matches.errorMessage || rule.errorMessage);
        if (rule.isIn) validator = validator.isIn(rule.isIn.options).withMessage(rule.errorMessage || `Invalid ${field}`);
        if (rule.isArray) validator = validator.isArray(rule.isArray.options).withMessage(rule.errorMessage || `${field} must be an array`);
        if (rule.isFloat) validator = validator.isFloat(rule.isFloat.options).withMessage(rule.errorMessage || `Invalid ${field}`);
        if (rule.isBoolean) validator = validator.isBoolean().withMessage(rule.errorMessage || `${field} must be boolean`);
        if (rule.normalizeEmail) validator = validator.normalizeEmail();
        
        rules.push(validator);
      }
      
      // Run validations
      await Promise.all(rules.map(validation => validation.run(req)));
    }
    
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    next();
  };
};

// Export validation patterns for reuse
export { passwordPattern, phonePattern, urlPattern };
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
