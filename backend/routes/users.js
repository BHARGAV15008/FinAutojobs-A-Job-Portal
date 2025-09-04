import express from 'express';
import { authenticateToken } from './auth.js';
import {
    getUserProfile,
    updateUserProfile,
    changePassword,
    getUserApplications,
    getAllUsers,
    updateUserRole,
    deleteUser
} from '../controllers/usersController.js';

const router = express.Router();

// Get user profile (authenticated user only)
router.get('/profile', authenticateToken, getUserProfile);

// Update user profile (authenticated user only)
router.put('/profile', authenticateToken, updateUserProfile);

// Change password (authenticated user only)
router.put('/change-password', authenticateToken, changePassword);

// Get user applications (authenticated user only)
router.get('/applications', authenticateToken, getUserApplications);

// Get all users (Admin only)
router.get('/', authenticateToken, getAllUsers);

// Update user role (Admin only)
router.put('/:id/role', authenticateToken, updateUserRole);

// Delete user (Admin only)
router.delete('/:id', authenticateToken, deleteUser);

export default router;
