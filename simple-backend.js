import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 5001;

// Enhanced CORS middleware with proper preflight handling
app.use(cors({
    origin: true, // Allow all origins for development
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    exposedHeaders: ['Content-Length', 'X-Foo', 'X-Bar'],
    optionsSuccessStatus: 200,
    preflightContinue: false
}));

// Handle preflight requests explicitly
app.options('*', cors());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Enhanced middleware to check authentication with proper error handling
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ 
            success: false,
            message: 'Access token required',
            error: 'unauthorized',
            help: 'Please log in to access this resource'
        });
    }
    
    // Mock token validation - in real app, verify JWT
    if (token === 'valid-token' || token.startsWith('mock-')) {
        req.user = { id: 1, role: 'jobseeker' };
        next();
    } else {
        return res.status(403).json({ 
            success: false,
            message: 'Invalid or expired token',
            error: 'forbidden',
            help: 'Please log in again to get a new access token'
        });
    }
};

// Mock data for testing
const mockUsers = [
    { id: 1, username: 'testuser', email: 'test@example.com', role: 'jobseeker' },
    { id: 2, username: 'recruiter1', email: 'recruiter@company.com', role: 'recruiter' }
];

const mockJobs = [
    { id: 1, title: 'Software Engineer', company: 'Tech Corp', location: 'Remote', salary: '$80,000', description: 'Full-stack development role', requirements: 'React, Node.js', type: 'full-time', category: 'technology' },
    { id: 2, title: 'Data Analyst', company: 'Data Inc', location: 'New York', salary: '$65,000', description: 'Data analysis and reporting', requirements: 'SQL, Python', type: 'full-time', category: 'analytics' }
];

const mockApplications = [];
const mockNotifications = [];

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

// Job creation endpoint with comprehensive validation
app.post('/api/jobs', (req, res) => {
    const { title, company, location, salary, description, requirements, type, category } = req.body;
    
    // Enhanced validation with detailed error messages and user warnings
    const errors = [];
    const warnings = [];
    
    // Mandatory field validation
    if (!title || title.trim().length === 0) {
        errors.push({
            field: 'title',
            message: 'Job title is required and cannot be empty',
            type: 'required'
        });
    } else if (title.trim().length < 3) {
        warnings.push({
            field: 'title',
            message: 'Job title should be at least 3 characters long for better visibility',
            type: 'recommendation'
        });
    }
    
    if (!company || company.trim().length === 0) {
        errors.push({
            field: 'company',
            message: 'Company name is required and cannot be empty',
            type: 'required'
        });
    }
    
    if (!location || location.trim().length === 0) {
        errors.push({
            field: 'location',
            message: 'Job location is required (e.g., Remote, New York, etc.)',
            type: 'required'
        });
    }
    
    if (!description || description.trim().length === 0) {
        errors.push({
            field: 'description',
            message: 'Job description is required to help candidates understand the role',
            type: 'required'
        });
    } else if (description.trim().length < 50) {
        warnings.push({
            field: 'description',
            message: 'Consider adding more details to your job description (at least 50 characters recommended)',
            type: 'recommendation'
        });
    }
    
    if (!type || !['full-time', 'part-time', 'contract', 'internship'].includes(type)) {
        errors.push({
            field: 'type',
            message: 'Job type is required and must be one of: full-time, part-time, contract, internship',
            type: 'required',
            allowed_values: ['full-time', 'part-time', 'contract', 'internship']
        });
    }
    
    if (!category || category.trim().length === 0) {
        errors.push({
            field: 'category',
            message: 'Job category is required (e.g., Technology, Marketing, Finance, etc.)',
            type: 'required'
        });
    }
    
    // Optional field warnings
    if (!salary || salary.trim().length === 0) {
        warnings.push({
            field: 'salary',
            message: 'Adding salary information increases application rates by 30%',
            type: 'recommendation'
        });
    }
    
    if (!requirements || requirements.trim().length === 0) {
        warnings.push({
            field: 'requirements',
            message: 'Adding job requirements helps candidates self-assess their fit',
            type: 'recommendation'
        });
    }
    
    if (errors.length > 0) {
        return res.status(400).json({ 
            success: false,
            message: 'Please fix the following required fields to continue', 
            errors: errors,
            warnings: warnings,
            required_fields: {
                title: 'Job title (e.g., "Senior Software Engineer")',
                company: 'Company name',
                location: 'Job location (e.g., "Remote", "New York, NY")',
                description: 'Detailed job description',
                type: 'Employment type (full-time, part-time, contract, internship)',
                category: 'Job category (e.g., "Technology", "Marketing")'
            }
        });
    }
    
    const newJob = {
        id: mockJobs.length + 1,
        title: title.trim(),
        company: company.trim(),
        location: location.trim(),
        salary: salary ? salary.trim() : 'Salary not specified',
        description: description.trim(),
        requirements: requirements ? requirements.trim() : 'Requirements not specified',
        type: type,
        category: category.trim(),
        posted_at: new Date().toISOString(),
        status: 'active'
    };
    
    mockJobs.push(newJob);
    
    const response = {
        success: true,
        message: 'Job created successfully!',
        job: newJob
    };
    
    if (warnings.length > 0) {
        response.warnings = warnings;
        response.tips = 'Consider addressing the warnings above to improve your job posting effectiveness';
    }
    
    res.status(201).json(response);
});

