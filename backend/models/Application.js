import { z } from 'zod';

// Application creation validation schema
export const applicationCreationSchema = z.object({
  job_id: z.number()
    .int('Job ID must be an integer')
    .positive('Job ID must be positive'),
  cover_letter: z.string()
    .min(50, 'Cover letter must be at least 50 characters long')
    .max(2000, 'Cover letter must be less than 2000 characters')
    .optional(),
  resume_url: z.string()
    .url('Invalid resume URL')
    .optional(),
  portfolio_url: z.string()
    .url('Invalid portfolio URL')
    .optional(),
  expected_salary: z.number()
    .min(0, 'Expected salary cannot be negative')
    .optional(),
  salary_currency: z.string()
    .length(3, 'Currency code must be 3 characters (e.g., USD, EUR)')
    .optional(),
  availability_date: z.string()
    .datetime('Invalid availability date format')
    .optional(),
  additional_info: z.string()
    .max(1000, 'Additional information must be less than 1000 characters')
    .optional()
}).refine((data) => {
  // If expected salary is provided, currency should also be provided
  if (data.expected_salary && !data.salary_currency) {
    return false;
  }
  return true;
}, {
  message: 'Currency is required when expected salary is specified',
  path: ['salary_currency']
}).refine((data) => {
  // Availability date should be in the future or today
  if (data.availability_date) {
    const availabilityDate = new Date(data.availability_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return availabilityDate >= today;
  }
  return true;
}, {
  message: 'Availability date cannot be in the past',
  path: ['availability_date']
});

// Application update validation schema (for applicants)
export const applicationUpdateSchema = z.object({
  cover_letter: z.string()
    .min(50, 'Cover letter must be at least 50 characters long')
    .max(2000, 'Cover letter must be less than 2000 characters')
    .optional(),
  resume_url: z.string()
    .url('Invalid resume URL')
    .optional(),
  portfolio_url: z.string()
    .url('Invalid portfolio URL')
    .optional(),
  expected_salary: z.number()
    .min(0, 'Expected salary cannot be negative')
    .optional(),
  salary_currency: z.string()
    .length(3, 'Currency code must be 3 characters (e.g., USD, EUR)')
    .optional(),
  availability_date: z.string()
    .datetime('Invalid availability date format')
    .optional(),
  additional_info: z.string()
    .max(1000, 'Additional information must be less than 1000 characters')
    .optional()
}).refine((data) => {
  // If expected salary is provided, currency should also be provided
  if (data.expected_salary && !data.salary_currency) {
    return false;
  }
  return true;
}, {
  message: 'Currency is required when expected salary is specified',
  path: ['salary_currency']
}).refine((data) => {
  // Availability date should be in the future or today
  if (data.availability_date) {
    const availabilityDate = new Date(data.availability_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return availabilityDate >= today;
  }
  return true;
}, {
  message: 'Availability date cannot be in the past',
  path: ['availability_date']
});

// Application status update validation schema (for employers/admins)
export const applicationStatusUpdateSchema = z.object({
  status: z.enum(['pending', 'reviewing', 'shortlisted', 'interviewed', 'offered', 'hired', 'rejected', 'withdrawn'], {
    errorMap: () => ({ message: 'Status must be one of: pending, reviewing, shortlisted, interviewed, offered, hired, rejected, withdrawn' })
  }),
  notes: z.string()
    .max(1000, 'Notes must be less than 1000 characters')
    .optional(),
  interview_date: z.string()
    .datetime('Invalid interview date format')
    .optional(),
  rejection_reason: z.string()
    .max(500, 'Rejection reason must be less than 500 characters')
    .optional()
}).refine((data) => {
  // If status is interviewed, interview_date should be provided
  if (data.status === 'interviewed' && !data.interview_date) {
    return false;
  }
  return true;
}, {
  message: 'Interview date is required when status is set to interviewed',
  path: ['interview_date']
}).refine((data) => {
  // If status is rejected, rejection_reason should be provided
  if (data.status === 'rejected' && !data.rejection_reason) {
    return false;
  }
  return true;
}, {
  message: 'Rejection reason is required when status is set to rejected',
  path: ['rejection_reason']
}).refine((data) => {
  // Interview date should be in the future
  if (data.interview_date) {
    const interviewDate = new Date(data.interview_date);
    const now = new Date();
    return interviewDate > now;
  }
  return true;
}, {
  message: 'Interview date must be in the future',
  path: ['interview_date']
});

// Application query parameters validation schema
export const applicationQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  search: z.string().max(200).optional(),
  status: z.enum(['pending', 'reviewing', 'shortlisted', 'interviewed', 'offered', 'hired', 'rejected', 'withdrawn']).optional(),
  job_id: z.string().regex(/^\d+$/).transform(Number).optional(),
  user_id: z.string().regex(/^\d+$/).transform(Number).optional(),
  company_id: z.string().regex(/^\d+$/).transform(Number).optional(),
  sort_by: z.enum(['created_at', 'updated_at', 'status', 'expected_salary']).optional(),
  sort_order: z.enum(['asc', 'desc']).optional(),
  applied_within: z.enum(['1', '7', '30', '90']).transform(Number).optional(), // days
  has_cover_letter: z.enum(['true', 'false']).transform(val => val === 'true').optional(),
  has_resume: z.enum(['true', 'false']).transform(val => val === 'true').optional(),
  salary_min: z.string().regex(/^\d+$/).transform(Number).optional(),
  salary_max: z.string().regex(/^\d+$/).transform(Number).optional()
});

