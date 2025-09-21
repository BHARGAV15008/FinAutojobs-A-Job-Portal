/**
 * FinAutoJobs Database Schema Index
 * 
 * This file exports all database schemas for the job portal application.
 * Organized by domain for better maintainability and scalability.
 * 
 * @author FinAutoJobs Team
 * @version 1.0.0
 */

// User-related schemas
export * from './users/index.js';

// Job-related schemas
export * from './jobs/index.js';

// Activity-related schemas
export * from './activities/index.js';

// System-related schemas
export * from './system/index.js';

// Company-related schemas
export * from './companies/index.js';

// Analytics-related schemas
export * from './analytics/index.js';

/**
 * Schema Categories:
 * 
 * 1. Users - All user types and authentication
 * 2. Jobs - Job postings, applications, and related data
 * 3. Activities - User activity tracking and logs
 * 4. System - Notifications, settings, and system data
 * 5. Companies - Company profiles and information
 * 6. Analytics - Metrics, reports, and analytics data
 */
