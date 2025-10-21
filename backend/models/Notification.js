import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BaseUser',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: [
      'application_status_update',
      'new_job_posted',
      'application_received', 
      'job_application',
      'profile_update',
      'system_alert',
      'interview_scheduled',
      'job_expired',
      'new_message',
      // New notification types
      'application_submitted',
      'application_withdrawn',
      'application_status_changed',
      'interview_cancelled',
      'interview_rescheduled',
      'job_posted',
      'job_updated',
      'job_closed',
      'account_verified',
      'account_suspended',
      'policy_update',
      'system_maintenance',
      'new_user_registration',
      'company_verification_request',
      'report_submitted',
      'suspicious_activity'
    ],
    required: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  message: {
    type: String,
    required: true,
    maxlength: 1000
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  read: {
    type: Boolean,
    default: false,
    index: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  actionUrl: {
    type: String,
    default: null
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
  }
}, {
  timestamps: true
});

// Index for efficient queries
notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, type: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Static methods for creating specific notification types
notificationSchema.statics.createApplicationStatusUpdate = async function(applicantId, applicationId, status, jobTitle) {
  const statusMessages = {
    'shortlisted': 'Your application has been shortlisted!',
    'interview': 'You have been selected for an interview!',
    'hired': 'Congratulations! You have been hired!',
    'rejected': 'Your application was not selected this time.'
  };

  return this.create({
    userId: applicantId,
    type: 'application_status_update',
    title: `Application Status Update - ${jobTitle}`,
    message: statusMessages[status] || `Your application status has been updated to ${status}.`,
    data: {
      applicationId,
      status,
      jobTitle
    },
    priority: status === 'hired' ? 'high' : 'medium',
    actionUrl: `/dashboard/applications/${applicationId}`
  });
};

notificationSchema.statics.createNewJobAlert = async function(userId, job) {
  return this.create({
    userId,
    type: 'new_job_posted',
    title: 'New Job Opportunity Available!',
    message: `A new ${job.title} position has been posted at ${job.companyName || 'a company'}.`,
    data: {
      jobId: job._id,
      jobTitle: job.title,
      companyName: job.companyName,
      location: job.location
    },
    priority: 'medium',
    actionUrl: `/jobs/${job._id}`
  });
};

notificationSchema.statics.createApplicationReceived = async function(recruiterId, application, job) {
  return this.create({
    userId: recruiterId,
    type: 'application_received',
    title: 'New Application Received',
    message: `${application.applicantName || 'A candidate'} has applied for your ${job.title} position.`,
    data: {
      applicationId: application._id,
      jobId: job._id,
      jobTitle: job.title,
      applicantName: application.applicantName
    },
    priority: 'medium',
    actionUrl: `/dashboard/applications/${application._id}`
  });
};

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
