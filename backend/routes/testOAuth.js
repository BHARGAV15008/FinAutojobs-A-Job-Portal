import express from 'express';
import jwt from 'jsonwebtoken';
import { BaseUser, createUserByRole } from '../models/UserModels.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key-change-this-in-production';

// Test OAuth simulation endpoints for development
router.get('/simulate/:provider', async (req, res) => {
  try {
    const { provider } = req.params;
    const { role = 'applicant', scenario = 'new_user' } = req.query;
    
    console.log(`🧪 Simulating ${provider} OAuth - Role: ${role}, Scenario: ${scenario}`);
    
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    
    // Simulate different test scenarios
    const testScenarios = {
      new_user: {
        email: `test.${provider}.new@example.com`,
        firstName: 'Test',
        lastName: 'User',
        isNewUser: true
      },
      existing_user: {
        email: `test.${provider}.existing@example.com`,
        firstName: 'Existing',
        lastName: 'User',
        isNewUser: false
      },
      email_conflict: {
        email: 'conflict@example.com',
        firstName: 'Conflict',
        lastName: 'User',
        conflictRole: role === 'applicant' ? 'recruiter' : 'applicant'
      }
    };
    
    const testData = testScenarios[scenario];
    
    if (scenario === 'email_conflict') {
      // Simulate email role conflict
      const errorMessage = `Email ${testData.email} is already registered as ${testData.conflictRole}. Please use a different email or login with the correct role.`;
      return res.redirect(`${frontendUrl}/auth/oauth-error?error=email_role_conflict&message=${encodeURIComponent(errorMessage)}&existingRole=${testData.conflictRole}&requestedRole=${role}&provider=${provider}`);
    }
    
    // Check if user exists for existing_user scenario
    let user;
    if (scenario === 'existing_user') {
      user = await BaseUser.findOne({ email: testData.email, role });
      if (!user) {
        // Create the user for testing
        const userData = {
          firstName: testData.firstName,
          lastName: testData.lastName,
          email: testData.email,
          username: `test_${provider}_existing_${Date.now()}`,
          phone: '+1234567890',
          role: role,
          emailVerified: true,
          oauthProviders: [{
            provider: provider,
            providerId: `test_${provider}_${Date.now()}`,
            accessToken: 'test_access_token',
            refreshToken: 'test_refresh_token'
          }],
          password: Math.random().toString(36).slice(-12) + 'Aa1!',
          ...(role === 'recruiter' && {
            companyInfo: {
              companyName: 'Test Company',
              department: 'HR',
              jobTitle: 'Recruiter'
            }
          }),
          ...(role === 'applicant' && {
            skills: { primary: [], technical: [], soft: [] },
            careerInfo: {
              headline: 'Test User',
              industry: 'Technology',
              location: 'Test City'
            },
            documents: {}
          })
        };
        
        user = await createUserByRole(userData);
        console.log('✅ Created test user for existing_user scenario:', user._id);
      }
    } else {
      // Create new user
      const userData = {
        firstName: testData.firstName,
        lastName: testData.lastName,
        email: testData.email,
        username: `test_${provider}_${Date.now()}`,
        phone: '+1234567890',
        role: role,
        emailVerified: true,
        oauthProviders: [{
          provider: provider,
          providerId: `test_${provider}_${Date.now()}`,
          accessToken: 'test_access_token',
          refreshToken: 'test_refresh_token'
        }],
        password: Math.random().toString(36).slice(-12) + 'Aa1!',
        ...(role === 'recruiter' && {
          companyInfo: {
            companyName: 'Test Company',
            department: 'HR',
            jobTitle: 'Recruiter'
          }
        }),
        ...(role === 'applicant' && {
          skills: { primary: [], technical: [], soft: [] },
          careerInfo: {
            headline: 'Test User',
            industry: 'Technology',
            location: 'Test City'
          },
          documents: {}
        })
      };
      
      user = await createUserByRole(userData);
      console.log('✅ Created test user for new_user scenario:', user._id);
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user._id,
        userId: user._id,
        email: user.email,
        role: user.role,
        provider: provider
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Redirect to frontend with token
    const redirectUrl = `${frontendUrl}/auth/oauth-callback?token=${token}&provider=${provider}&role=${user.role}&isNewUser=${testData.isNewUser}`;
    
    console.log('✅ Test OAuth simulation successful, redirecting to:', redirectUrl);
    res.redirect(redirectUrl);
    
  } catch (error) {
    console.error('❌ Test OAuth simulation error:', error);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3001';
    res.redirect(`${frontendUrl}/auth/oauth-error?error=simulation_failed&message=${encodeURIComponent(error.message)}&provider=${req.params.provider}`);
  }
});

// Test OAuth status endpoint
router.get('/status', (req, res) => {
  res.json({
    success: true,
    message: 'Test OAuth service is running',
    availableTests: {
      new_user: 'Simulates new user registration',
      existing_user: 'Simulates existing user login',
      email_conflict: 'Simulates email role conflict'
    },
    usage: {
      endpoint: '/api/test-oauth/simulate/{provider}',
      parameters: {
        role: 'applicant or recruiter',
        scenario: 'new_user, existing_user, or email_conflict'
      },
      examples: [
        '/api/test-oauth/simulate/google?role=applicant&scenario=new_user',
        '/api/test-oauth/simulate/google?role=recruiter&scenario=existing_user',
        '/api/test-oauth/simulate/google?role=applicant&scenario=email_conflict'
      ]
    }
  });
});

export default router;
