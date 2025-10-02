import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../contexts/IntegratedThemeContext';
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
  onShortlist,
  onDownloadResume 
}) => {
  const { darkMode } = useTheme();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  
  if (!isOpen || !candidate) return null;

  // Debug logging
  console.log('🔍 CandidateProfileModal received candidate:', candidate);
  console.log('🔍 Candidate skills:', candidate.skills);
  console.log('🔍 Candidate portfolioLinks:', candidate.portfolioLinks);

  const handleDownloadResume = async () => {
    setLoading(true);
    try {
      await onDownloadResume(candidate.id);
    } catch (error) {
      console.error('Failed to download resume:', error);
    } finally {
      setLoading(false);
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
        <div className="flex min-h-full items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={`relative w-full max-w-6xl rounded-2xl shadow-2xl ${
              darkMode ? 'bg-gray-800' : 'bg-white'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={`px-8 py-6 border-b ${
              darkMode ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
                    {candidate.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h2 className={`text-2xl font-bold ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      {candidate.name}
                    </h2>
                    <p className={`text-lg ${
                      darkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {candidate.currentRole}
                    </p>
                    <div className="flex items-center mt-2 space-x-4 text-sm">
                      <div className="flex items-center space-x-1">
                        <MapPinIcon className="w-4 h-4 text-gray-400" />
                        <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                          {candidate.location}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <PhoneIcon className="w-4 h-4 text-gray-400" />
                        <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                          {candidate.phone}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <EnvelopeIcon className="w-4 h-4 text-gray-400" />
                        <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                          {candidate.email}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {/* Quick Actions */}
                  <button
                    onClick={handleDownloadResume}
                    disabled={loading}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    <DocumentArrowDownIcon className="w-4 h-4" />
                    <span>{loading ? 'Downloading...' : 'Download Resume'}</span>
                  </button>

                  <button
                    onClick={() => onContact(candidate)}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <EnvelopeIcon className="w-4 h-4" />
                    <span>Contact</span>
                  </button>

                  <button
                    onClick={() => onSchedule(candidate)}
                    className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <CalendarIcon className="w-4 h-4" />
                    <span>Schedule</span>
                  </button>

                  <button
                    onClick={() => onShortlist(candidate)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                      candidate.isShortlisted
                        ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    <StarIcon className="w-4 h-4" />
                    <span>{candidate.isShortlisted ? 'Shortlisted' : 'Shortlist'}</span>
                  </button>

                  <button
                    onClick={onClose}
                    className={`p-2 rounded-lg transition-colors ${
                      darkMode 
                        ? 'hover:bg-gray-700 text-gray-400' 
                        : 'hover:bg-gray-100 text-gray-500'
                    }`}
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex space-x-1 mt-6">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? 'bg-blue-600 text-white'
                          : darkMode
                          ? 'text-gray-300 hover:bg-gray-700'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Content */}
            <div className="px-8 py-6 max-h-[70vh] overflow-y-auto">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Professional Summary */}
                  <div>
                    <h3 className={`text-lg font-semibold mb-3 ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      Professional Summary
                    </h3>
                    <p className={`leading-relaxed ${
                      darkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {candidate.summary || 'Experienced professional with a strong background in software development and team leadership. Passionate about creating innovative solutions and driving business growth through technology.'}
                    </p>
                  </div>

                  {/* Key Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className={`p-4 rounded-lg ${
                      darkMode ? 'bg-gray-700' : 'bg-gray-50'
                    }`}>
                      <div className="text-2xl font-bold text-blue-600">
                        {candidate.experience || 'Not specified'}
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
                        {candidate.expectedSalary || 'Not specified'}
                      </div>
                      <div className={`text-sm ${
                        darkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        Expected Salary
                      </div>
                    </div>
                    <div className={`p-4 rounded-lg ${
                      darkMode ? 'bg-gray-700' : 'bg-gray-50'
                    }`}>
                      <div className="flex items-center space-x-1">
                        {renderStars(candidate.rating)}
                        <span className="text-2xl font-bold text-yellow-600 ml-2">
                          {candidate.rating}
                        </span>
                      </div>
                      <div className={`text-sm ${
                        darkMode ? 'text-gray-300' : 'text-gray-600'
                      }`}>
                        Overall Rating
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className={`text-sm font-medium ${
                          darkMode ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                          Applied Date:
                        </span>
                        <p className={darkMode ? 'text-white' : 'text-gray-900'}>
                          {candidate.appliedDate || 'Unknown'}
                        </p>
                      </div>
                      <div>
                        <span className={`text-sm font-medium ${
                          darkMode ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                          Current Status:
                        </span>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ml-2 ${
                          candidate.status === 'active' ? 'bg-green-100 text-green-800' :
                          candidate.status === 'interested' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {candidate.status}
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
                  
                  {(Array.isArray(candidate.workExperience) ? candidate.workExperience : [
                    {
                      company: 'Tech Solutions Inc.',
                      position: 'Senior React Developer',
                      duration: '2022 - Present',
                      description: 'Led development of multiple React applications, mentored junior developers, and implemented best practices for code quality and performance.'
                    },
                    {
                      company: 'Digital Innovations Ltd.',
                      position: 'Full Stack Developer',
                      duration: '2020 - 2022',
                      description: 'Developed and maintained web applications using React, Node.js, and MongoDB. Collaborated with cross-functional teams to deliver high-quality software solutions.'
                    }
                  ]).map((exp, index) => (
                    <div key={index} className={`p-6 rounded-lg border ${
                      darkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'
                    }`}>
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className={`text-lg font-semibold ${
                            darkMode ? 'text-white' : 'text-gray-900'
                          }`}>
                            {exp.position}
                          </h4>
                          <p className="text-blue-600 font-medium">{exp.company}</p>
                        </div>
                        <span className={`text-sm ${
                          darkMode ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          {exp.duration}
                        </span>
                      </div>
                      <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                        {exp.description}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'education' && (
                <div className="space-y-6">
                  <h3 className={`text-lg font-semibold ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    Education & Certifications
                  </h3>
                  
                  {(Array.isArray(candidate.education) ? candidate.education : [
                    {
                      degree: 'Bachelor of Technology in Computer Science',
                      institution: 'Indian Institute of Technology',
                      year: '2020',
                      grade: '8.5 CGPA'
                    }
                  ]).map((edu, index) => (
                    <div key={index} className={`p-6 rounded-lg border ${
                      darkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'
                    }`}>
                      <h4 className={`text-lg font-semibold ${
                        darkMode ? 'text-white' : 'text-gray-900'
                      }`}>
                        {edu.degree}
                      </h4>
                      <p className="text-blue-600 font-medium">{edu.institution}</p>
                      <div className="flex justify-between mt-2">
                        <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>
                          {edu.year}
                        </span>
                        <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                          {edu.grade}
                        </span>
                      </div>
                    </div>
                  ))}
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
