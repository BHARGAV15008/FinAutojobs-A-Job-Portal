import React from 'react';
import { motion } from 'framer-motion';

const JobMetrics = ({ userRole }) => {
  const getMetrics = () => {
    if (userRole === 'applicant') {
      return [
        {
          title: 'Applications Sent',
          value: '12',
          change: '+3 this week',
          changeType: 'positive',
          icon: '📄',
          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
          iconBg: 'bg-blue-100 dark:bg-blue-800'
        },
        {
          title: 'Profile Views',
          value: '89',
          change: '+15 this week',
          changeType: 'positive',
          icon: '👁️',
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          iconBg: 'bg-green-100 dark:bg-green-800'
        },
        {
          title: 'Shortlisted',
          value: '3',
          change: '+1 this week',
          changeType: 'positive',
          icon: '⭐',
          bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
          iconBg: 'bg-yellow-100 dark:bg-yellow-800'
        },
        {
          title: 'Interviews',
          value: '2',
          change: '+2 this week',
          changeType: 'positive',
          icon: '🗣️',
          bgColor: 'bg-purple-50 dark:bg-purple-900/20',
          iconBg: 'bg-purple-100 dark:bg-purple-800'
        }
      ];
    } else if (userRole === 'recruiter') {
      return [
        {
          title: 'Active Jobs',
          value: '5',
          change: '+2 this month',
          changeType: 'positive',
          icon: '💼',
          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
          iconBg: 'bg-blue-100 dark:bg-blue-800'
        },
        {
          title: 'Total Applications',
          value: '45',
          change: '+12 this week',
          changeType: 'positive',
          icon: '📋',
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          iconBg: 'bg-green-100 dark:bg-green-800'
        },
        {
          title: 'Shortlisted',
          value: '12',
          change: '+4 this week',
          changeType: 'positive',
          icon: '🎯',
          bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
          iconBg: 'bg-yellow-100 dark:bg-yellow-800'
        },
        {
          title: 'Hired',
          value: '3',
          change: '+1 this month',
          changeType: 'positive',
          icon: '✅',
          bgColor: 'bg-purple-50 dark:bg-purple-900/20',
          iconBg: 'bg-purple-100 dark:bg-purple-800'
        }
      ];
    }
    return [];
  };

  const metrics = getMetrics();

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {metrics.map((metric, index) => (
        <motion.div
          key={metric.title}
          className={`rounded-xl border border-gray-200 dark:border-gray-700 ${metric.bgColor} p-6`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          whileHover={{ y: -4 }}
        >
          <div className={`flex items-center justify-center w-12 h-12 ${metric.iconBg} rounded-xl mb-4`}>
            <span className="text-2xl">{metric.icon}</span>
          </div>

          <div className="flex items-end justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                {metric.title}
              </p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                {metric.value}
              </h3>
            </div>
            <div className={`flex items-center text-sm font-medium ${
              metric.changeType === 'positive' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}>
              <span className="mr-1">
                {metric.changeType === 'positive' ? '↗️' : '↘️'}
              </span>
              {metric.change}
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default JobMetrics;
