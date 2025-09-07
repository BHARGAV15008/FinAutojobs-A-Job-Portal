// Simple rate limiter for testing
export const rateLimiter = (req, res, next) => {
  next();
};

// Simple error handler for testing
export const errorHandler = (err, req, res, next) => {
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
};
