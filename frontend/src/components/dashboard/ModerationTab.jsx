import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { adminAPI } from '../../services/api';

const ModerationTab = () => {
  const [moderationItems, setModerationItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [stats, setStats] = useState({
    pending: 0,
    under_review: 0,
    resolved: 0,
    total: 0
  });
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    priority: 'all'
  });
  const [lastUpdated, setLastUpdated] = useState(null);
  const [processingItems, setProcessingItems] = useState(new Set());

  useEffect(() => {
    fetchModerationItems();
  }, [selectedStatus, selectedType, selectedPriority]);

  const fetchModerationItems = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching moderation items with filters:', {
        status: selectedStatus, 
        type: selectedType, 
        priority: selectedPriority 
      });
      
      const params = {};
      if (selectedStatus !== 'all') params.status = selectedStatus;
      if (selectedType !== 'all') params.type = selectedType;
      if (selectedPriority !== 'all') params.priority = selectedPriority;

      console.log('🔍 Making API call to fetch moderation items...');
      const response = await adminAPI.getModerationItems(params);
      console.log('🔍 Moderation items API response:', response);
      console.log('✅ Moderation items fetched:', response.data);
      
      if (response.data.success) {
        const data = response.data.data || {};
        const items = data.items || [];
        console.log('🔍 Setting moderation items:', items);
        console.log('🔍 Items count:', items.length);
        console.log('🔍 Items with non-resolved status:', items.filter(item => item.status !== 'resolved'));
        
        setModerationItems(items);
        setStats(data.stats || {
          pending: 0,
          under_review: 0,
          resolved: 0,
          total: 0
        });
        setLastUpdated(new Date());
      } else {
        throw new Error(response.data.message || 'Failed to fetch moderation items');
      }
    } catch (error) {
      console.error('❌ Error fetching moderation items:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      
      // Show user-friendly error message
      if (error.response?.status === 401) {
        alert('Authentication required. Please login as an admin to access moderation features.');
      } else if (error.response?.status === 403) {
        alert('Admin access required. You do not have permission to access moderation features.');
      } else {
        alert(`Failed to load moderation items: ${error.response?.data?.message || error.message}`);
      }
      
      // Fallback to mock data for development/testing
      console.log('🔄 Using fallback mock data for moderation items');
      const mockModerationItems = [
        {
          id: 'mock-1',
          type: 'job',
          title: 'Senior Financial Analyst - TechCorp Solutions',
          description: 'Flagged for review due to content or salary concerns',
          status: 'under_review',
          priority: 'medium',
          flaggedBy: 'Auto-Moderation',
          flaggedDate: '2025-10-01',
          flaggedReason: 'Suspicious salary range'
        },
        {
          id: 'mock-2',
          type: 'user',
          title: 'User Profile: john.doe@example.com',
          description: 'Reported for inappropriate profile content',
          status: 'pending',
          priority: 'high',
          flaggedBy: 'User Report',
          flaggedDate: '2025-10-02',
          flaggedReason: 'Inappropriate content'
        },
        {
          id: 'mock-3',
          type: 'job',
          title: 'Marketing Manager - StartupXYZ',
          description: 'Flagged for potential spam content',
          status: 'pending',
          priority: 'low',
          flaggedBy: 'Auto-Moderation',
          flaggedDate: '2025-10-03',
          flaggedReason: 'Duplicate posting'
        }
      ];
      
      setModerationItems(mockModerationItems);
      setStats({
        pending: mockModerationItems.filter(item => item.status === 'pending').length,
        under_review: mockModerationItems.filter(item => item.status === 'under_review').length,
        resolved: 45,
        total: mockModerationItems.length + 45
      });
      setLastUpdated(new Date());
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (itemId, itemType) => {
    // Prevent duplicate processing
    if (processingItems.has(itemId)) {
      console.log('⚠️ Item already being processed:', itemId);
      return;
    }

    try {
      console.log('🔍 Approving moderation item:', itemId, itemType);
      console.log('🔍 AdminAPI available:', !!adminAPI);
      console.log('🔍 approveModerationItem function:', !!adminAPI.approveModerationItem);
      
      // Mark item as being processed
      setProcessingItems(prev => new Set([...prev, itemId]));
      
      console.log('🔍 Making API call to approve item...');
      const response = await adminAPI.approveModerationItem(itemId, {
        type: itemType,
        reason: 'Approved by admin'
      });
      console.log('🔍 API response received:', response);
      
      if (response.data.success) {
        console.log('✅ Item approved successfully');
        
        // Show success message with more details
        const item = moderationItems.find(item => item.id === itemId);
        alert(`✅ Item "${item?.title || itemId}" approved successfully!\n\nThe item has been marked as resolved and is no longer flagged for moderation.`);
        
        // Remove the approved item from the list immediately
        setModerationItems(prevItems => 
          prevItems.filter(item => item.id !== itemId)
        );
        
        // Update stats
        setStats(prevStats => ({
          ...prevStats,
          pending: prevStats.pending - (moderationItems.find(item => item.id === itemId)?.status === 'pending' ? 1 : 0),
          under_review: prevStats.under_review - (moderationItems.find(item => item.id === itemId)?.status === 'under_review' ? 1 : 0),
          resolved: prevStats.resolved + 1
        }));
        
        // No need to refresh from server - we've already updated the UI immediately
      } else {
        throw new Error(response.data.message || 'Failed to approve item');
      }
    } catch (error) {
      console.error('❌ Error approving item:', error);
      console.error('❌ Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      
      let errorMessage = 'Failed to approve item';
      if (error.response?.status === 401) {
        errorMessage = 'Authentication required. Please login as an admin.';
      } else if (error.response?.status === 403) {
        errorMessage = 'Admin access required. You do not have permission.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(`❌ Error approving item: ${errorMessage}`);
    } finally {
      // Remove item from processing set
      setProcessingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const handleReject = async (itemId, itemType) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;

    // Prevent duplicate processing
    if (processingItems.has(itemId)) {
      console.log('⚠️ Item already being processed:', itemId);
      return;
    }
    
    try {
      console.log('🔍 Rejecting moderation item:', itemId, itemType);
      
      // Mark item as being processed
      setProcessingItems(prev => new Set([...prev, itemId]));
      
      const response = await adminAPI.rejectModerationItem(itemId, {
        type: itemType,
        reason: reason
      });
      
      if (response.data.success) {
        console.log('✅ Item rejected successfully');
        
        // Show success message with more details
        const item = moderationItems.find(item => item.id === itemId);
        alert(`❌ Item "${item?.title || itemId}" rejected successfully!\n\nReason: ${reason}\n\nThe item has been marked as resolved and appropriate action has been taken.`);
        
        // Remove the rejected item from the list immediately
        setModerationItems(prevItems => 
          prevItems.filter(item => item.id !== itemId)
        );
        
        // Update stats
        setStats(prevStats => ({
          ...prevStats,
          pending: prevStats.pending - (moderationItems.find(item => item.id === itemId)?.status === 'pending' ? 1 : 0),
          under_review: prevStats.under_review - (moderationItems.find(item => item.id === itemId)?.status === 'under_review' ? 1 : 0),
          resolved: prevStats.resolved + 1
        }));
        
        // No need to refresh from server - we've already updated the UI immediately
      } else {
        throw new Error(response.data.message || 'Failed to reject item');
      }
    } catch (error) {
      console.error('❌ Error rejecting item:', error);
      alert(`Error rejecting item: ${error.response?.data?.message || error.message}`);
    } finally {
      // Remove item from processing set
      setProcessingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  const handleReview = async (itemId, itemType) => {
    try {
      console.log('🔍 Reviewing moderation item:', itemId, itemType);
      
      // For now, just show item details
      const item = moderationItems.find(item => item.id === itemId);
      if (item) {
        const details = `
Item Details:
- Type: ${item.type}
- Title: ${item.title}
- Description: ${item.description}
- Status: ${item.status}
- Priority: ${item.priority}
- Flagged by: ${item.flaggedBy}
- Flagged date: ${item.flaggedDate}

This would open a detailed review modal in a full implementation.
        `;
        alert(details);
      } else {
        alert(`Item ${itemId} marked for detailed review. This would open a detailed review modal in a full implementation.`);
      }
    } catch (error) {
      console.error('❌ Error reviewing item:', error);
      alert(`Error reviewing item: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'under_review':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'resolved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 dark:text-red-400';
      case 'medium':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'low':
        return 'text-green-600 dark:text-green-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Content Moderation</h2>
        <div className="flex space-x-3">
          <select 
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending Review</option>
            <option value="under_review">Under Review</option>
            <option value="resolved">Resolved</option>
          </select>
          <select 
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">All Types</option>
            <option value="job">Jobs</option>
            <option value="user">Users</option>
          </select>
          <select 
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">All Priority</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
          <div className="flex items-center space-x-4">
            {lastUpdated && (
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            <button 
              onClick={fetchModerationItems}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              disabled={loading}
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <span className="text-2xl">⏳</span>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Pending</h3>
              <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                {stats.pending || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <span className="text-2xl">🔍</span>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Under Review</h3>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {stats.under_review || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
              <span className="text-2xl">✅</span>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Resolved</h3>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {stats.resolved || 0}
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
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Total</h3>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {stats.total || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Moderation Items */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Moderation Queue</h3>
        </div>
        
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {moderationItems.length > 0 ? (
            moderationItems.map((item, index) => (
            <motion.div
              key={item.id}
              className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className="text-2xl">
                      {item.type === 'job' ? '💼' : '👤'}
                    </span>
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                      {item.title}
                    </h4>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                      {item.status.replace('_', ' ')}
                    </span>
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-400 mb-3">
                    {item.description}
                  </p>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                    <span>Flagged by: {item.flaggedBy}</span>
                    <span>•</span>
                    <span>{item.flaggedDate}</span>
                    <span>•</span>
                    <span className={`font-medium ${getPriorityColor(item.priority)}`}>
                      {item.priority.toUpperCase()} Priority
                    </span>
                  </div>
                </div>
                
                <div className="flex space-x-2 ml-4">
                  {item.status !== 'resolved' && (
                    <>
                      <button 
                        onClick={() => {
                          console.log('🔍 Approve button clicked for item:', item.id, item.type);
                          handleApprove(item.id, item.type);
                        }}
                        disabled={processingItems.has(item.id)}
                        className={`px-3 py-1 text-white text-sm rounded transition-colors ${
                          processingItems.has(item.id) 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-green-600 hover:bg-green-700'
                        }`}
                      >
                        {processingItems.has(item.id) ? 'Processing...' : 'Approve'}
                      </button>
                      <button 
                        onClick={() => handleReject(item.id, item.type)}
                        disabled={processingItems.has(item.id)}
                        className={`px-3 py-1 text-white text-sm rounded transition-colors ${
                          processingItems.has(item.id) 
                            ? 'bg-gray-400 cursor-not-allowed' 
                            : 'bg-red-600 hover:bg-red-700'
                        }`}
                      >
                        {processingItems.has(item.id) ? 'Processing...' : 'Reject'}
                      </button>
                    </>
                  )}
                  <button 
                    onClick={() => {
                      console.log('🔍 Review button clicked for item:', item.id, item.type);
                      handleReview(item.id, item.type);
                    }}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                  >
                    {item.status === 'resolved' ? 'View Details' : 'Review'}
                  </button>
                </div>
              </div>
            </motion.div>
            ))
          ) : (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No items to moderate
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                All content has been reviewed. Great job keeping the platform clean!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModerationTab;
