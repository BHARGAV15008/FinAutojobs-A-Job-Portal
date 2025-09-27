import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'recruiter', 'applicant'], required: true },
  profile: {
    firstName: { type: String },
    lastName: { type: String },
    phone: { type: String },
    avatar: { type: String },
    location: {
      city: { type: String },
      state: { type: String },
      country: { type: String },
      coordinates: { type: [Number] }
    }
  },
  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
  lastLogin: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('User', userSchema);
