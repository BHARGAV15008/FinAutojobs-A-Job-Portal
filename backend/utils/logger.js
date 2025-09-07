import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure logs directory exists
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

class Logger {
  constructor() {
    this.logFile = path.join(logsDir, 'app.log');
    this.errorFile = path.join(logsDir, 'error.log');
  }

  formatMessage(level, message, meta = {}) {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      message,
      ...meta
    }) + '\n';
  }

  writeToFile(filename, content) {
    try {
      fs.appendFileSync(filename, content);
    } catch (error) {
      console.error('Failed to write to log file:', error);
    }
  }

  info(message, meta = {}) {
    const logMessage = this.formatMessage('INFO', message, meta);
    console.log(`ℹ️  ${message}`, meta);
    
    if (process.env.NODE_ENV === 'production') {
      this.writeToFile(this.logFile, logMessage);
    }
  }

  error(message, meta = {}) {
    const logMessage = this.formatMessage('ERROR', message, meta);
    console.error(`❌ ${message}`, meta);
    
    if (process.env.NODE_ENV === 'production') {
      this.writeToFile(this.errorFile, logMessage);
    }
  }

  warn(message, meta = {}) {
    const logMessage = this.formatMessage('WARN', message, meta);
    console.warn(`⚠️  ${message}`, meta);
    
    if (process.env.NODE_ENV === 'production') {
      this.writeToFile(this.logFile, logMessage);
    }
  }

  debug(message, meta = {}) {
    if (process.env.NODE_ENV === 'development') {
      const logMessage = this.formatMessage('DEBUG', message, meta);
      console.debug(`🐛 ${message}`, meta);
      this.writeToFile(this.logFile, logMessage);
    }
  }

  // Log API requests
  logRequest(req, res, duration) {
    const logData = {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      userId: req.user?.userId || 'anonymous'
    };

    if (res.statusCode >= 400) {
      this.error('API Request Failed', logData);
    } else {
      this.info('API Request', logData);
    }
  }

  // Log database operations
  logDatabase(operation, table, meta = {}) {
    this.info(`Database ${operation}`, { table, ...meta });
  }

  // Log authentication events
  logAuth(event, userId, meta = {}) {
    this.info(`Auth Event: ${event}`, { userId, ...meta });
  }
}

export const logger = new Logger();
export default logger;