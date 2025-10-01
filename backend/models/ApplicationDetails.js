import mongoose from 'mongoose';

// Comprehensive Application Details Schema
// This stores all applicant information when they apply for jobs
const applicationDetailsSchema = new mongoose.Schema({
  // Reference to the main application
  applicationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application',
    required: true,
    index: true
  },
  
  // Reference to applicant
  applicantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BaseUser',
    required: true,
    index: true
  },
  
  // Reference to job
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true,
    index: true
  },
  
  // Personal Information (snapshot at time of application)
  personalInfo: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ['male', 'female', 'other', 'prefer-not-to-say'] },
    nationality: { type: String, default: 'Indian' },
    currentLocation: {
      address: String,
      city: String,
      state: String,
      country: { type: String, default: 'India' },
      pincode: String,
      coordinates: {
        latitude: Number,
        longitude: Number
      }
    },
    profilePicture: {
      url: String,
      filename: String,
      uploadedAt: Date
    }
  },
  
  // Education Details (complete history)
  education: [{
    educationId: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
    level: { 
      type: String, 
      enum: ['high-school', 'intermediate', 'diploma', 'bachelor', 'master', 'phd', 'certification'],
      required: true 
    },
    degree: { type: String, required: true }, // e.g., "B.Tech", "MBA", "High School"
    field: { type: String, required: true }, // e.g., "Computer Science", "Business Administration"
    institution: { type: String, required: true },
    university: String,
    location: {
      city: String,
      state: String,
      country: String
    },
    startDate: { type: Date, required: true },
    endDate: Date, // null if currently studying
    isCurrentlyStudying: { type: Boolean, default: false },
    grade: {
      type: String, // e.g., "8.5 CGPA", "85%", "First Class"
      gradeType: { type: String, enum: ['percentage', 'cgpa', 'gpa', 'class', 'other'] }
    },
    achievements: [String], // Dean's list, scholarships, etc.
    relevantCoursework: [String],
    projects: [{
      title: String,
      description: String,
      technologies: [String],
      duration: String,
      url: String
    }]
  }],
  
  // Work Experience (complete history)
  workExperience: [{
    experienceId: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
    companyName: { type: String, required: true },
    jobTitle: { type: String, required: true },
    department: String,
    employmentType: { 
      type: String, 
      enum: ['full-time', 'part-time', 'contract', 'internship', 'freelance', 'volunteer'],
      default: 'full-time'
    },
    location: {
      city: String,
      state: String,
      country: String,
      isRemote: { type: Boolean, default: false }
    },
    startDate: { type: Date, required: true },
    endDate: Date, // null if currently working
    isCurrentlyWorking: { type: Boolean, default: false },
    description: { type: String, required: true },
    keyResponsibilities: [String],
    achievements: [String],
    technologiesUsed: [String],
    salary: {
      amount: Number,
      currency: { type: String, default: 'INR' },
      period: { type: String, enum: ['hourly', 'monthly', 'yearly'], default: 'yearly' }
    },
    reportingManager: {
      name: String,
      designation: String,
      contact: String
    },
    reasonForLeaving: String
  }],
  
  // Skills (comprehensive skill set)
  skills: {
    technical: [{
      name: { type: String, required: true },
      category: { type: String, enum: ['programming', 'framework', 'database', 'tool', 'platform', 'other'] },
      proficiency: { type: String, enum: ['beginner', 'intermediate', 'advanced', 'expert'], default: 'intermediate' },
      yearsOfExperience: Number,
      lastUsed: Date,
      certifications: [String]
    }],
    soft: [{
      name: { type: String, required: true },
      proficiency: { type: String, enum: ['beginner', 'intermediate', 'advanced', 'expert'], default: 'intermediate' },
      examples: [String] // Examples of how this skill was demonstrated
    }],
    languages: [{
      language: { type: String, required: true },
      proficiency: { type: String, enum: ['basic', 'conversational', 'fluent', 'native'], default: 'conversational' },
      canRead: { type: Boolean, default: true },
      canWrite: { type: Boolean, default: true },
      canSpeak: { type: Boolean, default: true }
    }]
  },
  
  // Career Information
  careerInfo: {
    totalExperience: { type: Number, default: 0 }, // in years
    relevantExperience: { type: Number, default: 0 }, // in years
    currentSalary: {
      amount: Number,
      currency: { type: String, default: 'INR' },
      period: { type: String, enum: ['monthly', 'yearly'], default: 'yearly' },
      isConfidential: { type: Boolean, default: false }
    },
    expectedSalary: {
      min: { type: Number, required: true },
      max: Number,
      currency: { type: String, default: 'INR' },
      period: { type: String, enum: ['monthly', 'yearly'], default: 'yearly' },
      isNegotiable: { type: Boolean, default: true }
    },
    noticePeriod: {
      duration: { type: Number, required: true }, // in days
      isNegotiable: { type: Boolean, default: false },
      canJoinImmediately: { type: Boolean, default: false }
    },
    preferredJobType: [{ type: String, enum: ['full-time', 'part-time', 'contract', 'internship', 'freelance'] }],
    preferredWorkArrangement: [{ type: String, enum: ['office', 'remote', 'hybrid'] }],
    willingToRelocate: { type: Boolean, default: false },
    preferredLocations: [{
      city: String,
      state: String,
      country: String
    }],
    careerObjective: String,
    industryPreferences: [String]
  },
  
  // Certifications and Achievements
  certifications: [{
    certificationId: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
    name: { type: String, required: true },
    issuingOrganization: { type: String, required: true },
    issueDate: { type: Date, required: true },
    expiryDate: Date,
    credentialId: String,
    credentialUrl: String,
    skills: [String], // Skills this certification validates
    description: String
  }],
  
  // Projects Portfolio
  projects: [{
    projectId: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
    title: { type: String, required: true },
    description: { type: String, required: true },
    role: String, // Your role in the project
    technologies: [String],
    startDate: Date,
    endDate: Date,
    isOngoing: { type: Boolean, default: false },
    projectType: { type: String, enum: ['personal', 'professional', 'academic', 'open-source'] },
    teamSize: Number,
    urls: {
      demo: String,
      github: String,
      documentation: String,
      other: [String]
    },
    achievements: [String],
    challenges: [String],
    images: [{
      url: String,
      caption: String
    }]
  }],
  
  // Resume Information
  resumeInfo: {
    currentResume: {
      filename: String,
      url: String,
      uploadedAt: Date,
      fileSize: Number,
      fileType: String
    },
    alternateResumes: [{
      filename: String,
      url: String,
      uploadedAt: Date,
      fileSize: Number,
      fileType: String,
      description: String // e.g., "Technical Resume", "Management Resume"
    }],
    resumeScore: Number, // ATS score if available
    lastUpdated: Date
  },
  
  // Social and Professional Links
  socialLinks: {
    linkedin: String,
    github: String,
    portfolio: String,
    twitter: String,
    stackoverflow: String,
    medium: String,
    behance: String,
    dribbble: String,
    other: [{
      platform: String,
      url: String
    }]
  },
  
  // Additional Information
  additionalInfo: {
    hobbies: [String],
    interests: [String],
    volunteerWork: [{
      organization: String,
      role: String,
      startDate: Date,
      endDate: Date,
      description: String,
      impact: String
    }],
    publications: [{
      title: String,
      publication: String,
      publishedDate: Date,
      url: String,
      coAuthors: [String]
    }],
    awards: [{
      title: String,
      issuedBy: String,
      date: Date,
      description: String
    }],
    references: [{
      name: String,
      designation: String,
      company: String,
      email: String,
      phone: String,
      relationship: String // e.g., "Former Manager", "Colleague"
    }]
  },
  
  // Application Specific Information
  applicationSpecific: {
    coverLetter: String,
    whyInterestedInRole: String,
    whyInterestedInCompany: String,
    availabilityForInterview: {
      preferredDays: [{ type: String, enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] }],
      preferredTimeSlots: [{ type: String, enum: ['morning', 'afternoon', 'evening'] }],
      timezone: String,
      additionalNotes: String
    },
    questionsForEmployer: [String],
    additionalDocuments: [{
      type: { type: String, enum: ['portfolio', 'certificate', 'transcript', 'other'] },
      filename: String,
      url: String,
      description: String
    }]
  },
  
  // Metadata
  submittedAt: { type: Date, default: Date.now },
  lastModified: { type: Date, default: Date.now },
  version: { type: Number, default: 1 }, // For tracking application updates
  isComplete: { type: Boolean, default: true },
  completionPercentage: { type: Number, default: 100 },
  
  // Privacy and Consent
  consent: {
    dataProcessing: { type: Boolean, required: true },
    backgroundCheck: { type: Boolean, default: false },
    contactForFutureOpportunities: { type: Boolean, default: true },
    shareWithPartners: { type: Boolean, default: false }
  }
}, {
  timestamps: true,
  collection: 'applicationdetails'
});

