
import express from 'express';
import { authenticateToken } from '../middleware/authenticateToken.js';
import { BaseUser, Recruiter, Applicant } from '../models/UserModels.js';
import Job from '../models/Job.js';
import Application from '../models/unified/Application.js';

const router = express.Router();

// Recruiter Dashboard
router.get('/recruiter', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'recruiter') {
      return res.status(403).json({ message: 'Access denied. Recruiter role required.' });
    }

    const userId = req.user.userId || req.user._id;

    // Fetch Recruiter Profile
    const recruiter = await Recruiter.findById(userId);
    if (!recruiter) {
      return res.status(404).json({ message: 'Recruiter not found.' });
    }

    // Fetch Jobs
    const jobs = await Job.find({ postedBy: userId }).lean();
    const jobIds = jobs.map(job => job._id);

    // Fetch Applications
    const applications = await Application.find({ jobId: { $in: jobIds } })
      .populate('applicantId', 'firstName lastName profileImage')
      .populate('jobId', 'jobTitle')
      .sort({ createdAt: -1 })
      .lean();

    // Calculate Stats
    const activeJobsCount = jobs.filter(job => job.status === 'active').length;
    const totalApplications = applications.length;
    const pendingApplications = applications.filter(app => app.status === 'pending' || app.applicationStatus === 'pending').length;
    const hiredApplications = applications.filter(app => app.status === 'hired' || app.applicationStatus === 'hired').length;

    // Format Recent Applications
    const recentApplications = applications.slice(0, 5).map(app => ({
      id: app._id,
      applicantName: app.applicantId ? `${app.applicantId.firstName} ${app.applicantId.lastName}` : 'Unknown Applicant',
      jobTitle: app.jobId ? app.jobId.jobTitle : 'Unknown Job',
      appliedAt: app.createdAt || app.appliedAt,
      status: app.status || app.applicationStatus
    }));

    // Format Active Jobs
    const activeJobsList = jobs
      .filter(job => job.status === 'active')
      .slice(0, 5)
      .map(job => ({
        ...job,
        id: job._id,
        title: job.jobTitle,
        applicationsCount: applications.filter(app => app.jobId && app.jobId._id && app.jobId._id.toString() === job._id.toString()).length
      }));

    const dashboardData = {
      user: recruiter,
      stats: {
        activeJobs: activeJobsCount,
        totalJobs: jobs.length,
        totalApplications: totalApplications,
        pendingReview: pendingApplications,
        hired: hiredApplications,
        shortlisted: applications.filter(app => app.status === 'shortlisted' || app.applicationStatus === 'shortlisted').length
      },
      recentApplications: recentApplications,
      activeJobs: activeJobsList,
      applications: applications // Include all applications for the Applicants tab
    };

    res.json(dashboardData);
  } catch (error) {
    console.error('Recruiter Dashboard Error:', error);
    res.status(500).json({ message: 'Failed to fetch recruiter dashboard', error: error.message });
  }
});

// Applicant Dashboard
router.get('/applicant', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'applicant') {
      return res.status(403).json({ message: 'Access denied. Applicant role required.' });
    }

    const userId = req.user.userId || req.user._id;

    // Fetch Applicant Profile
    const applicant = await Applicant.findById(userId)
      .populate('savedJobs')
      .lean();
      
    if (!applicant) {
      return res.status(404).json({ message: 'Applicant not found.' });
    }

    // Fetch Applications
    const applications = await Application.find({ applicantId: userId })
      .populate('jobId', 'jobTitle companyName location')
      .sort({ createdAt: -1 })
      .lean();

    // Calculate Stats
    const appliedJobsCount = applications.length;
    const savedJobsCount = applicant.savedJobs ? applicant.savedJobs.length : 0;
    
    // Format Recent Applications
    const recentApplicationsList = applications.slice(0, 5).map(app => ({
      id: app._id,
      jobTitle: app.jobId ? app.jobId.jobTitle : 'Unknown Job',
      companyName: app.jobId ? app.jobId.companyName : 'Unknown Company',
      appliedAt: app.createdAt || app.appliedAt,
      status: app.status || app.applicationStatus
    }));

    const dashboardData = {
      user: applicant,
      stats: {
        appliedJobs: appliedJobsCount,
        savedJobs: savedJobsCount,
        totalApplications: appliedJobsCount,
        shortlisted: applications.filter(app => app.status === 'shortlisted' || app.applicationStatus === 'shortlisted').length,
        interviews: applications.filter(app => app.status === 'interview' || app.applicationStatus === 'interview').length,
        hired: applications.filter(app => app.status === 'hired' || app.applicationStatus === 'hired' || app.status === 'accepted').length
      },
      recentApplications: recentApplicationsList,
      applications: applications // Include full applications list
    };

    res.json(dashboardData);
  } catch (error) {
    console.error('Applicant Dashboard Error:', error);
    res.status(500).json({ message: 'Failed to fetch applicant dashboard', error: error.message });
  }
});

export default router;
