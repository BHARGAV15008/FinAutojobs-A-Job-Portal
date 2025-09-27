import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  recruiter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  description: { type: String },
  requirements: [{ type: String }],
  responsibilities: [{ type: String }],
  skills: [{ type: String }],
  experience: {
    min: { type: Number },
    max: { type: Number },
    level: { type: String, enum: ['entry', 'mid', 'senior', 'executive'] }
  },
  salary: {
    min: { type: Number },
    max: { type: Number },
    currency: { type: String, default: 'USD' },
    type: { type: String, enum: ['hourly', 'monthly', 'yearly'] }
  },
  location: {
    type: { type: String, enum: ['remote', 'onsite', 'hybrid'] },
    city: { type: String },
    state: { type: String },
    country: { type: String }
  },
  employment: { type: String, enum: ['full-time', 'part-time', 'contract', 'internship'] },
  category: { type: String },
  tags: [{ type: String }],
  applicationDeadline: { type: Date },
  isActive: { type: Boolean, default: true },
  views: { type: Number, default: 0 },
  applications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Application' }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

jobSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.model('Job', jobSchema);
