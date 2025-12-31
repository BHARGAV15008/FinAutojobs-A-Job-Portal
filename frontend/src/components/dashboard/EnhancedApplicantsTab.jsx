import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../contexts/IntegratedThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { candidatesAPI, interviewsAPI } from '../../services/api';
import { createNotification } from '../../api/notifications';
import { applicationService } from '../../services/applicationService';
import CandidateProfileModal from '../modals/CandidateProfileModal';
import ContactModal from '../modals/ContactModal';
import ScheduleModal from '../modals/ScheduleModal';

const EnhancedCandidatesTab = () => {
  const { darkMode } = useTheme();
  const { user: currentUser } = useAuth();
  const [viewMode, setViewMode] = useState('table');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('lastActivity');
  const [sortOrder, setSortOrder] = useState('desc');
  const [actionLoading, setActionLoading] = useState({});
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);
  
  // Modal states
  const [profileModal, setProfileModal] = useState({ isOpen: false, candidate: null });
  const [contactModal, setContactModal] = useState({ isOpen: false, candidate: null });
  const [scheduleModal, setScheduleModal] = useState({ isOpen: false, candidate: null });

  // Fetch applications data
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        // Fetching applications for candidates tab
        
        const response = await applicationService.getUserApplications(50, 1);
        // Applications fetched successfully
        
        if (response.success) {
          setApplications(response.data?.applications || []);
        } else {
          setError('Failed to fetch applications');
        }
      } catch (error) {
        console.error('❌ Error fetching applications:', error);
        setError('Error loading applications');
      } finally {
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

  // Transform applications data into candidates format
  const candidates = useMemo(() => {
    return applications.map(app => ({
      id: app._id,
      applicationId: app._id,
      jobId: app.jobId,
      candidateId: app.applicantId,
      name: app.applicantSnapshot?.fullName || app.applicantSnapshot?.full_name || 'Unknown Candidate',
      email: app.applicantSnapshot?.email || '',
      phone: app.applicantSnapshot?.phone || app.applicationData?.phone || '',
      location: app.applicantSnapshot?.location || app.applicationData?.location || 'Location not specified',
      bio: app.applicantSnapshot?.bio || app.applicationData?.bio || '',
      summary: app.applicantSnapshot?.bio || app.applicationData?.bio || app.applicantSnapshot?.professionalSummary || '',
      qualification: app.applicantSnapshot?.qualification || app.applicationData?.qualification || 'Not specified',
      currentRole: app.applicantSnapshot?.currentJobTitle || app.applicationData?.currentJobTitle || app.applicantSnapshot?.currentRole || 'Not specified',
      currentJobTitle: app.applicantSnapshot?.currentJobTitle || app.applicationData?.currentJobTitle || 'Not specified',
      expectedSalary: app.applicantSnapshot?.expectedSalary || app.applicationData?.expectedSalary || 'Not specified',
      experience: (() => {
        // Try to get experience from different sources - prioritize applicantSnapshot first
        const snapshotExperience = app.applicantSnapshot?.experience;
        const snapshotYears = app.applicantSnapshot?.yearsOfExperience;
        
        const appExperience = app.applicationData?.experience;
        const yearsOfExperience = app.applicationData?.yearsOfExperience;
        const experienceMin = app.applicationData?.experienceMin;
        const experienceMax = app.applicationData?.experienceMax;
        const workExperience = app.applicationData?.workExperience;
        const totalExperience = app.applicationData?.totalExperience;
        const experienceLevel = app.applicationData?.experienceLevel;
        
        // Check nested professional info structure
        const professionalTotalExp = app.applicationData?.professionalInfo?.totalExperience;
        const professionalWorkExp = app.applicationData?.professionalInfo?.workExperience;
        const professionalExpLevel = app.applicationData?.professionalInfo?.experienceLevel;
        
        const profileExperience = app.applicantSnapshot?.experience;
        const profileYears = app.applicantSnapshot?.yearsOfExperience;
        
        // Debug: Log available experience data
        console.log('🔍 Experience data for', app.applicantSnapshot?.fullName || 'Unknown', {
          snapshotExperience,
          snapshotYears,
          appExperience,
          yearsOfExperience,
          experienceMin,
          experienceMax,
          workExperience,
          totalExperience,
          experienceLevel,
          professionalTotalExp,
          professionalWorkExp,
          professionalExpLevel,
          profileExperience,
          profileYears,
          fullApplicationData: app.applicationData,
          fullApplicantSnapshot: app.applicantSnapshot
        });
        
        // Priority: applicantSnapshot > nested professional info > flat application data > profile data > default
        if (snapshotExperience && snapshotExperience.trim()) {
          // Applicant snapshot experience (from submitted application)
          return snapshotExperience;
        } else if (snapshotYears !== undefined && snapshotYears !== null) {
          // Applicant snapshot years of experience
          return `${snapshotYears} years`;
        } else if (professionalTotalExp !== undefined && professionalTotalExp !== null) {
          // Professional info total experience (from form)
          return `${professionalTotalExp} years`;
        } else if (professionalWorkExp && professionalWorkExp.trim()) {
          // Professional info work experience
          return professionalWorkExp;
        } else if (professionalExpLevel && professionalExpLevel.trim()) {
          // Professional info experience level
          return professionalExpLevel;
        } else if (appExperience && appExperience.trim()) {
          // If it's already a formatted string, return as is
          return appExperience;
        } else if (totalExperience && totalExperience.trim()) {
          // Total experience field
          return totalExperience;
        } else if (workExperience && workExperience.trim()) {
          // Work experience field
          return workExperience;
        } else if (experienceLevel && experienceLevel.trim()) {
          // Experience level (e.g., "Senior", "Mid-level")
          return experienceLevel;
        } else if (yearsOfExperience !== undefined && yearsOfExperience !== null) {
          // Years of experience as number
          return `${yearsOfExperience} years`;
        } else if (profileExperience && profileExperience.trim()) {
          // Profile experience
          return profileExperience;
        } else if (profileYears !== undefined && profileYears !== null) {
          // Profile years of experience
          return `${profileYears} years`;
        } else {
          // Default fallback
          return 'Not specified';
        }
      })(),
      skills: (() => {
        // Extract skills from various sources
        const snapshotSkills = app.applicantSnapshot?.skills;
        const appDataSkills = app.applicationData?.skills;
        
        // Handle different skill formats (array or string)
        let skillsArray = [];
        if (Array.isArray(snapshotSkills) && snapshotSkills.length > 0) {
          skillsArray = snapshotSkills;
        } else if (typeof snapshotSkills === 'string' && snapshotSkills.trim()) {
          try {
            skillsArray = JSON.parse(snapshotSkills);
          } catch {
            skillsArray = snapshotSkills.split(',').map(s => s.trim());
          }
        } else if (Array.isArray(appDataSkills) && appDataSkills.length > 0) {
          skillsArray = appDataSkills;
        } else if (typeof appDataSkills === 'string' && appDataSkills.trim()) {
          try {
            skillsArray = JSON.parse(appDataSkills);
          } catch {
            skillsArray = appDataSkills.split(',').map(s => s.trim());
          }
        }
        
        return skillsArray;
      })(),
      education: app.applicantSnapshot?.education || app.applicationData?.education || [],
      workExperience: app.applicantSnapshot?.workExperience || app.applicationData?.workExperience || [],
      portfolioLinks: (() => {
        // Enhanced portfolio links mapping from multiple sources
        const links = [];
        
        // From application data
        if (app.applicationData?.portfolioLinks) {
          links.push(...app.applicationData.portfolioLinks);
        }
        
        // From applicant snapshot
        if (app.applicantSnapshot?.portfolioLinks) {
          links.push(...app.applicantSnapshot.portfolioLinks);
        }
        
        // Individual social links from applicant snapshot
        if (app.applicantSnapshot?.linkedin_url || app.applicantSnapshot?.linkedinUrl) {
          links.push({
            type: 'LinkedIn',
            url: app.applicantSnapshot.linkedin_url || app.applicantSnapshot.linkedinUrl,
            label: 'LinkedIn Profile'
          });
        }
        
        if (app.applicantSnapshot?.github_url || app.applicantSnapshot?.githubUrl) {
          links.push({
            type: 'GitHub',
            url: app.applicantSnapshot.github_url || app.applicantSnapshot.githubUrl,
            label: 'GitHub Repository'
          });
        }
        
        if (app.applicantSnapshot?.portfolio_url || app.applicantSnapshot?.portfolioUrl) {
          links.push({
            type: 'Portfolio',
            url: app.applicantSnapshot.portfolio_url || app.applicantSnapshot.portfolioUrl,
            label: 'Personal Portfolio'
          });
        }
        
        return links;
      })(),
      status: app.status || 'pending',
      appliedDate: app.appliedAt ? new Date(app.appliedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : app.createdAt ? new Date(app.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Unknown',
      lastActivity: app.updatedAt ? new Date(app.updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '',
      rating: app.rating || 0,
      notes: app.recruiterNotes || '',
      isShortlisted: app.status === 'shortlisted',
      interviewScheduled: false,
      // Enhanced resume URL detection with comprehensive field checking
      resumeUrl: (() => {
        const resumeUrl = app.applicationData?.resumeUrl || 
                         app.applicationData?.resume || 
                         app.resume || 
                         app.resumeUrl || 
                         app.documents?.resumeUrl || 
                         app.documents?.resume || 
                         app.candidateData?.resumeUrl ||
                         app.candidateData?.resume ||
                         app.userProfile?.resumeUrl ||
                         app.userProfile?.resume ||
                         app.profileData?.resumeUrl ||
                         app.profileData?.resume ||
                         app.applicantSnapshot?.resumeUrl ||
                         app.applicantSnapshot?.resume || '';
        
        // Log resume detection for debugging specific candidates
        if (app.applicantSnapshot?.fullName === 'john wick' || app.candidateName === 'john wick') {
          console.log('🔍 Resume detection for john wick:', {
            'app.applicationData?.resumeUrl': app.applicationData?.resumeUrl,
            'app.applicationData?.resume': app.applicationData?.resume,
            'app.resume': app.resume,
            'app.resumeUrl': app.resumeUrl,
            'app.documents?.resumeUrl': app.documents?.resumeUrl,
            'app.documents?.resume': app.documents?.resume,
            'app.candidateData?.resumeUrl': app.candidateData?.resumeUrl,
            'app.candidateData?.resume': app.candidateData?.resume,
            'app.userProfile?.resumeUrl': app.userProfile?.resumeUrl,
            'app.userProfile?.resume': app.userProfile?.resume,
            'app.profileData?.resumeUrl': app.profileData?.resumeUrl,
            'app.profileData?.resume': app.profileData?.resume,
            'app.applicantSnapshot?.resumeUrl': app.applicantSnapshot?.resumeUrl,
            'app.applicantSnapshot?.resume': app.applicantSnapshot?.resume,
            'finalResumeUrl': resumeUrl,
            'fullAppData': app
          });
        }
        
        return resumeUrl;
      })(),
      jobTitle: app.jobSnapshot?.title || app.jobTitle || 'Unknown Position',
      company: app.jobSnapshot?.company || app.companyName || 'Unknown Company',
      // Store original application data for debugging
      originalApplicationData: app
    }));
  }, [applications]);

  // Dropdown handlers
  const toggleDropdown = (candidateId) => {
    setOpenDropdown(openDropdown === candidateId ? null : candidateId);
  };

  const closeDropdown = () => {
    setOpenDropdown(null);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      closeDropdown();
    };

    if (openDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [openDropdown]);

  // Test function for debugging notifications (can be called from browser console)
  window.testNotification = async (candidateId) => {
    console.log('🧪 Testing notification for candidate ID:', candidateId);
    try {
      const result = await sendNotificationToApplicant(candidateId, {
        type: 'test_notification',
        title: 'Test Notification',
        message: 'This is a test notification to verify the system is working.',
        interviewId: 'test-123',
        jobId: 'test-job-456',
        meetingLink: 'https://zoom.us/test',
        actionUrl: '/applicant-dashboard/interviews'
      });
      console.log('🧪 Test notification result:', result);
      alert('Test notification sent! Check console for details.');
    } catch (error) {
      console.error('🧪 Test notification failed:', error);
      alert('Test notification failed! Check console for details.');
    }
  };

  // Notification service function
  const sendNotificationToApplicant = async (applicantId, notificationData) => {
    try {
      if (!applicantId) {
        console.warn('⚠️ No applicant ID provided for notification');
        return null;
      }

      console.log('📨 Sending notification to applicant:', applicantId, notificationData);
      console.log('🔍 Current user sending notification:', currentUser);
      
      const notification = {
        recipientId: applicantId,
        recipientType: 'applicant',
        senderId: currentUser?._id || currentUser?.id,
        senderType: 'recruiter',
        type: notificationData.type,
        title: notificationData.title,
        message: notificationData.message,
        data: {
          interviewId: notificationData.interviewId,
          applicationId: notificationData.applicationId,
          jobId: notificationData.jobId,
          meetingLink: notificationData.meetingLink,
          status: notificationData.status,
          actionUrl: notificationData.actionUrl
        },
        priority: 'high',
        channels: ['in_app', 'email'], // Send both in-app and email notifications
        scheduledFor: new Date().toISOString()
      };
      
      // Create notification using the correct API
      console.log('📧 Creating notification with data:', notification);
      const response = await createNotification(notification);
      console.log('✅ Notification created successfully:', response);
      return response;
    } catch (error) {
      console.error('❌ Failed to send notification:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      // Don't throw error to prevent breaking the main flow
      return null;
    }
  };

  const statusConfig = {
    all: { label: 'All Candidates', color: 'bg-gray-100 text-gray-800', count: candidates.length },
    pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', count: candidates.filter(c => c.status === 'pending').length },
    shortlisted: { label: 'Shortlisted', color: 'bg-blue-100 text-blue-800', count: candidates.filter(c => c.status === 'shortlisted').length },
    interviewed: { label: 'Interviewed', color: 'bg-purple-100 text-purple-800', count: candidates.filter(c => c.status === 'interviewed').length },
    rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800', count: candidates.filter(c => c.status === 'rejected').length }
  };

  const filteredAndSortedCandidates = useMemo(() => {
    let filtered = candidates;
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(candidate => candidate.status === selectedStatus);
    }
    if (searchQuery) {
      filtered = filtered.filter(candidate =>
        candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        candidate.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        candidate.currentRole.toLowerCase().includes(searchQuery.toLowerCase()) ||
        candidate.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    return filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      if (sortBy === 'lastActivity') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }
      return sortOrder === 'asc' ? (aValue > bValue ? 1 : -1) : (aValue < bValue ? 1 : -1);
    });
  }, [selectedStatus, searchQuery, sortBy, sortOrder]);

  const handleCandidateAction = async (action, candidate) => {
    setActionLoading(prev => ({ ...prev, [`${candidate.id}_${action}`]: true }));
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Here you would make actual API calls to update the database
      console.log(`${action} action for candidate:`, candidate);
      
      switch (action) {
        case 'contact':
          alert(`Contacting ${candidate.name} - This would send an email/message`);
          break;
        case 'schedule':
          alert(`Scheduling interview with ${candidate.name} - This would open calendar`);
          break;
        case 'shortlist':
          const handleShortlistCandidate = async (candidate) => {
            setActionLoading(prev => ({ ...prev, [`${candidate.id}_shortlist`]: true }));
            
            try {
              await new Promise(resolve => setTimeout(resolve, 1000));
              
              console.log(`Shortlisting candidate:`, candidate);
              alert(`${candidate.name} has been ${candidate.isShortlisted ? 'removed from' : 'added to'} shortlist!`);
            } catch (error) {
              console.error('Failed to shortlist candidate:', error);
              alert('Failed to update shortlist. Please try again.');
            } finally {
              setActionLoading(prev => ({ ...prev, [`${candidate.id}_shortlist`]: false }));
            }
          };
          handleShortlistCandidate(candidate);
          break;
        case 'reject':
          if (window.confirm(`Are you sure you want to reject ${candidate.name}?`)) {
            alert(`${candidate.name} has been rejected - Database updated`);
          }
          break;
        case 'view':
          alert(`Viewing ${candidate.name}'s detailed profile`);
          break;
        default:
          break;
      }
    } catch (error) {
      console.error(`Failed to ${action} candidate:`, error);
      alert(`Failed to ${action} candidate. Please try again.`);
    } finally {
      setActionLoading(prev => ({ ...prev, [`${candidate.id}_${action}`]: false }));
    }
  };

  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      console.log('🔄 Updating application status:', { applicationId, newStatus });
      const response = await applicationService.updateApplicationStatus(applicationId, newStatus, '');
      console.log('✅ Status update result:', response.data);
      
      // Update local state
      setApplications(prev => prev.map(app => 
        app._id === applicationId 
          ? { ...app, status: newStatus }
          : app
      ));
      
      // Send notification to applicant about status change
      const application = applications.find(app => app._id === applicationId);
      if (application) {
        await sendNotificationToApplicant(application.applicantId, {
          type: 'application_status_updated',
          title: 'Application Status Updated',
          message: `Your application status has been updated to: ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`,
          applicationId: applicationId,
          jobId: application.jobId,
          status: newStatus,
          actionUrl: `/applicant-dashboard/applications`
        });
      }
      
      alert(`✅ Candidate status updated to ${newStatus} - Database updated successfully! Notification sent to candidate.`);
    } catch (error) {
      console.error('❌ Failed to update status:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error occurred';
      alert(`❌ Failed to update status: ${errorMessage}. Please try again.`);
    }
  };

  // Modal handlers
  const handleViewCandidate = (candidate) => {
    console.log('👁️ Opening profile modal for candidate:', candidate.name);
    setProfileModal({ isOpen: true, candidate });
  };

  const handleContactCandidate = (candidate) => {
    console.log('📧 Opening contact modal for candidate:', candidate.name);
    setContactModal({ isOpen: true, candidate });
  };

  const handleScheduleInterview = (candidate) => {
    console.log('📅 Opening schedule modal for candidate:', candidate.name);
    console.log('📋 Candidate data:', {
      id: candidate.id,
      candidateId: candidate.candidateId,
      applicationId: candidate.applicationId,
      name: candidate.name,
      email: candidate.email
    });
    setScheduleModal({ isOpen: true, candidate });
  };

  const handleShortlistCandidate = async (candidate) => {
    try {
      // Toggle shortlist status
      const newStatus = candidate.isShortlisted ? 'pending' : 'shortlisted';
      await applicationService.updateApplicationStatus(candidate.applicationId, newStatus, 'Shortlist status updated by recruiter');
      
      // Update local state
      setApplications(prev => prev.map(app => 
        app._id === candidate.applicationId 
          ? { ...app, status: newStatus }
          : app
      ));
      
      alert(`✅ Candidate ${newStatus === 'shortlisted' ? 'added to' : 'removed from'} shortlist!`);
    } catch (error) {
      console.error('Failed to update shortlist:', error);
      alert('❌ Failed to update shortlist. Please try again.');
    }
  };

  // Email and messaging handlers
  const handleSendEmail = async (emailData) => {
    try {
      const candidate = contactModal.candidate;
      if (!candidate) throw new Error('No candidate selected');
      
      await candidatesAPI.sendEmailToCandidate(candidate.id, emailData);
      alert('✅ Email sent successfully!');
    } catch (error) {
      console.error('Failed to send email:', error);
      throw error;
    }
  };

  const handleOpenMessaging = (candidate) => {
    // Redirect to messaging tab with candidate selected
    alert(`Opening messaging with ${candidate.name}...`);
    // In a real app, this would navigate to the messaging tab
    // or open a messaging interface
  };

  const handleDownloadResume = async (candidate) => {
    setActionLoading(prev => ({ ...prev, [`${candidate.id}_download`]: true }));
    
    try {
      console.log('🔍 Attempting to download resume for:', candidate.name);
      console.log('🔍 Candidate data:', candidate);
      
      // Enhanced resume URL detection with multiple fallbacks
      let resumeUrl = candidate.resumeUrl || 
                     candidate.resume || 
                     candidate.applicationData?.resumeUrl ||
                     candidate.applicationData?.resume ||
                     candidate.documents?.resumeUrl ||
                     candidate.documents?.resume;
      
      let resumeSource = resumeUrl ? 'application' : 'profile';
      
      console.log('🔍 Initial resume URL check:', resumeUrl);
      
      // If no resume in application data, try API-based download first
      if (!resumeUrl && candidate.candidateId) {
        console.log('📄 No resume URL found, trying API download methods...');
        
        // Try the candidatesAPI downloadResume function first
        try {
          console.log('🔍 Trying candidatesAPI.downloadResume...');
          const result = await candidatesAPI.downloadResume(candidate.candidateId, candidate.name, candidate.username);
          if (result.success) {
            console.log('✅ Resume downloaded via API successfully');
            alert(`✅ Resume downloaded successfully for ${candidate.name}`);
            return;
          }
        } catch (apiError) {
          console.log('⚠️ API download failed:', apiError.message);
        }
        
        // If API download fails, try fetching profile data
        try {
          const apiUrl = import.meta.env.VITE_API_URL || 'http://192.168.41.134:5000/api';
          const possibleEndpoints = [
            `${apiUrl}/users/${candidate.candidateId}/profile`,
            `${apiUrl}/users/${candidate.candidateId}`,
            `${apiUrl}/profile/${candidate.candidateId}`,
            `${apiUrl}/applicants/${candidate.candidateId}/profile`,
            `${apiUrl}/candidates/${candidate.candidateId}/profile`,
            `${apiUrl}/applications/${candidate.applicationId || candidate.id}`
          ];
          
          let profileData = null;
          for (const endpoint of possibleEndpoints) {
            try {
              console.log('🔍 Trying endpoint:', endpoint);
              const profileResponse = await fetch(endpoint, {
                headers: {
                  'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
              });
              
              if (profileResponse.ok) {
                profileData = await profileResponse.json();
                console.log('✅ Profile data found:', profileData);
                break;
              } else {
                console.log('❌ Endpoint failed:', endpoint, profileResponse.status);
              }
            } catch (endpointError) {
              console.log('❌ Endpoint error:', endpoint, endpointError.message);
              continue;
            }
          }
          
          if (profileData) {
            // Enhanced resume field detection
            const possibleResumeFields = [
              'resume', 'resumeUrl', 'resume_url',
              'data.resume', 'data.resumeUrl', 'data.resume_url',
              'profile.resume', 'profile.resumeUrl', 'profile.resume_url',
              'documents.resume', 'documents.resumeUrl', 'documents.resume_url',
              'applicationData.resume', 'applicationData.resumeUrl'
            ];
            
            for (const field of possibleResumeFields) {
              const fieldValue = field.split('.').reduce((obj, key) => obj?.[key], profileData);
              if (fieldValue && typeof fieldValue === 'string' && fieldValue.trim()) {
                resumeUrl = fieldValue.trim();
                resumeSource = 'profile';
                console.log('📄 Found resume in profile field:', field, '=', resumeUrl);
                break;
              }
            }
          }
        } catch (profileError) {
          console.error('Failed to fetch profile:', profileError);
        }
      }
      
      if (resumeUrl) {
        // Validate URL format
        let downloadUrl = resumeUrl;
        
        // If it's a relative URL, make it absolute
        if (resumeUrl.startsWith('/')) {
          const baseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://192.168.41.134:5000';
          downloadUrl = `${baseUrl}${resumeUrl}`;
        }
        
        console.log('📄 Final download URL:', downloadUrl);
        
        // Try direct download first
        try {
          const response = await fetch(downloadUrl, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          
          if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${candidate.name.replace(/\s+/g, '_')}_Resume.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            console.log('✅ Resume download completed for:', candidate.name, 'from', resumeSource);
            alert(`✅ Resume downloaded successfully for ${candidate.name}`);
            return;
          }
        } catch (fetchError) {
          console.log('⚠️ Direct fetch failed, trying link method:', fetchError.message);
        }
        
        // Fallback to link method
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `${candidate.name.replace(/\s+/g, '_')}_Resume.pdf`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        console.log('✅ Resume download initiated for:', candidate.name, 'from', resumeSource);
        alert(`✅ Resume download started for ${candidate.name}`);
      } else {
        console.log('❌ No resume found for:', candidate.name);
        console.log('🔍 Candidate fields checked:', {
          resumeUrl: candidate.resumeUrl,
          resume: candidate.resume,
          applicationData: candidate.applicationData,
          documents: candidate.documents,
          candidateId: candidate.candidateId
        });
        
        const message = `❌ No resume found for ${candidate.name}.\n\nPossible solutions:\n• Ask the candidate to upload their resume\n• Check if resume was uploaded during application\n• Contact the candidate directly for their resume`;
        alert(message);
      }
    } catch (error) {
      console.error('❌ Failed to download resume:', error);
      alert('Failed to download resume. Please try again.');
    } finally {
      setActionLoading(prev => ({ ...prev, [`${candidate.id}_download`]: false }));
    }
  };

  // Interview scheduling handlers
  const handleScheduleNewInterview = async (interviewData) => {
    try {
      // Format data for backend API
      const formattedData = {
        candidateId: interviewData.candidateId,
        jobId: interviewData.jobId,
        applicationId: interviewData.applicationId,
        title: interviewData.title || `Interview for ${interviewData.candidateId}`,
        // Handle both datetime and separate date/time formats
        scheduledDate: interviewData.datetime ? 
          new Date(interviewData.datetime).toISOString() : 
          new Date(interviewData.date).toISOString(),
        scheduledTime: interviewData.time,
        duration: parseInt(interviewData.duration) || 60,
        type: interviewData.type || 'video',
        interviewType: interviewData.interviewType || 'screening',
        location: interviewData.location || '',
        meetingLink: interviewData.meetingLink || '',
        description: interviewData.notes || interviewData.description || '',
        round: interviewData.round || 1,
        interviewer: interviewData.interviewer || ''
      };
      
      console.log('📅 Creating interview with data:', formattedData);
      const response = await interviewsAPI.scheduleInterview(formattedData);
      console.log('Interview scheduled:', response.data);
      
      // Send notification to applicant - use multiple sources for candidate ID
      const candidateId = interviewData.candidateId || 
                         interviewData.applicantId || 
                         formattedData.candidateId ||
                         response.data?.candidateId;
      
      console.log('🔍 Full interview data received:', interviewData);
      console.log('🔍 Formatted data sent to API:', formattedData);
      console.log('🔍 API response received:', response.data);
      console.log('🔍 Interview data for notification:', {
        interviewDataCandidateId: interviewData.candidateId,
        interviewDataApplicantId: interviewData.applicantId,
        formattedDataCandidateId: formattedData.candidateId,
        responseDataCandidateId: response.data?.candidateId,
        finalCandidateId: candidateId
      });
      
      if (candidateId) {
        await sendNotificationToApplicant(candidateId, {
          type: 'interview_scheduled',
          title: 'Interview Scheduled',
          message: `Your interview for ${interviewData.jobTitle || 'the position'} has been scheduled for ${new Date(formattedData.scheduledDate).toLocaleDateString()} at ${formattedData.scheduledTime}`,
          interviewId: response.data?.id,
          jobId: interviewData.jobId,
          meetingLink: formattedData.meetingLink,
          actionUrl: `/applicant-dashboard/interviews`
        });
        alert('✅ Interview scheduled successfully! Notification sent to candidate.');
      } else {
        console.warn('⚠️ No candidate ID found for notification');
        alert('✅ Interview scheduled successfully! (Note: Could not send notification - no candidate ID found)');
      }
    } catch (error) {
      console.error('Failed to schedule interview:', error);
      throw error;
    }
  };

  const handleRescheduleInterview = async (interviewId, newDateTime) => {
    try {
      // Extract the correct fields from newDateTime object
      const updateData = {
        // Handle both datetime and separate date/time formats
        scheduledDate: newDateTime.datetime ? 
          new Date(newDateTime.datetime).toISOString() : 
          new Date(newDateTime.date || newDateTime.scheduledDate).toISOString(),
        scheduledTime: newDateTime.time || newDateTime.scheduledTime,
        duration: parseInt(newDateTime.duration) || 60,
        type: newDateTime.type,
        location: newDateTime.location || '',
        meetingLink: newDateTime.meetingLink || '',
        description: newDateTime.notes || newDateTime.description || '',
        interviewer: newDateTime.interviewer || '',
        status: 'rescheduled'
      };
      
      console.log('🔄 Updating interview with data:', updateData);
      
      const response = await interviewsAPI.updateInterview(interviewId, updateData);
      console.log('Interview rescheduled:', response.data);
      
      // Send notification to applicant about reschedule
      const candidateId = newDateTime.candidateId || newDateTime.applicantId || response.data?.candidateId;
      console.log('🔍 Sending reschedule notification to candidate ID:', candidateId);
      await sendNotificationToApplicant(candidateId, {
        type: 'interview_rescheduled',
        title: 'Interview Rescheduled',
        message: `Your interview has been rescheduled to ${new Date(updateData.scheduledDate).toLocaleDateString()} at ${updateData.scheduledTime}`,
        interviewId: interviewId,
        meetingLink: updateData.meetingLink,
        actionUrl: `/applicant-dashboard/interviews`
      });
      
      alert('✅ Interview rescheduled successfully! Notification sent to candidate.');
    } catch (error) {
      console.error('Failed to reschedule interview:', error);
      throw error;
    }
  };

  const handleCancelInterview = async (interviewId) => {
    try {
      const response = await interviewsAPI.cancelInterview(interviewId);
      console.log('Interview cancelled:', response.data);
      
      // Send notification to applicant about cancellation
      const candidateId = response.data?.candidateId || response.data?.applicantId;
      console.log('🔍 Sending cancel notification to candidate ID:', candidateId);
      await sendNotificationToApplicant(candidateId, {
        type: 'interview_cancelled',
        title: 'Interview Cancelled',
        message: `Your scheduled interview has been cancelled. Please check your dashboard for updates.`,
        interviewId: interviewId,
        actionUrl: `/applicant-dashboard/interviews`
      });
      
      alert('✅ Interview cancelled successfully! Notification sent to candidate.');
    } catch (error) {
      console.error('Failed to cancel interview:', error);
      throw error;
    }
  };

  const handleDeleteInterview = async (interviewId) => {
    try {
      if (window.confirm('Are you sure you want to delete this interview? This action cannot be undone.')) {
        const response = await interviewsAPI.deleteInterview(interviewId);
        console.log('Interview deleted:', response.data);
        alert('✅ Interview deleted successfully!');
      }
    } catch (error) {
      console.error('Failed to delete interview:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
    {/* Header */}
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          🎯 Candidate Management
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Manage and track potential candidates
        </p>
      </div>
        <div className="flex space-x-2">
          <motion.button
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
              viewMode === 'table' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setViewMode('table')}
          >
            📋 Table View
          </motion.button>
          <motion.button
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
              viewMode === 'cards' ? 'bg-blue-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setViewMode('cards')}
          >
            📊 Card View
          </motion.button>
        </div>
      </div>

      {/* Status Filters */}
      <div className="flex flex-wrap gap-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
        {Object.entries(statusConfig).map(([status, config]) => (
          <motion.button
            key={status}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              selectedStatus === status ? 'bg-blue-600 text-white shadow-md' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedStatus(status)}
          >
            {config.label}
            <span className="ml-2 px-2 py-1 bg-gray-200 dark:bg-gray-600 text-xs rounded-full">
              {config.count}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Search and Sort */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search candidates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="lastActivity">Last Activity</option>
            <option value="name">Name</option>
            <option value="rating">Rating</option>
            <option value="experience">Experience</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="px-3 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {/* Display */}
      <AnimatePresence mode="wait">
        {viewMode === 'table' ? (
          <motion.div
            key="table"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="bg-white dark:bg-gray-800 rounded-md shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Candidate</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Current Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Experience</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Expected Salary</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Rating</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredAndSortedCandidates.map((candidate, index) => (
                    <motion.tr
                      key={candidate.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-lg">
                              {candidate.avatar}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{candidate.name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{candidate.email}</div>
                            <div className="text-xs text-gray-400 dark:text-gray-500">📍 {candidate.location}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{candidate.currentRole}</div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {candidate.skills.slice(0, 2).map((skill, skillIndex) => (
                            <span key={skillIndex} className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs rounded">
                              {skill}
                            </span>
                          ))}
                          {candidate.skills.length > 2 && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">+{candidate.skills.length - 2}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={candidate.status}
                          onChange={(e) => handleStatusChange(candidate.applicationId, e.target.value)}
                          className={`px-3 py-1 rounded-full text-xs font-medium border-0 ${statusConfig[candidate.status]?.color || statusConfig.pending?.color}`}
                        >
                          <option value="pending">Pending</option>
                          <option value="shortlisted">Shortlisted</option>
                          <option value="interviewed">Interviewed</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{candidate.experience}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{candidate.expectedSalary}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-sm text-gray-900 dark:text-white mr-1">{candidate.rating}</span>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <span key={i} className={`text-xs ${i < Math.floor(candidate.rating) ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}>⭐</span>
                            ))}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <motion.button
                            className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors duration-200"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleViewCandidate(candidate)}
                            title="View Profile"
                          >
                            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </motion.button>
                          
                          <motion.button
                            className="p-2 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors duration-200"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleContactCandidate(candidate)}
                            title="Contact"
                          >
                            <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                          </motion.button>
                          
                          <motion.button
                            className="p-2 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors duration-200 disabled:opacity-50"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDownloadResume(candidate)}
                            disabled={actionLoading[`${candidate.id}_download`]}
                            title="Download Resume"
                          >
                            <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </motion.button>
                          
                          <motion.button
                            className="p-2 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-colors duration-200"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleShortlistCandidate(candidate)}
                            title={candidate.isShortlisted ? 'Remove from Shortlist' : 'Add to Shortlist'}
                          >
                            <svg className="w-5 h-5 text-yellow-600 dark:text-yellow-400" fill={candidate.isShortlisted ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                            </svg>
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        ) : (
        <motion.div
          key="cards"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {filteredAndSortedCandidates.map((candidate, index) => (
            <motion.div
              key={candidate.id}
              className="bg-white dark:bg-gray-800 rounded-md p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -2 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-xl mr-3">
                    {candidate.avatar}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{candidate.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{candidate.currentRole}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <span className="text-sm text-gray-900 dark:text-white mr-1">{candidate.rating}</span>
                  <span className="text-yellow-400">⭐</span>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <span className="mr-4">📍 {candidate.location}</span>
                  <span>⏱️ {candidate.experience}</span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  💰 {candidate.expectedSalary}
                </div>
              </div>

              <div className="mb-4">
                <div className="flex flex-wrap gap-1">
                  {candidate.skills.map((skill, skillIndex) => (
                    <span key={skillIndex} className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs rounded">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <select
                  value={candidate.status}
                  onChange={(e) => handleStatusChange(candidate.applicationId, e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg text-sm font-medium ${statusConfig[candidate.status]?.color || statusConfig.pending?.color}`}
                >
                  <option value="pending">Pending</option>
                  <option value="shortlisted">Shortlisted</option>
                  <option value="interviewed">Interviewed</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <motion.button
                  className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-200 text-sm"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleViewCandidate(candidate)}
                >
                  👁️ View
                </motion.button>
                <motion.button
                  className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors duration-200 text-sm"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleContactCandidate(candidate)}
                >
                  📧 Contact
                </motion.button>
                <motion.button
                  className={`px-3 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors duration-200 text-sm ${actionLoading[`${candidate.id}_download`] ? 'opacity-50' : ''}`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleDownloadResume(candidate)}
                  disabled={actionLoading[`${candidate.id}_download`]}
                >
                  {actionLoading[`${candidate.id}_download`] ? '⏳' : '📄'} Resume
                </motion.button>
                <motion.button
                  className={`px-3 py-2 rounded hover:bg-orange-700 transition-colors duration-200 text-sm ${
                    candidate.isShortlisted 
                      ? 'bg-yellow-600 text-white' 
                      : 'bg-orange-600 text-white'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleShortlistCandidate(candidate)}
                >
                  ⭐ {candidate.isShortlisted ? 'Shortlisted' : 'Shortlist'}
                </motion.button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>

    <div className="text-center text-gray-600 dark:text-gray-400">
      Showing {filteredAndSortedCandidates.length} of {candidates.length} candidates
    </div>

    {/* Modals */}
    <CandidateProfileModal
      candidate={profileModal.candidate}
      isOpen={profileModal.isOpen}
      onClose={() => setProfileModal({ isOpen: false, candidate: null })}
      onContact={handleContactCandidate}
      onSchedule={handleScheduleInterview}
      onShortlist={handleShortlistCandidate}
      onDownloadResume={handleDownloadResume}
    />

    <ContactModal
      candidate={contactModal.candidate}
      isOpen={contactModal.isOpen}
      onClose={() => setContactModal({ isOpen: false, candidate: null })}
      onSendEmail={handleSendEmail}
      onOpenMessaging={handleOpenMessaging}
      currentUser={currentUser}
    />

    <ScheduleModal
      candidate={scheduleModal.candidate}
      isOpen={scheduleModal.isOpen}
      onClose={() => setScheduleModal({ isOpen: false, candidate: null })}
      onScheduleInterview={handleScheduleNewInterview}
      onRescheduleInterview={handleRescheduleInterview}
      onCancelInterview={handleCancelInterview}
      onDeleteInterview={handleDeleteInterview}
    />
  </motion.div>
);
};

export default EnhancedCandidatesTab;
