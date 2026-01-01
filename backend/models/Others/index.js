import mongoose from 'mongoose';

// Base User Schema
export const BaseUserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  full_name: { type: String },
  phone: { type: String },
  role: { type: String, required: true, default: 'jobseeker' },
  skills: { type: String }, // JSON string
  experience_years: { type: Number },
  education: { type: String }, // JSON string
  resume_url: { type: String },
  bio: { type: String },
  location: { type: String },
  profile_picture: { type: String },
  linkedin_url: { type: String },
  github_url: { type: String },
  portfolio_url: { type: String },
  google_id: { type: String },
  microsoft_id: { type: String },
  apple_id: { type: String },
  status: { type: String, required: true, default: 'active' },
  email_verified: { type: Boolean, required: true, default: false },
  phone_verified: { type: Boolean, required: true, default: false },
  reset_token: { type: String },
  reset_token_expires: { type: String },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// Applicant Schema (extends BaseUserSchema)
export const ApplicantSchema = new mongoose.Schema({
  ...BaseUserSchema.obj,
  // Additional fields specific to applicants can be added here
});

// Recruiter Schema (extends BaseUserSchema)
export const RecruiterSchema = new mongoose.Schema({
  ...BaseUserSchema.obj,
  company_name: { type: String },
  position: { type: String },
  company_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' }
});

// Admin Schema (extends BaseUserSchema)
export const AdminSchema = new mongoose.Schema({
  ...BaseUserSchema.obj,
  admin_level: { type: String, default: 'standard' },
  permissions: [{ type: String }]
});

// Factory functions
export const getUserModel = (role = 'user') => {
  const modelName = role.charAt(0).toUpperCase() + role.slice(1);
  return mongoose.model(modelName, BaseUserSchema);
};

export const createUserModel = (role = 'user') => {
  const modelName = role.charAt(0).toUpperCase() + role.slice(1);
  if (!mongoose.models[modelName]) {
    return mongoose.model(modelName, BaseUserSchema);
  }
  return mongoose.models[modelName];
};

// Export individual models
export const User = mongoose.model('User', BaseUserSchema);
export const Applicant = mongoose.model('Applicant', ApplicantSchema);
export const Recruiter = mongoose.model('Recruiter', RecruiterSchema);
export const Admin = mongoose.model('Admin', AdminSchema);