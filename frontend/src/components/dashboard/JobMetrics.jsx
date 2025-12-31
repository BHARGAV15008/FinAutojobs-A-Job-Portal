import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useDashboard } from '../../contexts/RealDashboardContext';
import { 
  Description, 
  Visibility, 
  Star, 
  Group, 
  Work, 
  AssignmentTurnedIn, 
  CheckCircle,
  TrendingUp,
  TrendingDown
} from '@mui/icons-material';

const JobMetrics = ({ userRole }) => {
  const { dashboardData, getStats, loading } = useDashboard();
  const [forceUpdate, setForceUpdate] = useState(0);
  
  // Get real stats from dashboard context
  const stats = getStats ? getStats(userRole) : {};
  
  // Optimized re-render logic - only update when stats actually change
  useEffect(() => {
    if (dashboardData?.stats && JSON.stringify(dashboardData.stats) !== JSON.stringify(stats)) {
      setForceUpdate(prev => prev + 1);
    }
  }, [dashboardData?.stats]); 

  const getMetrics = () => {
    if (userRole === 'applicant') {
      return [
        {
          title: 'Applications Sent',
          value: String(stats?.totalApplications || dashboardData?.stats?.totalApplications || 0),
          change: '+3',
          changeLabel: 'this week',
          changeType: 'positive',
          icon: <Description />,
          gradient: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
          color: '#3b82f6',
          bgGradient: 'from-blue-500 via-blue-600 to-indigo-600',
          lightBg: 'from-blue-50 to-indigo-50',
          shadowColor: 'rgba(59, 130, 246, 0.5)'
        },
        {
          title: 'Profile Views',
          value: String(stats?.profileViews || 0),
          change: '+15',
          changeLabel: 'this week',
          changeType: 'positive',
          icon: <Visibility />,
          gradient: 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)',
          color: '#ec4899',
          bgGradient: 'from-pink-500 via-rose-500 to-red-500',
          lightBg: 'from-pink-50 to-rose-50',
          shadowColor: 'rgba(236, 72, 153, 0.5)'
        },
        {
          title: 'Shortlisted',
          value: String(stats?.shortlisted || dashboardData?.stats?.shortlisted || 0),
          change: '+1',
          changeLabel: 'this week',
          changeType: 'positive',
          icon: <Star />,
          gradient: 'linear-gradient(135deg, #f59e0b 0%, #eab308 100%)',
          color: '#f59e0b',
          bgGradient: 'from-amber-500 via-orange-500 to-yellow-500',
          lightBg: 'from-amber-50 to-yellow-50',
          shadowColor: 'rgba(245, 158, 11, 0.5)'
        },
        {
          title: 'Interviews',
          value: String(stats?.interviews || dashboardData?.stats?.interviews || 0),
          change: '+2',
          changeLabel: 'this week',
          changeType: 'positive',
          icon: <Group />,
          gradient: 'linear-gradient(135deg, #14b8a6 0%, #06b6d4 100%)',
          color: '#14b8a6',
          bgGradient: 'from-teal-500 via-cyan-500 to-sky-500',
          lightBg: 'from-teal-50 to-cyan-50',
          shadowColor: 'rgba(20, 184, 166, 0.5)'
        }
      ];
    } else if (userRole === 'recruiter') {
      return [
        {
          title: 'Active Jobs',
          value: String(stats?.activeJobs || dashboardData?.stats?.activeJobs || 0),
          change: `${stats?.totalJobs || dashboardData?.stats?.totalJobs || 0}`,
          changeLabel: 'total',
          changeType: 'neutral',
          icon: <Work />,
          gradient: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
          color: '#3b82f6',
          bgGradient: 'from-blue-500 via-blue-600 to-indigo-600',
          lightBg: 'from-blue-50 to-indigo-50',
          shadowColor: 'rgba(59, 130, 246, 0.5)'
        },
        {
          title: 'Total Applications',
          value: String(stats?.totalApplications || dashboardData?.stats?.totalApplications || 0),
          change: '+12',
          changeLabel: 'this week',
          changeType: 'positive',
          icon: <AssignmentTurnedIn />,
          gradient: 'linear-gradient(135deg, #10b981 0%, #14b8a6 100%)',
          color: '#10b981',
          bgGradient: 'from-emerald-500 via-green-500 to-teal-500',
          lightBg: 'from-emerald-50 to-teal-50',
          shadowColor: 'rgba(16, 185, 129, 0.5)'
        },
        {
          title: 'Shortlisted',
          value: String(stats?.shortlisted || dashboardData?.stats?.shortlisted || 0),
          change: '+4',
          changeLabel: 'this week',
          changeType: 'positive',
          icon: <Star />,
          gradient: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
          color: '#a855f7',
          bgGradient: 'from-purple-500 via-violet-500 to-fuchsia-500',
          lightBg: 'from-purple-50 to-fuchsia-50',
          shadowColor: 'rgba(168, 85, 247, 0.5)'
        },
        {
          title: 'Hired',
          value: String(stats?.hired || dashboardData?.stats?.hired || 0),
          change: '+1',
          changeLabel: 'this month',
          changeType: 'positive',
          icon: <CheckCircle />,
          gradient: 'linear-gradient(135deg, #f97316 0%, #fb923c 100%)',
          color: '#f97316',
          bgGradient: 'from-orange-500 via-amber-500 to-yellow-500',
          lightBg: 'from-orange-50 to-amber-50',
          shadowColor: 'rgba(249, 115, 22, 0.5)'
        }
      ];
    }
    return [];
  };

  const metrics = getMetrics();

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 w-full">
      {metrics.map((metric, index) => (
        <motion.div
          key={metric.title}
          className={`relative bg-gradient-to-br ${metric.lightBg} dark:bg-gray-800 rounded-2xl p-6 transition-all duration-300 group overflow-hidden border-2 border-white/50 dark:border-gray-700/50 shadow-xl hover:shadow-2xl`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          whileHover={{ y: -6, scale: 1.03 }}
        >
          {/* Decorative gradient orbs */}
          <div className="absolute inset-0 opacity-20 dark:opacity-10">
            <div className={`absolute -top-12 -right-12 w-32 h-32 bg-gradient-to-br ${metric.bgGradient} rounded-full blur-2xl`}></div>
            <div className={`absolute -bottom-8 -left-8 w-24 h-24 bg-gradient-to-tr ${metric.bgGradient} rounded-full blur-xl`}></div>
          </div>

          {/* Top accent bar */}
          <motion.div 
            className="absolute top-0 left-0 right-0 h-1"
            style={{ 
              background: metric.gradient,
              borderTopLeftRadius: '16px',
              borderTopRightRadius: '16px'
            }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: index * 0.1 + 0.3, duration: 0.6 }}
          />
          
          {/* Shine effect on hover */}
          <div 
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 100%)',
            }}
          />

          <div className="relative z-10">
            {/* Icon and badge row */}
            <div className="flex items-start justify-between mb-5">
              {/* Icon container - vibrant gradient background with ring */}
              <motion.div 
                className={`flex items-center justify-center rounded-2xl bg-gradient-to-br ${metric.bgGradient} shadow-2xl ring-4 ring-white/30 dark:ring-gray-800/50`}
                style={{ 
                  width: '68px',
                  height: '68px',
                  boxShadow: `0 8px 24px ${metric.shadowColor}`
                }}
                whileHover={{ rotate: [0, -8, 8, -8, 0], scale: 1.12 }}
                transition={{ duration: 0.6 }}
              >
                {React.cloneElement(metric.icon, { 
                  sx: { 
                    fontSize: 34, 
                    color: '#ffffff',
                    filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.3))'
                  } 
                })}
              </motion.div>

              {/* Change badge */}
              <motion.div 
                className="flex flex-col items-end"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 + 0.2 }}
              >
                <div 
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-black shadow-lg bg-gradient-to-r ${metric.bgGradient}`}
                  style={{
                    color: '#ffffff',
                    boxShadow: `0 6px 16px ${metric.shadowColor}`
                  }}
                >
                  {metric.changeType === 'positive' && <TrendingUp sx={{ fontSize: 15 }} />}
                  {metric.changeType === 'negative' && <TrendingDown sx={{ fontSize: 15 }} />}
                  <span>{metric.change}</span>
                </div>
                <span className="text-[10px] text-gray-700 dark:text-gray-300 mt-1.5 font-bold uppercase tracking-wide">
                  {metric.changeLabel}
                </span>
              </motion.div>
            </div>

            {/* Title and value */}
            <div className="space-y-3">
              <p className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                {metric.title}
              </p>
              <motion.h3 
                className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: index * 0.1 + 0.3, type: "spring" }}
              >
                {metric.value}
              </motion.h3>
            </div>
          </div>

          {/* Hover glow effect */}
          <div 
            className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 rounded-3xl"
            style={{
              background: metric.gradient,
              filter: 'blur(20px)'
            }}
          />
        </motion.div>
      ))}
    </div>
  );
};

export default JobMetrics;