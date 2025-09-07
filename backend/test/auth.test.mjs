import test from 'node:test';
import assert from 'node:assert';
import supertest from 'supertest';
import app from './utils/test-server.js';
import db from './utils/test-database.js';
import * as schema from '../schema.js';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

test('Authentication Flow', async (t) => {
  t.before(async () => {
    // Tables are already created in test-database.js
  });

  t.after(async () => {
    // Cleanup will happen automatically when process ends
  });

  await t.test('Registration', async (t) => {
    await t.test('should register a new applicant successfully', async () => {
      const response = await supertest(app)
        .post('/api/auth/register')
        .send({
          username: 'testapplicant',
          email: 'testapplicant@test.com',
          password: 'Test123!',
          full_name: 'Test Applicant',
          role: 'applicant'
        });

      assert.strictEqual(response.status, 201);
      assert.ok(response.body.token);
      assert.strictEqual(response.body.user.email, 'testapplicant@test.com');
    });

    await t.test('should register a new recruiter successfully', async () => {
      const response = await supertest(app)
        .post('/api/auth/register')
        .send({
          username: 'testrecruiter',
          email: 'testrecruiter@test.com',
          password: 'Test123!',
          full_name: 'Test Recruiter',
          role: 'recruiter'
        });

      assert.strictEqual(response.status, 201);
      assert.ok(response.body.token);
      assert.strictEqual(response.body.user.email, 'testrecruiter@test.com');
    });

    await t.test('should fail with duplicate email', async () => {
      const response = await supertest(app)
        .post('/api/auth/register')
        .send({
          username: 'duplicate',
          email: 'testapplicant@test.com',
          password: 'Test123!',
          full_name: 'Duplicate User',
          role: 'applicant'
        });

      assert.strictEqual(response.status, 409);
      assert.ok(response.body.error);
    });
  });

  await t.test('Login', async (t) => {
    await t.test('should login applicant successfully', async () => {
      const response = await supertest(app)
        .post('/api/auth/login')
        .send({
          email: 'testapplicant@test.com',
          password: 'Test123!'
        });

      assert.strictEqual(response.status, 200);
      assert.ok(response.body.token);
      assert.strictEqual(response.body.user.role, 'applicant');
    });

    await t.test('should login recruiter successfully', async () => {
      const response = await supertest(app)
        .post('/api/auth/login')
        .send({
          email: 'testrecruiter@test.com',
          password: 'Test123!'
        });

      assert.strictEqual(response.status, 200);
      assert.ok(response.body.token);
      assert.strictEqual(response.body.user.role, 'recruiter');
    });

    await t.test('should fail with invalid credentials', async () => {
      const response = await supertest(app)
        .post('/api/auth/login')
        .send({
          email: 'testapplicant@test.com',
          password: 'WrongPass123!'
        });

      assert.strictEqual(response.status, 401);
      assert.ok(response.body.error);
    });
  });

  await t.test('Password Reset', async (t) => {
    await t.test('should send password reset email', async () => {
      const response = await supertest(app)
        .post('/api/auth/forgot-password')
        .send({
          email: 'testapplicant@test.com'
        });

      assert.strictEqual(response.status, 200);
      assert.ok(response.body.message);
    });

    await t.test('should reset password with valid token', async () => {
      // First get a valid reset token
      const users = await db.select().from(schema.users)
        .where(eq(schema.users.email, 'testapplicant@test.com'));

      const resetToken = jwt.sign(
        { id: users[0].id, type: 'password_reset' },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '1h' }
      );

      const response = await supertest(app)
        .post('/api/auth/reset-password')
        .send({
          token: resetToken,
          newPassword: 'NewTest123!'
        });

      assert.strictEqual(response.status, 200);
      assert.ok(response.body.message);
    });
  });

  await t.test('OAuth Flow', async (t) => {
    await t.test('should redirect to Google OAuth', async () => {
      const response = await supertest(app)
        .get('/api/oauth/google');

      assert.strictEqual(response.status, 302);
      assert.ok(response.header.location.includes('accounts.google.com'));
    });

    await t.test('should handle Google OAuth callback', async () => {
      // Mock the Google OAuth callback data
      const mockProfile = {
        id: 'google123',
        emails: [{ value: 'google@test.com' }],
        displayName: 'Google User'
      };

      // This is a simplified test, in reality you'd need to mock the full OAuth flow
      const response = await supertest(app)
        .get('/api/oauth/google/callback')
        .query({
          code: 'mock_code'
        });

      assert.strictEqual(response.status, 302);
      assert.ok(response.header.location.includes('/oauth/callback'));
    });
  });
});
