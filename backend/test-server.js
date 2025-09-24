import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'FinAutoJobs Backend is running', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'FinAutoJobs API Service',
    apiDocs: '/api/docs',
    timestamp: new Date().toISOString()
  });
});

// Mock endpoints for testing
app.get('/api/jobs', (req, res) => {
  res.json({
    success: true,
    jobs: [
      {
        id: 1,
        title: 'Software Engineer',
        company: 'Tech Corp',
        location: 'Mumbai',
        salary: '₹8-12 LPA',
        type: 'Full Time'
      },
      {
        id: 2,
        title: 'Financial Analyst',
        company: 'Finance Pro',
        location: 'Bangalore',
        salary: '₹6-10 LPA',
        type: 'Full Time'
      }
    ]
  });
});

app.get('/api/companies', (req, res) => {
  res.json({
    success: true,
    companies: [
      { id: 1, name: 'Tech Corp', industry: 'Technology' },
      { id: 2, name: 'Finance Pro', industry: 'Finance' }
    ]
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('Server Error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ FinAutoJobs Test Backend Server running on port ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📊 Jobs API: http://localhost:${PORT}/api/jobs`);
  console.log(`🏢 Companies API: http://localhost:${PORT}/api/companies`);
});

export default app;