/**
 * Recruiter Schema
 * 
 * Extends BaseUserSchema with recruiter-specific fields and functionality.
 * Handles recruiters' profiles, company information, and hiring activities.
 * 
 * @author FinAutoJobs Team
 * @version 1.0.0
 */

import mongoose from 'mongoose';
import BaseUserSchema from './BaseUserSchema.js';

const RecruiterSchema = new mongoose.Schema({
  // Inherit all base user fields
  ...BaseUserSchema.obj,
  
  // Role identification
  role: {
    type: String,
    default: 'recruiter',
    immutable: true,
    index: true
  },
  
  // Company Information
  company: {
    name: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      maxlength: [100, 'Company name cannot exceed 100 characters'],
      index: true
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      index: true
    },
    department: {
      type: String,
      trim: true,
      maxlength: [50, 'Department cannot exceed 50 characters']
    },
    jobTitle: {
      type: String,
      required: [true, 'Job title is required'],
      trim: true,
      maxlength: [100, 'Job title cannot exceed 100 characters']
    },
    employeeId: {
      type: String,
      trim: true,
      unique: true,
      sparse: true
    },
    workEmail: {
      type: String,
      trim: true,
      lowercase: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        'Please enter a valid work email address'
      ]
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required']
    },
    endDate: Date,
    isCurrentEmployee: {
      type: Boolean,
      default: true
    }
  },
  
  // Professional Information
  experienceLevel: {
    type: String,
    enum: ['junior', 'mid', 'senior', 'lead', 'manager', 'director', 'vp', 'c_level'],
    default: 'mid',
    index: true
  },
  
  totalExperience: {
    years: {
      type: Number,
      min: 0,
      max: 50,
      default: 0
    },
    months: {
      type: Number,
      min: 0,
      max: 11,
      default: 0
    }
  },
  
  recruitingExperience: {
    years: {
      type: Number,
      min: 0,
      max: 50,
      default: 0
    },
    months: {
      type: Number,
      min: 0,
      max: 11,
      default: 0
    }
  },
  
  // Specializations & Expertise
  specializations: {
    industries: [{
      name: {
        type: String,
        required: true,
        trim: true
      },
      experience: {
        type: Number,
        min: 0,
        max: 50
      }
    }],
    
    jobFunctions: [{
      name: {
        type: String,
        required: true,
        trim: true
      },
      experience: {
        type: Number,
        min: 0,
        max: 50
      }
    }],
    
    skillsExpertise: [{
      category: {
        type: String,
        required: true,
        trim: true
      },
      skills: [{
        type: String,
        trim: true
      }]
    }],
    
    levelOfHires: [{
      type: String,
      enum: ['entry', 'mid', 'senior', 'executive', 'c_level']
    }]
  },
  
  // Recruiting Metrics & Performance
  recruitingStats: {
    totalJobsPosted: {
      type: Number,
      default: 0
    },
    activeJobs: {
      type: Number,
      default: 0
    },
    totalApplicationsReceived: {
      type: Number,
      default: 0
    },
    candidatesShortlisted: {
      type: Number,
      default: 0
    },
    interviewsScheduled: {
      type: Number,
      default: 0
    },
    offersExtended: {
      type: Number,
      default: 0
    },
    successfulHires: {
      type: Number,
      default: 0
    },
    averageTimeToHire: {
      type: Number, // in days
      default: 0
    },
    averageTimeToFill: {
      type: Number, // in days
      default: 0
    },
    hiringSuccessRate: {
      type: Number, // percentage
      default: 0
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  
  // Permissions & Access Control
  permissions: {
    canPostJobs: {
      type: Boolean,
      default: true
    },
    canViewAllApplications: {
      type: Boolean,
      default: true
    },
    canScheduleInterviews: {
      type: Boolean,
      default: true
    },
    canMakeOffers: {
      type: Boolean,
      default: false
    },
    canAccessAnalytics: {
      type: Boolean,
      default: true
    },
    canManageTeam: {
      type: Boolean,
      default: false
    },
    canExportData: {
      type: Boolean,
      default: false
    },
    maxActiveJobs: {
      type: Number,
      default: 10
    },
    budgetLimit: {
      amount: Number,
      currency: {
        type: String,
        default: 'INR'
      },
      period: {
        type: String,
        enum: ['monthly', 'quarterly', 'yearly'],
        default: 'monthly'
      }
    }
  },
  
  // Team & Hierarchy
  team: {
    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    teamMembers: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      role: {
        type: String,
        enum: ['recruiter', 'coordinator', 'sourcer', 'intern']
      },
      addedAt: {
        type: Date,
        default: Date.now
      }
    }],
    department: {
      type: String,
      trim: true
    },
    costCenter: {
      type: String,
      trim: true
    }
  },
  
  // Sourcing & Candidate Management
  sourcingChannels: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ['job_board', 'social_media', 'referral', 'direct_sourcing', 'agency', 'campus', 'other']
    },
    isActive: {
      type: Boolean,
      default: true
    },
    successRate: {
      type: Number,
      default: 0
    },
    costPerHire: {
      amount: Number,
      currency: {
        type: String,
        default: 'INR'
      }
    }
  }],
  
  candidatePipeline: {
    totalCandidates: {
      type: Number,
      default: 0
    },
    newCandidates: {
      type: Number,
      default: 0
    },
    qualifiedCandidates: {
      type: Number,
      default: 0
    },
    interviewReady: {
      type: Number,
      default: 0
    },
    offerReady: {
      type: Number,
      default: 0
    },
    hired: {
      type: Number,
      default: 0
    },
    rejected: {
      type: Number,
      default: 0
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  
  // Communication & Templates
  emailTemplates: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ['application_received', 'screening', 'interview_invite', 'rejection', 'offer', 'follow_up', 'custom'],
      required: true
    },
    subject: {
      type: String,
      required: true,
      trim: true
    },
    body: {
      type: String,
      required: true,
      trim: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    usageCount: {
      type: Number,
      default: 0
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    lastUsed: Date
  }],
  
  // Interview & Assessment Settings
  interviewSettings: {
    defaultInterviewDuration: {
      type: Number,
      default: 60 // minutes
    },
    availableTimeSlots: [{
      day: {
        type: String,
        enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
      },
      startTime: String, // HH:MM format
      endTime: String,   // HH:MM format
      timezone: {
        type: String,
        default: 'Asia/Kolkata'
      }
    }],
    interviewTypes: [{
      name: {
        type: String,
        required: true,
        trim: true
      },
      duration: {
        type: Number,
        required: true
      },
      description: {
        type: String,
        trim: true
      },
      isActive: {
        type: Boolean,
        default: true
      }
    }],
    assessmentTools: [{
      name: {
        type: String,
        required: true,
        trim: true
      },
      type: {
        type: String,
        enum: ['coding', 'aptitude', 'personality', 'technical', 'behavioral', 'custom']
      },
      provider: {
        type: String,
        trim: true
      },
      isActive: {
        type: Boolean,
        default: true
      }
    }]
  },
  
  // Notifications & Alerts
  notificationPreferences: {
    newApplications: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      },
      frequency: {
        type: String,
        enum: ['immediate', 'hourly', 'daily'],
        default: 'immediate'
      }
    },
    interviewReminders: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      },
      reminderTime: {
        type: Number,
        default: 60 // minutes before
      }
    },
    candidateUpdates: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: false
      }
    },
    teamUpdates: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: false
      }
    }
  },
  
  // Integration & Tools
  integrations: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ['ats', 'crm', 'calendar', 'email', 'assessment', 'background_check', 'other']
    },
    apiKey: {
      type: String,
      select: false
    },
    settings: {
      type: mongoose.Schema.Types.Mixed
    },
    isActive: {
      type: Boolean,
      default: true
    },
    lastSync: Date,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Performance & Goals
  goals: [{
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    type: {
      type: String,
      enum: ['hires', 'applications', 'time_to_hire', 'cost_per_hire', 'quality_of_hire', 'custom']
    },
    target: {
      value: {
        type: Number,
        required: true
      },
      unit: {
        type: String,
        required: true
      }
    },
    current: {
      value: {
        type: Number,
        default: 0
      },
      lastUpdated: {
        type: Date,
        default: Date.now
      }
    },
    period: {
      type: String,
      enum: ['weekly', 'monthly', 'quarterly', 'yearly'],
      default: 'monthly'
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  
  // Saved Searches & Filters
  savedSearches: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ['candidates', 'resumes', 'applications'],
      required: true
    },
    filters: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    alertFrequency: {
      type: String,
      enum: ['none', 'immediate', 'daily', 'weekly'],
      default: 'none'
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    lastUsed: Date
  }],
  
  // Notes & Comments
  candidateNotes: [{
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job'
    },
    note: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ['general', 'interview', 'screening', 'feedback', 'follow_up'],
      default: 'general'
    },
    isPrivate: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true,
  versionKey: false,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
RecruiterSchema.index({ role: 1, status: 1 });
RecruiterSchema.index({ 'company.name': 1 });
RecruiterSchema.index({ 'company.companyId': 1 });
RecruiterSchema.index({ 'specializations.industries.name': 1 });
RecruiterSchema.index({ 'permissions.canPostJobs': 1 });
RecruiterSchema.index({ 'team.managerId': 1 });
RecruiterSchema.index({ experienceLevel: 1 });

// Virtual for total recruiting experience in months
RecruiterSchema.virtual('totalRecruitingExperienceInMonths').get(function() {
  return (this.recruitingExperience.years * 12) + this.recruitingExperience.months;
});

// Virtual for hiring success rate
RecruiterSchema.virtual('calculatedHiringSuccessRate').get(function() {
  const { offersExtended, successfulHires } = this.recruitingStats;
  return offersExtended > 0 ? ((successfulHires / offersExtended) * 100).toFixed(2) : 0;
});

// Pre-save middleware for recruiter-specific logic
RecruiterSchema.pre('save', function(next) {
  // Update hiring success rate
  if (this.isModified('recruitingStats')) {
    const { offersExtended, successfulHires } = this.recruitingStats;
    this.recruitingStats.hiringSuccessRate = offersExtended > 0 
      ? ((successfulHires / offersExtended) * 100) 
      : 0;
    this.recruitingStats.lastUpdated = new Date();
  }
  
  // Update candidate pipeline totals
  if (this.isModified('candidatePipeline')) {
    const pipeline = this.candidatePipeline;
    pipeline.totalCandidates = 
      pipeline.newCandidates + 
      pipeline.qualifiedCandidates + 
      pipeline.interviewReady + 
      pipeline.offerReady + 
      pipeline.hired + 
      pipeline.rejected;
    pipeline.lastUpdated = new Date();
  }
  
  next();
});

// Instance methods
RecruiterSchema.methods.updateRecruitingStats = function(statType, increment = 1) {
  if (this.recruitingStats[statType] !== undefined) {
    this.recruitingStats[statType] += increment;
    this.recruitingStats.lastUpdated = new Date();
  }
  return this.save();
};

RecruiterSchema.methods.addCandidateNote = function(candidateId, note, type = 'general', jobId = null) {
  this.candidateNotes.push({
    candidateId,
    jobId,
    note,
    type,
    createdAt: new Date()
  });
  return this.save();
};

RecruiterSchema.methods.updateCandidatePipeline = function(stage, increment = 1) {
  if (this.candidatePipeline[stage] !== undefined) {
    this.candidatePipeline[stage] += increment;
    this.candidatePipeline.lastUpdated = new Date();
  }
  return this.save();
};

RecruiterSchema.methods.addSavedSearch = function(name, type, filters, alertFrequency = 'none') {
  this.savedSearches.push({
    name,
    type,
    filters,
    alertFrequency,
    createdAt: new Date()
  });
  return this.save();
};

export default RecruiterSchema;
