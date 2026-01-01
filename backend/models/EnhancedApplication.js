import mongoose from 'mongoose';

// Enhanced Application Schema following comprehensive job portal data flow
const EnhancedApplicationSchema = new mongoose.Schema({
  // Core Identifiers
  applicationId: {
    type: String,
    unique: true,
    required: true,
    default: () => `APP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  },
  
  // Foreign Key References
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: [true, 'Job ID is required']
  },
  
  applicantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BaseUser',
    required: [true, 'Applicant ID is required']
  },
  
  recruiterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BaseUser',
    required: [true, 'Recruiter ID is required']
  },
  
  // Application Status Management
  applicationStatus: {
    type: String,
    enum: [
      'draft',           // Application started but not submitted
      'submitted',       // Application submitted successfully
      'under_review',    // HR/Recruiter reviewing application
      'screening',       // Initial screening phase
      'shortlisted',     // Passed initial screening
      'interview_scheduled', // Interview scheduled
      'interviewed',     // Interview completed
      'assessment',      // Technical/skill assessment phase
      'reference_check', // Reference verification
      'background_check', // Background verification
      'offer_pending',   // Offer being prepared
      'offer_extended',  // Offer sent to candidate
      'offer_accepted',  // Candidate accepted offer
      'offer_declined',  // Candidate declined offer
      'rejected',        // Application rejected
      'withdrawn',       // Candidate withdrew application
      'hired',          // Successfully hired
      'onboarding'      // In onboarding process
    ],
    default: 'submitted',
    index: true
  },
  
  // Application Priority & Urgency
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  // Timestamps
  applicationDate: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  submissionTimestamp: {
    type: Date,
    default: Date.now
  },
  
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  
  // Application Data & Form Responses
  applicationData: {
    // Basic Information (auto-filled from profile)
    personalInfo: {
      fullName: { type: String, required: true },
      email: { type: String, required: true },
      phone: { type: String, required: true },
      address: {
        street: String,
        city: String,
        state: String,
        country: String,
        zipCode: String
      },
      dateOfBirth: Date,
      nationality: String
    },
    
    // Professional Information
    professionalInfo: {
      currentJobTitle: String,
      currentCompany: String,
      totalExperience: Number, // in years
      relevantExperience: Number, // in years
      currentSalary: Number,
      expectedSalary: Number,
      noticePeriod: String,
      availabilityDate: Date,
      willingToRelocate: Boolean,
      preferredLocation: [String]
    },
    
    // Job-Specific Responses
    jobSpecificAnswers: [{
      questionId: String,
      question: String,
      answer: String,
      answerType: {
        type: String,
        enum: ['text', 'number', 'boolean', 'multiple_choice', 'file']
      }
    }],
    
    // Skills & Qualifications
    skills: {
      technical: [String],
      soft: [String],
      languages: [{
        language: String,
        proficiency: {
          type: String,
          enum: ['basic', 'intermediate', 'advanced', 'native']
        }
      }],
      certifications: [{
        name: String,
        issuingOrganization: String,
        issueDate: Date,
        expiryDate: Date,
        credentialId: String,
        verificationUrl: String
      }]
    },
    
    // Education
    education: [{
      degree: String,
      fieldOfStudy: String,
      institution: String,
      graduationYear: Number,
      gpa: Number,
      achievements: [String]
    }],
    
    // Work Experience
    workExperience: [{
      jobTitle: String,
      company: String,
      startDate: Date,
      endDate: Date,
      isCurrent: Boolean,
      description: String,
      achievements: [String],
      technologies: [String]
    }],
    
    // Additional Information
    additionalInfo: {
      coverLetter: String,
      whyInterested: String,
      careerGoals: String,
      additionalComments: String,
      referralSource: String,
      portfolioUrl: String,
      linkedinUrl: String,
      githubUrl: String
    }
  },
  
  // Document Management
  documents: {
    resume: {
      filename: String,
      originalName: String,
      fileUrl: String,
      fileSize: Number,
      mimeType: String,
      uploadedAt: Date,
      isVerified: Boolean,
      extractedText: String, // For keyword matching
      parsedData: mongoose.Schema.Types.Mixed // Parsed resume data
    },
    
    coverLetter: {
      filename: String,
      originalName: String,
      fileUrl: String,
      fileSize: Number,
      mimeType: String,
      uploadedAt: Date
    },
    
    portfolio: [{
      filename: String,
      originalName: String,
      fileUrl: String,
      fileSize: Number,
      mimeType: String,
      uploadedAt: Date,
      description: String
    }],
    
    additionalDocuments: [{
      filename: String,
      originalName: String,
      fileUrl: String,
      fileSize: Number,
      mimeType: String,
      uploadedAt: Date,
      documentType: String,
      description: String
    }]
  },
  
  // Automated Scoring & Matching
  aiScoring: {
    overallScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    
    skillsMatch: {
      score: { type: Number, min: 0, max: 100, default: 0 },
      matchedSkills: [String],
      missingSkills: [String]
    },
    
    experienceMatch: {
      score: { type: Number, min: 0, max: 100, default: 0 },
      yearsMatch: Boolean,
      relevantExperience: Boolean
    },
    
    educationMatch: {
      score: { type: Number, min: 0, max: 100, default: 0 },
      degreeMatch: Boolean,
      fieldMatch: Boolean
    },
    
    keywordAnalysis: {
      resumeKeywords: [String],
      jobKeywords: [String],
      matchedKeywords: [String],
      matchPercentage: Number
    },
    
    lastAnalyzed: Date
  },
  
  // Application Timeline & History
  timeline: [{
    status: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BaseUser'
    },
    action: String,
    note: String,
    systemGenerated: {
      type: Boolean,
      default: false
    },
    metadata: mongoose.Schema.Types.Mixed
  }],
  
  // Communication & Notes
  communications: [{
    type: {
      type: String,
      enum: ['email', 'phone', 'interview', 'message', 'system_notification']
    },
    direction: {
      type: String,
      enum: ['inbound', 'outbound']
    },
    subject: String,
    content: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BaseUser'
    },
    to: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BaseUser'
    }],
    attachments: [String],
    isRead: {
      type: Boolean,
      default: false
    }
  }],
  
  // Recruiter Notes & Feedback
  recruiterNotes: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BaseUser',
      required: true
    },
    content: {
      type: String,
      required: true
    },
    isPrivate: {
      type: Boolean,
      default: true
    },
    tags: [String],
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Interview Management
  interviews: [{
    interviewId: String,
    type: {
      type: String,
      enum: ['phone', 'video', 'in_person', 'technical', 'hr', 'final']
    },
    scheduledDate: Date,
    duration: Number, // in minutes
    interviewers: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'BaseUser'
    }],
    location: String,
    meetingLink: String,
    status: {
      type: String,
      enum: ['scheduled', 'completed', 'cancelled', 'rescheduled', 'no_show']
    },
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
        enum: ['strong_hire', 'hire', 'no_hire', 'strong_no_hire']
      }
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Assessment & Testing
  assessments: [{
    assessmentId: String,
    type: {
      type: String,
      enum: ['technical', 'aptitude', 'personality', 'skill_based', 'coding']
    },
    title: String,
    assignedDate: Date,
    dueDate: Date,
    completedDate: Date,
    status: {
      type: String,
      enum: ['assigned', 'in_progress', 'completed', 'overdue', 'cancelled']
    },
    score: Number,
    maxScore: Number,
    percentile: Number,
    feedback: String,
    results: mongoose.Schema.Types.Mixed
  }],
  
  // Reference Checks
  references: [{
    name: String,
    relationship: String,
    company: String,
    position: String,
    email: String,
    phone: String,
    contactedDate: Date,
    responseDate: Date,
    status: {
      type: String,
      enum: ['pending', 'contacted', 'responded', 'no_response']
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    feedback: String,
    wouldRehire: Boolean
  }],
  
  // Offer Management
  offer: {
    isExtended: {
      type: Boolean,
      default: false
    },
    extendedDate: Date,
    expiryDate: Date,
    responseDate: Date,
    
    offerDetails: {
      position: String,
      department: String,
      startDate: Date,
      salary: {
        base: Number,
        currency: String,
        frequency: {
          type: String,
          enum: ['hourly', 'monthly', 'yearly']
        }
      },
      benefits: [String],
      workArrangement: {
        type: String,
        enum: ['remote', 'hybrid', 'onsite']
      },
      probationPeriod: Number, // in months
      noticePeriod: Number // in days
    },
    
    negotiation: [{
      date: Date,
      from: {
        type: String,
        enum: ['candidate', 'employer']
      },
      aspect: String, // salary, benefits, start_date, etc.
      currentValue: String,
      proposedValue: String,
      status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'counter_proposed']
      },
      notes: String
    }],
    
    finalStatus: {
      type: String,
      enum: ['pending', 'accepted', 'declined', 'withdrawn', 'expired']
    }
  },
  
  // Metadata & Analytics
  metadata: {
    source: {
      type: String,
      enum: ['direct', 'job_board', 'referral', 'social_media', 'career_page']
    },
    
    deviceInfo: {
      userAgent: String,
      ipAddress: String,
      device: String,
      browser: String,
      os: String
    },
    
    applicationDuration: Number, // time taken to complete application in minutes
    
    viewCount: {
      type: Number,
      default: 0
    },
    
    lastViewed: Date,
    
    flags: [{
      type: String,
      reason: String,
      flaggedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BaseUser'
      },
      flaggedAt: Date,
      resolved: Boolean,
      resolvedAt: Date
    }]
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
EnhancedApplicationSchema.index({ jobId: 1, applicantId: 1 }, { unique: true });
EnhancedApplicationSchema.index({ applicationStatus: 1, applicationDate: -1 });
EnhancedApplicationSchema.index({ recruiterId: 1, applicationStatus: 1 });
EnhancedApplicationSchema.index({ 'aiScoring.overallScore': -1 });
EnhancedApplicationSchema.index({ applicationDate: -1 });
EnhancedApplicationSchema.index({ lastUpdated: -1 });

// Virtual fields
EnhancedApplicationSchema.virtual('daysInCurrentStatus').get(function() {
  const lastStatusChange = this.timeline[this.timeline.length - 1];
  if (!lastStatusChange) return 0;
  
  const now = new Date();
  const statusDate = lastStatusChange.timestamp;
  return Math.floor((now - statusDate) / (1000 * 60 * 60 * 24));
});

EnhancedApplicationSchema.virtual('isExpired').get(function() {
  if (this.offer && this.offer.expiryDate) {
    return new Date() > this.offer.expiryDate;
  }
  return false;
});

// Pre-save middleware
EnhancedApplicationSchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  
  // Add timeline entry for status changes
  if (this.isModified('applicationStatus')) {
    this.timeline.push({
      status: this.applicationStatus,
      timestamp: new Date(),
      action: `Status changed to ${this.applicationStatus}`,
      systemGenerated: true
    });
  }
  
  next();
});

// Static methods
EnhancedApplicationSchema.statics.getApplicationsByStatus = function(status, filters = {}) {
  return this.find({ 
    applicationStatus: status,
    ...filters 
  })
  .populate('jobId', 'jobTitle companyName location')
  .populate('applicantId', 'firstName lastName email')
  .sort({ applicationDate: -1 });
};

EnhancedApplicationSchema.statics.getApplicationsByJob = function(jobId) {
  return this.find({ jobId })
    .populate('applicantId', 'firstName lastName email phone')
    .sort({ 'aiScoring.overallScore': -1, applicationDate: -1 });
};

EnhancedApplicationSchema.statics.getApplicationsByRecruiter = function(recruiterId, filters = {}) {
  return this.find({ 
    recruiterId,
    ...filters 
  })
  .populate('jobId', 'jobTitle companyName')
  .populate('applicantId', 'firstName lastName email')
  .sort({ applicationDate: -1 });
};

// Instance methods
EnhancedApplicationSchema.methods.updateStatus = function(newStatus, updatedBy, note = '') {
  this.applicationStatus = newStatus;
  this.timeline.push({
    status: newStatus,
    timestamp: new Date(),
    updatedBy: updatedBy,
    action: `Status updated to ${newStatus}`,
    note: note,
    systemGenerated: false
  });
  return this.save();
};

EnhancedApplicationSchema.methods.addNote = function(authorId, content, isPrivate = true, tags = []) {
  this.recruiterNotes.push({
    author: authorId,
    content: content,
    isPrivate: isPrivate,
    tags: tags
  });
  return this.save();
};

EnhancedApplicationSchema.methods.scheduleInterview = function(interviewData) {
  this.interviews.push({
    ...interviewData,
    interviewId: `INT-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`
  });
  return this.save();
};

export default mongoose.model('EnhancedApplication', EnhancedApplicationSchema);
