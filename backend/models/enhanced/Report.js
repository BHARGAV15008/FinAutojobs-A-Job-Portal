import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  // Report metadata
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  type: {
    type: String,
    required: true,
    enum: [
      'hiring-metrics',
      'job-performance',
      'candidate-analytics',
      'recruitment-funnel',
      'cost-analysis',
      'diversity-report',
      'time-to-hire',
      'source-effectiveness',
      'custom'
    ]
  },
  
  // Creator and access
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BaseUser',
    required: true,
    index: true
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company'
  },
  
  // Report configuration
  dateRange: {
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    }
  },
  filters: {
    jobIds: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job'
    }],
    departments: [String],
    locations: [String],
    jobTypes: [String],
    experienceLevels: [String]
  },
  
  // Report data
  data: {
    // Hiring metrics
    hiringMetrics: {
      totalHires: Number,
      totalApplications: Number,
      conversionRate: Number,
      averageTimeToHire: Number,
      costPerHire: Number,
      qualityOfHire: Number,
      offerAcceptanceRate: Number,
      retentionRate: Number
    },
    
    // Job performance
    jobPerformance: [{
      jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job'
      },
      jobTitle: String,
      views: Number,
      applications: Number,
      hires: Number,
      conversionRate: Number,
      timeToFill: Number,
      cost: Number
    }],
    
    // Recruitment funnel
    recruitmentFunnel: {
      jobViews: Number,
      applications: Number,
      screenings: Number,
      interviews: Number,
      offers: Number,
      hires: Number,
      dropoffRates: {
        viewToApplication: Number,
        applicationToScreening: Number,
        screeningToInterview: Number,
        interviewToOffer: Number,
        offerToHire: Number
      }
    },
    
    // Source effectiveness
    sourceEffectiveness: [{
      source: String,
      applications: Number,
      hires: Number,
      conversionRate: Number,
      costPerHire: Number,
      timeToHire: Number,
      qualityScore: Number
    }],
    
    // Diversity metrics
    diversityMetrics: {
      genderDistribution: {
        male: Number,
        female: Number,
        other: Number,
        notSpecified: Number
      },
      ageDistribution: [{
        ageRange: String,
        count: Number,
        percentage: Number
      }],
      ethnicityDistribution: [{
        ethnicity: String,
        count: Number,
        percentage: Number
      }],
      educationDistribution: [{
        education: String,
        count: Number,
        percentage: Number
      }]
    },
    
    // Time-based analytics
    timeAnalytics: {
      applicationsByMonth: [{
        month: String,
        count: Number
      }],
      hiresByMonth: [{
        month: String,
        count: Number
      }],
      seasonalTrends: [{
        period: String,
        metric: String,
        value: Number
      }]
    },
    
    // Cost analysis
    costAnalysis: {
      totalRecruitmentCost: Number,
      costBreakdown: {
        jobBoardCosts: Number,
        agencyFees: Number,
        internalCosts: Number,
        technologyCosts: Number,
        otherCosts: Number
      },
      costPerHireByDepartment: [{
        department: String,
        cost: Number
      }],
      costTrends: [{
        period: String,
        cost: Number
      }]
    },
    
    // Custom metrics
    customMetrics: [{
      name: String,
      value: mongoose.Schema.Types.Mixed,
      description: String
    }]
  },
  
  // Report settings
  format: {
    type: String,
    enum: ['pdf', 'excel', 'csv', 'json'],
    default: 'pdf'
  },
  status: {
    type: String,
    enum: ['generating', 'completed', 'failed', 'scheduled'],
    default: 'generating'
  },
  
  // File information
  fileUrl: String,
  fileSize: Number,
  fileName: String,
  
  // Scheduling
  isScheduled: {
    type: Boolean,
    default: false
  },
  schedule: {
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly']
    },
    dayOfWeek: Number, // 0-6 for weekly
    dayOfMonth: Number, // 1-31 for monthly
    time: String, // HH:MM format
    timezone: String,
    nextRun: Date,
    isActive: {
      type: Boolean,
      default: true
    }
  },
  
  // Sharing and access
  visibility: {
    type: String,
    enum: ['private', 'team', 'organization', 'public'],
    default: 'private'
  },
  sharedWith: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BaseUser'
    },
    permission: {
      type: String,
      enum: ['view', 'edit', 'admin'],
      default: 'view'
    }
  }],
  
  // Analytics
  viewCount: {
    type: Number,
    default: 0
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  lastViewed: Date,
  lastDownloaded: Date,
  
  // Generation metadata
  generationTime: Number, // in milliseconds
  dataPoints: Number,
  errorLog: [String]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
reportSchema.index({ createdBy: 1, type: 1 });
reportSchema.index({ organizationId: 1, type: 1 });
reportSchema.index({ status: 1 });
reportSchema.index({ 'schedule.nextRun': 1, 'schedule.isActive': 1 });
reportSchema.index({ createdAt: -1 });

// Virtual for report age
reportSchema.virtual('age').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24)); // in days
});

// Method to check if report needs regeneration
reportSchema.methods.needsRegeneration = function() {
  const maxAge = 7; // days
  return this.age > maxAge || this.status === 'failed';
};

// Method to calculate next scheduled run
reportSchema.methods.calculateNextRun = function() {
  if (!this.isScheduled || !this.schedule.frequency) return null;
  
  const now = new Date();
  const next = new Date(now);
  
  switch (this.schedule.frequency) {
    case 'daily':
      next.setDate(next.getDate() + 1);
      break;
    case 'weekly':
      const daysUntilNext = (this.schedule.dayOfWeek - now.getDay() + 7) % 7;
      next.setDate(next.getDate() + (daysUntilNext || 7));
      break;
    case 'monthly':
      next.setMonth(next.getMonth() + 1);
      next.setDate(this.schedule.dayOfMonth);
      break;
    case 'quarterly':
      next.setMonth(next.getMonth() + 3);
      break;
    case 'yearly':
      next.setFullYear(next.getFullYear() + 1);
      break;
  }
  
  if (this.schedule.time) {
    const [hours, minutes] = this.schedule.time.split(':');
    next.setHours(parseInt(hours), parseInt(minutes), 0, 0);
  }
  
  return next;
};

// Pre-save middleware to calculate next run
reportSchema.pre('save', function(next) {
  if (this.isScheduled && this.isModified('schedule')) {
    this.schedule.nextRun = this.calculateNextRun();
  }
  next();
});

// Method to increment view count
reportSchema.methods.incrementView = function() {
  this.viewCount += 1;
  this.lastViewed = new Date();
  return this.save();
};

// Method to increment download count
reportSchema.methods.incrementDownload = function() {
  this.downloadCount += 1;
  this.lastDownloaded = new Date();
  return this.save();
};

export default mongoose.model('Report', reportSchema);
