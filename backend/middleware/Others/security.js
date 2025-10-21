import xss from 'xss';

// Basic email validation
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length >= 5 && email.length <= 255;
};

// Basic password validation
export const isValidPassword = (password) => {
  return typeof password === 'string' && password.length >= 8;
};

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
  // Skip SQL injection checks for auth endpoints to allow passwords and names
  if (req.path.startsWith('/api/auth/')) {
    return next();
  }
  
  const isSqlInjection = (str) => {
    const sqlPatterns = [
      /\b(select|insert|update|delete|drop|truncate|alter|exec)\b/i, // SQL commands
      /\b(concat|char|ascii|hex|unhex|base64|dec|sleep|benchmark)\b/i, // SQL functions
      /(union.*select|select.*from|insert.*into|delete.*from)/i // Common SQL injection patterns
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

// Security headers middleware
export const securityHeaders = (req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
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

  // Check for valid JSON if Content-Type is application/json and there's a body
  if (req.headers['content-type']?.includes('application/json') && req.body && Object.keys(req.body).length > 0) {
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
