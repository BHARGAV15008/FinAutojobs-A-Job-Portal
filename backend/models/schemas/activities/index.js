/**
 * Activity Schemas Index
 * 
 * Exports all activity-related schemas for tracking user actions,
 * system events, and audit trails across the platform.
 */

export { default as UserActivitySchema } from './UserActivitySchema.js';

// Activity model factory
export { getActivityModel, createActivityModel, trackActivity } from './ActivityFactory.js';
