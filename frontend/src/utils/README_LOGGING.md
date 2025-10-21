# Logging System

This project uses a custom logging system that separates terminal logs from browser console logs for better development experience.

## How It Works

### **Terminal Logs** 📊
- **Data fetching operations** (API calls, responses)
- **Successful operations** (login, data loaded)
- **Information logs** (state changes, configuration)
- Sent to backend terminal via `/api/dev/log` endpoint

### **Console Logs** ⚠️
- **Errors only** (API failures, exceptions)
- **Warnings** (fallbacks, deprecated usage)
- **Critical issues** (system failures)
- Displayed in browser console

## Usage

```javascript
import { log } from '../utils/logger';

// These go to TERMINAL
log.fetch('Fetching user data', userId);
log.api('API Response', responseData);
log.success('User logged in successfully');
log.data('Transformed data', transformedData);
log.info('Configuration loaded', config);

// These go to CONSOLE
log.error('Failed to fetch data', error);
log.warn('Using fallback configuration', fallbackConfig);
log.critical('Database connection failed', error);
```

## Log Types

### Terminal Logs
- `log.fetch()` - Data fetching operations
- `log.api()` - API responses and calls
- `log.success()` - Successful operations
- `log.data()` - Data transformations and processing
- `log.info()` - General information

### Console Logs
- `log.error()` - Error messages
- `log.warn()` - Warning messages  
- `log.critical()` - Critical system issues

## Benefits

1. **Clean Console** - Only errors and warnings in browser console
2. **Rich Terminal Output** - All data and API logs in development terminal
3. **Better Debugging** - Separate concerns for different log types
4. **Production Ready** - Automatically disabled in production builds

## Backend Integration

The system uses a simple backend endpoint at `/api/dev/log` that formats and outputs logs to the terminal with proper formatting and timestamps.

**Fallback Behavior**: If the backend is not running or the endpoint is unavailable, the logger automatically falls back to console logging with a `[TERMINAL]` prefix, ensuring your application continues to work normally.

## Migration

Replace existing `console.log` statements:

```javascript
// OLD
console.log('🔍 Fetching jobs:', params);
console.log('✅ Jobs fetched:', data);
console.error('❌ Error:', error);

// NEW
log.fetch('Fetching jobs', params);
log.success('Jobs fetched', data);
log.error('Error fetching jobs', error);
```
