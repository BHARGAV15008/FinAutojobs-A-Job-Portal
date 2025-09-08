import express from 'express';
import cors from 'cors';
import * as schema from '../../models/schema.js';
import applications from '../../routes/applications.js';
import auth from '../../routes/auth.js';
import users from '../../routes/users.js';
import companies from '../../routes/companies.js';
import jobs from '../../routes/jobs.js';
import notifications from '../../routes/notifications.js';
import dashboard from '../../routes/dashboard.js';
import savedJobs from '../../routes/savedJobs.js';
import oauth from '../../routes/oauth.js';
import { errorHandler } from '../../middleware/errorHandler.js';
import { loginLimiter as rateLimiter } from '../../middleware/rateLimiter.js';

const app = express();

app.use(cors());
app.use(express.json());
// app.use(rateLimiter); // Disabled for testing

// Routes
app.use('/api/auth', auth);
app.use('/api/oauth', oauth);
app.use('/api/users', users);
app.use('/api/companies', companies);
app.use('/api/jobs', jobs);
app.use('/api/applications', applications);
app.use('/api/notifications', notifications);
app.use('/api/dashboard', dashboard);
app.use('/api/saved-jobs', savedJobs);

// Error handling
app.use(errorHandler);

export default app;
