import csrf from 'csurf';
import { db } from '../config/database.js';
import { userSessions } from '../schema.js';
import { eq } from 'drizzle-orm';

// Configure CSRF protection
const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  }
});

// Middleware to validate CSRF token for protected routes
export const validateCSRFToken = async (req, res, next) => {
  // Skip CSRF check for login and registration
  if (req.path === '/auth/login' || req.path === '/auth/register') {
    return next();
  }

  // Check if user is authenticated
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return next();
  }

  try {
    // Verify session exists
    const session = await db.select()
      .from(userSessions)
      .where(eq(userSessions.token, token))
      .limit(1);

    if (session.length === 0) {
      return res.status(403).json({ message: 'Invalid session' });
    }

    // Apply CSRF protection
    csrfProtection(req, res, next);
  } catch (error) {
    console.error('CSRF validation error:', error);
    return res.status(403).json({ message: 'CSRF validation failed' });
  }
};

export default validateCSRFToken;
