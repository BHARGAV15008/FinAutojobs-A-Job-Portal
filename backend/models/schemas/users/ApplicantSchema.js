/**
 * Applicant Schema
 * 
 * Extends BaseUserSchema with applicant-specific fields and functionality.
 * Handles job seekers' profiles, skills, experience, and job preferences.
 * 
 * @author FinAutoJobs Team
 * @version 1.0.0
 */

import mongoose from 'mongoose';
import BaseUserSchema from './BaseUserSchema.js';

const ApplicantSchema = new mongoose.Schema({
  // Inherit all base user fields
  ...BaseUserSchema.obj,
  
  // Role identification
  role: {
    type: String,
    default: 'applicant',
    immutable: true,
    index: true
  },
  
  // Professional Information
  currentJobTitle: {
    type: String,
    trim: true,
    maxlength: [100, 'Job title cannot exceed 100 characters']
  },
  
  experienceLevel: {
    type: String,
    enum: ['fresher', 'entry', 'mid', 'senior', 'lead', 'executive'],
    default: 'fresher',
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
  
  // Skills & Expertise
  skills: {
    technical: [{
      name: {
        type: String,
        required: true,
        trim: true
      },
      level: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced', 'expert'],
        default: 'intermediate'
      },
      yearsOfExperience: {
        type: Number,
        min: 0,
        max: 20
      },
      certifications: [{
        name: String,
        issuer: String,
        issueDate: Date,
        expiryDate: Date,
        credentialId: String,
        verificationUrl: String
      }]
    }],
    
    soft: [{
      name: {
        type: String,
        required: true,
        trim: true
      },
      level: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced', 'expert'],
        default: 'intermediate'
      }
    }],
    
    languages: [{
      name: {
        type: String,
        required: true,
        trim: true
      },
      proficiency: {
        type: String,
        enum: ['basic', 'conversational', 'fluent', 'native'],
        default: 'conversational'
      },
      canRead: {
        type: Boolean,
        default: true
      },
      canWrite: {
        type: Boolean,
        default: true
      },
      canSpeak: {
        type: Boolean,
        default: true
      }
    }]
  },
  
  // Education
  education: [{
    degree: {
      type: String,
      required: true,
      trim: true,
      enum: [
        'High School', '12th', 'Diploma', 'Bachelor', 'Master', 'PhD',
        'B.Tech', 'M.Tech', 'BCA', 'MCA', 'MBA', 'B.Com', 'M.Com',
        'B.Sc', 'M.Sc', 'BA', 'MA', 'Other'
      ]
    },
    fieldOfStudy: {
      type: String,
      required: true,
      trim: true
    },
    institution: {
      type: String,
      required: true,
      trim: true
    },
    university: {
      type: String,
      trim: true
    },
    location: {
      city: String,
      state: String,
      country: {
        type: String,
        default: 'India'
      }
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: Date,
    isCurrentlyStudying: {
      type: Boolean,
      default: false
    },
    grade: {
      value: String,
      scale: {
        type: String,
        enum: ['percentage', 'cgpa', 'gpa', 'grade']
      }
    },
    achievements: [{
      type: String,
      trim: true
    }],
    relevantCoursework: [{
      type: String,
      trim: true
    }]
  }],
  
  // Work Experience
  workExperience: [{
    jobTitle: {
      type: String,
      required: true,
      trim: true
    },
    company: {
      type: String,
      required: true,
      trim: true
    },
    companySize: {
      type: String,
      enum: ['startup', 'small', 'medium', 'large', 'enterprise']
    },
    industry: {
      type: String,
      trim: true
    },
    location: {
      city: String,
      state: String,
      country: {
        type: String,
        default: 'India'
      },
      isRemote: {
        type: Boolean,
        default: false
      }
    },
    employmentType: {
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'freelance', 'internship'],
      default: 'full-time'
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: Date,
    isCurrentJob: {
      type: Boolean,
      default: false
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Job description cannot exceed 2000 characters']
    },
    responsibilities: [{
      type: String,
      trim: true
    }],
    achievements: [{
      type: String,
      trim: true
    }],
    technologiesUsed: [{
      type: String,
      trim: true
    }],
    salary: {
      amount: Number,
      currency: {
        type: String,
        default: 'INR'
      },
      period: {
        type: String,
        enum: ['hourly', 'monthly', 'yearly'],
        default: 'yearly'
      }
    },
    reasonForLeaving: {
      type: String,
      trim: true
    }
  }],
  
  // Projects & Portfolio
  projects: [{
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: [1000, 'Project description cannot exceed 1000 characters']
    },
    technologies: [{
      type: String,
      trim: true
    }],
    role: {
      type: String,
      trim: true
    },
    teamSize: Number,
    startDate: Date,
    endDate: Date,
    isOngoing: {
      type: Boolean,
      default: false
    },
    projectUrl: {
      type: String,
      trim: true,
      match: [/^https?:\/\/.*/, 'Please enter a valid project URL']
    },
    repositoryUrl: {
      type: String,
      trim: true,
      match: [/^https?:\/\/.*/, 'Please enter a valid repository URL']
    },
    images: [{
      url: String,
      caption: String
    }],
    achievements: [{
      type: String,
      trim: true
    }]
  }],
  
  // Certifications & Achievements
  certifications: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    issuer: {
      type: String,
      required: true,
      trim: true
    },
    issueDate: {
      type: Date,
      required: true
    },
    expiryDate: Date,
    credentialId: {
      type: String,
      trim: true
    },
    verificationUrl: {
      type: String,
      trim: true,
      match: [/^https?:\/\/.*/, 'Please enter a valid verification URL']
    },
    skills: [{
      type: String,
      trim: true
    }]
  }],
  
  // Job Preferences
  jobPreferences: {
    desiredJobTitles: [{
      type: String,
      trim: true
    }],
    preferredIndustries: [{
      type: String,
      trim: true
    }],
    employmentTypes: [{
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'freelance', 'internship']
    }],
    workArrangement: [{
      type: String,
      enum: ['onsite', 'remote', 'hybrid']
    }],
    preferredLocations: [{
      city: String,
      state: String,
      country: String,
      isRemote: Boolean
    }],
    salaryExpectations: {
      minimum: {
        amount: Number,
        currency: {
          type: String,
          default: 'INR'
        },
        period: {
          type: String,
          enum: ['hourly', 'monthly', 'yearly'],
          default: 'yearly'
        }
      },
      maximum: {
        amount: Number,
        currency: {
          type: String,
          default: 'INR'
        },
        period: {
          type: String,
          enum: ['hourly', 'monthly', 'yearly'],
          default: 'yearly'
        }
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
    }
  },
  
  // Resume & Documents
  documents: {
    resume: {
      url: String,
      filename: String,
      uploadedAt: Date,
      size: Number,
      format: {
        type: String,
        enum: ['pdf', 'doc', 'docx']
      }
    },
    coverLetter: {
      url: String,
      filename: String,
      uploadedAt: Date,
      size: Number,
      format: {
        type: String,
        enum: ['pdf', 'doc', 'docx']
      }
    },
    portfolio: {
      url: String,
      filename: String,
      uploadedAt: Date,
      size: Number,
      format: {
        type: String,
        enum: ['pdf', 'zip']
      }
    },
    otherDocuments: [{
      name: String,
      url: String,
      filename: String,
      uploadedAt: Date,
      size: Number,
      type: {
        type: String,
        enum: ['certificate', 'transcript', 'recommendation', 'other']
      }
    }]
  },
  
  // Job Application Tracking
  applicationStats: {
    totalApplications: {
      type: Number,
      default: 0
    },
    pendingApplications: {
      type: Number,
      default: 0
    },
    shortlistedApplications: {
      type: Number,
      default: 0
    },
    rejectedApplications: {
      type: Number,
      default: 0
    },
    interviewsScheduled: {
      type: Number,
      default: 0
    },
    offersReceived: {
      type: Number,
      default: 0
    },
    lastApplicationDate: Date
  },
  
  // Saved Jobs & Bookmarks
  savedJobs: [{
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true
    },
    savedAt: {
      type: Date,
      default: Date.now
    },
    notes: {
      type: String,
      trim: true
    }
  }],
  
  // Job Alerts & Notifications
  jobAlerts: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    keywords: [{
      type: String,
      trim: true
    }],
    location: {
      city: String,
      state: String,
      radius: {
        type: Number,
        default: 50 // km
      }
    },
    salaryRange: {
      min: Number,
      max: Number,
      currency: {
        type: String,
        default: 'INR'
      }
    },
    employmentTypes: [{
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'freelance', 'internship']
    }],
    industries: [{
      type: String,
      trim: true
    }],
    frequency: {
      type: String,
      enum: ['immediate', 'daily', 'weekly'],
      default: 'daily'
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    lastSent: Date
  }],
  
  // Privacy & Visibility Settings
  profileVisibility: {
    isSearchable: {
      type: Boolean,
      default: true
    },
    showToRecruiters: {
      type: Boolean,
      default: true
    },
    showSalaryExpectations: {
      type: Boolean,
      default: true
    },
    showContactInfo: {
      type: Boolean,
      default: false
    },
    allowDirectMessages: {
      type: Boolean,
      default: true
    }
  },
  
  // Recommendations & Endorsements
  recommendations: [{
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    relationship: {
      type: String,
      enum: ['colleague', 'manager', 'client', 'mentor', 'other'],
      required: true
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: [1000, 'Recommendation cannot exceed 1000 characters']
    },
    skills: [{
      type: String,
      trim: true
    }],
    isPublic: {
      type: Boolean,
      default: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  skillEndorsements: [{
    skill: {
      type: String,
      required: true,
      trim: true
    },
    endorsedBy: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      endorsedAt: {
        type: Date,
        default: Date.now
      }
    }],
    count: {
      type: Number,
      default: 0
    }
  }]
}, {
  timestamps: true,
  versionKey: false,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
ApplicantSchema.index({ role: 1, status: 1 });
ApplicantSchema.index({ 'skills.technical.name': 1 });
ApplicantSchema.index({ 'jobPreferences.preferredLocations.city': 1 });
ApplicantSchema.index({ 'jobPreferences.salaryExpectations.minimum.amount': 1 });
ApplicantSchema.index({ experienceLevel: 1 });
ApplicantSchema.index({ 'totalExperience.years': 1 });
ApplicantSchema.index({ 'profileVisibility.isSearchable': 1, status: 1 });

// Virtual for total experience in months
ApplicantSchema.virtual('totalExperienceInMonths').get(function() {
  return (this.totalExperience.years * 12) + this.totalExperience.months;
});

// Virtual for current salary
ApplicantSchema.virtual('currentSalary').get(function() {
  const currentJob = this.workExperience.find(job => job.isCurrentJob);
  return currentJob ? currentJob.salary : null;
});

// Pre-save middleware for applicant-specific logic
ApplicantSchema.pre('save', function(next) {
  // Calculate total experience from work experience
  if (this.isModified('workExperience')) {
    let totalMonths = 0;
    
    this.workExperience.forEach(job => {
      const startDate = new Date(job.startDate);
      const endDate = job.endDate ? new Date(job.endDate) : new Date();
      
      const diffTime = Math.abs(endDate - startDate);
      const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30.44)); // Average days per month
      
      totalMonths += diffMonths;
    });
    
    this.totalExperience.years = Math.floor(totalMonths / 12);
    this.totalExperience.months = totalMonths % 12;
  }
  
  // Update experience level based on total experience
  const totalYears = this.totalExperience.years;
  if (totalYears === 0) {
    this.experienceLevel = 'fresher';
  } else if (totalYears <= 2) {
    this.experienceLevel = 'entry';
  } else if (totalYears <= 5) {
    this.experienceLevel = 'mid';
  } else if (totalYears <= 10) {
    this.experienceLevel = 'senior';
  } else if (totalYears <= 15) {
    this.experienceLevel = 'lead';
  } else {
    this.experienceLevel = 'executive';
  }
  
  next();
});

// Instance methods
ApplicantSchema.methods.addSavedJob = function(jobId, notes = '') {
  const existingIndex = this.savedJobs.findIndex(
    saved => saved.jobId.toString() === jobId.toString()
  );
  
  if (existingIndex === -1) {
    this.savedJobs.push({
      jobId,
      notes,
      savedAt: new Date()
    });
  }
  
  return this.save();
};

ApplicantSchema.methods.removeSavedJob = function(jobId) {
  this.savedJobs = this.savedJobs.filter(
    saved => saved.jobId.toString() !== jobId.toString()
  );
  
  return this.save();
};

ApplicantSchema.methods.updateApplicationStats = function(type, increment = 1) {
  if (this.applicationStats[type] !== undefined) {
    this.applicationStats[type] += increment;
    this.applicationStats.lastApplicationDate = new Date();
  }
  
  return this.save();
};

export default ApplicantSchema;
