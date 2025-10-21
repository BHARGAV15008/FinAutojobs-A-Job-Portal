import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';

/**
 * NavigationTest Component
 * 
 * A debug component to test dashboard navigation functionality.
 * This component can be temporarily added to any dashboard to verify navigation works correctly.
 */
const NavigationTest = ({ userRole = 'applicant' }) => {
  const [location, setLocation] = useLocation();
  const [eventLog, setEventLog] = useState([]);
  const [isVisible, setIsVisible] = useState(false);

  // Listen for navigation events
  useEffect(() => {
    const handleNavigationEvent = (event) => {
      const timestamp = new Date().toLocaleTimeString();
      const logEntry = {
        timestamp,
        type: 'dashboardTabChange',
        detail: event.detail
      };
      
      setEventLog(prev => [logEntry, ...prev.slice(0, 9)]); // Keep last 10 events
      console.log('🧪 NavigationTest: Event received:', logEntry);
    };

    window.addEventListener('dashboardTabChange', handleNavigationEvent);
    return () => window.removeEventListener('dashboardTabChange', handleNavigationEvent);
  }, []);

  // Test navigation functions
  const testNavigation = (tabId, jobTabId = null) => {
    const event = new CustomEvent('dashboardTabChange', {
      detail: { tabId, jobTabId, userTab: null, path: `/${userRole}-dashboard/${tabId}` }
    });
    window.dispatchEvent(event);
    
    // Also update URL
    const path = jobTabId ? `/${userRole}-dashboard/${tabId}/${jobTabId}` : `/${userRole}-dashboard/${tabId}`;
    setLocation(path);
  };

  // Test URLs for different roles
  const getTestUrls = () => {
    const baseUrl = `/${userRole}-dashboard`;
    
    switch (userRole) {
      case 'applicant':
        return [
          { label: 'Dashboard', url: baseUrl, tabId: 'dashboard' },
          { label: 'Profile', url: `${baseUrl}/profile`, tabId: 'profile' },
          { label: 'Jobs', url: `${baseUrl}/jobs`, tabId: 'jobs' },
          { label: 'Applications', url: `${baseUrl}/applications`, tabId: 'applications' },
          { label: 'Analytics', url: `${baseUrl}/analytics`, tabId: 'analytics' },
          { label: 'Settings', url: `${baseUrl}/settings`, tabId: 'settings' }
        ];
      
      case 'recruiter':
        return [
          { label: 'Dashboard', url: baseUrl, tabId: 'dashboard' },
          { label: 'Profile', url: `${baseUrl}/profile`, tabId: 'profile' },
          { label: 'Post Job', url: `${baseUrl}/jobs/post`, tabId: 'jobs', jobTabId: 'post' },
          { label: 'Active Jobs', url: `${baseUrl}/jobs/active`, tabId: 'jobs', jobTabId: 'active' },
          { label: 'Draft Jobs', url: `${baseUrl}/jobs/draft`, tabId: 'jobs', jobTabId: 'draft' },
          { label: 'Applicants', url: `${baseUrl}/applicants`, tabId: 'applicants' },
          { label: 'Analytics', url: `${baseUrl}/analytics`, tabId: 'analytics' }
        ];
      
      case 'admin':
        return [
          { label: 'Dashboard', url: baseUrl, tabId: 'dashboard' },
          { label: 'Profile', url: `${baseUrl}/profile`, tabId: 'profile' },
          { label: 'Users', url: `${baseUrl}/users`, tabId: 'users' },
          { label: 'Jobs', url: `${baseUrl}/jobs`, tabId: 'jobs' },
          { label: 'Analytics', url: `${baseUrl}/analytics`, tabId: 'analytics' },
          { label: 'Settings', url: `${baseUrl}/settings`, tabId: 'settings' }
        ];
      
      default:
        return [];
    }
  };

  const testUrls = getTestUrls();

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-purple-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-purple-700 transition-colors z-50"
        title="Open Navigation Test Panel"
      >
        🧪 Nav Test
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-4 w-80 max-h-96 overflow-y-auto z-50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          🧪 Navigation Test
        </h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          ✕
        </button>
      </div>

      {/* Current State */}
      <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="text-sm">
          <div className="font-medium text-gray-900 dark:text-white">Current State:</div>
          <div className="text-gray-600 dark:text-gray-300">Role: {userRole}</div>
          <div className="text-gray-600 dark:text-gray-300 break-all">URL: {location}</div>
        </div>
      </div>

      {/* Test Buttons */}
      <div className="mb-4">
        <div className="text-sm font-medium text-gray-900 dark:text-white mb-2">
          Test Navigation:
        </div>
        <div className="grid grid-cols-2 gap-2">
          {testUrls.map((test) => (
            <button
              key={test.tabId + (test.jobTabId || '')}
              onClick={() => testNavigation(test.tabId, test.jobTabId)}
              className="px-3 py-2 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
              title={`Navigate to ${test.url}`}
            >
              {test.label}
            </button>
          ))}
        </div>
      </div>

      {/* Direct URL Tests */}
      <div className="mb-4">
        <div className="text-sm font-medium text-gray-900 dark:text-white mb-2">
          Direct URL Navigation:
        </div>
        <div className="space-y-1">
          {testUrls.slice(0, 3).map((test) => (
            <button
              key={`url-${test.tabId}`}
              onClick={() => setLocation(test.url)}
              className="w-full text-left px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors break-all"
              title={`Go to ${test.url}`}
            >
              {test.url}
            </button>
          ))}
        </div>
      </div>

      {/* Event Log */}
      <div>
        <div className="text-sm font-medium text-gray-900 dark:text-white mb-2">
          Event Log:
        </div>
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {eventLog.length > 0 ? (
            eventLog.map((log, index) => (
              <div
                key={index}
                className="text-xs p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded border-l-2 border-yellow-400"
              >
                <div className="font-mono text-yellow-800 dark:text-yellow-200">
                  {log.timestamp}
                </div>
                <div className="text-yellow-700 dark:text-yellow-300">
                  Tab: {log.detail.tabId}
                  {log.detail.jobTabId && ` → ${log.detail.jobTabId}`}
                </div>
              </div>
            ))
          ) : (
            <div className="text-xs text-gray-500 dark:text-gray-400 italic">
              No events yet. Try clicking navigation buttons.
            </div>
          )}
        </div>
      </div>

      {/* Status Indicators */}
      <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500 dark:text-gray-400">
            Events: {eventLog.length}
          </span>
          <span className={`px-2 py-1 rounded ${
            eventLog.length > 0 
              ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300' 
              : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
          }`}>
            {eventLog.length > 0 ? '✅ Active' : '⏳ Waiting'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default NavigationTest;
