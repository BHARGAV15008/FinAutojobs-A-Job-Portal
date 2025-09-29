import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../contexts/IntegratedThemeContext';
import { interviewsAPI, candidatesAPI } from '../../services/api';
import CandidateProfileModal from '../modals/CandidateProfileModal';
import ContactModal from '../modals/ContactModal';
import ScheduleModal from '../modals/ScheduleModal';

const EnhancedInterviewsTab = () => {
  const { darkMode } = useTheme();
  const [viewMode, setViewMode] = useState('table');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('interviewDate');
  const [sortOrder, setSortOrder] = useState('asc');
  const [actionLoading, setActionLoading] = useState({});
  
  // Modal states
  const [profileModal, setProfileModal] = useState({ isOpen: false, candidate: null });
  const [contactModal, setContactModal] = useState({ isOpen: false, candidate: null });
  const [scheduleModal, setScheduleModal] = useState({ isOpen: false, candidate: null });

  // Real interviews data
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch interviews from API
  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        setLoading(true);
        console.log('🔍 Fetching interviews from API...');
        const response = await interviewsAPI.getInterviews();
        console.log('📊 Interviews API response:', response);
        
        if (response.data.success) {
          console.log('✅ Interviews data:', response.data.data);
          setInterviews(response.data.data || []);
        } else {
          console.log('❌ API returned success: false');
          setError('Failed to fetch interviews');
          // Fallback to mock data
          setInterviews(mockInterviews);
        }
      } catch (err) {
        console.error('❌ Error fetching interviews:', err);
        console.log('🔄 Falling back to mock data');
        setError('Failed to load interviews - using mock data');
        // Fallback to mock data for now
        setInterviews(mockInterviews);
      } finally {
        setLoading(false);
      }
    };

    fetchInterviews();
  }, []);

  // Mock interviews data (fallback)
  const mockInterviews = [
    {
      id: 1,
      candidateName: 'Priya Sharma',
      candidateEmail: 'priya.sharma@email.com',
      candidate: {
        id: 1,
        name: 'Priya Sharma',
        email: 'priya.sharma@email.com',
        phone: '+91 9876543211',
        skills: ['React', 'Python', 'Django', 'PostgreSQL'],
        education: [{
          degree: 'MCA',
          institution: 'National Institute of Technology',
          year: '2021',
          grade: '8.5 CGPA'
        }],
        workExperience: [{
          company: 'Digital Solutions Ltd.',
          position: 'Full Stack Developer',
          duration: '2021 - Present',
          description: 'Built web applications using Python Django and React framework.'
        }],
        portfolioLinks: [{
          type: 'GitHub',
          url: 'https://github.com/priya-sharma',
          label: 'GitHub Profile'
        }]
      },
      jobTitle: 'Full Stack Developer',
      interviewType: 'Technical Round',
      interviewDate: '2024-01-30',
      interviewTime: '10:00 AM',
      interviewer: 'John Smith',
      status: 'scheduled',
      round: 1,
      duration: '60 minutes',
      location: 'Video Call',
      notes: 'Focus on React and Node.js skills',
      avatar: '👩‍💻',
      candidatePhone: '+91 9876543211',
      resume: 'priya_sharma_resume.pdf'
    },
    {
      id: 2,
      candidateName: 'Anita Gupta',
      candidateEmail: 'anita.gupta@email.com',
      jobTitle: 'Data Scientist',
      interviewType: 'Final Round',
      interviewDate: '2024-01-29',
      interviewTime: '2:00 PM',
      interviewer: 'Sarah Johnson',
      status: 'completed',
      round: 3,
      duration: '45 minutes',
      location: 'Conference Room A',
      notes: 'Excellent performance, recommended for hire',
      avatar: '👩‍🔬',
      candidatePhone: '+91 9876543215',
      resume: 'anita_gupta_resume.pdf',
      feedback: 'Strong analytical skills, great cultural fit'
    },
    {
      id: 3,
      candidateName: 'Rajesh Kumar',
      candidateEmail: 'rajesh.kumar@email.com',
      jobTitle: 'Senior Frontend Developer',
      interviewType: 'HR Round',
      interviewDate: '2024-01-31',
      interviewTime: '11:30 AM',
      interviewer: 'Mike Wilson',
      status: 'rescheduled',
      round: 2,
      duration: '30 minutes',
      location: 'Video Call',
      notes: 'Candidate requested reschedule due to emergency',
      avatar: '👨‍💻',
      candidatePhone: '+91 9876543210',
      resume: 'rajesh_kumar_resume.pdf'
    }
  ];

  const statusConfig = {
    all: { label: 'All Interviews', color: 'bg-gray-100 text-gray-800', count: interviews.length },
    scheduled: { label: 'Scheduled', color: 'bg-blue-100 text-blue-800', count: interviews.filter(i => i.status === 'scheduled').length },
    completed: { label: 'Completed', color: 'bg-green-100 text-green-800', count: interviews.filter(i => i.status === 'completed').length },
    rescheduled: { label: 'Rescheduled', color: 'bg-yellow-100 text-yellow-800', count: interviews.filter(i => i.status === 'rescheduled').length },
    cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800', count: interviews.filter(i => i.status === 'cancelled').length },
    no_show: { label: 'No Show', color: 'bg-gray-100 text-gray-800', count: interviews.filter(i => i.status === 'no_show').length }
  };

  const filteredAndSortedInterviews = useMemo(() => {
    let filtered = interviews;
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(interview => interview.status === selectedStatus);
    }
    if (searchQuery) {
      filtered = filtered.filter(interview =>
        interview.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        interview.candidateEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
        interview.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        interview.interviewer.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      if (sortBy === 'interviewDate') {
        aValue = new Date(aValue + ' ' + a.interviewTime);
        bValue = new Date(bValue + ' ' + b.interviewTime);
      }
      return sortOrder === 'asc' ? (aValue > bValue ? 1 : -1) : (aValue < bValue ? 1 : -1);
    });
  }, [interviews, selectedStatus, searchQuery, sortBy, sortOrder]);

  // Modal handlers
  const handleViewCandidate = (interview) => {
    setProfileModal({ isOpen: true, candidate: interview.candidate });
  };

  const handleContactCandidate = (interview) => {
    setContactModal({ isOpen: true, candidate: interview.candidate });
  };

  const handleScheduleInterview = (interview) => {
    setScheduleModal({ isOpen: true, candidate: interview.candidate });
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
    alert(`Opening messaging with ${candidate.name}...`);
  };

  const handleDownloadResume = async (candidateId) => {
    try {
      const response = await candidatesAPI.downloadCandidateResume(candidateId);
      
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

  const handleInterviewAction = async (action, interview) => {
    setActionLoading(prev => ({ ...prev, [`${interview.id}_${action}`]: true }));
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log(`${action} action for interview:`, interview);
      
      switch (action) {
        case 'reschedule':
          handleScheduleInterview(interview);
          break;
        case 'cancel':
          if (window.confirm(`Are you sure you want to cancel the interview with ${interview.candidateName}?`)) {
            await handleCancelInterview(interview.id);
          }
          break;
        case 'complete':
          alert(`Marking interview as completed - Feedback form would open`);
          break;
        case 'join':
          if (interview.location === 'Video Call' && interview.meetingLink) {
            window.open(interview.meetingLink, '_blank');
          } else {
            alert(`Joining interview with ${interview.candidateName} - Video call would start`);
          }
          break;
        case 'feedback':
          alert(`Adding feedback for ${interview.candidateName} - Feedback form would open`);
          break;
        case 'view':
          handleViewCandidate(interview);
          break;
        case 'contact':
          handleContactCandidate(interview);
          break;
        default:
          break;
      }
    } catch (error) {
      console.error(`Failed to ${action} interview:`, error);
      alert(`Failed to ${action} interview. Please try again.`);
    } finally {
      setActionLoading(prev => ({ ...prev, [`${interview.id}_${action}`]: false }));
    }
  };

  const handleStatusChange = async (interviewId, newStatus) => {
    try {
      const response = await interviewsAPI.updateInterview(interviewId, { status: newStatus });
      console.log('Status update result:', response.data);
      alert(`✅ Interview status updated to ${newStatus} - Database updated successfully!`);
    } catch (error) {
      console.error('Failed to update status:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error occurred';
      alert(`❌ Failed to update status: ${errorMessage}. Please try again.`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  console.log('🔍 Current interviews state:', { interviews, error, loading });

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
            🗣️ Interview Management
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Schedule and manage candidate interviews
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
            placeholder="Search interviews..."
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
            <option value="interviewDate">Interview Date</option>
            <option value="candidateName">Candidate Name</option>
            <option value="round">Round</option>
            <option value="interviewer">Interviewer</option>
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Job Position</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Interview Details</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Interviewer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredAndSortedInterviews.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center">
                        <div className="text-gray-500 dark:text-gray-400">
                          <p className="text-lg mb-2">📅 No interviews found</p>
                          <p className="text-sm">
                            {error ? `Error: ${error}` : 'No interviews match your current filters.'}
                          </p>
                          <p className="text-xs mt-2">Total interviews in database: {interviews.length}</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredAndSortedInterviews.map((interview, index) => (
                    <motion.tr
                      key={interview.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-lg">
                              {interview.avatar}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{interview.candidateName}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{interview.candidateEmail}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{interview.jobTitle}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">Round {interview.round}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{interview.interviewType}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          📅 {new Date(interview.interviewDate).toLocaleDateString()} at {interview.interviewTime}
                        </div>
                        <div className="text-xs text-gray-400 dark:text-gray-500">
                          ⏱️ {interview.duration} | 📍 {interview.location}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={interview.status}
                          onChange={(e) => handleStatusChange(interview.id, e.target.value)}
                          className={`px-3 py-1 rounded-full text-xs font-medium border-0 ${statusConfig[interview.status]?.color || statusConfig.scheduled.color}`}
                        >
                          <option value="scheduled">Scheduled</option>
                          <option value="completed">Completed</option>
                          <option value="rescheduled">Rescheduled</option>
                          <option value="cancelled">Cancelled</option>
                          <option value="no_show">No Show</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{interview.interviewer}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex flex-wrap gap-1">
                          {interview.status === 'scheduled' && (
                            <>
                              <motion.button
                                className={`px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors duration-200 text-xs ${actionLoading[`${interview.id}_join`] ? 'opacity-50' : ''}`}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleInterviewAction('join', interview)}
                                disabled={actionLoading[`${interview.id}_join`]}
                              >
                                {actionLoading[`${interview.id}_join`] ? '⏳' : '🎥'} Join
                              </motion.button>
                              <motion.button
                                className={`px-2 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors duration-200 text-xs ${actionLoading[`${interview.id}_reschedule`] ? 'opacity-50' : ''}`}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleInterviewAction('reschedule', interview)}
                                disabled={actionLoading[`${interview.id}_reschedule`]}
                              >
                                {actionLoading[`${interview.id}_reschedule`] ? '⏳' : '📅'} Reschedule
                              </motion.button>
                            </>
                          )}
                          {interview.status === 'completed' && (
                            <motion.button
                              className={`px-2 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors duration-200 text-xs ${actionLoading[`${interview.id}_feedback`] ? 'opacity-50' : ''}`}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleInterviewAction('feedback', interview)}
                              disabled={actionLoading[`${interview.id}_feedback`]}
                            >
                              {actionLoading[`${interview.id}_feedback`] ? '⏳' : '📝'} Feedback
                            </motion.button>
                          )}
                          <motion.button
                            className={`px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-200 text-xs ${actionLoading[`${interview.id}_view`] ? 'opacity-50' : ''}`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleInterviewAction('view', interview)}
                            disabled={actionLoading[`${interview.id}_view`]}
                          >
                            {actionLoading[`${interview.id}_view`] ? '⏳' : '👁️'} View
                          </motion.button>
                          <motion.button
                            className={`px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors duration-200 text-xs ${actionLoading[`${interview.id}_contact`] ? 'opacity-50' : ''}`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleInterviewAction('contact', interview)}
                            disabled={actionLoading[`${interview.id}_contact`]}
                          >
                            {actionLoading[`${interview.id}_contact`] ? '⏳' : '📧'} Contact
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  )))}
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
            {filteredAndSortedInterviews.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <div className="text-gray-500 dark:text-gray-400">
                  <p className="text-lg mb-2">📅 No interviews found</p>
                  <p className="text-sm">
                    {error ? `Error: ${error}` : 'No interviews match your current filters.'}
                  </p>
                  <p className="text-xs mt-2">Total interviews in database: {interviews.length}</p>
                </div>
              </div>
            ) : (
              filteredAndSortedInterviews.map((interview, index) => (
              <motion.div
                key={interview.id}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -2 }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-xl mr-3">
                      {interview.avatar}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{interview.candidateName}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{interview.jobTitle}</p>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Round {interview.round}</span>
                </div>

                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">{interview.interviewType}</h4>
                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <div>📅 {new Date(interview.interviewDate).toLocaleDateString()} at {interview.interviewTime}</div>
                    <div>⏱️ {interview.duration}</div>
                    <div>📍 {interview.location}</div>
                    <div>👤 Interviewer: {interview.interviewer}</div>
                  </div>
                </div>

                <div className="mb-4">
                  <select
                    value={interview.status}
                    onChange={(e) => handleStatusChange(interview.id, e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg text-sm font-medium ${statusConfig[interview.status]?.color || statusConfig.scheduled.color}`}
                  >
                    <option value="scheduled">Scheduled</option>
                    <option value="completed">Completed</option>
                    <option value="rescheduled">Rescheduled</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="no_show">No Show</option>
                  </select>
                </div>

                {interview.notes && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 italic">"{interview.notes}"</p>
                  </div>
                )}

                <div className="flex space-x-2">
                  {interview.status === 'scheduled' ? (
                    <>
                      <motion.button
                        className="flex-1 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors duration-200 text-sm"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleInterviewAction('join', interview)}
                      >
                        🎥 Join
                      </motion.button>
                      <motion.button
                        className="flex-1 px-3 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors duration-200 text-sm"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleInterviewAction('reschedule', interview)}
                      >
                        📅 Reschedule
                      </motion.button>
                    </>
                  ) : interview.status === 'completed' ? (
                    <>
                      <motion.button
                        className="flex-1 px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors duration-200 text-sm"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleInterviewAction('feedback', interview)}
                      >
                        📝 Feedback
                      </motion.button>
                      <motion.button
                        className="flex-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-200 text-sm"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleInterviewAction('view', interview)}
                      >
                        👁️ View
                      </motion.button>
                      <motion.button
                        className="flex-1 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors duration-200 text-sm"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleInterviewAction('contact', interview)}
                      >
                        📧 Contact
                      </motion.button>
                    </>
                  ) : (
                    <motion.button
                      className="w-full px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-200 text-sm"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleInterviewAction('view', interview)}
                    >
                      👁️ View Details
                    </motion.button>
                  )}
                </div>
              </motion.div>
            )))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="text-center text-gray-600 dark:text-gray-400">
        Showing {filteredAndSortedInterviews.length} of {interviews.length} interviews
      </div>

      {/* Modals */}
      <CandidateProfileModal
        candidate={profileModal.candidate}
        isOpen={profileModal.isOpen}
        onClose={() => setProfileModal({ isOpen: false, candidate: null })}
        onContact={handleContactCandidate}
        onSchedule={handleScheduleInterview}
        onShortlist={(candidate) => alert(`${candidate.name} shortlisted from interviews tab!`)}
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

export default EnhancedInterviewsTab;
