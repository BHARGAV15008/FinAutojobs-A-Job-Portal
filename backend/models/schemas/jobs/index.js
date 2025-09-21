/**
 * Job Schemas Index
 * 
 * Exports all job-related schemas including job postings,
 * applications, bookmarks, and interview management.
 */

export { default as JobSchema } from './JobSchema.js';
export { default as JobApplicationSchema } from './JobApplicationSchema.js';
export { default as JobBookmarkSchema } from './JobBookmarkSchema.js';
export { default as InterviewSchema } from './InterviewSchema.js';

// Job model factory
export { getJobModel, createJobModel, searchJobs, getJobRecommendations, getApplicationStats, bulkJobOperations, jobAnalytics } from './JobFactory.js';
