import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import { useTheme } from '../../contexts/IntegratedThemeContext';
import { useAuth } from '../../contexts/AuthContext.jsx';

const DashboardSidebar = ({ userRole, user, sidebarOpen, setSidebarOpen, activeTab, activeJobTab }) => {
  const [location, setLocation] = useLocation();
  const { darkMode } = useTheme();
  const { logout } = useAuth();
  const [expandedMenus, setExpandedMenus] = useState({});

  // Helper function to check if a path is currently active
  const isPathActive = (path, tabId) => {
    // Use activeTab prop if available for more accurate detection
    if (activeTab && tabId) {
      return activeTab === tabId;
    }
    
    if (path === `/${userRole}-dashboard`) {
      return (location === `/${userRole}-dashboard` || location === '/') && (!activeTab || activeTab === 'dashboard');
    }
    
    // Handle dashboard internal tabs
    if (path === '/jobs' && userRole === 'recruiter') {
      return activeTab === 'jobs' || location === `/${userRole}-dashboard/jobs` || location.includes('/jobs');
    }
    if (path === '/applicants' && userRole === 'recruiter') {
      return activeTab === 'applicants' || location === `/${userRole}-dashboard/applicants` || location.includes('/applicants');
    }
    if (path === '/analytics' && userRole === 'recruiter') {
      return activeTab === 'analytics' || location === `/${userRole}-dashboard/analytics` || location.includes('/analytics');
    }
    if (path === '/messages' && userRole === 'recruiter') {
      return activeTab === 'messages' || location === `/${userRole}-dashboard/messages` || location.includes('/messages');
    }
    if (path === '/settings' && userRole === 'recruiter') {
      return activeTab === 'settings' || location === `/${userRole}-dashboard/settings` || location.includes('/settings');
    }
    if (path === '/profile' && userRole === 'recruiter') {
      return activeTab === 'profile' || location === `/${userRole}-dashboard/profile` || location.includes('/profile');
    }
    
    return location === path || location.startsWith(path + '/');
  };

  // Navigation items based on user role
  const getNavigationItems = () => {
    const commonItems = [
      {
        name: 'Dashboard',
        emoji: '📊',
        icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z',
        path: `/${userRole}-dashboard`,
        tabId: 'dashboard',
        current: isPathActive(`/${userRole}-dashboard`, 'dashboard')
      }
    ];

    switch (userRole) {
      case 'applicant':
        return [
          ...commonItems,
          {
            name: 'Profile',
            emoji: '👤',
            icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
            path: `/profile`,
            current: isPathActive('/profile')
          },
          {
            name: 'Browse Jobs',
            emoji: '💼',
            icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v2a2 2 0 01-2 2H10a2 2 0 01-2-2V6',
            path: `/jobs`,
            current: isPathActive('/jobs'),
            submenu: [
              { name: 'All Jobs', emoji: '🔍', path: `/jobs` },
              { name: 'Recommended', emoji: '⭐', path: `/recommended` },
              { name: 'Favorites', emoji: '❤️', path: `/favorites` }
            ]
          },
          {
            name: 'Applications',
            emoji: '📄',
            icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
            path: `/applications`,
            current: isPathActive('/applications')
          },
          {
            name: 'Resume Builder',
            emoji: '📝',
            icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
            path: `/resume`,
            current: isPathActive('/resume')
          },
          {
            name: 'Job Alerts',
            emoji: '🔔',
            icon: 'M15 17h5l-5 5v-5zM4.828 4.828A4 4 0 015.5 4H9v1H5.5a3 3 0 00-2.121.879L4.828 4.828z',
            path: `/job-alerts`,
            current: isPathActive('/job-alerts')
          },
          {
            name: 'Analytics',
            emoji: '📈',
            icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
            path: `/analytics`,
            current: isPathActive('/analytics')
          },
          {
            name: 'Settings',
            emoji: '⚙️',
            icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
            path: `/settings`,
            current: isPathActive('/settings')
          }
        ];

      case 'recruiter':
        return [
          ...commonItems,
          {
            name: 'Profile',
            emoji: '👤',
            icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
            path: `/profile`,
            tabId: 'profile',
            current: isPathActive('/profile', 'profile')
          },
          {
            name: 'Job Management',
            emoji: '💼',
            icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v2a2 2 0 01-2 2H10a2 2 0 01-2-2V6',
            path: `/jobs`,
            tabId: 'jobs',
            current: isPathActive('/jobs', 'jobs'),
            submenu: [
              { name: 'Post New Job', emoji: '➕', path: `/jobs`, tabId: 'jobs', jobTabId: 'post', current: activeTab === 'jobs' && activeJobTab === 'post' },
              { name: 'Active Jobs', emoji: '🟢', path: `/active-jobs`, tabId: 'jobs', jobTabId: 'active', current: activeTab === 'jobs' && activeJobTab === 'active' },
              { name: 'Draft Jobs', emoji: '📝', path: `/draft-jobs`, tabId: 'jobs', jobTabId: 'draft', current: activeTab === 'jobs' && activeJobTab === 'draft' },
              { name: 'Closed Jobs', emoji: '🔒', path: `/closed-jobs`, tabId: 'jobs', jobTabId: 'closed', current: activeTab === 'jobs' && activeJobTab === 'closed' }
            ]
          },
          {
            name: 'Applicant Management',
            emoji: '👥',
            icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z',
            path: `/applicants`,
            tabId: 'applicants',
            current: isPathActive('/applicants', 'applicants'),
            submenu: [
              { name: 'All Applications', emoji: '📋', path: `/applicants`, tabId: 'applicants', current: isPathActive('/applicants', 'applicants') },
              { name: 'Candidates', emoji: '🎯', path: `/candidates`, tabId: 'candidates', current: isPathActive('/candidates', 'candidates') },
              { name: 'Interviews', emoji: '🗣️', path: `/interviews`, tabId: 'interviews', current: isPathActive('/interviews', 'interviews') },
              { name: 'Reports', emoji: '📊', path: `/reports`, tabId: 'reports', current: isPathActive('/reports', 'reports') }
            ]
          },
          {
            name: 'Analytics',
            emoji: '📈',
            icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
            path: `/analytics`,
            tabId: 'analytics',
            current: isPathActive('/analytics', 'analytics')
          },
          {
            name: 'Messages',
            emoji: '💬',
            icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
            path: `/messages`,
            tabId: 'messages',
            current: isPathActive('/messages', 'messages')
          },
          {
            name: 'Settings',
            emoji: '⚙️',
            icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
            path: `/settings`,
            tabId: 'settings',
            current: isPathActive('/settings', 'settings')
          }
        ];

      case 'admin':
        return [
          ...commonItems,
          {
            name: 'Profile',
            emoji: '👤',
            icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
            path: `/profile`,
            current: isPathActive('/profile')
          },
          {
            name: 'User Management',
            emoji: '👥',
            icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z',
            path: `/users`,
            current: isPathActive('/users'),
            submenu: [
              { name: 'All Users', emoji: '👤', path: `/users` },
              { name: 'Applicants', emoji: '🔍', path: `/users` },
              { name: 'Recruiters', emoji: '🏢', path: `/users` },
              { name: 'Pending Approval', emoji: '⏳', path: `/users` }
            ]
          },
          {
            name: 'Job Management',
            emoji: '💼',
            icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v2a2 2 0 01-2 2H10a2 2 0 01-2-2V6',
            path: `/jobs`,
            current: isPathActive('/jobs'),
            submenu: [
              { name: 'All Jobs', emoji: '📋', path: `/jobs` },
              { name: 'Pending Review', emoji: '⏳', path: `/jobs` },
              { name: 'Flagged Jobs', emoji: '🚩', path: `/jobs` }
            ]
          },
          {
            name: 'System Analytics',
            emoji: '📈',
            icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
            path: `/analytics`,
            current: isPathActive('/analytics')
          },
          {
            name: 'Content Moderation',
            emoji: '🛡️',
            icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
            path: `/moderation`,
            current: isPathActive('/moderation')
          },
          {
            name: 'Messages',
            emoji: '💬',
            icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z',
            path: `/messages`,
            current: isPathActive('/messages')
          },
          {
            name: 'Settings',
            emoji: '⚙️',
            icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z',
            path: `/settings`,
            current: isPathActive('/settings')
          }
        ];

      default:
        return commonItems;
    }
  };

  const navigationItems = getNavigationItems();

  const toggleSubmenu = (itemName) => {
    setExpandedMenus(prev => ({
      ...prev,
      [itemName]: !prev[itemName]
    }));
  };

  const handleNavigation = (path, tabId, jobTabId) => {
    // For dashboard tabs, trigger tab change instead of navigation
    if (tabId && userRole === 'recruiter') {
      // Trigger custom event for tab change
      window.dispatchEvent(new CustomEvent('dashboardTabChange', { 
        detail: { tabId, jobTabId } 
      }));
    } else {
      // Construct proper path with dashboard prefix
      let fullPath = path;
      if (path !== `/${userRole}-dashboard` && !path.startsWith(`/${userRole}-dashboard`)) {
        fullPath = `/${userRole}-dashboard${path}`;
      }
      setLocation(fullPath);
    }
    
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700">
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              FinAutoJobs
            </h2>
          </div>
        </div>
        <button
          className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
          onClick={() => setSidebarOpen(false)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* User info */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-medium">
                {user?.name?.charAt(0) || 'U'}
              </span>
            </div>
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {user?.name || 'User'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
              {userRole}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {navigationItems.map((item) => (
          <div key={item.name}>
            <motion.button
              className={`
                w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg
                transition-colors duration-200
                ${item.current 
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200' 
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                }
              `}
              onClick={() => {
                if (item.submenu) {
                  toggleSubmenu(item.name);
                } else {
                  handleNavigation(item.path, item.tabId);
                }
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="flex items-center">
                <span className="text-lg mr-3">{item.emoji}</span>
                {item.name}
              </div>
              {item.submenu && (
                <svg
                  className={`w-4 h-4 transition-transform duration-200 ${
                    expandedMenus[item.name] ? 'rotate-90' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              )}
            </motion.button>

            {/* Submenu */}
            {item.submenu && expandedMenus[item.name] && (
              <motion.div
                className="ml-8 mt-2 space-y-1"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                {item.submenu.map((subItem) => (
                  <motion.button
                    key={subItem.name}
                    className={`
                      w-full text-left px-3 py-2 text-sm rounded-md transition-colors duration-200 flex items-center
                      ${subItem.current || isPathActive(subItem.path)
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-200 font-medium' 
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800'
                      }
                    `}
                    onClick={() => handleNavigation(subItem.path, subItem.tabId, subItem.jobTabId)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="text-sm mr-2">{subItem.emoji}</span>
                    {subItem.name}
                  </motion.button>
                ))}
              </motion.div>
            )}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button
          className="w-full flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-colors duration-200"
          onClick={() => {
            // Handle logout properly
            logout();
          }}
        >
          <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      </div>
    </div>
  );
};

export default DashboardSidebar;
