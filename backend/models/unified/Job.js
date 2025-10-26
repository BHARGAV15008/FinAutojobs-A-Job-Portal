import mongoose from 'mongoose';

// Unified Job Schema with consistent naming and linking
const jobSchema = new mongoose.Schema({
  // Job ID (consistent with naming convention)
  jobId: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId(), unique: true },
  
  // Recruiter Reference (consistent ID linking)
  recruiterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  
  // Job Basic Information
  jobTitle: { type: String, required: true, trim: true },
  jobDescription: { type: String, required: true },
  jobType: { type: String, enum: ['full-time', 'part-time', 'contract', 'internship', 'freelance'], required: true },
  
  // Company Information
  companyInfo: {
    companyName: { type: String, required: true },
    companyLogo: { type: String },
    companyWebsite: { type: String },
    companySize: { type: String, enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'] }
  },
  
  // Location Information
  jobLocation: {
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, default: 'India' },
    isRemote: { type: Boolean, default: false },
    workType: { type: String, enum: ['onsite', 'remote', 'hybrid'], default: 'onsite' }
  },
  
  // Requirements
  requirements: {
    yearsOfExperience: { type: Number, required: true },
    education: { type: String },
    skills: [{ type: String }],
    qualifications: [{ type: String }]
  },
  
  // Salary Information
  salaryInfo: {
    minSalary: { type: Number },
    maxSalary: { type: Number },
    currency: { type: String, default: 'INR' },
    salaryType: { type: String, enum: ['annual', 'monthly', 'hourly'], default: 'annual' },
    isNegotiable: { type: Boolean, default: true }
  },
  
  // Job Details
  jobDetails: {
    department: { type: String },
    industry: { type: String },
    employmentType: { type: String, enum: ['permanent', 'temporary', 'contract'] },
    benefits: [{ type: String }],
    workingHours: { type: String }
  },
  
  // Application Settings
  applicationSettings: {
    applicationDeadline: { type: Date },
    maxApplications: { type: Number },
    requiresCoverLetter: { type: Boolean, default: false },
    requiresPortfolio: { type: Boolean, default: false },
    customQuestions: [{ type: String }]
  },
  
  // Status and Metrics
  jobStatus: { type: String, enum: ['draft', 'active', 'paused', 'closed', 'expired'], default: 'draft' },
  isActive: { type: Boolean, default: true },
  
  // Application Tracking
  applicationStats: {
    totalApplications: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },
    shortlistedCount: { type: Number, default: 0 },
    hiredCount: { type: Number, default: 0 }
  },
  
  // Related Data (References with consistent IDs)
  applications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Application' }],
  
  // SEO and Search
  tags: [{ type: String }],
  searchKeywords: [{ type: String }]
}, {
  timestamps: true
});

// Indexes for performance and search
jobSchema.index({ jobId: 1 }, { unique: true });
jobSchema.index({ recruiterId: 1 });
jobSchema.index({ companyId: 1 });
jobSchema.index({ jobTitle: 'text', jobDescription: 'text' });
jobSchema.index({ 'jobLocation.city': 1, 'jobLocation.state': 1 });
jobSchema.index({ jobStatus: 1, isActive: 1 });
jobSchema.index({ 'requirements.skills': 1 });
jobSchema.index({ createdAt: -1 });

export default mongoose.model('Job', jobSchema);
