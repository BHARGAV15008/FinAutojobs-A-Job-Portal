import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import session from 'express-session';
import passport from 'passport';
import dotenv from 'dotenv';
import { createServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';

// Import configurations
import corsOptions from './config/cors.js';
import securityHeaders from './config/security.js';

// Import middleware
import { errorHandler, notFoundHandler, errorMonitor } from './middleware/errorHandler.js';
import { xssMiddleware, sqlInjectionMiddleware, sanitizeInputs, payloadSizeMiddleware } from './middleware/security.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { sanitizeRequest, sqlInjectionPrevention, preventNoSqlInjection } from './middleware/sanitization.js';

// Configure dotenv with proper file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Enable trust proxy if behind a reverse proxy
app.set('trust proxy', 1);

// Create HTTP server for Socket.IO
const server = createServer(app);

// Configure basic middleware
app.use(compression());

// Enable request parsing before any security middleware
app.use(express.json({ 
    limit: '10mb',
    verify: (req, res, buf) => {
        if (buf.length) {
            try {
                JSON.parse(buf);
            } catch(e) {
                res.status(400).json({ 
                    status: 'error',
                    message: 'Invalid JSON payload',
                    error: e.message 
                });
                throw e;
            }
        }
    }
}));
app.use(express.urlencoded({ 
    extended: true,
    limit: '10mb'
}));

// Apply CORS
app.use(cors(corsOptions));

// Apply security headers
app.use(helmet({
    ...securityHeaders,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginEmbedderPolicy: false
}));

// Apply security middleware
app.use(xssMiddleware);
app.use(sqlInjectionMiddleware);
app.use(sanitizeInputs);
app.use(payloadSizeMiddleware);

// Apply request sanitization
app.use(sanitizeRequest);
app.use(sqlInjectionPrevention);
app.use(preventNoSqlInjection);

// Apply rate limiting to API routes
app.use('/api/', apiLimiter);

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Database initialization
import { initializeDatabase } from './config/database.js';
await initializeDatabase();

// Import routes
import authRoutes from './routes/auth.js';
import jobRoutes from './routes/jobs.js';
import companyRoutes from './routes/companies.js';
import applicationRoutes from './routes/applications.js';
import dashboardRoutes from './routes/dashboard.js';
import oauthRoutes from './routes/oauth.js';
import testRoutes from './routes/test.js';
import notificationsRoutes from './routes/notifications.js';
import usersRoutes from './routes/users.js';
import savedJobsRoutes from './routes/savedJobs.js';
import recruiterRoutes from './routes/recruiters.js';

// Mount routes under /api
const apiRouter = express.Router();
apiRouter.use('/auth', authRoutes);
apiRouter.use('/oauth', oauthRoutes);
apiRouter.use('/jobs', jobRoutes);
apiRouter.use('/companies', companyRoutes);
apiRouter.use('/applications', applicationRoutes);
apiRouter.use('/users', usersRoutes);
apiRouter.use('/saved-jobs', savedJobsRoutes);
apiRouter.use('/dashboard', dashboardRoutes);
apiRouter.use('/notifications', notificationsRoutes);
apiRouter.use('/recruiters', recruiterRoutes);
apiRouter.use('/test', testRoutes);

app.use('/api', apiRouter);

// Root health check
app.get('/', (req, res) => {
    res.json({
        message: 'FinAutoJobs API Service',
        apiDocs: '/api/docs',
        timestamp: new Date().toISOString()
    });
});

// Add health check endpoint under /api 
apiRouter.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'FinAutoJobs API is running',
        timestamp: new Date().toISOString(),
        env: process.env.NODE_ENV || 'development',
        services: {
            database: 'connected',
            cors: 'configured',
            security: 'enabled'
        }
    });
});

// Enhanced error handling middleware
app.use(errorMonitor);
app.use(notFoundHandler);
app.use(errorHandler);

// Start server with proper error handling
server.listen(PORT, () => {
    console.log(`🚀 FinAutoJobs Backend Server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🛡️ Enhanced error handling enabled`);
}).on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use. Please try a different port.`);
    } else {
        console.error('❌ Server error:', error);
    }
    process.exit(1);
});
