import mongoose from 'mongoose';

/**
 * ApplicationInformation Schema
 * 
 * This schema stores a complete snapshot of applicant's information
 * at the time of job application. It captures all profile details,
 * skills, experience, education, and preferences when they apply.
 * 
 * This ensures we have historical data of what information was
 * provided during application, even if the user updates their
 * profile later.
 */

const applicationInformationSchema = new mongoose.Schema({
  // Reference to the main application
  applicationId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Application', 
    required: true,
    unique: true 
  },
  
  // Reference to the applicant
  applicantId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'BaseUser', 
    required: true 
  },
  
  // Reference to the job
  jobId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Job', 
    required: true 
  },

  // Basic Information (snapshot from profile)
  basicInfo: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String },
    bio: { type: String, maxlength: 500 },
    profileImage: { type: String }
  },

  // Expected Salary (flexible format support)
  expectedSalary: {
    // Supports formats like: "10-12", "12+", "15", "Negotiable"
    salaryRange: {
      min: { type: Number }, // In thousands (e.g., 10 = 10k, 1000 = 10L)
      max: { type: Number }, // In thousands
      isNegotiable: { type: Boolean, default: false },
      currency: { type: String, default: 'INR' },
      period: { type: String, enum: ['hourly', 'monthly', 'yearly'], default: 'yearly' }
    },
    // Raw text format as entered by user (e.g., "10-12 LPA", "12+ LPA", "Negotiable")
    rawSalaryText: { type: String },
    // Formatted display text
    displayText: { type: String }
  },

  // Experience (flexible format support)
  experience: {
    // Total years of experience
    totalYears: { type: Number, default: 0 },
    // Supports formats like: "1+", "1", "1-2", "0-1", "5+"
    experienceRange: {
      min: { type: Number, default: 0 },
      max: { type: Number },
      isPlus: { type: Boolean, default: false } // For "5+" format
    },
    // Raw text format as entered (e.g., "2-3 years", "5+ years", "Fresher")
    rawExperienceText: { type: String },
    // Current job details
    currentJob: {
      jobTitle: { type: String },
      companyName: { type: String },
      isCurrentlyWorking: { type: Boolean, default: false },
      startDate: { type: Date },
      endDate: { type: Date }
    }
  },

  // Education Information
  education: [{
    educationId: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
    institution: { type: String, required: true },
    degree: { type: String, required: true },
    fieldOfStudy: { type: String },
    startDate: { type: Date },
    endDate: { type: Date },
    grade: { type: String },
    percentage: { type: Number },
    cgpa: { type: Number },
    isCurrentlyStudying: { type: Boolean, default: false },
    // Additional details
    achievements: [{ type: String }],
    relevantCoursework: [{ type: String }]
  }],

  // Social Links & Portfolio
  socialLinks: {
    linkedin: { 
      url: { type: String },
      isVerified: { type: Boolean, default: false }
    },
    github: { 
      url: { type: String },
      isVerified: { type: Boolean, default: false }
    },
    portfolio: { 
      url: { type: String },
      isVerified: { type: Boolean, default: false }
    },
    // Additional social links
    twitter: { type: String },
    behance: { type: String },
    dribbble: { type: String },
    stackoverflow: { type: String },
    personalWebsite: { type: String }
  },

  // Skills Information
  skills: {
    // Primary skills (most important)
    primary: [{ 
      skill: { type: String, required: true },
      proficiency: { type: String, enum: ['beginner', 'intermediate', 'advanced', 'expert'], default: 'intermediate' },
      yearsOfExperience: { type: Number, default: 0 }
    }],
    // Technical skills
    technical: [{ 
      skill: { type: String, required: true },
      proficiency: { type: String, enum: ['beginner', 'intermediate', 'advanced', 'expert'], default: 'intermediate' },
      yearsOfExperience: { type: Number, default: 0 },
      category: { type: String } // e.g., "Programming", "Database", "Framework"
    }],
    // Soft skills
    soft: [{ 
      skill: { type: String, required: true },
      proficiency: { type: String, enum: ['beginner', 'intermediate', 'advanced', 'expert'], default: 'intermediate' }
    }],
    // Languages
    languages: [{
      language: { type: String, required: true },
      proficiency: { type: String, enum: ['basic', 'intermediate', 'advanced', 'native'], default: 'intermediate' },
      canRead: { type: Boolean, default: true },
      canWrite: { type: Boolean, default: true },
      canSpeak: { type: Boolean, default: true }
    }]
  },

  // Complete Work Experience History
  workExperience: [{
    experienceId: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
    companyName: { type: String, required: true },
    jobTitle: { type: String, required: true },
    employmentType: { type: String, enum: ['full-time', 'part-time', 'contract', 'internship', 'freelance'], default: 'full-time' },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    isCurrentJob: { type: Boolean, default: false },
    location: {
      city: { type: String },
      state: { type: String },
      country: { type: String },
      isRemote: { type: Boolean, default: false }
    },
    description: { type: String, maxlength: 1000 },
    keyResponsibilities: [{ type: String }],
    achievements: [{ type: String }],
    skillsUsed: [{ type: String }],
    // Salary information (optional)
    salary: {
      amount: { type: Number },
      currency: { type: String, default: 'INR' },
      period: { type: String, enum: ['hourly', 'monthly', 'yearly'], default: 'yearly' }
    }
  }],

  // Current Location & Preferences
  location: {
    current: {
      city: { type: String },
      state: { type: String },
      country: { type: String, default: 'India' },
      address: { type: String },
      pincode: { type: String }
    },
    preferences: {
      preferredLocations: [{ type: String }],
      willingToRelocate: { type: Boolean, default: false },
      remoteWorkPreference: { type: String, enum: ['no', 'hybrid', 'fully-remote'], default: 'no' },
      maxCommuteDistance: { type: Number } // in kilometers
    }
  },

  // Job Preferences & Requirements
  jobPreferences: {
    preferredJobTypes: [{ type: String, enum: ['full-time', 'part-time', 'contract', 'internship', 'freelance'] }],
    preferredIndustries: [{ type: String }],
    preferredCompanySize: { type: String, enum: ['startup', 'small', 'medium', 'large', 'enterprise'] },
    preferredWorkCulture: [{ type: String }],
    noticePeriod: { type: String, enum: ['immediate', '15days', '1month', '2months', '3months', 'negotiable'] },
    availabilityDate: { type: Date }
  },

  // Documents & Attachments
  documents: {
    resume: {
      url: { type: String },
      fileName: { type: String },
      uploadDate: { type: Date, default: Date.now },
      fileSize: { type: Number }, // in bytes
      fileType: { type: String }
    },
    coverLetter: {
      url: { type: String },
      fileName: { type: String },
      uploadDate: { type: Date, default: Date.now },
      content: { type: String, maxlength: 2000 } // If written inline
    },
    portfolio: {
      url: { type: String },
      fileName: { type: String },
      uploadDate: { type: Date, default: Date.now }
    },
    certificates: [{
      name: { type: String, required: true },
      url: { type: String },
      issuedBy: { type: String },
      issuedDate: { type: Date },
      expiryDate: { type: Date },
      credentialId: { type: String }
    }],
    // Additional documents
    additionalDocuments: [{
      name: { type: String, required: true },
      url: { type: String, required: true },
      type: { type: String }, // e.g., "transcript", "recommendation", "project"
      uploadDate: { type: Date, default: Date.now }
    }]
  },

  // Application-Specific Information
  applicationDetails: {
    // Why interested in this role
    motivation: { type: String, maxlength: 1000 },
    // How they heard about the job
    referralSource: { type: String },
    // Any additional information
    additionalInfo: { type: String, maxlength: 1000 },
    // Specific questions answered
    customQuestions: [{
      question: { type: String, required: true },
      answer: { type: String, required: true }
    }],
    // Availability for interview
    interviewAvailability: {
      preferredDays: [{ type: String, enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] }],
      preferredTimes: [{ type: String }], // e.g., "9:00 AM - 12:00 PM"
      timeZone: { type: String, default: 'Asia/Kolkata' }
    }
  },

  // Profile Completion Status (at time of application)
  profileCompletionSnapshot: {
    basicInfo: { type: Boolean, default: false },
    education: { type: Boolean, default: false },
    experience: { type: Boolean, default: false },
    skills: { type: Boolean, default: false },
    preferences: { type: Boolean, default: false },
    documents: { type: Boolean, default: false },
    socialLinks: { type: Boolean, default: false },
    overallCompletionPercentage: { type: Number, default: 0 }
  },

  // Metadata
  metadata: {
    applicationSource: { type: String, enum: ['web', 'mobile', 'api'], default: 'web' },
    userAgent: { type: String },
    ipAddress: { type: String },
    applicationVersion: { type: String },
    submissionDate: { type: Date, default: Date.now },
    lastModified: { type: Date, default: Date.now }
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt
  collection: 'applicationinformation'
});

