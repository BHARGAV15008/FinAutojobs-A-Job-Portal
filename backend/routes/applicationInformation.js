import express from 'express';
import ApplicationInformation from '../models/ApplicationInformation.js';
import Application from '../models/unified/Application.js';
import { Applicant } from '../models/UserModels.js';
import Job from '../models/Job.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   POST /api/application-information
 * @desc    Create application information when user applies for a job
 * @access  Private (Applicant only)
 */
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { jobId, applicationData } = req.body;
    const applicantId = req.user.userId;

    // Verify user is an applicant
    if (req.user.role !== 'applicant') {
      return res.status(403).json({
        success: false,
        message: 'Only applicants can create application information'
      });
    }

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Get applicant profile
    const applicant = await Applicant.findById(applicantId);
    if (!applicant) {
      return res.status(404).json({
        success: false,
        message: 'Applicant profile not found'
      });
    }

    // Check if application already exists
    const existingApplication = await Application.findOne({
      applicant: applicantId,
      job: jobId
    });

    let application;
    if (existingApplication) {
      application = existingApplication;
    } else {
      // Create new application
      application = new Application({
        job: jobId,
        applicant: applicantId,
        resume: applicationData.documents?.resume?.url,
        coverLetter: applicationData.applicationDetails?.motivation,
        status: 'pending'
      });
      await application.save();
    }

    // Check if application information already exists
    const existingAppInfo = await ApplicationInformation.findOne({
      applicationId: application._id
    });

    if (existingAppInfo) {
      return res.status(400).json({
        success: false,
        message: 'Application information already exists for this application'
      });
    }

    // Create application information using the static method
    const applicationInfo = await ApplicationInformation.createFromProfile(
      application._id,
      applicantId,
      jobId,
      applicant.toObject(),
      applicationData
    );

    // Update application with additional data if provided
    if (applicationData.documents?.resume?.url) {
      application.resume = applicationData.documents.resume.url;
    }
    if (applicationData.applicationDetails?.motivation) {
      application.coverLetter = applicationData.applicationDetails.motivation;
    }
    await application.save();

    res.status(201).json({
      success: true,
      message: 'Application information created successfully',
      data: {
        applicationInfo,
        applicationId: application._id
      }
    });

  } catch (error) {
    console.error('Error creating application information:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create application information',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/application-information/:applicationId
 * @desc    Get application information by application ID
 * @access  Private (Applicant who applied or Recruiter who posted the job)
 */
router.get('/:applicationId', authenticateToken, async (req, res) => {
  try {
    const { applicationId } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.role;

    // Find application information
    const applicationInfo = await ApplicationInformation.findOne({ applicationId })
      .populate('applicationId', 'status appliedAt')
      .populate('jobId', 'title companyName location')
      .populate('applicantId', 'firstName lastName email');

    if (!applicationInfo) {
      return res.status(404).json({
        success: false,
        message: 'Application information not found'
      });
    }

    // Check access permissions
    if (userRole === 'applicant') {
      // Applicant can only view their own application information
      if (applicationInfo.applicantId._id.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only view your own application information.'
        });
      }
    } else if (userRole === 'recruiter') {
      // Recruiter can view application information for jobs they posted
      const job = await Job.findById(applicationInfo.jobId._id);
      if (!job || job.postedBy.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied. You can only view applications for jobs you posted.'
        });
      }
    } else {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: applicationInfo
    });

  } catch (error) {
    console.error('Error fetching application information:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch application information',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/application-information/job/:jobId
 * @desc    Get all application information for a specific job
 * @access  Private (Recruiter who posted the job only)
 */
router.get('/job/:jobId', authenticateToken, async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.role;

    // Only recruiters can access this endpoint
    if (userRole !== 'recruiter') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only recruiters can view job applications.'
      });
    }

    // Check if recruiter posted this job
    const job = await Job.findById(jobId);
    if (!job || job.postedBy.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view applications for jobs you posted.'
      });
    }

    // Get all application information for this job
    const applicationInfos = await ApplicationInformation.find({ jobId })
      .populate('applicationId', 'status appliedAt updatedAt')
      .populate('applicantId', 'firstName lastName email phone')
      .sort({ 'metadata.submissionDate': -1 });

    // Add formatted data for easier frontend consumption
    const formattedApplications = applicationInfos.map(appInfo => ({
      ...appInfo.toObject(),
      formattedSalary: appInfo.formattedSalary,
      formattedExperience: appInfo.formattedExperience,
      // Summary for quick view
      summary: {
        name: `${appInfo.basicInfo.firstName} ${appInfo.basicInfo.lastName}`,
        email: appInfo.basicInfo.email,
        phone: appInfo.basicInfo.phone,
        experience: appInfo.formattedExperience,
        expectedSalary: appInfo.formattedSalary,
        location: appInfo.location.current.city || 'Not specified',
        primarySkills: appInfo.skills.primary.slice(0, 3).map(s => s.skill).join(', '),
        applicationStatus: appInfo.applicationId.status,
        appliedDate: appInfo.applicationId.appliedAt
      }
    }));

    res.json({
      success: true,
      data: {
        job: {
          id: job._id,
          title: job.title,
          companyName: job.companyName
        },
        applications: formattedApplications,
        totalApplications: formattedApplications.length
      }
    });

  } catch (error) {
    console.error('Error fetching job applications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch job applications',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/application-information/applicant/:applicantId
 * @desc    Get all application information for a specific applicant
 * @access  Private (Applicant themselves only)
 */
router.get('/applicant/:applicantId', authenticateToken, async (req, res) => {
  try {
    const { applicantId } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.role;

    // Only applicants can access their own data
    if (userRole !== 'applicant' || applicantId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own application information.'
      });
    }

    // Get all application information for this applicant
    const applicationInfos = await ApplicationInformation.find({ applicantId })
      .populate('applicationId', 'status appliedAt updatedAt')
      .populate('jobId', 'title companyName location salaryRange')
      .sort({ 'metadata.submissionDate': -1 });

    // Add formatted data
    const formattedApplications = applicationInfos.map(appInfo => ({
      ...appInfo.toObject(),
      formattedSalary: appInfo.formattedSalary,
      formattedExperience: appInfo.formattedExperience,
      // Summary for dashboard view
      summary: {
        jobTitle: appInfo.jobId.title,
        companyName: appInfo.jobId.companyName,
        location: appInfo.jobId.location,
        expectedSalary: appInfo.formattedSalary,
        applicationStatus: appInfo.applicationId.status,
        appliedDate: appInfo.applicationId.appliedAt,
        lastUpdated: appInfo.applicationId.updatedAt
      }
    }));

    res.json({
      success: true,
      data: {
        applications: formattedApplications,
        totalApplications: formattedApplications.length,
        // Statistics
        stats: {
          total: formattedApplications.length,
          pending: formattedApplications.filter(app => app.applicationId.status === 'pending').length,
          reviewing: formattedApplications.filter(app => app.applicationId.status === 'reviewing').length,
          shortlisted: formattedApplications.filter(app => app.applicationId.status === 'shortlisted').length,
          interviewed: formattedApplications.filter(app => app.applicationId.status === 'interviewed').length,
          offered: formattedApplications.filter(app => app.applicationId.status === 'offered').length,
          rejected: formattedApplications.filter(app => app.applicationId.status === 'rejected').length
        }
      }
    });

  } catch (error) {
    console.error('Error fetching applicant applications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch applicant applications',
      error: error.message
    });
  }
});

