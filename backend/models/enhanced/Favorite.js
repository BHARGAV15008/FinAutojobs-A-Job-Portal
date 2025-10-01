import mongoose from 'mongoose';

const favoriteSchema = new mongoose.Schema({
  // User reference
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BaseUser',
    required: true,
    index: true
  },
  
  // Job reference
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true,
    index: true
  },
  
  // Metadata
  notes: {
    type: String,
    maxlength: 500,
    trim: true
  },
  
  // Categorization
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  
  // Priority/Interest level
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  
  // Reminder settings
  reminderDate: Date,
  reminderSent: {
    type: Boolean,
    default: false
  },
  
  // Status
  status: {
    type: String,
    enum: ['active', 'applied', 'expired', 'removed'],
    default: 'active'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Compound indexes
favoriteSchema.index({ userId: 1, jobId: 1 }, { unique: true });
favoriteSchema.index({ userId: 1, status: 1 });
favoriteSchema.index({ userId: 1, priority: 1 });
favoriteSchema.index({ reminderDate: 1, reminderSent: 1 });

// Virtual for job details
favoriteSchema.virtual('jobDetails', {
  ref: 'Job',
  localField: 'jobId',
  foreignField: '_id',
  justOne: true
});

// Update status when job expires or user applies
favoriteSchema.methods.updateStatus = async function() {
  const job = await mongoose.model('Job').findById(this.jobId);
  if (job && job.status === 'closed') {
    this.status = 'expired';
    await this.save();
  }
};

export default mongoose.model('Favorite', favoriteSchema);
