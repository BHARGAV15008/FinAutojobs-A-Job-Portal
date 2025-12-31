import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  applicant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  resume: { type: String },
  coverLetter: { type: String },
  status: { 
    type: String, 
    enum: ['pending', 'under_review', 'shortlisted', 'interviewed', 'hired', 'rejected', 'withdrawn'],
    default: 'pending'
  },
  // Reference to detailed application information
  applicationInfo: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'ApplicationInformation',
    unique: true,
    sparse: true // Allows null values while maintaining uniqueness for non-null values
  },
  notes: [{
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: { type: String },
    createdAt: { type: Date, default: Date.now }
  }],
  timeline: [{
    status: { type: String },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedAt: { type: Date, default: Date.now },
    note: { type: String }
  }],
  appliedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

applicationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export default mongoose.models.Application || mongoose.model('Application', applicationSchema);
