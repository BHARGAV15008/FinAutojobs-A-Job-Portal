import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// User schema
export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  fullName: text('full_name'),
  phone: text('phone'),
  role: text('role', { enum: ['jobseeker', 'employer', 'admin'] }).notNull().default('jobseeker'),
  status: text('status', { enum: ['active', 'inactive', 'suspended'] }).notNull().default('active'),
  bio: text('bio'),
  location: text('location'),
  profilePicture: text('profile_picture'),
  linkedinUrl: text('linkedin_url'),
  githubUrl: text('github_url'),
  portfolioUrl: text('portfolio_url'),
  skills: text('skills'), // JSON string
  qualification: text('qualification'),
  experienceYears: integer('experience_years'),
  resumeUrl: text('resume_url'),
  companyName: text('company_name'),
  position: text('position'),
  companyId: integer('company_id'),
  emailVerified: integer('email_verified', { mode: 'boolean' }).notNull().default(false),
  phoneVerified: integer('phone_verified', { mode: 'boolean' }).notNull().default(false),
  resetToken: text('reset_token'),
  resetTokenExpires: text('reset_token_expires'),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`)
});

// Company schema
export const companies = sqliteTable('companies', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  description: text('description'),
  logoUrl: text('logo_url'),
  website: text('website'),
  location: text('location'),
  industry: text('industry'),
  size: text('size'),
  foundedYear: integer('founded_year'),
  email: text('email'),
  phone: text('phone'),
  address: text('address'),
  linkedinUrl: text('linkedin_url'),
  twitterUrl: text('twitter_url'),
  facebookUrl: text('facebook_url'),
  benefits: text('benefits'),
  culture: text('culture'),
  mission: text('mission'),
  vision: text('vision'),
  status: text('status').notNull().default('active'),
  verified: integer('verified', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`)
});

// Jobs schema
export const jobs = sqliteTable('jobs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  companyId: integer('company_id').notNull().references(() => companies.id, { onDelete: 'cascade' }),
  categoryId: integer('category_id'),
  location: text('location'),
  salaryMin: integer('salary_min'),
  salaryMax: integer('salary_max'),
  salaryCurrency: text('salary_currency').notNull().default('INR'),
  jobType: text('job_type', { enum: ['Full Time', 'Part Time', 'Contract', 'Internship', 'Freelance'] }).notNull().default('Full Time'),
  workMode: text('work_mode', { enum: ['Work from Office', 'Work from Home', 'Hybrid'] }).notNull().default('Work from Office'),
  experienceMin: integer('experience_min').notNull().default(0),
  experienceMax: integer('experience_max'),
  englishLevel: text('english_level'),
  description: text('description'),
  requirements: text('requirements'),
  benefits: text('benefits'),
  skillsRequired: text('skills_required'),
  responsibilities: text('responsibilities'),
  educationLevel: text('education_level'),
  salaryType: text('salary_type').notNull().default('annual'),
  otherLanguages: text('other_languages'),
  applicationDeadline: text('application_deadline'),
  positionsAvailable: integer('positions_available').notNull().default(1),
  applicationsCount: integer('applications_count').notNull().default(0),
  category: text('category'),
  tags: text('tags'),
  priority: text('priority').notNull().default('normal'),
  featured: integer('featured', { mode: 'boolean' }).notNull().default(false),
  remoteFriendly: integer('remote_friendly', { mode: 'boolean' }).notNull().default(false),
  slug: text('slug').unique(),
  metaTitle: text('meta_title'),
  metaDescription: text('meta_description'),
  status: text('status', { enum: ['active', 'inactive', 'closed', 'draft'] }).notNull().default('active'),
  postedBy: integer('posted_by'),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  publishedAt: text('published_at')
});

// Applications schema
export const applications = sqliteTable('applications', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  jobId: integer('job_id').notNull().references(() => jobs.id, { onDelete: 'cascade' }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  status: text('status', { enum: ['pending', 'reviewed', 'shortlisted', 'rejected', 'hired'] }).notNull().default('pending'),
  coverLetter: text('cover_letter'),
  resumeUrl: text('resume_url'),
  appliedAt: text('applied_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').notNull().default(sql`CURRENT_TIMESTAMP`)
});

// Notifications schema
export const notifications = sqliteTable('notifications', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  message: text('message').notNull(),
  read: integer('read', { mode: 'boolean' }).notNull().default(false),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`)
});

export const seedTestData = async (db) => {
  await db.exec(`
    -- Insert test users
    INSERT INTO users (username, email, password_hash, full_name, role)
    VALUES 
      ('testapplicant', 'testapplicant@test.com', '$2a$10$test_hash', 'Test Applicant', 'applicant'),
      ('testrecruiter', 'testrecruiter@test.com', '$2a$10$test_hash', 'Test Recruiter', 'recruiter');

    -- Insert test company
    INSERT INTO companies (name, description, location, industry)
    VALUES ('Test Company', 'A test company', 'Test Location', 'Technology');

    -- Insert test job
    INSERT INTO jobs (
      company_id,
      recruiter_id,
      title,
      description,
      location,
      type,
      experience_level,
      salary_min,
      salary_max
    )
    SELECT 
      c.id,
      u.id,
      'Test Developer Position',
      'A test job posting',
      'Test Location',
      'Full-time',
      'Mid-level',
      50000,
      80000
    FROM companies c, users u
    WHERE u.role = 'recruiter'
    LIMIT 1;
  `);
};
