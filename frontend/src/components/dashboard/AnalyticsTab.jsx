import React from 'react';
import { motion } from 'framer-motion';

const AnalyticsTab = () => {
  const analyticsData = [
    { period: 'Jan', users: 120, jobs: 45, applications: 230 },
    { period: 'Feb', users: 150, jobs: 52, applications: 280 },
    { period: 'Mar', users: 180, jobs: 38, applications: 320 },
    { period: 'Apr', users: 220, jobs: 65, applications: 450 },
    { period: 'May', users: 280, jobs: 72, applications: 520 },
    { period: 'Jun', users: 320, jobs: 89, applications: 650 }
  ];

  const maxValue = Math.max(...analyticsData.flatMap(d => [d.users, d.jobs, d.applications]));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h2>
        <div className="flex space-x-3">
          <select className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
            <option>Last 6 Months</option>
            <option>Last Year</option>
            <option>All Time</option>
          </select>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Export Report
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <span className="text-2xl">👥</span>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Total Users</h3>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">1,270</p>
              <p className="text-sm text-green-600 dark:text-green-400">+12% from last month</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
              <span className="text-2xl">💼</span>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Active Jobs</h3>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">89</p>
              <p className="text-sm text-green-600 dark:text-green-400">+8% from last month</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <span className="text-2xl">📄</span>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Applications</h3>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">650</p>
              <p className="text-sm text-green-600 dark:text-green-400">+25% from last month</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Platform Growth Analytics
          </h3>
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              <span className="text-gray-600 dark:text-gray-400">Users</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              <span className="text-gray-600 dark:text-gray-400">Jobs</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
              <span className="text-gray-600 dark:text-gray-400">Applications</span>
            </div>
          </div>
        </div>

        <div className="relative h-64">
          <div className="flex items-end justify-between h-full space-x-2">
            {analyticsData.map((item, index) => {
              const userHeight = (item.users / maxValue) * 100;
              const jobHeight = (item.jobs / maxValue) * 100;
              const appHeight = (item.applications / maxValue) * 100;

              return (
                <div key={item.period} className="flex flex-col items-center flex-1">
                  <div className="flex items-end space-x-1 mb-2 w-full">
                    <motion.div
                      className="bg-blue-500 rounded-t-md flex-1"
                      style={{ height: `${userHeight}%` }}
                      initial={{ height: 0 }}
                      animate={{ height: `${userHeight}%` }}
                      transition={{ duration: 0.8, delay: index * 0.1 }}
                    />
                    <motion.div
                      className="bg-green-500 rounded-t-md flex-1"
                      style={{ height: `${jobHeight}%` }}
                      initial={{ height: 0 }}
                      animate={{ height: `${jobHeight}%` }}
                      transition={{ duration: 0.8, delay: index * 0.1 + 0.2 }}
                    />
                    <motion.div
                      className="bg-purple-500 rounded-t-md flex-1"
                      style={{ height: `${appHeight}%` }}
                      initial={{ height: 0 }}
                      animate={{ height: `${appHeight}%` }}
                      transition={{ duration: 0.8, delay: index * 0.1 + 0.4 }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {item.period}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Top Performing Categories
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Technology</span>
              <div className="flex items-center">
                <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-3">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">85%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Finance</span>
              <div className="flex items-center">
                <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-3">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '72%' }}></div>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">72%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Healthcare</span>
              <div className="flex items-center">
                <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-3">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: '68%' }}></div>
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-white">68%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            System Performance
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Server Response Time</span>
              <span className="text-sm font-medium text-green-600 dark:text-green-400">125ms</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Database Queries/sec</span>
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">1,245</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Active Sessions</span>
              <span className="text-sm font-medium text-purple-600 dark:text-purple-400">892</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Error Rate</span>
              <span className="text-sm font-medium text-green-600 dark:text-green-400">0.02%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsTab;
