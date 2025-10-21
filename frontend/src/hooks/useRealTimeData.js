import { useState, useEffect, useCallback, useRef } from 'react';
import realTimeDataService from '../services/realTimeDataService';
import { useAuth } from '../contexts/AuthContext';

export const useRealTimeData = (dataType = 'dashboard', options = {}) => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const unsubscribeRef = useRef([]);

  const {
    autoRefresh = true,
    refreshInterval = 30000, // 30 seconds
    enableWebSocket = true,
    timeRange = '30d',
    metric = 'all'
  } = options;

  // Initialize WebSocket connection
  useEffect(() => {
    if (enableWebSocket && user) {
      const token = localStorage.getItem('authToken');
      if (token) {
        realTimeDataService.connect(token)
          .then(() => {
            setIsConnected(true);
            setError(null);
          })
          .catch(err => {
            console.error('WebSocket connection failed:', err);
            setError('Real-time connection failed');
            setIsConnected(false);
          });
      }
    }

    return () => {
      if (enableWebSocket) {
        realTimeDataService.disconnect();
        setIsConnected(false);
      }
    };
  }, [enableWebSocket, user]);

  // Fetch data function
  const fetchData = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      let result;
      switch (dataType) {
        case 'dashboard':
          result = await realTimeDataService.getDashboardData(user.role);
          break;
        case 'analytics':
          result = await realTimeDataService.getAnalytics(timeRange, metric);
          break;
        case 'realtime-metrics':
          result = await realTimeDataService.getRealTimeMetrics();
          break;
        default:
          throw new Error(`Unknown data type: ${dataType}`);
      }

      setData(result);
      setLastUpdated(new Date());
    } catch (err) {
      console.error(`Error fetching ${dataType}:`, err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user, dataType, timeRange, metric]);

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Set up real-time subscriptions
  useEffect(() => {
    if (!enableWebSocket || !isConnected) return;

    const subscriptions = [];

    // Subscribe to relevant real-time events based on data type
    if (dataType === 'dashboard') {
      subscriptions.push(
        realTimeDataService.subscribe('dashboard_updated', (newData) => {
          setData(newData);
          setLastUpdated(new Date());
        }),
        realTimeDataService.subscribe('initial_data_received', (newData) => {
          setData(newData);
          setLastUpdated(new Date());
          setLoading(false);
        }),
        realTimeDataService.subscribe('profile_updated', (updateData) => {
          setData(prevData => ({
            ...prevData,
            profile: {
              ...prevData?.profile,
              ...updateData
            }
          }));
          setLastUpdated(new Date());
        }),
        realTimeDataService.subscribe('application_updated', (applicationData) => {
          setData(prevData => {
            if (prevData?.applications) {
              return {
                ...prevData,
                applications: {
                  ...prevData.applications,
                  // Update application stats
                }
              };
            }
            return prevData;
          });
          setLastUpdated(new Date());
        })
      );
    }

    if (dataType === 'analytics') {
      subscriptions.push(
        realTimeDataService.subscribe('job_analytics_updated', (analyticsData) => {
          setData(prevData => ({
            ...prevData,
            ...analyticsData
          }));
          setLastUpdated(new Date());
        })
      );
    }

    // Store unsubscribe functions
    unsubscribeRef.current = subscriptions;

    return () => {
      subscriptions.forEach(unsubscribe => unsubscribe());
      unsubscribeRef.current = [];
    };
  }, [enableWebSocket, isConnected, dataType]);

  // Auto-refresh functionality
  useEffect(() => {
    if (!autoRefresh || enableWebSocket) return;

    const interval = setInterval(() => {
      fetchData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, enableWebSocket, refreshInterval, fetchData]);

  // Manual refresh function
  const refresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  // Update profile completeness
  const updateProfileCompleteness = useCallback(async () => {
    try {
      const result = await realTimeDataService.updateProfileCompleteness();
      
      // Update local data
      setData(prevData => ({
        ...prevData,
        profile: {
          ...prevData?.profile,
          profileCompleteness: result.completeness
        }
      }));
      
      return result;
    } catch (err) {
      console.error('Error updating profile completeness:', err);
      throw err;
    }
  }, []);

  return {
    data,
    loading,
    error,
    isConnected,
    lastUpdated,
    refresh,
    updateProfileCompleteness,
    connectionStatus: realTimeDataService.getConnectionStatus()
  };
};

// Specialized hooks for different data types
export const useDashboardData = (options = {}) => {
  return useRealTimeData('dashboard', options);
};

export const useAnalyticsData = (timeRange = '30d', metric = 'all', options = {}) => {
  return useRealTimeData('analytics', { ...options, timeRange, metric });
};

export const useRealTimeMetrics = (options = {}) => {
  return useRealTimeData('realtime-metrics', options);
};

// Hook for real-time notifications
export const useRealTimeNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const unsubscribe = realTimeDataService.subscribe('notification_received', (notification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    });

    return unsubscribe;
  }, [user]);

  const markAsRead = useCallback((notificationId) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId 
          ? { ...notif, isRead: true }
          : notif
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, isRead: true }))
    );
    setUnreadCount(0);
  }, []);

  const clearNotification = useCallback((notificationId) => {
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
  }, []);

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    clearNotification
  };
};

// Hook for connection status monitoring
export const useConnectionStatus = () => {
  const [status, setStatus] = useState(realTimeDataService.getConnectionStatus());

  useEffect(() => {
    const interval = setInterval(() => {
      setStatus(realTimeDataService.getConnectionStatus());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return status;
};

// Hook for database health monitoring
export const useDatabaseHealth = () => {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const healthData = await realTimeDataService.healthCheck();
        setHealth(healthData);
      } catch (error) {
        setHealth({ status: 'error', error: error.message });
      } finally {
        setLoading(false);
      }
    };

    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return { health, loading };
};
