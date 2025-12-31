import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getJobAlerts, createJobAlert, updateJobAlert, deleteJobAlert, getJobMatches } from "../../../api/jobAlerts";
import { getRecommendedJobs } from "../../../api/recommendations";
import { createNotification } from "../../../api/notifications";
import { useAuth } from "../../../contexts/AuthContext";
import jobRecommendationService, { startAutoJobMatching, stopAutoJobMatching } from "../../../services/jobRecommendationService";

const JobAlerts = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [jobMatches, setJobMatches] = useState([]);

  const [showNewAlert, setShowNewAlert] = useState(false);
  const [newAlert, setNewAlert] = useState({
    name: "",
    keywords: [],
    locations: [],
    salary: "",
    frequency: "daily",
  });

  // Fetch job alerts and recommendations on component mount
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        console.log('🔍 Fetching job alerts and recommendations for user:', user.id);
        
        // Fetch job alerts
        const alertsResponse = await getJobAlerts();
        console.log('✅ Job alerts fetched:', alertsResponse);
        setAlerts(alertsResponse.data || []);
        
        // Fetch job matches
        const matchesResponse = await getJobMatches(20);
        console.log('✅ Job matches fetched:', matchesResponse);
        setJobMatches(matchesResponse.data || []);
        
        // Fetch recommended jobs
        const recommendationsResponse = await getRecommendedJobs({ limit: 10, minMatchPercentage: 50 });
        console.log('✅ Recommended jobs fetched:', recommendationsResponse);
        setRecommendedJobs(recommendationsResponse.data?.jobs || []);
        
        // Send notifications for new job matches
        await sendJobMatchNotifications(recommendationsResponse.data?.jobs || []);
        
        // Start auto job matching service
        if (user?.id) {
          startAutoJobMatching(user.id);
        }
        
      } catch (error) {
        console.error('❌ Error fetching job data:', error);
        setError('Failed to load job alerts and recommendations');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Cleanup function to stop auto matching when component unmounts
    return () => {
      stopAutoJobMatching();
    };
  }, [user]);

  // Send notifications for job matches
  const sendJobMatchNotifications = async (jobs) => {
    if (!jobs || jobs.length === 0) return;
    
    try {
      console.log('📨 Sending job match notifications for', jobs.length, 'jobs');
      
      // Filter high-match jobs (>70% match)
      const highMatchJobs = jobs.filter(job => job.matchScore?.overall > 70);
      
      for (const job of highMatchJobs.slice(0, 3)) { // Limit to 3 notifications
        await createNotification({
          recipientId: user.id,
          recipientType: 'applicant',
          type: 'job_match',
          title: 'New Job Match Found!',
          message: `We found a ${job.matchScore.overall}% match for "${job.title}" at ${job.company}`,
          data: {
            jobId: job.id,
            matchScore: job.matchScore.overall,
            actionUrl: `/jobs/${job.id}`
          },
          priority: 'high',
          channels: ['in_app', 'email']
        });
      }
      
      console.log('✅ Job match notifications sent for', highMatchJobs.length, 'high-match jobs');
    } catch (error) {
      console.error('❌ Error sending job match notifications:', error);
    }
  };

  const handleToggleAlert = async (id) => {
    try {
      const alert = alerts.find(a => a.id === id);
      const updatedAlert = { ...alert, active: !alert.active };
      
      await updateJobAlert(id, updatedAlert);
      
      setAlerts((prev) =>
        prev.map((alert) =>
          alert.id === id ? updatedAlert : alert
        )
      );
      
      console.log('✅ Job alert toggled:', updatedAlert);
    } catch (error) {
      console.error('❌ Error toggling job alert:', error);
      alert('Failed to update job alert');
    }
  };

  const handleDeleteAlert = async (id) => {
    try {
      await deleteJobAlert(id);
      setAlerts((prev) => prev.filter((alert) => alert.id !== id));
      console.log('✅ Job alert deleted:', id);
    } catch (error) {
      console.error('❌ Error deleting job alert:', error);
      alert('Failed to delete job alert');
    }
  };

  const handleAddAlert = async () => {
    try {
      const alertData = {
        ...newAlert,
        active: true,
        userId: user.id
      };
      
      const response = await createJobAlert(alertData);
      
      setAlerts((prev) => [
        ...prev,
        response.data
      ]);
      
      setShowNewAlert(false);
      setNewAlert({
        name: "",
        keywords: [],
        locations: [],
        salary: "",
        frequency: "daily",
      });
      
      console.log('✅ Job alert created:', response.data);
    } catch (error) {
      console.error('❌ Error creating job alert:', error);
      alert('Failed to create job alert');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Job Matching Dashboard */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            🎯 Smart Job Matching
          </h2>
          <button
            onClick={() => window.testJobMatching?.(user?.id)}
            className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
          >
            Test Matching
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-600">{recommendedJobs.length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Recommended Jobs</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600">{jobMatches.length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Job Matches</div>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-600">{alerts.length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Active Alerts</div>
          </div>
        </div>

        {/* Top Recommended Jobs */}
        {recommendedJobs.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
              🌟 Top Recommendations
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendedJobs.slice(0, 4).map((job) => (
                <div key={job.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-gray-900 dark:text-white">{job.title}</h4>
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      {job.matchScore?.overall || 0}% match
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{job.company}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">{job.location}</p>
                  <div className="mt-2 flex items-center space-x-2">
                    <button 
                      onClick={() => window.open(`/jobs/${job.id}`, '_blank')}
                      className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                    >
                      View Job
                    </button>
                    <span className="text-xs text-gray-500">
                      Skills: {job.matchScore?.skills?.matchPercentage || 0}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Job Alerts Section */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Job Alerts</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => window.clearJobNotifications?.()}
            className="px-3 py-2 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
          >
            Clear History
          </button>
          <button
            onClick={() => setShowNewAlert(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Create New Alert
          </button>
        </div>
      </div>

      {/* New Alert Form */}
      {showNewAlert && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
        >
          <h3 className="text-lg font-medium mb-4">Create New Job Alert</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Alert Name
              </label>
              <input
                type="text"
                value={newAlert.name}
                onChange={(e) =>
                  setNewAlert((prev) => ({ ...prev, name: e.target.value }))
                }
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Senior Developer Positions"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Keywords</label>
              <input
                type="text"
                value={newAlert.keywords.join(", ")}
                onChange={(e) =>
                  setNewAlert((prev) => ({
                    ...prev,
                    keywords: e.target.value.split(",").map((k) => k.trim()),
                  }))
                }
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="React, TypeScript, Frontend"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Locations
              </label>
              <input
                type="text"
                value={newAlert.locations.join(", ")}
                onChange={(e) =>
                  setNewAlert((prev) => ({
                    ...prev,
                    locations: e.target.value.split(",").map((l) => l.trim()),
                  }))
                }
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Remote, New York, San Francisco"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Minimum Salary
              </label>
              <input
                type="text"
                value={newAlert.salary}
                onChange={(e) =>
                  setNewAlert((prev) => ({ ...prev, salary: e.target.value }))
                }
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., $100k+"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Frequency
              </label>
              <select
                value={newAlert.frequency}
                onChange={(e) =>
                  setNewAlert((prev) => ({
                    ...prev,
                    frequency: e.target.value,
                  }))
                }
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="instant">Instant</option>
              </select>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowNewAlert(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddAlert}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create Alert
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Alerts List */}
      <div className="space-y-4">
        {alerts.map((alert, index) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-medium">{alert.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {alert.matches} matches in the last 7 days
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleToggleAlert(alert.id)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full
                    ${alert.active ? "bg-blue-600" : "bg-gray-200"}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition
                      ${alert.active ? "translate-x-6" : "translate-x-1"}`}
                  />
                </button>
                <button
                  onClick={() => handleDeleteAlert(alert.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <span className="sr-only">Delete</span>
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Keywords</h4>
                <div className="mt-1 flex flex-wrap gap-2">
                  {alert.keywords.map((keyword) => (
                    <span
                      key={keyword}
                      className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Locations</h4>
                <div className="mt-1 flex flex-wrap gap-2">
                  {alert.locations.map((location) => (
                    <span
                      key={location}
                      className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                    >
                      {location}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">
                  Minimum Salary
                </h4>
                <p className="mt-1">{alert.salary}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Frequency</h4>
                <p className="mt-1 capitalize">{alert.frequency}</p>
              </div>
            </div>

            <div className="mt-4 text-sm text-gray-500">
              Last updated: {new Date(alert.lastTriggered).toLocaleDateString()}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {alerts.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔔</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            No job alerts set
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Create your first job alert to get notified about new matching
            positions
          </p>
          <button
            onClick={() => setShowNewAlert(true)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Create First Alert
          </button>
        </div>
      )}
    </div>
  );
};

export default JobAlerts;
