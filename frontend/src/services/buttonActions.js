/**
 * Unified Button Actions Service
 * Standardizes all button functionality across the website
 */

import { toast } from 'react-hot-toast';
import { applicationService } from './applicationService';
import { jobService } from './jobService';

export class ButtonActionsService {
  constructor() {
    this.loadingStates = new Map();
    this.callbacks = new Map();
  }

  // Set loading state for a button
  setLoading(buttonId, isLoading) {
    this.loadingStates.set(buttonId, isLoading);
    this.notifyStateChange(buttonId);
  }

  // Get loading state for a button
  isLoading(buttonId) {
    return this.loadingStates.get(buttonId) || false;
  }

  // Register callback for state changes
  onStateChange(buttonId, callback) {
    if (!this.callbacks.has(buttonId)) {
      this.callbacks.set(buttonId, []);
    }
    this.callbacks.get(buttonId).push(callback);
  }

  // Notify all callbacks about state change
  notifyStateChange(buttonId) {
    const callbacks = this.callbacks.get(buttonId) || [];
    callbacks.forEach(callback => callback(this.isLoading(buttonId)));
  }

  /**
   * UNIFIED VIEW DETAILS FUNCTIONALITY
   * All "View", "View Job", "View Details" buttons use this
   */
  async handleViewDetails(job, options = {}) {
    const { onViewDetails, showModal = true } = options;
    
    try {
      console.log('🔍 View Details clicked for job:', job);
      
      // Ensure we have complete job data
      let completeJobData = job;
      
      // If we only have job ID, fetch complete data
      if (typeof job === 'string' || (job && !job.description)) {
        this.setLoading(`view-${job.id || job}`, true);
        completeJobData = await jobService.getJobById(job.id || job);
      }

      // Call the onViewDetails callback if provided
      if (onViewDetails) {
        onViewDetails(completeJobData);
      }

      // Show success feedback
      if (showModal) {
        toast.success('Job details loaded successfully');
      }

      return completeJobData;
    } catch (error) {
      console.error('❌ Error viewing job details:', error);
      toast.error('Failed to load job details');
      throw error;
    } finally {
      this.setLoading(`view-${job.id || job}`, false);
    }
  }

  /**
   * UNIFIED APPLY FUNCTIONALITY
   * All "Apply", "Apply Now" buttons use this
   */
  async handleApply(job, options = {}) {
    const { 
      user, 
      isAuthenticated, 
      onApply, 
      onAuthRequired,
      showSuccessModal = true 
    } = options;

    const jobId = job.id || job._id || job;
    const buttonId = `apply-${jobId}`;

    try {
      // Check authentication first
      if (!isAuthenticated || !user) {
        console.log('🔐 Authentication required for job application');
        toast.error('Please login to apply for jobs');
        
        if (onAuthRequired) {
          onAuthRequired(job);
        }
        return false;
      }

      this.setLoading(buttonId, true);
      console.log('📝 Applying to job:', job);

      // Check job expiration status
      if (job.status === 'Expired') {
        toast.error('❌ Cannot apply to expired job');
        return false;
      }

      // Check application deadline
      if (job.applicationDeadline && new Date() > new Date(job.applicationDeadline)) {
        toast.error('❌ Application deadline has passed');
        return false;
      }

      // Check if job is still active
      if (job.status && job.status !== 'Active') {
        toast.error(`❌ Cannot apply to ${job.status.toLowerCase()} job`);
        return false;
      }

      // Check if already applied
      const existingApplication = await applicationService.checkExistingApplication(
        user.id || user._id, 
        jobId
      );

      if (existingApplication.hasApplied) {
        toast.error('You have already applied to this job');
        return false;
      }

      // Create application
      const applicationData = {
        jobId: jobId,
        applicantId: user.id || user._id,
        status: 'applied',
        appliedDate: new Date(),
        coverLetter: '', // Can be enhanced with modal
        resumeId: user.resumeId || null
      };

      const result = await applicationService.createApplication(applicationData);

      // Show success feedback
      toast.success('Application submitted successfully!');
      
      if (showSuccessModal) {
        toast.success('🎉 Your application has been sent to the recruiter');
      }

      // Call callback if provided
      if (onApply) {
        onApply(job, result);
      }

      return result;
    } catch (error) {
      console.error('❌ Error applying to job:', error);
      toast.error('Failed to submit application. Please try again.');
      throw error;
    } finally {
      this.setLoading(buttonId, false);
    }
  }

  /**
   * UNIFIED APPLICATIONS BUTTON FUNCTIONALITY
   * Shows different content based on user role
   */
  async handleViewApplications(job, options = {}) {
    const { user, userRole, onViewApplications } = options;
    
    // Enhanced job ID extraction with better debugging
    let jobId;
    if (typeof job === 'string') {
      jobId = job;
    } else if (job && typeof job === 'object') {
      jobId = job.id || job._id || job.jobId;
    }
    
    console.log('🔍 Job object received:', job);
    console.log('🔍 Extracted job ID:', jobId);
    
    if (!jobId) {
      console.error('❌ No valid job ID found in:', job);
      toast.error('Invalid job ID - cannot fetch applications');
      return;
    }
    
    const buttonId = `applications-${jobId}`;

    try {
      this.setLoading(buttonId, true);
      console.log('👥 Viewing applications for job ID:', jobId);

      let applications = [];

      if (userRole === 'recruiter') {
        // Recruiter: Show applicants for this job
        console.log('🔍 Using job ID for applications:', jobId);
        const response = await applicationService.getApplicationsByJob(jobId);
        applications = response.data?.applications || response.applications || [];
        console.log('📊 Applications found:', applications.length);
        toast.success(`Found ${applications.length} applications for this job`);
      } else if (userRole === 'applicant') {
        // Applicant: Show their applications
        const response = await applicationService.getApplicationsByApplicant(user.id || user._id);
        applications = response.data?.applications || response.applications || [];
        console.log('📊 User applications found:', applications.length);
        toast.success(`You have ${applications.length} job applications`);
      }

      // Call callback with job and applications data
      if (onViewApplications) {
        onViewApplications(job, applications);
      }

      return applications;
    } catch (error) {
      console.error('❌ Error fetching applications:', error);
      toast.error('Failed to load applications');
      throw error;
    } finally {
      this.setLoading(buttonId, false);
    }
  }

