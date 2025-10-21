import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

// Health check endpoint
router.get('/', async (req, res) => {
  try {
    const healthCheck = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
      services: {}
    };

    // Check database connection
    try {
      if (mongoose.connection.readyState === 1) {
        healthCheck.services.database = {
          status: 'connected',
          name: 'MongoDB',
          responseTime: 'N/A'
        };
      } else {
        healthCheck.services.database = {
          status: 'disconnected',
          name: 'MongoDB',
          responseTime: 'N/A'
        };
        healthCheck.status = 'degraded';
      }
    } catch (dbError) {
      healthCheck.services.database = {
        status: 'error',
        name: 'MongoDB',
        error: dbError.message
      };
      healthCheck.status = 'unhealthy';
    }

    // Check environment variables
    const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET', 'SESSION_SECRET'];
    const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);
    
    if (missingEnvVars.length > 0) {
      healthCheck.services.environment = {
        status: 'error',
        missing: missingEnvVars
      };
      healthCheck.status = 'unhealthy';
    } else {
      healthCheck.services.environment = {
        status: 'ok',
        variables: requiredEnvVars.length
      };
    }

    // Memory usage
    const memUsage = process.memoryUsage();
    healthCheck.services.memory = {
      status: 'ok',
      usage: {
        rss: Math.round(memUsage.rss / 1024 / 1024) + ' MB',
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024) + ' MB',
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024) + ' MB'
      }
    };

    const statusCode = healthCheck.status === 'healthy' ? 200 : 
                      healthCheck.status === 'degraded' ? 200 : 503;

    res.status(statusCode).json(healthCheck);

  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
      environment: process.env.NODE_ENV || 'development'
    });
  }
});

// Detailed health check
router.get('/detailed', async (req, res) => {
  try {
    const detailedHealth = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
      system: {
        platform: process.platform,
        arch: process.arch,
        nodeVersion: process.version,
        pid: process.pid
      },
      services: {},
      checks: []
    };

    // Database connectivity check
    try {
      const dbStart = Date.now();
      if (mongoose.connection.readyState === 1) {
        // Test database operation
        await mongoose.connection.db.admin().ping();
        const dbTime = Date.now() - dbStart;
        
        detailedHealth.services.database = {
          status: 'connected',
          name: 'MongoDB',
          responseTime: `${dbTime}ms`,
          readyState: mongoose.connection.readyState,
          host: mongoose.connection.host,
          port: mongoose.connection.port,
          name: mongoose.connection.name
        };
        
        detailedHealth.checks.push({
          name: 'database_ping',
          status: 'pass',
          time: `${dbTime}ms`
        });
      } else {
        detailedHealth.services.database = {
          status: 'disconnected',
          readyState: mongoose.connection.readyState
        };
        detailedHealth.status = 'degraded';
        detailedHealth.checks.push({
          name: 'database_ping',
          status: 'fail',
          error: 'Database not connected'
        });
      }
    } catch (dbError) {
      detailedHealth.services.database = {
        status: 'error',
        error: dbError.message
      };
      detailedHealth.status = 'unhealthy';
      detailedHealth.checks.push({
        name: 'database_ping',
        status: 'fail',
        error: dbError.message
      });
    }

    // Environment variables check
    const requiredEnvVars = [
      'MONGODB_URI', 'JWT_SECRET', 'SESSION_SECRET', 
      'NODE_ENV', 'FRONTEND_URL'
    ];
    
    const envStatus = {};
    const missingEnvVars = [];
    
    requiredEnvVars.forEach(varName => {
      if (process.env[varName]) {
        envStatus[varName] = 'set';
      } else {
        envStatus[varName] = 'missing';
        missingEnvVars.push(varName);
      }
    });

    if (missingEnvVars.length > 0) {
      detailedHealth.services.environment = {
        status: 'error',
        missing: missingEnvVars,
        variables: envStatus
      };
      detailedHealth.status = 'unhealthy';
      detailedHealth.checks.push({
        name: 'environment_variables',
        status: 'fail',
        error: `Missing: ${missingEnvVars.join(', ')}`
      });
    } else {
      detailedHealth.services.environment = {
        status: 'ok',
        variables: envStatus
      };
      detailedHealth.checks.push({
        name: 'environment_variables',
        status: 'pass'
      });
    }

    const statusCode = detailedHealth.status === 'healthy' ? 200 : 
                      detailedHealth.status === 'degraded' ? 200 : 503;

    res.status(statusCode).json(detailedHealth);

  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
      environment: process.env.NODE_ENV || 'development'
    });
  }
});

export default router;
