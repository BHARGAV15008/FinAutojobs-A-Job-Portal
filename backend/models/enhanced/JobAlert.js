import mongoose from 'mongoose';

const jobAlertSchema = new mongoose.Schema({
  // User reference
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BaseUser',
    required: true,
    index: true
  },
  
  // Alert configuration
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  
  // Search criteria
  keywords: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  location: {
    city: String,
    state: String,
    country: String,
    remote: {
      type: Boolean,
      default: false
    }
  },
  jobType: [{
    type: String,
    enum: ['full-time', 'part-time', 'contract', 'freelance', 'internship']
  }],
  experienceLevel: [{
    type: String,
    enum: ['entry', 'mid', 'senior', 'executive']
  }],
  salaryRange: {
    min: Number,
    max: Number,
    currency: {
      type: String,
      default: 'USD'
    }
  },
  industries: [{
    type: String,
    trim: true
  }],
  companies: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company'
  }],
  
  // Notification settings
  frequency: {
    type: String,
    enum: ['immediate', 'daily', 'weekly', 'monthly'],
    default: 'daily'
  },
  notificationMethods: [{
    type: String,
    enum: ['email', 'sms', 'push', 'in-app'],
    default: 'email'
  }],
  
  // Advanced filters
  filters: {
    workFromHome: Boolean,
    hasHealthInsurance: Boolean,
    hasRetirement: Boolean,
    hasStockOptions: Boolean,
    minimumRating: {
      type: Number,
      min: 1,
      max: 5
    }
  },
  
  // Status and activity
  isActive: {
    type: Boolean,
    default: true
  },
  lastTriggered: Date,
  totalMatches: {
    type: Number,
    default: 0
  },
  totalNotifications: {
    type: Number,
    default: 0
  },
  
  // Analytics
  clickThroughRate: {
    type: Number,
    default: 0
  },
  lastClicked: Date,
  
  // Schedule settings
  scheduleTime: {
    hour: {
      type: Number,
      min: 0,
      max: 23,
      default: 9
    },
    timezone: {
      type: String,
      default: 'UTC'
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
jobAlertSchema.index({ userId: 1, isActive: 1 });
jobAlertSchema.index({ frequency: 1, isActive: 1 });
jobAlertSchema.index({ lastTriggered: 1 });
jobAlertSchema.index({ keywords: 1 });

// Virtual for next trigger time
jobAlertSchema.virtual('nextTrigger').get(function() {
  if (!this.lastTriggered) return new Date();
  
  const next = new Date(this.lastTriggered);
  switch (this.frequency) {
    case 'immediate':
      return new Date();
    case 'daily':
      next.setDate(next.getDate() + 1);
      break;
    case 'weekly':
      next.setDate(next.getDate() + 7);
      break;
    case 'monthly':
      next.setMonth(next.getMonth() + 1);
      break;
  }
  return next;
});

// Method to check if alert should trigger
jobAlertSchema.methods.shouldTrigger = function() {
  if (!this.isActive) return false;
  if (!this.lastTriggered) return true;
  return new Date() >= this.nextTrigger;
};

// Method to build search query for matching jobs
jobAlertSchema.methods.buildJobQuery = function() {
  const query = {};
  
  // Keywords search
  if (this.keywords && this.keywords.length > 0) {
    query.$text = { $search: this.keywords.join(' ') };
  }
  
  // Location
  if (this.location) {
    const locationQuery = {};
    if (this.location.city) locationQuery['location.city'] = new RegExp(this.location.city, 'i');
    if (this.location.state) locationQuery['location.state'] = new RegExp(this.location.state, 'i');
    if (this.location.remote) locationQuery['workType'] = 'remote';
    if (Object.keys(locationQuery).length > 0) {
      query.$and = query.$and || [];
      query.$and.push({ $or: [locationQuery, { 'workType': 'remote' }] });
    }
  }
  
  // Job type
  if (this.jobType && this.jobType.length > 0) {
    query.jobType = { $in: this.jobType };
  }
  
  // Experience level
  if (this.experienceLevel && this.experienceLevel.length > 0) {
    query.experienceLevel = { $in: this.experienceLevel };
  }
  
  // Salary range
  if (this.salaryRange && (this.salaryRange.min || this.salaryRange.max)) {
    query['salary.amount'] = {};
    if (this.salaryRange.min) query['salary.amount'].$gte = this.salaryRange.min;
    if (this.salaryRange.max) query['salary.amount'].$lte = this.salaryRange.max;
  }
  
  // Only active jobs
  query.status = 'active';
  query.applicationDeadline = { $gte: new Date() };
  
  return query;
};

export default mongoose.model('JobAlert', jobAlertSchema);
