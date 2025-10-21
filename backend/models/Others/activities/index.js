import mongoose from 'mongoose';

// User Activity Schema
export const UserActivitySchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true },
  details: { type: String },
  ip_address: { type: String },
  user_agent: { type: String },
  created_at: { type: Date, default: Date.now }
});

// Factory functions
export const getActivityModel = (modelName = 'UserActivity') => {
  return mongoose.model(modelName, UserActivitySchema);
};

export const createActivityModel = (modelName = 'UserActivity') => {
  if (!mongoose.models[modelName]) {
    return mongoose.model(modelName, UserActivitySchema);
  }
  return mongoose.models[modelName];
};

// Export model
export const UserActivity = mongoose.model('UserActivity', UserActivitySchema);