  /**
   * UNIFIED SAVE/BOOKMARK FUNCTIONALITY
   */
  async handleSaveJob(job, options = {}) {
    const { user, isSaved = false, onSave } = options;
    const jobId = job.id || job._id || job;
    const buttonId = `save-${jobId}`;

    try {
      this.setLoading(buttonId, true);
      
      let result;
      if (isSaved) {
        // Remove from favorites
        result = await jobService.removeFromFavorites(user.id, jobId);
        toast.success('Job removed from saved jobs');
      } else {
        // Add to favorites
        result = await jobService.addToFavorites(user.id, jobId);
        toast.success('Job saved successfully!');
      }

      if (onSave) {
        onSave(job, !isSaved);
      }

      return result;
    } catch (error) {
      console.error('❌ Error saving job:', error);
      toast.error('Failed to save job');
      throw error;
    } finally {
      this.setLoading(buttonId, false);
    }
  }

  /**
   * UNIFIED EDIT FUNCTIONALITY
   */
  async handleEdit(item, options = {}) {
    const { onEdit, type = 'job' } = options;
    const itemId = item.id || item._id || item;
    
    try {
      console.log(`✏️ Editing ${type}:`, item);
      
      if (onEdit) {
        // Pass the entire object for editing
        onEdit(item);
      } else {
        console.log('⚠️ No onEdit callback provided');
        toast.error('Edit functionality not available');
      }
      
      toast.success(`${type} edit mode activated`);
      return true;
    } catch (error) {
      console.error(`❌ Error editing ${type}:`, error);
      toast.error(`Failed to edit ${type}`);
      throw error;
    }
  }

  /**
   * UNIFIED DELETE FUNCTIONALITY
   */
  async handleDelete(item, options = {}) {
    const { onDelete, type = 'job', confirmMessage } = options;
    const itemId = item.id || item._id || item;
    const buttonId = `delete-${itemId}`;

    try {
      // Show confirmation dialog
      const message = confirmMessage || `Are you sure you want to delete this ${type}? This action cannot be undone.`;
      const confirmed = window.confirm(message);
      
      if (!confirmed) {
        return false;
      }

      this.setLoading(buttonId, true);
      console.log(`🗑️ Deleting ${type}:`, item);

      if (onDelete) {
        // Use callback for deletion
        await onDelete(itemId);
        toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully`);
      } else {
        // Perform deletion based on type
        let result;
        switch (type) {
          case 'job':
            result = await jobService.deleteJob(itemId);
            break;
          case 'application':
            result = await applicationService.deleteApplication(itemId);
            break;
          default:
            throw new Error(`Unknown delete type: ${type}`);
        }
        toast.success(`${type} deleted successfully`);
        return result;
      }

      return true;
    } catch (error) {
      console.error(`❌ Error deleting ${type}:`, error);
      toast.error(`Failed to delete ${type}`);
      throw error;
    } finally {
      this.setLoading(buttonId, false);
    }
  }

  /**
   * UNIFIED SHARE FUNCTIONALITY
   */
  async handleShare(item, options = {}) {
    const { type = 'job' } = options;
    
    try {
      const shareData = {
        title: item.title || item.name || `${type} from FinAutoJobs`,
        text: item.description || `Check out this ${type} on FinAutoJobs`,
        url: window.location.href
      };

      if (navigator.share) {
        await navigator.share(shareData);
        toast.success(`${type} shared successfully`);
      } else {
        // Fallback: Copy to clipboard
        await navigator.clipboard.writeText(shareData.url);
        toast.success('Link copied to clipboard');
      }
    } catch (error) {
      console.error('❌ Error sharing:', error);
      toast.error('Failed to share');
    }
  }


  /**
   * UNIFIED CONTACT FUNCTIONALITY
   */
  async handleContact(target, options = {}) {
    const { onContact, type = 'recruiter' } = options;
    
    try {
      console.log(`📞 Contacting ${type}:`, target);
      
      if (onContact) {
        onContact(target);
      }
      
      toast.success(`Opening contact with ${type}`);
      return true;
    } catch (error) {
      console.error(`❌ Error contacting ${type}:`, error);
      toast.error(`Failed to contact ${type}`);
      throw error;
    }
  }
}

// Export singleton instance
export const buttonActions = new ButtonActionsService();

// Export individual action functions for convenience
export const {
  handleViewDetails,
  handleApply,
  handleViewApplications,
  handleSaveJob,
  handleEdit,
  handleDelete,
  handleShare,
  handleContact
} = buttonActions;

export default buttonActions;
