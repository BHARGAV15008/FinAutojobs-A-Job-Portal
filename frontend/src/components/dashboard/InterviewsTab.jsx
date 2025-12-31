import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';

const InterviewsTab = () => {
  const { user } = useAuth();
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch interviews from API
  useEffect(() => {
    const fetchInterviews = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/interviews', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setInterviews(data.data || []);
        }
      } catch (error) {
        console.error('Error fetching interviews:', error);
        toast.error('Failed to load interviews');
      } finally {
        setLoading(false);
      }
    };
    fetchInterviews();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'rescheduled':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'Technical':
        return '💻';
      case 'HR':
        return '👥';
      case 'System Design':
        return '🏗️';
      case 'Behavioral':
        return '🧠';
      default:
        return '📋';
    }
  };

  const filteredInterviews = filterStatus === 'all' 
    ? interviews 
    : interviews.filter(interview => interview.status === filterStatus);

  const upcomingInterviews = interviews.filter(interview => 
    interview.status === 'scheduled' && new Date(interview.scheduledDate || interview.interviewDate) >= new Date()
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading interviews...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Interviews</h2>
        <div className="flex space-x-3">
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">All Interviews</option>
            <option value="scheduled">Scheduled</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Schedule Interview
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <span className="text-2xl">📅</span>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Scheduled</h3>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {interviews.filter(i => i.status === 'scheduled').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <span className="text-2xl">⏳</span>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">In Progress</h3>
              <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                {interviews.filter(i => i.status === 'in_progress').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
              <span className="text-2xl">✅</span>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Completed</h3>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {interviews.filter(i => i.status === 'completed').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <span className="text-2xl">📊</span>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">This Week</h3>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {upcomingInterviews.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Interviews */}
      {upcomingInterviews.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            🔥 Upcoming Interviews
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingInterviews.slice(0, 2).map((interview) => (
              <div
                key={interview.id}
                className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {interview.candidateName}
                  </h4>
                  <span className="text-sm text-blue-600 dark:text-blue-400">
                    {interview.interviewDate || interview.scheduledDate} at {interview.interviewTime || interview.scheduledTime}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {getTypeIcon(interview.interviewType || interview.type)} {interview.interviewType || interview.type} • Round {interview.round}
                </p>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors">
                    Join Meeting
                  </button>
                  <button className="px-3 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700 transition-colors">
                    Reschedule
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interviews List */}
      <div className="bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            All Interviews
          </h3>
        </div>
        
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {filteredInterviews.length > 0 ? (
            filteredInterviews.map((interview, index) => (
            <motion.div
              key={interview.id}
              className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              onClick={() => setSelectedInterview(interview)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white text-2xl">
                    {getTypeIcon(interview.type)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                        {interview.candidateName}
                      </h4>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(interview.status)}`}>
                        {interview.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      {interview.jobTitle || interview.position} • {interview.interviewType || interview.type} Interview • Round {interview.round}
                    </p>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      📅 {interview.interviewDate || interview.scheduledDate} at {interview.interviewTime || interview.scheduledTime} • ⏱️ {interview.duration} min
                    </p>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      👤 Interviewer: {interview.interviewer}
                    </p>
                    
                    {interview.notes && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 italic mb-2">
                        💭 {interview.notes}
                      </p>
                    )}
                    
                    {interview.feedback && (
                      <p className="text-sm text-green-600 dark:text-green-400 italic">
                        ✅ Feedback: {interview.feedback}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col space-y-2 ml-4">
                  {interview.status === 'scheduled' && (
                    <>
                      <button className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors">
                        Join Meeting
                      </button>
                      <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors">
                        Reschedule
                      </button>
                    </>
                  )}
                  {interview.status === 'completed' && (
                    <button className="px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition-colors">
                      View Feedback
                    </button>
                  )}
                  <button className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors">
                    View Details
                  </button>
                </div>
              </div>
            </motion.div>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📅</div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No interviews scheduled</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {filterStatus === 'all' 
                  ? 'Schedule your first interview to get started' 
                  : `No ${filterStatus.replace('_', ' ')} interviews found`
                }
              </p>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Schedule Interview
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InterviewsTab;
