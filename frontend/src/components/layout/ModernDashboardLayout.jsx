import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../contexts/IntegratedThemeContext';
import { useDashboard } from '../../contexts/RealDashboardContext';
import DashboardSidebar from './DashboardSidebar';
import DashboardHeader from './DashboardHeader';
import NotificationPanel from '../notifications/NotificationPanel';

const ModernDashboardLayout = ({ 
  children, 
  title, 
  userRole, 
  user,
  activeTab,
  activeJobTab,
  showBreadcrumbs = true,
  breadcrumbs = []
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notificationPanelOpen, setNotificationPanelOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { darkMode } = useTheme();
  const { dashboardData } = useDashboard();
  let notifications = dashboardData?.notifications || [];
  
  // Debug notifications (only log if there are notifications)
  if (notifications.length > 0) {
    console.log('✅ Loaded', notifications.length, 'real notifications:', notifications.map(n => n.title));
  }

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close sidebar on mobile when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobile && sidebarOpen && !event.target.closest('.sidebar') && !event.target.closest('.sidebar-toggle')) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [sidebarOpen, isMobile]);

  // Animation variants
  const layoutVariants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  };

  const contentVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { 
      opacity: 1, 
      y: 0,
      transition: { delay: 0.1, duration: 0.3 }
    }
  };

  const sidebarVariants = {
    open: { x: 0 },
    closed: { x: '-100%' }
  };

  return (
    <motion.div 
      className={`flex h-screen overflow-hidden ${darkMode ? 'dark' : ''}`}
      variants={layoutVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* Sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <DashboardSidebar 
          userRole={userRole}
          user={user}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          activeTab={activeTab}
          activeJobTab={activeJobTab}
        />
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isMobile && sidebarOpen && (
          <motion.div
            className="fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 shadow-xl sidebar"
            variants={sidebarVariants}
            animate="open"
            exit="closed"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <DashboardSidebar 
              userRole={userRole}
              user={user}
              sidebarOpen={sidebarOpen}
              setSidebarOpen={setSidebarOpen}
              activeTab={activeTab}
              activeJobTab={activeJobTab}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile sidebar overlay - Only show on mobile when sidebar is open */}
      <AnimatePresence>
        {isMobile && sidebarOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Content area */}
      <div className="dashboard-container relative flex flex-col flex-1 lg:ml-64 overflow-y-auto overflow-x-hidden bg-gray-50 dark:bg-gray-800 w-full">
        {/* Header */}
        <DashboardHeader
          title={title}
          user={user}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          notificationPanelOpen={notificationPanelOpen}
          setNotificationPanelOpen={setNotificationPanelOpen}
          showBreadcrumbs={showBreadcrumbs}
          breadcrumbs={breadcrumbs}
        />

        {/* Main content */}
        <motion.main 
          className="flex-1 relative z-0 overflow-y-auto focus:outline-none w-full"
          variants={contentVariants}
          initial="initial"
          animate="animate"
        >
          <div className="py-4 sm:py-6">
            <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
              {/* Page content */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
              >
                {children}
              </motion.div>
            </div>
          </div>
        </motion.main>

        {/* Notification Panel */}
        <NotificationPanel
          isOpen={notificationPanelOpen}
          onClose={() => setNotificationPanelOpen(false)}
          notifications={notifications}
        />
      </div>

      {/* Floating Action Button for Mobile */}
      <motion.button
        className={`
          fixed bottom-6 right-6 z-50 lg:hidden
          w-14 h-14 bg-blue-600 hover:bg-blue-700 
          text-white rounded-full shadow-lg
          flex items-center justify-center
          transition-colors duration-200
        `}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </motion.button>
    </motion.div>
  );
};

export default ModernDashboardLayout;
