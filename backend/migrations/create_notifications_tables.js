import { migrate } from 'drizzle-orm/sqlite-core/migrator';
import { sqliteTable, text, integer, boolean } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const notifications = sqliteTable('notifications', {
  id: integer('id').primaryKey(),
  userId: integer('user_id').notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  type: text('type').notNull(),
  isRead: boolean('is_read').notNull().default(false),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

export const notificationSettings = sqliteTable('notification_settings', {
  id: integer('id').primaryKey(),
  userId: integer('user_id').notNull().unique(),
  emailNotifications: boolean('email_notifications').notNull().default(true),
  pushNotifications: boolean('push_notifications').notNull().default(true),
  jobAlerts: boolean('job_alerts').notNull().default(true),
  applicationUpdates: boolean('application_updates').notNull().default(true),
  interviewReminders: boolean('interview_reminders').notNull().default(true),
  marketingEmails: boolean('marketing_emails').notNull().default(false),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});
