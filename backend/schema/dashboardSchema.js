import { sqliteTable, text, integer, real, blob } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// User preferences and settings table
export const userPreferences = sqliteTable('user_preferences', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  theme: text('theme').default('light'), // light, dark, auto
  fontSize: text('font_size').default('medium'), // small, medium, large, extra-large
  fontFamily: text('font_family').default('Inter'), // Inter, Roboto, Open Sans, etc.
  language: text('language').default('en'),
  emailNotifications: integer('email_notifications', { mode: 'boolean' }).default(true),
  pushNotifications: integer('push_notifications', { mode: 'boolean' }).default(true),
  jobAlerts: integer('job_alerts', { mode: 'boolean' }).default(true),
  dashboardLayout: text('dashboard_layout').default('grid'), // grid, list, compact, masonry
  sidebarCollapsed: integer('sidebar_collapsed', { mode: 'boolean' }).default(false),
  colorScheme: text('color_scheme').default('blue'), // blue, green, purple, orange, red
  timezone: text('timezone').default('Asia/Kolkata'),
  dateFormat: text('date_format').default('DD/MM/YYYY'),
  timeFormat: text('time_format').default('12'), // 12, 24
  currency: text('currency').default('INR'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`)
});

// Job alerts and notifications
export const jobAlerts = sqliteTable('job_alerts', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  keywords: text('keywords'), // JSON array of keywords
  location: text('location'),
  salaryMin: integer('salary_min'),
  salaryMax: integer('salary_max'),
  jobType: text('job_type'), // Full Time, Part Time, etc.
  workMode: text('work_mode'), // Remote, Hybrid, Office
  experienceMin: integer('experience_min'),
  experienceMax: integer('experience_max'),
  skills: text('skills'), // JSON array of skills
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  frequency: text('frequency').default('daily'), // daily, weekly, instant
  lastSent: text('last_sent'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`)
});

// Interview schedules
export const interviews = sqliteTable('interviews', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  applicationId: integer('application_id').notNull().references(() => applications.id, { onDelete: 'cascade' }),
  recruiterId: integer('recruiter_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  applicantId: integer('applicant_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  jobId: integer('job_id').notNull().references(() => jobs.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  scheduledAt: text('scheduled_at').notNull(),
  duration: integer('duration').default(60), // in minutes
  type: text('type').default('video'), // video, phone, in-person
  meetingLink: text('meeting_link'),
  location: text('location'),
  status: text('status').default('scheduled'), // scheduled, completed, cancelled, rescheduled
  feedback: text('feedback'),
  rating: integer('rating'), // 1-5 scale
  notes: text('notes'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`)
});

// Assessment tests
export const assessments = sqliteTable('assessments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  applicationId: integer('application_id').notNull().references(() => applications.id, { onDelete: 'cascade' }),
  recruiterId: integer('recruiter_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  applicantId: integer('applicant_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  jobId: integer('job_id').notNull().references(() => jobs.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  description: text('description'),
  type: text('type').default('technical'), // technical, aptitude, personality
  duration: integer('duration').default(60), // in minutes
  totalQuestions: integer('total_questions'),
  passingScore: integer('passing_score'),
  instructions: text('instructions'),
  questions: text('questions'), // JSON array of questions
  status: text('status').default('pending'), // pending, in-progress, completed, expired
  startedAt: text('started_at'),
  completedAt: text('completed_at'),
  score: integer('score'),
  answers: text('answers'), // JSON array of answers
  feedback: text('feedback'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`)
});

// Company analytics
export const companyAnalytics = sqliteTable('company_analytics', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  companyId: integer('company_id').notNull().references(() => companies.id, { onDelete: 'cascade' }),
  date: text('date').notNull(), // YYYY-MM-DD format
  jobsPosted: integer('jobs_posted').default(0),
  jobsActive: integer('jobs_active').default(0),
  applicationsReceived: integer('applications_received').default(0),
  applicationsReviewed: integer('applications_reviewed').default(0),
  candidatesHired: integer('candidates_hired').default(0),
  profileViews: integer('profile_views').default(0),
  jobViews: integer('job_views').default(0),
  avgTimeToHire: integer('avg_time_to_hire'), // in days
  avgSalaryOffered: integer('avg_salary_offered'),
  topSkillsRequested: text('top_skills_requested'), // JSON array
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`)
});

// User activity logs
export const userActivityLogs = sqliteTable('user_activity_logs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  action: text('action').notNull(), // login, logout, job_view, application_submit, etc.
  entityType: text('entity_type'), // job, application, company, etc.
  entityId: integer('entity_id'),
  metadata: text('metadata'), // JSON object with additional data
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`)
});

