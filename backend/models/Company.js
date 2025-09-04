import { z } from 'zod';

// Company creation validation schema
export const companyCreationSchema = z.object({
  name: z.string()
    .min(1, 'Company name is required')
    .max(200, 'Company name must be less than 200 characters'),
  description: z.string()
    .min(50, 'Company description must be at least 50 characters long')
    .max(2000, 'Company description must be less than 2000 characters')
    .optional(),
  logo_url: z.string()
    .url('Invalid logo URL')
    .optional(),
  website: z.string()
    .url('Invalid website URL')
    .optional(),
  location: z.string()
    .min(1, 'Location is required')
    .max(200, 'Location must be less than 200 characters'),
  industry: z.string()
    .max(100, 'Industry must be less than 100 characters')
    .optional(),
  size: z.enum(['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'], {
    errorMap: () => ({ message: 'Company size must be one of: 1-10, 11-50, 51-200, 201-500, 501-1000, 1000+' })
  }).optional(),
  founded_year: z.number()
    .int('Founded year must be an integer')
    .min(1800, 'Founded year cannot be before 1800')
    .max(new Date().getFullYear(), `Founded year cannot be in the future`)
    .optional(),
  linkedin_url: z.string()
    .url('Invalid LinkedIn URL')
    .optional(),
  twitter_url: z.string()
    .url('Invalid Twitter URL')
    .optional(),
  facebook_url: z.string()
    .url('Invalid Facebook URL')
    .optional(),
  contact_email: z.string()
    .email('Invalid contact email format')
    .optional(),
  contact_phone: z.string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
    .optional(),
  headquarters: z.string()
    .max(200, 'Headquarters location must be less than 200 characters')
    .optional(),
  employee_benefits: z.array(z.string().max(100))
    .max(20, 'Maximum 20 employee benefits allowed')
    .optional(),
  company_culture: z.string()
    .max(1000, 'Company culture description must be less than 1000 characters')
    .optional(),
  mission_statement: z.string()
    .max(500, 'Mission statement must be less than 500 characters')
    .optional()
});

// Company update validation schema
export const companyUpdateSchema = z.object({
  name: z.string()
    .min(1, 'Company name is required')
    .max(200, 'Company name must be less than 200 characters')
    .optional(),
  description: z.string()
    .min(50, 'Company description must be at least 50 characters long')
    .max(2000, 'Company description must be less than 2000 characters')
    .optional(),
  logo_url: z.string()
    .url('Invalid logo URL')
    .optional(),
  website: z.string()
    .url('Invalid website URL')
    .optional(),
  location: z.string()
    .min(1, 'Location is required')
    .max(200, 'Location must be less than 200 characters')
    .optional(),
  industry: z.string()
    .max(100, 'Industry must be less than 100 characters')
    .optional(),
  size: z.enum(['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'])
    .optional(),
  founded_year: z.number()
    .int('Founded year must be an integer')
    .min(1800, 'Founded year cannot be before 1800')
    .max(new Date().getFullYear(), `Founded year cannot be in the future`)
    .optional(),
  linkedin_url: z.string()
    .url('Invalid LinkedIn URL')
    .optional(),
  twitter_url: z.string()
    .url('Invalid Twitter URL')
    .optional(),
  facebook_url: z.string()
    .url('Invalid Facebook URL')
    .optional(),
  contact_email: z.string()
    .email('Invalid contact email format')
    .optional(),
  contact_phone: z.string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
    .optional(),
  headquarters: z.string()
    .max(200, 'Headquarters location must be less than 200 characters')
    .optional(),
  employee_benefits: z.array(z.string().max(100))
    .max(20, 'Maximum 20 employee benefits allowed')
    .optional(),
  company_culture: z.string()
    .max(1000, 'Company culture description must be less than 1000 characters')
    .optional(),
  mission_statement: z.string()
    .max(500, 'Mission statement must be less than 500 characters')
    .optional(),
  status: z.enum(['active', 'inactive', 'deleted'])
    .optional()
});

