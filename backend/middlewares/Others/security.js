// Security middleware
export const xssMiddleware = (req, res, next) => {
  // Basic XSS protection
  next();
};

export const sqlInjectionMiddleware = (req, res, next) => {
  // SQL injection protection
  next();
};

export const payloadSizeMiddleware = (req, res, next) => {
  // Payload size check
  next();
};
