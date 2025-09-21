/**
 * User Schemas Index
 * 
 * Exports all user-related schemas including base user schema
 * and role-specific schemas for Applicants, Recruiters, and Admins.
 */

export { default as BaseUserSchema } from './BaseUserSchema.js';
export { default as ApplicantSchema } from './ApplicantSchema.js';
export { default as RecruiterSchema } from './RecruiterSchema.js';
export { default as AdminSchema } from './AdminSchema.js';

// User model factory
export { getUserModel, createUserModel } from './UserFactory.js';
