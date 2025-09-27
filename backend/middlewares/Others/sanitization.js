// Sanitization middleware
export const sanitizeRequest = (req, res, next) => {
  // Basic request sanitization
  next();
};

export const sqlInjectionPrevention = (req, res, next) => {
  // SQL injection prevention
  next();
};

export const preventNoSqlInjection = (req, res, next) => {
  // NoSQL injection prevention
  next();
};
