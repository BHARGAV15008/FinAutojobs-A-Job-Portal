import SavedJob from '../../models/SavedJob.js';
import mongoose from 'mongoose';

// Get current user's saved jobs
export const getSavedJobs = async (req, res) => {
  try {
    const userId = req.user.userId;

    const savedJobs = await SavedJob.find({ userId })
      .populate('jobId')
      .sort({ savedAt: -1 });

    res.json({ saved: savedJobs });
  } catch (error) {
    console.error('❌ Get saved jobs error:', error);
    res.status(500).json({ message: 'Internal server error while fetching saved jobs' });
  }
};

// Save a job for current user
export const addSavedJob = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { job_id } = req.body;

    console.log('💾 Saving job:', { userId, job_id });

    if (!job_id) {
      return res.status(400).json({ message: 'job_id is required' });
    }

    // Check if job exists (use mongoose.model to avoid import issues)
    const Job = mongoose.model('Job');
    const jobExists = await Job.findById(job_id);
    if (!jobExists) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if already saved (will throw error if duplicate due to unique index)
    const existing = await SavedJob.findOne({ userId, jobId: job_id });
    if (existing) {
      return res.status(409).json({ message: 'Job already saved' });
    }

    // Create saved job
    const savedJob = await SavedJob.create({
      userId,
      jobId: job_id
    });

    console.log('✅ Job saved successfully:', savedJob._id);
    res.status(201).json({ message: 'Job saved successfully', saved: savedJob });
  } catch (error) {
    console.error('❌ Add saved job error:', error);
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Job already saved' });
    }
    res.status(500).json({ message: 'Internal server error while saving job' });
  }
};

// Remove a saved job (only by owner)
export const removeSavedJob = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const deleted = await SavedJob.findOneAndDelete({
      _id: id,
      userId: userId
    });

    if (!deleted) {
      return res.status(404).json({ message: 'Saved job not found' });
    }

    console.log('✅ Saved job removed successfully');
    res.json({ message: 'Removed from saved jobs' });
  } catch (error) {
    console.error('❌ Remove saved job error:', error);
    res.status(500).json({ message: 'Internal server error while removing saved job' });
  }
};

// Remove a saved job by job ID (for frontend convenience)
export const removeSavedJobByJobId = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { jobId } = req.params;

    console.log('🗑️ Removing saved job:', { userId, jobId });

    const deleted = await SavedJob.findOneAndDelete({
      userId: userId,
      jobId: jobId
    });

    if (!deleted) {
      return res.status(404).json({ message: 'Saved job not found' });
    }

    console.log('✅ Saved job removed successfully');
    res.json({ message: 'Removed from saved jobs' });
  } catch (error) {
    console.error('❌ Remove saved job by job ID error:', error);
    res.status(500).json({ message: 'Internal server error while removing saved job' });
  }
};