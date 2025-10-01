import mongoose from 'mongoose';

// User Analytics Schema
const userAnalyticsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BaseUser',
    required: true,
    unique: true,
    index: true
  },
  userRole: {
    type: String,
    enum: ['applicant', 'recruiter'],
    required: true
  },
  
  // Profile metrics
  profileViews: {
    total: { type: Number, default: 0 },
    thisMonth: { type: Number, default: 0 },
    thisWeek: { type: Number, default: 0 },
    today: { type: Number, default: 0 }
  },
  profileCompleteness: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  
  // Activity metrics
  loginCount: {
    total: { type: Number, default: 0 },
    thisMonth: { type: Number, default: 0 }
  },
  lastLoginDate: Date,
  sessionDuration: {
    average: { type: Number, default: 0 }, // in minutes
    total: { type: Number, default: 0 }
  },
  
  // Applicant-specific metrics
  applicantMetrics: {
    applicationsSubmitted: {
      total: { type: Number, default: 0 },
      thisMonth: { type: Number, default: 0 },
      thisWeek: { type: Number, default: 0 }
    },
    applicationStatus: {
      pending: { type: Number, default: 0 },
      reviewing: { type: Number, default: 0 },
      shortlisted: { type: Number, default: 0 },
      interviewed: { type: Number, default: 0 },
      offered: { type: Number, default: 0 },
      hired: { type: Number, default: 0 },
      rejected: { type: Number, default: 0 }
    },
    jobsViewed: {
      total: { type: Number, default: 0 },
      thisMonth: { type: Number, default: 0 }
    },
    jobsSaved: { type: Number, default: 0 },
    searchesPerformed: { type: Number, default: 0 },
    resumeDownloads: { type: Number, default: 0 },
    skillAssessmentsTaken: { type: Number, default: 0 },
    averageSkillScore: { type: Number, default: 0 },
    interviewsAttended: { type: Number, default: 0 },
    responseRate: { type: Number, default: 0 }, // percentage
    averageResponseTime: { type: Number, default: 0 } // in hours
  },
  
  // Recruiter-specific metrics
  recruiterMetrics: {
    jobsPosted: {
      total: { type: Number, default: 0 },
      active: { type: Number, default: 0 },
      closed: { type: Number, default: 0 },
      draft: { type: Number, default: 0 }
    },
    applicationsReceived: {
      total: { type: Number, default: 0 },
      thisMonth: { type: Number, default: 0 },
      thisWeek: { type: Number, default: 0 }
    },
    candidatesViewed: { type: Number, default: 0 },
    candidatesShortlisted: { type: Number, default: 0 },
    interviewsScheduled: { type: Number, default: 0 },
    hiresCompleted: { type: Number, default: 0 },
    averageTimeToHire: { type: Number, default: 0 }, // in days
    costPerHire: { type: Number, default: 0 },
    qualityOfHire: { type: Number, default: 0 }, // rating 1-5
    sourceEffectiveness: [{
      source: String,
      applications: Number,
      hires: Number,
      conversionRate: Number
    }]
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Job Analytics Schema
const jobAnalyticsSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true,
    unique: true,
    index: true
  },
  recruiterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BaseUser',
    required: true,
    index: true
  },
  
  // View metrics
  views: {
    total: { type: Number, default: 0 },
    unique: { type: Number, default: 0 },
    thisMonth: { type: Number, default: 0 },
    thisWeek: { type: Number, default: 0 },
    today: { type: Number, default: 0 }
  },
  
  // Application metrics
  applications: {
    total: { type: Number, default: 0 },
    thisMonth: { type: Number, default: 0 },
    thisWeek: { type: Number, default: 0 },
    conversionRate: { type: Number, default: 0 } // views to applications
  },
  
  // Engagement metrics
  saves: { type: Number, default: 0 },
  shares: { type: Number, default: 0 },
  clickThroughRate: { type: Number, default: 0 },
  
  // Quality metrics
  averageApplicantQuality: { type: Number, default: 0 }, // 1-5 rating
  timeToFirstApplication: { type: Number, default: 0 }, // in hours
  averageApplicationCompleteness: { type: Number, default: 0 }, // percentage
  
  // Source tracking
  trafficSources: [{
    source: {
      type: String,
      enum: ['direct', 'search', 'social', 'referral', 'email', 'job-board']
    },
    views: { type: Number, default: 0 },
    applications: { type: Number, default: 0 }
  }],
  
  // Geographic data
  viewsByLocation: [{
    country: String,
    state: String,
    city: String,
    count: Number
  }],
  
  // Device analytics
  deviceStats: {
    desktop: { type: Number, default: 0 },
    mobile: { type: Number, default: 0 },
    tablet: { type: Number, default: 0 }
  },
  
  // Performance benchmarks
  benchmarks: {
    industryAverageViews: Number,
    industryAverageApplications: Number,
    performanceScore: Number // compared to similar jobs
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// System Analytics Schema
const systemAnalyticsSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    required: true
  },
  
  // User metrics
  userMetrics: {
    totalUsers: { type: Number, default: 0 },
    newUsers: { type: Number, default: 0 },
    activeUsers: { type: Number, default: 0 },
    applicants: { type: Number, default: 0 },
    recruiters: { type: Number, default: 0 },
    userRetention: { type: Number, default: 0 }
  },
  
  // Job metrics
  jobMetrics: {
    totalJobs: { type: Number, default: 0 },
    newJobs: { type: Number, default: 0 },
    activeJobs: { type: Number, default: 0 },
    closedJobs: { type: Number, default: 0 },
    averageJobViews: { type: Number, default: 0 }
  },
  
  // Application metrics
  applicationMetrics: {
    totalApplications: { type: Number, default: 0 },
    newApplications: { type: Number, default: 0 },
    applicationConversionRate: { type: Number, default: 0 },
    averageApplicationsPerJob: { type: Number, default: 0 }
  },
  
  // Platform performance
  platformMetrics: {
    averagePageLoadTime: { type: Number, default: 0 },
    bounceRate: { type: Number, default: 0 },
    sessionDuration: { type: Number, default: 0 },
    errorRate: { type: Number, default: 0 },
    uptime: { type: Number, default: 100 }
  },
  
  // Revenue metrics (if applicable)
  revenueMetrics: {
    totalRevenue: { type: Number, default: 0 },
    subscriptionRevenue: { type: Number, default: 0 },
    jobPostingRevenue: { type: Number, default: 0 },
    premiumFeatureRevenue: { type: Number, default: 0 }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
userAnalyticsSchema.index({ userId: 1 });
userAnalyticsSchema.index({ userRole: 1 });
userAnalyticsSchema.index({ 'profileViews.total': -1 });

jobAnalyticsSchema.index({ jobId: 1 });
jobAnalyticsSchema.index({ recruiterId: 1 });
jobAnalyticsSchema.index({ 'views.total': -1 });
jobAnalyticsSchema.index({ 'applications.total': -1 });

systemAnalyticsSchema.index({ date: -1, type: 1 });

// Methods for updating analytics
userAnalyticsSchema.methods.incrementProfileView = function() {
  this.profileViews.total += 1;
  this.profileViews.today += 1;
  this.profileViews.thisWeek += 1;
  this.profileViews.thisMonth += 1;
  return this.save();
};

jobAnalyticsSchema.methods.incrementView = function(isUnique = false) {
  this.views.total += 1;
  this.views.today += 1;
  this.views.thisWeek += 1;
  this.views.thisMonth += 1;
  if (isUnique) this.views.unique += 1;
  return this.save();
};

jobAnalyticsSchema.methods.incrementApplication = function() {
  this.applications.total += 1;
  this.applications.thisMonth += 1;
  this.applications.thisWeek += 1;
  this.applications.conversionRate = (this.applications.total / this.views.total) * 100;
  return this.save();
};

export const UserAnalytics = mongoose.model('UserAnalytics', userAnalyticsSchema);
export const JobAnalytics = mongoose.model('JobAnalytics', jobAnalyticsSchema);
export const SystemAnalytics = mongoose.model('SystemAnalytics', systemAnalyticsSchema);
