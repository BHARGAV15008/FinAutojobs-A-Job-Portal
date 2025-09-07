import { useState, useEffect, useCallback, useRef } from 'react';
import websocketService from '../services/websocketService';

export const useWebSocket = (token) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState({
    connected: false,
    reconnectAttempts: 0,
    socketId: null
  });
  const [notifications, setNotifications] = useState([]);
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState(new Map());

  const eventHandlersRef = useRef(new Map());

  // Initialize WebSocket connection
  useEffect(() => {
    if (token && !websocketService.isConnected()) {
      websocketService.connect(token);
    }

    return () => {
      if (websocketService.isConnected()) {
        websocketService.disconnect();
      }
    };
  }, [token]);

  // Setup event listeners
  useEffect(() => {
    const handleConnected = (data) => {
      setIsConnected(true);
      setConnectionStatus(websocketService.getConnectionStatus());
      console.log('WebSocket connected:', data);
    };

    const handleDisconnected = (data) => {
      setIsConnected(false);
      setConnectionStatus(websocketService.getConnectionStatus());
      console.log('WebSocket disconnected:', data);
    };

    const handleConnectionError = (data) => {
      console.error('WebSocket connection error:', data);
      setConnectionStatus(websocketService.getConnectionStatus());
      
      // Show user-friendly error notification
      if (data.reconnectAttempts >= data.maxAttempts) {
        setNotifications(prev => [
          {
            id: Date.now(),
            type: 'connection_error',
            title: 'Connection Lost',
            message: 'Unable to connect to real-time services. Some features may not work properly.',
            timestamp: data.timestamp,
            read: false
          },
          ...prev
        ]);
      }
    };

    const handleReconnected = (data) => {
      console.log('WebSocket reconnected:', data);
      setIsConnected(true);
      setConnectionStatus(websocketService.getConnectionStatus());
      
      // Show reconnection success notification
      setNotifications(prev => [
        {
          id: Date.now(),
          type: 'reconnected',
          title: 'Connection Restored',
          message: 'Real-time services are now working properly.',
          timestamp: data.timestamp,
          read: false
        },
        ...prev
      ]);
    };

    const handleMaxReconnectAttemptsReached = (data) => {
      console.error('Max reconnect attempts reached:', data);
      setConnectionStatus(websocketService.getConnectionStatus());
      
      // Show persistent error notification
      setNotifications(prev => [
        {
          id: Date.now(),
          type: 'max_reconnect_reached',
          title: 'Connection Failed',
          message: data.message,
          timestamp: data.timestamp,
          read: false,
          persistent: true
        },
        ...prev
      ]);
    };

    const handleApplicationStatusUpdated = (data) => {
      console.log('Application status updated:', data);
      // You can add custom logic here or let components handle it
    };

    const handleNewJobAlert = (data) => {
      console.log('New job alert:', data);
      // Add to notifications
      setNotifications(prev => [
        {
          id: Date.now(),
          type: 'new_job',
          title: 'New Job Posted',
          message: data.message,
          data: data.job,
          timestamp: data.timestamp,
          read: false
        },
        ...prev
      ]);
    };

    const handleNewJobPostedAdmin = (data) => {
      console.log('New job posted (admin):', data);
      setNotifications(prev => [
        {
          id: Date.now(),
          type: 'admin_new_job',
          title: 'New Job Posted',
          message: `New job posted by ${data.postedBy}`,
          data: data.job,
          timestamp: data.timestamp,
          read: false
        },
        ...prev
      ]);
    };

    const handleNewMessage = (data) => {
      console.log('New message received:', data);
      setMessages(prev => [...prev, data]);
      setNotifications(prev => [
        {
          id: Date.now(),
          type: 'new_message',
          title: 'New Message',
          message: `New message from ${data.senderName}`,
          data: data,
          timestamp: data.timestamp,
          read: false
        },
        ...prev
      ]);
    };

    const handleMessageSent = (data) => {
      console.log('Message sent:', data);
      setMessages(prev => [...prev, data]);
    };

    const handleUserTyping = (data) => {
      console.log('User typing:', data);
      setTypingUsers(prev => {
        const newMap = new Map(prev);
        if (data.isTyping) {
          newMap.set(data.userId, {
            userName: data.userName,
            timestamp: Date.now()
          });
        } else {
          newMap.delete(data.userId);
        }
        return newMap;
      });
    };

    const handleNotification = (data) => {
      console.log('Notification received:', data);
      setNotifications(prev => [
        {
          id: Date.now(),
          type: 'general',
          title: 'Notification',
          message: data.message || 'New notification',
          data: data,
          timestamp: data.timestamp,
          read: false
        },
        ...prev
      ]);
    };

    const handleWSError = (data) => {
      console.error('WebSocket error:', data);
    };

    // Register event handlers
    websocketService.on('ws_connected', handleConnected);
    websocketService.on('disconnected', handleDisconnected);
    websocketService.on('connection_error', handleConnectionError);
    websocketService.on('reconnected', handleReconnected);
    websocketService.on('max_reconnect_attempts_reached', handleMaxReconnectAttemptsReached);
    websocketService.on('application_status_updated', handleApplicationStatusUpdated);
    websocketService.on('new_job_alert', handleNewJobAlert);
    websocketService.on('new_job_posted_admin', handleNewJobPostedAdmin);
    websocketService.on('new_message', handleNewMessage);
    websocketService.on('message_sent', handleMessageSent);
    websocketService.on('user_typing', handleUserTyping);
    websocketService.on('notification', handleNotification);
    websocketService.on('ws_error', handleWSError);

    // Store handlers for cleanup
    eventHandlersRef.current.set('ws_connected', handleConnected);
    eventHandlersRef.current.set('disconnected', handleDisconnected);
    eventHandlersRef.current.set('connection_error', handleConnectionError);
    eventHandlersRef.current.set('reconnected', handleReconnected);
    eventHandlersRef.current.set('max_reconnect_attempts_reached', handleMaxReconnectAttemptsReached);
    eventHandlersRef.current.set('application_status_updated', handleApplicationStatusUpdated);
    eventHandlersRef.current.set('new_job_alert', handleNewJobAlert);
    eventHandlersRef.current.set('new_job_posted_admin', handleNewJobPostedAdmin);
    eventHandlersRef.current.set('new_message', handleNewMessage);
    eventHandlersRef.current.set('message_sent', handleMessageSent);
    eventHandlersRef.current.set('user_typing', handleUserTyping);
    eventHandlersRef.current.set('notification', handleNotification);
    eventHandlersRef.current.set('ws_error', handleWSError);

    // Cleanup
    return () => {
      eventHandlersRef.current.forEach((handler, event) => {
        websocketService.off(event, handler);
      });
      eventHandlersRef.current.clear();
    };
  }, []);

  // Clean up typing indicators periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setTypingUsers(prev => {
        const newMap = new Map();
        prev.forEach((value, key) => {
          // Remove typing indicators older than 3 seconds
          if (now - value.timestamp < 3000) {
            newMap.set(key, value);
          }
        });
        return newMap;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // WebSocket methods
  const joinJobRoom = useCallback((jobId) => {
    websocketService.joinJobRoom(jobId);
  }, []);

  const leaveJobRoom = useCallback((jobId) => {
    websocketService.leaveJobRoom(jobId);
  }, []);

  const updateApplicationStatus = useCallback((applicationId, status, notes = '') => {
    websocketService.updateApplicationStatus(applicationId, status, notes);
  }, []);

  const notifyNewJobPosted = useCallback((jobId) => {
    websocketService.notifyNewJobPosted(jobId);
  }, []);

  const sendMessage = useCallback((recipientId, message, jobId = null) => {
    websocketService.sendMessage(recipientId, message, jobId);
  }, []);

  const startTyping = useCallback((recipientId) => {
    websocketService.startTyping(recipientId);
  }, []);

  const stopTyping = useCallback((recipientId) => {
    websocketService.stopTyping(recipientId);
  }, []);

  const markNotificationAsRead = useCallback((notificationId) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  // Add custom event listener
  const addEventListener = useCallback((event, handler) => {
    websocketService.on(event, handler);
    return () => {
      websocketService.off(event, handler);
    };
  }, []);

  // Manual retry connection
  const retryConnection = useCallback(() => {
    const token = localStorage.getItem('token');
    if (token) {
      websocketService.retryConnection(token);
    }
  }, []);

  // Reset connection state
  const resetConnection = useCallback(() => {
    websocketService.resetConnectionState();
  }, []);

  return {
    isConnected,
    connectionStatus,
    notifications,
    messages,
    typingUsers,
    unreadNotificationsCount: notifications.filter(n => !n.read).length,
    
    // Methods
    joinJobRoom,
    leaveJobRoom,
    updateApplicationStatus,
    notifyNewJobPosted,
    sendMessage,
    startTyping,
    stopTyping,
    markNotificationAsRead,
    clearNotifications,
    clearMessages,
    addEventListener,
    retryConnection,
    resetConnection
  };
};

export default useWebSocket;
