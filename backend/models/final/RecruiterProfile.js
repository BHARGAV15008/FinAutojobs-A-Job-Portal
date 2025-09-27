import mongoose from 'mongoose';
import UnifiedUser from './UnifiedUser.js';

/**
 * RECRUITER PROFILE SCHEMA
 * Extends UnifiedUser with recruiter-specific fields
 */
const recruiterProfileSchema = new mongoose.Schema({
  // === RECRUITER ID ===
  recruiterId: { 
    type: mongoose.Schema.Types.ObjectId, 
    default: () => new mongoose.Types.ObjectId(),
    unique: true,
    index: true
  },
  
  // === COMPANY INFORMATION (Unified structure) ===
  companyInfo: {
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
    companyName: { type: String, required: true }, // From registration
    jobTitle: { type: String, required: true }, // Unified from position/designation
    department: { type: String },
    employeeId: { type: String },
    workEmail: { type: String },
    workPhone: { type: String },
    joiningDate: { type: Date },
    reportingManager: { type: String },
    
    // Work Location
    workLocation: {
      address: { type: String },
      city: { type: String },
      state: { type: String },
      country: { type: String, default: 'India' },
      postalCode: { type: String },
      isRemoteWork: { type: Boolean, default: false }
    }
  },
  
  // === PROFESSIONAL DETAILS ===
  professionalInfo: {
    yearsOfExperience: { type: Number, default: 0 },
    specializations: [{ type: String }], // e.g., 'Technical Recruiting'
    industryExpertise: [{ type: String }], // e.g., 'IT', 'Healthcare'
    certifications: [{
      name: { type: String },
      issuedBy: { type: String },
      issuedDate: { type: Date },
      expiryDate: { type: Date },
      credentialUrl: { type: String }
    }]
  },
  
  // === RECRUITING STATISTICS ===
  recruitingStats: {
    totalJobsPosted: { type: Number, default: 0 },
    activeJobs: { type: Number, default: 0 },
    totalApplications: { type: Number, default: 0 },
    totalHires: { type: Number, default: 0 },
    averageTimeToHire: { type: Number, default: 0 }, // in days
    successRate: { type: Number, default: 0 }, // percentage
    candidatesSourced: { type: Number, default: 0 },
    interviewsConducted: { type: Number, default: 0 },
    
    // Monthly metrics
    monthlyStats: {
      currentMonth: {
        jobsPosted: { type: Number, default: 0 },
        applicationsReceived: { type: Number, default: 0 },
        hiresCompleted: { type: Number, default: 0 }
      }
    }
  },
  
  // === SUBSCRIPTION & LIMITS ===
  subscription: {
    planType: { type: String, enum: ['basic', 'premium', 'enterprise'], default: 'basic' },
    planStartDate: { type: Date, default: Date.now },
    planEndDate: { type: Date },
    
    // Credits and limits
    jobPostingCredits: { type: Number, default: 5 },
    candidateViewCredits: { type: Number, default: 100 },
    premiumSearchCredits: { type: Number, default: 0 },
    
    // Usage tracking
    creditsUsed: {
      jobPostings: { type: Number, default: 0 },
      candidateViews: { type: Number, default: 0 },
      premiumSearches: { type: Number, default: 0 }
    }
  },
  
  // === PREFERENCES ===
  preferences: {
    // Communication preferences
    communicationMethods: [{ type: String, enum: ['email', 'phone', 'sms', 'whatsapp'] }],
    autoResponseEnabled: { type: Boolean, default: false },
    autoResponseMessage: { type: String },
    
    // Notification settings
    notifications: {
      newApplications: { type: Boolean, default: true },
      candidateMessages: { type: Boolean, default: true },
      interviewReminders: { type: Boolean, default: true },
      jobExpiryAlerts: { type: Boolean, default: true },
      weeklyReports: { type: Boolean, default: true },
      marketingEmails: { type: Boolean, default: false }
    },
    
    // Search preferences
    defaultJobFilters: {
      experienceRange: { min: Number, max: Number },
      salaryRange: { min: Number, max: Number },
      preferredLocations: [{ type: String }],
      skillsRequired: [{ type: String }]
    }
  },
  
  // === DOCUMENTS ===
  documents: {
    companyLogo: {
      url: { type: String },
      filename: { type: String },
      uploadedAt: { type: Date }
    },
    businessLicense: {
      url: { type: String },
      filename: { type: String },
      uploadedAt: { type: Date }
    },
    otherDocuments: [{
      name: { type: String },
      url: { type: String },
      filename: { type: String },
      uploadedAt: { type: Date }
    }]
  },
  
  // === RELATIONSHIPS (Consistent IDs) ===
  postedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
  managedApplications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Application' }],
  scheduledInterviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Interview' }],
  savedCandidates: [{ type: mongoose.Schema.Types.ObjectId, ref: 'UnifiedUser' }],
  
  // === TEAM MANAGEMENT ===
  teamInfo: {
    isTeamLead: { type: Boolean, default: false },
    teamMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'UnifiedUser' }],
    reportsTo: { type: mongoose.Schema.Types.ObjectId, ref: 'UnifiedUser' }
  }
});

// === INDEXES ===
recruiterProfileSchema.index({ recruiterId: 1 }, { unique: true });
recruiterProfileSchema.index({ 'companyInfo.companyId': 1 });
recruiterProfileSchema.index({ 'companyInfo.companyName': 1 });
recruiterProfileSchema.index({ 'subscription.planType': 1 });

// === CREATE DISCRIMINATOR ===
const RecruiterProfile = UnifiedUser.discriminator('recruiter', recruiterProfileSchema);

export default RecruiterProfile;
