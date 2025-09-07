import { sqliteTable, text, integer, real, blob } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// Enhanced User Profiles with detailed information
export const userProfiles = sqliteTable('user_profiles', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email').notNull().unique(),
  phone: text('phone'),
  location: text('location'),
  githubUrl: text('github_url'),
  linkedinUrl: text('linkedin_url'),
  portfolioUrl: text('portfolio_url'),
  bio: text('bio'),
  profilePicture: text('profile_picture'),
  highestQualification: text('highest_qualification'), // dropdown: Bachelor's, Master's, PhD, etc.
  isExperienced: integer('is_experienced', { mode: 'boolean' }).default(false),
  experienceYears: integer('experience_years'),
  currentRole: text('current_role'),
  companyName: text('company_name'),
  resumeUrl: text('resume_url'),
  resumeFileName: text('resume_file_name'),
  skills: text('skills'), // JSON array of skills
  languages: text('languages'), // JSON array of languages
  certifications: text('certifications'), // JSON array
  achievements: text('achievements'), // JSON array
  preferences: text('preferences'), // JSON object for user preferences
  isProfileComplete: integer('is_profile_complete', { mode: 'boolean' }).default(false),
  profileCompletionPercentage: integer('profile_completion_percentage').default(0),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`)
});

// User Settings and Preferences
export const userSettings = sqliteTable('user_settings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  theme: text('theme').default('light'), // light, dark, auto
  fontSize: text('font_size').default('medium'), // small, medium, large
  language: text('language').default('en'),
  timezone: text('timezone').default('Asia/Kolkata'),
  emailNotifications: integer('email_notifications', { mode: 'boolean' }).default(true),
  pushNotifications: integer('push_notifications', { mode: 'boolean' }).default(true),
  jobAlertNotifications: integer('job_alert_notifications', { mode: 'boolean' }).default(true),
  interviewReminders: integer('interview_reminders', { mode: 'boolean' }).default(true),
  dashboardLayout: text('dashboard_layout').default('grid'), // grid, list, compact
  sidebarCollapsed: integer('sidebar_collapsed', { mode: 'boolean' }).default(false),
  showWelcomeTour: integer('show_welcome_tour', { mode: 'boolean' }).default(true),
  privacySettings: text('privacy_settings'), // JSON object
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`)
});

// Enhanced Job Alerts with detailed filters
export const jobAlerts = sqliteTable('job_alerts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  keywords: text('keywords'), // comma-separated or JSON
  location: text('location'),
  salaryMin: integer('salary_min'),
  salaryMax: integer('salary_max'),
  jobType: text('job_type'), // full-time, part-time, contract, internship
  workMode: text('work_mode'), // remote, hybrid, onsite
  experienceMin: integer('experience_min'),
  experienceMax: integer('experience_max'),
  skills: text('skills'), // JSON array
  companySize: text('company_size'), // startup, small, medium, large, enterprise
  industry: text('industry'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  frequency: text('frequency').default('daily'), // instant, daily, weekly
  lastTriggered: text('last_triggered'),
  matchCount: integer('match_count').default(0),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`)
});

// Enhanced Bookmarks/Favorites
export const jobBookmarks = sqliteTable('job_bookmarks', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  jobId: integer('job_id').notNull().references(() => jobs.id, { onDelete: 'cascade' }),
  notes: text('notes'),
  tags: text('tags'), // JSON array for custom tags
  priority: text('priority').default('medium'), // low, medium, high
  reminderDate: text('reminder_date'),
  isReminded: integer('is_reminded', { mode: 'boolean' }).default(false),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`)
});

// Enhanced Applications with detailed tracking
export const jobApplications = sqliteTable('job_applications', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  jobId: integer('job_id').notNull().references(() => jobs.id, { onDelete: 'cascade' }),
  recruiterId: integer('recruiter_id').references(() => users.id),
  status: text('status').default('pending'), // pending, under_review, shortlisted, interview_scheduled, interview_completed, selected, rejected, withdrawn
  appliedDate: text('applied_date').default(sql`CURRENT_TIMESTAMP`),
  coverLetter: text('cover_letter'),
  resumeVersion: text('resume_version'),
  expectedSalary: integer('expected_salary'),
  availableFrom: text('available_from'),
  noticePeriod: text('notice_period'),
  applicationSource: text('application_source'), // direct, referral, job_board
  referrerName: text('referrer_name'),
  customFields: text('custom_fields'), // JSON object for additional fields
  recruiterNotes: text('recruiter_notes'),
  applicantNotes: text('applicant_notes'),
  interviewFeedback: text('interview_feedback'),
  rejectionReason: text('rejection_reason'),
  withdrawalReason: text('withdrawal_reason'),
  statusHistory: text('status_history'), // JSON array of status changes
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`)
});

// Enhanced Interviews with comprehensive details
export const interviews = sqliteTable('interviews', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  applicationId: integer('application_id').notNull().references(() => jobApplications.id, { onDelete: 'cascade' }),
  recruiterId: integer('recruiter_id').notNull().references(() => users.id),
  applicantId: integer('applicant_id').notNull().references(() => users.id),
  jobId: integer('job_id').notNull().references(() => jobs.id),
  round: integer('round').default(1),
  type: text('type').default('technical'), // technical, hr, behavioral, case_study, group
  mode: text('mode').default('video'), // video, phone, in_person, online_test
  title: text('title').notNull(),
  description: text('description'),
  scheduledDate: text('scheduled_date').notNull(),
  scheduledTime: text('scheduled_time').notNull(),
  duration: integer('duration').default(60), // in minutes
  meetingLink: text('meeting_link'),
  meetingId: text('meeting_id'),
  meetingPassword: text('meeting_password'),
  location: text('location'),
  interviewerName: text('interviewer_name'),
  interviewerEmail: text('interviewer_email'),
  interviewerPhone: text('interviewer_phone'),
  status: text('status').default('scheduled'), // scheduled, confirmed, completed, cancelled, rescheduled, no_show
  reminderSent: integer('reminder_sent', { mode: 'boolean' }).default(false),
  feedback: text('feedback'),
  rating: integer('rating'), // 1-10 scale
  technicalScore: integer('technical_score'),
  communicationScore: integer('communication_score'),
  overallScore: integer('overall_score'),
  recommendation: text('recommendation'), // proceed, reject, hold
  notes: text('notes'),
  attachments: text('attachments'), // JSON array of file URLs
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`)
});

