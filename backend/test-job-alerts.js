import jwt from 'jsonwebtoken';

// Test JWT token decoding
const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGRkMGVlMmM3OTUxMjJlYzJlNzk0NzkiLCJlbWFpbCI6InRlY2hub2dlbml1czE1MDBAZ21haWwuY29tIiwicm9sZSI6ImFwcGxpY2FudCIsImlhdCI6MTcyNzg3MzY5MSwiZXhwIjoxNzI3OTYwMDkxfQ.example'; // This would be the actual token

try {
  // Try to decode a sample token structure
  const samplePayload = {
    userId: '68dd0ee2c795122ec2e79479',
    email: 'technogenius1500@gmail.com',
    role: 'applicant',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60)
  };
  
  const token = jwt.sign(samplePayload, 'your-jwt-secret-key-change-this-in-production');
  console.log('Generated test token:', token);
  
  const decoded = jwt.verify(token, 'your-jwt-secret-key-change-this-in-production');
  console.log('Decoded token:', JSON.stringify(decoded, null, 2));
  
  const userId = decoded.userId || decoded.id;
  console.log('Extracted userId:', userId);
  
} catch (error) {
  console.error('JWT error:', error);
}