// Indexes for performance
applicationDetailsSchema.index({ applicationId: 1 });
applicationDetailsSchema.index({ applicantId: 1 });
applicationDetailsSchema.index({ jobId: 1 });
applicationDetailsSchema.index({ 'personalInfo.email': 1 });
applicationDetailsSchema.index({ submittedAt: -1 });
applicationDetailsSchema.index({ 'careerInfo.expectedSalary.min': 1 });
applicationDetailsSchema.index({ 'careerInfo.totalExperience': 1 });

// Virtual for full name
applicationDetailsSchema.virtual('fullName').get(function() {
  return `${this.personalInfo.firstName} ${this.personalInfo.lastName}`;
});

// Method to calculate experience
applicationDetailsSchema.methods.calculateTotalExperience = function() {
  let totalMonths = 0;
  
  this.workExperience.forEach(exp => {
    const startDate = new Date(exp.startDate);
    const endDate = exp.isCurrentlyWorking ? new Date() : new Date(exp.endDate);
    
    const diffTime = Math.abs(endDate - startDate);
    const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
    totalMonths += diffMonths;
  });
  
  return Math.round(totalMonths / 12 * 10) / 10; // Round to 1 decimal place
};

// Method to get skill summary
applicationDetailsSchema.methods.getSkillSummary = function() {
  const technical = this.skills.technical.map(skill => skill.name);
  const soft = this.skills.soft.map(skill => skill.name);
  const languages = this.skills.languages.map(lang => lang.language);
  
  return {
    technical,
    soft,
    languages,
    totalSkills: technical.length + soft.length + languages.length
  };
};

