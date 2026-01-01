import mongoose from 'mongoose';

// Company Schema
export const CompanySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  logo_url: { type: String },
  website: { type: String },
  location: { type: String },
  industry: { type: String },
  size: { type: String },
  founded_year: { type: Number },
  email: { type: String },
  phone: { type: String },
  address: { type: String },
  linkedin_url: { type: String },
  twitter_url: { type: String },
  facebook_url: { type: String },
  benefits: { type: String }, // JSON string
  culture: { type: String },
  mission: { type: String },
  vision: { type: String },
  status: { type: String, required: true, default: 'active' },
  verified: { type: Boolean, required: true, default: false },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// Factory functions
export const getCompanyModel = (modelName = 'Company') => {
  return mongoose.model(modelName, CompanySchema);
};

export const createCompanyModel = (modelName = 'Company') => {
  if (!mongoose.models[modelName]) {
    return mongoose.model(modelName, CompanySchema);
  }
  return mongoose.models[modelName];
};

// Export model
export const Company = mongoose.model('Company', CompanySchema);