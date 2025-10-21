const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const cron = require('node-cron');
require('dotenv').config();

// Database imports
const { db, runMigrations, healthCheck } = require('./config/database');
const realTimeService = require('./services/realTimeService');
const dashboardController = require('./controllers/dashboardController');

// Create Express app
const app = express();
const server = http.createServer(app);

// WebSocket server
const wss = new WebSocket.Server({ server });

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3001',
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  const dbHealth = healthCheck();
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: dbHealth ? 'connected' : 'disconnected',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    version: process.env.npm_package_version || '1.0.0'
  });
});

// Database info endpoint
app.get('/api/database/info', (req, res) => {
  res.json({
    success: true,
    data: {
      type: 'SQLite with Drizzle ORM',
      features: [
        'Real-time data synchronization',
        'Comprehensive analytics',
        'WebSocket support',
        'Automated migrations',
        'Performance monitoring',
        'Data validation',
        'Relationship management'
      ],
      tables: [
        'users', 'user_profiles', 'user_addresses', 'user_settings', 'user_sessions',
        'applicant_profiles', 'education', 'work_experience', 'skills', 'certifications', 'projects',
        'companies', 'recruiter_profiles', 'company_locations', 'company_reviews', 'company_departments',
        'jobs', 'job_applications', 'interview_schedules', 'job_alerts', 'job_bookmarks',
        'user_activities', 'job_analytics', 'company_analytics', 'user_analytics', 'platform_analytics',
        'search_analytics', 'email_analytics', 'performance_metrics',
        'messages', 'conversations', 'notifications', 'email_templates', 'push_subscriptions',
        'sms_templates', 'communication_preferences'
      ],
      lastUpdated: new Date().toISOString()
    }
  });
});

// Dashboard API routes
app.get('/api/dashboard', authenticateToken, dashboardController.getDashboard);
app.get('/api/dashboard/applicant', authenticateToken, dashboardController.getApplicantDashboard);
app.get('/api/dashboard/recruiter', authenticateToken, dashboardController.getRecruiterDashboard);
app.get('/api/dashboard/admin', authenticateToken, dashboardController.getAdminDashboard);
app.get('/api/analytics', authenticateToken, dashboardController.getAnalytics);
app.put('/api/profile/completeness', authenticateToken, dashboardController.updateProfileCompleteness);

// Real-time metrics endpoint
app.get('/api/realtime/metrics', authenticateToken, async (req, res) => {
  try {
    const { userId, role } = req.user;
    const metrics = await realTimeService.getDashboardMetrics(userId, role);
    
    res.json({
      success: true,
      data: metrics,
      realTime: true,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch real-time metrics',
      error: error.message
    });
  }
});

// WebSocket connection handling
wss.on('connection', (ws, req) => {
  console.log('New WebSocket connection established');

  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);
      
      if (data.type === 'auth') {
        // Authenticate WebSocket connection
        const user = await authenticateWebSocket(data.token);
        if (user) {
          ws.userId = user.id;
          ws.userRole = user.role;
          
          // Set up real-time subscriptions for this user
          dashboardController.handleWebSocketConnection(ws, user.id);
          
          ws.send(JSON.stringify({
            type: 'auth_success',
            message: 'WebSocket authenticated successfully'
          }));
        } else {
          ws.send(JSON.stringify({
            type: 'auth_error',
            message: 'Invalid authentication token'
          }));
          ws.close();
        }
      } else if (data.type === 'subscribe') {
        // Subscribe to specific real-time updates
        if (ws.userId) {
          const unsubscribe = realTimeService.subscribe(data.event, (eventData) => {
            ws.send(JSON.stringify({
              type: 'event',
              event: data.event,
              data: eventData
            }));
          });
          
          // Store unsubscribe function
          if (!ws.subscriptions) ws.subscriptions = [];
          ws.subscriptions.push(unsubscribe);
        }
      }
    } catch (error) {
      console.error('WebSocket message error:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Invalid message format'
      }));
    }
  });

  ws.on('close', () => {
    console.log('WebSocket connection closed');
    // Clean up subscriptions
    if (ws.subscriptions) {
      ws.subscriptions.forEach(unsubscribe => unsubscribe());
    }
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

// Authentication middleware
async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }

  try {
    // Verify JWT token (implement your JWT verification logic)
    const user = await verifyJWT(token);
    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
}

// WebSocket authentication
async function authenticateWebSocket(token) {
  try {
    return await verifyJWT(token);
  } catch (error) {
    return null;
  }
}

// JWT verification (implement based on your auth system)
async function verifyJWT(token) {
  // This is a placeholder - implement your actual JWT verification
  // For now, return a mock user
  return {
    id: 'user_123',
    email: 'user@example.com',
    role: 'applicant'
  };
}

// Scheduled tasks for data maintenance
cron.schedule('0 0 * * *', async () => {
  console.log('Running daily data maintenance tasks...');
  
  try {
    // Update platform analytics
    await updatePlatformAnalytics();
    
    // Clean up old sessions
    await cleanupOldSessions();
    
    // Update job analytics
    await updateJobAnalytics();
    
    console.log('Daily maintenance tasks completed');
  } catch (error) {
    console.error('Error in daily maintenance:', error);
  }
});

// Real-time data update functions
async function updatePlatformAnalytics() {
  // Implementation for updating platform-wide analytics
  console.log('Updating platform analytics...');
}

async function cleanupOldSessions() {
  // Implementation for cleaning up expired sessions
  console.log('Cleaning up old sessions...');
}

async function updateJobAnalytics() {
  // Implementation for updating job analytics
  console.log('Updating job analytics...');
}

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found'
  });
});

// Start server
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Run database migrations
    await runMigrations();
    console.log('✅ Database migrations completed');

    // Start server
    server.listen(PORT, () => {
      console.log(`🚀 FinAutoJobs Database Server running on port ${PORT}`);
      console.log(`📊 Real-time WebSocket server active`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
      console.log(`📈 Database info: http://localhost:${PORT}/api/database/info`);
    });

    // Graceful shutdown
    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

function gracefulShutdown(signal) {
  console.log(`\n🛑 Received ${signal}. Starting graceful shutdown...`);
  
  server.close(() => {
    console.log('✅ HTTP server closed');
    
    // Close WebSocket server
    wss.close(() => {
      console.log('✅ WebSocket server closed');
      
      // Close database connection
      require('./config/database').closeDatabase();
      
      console.log('✅ Graceful shutdown completed');
      process.exit(0);
    });
  });
}

// Start the server
startServer();

module.exports = { app, server, wss };
