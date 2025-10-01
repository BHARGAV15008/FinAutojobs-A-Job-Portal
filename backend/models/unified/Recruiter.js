import mongoose from 'mongoose';
import BaseUser from './BaseUser.js';

// Enhanced Recruiter Schema with all registration fields
const recruiterSchema = new mongoose.Schema({
  // Recruiter ID (consistent with naming convention)
  recruiterId: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId(), unique: true },
  
  // Company Information (Required for registration)
  companyInfo: {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
    companyName: { type: String, required: false }, // Made optional for existing users
    department: { type: String },
    designation: { type: String }, // Job title/position
    jobTitle: { type: String }, // Alternative field name
    employeeId: { type: String },
    workLocation: {
      city: { type: String },
      state: { type: String },
      country: { type: String, default: 'India' }
    }
  },
  
  // Office Location (for recruiters)
  officeLocation: {
    city: { type: String },
    state: { type: String },
    country: { type: String, default: 'India' },
    address: { type: String }
  },
  
  // Professional Links (Enhanced)
  professionalLinks: {
    linkedin: { type: String },
    github: { type: String },
    personalWebsite: { type: String },
    companyWebsite: { type: String },
    otherUrls: [{ type: String }]
  },
  
  // Professional Details
  specializations: [{ type: String }],
  industryExpertise: [{ type: String }],
  
  // Recruiting Stats
  recruitingStats: {
    totalJobsPosted: { type: Number, default: 0 },
    activeJobs: { type: Number, default: 0 },
    totalHires: { type: Number, default: 0 },
    averageTimeToHire: { type: Number, default: 0 },
    successRate: { type: Number, default: 0 }
  },
  
  // Subscription & Limits
  subscription: {
    planType: { type: String, enum: ['basic', 'premium', 'enterprise'], default: 'basic' },
    jobPostingCredits: { type: Number, default: 5 },
    candidateViewCredits: { type: Number, default: 100 },
    expiresAt: { type: Date }
  },
  
  // Preferences
  preferences: {
    autoResponseEnabled: { type: Boolean, default: false },
    notificationSettings: {
      newApplications: { type: Boolean, default: true },
      candidateMessages: { type: Boolean, default: true },
      interviewReminders: { type: Boolean, default: true },
      jobExpiryAlerts: { type: Boolean, default: true }
    }
  },
  
  // Related Data (References with consistent IDs)
  postedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
  managedApplications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Application' }],
  scheduledInterviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Interview' }]
});

// Indexes for performance
recruiterSchema.index({ recruiterId: 1 }, { unique: true });
recruiterSchema.index({ 'companyInfo.companyId': 1 });
recruiterSchema.index({ 'companyInfo.companyName': 1 });

// Create discriminator
const Recruiter = BaseUser.discriminator('recruiter', recruiterSchema);

export default Recruiter;
