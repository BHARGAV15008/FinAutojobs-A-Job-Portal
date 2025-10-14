import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../../../contexts/IntegratedThemeContext';
import { useAuth } from '../../../../contexts/AuthContext';
import { notificationsAPI } from '../../../../services/api';

const ApplicantNotificationsTab = () => {
  const { darkMode } = useTheme();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState('all');

  // Fetch notifications for the current applicant
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        console.log('🔍 Fetching notifications for applicant:', user?.id || user?._id);
        
        const response = await notificationsAPI.getNotifications({
          recipientId: user?.id || user?._id,
          limit: 50
        });
        
        console.log('✅ Notifications fetched:', response.data);
        setNotifications(response.data?.data || []);
      } catch (error) {
        console.error('❌ Error fetching notifications:', error);
        setError('Failed to load notifications');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const markAsRead = async (notificationId) => {
    try {
      await notificationsAPI.markAsRead(notificationId);
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId 
            ? { ...notif, isRead: true }
            : notif
        )
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead();
      setNotifications(prev => 
        prev.map(notif => ({ ...notif, isRead: true }))
      );
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'interview_scheduled': return '📅';
      case 'interview_rescheduled': return '🔄';
      case 'interview_cancelled': return '❌';
      case 'application_status_updated': return '📋';
      case 'job_match': return '🎯';
      case 'message_received': return '💬';
      default: return '🔔';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'interview_scheduled': return 'bg-blue-100 text-blue-800';
      case 'interview_rescheduled': return 'bg-orange-100 text-orange-800';
      case 'interview_cancelled': return 'bg-red-100 text-red-800';
      case 'application_status_updated': return 'bg-green-100 text-green-800';
      case 'job_match': return 'bg-purple-100 text-purple-800';
      case 'message_received': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'unread') return !notification.isRead;
    if (selectedFilter === 'read') return notification.isRead;
    return notification.type === selectedFilter;
  });

  const filterOptions = [
    { value: 'all', label: 'All Notifications', count: notifications.length },
    { value: 'unread', label: 'Unread', count: notifications.filter(n => !n.isRead).length },
    { value: 'interview_scheduled', label: 'Interviews', count: notifications.filter(n => n.type?.includes('interview')).length },
    { value: 'application_status_updated', label: 'Applications', count: notifications.filter(n => n.type === 'application_status_updated').length }
  ];

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
            🔔 Notifications
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Stay updated with your application progress
          </p>
        </div>
        {notifications.some(n => !n.isRead) && (
          <motion.button
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={markAllAsRead}
          >
            Mark All as Read
          </motion.button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
        {filterOptions.map((filter) => (
          <motion.button
            key={filter.value}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              selectedFilter === filter.value ? 'bg-blue-600 text-white shadow-md' : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedFilter(filter.value)}
          >
            {filter.label}
            <span className="ml-2 px-2 py-1 bg-gray-200 dark:bg-gray-600 text-xs rounded-full">
              {filter.count}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Notifications List */}
      <AnimatePresence mode="wait">
        {filteredNotifications.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-12"
          >
            <div className="text-6xl mb-4">🔔</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No notifications found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {selectedFilter === 'all' 
                ? "You don't have any notifications yet." 
                : `No ${selectedFilter} notifications found.`}
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="notifications"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {filteredNotifications.map((notification, index) => (
              <motion.div
                key={notification.id}
                className={`bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border-l-4 transition-all duration-300 cursor-pointer ${
                  notification.isRead 
                    ? 'border-gray-300 dark:border-gray-600' 
                    : 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                }`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                whileHover={{ x: 5 }}
                onClick={() => !notification.isRead && markAsRead(notification.id)}
              >
                <div className="flex items-start space-x-4">
                  {/* Notification Icon */}
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-lg ${getNotificationColor(notification.type)}`}>
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Notification Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className={`text-lg font-semibold ${notification.isRead ? 'text-gray-700 dark:text-gray-300' : 'text-gray-900 dark:text-white'}`}>
                        {notification.title}
                      </h4>
                      <div className="flex items-center space-x-2">
                        {!notification.isRead && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                        )}
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(notification.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    <p className={`text-sm mb-3 ${notification.isRead ? 'text-gray-600 dark:text-gray-400' : 'text-gray-800 dark:text-gray-200'}`}>
                      {notification.message}
                    </p>

                    {/* Action Button */}
                    {notification.data?.actionUrl && (
                      <motion.a
                        href={notification.data.actionUrl}
                        className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        View Details →
                      </motion.a>
                    )}

                    {/* Meeting Link for Interview Notifications */}
                    {notification.data?.meetingLink && (
                      <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <p className="text-xs text-green-600 dark:text-green-400 mb-1">Meeting Link:</p>
                        <a 
                          href={notification.data.meetingLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm text-green-600 dark:text-green-400 hover:underline break-all"
                        >
                          {notification.data.meetingLink}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Summary */}
      <div className="text-center text-gray-600 dark:text-gray-400">
        Showing {filteredNotifications.length} of {notifications.length} notifications
      </div>
    </motion.div>
  );
};

export default ApplicantNotificationsTab;
