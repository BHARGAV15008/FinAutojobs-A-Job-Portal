import { BaseUser } from '../models/UserModels.js';

/**
 * Applicant Snapshot Service
 * 
 * This service creates and manages applicant snapshots that preserve user profile data
 * at the time of job application submission. This ensures historical accuracy even if
 * the user updates their profile later.
 * 
 * INTEGRATION POINTS:
 * 
 * 1. AUTOMATIC SNAPSHOT CREATION:
 *    - When user applies for a job via applicationsController.applyToJob()
 *    - Snapshot is automatically created and stored in JobApplication.applicantSnapshot
 * 
 * 2. RECRUITER DASHBOARD:
 *    - EnhancedCandidatesTab.jsx displays snapshot data (name, email, phone, location, etc.)
 *    - CandidateProfileModal.jsx shows complete snapshot details
 *    - Data is fetched from application.applicantSnapshot field
 * 
 * 3. APPLICANT DASHBOARD:
 *    - ApplicantApplicationsTab.jsx can display their submitted snapshot data
 *    - Shows what information was sent to recruiters at time of application
 * 
 * 4. MANUAL SNAPSHOT UPDATE:
 *    - API Route: PUT /api/applications/:id/snapshot
 *    - Frontend Component: ApplicationSnapshotUpdater.jsx
 *    - Use case: Update snapshot if user's profile was incomplete during application
 * 
 * 5. API ENDPOINTS:
 *    - GET /api/applications/:id/snapshot - Retrieve snapshot
 *    - PUT /api/applications/:id/snapshot - Update snapshot with latest profile data
 *    - Integrated in frontend/src/services/api.js as applicationsAPI.getApplicantSnapshot()
 * 
 * SNAPSHOT DATA STRUCTURE:
 * {
 *   fullName: String,
 *   email: String,
 *   phone: String,
 *   location: String (formatted as "City, Country"),
 *   currentJobTitle: String,
 *   currentCompany: String,
 *   experience: String (range like "1-3", "3-5", "8+"),
 *   skills: Array of Strings,
 *   education: Array of education objects,
 *   workExperience: Array of work experience objects
 * }
 */

/**
 * Maps years of experience to a range string
 * @param {number} years - Years of experience
 * @returns {string} Experience range (e.g., "1-3", "3-5")
 */
function mapExperienceToRange(years) {
  if (!years || years < 1) return '< 1';
  if (years >= 1 && years < 3) return '1-3';
  if (years >= 3 && years < 5) return '3-5';
  if (years >= 5 && years < 8) return '5-8';
  if (years >= 8) return '8+';
  return '0';
}

/**
 * Gets the current or most recent job from work experience
 * @param {Array} workExperience - Array of work experience objects
 * @returns {Object|null} Current or most recent job
 */
function getCurrentJob(workExperience) {
  if (!workExperience || workExperience.length === 0) return null;
  
  // Find current job
  const currentJob = workExperience.find(job => job.isCurrentJob);
  if (currentJob) return currentJob;
  
  // If no current job, return most recent (first in array)
  return workExperience[0];
}

/**
 * Formats location from currentLocation object
 * @param {Object} currentLocation - Location object with city and country
 * @returns {string} Formatted location string
 */
function formatLocation(currentLocation) {
  if (!currentLocation) return 'N/A';
  
  const parts = [];
  if (currentLocation.city) parts.push(currentLocation.city);
  if (currentLocation.country) parts.push(currentLocation.country);
  
  return parts.length > 0 ? parts.join(', ') : 'N/A';
}

/**
 * Maps BaseUser data to applicantSnapshot format
 * @param {Object} baseUser - BaseUser document from database
 * @returns {Object} Formatted applicantSnapshot object
 */
export function mapUserToSnapshot(baseUser) {
  if (!baseUser) {
    throw new Error('BaseUser data is required to create snapshot');
  }

  // Get current job information
  const currentJob = getCurrentJob(baseUser.workExperience);
  
  // Map experience to range
  const experienceRange = mapExperienceToRange(baseUser.yearsOfExperience);
  
  // Format location
  const location = formatLocation(baseUser.currentLocation);
  
  // Extract skills (primary skills from skills object)
  const skills = baseUser.skills?.primary || [];
  
  // Get education data
  const education = baseUser.education || [];
  
  // Get work experience data
  const workExperience = baseUser.workExperience || [];
  
  return {
    fullName: baseUser.fullName || `${baseUser.firstName || ''} ${baseUser.lastName || ''}`.trim(),
    email: baseUser.email,
    phone: baseUser.phone || 'N/A',
    location: location,
    currentJobTitle: currentJob?.jobTitle || 'N/A',
    currentCompany: currentJob?.companyName || 'N/A',
    experience: experienceRange,
    skills: skills,
    education: education,
    workExperience: workExperience
  };
}

/**
 * Creates job snapshot from job data
 * @param {Object} job - Job document from database
 * @returns {Object} Formatted jobSnapshot object
 */
export function mapJobToSnapshot(job) {
  if (!job) {
    throw new Error('Job data is required to create snapshot');
  }

  return {
    jobTitle: job.title || job.jobTitle || 'N/A',
    companyName: job.companyName || job.company?.name || 'N/A',
    location: job.location || 'N/A',
    jobType: job.jobType || job.type || 'N/A'
  };
}

/**
 * Fetches user data and creates applicant snapshot
 * @param {string|ObjectId} applicantId - ID of the applicant
 * @returns {Promise<Object>} Applicant snapshot object
 */
export async function createApplicantSnapshot(applicantId) {
  try {
    // Fetch the latest data from baseusers schema
    const baseUser = await BaseUser.findById(applicantId);
    
    if (!baseUser) {
      throw new Error(`BaseUser with ID ${applicantId} not found`);
    }
    
    // Map the baseuser data to snapshot format
    const snapshot = mapUserToSnapshot(baseUser);
    
    console.log('✅ Successfully created applicant snapshot for user:', applicantId);
    return snapshot;
    
  } catch (error) {
    console.error('❌ Error creating applicant snapshot:', error);
    throw error;
  }
}

/**
 * Updates an existing application's applicant snapshot
 * @param {Object} application - Application document
 * @returns {Promise<Object>} Updated application with new snapshot
 */
export async function updateApplicationSnapshot(application) {
  try {
    if (!application) {
      throw new Error('Application is required');
    }
    
    // Fetch latest user data
    const snapshot = await createApplicantSnapshot(application.applicantId);
    
    // Update application's applicantSnapshot
    application.applicantSnapshot = snapshot;
    
    // Save the updated application
    await application.save();
    
    console.log('✅ Successfully updated applicant snapshot for application:', application._id);
    return application;
    
  } catch (error) {
    console.error('❌ Error updating application snapshot:', error);
    throw error;
  }
}

export default {
  mapUserToSnapshot,
  mapJobToSnapshot,
  createApplicantSnapshot,
  updateApplicationSnapshot
};
