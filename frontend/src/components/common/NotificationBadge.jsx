import React from 'react';
import { motion } from 'framer-motion';

const NotificationBadge = ({ 
  count = 0, 
  isConnected = false, 
  onClick, 
  className = "",
  showConnectionStatus = true 
}) => {
  if (count === 0 && !showConnectionStatus) return null;

  return (
    <div className={`relative inline-flex items-center ${className}`}>
      {/* Notification Bell Icon */}
      <button
        onClick={onClick}
        className="relative p-2 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-lg"
        title={`${count} unread notifications`}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {/* Notification Count Badge */}
        {count > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full min-w-[20px] h-5"
          >
            {count > 99 ? '99+' : count}
          </motion.span>
        )}

        {/* Connection Status Indicator */}
        {showConnectionStatus && (
          <div className="absolute -bottom-1 -right-1">
            <div
              className={`w-3 h-3 rounded-full border-2 border-white ${
                isConnected 
                  ? 'bg-green-500' 
                  : 'bg-red-500'
              }`}
              title={isConnected ? 'Connected to real-time notifications' : 'Disconnected from real-time notifications'}
            >
              {isConnected && (
                <motion.div
                  className="w-full h-full bg-green-400 rounded-full"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              )}
            </div>
          </div>
        )}
      </button>

      {/* Notification Pulse Animation */}
      {count > 0 && (
        <motion.div
          className="absolute -top-1 -right-1 w-6 h-6 bg-red-400 rounded-full opacity-75"
          animate={{ scale: [1, 1.5, 1], opacity: [0.75, 0, 0.75] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
    </div>
  );
};

export default NotificationBadge;
