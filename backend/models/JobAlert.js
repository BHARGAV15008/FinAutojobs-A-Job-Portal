import mongoose from 'mongoose';

const jobAlertSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  keywords: [{
    type: String,
    trim: true
  }],
  location: {
    type: String,
    trim: true
  },
  salaryRange: {
    min: Number,
    max: Number,
    period: {
      type: String,
      enum: ['hourly', 'monthly', 'yearly'],
      default: 'yearly'
    }
  },
  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    default: 'daily'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastNotified: {
    type: Date,
    default: Date.now
  },
  matchingJobsCount: {
    type: Number,
    default: 0
  },
  notificationsSent: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for efficient queries
jobAlertSchema.index({ userId: 1, isActive: 1 });
jobAlertSchema.index({ keywords: 1 });
jobAlertSchema.index({ location: 1 });

const JobAlert = mongoose.model('JobAlert', jobAlertSchema);

export default JobAlert;
