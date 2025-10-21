import mongoose from 'mongoose';
import User from './User.js';

const applicantSchema = new mongoose.Schema({
  dateOfBirth: { type: Date },
  gender: { type: String, enum: ['male', 'female', 'other', 'prefer-not-to-say'] },
  currentLocation: {
    city: { type: String },
    state: { type: String },
    country: { type: String, default: 'India' }
  },
  education: [{
    institution: { type: String, required: true },
    degree: { type: String, required: true },
    fieldOfStudy: { type: String },
    startDate: { type: Date },
    endDate: { type: Date },
    grade: { type: String },
    isCurrentlyStudying: { type: Boolean, default: false }
  }],
  workExperience: [{
    company: { type: String, required: true },
    position: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    isCurrentJob: { type: Boolean, default: false },
    description: { type: String }
  }],
  skills: [{ type: String }],
  resume: { type: String }, // URL to the resume
  coverLetter: { type: String }, // URL or text
  portfolio: { type: String }, // URL
  jobPreferences: {
    preferredJobTypes: [{ type: String, enum: ['full-time', 'part-time', 'contract', 'internship', 'freelance'] }],
    preferredLocations: [{ type: String }],
    remoteWork: { type: Boolean, default: false },
    willingToRelocate: { type: Boolean, default: false },
    expectedSalary: { type: Number }
  },
  appliedJobs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
  }],
  savedJobs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job'
  }]
});

const Applicant = User.discriminator('applicant', applicantSchema);

export default Applicant;