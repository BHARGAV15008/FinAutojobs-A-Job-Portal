import Application from '../models/Application.js';
import Job from '../models/Job.js';
import { BaseUser } from '../models/UserModels.js';

/**
 * Application Service with Job Expiration Integration
 * Handles application lifecycle with proper job status awareness
 */

export class ApplicationService {
  
  /**
   * Create a new application with job validation
   */
  static async createApplication(applicationData) {
    try {
      const { jobId, applicantId, ...otherData } = applicationData;
      
      // Validate job exists and is still accepting applications
      const job = await Job.findById(jobId);
      if (!job) {
        throw new Error('Job not found');
      }
      
      // Check if job is expired
      if (job.status === 'Expired') {
        throw new Error('Cannot apply to expired job');
      }
      
      // Check if application deadline has passed
      if (job.applicationDeadline && new Date() > job.applicationDeadline) {
        throw new Error('Application deadline has passed');
      }
      
      // Check for duplicate application
      const existingApplication = await Application.findOne({
        jobId: jobId,
        applicantId: applicantId
      });
      
      if (existingApplication) {
        throw new Error('You have already applied to this job');
      }
      
      // Get applicant data for snapshot
      const applicant = await BaseUser.findById(applicantId);
      if (!applicant) {
        throw new Error('Applicant not found');
      }
      
      // Create application with snapshots
      const application = new Application({
        job: jobId,
        jobId: jobId,
        applicant: applicantId,
        applicantId: applicantId,
        jobStatus: job.status,
        
        // Job snapshot (preserved data)
        jobSnapshot: {
          title: job.jobTitle,
          company: job.companyName,
          location: job.location,
          applicationDeadline: job.applicationDeadline,
          salaryRange: job.salaryRange
        },
        
        // Applicant snapshot (preserved data)
        applicantSnapshot: {
          fullName: `${applicant.firstName} ${applicant.lastName}`,
          email: applicant.email,
          phone: applicant.phone,
          location: applicant.currentLocation?.city || applicant.location || '',
          bio: applicant.bio || '',
          skills: applicant.skills?.primary || applicant.primarySkills || [],
          education: applicant.education || [],
          workExperience: applicant.workExperience || []
        },
        
        // Application data
        applicationData: otherData.applicationData || {},
        resume: otherData.resume,
        coverLetter: otherData.coverLetter,
        
        // Initial timeline entry
        timeline: [{
          status: 'applied',
          updatedAt: new Date(),
          notes: 'Application submitted',
          type: 'status_change'
        }]
      });
      
      const savedApplication = await application.save();
      
      console.log(`✅ Application created: ${savedApplication._id} for job: ${job.jobTitle}`);
      
      return savedApplication;
    } catch (error) {
      console.error('❌ Error creating application:', error);
      throw error;
    }
  }
  
  /**
   * Get applications with job expiration awareness
   */
  static async getApplications(filters = {}) {
    try {
      const query = { ...filters };
      
      const applications = await Application.find(query)
        .populate('job', 'jobTitle companyName status applicationDeadline')
        .populate('applicant', 'firstName lastName email')
        .sort({ appliedAt: -1 })
        .lean();
      
      // Enhance applications with expiration info
      const enhancedApplications = applications.map(app => ({
        ...app,
        canBeProcessed: app.jobStatus === 'Active' || 
                       (app.jobStatus === 'Expired' && app.canStillProcess !== false),
        statusDisplay: app.jobStatus === 'Expired' && app.status !== 'expired_job' 
                      ? `${app.status} (Job Expired)` 
                      : app.status,
        isJobExpired: app.jobStatus === 'Expired',
        jobTitle: app.jobSnapshot?.title || app.job?.jobTitle || 'Unknown Position',
        companyName: app.jobSnapshot?.company || app.job?.companyName || 'Unknown Company'
      }));
      
      return enhancedApplications;
    } catch (error) {
      console.error('❌ Error getting applications:', error);
      throw error;
    }
  }
  
  /**
   * Update application status with job expiration checks
   */
  static async updateApplicationStatus(applicationId, newStatus, updatedBy, notes = '') {
    try {
      const application = await Application.findById(applicationId);
      if (!application) {
        throw new Error('Application not found');
      }
      
      // Check if application can still be processed
      if (!application.canBeProcessed()) {
        throw new Error('Cannot update application for closed/expired job');
      }
      
      // Update application
      application.status = newStatus;
      application.updatedAt = new Date();
      
      // Add timeline entry
      application.timeline.push({
        status: newStatus,
        updatedBy: updatedBy,
        updatedAt: new Date(),
        notes: notes,
        type: 'status_change'
      });
      
      // Add note if provided
      if (notes) {
        application.notes.push({
          author: updatedBy,
          content: notes,
          type: 'recruiter_note',
          createdAt: new Date()
        });
      }
      
      const updatedApplication = await application.save();
      
      console.log(`✅ Application status updated: ${applicationId} -> ${newStatus}`);
      
      return updatedApplication;
    } catch (error) {
      console.error('❌ Error updating application status:', error);
      throw error;
    }
  }
  
  /**
   * Get applications for a specific job (with expiration handling)
   */
  static async getApplicationsForJob(jobId) {
    try {
      const job = await Job.findById(jobId);
      if (!job) {
        throw new Error('Job not found');
      }
      
      const applications = await this.getApplications({ jobId: jobId });
      
      return {
        job: {
          id: job._id,
          title: job.jobTitle,
          company: job.companyName,
          status: job.status,
          isExpired: job.status === 'Expired',
          applicationDeadline: job.applicationDeadline
        },
        applications: applications,
        canAcceptNewApplications: job.status === 'Active' && 
                                 (!job.applicationDeadline || new Date() <= job.applicationDeadline)
      };
    } catch (error) {
      console.error('❌ Error getting applications for job:', error);
      throw error;
    }
  }
  
  /**
   * Handle bulk application updates when job expires
   */
  static async handleJobExpiration(jobId) {
    try {
      return await Application.handleJobExpiration(jobId);
    } catch (error) {
      console.error('❌ Error handling job expiration for applications:', error);
      throw error;
    }
  }
}

export default ApplicationService;
