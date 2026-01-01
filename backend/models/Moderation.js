import mongoose from 'mongoose';

const moderationSchema = new mongoose.Schema({
  // Reference to the content being moderated
  contentId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'contentType'
  },
  
  // Type of content (job, user, application, etc.)
  contentType: {
    type: String,
    required: true,
    enum: ['Job', 'BaseUser', 'Application', 'Review']
  },
  
  // Moderation status
  status: {
    type: String,
    enum: ['pending', 'under_review', 'approved', 'rejected', 'resolved'],
    default: 'pending'
  },
  
  // Priority level
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  // Reason for flagging
  flagReason: {
    type: String,
    required: true
  },
  
  // Additional details about the flag
  flagDetails: {
    type: String
  },
  
  // Who flagged this content
  flaggedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BaseUser'
  },
  
  // Admin who reviewed this
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BaseUser'
  },
  
  // Admin's decision reason
  reviewReason: {
    type: String
  },
  
  // When the content was flagged
  flaggedAt: {
    type: Date,
    default: Date.now
  },
  
  // When it was reviewed
  reviewedAt: {
    type: Date
  },
  
  // Automatic flags from system
  autoFlags: [{
    type: {
      type: String,
      enum: ['spam', 'inappropriate', 'duplicate', 'fake', 'policy_violation']
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1
    },
    details: String
  }],
  
  // User reports
  userReports: [{
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BaseUser'
    },
    reason: String,
    details: String,
    reportedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Content snapshot at time of flagging
  contentSnapshot: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
moderationSchema.index({ status: 1, priority: 1 });
moderationSchema.index({ contentType: 1, status: 1 });
moderationSchema.index({ flaggedAt: -1 });
moderationSchema.index({ contentId: 1, contentType: 1 });

// Virtual for getting content details
moderationSchema.virtual('content', {
  ref: function() {
    return this.contentType;
  },
  localField: 'contentId',
  foreignField: '_id',
  justOne: true
});

// Ensure virtual fields are serialized
moderationSchema.set('toJSON', { virtuals: true });
moderationSchema.set('toObject', { virtuals: true });

const Moderation = mongoose.model('Moderation', moderationSchema);

export default Moderation;
