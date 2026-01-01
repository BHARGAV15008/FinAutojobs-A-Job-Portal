// Simple logging utility for FinAutoJobs backend

const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG'
};

const createLogger = (category) => {
  const log = (level, message, meta = {}) => {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      category,
      message,
      ...meta
    };
    
    // In production, you might want to use a proper logging library like Winston
    console.log(`[${timestamp}] ${level} [${category}]: ${message}`, meta);
    
    return logEntry;
  };

  return {
    error: (message, meta) => log(LOG_LEVELS.ERROR, message, meta),
    warn: (message, meta) => log(LOG_LEVELS.WARN, message, meta),
    info: (message, meta) => log(LOG_LEVELS.INFO, message, meta),
    debug: (message, meta) => log(LOG_LEVELS.DEBUG, message, meta)
  };
};

// Pre-configured loggers for different components
export const securityLogger = createLogger('SECURITY');
export const authLogger = createLogger('AUTH');
export const apiLogger = createLogger('API');
export const dbLogger = createLogger('DATABASE');
export const appLogger = createLogger('APP');

// Default logger
export const logger = createLogger('GENERAL');

export default logger;