// System notifications
export const notifications = sqliteTable('notifications', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  message: text('message').notNull(),
  type: text('type').default('info'), // info, success, warning, error
  category: text('category').default('general'), // general, job, application, interview, system
  entityType: text('entity_type'), // job, application, interview, etc.
  entityId: integer('entity_id'),
  isRead: integer('is_read', { mode: 'boolean' }).default(false),
  actionUrl: text('action_url'),
  actionText: text('action_text'),
  expiresAt: text('expires_at'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`)
});

// Dashboard widgets configuration
export const dashboardWidgets = sqliteTable('dashboard_widgets', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  widgetType: text('widget_type').notNull(), // stats, chart, list, calendar, etc.
  title: text('title').notNull(),
  position: integer('position').default(0),
  size: text('size').default('medium'), // small, medium, large
  isVisible: integer('is_visible', { mode: 'boolean' }).default(true),
  configuration: text('configuration'), // JSON object with widget-specific config
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`)
});

// Additional tables for enhanced dashboard functionality

// User skills and qualifications
export const userSkills = sqliteTable('user_skills', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  skillName: text('skill_name').notNull(),
  proficiencyLevel: text('proficiency_level').default('beginner'), // beginner, intermediate, advanced, expert
  yearsOfExperience: integer('years_of_experience').default(0),
  isCertified: integer('is_certified', { mode: 'boolean' }).default(false),
  certificationName: text('certification_name'),
  certificationUrl: text('certification_url'),
  isVerified: integer('is_verified', { mode: 'boolean' }).default(false),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`)
});

// User education details
export const userEducation = sqliteTable('user_education', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  institutionName: text('institution_name').notNull(),
  degree: text('degree').notNull(),
  fieldOfStudy: text('field_of_study'),
  startDate: text('start_date'),
  endDate: text('end_date'),
  grade: text('grade'),
  description: text('description'),
  isCurrentlyStudying: integer('is_currently_studying', { mode: 'boolean' }).default(false),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`)
});

// User work experience
export const userExperience = sqliteTable('user_experience', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  companyName: text('company_name').notNull(),
  position: text('position').notNull(),
  location: text('location'),
  startDate: text('start_date').notNull(),
  endDate: text('end_date'),
  isCurrentJob: integer('is_current_job', { mode: 'boolean' }).default(false),
  description: text('description'),
  achievements: text('achievements'), // JSON array
  skills: text('skills'), // JSON array
  salary: integer('salary'),
  employmentType: text('employment_type').default('full-time'), // full-time, part-time, contract, internship
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`)
});

// Resume versions and management
export const userResumes = sqliteTable('user_resumes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  fileName: text('file_name').notNull(),
  fileUrl: text('file_url').notNull(),
  fileSize: integer('file_size'), // in bytes
  fileType: text('file_type').default('pdf'), // pdf, doc, docx
  isDefault: integer('is_default', { mode: 'boolean' }).default(false),
  downloadCount: integer('download_count').default(0),
  lastDownloaded: text('last_downloaded'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`)
});

// Job recommendations and matching
export const jobRecommendations = sqliteTable('job_recommendations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  jobId: integer('job_id').notNull().references(() => jobs.id, { onDelete: 'cascade' }),
  matchScore: integer('match_score').notNull(), // 0-100
  matchingFactors: text('matching_factors'), // JSON array of matching criteria
  reason: text('reason'), // Why this job was recommended
  isViewed: integer('is_viewed', { mode: 'boolean' }).default(false),
  isApplied: integer('is_applied', { mode: 'boolean' }).default(false),
  isBookmarked: integer('is_bookmarked', { mode: 'boolean' }).default(false),
  viewedAt: text('viewed_at'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`)
});

// Application tracking and status history
export const applicationStatusHistory = sqliteTable('application_status_history', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  applicationId: integer('application_id').notNull().references(() => applications.id, { onDelete: 'cascade' }),
  previousStatus: text('previous_status'),
  newStatus: text('new_status').notNull(),
  changedBy: integer('changed_by').references(() => users.id),
  notes: text('notes'),
  notificationSent: integer('notification_sent', { mode: 'boolean' }).default(false),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`)
});

// Import base tables from main schema
import { users, companies, jobs, applications } from '../schema.js';
