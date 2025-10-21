import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../../../contexts/IntegratedThemeContext';
import { useAuth } from '../../../../contexts/AuthContext';
import { interviewsAPI, notificationsAPI } from '../../../../services/api';

const ApplicantInterviewsTab = () => {
  const { darkMode } = useTheme();
  const { user } = useAuth();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Fetch interviews for the current applicant
  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        setLoading(true);
        console.log('🔍 Fetching interviews for applicant:', user?.id || user?._id);
        
        const response = await interviewsAPI.getInterviews({
          candidateId: user?.id || user?._id
        });
        
        console.log('✅ Interviews fetched:', response.data);
        setInterviews(response.data?.data || []);
      } catch (error) {
        console.error('❌ Error fetching interviews:', error);
        setError('Failed to load interviews');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchInterviews();
    }
  }, [user]);

  const statusConfig = {
    all: { label: 'All Interviews', color: 'bg-gray-100 text-gray-800', count: interviews.length },
    scheduled: { label: 'Scheduled', color: 'bg-blue-100 text-blue-800', count: interviews.filter(i => i.status === 'scheduled').length },
    completed: { label: 'Completed', color: 'bg-green-100 text-green-800', count: interviews.filter(i => i.status === 'completed').length },
    rescheduled: { label: 'Rescheduled', color: 'bg-orange-100 text-orange-800', count: interviews.filter(i => i.status === 'rescheduled').length },
    cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800', count: interviews.filter(i => i.status === 'cancelled').length }
  };

  const filteredInterviews = interviews.filter(interview => 
    selectedStatus === 'all' || interview.status === selectedStatus
  );

  const handleJoinInterview = (interview) => {
    if (interview.meetingLink) {
      window.open(interview.meetingLink, '_blank');
    } else {
      alert('Meeting link not available. Please contact the recruiter.');
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
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            📅 My Interviews
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            View and manage your scheduled interviews
          </p>
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

      {/* Interviews List */}
      <AnimatePresence mode="wait">
        {filteredInterviews.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-12"
          >
            <div className="text-6xl mb-4">📅</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No interviews found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {selectedStatus === 'all' 
                ? "You don't have any interviews scheduled yet." 
                : `No ${selectedStatus} interviews found.`}
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="interviews"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredInterviews.map((interview, index) => (
              <motion.div
                key={interview.id}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -2 }}
              >
                {/* Interview Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-xl mr-3">
                      📅
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {interview.jobTitle || 'Interview'}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Round {interview.round || 1} • {interview.interviewType || 'General'}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig[interview.status]?.color || statusConfig.scheduled.color}`}>
                    {interview.status?.charAt(0).toUpperCase() + interview.status?.slice(1) || 'Scheduled'}
                  </span>
                </div>

                {/* Interview Details */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <span className="mr-2">📅</span>
                    <span>{new Date(interview.scheduledDate || interview.interviewDate).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <span className="mr-2">⏰</span>
                    <span>{interview.scheduledTime || interview.interviewTime}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <span className="mr-2">⏱️</span>
                    <span>{interview.duration || 60} minutes</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                    <span className="mr-2">👤</span>
                    <span>{interview.interviewer || 'TBD'}</span>
                  </div>
                  {interview.type && (
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                      <span className="mr-2">📍</span>
                      <span>{interview.type === 'video' ? 'Video Call' : interview.type === 'phone' ? 'Phone Call' : interview.location || 'TBD'}</span>
                    </div>
                  )}
                </div>

                {/* Interview Actions */}
                <div className="flex flex-wrap gap-2">
                  {interview.status === 'scheduled' && interview.meetingLink && (
                    <motion.button
                      className="flex-1 px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors duration-200 text-sm"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleJoinInterview(interview)}
                    >
                      🎥 Join Interview
                    </motion.button>
                  )}
                  {interview.status === 'scheduled' && !interview.meetingLink && (
                    <div className="flex-1 px-3 py-2 bg-gray-300 text-gray-600 rounded text-sm text-center">
                      Meeting link pending
                    </div>
                  )}
                  {interview.status === 'completed' && (
                    <div className="flex-1 px-3 py-2 bg-green-100 text-green-800 rounded text-sm text-center">
                      ✅ Completed
                    </div>
                  )}
                  {interview.status === 'cancelled' && (
                    <div className="flex-1 px-3 py-2 bg-red-100 text-red-800 rounded text-sm text-center">
                      ❌ Cancelled
                    </div>
                  )}
                </div>

                {/* Meeting Link Display */}
                {interview.meetingLink && interview.status === 'scheduled' && (
                  <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">Meeting Link:</p>
                    <a 
                      href={interview.meetingLink} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 dark:text-blue-400 hover:underline break-all"
                    >
                      {interview.meetingLink}
                    </a>
                  </div>
                )}

                {/* Interview Notes */}
                {interview.description && (
                  <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Notes:</p>
                    <p className="text-sm text-gray-900 dark:text-white">{interview.description}</p>
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Summary */}
      <div className="text-center text-gray-600 dark:text-gray-400">
        Showing {filteredInterviews.length} of {interviews.length} interviews
      </div>
    </motion.div>
  );
};

export default ApplicantInterviewsTab;
