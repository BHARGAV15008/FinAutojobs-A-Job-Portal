#!/usr/bin/env node

/**
 * CORS Configuration Test Script
 * Tests if the current CORS configuration allows the frontend domain
 */

import corsOptions from '../config/cors.js';

// Test domains
const testDomains = [
  'https://finautojobs-a-job-portal-pivn.onrender.com',
  'https://finautojobs-backend.onrender.com',
  'http://localhost:3000',
  'https://finautojobs.vercel.app'
];

console.log('🔍 Testing CORS Configuration...\n');

testDomains.forEach(domain => {
  console.log(`Testing: ${domain}`);
  
  corsOptions.origin(domain, (error, allowed) => {
    if (error) {
      console.log(`❌ BLOCKED: ${error.message}`);
    } else if (allowed) {
      console.log(`✅ ALLOWED`);
    } else {
      console.log(`❌ BLOCKED: Not in allowed origins`);
    }
    console.log('');
  });
});

console.log('🔧 Current Environment:', process.env.NODE_ENV || 'development');
console.log('🌐 Frontend URL:', process.env.FRONTEND_URL || 'Not set');
console.log('🔗 CORS Origin:', process.env.CORS_ORIGIN || 'Not set');