// Company query parameters validation schema
export const companyQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  search: z.string().max(200).optional(),
  industry: z.string().max(100).optional(),
  size: z.enum(['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']).optional(),
  location: z.string().max(200).optional(),
  founded_year_min: z.string().regex(/^\d+$/).transform(Number).optional(),
  founded_year_max: z.string().regex(/^\d+$/).transform(Number).optional(),
  has_jobs: z.enum(['true', 'false']).transform(val => val === 'true').optional(),
  status: z.enum(['active', 'inactive', 'deleted']).optional(),
  sort_by: z.enum(['created_at', 'updated_at', 'name', 'founded_year', 'size']).optional(),
  sort_order: z.enum(['asc', 'desc']).optional()
});

// Company status update validation schema
export const companyStatusUpdateSchema = z.object({
  status: z.enum(['active', 'inactive', 'deleted'], {
    errorMap: () => ({ message: 'Status must be one of: active, inactive, deleted' })
  })
});

// Company model helper functions
export const CompanyModel = {
  // Validate company creation data
  validateCreation: (data) => {
    return companyCreationSchema.safeParse(data);
  },

  // Validate company update data
  validateUpdate: (data) => {
    return companyUpdateSchema.safeParse(data);
  },

  // Validate company status update data
  validateStatusUpdate: (data) => {
    return companyStatusUpdateSchema.safeParse(data);
  },

  // Validate query parameters
  validateQuery: (data) => {
    return companyQuerySchema.safeParse(data);
  },

  // Get company size display info
  getSizeInfo: (size) => {
    const sizeMap = {
      '1-10': {
        label: 'Startup (1-10 employees)',
        category: 'startup',
        description: 'Small startup company'
      },
      '11-50': {
        label: 'Small (11-50 employees)',
        category: 'small',
        description: 'Small company'
      },
      '51-200': {
        label: 'Medium (51-200 employees)',
        category: 'medium',
        description: 'Medium-sized company'
      },
      '201-500': {
        label: 'Large (201-500 employees)',
        category: 'large',
        description: 'Large company'
      },
      '501-1000': {
        label: 'Enterprise (501-1000 employees)',
        category: 'enterprise',
        description: 'Enterprise company'
      },
      '1000+': {
        label: 'Corporation (1000+ employees)',
        category: 'corporation',
        description: 'Large corporation'
      }
    };
    
    return sizeMap[size] || {
      label: 'Unknown',
      category: 'unknown',
      description: 'Company size not specified'
    };
  },

  // Calculate company age
  getCompanyAge: (foundedYear) => {
    if (!foundedYear) return null;
    const currentYear = new Date().getFullYear();
    return currentYear - foundedYear;
  },

  // Get company maturity level
  getMaturityLevel: (foundedYear) => {
    const age = CompanyModel.getCompanyAge(foundedYear);
    if (!age) return 'unknown';
    
    if (age < 2) return 'startup';
    if (age < 5) return 'young';
    if (age < 10) return 'established';
    if (age < 25) return 'mature';
    return 'legacy';
  },

  // Format company display name with location
  getDisplayNameWithLocation: (company) => {
    if (company.location) {
      return `${company.name} (${company.location})`;
    }
    return company.name;
  },

  // Get company social media links
  getSocialMediaLinks: (company) => {
    const links = [];
    
    if (company.linkedin_url) {
      links.push({ platform: 'LinkedIn', url: company.linkedin_url, icon: 'linkedin' });
    }
    if (company.twitter_url) {
      links.push({ platform: 'Twitter', url: company.twitter_url, icon: 'twitter' });
    }
    if (company.facebook_url) {
      links.push({ platform: 'Facebook', url: company.facebook_url, icon: 'facebook' });
    }
    if (company.website) {
      links.push({ platform: 'Website', url: company.website, icon: 'globe' });
    }
    
    return links;
  },

  // Check if company profile is complete
  getProfileCompleteness: (company) => {
    let score = 0;
    let maxScore = 0;
    
    // Basic info (required)
    maxScore += 20;
    if (company.name && company.location) {
      score += 20;
    }
    
    // Description (20 points)
    maxScore += 20;
    if (company.description && company.description.length >= 50) {
      score += 20;
    }
    
    // Logo (15 points)
    maxScore += 15;
    if (company.logo_url) {
      score += 15;
    }
    
    // Website (10 points)
    maxScore += 10;
    if (company.website) {
      score += 10;
    }
    
    // Industry and size (10 points)
    maxScore += 10;
    if (company.industry && company.size) {
      score += 10;
    }
    
    // Founded year (5 points)
    maxScore += 5;
    if (company.founded_year) {
      score += 5;
    }
    
    // Contact info (10 points)
    maxScore += 10;
    if (company.contact_email || company.contact_phone) {
      score += 10;
    }
    
    // Social media (5 points)
    maxScore += 5;
    if (company.linkedin_url || company.twitter_url || company.facebook_url) {
      score += 5;
    }
    
    // Culture and mission (5 points)
    maxScore += 5;
    if (company.company_culture || company.mission_statement) {
      score += 5;
    }
    
    return {
      score: Math.round((score / maxScore) * 100),
      completedFields: score,
      totalFields: maxScore
    };
  },

  // Get missing profile fields
  getMissingFields: (company) => {
    const missing = [];
    
    if (!company.description || company.description.length < 50) {
      missing.push('description');
    }
    if (!company.logo_url) {
      missing.push('logo');
    }
    if (!company.website) {
      missing.push('website');
    }
    if (!company.industry) {
      missing.push('industry');
    }
    if (!company.size) {
      missing.push('company_size');
    }
    if (!company.founded_year) {
      missing.push('founded_year');
    }
    if (!company.contact_email && !company.contact_phone) {
      missing.push('contact_info');
    }
    if (!company.linkedin_url && !company.twitter_url && !company.facebook_url) {
      missing.push('social_media');
    }
    
    return missing;
  },

  // Check if company is active and can post jobs
  canPostJobs: (company) => {
    return company.status === 'active';
  },

  // Sanitize company data for public display
  sanitizeForPublic: (company) => {
    const {
      contact_email,
      contact_phone,
      ...publicCompany
    } = company;
    return publicCompany;
  },

  // Sanitize company data for employer dashboard
  sanitizeForEmployer: (company) => {
    // Employers can see all company data
    return company;
  },

  // Generate company slug for URLs
  generateSlug: (companyName) => {
    return companyName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 50);
  },

  // Get company industry category
  getIndustryCategory: (industry) => {
    const industryCategories = {
      'Technology': ['Software', 'Hardware', 'IT Services', 'Telecommunications', 'Internet'],
      'Finance': ['Banking', 'Insurance', 'Investment', 'Fintech', 'Accounting'],
      'Healthcare': ['Pharmaceuticals', 'Medical Devices', 'Healthcare Services', 'Biotechnology'],
      'Education': ['Higher Education', 'K-12 Education', 'Online Learning', 'Training'],
      'Retail': ['E-commerce', 'Fashion', 'Consumer Goods', 'Automotive'],
      'Manufacturing': ['Industrial', 'Aerospace', 'Chemical', 'Food & Beverage'],
      'Media': ['Entertainment', 'Publishing', 'Advertising', 'Broadcasting'],
      'Real Estate': ['Construction', 'Property Management', 'Architecture'],
      'Energy': ['Oil & Gas', 'Renewable Energy', 'Utilities'],
      'Transportation': ['Logistics', 'Airlines', 'Shipping', 'Public Transit'],
      'Government': ['Federal', 'State', 'Local', 'Military'],
      'Non-Profit': ['Charity', 'NGO', 'Foundation', 'Social Services']
    };
    
    for (const [category, industries] of Object.entries(industryCategories)) {
      if (industries.some(ind => industry?.toLowerCase().includes(ind.toLowerCase()))) {
        return category;
      }
    }
    
    return 'Other';
  }
};