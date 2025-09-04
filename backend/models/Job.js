import { z } from 'zod';

// Job creation validation schema
export const jobCreationSchema = z.object({
  title: z.string()
    .min(1, 'Job title is required')
    .max(200, 'Job title must be less than 200 characters'),
  description: z.string()
    .min(50, 'Job description must be at least 50 characters long')
    .max(5000, 'Job description must be less than 5000 characters'),
  company_id: z.number()
    .int('Company ID must be an integer')
    .positive('Company ID must be positive'),
  location: z.string()
    .min(1, 'Location is required')
    .max(200, 'Location must be less than 200 characters'),
  salary_min: z.number()
    .min(0, 'Minimum salary cannot be negative')
    .optional(),
  salary_max: z.number()
    .min(0, 'Maximum salary cannot be negative')
    .optional(),
  salary_currency: z.string()
    .length(3, 'Currency code must be 3 characters (e.g., USD, EUR)')
    .optional(),
  job_type: z.enum(['full_time', 'part_time', 'contract', 'internship', 'freelance'], {
    errorMap: () => ({ message: 'Job type must be one of: full_time, part_time, contract, internship, freelance' })
  }),
  work_mode: z.enum(['remote', 'hybrid', 'onsite'], {
    errorMap: () => ({ message: 'Work mode must be one of: remote, hybrid, onsite' })
  }),
  experience_min: z.number()
    .min(0, 'Minimum experience cannot be negative')
    .max(50, 'Minimum experience cannot exceed 50 years')
    .optional(),
  experience_max: z.number()
    .min(0, 'Maximum experience cannot be negative')
    .max(50, 'Maximum experience cannot exceed 50 years')
    .optional(),
  skills_required: z.array(z.string().max(50))
    .max(20, 'Maximum 20 skills allowed')
    .optional(),
  education_required: z.enum(['high_school', 'associate', 'bachelor', 'master', 'phd', 'none'])
    .optional(),
  benefits: z.array(z.string().max(100))
    .max(15, 'Maximum 15 benefits allowed')
    .optional(),
  application_deadline: z.string()
    .datetime('Invalid application deadline format')
    .optional(),
  is_featured: z.boolean()
    .optional()
    .default(false),
  is_urgent: z.boolean()
    .optional()
    .default(false)
}).refine((data) => {
  // If salary range is provided, max should be greater than min
  if (data.salary_min && data.salary_max) {
    return data.salary_max >= data.salary_min;
  }
  return true;
}, {
  message: 'Maximum salary must be greater than or equal to minimum salary',
  path: ['salary_max']
}).refine((data) => {
  // If experience range is provided, max should be greater than min
  if (data.experience_min !== undefined && data.experience_max !== undefined) {
    return data.experience_max >= data.experience_min;
  }
  return true;
}, {
  message: 'Maximum experience must be greater than or equal to minimum experience',
  path: ['experience_max']
}).refine((data) => {
  // If salary is provided, currency should also be provided
  if ((data.salary_min || data.salary_max) && !data.salary_currency) {
    return false;
  }
  return true;
}, {
  message: 'Currency is required when salary is specified',
  path: ['salary_currency']
}).refine((data) => {
  // Application deadline should be in the future
  if (data.application_deadline) {
    const deadline = new Date(data.application_deadline);
    const now = new Date();
    return deadline > now;
  }
  return true;
}, {
  message: 'Application deadline must be in the future',
  path: ['application_deadline']
});

