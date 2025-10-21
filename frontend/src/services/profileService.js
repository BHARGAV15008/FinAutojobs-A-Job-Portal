import { apiClient } from '../api/apiClient';

// Profile Service initialized

// Profile Service
export const profileService = {
  // Get complete user profile data
  getCompleteProfile: async (userId) => {
    try {
      console.log('Fetching complete profile for user', userId);
      
      const response = await apiClient.get('/auth/profile');
      
      console.log('Complete profile fetched', response.data);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error fetching complete profile', error);
      throw error;
    }
  },

  // Get user skills and experience
  getUserSkillsAndExperience: async (userId) => {
    try {
      const response = await apiClient.get(`/auth/profile`);
      const profileData = response.data.data || response.data;
      
      return {
        skills: profileData.skills || { primary: [], technical: [], soft: [] },
        experience: (() => {
          const years = profileData.experience_years || profileData.yearsOfExperience || 0;
          if (years <= 1) return '0-1';
          if (years <= 3) return '1-3';
          if (years <= 5) return '3-5';
          if (years <= 8) return '5-8';
          if (years <= 12) return '8-12';
          return '12+';
        })(),
        currentJobTitle: profileData.current_job_title || profileData.careerInfo?.currentJobTitle || '',
        currentCompany: profileData.current_company || profileData.careerInfo?.currentCompany || '',
        expectedSalary: profileData.expected_salary || profileData.careerInfo?.expectedSalary || '',
        location: profileData.current_location || profileData.currentLocation?.city || profileData.location || '',
        education: profileData.education || [],
        workExperience: profileData.workExperience || [],
        resume_url: profileData.resume_url || profileData.documents?.resumeUrl || '',
        portfolio_url: profileData.portfolio_url || profileData.socialLinks?.portfolio || '',
        linkedin_url: profileData.linkedin_url || profileData.socialLinks?.linkedin || '',
        github_url: profileData.github_url || profileData.socialLinks?.github || '',
      };
    } catch (error) {
      console.error('❌ Error fetching user skills and experience:', error);
      throw error;
    }
  },

  // Update user profile
  updateProfile: async (profileData) => {
    try {
      console.log('Updating profile', profileData);
      
      const response = await apiClient.put('/auth/profile', profileData);
      
      console.log('Profile updated successfully', response.data);
      return response.data;
    } catch (error) {
      console.error('Error updating profile', error);
      throw error;
    }
  },

  // Get user documents
  getUserDocuments: async () => {
    try {
      const response = await apiClient.get('/auth/profile');
      const profileData = response.data.data || response.data;
      
      return {
        resumeUrl: profileData.resume_url || profileData.documents?.resumeUrl || '',
        coverLetterUrl: profileData.cover_letter_url || profileData.documents?.coverLetterUrl || '',
        portfolioUrl: profileData.portfolio_url || profileData.documents?.portfolioUrl || '',
        certificates: profileData.certificates || profileData.documents?.certificates || [],
      };
    } catch (error) {
      console.error('❌ Error fetching user documents:', error);
      throw error;
    }
  },

  // Get user preferences
  getUserPreferences: async () => {
    try {
      const response = await apiClient.get('/auth/profile');
      const profileData = response.data.data || response.data;
      
      return {
        willingToRelocate: profileData.willing_to_relocate || profileData.jobPreferences?.willingToRelocate || false,
        remoteWorkPreference: profileData.remote_work_preference || profileData.jobPreferences?.remoteWorkPreference || false,
        preferredJobTypes: profileData.preferred_job_types || profileData.jobPreferences?.preferredJobTypes || [],
        preferredLocations: profileData.preferred_locations || profileData.jobPreferences?.preferredLocations || [],
        salaryExpectations: profileData.salary_expectations || profileData.jobPreferences?.salaryExpectations || '',
        noticePeriod: profileData.notice_period || profileData.jobPreferences?.noticePeriod || '',
      };
    } catch (error) {
      console.error('❌ Error fetching user preferences:', error);
      throw error;
    }
  },

  // Get comprehensive application data (combines all above)
  getApplicationData: async () => {
    try {
      console.log('Fetching comprehensive application data...');
      
      const response = await apiClient.get('/auth/profile');
      const profileData = response.data.data || response.data;
      
      // Transform and organize data for application form
      const applicationData = {
        // Personal Information
        firstName: profileData.firstName || '',
        lastName: profileData.lastName || '',
        email: profileData.email || '',
        phone: profileData.phone || '',
        location: profileData.currentLocation?.city ? 
          `${profileData.currentLocation.city}, ${profileData.currentLocation.state || profileData.currentLocation.country}` :
          profileData.current_location || profileData.location || '',
        bio: profileData.bio || '',
        
        // Professional Information - Enhanced mapping
        currentJobTitle: profileData.current_job_title || 
                           profileData.careerInfo?.currentJobTitle || 
                           profileData.workExperience?.[0]?.jobTitle || 
                           (profileData.workExperience?.[0]?.isCurrentJob ? profileData.workExperience[0].jobTitle : '') || '',
        
        currentCompany: profileData.current_company || 
                         profileData.careerInfo?.currentCompany || 
                         profileData.workExperience?.[0]?.companyName || 
                         (profileData.workExperience?.[0]?.isCurrentJob ? profileData.workExperience[0].companyName : '') || '',
        
        experience: (() => {
          const years = profileData.experience_years || profileData.yearsOfExperience || 0;
          if (years <= 1) return '0-1';
          if (years <= 3) return '1-3';
          if (years <= 5) return '3-5';
          if (years <= 8) return '5-8';
          if (years <= 12) return '8-12';
          return '12+';
        })(),
        
        expectedSalary: profileData.expected_salary || profileData.careerInfo?.expectedSalary || '',
        
        // Skills - Enhanced mapping
        primarySkills: profileData.skills?.primary || profileData.primary_skills || [],
        technicalSkills: profileData.skills?.technical || profileData.technical_skills || [],
        softSkills: profileData.skills?.soft || profileData.soft_skills || [],
        
        // Social Links - Enhanced mapping with multiple fallbacks
        linkedinUrl: profileData.linkedin_url || 
                      profileData.socialLinks?.linkedinUrl || 
                      profileData.socialLinks?.linkedin || '',
        
        portfolioUrl: profileData.portfolio_url || 
                       profileData.socialLinks?.portfolioUrl || 
                       profileData.socialLinks?.portfolio || 
                       profileData.documents?.portfolioUrl || '',
        
        githubUrl: profileData.github_url || 
                    profileData.socialLinks?.githubUrl || 
                    profileData.socialLinks?.github || '',
        
        // Preferences - Enhanced mapping
        willingToRelocate: profileData.willing_to_relocate || 
                            profileData.jobPreferences?.willingToRelocate || false,
        
        remoteWorkPreference: profileData.remote_work_preference || 
                               profileData.jobPreferences?.remoteWorkPreference || false,
        
        noticePeriod: profileData.notice_period || profileData.jobPreferences?.noticePeriod || '',
        
        // Education - Get highest degree
        highestEducation: profileData.education?.[0]?.degree || '',
        
        // Additional data
        languages: profileData.languages || [],
        education: profileData.education || [],
        workExperience: profileData.workExperience || [],
        
        // Resume URL
        resumeUrl: profileData.resume_url || profileData.documents?.resumeUrl || '',
      };
      
      console.log('Comprehensive application data prepared', applicationData);
      return applicationData;
    } catch (error) {
      console.error('Error fetching comprehensive application data', error);
      throw error;
    }
  },
};

export default profileService;
