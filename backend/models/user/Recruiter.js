import mongoose from 'mongoose';
import User from './User.js';

const recruiterSchema = new mongoose.Schema({
  company: {
    name: { type: String, required: true },
    website: { type: String },
    description: { type: String },
    industry: { type: String },
    size: { type: String, enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'] },
    location: {
      city: { type: String },
      state: { type: String },
      country: { type: String, default: 'India' }
    }
  },
  position: { type: String, required: true },
  yearsOfExperience: { type: Number, default: 0 },
  specialization: [{ type: String }],
  postedJobs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
  }],
  subscription: {
    planType: { type: String, enum: ['basic', 'premium', 'enterprise'], default: 'basic' },
    jobPostingCredits: { type: Number, default: 5 },
    candidateViewCredits: { type: Number, default: 100 },
    startDate: { type: Date },
    endDate: { type: Date }
  }
});

const Recruiter = User.discriminator('recruiter', recruiterSchema);

export default Recruiter;