app.put('/api/jobs/:id', (req, res) => {
    const jobId = parseInt(req.params.id);
    const jobIndex = mockJobs.findIndex(job => job.id === jobId);
    
    if (jobIndex === -1) {
        return res.status(404).json({ message: 'Job not found' });
    }
    
    mockJobs[jobIndex] = { ...mockJobs[jobIndex], ...req.body, updated_at: new Date().toISOString() };
    res.json({ message: 'Job updated successfully', job: mockJobs[jobIndex] });
});

app.delete('/api/jobs/:id', (req, res) => {
    const jobId = parseInt(req.params.id);
    const jobIndex = mockJobs.findIndex(job => job.id === jobId);
    
    if (jobIndex === -1) {
        return res.status(404).json({ message: 'Job not found' });
    }
    
    mockJobs.splice(jobIndex, 1);
    res.json({ message: 'Job deleted successfully' });
});

// Applications endpoints
app.get('/api/applications', authenticateToken, (req, res) => {
    res.json({ applications: mockApplications, total: mockApplications.length });
});

app.post('/api/applications', authenticateToken, (req, res) => {
    // Add error handling for JSON parsing
    if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({
            success: false,
            message: 'Invalid JSON payload',
            error: 'Request body is empty or malformed'
        });
    }
    
    const { job_id, cover_letter, resume_url, applicant_id } = req.body;
    
    // Enhanced validation with user-friendly error messages
    const errors = [];
    const warnings = [];
    
    // Mandatory field validation
    if (!job_id || job_id === '' || job_id === null || job_id === undefined) {
        errors.push({
            field: 'job_id',
            message: 'Please select a job to apply for',
            type: 'required'
        });
    } else {
        // Check if job exists
        const jobExists = mockJobs.find(job => job.id === parseInt(job_id));
        if (!jobExists) {
            errors.push({
                field: 'job_id',
                message: 'The selected job is no longer available. Please choose another job.',
                type: 'invalid'
            });
        }
    }
    
    // Optional field warnings for better applications
    if (!cover_letter || cover_letter.trim().length === 0) {
        warnings.push({
            field: 'cover_letter',
            message: 'Adding a cover letter increases your chances of getting noticed by 40%',
            type: 'recommendation'
        });
    } else if (cover_letter.trim().length < 50) {
        warnings.push({
            field: 'cover_letter',
            message: 'Consider writing a more detailed cover letter (at least 50 characters)',
            type: 'recommendation'
        });
    }
    
    if (!resume_url || resume_url.trim().length === 0) {
        warnings.push({
            field: 'resume_url',
            message: 'Uploading your resume is highly recommended for job applications',
            type: 'recommendation'
        });
    }
    
    if (errors.length > 0) {
        return res.status(400).json({
            success: false,
            message: 'Please fix the following issues to submit your application',
            errors: errors,
            warnings: warnings,
            help: {
                job_id: 'Browse available jobs and select one to apply for',
                cover_letter: 'Write a personalized message explaining why you\'re interested in this role',
                resume_url: 'Upload your resume or provide a link to your resume'
            }
        });
    }
    
    const newApplication = {
        id: mockApplications.length + 1,
        job_id: parseInt(job_id),
        cover_letter: cover_letter ? cover_letter.trim() : 'No cover letter provided',
        resume_url: resume_url ? resume_url.trim() : null,
        status: 'pending',
        applied_at: new Date().toISOString(),
        applicant_id: applicant_id || req.user.id || 1
    };
    
    mockApplications.push(newApplication);
    
    const response = {
        success: true,
        message: 'Application submitted successfully! The employer will review your application.',
        application: newApplication
    };
    
    if (warnings.length > 0) {
        response.warnings = warnings;
        response.tips = 'Consider the suggestions above for future applications to improve your success rate';
    }
    
    res.status(201).json(response);
});

