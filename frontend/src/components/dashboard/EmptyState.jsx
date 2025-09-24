import React from 'react';
import { motion } from 'framer-motion';

const EmptyState = ({ 
  icon = "📊", 
  title = "No Data Available", 
  description = "There's no data to display at the moment.",
  actionText = "Get Started",
  onAction = null,
  showAction = false 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-200 dark:border-gray-700 text-center"
    >
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        {description}
      </p>
      {showAction && onAction && (
        <button
          onClick={onAction}
          className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          {actionText}
        </button>
      )}
    </motion.div>
  );
};

export default EmptyState;
