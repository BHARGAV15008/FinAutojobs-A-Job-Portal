import React from 'react';
import { motion } from 'framer-motion';

const AdminActivity = () => {
  const activities = [
    {
      id: 1,
      type: 'user',
      title: 'New user registration: John Smith',
      time: '5 minutes ago',
      icon: '👤',
      status: 'new'
    },
    {
      id: 2,
      type: 'job',
      title: 'Job posted: Senior Developer at TechCorp',
      time: '15 minutes ago',
      icon: '💼',
      status: 'active'
    },
    {
      id: 3,
      type: 'application',
      title: '12 new job applications received',
      time: '30 minutes ago',
      icon: '📄',
      status: 'pending'
    },
    {
      id: 4,
      type: 'system',
      title: 'Database backup completed successfully',
      time: '1 hour ago',
      icon: '💾',
      status: 'completed'
    },
    {
      id: 5,
      type: 'security',
      title: 'Security scan completed - No issues found',
      time: '2 hours ago',
      icon: '🔒',
      status: 'success'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'new':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'completed':
      case 'success':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          System Activity
        </h3>
        <button className="text-blue-600 hover:text-blue-700 dark:text-blue-400 text-sm font-medium">
          View All
        </button>
      </div>

      <div className="space-y-4">
        {activities.map((activity, index) => (
          <motion.div
            key={activity.id}
            className="flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <span className="text-lg">{activity.icon}</span>
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {activity.title}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {activity.time}
              </p>
            </div>
            
            <div className="flex-shrink-0">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(activity.status)}`}>
                {activity.status}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AdminActivity;
