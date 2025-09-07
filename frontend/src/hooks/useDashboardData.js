import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import dashboardService from '../services/dashboardService';

export const useDashboardData = (userRole) => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    if (!user || !userRole) return;

    try {
      setLoading(true);
      setError(null);
      
      const startTime = performance.now();
      let data;

      switch (userRole) {
        case 'jobseeker':
          data = await dashboardService.getApplicantDashboard();
          break;
        case 'employer':
          data = await dashboardService.getRecruiterDashboard();
          break;
        case 'admin':
          data = await dashboardService.getAdminDashboard();
          break;
        default:
          throw new Error('Invalid user role');
      }

      const endTime = performance.now();
      dashboardService.logPerformance(`fetchDashboardData-${userRole}`, endTime - startTime);

      setDashboardData(data);
      setLastUpdated(new Date());
      
      // Cache data in localStorage
      dashboardService.saveToLocalStorage(`dashboard_${userRole}_${user.id}`, {
        data,
        timestamp: new Date().toISOString()
      });
      
    } catch (err) {
      const errorInfo = dashboardService.handleApiError(err);
      setError(errorInfo);
      
      // Try to load cached data if available
      const cachedData = dashboardService.getFromLocalStorage(`dashboard_${userRole}_${user.id}`);
      if (cachedData && cachedData.data) {
        setDashboardData(cachedData.data);
      }
    } finally {
      setLoading(false);
    }
  }, [user, userRole]);

  const refreshData = useCallback(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    fetchDashboardData();
    
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  // Update data when user role changes
  useEffect(() => {
    if (userRole) {
      fetchDashboardData();
    }
  }, [userRole, fetchDashboardData]);

  return {
    dashboardData,
    loading,
    error,
    refreshData,
    lastUpdated,
    userRole
  };
};

export default useDashboardData;
