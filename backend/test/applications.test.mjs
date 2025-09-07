import test from 'node:test';
import assert from 'node:assert';
import supertest from 'supertest';
import app from './utils/test-server.js';
import db from './utils/test-database.js';
import * as schema from '../schema.js';

test('Application Management', async (t) => {
  let recruiterToken;
  let applicantToken;
  let testJobId;
  let testApplicationId;

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

    // Create a test job
    const jobResponse = await supertest(app)
      .post('/api/jobs')
      .set('Authorization', `Bearer ${recruiterToken}`)
      .send({
        title: 'Test Job for Applications',
        description: 'Testing application flow...',
        location: 'Test Location',
        type: 'Full-time'
      });
    testJobId = jobResponse.body.job.id;
  });

  await t.test('Application Submission', async (t) => {
    await t.test('applicant should submit application successfully', async (t) => {
      const response = await supertest(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${applicantToken}`)
        .send({
          job_id: testJobId,
          cover_letter: 'I am very interested in this position...',
          resume_url: 'https://example.com/resume.pdf',
          portfolio_url: 'https://example.com/portfolio',
          expected_salary: 75000,
          available_from: '2024-10-01',
          notice_period: '30 days'
        });

      assert.equal(response.status, 201);
      assert.ok(response.body.application);
      testApplicationId = response.body.application.id;
    });

    await t.test('should prevent duplicate applications', async (t) => {
      const response = await supertest(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${applicantToken}`)
        .send({
          job_id: testJobId,
          cover_letter: 'Trying to apply again...',
          resume_url: 'https://example.com/resume.pdf'
        });

      assert.equal(response.status, 400);
    });
  });

  await t.test('Application Status Updates', async (t) => {
    await t.test('recruiter should update application status', async (t) => {
      const response = await supertest(app)
        .put(`/api/applications/${testApplicationId}/status`)
        .set('Authorization', `Bearer ${recruiterToken}`)
        .send({
          status: 'shortlisted',
          feedback: 'Good profile, moving to interview phase'
        });

      assert.equal(response.status, 200);
      assert.equal(response.body.application.status, 'shortlisted');
    });

    await t.test('applicant should see updated status', async (t) => {
      const response = await supertest(app)
        .get(`/api/applications/${testApplicationId}`)
        .set('Authorization', `Bearer ${applicantToken}`);

      assert.equal(response.status, 200);
      assert.equal(response.body.application.status, 'shortlisted');
    });
  });

  await t.test('Interview Scheduling', async (t) => {
    await t.test('recruiter should schedule interview', async (t) => {
      const response = await supertest(app)
        .post(`/api/applications/${testApplicationId}/interview`)
        .set('Authorization', `Bearer ${recruiterToken}`)
        .send({
          interview_date: '2024-10-15T10:00:00Z',
          interview_type: 'video',
          notes: 'Technical interview with senior engineer'
        });

      assert.equal(response.status, 200);
      assert.ok(response.body.application.interview_scheduled);
    });

    await t.test('applicant should confirm interview', async (t) => {
      const response = await supertest(app)
        .put(`/api/applications/${testApplicationId}/interview/confirm`)
        .set('Authorization', `Bearer ${applicantToken}`)
        .send({
          confirmed: true
        });

      assert.equal(response.status, 200);
      assert.equal(response.body.application.interview_confirmed, true);
    });
  });

  await t.test('Application Withdrawal', async (t) => {
    await t.test('applicant should withdraw application', async (t) => {
      const response = await supertest(app)
        .put(`/api/applications/${testApplicationId}/withdraw`)
        .set('Authorization', `Bearer ${applicantToken}`);

      assert.equal(response.status, 200);
      assert.equal(response.body.application.status, 'withdrawn');
    });

    await t.test('withdrawn application should be visible in history', async (t) => {
      const response = await supertest(app)
        .get('/api/applications/history')
        .set('Authorization', `Bearer ${applicantToken}`);

      assert.equal(response.status, 200);
      const hasWithdrawnApp = response.body.applications.some(app => 
        app.id === testApplicationId && app.status === 'withdrawn'
      );
      assert.ok(hasWithdrawnApp);
    });
  });
});
