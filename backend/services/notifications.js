import nodemailer from 'nodemailer';
import Notification from '../models/Notification.js';
import BaseUser from '../models/unified/BaseUser.js';
import Job from '../models/Job.js';
import Application from '../models/unified/Application.js';

// Email transporter configuration
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Notification types and their routing logic
const NOTIFICATION_TYPES = {
  // Applicant actions that notify recruiters
  APPLICATION_SUBMITTED: 'application_submitted',
  APPLICATION_WITHDRAWN: 'application_withdrawn',
  PROFILE_UPDATED: 'profile_updated',
  
  // Recruiter actions that notify applicants
  APPLICATION_STATUS_CHANGED: 'application_status_changed',
  INTERVIEW_SCHEDULED: 'interview_scheduled',
  INTERVIEW_CANCELLED: 'interview_cancelled',
  INTERVIEW_RESCHEDULED: 'interview_rescheduled',
  JOB_POSTED: 'job_posted',
  JOB_UPDATED: 'job_updated',
  JOB_CLOSED: 'job_closed',
  
  // Admin actions that notify recruiters/applicants
  ACCOUNT_VERIFIED: 'account_verified',
  ACCOUNT_SUSPENDED: 'account_suspended',
  POLICY_UPDATE: 'policy_update',
  SYSTEM_MAINTENANCE: 'system_maintenance',
  
  // Actions that notify admin
  NEW_USER_REGISTRATION: 'new_user_registration',
  COMPANY_VERIFICATION_REQUEST: 'company_verification_request',
  REPORT_SUBMITTED: 'report_submitted',
  SUSPICIOUS_ACTIVITY: 'suspicious_activity'
};

// Get users who should receive notifications based on action type
const getNotificationRecipients = async (actionType, actionData) => {
  const recipients = [];

  try {
    switch (actionType) {
      case NOTIFICATION_TYPES.APPLICATION_SUBMITTED:
        // Notify recruiter/company who posted the job
        if (actionData.jobId) {
          const job = await Job.findById(actionData.jobId).populate('postedBy');
          if (job && job.postedBy) {
            recipients.push({
              userId: job.postedBy._id,
              role: job.postedBy.role,
              email: job.postedBy.email
            });
          }
        }
        break;

      case NOTIFICATION_TYPES.APPLICATION_STATUS_CHANGED:
      case NOTIFICATION_TYPES.INTERVIEW_SCHEDULED:
      case NOTIFICATION_TYPES.INTERVIEW_CANCELLED:
      case NOTIFICATION_TYPES.INTERVIEW_RESCHEDULED:
        // Notify applicant
        if (actionData.applicantId) {
          const applicant = await BaseUser.findById(actionData.applicantId);
          if (applicant) {
            recipients.push({
              userId: applicant._id,
              role: applicant.role,
              email: applicant.email
            });
          }
        }
        break;

      case NOTIFICATION_TYPES.JOB_POSTED:
        // Notify matching applicants based on job criteria
        if (actionData.jobId) {
          const job = await Job.findById(actionData.jobId);
          if (job) {
            // Find applicants with matching skills/location/preferences
            const matchingApplicants = await BaseUser.find({
              role: 'applicant',
              $or: [
                { 'profile.skills': { $in: job.requiredSkills || [] } },
                { 'profile.preferredLocation': job.location },
                { 'profile.jobAlerts': true }
              ]
            }).limit(50); // Limit to prevent spam
            
            matchingApplicants.forEach(applicant => {
              recipients.push({
                userId: applicant._id,
                role: applicant.role,
                email: applicant.email
              });
            });
          }
        }
        break;

      case NOTIFICATION_TYPES.NEW_USER_REGISTRATION:
      case NOTIFICATION_TYPES.COMPANY_VERIFICATION_REQUEST:
      case NOTIFICATION_TYPES.REPORT_SUBMITTED:
      case NOTIFICATION_TYPES.SUSPICIOUS_ACTIVITY:
        // Notify all admins
        const admins = await BaseUser.find({ role: 'admin' });
        admins.forEach(admin => {
          recipients.push({
            userId: admin._id,
            role: admin.role,
            email: admin.email
          });
        });
        break;

      case NOTIFICATION_TYPES.ACCOUNT_VERIFIED:
      case NOTIFICATION_TYPES.ACCOUNT_SUSPENDED:
      case NOTIFICATION_TYPES.POLICY_UPDATE:
        // Notify specific user
        if (actionData.userId) {
          const user = await BaseUser.findById(actionData.userId);
          if (user) {
            recipients.push({
              userId: user._id,
              role: user.role,
              email: user.email
            });
          }
        }
        break;

      case NOTIFICATION_TYPES.SYSTEM_MAINTENANCE:
        // Notify all users (limit to prevent overload)
        const allUsers = await BaseUser.find({}).limit(1000);
        allUsers.forEach(user => {
          recipients.push({
            userId: user._id,
            role: user.role,
            email: user.email
          });
        });
        break;
    }
  } catch (error) {
    console.error('Error getting notification recipients:', error);
  }

  return recipients;
};

