#!/usr/bin/env node

/**
 * Debug Authentication Script
 * This script helps debug login/logout issues by testing the authentication flow
 */

import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: './.env.local' });

const JWT_SECRET = process.env.JWT_SECRET || 'finautojobs-jwt-secret-key-2024';

console.log('🔍 ===== AUTHENTICATION DEBUG SCRIPT =====');
console.log('🔍 JWT_SECRET length:', JWT_SECRET.length);
console.log('🔍 JWT_SECRET (first 10 chars):', JWT_SECRET.substring(0, 10) + '...');

// Test token generation
const testPayload = {
  id: '507f1f77bcf86cd799439011',
  userId: 'test-user-123',
  role: 'applicant',
  email: 'test@example.com'
};

console.log('\n🔍 ===== TOKEN GENERATION TEST =====');
try {
  const token = jwt.sign(testPayload, JWT_SECRET, { expiresIn: '24h' });
  console.log('✅ Token generated successfully');
  console.log('🔍 Token (first 50 chars):', token.substring(0, 50) + '...');
  
  // Test token verification
  console.log('\n🔍 ===== TOKEN VERIFICATION TEST =====');
  const decoded = jwt.verify(token, JWT_SECRET);
  console.log('✅ Token verified successfully');
  console.log('🔍 Decoded payload:', decoded);
  
  // Check expiry
  const now = Math.floor(Date.now() / 1000);
  const timeToExpiry = decoded.exp - now;
  console.log('🔍 Token expires in:', timeToExpiry, 'seconds (', Math.floor(timeToExpiry / 3600), 'hours )');
  
} catch (error) {
  console.error('❌ Token test failed:', error.message);
}

// Test with expired token
console.log('\n🔍 ===== EXPIRED TOKEN TEST =====');
try {
  const expiredToken = jwt.sign(testPayload, JWT_SECRET, { expiresIn: '-1h' }); // Already expired
  console.log('✅ Expired token generated');
  
  try {
    jwt.verify(expiredToken, JWT_SECRET);
    console.log('❌ This should not happen - expired token was accepted');
  } catch (expiredError) {
    console.log('✅ Expired token correctly rejected:', expiredError.name);
  }
} catch (error) {
  console.error('❌ Expired token test failed:', error.message);
}

// Test with wrong secret
console.log('\n🔍 ===== WRONG SECRET TEST =====');
try {
  const token = jwt.sign(testPayload, JWT_SECRET, { expiresIn: '24h' });
  
  try {
    jwt.verify(token, 'wrong-secret');
    console.log('❌ This should not happen - token with wrong secret was accepted');
  } catch (wrongSecretError) {
    console.log('✅ Token with wrong secret correctly rejected:', wrongSecretError.name);
  }
} catch (error) {
  console.error('❌ Wrong secret test failed:', error.message);
}

console.log('\n🔍 ===== DEBUG COMPLETE =====');
console.log('💡 Common issues and solutions:');
console.log('   1. Token expiry: Check if tokens are expiring too quickly');
console.log('   2. JWT secret mismatch: Ensure frontend and backend use same secret');
console.log('   3. Token format: Ensure token is sent as "Bearer <token>"');
console.log('   4. Local storage: Check if token is being cleared unexpectedly');
console.log('   5. Network issues: Check if requests are failing due to CORS or network');
