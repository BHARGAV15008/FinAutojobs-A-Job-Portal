import express from 'express';
import { asyncHandler, validateRequest } from '../middleware/errorHandler.js';
import { applicantProfileSchemas, jobSchemas } from '../schemas/validationSchemas.js';

const router = express.Router();

// Test endpoint for validation errors
router.post('/validation', validateRequest(applicantProfileSchemas.personalInfo), asyncHandler(async (req, res) => {
    res.json({
        success: true,
        message: 'Validation passed',
        data: req.body
    });
}));

// Test endpoint for database errors
router.get('/database-error', asyncHandler(async (req, res) => {
    // This will trigger a database error
    const { db } = await import('../config/database.js');
    await db.select().from('non_existent_table');
    res.json({ success: true });
}));

// Test endpoint for authentication errors
router.get('/auth-error', asyncHandler(async (req, res) => {
    // This will trigger an authentication error
    if (!req.user) {
        const { AuthenticationError } = await import('../middleware/errorHandler.js');
        throw new AuthenticationError('You must be logged in');
    }
    res.json({ success: true });
}));

// Test endpoint for not found errors
router.get('/not-found', asyncHandler(async (req, res) => {
    const { NotFoundError } = await import('../middleware/errorHandler.js');
    throw new NotFoundError('This resource was not found');
}));

// Test endpoint for general errors
router.get('/general-error', asyncHandler(async (req, res) => {
    throw new Error('This is a general error for testing');
}));

// Test endpoint for job validation
router.post('/job-validation', validateRequest(jobSchemas.createJob), asyncHandler(async (req, res) => {
    res.json({
        success: true,
        message: 'Job validation passed',
        data: req.body
    });
}));

// Test endpoint with invalid data to trigger validation errors
router.post('/invalid-data', asyncHandler(async (req, res) => {
    const { ValidationError } = await import('../middleware/errorHandler.js');
    throw new ValidationError('This is a validation error', [
        { field: 'email', message: 'Invalid email format' },
        { field: 'age', message: 'Age must be a positive number' }
    ]);
}));

// Test endpoint for rate limiting
router.get('/rate-limit', asyncHandler(async (req, res) => {
    res.json({
        success: true,
        message: 'Rate limit test endpoint',
        timestamp: new Date().toISOString()
    });
}));

export default router;
