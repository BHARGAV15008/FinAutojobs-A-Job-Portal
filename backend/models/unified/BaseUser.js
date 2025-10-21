import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Enhanced Base User Schema with all required fields for registration
const baseUserSchema = new mongoose.Schema({
  // Standard IDs
  userId: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
  
  // Personal Info (Required for registration)
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  username: { type: String, required: true, trim: true, lowercase: true },
  fullName: { type: String, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  phone: { type: String, required: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['applicant', 'recruiter', 'admin'], required: true },
  
  // Profile Info
  profileImage: { type: String },
  bio: { type: String, maxlength: 500 },
  
  // Location (Enhanced for both roles)
  location: { type: String }, // Current location/city
  address: {
    city: { type: String },
    state: { type: String },
    country: { type: String, default: 'India' },
    postalCode: { type: String }
  },
  
  // Social Links (Enhanced with all URLs)
  linkedin_url: { type: String },
  github_url: { type: String },
  portfolio_url: { type: String },
  socialLinks: {
    linkedinUrl: { type: String },
    githubUrl: { type: String },
    portfolioUrl: { type: String },
    otherUrls: [{ type: String }]
  },
  
  // Experience (Common field)
  yearsOfExperience: { type: Number, default: 0 },
  
  // Status & Admin Actions
  status: { type: String, enum: ['active', 'inactive', 'suspended'], default: 'active' },
  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
  isEmailVerified: { type: Boolean, default: false },
  isPhoneVerified: { type: Boolean, default: false },
  isDeleted: { type: Boolean, default: false },
  
  // Admin Action Tracking
  suspendedAt: { type: Date },
  suspendedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'BaseUser' },
  suspensionReason: { type: String },
  activatedAt: { type: Date },
  activatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'BaseUser' },
  deletedAt: { type: Date },
  deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'BaseUser' },
  
  // Security & Activity Tracking
  loginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date },
  lastLogin: { type: Date },
  lastActivity: { type: Date },
  
  // OAuth Providers
  oauthProviders: [{
    provider: { type: String, enum: ['google', 'microsoft', 'apple'] },
    providerId: { type: String },
    accessToken: { type: String },
    refreshToken: { type: String },
    connectedAt: { type: Date, default: Date.now }
  }],
  
  // Sessions
  activeSessions: [{
    sessionId: String,
    deviceInfo: String,
    ipAddress: String,
    createdAt: { type: Date, default: Date.now },
    lastActivity: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true,
  discriminatorKey: 'role'
});

// Indexes for authentication and uniqueness
baseUserSchema.index({ email: 1, role: 1 }, { unique: true });
baseUserSchema.index({ username: 1 }, { unique: true });
baseUserSchema.index({ phone: 1, role: 1 });
baseUserSchema.index({ userId: 1 }, { unique: true });

// Pre-save middleware
baseUserSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
  }
  if (this.firstName && this.lastName) {
    this.fullName = `${this.firstName} ${this.lastName}`;
  }
  next();
});

// Methods
baseUserSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

export default mongoose.model('BaseUser', baseUserSchema);
