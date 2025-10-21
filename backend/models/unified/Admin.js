import mongoose from 'mongoose';
import BaseUser from './BaseUser.js';

// Admin-specific schema
const adminSchema = new mongoose.Schema({
  // Admin-specific information
  adminInfo: {
    permissions: [{
      type: String,
      enum: ['users', 'jobs', 'analytics', 'reports', 'system', 'all'],
      default: ['analytics']
    }],
    department: {
      type: String,
      default: 'Administration'
    },
    accessLevel: {
      type: String,
      enum: ['admin', 'super_admin', 'moderator'],
      default: 'admin'
    },
    canManageUsers: {
      type: Boolean,
      default: false
    },
    canManageJobs: {
      type: Boolean,
      default: false
    },
    canViewAnalytics: {
      type: Boolean,
      default: true
    },
    canManageSystem: {
      type: Boolean,
      default: false
    },
    lastLogin: {
      type: Date
    },
    loginCount: {
      type: Number,
      default: 0
    }
  },
  
  // Admin activity tracking
  adminActivity: {
    actionsPerformed: [{
      action: String,
      target: String,
      targetId: mongoose.Schema.Types.ObjectId,
      timestamp: {
        type: Date,
        default: Date.now
      },
      details: mongoose.Schema.Types.Mixed
    }],
    lastActiveDate: {
      type: Date,
      default: Date.now
    }
  },
  
  // Admin preferences
  adminPreferences: {
    dashboardLayout: {
      type: String,
      enum: ['grid', 'list', 'compact'],
      default: 'grid'
    },
    notificationSettings: {
      emailNotifications: {
        type: Boolean,
        default: true
      },
      systemAlerts: {
        type: Boolean,
        default: true
      },
      userRegistrations: {
        type: Boolean,
        default: true
      },
      jobPostings: {
        type: Boolean,
        default: false
      }
    },
    defaultFilters: {
      userStatus: {
        type: String,
        enum: ['all', 'active', 'inactive', 'suspended'],
        default: 'all'
      },
      jobStatus: {
        type: String,
        enum: ['all', 'active', 'closed', 'draft'],
        default: 'active'
      },
      dateRange: {
        type: String,
        enum: ['today', 'week', 'month', 'quarter', 'year'],
        default: 'month'
      }
    }
  }
}, {
  timestamps: true
});

// Admin-specific methods
adminSchema.methods.hasPermission = function(permission) {
  return this.adminInfo.permissions.includes('all') || 
         this.adminInfo.permissions.includes(permission);
};

adminSchema.methods.canAccessFeature = function(feature) {
  const featurePermissions = {
    'user_management': this.adminInfo.canManageUsers,
    'job_management': this.adminInfo.canManageJobs,
    'analytics': this.adminInfo.canViewAnalytics,
    'system_settings': this.adminInfo.canManageSystem
  };
  
  return featurePermissions[feature] || false;
};

adminSchema.methods.logActivity = function(action, target, targetId, details = {}) {
  this.adminActivity.actionsPerformed.push({
    action,
    target,
    targetId,
    details,
    timestamp: new Date()
  });
  
  this.adminActivity.lastActiveDate = new Date();
  return this.save();
};

adminSchema.methods.updateLoginInfo = function() {
  this.adminInfo.lastLogin = new Date();
  this.adminInfo.loginCount += 1;
  return this.save();
};

// Create Admin model as discriminator of BaseUser
const Admin = BaseUser.discriminator('Admin', adminSchema);

export default Admin;
