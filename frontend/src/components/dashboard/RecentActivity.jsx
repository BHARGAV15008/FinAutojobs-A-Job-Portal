import React from 'react';
import { motion } from 'framer-motion';
import { useDashboard } from '../../contexts/RealDashboardContext';

const RecentActivity = ({ userRole }) => {
  const { dashboardData } = useDashboard();
  
  const getActivities = () => {
    // Use real data from dashboard context
    const recentJobs = dashboardData?.recentJobs || [];
    const applications = dashboardData?.applications || [];
    const notifications = dashboardData?.notifications || [];
    
    // Debug logs (reduced)
    
    let activities = [];
    
    if (userRole === 'applicant') {
      // Show recent applications and notifications
      applications.slice(0, 3).forEach((app, index) => {
        activities.push({
          id: `app-${index}`,
          type: 'application',
          title: `Applied to ${app.jobTitle || app.jobId?.title || 'Job Position'}`,
          time: app.createdAt ? new Date(app.createdAt).toLocaleDateString() : 'Recently',
          icon: '📄',
          status: app.status || 'pending'
        });
      });
      
      notifications.slice(0, 2).forEach((notif, index) => {
        activities.push({
          id: `notif-${index}`,
          type: 'notification',
          title: notif.message || notif.title || 'New notification',
          time: notif.createdAt ? new Date(notif.createdAt).toLocaleDateString() : 'Recently',
          icon: '🔔',
          status: 'info'
        });
      });
    } else if (userRole === 'recruiter') {
      // Show recent jobs and applications
      recentJobs.slice(0, 3).forEach((job, index) => {
        activities.push({
          id: `job-${index}`,
          type: 'job',
          title: `Posted: ${job.jobTitle || job.title || 'Job Position'}`,
          time: job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'Recently',
          icon: '💼',
          status: job.status || 'active'
        });
      });
      
      applications.slice(0, 2).forEach((app, index) => {
        activities.push({
          id: `app-${index}`,
          type: 'application',
          title: `New application for ${app.jobTitle || app.jobId?.title || 'Job Position'}`,
          time: app.createdAt ? new Date(app.createdAt).toLocaleDateString() : 'Recently',
          icon: '📋',
          status: app.status || 'new'
        });
      });
    }
    
    // If no real data, show a placeholder
    if (activities.length === 0) {
      activities.push({
        id: 'placeholder',
        type: 'info',
        title: 'No recent activity',
        time: 'Start using the platform to see activity here',
        icon: '📊',
        status: 'info'
      });
    }
    
    return activities.slice(0, 5); // Limit to 5 items
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
