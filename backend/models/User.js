import mongoose from 'mongoose';

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

userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('User', userSchema);