// Method to check application completeness
applicationDetailsSchema.methods.checkCompleteness = function() {
  let score = 0;
  let maxScore = 0;
  
  // Personal Info (20 points)
  maxScore += 20;
  if (this.personalInfo.firstName && this.personalInfo.lastName && 
      this.personalInfo.email && this.personalInfo.phone) {
    score += 15;
  }
  if (this.personalInfo.currentLocation.city) score += 5;
  
  // Education (20 points)
  maxScore += 20;
  if (this.education.length > 0) {
    score += 20;
  }
  
  // Experience (20 points)
  maxScore += 20;
  if (this.workExperience.length > 0) {
    score += 20;
  }
  
  // Skills (15 points)
  maxScore += 15;
  if (this.skills.technical.length > 0) score += 10;
  if (this.skills.soft.length > 0) score += 5;
  
  // Career Info (15 points)
  maxScore += 15;
  if (this.careerInfo.expectedSalary.min) score += 10;
  if (this.careerInfo.noticePeriod.duration) score += 5;
  
  // Resume (10 points)
  maxScore += 10;
  if (this.resumeInfo.currentResume.url) score += 10;
  
  const percentage = Math.round((score / maxScore) * 100);
  this.completionPercentage = percentage;
  this.isComplete = percentage >= 80;
  
  return {
    score,
    maxScore,
    percentage,
    isComplete: this.isComplete
  };
};

const ApplicationDetails = mongoose.model('ApplicationDetails', applicationDetailsSchema);

export default ApplicationDetails;
