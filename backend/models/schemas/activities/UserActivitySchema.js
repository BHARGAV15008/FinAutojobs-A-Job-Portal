/**
 * User Activity Schema
 * 
 * Tracks all user activities across the platform for analytics,
 * personalization, and user behavior understanding.
 * 
 * @author FinAutoJobs Team
 * @version 1.0.0
 */

import mongoose from 'mongoose';

const UserActivitySchema = new mongoose.Schema({
  // User Information
  user: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true
    },
    role: {
      type: String,
      enum: ['applicant', 'recruiter', 'admin'],
      required: true,
      index: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    }
  },
  
  // Activity Details
  activity: {
    type: {
      type: String,
      required: [true, 'Activity type is required'],
      enum: [
        // Authentication activities
        'login', 'logout', 'register', 'password_reset', 'email_verification',
        'phone_verification', 'two_factor_setup', 'two_factor_login',
        
        // Profile activities
        'profile_view', 'profile_update', 'profile_picture_upload',
        'resume_upload', 'document_upload', 'skill_update',
        
        // Job-related activities
        'job_search', 'job_view', 'job_apply', 'job_save', 'job_unsave',
        'job_share', 'job_alert_create', 'job_alert_update', 'job_alert_delete',
        
        // Application activities
        'application_submit', 'application_withdraw', 'application_view',
        'interview_schedule', 'interview_reschedule', 'interview_cancel',
        'interview_complete', 'offer_receive', 'offer_accept', 'offer_reject',
        
        // Recruiter activities
        'job_post', 'job_edit', 'job_delete', 'job_publish', 'job_unpublish',
        'candidate_search', 'candidate_view', 'candidate_shortlist',
        'candidate_reject', 'interview_feedback', 'offer_extend',
        
        // Admin activities
        'user_manage', 'company_verify', 'job_moderate', 'report_review',
        'system_setting_change', 'backup_create', 'data_export',
        
        // Communication activities
        'message_send', 'message_read', 'notification_read',
        'email_open', 'email_click',
        
        // General activities
        'page_view', 'search', 'filter_apply', 'sort_change',
        'download', 'share', 'feedback_submit', 'support_ticket_create'
      ],
      index: true
    },
    
    category: {
      type: String,
      enum: [
        'authentication', 'profile', 'job', 'application', 'communication',
        'search', 'admin', 'system', 'engagement', 'conversion'
      ],
      required: true,
      index: true
    },
    
    action: {
      type: String,
      required: true,
      trim: true
    },
    
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters']
    }
  },
  
  // Context & Metadata
  context: {
    // Resource being acted upon
    resource: {
      type: {
        type: String,
        enum: ['job', 'application', 'user', 'company', 'message', 'notification', 'page', 'other']
      },
      id: {
        type: String,
        trim: true
      },
      title: {
        type: String,
        trim: true
      },
      url: {
        type: String,
        trim: true
      }
    },
    
    // Additional context data
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    },
    
    // Search/filter context
    searchContext: {
      query: String,
      filters: {
        type: mongoose.Schema.Types.Mixed
      },
      results: {
        count: Number,
        page: Number,
        totalPages: Number
      }
    },
    
    // Previous/next states for updates
    changes: {
      before: {
        type: mongoose.Schema.Types.Mixed
      },
      after: {
        type: mongoose.Schema.Types.Mixed
      },
      fields: [{
        type: String
      }]
    }
  },
  
  // Session & Device Information
  session: {
    sessionId: {
      type: String,
      required: true,
      index: true
    },
    
    device: {
      type: {
        type: String,
        enum: ['desktop', 'mobile', 'tablet', 'unknown'],
        default: 'unknown'
      },
      os: {
        type: String,
        trim: true
      },
      browser: {
        type: String,
        trim: true
      },
      version: {
        type: String,
        trim: true
      },
      userAgent: {
        type: String,
        trim: true
      }
    },
    
    location: {
      ip: {
        type: String,
        required: true
      },
      country: {
        type: String,
        trim: true
      },
      region: {
        type: String,
        trim: true
      },
      city: {
        type: String,
        trim: true
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
    
    referrer: {
      url: {
        type: String,
        trim: true
      },
      domain: {
        type: String,
        trim: true
      },
      source: {
        type: String,
        enum: ['direct', 'search', 'social', 'email', 'referral', 'advertisement', 'other'],
        default: 'direct'
      }
    }
  },
  
  // Timing Information
  timing: {
    timestamp: {
      type: Date,
      default: Date.now,
      index: true
    },
    
    duration: {
      type: Number, // milliseconds
      min: 0
    },
    
    timeOnPage: {
      type: Number, // seconds
      min: 0
    },
    
    serverResponseTime: {
      type: Number, // milliseconds
      min: 0
    }
  },
  
  // Engagement Metrics
  engagement: {
    isFirstTime: {
      type: Boolean,
      default: false
    },
    
    isReturning: {
      type: Boolean,
      default: false
    },
    
    sessionNumber: {
      type: Number,
      min: 1,
      default: 1
    },
    
    pageDepth: {
      type: Number,
      min: 1,
      default: 1
    },
    
    scrollDepth: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    
    clickCount: {
      type: Number,
      min: 0,
      default: 0
    },
    
    interactionScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    }
  },
  
  // Conversion & Goals
  conversion: {
    isConversion: {
      type: Boolean,
      default: false
    },
    
    conversionType: {
      type: String,
      enum: [
        'registration', 'profile_completion', 'job_application',
        'job_posting', 'subscription', 'verification', 'other'
      ]
    },
    
    conversionValue: {
      type: Number,
      min: 0
    },
    
    funnelStep: {
      type: String,
      trim: true
    },
    
    goalId: {
      type: String,
      trim: true
    }
  },
  
  // A/B Testing & Experiments
  experiments: [{
    experimentId: {
      type: String,
      required: true,
      trim: true
    },
    variant: {
      type: String,
      required: true,
      trim: true
    },
    isControl: {
      type: Boolean,
      default: false
    }
  }],
  
  // Privacy & Compliance
  privacy: {
    isAnonymized: {
      type: Boolean,
      default: false
    },
    
    consentGiven: {
      type: Boolean,
      default: false
    },
    
    dataRetentionDays: {
      type: Number,
      default: 365
    },
    
    isGDPRCompliant: {
      type: Boolean,
      default: true
    }
  },
  
  // Status & Processing
  status: {
    type: String,
    enum: ['pending', 'processed', 'failed', 'ignored'],
    default: 'pending',
    index: true
  },
  
  processedAt: Date,
  
  // Error Information (if any)
  error: {
    code: {
      type: String,
      trim: true
    },
    message: {
      type: String,
      trim: true
    },
    stack: {
      type: String,
      trim: true,
      select: false
    }
  },
  
  // Tags for categorization
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }]
}, {
  timestamps: true,
  versionKey: false,
  // Automatically delete documents after retention period
  expires: '365d'
});

