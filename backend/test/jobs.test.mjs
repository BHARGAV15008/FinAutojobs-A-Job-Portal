import test from 'node:test';
import assert from 'node:assert';
import supertest from 'supertest';
import app from './utils/test-server.js';
import db from './utils/test-database.js';
import * as schema from '../schema.js';

test('Jobs', async (t) => {
  let recruiterToken;
  let applicantToken;
  let testJobId;

  t.beforeEach(async () => {
    // Create test users
    await db.insert(schema.users).values([
      {
        username: 'testrecruiter',
        email: 'testrecruiter@test.com',
        password: 'Test123!',
        full_name: 'Test Recruiter',
        role: 'recruiter',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        username: 'testapplicant',
        email: 'testapplicant@test.com',
        password: 'Test123!',
        full_name: 'Test Applicant',
        role: 'jobseeker',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ]);

    // Get tokens
    const recruiterLogin = await supertest(app)
      .post('/api/auth/login')
      .send({
        email: 'testrecruiter@test.com',
        password: 'Test123!'
      });
    recruiterToken = recruiterLogin.body.token;

    const applicantLogin = await supertest(app)
      .post('/api/auth/login')
      .send({
        email: 'testapplicant@test.com',
        password: 'Test123!'
      });
    applicantToken = applicantLogin.body.token;
  });

  await t.test('Job Posting', async (t) => {
    await t.test('recruiter should create a job post', async (t) => {
      const response = await supertest(app)
        .post('/api/jobs')
        .set('Authorization', `Bearer ${recruiterToken}`)
        .send({
          title: 'Senior Software Engineer',
          description: 'We are looking for a senior software engineer...',
          location: 'Mumbai, India',
          type: 'Full-time',
          experience_level: 'Senior',
          salary_min: 1500000,
          salary_max: 2500000,
          skills: ['JavaScript', 'React', 'Node.js'],
          requirements: ['5+ years experience', 'Bachelor\'s degree'],
          benefits: ['Health insurance', 'Stock options']
        });

      assert.equal(response.status, 201);
      assert.ok(response.body.job);
      testJobId = response.body.job.id;
    });

    await t.test('recruiter should update a job post', async (t) => {
      const response = await supertest(app)
        .put(`/api/jobs/${testJobId}`)
        .set('Authorization', `Bearer ${recruiterToken}`)
        .send({
          title: 'Updated: Senior Software Engineer',
          salary_max: 3000000
        });

      assert.equal(response.status, 200);
      assert.equal(response.body.job.title, 'Updated: Senior Software Engineer');
    });
  });

  await t.test('Job Search and Filtering', async (t) => {
    await t.test('should search jobs by keyword', async (t) => {
      const response = await supertest(app)
        .get('/api/jobs/search')
        .query({ q: 'software engineer' });

      assert.equal(response.status, 200);
      assert.ok(Array.isArray(response.body.jobs));
    });

    await t.test('should filter jobs by location', async (t) => {
      const response = await supertest(app)
        .get('/api/jobs')
        .query({ location: 'Mumbai' });

      assert.equal(response.status, 200);
      assert.ok(Array.isArray(response.body.jobs));
    });

    await t.test('should filter jobs by experience level', async (t) => {
      const response = await supertest(app)
        .get('/api/jobs')
        .query({ experience_level: 'Senior' });

      assert.equal(response.status, 200);
      assert.ok(Array.isArray(response.body.jobs));
    });
  });

  await t.test('Job Status Management', async (t) => {
    await t.test('recruiter should close a job posting', async (t) => {
      const response = await supertest(app)
        .put(`/api/jobs/${testJobId}/status`)
        .set('Authorization', `Bearer ${recruiterToken}`)
        .send({ status: 'closed' });

      assert.equal(response.status, 200);
      assert.equal(response.body.job.status, 'closed');
    });

    await t.test('closed job should not accept new applications', async (t) => {
      const response = await supertest(app)
        .post(`/api/jobs/${testJobId}/apply`)
        .set('Authorization', `Bearer ${applicantToken}`)
        .send({
          cover_letter: 'Trying to apply to closed job...',
          resume_url: 'https://example.com/resume.pdf'
        });

      assert.equal(response.status, 400);
    });
  });
});
