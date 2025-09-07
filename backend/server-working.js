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

// Basic routes for testing
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'FinAutoJobs API is running',
        timestamp: new Date().toISOString()
    });
});

// Test endpoint
app.get('/api/test', (req, res) => {
    res.json({
        message: 'Test endpoint working',
        timestamp: new Date().toISOString()
    });
});

// Test jobs endpoint
app.get('/api/jobs', (req, res) => {
    res.json({
        message: 'Jobs endpoint working',
        jobs: [
            {
                id: 1,
                title: 'Test Job',
                description: 'This is a test job',
                location: 'Test Location',
                salary_min: 50000,
                salary_max: 80000,
                job_type: 'Full Time',
                created_at: new Date().toISOString()
            }
        ]
    });
});

// Test auth endpoint
app.post('/api/auth/login', (req, res) => {
    res.json({
        message: 'Login endpoint working',
        user: {
            id: 1,
            username: 'testuser',
            email: 'test@example.com'
        },
        token: 'test-token'
    });
});

app.post('/api/auth/register', (req, res) => {
    res.json({
        message: 'Register endpoint working',
        user: {
            id: 2,
            username: 'newuser',
            email: 'newuser@example.com'
        },
        token: 'test-token'
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

// Start server
server.listen(PORT, () => {
    console.log(`🚀 FinAutoJobs Backend Server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🔌 Test endpoints available`);
});
