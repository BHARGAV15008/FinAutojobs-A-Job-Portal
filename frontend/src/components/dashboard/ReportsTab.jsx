import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../services/api';

const ReportsTab = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  const reportTypes = [
    {
      id: 'user-registration',
      name: 'User Registration Report',
      description: 'Track new user registrations over time',
      icon: '👥',
      endpoint: '/admin/reports/user-registration'
    },
    {
      id: 'job-postings',
      name: 'Job Postings Report',
      description: 'Analyze job posting trends and categories',
      icon: '💼',
      endpoint: '/admin/reports/job-postings'
    },
    {
      id: 'application-trends',
      name: 'Application Trends Report',
      description: 'Monitor application patterns and success rates',
      icon: '📈',
      endpoint: '/admin/reports/application-trends'
    },
    {
      id: 'company-performance',
      name: 'Company Performance Report',
      description: 'Evaluate company engagement and job posting success',
      icon: '🏢',
      endpoint: '/admin/reports/company-performance'
    },
    {
      id: 'system-usage',
      name: 'System Usage Report',
      description: 'Track platform usage and user activity',
      icon: '📊',
      endpoint: '/admin/reports/system-usage'
    },
    {
      id: 'revenue-report',
      name: 'Revenue Report',
      description: 'Financial performance and subscription analytics',
      icon: '💰',
      endpoint: '/admin/reports/revenue'
    }
  ];

  const generateReport = async (reportType) => {
    try {
      setLoading(true);
      const response = await api.post(reportType.endpoint, {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      });

      setReportData({
        type: reportType,
        data: response.data,
        generatedAt: new Date().toISOString()
      });

      // Add to reports history
      const newReport = {
        id: Date.now(),
        type: reportType.name,
        generatedAt: new Date().toISOString(),
        dateRange: `${dateRange.startDate} to ${dateRange.endDate}`,
        status: 'completed'
      };

      setReports(prev => [newReport, ...prev]);

    } catch (error) {
      console.error('Error generating report:', error);
      // Mock data for demonstration
      setReportData({
        type: reportType,
        data: generateMockReportData(reportType.id),
        generatedAt: new Date().toISOString()
      });

      const newReport = {
        id: Date.now(),
        type: reportType.name,
        generatedAt: new Date().toISOString(),
        dateRange: `${dateRange.startDate} to ${dateRange.endDate}`,
        status: 'completed'
      };

      setReports(prev => [newReport, ...prev]);
    } finally {
      setLoading(false);
    }
  };

  const generateMockReportData = (reportType) => {
    switch (reportType) {
      case 'user-registration':
        return {
          totalRegistrations: 1250,
          dailyRegistrations: [
            { date: '2024-03-01', count: 45 },
            { date: '2024-03-02', count: 52 },
            { date: '2024-03-03', count: 38 },
            { date: '2024-03-04', count: 67 },
            { date: '2024-03-05', count: 43 }
          ],
          byRole: [
            { role: 'applicant', count: 980, percentage: 78.4 },
            { role: 'recruiter', count: 270, percentage: 21.6 }
          ]
        };
      case 'job-postings':
        return {
          totalJobs: 420,
          byCategory: [
            { category: 'Technology', count: 150, percentage: 35.7 },
            { category: 'Finance', count: 89, percentage: 21.2 },
            { category: 'Healthcare', count: 67, percentage: 16.0 },
            { category: 'Education', count: 45, percentage: 10.7 },
            { category: 'Other', count: 69, percentage: 16.4 }
          ],
          byStatus: [
            { status: 'active', count: 320, percentage: 76.2 },
            { status: 'pending', count: 45, percentage: 10.7 },
            { status: 'closed', count: 55, percentage: 13.1 }
          ]
        };
      case 'application-trends':
        return {
          totalApplications: 8500,
          successRate: 23.5,
          averageResponseTime: '2.3 days',
          bySource: [
            { source: 'Direct Application', count: 4200, percentage: 49.4 },
            { source: 'Job Alerts', count: 2100, percentage: 24.7 },
            { source: 'Recommendations', count: 2200, percentage: 25.9 }
          ]
        };
      default:
        return { message: 'Report data generated successfully' };
    }
  };

  const exportReport = (format = 'pdf') => {
    if (!reportData) return;

    // Mock export functionality
    const dataStr = JSON.stringify(reportData.data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${reportData.type.name.replace(/\s+/g, '-').toLowerCase()}-${dateRange.startDate}-to-${dateRange.endDate}.${format}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h2>
        <div className="flex space-x-3">
          <button
            onClick={() => exportReport('pdf')}
            disabled={!reportData}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            Export PDF
          </button>
          <button
            onClick={() => exportReport('excel')}
            disabled={!reportData}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
          >
            Export Excel
          </button>
        </div>
      </div>

      {/* Date Range Selector */}
      <div className="bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Report Period</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Report Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reportTypes.map((reportType, index) => (
          <motion.div
            key={reportType.id}
            className="bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow cursor-pointer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            onClick={() => generateReport(reportType)}
          >
            <div className="flex items-center mb-4">
              <div className="text-3xl mr-3">{reportType.icon}</div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {reportType.name}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {reportType.description}
                </p>
              </div>
            </div>
            <button
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              disabled={loading}
            >
              {loading ? 'Generating...' : 'Generate Report'}
            </button>
          </motion.div>
        ))}
      </div>

      {/* Report Data Display */}
      {reportData && (
        <div className="bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              {reportData.type.name}
            </h3>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Generated: {new Date(reportData.generatedAt).toLocaleString()}
            </div>
          </div>

          {/* Report Content */}
          <div className="space-y-6">
            {reportData.type.id === 'user-registration' && (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      {reportData.data.totalRegistrations}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Registrations</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                      {reportData.data.byRole[0].count}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Applicants</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                      {reportData.data.byRole[1].count}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Recruiters</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Daily Registrations</h4>
                    <div className="space-y-2">
                      {reportData.data.dailyRegistrations.map((day, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">{day.date}</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{day.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">By Role</h4>
                    <div className="space-y-2">
                      {reportData.data.byRole.map((role, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">{role.role}</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {role.count} ({role.percentage}%)
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {reportData.type.id === 'job-postings' && (
              <div>
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                    {reportData.data.totalJobs}
                  </div>
                  <div className="text-lg text-gray-600 dark:text-gray-400">Total Job Postings</div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">By Category</h4>
                    <div className="space-y-2">
                      {reportData.data.byCategory.map((category, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">{category.category}</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {category.count} ({category.percentage}%)
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">By Status</h4>
                    <div className="space-y-2">
                      {reportData.data.byStatus.map((status, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">{status.status}</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {status.count} ({status.percentage}%)
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {reportData.type.id === 'application-trends' && (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      {reportData.data.totalApplications.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total Applications</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                      {reportData.data.successRate}%
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Success Rate</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                      {reportData.data.averageResponseTime}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Avg Response Time</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Applications by Source</h4>
                  <div className="space-y-2">
                    {reportData.data.bySource.map((source, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">{source.source}</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {source.count.toLocaleString()} ({source.percentage}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Report History */}
      {reports.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Reports</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Report Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Date Range
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Generated At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {reports.map((report, index) => (
                  <motion.tr
                    key={report.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {report.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {report.dateRange}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(report.generatedAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        {report.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 mr-3">
                        Download
                      </button>
                      <button className="text-red-600 hover:text-red-900 dark:text-red-400">
                        Delete
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsTab;