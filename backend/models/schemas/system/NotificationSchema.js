/**
 * Notification Schema
 * 
 * Comprehensive notification system for managing all types of
 * notifications across the platform with delivery tracking.
 * 
 * @author FinAutoJobs Team
 * @version 1.0.0
 */

import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  // Notification Identification
  notificationId: {
    type: String,
    unique: true,
    required: true,
    index: true
  },
  
  // Recipient Information
  recipient: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Recipient user ID is required'],
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
    },
    phone: {
      type: String,
      trim: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    }
  },
  
  // Sender Information (optional, for user-to-user notifications)
  sender: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    role: {
      type: String,
      enum: ['applicant', 'recruiter', 'admin', 'system']
    },
    name: {
      type: String,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    }
  },
  
  // Notification Content
  content: {
    type: {
      type: String,
      required: [true, 'Notification type is required'],
      enum: [
        // Job-related notifications
        'job_posted', 'job_updated', 'job_expired', 'job_closed',
        'job_match', 'job_recommendation', 'job_alert',
        
        // Application-related notifications
        'application_received', 'application_viewed', 'application_shortlisted',
        'application_rejected', 'application_withdrawn',
        
        // Interview-related notifications
        'interview_scheduled', 'interview_rescheduled', 'interview_cancelled',
        'interview_reminder', 'interview_feedback_request',
        
        // Offer-related notifications
        'offer_extended', 'offer_accepted', 'offer_rejected',
        'offer_expired', 'offer_negotiation',
        
        // Profile-related notifications
        'profile_viewed', 'profile_incomplete', 'document_uploaded',
        'verification_required', 'verification_completed',
        
        // System notifications
        'welcome', 'account_created', 'password_reset', 'email_verification',
        'subscription_expiry', 'payment_due', 'system_maintenance',
        
        // Communication notifications
        'message_received', 'comment_added', 'mention_received',
        
        // Admin notifications
        'user_reported', 'content_flagged', 'system_alert',
        'backup_completed', 'security_alert',
        
        // Marketing notifications
        'newsletter', 'promotion', 'feature_announcement', 'survey'
      ],
      index: true
    },
    
    category: {
      type: String,
      enum: [
        'job', 'application', 'interview', 'offer', 'profile',
        'system', 'communication', 'admin', 'marketing', 'security'
      ],
      required: true,
      index: true
    },
    
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
      index: true
    },
    
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters']
    },
    
    message: {
      type: String,
      required: [true, 'Notification message is required'],
      trim: true,
      maxlength: [1000, 'Message cannot exceed 1000 characters']
    },
    
    shortMessage: {
      type: String,
      trim: true,
      maxlength: [160, 'Short message cannot exceed 160 characters']
    },
    
    actionText: {
      type: String,
      trim: true,
      maxlength: [50, 'Action text cannot exceed 50 characters']
    },
    
    actionUrl: {
      type: String,
      trim: true,
      match: [/^(https?:\/\/|\/)[^\s]*$/, 'Please enter a valid URL']
    },
    
    // Rich content support
    richContent: {
      html: {
        type: String,
        trim: true
      },
      attachments: [{
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
        type: {
          type: String,
          enum: ['image', 'document', 'video', 'audio', 'other'],
          default: 'other'
        },
        size: Number
      }],
      images: [{
        url: {
          type: String,
          required: true,
          trim: true
        },
        alt: {
          type: String,
          trim: true
        },
        width: Number,
        height: Number
      }]
    }
  },
  
  // Context & Related Resources
  context: {
    resourceType: {
      type: String,
      enum: ['job', 'application', 'user', 'company', 'interview', 'offer', 'message', 'system'],
      index: true
    },
    resourceId: {
      type: String,
      trim: true,
      index: true
    },
    resourceTitle: {
      type: String,
      trim: true
    },
    additionalData: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  
  // Delivery Channels & Status
  delivery: {
    channels: [{
      type: {
        type: String,
        enum: ['in_app', 'email', 'sms', 'push', 'webhook'],
        required: true
      },
      status: {
        type: String,
        enum: ['pending', 'sent', 'delivered', 'failed', 'bounced', 'spam'],
        default: 'pending'
      },
      sentAt: Date,
      deliveredAt: Date,
      failureReason: {
        type: String,
        trim: true
      },
      attempts: {
        type: Number,
        default: 0,
        min: 0
      },
      maxAttempts: {
        type: Number,
        default: 3,
        min: 1
      },
      nextRetryAt: Date,
      externalId: {
        type: String,
        trim: true
      },
      provider: {
        type: String,
        trim: true
      }
    }],
    
    overallStatus: {
      type: String,
      enum: ['pending', 'partially_sent', 'sent', 'delivered', 'failed'],
      default: 'pending',
      index: true
    }
  },
  
  // User Interaction
  interaction: {
    isRead: {
      type: Boolean,
      default: false,
      index: true
    },
    readAt: Date,
    
    isClicked: {
      type: Boolean,
      default: false
    },
    clickedAt: Date,
    clickCount: {
      type: Number,
      default: 0
    },
    
    isActioned: {
      type: Boolean,
      default: false
    },
    actionedAt: Date,
    actionType: {
      type: String,
      trim: true
    },
    
    isDismissed: {
      type: Boolean,
      default: false
    },
    dismissedAt: Date,
    
    isStarred: {
      type: Boolean,
      default: false
    },
    starredAt: Date,
    
    feedback: {
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      comment: {
        type: String,
        trim: true,
        maxlength: [500, 'Feedback comment cannot exceed 500 characters']
      },
      submittedAt: Date
    }
  },
  
  // Scheduling & Timing
  scheduling: {
    scheduledFor: {
      type: Date,
      index: true
    },
    
    timezone: {
      type: String,
      default: 'Asia/Kolkata'
    },
    
    isRecurring: {
      type: Boolean,
      default: false
    },
    
    recurrence: {
      pattern: {
        type: String,
        enum: ['daily', 'weekly', 'monthly', 'yearly', 'custom']
      },
      interval: {
        type: Number,
        min: 1
      },
      daysOfWeek: [{
        type: Number,
        min: 0,
        max: 6
      }],
      dayOfMonth: {
        type: Number,
        min: 1,
        max: 31
      },
      endDate: Date,
      maxOccurrences: Number
    },
    
    expiresAt: {
      type: Date,
      index: true
    }
  },
  
  // Personalization & Targeting
  targeting: {
    segments: [{
      type: String,
      trim: true
    }],
    
    conditions: {
      userRole: [{
        type: String,
        enum: ['applicant', 'recruiter', 'admin']
      }],
      userStatus: [{
        type: String,
        enum: ['active', 'inactive', 'new', 'returning']
      }],
      location: {
        countries: [String],
        states: [String],
        cities: [String]
      },
      customFilters: {
        type: mongoose.Schema.Types.Mixed
      }
    },
    
    personalization: {
      variables: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
      },
      templateId: {
        type: String,
        trim: true
      }
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
  
  // Analytics & Tracking
  analytics: {
    campaignId: {
      type: String,
      trim: true
    },
    source: {
      type: String,
      trim: true
    },
    medium: {
      type: String,
      trim: true
    },
    tags: [{
      type: String,
      trim: true,
      lowercase: true
    }],
    
    metrics: {
      impressions: {
        type: Number,
        default: 0
      },
      opens: {
        type: Number,
        default: 0
      },
      clicks: {
        type: Number,
        default: 0
      },
      conversions: {
        type: Number,
        default: 0
      },
      unsubscribes: {
        type: Number,
        default: 0
      }
    }
  },
  
  // Compliance & Privacy
  compliance: {
    canEmail: {
      type: Boolean,
      default: true
    },
    canSMS: {
      type: Boolean,
      default: false
    },
    canPush: {
      type: Boolean,
      default: true
    },
    
    consentSource: {
      type: String,
      enum: ['registration', 'explicit', 'implied', 'legitimate_interest'],
      default: 'registration'
    },
    consentDate: Date,
    
    unsubscribeUrl: {
      type: String,
      trim: true
    },
    
    isGDPRCompliant: {
      type: Boolean,
      default: true
    },
    
    dataRetentionDays: {
      type: Number,
      default: 365
    }
  },
  
  // System Information
  system: {
    batchId: {
      type: String,
      trim: true,
      index: true
    },
    
    templateVersion: {
      type: String,
      trim: true
    },
    
    generatedBy: {
      type: String,
      enum: ['system', 'admin', 'automation', 'api'],
      default: 'system'
    },
    
    generatedAt: {
      type: Date,
      default: Date.now
    },
    
    processedBy: {
      type: String,
      trim: true
    },
    
    processingTime: {
      type: Number // milliseconds
    }
  }
}, {
  timestamps: true,
  versionKey: false,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
NotificationSchema.index({ notificationId: 1 });
NotificationSchema.index({ 'recipient.userId': 1, 'interaction.isRead': 1 });
NotificationSchema.index({ 'recipient.userId': 1, createdAt: -1 });
NotificationSchema.index({ 'content.type': 1, 'content.category': 1 });
NotificationSchema.index({ 'delivery.overallStatus': 1, 'scheduling.scheduledFor': 1 });
NotificationSchema.index({ 'scheduling.expiresAt': 1 });
NotificationSchema.index({ 'system.batchId': 1 });
NotificationSchema.index({ 'context.resourceType': 1, 'context.resourceId': 1 });

// Compound indexes
NotificationSchema.index({ 
  'recipient.userId': 1, 
  'content.category': 1, 
  'interaction.isRead': 1,
  createdAt: -1 
});

NotificationSchema.index({ 
  'content.priority': 1, 
  'delivery.overallStatus': 1,
  'scheduling.scheduledFor': 1 
});

// TTL index for automatic cleanup
NotificationSchema.index({ 'scheduling.expiresAt': 1 }, { expireAfterSeconds: 0 });

// Virtual for notification age
NotificationSchema.virtual('age').get(function() {
  const now = new Date();
  const created = new Date(this.createdAt);
  const diffTime = Math.abs(now - created);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // days
});

// Virtual for delivery success rate
NotificationSchema.virtual('deliverySuccessRate').get(function() {
  if (!this.delivery.channels || this.delivery.channels.length === 0) return 0;
  
  const successfulDeliveries = this.delivery.channels.filter(
    channel => channel.status === 'delivered' || channel.status === 'sent'
  ).length;
  
  return ((successfulDeliveries / this.delivery.channels.length) * 100).toFixed(2);
});

// Pre-save middleware
NotificationSchema.pre('save', function(next) {
  // Generate notification ID if not exists
  if (!this.notificationId) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    this.notificationId = `NOTIF-${timestamp}-${random}`.toUpperCase();
  }
  
  // Set expiry date if not set (default 30 days)
  if (!this.scheduling.expiresAt) {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);
    this.scheduling.expiresAt = expiryDate;
  }
  
  // Update overall delivery status
  if (this.delivery.channels && this.delivery.channels.length > 0) {
    const statuses = this.delivery.channels.map(channel => channel.status);
    const uniqueStatuses = [...new Set(statuses)];
    
    if (uniqueStatuses.length === 1) {
      this.delivery.overallStatus = uniqueStatuses[0];
    } else if (statuses.includes('delivered') || statuses.includes('sent')) {
      this.delivery.overallStatus = 'partially_sent';
    } else if (statuses.every(status => status === 'failed')) {
      this.delivery.overallStatus = 'failed';
    } else {
      this.delivery.overallStatus = 'pending';
    }
  }
  
  next();
});

