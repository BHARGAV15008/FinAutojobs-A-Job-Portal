import React from 'react';
import { motion } from 'framer-motion';
import { useDashboard } from '../../contexts/RealDashboardContext';

const LoginStatusBanner = () => {
  const { isAuthenticated, currentUser, logout } = useDashboard();

  if (isAuthenticated && currentUser) {
    return (
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <div>
              <p className="text-green-800 dark:text-green-200 font-medium">
                ✅ Logged in as {currentUser.firstName} {currentUser.lastName}
              </p>
              <p className="text-green-600 dark:text-green-300 text-sm">
                Showing real data from your account ({currentUser.email})
              </p>
            </div>
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 bg-green-100 dark:bg-green-800 hover:bg-green-200 dark:hover:bg-green-700 text-green-800 dark:text-green-200 rounded-lg text-sm font-medium transition-colors"
          >
            Logout
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 mb-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
          <div>
            <p className="text-orange-800 dark:text-orange-200 font-medium">
              🔒 Not Logged In - No Data Available
            </p>
            <p className="text-orange-600 dark:text-orange-300 text-sm">
              Login with a demo account to see real data from the database (all values will be 0 until you login)
            </p>
          </div>
        </div>
        <a
          href="/login"
          className="px-4 py-2 bg-orange-100 dark:bg-orange-800 hover:bg-orange-200 dark:hover:bg-orange-700 text-orange-800 dark:text-orange-200 rounded-lg text-sm font-medium transition-colors"
        >
          Login
        </a>
      </div>
    </motion.div>
  );
};

export default LoginStatusBanner;
