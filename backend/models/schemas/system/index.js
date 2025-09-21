/**
 * System Schemas Index
 * 
 * Exports all system-related schemas including notifications,
 * analytics, settings, and system management functionality.
 */

export { default as NotificationSchema } from './NotificationSchema.js';
export { default as AnalyticsSchema } from './AnalyticsSchema.js';

// System model factory
export { getSystemModel, createSystemModel, notificationManager, analyticsManager } from './SystemFactory.js';
