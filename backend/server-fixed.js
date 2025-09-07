import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import session from 'express-session';
import passport from 'passport';
import dotenv from 'dotenv';
import { createServer } from 'http';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Create HTTP server for Socket.IO
const server = createServer(app);

// Security middleware
app.use(helmet());
app.use(compression());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// CORS configuration
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001', 
    'http://localhost:3002',
    'http://localhost:5173',
    'http://localhost:4173',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'http://127.0.0.1:3002',
    'http://127.0.0.1:5173'
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    optionsSuccessStatus: 200
}));

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

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'FinAutoJobs API is running',
        timestamp: new Date().toISOString()
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : {}
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// Database initialization and routes setup
async function initializeServer() {
    try {
        // Initialize database
        const { initializeDatabase } = await import('./config/database.js');
        await initializeDatabase();
        
        // Import routes after database is initialized
        const authRoutes = (await import('./routes/auth.js')).default;
        const jobsRoutes = (await import('./routes/jobs.js')).default;
        const companiesRoutes = (await import('./routes/companies.js')).default;
        const usersRoutes = (await import('./routes/users.js')).default;
        const applicationsRoutes = (await import('./routes/applications.js')).default;
        const savedJobsRoutes = (await import('./routes/savedJobs.js')).default;

        // Setup routes
        app.use('/api/auth', authRoutes);
        app.use('/api/jobs', jobsRoutes);
        app.use('/api/companies', companiesRoutes);
        app.use('/api/users', usersRoutes);
        app.use('/api/applications', applicationsRoutes);
        app.use('/api/saved-jobs', savedJobsRoutes);
        
        // Initialize WebSocket service
        const WebSocketService = (await import('./services/websocketService.js')).default;
        const webSocketService = new WebSocketService(server);
        
        console.log('✅ Database and routes initialized successfully');
        
        // Start server
        server.listen(PORT, () => {
            console.log(`🚀 FinAutoJobs Backend Server running on port ${PORT}`);
            console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
            console.log(`🔌 WebSocket service enabled for real-time features`);
        });
        
    } catch (error) {
        console.error('❌ Failed to initialize server:', error);
        process.exit(1);
    }
}

// Start the server
initializeServer();