// Enhanced Notifications system
export const notifications = sqliteTable('notifications', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  message: text('message').notNull(),
  type: text('type').default('info'), // info, success, warning, error
  category: text('category').default('general'), // general, job_alert, application, interview, system
  priority: text('priority').default('medium'), // low, medium, high, urgent
  entityType: text('entity_type'), // job, application, interview, user
  entityId: integer('entity_id'),
  isRead: integer('is_read', { mode: 'boolean' }).default(false),
  isArchived: integer('is_archived', { mode: 'boolean' }).default(false),
  actionUrl: text('action_url'),
  actionText: text('action_text'),
  imageUrl: text('image_url'),
  metadata: text('metadata'), // JSON object for additional data
  expiresAt: text('expires_at'),
  readAt: text('read_at'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`)
});

// Company Analytics for Recruiters
export const companyAnalytics = sqliteTable('company_analytics', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  companyId: integer('company_id').notNull().references(() => companies.id, { onDelete: 'cascade' }),
  recruiterId: integer('recruiter_id').references(() => users.id),
  date: text('date').notNull(),
  jobPostsCount: integer('job_posts_count').default(0),
  applicationsReceived: integer('applications_received').default(0),
  profileViews: integer('profile_views').default(0),
  jobViews: integer('job_views').default(0),
  interviewsScheduled: integer('interviews_scheduled').default(0),
  hiresCompleted: integer('hires_completed').default(0),
  averageTimeToHire: integer('average_time_to_hire'), // in days
  averageSalaryOffered: integer('average_salary_offered'),
  topSkillsInDemand: text('top_skills_in_demand'), // JSON array
  sourceOfApplications: text('source_of_applications'), // JSON object
  conversionRates: text('conversion_rates'), // JSON object
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`)
});

// User Activity Logs for Analytics
export const userActivityLogs = sqliteTable('user_activity_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  action: text('action').notNull(), // login, logout, job_view, job_apply, profile_update, etc.
  entityType: text('entity_type'), // job, application, profile, etc.
  entityId: integer('entity_id'),
  metadata: text('metadata'), // JSON object for additional data
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  sessionId: text('session_id'),
  timestamp: text('timestamp').default(sql`CURRENT_TIMESTAMP`)
});

// Resume Versions for tracking updates
export const resumeVersions = sqliteTable('resume_versions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  fileName: text('file_name').notNull(),
  originalName: text('original_name').notNull(),
  fileUrl: text('file_url').notNull(),
  fileSize: integer('file_size'),
  mimeType: text('mime_type'),
  version: integer('version').default(1),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  parsedContent: text('parsed_content'), // JSON object of parsed resume data
  skills: text('skills'), // JSON array extracted from resume
  experience: text('experience'), // JSON array of work experience
  education: text('education'), // JSON array of education
  uploadedAt: text('uploaded_at').default(sql`CURRENT_TIMESTAMP`)
});

// Skills Master List
export const skillsMaster = sqliteTable('skills_master', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  category: text('category'), // programming, design, marketing, etc.
  subcategory: text('subcategory'),
  description: text('description'),
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  popularity: integer('popularity').default(0),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`)
});

// Job Recommendations Engine
export const jobRecommendations = sqliteTable('job_recommendations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  jobId: integer('job_id').notNull().references(() => jobs.id, { onDelete: 'cascade' }),
  matchScore: real('match_score').notNull(), // 0.0 to 1.0
  matchReasons: text('match_reasons'), // JSON array of reasons
  skillsMatch: real('skills_match'),
  locationMatch: real('location_match'),
  salaryMatch: real('salary_match'),
  experienceMatch: real('experience_match'),
  isViewed: integer('is_viewed', { mode: 'boolean' }).default(false),
  isApplied: integer('is_applied', { mode: 'boolean' }).default(false),
  isBookmarked: integer('is_bookmarked', { mode: 'boolean' }).default(false),
  viewedAt: text('viewed_at'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`)
});

// System Analytics for Admin
export const systemAnalytics = sqliteTable('system_analytics', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  date: text('date').notNull(),
  totalUsers: integer('total_users').default(0),
  activeUsers: integer('active_users').default(0),
  newRegistrations: integer('new_registrations').default(0),
  totalJobs: integer('total_jobs').default(0),
  activeJobs: integer('active_jobs').default(0),
  newJobPosts: integer('new_job_posts').default(0),
  totalApplications: integer('total_applications').default(0),
  newApplications: integer('new_applications').default(0),
  interviewsScheduled: integer('interviews_scheduled').default(0),
  successfulHires: integer('successful_hires').default(0),
  averageTimeToHire: real('average_time_to_hire'),
  topSkills: text('top_skills'), // JSON array
  topLocations: text('top_locations'), // JSON array
  platformMetrics: text('platform_metrics'), // JSON object
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`)
});

// Import base tables reference (assuming they exist)
import { users } from '../schema.js';
import { jobs } from '../schema.js';
import { companies } from '../schema.js';
