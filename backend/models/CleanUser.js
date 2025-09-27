import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * CLEAN USER MODEL - Single source of truth
 * Replaces all conflicting user models
 */
const cleanUserSchema = new mongoose.Schema({
  // === CORE IDENTITY ===
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, unique: true },
  phone: { type: String, required: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['applicant', 'recruiter', 'admin'], required: true },
  
  // === PROFILE INFO ===
  bio: { type: String, maxlength: 2000 },
  profileImage: { 
    url: { type: String },
    filename: { type: String },
    uploadedAt: { type: Date }
  },
  
  // === SOCIAL LINKS (Unified naming) ===
  socialLinks: {
    linkedinUrl: { type: String },
    githubUrl: { type: String },
    portfolioUrl: { type: String }
  },
  
  // === DIRECT SOCIAL LINK FIELDS (for compatibility) ===
  linkedin_url: { type: String },
  github_url: { type: String },
  portfolio_url: { type: String },
  
  // === LOCATION FIELD (for easy access) ===
  location: { type: String },
  
  // === ADDRESS ===
  address: {
    city: { type: String },
    state: { type: String },
    country: { type: String, default: 'India' }
  },
  
  // === RECRUITER FIELDS ===
  companyInfo: {
    companyName: { type: String },
    jobTitle: { type: String },
    department: { type: String }
  },
  yearsOfExperience: { type: Number, default: 0 },
  recruitingStats: {
    totalJobsPosted: { type: Number, default: 0 },
    activeJobs: { type: Number, default: 0 },
    totalHires: { type: Number, default: 0 }
  },
  
  // === APPLICANT FIELDS ===
  careerInfo: {
    currentJobTitle: { type: String },
    currentCompany: { type: String },
    expectedSalary: { type: Number },
    yearsOfExperience: { type: Number, default: 0 }
  },
  skills: {
    technical: [{ type: String }],
    soft: [{ type: String }]
  },
  qualification: { type: String },
  resume_url: { type: String },
  
  // === SOCIAL LINKS ===
  linkedin_url: { type: String },
  github_url: { type: String },
  portfolio_url: { type: String },
  
  // === LOCATION FIELDS ===
  officeLocation: {
    city: { type: String },
    state: { type: String },
    country: { type: String }
  },
  
  // === STATUS ===
  isActive: { type: Boolean, default: true },
  isEmailVerified: { type: Boolean, default: false },
  lastLogin: { type: Date }
}, {
  timestamps: true
});

// === INDEXES ===
cleanUserSchema.index({ email: 1, role: 1 }, { unique: true });

// === VIRTUAL FIELDS ===
cleanUserSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// === PRE-SAVE MIDDLEWARE ===
cleanUserSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  next();
});

// === METHODS ===
cleanUserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// === CREATE MODEL ===
const CleanUser = mongoose.model('CleanUser', cleanUserSchema);

export default CleanUser;