// Job update validation schema
export const jobUpdateSchema = z.object({
  title: z.string()
    .min(1, 'Job title is required')
    .max(200, 'Job title must be less than 200 characters')
    .optional(),
  description: z.string()
    .min(50, 'Job description must be at least 50 characters long')
    .max(5000, 'Job description must be less than 5000 characters')
    .optional(),
  location: z.string()
    .min(1, 'Location is required')
    .max(200, 'Location must be less than 200 characters')
    .optional(),
  salary_min: z.number()
    .min(0, 'Minimum salary cannot be negative')
    .optional(),
  salary_max: z.number()
    .min(0, 'Maximum salary cannot be negative')
    .optional(),
  salary_currency: z.string()
    .length(3, 'Currency code must be 3 characters (e.g., USD, EUR)')
    .optional(),
  job_type: z.enum(['full_time', 'part_time', 'contract', 'internship', 'freelance'])
    .optional(),
  work_mode: z.enum(['remote', 'hybrid', 'onsite'])
    .optional(),
  experience_min: z.number()
    .min(0, 'Minimum experience cannot be negative')
    .max(50, 'Minimum experience cannot exceed 50 years')
    .optional(),
  experience_max: z.number()
    .min(0, 'Maximum experience cannot be negative')
    .max(50, 'Maximum experience cannot exceed 50 years')
    .optional(),
  skills_required: z.array(z.string().max(50))
    .max(20, 'Maximum 20 skills allowed')
    .optional(),
  education_required: z.enum(['high_school', 'associate', 'bachelor', 'master', 'phd', 'none'])
    .optional(),
  benefits: z.array(z.string().max(100))
    .max(15, 'Maximum 15 benefits allowed')
    .optional(),
  application_deadline: z.string()
    .datetime('Invalid application deadline format')
    .optional(),
  is_featured: z.boolean()
    .optional(),
  is_urgent: z.boolean()
    .optional(),
  status: z.enum(['active', 'paused', 'closed', 'draft'])
    .optional()
}).refine((data) => {
  // If salary range is provided, max should be greater than min
  if (data.salary_min && data.salary_max) {
    return data.salary_max >= data.salary_min;
  }
  return true;
}, {
  message: 'Maximum salary must be greater than or equal to minimum salary',
  path: ['salary_max']
}).refine((data) => {
  // If experience range is provided, max should be greater than min
  if (data.experience_min !== undefined && data.experience_max !== undefined) {
    return data.experience_max >= data.experience_min;
  }
  return true;
}, {
  message: 'Maximum experience must be greater than or equal to minimum experience',
  path: ['experience_max']
});

// Job query parameters validation schema
export const jobQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  search: z.string().max(200).optional(),
  location: z.string().max(200).optional(),
  job_type: z.enum(['full_time', 'part_time', 'contract', 'internship', 'freelance']).optional(),
  work_mode: z.enum(['remote', 'hybrid', 'onsite']).optional(),
  salary_min: z.string().regex(/^\d+$/).transform(Number).optional(),
  salary_max: z.string().regex(/^\d+$/).transform(Number).optional(),
  experience_min: z.string().regex(/^\d+$/).transform(Number).optional(),
  experience_max: z.string().regex(/^\d+$/).transform(Number).optional(),
  education_required: z.enum(['high_school', 'associate', 'bachelor', 'master', 'phd', 'none']).optional(),
  company_id: z.string().regex(/^\d+$/).transform(Number).optional(),
  is_featured: z.enum(['true', 'false']).transform(val => val === 'true').optional(),
  is_urgent: z.enum(['true', 'false']).transform(val => val === 'true').optional(),
  status: z.enum(['active', 'paused', 'closed', 'draft']).optional(),
  sort_by: z.enum(['created_at', 'updated_at', 'title', 'salary_min', 'salary_max', 'application_deadline']).optional(),
  sort_order: z.enum(['asc', 'desc']).optional(),
  posted_within: z.enum(['1', '7', '30', '90']).transform(Number).optional() // days
});

// Job status update validation schema
export const jobStatusUpdateSchema = z.object({
  status: z.enum(['active', 'paused', 'closed', 'draft'], {
    errorMap: () => ({ message: 'Status must be one of: active, paused, closed, draft' })
  })
});

