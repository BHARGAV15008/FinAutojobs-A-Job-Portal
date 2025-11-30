import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import applicationService from '../../services/applicationService';
import { useDashboard } from '../../contexts/RealDashboardContext';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/IntegratedThemeContext';

const RealApplicationsTab = () => {
  const { user } = useAuth();
  const { refreshStats } = useDashboard();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [viewDetailsModal, setViewDetailsModal] = useState(false);
  const [statusUpdateModal, setStatusUpdateModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);

  // Status filters
  const statusFilters = [
    { label: 'All Applications', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'Under Review', value: 'under_review' },
    { label: 'Shortlisted', value: 'shortlisted' },
    { label: 'Interviewed', value: 'interviewed' },
    { label: 'Accepted', value: 'accepted' },
    { label: 'Rejected', value: 'rejected' },
  ];

  // Fetch applications for recruiter
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        console.log('🔍 Fetching applications for recruiter:', user?.userId);
        
        // Get applications for recruiter's jobs (role-based filtering handled by backend)
        const response = await applicationService.getUserApplications(50, 1);
        console.log('✅ Applications fetched:', response);
        
        if (response.success) {
          setApplications(response.data?.applications || []);
        } else {
          setError('Failed to fetch applications');
        }
      } catch (error) {
        console.error('❌ Error fetching applications:', error);
        setError('Error loading applications');
      } finally {
        setLoading(false);
      }
    };

    if (user?.userId) {
      fetchApplications();
    }
  }, [user]);

  // Filter applications by status
  const filteredApplications = applications.filter(app => {
    const currentFilter = statusFilters[selectedTab];
    if (currentFilter.value === 'all') return true;
    return app.status === currentFilter.value;
  });

  // Handle status update
  const handleStatusUpdate = async () => {
    try {
      console.log('🔄 Updating application status:', {
        applicationId: selectedApplication._id,
        status: newStatus,
        notes
      });

      const response = await applicationService.updateApplicationStatus(
        selectedApplication._id,
        newStatus,
        notes
      );

      if (response.success) {
        // Update local state
        setApplications(prev => prev.map(app => 
          app._id === selectedApplication._id 
            ? { ...app, status: newStatus, recruiterNotes: notes }
            : app
        ));
        
        // Refresh dashboard stats to reflect the status change
        if (refreshStats) {
          refreshStats();
        }
        
        setStatusUpdateModal(false);
        setSelectedApplication(null);
        setNewStatus('');
        setNotes('');
        
        console.log('✅ Application status updated successfully');
      }
    } catch (error) {
      console.error('❌ Error updating application status:', error);
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      under_review: 'info',
      shortlisted: 'primary',
      interviewed: 'secondary',
      accepted: 'success',
      rejected: 'error',
    };
    return colors[status] || 'default';
  };

  // Get status icon
  const getStatusIcon = (status) => {
    const icons = {
      pending: <Schedule />,
      under_review: <Visibility />,
      shortlisted: <Star />,
      interviewed: <Person />,
      accepted: <CheckCircle />,
      rejected: <Cancel />,
    };
    return icons[status] || <Schedule />;
  };

  const { darkMode } = useTheme();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mr-4"></div>
        <p className="text-lg text-gray-600 dark:text-gray-400">Loading applications...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 m-4">
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span className="text-3xl">👥</span> Applicants Management
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage and track potential Applicants
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium">
            📋 Table View
          </button>
          <button className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200 text-sm font-medium">
            📊 Card View
          </button>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex flex-wrap gap-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
        {statusFilters.map((filter, index) => {
          const count = filter.value === 'all' 
            ? applications.length 
            : applications.filter(app => app.status === filter.value).length;
          
          return (
            <motion.button
              key={filter.value}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                selectedTab === index 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedTab(index)}
            >
              {filter.label}
              <span className="ml-2 px-2 py-1 bg-gray-200 dark:bg-gray-600 text-xs rounded-full">
                {count}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Applications Table */}
      {filteredApplications.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center border border-gray-200 dark:border-gray-700">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No applications found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {selectedTab === 0 
              ? "You haven't received any applications yet."
              : `No applications with status: ${statusFilters[selectedTab].label}`
            }
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full table-fixed" style={{ minWidth: '1200px' }}>
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider" style={{ width: '20%' }}>Candidate</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider" style={{ width: '12%' }}>Skills</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider" style={{ width: '20%' }}>Applied For</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider" style={{ width: '10%' }}>Experience</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider" style={{ width: '12%' }}>Expected Salary</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider" style={{ width: '10%' }}>Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider" style={{ width: '16%' }}>Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredApplications.map((application, index) => (
                  <motion.tr
                    key={application._id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-lg font-semibold text-blue-600 dark:text-blue-300">
                            {application.applicantSnapshot?.fullName?.charAt(0) || 'A'}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {application.applicantSnapshot?.fullName || 'Unknown Applicant'}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {application.applicantSnapshot?.email}
                          </div>
                          <div className="text-xs text-gray-400 dark:text-gray-500">
                            📍 {application.applicantSnapshot?.location || 'Not specified'}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-4 py-4">
                      <div className="flex flex-wrap gap-1 max-w-full">
                        {(application.applicantSnapshot?.skills || application.applicationData?.primarySkills || []).slice(0, 2).map((skill, skillIndex) => (
                          <span key={skillIndex} className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs rounded whitespace-nowrap">
                            {skill}
                          </span>
                        ))}
                        {(application.applicantSnapshot?.skills || application.applicationData?.primarySkills || []).length > 2 && (
                          <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">+{(application.applicantSnapshot?.skills || application.applicationData?.primarySkills || []).length - 2}</span>
                        )}
                        {!(application.applicantSnapshot?.skills || application.applicationData?.primarySkills)?.length && (
                          <span className="text-xs text-gray-400 dark:text-gray-500">None</span>
                        )}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white truncate" title={application.jobSnapshot?.title}>
                        {application.jobSnapshot?.title || 'Unknown Position'}
                      </div>
                      <div className="text-xs text-gray-400 dark:text-gray-500 mt-1 truncate" title={`${application.jobSnapshot?.company} • Applied: ${new Date(application.appliedAt).toLocaleDateString()}`}>
                        {application.jobSnapshot?.company || 'Company not specified'} • {new Date(application.appliedAt).toLocaleDateString()}
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {application.applicantSnapshot?.experience || application.applicantSnapshot?.yearsOfExperience || application.applicationData?.experience || 'Not specified'}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {application.applicantSnapshot?.expectedSalary || application.applicationData?.expectedSalary || 'Not specified'}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        application.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                        application.status === 'under_review' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                        application.status === 'shortlisted' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                        application.status === 'interviewed' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200' :
                        application.status === 'accepted' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        application.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                        'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                      }`}>
                        {application.status === 'pending' ? 'Pending' :
                         application.status === 'under_review' ? 'Under Review' :
                         application.status === 'shortlisted' ? 'Shortlisted' :
                         application.status === 'interviewed' ? 'Interviewed' :
                         application.status === 'accepted' ? 'Accepted' :
                         application.status === 'rejected' ? 'Rejected' :
                         application.status}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <motion.button
                          className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors duration-200"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            setSelectedApplication(application);
                            setViewDetailsModal(true);
                          }}
                          title="View Profile"
                        >
                          <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </motion.button>
                        
                        <motion.button
                          className="p-2 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors duration-200"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          title="Contact"
                        >
                          <svg className="w-5 h-5 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </motion.button>
                        
                        <motion.button
                          className="p-2 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors duration-200"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => console.log("Download resume for", application._id)}
                          title="Download Resume"
                        >
                          <svg className="w-5 h-5 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </motion.button>
                        
                        <motion.button
                          className="p-2 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors duration-200"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            setSelectedApplication(application);
                            setNewStatus(application.status);
                            setStatusUpdateModal(true);
                          }}
                          title="Update Status"
                        >
                          <svg className="w-5 h-5 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="text-center text-gray-600 dark:text-gray-400 mt-4">
        Showing {filteredApplications.length} of {applications.length} candidates
      </div>

      {/* View Details Modal */}
      {viewDetailsModal && selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            className="bg-white dark:bg-gray-800 rounded-lg max-w-[95vw] sm:max-w-[460px] md:max-w-[490px] lg:max-w-[510px] w-full max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Application Details</h3>
                <button
                  onClick={() => setViewDetailsModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Applicant Information</h4>
                  <div className="space-y-2">
                    <p className="text-sm"><strong className="text-gray-700 dark:text-gray-300">Name:</strong> <span className="text-gray-900 dark:text-white">{selectedApplication.applicantSnapshot?.fullName}</span></p>
                    <p className="text-sm"><strong className="text-gray-700 dark:text-gray-300">Email:</strong> <span className="text-gray-900 dark:text-white">{selectedApplication.applicantSnapshot?.email}</span></p>
                    <p className="text-sm"><strong className="text-gray-700 dark:text-gray-300">Phone:</strong> <span className="text-gray-900 dark:text-white">{selectedApplication.applicantSnapshot?.phone}</span></p>
                    <p className="text-sm"><strong className="text-gray-700 dark:text-gray-300">Location:</strong> <span className="text-gray-900 dark:text-white">{selectedApplication.applicantSnapshot?.location}</span></p>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Job Information</h4>
                  <div className="space-y-2">
                    <p className="text-sm"><strong className="text-gray-700 dark:text-gray-300">Position:</strong> <span className="text-gray-900 dark:text-white">{selectedApplication.jobSnapshot?.title}</span></p>
                    <p className="text-sm"><strong className="text-gray-700 dark:text-gray-300">Company:</strong> <span className="text-gray-900 dark:text-white">{selectedApplication.jobSnapshot?.company}</span></p>
                    <p className="text-sm"><strong className="text-gray-700 dark:text-gray-300">Applied:</strong> <span className="text-gray-900 dark:text-white">{new Date(selectedApplication.appliedAt).toLocaleDateString()}</span></p>
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Professional Information</h4>
                  <div className="space-y-2">
                    <p className="text-sm"><strong className="text-gray-700 dark:text-gray-300">Experience:</strong> <span className="text-gray-900 dark:text-white">{selectedApplication.applicantSnapshot?.experience || selectedApplication.applicationData?.experience || 'Not specified'}</span></p>
                    <p className="text-sm"><strong className="text-gray-700 dark:text-gray-300">Current Job:</strong> <span className="text-gray-900 dark:text-white">{selectedApplication.applicantSnapshot?.currentJobTitle || selectedApplication.applicationData?.currentJobTitle || 'Not specified'}</span></p>
                    <p className="text-sm"><strong className="text-gray-700 dark:text-gray-300">Current Company:</strong> <span className="text-gray-900 dark:text-white">{selectedApplication.applicantSnapshot?.currentCompany || selectedApplication.applicationData?.currentCompany || 'Not specified'}</span></p>
                    <p className="text-sm"><strong className="text-gray-700 dark:text-gray-300">Expected Salary:</strong> <span className="text-gray-900 dark:text-white">{selectedApplication.applicantSnapshot?.expectedSalary || 'Not specified'}</span></p>
                    <p className="text-sm"><strong className="text-gray-700 dark:text-gray-300">Bio:</strong> <span className="text-gray-900 dark:text-white">{selectedApplication.applicantSnapshot?.bio || 'Not provided'}</span></p>
                    
                    {selectedApplication.applicantSnapshot?.coverLetter && (
                      <div className="mt-4">
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Cover Letter:</p>
                        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          <p className="text-sm text-gray-900 dark:text-white">{selectedApplication.applicantSnapshot.coverLetter}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setViewDetailsModal(false)}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Status Update Modal */}
      {statusUpdateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Update Application Status</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="pending">Pending</option>
                    <option value="under_review">Under Review</option>
                    <option value="shortlisted">Shortlisted</option>
                    <option value="interviewed">Interviewed</option>
                    <option value="accepted">Accepted</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notes (Optional)</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    placeholder="Add any notes about this status update..."
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
              
              <div className="mt-6 flex justify-end gap-2">
                <button
                  onClick={() => setStatusUpdateModal(false)}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStatusUpdate}
                  disabled={!newStatus}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Update Status
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default RealApplicationsTab;
