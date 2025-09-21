/**
 * Company Schema
 * 
 * Comprehensive schema for company profiles with detailed information
 * about organization, culture, benefits, and verification status.
 * 
 * @author FinAutoJobs Team
 * @version 1.0.0
 */

import mongoose from 'mongoose';

const CompanySchema = new mongoose.Schema({
  // Basic Company Information
  name: {
    type: String,
    required: [true, 'Company name is required'],
    trim: true,
    maxlength: [100, 'Company name cannot exceed 100 characters'],
    index: true
  },
  
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  
  legalName: {
    type: String,
    trim: true,
    maxlength: [150, 'Legal name cannot exceed 150 characters']
  },
  
  description: {
    type: String,
    required: [true, 'Company description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  
  shortDescription: {
    type: String,
    trim: true,
    maxlength: [300, 'Short description cannot exceed 300 characters']
  },
  
  // Company Classification
  industry: {
    primary: {
      type: String,
      required: [true, 'Primary industry is required'],
      trim: true,
      index: true
    },
    secondary: [{
      type: String,
      trim: true
    }],
    tags: [{
      type: String,
      trim: true,
      lowercase: true
    }]
  },
  
  companyType: {
    type: String,
    required: [true, 'Company type is required'],
    enum: [
      'startup', 'small_business', 'mid_size', 'large_enterprise',
      'corporation', 'non_profit', 'government', 'agency', 'consultancy'
    ],
    index: true
  },
  
  companySize: {
    category: {
      type: String,
      required: [true, 'Company size category is required'],
      enum: [
        '1-10', '11-50', '51-200', '201-500', '501-1000',
        '1001-5000', '5001-10000', '10000+'
      ],
      index: true
    },
    exactCount: {
      type: Number,
      min: 1
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  
  // Contact Information
  contact: {
    email: {
      primary: {
        type: String,
        required: [true, 'Primary email is required'],
        trim: true,
        lowercase: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email address']
      },
      hr: {
        type: String,
        trim: true,
        lowercase: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid HR email address']
      },
      support: {
        type: String,
        trim: true,
        lowercase: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid support email address']
      }
    },
    
    phone: {
      primary: {
        type: String,
        trim: true,
        match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
      },
      hr: {
        type: String,
        trim: true,
        match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid HR phone number']
      },
      toll_free: {
        type: String,
        trim: true
      }
    },
    
    website: {
      primary: {
        type: String,
        required: [true, 'Company website is required'],
        trim: true,
        match: [/^https?:\/\/.*/, 'Please enter a valid website URL']
      },
      careers: {
        type: String,
        trim: true,
        match: [/^https?:\/\/.*/, 'Please enter a valid careers page URL']
      }
    }
  },
  
  // Location Information
  headquarters: {
    address: {
      street: {
        type: String,
        trim: true
      },
      city: {
        type: String,
        required: [true, 'Headquarters city is required'],
        trim: true,
        index: true
      },
      state: {
        type: String,
        required: [true, 'Headquarters state is required'],
        trim: true,
        index: true
      },
      country: {
        type: String,
        required: [true, 'Headquarters country is required'],
        trim: true,
        default: 'India',
        index: true
      },
      pincode: {
        type: String,
        trim: true,
        match: [/^\d{6}$/, 'Please enter a valid 6-digit pincode']
      }
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    },
    timezone: {
      type: String,
      default: 'Asia/Kolkata'
    }
  },
  
  offices: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ['headquarters', 'branch', 'regional', 'satellite', 'remote_hub'],
      default: 'branch'
    },
    address: {
      street: String,
      city: {
        type: String,
        required: true,
        trim: true
      },
      state: {
        type: String,
        required: true,
        trim: true
      },
      country: {
        type: String,
        required: true,
        trim: true,
        default: 'India'
      },
      pincode: String
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    },
    employeeCount: {
      type: Number,
      min: 0
    },
    isActive: {
      type: Boolean,
      default: true
    },
    establishedDate: Date
  }],
  
  // Company Media & Branding
  media: {
    logo: {
      url: {
        type: String,
        trim: true
      },
      publicId: String,
      uploadedAt: Date
    },
    
    coverImage: {
      url: {
        type: String,
        trim: true
      },
      publicId: String,
      uploadedAt: Date
    },
    
    gallery: [{
      url: {
        type: String,
        required: true,
        trim: true
      },
      caption: {
        type: String,
        trim: true
      },
      type: {
        type: String,
        enum: ['office', 'team', 'event', 'product', 'culture', 'other'],
        default: 'other'
      },
      publicId: String,
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }],
    
    videos: [{
      title: {
        type: String,
        required: true,
        trim: true
      },
      url: {
        type: String,
        required: true,
        trim: true
      },
      thumbnail: String,
      duration: Number,
      type: {
        type: String,
        enum: ['company_intro', 'culture', 'office_tour', 'testimonial', 'other'],
        default: 'other'
      },
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  
  // Social Media & Online Presence
  socialMedia: {
    linkedin: {
      type: String,
      trim: true,
      match: [/^https?:\/\/(www\.)?linkedin\.com\/.*/, 'Please enter a valid LinkedIn URL']
    },
    twitter: {
      type: String,
      trim: true,
      match: [/^https?:\/\/(www\.)?twitter\.com\/.*/, 'Please enter a valid Twitter URL']
    },
    facebook: {
      type: String,
      trim: true,
      match: [/^https?:\/\/(www\.)?facebook\.com\/.*/, 'Please enter a valid Facebook URL']
    },
    instagram: {
      type: String,
      trim: true,
      match: [/^https?:\/\/(www\.)?instagram\.com\/.*/, 'Please enter a valid Instagram URL']
    },
    youtube: {
      type: String,
      trim: true,
      match: [/^https?:\/\/(www\.)?youtube\.com\/.*/, 'Please enter a valid YouTube URL']
    },
    glassdoor: {
      type: String,
      trim: true,
      match: [/^https?:\/\/(www\.)?glassdoor\.com\/.*/, 'Please enter a valid Glassdoor URL']
    }
  },
  
  // Company Culture & Values
  culture: {
    mission: {
      type: String,
      trim: true,
      maxlength: [500, 'Mission cannot exceed 500 characters']
    },
    vision: {
      type: String,
      trim: true,
      maxlength: [500, 'Vision cannot exceed 500 characters']
    },
    values: [{
      title: {
        type: String,
        required: true,
        trim: true
      },
      description: {
        type: String,
        trim: true
      }
    }],
    
    workEnvironment: {
      type: [{
        type: String,
        enum: [
          'collaborative', 'innovative', 'fast_paced', 'flexible',
          'remote_friendly', 'diverse', 'inclusive', 'learning_focused',
          'results_oriented', 'customer_centric', 'entrepreneurial'
        ]
      }]
    },
    
    perks: [{
      category: {
        type: String,
        enum: ['health', 'financial', 'time_off', 'professional', 'lifestyle', 'other'],
        required: true
      },
      title: {
        type: String,
        required: true,
        trim: true
      },
      description: {
        type: String,
        trim: true
      },
      isHighlight: {
        type: Boolean,
        default: false
      }
    }]
  },
  
  // Financial Information
  financial: {
    fundingStage: {
      type: String,
      enum: [
        'bootstrapped', 'pre_seed', 'seed', 'series_a', 'series_b',
        'series_c', 'series_d', 'ipo', 'acquired', 'public'
      ]
    },
    
    totalFunding: {
      amount: Number,
      currency: {
        type: String,
        default: 'USD'
      },
      lastUpdated: Date
    },
    
    valuation: {
      amount: Number,
      currency: {
        type: String,
        default: 'USD'
      },
      lastUpdated: Date
    },
    
    revenue: {
      range: {
        type: String,
        enum: [
          'under_1m', '1m_10m', '10m_50m', '50m_100m',
          '100m_500m', '500m_1b', 'over_1b'
        ]
      },
      year: Number,
      isPublic: {
        type: Boolean,
        default: false
      }
    },
    
    investors: [{
      name: {
        type: String,
        required: true,
        trim: true
      },
      type: {
        type: String,
        enum: ['angel', 'vc', 'pe', 'corporate', 'government', 'other']
      },
      website: String,
      investmentRound: String
    }]
  },
  
  // Leadership & Team
  leadership: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    position: {
      type: String,
      required: true,
      trim: true
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [500, 'Bio cannot exceed 500 characters']
    },
    profilePicture: {
      type: String,
      trim: true
    },
    linkedin: {
      type: String,
      trim: true
    },
    experience: {
      type: Number,
      min: 0
    },
    joinedDate: Date,
    isPublic: {
      type: Boolean,
      default: true
    }
  }],
  
  // Verification & Compliance
  verification: {
    status: {
      type: String,
      enum: ['unverified', 'pending', 'verified', 'rejected'],
      default: 'unverified',
      index: true
    },
    
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    
    verifiedAt: Date,
    
    documents: [{
      type: {
        type: String,
        enum: [
          'incorporation_certificate', 'gst_certificate', 'pan_card',
          'trade_license', 'msme_certificate', 'other'
        ],
        required: true
      },
      name: {
        type: String,
        required: true,
        trim: true
      },
      url: {
        type: String,
        required: true,
        trim: true
      },
      number: {
        type: String,
        trim: true
      },
      issuedDate: Date,
      expiryDate: Date,
      isVerified: {
        type: Boolean,
        default: false
      },
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }],
    
    compliance: {
      gst: {
        number: String,
        isVerified: Boolean
      },
      pan: {
        number: String,
        isVerified: Boolean
      },
      cin: {
        number: String,
        isVerified: Boolean
      }
    }
  },
  
  // Ratings & Reviews
  ratings: {
    overall: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
      },
      count: {
        type: Number,
        default: 0
      }
    },
    
    categories: {
      workLifeBalance: {
        average: {
          type: Number,
          default: 0,
          min: 0,
          max: 5
        },
        count: {
          type: Number,
          default: 0
        }
      },
      compensation: {
        average: {
          type: Number,
          default: 0,
          min: 0,
          max: 5
        },
        count: {
          type: Number,
          default: 0
        }
      },
      culture: {
        average: {
          type: Number,
          default: 0,
          min: 0,
          max: 5
        },
        count: {
          type: Number,
          default: 0
        }
      },
      management: {
        average: {
          type: Number,
          default: 0,
          min: 0,
          max: 5
        },
        count: {
          type: Number,
          default: 0
        }
      },
      careerGrowth: {
        average: {
          type: Number,
          default: 0,
          min: 0,
          max: 5
        },
        count: {
          type: Number,
          default: 0
        }
      }
    },
    
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  
  // Job Statistics
  jobStats: {
    totalJobs: {
      type: Number,
      default: 0
    },
    activeJobs: {
      type: Number,
      default: 0
    },
    totalApplications: {
      type: Number,
      default: 0
    },
    averageTimeToHire: {
      type: Number,
      default: 0
    },
    hiringSuccessRate: {
      type: Number,
      default: 0
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  
  // Company Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'closed'],
    default: 'active',
    index: true
  },
  
  // Subscription & Plan
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'basic', 'premium', 'enterprise'],
      default: 'free'
    },
    features: [{
      type: String
    }],
    startDate: Date,
    endDate: Date,
    isActive: {
      type: Boolean,
      default: true
    },
    jobPostingLimit: {
      type: Number,
      default: 5
    },
    usedJobPostings: {
      type: Number,
      default: 0
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
    }]
  },
  
  // Analytics
  analytics: {
    profileViews: {
      type: Number,
      default: 0
    },
    jobViews: {
      type: Number,
      default: 0
    },
    followerCount: {
      type: Number,
      default: 0
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  
  // Dates
  establishedDate: {
    type: Date,
    required: [true, 'Established date is required']
  },
  
  lastProfileUpdate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  versionKey: false,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
CompanySchema.index({ name: 'text', description: 'text', 'industry.primary': 'text' });
CompanySchema.index({ slug: 1 });
CompanySchema.index({ 'industry.primary': 1, companyType: 1 });
CompanySchema.index({ 'companySize.category': 1 });
CompanySchema.index({ 'headquarters.address.city': 1, 'headquarters.address.state': 1 });
CompanySchema.index({ 'verification.status': 1 });
CompanySchema.index({ status: 1 });
CompanySchema.index({ 'ratings.overall.average': -1 });
CompanySchema.index({ createdAt: -1 });

// Virtual for company age
CompanySchema.virtual('companyAge').get(function() {
  if (!this.establishedDate) return null;
  
  const now = new Date();
  const established = new Date(this.establishedDate);
  const diffTime = Math.abs(now - established);
  const diffYears = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 365));
  
  return diffYears;
});

