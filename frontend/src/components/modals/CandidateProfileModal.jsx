import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../contexts/IntegratedThemeContext';
import { candidatesAPI, applicationsAPI, usersAPI } from '../../services/api';
import { 
  XMarkIcon, 
  DocumentArrowDownIcon,
  EnvelopeIcon,
  CalendarIcon,
  StarIcon,
  MapPinIcon,
  PhoneIcon,
  LinkIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

const CandidateProfileModal = ({ 
  candidate, 
  isOpen, 
  onClose, 
  onContact, 
  onSchedule,
  onShortlist,
  onDownloadResume 
}) => {
  const { darkMode } = useTheme();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [detailedCandidate, setDetailedCandidate] = useState(null);
  const [fetchingDetails, setFetchingDetails] = useState(false);
  
  // Fetch detailed candidate data when modal opens
  useEffect(() => {
    let isMounted = true;
    
    const fetchCandidateDetails = async () => {
      setFetchingDetails(true);
      try {
        console.log('🔍 Fetching detailed data for candidate:', candidate.candidateId || candidate.id);
        
        const candidateId = candidate.candidateId || candidate.id;
        if (candidateId) {
          let detailedData = null;
          
          // Try multiple endpoints to get complete candidate data
          const endpoints = [
            () => candidatesAPI.getCandidateProfile(candidateId),
            () => candidatesAPI.getCandidateDetails(candidateId),
            () => applicationsAPI.getApplication(candidate.applicationId || candidate.id),
            () => usersAPI.getUser(candidateId)
          ];
          
          for (const endpoint of endpoints) {
            try {
              console.log('🔍 Trying endpoint for candidate data...');
              const response = await endpoint();
              if (response.data) {
                detailedData = response.data;
                console.log('✅ Successfully fetched detailed candidate data:', detailedData);
                break;
              }
            } catch (endpointError) {
              console.log('⚠️ Endpoint failed, trying next...', endpointError.message);
              continue;
            }
          }
          
          if (detailedData) {
            // Merge with existing candidate data, prioritizing candidate data from parent (which has applicantSnapshot)
            const mergedData = {
              ...detailedData,
              ...candidate,
              // Ensure critical fields are preserved
              id: candidate.id,
              applicationId: candidate.applicationId,
              candidateId: candidateId,
              name: candidate.name || detailedData.fullName || detailedData.firstName + ' ' + detailedData.lastName,
              email: candidate.email || detailedData.email,
              phone: candidate.phone || detailedData.phone,
              // Prioritize candidate data (from applicantSnapshot) over API data
              expectedSalary: candidate.expectedSalary || detailedData.expectedSalary || detailedData.salary || 'Not specified',
              experience: candidate.experience || detailedData.experience || detailedData.yearsOfExperience || 'Not specified',
              currentRole: candidate.currentRole || candidate.currentJobTitle || detailedData.currentRole || detailedData.currentJobTitle || detailedData.position || 'Not specified',
              location: candidate.location || detailedData.location || detailedData.address || detailedData.city || 'Location not specified',
              summary: candidate.summary || candidate.bio || detailedData.summary || detailedData.bio || detailedData.professionalSummary || 'No summary provided',
              qualification: candidate.qualification || detailedData.qualification || detailedData.highestQualification || 'Not specified',
              skills: (candidate.skills && candidate.skills.length > 0) ? candidate.skills : (detailedData.skills || detailedData.technicalSkills || []),
              workExperience: (candidate.workExperience && candidate.workExperience.length > 0) ? candidate.workExperience : (detailedData.workExperience || detailedData.experience || []),
              education: (candidate.education && candidate.education.length > 0) ? candidate.education : (detailedData.education || detailedData.educationHistory || []),
              portfolioLinks: (candidate.portfolioLinks && candidate.portfolioLinks.length > 0) ? candidate.portfolioLinks : (detailedData.portfolioLinks || detailedData.links || []),
              resume: candidate.resumeUrl || detailedData.resume || detailedData.resumeUrl || candidate.resume,
              rating: candidate.rating || detailedData.rating || 0,
              notes: candidate.notes || detailedData.notes || '',
              // Application specific fields
              appliedAt: candidate.appliedAt || detailedData.appliedAt,
              appliedDate: candidate.appliedDate || detailedData.appliedDate,
              status: candidate.status || detailedData.status
            };
            if (isMounted) {
              setDetailedCandidate(mergedData);
            }
          } else {
            // If no detailed data found, use the candidate data passed from parent
            // This data already has all fields properly mapped from applicantSnapshot
            const enhancedCandidate = {
              ...candidate,
              expectedSalary: candidate.expectedSalary || 'Not specified',
              experience: candidate.experience || 'Not specified',
              summary: candidate.summary || candidate.bio || 'No summary provided',
              currentRole: candidate.currentRole || candidate.currentJobTitle || 'Not specified',
              location: candidate.location || 'Location not specified',
              qualification: candidate.qualification || 'Not specified',
              skills: candidate.skills && candidate.skills.length > 0 ? candidate.skills : [],
              workExperience: candidate.workExperience || [],
              education: candidate.education || [],
              portfolioLinks: candidate.portfolioLinks || [],
              rating: candidate.rating || 0,
              notes: candidate.notes || ''
            };
            if (isMounted) {
              setDetailedCandidate(enhancedCandidate);
            }
          }
        }
      } catch (error) {
        console.warn('⚠️ Could not fetch detailed candidate data:', error);
        // Enhanced fallback - use candidate data from parent which has applicantSnapshot fields
        const enhancedCandidate = {
          ...candidate,
          expectedSalary: candidate.expectedSalary || 'Not specified',
          experience: candidate.experience || 'Not specified',
          summary: candidate.summary || candidate.bio || 'No summary provided',
          currentRole: candidate.currentRole || candidate.currentJobTitle || 'Not specified',
          location: candidate.location || 'Location not specified',
          qualification: candidate.qualification || 'Not specified',
          skills: candidate.skills && candidate.skills.length > 0 ? candidate.skills : [],
          workExperience: candidate.workExperience || [],
          education: candidate.education || [],
          portfolioLinks: candidate.portfolioLinks || [],
          rating: candidate.rating || 0,
          notes: candidate.notes || ''
        };
        if (isMounted) {
          setDetailedCandidate(enhancedCandidate);
        }
      } finally {
        if (isMounted) {
          setFetchingDetails(false);
        }
      }
    };

    if (isOpen && candidate) {
      fetchCandidateDetails().catch(error => {
        console.warn('⚠️ Error in fetchCandidateDetails:', error);
      });
    }
    
    return () => {
      isMounted = false;
    };
  }, [isOpen, candidate]);

  if (!isOpen || !candidate) return null;

  // Use detailed candidate data if available, otherwise use basic candidate data
  const displayCandidate = detailedCandidate || candidate;

  // Debug logging
  console.log('🔍 CandidateProfileModal received candidate:', candidate);
  console.log('🔍 Candidate appliedAt:', candidate.appliedAt);
  console.log('🔍 Candidate appliedDate:', candidate.appliedDate);
  console.log('🔍 Detailed candidate data:', detailedCandidate);
  console.log('🔍 Display candidate:', displayCandidate);
  console.log('🔍 Display candidate appliedAt:', displayCandidate.appliedAt);
  console.log('🔍 Display candidate appliedDate:', displayCandidate.appliedDate);

  const handleDownloadResume = async () => {
    console.log('📄 Download Resume clicked for candidate:', candidate.name);
    console.log('📄 onDownloadResume function:', typeof onDownloadResume);
    setLoading(true);
    try {
      if (typeof onDownloadResume === 'function') {
        await onDownloadResume(candidate);
      } else {
        console.error('❌ onDownloadResume is not a function');
        alert('Download function not available');
      }
    } catch (error) {
      console.error('Failed to download resume:', error);
      alert('Failed to download resume: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleContactClick = () => {
    console.log('📧 Contact clicked for candidate:', candidate.name);
    console.log('📧 onContact function:', typeof onContact);
    if (typeof onContact === 'function') {
      onContact(candidate);
    } else {
      console.error('❌ onContact is not a function');
      alert('Contact function not available');
    }
  };

  const handleScheduleClick = () => {
    console.log('📅 Schedule clicked for candidate:', candidate.name);
    console.log('📅 onSchedule function:', typeof onSchedule);
    if (typeof onSchedule === 'function') {
      onSchedule(candidate);
    } else {
      console.error('❌ onSchedule is not a function');
      alert('Schedule function not available');
    }
  };

  const handleShortlistClick = () => {
    console.log('⭐ Shortlist clicked for candidate:', candidate.name);
    console.log('⭐ onShortlist function:', typeof onShortlist);
    if (typeof onShortlist === 'function') {
      onShortlist(candidate);
    } else {
      console.error('❌ onShortlist is not a function');
      alert('Shortlist function not available');
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BriefcaseIcon },
    { id: 'experience', label: 'Experience', icon: ClockIcon },
    { id: 'education', label: 'Education', icon: AcademicCapIcon },
    { id: 'skills', label: 'Skills & Portfolio', icon: StarIcon }
  ];

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <span key={i}>
        {i < rating ? (
          <StarSolidIcon className="w-4 h-4 text-yellow-400" />
        ) : (
          <StarIcon className="w-4 h-4 text-gray-300" />
        )}
      </span>
    ));
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="flex min-h-full items-center justify-center p-2 sm:p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={`relative w-full max-w-[95vw] sm:max-w-[460px] md:max-w-[490px] lg:max-w-[510px] rounded-lg shadow-2xl max-h-[95vh] overflow-hidden ${
              darkMode ? 'bg-gray-800' : 'bg-white'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={`px-3 sm:px-6 lg:px-8 py-4 sm:py-6 border-b ${
              darkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-lg sm:text-xl font-bold flex-shrink-0">
                    {displayCandidate.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className={`text-lg sm:text-xl lg:text-2xl font-bold truncate ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {displayCandidate.name}
                    </h2>
                    <p className={`text-sm sm:text-base lg:text-lg truncate ${
                      darkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {displayCandidate.currentRole || displayCandidate.currentJobTitle || 'Not specified'}
                    </p>
                    <div className="flex flex-col sm:flex-row sm:items-center mt-2 space-y-1 sm:space-y-0 sm:space-x-4 text-xs sm:text-sm">
                      <div className="flex items-center space-x-1">
                        <MapPinIcon className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                        <span className={`truncate ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {displayCandidate.location || displayCandidate.address || 'Not specified'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <PhoneIcon className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                        <span className={`truncate ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {displayCandidate.phone || 'Not specified'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <EnvelopeIcon className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                        <span className={`truncate ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                          {displayCandidate.email || 'Not specified'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  {/* Quick Actions */}
                  <button
                    onClick={handleDownloadResume}
                    disabled={loading}
                    className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-xs sm:text-sm"
                  >
                    <DocumentArrowDownIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">{loading ? 'Downloading...' : 'Download'}</span>
                    <span className="sm:hidden">CV</span>
                  </button>

                  <button
                    onClick={handleContactClick}
                    className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs sm:text-sm"
                  >
                    <EnvelopeIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span>Contact</span>
                  </button>

                  <button
                    onClick={handleScheduleClick}
                    className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-xs sm:text-sm"
                  >
                    <CalendarIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Schedule</span>
                    <span className="sm:hidden">Meet</span>
                  </button>

                  <button
                    onClick={handleShortlistClick}
                    className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 rounded-lg transition-colors text-xs sm:text-sm ${
                      displayCandidate.isShortlisted
                        ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    <StarIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">{displayCandidate.isShortlisted ? 'Shortlisted' : 'Shortlist'}</span>
                    <span className="sm:hidden">★</span>
                  </button>

                  <button
                    onClick={onClose}
                    className={`p-1.5 sm:p-2 rounded-lg transition-colors ${
                      darkMode 
                        ? 'hover:bg-gray-700 text-gray-400' 
                        : 'hover:bg-gray-100 text-gray-500'
                    }`}
                  >
                    <XMarkIcon className="w-4 h-4 sm:w-6 sm:h-6" />
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex flex-wrap gap-1 sm:gap-2 mt-4 sm:mt-6 overflow-x-auto">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg transition-colors whitespace-nowrap text-xs sm:text-sm ${
                        activeTab === tab.id
                          ? 'bg-blue-600 text-white'
                          : darkMode
                          ? 'text-gray-300 hover:bg-gray-700'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">{tab.label}</span>
                      <span className="sm:hidden">
                        {tab.id === 'overview' ? 'Info' : 
                         tab.id === 'experience' ? 'Exp' : 
                         tab.id === 'education' ? 'Edu' : 'Skills'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-3 sm:p-6 lg:p-8 overflow-y-auto max-h-[60vh] sm:max-h-[70vh]">
              {fetchingDetails && (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-3 text-gray-600 dark:text-gray-400">Loading detailed information...</span>
                </div>
              )}
              
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Professional Summary */}
                  <div>
                    <h3 className={`text-lg font-semibold mb-4 ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      Professional Summary
                    </h3>
                    <p className={`leading-relaxed ${
                      darkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {displayCandidate.summary || displayCandidate.bio || 'No summary provided'}
                    </p>
                  </div>

                  {/* Key Metrics */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
                    <div className={`p-4 rounded-lg ${
                      darkMode ? 'bg-gray-700' : 'bg-gray-50'
                    }`}>
                      <div className="text-2xl font-bold text-blue-600">
                        {displayCandidate.experience || 'Not specified'}
                      </div>
                      <div className={`text-sm ${
                        darkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        Years Experience
                      </div>
                    </div>
                    <div className={`p-4 rounded-lg ${
                      darkMode ? 'bg-gray-700' : 'bg-gray-50'
                    }`}>
                      <div className="text-2xl font-bold text-green-600">
                        {displayCandidate.expectedSalary || 'Not specified'}
                      </div>
                      <div className={`text-sm ${
                        darkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        Expected Salary
                      </div>
                    </div>
                  </div>

                  {/* Application Details */}
                  <div>
                    <h3 className={`text-lg font-semibold mb-3 ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      Application Details
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <span className={`text-sm font-medium ${
                          darkMode ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                          Applied Date:
                        </span>
                        <p className={darkMode ? 'text-white' : 'text-gray-900'}>
                          {candidate.appliedAt ? new Date(candidate.appliedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : (candidate.appliedDate || 'Unknown')}
                        </p>
                      </div>
                      <div>
                        <span className={`text-sm font-medium ${
                          darkMode ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                          Current Status:
                        </span>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ml-2 ${
                          displayCandidate.status === 'active' ? 'bg-green-100 text-green-800' :
                          displayCandidate.status === 'interested' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {displayCandidate.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Recruiter Notes */}
                  <div>
                    <h3 className={`text-lg font-semibold mb-3 ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      Internal Notes
                    </h3>
                    <div className={`p-4 rounded-lg border-2 border-dashed ${
                      darkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-50'
                    }`}>
                      <textarea
                        placeholder="Add private notes about this candidate..."
                        className={`w-full h-24 bg-transparent border-none outline-none resize-none ${
                          darkMode ? 'text-gray-300 placeholder-gray-500' : 'text-gray-700 placeholder-gray-400'
                        }`}
                        defaultValue={candidate.notes || ''}
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'experience' && (
                <div className="space-y-6">
                  <h3 className={`text-lg font-semibold ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Work Experience
                  </h3>
                  
                  {candidate.workExperience && candidate.workExperience.length > 0 ? (
                    candidate.workExperience.map((exp, index) => (
                      <div key={index} className={`p-6 rounded-lg border ${
                        darkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'
                      }`}>
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className={`text-lg font-semibold ${
                              darkMode ? 'text-white' : 'text-gray-900'
                            }`}>
                              {exp.jobTitle || exp.position || 'Position Not Specified'}
                            </h4>
                            <p className="text-blue-600 font-medium">{exp.companyName || exp.company || 'Company Not Specified'}</p>
                          </div>
                          <span className={`text-sm ${
                            darkMode ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            {exp.startDate && exp.endDate ? (
                              `${new Date(exp.startDate).getFullYear()} - ${exp.isCurrentJob ? 'Present' : new Date(exp.endDate).getFullYear()}`
                            ) : exp.duration ? (
                              exp.duration
                            ) : (
                              'Duration Not Specified'
                            )}
                          </span>
                        </div>
                        {exp.description && (
                          <p className={`mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                            {exp.description}
                          </p>
                        )}
                        {exp.achievements && exp.achievements.length > 0 && (
                          <div className="mt-3">
                            <p className={`text-sm font-medium mb-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              Key Achievements:
                            </p>
                            <ul className={`list-disc list-inside space-y-1 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                              {exp.achievements.map((achievement, achIndex) => (
                                <li key={achIndex}>{achievement}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className={`p-6 rounded-lg border text-center ${
                      darkMode ? 'border-gray-600 bg-gray-700 text-gray-400' : 'border-gray-200 bg-gray-50 text-gray-500'
                    }`}>
                      No work experience information available
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'education' && (
                <div className="space-y-6">
                  <h3 className={`text-lg font-semibold ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Education & Certifications
                  </h3>
                  
                  {candidate.education && candidate.education.length > 0 ? (
                    candidate.education.map((edu, index) => (
                      <div key={index} className={`p-6 rounded-lg border ${
                        darkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'
                      }`}>
                        <h4 className={`text-lg font-semibold ${
                          darkMode ? 'text-white' : 'text-gray-900'
                        }`}>
                          {edu.degree || 'Degree Not Specified'}
                        </h4>
                        <p className="text-blue-600 font-medium">{edu.institution || 'Institution Not Specified'}</p>
                        {edu.fieldOfStudy && (
                          <p className={`text-sm mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            Field: {edu.fieldOfStudy}
                          </p>
                        )}
                        <div className="flex justify-between mt-2 text-sm">
                          <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                            {edu.startDate && edu.endDate ? (
                              `${new Date(edu.startDate).getFullYear()} - ${edu.isCurrentlyStudying ? 'Present' : new Date(edu.endDate).getFullYear()}`
                            ) : edu.year ? (
                              edu.year
                            ) : (
                              'Dates Not Specified'
                            )}
                          </span>
                          {edu.grade && (
                            <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                              Grade: {edu.grade}
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className={`p-6 rounded-lg border text-center ${
                      darkMode ? 'border-gray-600 bg-gray-700 text-gray-400' : 'border-gray-200 bg-gray-50 text-gray-500'
                    }`}>
                      No education information available
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'skills' && (
                <div className="space-y-6">
                  {/* Skills */}
                  <div>
                    <h3 className={`text-lg font-semibold mb-4 ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      Technical Skills
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {(Array.isArray(candidate.skills) ? candidate.skills : ['React', 'Node.js', 'JavaScript', 'Python', 'MongoDB', 'AWS', 'Docker', 'Git']).map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Portfolio Links */}
                  <div>
                    <h3 className={`text-lg font-semibold mb-4 ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      Portfolio & Links
                    </h3>
                    <div className="space-y-3">
                      {(Array.isArray(candidate.portfolioLinks) ? candidate.portfolioLinks : [
                        { type: 'LinkedIn', url: 'https://linkedin.com/in/candidate', label: 'LinkedIn Profile' },
                        { type: 'GitHub', url: 'https://github.com/candidate', label: 'GitHub Repository' },
                        { type: 'Portfolio', url: 'https://candidate-portfolio.com', label: 'Personal Portfolio' }
                      ]).map((link, index) => (
                        <a
                          key={index}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex items-center space-x-3 p-3 rounded-lg border transition-colors ${
                            darkMode 
                              ? 'border-gray-600 hover:bg-gray-700' 
                              : 'border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <LinkIcon className="w-5 h-5 text-blue-600" />
                          <div>
                            <p className={`font-medium ${
                              darkMode ? 'text-white' : 'text-gray-900'
                            }`}>
                              {link.label}
                            </p>
                            <p className={`text-sm ${
                              darkMode ? 'text-gray-400' : 'text-gray-500'
                            }`}>
                              {link.url}
                            </p>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};

export default CandidateProfileModal;
