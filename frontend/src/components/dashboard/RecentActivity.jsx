import React from 'react';
import { motion } from 'framer-motion';

const RecentActivity = ({ userRole }) => {
  const getActivities = () => {
    if (userRole === 'applicant') {
      return [
        {
          id: 1,
          type: 'application',
          title: 'Applied to Software Engineer at TechCorp',
          time: '2 hours ago',
          icon: '📄',
          status: 'pending'
        },
        {
          id: 2,
          type: 'shortlist',
          title: 'Shortlisted for Frontend Developer at StartupXYZ',
          time: '1 day ago',
          icon: '⭐',
          status: 'success'
        },
        {
          id: 3,
          type: 'interview',
          title: 'Interview scheduled with DataTech Solutions',
          time: '2 days ago',
          icon: '🗣️',
          status: 'upcoming'
        },
        {
          id: 4,
          type: 'profile',
          title: 'Profile viewed by 5 recruiters',
          time: '3 days ago',
          icon: '👁️',
          status: 'info'
        },
        {
          id: 5,
          type: 'application',
          title: 'Applied to React Developer at WebCorp',
          time: '4 days ago',
          icon: '📄',
          status: 'pending'
        }
      ];
    } else if (userRole === 'recruiter') {
      return [
        {
          id: 1,
          type: 'application',
          title: 'New application for Senior Developer position',
          time: '1 hour ago',
          icon: '📋',
          status: 'new'
        },
        {
          id: 2,
          type: 'interview',
          title: 'Interview completed with John Doe',
          time: '3 hours ago',
          icon: '✅',
          status: 'completed'
        },
        {
          id: 3,
          type: 'job',
          title: 'Posted new job: Full Stack Developer',
          time: '1 day ago',
          icon: '💼',
          status: 'active'
        },
        {
          id: 4,
          type: 'shortlist',
          title: 'Shortlisted 3 candidates for UI/UX Designer',
          time: '2 days ago',
          icon: '🎯',
          status: 'success'
        },
        {
          id: 5,
          type: 'hire',
          title: 'Hired Sarah Johnson as Frontend Developer',
          time: '3 days ago',
          icon: '🎉',
          status: 'success'
        }
      ];
    }
    return [];
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'success':
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'upcoming':
      case 'active':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'new':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'info':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const activities = getActivities();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Recent Activity
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

export default RecentActivity;