// Job model helper functions
export const JobModel = {
  // Validate job creation data
  validateCreation: (data) => {
    return jobCreationSchema.safeParse(data);
  },

  // Validate job update data
  validateUpdate: (data) => {
    return jobUpdateSchema.safeParse(data);
  },

  // Validate job status update data
  validateStatusUpdate: (data) => {
    return jobStatusUpdateSchema.safeParse(data);
  },

  // Validate query parameters
  validateQuery: (data) => {
    return jobQuerySchema.safeParse(data);
  },

  // Format salary range for display
  formatSalaryRange: (job) => {
    if (!job.salary_min && !job.salary_max) {
      return 'Salary not specified';
    }
    
    const currency = job.salary_currency || 'USD';
    
    if (job.salary_min && job.salary_max) {
      if (job.salary_min === job.salary_max) {
        return `${currency} ${job.salary_min.toLocaleString()}`;
      }
      return `${currency} ${job.salary_min.toLocaleString()} - ${job.salary_max.toLocaleString()}`;
    }
    
    if (job.salary_min) {
      return `${currency} ${job.salary_min.toLocaleString()}+`;
    }
    
    return `Up to ${currency} ${job.salary_max.toLocaleString()}`;
  },

  // Format experience range for display
  formatExperienceRange: (job) => {
    if (job.experience_min === undefined && job.experience_max === undefined) {
      return 'Experience not specified';
    }
    
    if (job.experience_min !== undefined && job.experience_max !== undefined) {
      if (job.experience_min === job.experience_max) {
        return `${job.experience_min} year${job.experience_min !== 1 ? 's' : ''}`;
      }
      return `${job.experience_min}-${job.experience_max} years`;
    }
    
    if (job.experience_min !== undefined) {
      return `${job.experience_min}+ years`;
    }
    
    return `Up to ${job.experience_max} years`;
  },

  // Check if job is active and accepting applications
  isAcceptingApplications: (job) => {
    if (job.status !== 'active') {
      return false;
    }
    
    if (job.application_deadline) {
      const deadline = new Date(job.application_deadline);
      const now = new Date();
      return deadline > now;
    }
    
    return true;
  },

  // Check if job is expired
  isExpired: (job) => {
    if (!job.application_deadline) {
      return false;
    }
    
    const deadline = new Date(job.application_deadline);
    const now = new Date();
    return deadline <= now;
  },

  // Get job urgency level
  getUrgencyLevel: (job) => {
    if (job.is_urgent) {
      return 'urgent';
    }
    
    if (job.application_deadline) {
      const deadline = new Date(job.application_deadline);
      const now = new Date();
      const daysUntilDeadline = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
      
      if (daysUntilDeadline <= 3) {
        return 'urgent';
      } else if (daysUntilDeadline <= 7) {
        return 'moderate';
      }
    }
    
    return 'normal';
  },

  // Calculate job match score based on user preferences
  calculateMatchScore: (job, userPreferences) => {
    let score = 0;
    let maxScore = 0;
    
    // Job type match
    maxScore += 20;
    if (userPreferences.preferred_job_type === job.job_type) {
      score += 20;
    }
    
    // Work mode match
    maxScore += 20;
    if (userPreferences.preferred_work_mode === job.work_mode) {
      score += 20;
    }
    
    // Location match (if user has location preference)
    if (userPreferences.location) {
      maxScore += 15;
      if (job.location.toLowerCase().includes(userPreferences.location.toLowerCase())) {
        score += 15;
      }
    }
    
    // Salary match
    if (userPreferences.expected_salary_min || userPreferences.expected_salary_max) {
      maxScore += 25;
      const userMin = userPreferences.expected_salary_min || 0;
      const userMax = userPreferences.expected_salary_max || Infinity;
      const jobMin = job.salary_min || 0;
      const jobMax = job.salary_max || Infinity;
      
      // Check if there's salary overlap
      if (jobMax >= userMin && jobMin <= userMax) {
        score += 25;
      }
    }
    
    // Skills match
    if (userPreferences.skills && job.skills_required) {
      maxScore += 20;
      const userSkills = userPreferences.skills.map(s => s.toLowerCase());
      const jobSkills = job.skills_required.map(s => s.toLowerCase());
      const matchingSkills = userSkills.filter(skill => 
        jobSkills.some(jobSkill => jobSkill.includes(skill) || skill.includes(jobSkill))
      );
      const skillMatchRatio = matchingSkills.length / Math.max(jobSkills.length, 1);
      score += Math.round(skillMatchRatio * 20);
    }
    
    return maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
  },

  // Sanitize job data for public display
  sanitizeForPublic: (job) => {
    // Remove sensitive or internal fields if any
    const { ...publicJob } = job;
    return publicJob;
  }
};