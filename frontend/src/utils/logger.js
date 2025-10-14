// Logger utility for separating terminal and console logs
// Terminal logs: Data fetching, API responses, successful operations
// Console logs: Only errors and critical issues

const isDev = import.meta.env.DEV;

// Get API base URL without circular dependency
const getApiBaseUrl = () => {
  return import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
};

// Send logs to terminal via server endpoint
const logToTerminal = async (level, message, data = null) => {
  if (!isDev) return; // Only log in development
  
  // Check if we should use fallback mode (backend unavailable)
  if (logToTerminal.useFallback) {
    console.log(`[TERMINAL] ${level.toUpperCase()}: ${message}`, data || '');
    return;
  }
  
  try {
    const logData = {
      level,
      message,
      data: data ? (typeof data === 'object' ? JSON.stringify(data, null, 2) : data) : null,
      timestamp: new Date().toISOString(),
      source: 'frontend'
    };

    // Send to backend logging endpoint (with timeout)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1000); // 1 second timeout

    fetch(`${getApiBaseUrl()}/dev/log`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(logData),
      signal: controller.signal
    }).then(response => {
      clearTimeout(timeoutId);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
    }).catch((error) => {
      clearTimeout(timeoutId);
      // Switch to fallback mode permanently for this session
      if (!logToTerminal.fallbackShown) {
        console.log('📡 Backend logging unavailable, switching to console fallback mode');
        logToTerminal.fallbackShown = true;
        logToTerminal.useFallback = true;
      }
      console.log(`[TERMINAL] ${level.toUpperCase()}: ${message}`, data || '');
    });
  } catch (error) {
    // Fallback to console if terminal logging fails
    console.log(`[TERMINAL] ${level.toUpperCase()}: ${message}`, data || '');
  }
};

// Terminal logging functions (for data and successful operations)
export const terminalLog = {
  info: (message, data) => logToTerminal('info', message, data),
  success: (message, data) => logToTerminal('success', message, data),
  data: (message, data) => logToTerminal('data', message, data),
  fetch: (message, data) => logToTerminal('fetch', message, data),
  api: (message, data) => logToTerminal('api', message, data),
};

// Console logging functions (for errors only)
export const consoleLog = {
  error: (message, error) => {
    console.error(`❌ ${message}`, error);
  },
  warn: (message, data) => {
    console.warn(`⚠️ ${message}`, data);
  },
  critical: (message, error) => {
    console.error(`🚨 CRITICAL: ${message}`, error);
  }
};

// Backward compatibility - replace console.log calls
export const log = {
  // Data fetching and API responses go to terminal
  fetch: terminalLog.fetch,
  api: terminalLog.api,
  data: terminalLog.data,
  success: terminalLog.success,
  info: terminalLog.info,
  
  // Errors stay in console
  error: consoleLog.error,
  warn: consoleLog.warn,
  critical: consoleLog.critical
};

export default log;
