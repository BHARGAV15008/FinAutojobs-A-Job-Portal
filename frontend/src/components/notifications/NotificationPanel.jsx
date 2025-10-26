import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDashboard } from '../../contexts/RealDashboardContext';
import * as notificationsAPI from '../../api/notifications';

const NotificationPanel = ({ isOpen, onClose, notifications }) => {
  const { isAuthenticated, refreshData } = useDashboard();
  const [loading, setLoading] = useState(false);

  const handleNotificationClick = async (notification) => {
    // Mark as read when clicked
    if (!notification.read) {
      try {
        await notificationsAPI.markAsRead(notification._id || notification.id);
        // Refresh dashboard to update notification status
        if (refreshData) {
          await refreshData();
        }
        console.log('Notification marked as read:', notification.title);
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    }
    
    // Handle notification action (navigate, etc.)
    console.log('Notification clicked:', notification);
  };

  const clearReadNotifications = async () => {
    try {
      setLoading(true);
      // Delete all read notifications
      const readNotifications = notifications.filter(n => n.read);
      for (const notification of readNotifications) {
        await notificationsAPI.deleteNotification(notification._id || notification.id);
      }
      // Refresh dashboard
      if (refreshData) {
        await refreshData();
      }
      console.log('Cleared read notifications');
    } catch (error) {
      console.error('Failed to clear notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'job_application':
      case 'new_application':
      case 'application_received':
      case 'application_update':
        return (
          <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 'interview':
      case 'interview_scheduled':
        return (
          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V6a2 2 0 012-2h4a2 2 0 012 2v1m-6 0h6m-6 0l-1 1v4a2 2 0 01-2 2H9a2 2 0 01-2-2v-4l-1-1m2 0h4a2 2 0 012 2v4a2 2 0 01-2 2h-4a2 2 0 01-2-2V8a2 2 0 012-2z" />
          </svg>
        );
      case 'job_alert':
      case 'new_job_posted':
      case 'job_posted':
      case 'job_update':
        return (
          <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        );
      case 'message':
      case 'new_message':
        return (
          <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        );
      case 'system_alert':
      case 'system_maintenance':
        return (
          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        );
    }
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return 'Unknown time';
    
    try {
      const date = new Date(timestamp);
      const now = new Date();
      const diffInMinutes = Math.floor((now - date) / (1000 * 60));

      if (diffInMinutes < 1) return 'Just now';
      if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
      if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
      if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
      
      // For older notifications, show actual date
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    } catch (error) {
      console.error('Error formatting timestamp:', error);
      return 'Unknown time';
    }
  };

  const formatFullDate = (timestamp) => {
    if (!timestamp) return 'Unknown date';
    
    try {
      const date = new Date(timestamp);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
    } catch (error) {
      return 'Unknown date';
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 bg-gray-600 bg-opacity-50 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            className="fixed right-0 top-0 h-full w-96 bg-white dark:bg-gray-900 shadow-xl z-50 overflow-hidden"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Notifications
              </h2>
              <div className="flex items-center space-x-2">
                {notifications.some(n => n.read) && (
                  <button
                    className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={clearReadNotifications}
                    disabled={loading}
                  >
                    {loading ? 'Clearing...' : 'Clear read'}
                  </button>
                )}
                <button
                  className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
                  onClick={onClose}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Notifications list */}
            <div className="flex-1 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                  <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM4.828 4.828A4 4 0 015.5 4H9v1H5.5a3 3 0 00-2.121.879L4.828 4.828z" />
                  </svg>
                  <p className="text-sm">No notifications yet</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {notifications.map((notification, index) => (
                    <motion.div
                      key={notification._id || notification.id || `notification-${index}`}
                      className={`p-4 cursor-pointer transition-colors duration-200 border-l-4 ${
                        notification.read
                          ? 'bg-gray-50 dark:bg-gray-800/50 border-transparent'
                          : 'bg-white dark:bg-gray-900 hover:bg-blue-50 dark:hover:bg-gray-800 border-blue-500'
                      }`}
                      onClick={() => handleNotificationClick(notification)}
                      whileHover={{ scale: 1.005 }}
                      whileTap={{ scale: 0.995 }}
                      title={formatFullDate(notification.timestamp || notification.createdAt)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className={`text-sm font-semibold line-clamp-2 ${
                              notification.read
                                ? 'text-gray-600 dark:text-gray-400'
                                : 'text-gray-900 dark:text-white'
                            }`}>
                              {notification.title || 'Notification'}
                            </p>
                            {!notification.read && (
                              <div className="w-2.5 h-2.5 bg-blue-500 rounded-full flex-shrink-0 animate-pulse"></div>
                            )}
                          </div>
                          <p className={`text-sm mt-1.5 line-clamp-3 ${
                            notification.read
                              ? 'text-gray-500 dark:text-gray-500'
                              : 'text-gray-700 dark:text-gray-300'
                          }`}>
                            {notification.message || 'No message'}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-xs text-gray-400 dark:text-gray-500">
                              {formatTime(notification.timestamp || notification.createdAt)}
                            </p>
                            {notification.read && (
                              <span className="text-xs text-gray-400 dark:text-gray-600">
                                Read
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <button className="w-full text-center text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium">
                View all notifications
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NotificationPanel;
