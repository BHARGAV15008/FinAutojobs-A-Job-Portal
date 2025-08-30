import { sqliteTable, text, integer, real, blob } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// Users table
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  full_name: text('full_name'),
  phone: text('phone'),
  role: text('role').notNull().default('jobseeker'), // 'jobseeker', 'employer', 'admin'
  
  // Role-specific fields for applicants
  skills: text('skills'), // JSON string of skills array
  qualification: text('qualification'),
  experience_years: integer('experience_years'),
  resume_url: text('resume_url'),
  
  // Role-specific fields for recruiters/employers
  company_name: text('company_name'),
  position: text('position'),
  company_id: integer('company_id'),
  
  // Profile fields
  bio: text('bio'),
  location: text('location'),
  profile_picture: text('profile_picture'),
  linkedin_url: text('linkedin_url'),
  github_url: text('github_url'),
  portfolio_url: text('portfolio_url'),
  
  // Status and timestamps
  status: text('status').notNull().default('active'), // 'active', 'inactive', 'suspended'
  email_verified: integer('email_verified', { mode: 'boolean' }).notNull().default(false),
  phone_verified: integer('phone_verified', { mode: 'boolean' }).notNull().default(false),
  created_at: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updated_at: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`)
});

// Companies table
export const companies = sqliteTable('companies', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  description: text('description'),
  logo_url: text('logo_url'),
  website: text('website'),
  location: text('location'),
  industry: text('industry'),
  size: text('size'), // '1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'
  founded_year: integer('founded_year'),
  
  // Contact information
  email: text('email'),
  phone: text('phone'),
  address: text('address'),
  
  // Social media
  linkedin_url: text('linkedin_url'),
  twitter_url: text('twitter_url'),
  facebook_url: text('facebook_url'),
  
  // Company details
  benefits: text('benefits'), // JSON string
  culture: text('culture'),
  mission: text('mission'),
  vision: text('vision'),
  
  // Status and timestamps
  status: text('status').notNull().default('active'), // 'active', 'inactive'
  verified: integer('verified', { mode: 'boolean' }).notNull().default(false),
  created_at: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updated_at: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`)
});

// Jobs table
export const jobs = sqliteTable('jobs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  company_id: integer('company_id').notNull().references(() => companies.id, { onDelete: 'cascade' }),
  
  // Job details
  description: text('description').notNull(),
  requirements: text('requirements'), // JSON string or text
  responsibilities: text('responsibilities'), // JSON string or text
  benefits: text('benefits'), // JSON string or text
  
  // Location and work details
  location: text('location').notNull(),
  work_mode: text('work_mode').notNull().default('Work from Office'), // 'Work from Office', 'Work from Home', 'Hybrid'
  job_type: text('job_type').notNull().default('Full Time'), // 'Full Time', 'Part Time', 'Contract', 'Internship'
  
  // Experience and skills
  experience_min: integer('experience_min').notNull().default(0),
  experience_max: integer('experience_max').notNull().default(0),
  skills_required: text('skills_required'), // JSON string
  education_level: text('education_level'), // 'High School', 'Bachelor', 'Master', 'PhD'
  
  // Salary information
  salary_min: real('salary_min'),
  salary_max: real('salary_max'),
  salary_currency: text('salary_currency').notNull().default('INR'),
  salary_type: text('salary_type').notNull().default('annual'), // 'annual', 'monthly', 'hourly'
  
  // Language requirements
  english_level: text('english_level'), // 'Basic English', 'Good English', 'Advanced English'
  other_languages: text('other_languages'), // JSON string
  
  // Application details
  application_deadline: text('application_deadline'),
  positions_available: integer('positions_available').notNull().default(1),
  applications_count: integer('applications_count').notNull().default(0),
  
  // Job metadata
  category: text('category'), // 'Finance', 'Automotive', 'Technology', etc.
  tags: text('tags'), // JSON string
  priority: text('priority').notNull().default('normal'), // 'low', 'normal', 'high', 'urgent'
  
  // Status and timestamps
  status: text('status').notNull().default('active'), // 'active', 'inactive', 'closed', 'draft'
  featured: integer('featured', { mode: 'boolean' }).notNull().default(false),
  remote_friendly: integer('remote_friendly', { mode: 'boolean' }).notNull().default(false),
  
  // SEO and search
  slug: text('slug').unique(),
  meta_title: text('meta_title'),
  meta_description: text('meta_description'),
  
  created_at: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updated_at: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  published_at: text('published_at')
});

// Applications table
export const applications = sqliteTable('applications', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  job_id: integer('job_id').notNull().references(() => jobs.id, { onDelete: 'cascade' }),
  user_id: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  // Application content
  cover_letter: text('cover_letter'),
  resume_url: text('resume_url'),
  portfolio_url: text('portfolio_url'),
  
  // Application details
  expected_salary: real('expected_salary'),
  available_from: text('available_from'),
  notice_period: text('notice_period'), // 'Immediate', '15 days', '1 month', '2 months', '3 months'
  
  // Custom questions responses
  custom_responses: text('custom_responses'), // JSON string
  
  // Application status and tracking
  status: text('status').notNull().default('pending'), // 'pending', 'reviewed', 'shortlisted', 'interviewed', 'offered', 'hired', 'rejected', 'withdrawn'
  stage: text('stage').notNull().default('applied'), // 'applied', 'screening', 'interview', 'final', 'offer', 'hired'
  
  // HR notes and feedback
  hr_notes: text('hr_notes'),
  feedback: text('feedback'),
  rating: integer('rating'), // 1-5 rating
  
  // Interview details
  interview_scheduled: text('interview_scheduled'),
  interview_type: text('interview_type'), // 'phone', 'video', 'in-person', 'technical'
  interview_notes: text('interview_notes'),
  
  // Timestamps
  created_at: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updated_at: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  reviewed_at: text('reviewed_at'),
  responded_at: text('responded_at')
});

// Job categories table (optional - for better organization)
export const jobCategories = sqliteTable('job_categories', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  description: text('description'),
  icon: text('icon'),
  color: text('color'),
  parent_id: integer('parent_id').references(() => jobCategories.id),
  sort_order: integer('sort_order').notNull().default(0),
  status: text('status').notNull().default('active'),
  created_at: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`)
});

// Saved jobs table (for job seekers to save jobs)
export const savedJobs = sqliteTable('saved_jobs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  user_id: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  job_id: integer('job_id').notNull().references(() => jobs.id, { onDelete: 'cascade' }),
  created_at: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`)
});

// User sessions table (for JWT token management)
export const userSessions = sqliteTable('user_sessions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  user_id: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  token: text('token').notNull().unique(),
  refresh_token: text('refresh_token'),
  expires_at: text('expires_at').notNull(),
  created_at: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  last_used: text('last_used').notNull().default(sql`CURRENT_TIMESTAMP`),
  ip_address: text('ip_address'),
  user_agent: text('user_agent'),
  status: text('status').notNull().default('active') // 'active', 'expired', 'revoked'
});

// Schema exports complete