// Bulk application update validation schema
export const bulkApplicationUpdateSchema = z.object({
  application_ids: z.array(z.number().int().positive())
    .min(1, 'At least one application ID is required')
    .max(100, 'Maximum 100 applications can be updated at once'),
  status: z.enum(['pending', 'reviewing', 'shortlisted', 'interviewed', 'offered', 'hired', 'rejected', 'withdrawn']),
  notes: z.string()
    .max(1000, 'Notes must be less than 1000 characters')
    .optional(),
  rejection_reason: z.string()
    .max(500, 'Rejection reason must be less than 500 characters')
    .optional()
}).refine((data) => {
  // If status is rejected, rejection_reason should be provided
  if (data.status === 'rejected' && !data.rejection_reason) {
    return false;
  }
  return true;
}, {
  message: 'Rejection reason is required when status is set to rejected',
  path: ['rejection_reason']
});

// Application model helper functions
export const ApplicationModel = {
  // Validate application creation data
  validateCreation: (data) => {
    return applicationCreationSchema.safeParse(data);
  },

  // Validate application update data
  validateUpdate: (data) => {
    return applicationUpdateSchema.safeParse(data);
  },

  // Validate application status update data
  validateStatusUpdate: (data) => {
    return applicationStatusUpdateSchema.safeParse(data);
  },

  // Validate bulk application update data
  validateBulkUpdate: (data) => {
    return bulkApplicationUpdateSchema.safeParse(data);
  },

  // Validate query parameters
  validateQuery: (data) => {
    return applicationQuerySchema.safeParse(data);
  },

  // Get application status display info
  getStatusInfo: (status) => {
    const statusMap = {
      pending: {
        label: 'Pending',
        color: 'gray',
        description: 'Application submitted and waiting for review'
      },
      reviewing: {
        label: 'Under Review',
        color: 'blue',
        description: 'Application is being reviewed by the employer'
      },
      shortlisted: {
        label: 'Shortlisted',
        color: 'yellow',
        description: 'Application has been shortlisted for further consideration'
      },
      interviewed: {
        label: 'Interviewed',
        color: 'purple',
        description: 'Candidate has been interviewed'
      },
      offered: {
        label: 'Offered',
        color: 'green',
        description: 'Job offer has been extended'
      },
      hired: {
        label: 'Hired',
        color: 'green',
        description: 'Candidate has been hired'
      },
      rejected: {
        label: 'Rejected',
        color: 'red',
        description: 'Application has been rejected'
      },
      withdrawn: {
        label: 'Withdrawn',
        color: 'gray',
        description: 'Application has been withdrawn by the candidate'
      }
    };
    
    return statusMap[status] || {
      label: 'Unknown',
      color: 'gray',
      description: 'Unknown status'
    };
  },

  // Check if application can be edited by applicant
  canBeEditedByApplicant: (application) => {
    const editableStatuses = ['pending', 'reviewing'];
    return editableStatuses.includes(application.status);
  },

  // Check if application can be withdrawn by applicant
  canBeWithdrawn: (application) => {
    const withdrawableStatuses = ['pending', 'reviewing', 'shortlisted', 'interviewed'];
    return withdrawableStatuses.includes(application.status);
  },

  // Check if application status can be updated by employer
  canStatusBeUpdatedByEmployer: (application, newStatus) => {
    const statusTransitions = {
      pending: ['reviewing', 'shortlisted', 'rejected'],
      reviewing: ['shortlisted', 'interviewed', 'rejected'],
      shortlisted: ['interviewed', 'offered', 'rejected'],
      interviewed: ['offered', 'rejected'],
      offered: ['hired', 'rejected'],
      hired: [], // Final status
      rejected: [], // Final status
      withdrawn: [] // Final status
    };
    
    return statusTransitions[application.status]?.includes(newStatus) || false;
  },

  // Get application priority score (for sorting)
  getPriorityScore: (application) => {
    const statusPriority = {
      offered: 100,
      interviewed: 90,
      shortlisted: 80,
      reviewing: 70,
      pending: 60,
      hired: 50,
      rejected: 10,
      withdrawn: 5
    };
    
    let score = statusPriority[application.status] || 0;
    
    // Boost score for applications with cover letter
    if (application.cover_letter) {
      score += 5;
    }
    
    // Boost score for applications with resume
    if (application.resume_url) {
      score += 5;
    }
    
    // Boost score for applications with portfolio
    if (application.portfolio_url) {
      score += 3;
    }
    
    return score;
  },

  // Format expected salary for display
  formatExpectedSalary: (application) => {
    if (!application.expected_salary) {
      return 'Not specified';
    }
    
    const currency = application.salary_currency || 'USD';
    return `${currency} ${application.expected_salary.toLocaleString()}`;
  },

  // Calculate application age in days
  getApplicationAge: (application) => {
    const createdDate = new Date(application.created_at);
    const now = new Date();
    const diffTime = Math.abs(now - createdDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  },

  // Check if application is recent (within last 7 days)
  isRecent: (application) => {
    return ApplicationModel.getApplicationAge(application) <= 7;
  },

  // Get application completeness score (0-100)
  getCompletenessScore: (application) => {
    let score = 0;
    let maxScore = 0;
    
    // Cover letter (30 points)
    maxScore += 30;
    if (application.cover_letter && application.cover_letter.length >= 50) {
      score += 30;
    }
    
    // Resume (40 points)
    maxScore += 40;
    if (application.resume_url) {
      score += 40;
    }
    
    // Portfolio (15 points)
    maxScore += 15;
    if (application.portfolio_url) {
      score += 15;
    }
    
    // Expected salary (10 points)
    maxScore += 10;
    if (application.expected_salary) {
      score += 10;
    }
    
    // Additional info (5 points)
    maxScore += 5;
    if (application.additional_info) {
      score += 5;
    }
    
    return Math.round((score / maxScore) * 100);
  },

  // Sanitize application data for different user roles
  sanitizeForRole: (application, userRole, userId) => {
    const sanitized = { ...application };
    
    // If user is not the applicant or employer/admin, hide sensitive info
    if (userRole === 'jobseeker' && application.user_id !== userId) {
      delete sanitized.resume_url;
      delete sanitized.portfolio_url;
      delete sanitized.expected_salary;
      delete sanitized.salary_currency;
      delete sanitized.additional_info;
      delete sanitized.notes;
      delete sanitized.rejection_reason;
    }
    
    return sanitized;
  }
};