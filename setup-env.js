#!/usr/bin/env node

/**
 * FinAutoJobs Environment Setup Script
 * 
 * This script helps set up the environment configuration for the project.
 * It copies the .env.example to .env and provides guidance on configuration.
 */

const fs = require('fs');
const path = require('path');

const ENV_EXAMPLE_PATH = path.join(__dirname, '.env.example');
const ENV_PATH = path.join(__dirname, '.env');

console.log('🚀 FinAutoJobs Environment Setup');
console.log('================================\n');

// Check if .env.example exists
if (!fs.existsSync(ENV_EXAMPLE_PATH)) {
    console.error('❌ .env.example file not found!');
    console.log('Please ensure .env.example exists in the project root.');
    process.exit(1);
}

// Check if .env already exists
if (fs.existsSync(ENV_PATH)) {
    console.log('⚠️  .env file already exists!');
    console.log('If you want to recreate it, please delete the existing .env file first.');
    console.log('Current .env file location:', ENV_PATH);
    process.exit(0);
}

try {
    // Copy .env.example to .env
    fs.copyFileSync(ENV_EXAMPLE_PATH, ENV_PATH);
    console.log('✅ Successfully created .env file from .env.example');
    console.log('📍 Location:', ENV_PATH);
    
    console.log('\n📝 Next Steps:');
    console.log('1. Edit the .env file and replace placeholder values with your actual configuration');
    console.log('2. Set up your MongoDB database and update MONGODB_URI');
    console.log('3. Configure OAuth providers (Google, Microsoft, etc.) if needed');
    console.log('4. Set strong, unique secrets for JWT_SECRET and SESSION_SECRET');
    console.log('5. Configure email settings for notifications');
    
    console.log('\n🔧 Key Variables to Update:');
    console.log('- MONGODB_URI: Your MongoDB connection string');
    console.log('- JWT_SECRET: Strong secret for JWT tokens');
    console.log('- SESSION_SECRET: Strong secret for sessions');
    console.log('- EMAIL_USER & EMAIL_PASS: Email configuration');
    console.log('- ADMIN_EMAIL & ADMIN_PASSWORD: Admin account credentials');
    
    console.log('\n🌍 Environment Configuration:');
    console.log('- Development: The default values should work for local development');
    console.log('- Production: Update URLs, secrets, and database connections');
    console.log('- Staging: Use staging-specific values');
    
    console.log('\n⚡ Quick Start:');
    console.log('1. npm install (in both root and backend directories)');
    console.log('2. Start MongoDB locally or use MongoDB Atlas');
    console.log('3. npm run dev (to start both frontend and backend)');
    
    console.log('\n🔒 Security Reminder:');
    console.log('- Never commit .env files to version control');
    console.log('- Use strong, unique secrets for production');
    console.log('- Rotate secrets regularly');
    
} catch (error) {
    console.error('❌ Error creating .env file:', error.message);
    process.exit(1);
}