// Indexes for performance
applicationInformationSchema.index({ applicationId: 1 }, { unique: true });
applicationInformationSchema.index({ applicantId: 1 });
applicationInformationSchema.index({ jobId: 1 });
applicationInformationSchema.index({ 'basicInfo.email': 1 });
applicationInformationSchema.index({ 'skills.primary.skill': 1 });
applicationInformationSchema.index({ 'skills.technical.skill': 1 });
applicationInformationSchema.index({ 'experience.totalYears': 1 });
applicationInformationSchema.index({ 'expectedSalary.salaryRange.min': 1 });
applicationInformationSchema.index({ 'location.current.city': 1 });
applicationInformationSchema.index({ submissionDate: -1 });

// Virtual for formatted salary display
applicationInformationSchema.virtual('formattedSalary').get(function() {
  const salary = this.expectedSalary;
  if (!salary || !salary.salaryRange) return 'Not specified';
  
  const { min, max, isNegotiable, currency, period } = salary.salaryRange;
  
  if (isNegotiable) return 'Negotiable';
  
  const formatAmount = (amount) => {
    if (amount >= 100) return `${(amount / 100).toFixed(1)}L`; // Lakhs
    return `${amount}K`; // Thousands
  };
  
  if (min && max) {
    return `₹${formatAmount(min)} - ₹${formatAmount(max)} ${period}`;
  } else if (min) {
    return `₹${formatAmount(min)}+ ${period}`;
  }
  
  return 'Not specified';
});