app.delete('/api/applications/:id', (req, res) => {
    const appId = parseInt(req.params.id);
    const appIndex = mockApplications.findIndex(app => app.id === appId);
    
    if (appIndex === -1) {
        return res.status(404).json({ message: 'Application not found' });
    }
    
    mockApplications.splice(appIndex, 1);
    res.json({ message: 'Application deleted successfully' });
});

// Profile management endpoints
app.get('/api/users/profile', (req, res) => {
    // Mock profile data based on auth token
    const profile = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        full_name: 'Test User',
        role: 'jobseeker',
        bio: 'Software developer with 5 years experience',
        skills: ['JavaScript', 'React', 'Node.js'],
        experience: '5 years',
        education: 'Computer Science Degree'
    };
    res.json({ profile });
});

app.put('/api/users/profile', (req, res) => {
    const { full_name, bio, skills, experience, education } = req.body;
    
    // Enhanced validation with user warnings
    const errors = [];
    const warnings = [];
    
    // Optional field recommendations
    if (!full_name || full_name.trim().length === 0) {
        warnings.push({
            field: 'full_name',
            message: 'Adding your full name helps employers identify you',
            type: 'recommendation'
        });
    }
    
    if (!bio || bio.trim().length === 0) {
        warnings.push({
            field: 'bio',
            message: 'A professional bio increases profile views by 60%',
            type: 'recommendation'
        });
    } else if (bio.trim().length < 50) {
        warnings.push({
            field: 'bio',
            message: 'Consider writing a more detailed bio (at least 50 characters)',
            type: 'recommendation'
        });
    }
    
    if (!skills || !Array.isArray(skills) || skills.length === 0) {
        warnings.push({
            field: 'skills',
            message: 'Adding skills helps match you with relevant job opportunities',
            type: 'recommendation'
        });
    }
    
    if (!experience || experience.trim().length === 0) {
        warnings.push({
            field: 'experience',
            message: 'Adding work experience strengthens your profile',
            type: 'recommendation'
        });
    }
    
    if (!education || education.trim().length === 0) {
        warnings.push({
            field: 'education',
            message: 'Education information helps employers assess your background',
            type: 'recommendation'
        });
    }
    
    const updatedProfile = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        full_name: full_name ? full_name.trim() : 'Test User',
        bio: bio ? bio.trim() : 'Updated bio',
        skills: Array.isArray(skills) ? skills : ['JavaScript', 'React'],
        experience: experience ? experience.trim() : '5 years',
        education: education ? education.trim() : 'Computer Science',
        updated_at: new Date().toISOString()
    };
    
    const response = {
        success: true,
        message: 'Profile updated successfully!',
        profile: updatedProfile
    };
    
    if (warnings.length > 0) {
        response.warnings = warnings;
        response.tips = 'Complete your profile to increase your visibility to employers';
    }
    
    res.json(response);
});

