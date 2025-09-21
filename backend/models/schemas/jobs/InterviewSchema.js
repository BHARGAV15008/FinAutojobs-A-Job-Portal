/**
 * Interview Schema
 * 
 * Comprehensive schema for managing interviews with scheduling,
 * feedback, evaluation, and communication tracking.
 * 
 * @author FinAutoJobs Team
 * @version 1.0.0
 */

import mongoose from 'mongoose';

const InterviewSchema = new mongoose.Schema({
  // Interview Identification
  interviewId: {
    type: String,
    unique: true,
    required: true,
    index: true
  },
  
  // Related Resources
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
    }
  },
  
  application: {
    applicationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'JobApplication',
      required: [true, 'Application ID is required'],
      index: true
    }
  },
  
  candidate: {
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Candidate ID is required'],
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true
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
    timezone: {
      type: String,
      default: 'Asia/Kolkata'
    }
  },
  
  // Interview Details
  interview: {
    type: {
      type: String,
      required: [true, 'Interview type is required'],
      enum: [
        'phone_screening', 'video_call', 'in_person', 'technical_assessment',
        'behavioral', 'panel', 'group', 'presentation', 'case_study',
        'coding_challenge', 'system_design', 'cultural_fit', 'final_round'
      ],
      index: true
    },
    
    round: {
      type: Number,
      required: [true, 'Interview round is required'],
      min: 1,
      max: 10,
      index: true
    },
    
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: [100, 'Interview title cannot exceed 100 characters']
    },
    
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Interview description cannot exceed 1000 characters']
    },
    
    objectives: [{
      type: String,
      trim: true,
      maxlength: [200, 'Objective cannot exceed 200 characters']
    }],
    
    skillsToAssess: [{
      skill: {
        type: String,
        required: true,
        trim: true
      },
      weight: {
        type: Number,
        min: 1,
        max: 10,
        default: 5
      },
      isRequired: {
        type: Boolean,
        default: true
      }
    }],
    
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard', 'expert'],
      default: 'medium'
    }
  },
  
  // Scheduling Information
  scheduling: {
    scheduledAt: {
      type: Date,
      required: [true, 'Scheduled time is required'],
      index: true
    },
    
    duration: {
      type: Number,
      required: [true, 'Duration is required'],
      min: 15,
      max: 480, // 8 hours max
      default: 60 // minutes
    },
    
    endTime: {
      type: Date,
      index: true
    },
    
    timezone: {
      type: String,
      required: true,
      default: 'Asia/Kolkata'
    },
    
    bufferTime: {
      before: {
        type: Number,
        default: 15, // minutes
        min: 0
      },
      after: {
        type: Number,
        default: 15, // minutes
        min: 0
      }
    },
    
    isFlexible: {
      type: Boolean,
      default: false
    },
    
    alternativeSlots: [{
      startTime: {
        type: Date,
        required: true
      },
      endTime: {
        type: Date,
        required: true
      },
      preference: {
        type: Number,
        min: 1,
        max: 5,
        default: 3
      }
    }]
  },
  
  // Location & Meeting Details
  location: {
    type: {
      type: String,
      required: [true, 'Location type is required'],
      enum: ['in_person', 'video_call', 'phone_call', 'hybrid'],
      default: 'video_call'
    },
    
    // For in-person interviews
    venue: {
      name: {
        type: String,
        trim: true
      },
      address: {
        street: String,
        city: String,
        state: String,
        country: String,
        pincode: String
      },
      room: {
        type: String,
        trim: true
      },
      floor: {
        type: String,
        trim: true
      },
      instructions: {
        type: String,
        trim: true,
        maxlength: [500, 'Instructions cannot exceed 500 characters']
      }
    },
    
    // For video/phone calls
    meeting: {
      platform: {
        type: String,
        enum: ['zoom', 'google_meet', 'microsoft_teams', 'skype', 'phone', 'other'],
        default: 'zoom'
      },
      meetingId: {
        type: String,
        trim: true
      },
      meetingUrl: {
        type: String,
        trim: true,
        match: [/^https?:\/\/.*/, 'Please enter a valid meeting URL']
      },
      passcode: {
        type: String,
        trim: true,
        select: false
      },
      dialInNumber: {
        type: String,
        trim: true
      },
      accessCode: {
        type: String,
        trim: true,
        select: false
      }
    }
  },
  
  // Interviewers
  interviewers: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    role: {
      type: String,
      required: true,
      trim: true
    },
    department: {
      type: String,
      trim: true
    },
    isPrimary: {
      type: Boolean,
      default: false
    },
    responsibilities: [{
      type: String,
      enum: [
        'technical_assessment', 'behavioral_assessment', 'cultural_fit',
        'experience_review', 'skill_evaluation', 'decision_maker',
        'note_taker', 'timekeeper', 'observer'
      ]
    }],
    availability: {
      confirmed: {
        type: Boolean,
        default: false
      },
      confirmedAt: Date,
      alternativeSlots: [{
        startTime: Date,
        endTime: Date
      }]
    }
  }],
  
  // Interview Status & Workflow
  status: {
    type: String,
    required: true,
    enum: [
      'scheduled', 'confirmed', 'in_progress', 'completed',
      'cancelled', 'rescheduled', 'no_show_candidate',
      'no_show_interviewer', 'technical_issues', 'postponed'
    ],
    default: 'scheduled',
    index: true
  },
  
  statusHistory: [{
    status: {
      type: String,
      required: true
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    reason: {
      type: String,
      trim: true
    },
    notes: {
      type: String,
      trim: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Preparation & Materials
  preparation: {
    candidateInstructions: {
      type: String,
      trim: true,
      maxlength: [2000, 'Instructions cannot exceed 2000 characters']
    },
    
    documentsRequired: [{
      name: {
        type: String,
        required: true,
        trim: true
      },
      description: {
        type: String,
        trim: true
      },
      isRequired: {
        type: Boolean,
        default: true
      }
    }],
    
    technicalRequirements: [{
      requirement: {
        type: String,
        required: true,
        trim: true
      },
      description: {
        type: String,
        trim: true
      }
    }],
    
    assessmentMaterials: [{
      name: {
        type: String,
        required: true,
        trim: true
      },
      type: {
        type: String,
        enum: ['document', 'link', 'code', 'presentation', 'other'],
        required: true
      },
      url: {
        type: String,
        trim: true
      },
      content: {
        type: String,
        trim: true
      },
      isConfidential: {
        type: Boolean,
        default: false
      }
    }],
    
    interviewerNotes: [{
      interviewerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      notes: {
        type: String,
        required: true,
        trim: true
      },
      isPrivate: {
        type: Boolean,
        default: true
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  
  // Interview Execution
  execution: {
    actualStartTime: Date,
    actualEndTime: Date,
    actualDuration: Number, // minutes
    
    attendees: {
      candidate: {
        attended: {
          type: Boolean,
          default: false
        },
        joinedAt: Date,
        leftAt: Date,
        connectionIssues: [{
          issue: String,
          timestamp: Date,
          resolved: Boolean
        }]
      },
      
      interviewers: [{
        interviewerId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true
        },
        attended: {
          type: Boolean,
          default: false
        },
        joinedAt: Date,
        leftAt: Date,
        role: String
      }]
    },
    
    technicalIssues: [{
      issue: {
        type: String,
        required: true,
        trim: true
      },
      severity: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium'
      },
      timestamp: {
        type: Date,
        default: Date.now
      },
      resolved: {
        type: Boolean,
        default: false
      },
      resolution: {
        type: String,
        trim: true
      }
    }],
    
    recording: {
      isRecorded: {
        type: Boolean,
        default: false
      },
      recordingUrl: {
        type: String,
        trim: true,
        select: false
      },
      consentGiven: {
        type: Boolean,
        default: false
      },
      retentionPeriod: {
        type: Number,
        default: 90 // days
      }
    }
  },
  
  // Evaluation & Feedback
  evaluation: {
    overallRating: {
      type: Number,
      min: 1,
      max: 5
    },
    
    recommendation: {
      type: String,
      enum: ['strong_hire', 'hire', 'maybe', 'no_hire', 'strong_no_hire']
    },
    
    skillAssessments: [{
      skill: {
        type: String,
        required: true,
        trim: true
      },
      rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
      },
      notes: {
        type: String,
        trim: true
      },
      assessedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    }],
    
    strengths: [{
      type: String,
      trim: true,
      maxlength: [200, 'Strength cannot exceed 200 characters']
    }],
    
    weaknesses: [{
      type: String,
      trim: true,
      maxlength: [200, 'Weakness cannot exceed 200 characters']
    }],
    
    concerns: [{
      type: String,
      trim: true,
      maxlength: [200, 'Concern cannot exceed 200 characters']
    }],
    
    detailedFeedback: {
      type: String,
      trim: true,
      maxlength: [2000, 'Detailed feedback cannot exceed 2000 characters']
    },
    
    nextSteps: {
      type: String,
      trim: true,
      maxlength: [500, 'Next steps cannot exceed 500 characters']
    },
    
    interviewerFeedback: [{
      interviewerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      recommendation: {
        type: String,
        enum: ['strong_hire', 'hire', 'maybe', 'no_hire', 'strong_no_hire']
      },
      feedback: {
        type: String,
        required: true,
        trim: true
      },
      isConfidential: {
        type: Boolean,
        default: false
      },
      submittedAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  
  // Communication & Notifications
  communications: [{
    type: {
      type: String,
      enum: ['invitation', 'reminder', 'confirmation', 'rescheduling', 'cancellation', 'follow_up'],
      required: true
    },
    
    recipient: {
      type: String,
      enum: ['candidate', 'interviewer', 'all'],
      required: true
    },
    
    channel: {
      type: String,
      enum: ['email', 'sms', 'phone', 'in_app'],
      required: true
    },
    
    subject: {
      type: String,
      trim: true
    },
    
    message: {
      type: String,
      required: true,
      trim: true
    },
    
    sentAt: {
      type: Date,
      default: Date.now
    },
    
    sentBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    
    deliveryStatus: {
      type: String,
      enum: ['sent', 'delivered', 'failed', 'bounced'],
      default: 'sent'
    }
  }],
  
  // Reminders & Notifications
  reminders: [{
    type: {
      type: String,
      enum: ['interview_reminder', 'preparation_reminder', 'feedback_reminder'],
      required: true
    },
    
    scheduledFor: {
      type: Date,
      required: true
    },
    
    recipients: [{
      type: String,
      enum: ['candidate', 'interviewer', 'recruiter']
    }],
    
    isSent: {
      type: Boolean,
      default: false
    },
    
    sentAt: Date
  }]
}, {
  timestamps: true,
  versionKey: false,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
InterviewSchema.index({ interviewId: 1 });
InterviewSchema.index({ 'job.jobId': 1, 'interview.round': 1 });
InterviewSchema.index({ 'application.applicationId': 1 });
InterviewSchema.index({ 'candidate.candidateId': 1, 'scheduling.scheduledAt': 1 });
InterviewSchema.index({ 'interviewers.userId': 1, 'scheduling.scheduledAt': 1 });
InterviewSchema.index({ status: 1, 'scheduling.scheduledAt': 1 });
InterviewSchema.index({ 'scheduling.scheduledAt': 1 });
InterviewSchema.index({ 'interview.type': 1, 'interview.round': 1 });

// Virtual for interview duration in hours
InterviewSchema.virtual('durationInHours').get(function() {
  return this.scheduling.duration / 60;
});

// Virtual for time until interview
InterviewSchema.virtual('timeUntilInterview').get(function() {
  const now = new Date();
  const scheduled = new Date(this.scheduling.scheduledAt);
  const diffTime = scheduled - now;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // days
});

// Virtual for average interviewer rating
InterviewSchema.virtual('averageInterviewerRating').get(function() {
  if (!this.evaluation.interviewerFeedback || this.evaluation.interviewerFeedback.length === 0) {
    return null;
  }
  
  const ratings = this.evaluation.interviewerFeedback
    .filter(feedback => feedback.rating)
    .map(feedback => feedback.rating);
  
  if (ratings.length === 0) return null;
  
  const sum = ratings.reduce((acc, rating) => acc + rating, 0);
  return (sum / ratings.length).toFixed(2);
});

// Pre-save middleware
InterviewSchema.pre('save', function(next) {
  // Generate interview ID if not exists
  if (!this.interviewId) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    this.interviewId = `INT-${timestamp}-${random}`.toUpperCase();
  }
  
  // Calculate end time based on start time and duration
  if (this.scheduling.scheduledAt && this.scheduling.duration) {
    this.scheduling.endTime = new Date(
      this.scheduling.scheduledAt.getTime() + (this.scheduling.duration * 60 * 1000)
    );
  }
  
  // Calculate actual duration if both start and end times are available
  if (this.execution.actualStartTime && this.execution.actualEndTime) {
    const diffMs = this.execution.actualEndTime - this.execution.actualStartTime;
    this.execution.actualDuration = Math.round(diffMs / (1000 * 60)); // minutes
  }
  
  next();
});

// Instance methods
InterviewSchema.methods.updateStatus = function(newStatus, changedBy, reason = '', notes = '') {
  const oldStatus = this.status;
  this.status = newStatus;
  
  this.statusHistory.push({
    status: newStatus,
    changedBy,
    reason,
    notes,
    timestamp: new Date()
  });
  
  return this.save();
};

InterviewSchema.methods.reschedule = function(newDateTime, changedBy, reason = '') {
  this.scheduling.scheduledAt = newDateTime;
  this.scheduling.endTime = new Date(
    newDateTime.getTime() + (this.scheduling.duration * 60 * 1000)
  );
  
  this.updateStatus('rescheduled', changedBy, reason);
  
  return this.save();
};

InterviewSchema.methods.addInterviewerFeedback = function(interviewerId, rating, recommendation, feedback, isConfidential = false) {
  this.evaluation.interviewerFeedback.push({
    interviewerId,
    rating,
    recommendation,
    feedback,
    isConfidential,
    submittedAt: new Date()
  });
  
  // Update overall rating (average of all interviewer ratings)
  const ratings = this.evaluation.interviewerFeedback
    .filter(fb => fb.rating)
    .map(fb => fb.rating);
  
  if (ratings.length > 0) {
    this.evaluation.overallRating = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
  }
  
  return this.save();
};

InterviewSchema.methods.markAsCompleted = function(actualStartTime, actualEndTime) {
  this.status = 'completed';
  this.execution.actualStartTime = actualStartTime;
  this.execution.actualEndTime = actualEndTime;
  
  const diffMs = actualEndTime - actualStartTime;
  this.execution.actualDuration = Math.round(diffMs / (1000 * 60));
  
  return this.save();
};

InterviewSchema.methods.addCommunication = function(type, recipient, channel, message, subject = null) {
  this.communications.push({
    type,
    recipient,
    channel,
    subject,
    message,
    sentAt: new Date()
  });
  
  return this.save();
};

InterviewSchema.methods.addReminder = function(type, scheduledFor, recipients) {
  this.reminders.push({
    type,
    scheduledFor,
    recipients
  });
  
  return this.save();
};

// Static methods
InterviewSchema.statics.getUpcomingInterviews = function(userId, role = 'candidate', days = 7) {
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + days);
  
  const matchCondition = {
    'scheduling.scheduledAt': { $gte: startDate, $lte: endDate },
    status: { $in: ['scheduled', 'confirmed'] }
  };
  
  if (role === 'candidate') {
    matchCondition['candidate.candidateId'] = new mongoose.Types.ObjectId(userId);
  } else if (role === 'interviewer') {
    matchCondition['interviewers.userId'] = new mongoose.Types.ObjectId(userId);
  }
  
  return this.find(matchCondition)
    .sort({ 'scheduling.scheduledAt': 1 })
    .populate('job.jobId', 'title company')
    .populate('candidate.candidateId', 'firstName lastName email')
    .populate('interviewers.userId', 'firstName lastName email');
};

InterviewSchema.statics.getInterviewStats = function(dateRange = 30) {
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
        _id: '$status',
        count: { $sum: 1 },
        avgRating: { $avg: '$evaluation.overallRating' }
      }
    },
    {
      $sort: { count: -1 }
    }
  ]);
};

export default InterviewSchema;
