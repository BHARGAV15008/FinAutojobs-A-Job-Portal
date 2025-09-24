
import { describe, it, expect, beforeEach, afterAll } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import { register, login, getProfile, authenticateToken } from '../controllers/authController.js';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { users } from '../models/User.js';

const sqlite = new Database('./data/finautojobs.db');
const db = drizzle(sqlite);

const app = express();
app.use(express.json());

app.post('/register', register);
app.post('/login', login);
app.get('/profile', authenticateToken, getProfile);

describe('Auth Flow', () => {
  let token;
  const user = {
    username: 'testuser',
    email: 'test@test.com',
    password: 'password123',
    fullName: 'Test User'
  };

  beforeEach(async () => {
    await db.delete(users);
  });

  afterAll(async () => {
    await db.delete(users);
  });

  it('should register a new user', async () => {
    const res = await request(app)
      .post('/register')
      .send(user);

    expect(res.statusCode).toEqual(201);
    expect(res.body.message).toBe('User registered successfully');
    expect(res.body.user.username).toBe(user.username);
    expect(res.body.user.email).toBe(user.email);
    token = res.body.token;
  });

  it('should not register a user with an existing email', async () => {
    await request(app)
      .post('/register')
      .send(user);

    const res = await request(app)
      .post('/register')
      .send(user);

    expect(res.statusCode).toEqual(409);
    expect(res.body.message).toBe('User with this email already exists');
  });

  it('should login the user', async () => {
    await request(app)
      .post('/register')
      .send(user);

    const res = await request(app)
      .post('/login')
      .send({ email: user.email, password: user.password });

    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toBe('Login successful');
    expect(res.body.user.email).toBe(user.email);
  });

  it('should get the user profile', async () => {
    const registerRes = await request(app)
      .post('/register')
      .send(user);

    token = registerRes.body.token;

    const res = await request(app)
      .get('/profile')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.user.email).toBe(user.email);
    expect(res.body.user.fullName).toBe(user.fullName);
  });
});