// Notifications endpoints
app.get('/api/notifications', authenticateToken, (req, res) => {
    res.json({ notifications: mockNotifications, total: mockNotifications.length });
});

// OAuth endpoints
app.post('/api/oauth/google', (req, res) => {
    const { token } = req.body;
    
    if (!token) {
        return res.status(400).json({ message: 'Google token is required' });
    }
    
    // Mock Google OAuth response
    const mockUser = {
        id: mockUsers.length + 1,
        username: 'google_user_' + Date.now(),
        email: 'google@example.com',
        full_name: 'Google User',
        role: 'jobseeker',
        google_id: 'mock_google_id',
        created_at: new Date().toISOString()
    };
    
    mockUsers.push(mockUser);
    res.json({ message: 'Google OAuth successful', user: mockUser, token: 'mock-google-jwt-' + Date.now() });
});

app.post('/api/oauth/microsoft', (req, res) => {
    const { token } = req.body;
    
    if (!token) {
        return res.status(400).json({ message: 'Microsoft token is required' });
    }
    
    const mockUser = {
        id: mockUsers.length + 1,
        username: 'microsoft_user_' + Date.now(),
        email: 'microsoft@example.com',
        full_name: 'Microsoft User',
        role: 'jobseeker',
        microsoft_id: 'mock_microsoft_id',
        created_at: new Date().toISOString()
    };
    
    mockUsers.push(mockUser);
    res.json({ message: 'Microsoft OAuth successful', user: mockUser, token: 'mock-microsoft-jwt-' + Date.now() });
});

app.post('/api/oauth/apple', (req, res) => {
    const { token } = req.body;
    
    if (!token) {
        return res.status(400).json({ message: 'Apple token is required' });
    }
    
    const mockUser = {
        id: mockUsers.length + 1,
        username: 'apple_user_' + Date.now(),
        email: 'apple@example.com',
        full_name: 'Apple User',
        role: 'jobseeker',
        apple_id: 'mock_apple_id',
        created_at: new Date().toISOString()
    };
    
    mockUsers.push(mockUser);
    res.json({ message: 'Apple OAuth successful', user: mockUser, token: 'mock-apple-jwt-' + Date.now() });
});

app.get('/api/oauth/config', (req, res) => {
    res.json({
        providers: {
            google: true,
            microsoft: true,
            apple: true
        },
        config: {
            google: { enabled: true, clientId: 'mock-google-client-id' },
            microsoft: { enabled: true, clientId: 'mock-microsoft-client-id' },
            apple: { enabled: true, clientId: 'mock-apple-client-id' }
        }
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

// Enhanced error handler
app.use((error, req, res, next) => {
    console.error('Server Error:', error);
    
    // Handle different types of errors
    if (error.type === 'entity.parse.failed') {
        return res.status(400).json({
            message: 'Invalid JSON payload',
            error: 'Malformed JSON in request body'
        });
    }
    
    if (error.type === 'entity.too.large') {
        return res.status(413).json({
            message: 'Payload too large',
            error: 'Request body exceeds size limit'
        });
    }
    
    res.status(500).json({
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
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
    console.log(`   POST /api/jobs`);
    console.log(`   PUT  /api/jobs/:id`);
    console.log(`   DELETE /api/jobs/:id`);
    console.log(`   GET  /api/applications`);
    console.log(`   POST /api/applications`);
    console.log(`   DELETE /api/applications/:id`);
    console.log(`   GET  /api/users/profile`);
    console.log(`   PUT  /api/users/profile`);
    console.log(`   GET  /api/notifications`);
    console.log(`   GET  /api/companies`);
    console.log(`   GET  /api/oauth/config`);
    console.log(`   POST /api/oauth/google`);
    console.log(`   POST /api/oauth/microsoft`);
    console.log(`   POST /api/oauth/apple`);
    console.log(`   GET  /api/dashboard/stats`);
});

export default app;
