#!/usr/bin/env node

/**
 * Database Reset Script
 * Clears all existing tables and data from the database
 */

import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { sql } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';

const DB_PATH = './database.sqlite';

console.log('🔄 Starting database reset...');

// Remove existing database file if it exists
if (fs.existsSync(DB_PATH)) {
  fs.unlinkSync(DB_PATH);
  console.log('✅ Removed existing database file');
}

// Create new empty database
const sqlite = new Database(DB_PATH);
const db = drizzle(sqlite);

console.log('✅ Created new empty database');

// Enable foreign keys
sqlite.exec('PRAGMA foreign_keys = ON;');
console.log('✅ Enabled foreign key constraints');

// Clear any existing schema information
try {
  // Get all table names
  const tables = sqlite.prepare(`
    SELECT name FROM sqlite_master 
    WHERE type='table' AND name NOT LIKE 'sqlite_%'
  `).all();

  // Drop all tables
  for (const table of tables) {
    sqlite.exec(`DROP TABLE IF EXISTS "${table.name}"`);
    console.log(`✅ Dropped table: ${table.name}`);
  }

  console.log('✅ All existing tables cleared');
} catch (error) {
  console.log('ℹ️ No existing tables to clear');
}

// Close database connection
sqlite.close();

console.log('🎉 Database reset completed successfully!');
console.log('📝 Ready for new schema creation');

process.exit(0);
