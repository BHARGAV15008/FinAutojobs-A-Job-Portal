import React from 'react';
import { motion } from 'framer-motion';
import { MoreVertical } from 'lucide-react';

const ThreeDotsMenu = ({ 
  job, 
  openDropdown, 
  toggleDropdown, 
  closeDropdown, 
  handleViewApplications, 
  handleEdit, 
  handleDelete, 
  deleting 
}) => {
  return (
    <div className="relative">
      <motion.button
        className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors duration-200"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={(e) => {
          e.stopPropagation();
          toggleDropdown(job.id);
        }}
      >
        <MoreVertical className="w-5 h-5" />
      </motion.button>
      
      {openDropdown === job.id && (
        <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
          <div className="py-1">
            <button
              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
              onClick={(e) => {
                e.stopPropagation();
                handleViewApplications(job._id || job.id);
                closeDropdown();
              }}
            >
              <span>👥</span>
              <span>View Applications</span>
            </button>
            <button
              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2"
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(job._id || job.id);
                closeDropdown();
              }}
            >
              <span>✏️</span>
              <span>Edit Job</span>
            </button>
            <button
              className={`w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center space-x-2 ${
                deleting[job.id] ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              onClick={(e) => {
                e.stopPropagation();
                if (!deleting[job.id]) {
                  handleDelete(job.id);
                  closeDropdown();
                }
              }}
              disabled={deleting[job.id]}
            >
              <span>{deleting[job.id] ? '⏳' : '🗑️'}</span>
              <span>{deleting[job.id] ? 'Deleting...' : 'Delete Job'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThreeDotsMenu;
