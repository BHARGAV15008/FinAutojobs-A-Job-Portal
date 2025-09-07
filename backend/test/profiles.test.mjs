import test from 'node:test';
import assert from 'node:assert';
import supertest from 'supertest';
import app from '../test-server.js';
import db from '../test-database.js';
import * as schema from '../schema.js';

test('Profile Management', async (t) => {
  let userToken;
  let testUserId;

  t.beforeEach(async () => {
    // Create test user
    const [user] = await db.insert(schema.users).values({
      username: 'testprofile',
      email: 'testprofile@test.com',
      password: 'Test123!',
      full_name: 'Test Profile',
      role: 'jobseeker',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }).returning();

    testUserId = user.id;

    // Get token
    const loginResponse = await supertest(app)
      .post('/api/auth/login')
      .send({
        email: 'testprofile@test.com',
        password: 'Test123!'
      });
    userToken = loginResponse.body.token;
  });

  await t.test('Profile Information', async (t) => {
    await t.test('should get user profile', async (t) => {
      const response = await supertest(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${userToken}`);

      assert.equal(response.status, 200);
      assert.ok(response.body.user);
      assert.equal(response.body.user.email, 'testprofile@test.com');
    });

    await t.test('should update profile information', async (t) => {
      const response = await supertest(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          bio: 'Experienced software engineer',
          skills: ['JavaScript', 'React', 'Node.js'],
          experience: [
            {
              title: 'Senior Developer',
              company: 'Tech Corp',
              from: '2020-01',
              to: '2023-06',
              description: 'Led development team...'
            }
          ],
          education: [
            {
              degree: 'Bachelor of Technology',
              institution: 'Tech University',
              year: '2019',
              field: 'Computer Science'
            }
          ]
        });

      assert.equal(response.status, 200);
      assert.equal(response.body.user.bio, 'Experienced software engineer');
      assert.ok(Array.isArray(response.body.user.skills));
    });
  });

  await t.test('Job Preferences', async (t) => {
    await t.test('should set job preferences', async (t) => {
      const response = await supertest(app)
        .put('/api/users/preferences')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          desired_role: 'Software Engineer',
          preferred_locations: ['Mumbai', 'Bangalore'],
          min_salary: 1500000,
          job_type: ['Full-time'],
          remote_preference: 'hybrid'
        });

      assert.equal(response.status, 200);
      assert.equal(response.body.preferences.desired_role, 'Software Engineer');
    });

    await t.test('should get job preferences', async (t) => {
      const response = await supertest(app)
        .get('/api/users/preferences')
        .set('Authorization', `Bearer ${userToken}`);

      assert.equal(response.status, 200);
      assert.equal(response.body.preferences.desired_role, 'Software Engineer');
      assert.ok(Array.isArray(response.body.preferences.preferred_locations));
    });
  });

  await t.test('Document Management', async (t) => {
    await t.test('should upload resume', async (t) => {
      const response = await supertest(app)
        .post('/api/users/documents/resume')
        .set('Authorization', `Bearer ${userToken}`)
        .attach('resume', './test/fixtures/test-resume.pdf');

      assert.equal(response.status, 200);
      assert.ok(response.body.resume_url);
    });

    await t.test('should list user documents', async (t) => {
      const response = await supertest(app)
        .get('/api/users/documents')
        .set('Authorization', `Bearer ${userToken}`);

      assert.equal(response.status, 200);
      assert.ok(Array.isArray(response.body.documents));
    });
  });

  await t.test('Profile Visibility', async (t) => {
    await t.test('should update profile visibility settings', async (t) => {
      const response = await supertest(app)
        .put('/api/users/visibility')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          public_profile: true,
          show_contact: false,
          recruiters_only: true
        });

      assert.equal(response.status, 200);
      assert.equal(response.body.visibility.public_profile, true);
      assert.equal(response.body.visibility.show_contact, false);
    });

    await t.test('should get public profile if visible', async (t) => {
      const response = await supertest(app)
        .get(`/api/users/${testUserId}/public`);

      assert.equal(response.status, 200);
      assert.ok(response.body.user);
      assert.equal(response.body.user.contact_info, undefined); // Contact info hidden
    });
  });
});
