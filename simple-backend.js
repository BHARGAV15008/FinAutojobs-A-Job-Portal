import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 5000;

// Middleware
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true
}));
app.use(express.json());

// Mock data for testing
const mockUsers = [
    { id: 1, username: 'testuser', email: 'test@example.com', role: 'jobseeker' },
    { id: 2, username: 'recruiter1', email: 'recruiter@company.com', role: 'recruiter' }
];

const mockJobs = [
    { id: 1, title: 'Software Engineer', company: 'Tech Corp', location: 'Remote', salary: '$80,000' },
    { id: 2, title: 'Data Analyst', company: 'Data Inc', location: 'New York', salary: '$65,000' }
];

// Routes
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'FinAutoJobs Backend API is running',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

app.post('/api/auth/register', (req, res) => {
    const { username, email, password, role } = req.body;
    
    if (!username || !email || !password) {
        return res.status(400).json({
            message: 'Username, email, and password are required'
        });
    }
    
    const newUser = {
        id: mockUsers.length + 1,
        username,
        email,
        role: role || 'jobseeker',
        created_at: new Date().toISOString()
    };
    
    mockUsers.push(newUser);
    
    res.status(201).json({
        message: 'User registered successfully',
        user: { ...newUser, password: undefined },
        token: 'mock-jwt-token-' + Date.now()
    });
});

app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({
            message: 'Username and password are required'
        });
    }
    
    const user = mockUsers.find(u => u.username === username);
    
    if (!user) {
        return res.status(401).json({
            message: 'Invalid credentials'
        });
    }
    
    res.json({
        message: 'Login successful',
        user: { ...user, password: undefined },
        token: 'mock-jwt-token-' + Date.now(),
        refreshToken: 'mock-refresh-token-' + Date.now()
    });
});

app.get('/api/jobs', (req, res) => {
    res.json({
        jobs: mockJobs,
        total: mockJobs.length,
        page: 1,
        limit: 10
    });
});

app.get('/api/companies', (req, res) => {
    res.json({
        companies: [
            { id: 1, name: 'Tech Corp', industry: 'Technology', size: '100-500' },
            { id: 2, name: 'Data Inc', industry: 'Analytics', size: '50-100' }
        ]
    });
});

app.get('/api/oauth/config', (req, res) => {
    res.json({
        google: { enabled: false, clientId: null },
        microsoft: { enabled: false, clientId: null },
        apple: { enabled: false, clientId: null }
    });
});

app.get('/api/dashboard/stats', (req, res) => {
    res.json({
        totalJobs: mockJobs.length,
        totalUsers: mockUsers.length,
        activeApplications: 5,
        newNotifications: 3
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        message: 'Route not found',
        path: req.originalUrl
    });
});

// Error handler
app.use((error, req, res, next) => {
    console.error('Server Error:', error);
    res.status(500).json({
        message: 'Internal server error',
        error: error.message
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`✅ FinAutoJobs Simple Backend running on http://localhost:${PORT}`);
    console.log(`🔍 Health check: http://localhost:${PORT}/api/health`);
    console.log(`📊 Available endpoints:`);
    console.log(`   POST /api/auth/register`);
    console.log(`   POST /api/auth/login`);
    console.log(`   GET  /api/jobs`);
    console.log(`   GET  /api/companies`);
    console.log(`   GET  /api/oauth/config`);
    console.log(`   GET  /api/dashboard/stats`);
});

export default app;