// Create notification in database
const createNotification = async (recipient, notificationType, title, message, data = {}, priority = 'medium') => {
  try {
    const notification = new Notification({
      userId: recipient.userId,
      type: notificationType,
      title,
      message,
      data,
      priority,
      actionUrl: data.actionUrl || null
    });

    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};

// Send email notification
const sendEmailNotification = async (recipient, subject, htmlContent) => {
  try {
    if (!process.env.EMAIL_USER || !recipient.email) {
      return false;
    }

    await transporter.sendMail({
      from: `${process.env.EMAIL_FROM_NAME || 'FinAutoJobs'} <${process.env.EMAIL_FROM_ADDRESS || process.env.EMAIL_USER}>`,
      to: recipient.email,
      subject,
      html: htmlContent
    });

    return true;
  } catch (error) {
    console.error('Error sending email notification:', error);
    return false;
  }
};

// Generate notification content based on action type
const generateNotificationContent = async (actionType, actionData, recipient) => {
  let title, message, emailSubject, emailContent, priority = 'medium';

  // Get additional data for context
  let job, application, user;
  
  try {
    if (actionData.jobId) {
      job = await Job.findById(actionData.jobId).populate('postedBy');
    }
    if (actionData.applicationId) {
      application = await Application.findById(actionData.applicationId).populate('applicant job');
    }
    if (actionData.userId) {
      user = await BaseUser.findById(actionData.userId);
    }
  } catch (error) {
    console.error('Error fetching notification context data:', error);
  }

  switch (actionType) {
    case NOTIFICATION_TYPES.APPLICATION_SUBMITTED:
      title = 'New Application Received';
      message = `A candidate has applied for your ${job?.title || 'job'} position.`;
      emailSubject = `New Application - ${job?.title || 'Job Position'}`;
      emailContent = `
        <h2>New Application Received!</h2>
        <p>A candidate has applied for your <strong>${job?.title || 'job'}</strong> position.</p>
        <p><strong>Company:</strong> ${job?.companyName || 'Your Company'}</p>
        <p><strong>Location:</strong> ${job?.location || 'Not specified'}</p>
        <p><a href="${process.env.FRONTEND_URL}/dashboard/applications/${actionData.applicationId}">View Application</a></p>
      `;
      priority = 'high';
      break;

    case NOTIFICATION_TYPES.APPLICATION_STATUS_CHANGED:
      const statusMessages = {
        'shortlisted': 'Your application has been shortlisted!',
        'interview': 'You have been selected for an interview!',
        'hired': 'Congratulations! You have been hired!',
        'rejected': 'Your application was not selected this time.'
      };
      title = `Application Status Update`;
      message = statusMessages[actionData.status] || `Your application status has been updated to ${actionData.status}.`;
      emailSubject = `Application Update - ${application?.job?.title || 'Job Position'}`;
      emailContent = `
        <h2>Application Status Update</h2>
        <p>${message}</p>
        <p><strong>Position:</strong> ${application?.job?.title || 'Job Position'}</p>
        <p><strong>Company:</strong> ${application?.job?.companyName || 'Company'}</p>
        <p><a href="${process.env.FRONTEND_URL}/dashboard/applications/${actionData.applicationId}">View Details</a></p>
      `;
      priority = actionData.status === 'hired' ? 'urgent' : 'high';
      break;

    case NOTIFICATION_TYPES.JOB_POSTED:
      title = 'New Job Opportunity Available!';
      message = `A new ${job?.title || 'job'} position has been posted that matches your profile.`;
      emailSubject = `New Job Match - ${job?.title || 'Job Opportunity'}`;
      emailContent = `
        <h2>New Job Opportunity!</h2>
        <p>A new position matching your profile has been posted:</p>
        <p><strong>Position:</strong> ${job?.title || 'Job Position'}</p>
        <p><strong>Company:</strong> ${job?.companyName || 'Company'}</p>
        <p><strong>Location:</strong> ${job?.location || 'Not specified'}</p>
        <p><strong>Salary:</strong> ${job?.salaryRange || 'Not specified'}</p>
        <p><a href="${process.env.FRONTEND_URL}/jobs/${actionData.jobId}">View Job Details</a></p>
      `;
      break;

    case NOTIFICATION_TYPES.NEW_USER_REGISTRATION:
      title = 'New User Registration';
      message = `A new ${actionData.userRole} has registered on the platform.`;
      emailSubject = 'New User Registration - FinAutoJobs';
      emailContent = `
        <h2>New User Registration</h2>
        <p>A new user has registered on FinAutoJobs:</p>
        <p><strong>Role:</strong> ${actionData.userRole}</p>
        <p><strong>Email:</strong> ${user?.email || 'Not available'}</p>
        <p><a href="${process.env.FRONTEND_URL}/admin/users/${actionData.userId}">View User Profile</a></p>
      `;
      priority = 'low';
      break;

    case NOTIFICATION_TYPES.INTERVIEW_SCHEDULED:
      title = 'Interview Scheduled';
      message = `Your interview has been scheduled for ${new Date(actionData.interviewDate).toLocaleDateString()}.`;
      emailSubject = `Interview Scheduled - ${application?.job?.title || 'Job Position'}`;
      emailContent = `
        <h2>Interview Scheduled!</h2>
        <p>Your interview has been scheduled:</p>
        <p><strong>Position:</strong> ${application?.job?.title || 'Job Position'}</p>
        <p><strong>Date:</strong> ${new Date(actionData.interviewDate).toLocaleDateString()}</p>
        <p><strong>Time:</strong> ${actionData.interviewTime || 'Not specified'}</p>
        <p><strong>Type:</strong> ${actionData.interviewType || 'Not specified'}</p>
        <p><a href="${process.env.FRONTEND_URL}/dashboard/interviews/${actionData.applicationId}">View Interview Details</a></p>
      `;
      priority = 'urgent';
      break;

    case NOTIFICATION_TYPES.INTERVIEW_CANCELLED:
      title = 'Interview Cancelled';
      message = `Your interview for ${application?.job?.title || 'the position'} has been cancelled.`;
      emailSubject = `Interview Cancelled - ${application?.job?.title || 'Job Position'}`;
      emailContent = `
        <h2>Interview Cancelled</h2>
        <p>We regret to inform you that your interview has been cancelled:</p>
        <p><strong>Position:</strong> ${application?.job?.title || 'Job Position'}</p>
        <p><strong>Company:</strong> ${application?.job?.companyName || 'Company'}</p>
        <p><strong>Reason:</strong> ${actionData.reason || 'Not specified'}</p>
        <p><a href="${process.env.FRONTEND_URL}/dashboard/applications/${actionData.applicationId}">View Application Details</a></p>
      `;
      priority = 'high';
      break;

    case NOTIFICATION_TYPES.INTERVIEW_RESCHEDULED:
      title = 'Interview Rescheduled';
      message = `Your interview has been rescheduled to ${new Date(actionData.newInterviewDate).toLocaleDateString()}.`;
      emailSubject = `Interview Rescheduled - ${application?.job?.title || 'Job Position'}`;
      emailContent = `
        <h2>Interview Rescheduled</h2>
        <p>Your interview has been rescheduled:</p>
        <p><strong>Position:</strong> ${application?.job?.title || 'Job Position'}</p>
        <p><strong>New Date:</strong> ${new Date(actionData.newInterviewDate).toLocaleDateString()}</p>
        <p><strong>New Time:</strong> ${actionData.newInterviewTime || 'Not specified'}</p>
        <p><strong>Type:</strong> ${actionData.interviewType || 'Not specified'}</p>
        <p><a href="${process.env.FRONTEND_URL}/dashboard/interviews/${actionData.applicationId}">View Interview Details</a></p>
      `;
      priority = 'urgent';
      break;

    default:
      title = 'Notification';
      message = 'You have a new notification.';
      emailSubject = 'FinAutoJobs Notification';
      emailContent = '<h2>You have a new notification from FinAutoJobs.</h2>';
  }

  return { title, message, emailSubject, emailContent, priority };
};

// WebSocket service instance (will be set by server.js)
let websocketService = null;

export const setWebSocketService = (wsService) => {
  websocketService = wsService;
};

// Main notification service
export const NotificationService = {
  // Send notification based on user action
  async sendActionNotification(actionType, actionData) {
    try {
      const recipients = await getNotificationRecipients(actionType, actionData);
      
      for (const recipient of recipients) {
        const { title, message, emailSubject, emailContent, priority } = 
          await generateNotificationContent(actionType, actionData, recipient);

        // Create in-app notification
        const notification = await createNotification(recipient, actionType, title, message, actionData, priority);

        // Send real-time notification via WebSocket if available
        if (websocketService && notification) {
          websocketService.sendNotificationToUser(recipient.userId, {
            id: notification._id,
            type: actionType,
            title,
            message,
            data: actionData,
            priority,
            read: false,
            createdAt: notification.createdAt
          });
        }

        // Send email notification if enabled
        if (process.env.SEND_EMAILS_IN_DEV === 'true' || process.env.NODE_ENV === 'production') {
          await sendEmailNotification(recipient, emailSubject, emailContent);
        }
      }

      return { success: true, recipientCount: recipients.length };
    } catch (error) {
      console.error('Error in sendActionNotification:', error);
      return { success: false, error: error.message };
    }
  },

  // Specific notification methods for common actions
  async notifyApplicationSubmitted(applicationId, jobId, applicantId) {
    return this.sendActionNotification(NOTIFICATION_TYPES.APPLICATION_SUBMITTED, {
      applicationId,
      jobId,
      applicantId,
      actionUrl: `/dashboard/applications/${applicationId}`
    });
  },

  async notifyApplicationStatusChanged(applicationId, newStatus, applicantId, recruiterId) {
    return this.sendActionNotification(NOTIFICATION_TYPES.APPLICATION_STATUS_CHANGED, {
      applicationId,
      status: newStatus,
      applicantId,
      recruiterId,
      actionUrl: `/dashboard/applications/${applicationId}`
    });
  },

  async notifyJobPosted(jobId, recruiterId) {
    return this.sendActionNotification(NOTIFICATION_TYPES.JOB_POSTED, {
      jobId,
      recruiterId,
      actionUrl: `/jobs/${jobId}`
    });
  },

  async notifyNewUserRegistration(userId, userRole) {
    return this.sendActionNotification(NOTIFICATION_TYPES.NEW_USER_REGISTRATION, {
      userId,
      userRole,
      actionUrl: `/admin/users/${userId}`
    });
  },

  async notifyCompanyVerificationRequest(companyId, userId) {
    return this.sendActionNotification(NOTIFICATION_TYPES.COMPANY_VERIFICATION_REQUEST, {
      companyId,
      userId,
      actionUrl: `/admin/companies/${companyId}`
    });
  },

  async notifyAccountVerified(userId) {
    return this.sendActionNotification(NOTIFICATION_TYPES.ACCOUNT_VERIFIED, {
      userId,
      actionUrl: '/dashboard'
    });
  },

  async notifyInterviewScheduled(applicationId, applicantId, interviewDate, interviewTime, interviewType) {
    return this.sendActionNotification(NOTIFICATION_TYPES.INTERVIEW_SCHEDULED, {
      applicationId,
      applicantId,
      interviewDate,
      interviewTime,
      interviewType,
      actionUrl: `/dashboard/interviews/${applicationId}`
    });
  },

  async notifyInterviewCancelled(applicationId, applicantId, reason) {
    return this.sendActionNotification(NOTIFICATION_TYPES.INTERVIEW_CANCELLED, {
      applicationId,
      applicantId,
      reason,
      actionUrl: `/dashboard/applications/${applicationId}`
    });
  },

  async notifyInterviewRescheduled(applicationId, applicantId, newInterviewDate, newInterviewTime, interviewType) {
    return this.sendActionNotification(NOTIFICATION_TYPES.INTERVIEW_RESCHEDULED, {
      applicationId,
      applicantId,
      newInterviewDate,
      newInterviewTime,
      interviewType,
      actionUrl: `/dashboard/interviews/${applicationId}`
    });
  }
};

// Legacy email functions (kept for backward compatibility)
export const sendJobMatchEmail = async (email, jobTitle, company) => {
  await sendEmailNotification(
    { email },
    `New Job Match: ${jobTitle}`,
    `<h2>New Job Opportunity!</h2><p>${jobTitle} at ${company}</p>`
  );
};

export const sendInterviewUpdate = async (email, status, jobTitle) => {
  await sendEmailNotification(
    { email },
    `Interview Update: ${jobTitle}`,
    `<h2>Interview Status: ${status}</h2><p>For position: ${jobTitle}</p>`
  );
};
