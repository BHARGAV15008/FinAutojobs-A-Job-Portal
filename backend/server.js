import express from 'express';
import compression from 'compression';
import session from 'express-session';
import passport from 'passport';
import dotenv from 'dotenv';
import { createServer } from 'http';
import WebSocketService from './services/websocketService.js';
import { errorHandler, AppError } from './middleware/errorHandler.js';
import { securityConfig, requestLogger, securityHeaders } from './middleware/security.js';
import { sanitizeInput, generalRateLimit } from './middleware/validation.js';
import { checkDatabaseHealth } from './config/database.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Create HTTP server for Socket.IO
const server = createServer(app);

// Apply security middleware
app.use(securityConfig.helmet);
app.use(securityConfig.cors);
app.use(securityHeaders);
app.use(compression());
app.use(requestLogger);
app.use(sanitizeInput);

// Apply rate limiting to API routes
app.use('/api/', generalRateLimit);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

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

// Routes
import authRoutes from './routes/auth.js';
import jobsRoutes from './routes/jobs.js';
import companiesRoutes from './routes/companies.js';
import usersRoutes from './routes/users.js';
import applicationsRoutes from './routes/applications.js';
import savedJobsRoutes from './routes/savedJobs.js';

app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/companies', companiesRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/applications', applicationsRoutes);
app.use('/api/saved-jobs', savedJobsRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
    const healthCheck = async () => {
        const dbHealth = await checkDatabaseHealth();
        
        res.json({
            status: 'OK',
            message: 'FinAutoJobs API is running',
            timestamp: new Date().toISOString(),
            database: dbHealth,
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            version: process.env.npm_package_version || '1.0.0'
        });
    };
    
    healthCheck().catch(error => {
        res.status(503).json({
            status: 'ERROR',
            message: 'Service unavailable',
            error: error.message,
            timestamp: new Date().toISOString()
        });
    });
});

// API status endpoint
app.get('/api/status', (req, res) => {
    res.json({
        status: 'OK',
        service: 'FinAutoJobs API',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development'
    });
});

// Database initialization and routes setup
async function initializeServer() {
    try {
        // Database initialization
        const { initializeDatabase } = await import('./config/database.js');
        await initializeDatabase();
        
        // Routes
        const authRoutes = (await import('./routes/auth.js')).default;
        const jobsRoutes = (await import('./routes/jobs.js')).default;
        const companiesRoutes = (await import('./routes/companies.js')).default;
        const usersRoutes = (await import('./routes/users.js')).default;
        const applicationsRoutes = (await import('./routes/applications.js')).default;
        const savedJobsRoutes = (await import('./routes/savedJobs.js')).default;
        
        app.use('/api/auth', authRoutes);
        app.use('/api/jobs', jobsRoutes);
        app.use('/api/companies', companiesRoutes);
        app.use('/api/users', usersRoutes);
        app.use('/api/applications', applicationsRoutes);
        app.use('/api/saved-jobs', savedJobsRoutes);
        
        // 404 handler for API routes
        app.use('/api/*', (req, res) => {
            res.status(404).json({
                success: false,
                message: 'API endpoint not found',
                path: req.path
            });
        });
        
        // Global 404 handler
        app.use('*', (req, res) => {
            res.status(404).json({
                success: false,
                message: 'Route not found',
                path: req.path
            });
        });
        
        // Apply error handling middleware (must be last)
        app.use(errorHandler);
        
        // Initialize WebSocket service
        const WebSocketService = (await import('./services/websocketService.js')).default;
        const webSocketService = new WebSocketService(server);
        
        // Start server
        server.listen(PORT, () => {
            console.log(`🚀 FinAutoJobs Backend Server running on port ${PORT}`);
            console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
            console.log(`📈 Status endpoint: http://localhost:${PORT}/api/status`);
            console.log(`🔌 WebSocket service enabled for real-time features`);
            console.log(`🛡️  Security middleware enabled`);
            console.log(`⚡ Performance optimizations applied`);
        });
        
    } catch (error) {
        console.error('❌ Failed to initialize server:', error);
        process.exit(1);
    }
}

// Initialize WebSocket service
const webSocketService = new WebSocketService(server);

// Start server
server.listen(PORT, () => {
    console.log(`🚀 FinAutoJobs Backend Server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🔌 WebSocket service enabled for real-time features`);
});