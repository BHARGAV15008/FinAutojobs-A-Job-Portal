import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDashboard } from '../../contexts/RealDashboardContext';
import { notificationsAPI } from '../../services/api';

const NotificationSystem = () => {
  const { dashboardData, isAuthenticated } = useDashboard();
  const [visibleNotifications, setVisibleNotifications] = useState([]);
  
  // Get notifications from dashboard data
  const notifications = dashboardData?.notifications || [];
  
  // Only show notifications if authenticated and there are notifications
  useEffect(() => {
    if (isAuthenticated && notifications?.length > 0) {
      // Show new notifications as toast
      notifications.forEach(notification => {
        if (!visibleNotifications.find(n => n.id === notification.id)) {
          showNotification(notification);
        }
      });
    }
  }, [notifications, isAuthenticated]);

  const showNotification = (notification) => {
    setVisibleNotifications(prev => [...prev, notification]);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      removeNotification(notification._id || notification.id);
    }, 5000);
  };

  const removeNotification = (id) => {
    setVisibleNotifications(prev => prev.filter(n => (n._id || n.id) !== id));
  };

  const handleNotificationClick = async (notification) => {
    // Mark as read via API if authenticated
    if (isAuthenticated) {
      try {
        await notificationsAPI.markAsRead(notification._id || notification.id);
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    }
    
    removeNotification(notification._id || notification.id);
    
    // Handle navigation based on notification type
    if (notification.type === 'application_status') {
      window.location.href = '/applications';
    } else if (notification.type === 'new_application') {
      window.location.href = '/candidates';
    } else if (notification.type === 'interview_scheduled') {
      window.location.href = '/interviews';
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'application_status':
        return '📄';
      case 'new_application':
        return '👤';
      case 'interview_scheduled':
        return '📅';
      case 'job_match':
        return '🎯';
      case 'message':
        return '💬';
      default:
        return '🔔';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'application_status':
        return 'from-blue-500 to-blue-600';
      case 'new_application':
        return 'from-green-500 to-green-600';
      case 'interview_scheduled':
        return 'from-purple-500 to-purple-600';
      case 'job_match':
        return 'from-orange-500 to-orange-600';
      case 'message':
        return 'from-pink-500 to-pink-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <AnimatePresence>
        {visibleNotifications.map((notification, index) => (
          <motion.div
            key={`notification-${notification.id || `temp-${index}`}-${index}`}
            initial={{ opacity: 0, x: 300, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.8 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={`bg-gradient-to-r ${getNotificationColor(notification.type)} text-white rounded-lg shadow-lg p-4 max-w-sm cursor-pointer hover:shadow-xl transition-shadow`}
            onClick={() => handleNotificationClick(notification)}
          >
            <div className="flex items-start space-x-3">
              <div className="text-2xl">
                {getNotificationIcon(notification.type)}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-sm mb-1">
                  {notification.title}
                </h4>
                <p className="text-xs opacity-90 line-clamp-2">
                  {notification.message}
                </p>
                <p className="text-xs opacity-75 mt-1">
                  {new Date(notification.createdAt).toLocaleTimeString()}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeNotification(notification.id);
                }}
                className="text-white/80 hover:text-white text-lg leading-none"
              >
                ×
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default NotificationSystem;
