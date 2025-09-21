/**
 * Base User Schema
 * 
 * Contains common fields and validations shared across all user types.
 * This schema serves as the foundation for Applicant, Recruiter, and Admin schemas.
 * 
 * @author FinAutoJobs Team
 * @version 1.0.0
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const BaseUserSchema = new mongoose.Schema({
  // Authentication & Identity
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      'Please enter a valid email address'
    ],
    index: true
  },
  
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
    select: false // Don't include password in queries by default
  },
  
  // Personal Information
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  
  fullName: {
    type: String,
    trim: true
  },
  
  phone: {
    type: String,
    trim: true,
    match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
  },
  
  dateOfBirth: {
    type: Date,
    validate: {
      validator: function(value) {
        return !value || value < new Date();
      },
      message: 'Date of birth cannot be in the future'
    }
  },
  
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer_not_to_say'],
    lowercase: true
  },
  
  // Location Information
  location: {
    address: {
      type: String,
      trim: true,
      maxlength: [200, 'Address cannot exceed 200 characters']
    },
    city: {
      type: String,
      trim: true,
      maxlength: [50, 'City cannot exceed 50 characters']
    },
    state: {
      type: String,
      trim: true,
      maxlength: [50, 'State cannot exceed 50 characters']
    },
    country: {
      type: String,
      trim: true,
      maxlength: [50, 'Country cannot exceed 50 characters'],
      default: 'India'
    },
    pincode: {
      type: String,
      trim: true,
      match: [/^\d{6}$/, 'Please enter a valid 6-digit pincode']
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  
  // Profile Information
  profilePicture: {
    url: {
      type: String,
      trim: true
    },
    publicId: {
      type: String,
      trim: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  },
  
  bio: {
    type: String,
    trim: true,
    maxlength: [500, 'Bio cannot exceed 500 characters']
  },
  
  // Social Links
  socialLinks: {
    linkedin: {
      type: String,
      trim: true,
      match: [/^https?:\/\/(www\.)?linkedin\.com\/.*/, 'Please enter a valid LinkedIn URL']
    },
    github: {
      type: String,
      trim: true,
      match: [/^https?:\/\/(www\.)?github\.com\/.*/, 'Please enter a valid GitHub URL']
    },
    portfolio: {
      type: String,
      trim: true,
      match: [/^https?:\/\/.*/, 'Please enter a valid portfolio URL']
    },
    twitter: {
      type: String,
      trim: true,
      match: [/^https?:\/\/(www\.)?twitter\.com\/.*/, 'Please enter a valid Twitter URL']
    }
  },
  
  // Account Status & Verification
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'pending_verification'],
    default: 'pending_verification',
    index: true
  },
  
  isEmailVerified: {
    type: Boolean,
    default: false,
    index: true
  },
  
  isPhoneVerified: {
    type: Boolean,
    default: false
  },
  
  emailVerificationToken: {
    type: String,
    select: false
  },
  
  emailVerificationExpires: {
    type: Date,
    select: false
  },
  
  phoneVerificationCode: {
    type: String,
    select: false
  },
  
  phoneVerificationExpires: {
    type: Date,
    select: false
  },
  
  // Password Reset
  passwordResetToken: {
    type: String,
    select: false
  },
  
  passwordResetExpires: {
    type: Date,
    select: false
  },
  
  passwordChangedAt: {
    type: Date,
    select: false
  },
  
  // Profile Completion
  profileCompletion: {
    percentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    completedFields: [{
      type: String
    }],
    missingFields: [{
      type: String
    }],
    lastCalculated: {
      type: Date,
      default: Date.now
    }
  },
  
  // Security & Privacy
  twoFactorAuth: {
    enabled: {
      type: Boolean,
      default: false
    },
    secret: {
      type: String,
      select: false
    },
    backupCodes: [{
      type: String,
      select: false
    }]
  },
  
  privacySettings: {
    profileVisibility: {
      type: String,
      enum: ['public', 'private', 'connections_only'],
      default: 'public'
    },
    showEmail: {
      type: Boolean,
      default: false
    },
    showPhone: {
      type: Boolean,
      default: false
    },
    allowMessages: {
      type: Boolean,
      default: true
    }
  },
  
  // Activity Tracking
  lastLogin: {
    type: Date,
    index: true
  },
  
  lastActivity: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  loginAttempts: {
    count: {
      type: Number,
      default: 0
    },
    lastAttempt: Date,
    lockedUntil: Date
  },
  
  // Device & Session Information
  devices: [{
    deviceId: String,
    deviceType: {
      type: String,
      enum: ['desktop', 'mobile', 'tablet']
    },
    browser: String,
    os: String,
    lastUsed: {
      type: Date,
      default: Date.now
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  
  // Preferences
  preferences: {
    language: {
      type: String,
      default: 'en',
      enum: ['en', 'hi', 'mr', 'gu', 'ta', 'te', 'kn', 'ml', 'bn']
    },
    timezone: {
      type: String,
      default: 'Asia/Kolkata'
    },
    currency: {
      type: String,
      default: 'INR',
      enum: ['INR', 'USD', 'EUR', 'GBP']
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system'
    },
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      sms: {
        type: Boolean,
        default: false
      },
      push: {
        type: Boolean,
        default: true
      }
    }
  },
  
  // Metadata
  source: {
    type: String,
    enum: ['web', 'mobile', 'api', 'import'],
    default: 'web'
  },
  
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  tags: [{
    type: String,
    trim: true
  }],
  
  notes: [{
    content: {
      type: String,
      required: true
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    },
    isPrivate: {
      type: Boolean,
      default: true
    }
  }]
}, {
  timestamps: true,
  versionKey: false,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.passwordResetToken;
      delete ret.passwordResetExpires;
      delete ret.emailVerificationToken;
      delete ret.phoneVerificationCode;
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// Indexes for better query performance
BaseUserSchema.index({ email: 1 });
BaseUserSchema.index({ status: 1, isEmailVerified: 1 });
BaseUserSchema.index({ lastActivity: -1 });
BaseUserSchema.index({ 'location.city': 1, 'location.state': 1 });
BaseUserSchema.index({ createdAt: -1 });
BaseUserSchema.index({ fullName: 'text', email: 'text' });

// Virtual for full name
BaseUserSchema.virtual('displayName').get(function() {
  return this.fullName || `${this.firstName} ${this.lastName}`;
});

// Virtual for age
BaseUserSchema.virtual('age').get(function() {
  if (!this.dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(this.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
});

// Pre-save middleware
BaseUserSchema.pre('save', async function(next) {
  // Hash password if modified
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordChangedAt = new Date();
  }
  
  // Set full name
  if (this.isModified('firstName') || this.isModified('lastName')) {
    this.fullName = `${this.firstName} ${this.lastName}`.trim();
  }
  
  // Update last activity
  this.lastActivity = new Date();
  
  next();
});

// Instance methods
BaseUserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

BaseUserSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

BaseUserSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  return resetToken;
};

BaseUserSchema.methods.calculateProfileCompletion = function() {
  const requiredFields = [
    'firstName', 'lastName', 'email', 'phone', 'bio',
    'location.city', 'location.state', 'profilePicture.url'
  ];
  
  let completedCount = 0;
  const completedFields = [];
  const missingFields = [];
  
  requiredFields.forEach(field => {
    const fieldValue = field.includes('.') 
      ? field.split('.').reduce((obj, key) => obj?.[key], this)
      : this[field];
      
    if (fieldValue && fieldValue.toString().trim()) {
      completedCount++;
      completedFields.push(field);
    } else {
      missingFields.push(field);
    }
  });
  
  const percentage = Math.round((completedCount / requiredFields.length) * 100);
  
  this.profileCompletion = {
    percentage,
    completedFields,
    missingFields,
    lastCalculated: new Date()
  };
  
  return percentage;
};

export default BaseUserSchema;
