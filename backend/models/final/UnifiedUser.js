import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * FINAL UNIFIED USER SCHEMA
 * This replaces all existing user models with consistent naming
 */
const unifiedUserSchema = new mongoose.Schema({
  // === CORE IDENTITY ===
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    default: () => new mongoose.Types.ObjectId(),
    unique: true,
    index: true
  },
  
  // === BASIC INFO (Consistent naming) ===
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  fullName: { type: String, trim: true }, // Auto-generated
  email: { type: String, required: true, lowercase: true, unique: true },
  phone: { type: String, required: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['applicant', 'recruiter', 'admin'], required: true },
  
  // === PROFILE INFO ===
  profileImage: { 
    url: { type: String },
    filename: { type: String },
    uploadedAt: { type: Date }
  },
  bio: { type: String, maxlength: 2000 },
  
  // === ADDRESS (Unified structure) ===
  address: {
    street: { type: String },
    city: { type: String },
    state: { type: String },
    country: { type: String, default: 'India' },
    postalCode: { type: String },
    coordinates: {
      latitude: { type: Number },
      longitude: { type: Number }
    }
  },
  
  // === SOCIAL LINKS (Unified naming) ===
  socialLinks: {
    linkedinUrl: { type: String },
    githubUrl: { type: String },
    portfolioUrl: { type: String },
    twitterUrl: { type: String },
    personalWebsite: { type: String }
  },
  
  // === ACCOUNT STATUS ===
  accountStatus: {
    isActive: { type: Boolean, default: true },
    isEmailVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },
    profileCompleted: { type: Boolean, default: false },
    completionPercentage: { type: Number, default: 0 },
    lastLogin: { type: Date },
    lastActivity: { type: Date, default: Date.now }
  },
  
  // === SECURITY ===
  security: {
    loginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date },
    passwordChangedAt: { type: Date },
    twoFactorEnabled: { type: Boolean, default: false }
  },
  
  // === SESSIONS ===
  activeSessions: [{
    sessionId: { type: String, required: true },
    deviceInfo: { type: String },
    ipAddress: { type: String },
    userAgent: { type: String },
    location: { type: String },
    createdAt: { type: Date, default: Date.now },
    lastActivity: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true }
  }]
}, {
  timestamps: true,
  discriminatorKey: 'role',
  collection: 'unified_users'
});

// === INDEXES ===
unifiedUserSchema.index({ email: 1, role: 1 }, { unique: true });
unifiedUserSchema.index({ userId: 1 }, { unique: true });
unifiedUserSchema.index({ phone: 1 });
unifiedUserSchema.index({ 'accountStatus.isActive': 1 });

// === VIRTUAL FIELDS ===
unifiedUserSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// === PRE-SAVE MIDDLEWARE ===
unifiedUserSchema.pre('save', async function(next) {
  // Hash password if modified
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
    this.security.passwordChangedAt = new Date();
  }
  
  // Update full name
  if (this.firstName && this.lastName) {
    this.fullName = `${this.firstName} ${this.lastName}`;
  }
  
  // Calculate completion percentage
  this.accountStatus.completionPercentage = this.calculateCompletionPercentage();
  
  next();
});

// === METHODS ===
unifiedUserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

unifiedUserSchema.methods.calculateCompletionPercentage = function() {
  let completed = 0;
  const total = 10;
  
  // Basic info (4 points)
  if (this.firstName) completed++;
  if (this.lastName) completed++;
  if (this.email) completed++;
  if (this.phone) completed++;
  
  // Additional info (6 points)
  if (this.bio) completed++;
  if (this.profileImage?.url) completed++;
  if (this.address?.city) completed++;
  if (this.socialLinks?.linkedinUrl) completed++;
  if (this.accountStatus?.isEmailVerified) completed++;
  if (this.accountStatus?.isPhoneVerified) completed++;
  
  return Math.round((completed / total) * 100);
};

export default mongoose.model('UnifiedUser', unifiedUserSchema);
