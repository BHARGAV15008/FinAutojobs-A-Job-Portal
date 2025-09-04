import express from 'express';
import { authenticateToken } from './auth.js';
import {
  getAllCompanies,
  getCompanyById,
  getCompanyJobs,
  createCompany,
  updateCompany,
  deleteCompany,
  getCompanyStats
} from '../controllers/companiesController.js';

const router = express.Router();

// Get all companies
router.get('/', getAllCompanies);

// Get company by ID
router.get('/:id', getCompanyById);

// Get jobs by company
router.get('/:id/jobs', getCompanyJobs);

// Create new company (Admin only)
router.post('/', authenticateToken, createCompany);

// Update company (Admin only)
router.put('/:id', authenticateToken, updateCompany);

// Delete company (Admin only)
router.delete('/:id', authenticateToken, deleteCompany);

// Get company statistics
router.get('/:id/stats', getCompanyStats);

export default router;