// Indexes for better query performance
UserActivitySchema.index({ 'user.userId': 1, 'timing.timestamp': -1 });
UserActivitySchema.index({ 'user.role': 1, 'activity.type': 1 });
UserActivitySchema.index({ 'activity.category': 1, 'timing.timestamp': -1 });
UserActivitySchema.index({ 'session.sessionId': 1, 'timing.timestamp': 1 });
UserActivitySchema.index({ 'session.location.ip': 1 });
UserActivitySchema.index({ 'conversion.isConversion': 1, 'conversion.conversionType': 1 });
UserActivitySchema.index({ 'timing.timestamp': -1 });
UserActivitySchema.index({ status: 1, processedAt: 1 });

// Compound indexes for common queries
UserActivitySchema.index({ 
  'user.userId': 1, 
  'activity.category': 1, 
  'timing.timestamp': -1 
});

UserActivitySchema.index({ 
  'user.role': 1, 
  'activity.type': 1, 
  'timing.timestamp': -1 
});

// Text index for searching
UserActivitySchema.index({ 
  'activity.action': 'text', 
  'activity.description': 'text',
  'context.resource.title': 'text'
});

// Virtual for activity age
UserActivitySchema.virtual('activityAge').get(function() {
  const now = new Date();
  const timestamp = new Date(this.timing.timestamp);
  const diffTime = Math.abs(now - timestamp);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // days
});

// Virtual for session duration
UserActivitySchema.virtual('sessionDuration').get(function() {
  return this.timing.duration ? Math.round(this.timing.duration / 1000) : 0; // seconds
});

// Pre-save middleware
UserActivitySchema.pre('save', function(next) {
  // Set processing timestamp
  if (this.status === 'processed' && !this.processedAt) {
    this.processedAt = new Date();
  }
  
  // Calculate interaction score based on engagement metrics
  if (this.engagement) {
    let score = 0;
    
    // Base score for activity
    score += 10;
    
    // Time on page bonus
    if (this.timing.timeOnPage) {
      score += Math.min(this.timing.timeOnPage / 60 * 5, 20); // Max 20 points for time
    }
    
    // Scroll depth bonus
    if (this.engagement.scrollDepth) {
      score += this.engagement.scrollDepth * 0.3; // Max 30 points
    }
    
    // Click interaction bonus
    if (this.engagement.clickCount) {
      score += Math.min(this.engagement.clickCount * 5, 25); // Max 25 points
    }
    
    // Conversion bonus
    if (this.conversion.isConversion) {
      score += 15;
    }
    
    this.engagement.interactionScore = Math.min(Math.round(score), 100);
  }
  
  next();
});

// Static methods
UserActivitySchema.statics.getActivitySummary = function(userId, dateRange = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - dateRange);
  
  return this.aggregate([
    {
      $match: {
        'user.userId': new mongoose.Types.ObjectId(userId),
        'timing.timestamp': { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$activity.category',
        count: { $sum: 1 },
        lastActivity: { $max: '$timing.timestamp' },
        avgEngagement: { $avg: '$engagement.interactionScore' }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);
};

UserActivitySchema.statics.getConversionFunnel = function(conversionType, dateRange = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - dateRange);
  
  return this.aggregate([
    {
      $match: {
        'conversion.conversionType': conversionType,
        'timing.timestamp': { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$conversion.funnelStep',
        count: { $sum: 1 },
        conversions: {
          $sum: { $cond: ['$conversion.isConversion', 1, 0] }
        }
      }
    },
    {
      $addFields: {
        conversionRate: {
          $multiply: [
            { $divide: ['$conversions', '$count'] },
            100
          ]
        }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);
};

// Instance methods
UserActivitySchema.methods.markAsProcessed = function() {
  this.status = 'processed';
  this.processedAt = new Date();
  return this.save();
};

UserActivitySchema.methods.addExperiment = function(experimentId, variant, isControl = false) {
  this.experiments.push({
    experimentId,
    variant,
    isControl
  });
  return this.save();
};

UserActivitySchema.methods.anonymize = function() {
  this.privacy.isAnonymized = true;
  this.user.email = 'anonymized@example.com';
  this.session.location.ip = '0.0.0.0';
  this.session.device.userAgent = 'anonymized';
  
  return this.save();
};

export default UserActivitySchema;
