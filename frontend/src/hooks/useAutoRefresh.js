import { useEffect, useRef } from 'react';
import { useDashboard } from '../contexts/RealDashboardContext';

// Hook to automatically refresh dashboard data at intervals
export const useAutoRefresh = (intervalMs = 120000, enabled = true) => { // Increased to 2 minutes
  const { refreshStats, isAuthenticated } = useDashboard();
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!enabled || !isAuthenticated) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Set up auto-refresh interval
    intervalRef.current = setInterval(() => {
      console.log('🔄 Auto-refreshing dashboard stats...');
      refreshStats();
    }, intervalMs);

    // Cleanup on unmount or dependency change
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [refreshStats, intervalMs, enabled, isAuthenticated]);

  // Manual refresh function
  const manualRefresh = () => {
    console.log('🔄 Manual refresh triggered');
    refreshStats();
  };

  return { manualRefresh };
};

// Hook to refresh stats when specific events occur
export const useEventRefresh = (events = []) => {
  const { refreshStats } = useDashboard();

  useEffect(() => {
    const handleRefresh = () => {
      console.log('🔄 Event-triggered refresh');
      refreshStats();
    };

    // Add event listeners
    events.forEach(event => {
      window.addEventListener(event, handleRefresh);
    });

    // Cleanup
    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleRefresh);
      });
    };
  }, [refreshStats, events]);
};

// Hook to refresh when user becomes active (focus/visibility change)
export const useVisibilityRefresh = () => {
  const { refreshStats, isAuthenticated } = useDashboard();

  useEffect(() => {
    if (!isAuthenticated) return;

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('🔄 Page became visible, refreshing stats...');
        refreshStats();
      }
    };

    const handleFocus = () => {
      console.log('🔄 Window focused, refreshing stats...');
      refreshStats();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [refreshStats, isAuthenticated]);
};

export default {
  useAutoRefresh,
  useEventRefresh,
  useVisibilityRefresh
};
