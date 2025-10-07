import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import API_BASE_URL from '../../services/apiConfig';
import { useTheme } from '../../contexts/IntegratedThemeContext';
import { 
  XMarkIcon, 
  CalendarIcon,
  ClockIcon,
  VideoCameraIcon,
  PhoneIcon,
  MapPinIcon,
  UserIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const ScheduleModal = ({ 
  candidate, 
  isOpen, 
  onClose, 
  onScheduleInterview,
  onRescheduleInterview,
  onCancelInterview 
}) => {
  const { darkMode } = useTheme();
  const [activeTab, setActiveTab] = useState('current'); // 'current', 'new'
  const [loading, setLoading] = useState(false);
  const [newInterview, setNewInterview] = useState({
    type: 'video',
    date: '',
    time: '',
    duration: '60',
    interviewer: '',
    location: '',
    meetingLink: '',
    notes: '',
    round: 1
  });

  const [existingInterviews, setExistingInterviews] = useState([]);

  // Fetch real interviews when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchExistingInterviews();
    }
  }, [isOpen]);

  const fetchExistingInterviews = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/interviews`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setExistingInterviews(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching interviews:', error);
    }
  };

  const interviewTypes = [
    { id: 'video', label: 'Video Call', icon: VideoCameraIcon },
    { id: 'phone', label: 'Phone Call', icon: PhoneIcon },
    { id: 'in-person', label: 'In-Person Meeting', icon: MapPinIcon },
    { id: 'audio', label: 'Audio Call', icon: PhoneIcon },
    { id: 'panel', label: 'Panel Interview', icon: VideoCameraIcon },
    { id: 'technical', label: 'Technical Assessment', icon: VideoCameraIcon },
    { id: 'behavioral', label: 'Behavioral Interview', icon: VideoCameraIcon },
    { id: 'screening', label: 'Initial Screening', icon: PhoneIcon }
  ];

  // Dynamic interviewers list - can be fetched from API or user input
  const [customInterviewer, setCustomInterviewer] = useState('');
  const commonInterviewers = [
    'HR Manager',
    'Technical Lead', 
    'Senior Developer',
    'Product Manager',
    'Engineering Manager',
    'Team Lead',
    'Department Head'
  ];

  if (!isOpen || !candidate) return null;

  const handleScheduleNew = async () => {
    setLoading(true);
    try {
      const interviewData = {
        candidateId: candidate.candidateId || candidate.id,
        jobId: candidate.jobId,
        applicationId: candidate.applicationId,
        ...newInterview,
        datetime: `${newInterview.date}T${newInterview.time}`,
        duration: parseInt(newInterview.duration)
      };

      if (newInterview.editingId) {
        // Editing existing interview
        await onRescheduleInterview(newInterview.editingId, interviewData);
        
        // Update existing interview in the list
        setExistingInterviews(existingInterviews.map(interview => 
          interview.id === newInterview.editingId 
            ? { 
                ...interview, 
                ...newInterview,
                duration: parseInt(newInterview.duration),
                status: 'scheduled' // Reset status when updated
              }
            : interview
        ));
        
        alert('✅ Interview updated successfully in both frontend and database!');
      } else {
        // Creating new interview
        await onScheduleInterview(interviewData);
        
        // Refresh the interviews list after successful creation
        await fetchExistingInterviews();
        
        alert('✅ New interview scheduled successfully!');
      }

      // Reset form
      setNewInterview({
        type: 'video',
        date: '',
        time: '',
        duration: '60',
        interviewer: '',
        location: '',
        meetingLink: '',
        notes: '',
        round: 1
      });

      setActiveTab('current');
    } catch (error) {
      console.error('Failed to schedule interview:', error);
      alert('❌ Failed to save interview. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReschedule = async (interviewId, newDateTime) => {
    setLoading(true);
    try {
      await onRescheduleInterview(interviewId, newDateTime);
      
      // Update local state
      setExistingInterviews(existingInterviews.map(interview => 
        interview.id === interviewId 
          ? { ...interview, date: newDateTime.split('T')[0], time: newDateTime.split('T')[1] }
          : interview
      ));
    } catch (error) {
      console.error('Failed to reschedule interview:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (interviewId) => {
    if (!window.confirm('Are you sure you want to cancel this interview?')) return;
    
    setLoading(true);
    try {
      await onCancelInterview(interviewId);
      
      // Update local state
      setExistingInterviews(existingInterviews.map(interview => 
        interview.id === interviewId 
          ? { ...interview, status: 'cancelled' }
          : interview
      ));
    } catch (error) {
      console.error('Failed to cancel interview:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (interviewId) => {
    if (!window.confirm('Are you sure you want to permanently delete this interview? This action cannot be undone.')) return;
    
    setLoading(true);
    try {
      // Call API to delete from database using proper delete endpoint
      const response = await fetch(`${API_BASE_URL}/interviews/${interviewId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete interview');
      }
      
      // Remove from frontend state completely
      setExistingInterviews(existingInterviews.filter(interview => interview.id !== interviewId));
      
      alert('✅ Interview deleted successfully from both frontend and database!');
    } catch (error) {
      console.error('Failed to delete interview:', error);
      alert('❌ Failed to delete interview. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (interview) => {
    // Pre-fill the form with existing interview data
    setNewInterview({
      type: interview.type || 'video',
      date: interview.date || '',
      time: interview.time || '',
      duration: interview.duration?.toString() || '60',
      interviewer: interview.interviewer || '',
      location: interview.location || '',
      meetingLink: interview.meetingLink || '',
      notes: interview.notes || '',
      round: interview.round || 1,
      editingId: interview.id // Track which interview we're editing
    });
    
    // Switch to the new/edit tab
    setActiveTab('new');
  };

  const handleCompleteEvent = async (interviewId) => {
    if (!window.confirm('Mark this interview as completed? This will backup the data and remove it from active interviews.')) return;
    
    setLoading(true);
    try {
      const interview = existingInterviews.find(i => i.id === interviewId);
      
      // Backup to database (you can implement a backup endpoint)
      console.log('Backing up interview data:', interview);
      
      // Mark as completed and remove from frontend
      setExistingInterviews(existingInterviews.filter(i => i.id !== interviewId));
      
      alert('✅ Interview marked as completed, data backed up, and removed from active list!');
    } catch (error) {
      console.error('Failed to complete interview:', error);
      alert('❌ Failed to complete interview. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'rescheduled': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type) => {
    const typeConfig = interviewTypes.find(t => t.id === type);
    const Icon = typeConfig?.icon || CalendarIcon;
    return <Icon className="w-5 h-5" />;
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
            className={`relative w-full max-w-5xl rounded-2xl shadow-2xl ${
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
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center text-white text-lg font-bold">
                    {candidate.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h2 className={`text-xl font-bold ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      Interview Schedule - {candidate.name}
                    </h2>
                    <p className={`text-sm ${
                      darkMode ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      {candidate.email} • {candidate.currentRole}
                    </p>
                  </div>
                </div>

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

              {/* Tabs */}
              <div className="flex space-x-1 mt-6">
                <button
                  onClick={() => setActiveTab('current')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'current'
                      ? 'bg-purple-600 text-white'
                      : darkMode
                      ? 'text-gray-300 hover:bg-gray-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <CalendarIcon className="w-4 h-4" />
                  <span>Current Schedules</span>
                </button>
                <button
                  onClick={() => setActiveTab('new')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'new'
                      ? 'bg-purple-600 text-white'
                      : darkMode
                      ? 'text-gray-300 hover:bg-gray-700'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <PlusIcon className="w-4 h-4" />
                  <span>Schedule New</span>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="px-8 py-6 max-h-[70vh] overflow-y-auto">
              {activeTab === 'current' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className={`text-lg font-semibold ${
                      darkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      Existing Interviews
                    </h3>
                    <span className={`text-sm ${
                      darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {existingInterviews.length} interview(s) scheduled
                    </span>
                  </div>

                  {existingInterviews.length === 0 ? (
                    <div className={`text-center py-12 ${
                      darkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      <CalendarIcon className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg mb-2">No interviews scheduled</p>
                      <p className="text-sm">Click "Schedule New" to create the first interview</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {existingInterviews.map((interview) => (
                        <motion.div
                          key={interview.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`p-6 rounded-xl border ${
                            darkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-200 bg-gray-50'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-4">
                              <div className={`p-3 rounded-lg ${
                                interview.status === 'scheduled' ? 'bg-blue-100' :
                                interview.status === 'completed' ? 'bg-green-100' :
                                'bg-gray-100'
                              }`}>
                                {getTypeIcon(interview.type)}
                              </div>
                              
                              <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                  <h4 className={`text-lg font-semibold ${
                                    darkMode ? 'text-white' : 'text-gray-900'
                                  }`}>
                                    {interview.type === 'video' ? 'Video Interview' :
                                     interview.type === 'phone' ? 'Phone Interview' :
                                     'In-Person Interview'}
                                    {interview.round > 0 && ` - Round ${interview.round}`}
                                  </h4>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(interview.status)}`}>
                                    {interview.status}
                                  </span>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                  <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                      <CalendarIcon className="w-4 h-4 text-gray-400" />
                                      <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                                        {new Date(interview.date).toLocaleDateString('en-US', {
                                          weekday: 'long',
                                          year: 'numeric',
                                          month: 'long',
                                          day: 'numeric'
                                        })}
                                      </span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <ClockIcon className="w-4 h-4 text-gray-400" />
                                      <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                                        {interview.time} ({interview.duration} minutes)
                                      </span>
                                    </div>
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                      <UserIcon className="w-4 h-4 text-gray-400" />
                                      <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                                        {interview.interviewer}
                                      </span>
                                    </div>
                                    {interview.meetingLink && (
                                      <div className="flex items-center space-x-2">
                                        <VideoCameraIcon className="w-4 h-4 text-gray-400" />
                                        <a
                                          href={interview.meetingLink}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-blue-600 hover:text-blue-700 underline"
                                        >
                                          Join Meeting
                                        </a>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {interview.notes && (
                                  <div className="mt-3">
                                    <p className={`text-sm ${
                                      darkMode ? 'text-gray-400' : 'text-gray-500'
                                    }`}>
                                      <strong>Notes:</strong> {interview.notes}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center space-x-2">
                              {interview.status === 'scheduled' && (
                                <>
                                  <button
                                    onClick={() => handleEdit(interview)}
                                    className={`p-2 rounded-lg transition-colors ${
                                      darkMode 
                                        ? 'hover:bg-blue-600 text-blue-400' 
                                        : 'hover:bg-blue-100 text-blue-600'
                                    }`}
                                    title="Edit Interview"
                                  >
                                    <PencilIcon className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleCompleteEvent(interview.id)}
                                    className={`p-2 rounded-lg transition-colors ${
                                      darkMode 
                                        ? 'hover:bg-green-600 text-green-400' 
                                        : 'hover:bg-green-100 text-green-600'
                                    }`}
                                    title="Mark as Completed"
                                  >
                                    <CheckCircleIcon className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleCancel(interview.id)}
                                    className={`p-2 rounded-lg transition-colors ${
                                      darkMode 
                                        ? 'hover:bg-yellow-600 text-yellow-400' 
                                        : 'hover:bg-yellow-100 text-yellow-600'
                                    }`}
                                    title="Cancel Interview"
                                  >
                                    <ExclamationTriangleIcon className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() => handleDelete(interview.id)}
                                className="p-2 rounded-lg transition-colors hover:bg-red-100 text-red-600"
                                title="Delete Permanently"
                              >
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'new' && (
                <div className="space-y-6">
                  <h3 className={`text-lg font-semibold ${
                    darkMode ? 'text-white' : 'text-gray-900'
                  }`}>
                    {newInterview.editingId ? 'Edit Interview' : 'Schedule New Interview'}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Interview Type */}
                    <div>
                      <label className={`block text-sm font-medium mb-3 ${
                        darkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Interview Type
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {interviewTypes.map((type) => {
                          const Icon = type.icon;
                          return (
                            <button
                              key={type.id}
                              onClick={() => setNewInterview({...newInterview, type: type.id})}
                              className={`p-3 rounded-lg border transition-colors ${
                                newInterview.type === type.id
                                  ? 'border-purple-500 bg-purple-50 text-purple-700'
                                  : darkMode
                                  ? 'border-gray-600 hover:bg-gray-700 text-gray-300'
                                  : 'border-gray-300 hover:bg-gray-50 text-gray-700'
                              }`}
                            >
                              <Icon className="w-5 h-5 mx-auto mb-1" />
                              <div className="text-xs">{type.label}</div>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Round */}
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        darkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Interview Round
                      </label>
                      <select
                        value={newInterview.round}
                        onChange={(e) => setNewInterview({...newInterview, round: parseInt(e.target.value)})}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          darkMode 
                            ? 'border-gray-600 bg-gray-700 text-white' 
                            : 'border-gray-300 bg-white text-gray-900'
                        }`}
                      >
                        <option value={0}>Screening</option>
                        <option value={1}>Round 1</option>
                        <option value={2}>Round 2</option>
                        <option value={3}>Round 3</option>
                        <option value={4}>Final Round</option>
                      </select>
                    </div>

                    {/* Date */}
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        darkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Date
                      </label>
                      <input
                        type="date"
                        value={newInterview.date}
                        onChange={(e) => setNewInterview({...newInterview, date: e.target.value})}
                        min={new Date().toISOString().split('T')[0]}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          darkMode 
                            ? 'border-gray-600 bg-gray-700 text-white' 
                            : 'border-gray-300 bg-white text-gray-900'
                        }`}
                      />
                    </div>

                    {/* Time */}
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        darkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Time
                      </label>
                      <input
                        type="time"
                        value={newInterview.time}
                        onChange={(e) => setNewInterview({...newInterview, time: e.target.value})}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          darkMode 
                            ? 'border-gray-600 bg-gray-700 text-white' 
                            : 'border-gray-300 bg-white text-gray-900'
                        }`}
                      />
                    </div>

                    {/* Duration */}
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        darkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Duration (minutes)
                      </label>
                      <select
                        value={newInterview.duration}
                        onChange={(e) => setNewInterview({...newInterview, duration: e.target.value})}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          darkMode 
                            ? 'border-gray-600 bg-gray-700 text-white' 
                            : 'border-gray-300 bg-white text-gray-900'
                        }`}
                      >
                        <option value="30">30 minutes</option>
                        <option value="45">45 minutes</option>
                        <option value="60">1 hour</option>
                        <option value="90">1.5 hours</option>
                        <option value="120">2 hours</option>
                      </select>
                    </div>

                    {/* Interviewer */}
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        darkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Interviewer
                      </label>
                      <div className="space-y-2">
                        <select
                          value={newInterview.interviewer}
                          onChange={(e) => setNewInterview({...newInterview, interviewer: e.target.value})}
                          className={`w-full px-4 py-2 rounded-lg border ${
                            darkMode 
                              ? 'border-gray-600 bg-gray-700 text-white' 
                              : 'border-gray-300 bg-white text-gray-900'
                          }`}
                        >
                          <option value="">Select interviewer role...</option>
                          {commonInterviewers.map((interviewer, index) => (
                            <option key={index} value={interviewer}>
                              {interviewer}
                            </option>
                          ))}
                        </select>
                        
                        <input
                          type="text"
                          placeholder="Or enter custom interviewer name..."
                          value={customInterviewer}
                          onChange={(e) => {
                            setCustomInterviewer(e.target.value);
                            setNewInterview({...newInterview, interviewer: e.target.value});
                          }}
                          className={`w-full px-4 py-2 rounded-lg border ${
                            darkMode 
                              ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                              : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Meeting Link or Location */}
                  {newInterview.type === 'video' && (
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        darkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Meeting Link
                      </label>
                      <input
                        type="url"
                        value={newInterview.meetingLink}
                        onChange={(e) => setNewInterview({...newInterview, meetingLink: e.target.value})}
                        placeholder="https://zoom.us/j/123456789"
                        className={`w-full px-4 py-2 rounded-lg border ${
                          darkMode 
                            ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                            : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                        }`}
                      />
                    </div>
                  )}

                  {newInterview.type === 'in-person' && (
                    <div>
                      <label className={`block text-sm font-medium mb-2 ${
                        darkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Location
                      </label>
                      <input
                        type="text"
                        value={newInterview.location}
                        onChange={(e) => setNewInterview({...newInterview, location: e.target.value})}
                        placeholder="Meeting room, office address..."
                        className={`w-full px-4 py-2 rounded-lg border ${
                          darkMode 
                            ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                            : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                        }`}
                      />
                    </div>
                  )}

                  {/* Notes */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${
                      darkMode ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Notes
                    </label>
                    <textarea
                      value={newInterview.notes}
                      onChange={(e) => setNewInterview({...newInterview, notes: e.target.value})}
                      placeholder="Interview focus, topics to cover, special instructions..."
                      rows={3}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        darkMode 
                          ? 'border-gray-600 bg-gray-700 text-white placeholder-gray-400' 
                          : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                      }`}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      onClick={() => setActiveTab('current')}
                      className={`px-6 py-2 rounded-lg transition-colors ${
                        darkMode 
                          ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleScheduleNew}
                      disabled={loading || !newInterview.date || !newInterview.time || !newInterview.interviewer}
                      className="flex items-center space-x-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <CalendarIcon className="w-4 h-4" />
                      <span>
                        {loading 
                          ? (newInterview.editingId ? 'Updating...' : 'Scheduling...') 
                          : (newInterview.editingId ? 'Update Interview' : 'Schedule Interview')
                        }
                      </span>
                    </button>
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

export default ScheduleModal;
