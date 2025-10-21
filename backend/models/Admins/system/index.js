import mongoose from 'mongoose';

// Notification Schema
export const NotificationSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, required: true },
  title: { type: String },
  message: { type: String, required: true },
  data: { type: String }, // JSON string
  is_read: { type: Boolean, required: true, default: false },
  created_at: { type: Date, default: Date.now }
});

// Analytics Schema
export const AnalyticsSchema = new mongoose.Schema({
  date: { type: String, required: true }, // YYYY-MM-DD format
  company_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  jobs_posted: { type: Number, default: 0 },
  applications_received: { type: Number, default: 0 },
  profile_views: { type: Number, default: 0 },
  interviews_scheduled: { type: Number, default: 0 },
  hires: { type: Number, default: 0 },
  created_at: { type: Date, default: Date.now }
});

// Factory functions
export const getSystemModel = (modelName) => {
  if (modelName === 'Notification') {
    return mongoose.model('Notification', NotificationSchema);
  } else if (modelName === 'Analytics') {
    return mongoose.model('Analytics', AnalyticsSchema);
  }
  return null;
};

export const createSystemModel = (modelName) => {
  if (modelName === 'Notification') {
    if (!mongoose.models.Notification) {
      return mongoose.model('Notification', NotificationSchema);
    }
    return mongoose.models.Notification;
  } else if (modelName === 'Analytics') {
    if (!mongoose.models.Analytics) {
      return mongoose.model('Analytics', AnalyticsSchema);
    }
    return mongoose.models.Analytics;
  }
  return null;
};

// Export models
export const Notification = mongoose.model('Notification', NotificationSchema);
export const Analytics = mongoose.model('Analytics', AnalyticsSchema);