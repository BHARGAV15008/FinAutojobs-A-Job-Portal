import React, { useState } from 'react';
import { motion } from 'framer-motion';

const ReportsTab = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('last30days');
  const [selectedReport, setSelectedReport] = useState('overview');

  const reportData = {
    overview: {
      totalJobs: 45,
      activeJobs: 23,
      totalApplications: 567,
      newApplications: 89,
      shortlisted: 45,
      interviewed: 23,
      hired: 8,
      rejected: 234
    },
    performance: {
      averageTimeToHire: 18,
      applicationRate: 12.6,
      interviewConversionRate: 51,
      offerAcceptanceRate: 87,
      costPerHire: 15000,
      qualityOfHire: 4.2
    },
    sources: [
      { name: 'Direct Applications', applications: 234, percentage: 41 },
      { name: 'Job Boards', applications: 156, percentage: 28 },
      { name: 'Referrals', applications: 89, percentage: 16 },
      { name: 'Social Media', applications: 67, percentage: 12 },
      { name: 'Career Page', applications: 21, percentage: 3 }
    ]
  };

  const topJobs = [
    {
      id: 1,
      title: 'Senior Frontend Developer',
      applications: 89,
      views: 1234,
      conversionRate: 7.2,
      status: 'active',
      postedDate: '2024-03-01'
    },
    {
      id: 2,
      title: 'Full Stack Engineer',
      applications: 67,
      views: 987,
      conversionRate: 6.8,
      status: 'active',
      postedDate: '2024-03-05'
    },
    {
      id: 3,
      title: 'Backend Developer',
      applications: 45,
      views: 756,
      conversionRate: 6.0,
      status: 'closed',
      postedDate: '2024-02-28'
    }
  ];

  const hiringFunnel = [
    { stage: 'Applications', count: 567, percentage: 100 },
    { stage: 'Screening', count: 234, percentage: 41 },
    { stage: 'Phone Interview', count: 89, percentage: 16 },
    { stage: 'Technical Interview', count: 45, percentage: 8 },
    { stage: 'Final Interview', count: 23, percentage: 4 },
    { stage: 'Offer', count: 12, percentage: 2 },
    { stage: 'Hired', count: 8, percentage: 1.4 }
  ];

  const monthlyTrends = [
    { month: 'Jan', applications: 234, hires: 5 },
    { month: 'Feb', applications: 289, hires: 7 },
    { month: 'Mar', applications: 567, hires: 8 },
  ];

  const renderOverviewReport = () => (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <span className="text-2xl">💼</span>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Total Jobs</h3>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {reportData.overview.totalJobs}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
              <span className="text-2xl">📄</span>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Applications</h3>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {reportData.overview.totalApplications}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <span className="text-2xl">⭐</span>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Shortlisted</h3>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {reportData.overview.shortlisted}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <span className="text-2xl">✅</span>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Hired</h3>
              <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                {reportData.overview.hired}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Hiring Funnel */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Hiring Funnel</h3>
        <div className="space-y-4">
          {hiringFunnel.map((stage, index) => (
            <div key={stage.stage} className="flex items-center">
              <div className="w-24 text-sm font-medium text-gray-900 dark:text-white">
                {stage.stage}
              </div>
              <div className="flex-1 mx-4">
                <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-6 relative">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium"
                    style={{ width: `${stage.percentage}%` }}
                  >
                    {stage.percentage > 10 && `${stage.percentage}%`}
                  </div>
                </div>
              </div>
              <div className="w-16 text-right text-sm font-medium text-gray-900 dark:text-white">
                {stage.count}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Performing Jobs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Top Performing Jobs</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Job Title</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Applications</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Views</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Conversion</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Status</th>
              </tr>
            </thead>
            <tbody>
              {topJobs.map((job) => (
                <tr key={job.id} className="border-b border-gray-100 dark:border-gray-700">
                  <td className="py-3 px-4 text-gray-900 dark:text-white">{job.title}</td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{job.applications}</td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{job.views}</td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{job.conversionRate}%</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      job.status === 'active' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                    }`}>
                      {job.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderPerformanceReport = () => (
    <div className="space-y-6">
      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Time to Hire</h3>
            <span className="text-2xl">⏱️</span>
          </div>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
            {reportData.performance.averageTimeToHire} days
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Average time from posting to hire</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Application Rate</h3>
            <span className="text-2xl">📈</span>
          </div>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
            {reportData.performance.applicationRate}%
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Views to applications conversion</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Interview Rate</h3>
            <span className="text-2xl">🗣️</span>
          </div>
          <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
            {reportData.performance.interviewConversionRate}%
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Applications to interviews</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Offer Acceptance</h3>
            <span className="text-2xl">✅</span>
          </div>
          <p className="text-3xl font-bold text-orange-600 dark:text-orange-400 mb-2">
            {reportData.performance.offerAcceptanceRate}%
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Offers accepted by candidates</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Cost per Hire</h3>
            <span className="text-2xl">💰</span>
          </div>
          <p className="text-3xl font-bold text-red-600 dark:text-red-400 mb-2">
            ₹{reportData.performance.costPerHire.toLocaleString()}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Average cost to hire one candidate</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Quality of Hire</h3>
            <span className="text-2xl">⭐</span>
          </div>
          <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mb-2">
            {reportData.performance.qualityOfHire}/5
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Average rating from hiring managers</p>
        </div>
      </div>

      {/* Monthly Trends Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Monthly Trends</h3>
        <div className="space-y-4">
          {monthlyTrends.map((month, index) => (
            <div key={month.month} className="flex items-center">
              <div className="w-12 text-sm font-medium text-gray-900 dark:text-white">
                {month.month}
              </div>
              <div className="flex-1 mx-4 space-y-2">
                <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                  <span>Applications: {month.applications}</span>
                  <span>Hires: {month.hires}</span>
                </div>
                <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-4 relative">
                  <div
                    className="bg-blue-500 h-4 rounded-full"
                    style={{ width: `${(month.applications / 600) * 100}%` }}
                  ></div>
                  <div
                    className="bg-green-500 h-4 rounded-full absolute top-0"
                    style={{ width: `${(month.hires / 10) * 100}%`, opacity: 0.7 }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSourcesReport = () => (
    <div className="space-y-6">
      {/* Application Sources */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Application Sources</h3>
        <div className="space-y-4">
          {reportData.sources.map((source, index) => (
            <div key={source.name} className="flex items-center">
              <div className="w-32 text-sm font-medium text-gray-900 dark:text-white">
                {source.name}
              </div>
              <div className="flex-1 mx-4">
                <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-6 relative">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium"
                    style={{ width: `${source.percentage}%` }}
                  >
                    {source.percentage > 8 && `${source.percentage}%`}
                  </div>
                </div>
              </div>
              <div className="w-16 text-right text-sm font-medium text-gray-900 dark:text-white">
                {source.applications}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Source Performance Comparison */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Source Performance</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Source</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Applications</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Quality Score</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Cost per Hire</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">Time to Hire</th>
              </tr>
            </thead>
            <tbody>
              {reportData.sources.map((source, index) => (
                <tr key={source.name} className="border-b border-gray-100 dark:border-gray-700">
                  <td className="py-3 px-4 text-gray-900 dark:text-white">{source.name}</td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400">{source.applications}</td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                    {(4.5 - index * 0.3).toFixed(1)}/5
                  </td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                    ₹{(12000 + index * 2000).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                    {15 + index * 3} days
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderReportContent = () => {
    switch (selectedReport) {
      case 'overview':
        return renderOverviewReport();
      case 'performance':
        return renderPerformanceReport();
      case 'sources':
        return renderSourcesReport();
      default:
        return renderOverviewReport();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Hiring Reports</h2>
        <div className="flex space-x-3">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="last7days">Last 7 Days</option>
            <option value="last30days">Last 30 Days</option>
            <option value="last90days">Last 90 Days</option>
            <option value="lastyear">Last Year</option>
          </select>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Export Report
          </button>
        </div>
      </div>

      {/* Report Navigation */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex space-x-4">
          <button
            onClick={() => setSelectedReport('overview')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedReport === 'overview'
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            📊 Overview
          </button>
          <button
            onClick={() => setSelectedReport('performance')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedReport === 'performance'
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            📈 Performance
          </button>
          <button
            onClick={() => setSelectedReport('sources')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedReport === 'sources'
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            🎯 Sources
          </button>
        </div>
      </div>

      {/* Report Content */}
      <motion.div
        key={selectedReport}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        {renderReportContent()}
      </motion.div>
    </div>
  );
};

export default ReportsTab;