// Static methods
NotificationSchema.statics.getUnreadCount = function(userId) {
  return this.countDocuments({
    'recipient.userId': userId,
    'interaction.isRead': false,
    'scheduling.expiresAt': { $gt: new Date() }
  });
};

NotificationSchema.statics.markAllAsRead = function(userId) {
  return this.updateMany(
    {
      'recipient.userId': userId,
      'interaction.isRead': false
    },
    {
      $set: {
        'interaction.isRead': true,
        'interaction.readAt': new Date()
      }
    }
  );
};

NotificationSchema.statics.getNotificationStats = function(dateRange = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - dateRange);
  
  return this.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$content.category',
        total: { $sum: 1 },
        sent: { $sum: { $cond: [{ $eq: ['$delivery.overallStatus', 'sent'] }, 1, 0] } },
        delivered: { $sum: { $cond: [{ $eq: ['$delivery.overallStatus', 'delivered'] }, 1, 0] } },
        failed: { $sum: { $cond: [{ $eq: ['$delivery.overallStatus', 'failed'] }, 1, 0] } },
        read: { $sum: { $cond: ['$interaction.isRead', 1, 0] } },
        clicked: { $sum: { $cond: ['$interaction.isClicked', 1, 0] } }
      }
    },
    {
      $addFields: {
        deliveryRate: { $multiply: [{ $divide: ['$delivered', '$total'] }, 100] },
        readRate: { $multiply: [{ $divide: ['$read', '$delivered'] }, 100] },
        clickRate: { $multiply: [{ $divide: ['$clicked', '$read'] }, 100] }
      }
    },
    {
      $sort: { total: -1 }
    }
  ]);
};

