import express from 'express';
import { JobApplication } from '../models/Recruiters/jobs/index.js';
import { updateApplicationSnapshot } from '../services/applicantSnapshotService.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * PUT /api/applications/:id/snapshot
 * Update the applicant snapshot for a specific application
 * This fetches the latest user data and updates the snapshot
 */
router.put('/:id/snapshot', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the application
    const application = await JobApplication.findById(id);
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }
    
    // Update the snapshot
    const updatedApplication = await updateApplicationSnapshot(application);
    
    res.status(200).json({
      success: true,
      message: 'Applicant snapshot updated successfully',
      data: {
        applicationId: updatedApplication._id,
        applicantSnapshot: updatedApplication.applicantSnapshot
      }
    });
    
  } catch (error) {
    console.error('❌ Error updating applicant snapshot:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update applicant snapshot'
    });
  }
});

/**
 * GET /api/applications/:id/snapshot
 * Get the current applicant snapshot for an application
 */
router.get('/:id/snapshot', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const application = await JobApplication.findById(id).select('applicantSnapshot jobSnapshot');
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        applicantSnapshot: application.applicantSnapshot,
        jobSnapshot: application.jobSnapshot
      }
    });
    
  } catch (error) {
    console.error('❌ Error fetching applicant snapshot:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch applicant snapshot'
    });
  }
});

export default router;
