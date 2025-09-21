/**
 * Job Schema
 * 
 * Main schema for job postings with comprehensive fields for
 * job details, requirements, benefits, and application tracking.
 * 
 * @author FinAutoJobs Team
 * @version 1.0.0
 */

import mongoose from 'mongoose';

const JobSchema = new mongoose.Schema({
  // Basic Job Information
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
    maxlength: [100, 'Job title cannot exceed 100 characters'],
    index: true
  },
  
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  
  description: {
    type: String,
    required: [true, 'Job description is required'],
    trim: true,
    maxlength: [5000, 'Job description cannot exceed 5000 characters']
  },
  
  shortDescription: {
    type: String,
    trim: true,
    maxlength: [500, 'Short description cannot exceed 500 characters']
  },
  
  // Company Information
  company: {
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Company ID is required'],
      index: true
    },
    name: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      index: true
    },
    logo: {
      type: String,
      trim: true
    },
    website: {
      type: String,
      trim: true,
      match: [/^https?:\/\/.*/, 'Please enter a valid website URL']
    }
  },
  
  // Recruiter Information
  postedBy: {
    recruiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recruiter ID is required'],
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      trim: true
    }
  },
  
  // Job Classification
  category: {
    type: String,
    required: [true, 'Job category is required'],
    trim: true,
    index: true
  },
  
  subCategory: {
    type: String,
    trim: true,
    index: true
  },
  
  industry: {
    type: String,
    required: [true, 'Industry is required'],
    trim: true,
    index: true
  },
  
  jobFunction: {
    type: String,
    required: [true, 'Job function is required'],
    trim: true,
    index: true
  },
  
  // Employment Details
  employmentType: {
    type: String,
    required: [true, 'Employment type is required'],
    enum: ['full-time', 'part-time', 'contract', 'freelance', 'internship', 'temporary'],
    index: true
  },
  
  workArrangement: {
    type: String,
    required: [true, 'Work arrangement is required'],
    enum: ['onsite', 'remote', 'hybrid'],
    default: 'onsite',
    index: true
  },
  
  experienceLevel: {
    type: String,
    required: [true, 'Experience level is required'],
    enum: ['fresher', 'entry', 'mid', 'senior', 'lead', 'executive'],
    index: true
  },
  
  // Experience Requirements
  experience: {
    minimum: {
      years: {
        type: Number,
        min: 0,
        max: 50,
        default: 0
      },
      months: {
        type: Number,
        min: 0,
        max: 11,
        default: 0
      }
    },
    maximum: {
      years: {
        type: Number,
        min: 0,
        max: 50
      },
      months: {
        type: Number,
        min: 0,
        max: 11,
        default: 0
      }
    },
    preferred: {
      years: {
        type: Number,
        min: 0,
        max: 50
      },
      months: {
        type: Number,
        min: 0,
        max: 11,
        default: 0
      }
    }
  },
  
  // Location Information
  location: {
    type: {
      type: String,
      enum: ['single', 'multiple', 'remote'],
      default: 'single'
    },
    primary: {
      address: {
        type: String,
        trim: true
      },
      city: {
        type: String,
        required: [true, 'City is required'],
        trim: true,
        index: true
      },
      state: {
        type: String,
        required: [true, 'State is required'],
        trim: true,
        index: true
      },
      country: {
        type: String,
        required: [true, 'Country is required'],
        trim: true,
        default: 'India',
        index: true
      },
      pincode: {
        type: String,
        trim: true,
        match: [/^\d{6}$/, 'Please enter a valid 6-digit pincode']
      },
      coordinates: {
        latitude: Number,
        longitude: Number
      }
    },
    additional: [{
      address: String,
      city: String,
      state: String,
      country: String,
      pincode: String,
      coordinates: {
        latitude: Number,
        longitude: Number
      }
    }],
    isRemoteAllowed: {
      type: Boolean,
      default: false
    },
    remotePercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    }
  },
  
  // Salary Information
  salary: {
    type: {
      type: String,
      enum: ['fixed', 'range', 'negotiable', 'undisclosed'],
      default: 'range'
    },
    currency: {
      type: String,
      default: 'INR',
      enum: ['INR', 'USD', 'EUR', 'GBP']
    },
    period: {
      type: String,
      enum: ['hourly', 'daily', 'monthly', 'yearly'],
      default: 'yearly'
    },
    minimum: {
      type: Number,
      min: 0
    },
    maximum: {
      type: Number,
      min: 0
    },
    fixed: {
      type: Number,
      min: 0
    },
    isNegotiable: {
      type: Boolean,
      default: true
    },
    showSalary: {
      type: Boolean,
      default: true
    },
    additionalBenefits: [{
      type: String,
      trim: true
    }]
  },
  
  // Skills & Requirements
  skills: {
    required: [{
      name: {
        type: String,
        required: true,
        trim: true
      },
      level: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced', 'expert'],
        default: 'intermediate'
      },
      experience: {
        type: Number,
        min: 0,
        max: 20
      },
      isMandatory: {
        type: Boolean,
        default: true
      }
    }],
    preferred: [{
      name: {
        type: String,
        required: true,
        trim: true
      },
      level: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced', 'expert'],
        default: 'intermediate'
      },
      experience: {
        type: Number,
        min: 0,
        max: 20
      }
    }],
    tools: [{
      name: {
        type: String,
        required: true,
        trim: true
      },
      version: String,
      isMandatory: {
        type: Boolean,
        default: false
      }
    }]
  },
  
  // Education Requirements
  education: {
    minimum: {
      degree: {
        type: String,
        enum: [
          'High School', '12th', 'Diploma', 'Bachelor', 'Master', 'PhD',
          'B.Tech', 'M.Tech', 'BCA', 'MCA', 'MBA', 'B.Com', 'M.Com',
          'B.Sc', 'M.Sc', 'BA', 'MA', 'Any Graduate', 'Any Post Graduate'
        ]
      },
      fieldOfStudy: [{
        type: String,
        trim: true
      }],
      isMandatory: {
        type: Boolean,
        default: false
      }
    },
    preferred: [{
      degree: String,
      fieldOfStudy: String,
      institution: String
    }],
    certifications: [{
      name: {
        type: String,
        required: true,
        trim: true
      },
      issuer: String,
      isMandatory: {
        type: Boolean,
        default: false
      }
    }]
  },
  
  // Job Responsibilities & Requirements
  responsibilities: [{
    type: String,
    trim: true,
    maxlength: [500, 'Responsibility cannot exceed 500 characters']
  }],
  
  requirements: [{
    type: String,
    trim: true,
    maxlength: [500, 'Requirement cannot exceed 500 characters']
  }],
  
  qualifications: [{
    type: String,
    trim: true,
    maxlength: [500, 'Qualification cannot exceed 500 characters']
  }],
  
  // Benefits & Perks
  benefits: {
    salary: [{
      type: String,
      enum: [
        'performance_bonus', 'annual_bonus', 'profit_sharing', 'stock_options',
        'commission', 'overtime_pay', 'shift_allowance', 'travel_allowance'
      ]
    }],
    health: [{
      type: String,
      enum: [
        'health_insurance', 'dental_insurance', 'vision_insurance',
        'life_insurance', 'disability_insurance', 'wellness_programs'
      ]
    }],
    time: [{
      type: String,
      enum: [
        'flexible_hours', 'remote_work', 'paid_time_off', 'sick_leave',
        'maternity_leave', 'paternity_leave', 'sabbatical', 'personal_days'
      ]
    }],
    professional: [{
      type: String,
      enum: [
        'training_programs', 'conference_attendance', 'certification_support',
        'tuition_reimbursement', 'mentorship', 'career_development'
      ]
    }],
    lifestyle: [{
      type: String,
      enum: [
        'gym_membership', 'food_allowance', 'transportation', 'parking',
        'childcare', 'employee_discounts', 'team_events', 'casual_dress'
      ]
    }],
    other: [{
      type: String,
      trim: true
    }]
  },
  
  // Application Process
  applicationProcess: {
    method: {
      type: String,
      enum: ['internal', 'external', 'email', 'both'],
      default: 'internal'
    },
    externalUrl: {
      type: String,
      trim: true,
      match: [/^https?:\/\/.*/, 'Please enter a valid application URL']
    },
    applicationEmail: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address']
    },
    instructions: {
      type: String,
      trim: true,
      maxlength: [1000, 'Instructions cannot exceed 1000 characters']
    },
    requiredDocuments: [{
      type: String,
      enum: ['resume', 'cover_letter', 'portfolio', 'references', 'transcript', 'other']
    }],
    screeningQuestions: [{
      question: {
        type: String,
        required: true,
        trim: true
      },
      type: {
        type: String,
        enum: ['text', 'multiple_choice', 'yes_no', 'number', 'date'],
        default: 'text'
      },
      options: [{
        type: String,
        trim: true
      }],
      isRequired: {
        type: Boolean,
        default: false
      }
    }]
  },
  
  // Job Status & Lifecycle
  status: {
    type: String,
    enum: ['draft', 'active', 'paused', 'closed', 'expired', 'cancelled'],
    default: 'draft',
    index: true
  },
  
  visibility: {
    type: String,
    enum: ['public', 'private', 'internal', 'premium'],
    default: 'public',
    index: true
  },
  
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
    index: true
  },
  
  // Dates
  publishedAt: {
    type: Date,
    index: true
  },
  
  expiresAt: {
    type: Date,
    required: [true, 'Expiry date is required'],
    index: true
  },
  
  lastModifiedAt: {
    type: Date,
    default: Date.now
  },
  
  // Application Statistics
  applicationStats: {
    totalApplications: {
      type: Number,
      default: 0
    },
    newApplications: {
      type: Number,
      default: 0
    },
    reviewedApplications: {
      type: Number,
      default: 0
    },
    shortlistedApplications: {
      type: Number,
      default: 0
    },
    rejectedApplications: {
      type: Number,
      default: 0
    },
    interviewsScheduled: {
      type: Number,
      default: 0
    },
    offersExtended: {
      type: Number,
      default: 0
    },
    hired: {
      type: Number,
      default: 0
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  
  // SEO & Marketing
  seo: {
    metaTitle: {
      type: String,
      trim: true,
      maxlength: [60, 'Meta title cannot exceed 60 characters']
    },
    metaDescription: {
      type: String,
      trim: true,
      maxlength: [160, 'Meta description cannot exceed 160 characters']
    },
    keywords: [{
      type: String,
      trim: true
    }],
    canonicalUrl: {
      type: String,
      trim: true
    }
  },
  
  // Analytics & Tracking
  analytics: {
    views: {
      type: Number,
      default: 0
    },
    uniqueViews: {
      type: Number,
      default: 0
    },
    clicks: {
      type: Number,
      default: 0
    },
    shares: {
      type: Number,
      default: 0
    },
    bookmarks: {
      type: Number,
      default: 0
    },
    conversionRate: {
      type: Number,
      default: 0
    },
    averageTimeOnPage: {
      type: Number,
      default: 0
    },
    bounceRate: {
      type: Number,
      default: 0
    }
  },
  
  // Featured & Promotion
  featured: {
    isFeatured: {
      type: Boolean,
      default: false,
      index: true
    },
    featuredUntil: Date,
    featuredPosition: {
      type: Number,
      min: 1
    },
    promotionType: {
      type: String,
      enum: ['basic', 'premium', 'sponsored', 'urgent']
    }
  },
  
  // Internal Notes & Tags
  internalNotes: [{
    note: {
      type: String,
      required: true,
      trim: true
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    },
    type: {
      type: String,
      enum: ['general', 'urgent', 'review', 'issue'],
      default: 'general'
    }
  }],
  
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  
  // Approval Workflow
  approval: {
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'needs_revision'],
      default: 'pending'
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    approvedAt: Date,
    rejectionReason: {
      type: String,
      trim: true
    },
    revisionNotes: {
      type: String,
      trim: true
    }
  }
}, {
  timestamps: true,
  versionKey: false,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
JobSchema.index({ title: 'text', description: 'text', 'company.name': 'text' });
JobSchema.index({ 'location.primary.city': 1, 'location.primary.state': 1 });
JobSchema.index({ category: 1, subCategory: 1 });
JobSchema.index({ industry: 1, jobFunction: 1 });
JobSchema.index({ employmentType: 1, workArrangement: 1 });
JobSchema.index({ experienceLevel: 1, 'experience.minimum.years': 1 });
JobSchema.index({ 'salary.minimum': 1, 'salary.maximum': 1 });
JobSchema.index({ status: 1, visibility: 1, publishedAt: -1 });
JobSchema.index({ expiresAt: 1 });
JobSchema.index({ 'featured.isFeatured': 1, 'featured.featuredPosition': 1 });
JobSchema.index({ 'skills.required.name': 1 });
JobSchema.index({ createdAt: -1 });

// Virtual for formatted salary
JobSchema.virtual('formattedSalary').get(function() {
  const { salary } = this;
  if (!salary) return 'Not specified';
  
  const formatAmount = (amount) => {
    if (amount >= 100000) {
      return `${(amount / 100000).toFixed(1)}L`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(1)}K`;
    }
    return amount.toString();
  };
  
  switch (salary.type) {
    case 'fixed':
      return `₹${formatAmount(salary.fixed)} ${salary.period}`;
    case 'range':
      return `₹${formatAmount(salary.minimum)} - ₹${formatAmount(salary.maximum)} ${salary.period}`;
    case 'negotiable':
      return 'Negotiable';
    case 'undisclosed':
      return 'Not disclosed';
    default:
      return 'Not specified';
  }
});

// Virtual for experience range
JobSchema.virtual('experienceRange').get(function() {
  const { experience } = this;
  if (!experience) return 'Not specified';
  
  const formatExp = (exp) => {
    if (exp.years === 0 && exp.months === 0) return '0';
    if (exp.years === 0) return `${exp.months}m`;
    if (exp.months === 0) return `${exp.years}y`;
    return `${exp.years}y ${exp.months}m`;
  };
  
  const min = formatExp(experience.minimum);
  const max = experience.maximum ? formatExp(experience.maximum) : null;
  
  return max ? `${min} - ${max}` : `${min}+`;
});

// Virtual for application conversion rate
JobSchema.virtual('applicationConversionRate').get(function() {
  const { analytics, applicationStats } = this;
  if (!analytics.views || !applicationStats.totalApplications) return 0;
  
  return ((applicationStats.totalApplications / analytics.views) * 100).toFixed(2);
});

// Pre-save middleware
JobSchema.pre('save', function(next) {
  // Generate slug from title
  if (this.isModified('title')) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  
  // Set published date when status changes to active
  if (this.isModified('status') && this.status === 'active' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  // Update last modified date
  this.lastModifiedAt = new Date();
  
  // Validate salary range
  if (this.salary && this.salary.type === 'range') {
    if (this.salary.minimum && this.salary.maximum && this.salary.minimum > this.salary.maximum) {
      return next(new Error('Minimum salary cannot be greater than maximum salary'));
    }
  }
  
  // Validate experience range
  if (this.experience && this.experience.minimum && this.experience.maximum) {
    const minMonths = (this.experience.minimum.years * 12) + this.experience.minimum.months;
    const maxMonths = (this.experience.maximum.years * 12) + this.experience.maximum.months;
    
    if (minMonths > maxMonths) {
      return next(new Error('Minimum experience cannot be greater than maximum experience'));
    }
  }
  
  next();
});

// Instance methods
JobSchema.methods.updateApplicationStats = function(statType, increment = 1) {
  if (this.applicationStats[statType] !== undefined) {
    this.applicationStats[statType] += increment;
    this.applicationStats.lastUpdated = new Date();
  }
  return this.save();
};

JobSchema.methods.incrementView = function(isUnique = false) {
  this.analytics.views += 1;
  if (isUnique) {
    this.analytics.uniqueViews += 1;
  }
  return this.save();
};

JobSchema.methods.isExpired = function() {
  return this.expiresAt < new Date();
};

JobSchema.methods.canApply = function() {
  return this.status === 'active' && !this.isExpired();
};

JobSchema.methods.addInternalNote = function(note, addedBy, type = 'general') {
  this.internalNotes.push({
    note,
    addedBy,
    type,
    addedAt: new Date()
  });
  return this.save();
};

export default JobSchema;
