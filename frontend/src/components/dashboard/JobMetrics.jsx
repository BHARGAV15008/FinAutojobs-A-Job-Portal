import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useDashboard } from '../../contexts/RealDashboardContext';

const JobMetrics = ({ userRole }) => {
  const { dashboardData, getStats, loading } = useDashboard();
  const [forceUpdate, setForceUpdate] = useState(0);
  
  // Get real stats from dashboard context
  const stats = getStats ? getStats(userRole) : {};
  
  // Optimized re-render logic - only update when stats actually change
  useEffect(() => {
    if (dashboardData?.stats && JSON.stringify(dashboardData.stats) !== JSON.stringify(stats)) {
      console.log('🔄 JobMetrics: Dashboard data changed, forcing update');
      setForceUpdate(prev => prev + 1);
    }
  }, [dashboardData?.stats]); // Simplified dependencies
  
  // Reduced debug logs to prevent console spam
  if (Math.random() < 0.1) { // Only log 10% of the time
    console.log('🔍 JobMetrics Debug:', {
      userRole,
      stats,
      dashboardData: dashboardData?.stats,
      loading,
      forceUpdate
    });
  }

  const getMetrics = () => {
    if (userRole === 'applicant') {
      return [
        {
          title: 'Applications Sent',
          value: String(stats?.totalApplications || dashboardData?.stats?.totalApplications || 0),
          change: '+3 this week',
          changeType: 'positive',
          icon: '📄',
          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
          iconBg: 'bg-blue-100 dark:bg-blue-800'
        },
        {
          title: 'Profile Views',
          value: String(stats?.profileViews || 0),
          change: '+15 this week',
          changeType: 'positive',
          icon: '👁️',
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          iconBg: 'bg-green-100 dark:bg-green-800'
        },
        {
          title: 'Shortlisted',
          value: String(stats?.shortlisted || dashboardData?.stats?.shortlisted || 0),
          change: '+1 this week',
          changeType: 'positive',
          icon: '⭐',
          bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
          iconBg: 'bg-yellow-100 dark:bg-yellow-800'
        },
        {
          title: 'Interviews',
          value: String(stats?.interviews || dashboardData?.stats?.interviews || 0),
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
          value: String(stats?.activeJobs || dashboardData?.stats?.activeJobs || 0),
          change: `${stats?.totalJobs || dashboardData?.stats?.totalJobs || 0} total`,
          changeType: 'positive',
          icon: '💼',
          bgColor: 'bg-blue-50 dark:bg-blue-900/20',
          iconBg: 'bg-blue-100 dark:bg-blue-800'
        },
        {
          title: 'Total Applications',
          value: String(stats?.totalApplications || dashboardData?.stats?.totalApplications || 0),
          change: '+12 this week',
          changeType: 'positive',
          icon: '📋',
          bgColor: 'bg-green-50 dark:bg-green-900/20',
          iconBg: 'bg-green-100 dark:bg-green-800'
        },
        {
          title: 'Shortlisted',
          value: String(stats?.shortlisted || dashboardData?.stats?.shortlisted || 0),
          change: '+4 this week',
          changeType: 'positive',
          icon: '🎯',
          bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
          iconBg: 'bg-yellow-100 dark:bg-yellow-800'
        },
        {
          title: 'Hired',
          value: String(stats?.hired || dashboardData?.stats?.hired || 0),
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
          className={`rounded-xl border border-gray-200 dark:border-gray-700 ${metric.bgColor} p-6 font-inter`}
          style={{ fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
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
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-1 font-inter dashboard-secondary">
                {metric.title}
              </p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white font-inter dashboard-text">
                {metric.value}
              </h3>
            </div>
            <div className={`flex items-center text-sm font-medium font-inter ${
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
