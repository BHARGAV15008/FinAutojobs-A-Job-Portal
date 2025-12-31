import mongoose from 'mongoose';

const companySchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String },
  website: { type: String },
  logoUrl: { type: String },
  description: { type: String },
  industry: { type: String },
  size: { type: String, enum: ['1-10', '11-50', '51-200', '201-500', '500+'] },
  foundedYear: { type: Number },
  location: {
    address: { type: String },
    city: { type: String },
    state: { type: String },
    country: { type: String },
    zipCode: { type: String }
  },
  phone: { type: String },
  recruiter: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  verified: { type: Boolean, default: false },
  socialLinks: {
    linkedin: { type: String },
    twitter: { type: String },
    facebook: { type: String }
  },
  benefits: { type: String },
  culture: { type: String },
  mission: { type: String },
  vision: { type: String },
  status: { type: String, default: 'active' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

companySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('Company', companySchema);