// Virtual for total office count
CompanySchema.virtual('totalOffices').get(function() {
  return this.offices ? this.offices.filter(office => office.isActive).length : 0;
});

// Pre-save middleware
CompanySchema.pre('save', function(next) {
  // Generate slug from company name
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
  
  // Update last profile update date
  this.lastProfileUpdate = new Date();
  
  next();
});

// Instance methods
CompanySchema.methods.updateJobStats = function(stats) {
  this.jobStats = {
    ...this.jobStats,
    ...stats,
    lastUpdated: new Date()
  };
  return this.save();
};

CompanySchema.methods.updateRatings = function(category, rating) {
  if (this.ratings.categories[category]) {
    const current = this.ratings.categories[category];
    const newAverage = ((current.average * current.count) + rating) / (current.count + 1);
    
    this.ratings.categories[category].average = newAverage;
    this.ratings.categories[category].count += 1;
    
    // Update overall rating
    const categories = Object.keys(this.ratings.categories);
    const totalRating = categories.reduce((sum, cat) => sum + this.ratings.categories[cat].average, 0);
    this.ratings.overall.average = totalRating / categories.length;
    this.ratings.overall.count = Math.max(...categories.map(cat => this.ratings.categories[cat].count));
    
    this.ratings.lastUpdated = new Date();
  }
  
  return this.save();
};

CompanySchema.methods.addOffice = function(officeData) {
  this.offices.push({
    ...officeData,
    isActive: true
  });
  return this.save();
};

CompanySchema.methods.verify = function(verifiedBy, documents = []) {
  this.verification.status = 'verified';
  this.verification.verifiedBy = verifiedBy;
  this.verification.verifiedAt = new Date();
  
  if (documents.length > 0) {
    documents.forEach(doc => {
      const existingDoc = this.verification.documents.find(d => d.type === doc.type);
      if (existingDoc) {
        existingDoc.isVerified = true;
      }
    });
  }
  
  return this.save();
};

export default CompanySchema;
