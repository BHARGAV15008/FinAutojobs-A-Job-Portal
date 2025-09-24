import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../contexts/ThemeContext';
import { candidatesAPI, interviewsAPI } from '../../services/api';
import CandidateProfileModal from '../modals/CandidateProfileModal';
import ContactModal from '../modals/ContactModal';
import ScheduleModal from '../modals/ScheduleModal';

const EnhancedCandidatesTab = () => {
  const { darkMode } = useTheme();
  const [viewMode, setViewMode] = useState('table');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('lastActivity');
  const [sortOrder, setSortOrder] = useState('desc');
  const [actionLoading, setActionLoading] = useState({});
  
  // Modal states
  const [profileModal, setProfileModal] = useState({ isOpen: false, candidate: null });
  const [contactModal, setContactModal] = useState({ isOpen: false, candidate: null });
  const [scheduleModal, setScheduleModal] = useState({ isOpen: false, candidate: null });

  // Mock candidates data
  const mockCandidates = [
    {
      id: 1,
      name: 'Sarah Johnson',
      email: 'sarah.johnson@email.com',
      phone: '+91 9876543210',
      currentRole: 'Senior React Developer',
      experience: '6 years',
      location: 'Mumbai, India',
      skills: ['React', 'Node.js', 'TypeScript', 'AWS'],
      education: [{
        degree: 'M.Tech Computer Science',
        institution: 'Indian Institute of Technology',
        year: '2018',
        grade: '8.5 CGPA'
      }],
      workExperience: [{
        company: 'Tech Solutions Inc.',
        position: 'Senior React Developer',
        duration: '2020 - Present',
        description: 'Led development of multiple React applications, mentored junior developers.'
      }],
      portfolioLinks: [{
        type: 'Portfolio',
        url: 'https://sarah-portfolio.com',
        label: 'Personal Portfolio'
      }],
      status: 'active',
      availability: 'Immediate',
      expectedSalary: '₹25-30 LPA',
      lastActivity: '2024-01-28',
      rating: 4.8,
      notes: 'Excellent technical skills, strong leadership potential',
      avatar: '👩‍💻',
      resume: 'sarah_johnson_resume.pdf',
      portfolio: 'https://sarah-portfolio.com'
    },
    {
      id: 2,
      name: 'Arjun Patel',
      email: 'arjun.patel@email.com',
      phone: '+91 9876543211',
      currentRole: 'Full Stack Developer',
      experience: '4 years',
      location: 'Bangalore, India',
      skills: ['Python', 'Django', 'React', 'PostgreSQL'],
      education: [{
        degree: 'B.Tech Information Technology',
        institution: 'National Institute of Technology',
        year: '2020',
        grade: '8.2 CGPA'
      }],
      workExperience: [{
        company: 'Digital Innovations Ltd.',
        position: 'Full Stack Developer',
        duration: '2020 - Present',
        description: 'Developed web applications using Python, Django, and React.'
      }],
      portfolioLinks: [{
        type: 'Portfolio',
        url: 'https://arjun-dev.com',
        label: 'Development Portfolio'
      }],
      status: 'interested',
      availability: '2 weeks notice',
      expectedSalary: '₹18-22 LPA',
      lastActivity: '2024-01-25',
      rating: 4.5,
      notes: 'Good problem solver, team player',
      avatar: '👨‍💻',
      resume: 'arjun_patel_resume.pdf',
      portfolio: 'https://arjun-dev.com'
    }
  ];

  const statusConfig = {
    all: { label: 'All Candidates', color: 'bg-gray-100 text-gray-800', count: mockCandidates.length },
    active: { label: 'Active', color: 'bg-green-100 text-green-800', count: mockCandidates.filter(c => c.status === 'active').length },
    interested: { label: 'Interested', color: 'bg-blue-100 text-blue-800', count: mockCandidates.filter(c => c.status === 'interested').length },
    contacted: { label: 'Contacted', color: 'bg-yellow-100 text-yellow-800', count: mockCandidates.filter(c => c.status === 'contacted').length },
    not_interested: { label: 'Not Interested', color: 'bg-red-100 text-red-800', count: mockCandidates.filter(c => c.status === 'not_interested').length }
  };

  const filteredAndSortedCandidates = useMemo(() => {
    let filtered = mockCandidates;
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
          alert(`${candidate.name} has been shortlisted - Database updated`);
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

  const handleStatusChange = async (candidateId, newStatus) => {
    try {
      const response = await candidatesAPI.updateCandidateStatus(candidateId, newStatus);
      console.log('Status update result:', response.data);
      alert(`✅ Candidate status updated to ${newStatus} - Database updated successfully!`);
    } catch (error) {
      console.error('Failed to update status:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error occurred';
      alert(`❌ Failed to update status: ${errorMessage}. Please try again.`);
    }
  };

  // Modal handlers
  const handleViewCandidate = (candidate) => {
    setProfileModal({ isOpen: true, candidate });
  };

  const handleContactCandidate = (candidate) => {
    setContactModal({ isOpen: true, candidate });
  };

  const handleScheduleInterview = (candidate) => {
    setScheduleModal({ isOpen: true, candidate });
  };

  const handleShortlistCandidate = async (candidate) => {
    try {
      // Toggle shortlist status
      const newStatus = candidate.isShortlisted ? 'active' : 'shortlisted';
      await candidatesAPI.updateCandidateStatus(candidate.id, newStatus, 'Shortlist status updated by recruiter');
      
      // Update local state
      candidate.isShortlisted = !candidate.isShortlisted;
      
      alert(`✅ Candidate ${candidate.isShortlisted ? 'added to' : 'removed from'} shortlist!`);
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

  const handleDownloadResume = async (candidateId) => {
    try {
      const response = await candidatesAPI.downloadCandidateResume(candidateId);
      
      // Handle blob response for file download
      if (response.data instanceof Blob) {
        const url = window.URL.createObjectURL(response.data);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `candidate_${candidateId}_resume.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
      }
      
      alert('✅ Resume downloaded successfully!');
    } catch (error) {
      console.error('Failed to download resume:', error);
      throw error;
    }
  };

  // Interview scheduling handlers
  const handleScheduleNewInterview = async (interviewData) => {
    try {
      const response = await interviewsAPI.scheduleInterview(interviewData);
      console.log('Interview scheduled:', response.data);
      alert('✅ Interview scheduled successfully! Notifications sent to candidate.');
    } catch (error) {
      console.error('Failed to schedule interview:', error);
      throw error;
    }
  };

  const handleRescheduleInterview = async (interviewId, newDateTime) => {
    try {
      const response = await interviewsAPI.updateInterview(interviewId, { 
        scheduled_date: newDateTime 
      });
      console.log('Interview rescheduled:', response.data);
      alert('✅ Interview rescheduled successfully! Notifications sent to candidate.');
    } catch (error) {
      console.error('Failed to reschedule interview:', error);
      throw error;
    }
  };

  const handleCancelInterview = async (interviewId) => {
    try {
      const response = await interviewsAPI.cancelInterview(interviewId);
      console.log('Interview cancelled:', response.data);
      alert('✅ Interview cancelled successfully! Notifications sent to candidate.');
    } catch (error) {
      console.error('Failed to cancel interview:', error);
      throw error;
    }
  };

  return (
    <motion.div
      className="space-y-6"
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
      <div className="flex flex-wrap gap-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
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
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
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
                          onChange={(e) => handleStatusChange(candidate.id, e.target.value)}
                          className={`px-3 py-1 rounded-full text-xs font-medium border-0 ${statusConfig[candidate.status]?.color || statusConfig.active.color}`}
                        >
                          <option value="active">Active</option>
                          <option value="interested">Interested</option>
                          <option value="contacted">Contacted</option>
                          <option value="not_interested">Not Interested</option>
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
                        <div className="flex flex-wrap gap-1">
                          <motion.button
                            className={`px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-200 text-xs ${actionLoading[`${candidate.id}_view`] ? 'opacity-50' : ''}`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleViewCandidate(candidate)}
                          >
                            👁️ View
                          </motion.button>
                          <motion.button
                            className="px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors duration-200 text-xs"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleContactCandidate(candidate)}
                          >
                            📧 Contact
                          </motion.button>
                          <motion.button
                            className="px-2 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors duration-200 text-xs"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleScheduleInterview(candidate)}
                          >
                            📅 Schedule
                          </motion.button>
                          <motion.button
                            className={`px-2 py-1 rounded hover:bg-orange-700 transition-colors duration-200 text-xs ${
                              candidate.isShortlisted 
                                ? 'bg-yellow-600 text-white' 
                                : 'bg-orange-600 text-white'
                            }`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleShortlistCandidate(candidate)}
                          >
                            {actionLoading[`${candidate.id}_shortlist`] ? '⏳' : '⭐'} Shortlist
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
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300"
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
                    onChange={(e) => handleStatusChange(candidate.id, e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg text-sm font-medium ${statusConfig[candidate.status]?.color || statusConfig.active.color}`}
                  >
                    <option value="active">Active</option>
                    <option value="interested">Interested</option>
                    <option value="contacted">Contacted</option>
                    <option value="not_interested">Not Interested</option>
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
                    className="px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors duration-200 text-sm"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleScheduleInterview(candidate)}
                  >
                    📅 Schedule
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
        Showing {filteredAndSortedCandidates.length} of {mockCandidates.length} candidates
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
      />

      <ScheduleModal
        candidate={scheduleModal.candidate}
        isOpen={scheduleModal.isOpen}
        onClose={() => setScheduleModal({ isOpen: false, candidate: null })}
        onScheduleInterview={handleScheduleNewInterview}
        onRescheduleInterview={handleRescheduleInterview}
        onCancelInterview={handleCancelInterview}
      />
    </motion.div>
  );
};

export default EnhancedCandidatesTab;
