
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  fullName: text('full_name'),
  phone: text('phone'),
  role: text('role', { enum: ['applicant', 'recruiter', 'admin'] }).notNull().default('applicant'),
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
