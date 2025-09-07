// Simple manual test to verify backend functionality
import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 5001; // Use different port to avoid conflicts

app.use(cors());
app.use(express.json());

console.log('Starting test server...');

// Test routes
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Test server running',
        timestamp: new Date().toISOString()
    });
});

app.get('/test-db', (req, res) => {
    res.json({
        message: 'Database test endpoint',
        note: 'Database testing will be implemented after server startup verification'
    });
});

app.listen(PORT, () => {
    console.log(`✅ Test server running on http://localhost:${PORT}`);
    console.log(`🔍 Health check: http://localhost:${PORT}/health`);
    console.log(`📊 Database test: http://localhost:${PORT}/test-db`);
});
