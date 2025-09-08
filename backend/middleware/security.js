import { z } from 'zod';
import xss from 'xss';
import validator from 'validator';

// Enhanced input validation schemas
export const userSchema = z.object({
  email: z.string()
    .email('Invalid email format')
    .min(5, 'Email must be at least 5 characters')
    .max(255, 'Email must not exceed 255 characters')
    .transform(val => validator.normalizeEmail(val)),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must not exceed 100 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, 
      'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character'),
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters')
    .transform(val => xss(val.trim())),
});

// XSS Middleware
export const xssMiddleware = (req, res, next) => {
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = xss(req.body[key]);
      }
    });
  }
  next();
};

// SQL Injection Prevention Middleware
export const sqlInjectionMiddleware = (req, res, next) => {
  const isSqlInjection = (str) => {
    const sqlPatterns = [
      /\b(select|insert|update|delete|drop|truncate|alter|exec)\b/i, // SQL commands
      /('|"|`|\||\{|\}|\[|\]|\^|\\)/, // Special characters
      /\b(concat|char|ascii|hex|unhex|base64|dec|sleep|benchmark)\b/i // SQL functions
    ];

    return sqlPatterns.some(pattern => pattern.test(str));
  };

  if (req.body) {
    const containsSqlInjection = Object.values(req.body).some(value => 
      typeof value === 'string' && isSqlInjection(value)
    );

    if (containsSqlInjection) {
      return res.status(400).json({
        error: 'Invalid input detected',
        message: 'Please remove any special characters or SQL commands'
      });
    }
  }
  
  next();
};

// Input Sanitization Middleware
export const sanitizeInputs = (req, res, next) => {
  const sanitize = (obj) => {
    Object.keys(obj).forEach(key => {
      if (typeof obj[key] === 'string') {
        obj[key] = validator.escape(obj[key].trim());
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitize(obj[key]);
      }
    });
  };

  if (req.body) sanitize(req.body);
  if (req.query) sanitize(req.query);
  if (req.params) sanitize(req.params);

  next();
};

// Large Payload Protection
export const payloadSizeMiddleware = (req, res, next) => {
  const contentLength = parseInt(req.headers['content-length'], 10);
  const MAX_PAYLOAD_SIZE = 5 * 1024 * 1024; // 5MB limit

  if (contentLength > MAX_PAYLOAD_SIZE) {
    return res.status(413).json({
      status: 'error',
      code: 'PAYLOAD_TOO_LARGE',
      message: 'Request payload size exceeds the limit of 5MB'
    });
  }

  // Check for valid JSON if Content-Type is application/json
  if (req.headers['content-type']?.includes('application/json')) {
    try {
      JSON.parse(JSON.stringify(req.body));
    } catch (e) {
      return res.status(400).json({
        status: 'error',
        code: 'INVALID_JSON',
        message: 'Invalid JSON payload'
      });
    }
  }

  next();
};
