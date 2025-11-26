import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, sparse: true }, // Made optional for phone-only registration
  password: { type: String }, // Made optional for OAuth/phone registration
  phoneNumber: { type: String, unique: true, sparse: true }, // Added for phone verification
  role: { type: String, enum: ['admin', 'recruiter', 'applicant'], required: true },
  profile: {
    firstName: { type: String },
    lastName: { type: String },
    phone: { type: String }, // Legacy field, use phoneNumber instead
    avatar: { type: String },
    location: {
      city: { type: String },
      state: { type: String },
      country: { type: String },
      coordinates: { type: [Number] }
    }
  },
  // Admin-specific fields
  permissions: {
    canManageUsers: { type: Boolean, default: false },
    canManageJobs: { type: Boolean, default: false },
    canManageSettings: { type: Boolean, default: false },
    canManageRecruiters: { type: Boolean, default: false },
    canManageApplicants: { type: Boolean, default: false },
    canManageCompanies: { type: Boolean, default: false },
    canManageReports: { type: Boolean, default: false },
    canManageAnalytics: { type: Boolean, default: false },
    canManageModeration: { type: Boolean, default: false },
    canManageSystem: { type: Boolean, default: false }
  },
  adminLevel: { 
    type: String, 
    enum: ['super-admin', 'admin', 'moderator'], 
    default: 'admin' 
  },
  verification: {
    email: { type: Boolean, default: false },
    phone: { type: Boolean, default: false },
    emailToken: { type: String },
    phoneToken: { type: String }
  },
  authProviders: {
    google: { type: String }, // Google ID
    phone: { type: Boolean, default: false }, // Phone auth enabled
    firebase: { type: String } // Firebase UID
  },
  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false }, // Legacy field
  lastLogin: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Password comparison method
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) {
    return false;
  }
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('User', userSchema);
