import api from './api';

// Dashboard API Service
export const dashboardService = {
  // Applicant Dashboard APIs
  getApplicantDashboard: async () => {
    try {
      const response = await api.get('/dashboard/applicant');
      return response.data;
    } catch (error) {
      console.error('Error fetching applicant dashboard:', error);
      throw error;
    }
  },

  // Recruiter Dashboard APIs
  getRecruiterDashboard: async () => {
    try {
      const response = await api.get('/dashboard/recruiter');
      return response.data;
    } catch (error) {
      console.error('Error fetching recruiter dashboard:', error);
      throw error;
    }
  },

  // Admin Dashboard APIs
  getAdminDashboard: async () => {
    try {
      const response = await api.get('/dashboard/admin');
      return response.data;
    } catch (error) {
      console.error('Error fetching admin dashboard:', error);
      throw error;
    }
  },

  // User Preferences APIs
  getUserPreferences: async () => {
    try {
      const response = await api.get('/dashboard/preferences');
      return response.data;
    } catch (error) {
      console.error('Error fetching user preferences:', error);
      throw error;
    }
  },

  updateUserPreferences: async (preferences) => {
    try {
      const response = await api.put('/dashboard/preferences', preferences);
      return response.data;
    } catch (error) {
      console.error('Error updating user preferences:', error);
      throw error;
    }
  },

  // Utility functions for data formatting
  formatSalary: (salary) => {
    if (!salary) return 'Salary not specified';
    
    const { min, max, currency, type } = salary;
    const formatAmount = (amount) => {
      if (amount >= 100000) {
        return `${(amount / 100000).toFixed(1)}L`;
      }
      return `${(amount / 1000).toFixed(0)}K`;
    };
    
    const currencySymbols = {
      INR: '₹',
      USD: '$',
      EUR: '€',
      GBP: '£'
    };
    
    const symbol = currencySymbols[currency] || currency;
    return `${symbol}${formatAmount(min)} - ${symbol}${formatAmount(max)} ${type === 'annual' ? 'p.a.' : 'p.m.'}`;
  },

  getTimeAgo: (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`;
    return `${Math.ceil(diffDays / 365)} years ago`;
  },

  calculateProfileCompletion: (user) => {
    if (!user) return 0;
    
    const fields = [
      'full_name', 'email', 'phone', 'location', 'bio', 
      'skills', 'qualification', 'resume_url', 'linkedin_url'
    ];
    
    let completedFields = 0;
    fields.forEach(field => {
      if (user[field] && user[field].trim() !== '') {
        completedFields++;
      }
    });
    
    return Math.round((completedFields / fields.length) * 100);
  },

  // Chart data utilities
  generateChartData: (data, type = 'line') => {
    if (!data || !Array.isArray(data)) return [];
    
    switch (type) {
      case 'line':
      case 'area':
        return data.map(item => ({
          ...item,
          value: item.value || 0
        }));
      case 'pie':
        return data.map(item => ({
          name: item.name || 'Unknown',
          value: item.value || 0,
          color: item.color || '#8884d8'
        }));
      case 'bar':
        return data.map(item => ({
          ...item,
          value: item.value || 0
        }));
      default:
        return data;
    }
  },

  // Status utilities
  getStatusConfig: (status) => {
    const configs = {
      pending: { color: 'warning', icon: '⏳', label: 'Pending' },
      reviewed: { color: 'info', icon: '👁️', label: 'Reviewed' },
      shortlisted: { color: 'primary', icon: '⭐', label: 'Shortlisted' },
      interview: { color: 'secondary', icon: '📅', label: 'Interview' },
      offered: { color: 'success', icon: '🎉', label: 'Offered' },
      hired: { color: 'success', icon: '✅', label: 'Hired' },
      rejected: { color: 'error', icon: '❌', label: 'Rejected' },
      withdrawn: { color: 'default', icon: '🔄', label: 'Withdrawn' },
      active: { color: 'success', icon: '✅', label: 'Active' },
      draft: { color: 'warning', icon: '📝', label: 'Draft' },
      closed: { color: 'error', icon: '🔒', label: 'Closed' },
      archived: { color: 'default', icon: '📦', label: 'Archived' }
    };
    return configs[status] || configs.pending;
  },

  // Local storage helpers
  saveToLocalStorage: (key, data) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  },

  getFromLocalStorage: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Error getting from localStorage:', error);
      return defaultValue;
    }
  },

  // Error handling utilities
  handleApiError: (error) => {
    if (error.response) {
      // Server responded with error status
      const message = error.response.data?.message || 'Server error occurred';
      const status = error.response.status;
      
      switch (status) {
        case 401:
          return { message: 'Unauthorized. Please login again.', type: 'auth' };
        case 403:
          return { message: 'Access denied.', type: 'permission' };
        case 404:
          return { message: 'Resource not found.', type: 'not_found' };
        case 500:
          return { message: 'Server error. Please try again later.', type: 'server' };
        default:
          return { message, type: 'api' };
      }
    } else if (error.request) {
      // Request made but no response received
      return { message: 'Network error. Please check your connection.', type: 'network' };
    } else {
      // Something else happened
      return { message: error.message || 'An unknown error occurred.', type: 'unknown' };
    }
  },

  // Data validation utilities
  validateEmail: (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },

  validatePhone: (phone) => {
    const re = /^[\+]?[1-9][\d]{0,15}$/;
    return re.test(phone.replace(/[\s\-\(\)]/g, ''));
  },

  validateUrl: (url) => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  },

  // Performance monitoring
  logPerformance: (action, duration) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`Performance: ${action} took ${duration}ms`);
    }
  },

  // Debounce utility
  debounce: (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Throttle utility
  throttle: (func, limit) => {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
};

export default dashboardService;
