/**
 * Models Index
 * 
 * Central export point for all Mongoose models.
 * Connects schemas to actual database models.
 * 
 * @author FinAutoJobs Team
 * @version 1.0.0
 */

import mongoose from 'mongoose';

// Import all schemas
import {
  BaseUserSchema,
  ApplicantSchema,
  RecruiterSchema,
  AdminSchema,
  getUserModel,
  createUserModel
} from './schemas/users/index.js';

import {
  JobSchema,
  JobApplicationSchema,
  JobBookmarkSchema,
  InterviewSchema,
  getJobModel,
  createJobModel
} from './schemas/jobs/index.js';

import {
  CompanySchema,
  getCompanyModel,
  createCompanyModel
} from './schemas/companies/index.js';

import {
  UserActivitySchema,
  getActivityModel,
  createActivityModel
} from './schemas/activities/index.js';

import {
  NotificationSchema,
  AnalyticsSchema,
  getSystemModel,
  createSystemModel
} from './schemas/system/index.js';

// Create and export all models
export const User = mongoose.model('User', BaseUserSchema);
export const Applicant = mongoose.model('Applicant', ApplicantSchema);
export const Recruiter = mongoose.model('Recruiter', RecruiterSchema);
export const Admin = mongoose.model('Admin', AdminSchema);

export const Job = mongoose.model('Job', JobSchema);
export const JobApplication = mongoose.model('JobApplication', JobApplicationSchema);
export const JobBookmark = mongoose.model('JobBookmark', JobBookmarkSchema);
export const Interview = mongoose.model('Interview', InterviewSchema);

export const Company = mongoose.model('Company', CompanySchema);

export const UserActivity = mongoose.model('UserActivity', UserActivitySchema);

export const Notification = mongoose.model('Notification', NotificationSchema);
export const Analytics = mongoose.model('Analytics', AnalyticsSchema);

// Export factory functions
export {
  getUserModel,
  createUserModel,
  getJobModel,
  createJobModel,
  getCompanyModel,
  createCompanyModel,
  getActivityModel,
  createActivityModel,
  getSystemModel,
  createSystemModel
};

// Model registry for dynamic access
export const ModelRegistry = {
  User,
  Applicant,
  Recruiter,
  Admin,
  Job,
  JobApplication,
  JobBookmark,
  Interview,
  Company,
  UserActivity,
  Notification,
  Analytics
};

// Helper function to get model by name
export const getModel = (modelName) => {
  const model = ModelRegistry[modelName];
  if (!model) {
    throw new Error(`Model '${modelName}' not found in registry`);
  }
  return model;
};

// Database connection helper
export const connectDatabase = async (connectionString) => {
  try {
    await mongoose.connect(connectionString, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Database connected successfully');
    return mongoose.connection;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
};

// Database disconnection helper
export const disconnectDatabase = async () => {
  try {
    await mongoose.disconnect();
    console.log('✅ Database disconnected successfully');
  } catch (error) {
    console.error('❌ Database disconnection failed:', error);
    throw error;
  }
};

export default {
  User,
  Applicant,
  Recruiter,
  Admin,
  Job,
  JobApplication,
  JobBookmark,
  Interview,
  Company,
  UserActivity,
  Notification,
  Analytics,
  ModelRegistry,
  getModel,
  connectDatabase,
  disconnectDatabase
};