// Instance methods
NotificationSchema.methods.markAsRead = function() {
  this.interaction.isRead = true;
  this.interaction.readAt = new Date();
  return this.save();
};

NotificationSchema.methods.markAsClicked = function() {
  this.interaction.isClicked = true;
  this.interaction.clickedAt = new Date();
  this.interaction.clickCount += 1;
  
  if (!this.interaction.isRead) {
    this.interaction.isRead = true;
    this.interaction.readAt = new Date();
  }
  
  return this.save();
};

NotificationSchema.methods.addDeliveryChannel = function(channelType, provider = null) {
  this.delivery.channels.push({
    type: channelType,
    status: 'pending',
    provider: provider,
    attempts: 0
  });
  
  return this.save();
};

NotificationSchema.methods.updateChannelStatus = function(channelType, status, externalId = null, failureReason = null) {
  const channel = this.delivery.channels.find(ch => ch.type === channelType);
  
  if (channel) {
    channel.status = status;
    channel.attempts += 1;
    
    if (status === 'sent') {
      channel.sentAt = new Date();
    } else if (status === 'delivered') {
      channel.deliveredAt = new Date();
      if (!channel.sentAt) channel.sentAt = new Date();
    } else if (status === 'failed') {
      channel.failureReason = failureReason;
      
      // Schedule retry if under max attempts
      if (channel.attempts < channel.maxAttempts) {
        const retryDelay = Math.pow(2, channel.attempts) * 60 * 1000; // Exponential backoff
        channel.nextRetryAt = new Date(Date.now() + retryDelay);
      }
    }
    
    if (externalId) {
      channel.externalId = externalId;
    }
  }
  
  return this.save();
};

NotificationSchema.methods.dismiss = function() {
  this.interaction.isDismissed = true;
  this.interaction.dismissedAt = new Date();
  return this.save();
};

NotificationSchema.methods.star = function() {
  this.interaction.isStarred = !this.interaction.isStarred;
  this.interaction.starredAt = this.interaction.isStarred ? new Date() : null;
  return this.save();
};

export default NotificationSchema;
