import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { SOCKET_URL } from '../services/apiConfig';
import { useAuth } from '../contexts/AuthContext';
import { useDashboard } from '../contexts/RealDashboardContext';

let socket = null;

export const useRealTimeNotifications = () => {
  const { user, isAuthenticated } = useAuth();
  const { refreshStats } = useDashboard();
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!isAuthenticated || !user) {
      // Disconnect if not authenticated
      if (socket) {
        socket.disconnect();
        socket = null;
        setIsConnected(false);
      }
      return;
    }

    // Initialize socket connection with better error handling
    if (!socket) {
      console.log('🔌 Initializing WebSocket connection to:', SOCKET_URL);
      socket = io(SOCKET_URL, {
        transports: ['polling', 'websocket'], // Try polling first, then upgrade to websocket
        withCredentials: true,
        timeout: 30000,
        forceNew: false, // Reuse existing connection if available
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        autoConnect: true,
        upgrade: true,
        rememberUpgrade: true
      });

      socket.on('connect', () => {
        // Reduced logging frequency
        if (!isConnected) {
          console.log('🔌 Connected to real-time notifications');
        }
        setIsConnected(true);
        
        // Join user-specific room
        socket.emit('join-user-room', user._id || user.userId);
        
        // Join role-specific room
        socket.emit('join-role-room', user.role);
      });

      socket.on('disconnect', () => {
        // Only log if we were previously connected
        if (isConnected) {
          console.log('🔌 Disconnected from real-time notifications');
        }
        setIsConnected(false);
      });

      socket.on('connect_error', (error) => {
        // Silently handle connection errors to reduce console spam
        setIsConnected(false);
      });

      socket.on('reconnect_failed', () => {
        console.log('🔌 Failed to reconnect to real-time notifications');
        setIsConnected(false);
      });

      // Listen for application status updates
      socket.on('application-status-changed', (data) => {
        console.log('📨 Application status update received:', data);
        
        // Add to local notifications
        setNotifications(prev => [{
          id: Date.now(),
          type: 'application_status_update',
          title: 'Application Status Update',
          message: data.message,
          timestamp: new Date(data.timestamp),
          read: false,
          data: data.application
        }, ...prev]);

        // Refresh dashboard stats
        if (refreshStats) {
          refreshStats();
        }

        // Show browser notification if permission granted
        if (Notification.permission === 'granted') {
          new Notification('Application Status Update', {
            body: data.message,
            icon: '/favicon.ico'
          });
        }
      });

      // Listen for new application notifications (for recruiters)
      socket.on('new-application-received', (data) => {
        console.log('📨 New application notification received:', data);
        
        setNotifications(prev => [{
          id: Date.now(),
          type: 'application_received',
          title: 'New Application Received',
          message: data.message,
          timestamp: new Date(data.timestamp),
          read: false,
          data: data.application
        }, ...prev]);

        // Refresh dashboard stats
        if (refreshStats) {
          refreshStats();
        }

        // Show browser notification
        if (Notification.permission === 'granted') {
          new Notification('New Application Received', {
            body: data.message,
            icon: '/favicon.ico'
          });
        }
      });

      // Listen for new job postings (for applicants)
      socket.on('new-job-posted', (data) => {
        console.log('📨 New job posting notification received:', data);
        
        setNotifications(prev => [{
          id: Date.now(),
          type: 'new_job_posted',
          title: 'New Job Opportunity',
          message: data.message,
          timestamp: new Date(data.timestamp),
          read: false,
          data: data.job
        }, ...prev]);

        // Show browser notification
        if (Notification.permission === 'granted') {
          new Notification('New Job Opportunity', {
            body: data.message,
            icon: '/favicon.ico'
          });
        }
      });

      // Listen for admin notifications
      socket.on('admin-alert', (data) => {
        console.log('📨 Admin alert received:', data);
        
        setNotifications(prev => [{
          id: Date.now(),
          type: 'system_alert',
          title: 'System Alert',
          message: data.message,
          timestamp: new Date(data.timestamp),
          read: false,
          priority: data.type
        }, ...prev]);

        // Show browser notification
        if (Notification.permission === 'granted') {
          new Notification('System Alert', {
            body: data.message,
            icon: '/favicon.ico'
          });
        }
      });

      // Listen for job updates (created, updated, deleted, status changed)
      socket.on('job_updated', (data) => {
        console.log('📨 Job update received:', data);
        
        // Trigger dashboard refresh
        if (refreshStats) {
          refreshStats();
        }

        // Show notification for job updates
        const actionText = {
          created: 'New job posted',
          updated: 'Job updated',
          deleted: 'Job removed',
          status_changed: 'Job status changed'
        }[data.action] || 'Job updated';

        setNotifications(prev => [{
          id: Date.now(),
          type: 'job_update',
          title: actionText,
          message: `${data.job?.title || 'A job'} has been ${data.action}`,
          timestamp: new Date(data.timestamp),
          read: false,
          data: data.job
        }, ...prev]);
      });

      // Listen for application updates
      socket.on('application_updated', (data) => {
        console.log('📨 Application update received:', data);
        
        // Trigger dashboard refresh
        if (refreshStats) {
          refreshStats();
        }

        const actionText = {
          created: 'New application received',
          updated: 'Application updated',
          status_changed: 'Application status changed'
        }[data.action] || 'Application updated';

        setNotifications(prev => [{
          id: Date.now(),
          type: 'application_update',
          title: actionText,
          message: data.application?.jobTitle ? `Application for ${data.application.jobTitle}` : 'Application updated',
          timestamp: new Date(data.timestamp),
          read: false,
          data: data.application
        }, ...prev]);
      });

      // Listen for data refresh signals
      socket.on('data_refresh_needed', (data) => {
        console.log('📨 Data refresh signal received:', data);
        
        // Trigger dashboard refresh
        if (refreshStats) {
          console.log('🔄 Refreshing dashboard data...');
          refreshStats();
        }
      });
    }

    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.disconnect();
        socket = null;
        setIsConnected(false);
      }
    };
  }, [isAuthenticated, user, refreshStats]);

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        console.log('🔔 Notification permission:', permission);
      });
    }
  }, []);

  // Function to emit events
  const emitEvent = (eventName, data) => {
    if (socket && isConnected) {
      socket.emit(eventName, data);
    }
  };

  // Function to clear notifications
  const clearNotifications = () => {
    setNotifications([]);
  };

  // Function to mark notification as read
  const markNotificationAsRead = (notificationId) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, read: true }
          : notif
      )
    );
  };

  return {
    isConnected,
    notifications,
    clearNotifications,
    markNotificationAsRead,
    emitEvent,
    unreadCount: notifications.filter(n => !n.read).length
  };
};

export default useRealTimeNotifications;
