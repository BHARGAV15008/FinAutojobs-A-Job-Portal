import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 50
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
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
  phone: {
    type: String,
    trim: true
  },
  role: {
    type: String,
    enum: ['applicant', 'recruiter', 'admin'],
    default: 'applicant'
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  phoneVerified: {
    type: Boolean,
    default: false
  },
  profileCompleted: {
    type: Boolean,
    default: false
  },
  // Professional fields for applicants
  currentJobTitle: String,
  experienceLevel: String,
  totalExperience: Number,
  skills: [String],
  qualification: String,
  bio: String,
  location: String,
  resumeUrl: String,
  linkedinUrl: String,
  githubUrl: String,
  portfolioUrl: String,
  
  // Company fields for recruiters
  companyName: String,
  position: String,
  companyId: String,
  
  // Common fields
  preferences: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },
  settings: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
    default: {}
  },
  analytics: {
    lastActivity: {
      type: Date,
      default: null
    },
    loginCount: {
      type: Number,
      default: 0
    },
    lastLogin: {
      type: Date,
      default: null
    }
  },
  active_sessions: [{
    session_id: String,
    device_info: String,
    ip_address: String,
    created_at: {
      type: Date,
      default: Date.now
    },
    last_activity: {
      type: Date,
      default: Date.now
    }
  }],
  login_attempts: {
    type: Number,
    default: 0
  },
  lock_until: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Ensure virtual fields are serialized
userSchema.set('toJSON', {
  virtuals: true
});

const User = mongoose.model('User', userSchema);

export default User;
