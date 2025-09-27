import mongoose from 'mongoose';
import BaseUser from './BaseUser.js';

// Enhanced Applicant Schema with all registration fields
const applicantSchema = new mongoose.Schema({
  // Applicant ID (consistent with naming convention)
  applicantId: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId(), unique: true },
  
  // Current Location (for applicants)
  currentLocation: {
    city: { type: String },
    state: { type: String },
    country: { type: String, default: 'India' },
    address: { type: String }
  },
  
  // Career Information
  careerInfo: {
    currentJobTitle: { type: String },
    currentCompany: { type: String },
    currentSalary: { type: Number },
    expectedSalary: { type: Number },
    noticePeriod: { type: String, enum: ['immediate', '15days', '1month', '2months', '3months'] },
    workLocation: {
      city: { type: String },
      state: { type: String },
      country: { type: String, default: 'India' }
    }
  },
  
  // Skills & Expertise (Enhanced for registration)
  skills: {
    technical: [{ type: String }],
    soft: [{ type: String }],
    primary: [{ type: String }], // Main skills for registration
    languages: [{
      language: { type: String },
      proficiency: { type: String, enum: ['basic', 'intermediate', 'advanced', 'native'] }
    }]
  },
  
  // Languages (Separate field for registration)
  languages: [{
    name: { type: String },
    proficiency: { type: String, enum: ['basic', 'intermediate', 'advanced', 'native'] }
  }],
  
  // Education
  education: [{
    educationId: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
    institution: { type: String, required: true },
    degree: { type: String, required: true },
    fieldOfStudy: { type: String },
    startDate: { type: Date },
    endDate: { type: Date },
    grade: { type: String },
    isCurrentlyStudying: { type: Boolean, default: false }
  }],
  
  // Work Experience
  workExperience: [{
    experienceId: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
    companyName: { type: String, required: true },
    jobTitle: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    isCurrentJob: { type: Boolean, default: false },
    description: { type: String },
    achievements: [{ type: String }]
  }],
  
  // Documents
  documents: {
    resumeUrl: { type: String },
    coverLetterUrl: { type: String },
    portfolioUrl: { type: String },
    certificates: [{ type: String }]
  },
  
  // Job Preferences
  jobPreferences: {
    preferredJobTypes: [{ type: String, enum: ['full-time', 'part-time', 'contract', 'internship', 'freelance'] }],
    preferredLocations: [{ type: String }],
    remoteWorkPreference: { type: Boolean, default: false },
    willingToRelocate: { type: Boolean, default: false },
    preferredIndustries: [{ type: String }]
  },
  
  // Profile Completion
  profileCompletion: {
    basicInfo: { type: Boolean, default: true },
    education: { type: Boolean, default: false },
    experience: { type: Boolean, default: false },
    skills: { type: Boolean, default: false },
    preferences: { type: Boolean, default: false },
    documents: { type: Boolean, default: false },
    completionPercentage: { type: Number, default: 10 }
  },
  
  // Application History (References with consistent IDs)
  appliedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Application' }],
  savedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
  scheduledInterviews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Interview' }]
});

// Indexes for performance
applicantSchema.index({ applicantId: 1 }, { unique: true });
applicantSchema.index({ 'careerInfo.currentJobTitle': 1 });
applicantSchema.index({ 'skills.technical': 1 });

// Create discriminator
const Applicant = BaseUser.discriminator('applicant', applicantSchema);

export default Applicant;
