import test from 'node:test';
import assert from 'node:assert';
import supertest from 'supertest';
import app from './utils/test-server.js';
import db from './utils/test-database.js';
import * as schema from '../schema.js';

test('Notifications', async (t) => {
  let userToken;
  let testUserId;

  t.beforeEach(async () => {
    // Create test user
    const [user] = await db.insert(schema.users).values({
      username: 'testuser',
      email: 'testuser@test.com',
      password: 'Test123!',
      full_name: 'Test User',
      role: 'jobseeker',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }).returning();

    testUserId = user.id;

    // Get token
    const loginResponse = await supertest(app)
      .post('/api/auth/login')
      .send({
        email: 'testuser@test.com',
        password: 'Test123!'
      });
    userToken = loginResponse.body.token;

    // Create some test notifications
    await db.insert(schema.notifications).values([
      {
        user_id: testUserId,
        type: 'application_update',
        message: 'Your application status has been updated',
        read: false,
        created_at: new Date().toISOString()
      },
      {
        user_id: testUserId,
        type: 'job_alert',
        message: 'New job matching your preferences',
        read: false,
        created_at: new Date().toISOString()
      }
    ]);
  });

  await t.test('Notification Retrieval', async (t) => {
    await t.test('should get user notifications', async (t) => {
      const response = await supertest(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${userToken}`);

      assert.equal(response.status, 200);
      assert.ok(Array.isArray(response.body.notifications));
      assert.equal(response.body.notifications.length, 2);
      assert.equal(response.body.unread_count, 2);
    });

    await t.test('should get unread notification count', async (t) => {
      const response = await supertest(app)
        .get('/api/notifications/count')
        .set('Authorization', `Bearer ${userToken}`);

      assert.equal(response.status, 200);
      assert.equal(response.body.unread_count, 2);
    });
  });

  await t.test('Notification Management', async (t) => {
    let notificationId;

    await t.test('should mark notification as read', async (t) => {
      const response = await supertest(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${userToken}`);
      
      notificationId = response.body.notifications[0].id;

      const updateResponse = await supertest(app)
        .put(`/api/notifications/${notificationId}/read`)
        .set('Authorization', `Bearer ${userToken}`);

      assert.equal(updateResponse.status, 200);

      const countResponse = await supertest(app)
        .get('/api/notifications/count')
        .set('Authorization', `Bearer ${userToken}`);

      assert.equal(countResponse.body.unread_count, 1);
    });

    await t.test('should mark all notifications as read', async (t) => {
      const response = await supertest(app)
        .put('/api/notifications/read-all')
        .set('Authorization', `Bearer ${userToken}`);

      assert.equal(response.status, 200);

      const countResponse = await supertest(app)
        .get('/api/notifications/count')
        .set('Authorization', `Bearer ${userToken}`);

      assert.equal(countResponse.body.unread_count, 0);
    });

    await t.test('should delete notification', async (t) => {
      const response = await supertest(app)
        .delete(`/api/notifications/${notificationId}`)
        .set('Authorization', `Bearer ${userToken}`);

      assert.equal(response.status, 200);

      const getResponse = await supertest(app)
        .get('/api/notifications')
        .set('Authorization', `Bearer ${userToken}`);

      assert.equal(getResponse.body.notifications.length, 1);
    });
  });

  await t.test('Notification Settings', async (t) => {
    await t.test('should update notification preferences', async (t) => {
      const response = await supertest(app)
        .put('/api/notifications/settings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          email_notifications: false,
          push_notifications: true,
          notification_types: ['application_update', 'job_alert']
        });

      assert.equal(response.status, 200);
      assert.equal(response.body.settings.email_notifications, false);
      assert.equal(response.body.settings.push_notifications, true);
    });

    await t.test('should get notification settings', async (t) => {
      const response = await supertest(app)
        .get('/api/notifications/settings')
        .set('Authorization', `Bearer ${userToken}`);

      assert.equal(response.status, 200);
      assert.equal(response.body.settings.email_notifications, false);
      assert.equal(response.body.settings.push_notifications, true);
    });
  });
});
