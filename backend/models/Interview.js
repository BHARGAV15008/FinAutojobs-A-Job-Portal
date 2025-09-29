import mongoose from 'mongoose';

const interviewSchema = new mongoose.Schema({
  // Basic interview information
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BaseUser',
    required: true
  },
  recruiterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BaseUser',
    required: true
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  applicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
    required: true
  },
  
  // Interview details
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  
  // Scheduling
  scheduledDate: {
    type: Date,
    required: true
  },
  scheduledTime: {
    type: String,
    required: true
  },
  duration: {
    type: Number, // in minutes
    default: 60
  },
  timezone: {
    type: String,
    default: 'UTC'
  },
  
  // Interview type and location
  type: {
    type: String,
    enum: ['video', 'phone', 'in-person', 'online'],
    default: 'video'
  },
  location: {
    type: String,
    trim: true
  },
  meetingLink: {
    type: String,
    trim: true
  },
  
  // Status tracking
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'in-progress', 'completed', 'cancelled', 'rescheduled', 'no-show'],
    default: 'scheduled'
  },
  
  // Interview rounds
  round: {
    type: Number,
    default: 1
  },
  interviewType: {
    type: String,
    enum: ['screening', 'technical', 'behavioral', 'final', 'hr', 'panel'],
    default: 'screening'
  },
  
  // Participants
  interviewers: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BaseUser'
    },
    name: String,
    role: String,
    email: String
  }],
  
  // Feedback and evaluation
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comments: String,
    strengths: [String],
    weaknesses: [String],
    recommendation: {
      type: String,
      enum: ['hire', 'reject', 'next-round', 'hold'],
    },
    technicalSkills: {
      type: Number,
      min: 1,
      max: 5
    },
    communication: {
      type: Number,
      min: 1,
      max: 5
    },
    problemSolving: {
      type: Number,
      min: 1,
      max: 5
    },
    culturalFit: {
      type: Number,
      min: 1,
      max: 5
    }
  },
  
  // Additional information
  notes: String,
  attachments: [{
    fileName: String,
    fileUrl: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Reminders
  reminderSent: {
    type: Boolean,
    default: false
  },
  reminderSentAt: Date,
  
  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BaseUser',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BaseUser'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
interviewSchema.index({ candidateId: 1, recruiterId: 1 });
interviewSchema.index({ jobId: 1 });
interviewSchema.index({ scheduledDate: 1 });
interviewSchema.index({ status: 1 });
interviewSchema.index({ createdAt: -1 });

// Virtual for candidate details
interviewSchema.virtual('candidateDetails', {
  ref: 'BaseUser',
  localField: 'candidateId',
  foreignField: '_id',
  justOne: true
});

// Virtual for recruiter details
interviewSchema.virtual('recruiterDetails', {
  ref: 'BaseUser',
  localField: 'recruiterId',
  foreignField: '_id',
  justOne: true
});

// Virtual for job details
interviewSchema.virtual('jobDetails', {
  ref: 'Job',
  localField: 'jobId',
  foreignField: '_id',
  justOne: true
});

// Virtual for application details
interviewSchema.virtual('applicationDetails', {
  ref: 'Application',
  localField: 'applicationId',
  foreignField: '_id',
  justOne: true
});

// Methods
interviewSchema.methods.isUpcoming = function() {
  return new Date(this.scheduledDate) > new Date();
};

interviewSchema.methods.isPast = function() {
  return new Date(this.scheduledDate) < new Date();
};

interviewSchema.methods.canBeRescheduled = function() {
  return ['scheduled', 'confirmed'].includes(this.status);
};

interviewSchema.methods.canBeCancelled = function() {
  return ['scheduled', 'confirmed', 'rescheduled'].includes(this.status);
};

// Static methods
interviewSchema.statics.getUpcomingInterviews = function(userId, userRole) {
  const query = userRole === 'recruiter' 
    ? { recruiterId: userId }
    : { candidateId: userId };
  
  return this.find({
    ...query,
    scheduledDate: { $gte: new Date() },
    status: { $in: ['scheduled', 'confirmed'] }
  }).populate('candidateDetails recruiterDetails jobDetails applicationDetails');
};

interviewSchema.statics.getInterviewsByStatus = function(userId, userRole, status) {
  const query = userRole === 'recruiter' 
    ? { recruiterId: userId }
    : { candidateId: userId };
  
  return this.find({
    ...query,
    status: status
  }).populate('candidateDetails recruiterDetails jobDetails applicationDetails');
};

const Interview = mongoose.model('Interview', interviewSchema);

export default Interview;
