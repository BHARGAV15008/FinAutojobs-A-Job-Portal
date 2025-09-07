import { db } from '../config/database.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';

export const getProfile = async (req, res, next) => {
  try {
    const recruiterId = req.user.id;
    const recruiter = await db.getRecruiterProfile(recruiterId);
    
    if (!recruiter) {
      throw new NotFoundError('Recruiter profile not found');
    }

    res.json({ recruiter });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const recruiterId = req.user.id;
    const updates = req.body;
    
    // Validate updates
    if (!updates || Object.keys(updates).length === 0) {
      throw new ValidationError('No updates provided');
    }

    const updatedRecruiter = await db.updateRecruiterProfile(recruiterId, updates);
    res.json({ recruiter: updatedRecruiter });
  } catch (error) {
    next(error);
  }
};

export const getPostedJobs = async (req, res, next) => {
  try {
    const recruiterId = req.user.id;
    const jobs = await db.getRecruiterJobs(recruiterId);
    res.json({ jobs });
  } catch (error) {
    next(error);
  }
};

export const getJobApplications = async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const recruiterId = req.user.id;
    
    // Verify job belongs to recruiter
    const job = await db.getJobById(jobId);
    if (!job || job.recruiterId !== recruiterId) {
      throw new NotFoundError('Job not found');
    }

    const applications = await db.getJobApplications(jobId);
    res.json({ applications });
  } catch (error) {
    next(error);
  }
};

export const updateApplicationStatus = async (req, res, next) => {
  try {
    const { applicationId } = req.params;
    const { status } = req.body;
    const recruiterId = req.user.id;
    
    if (!status) {
      throw new ValidationError('Status is required');
    }

    // Verify application is for recruiter's job
    const application = await db.getApplicationWithJob(applicationId);
    if (!application || application.job.recruiterId !== recruiterId) {
      throw new NotFoundError('Application not found');
    }

    const updatedApplication = await db.updateApplicationStatus(applicationId, status);
    res.json({ application: updatedApplication });
  } catch (error) {
    next(error);
  }
};

export const getAnalytics = async (req, res, next) => {
  try {
    const recruiterId = req.user.id;
    
    const analytics = await db.getRecruiterAnalytics(recruiterId);
    res.json({ analytics });
  } catch (error) {
    next(error);
  }
};