/**
 * @route   PUT /api/application-information/:applicationId
 * @desc    Update application information
 * @access  Private (Applicant who applied only)
 */
router.put('/:applicationId', authenticateToken, async (req, res) => {
  try {
    const { applicationId } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.role;
    const updateData = req.body;

    // Only applicants can update their application information
    if (userRole !== 'applicant') {
      return res.status(403).json({
        success: false,
        message: 'Only applicants can update application information'
      });
    }

    // Find application information
    const applicationInfo = await ApplicationInformation.findOne({ applicationId });
    if (!applicationInfo) {
      return res.status(404).json({
        success: false,
        message: 'Application information not found'
      });
    }

    // Check if applicant owns this application
    if (applicationInfo.applicantId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update your own application information.'
      });
    }

    // Update application information
    const updatedAppInfo = await applicationInfo.updateFromData(updateData);

    res.json({
      success: true,
      message: 'Application information updated successfully',
      data: updatedAppInfo
    });

  } catch (error) {
    console.error('Error updating application information:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update application information',
      error: error.message
    });
  }
});

/**
 * @route   DELETE /api/application-information/:applicationId
 * @desc    Delete application information (and associated application)
 * @access  Private (Applicant who applied only)
 */
router.delete('/:applicationId', authenticateToken, async (req, res) => {
  try {
    const { applicationId } = req.params;
    const userId = req.user.userId;
    const userRole = req.user.role;

    // Only applicants can delete their application information
    if (userRole !== 'applicant') {
      return res.status(403).json({
        success: false,
        message: 'Only applicants can delete application information'
      });
    }

    // Find application information
    const applicationInfo = await ApplicationInformation.findOne({ applicationId });
    if (!applicationInfo) {
      return res.status(404).json({
        success: false,
        message: 'Application information not found'
      });
    }

    // Check if applicant owns this application
    if (applicationInfo.applicantId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only delete your own application information.'
      });
    }

    // Delete application information
    await ApplicationInformation.findOneAndDelete({ applicationId });

    // Also delete the associated application
    await Application.findByIdAndDelete(applicationId);

    res.json({
      success: true,
      message: 'Application and application information deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting application information:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete application information',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/application-information/search
 * @desc    Search application information with filters
 * @access  Private (Recruiters only)
 */
router.get('/search', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const userRole = req.user.role;

    // Only recruiters can search applications
    if (userRole !== 'recruiter') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only recruiters can search applications.'
      });
    }

    const {
      jobId,
      skills,
      experience,
      location,
      salaryRange,
      education,
      status,
      page = 1,
      limit = 10
    } = req.query;

    // Build search query
    let searchQuery = {};

    // Filter by jobs posted by this recruiter
    const recruiterJobs = await Job.find({ postedBy: userId }).select('_id');
    const jobIds = recruiterJobs.map(job => job._id);
    searchQuery.jobId = { $in: jobIds };

    // Add specific job filter if provided
    if (jobId) {
      searchQuery.jobId = jobId;
    }

    // Add filters
    if (skills) {
      const skillsArray = skills.split(',').map(s => s.trim());
      searchQuery.$or = [
        { 'skills.primary.skill': { $in: skillsArray } },
        { 'skills.technical.skill': { $in: skillsArray } }
      ];
    }

    if (experience) {
      const [min, max] = experience.split('-').map(Number);
      if (max) {
        searchQuery['experience.totalYears'] = { $gte: min, $lte: max };
      } else {
        searchQuery['experience.totalYears'] = { $gte: min };
      }
    }

    if (location) {
      searchQuery['location.current.city'] = new RegExp(location, 'i');
    }

    if (salaryRange) {
      const [min, max] = salaryRange.split('-').map(Number);
      if (max) {
        searchQuery['expectedSalary.salaryRange.min'] = { $gte: min, $lte: max };
      } else {
        searchQuery['expectedSalary.salaryRange.min'] = { $gte: min };
      }
    }

    if (education) {
      searchQuery['education.degree'] = new RegExp(education, 'i');
    }

    // Execute search with pagination
    const skip = (page - 1) * limit;
    const applicationInfos = await ApplicationInformation.find(searchQuery)
      .populate('applicationId', 'status appliedAt')
      .populate('jobId', 'title companyName')
      .populate('applicantId', 'firstName lastName email')
      .sort({ 'metadata.submissionDate': -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await ApplicationInformation.countDocuments(searchQuery);

    res.json({
      success: true,
      data: {
        applications: applicationInfos,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalResults: total,
          hasNext: page * limit < total,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Error searching application information:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search application information',
      error: error.message
    });
  }
});

export default router;
