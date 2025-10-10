#!/usr/bin/env node

/**
 * Generate secure secrets for Render deployment
 * Run with: node generate-secrets.js
 */

import crypto from 'crypto';
import fs from 'fs';

console.log('🔐 Generating secure secrets for Render deployment...\n');

// Generate JWT Secret
const jwtSecret = crypto.randomBytes(32).toString('hex');
console.log('JWT_SECRET=' + jwtSecret);

// Generate Session Secret  
const sessionSecret = crypto.randomBytes(32).toString('hex');
console.log('SESSION_SECRET=' + sessionSecret);

console.log('\n✅ Secrets generated successfully!');
console.log('\n📋 Copy the above values to your Render backend environment variables');
console.log('   Go to: Render Dashboard > Backend Service > Environment > Add Environment Variable');
console.log('\n🔒 Keep these secrets secure and never commit them to version control');

// Also create a file for easy copying
const secretsContent = `# Generated secrets for Render deployment
# Generated on: ${new Date().toISOString()}

JWT_SECRET=${jwtSecret}
SESSION_SECRET=${sessionSecret}

# Instructions:
# 1. Copy these to your Render backend service environment variables
# 2. Delete this file after copying (for security)
# 3. Never commit secrets to version control
`;

fs.writeFileSync('GENERATED_SECRETS.txt', secretsContent);
console.log('\n📄 Secrets also saved to: GENERATED_SECRETS.txt');
console.log('   (Delete this file after copying to Render for security)');
