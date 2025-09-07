import { z, ZodError } from 'zod';

// Custom error classes
export class AppError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message, details = null) {
    super(message, 400, true);
    this.details = details;
    this.name = 'ValidationError';
  }
}

export class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed') {
    super(message, 401, true);
    this.name = 'AuthenticationError';
  }
}

export class AuthorizationError extends AppError {
  constructor(message = 'Authorization failed') {
    super(message, 403, true);
    this.name = 'AuthorizationError';
  }
}

export class NotFoundError extends AppError {
  constructor(message = 'Resource not found') {
    super(message, 404, true);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource conflict') {
    super(message, 409, true);
    this.name = 'ConflictError';
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Too many requests') {
    super(message, 429, true);
    this.name = 'RateLimitError';
  }
}

// Database error handler
export const handleDatabaseError = (error) => {
  console.error('Database Error:', error);
  
  // SQLite specific error codes
  if (error.code === 'SQLITE_CONSTRAINT') {
    if (error.message.includes('UNIQUE constraint failed')) {
      return new ConflictError('Resource already exists');
    }
    if (error.message.includes('FOREIGN KEY constraint failed')) {
      return new ValidationError('Invalid reference to related resource');
    }
    return new ValidationError('Database constraint violation');
  }
  
  return new AppError('Database operation failed', 500);
};

// Zod validation error handler
export const handleZodError = (error) => {
  if (error.name === 'ZodError') {
    const details = error.errors.map(err => ({
      field: err.path.join('.'),
      message: err.message,
      code: err.code
    }));
    
    return new ValidationError(
      'Validation failed',
      details
    );
  }
  
  return new ValidationError('Invalid input data');
};

// JWT error handler
export const handleJWTError = (error) => {
  if (error.name === 'JsonWebTokenError') {
    return new AuthenticationError('Invalid token');
  }
  
  if (error.name === 'TokenExpiredError') {
    return new AuthenticationError('Token expired');
  }
  
  return new AuthenticationError('Authentication failed');
};

// File upload error handler
export const handleFileUploadError = (error) => {
  if (error.code === 'LIMIT_FILE_SIZE') {
    return new ValidationError('File size exceeds limit');
  }
  
  if (error.code === 'LIMIT_FILE_COUNT') {
    return new ValidationError('Too many files uploaded');
  }
  
  if (error.code === 'LIMIT_UNEXPECTED_FILE') {
    return new ValidationError('Invalid file type');
  }
  
  return new ValidationError('File upload failed');
};

// Rate limiting error handler
export const handleRateLimitError = (error) => {
  return new RateLimitError('Too many requests, please try again later');
};

// Main error handler middleware
export const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.stack = err.stack;

  // Log error details
  console.error('Error occurred:', {
    message: error.message,
    stack: error.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });

  // Handle specific error types
  if (err.name === 'ZodError' || err instanceof ZodError) {
    error = handleZodError(err);
  } else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    error = handleJWTError(err);
  } else if (err.code && err.code.startsWith('SQLITE_')) {
    error = handleDatabaseError(err);
  } else if (err.code && err.code.startsWith('LIMIT_')) {
    error = handleFileUploadError(err);
  } else if (err.name === 'TooManyRequestsError') {
    error = handleRateLimitError(err);
  }

  // Send error response
  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    ...(error.details && { details: error.details }),
    timestamp: new Date().toISOString(),
    path: req.originalUrl
  });
};

// Async error wrapper for route handlers
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Request validation middleware
export const validateRequest = (schema) => {
  return (req, res, next) => {
    try {
      // Validate request body, query, and params based on schema
      const validatedData = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params
      });

      // Replace request data with validated data
      req.body = validatedData.body || req.body;
      req.query = validatedData.query || req.query;
      req.params = validatedData.params || req.params;

      next();
    } catch (error) {
      next(handleZodError(error));
    }
  };
};

// 404 handler
export const notFoundHandler = (req, res, next) => {
  const error = new NotFoundError(`Route ${req.originalUrl} not found`);
  next(error);
};

// Development error handler
export const developmentErrorHandler = (err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message,
    stack: err.stack,
    details: err.details,
    timestamp: new Date().toISOString(),
    path: req.originalUrl
  });
};

// Production error handler
export const productionErrorHandler = (err, req, res, next) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
      ...(err.details && { details: err.details }),
      timestamp: new Date().toISOString()
    });
  } else {
    // Programming or other unknown error: don't leak error details
    console.error('ERROR 💥', err);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString()
    });
  }
};

// Error monitoring middleware
export const errorMonitor = (err, req, res, next) => {
  // Log error for monitoring
  console.error('Error Monitor:', {
    error: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    user: req.user?.id || 'anonymous',
    ip: req.ip,
    timestamp: new Date().toISOString()
  });

  // Here you could integrate with error monitoring services
  // like Sentry, Rollbar, etc.
  
  next(err);
};

// Global unhandled promise rejection handler
process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  console.error(err.stack);
  
  // In production, you might want to gracefully shut down the server
  process.exit(1);
});

// Global uncaught exception handler
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(err.name, err.message);
  console.error(err.stack);
  
  // In production, you might want to gracefully shut down the server
  process.exit(1);
});

export default {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError,
  errorHandler,
  asyncHandler,
  validateRequest,
  notFoundHandler,
  developmentErrorHandler,
  productionErrorHandler,
  errorMonitor
};
