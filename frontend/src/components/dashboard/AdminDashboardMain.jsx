import React from 'react';
import { motion } from 'framer-motion';
import AdminMetrics from './AdminMetrics';
import AdminActivity from './AdminActivity';
import LoginStatusBanner from './LoginStatusBanner';
import { useDashboard } from '../../contexts/RealDashboardContext';

const AdminDashboardMain = ({ user }) => {
  const { dashboardData, getStats } = useDashboard();
  
  // Get real stats from dashboard context
  const stats = getStats('admin') || {
    totalUsers: 0,
    activeJobs: 0,
    totalApplications: 0,
    systemHealth: 100,
    pendingUsers: 0,
    approvedJobs: 0,
    pendingJobs: 0,
    rejectedJobs: 0
  };
  return (
    <div className="space-y-8">
      {/* Login Status Banner */}
      <LoginStatusBanner />
      
      {/* Welcome Section */}
      <motion.div
        className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-8 text-white"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">
              Welcome back, {user.name}! ⚡
            </h2>
            <p className="text-purple-100 text-lg">
              Monitor and manage the entire FinAutoJobs platform
            </p>
          </div>
          <div className="hidden md:block">
            <div className="text-6xl">🛡️</div>
          </div>
        </div>
      </motion.div>

      {/* Admin Metrics */}
      <AdminMetrics />

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* System Overview Chart */}
        <div className="xl:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Platform Overview
            </h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                  {stats.totalUsers?.toLocaleString() || '0'}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Users</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                  {stats.activeJobs?.toLocaleString() || '0'}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Active Jobs</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                  {stats.totalApplications?.toLocaleString() || '0'}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Applications</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {stats.systemHealth || 100}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Uptime</div>
              </div>
            </div>
          </div>
        </div>

        {/* Admin Activity */}
        <div className="xl:col-span-1">
          <AdminActivity />
        </div>
      </div>

      {/* Management Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* User Management */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              User Management
            </h3>
            <button className="text-blue-600 hover:text-blue-700 dark:text-blue-400 text-sm font-medium">
              Manage all
            </button>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Job Seekers</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Active users</p>
              </div>
              <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {(stats.totalUsers - (stats.recruiters || 0) - (stats.admins || 0)) || 0}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Recruiters</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Verified companies</p>
              </div>
              <span className="text-lg font-bold text-green-600 dark:text-green-400">
                {stats.recruiters || 0}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Pending</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Awaiting approval</p>
              </div>
              <span className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                {stats.pendingUsers || 0}
              </span>
            </div>
          </div>
        </div>

        {/* Job Moderation */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Job Moderation
            </h3>
            <button className="text-blue-600 hover:text-blue-700 dark:text-blue-400 text-sm font-medium">
              Review all
            </button>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Approved</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">This month</p>
              </div>
              <span className="text-lg font-bold text-green-600 dark:text-green-400">
                {stats.approvedJobs || stats.activeJobs || 0}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Pending</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Awaiting review</p>
              </div>
              <span className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                {stats.pendingJobs || 0}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Rejected</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">This month</p>
              </div>
              <span className="text-lg font-bold text-red-600 dark:text-red-400">
                {stats.rejectedJobs || 0}
              </span>
            </div>
          </div>
        </div>

        {/* System Health */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              System Health
            </h3>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
              Healthy
            </span>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Server Uptime</span>
              <span className="text-sm font-medium text-green-600 dark:text-green-400">99.9%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Database</span>
              <span className="text-sm font-medium text-green-600 dark:text-green-400">Online</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">API Response</span>
              <span className="text-sm font-medium text-green-600 dark:text-green-400">125ms</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Storage</span>
              <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">78%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardMain;
