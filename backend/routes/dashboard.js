
import express from 'express';
import { authenticateToken } from '../middleware/authenticateToken.js';
import CleanUser from '../models/CleanUser.js';

const router = express.Router();

// Recruiter Dashboard
router.get('/recruiter', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'recruiter') {
      return res.status(403).json({ message: 'Access denied. Recruiter role required.' });
    }

    const recruiter = await Recruiter.findById(req.user._id).populate('postedJobs');
    if (!recruiter) {
      return res.status(404).json({ message: 'Recruiter not found.' });
    }

    const dashboardData = {
      user: recruiter,
      stats: {
        postedJobs: recruiter.postedJobs.length,
        activeJobs: recruiter.postedJobs.filter(job => job.status === 'active').length,
      }
    };

    res.json({ success: true, data: dashboardData });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch recruiter dashboard', error: error.message });
  }
});

// Applicant Dashboard
router.get('/applicant', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'applicant') {
      return res.status(403).json({ message: 'Access denied. Applicant role required.' });
    }

    const applicant = await Applicant.findById(req.user._id).populate('appliedJobs').populate('savedJobs');
    if (!applicant) {
      return res.status(404).json({ message: 'Applicant not found.' });
    }

    const dashboardData = {
      user: applicant,
      stats: {
        appliedJobs: applicant.appliedJobs.length,
        savedJobs: applicant.savedJobs.length,
      }
    };

    res.json({ success: true, data: dashboardData });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch applicant dashboard', error: error.message });
  }
});

export default router;
