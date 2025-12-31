import mongoose from 'mongoose';

const notificationSettingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  emailNotifications: {
    type: Boolean,
    default: true
  },
  pushNotifications: {
    type: Boolean,
    default: true
  },
  jobAlerts: {
    type: Boolean,
    default: true
  },
  applicationUpdates: {
    type: Boolean,
    default: true
  },
  interviewReminders: {
    type: Boolean,
    default: true
  },
  marketingEmails: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const NotificationSetting = mongoose.model('NotificationSetting', notificationSettingSchema);

export default NotificationSetting;
