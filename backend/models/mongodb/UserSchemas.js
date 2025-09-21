import mongoose from 'mongoose';

// Base User Schema with common fields
const baseUserSchema = {
  // Authentication fields
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  
  // Personal Information
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  phone: {
    type: String,
    trim: true,
    match: [/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number']
  },
  location: {
    type: String,
    trim: true,
    maxlength: 200
  },
  bio: {
    type: String,
    maxlength: 1000
  },
  
  // Social Links
  linkedin_url: {
    type: String,
    match: [/^https?:\/\/.+/, 'Please enter a valid URL']
  },
  github_url: {
    type: String,
    match: [/^https?:\/\/.+/, 'Please enter a valid URL']
  },
  portfolio_url: {
    type: String,
    match: [/^https?:\/\/.+/, 'Please enter a valid URL']
  },
  
  // Profile Management
  profile_picture: {
    type: String, // URL to profile picture
    default: null
  },
  profileComplete: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  
  // Account Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date,
    default: null
  }
};

// Applicant Schema
const applicantSchema = new mongoose.Schema({
  ...baseUserSchema,
  role: {
    type: String,
    default: 'applicant',
    immutable: true
  },
  
  // Professional Information
  skills: [{
    type: String,
    trim: true,
    maxlength: 50
  }],
  experience_years: {
    type: Number,
    min: 0,
    max: 50,
    default: 0
  },
  qualification: {
    type: String,
    trim: true,
    maxlength: 200
  },
  
  // Job Preferences
  preferred_job_type: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Contract', 'Remote', 'Internship', 'Freelance']
  },
  preferred_work_mode: {
    type: String,
    enum: ['Remote', 'Hybrid', 'On-site']
  },
  expected_salary_min: {
    type: Number,
    min: 0
  },
  expected_salary_max: {
    type: Number,
    min: 0
  },
  salary_currency: {
    type: String,
    default: 'INR',
    maxlength: 3
  },
  
  // Resume Information
  resume_url: {
    type: String,
    default: null
  },
  
  // Application Tracking
  applications: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Application'
  }],
  saved_jobs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
  }],
  
  // Notifications Preferences
  notifications: {
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: true },
    jobAlerts: { type: Boolean, default: true },
    messages: { type: Boolean, default: false }
  }
});

// Recruiter Schema
const recruiterSchema = new mongoose.Schema({
  ...baseUserSchema,
  role: {
    type: String,
    default: 'recruiter',
    immutable: true
  },
  
  // Company Information
  company: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  department: {
    type: String,
    trim: true,
    maxlength: 100
  },
  job_title: {
    type: String,
    trim: true,
    maxlength: 100
  },
  experience_years: {
    type: Number,
    min: 0,
    max: 50,
    default: 0
  },
  
  // Company Details
  company_size: {
    type: String,
    enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']
  },
  industry: {
    type: String,
    trim: true,
    maxlength: 100
  },
  
  // Job Management
  posted_jobs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
  }],
  
  // Permissions
  permissions: {
    canPostJobs: { type: Boolean, default: true },
    canViewApplications: { type: Boolean, default: true },
    canManageTeam: { type: Boolean, default: false }
  },
  
  // Notifications Preferences
  notifications: {
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: true },
    newApplications: { type: Boolean, default: true },
    messages: { type: Boolean, default: true }
  }
});

// Admin Schema
const adminSchema = new mongoose.Schema({
  ...baseUserSchema,
  role: {
    type: String,
    default: 'admin',
    immutable: true
  },
  
  // Administrative Information
  department: {
    type: String,
    default: 'System Administration',
    trim: true,
    maxlength: 100
  },
  access_level: {
    type: String,
    enum: ['Super Admin', 'Admin', 'Moderator'],
    default: 'Admin'
  },
  experience_years: {
    type: Number,
    min: 0,
    max: 50,
    default: 0
  },
  
  // Admin Permissions
  permissions: {
    manageUsers: { type: Boolean, default: true },
    manageJobs: { type: Boolean, default: true },
    manageCompanies: { type: Boolean, default: true },
    viewAnalytics: { type: Boolean, default: true },
    systemSettings: { type: Boolean, default: false }
  },
  
  // Activity Tracking
  lastActivity: {
    type: Date,
    default: Date.now
  },
  
  // Notifications Preferences
  notifications: {
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: true },
    systemAlerts: { type: Boolean, default: true },
    userReports: { type: Boolean, default: true }
  }
});

// Add indexes for better performance
applicantSchema.index({ email: 1 });
applicantSchema.index({ skills: 1 });
applicantSchema.index({ location: 1 });
applicantSchema.index({ createdAt: -1 });

recruiterSchema.index({ email: 1 });
recruiterSchema.index({ company: 1 });
recruiterSchema.index({ industry: 1 });
recruiterSchema.index({ createdAt: -1 });

adminSchema.index({ email: 1 });
adminSchema.index({ access_level: 1 });
adminSchema.index({ createdAt: -1 });

// Pre-save middleware to update timestamps and calculate profile completion
const updateTimestamp = function(next) {
  this.updatedAt = new Date();
  next();
};

const calculateProfileCompletion = function(next) {
  let completion = 0;
  const totalFields = this.role === 'applicant' ? 12 : this.role === 'recruiter' ? 10 : 8;
  
  // Count filled fields based on role
  if (this.name) completion++;
  if (this.email) completion++;
  if (this.phone) completion++;
  if (this.location) completion++;
  if (this.bio) completion++;
  if (this.linkedin_url) completion++;
  
  if (this.role === 'applicant') {
    if (this.skills && this.skills.length > 0) completion++;
    if (this.qualification) completion++;
    if (this.experience_years !== undefined) completion++;
    if (this.preferred_job_type) completion++;
    if (this.github_url) completion++;
    if (this.portfolio_url) completion++;
  } else if (this.role === 'recruiter') {
    if (this.company) completion++;
    if (this.department) completion++;
    if (this.job_title) completion++;
    if (this.experience_years !== undefined) completion++;
  } else if (this.role === 'admin') {
    if (this.department) completion++;
    if (this.access_level) completion++;
  }
  
  this.profileComplete = Math.round((completion / totalFields) * 100);
  next();
};

applicantSchema.pre('save', updateTimestamp);
applicantSchema.pre('save', calculateProfileCompletion);

recruiterSchema.pre('save', updateTimestamp);
recruiterSchema.pre('save', calculateProfileCompletion);

adminSchema.pre('save', updateTimestamp);
adminSchema.pre('save', calculateProfileCompletion);

// Create models
export const Applicant = mongoose.model('Applicant', applicantSchema);
export const Recruiter = mongoose.model('Recruiter', recruiterSchema);
export const Admin = mongoose.model('Admin', adminSchema);

// Helper function to get the appropriate model based on role
export const getUserModel = (role) => {
  switch (role) {
    case 'applicant':
      return Applicant;
    case 'recruiter':
      return Recruiter;
    case 'admin':
      return Admin;
    default:
      throw new Error(`Invalid user role: ${role}`);
  }
};

// Export schemas for reference
export { applicantSchema, recruiterSchema, adminSchema };
