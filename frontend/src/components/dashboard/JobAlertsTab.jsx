import React, { useState } from 'react';
import { motion } from 'framer-motion';

const JobAlertsTab = () => {
  const [alerts, setAlerts] = useState([
    {
      id: 1,
      title: 'Frontend Developer Jobs',
      keywords: ['React', 'JavaScript', 'Frontend'],
      location: 'Mumbai, India',
      salaryRange: '₹8-15 LPA',
      frequency: 'daily',
      isActive: true,
      matchingJobs: 12,
      lastNotified: '2024-03-20'
    },
    {
      id: 2,
      title: 'Full Stack Developer Remote',
      keywords: ['Full Stack', 'Node.js', 'React'],
      location: 'Remote',
      salaryRange: '₹10-20 LPA',
      frequency: 'weekly',
      isActive: true,
      matchingJobs: 8,
      lastNotified: '2024-03-18'
    },
    {
      id: 3,
      title: 'Senior Developer Bangalore',
      keywords: ['Senior', 'Python', 'Django'],
      location: 'Bangalore, India',
      salaryRange: '₹15-25 LPA',
      frequency: 'daily',
      isActive: false,
      matchingJobs: 5,
      lastNotified: '2024-03-15'
    }
  ]);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newAlert, setNewAlert] = useState({
    title: '',
    keywords: [],
    location: '',
    salaryRange: '',
    frequency: 'daily'
  });

  const recentJobs = [
    {
      id: 1,
      title: 'Senior React Developer',
      company: 'TechCorp India',
      location: 'Mumbai, India',
      salary: '₹12-18 LPA',
      postedDate: '2 hours ago',
      matchedAlert: 'Frontend Developer Jobs'
    },
    {
      id: 2,
      title: 'Full Stack Engineer',
      company: 'StartupXYZ',
      location: 'Remote',
      salary: '₹15-22 LPA',
      postedDate: '4 hours ago',
      matchedAlert: 'Full Stack Developer Remote'
    },
    {
      id: 3,
      title: 'Frontend Developer',
      company: 'WebSolutions',
      location: 'Mumbai, India',
      salary: '₹10-16 LPA',
      postedDate: '6 hours ago',
      matchedAlert: 'Frontend Developer Jobs'
    }
  ];

  const toggleAlert = (id) => {
    setAlerts(alerts.map(alert => 
      alert.id === id ? { ...alert, isActive: !alert.isActive } : alert
    ));
  };

  const deleteAlert = (id) => {
    setAlerts(alerts.filter(alert => alert.id !== id));
  };

  const createAlert = () => {
    if (newAlert.title && newAlert.keywords.length > 0) {
      const alert = {
        id: Date.now(),
        ...newAlert,
        isActive: true,
        matchingJobs: Math.floor(Math.random() * 20),
        lastNotified: new Date().toISOString().split('T')[0]
      };
      setAlerts([...alerts, alert]);
      setNewAlert({
        title: '',
        keywords: [],
        location: '',
        salaryRange: '',
        frequency: 'daily'
      });
      setShowCreateForm(false);
    }
  };

  const addKeyword = (keyword) => {
    if (keyword.trim() && !newAlert.keywords.includes(keyword.trim())) {
      setNewAlert({
        ...newAlert,
        keywords: [...newAlert.keywords, keyword.trim()]
      });
    }
  };

  const removeKeyword = (keyword) => {
    setNewAlert({
      ...newAlert,
      keywords: newAlert.keywords.filter(k => k !== keyword)
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Job Alerts</h2>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Create New Alert
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <span className="text-2xl">🔔</span>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Active Alerts</h3>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {alerts.filter(a => a.isActive).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
              <span className="text-2xl">💼</span>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Matching Jobs</h3>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {alerts.reduce((sum, alert) => sum + (alert.isActive ? alert.matchingJobs : 0), 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <span className="text-2xl">📧</span>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">This Week</h3>
              <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">24</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <span className="text-2xl">⚡</span>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Success Rate</h3>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">78%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Create Alert Form */}
      {showCreateForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Create Job Alert</h3>
            <button
              onClick={() => setShowCreateForm(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Alert Title
              </label>
              <input
                type="text"
                value={newAlert.title}
                onChange={(e) => setNewAlert({ ...newAlert, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="e.g., Frontend Developer Jobs"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Location
              </label>
              <input
                type="text"
                value={newAlert.location}
                onChange={(e) => setNewAlert({ ...newAlert, location: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="e.g., Mumbai, India or Remote"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Salary Range
              </label>
              <input
                type="text"
                value={newAlert.salaryRange}
                onChange={(e) => setNewAlert({ ...newAlert, salaryRange: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="e.g., ₹8-15 LPA"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Frequency
              </label>
              <select
                value={newAlert.frequency}
                onChange={(e) => setNewAlert({ ...newAlert, frequency: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Keywords
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {newAlert.keywords.map((keyword, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm flex items-center"
                >
                  {keyword}
                  <button
                    onClick={() => removeKeyword(keyword)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Add keyword..."
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    addKeyword(e.target.value);
                    e.target.value = '';
                  }
                }}
              />
              <button
                onClick={(e) => {
                  const input = e.target.previousElementSibling;
                  addKeyword(input.value);
                  input.value = '';
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Add
              </button>
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => setShowCreateForm(false)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={createAlert}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Alert
            </button>
          </div>
        </motion.div>
      )}

      {/* Job Alerts List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Your Job Alerts</h3>
        </div>
        
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {alerts.map((alert, index) => (
            <motion.div
              key={alert.id}
              className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                      {alert.title}
                    </h4>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      alert.isActive 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                    }`}>
                      {alert.isActive ? 'Active' : 'Paused'}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-2">
                    {alert.keywords.map((keyword, keywordIndex) => (
                      <span
                        key={keywordIndex}
                        className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-sm"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                  
                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <p>📍 {alert.location}</p>
                    <p>💰 {alert.salaryRange}</p>
                    <p>🔔 {alert.frequency} notifications • {alert.matchingJobs} matching jobs</p>
                    <p>📅 Last notified: {alert.lastNotified}</p>
                  </div>
                </div>
                
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => toggleAlert(alert.id)}
                    className={`px-3 py-1 text-sm rounded transition-colors ${
                      alert.isActive
                        ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    {alert.isActive ? 'Pause' : 'Resume'}
                  </button>
                  <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors">
                    Edit
                  </button>
                  <button
                    onClick={() => deleteAlert(alert.id)}
                    className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent Job Matches */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Job Matches</h3>
        </div>
        
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {recentJobs.map((job, index) => (
            <motion.div
              key={job.id}
              className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                    {job.title}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    {job.company} • {job.location}
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                    <span>💰 {job.salary}</span>
                    <span>⏰ {job.postedDate}</span>
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs">
                      Matched: {job.matchedAlert}
                    </span>
                  </div>
                </div>
                
                <div className="flex space-x-2 ml-4">
                  <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors">
                    View Job
                  </button>
                  <button className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors">
                    Apply Now
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default JobAlertsTab;
