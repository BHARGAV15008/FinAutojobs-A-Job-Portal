import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
console.log('🔧 Loading environment variables...');
dotenv.config();

// Import configurations
import corsOptions from './config/cors.js';
import { initializeDatabase } from './config/database.js';

// Configure file paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Enable trust proxy if behind a reverse proxy
app.set('trust proxy', 1);

// Create HTTP server for Socket.IO
const server = createServer(app);

// Initialize Socket.IO with CORS configuration
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

// Make io available to routes
app.set('io', io);

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`🔌 User connected: ${socket.id}`);

  // Join user-specific room for targeted notifications
  socket.on('join-user-room', (userId) => {
    socket.join(`user-${userId}`);
    console.log(`👤 User ${userId} joined their room`);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`🔌 User disconnected: ${socket.id}`);
  });
});

// Configure basic middleware
app.use(compression());

// Enable request parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply CORS
app.use(cors(corsOptions));

// Apply security headers
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginEmbedderPolicy: false
}));

// Basic routes
app.get('/', (req, res) => {
    res.json({
        message: 'FinAutoJobs API Service',
        timestamp: new Date().toISOString(),
        status: 'running'
    });
});

app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'FinAutoJobs API is running',
        timestamp: new Date().toISOString(),
        env: process.env.NODE_ENV || 'development'
    });
});

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Initialize database and start server
const startServer = async () => {
    try {
        console.log('🔄 Initializing database...');
        await initializeDatabase();
        console.log('✅ Database initialized');

        // Import network configuration
        const { displayNetworkInfo } = await import('./config/network.js');

        // Start server
        const HOST = process.env.HOST || '0.0.0.0';
        server.listen(PORT, HOST, () => {
            console.log(`🚀 FinAutoJobs Backend Server running on ${HOST}:${PORT}`);
            console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
            console.log(`🛡️ Basic server running successfully`);
            
            // Display network access information
            displayNetworkInfo();
        });

    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

// Handle server errors
server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use. Please try a different port.`);
    } else {
        console.error('❌ Server error:', error);
    }
    process.exit(1);
});

// Start the server
startServer();