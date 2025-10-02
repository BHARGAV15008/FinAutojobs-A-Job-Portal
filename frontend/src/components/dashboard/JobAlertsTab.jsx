import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { 
  getJobAlerts, 
  createJobAlert, 
  updateJobAlert, 
  deleteJobAlert, 
  getJobMatches, 
  getJobAlertStats 
} from '../../api/jobAlerts';

const JobAlertsTab = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState(false);
  const [stats, setStats] = useState({
    activeAlerts: 0,
    matchingJobs: 0,
    weeklyNotifications: 0,
    successRate: 0
  });

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newAlert, setNewAlert] = useState({
    title: '',
    keywords: [],
    location: '',
    salaryRange: '',
    frequency: 'daily'
  });

  const [recentJobs, setRecentJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(true);

  // Fetch data on component mount
  useEffect(() => {
    // Add a small delay to prevent immediate logout on tab switch
    const timer = setTimeout(() => {
      fetchJobAlerts();
      fetchJobAlertStats();
      fetchRecentJobMatches();
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  const fetchJobAlerts = async () => {
    try {
      setLoading(true);
      const response = await getJobAlerts();
      if (response.success) {
        setAlerts(response.data);
      }
    } catch (error) {
      console.error('Error fetching job alerts:', error);
      setApiError(true);
      // Don't show error for 401 to prevent confusion during logout
      if (error.status !== 401) {
        toast.error('Job Alerts feature is not available yet');
      }
      // Set empty array to prevent loading forever
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchJobAlertStats = async () => {
    try {
      const response = await getJobAlertStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error fetching job alert stats:', error);
      // Keep default stats on error
    }
  };

  const fetchRecentJobMatches = async () => {
    try {
      setJobsLoading(true);
      const response = await getJobMatches(10);
      if (response.success) {
        setRecentJobs(response.data);
      }
    } catch (error) {
      console.error('Error fetching job matches:', error);
      // Set empty array to show empty state instead of loading forever
      setRecentJobs([]);
    } finally {
      setJobsLoading(false);
    }
  };

  const toggleAlert = async (id) => {
    try {
      const alert = alerts.find(a => a._id === id);
      if (!alert) return;

      const updatedAlert = { ...alert, isActive: !alert.isActive };
      const response = await updateJobAlert(id, updatedAlert);
      
      if (response.success) {
        setAlerts(alerts.map(alert => 
          alert._id === id ? response.data : alert
        ));
        toast.success(`Alert ${updatedAlert.isActive ? 'activated' : 'paused'} successfully`);
        fetchJobAlertStats(); // Refresh stats
      }
    } catch (error) {
      console.error('Error toggling alert:', error);
      toast.error('Failed to update alert');
    }
  };

  const handleDeleteAlert = async (id) => {
    if (!window.confirm('Are you sure you want to delete this job alert?')) {
      return;
    }

    try {
      const response = await deleteJobAlert(id);
      if (response.success) {
        setAlerts(alerts.filter(alert => alert._id !== id));
        toast.success('Job alert deleted successfully');
        fetchJobAlertStats(); // Refresh stats
      }
    } catch (error) {
      console.error('Error deleting alert:', error);
      toast.error('Failed to delete alert');
    }
  };

  const handleCreateAlert = async () => {
    console.log('🔍 Creating job alert with data:', newAlert);

    if (!newAlert.title || newAlert.keywords.length === 0) {
      console.log('❌ Validation failed - missing title or keywords');
      toast.error('Please provide title and at least one keyword');
      return;
    }

    try {
      // Parse salary range if provided
      let salaryRange = null;
      if (newAlert.salaryRange) {
        const salaryParts = newAlert.salaryRange.replace(/[₹L]/g, '').split('-');
        if (salaryParts.length === 2) {
          salaryRange = {
            min: parseInt(salaryParts[0]) * 100000, // Convert L to actual number
            max: parseInt(salaryParts[1]) * 100000,
            period: 'yearly'
          };
        }
      }

      const alertData = {
        title: newAlert.title,
        keywords: newAlert.keywords,
        location: newAlert.location,
        salaryRange,
        frequency: newAlert.frequency
      };

      console.log('🔍 Sending alert data to API:', alertData);

      const response = await createJobAlert(alertData);
      console.log('🔍 API response:', response);

      if (response.success) {
        setAlerts([...alerts, response.data]);
        setNewAlert({
          title: '',
          keywords: [],
          location: '',
          salaryRange: '',
          frequency: 'daily'
        });
        setShowCreateForm(false);
        toast.success('Job alert created successfully');
        fetchJobAlertStats(); // Refresh stats
        fetchRecentJobMatches(); // Refresh job matches
      } else {
        console.log('❌ API returned success: false');
        toast.error(response.message || 'Failed to create job alert');
      }
    } catch (error) {
      console.error('❌ Error creating alert:', error);
      console.error('❌ Error details:', error.response?.data);
      
      // Show more specific error message
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create job alert';
      toast.error(errorMessage);
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
          disabled={apiError}
        >
          Create New Alert
        </button>
      </div>

      {/* API Error Notice */}
      {apiError && (
        <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-yellow-600 dark:text-yellow-400 mr-3">
              ⚠️
            </div>
            <div>
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Job Alerts Feature Coming Soon
              </h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                The job alerts system is currently being set up. You can still browse and apply to jobs in the meantime.
              </p>
            </div>
          </div>
        </div>
      )}

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
                {loading ? '...' : stats.activeAlerts}
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
                {loading ? '...' : stats.matchingJobs}
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
              <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                {loading ? '...' : stats.weeklyNotifications}
              </p>
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
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {loading ? '...' : `${stats.successRate}%`}
              </p>
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
              onClick={handleCreateAlert}
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
          {loading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading job alerts...</p>
            </div>
          ) : alerts.length > 0 ? (
            alerts.map((alert, index) => (
            <motion.div
              key={alert._id}
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
                    <p>💰 {alert.salaryRange ? `₹${alert.salaryRange.min/100000}L - ₹${alert.salaryRange.max/100000}L ${alert.salaryRange.period}` : 'Any salary'}</p>
                    <p>🔔 {alert.frequency} notifications • {alert.matchingJobsCount || 0} matching jobs</p>
                    <p>📅 Last notified: {alert.lastNotified ? new Date(alert.lastNotified).toLocaleDateString() : 'Never'}</p>
                  </div>
                </div>
                
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => toggleAlert(alert._id)}
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
                    onClick={() => handleDeleteAlert(alert._id)}
                    className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ))
          ) : (
            <div className="p-6 text-center">
              <div className="text-4xl mb-2">🔔</div>
              <p className="text-gray-500 dark:text-gray-400">No job alerts yet</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Create your first job alert to get notified about matching opportunities
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Job Matches */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Job Matches</h3>
        </div>
        
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {jobsLoading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading job matches...</p>
            </div>
          ) : recentJobs.length > 0 ? (
            recentJobs.map((job, index) => (
            <motion.div
              key={job._id}
              className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                    {job.jobTitle || job.title}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    {job.postedBy?.companyInfo?.companyName || job.companyName || job.company} • {job.location}
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                    <span>💰 {job.salaryRange ? `₹${job.salaryRange.min/100000}L - ₹${job.salaryRange.max/100000}L` : 'Not disclosed'}</span>
                    <span>⏰ {new Date(job.createdAt).toLocaleDateString()}</span>
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-xs">
                      Matched: {job.matchedAlert}
                    </span>
                    {job.matchReasons && job.matchReasons.length > 0 && (
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded text-xs">
                        {job.matchReasons[0]}
                      </span>
                    )}
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
          ))
          ) : (
            <div className="p-6 text-center">
              <div className="text-4xl mb-2">🔍</div>
              <p className="text-gray-500 dark:text-gray-400">No job matches yet</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Create job alerts to get personalized job recommendations
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobAlertsTab;