// Virtual for formatted experience display
applicationInformationSchema.virtual('formattedExperience').get(function() {
  const exp = this.experience;
  if (!exp) return 'Not specified';
  
  const { min, max, isPlus } = exp.experienceRange;
  
  if (min === 0 && !max) return 'Fresher';
  if (min && max && min !== max) return `${min}-${max} years`;
  if (min && isPlus) return `${min}+ years`;
  if (min) return `${min} year${min > 1 ? 's' : ''}`;
  
  return exp.rawExperienceText || 'Not specified';
});

// Pre-save middleware to update lastModified
applicationInformationSchema.pre('save', function(next) {
  this.metadata.lastModified = new Date();
  next();
});

// Static method to create from applicant profile
applicationInformationSchema.statics.createFromProfile = async function(applicationId, applicantId, jobId, applicantProfile, additionalData = {}) {
  try {
    // Extract and transform data from applicant profile
    const applicationInfo = new this({
      applicationId,
      applicantId,
      jobId,
      
      // Basic info
      basicInfo: {
        firstName: applicantProfile.firstName,
        lastName: applicantProfile.lastName,
        email: applicantProfile.email,
        phone: applicantProfile.phone,
        bio: applicantProfile.bio,
        profileImage: applicantProfile.profileImage?.url
      },
      
      // Expected salary
      expectedSalary: {
        salaryRange: {
          min: applicantProfile.careerInfo?.expectedSalary,
          currency: 'INR',
          period: 'yearly'
        },
        rawSalaryText: additionalData.expectedSalary || `${applicantProfile.careerInfo?.expectedSalary || 0}K yearly`
      },
      
      // Experience
      experience: {
        totalYears: applicantProfile.yearsOfExperience || 0,
        experienceRange: {
          min: applicantProfile.yearsOfExperience || 0,
          max: applicantProfile.yearsOfExperience || 0
        },
        currentJob: {
          jobTitle: applicantProfile.careerInfo?.currentJobTitle,
          companyName: applicantProfile.careerInfo?.currentCompany,
          isCurrentlyWorking: true
        }
      },
      
      // Education
      education: applicantProfile.education || [],
      
      // Social links
      socialLinks: {
        linkedin: { url: applicantProfile.linkedin_url },
        github: { url: applicantProfile.github_url },
        portfolio: { url: applicantProfile.portfolio_url }
      },
      
      // Skills
      skills: {
        primary: (applicantProfile.skills?.primary || []).map(skill => ({ skill })),
        technical: (applicantProfile.skills?.technical || []).map(skill => ({ skill })),
        soft: (applicantProfile.skills?.soft || []).map(skill => ({ skill })),
        languages: applicantProfile.languages || []
      },
      
      // Work experience
      workExperience: applicantProfile.workExperience || [],
      
      // Location
      location: {
        current: applicantProfile.currentLocation || {},
        preferences: {
          preferredLocations: applicantProfile.jobPreferences?.preferredLocations || [],
          willingToRelocate: applicantProfile.jobPreferences?.willingToRelocate || false,
          remoteWorkPreference: applicantProfile.jobPreferences?.remoteWorkPreference ? 'fully-remote' : 'no'
        }
      },
      
      // Job preferences
      jobPreferences: applicantProfile.jobPreferences || {},
      
      // Documents
      documents: {
        resume: {
          url: applicantProfile.documents?.resumeUrl,
          uploadDate: new Date()
        },
        coverLetter: {
          content: additionalData.coverLetter
        },
        portfolio: {
          url: applicantProfile.documents?.portfolioUrl
        },
        certificates: applicantProfile.documents?.certificates?.map(cert => ({
          name: cert,
          url: cert
        })) || []
      },
      
      // Application details
      applicationDetails: {
        motivation: additionalData.motivation,
        additionalInfo: additionalData.additionalInfo,
        customQuestions: additionalData.customQuestions || []
      },
      
      // Merge any additional data
      ...additionalData
    });
    
    return await applicationInfo.save();
  } catch (error) {
    throw new Error(`Failed to create application information: ${error.message}`);
  }
};

// Instance method to update from new data
applicationInformationSchema.methods.updateFromData = function(newData) {
  // Update fields while preserving the original snapshot nature
  Object.keys(newData).forEach(key => {
    if (key !== '_id' && key !== 'applicationId' && key !== 'createdAt') {
      this[key] = newData[key];
    }
  });
  
  this.metadata.lastModified = new Date();
  return this.save();
};

export default mongoose.models.ApplicationInformation || mongoose.model('ApplicationInformation', applicationInformationSchema);
