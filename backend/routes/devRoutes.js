// Development routes for logging and debugging
import express from 'express';
const router = express.Router();

// Terminal logging endpoint for development
router.post('/log', (req, res) => {
  try {
    const { level, message, data, timestamp, source } = req.body;
    
    // Format log message for terminal
    const logMessage = `[${timestamp}] [${source?.toUpperCase() || 'APP'}] ${level?.toUpperCase() || 'LOG'}: ${message}`;
    
    // Output to terminal/console based on level
    switch (level?.toLowerCase()) {
      case 'error':
      case 'critical':
        console.error(logMessage);
        if (data) console.error('Data:', data);
        break;
      case 'warn':
        console.warn(logMessage);
        if (data) console.warn('Data:', data);
        break;
      case 'success':
        console.log(`✅ ${logMessage}`);
        if (data) console.log('Data:', data);
        break;
      case 'fetch':
      case 'api':
        console.log(`🔍 ${logMessage}`);
        if (data) console.log('Response:', data);
        break;
      case 'data':
        console.log(`📊 ${logMessage}`);
        if (data) console.log('Data:', data);
        break;
      default:
        console.log(logMessage);
        if (data) console.log('Data:', data);
    }
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error in dev logging endpoint:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
