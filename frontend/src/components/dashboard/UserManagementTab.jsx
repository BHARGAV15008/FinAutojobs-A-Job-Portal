import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import api from '../../services/api';

const UserManagementTab = () => {
  const [location] = useLocation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [stats, setStats] = useState({});
  
  // Add User Form State
  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    contactNumber: '',
    role: 'applicant',
    password: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Read tab parameter from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const tabParam = urlParams.get('tab');
    if (tabParam && ['all', 'applicant', 'recruiter', 'pending'].includes(tabParam)) {
      setActiveTab(tabParam);
      console.log('🔍 UserManagementTab - Set active tab from URL:', tabParam);
    }
  }, [location]);

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, [activeTab]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching users for tab:', activeTab);
      
      // Build query parameters based on active tab
      const params = new URLSearchParams();
      if (activeTab !== 'all') {
        if (activeTab === 'pending') {
          params.append('status', 'pending');
        } else {
          params.append('role', activeTab);
        }
      }
      
      const response = await api.get(`/admin/users?${params.toString()}`);
      console.log('✅ Users fetched:', response.data);
      
      if (response.data.success) {
        setUsers(response.data.data || []);
      } else {
        throw new Error(response.data.message || 'Failed to fetch users');
      }
    } catch (error) {
      console.error('❌ Error fetching users:', error);
      // No fallback to mock data - show empty state
      console.warn('No users data available');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/users/stats');
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('❌ Error fetching user stats:', error);
      // Fallback stats
      setStats({
        totalUsers: 0,
        activeUsers: 0,
        pendingUsers: 0,
        suspendedUsers: 0,
        usersByRole: {
          applicants: 0,
          recruiters: 0,
          admins: 0
        }
      });
    }
  };

  const handleSuspendUser = async (userId) => {
    try {
      console.log('🔍 Suspending user:', userId);
      const response = await api.post(`/admin/users/${userId}/suspend`, {
        reason: 'Suspended by admin'
      });
      
      if (response.data.success) {
        console.log('✅ User suspended successfully');
        // Refresh the user list to get updated data from database
        await fetchUsers();
        await fetchStats();
        alert('User suspended successfully!');
      } else {
        throw new Error(response.data.message || 'Failed to suspend user');
      }
    } catch (error) {
      console.error('❌ Error suspending user:', error);
      alert(`Error suspending user: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleActivateUser = async (userId) => {
    try {
      console.log('🔍 Activating user:', userId);
      const response = await api.post(`/admin/users/${userId}/activate`);
      
      if (response.data.success) {
        console.log('✅ User activated successfully');
        // Refresh the user list to get updated data from database
        await fetchUsers();
        await fetchStats();
        alert('User activated successfully!');
      } else {
        throw new Error(response.data.message || 'Failed to activate user');
      }
    } catch (error) {
      console.error('❌ Error activating user:', error);
      alert(`Error activating user: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleUpdateLogin = async (userId) => {
    try {
      console.log('🔍 Updating lastLogin for user:', userId);
      const response = await api.post(`/admin/users/${userId}/update-login`);
      
      if (response.data.success) {
        console.log('✅ LastLogin updated successfully');
        // Refresh the user list to get updated data from database
        await fetchUsers();
        alert('Last login updated successfully!');
      } else {
        throw new Error(response.data.message || 'Failed to update last login');
      }
    } catch (error) {
      console.error('❌ Error updating last login:', error);
      alert(`Error updating last login: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        console.log('🔍 Deleting user:', userId);
        const response = await api.delete(`/admin/users/${userId}`);
        
        if (response.data.success) {
          console.log('✅ User deleted successfully');
          // Refresh the user list to get updated data from database
          await fetchUsers();
          await fetchStats();
          alert('User deleted successfully!');
        } else {
          throw new Error(response.data.message || 'Failed to delete user');
        }
      } catch (error) {
        console.error('❌ Error deleting user:', error);
        alert(`Error deleting user: ${error.response?.data?.message || error.message}`);
      }
    }
  };

  // Generate random password
  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewUser(prev => ({ ...prev, password }));
    return password;
  };

  // Validate form fields
  const validateForm = () => {
    const errors = {};
    
    if (!newUser.firstName.trim()) {
      errors.firstName = 'First name is required';
    }
    
    if (!newUser.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }
    
    if (!newUser.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newUser.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (!newUser.contactNumber.trim()) {
      errors.contactNumber = 'Contact number is required';
    } else if (!/^[\+]?[1-9][\d]{0,15}$/.test(newUser.contactNumber.replace(/[\s\-\(\)]/g, ''))) {
      errors.contactNumber = 'Please enter a valid contact number';
    }
    
    if (!newUser.role) {
      errors.role = 'Role is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form input changes
  const handleInputChange = (field, value) => {
    setNewUser(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Handle add user form submission
  const handleAddUser = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log('🔍 Creating new user:', newUser);
      
      const response = await api.post('/admin/users', {
        firstName: newUser.firstName.trim(),
        lastName: newUser.lastName.trim(),
        email: newUser.email.trim().toLowerCase(),
        contactNumber: newUser.contactNumber.trim(),
        role: newUser.role,
        password: newUser.password,
        isVerified: true // Admin-created users are pre-verified
      });
      
      if (response.data.success) {
        console.log('✅ User created successfully');
        
        const emailSent = response.data.emailSent;
        const successMessage = emailSent 
          ? `✅ User created successfully!\n\n📧 Login credentials have been sent to: ${newUser.email}\n\nThe user will receive:\n• Email: ${newUser.email}\n• Password: ${newUser.password}\n• Role: ${newUser.role}\n\nThey can now login and should change their password on first login.`
          : `✅ User created successfully!\n\nEmail: ${newUser.email}\nPassword: ${newUser.password}\n\nPlease share these credentials with the user manually (email sending failed).`;
        
        alert(successMessage);
        
        // Reset form and close modal
        setNewUser({
          firstName: '',
          lastName: '',
          email: '',
          contactNumber: '',
          role: 'applicant',
          password: ''
        });
        setShowAddUserModal(false);
        
        // Refresh user list and stats
        await fetchUsers();
        await fetchStats();
      } else {
        throw new Error(response.data.message || 'Failed to create user');
      }
    } catch (error) {
      console.error('❌ Error creating user:', error);
      
      let errorMessage = 'Failed to create user';
      if (error.response?.status === 409) {
        errorMessage = 'A user with this email already exists';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      alert(`❌ Error creating user: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'suspended':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const tabs = [
    { id: 'all', label: 'All Users', count: stats.totalUsers || 0 },
    { id: 'applicant', label: 'Applicants', count: stats.usersByRole?.applicants || 0 },
    { id: 'recruiter', label: 'Recruiters', count: stats.usersByRole?.recruiters || 0 },
    { id: 'pending', label: 'Pending Approval', count: stats.pendingUsers || 0 }
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
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h2>
        <div className="flex space-x-3">
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            Export Users
          </button>
          <button 
            onClick={() => {
              setShowAddUserModal(true);
              generatePassword();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add User
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
              <span className="text-2xl">👥</span>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Total Users</h3>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{stats.totalUsers || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
              <span className="text-2xl">✅</span>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Active Users</h3>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {stats.activeUsers || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <span className="text-2xl">⏳</span>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Pending</h3>
              <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                {stats.pendingUsers || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <span className="text-2xl">🔍</span>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Applicants</h3>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {stats.usersByRole?.applicants || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {activeTab === 'all' ? 'All Users' : 
             activeTab === 'applicant' ? 'Applicants' :
             activeTab === 'recruiter' ? 'Recruiters' : 'Pending Approval'}
          </h3>
          <div className="flex items-center space-x-4">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or email..."
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white w-64"
            />
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {filteredUsers.length} users found
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Users ({filteredUsers.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Profile Complete
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Last Login
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredUsers.map((user, index) => (
                <motion.tr
                  key={user.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {user.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {user.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="capitalize text-sm text-gray-900 dark:text-white">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(user.status)}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${user.profileComplete}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-900 dark:text-white">{user.profileComplete}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {user.lastLogin}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setShowModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 mr-3"
                    >
                      View
                    </button>
                    {user.status === 'active' ? (
                      <button
                        onClick={() => handleSuspendUser(user.id)}
                        className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 mr-3"
                      >
                        Suspend
                      </button>
                    ) : user.status === 'suspended' ? (
                      <button
                        onClick={() => handleActivateUser(user.id)}
                        className="text-green-600 hover:text-green-900 dark:text-green-400 mr-3"
                      >
                        Activate
                      </button>
                    ) : null}
                    <button
                      onClick={() => handleUpdateLogin(user.id)}
                      className="text-purple-600 hover:text-purple-900 dark:text-purple-400 mr-3"
                      title="Update Last Login (Test)"
                    >
                      Update Login
                    </button>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
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

      {/* User Details Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                User Details
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Name:</label>
                  <p className="text-gray-900 dark:text-white">{selectedUser.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email:</label>
                  <p className="text-gray-900 dark:text-white">{selectedUser.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Role:</label>
                  <p className="text-gray-900 dark:text-white capitalize">{selectedUser.role}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Status:</label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedUser.status)}`}>
                    {selectedUser.status}
                  </span>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Profile Complete:</label>
                  <p className="text-gray-900 dark:text-white">{selectedUser.profileComplete}%</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Join Date:</label>
                  <p className="text-gray-900 dark:text-white">{selectedUser.joinDate}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Last Login:</label>
                  <p className="text-gray-900 dark:text-white">{selectedUser.lastLogin}</p>
                </div>
              </div>
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Add New User
              </h3>
              <form onSubmit={handleAddUser} className="space-y-4">
                {/* First Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={newUser.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      formErrors.firstName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="Enter first name"
                  />
                  {formErrors.firstName && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.firstName}</p>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={newUser.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      formErrors.lastName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="Enter last name"
                  />
                  {formErrors.lastName && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.lastName}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      formErrors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="Enter email address"
                  />
                  {formErrors.email && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
                  )}
                </div>

                {/* Contact Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Contact Number *
                  </label>
                  <input
                    type="tel"
                    value={newUser.contactNumber}
                    onChange={(e) => handleInputChange('contactNumber', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      formErrors.contactNumber ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="Enter contact number"
                  />
                  {formErrors.contactNumber && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.contactNumber}</p>
                  )}
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Role *
                  </label>
                  <select
                    value={newUser.role}
                    onChange={(e) => handleInputChange('role', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white ${
                      formErrors.role ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    <option value="applicant">Applicant</option>
                    <option value="recruiter">Recruiter</option>
                    <option value="admin">Admin</option>
                  </select>
                  {formErrors.role && (
                    <p className="text-red-500 text-xs mt-1">{formErrors.role}</p>
                  )}
                </div>

                {/* Generated Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Generated Password
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newUser.password}
                      readOnly
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 text-gray-900 dark:text-white"
                    />
                    <button
                      type="button"
                      onClick={generatePassword}
                      className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      🔄
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Password will be shared with the user after creation
                  </p>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddUserModal(false);
                      setNewUser({
                        firstName: '',
                        lastName: '',
                        email: '',
                        contactNumber: '',
                        role: 'applicant',
                        password: ''
                      });
                      setFormErrors({});
                    }}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    disabled={isSubmitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Creating...' : 'Create User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagementTab;
