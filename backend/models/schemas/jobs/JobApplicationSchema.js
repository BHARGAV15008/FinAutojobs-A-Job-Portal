/**
 * Job Application Schema
 * 
 * Schema for managing job applications with comprehensive tracking
 * of application status, interview process, and candidate evaluation.
 * 
 * @author FinAutoJobs Team
 * @version 1.0.0
 */

import mongoose from 'mongoose';

const JobApplicationSchema = new mongoose.Schema({
  // Basic Application Information
  applicationId: {
    type: String,
    unique: true,
    required: true,
    index: true
  },
  
  // Job & Applicant References
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
    }
  },
  
  applicant: {
    applicantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Applicant ID is required'],
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
    currentLocation: {
      type: String,
      trim: true
    }
  },
  
  recruiter: {
    recruiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
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
    }
  },
  
  // Application Status & Stage
  status: {
    type: String,
    enum: [
      'submitted', 'under_review', 'shortlisted', 'rejected',
      'interview_scheduled', 'interview_completed', 'on_hold',
      'offer_extended', 'offer_accepted', 'offer_rejected',
      'hired', 'withdrawn', 'expired'
    ],
    default: 'submitted',
    index: true
  },
  
  stage: {
    type: String,
    enum: [
      'application_review', 'phone_screening', 'technical_assessment',
      'first_interview', 'second_interview', 'final_interview',
      'reference_check', 'background_check', 'offer_negotiation',
      'onboarding', 'completed'
    ],
    default: 'application_review',
    index: true
  },
  
  // Application Documents
  documents: {
    resume: {
      url: {
        type: String,
        required: [true, 'Resume is required']
      },
      filename: {
        type: String,
        required: true
      },
      size: Number,
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    },
    coverLetter: {
      url: String,
      filename: String,
      size: Number,
      uploadedAt: Date
    },
    portfolio: {
      url: String,
      filename: String,
      size: Number,
      uploadedAt: Date
    },
    additionalDocuments: [{
      name: {
        type: String,
        required: true
      },
      url: {
        type: String,
        required: true
      },
      filename: String,
      size: Number,
      type: {
        type: String,
        enum: ['certificate', 'transcript', 'recommendation', 'other']
      },
      uploadedAt: {
        type: Date,
        default: Date.now
      }
    }]
  },
  
  // Application Responses
  responses: {
    coverLetterText: {
      type: String,
      trim: true,
      maxlength: [2000, 'Cover letter cannot exceed 2000 characters']
    },
    
    screeningQuestions: [{
      questionId: {
        type: String,
        required: true
      },
      question: {
        type: String,
        required: true
      },
      answer: {
        type: String,
        required: true,
        trim: true
      },
      type: {
        type: String,
        enum: ['text', 'multiple_choice', 'yes_no', 'number', 'date']
      }
    }],
    
    additionalInfo: {
      type: String,
      trim: true,
      maxlength: [1000, 'Additional information cannot exceed 1000 characters']
    },
    
    salaryExpectation: {
      amount: Number,
      currency: {
        type: String,
        default: 'INR'
      },
      period: {
        type: String,
        enum: ['hourly', 'monthly', 'yearly'],
        default: 'yearly'
      },
      isNegotiable: {
        type: Boolean,
        default: true
      }
    },
    
    noticePeriod: {
      type: String,
      enum: ['immediate', '15_days', '1_month', '2_months', '3_months', 'custom'],
      default: '1_month'
    },
    
    customNoticePeriod: {
      type: String,
      trim: true
    },
    
    willingToRelocate: {
      type: Boolean,
      default: false
    },
    
    preferredStartDate: Date
  },
  
  // Evaluation & Scoring
  evaluation: {
    overallScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    
    criteria: [{
      name: {
        type: String,
        required: true,
        trim: true
      },
      score: {
        type: Number,
        min: 0,
        max: 10,
        required: true
      },
      weight: {
        type: Number,
        min: 0,
        max: 1,
        default: 1
      },
      comments: {
        type: String,
        trim: true
      }
    }],
    
    skillsMatch: {
      percentage: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
      },
      matchedSkills: [{
        skill: String,
        required: Boolean,
        hasSkill: Boolean,
        level: String
      }],
      missingSkills: [{
        skill: String,
        required: Boolean,
        level: String
      }]
    },
    
    experienceMatch: {
      percentage: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
      },
      candidateExperience: {
        years: Number,
        months: Number
      },
      requiredExperience: {
        years: Number,
        months: Number
      }
    },
    
    educationMatch: {
      percentage: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
      },
      meetsRequirements: Boolean,
      details: String
    }
  },
  
  // Interview Process
  interviews: [{
    interviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Interview'
    },
    type: {
      type: String,
      enum: ['phone', 'video', 'in_person', 'technical', 'behavioral', 'panel'],
      required: true
    },
    round: {
      type: Number,
      required: true,
      min: 1
    },
    scheduledAt: {
      type: Date,
      required: true
    },
    duration: {
      type: Number,
      default: 60 // minutes
    },
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled', 'rescheduled', 'no_show'],
      default: 'scheduled'
    },
    interviewers: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      name: String,
      role: String,
      email: String
    }],
    location: {
      type: String,
      trim: true
    },
    meetingLink: {
      type: String,
      trim: true
    },
    notes: {
      type: String,
      trim: true
    },
    feedback: {
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      comments: String,
      recommendation: {
        type: String,
        enum: ['strong_hire', 'hire', 'no_hire', 'strong_no_hire']
      },
      strengths: [{
        type: String,
        trim: true
      }],
      concerns: [{
        type: String,
        trim: true
      }]
    },
    completedAt: Date,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Communication History
  communications: [{
    type: {
      type: String,
      enum: ['email', 'phone', 'sms', 'message', 'note'],
      required: true
    },
    direction: {
      type: String,
      enum: ['inbound', 'outbound'],
      required: true
    },
    subject: {
      type: String,
      trim: true
    },
    content: {
      type: String,
      required: true,
      trim: true
    },
    from: {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      name: String,
      email: String
    },
    to: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      name: String,
      email: String
    }],
    status: {
      type: String,
      enum: ['sent', 'delivered', 'read', 'failed'],
      default: 'sent'
    },
    isInternal: {
      type: Boolean,
      default: false
    },
    attachments: [{
      name: String,
      url: String,
      size: Number
    }],
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Status History & Timeline
  statusHistory: [{
    status: {
      type: String,
      required: true
    },
    stage: String,
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
  
  // Rejection Information
  rejection: {
    reason: {
      type: String,
      enum: [
        'qualifications', 'experience', 'skills', 'cultural_fit',
        'salary_expectations', 'location', 'availability',
        'interview_performance', 'reference_check', 'other'
      ]
    },
    feedback: {
      type: String,
      trim: true
    },
    rejectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rejectedAt: Date,
    isReversible: {
      type: Boolean,
      default: false
    }
  },
  
  // Offer Information
  offer: {
    offerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'JobOffer'
    },
    salary: {
      base: Number,
      currency: String,
      period: String
    },
    benefits: [{
      type: String
    }],
    startDate: Date,
    expiresAt: Date,
    extendedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    extendedAt: Date,
    respondedAt: Date,
    response: {
      type: String,
      enum: ['accepted', 'rejected', 'negotiating']
    },
    negotiationNotes: {
      type: String,
      trim: true
    }
  },
  
  // Analytics & Metrics
  metrics: {
    timeToReview: Number, // hours
    timeToFirstInterview: Number, // hours
    timeToHire: Number, // hours
    totalInterviews: {
      type: Number,
      default: 0
    },
    responseTime: Number, // hours
    engagementScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    }
  },
  
  // Source & Attribution
  source: {
    channel: {
      type: String,
      enum: [
        'direct', 'job_board', 'company_website', 'referral',
        'social_media', 'recruiter', 'agency', 'campus', 'other'
      ],
      default: 'direct'
    },
    medium: {
      type: String,
      trim: true
    },
    campaign: {
      type: String,
      trim: true
    },
    referrer: {
      type: String,
      trim: true
    },
    referralCode: {
      type: String,
      trim: true
    }
  },
  
  // Privacy & Consent
  consent: {
    dataProcessing: {
      type: Boolean,
      required: true,
      default: false
    },
    marketing: {
      type: Boolean,
      default: false
    },
    backgroundCheck: {
      type: Boolean,
      default: false
    },
    consentDate: {
      type: Date,
      default: Date.now
    }
  },
  
  // Internal Notes & Tags
  internalNotes: [{
    note: {
      type: String,
      required: true,
      trim: true
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    },
    type: {
      type: String,
      enum: ['general', 'urgent', 'follow_up', 'concern'],
      default: 'general'
    },
    isPrivate: {
      type: Boolean,
      default: true
    }
  }],
  
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  
  // Application Dates
  submittedAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  reviewedAt: Date,
  
  lastActivityAt: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  expiresAt: {
    type: Date,
    index: true
  }
}, {
  timestamps: true,
  versionKey: false,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
JobApplicationSchema.index({ applicationId: 1 });
JobApplicationSchema.index({ 'job.jobId': 1, status: 1 });
JobApplicationSchema.index({ 'applicant.applicantId': 1, status: 1 });
JobApplicationSchema.index({ 'recruiter.recruiterId': 1, status: 1 });
JobApplicationSchema.index({ status: 1, stage: 1 });
JobApplicationSchema.index({ submittedAt: -1 });
JobApplicationSchema.index({ lastActivityAt: -1 });
JobApplicationSchema.index({ 'source.channel': 1 });
JobApplicationSchema.index({ 'evaluation.overallScore': -1 });

// Compound indexes
JobApplicationSchema.index({ 'job.jobId': 1, 'applicant.applicantId': 1 }, { unique: true });
JobApplicationSchema.index({ status: 1, submittedAt: -1 });
JobApplicationSchema.index({ 'recruiter.recruiterId': 1, status: 1, submittedAt: -1 });

// Virtual for application age in days
JobApplicationSchema.virtual('applicationAge').get(function() {
  const now = new Date();
  const submitted = new Date(this.submittedAt);
  const diffTime = Math.abs(now - submitted);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for current interview round
JobApplicationSchema.virtual('currentInterviewRound').get(function() {
  if (!this.interviews || this.interviews.length === 0) return 0;
  return Math.max(...this.interviews.map(interview => interview.round));
});

// Virtual for overall interview rating
JobApplicationSchema.virtual('averageInterviewRating').get(function() {
  if (!this.interviews || this.interviews.length === 0) return null;
  
  const completedInterviews = this.interviews.filter(
    interview => interview.status === 'completed' && interview.feedback && interview.feedback.rating
  );
  
  if (completedInterviews.length === 0) return null;
  
  const totalRating = completedInterviews.reduce(
    (sum, interview) => sum + interview.feedback.rating, 0
  );
  
  return (totalRating / completedInterviews.length).toFixed(2);
});

// Pre-save middleware
JobApplicationSchema.pre('save', function(next) {
  // Generate application ID if not exists
  if (!this.applicationId) {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    this.applicationId = `APP-${timestamp}-${random}`.toUpperCase();
  }
  
  // Update last activity
  this.lastActivityAt = new Date();
  
  // Calculate overall evaluation score
  if (this.evaluation && this.evaluation.criteria && this.evaluation.criteria.length > 0) {
    let weightedSum = 0;
    let totalWeight = 0;
    
    this.evaluation.criteria.forEach(criterion => {
      weightedSum += criterion.score * criterion.weight;
      totalWeight += criterion.weight;
    });
    
    this.evaluation.overallScore = totalWeight > 0 ? (weightedSum / totalWeight) * 10 : 0;
  }
  
  // Update metrics
  if (this.isModified('statusHistory')) {
    const submitted = new Date(this.submittedAt);
    const now = new Date();
    
    // Time to review
    const reviewEntry = this.statusHistory.find(entry => entry.status === 'under_review');
    if (reviewEntry) {
      this.metrics.timeToReview = (new Date(reviewEntry.timestamp) - submitted) / (1000 * 60 * 60);
    }
    
    // Time to first interview
    const interviewEntry = this.statusHistory.find(entry => entry.status === 'interview_scheduled');
    if (interviewEntry) {
      this.metrics.timeToFirstInterview = (new Date(interviewEntry.timestamp) - submitted) / (1000 * 60 * 60);
    }
    
    // Time to hire
    const hiredEntry = this.statusHistory.find(entry => entry.status === 'hired');
    if (hiredEntry) {
      this.metrics.timeToHire = (new Date(hiredEntry.timestamp) - submitted) / (1000 * 60 * 60);
    }
  }
  
  // Update interview count
  if (this.interviews) {
    this.metrics.totalInterviews = this.interviews.length;
  }
  
  next();
});

// Instance methods
JobApplicationSchema.methods.updateStatus = function(newStatus, changedBy, reason = '', notes = '') {
  const oldStatus = this.status;
  this.status = newStatus;
  
  this.statusHistory.push({
    status: newStatus,
    stage: this.stage,
    changedBy,
    reason,
    notes,
    timestamp: new Date()
  });
  
  return this.save();
};

JobApplicationSchema.methods.addInterview = function(interviewData) {
  this.interviews.push({
    ...interviewData,
    createdAt: new Date()
  });
  
  if (this.status !== 'interview_scheduled') {
    this.status = 'interview_scheduled';
  }
  
  return this.save();
};

JobApplicationSchema.methods.addCommunication = function(communicationData) {
  this.communications.push({
    ...communicationData,
    timestamp: new Date()
  });
  
  return this.save();
};

JobApplicationSchema.methods.addInternalNote = function(note, addedBy, type = 'general', isPrivate = true) {
  this.internalNotes.push({
    note,
    addedBy,
    type,
    isPrivate,
    addedAt: new Date()
  });
  
  return this.save();
};

JobApplicationSchema.methods.reject = function(reason, feedback, rejectedBy) {
  this.status = 'rejected';
  this.rejection = {
    reason,
    feedback,
    rejectedBy,
    rejectedAt: new Date()
  };
  
  this.statusHistory.push({
    status: 'rejected',
    stage: this.stage,
    changedBy: rejectedBy,
    reason,
    notes: feedback,
    timestamp: new Date()
  });
  
  return this.save();
};

JobApplicationSchema.methods.calculateSkillsMatch = function(jobSkills) {
  if (!jobSkills || jobSkills.length === 0) return 0;
  
  // This would typically compare with applicant's skills from their profile
  // For now, returning a placeholder calculation
  return Math.floor(Math.random() * 100);
};

export default JobApplicationSchema;
