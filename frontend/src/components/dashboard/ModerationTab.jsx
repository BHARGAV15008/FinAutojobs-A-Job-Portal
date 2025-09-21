import React from 'react';
import { motion } from 'framer-motion';

const ModerationTab = () => {
  const moderationItems = [
    {
      id: 1,
      type: 'job',
      title: 'Senior Frontend Developer - TechCorp',
      description: 'Flagged for review due to salary discrepancy',
      status: 'pending',
      flaggedBy: 'System',
      flaggedDate: '2024-03-20',
      priority: 'high'
    },
    {
      id: 2,
      type: 'user',
      title: 'User Profile: john.doe@example.com',
      description: 'Reported for fake credentials',
      status: 'under_review',
      flaggedBy: 'User Report',
      flaggedDate: '2024-03-19',
      priority: 'medium'
    },
    {
      id: 3,
      type: 'job',
      title: 'Marketing Manager - StartupXYZ',
      description: 'Inappropriate job description content',
      status: 'resolved',
      flaggedBy: 'Auto-Moderation',
      flaggedDate: '2024-03-18',
      priority: 'low'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'under_review':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'resolved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 dark:text-red-400';
      case 'medium':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'low':
        return 'text-green-600 dark:text-green-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Content Moderation</h2>
        <div className="flex space-x-3">
          <select className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            <option>All Items</option>
            <option>Pending Review</option>
            <option>Under Review</option>
            <option>Resolved</option>
          </select>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Bulk Actions
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <span className="text-2xl">⏳</span>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Pending</h3>
              <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">8</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <span className="text-2xl">🔍</span>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Under Review</h3>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">3</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
              <span className="text-2xl">✅</span>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Resolved</h3>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">45</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <span className="text-2xl">📊</span>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Total</h3>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">56</p>
            </div>
          </div>
        </div>
      </div>

      {/* Moderation Items */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Moderation Queue</h3>
        </div>
        
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {moderationItems.map((item, index) => (
            <motion.div
              key={item.id}
              className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-2xl">
                      {item.type === 'job' ? '💼' : '👤'}
                    </span>
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                      {item.title}
                    </h4>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                      {item.status.replace('_', ' ')}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-400 mb-3">
                    {item.description}
                  </p>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                    <span>Flagged by: {item.flaggedBy}</span>
                    <span>•</span>
                    <span>{item.flaggedDate}</span>
                    <span>•</span>
                    <span className={`font-medium ${getPriorityColor(item.priority)}`}>
                      {item.priority.toUpperCase()} Priority
                    </span>
                  </div>
                </div>
                
                <div className="flex space-x-2 ml-4">
                  <button className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors">
                    Approve
                  </button>
                  <button className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors">
                    Reject
                  </button>
                  <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors">
                    Review
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ModerationTab;
