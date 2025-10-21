import express from 'express';
import { googleOAuth, microsoftOAuth, appleOAuth, getOAuthConfig } from '../../Controllers/Others/oauthController.js';
import { loginLimiter as rateLimiter } from '../../middlewares/Others/rateLimiter.js';

const router = express.Router();

// Apply rate limiting to OAuth routes
router.use(rateLimiter);

// OAuth routes
router.post('/google', googleOAuth);
router.post('/microsoft', microsoftOAuth);
router.post('/apple', appleOAuth);
router.get('/config', getOAuthConfig);

export default router;
