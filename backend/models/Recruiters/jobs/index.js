import mongoose from 'mongoose';

// Job Schema
export const JobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  company_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  description: { type: String, required: true },
  requirements: { type: String },
  responsibilities: { type: String },
  benefits: { type: String },
  location: { type: String, required: true },
  work_mode: { type: String, required: true, default: 'Work from Office' },
  job_type: { type: String, required: true, default: 'Full Time' },
  experience_min: { type: Number, required: true, default: 0 },
  experience_max: { type: Number, required: true, default: 0 },
  skills_required: { type: String }, // JSON string
  education_level: { type: String },
  salary_min: { type: Number },
  salary_max: { type: Number },
  salary_currency: { type: String, required: true, default: 'INR' },
  salary_type: { type: String, required: true, default: 'annual' },
  english_level: { type: String },
  other_languages: { type: String }, // JSON string
  application_deadline: { type: String },
  positions_available: { type: Number, required: true, default: 1 },
  applications_count: { type: Number, required: true, default: 0 },
  category: { type: String },
  tags: { type: String }, // JSON string
  priority: { type: String, required: true, default: 'normal' },
  status: { type: String, required: true, default: 'active' },
  featured: { type: Boolean, required: true, default: false },
  remote_friendly: { type: Boolean, required: true, default: false },
  slug: { type: String, unique: true },
  meta_title: { type: String },
  meta_description: { type: String },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  published_at: { type: Date }
});

// Job Application Schema
export const JobApplicationSchema = new mongoose.Schema({
  job_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  cover_letter: { type: String },
  resume_url: { type: String },
  portfolio_url: { type: String },
  expected_salary: { type: Number },
  available_from: { type: String },
  notice_period: { type: String },
  custom_responses: { type: String }, // JSON string
  status: { type: String, required: true, default: 'pending' },
  stage: { type: String, required: true, default: 'applied' },
  hr_notes: { type: String },
  feedback: { type: String },
  rating: { type: Number },
  interview_scheduled: { type: String },
  interview_type: { type: String },
  interview_notes: { type: String },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  reviewed_at: { type: Date },
  responded_at: { type: Date }
});

// Job Bookmark Schema
export const JobBookmarkSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  job_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  created_at: { type: Date, default: Date.now }
});

// Interview Schema
export const InterviewSchema = new mongoose.Schema({
  job_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  applicant_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  recruiter_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  scheduled_at: { type: Date, required: true },
  duration: { type: Number, required: true }, // in minutes
  type: { type: String, required: true, default: 'video' },
  meeting_link: { type: String },
  notes: { type: String },
  status: { type: String, required: true, default: 'scheduled' },
  feedback: { type: String },
  rating: { type: Number },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// Factory functions
export const getJobModel = (modelName = 'Job') => {
  return mongoose.model(modelName, JobSchema);
};

export const createJobModel = (modelName = 'Job') => {
  if (!mongoose.models[modelName]) {
    return mongoose.model(modelName, JobSchema);
  }
  return mongoose.models[modelName];
};

// Export models
export const Job = mongoose.model('Job', JobSchema);
export const JobApplication = mongoose.model('JobApplication', JobApplicationSchema);
export const JobBookmark = mongoose.model('JobBookmark', JobBookmarkSchema);
export const Interview = mongoose.model('Interview', InterviewSchema);