/**
 * Job Bookmark Schema
 * 
 * Schema for managing user job bookmarks/saved jobs with
 * categorization, notes, and tracking functionality.
 * 
 * @author FinAutoJobs Team
 * @version 1.0.0
 */

import mongoose from 'mongoose';

const JobBookmarkSchema = new mongoose.Schema({
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
      enum: ['applicant', 'recruiter'],
      required: true,
      index: true
    }
  },
  
  // Job Information
  job: {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: [true, 'Job ID is required'],
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    company: {
      type: String,
      required: true,
      trim: true
    },
    location: {
      type: String,
      required: true,
      trim: true
    },
    salary: {
      type: String,
      trim: true
    },
    employmentType: {
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'freelance', 'internship'],
      required: true
    }
  },
  
  // Bookmark Details
  bookmark: {
    category: {
      type: String,
      enum: ['interested', 'applied', 'maybe', 'priority', 'research', 'custom'],
      default: 'interested',
      index: true
    },
    
    customCategory: {
      type: String,
      trim: true,
      maxlength: [50, 'Custom category cannot exceed 50 characters']
    },
    
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
      index: true
    },
    
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Notes cannot exceed 1000 characters']
    },
    
    tags: [{
      type: String,
      trim: true,
      lowercase: true,
      maxlength: [30, 'Tag cannot exceed 30 characters']
    }],
    
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    
    isPrivate: {
      type: Boolean,
      default: true
    }
  },
  
  // Application Status
  application: {
    hasApplied: {
      type: Boolean,
      default: false,
      index: true
    },
    
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'JobApplication'
    },
    
    appliedAt: Date,
    
    applicationStatus: {
      type: String,
      enum: [
        'not_applied', 'submitted', 'under_review', 'shortlisted',
        'rejected', 'interview_scheduled', 'offer_received', 'hired'
      ],
      default: 'not_applied'
    },
    
    lastStatusUpdate: Date
  },
  
  // Tracking & Analytics
  tracking: {
    viewCount: {
      type: Number,
      default: 1,
      min: 0
    },
    
    lastViewed: {
      type: Date,
      default: Date.now
    },
    
    firstSaved: {
      type: Date,
      default: Date.now
    },
    
    source: {
      type: String,
      enum: ['search', 'recommendation', 'alert', 'direct', 'referral'],
      default: 'search'
    },
    
    searchQuery: {
      type: String,
      trim: true
    },
    
    referrer: {
      type: String,
      trim: true
    }
  },
  
  // Reminders & Alerts
  reminders: [{
    type: {
      type: String,
      enum: ['application_deadline', 'follow_up', 'custom'],
      required: true
    },
    
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'Reminder title cannot exceed 100 characters']
    },
    
    description: {
      type: String,
      trim: true,
      maxlength: [300, 'Reminder description cannot exceed 300 characters']
    },
    
    reminderDate: {
      type: Date,
      required: true
    },
    
    isCompleted: {
      type: Boolean,
      default: false
    },
    
    completedAt: Date,
    
    notificationSent: {
      type: Boolean,
      default: false
    },
    
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Job Status Monitoring
  jobStatus: {
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    
    isExpired: {
      type: Boolean,
      default: false,
      index: true
    },
    
    lastChecked: {
      type: Date,
      default: Date.now
    },
    
    statusChanges: [{
      from: String,
      to: String,
      changedAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  
  // Sharing & Collaboration
  sharing: {
    isShared: {
      type: Boolean,
      default: false
    },
    
    sharedWith: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      email: {
        type: String,
        trim: true,
        lowercase: true
      },
      permission: {
        type: String,
        enum: ['view', 'comment'],
        default: 'view'
      },
      sharedAt: {
        type: Date,
        default: Date.now
      }
    }],
    
    shareToken: {
      type: String,
      unique: true,
      sparse: true
    },
    
    shareExpiresAt: Date
  },
  
  // Folder Organization
  folder: {
    name: {
      type: String,
      trim: true,
      maxlength: [50, 'Folder name cannot exceed 50 characters'],
      index: true
    },
    
    color: {
      type: String,
      enum: ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'gray'],
      default: 'blue'
    },
    
    icon: {
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
JobBookmarkSchema.index({ 'user.userId': 1, createdAt: -1 });
JobBookmarkSchema.index({ 'user.userId': 1, 'bookmark.category': 1 });
JobBookmarkSchema.index({ 'user.userId': 1, 'bookmark.priority': 1 });
JobBookmarkSchema.index({ 'user.userId': 1, 'folder.name': 1 });
JobBookmarkSchema.index({ 'job.jobId': 1, 'user.userId': 1 }, { unique: true });
JobBookmarkSchema.index({ 'application.hasApplied': 1, 'application.applicationStatus': 1 });
JobBookmarkSchema.index({ 'jobStatus.isActive': 1, 'jobStatus.isExpired': 1 });
JobBookmarkSchema.index({ 'tracking.lastViewed': -1 });

// Virtual for days since saved
JobBookmarkSchema.virtual('daysSinceSaved').get(function() {
  const now = new Date();
  const saved = new Date(this.tracking.firstSaved);
  const diffTime = Math.abs(now - saved);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for active reminders count
JobBookmarkSchema.virtual('activeRemindersCount').get(function() {
  return this.reminders.filter(reminder => 
    !reminder.isCompleted && reminder.reminderDate > new Date()
  ).length;
});

// Pre-save middleware
JobBookmarkSchema.pre('save', function(next) {
  // Update last viewed when bookmark is accessed
  this.tracking.lastViewed = new Date();
  
  // Set custom category if category is 'custom'
  if (this.bookmark.category === 'custom' && !this.bookmark.customCategory) {
    this.bookmark.customCategory = 'My Category';
  }
  
  next();
});

// Instance methods
JobBookmarkSchema.methods.incrementViewCount = function() {
  this.tracking.viewCount += 1;
  this.tracking.lastViewed = new Date();
  return this.save();
};

JobBookmarkSchema.methods.updateApplicationStatus = function(status, applicationId = null) {
  this.application.applicationStatus = status;
  this.application.lastStatusUpdate = new Date();
  
  if (status !== 'not_applied') {
    this.application.hasApplied = true;
    if (!this.application.appliedAt) {
      this.application.appliedAt = new Date();
    }
  }
  
  if (applicationId) {
    this.application.applicationId = applicationId;
  }
  
  return this.save();
};

JobBookmarkSchema.methods.addReminder = function(type, title, reminderDate, description = '') {
  this.reminders.push({
    type,
    title,
    description,
    reminderDate,
    createdAt: new Date()
  });
  
  return this.save();
};

JobBookmarkSchema.methods.completeReminder = function(reminderId) {
  const reminder = this.reminders.id(reminderId);
  if (reminder) {
    reminder.isCompleted = true;
    reminder.completedAt = new Date();
  }
  
  return this.save();
};

JobBookmarkSchema.methods.updateJobStatus = function(isActive, isExpired = false) {
  const oldActive = this.jobStatus.isActive;
  const oldExpired = this.jobStatus.isExpired;
  
  this.jobStatus.isActive = isActive;
  this.jobStatus.isExpired = isExpired;
  this.jobStatus.lastChecked = new Date();
  
  // Track status changes
  if (oldActive !== isActive || oldExpired !== isExpired) {
    const fromStatus = oldExpired ? 'expired' : (oldActive ? 'active' : 'inactive');
    const toStatus = isExpired ? 'expired' : (isActive ? 'active' : 'inactive');
    
    this.jobStatus.statusChanges.push({
      from: fromStatus,
      to: toStatus,
      changedAt: new Date()
    });
  }
  
  return this.save();
};

JobBookmarkSchema.methods.shareWith = function(userIdOrEmail, permission = 'view') {
  // Generate share token if not exists
  if (!this.sharing.shareToken) {
    this.sharing.shareToken = require('crypto').randomBytes(16).toString('hex');
    
    // Set expiry to 30 days from now
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);
    this.sharing.shareExpiresAt = expiryDate;
  }
  
  // Add to shared list
  const isEmail = typeof userIdOrEmail === 'string' && userIdOrEmail.includes('@');
  const shareEntry = {
    permission,
    sharedAt: new Date()
  };
  
  if (isEmail) {
    shareEntry.email = userIdOrEmail.toLowerCase();
  } else {
    shareEntry.userId = userIdOrEmail;
  }
  
  this.sharing.sharedWith.push(shareEntry);
  this.sharing.isShared = true;
  
  return this.save();
};

JobBookmarkSchema.methods.moveToFolder = function(folderName, color = 'blue', icon = null) {
  this.folder.name = folderName;
  this.folder.color = color;
  if (icon) {
    this.folder.icon = icon;
  }
  
  return this.save();
};

// Static methods
JobBookmarkSchema.statics.getBookmarkStats = function(userId) {
  return this.aggregate([
    {
      $match: { 'user.userId': new mongoose.Types.ObjectId(userId) }
    },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        byCategory: {
          $push: {
            category: '$bookmark.category',
            priority: '$bookmark.priority'
          }
        },
        applied: { $sum: { $cond: ['$application.hasApplied', 1, 0] } },
        activeJobs: { $sum: { $cond: ['$jobStatus.isActive', 1, 0] } },
        expiredJobs: { $sum: { $cond: ['$jobStatus.isExpired', 1, 0] } }
      }
    },
    {
      $addFields: {
        applicationRate: {
          $multiply: [{ $divide: ['$applied', '$total'] }, 100]
        }
      }
    }
  ]);
};

JobBookmarkSchema.statics.getFolders = function(userId) {
  return this.aggregate([
    {
      $match: { 
        'user.userId': new mongoose.Types.ObjectId(userId),
        'folder.name': { $exists: true, $ne: null }
      }
    },
    {
      $group: {
        _id: '$folder.name',
        count: { $sum: 1 },
        color: { $first: '$folder.color' },
        icon: { $first: '$folder.icon' },
        lastUpdated: { $max: '$updatedAt' }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);
};

export default JobBookmarkSchema;
