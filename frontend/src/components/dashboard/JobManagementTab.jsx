import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import api from '../../services/api';

const JobManagementTab = () => {
  const [location] = useLocation();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedJob, setSelectedJob] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [stats, setStats] = useState({});

  // Read tab parameter from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam && ['all', 'active', 'draft', 'closed', 'expired'].includes(tabParam)) {
      setActiveTab(tabParam);
      console.log('🔍 JobManagementTab - Set active tab from URL:', tabParam);
    }
  }, [location]);

  useEffect(() => {
    fetchJobs();
    fetchStats();
  }, [activeTab]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching jobs for tab:', activeTab);
      
      // Build query parameters based on active tab
      const params = new URLSearchParams();
      if (activeTab !== 'all') {
        params.append('status', activeTab);
      }
      
      const response = await api.get(`/admin/jobs?${params.toString()}`);
      console.log('✅ Jobs fetched:', response.data);
      
      if (response.data.success) {
        setJobs(response.data.data || []);
      } else {
        throw new Error(response.data.message || 'Failed to fetch jobs');
      }
    } catch (error) {
      console.error('❌ Error fetching jobs:', error);
      // Fallback to empty array
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/jobs/stats');
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('❌ Error fetching job stats:', error);
      setStats({
        totalJobs: 0,
        activeJobs: 0,
        draftJobs: 0,
        closedJobs: 0,
        expiredJobs: 0,
        totalApplications: 0
      });
    }
  };

  const handleApproveJob = async (jobId) => {
    try {
      console.log('🔍 Approving job:', jobId);
      const response = await api.post(`/admin/jobs/${jobId}/approve`, {
        reason: 'Approved by admin'
      });
      
      if (response.data.success) {
        console.log('✅ Job approved successfully');
        // Refresh the job list to get updated data from database
        await fetchJobs();
        await fetchStats();
        alert('Job approved successfully!');
      } else {
        throw new Error(response.data.message || 'Failed to approve job');
      }
    } catch (error) {
      console.error('❌ Error approving job:', error);
      alert(`Error approving job: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleRejectJob = async (jobId) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;
    
    try {
      console.log('🔍 Rejecting job:', jobId);
      const response = await api.post(`/admin/jobs/${jobId}/reject`, {
        reason: reason
      });
      
      if (response.data.success) {
        console.log('✅ Job rejected successfully');
        // Refresh the job list to get updated data from database
        await fetchJobs();
        await fetchStats();
        alert('Job rejected successfully!');
      } else {
        throw new Error(response.data.message || 'Failed to reject job');
      }
    } catch (error) {
      console.error('❌ Error rejecting job:', error);
      alert(`Error rejecting job: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (window.confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
      try {
        console.log('🔍 Deleting job:', jobId);
        const response = await api.delete(`/admin/jobs/${jobId}`);
        
        if (response.data.success) {
          console.log('✅ Job deleted successfully');
          // Refresh the job list to get updated data from database
          await fetchJobs();
          await fetchStats();
          alert('Job deleted successfully!');
        } else {
          throw new Error(response.data.message || 'Failed to delete job');
        }
      } catch (error) {
        console.error('❌ Error deleting job:', error);
        alert(`Error deleting job: ${error.response?.data?.message || error.message}`);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'closed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'expired':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const tabs = [
    { id: 'all', label: 'All Jobs', count: stats.totalJobs || 0 },
    { id: 'active', label: 'Active', count: stats.activeJobs || 0 },
    { id: 'draft', label: 'Draft', count: stats.draftJobs || 0 },
    { id: 'closed', label: 'Closed', count: stats.closedJobs || 0 },
    { id: 'expired', label: 'Expired', count: stats.expiredJobs || 0 }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Job Management</h2>
        <div className="flex space-x-3">
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            Export Jobs
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Add Job
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              {tab.label}
              <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                activeTab === tab.id
                  ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
                  : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <span className="text-2xl">💼</span>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Total Jobs</h3>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.totalJobs || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
              <span className="text-2xl">✅</span>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Active Jobs</h3>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {stats.activeJobs || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <span className="text-2xl">📝</span>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Draft Jobs</h3>
              <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                {stats.draftJobs || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <span className="text-2xl">📊</span>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Applications</h3>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {stats.totalApplications || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {activeTab === 'all' ? 'All Jobs' : 
             activeTab === 'active' ? 'Active Jobs' :
             activeTab === 'draft' ? 'Draft Jobs' :
             activeTab === 'closed' ? 'Closed Jobs' : 'Expired Jobs'}
          </h3>
          <div className="flex items-center space-x-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by title, company, or location..."
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white w-64"
            />
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {filteredJobs.length} jobs found
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Jobs ({filteredJobs.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Job Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Company & Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Applications
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Posted Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredJobs.map((job, index) => (
                <motion.tr
                  key={job.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {job.title}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {job.jobType} • {job.workArrangement}
                      </div>
                      <div className="text-xs text-gray-400 dark:text-gray-500">
                        {job.salary}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {job.company}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {job.location}
                      </div>
                      {job.recruiter && (
                        <div className="text-xs text-gray-400 dark:text-gray-500">
                          By: {job.recruiter.name}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                      {job.status}
                    </span>
                    {job.jobUrgency !== 'Normal Priority' && (
                      <div className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                        {job.jobUrgency}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    <div className="flex items-center">
                      <span className="text-lg font-semibold">{job.applications}</span>
                      <span className="text-xs text-gray-500 ml-1">apps</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    <div>
                      <div>{job.postedDate}</div>
                      {job.deadline && (
                        <div className="text-xs text-red-500">
                          Deadline: {job.deadline}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {job.status === 'draft' && (
                      <button
                        onClick={() => handleApproveJob(job.id)}
                        className="text-green-600 hover:text-green-900 dark:text-green-400 mr-3"
                      >
                        Approve
                      </button>
                    )}
                    {(job.status === 'draft' || job.status === 'active') && (
                      <button
                        onClick={() => handleRejectJob(job.id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 mr-3"
                      >
                        Reject
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setSelectedJob(job);
                        setShowModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 mr-3"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleDeleteJob(job.id)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400"
                    >
                      Delete
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Job Details Modal */}
      {showModal && selectedJob && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Job Details
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Title:</label>
                  <p className="text-gray-900 dark:text-white">{selectedJob.title}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Company:</label>
                  <p className="text-gray-900 dark:text-white">{selectedJob.company}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Location:</label>
                  <p className="text-gray-900 dark:text-white">{selectedJob.location}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status:</label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedJob.status)}`}>
                    {selectedJob.status}
                  </span>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Applications:</label>
                  <p className="text-gray-900 dark:text-white">{selectedJob.applications}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Salary:</label>
                  <p className="text-gray-900 dark:text-white">{selectedJob.salary}</p>
                </div>
                {selectedJob.recruiter && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Recruiter:</label>
                    <p className="text-gray-900 dark:text-white">{selectedJob.recruiter.name}</p>
                    <p className="text-sm text-gray-500">{selectedJob.recruiter.email}</p>
                  </div>
                )}
              </div>
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobManagementTab;
