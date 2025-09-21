/**
 * Admin Schema
 * 
 * Extends BaseUserSchema with admin-specific fields and functionality.
 * Handles system administrators' profiles, permissions, and system management.
 * 
 * @author FinAutoJobs Team
 * @version 1.0.0
 */

import mongoose from 'mongoose';
import BaseUserSchema from './BaseUserSchema.js';

const AdminSchema = new mongoose.Schema({
  // Inherit all base user fields
  ...BaseUserSchema.obj,
  
  // Role identification
  role: {
    type: String,
    default: 'admin',
    immutable: true,
    index: true
  },
  
  // Admin Level & Hierarchy
  adminLevel: {
    type: String,
    enum: ['super_admin', 'admin', 'moderator', 'support'],
    default: 'admin',
    index: true
  },
  
  department: {
    type: String,
    required: [true, 'Department is required'],
    enum: [
      'engineering', 'product', 'operations', 'customer_support', 
      'marketing', 'sales', 'hr', 'finance', 'legal', 'security'
    ],
    index: true
  },
  
  // Access Control & Permissions
  permissions: {
    // User Management
    users: {
      view: {
        type: Boolean,
        default: true
      },
      create: {
        type: Boolean,
        default: false
      },
      edit: {
        type: Boolean,
        default: false
      },
      delete: {
        type: Boolean,
        default: false
      },
      suspend: {
        type: Boolean,
        default: false
      },
      verify: {
        type: Boolean,
        default: false
      }
    },
    
    // Job Management
    jobs: {
      view: {
        type: Boolean,
        default: true
      },
      create: {
        type: Boolean,
        default: false
      },
      edit: {
        type: Boolean,
        default: false
      },
      delete: {
        type: Boolean,
        default: false
      },
      approve: {
        type: Boolean,
        default: false
      },
      feature: {
        type: Boolean,
        default: false
      }
    },
    
    // Company Management
    companies: {
      view: {
        type: Boolean,
        default: true
      },
      create: {
        type: Boolean,
        default: false
      },
      edit: {
        type: Boolean,
        default: false
      },
      delete: {
        type: Boolean,
        default: false
      },
      verify: {
        type: Boolean,
        default: false
      }
    },
    
    // System Management
    system: {
      viewLogs: {
        type: Boolean,
        default: false
      },
      manageSettings: {
        type: Boolean,
        default: false
      },
      backupRestore: {
        type: Boolean,
        default: false
      },
      systemMaintenance: {
        type: Boolean,
        default: false
      },
      securitySettings: {
        type: Boolean,
        default: false
      }
    },
    
    // Analytics & Reports
    analytics: {
      view: {
        type: Boolean,
        default: true
      },
      export: {
        type: Boolean,
        default: false
      },
      advanced: {
        type: Boolean,
        default: false
      }
    },
    
    // Content Management
    content: {
      viewReports: {
        type: Boolean,
        default: true
      },
      moderate: {
        type: Boolean,
        default: false
      },
      delete: {
        type: Boolean,
        default: false
      }
    },
    
    // Financial Management
    financial: {
      viewTransactions: {
        type: Boolean,
        default: false
      },
      processRefunds: {
        type: Boolean,
        default: false
      },
      managePricing: {
        type: Boolean,
        default: false
      }
    }
  },
  
  // Work Information
  workInfo: {
    employeeId: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: Date,
    isActive: {
      type: Boolean,
      default: true
    },
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    team: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      role: String,
      addedAt: {
        type: Date,
        default: Date.now
      }
    }],
    workLocation: {
      type: String,
      enum: ['onsite', 'remote', 'hybrid'],
      default: 'onsite'
    },
    shift: {
      type: String,
      enum: ['day', 'night', 'rotational'],
      default: 'day'
    }
  },
  
  // Activity Tracking
  adminActivity: {
    totalActions: {
      type: Number,
      default: 0
    },
    lastAction: {
      type: Date,
      default: Date.now
    },
    actionsToday: {
      type: Number,
      default: 0
    },
    actionsThisWeek: {
      type: Number,
      default: 0
    },
    actionsThisMonth: {
      type: Number,
      default: 0
    },
    lastResetDate: {
      type: Date,
      default: Date.now
    }
  },
  
  // System Monitoring
  systemAccess: {
    allowedIPs: [{
      ip: {
        type: String,
        required: true
      },
      description: String,
      addedAt: {
        type: Date,
        default: Date.now
      }
    }],
    
    sessionTimeout: {
      type: Number,
      default: 480 // minutes (8 hours)
    },
    
    maxConcurrentSessions: {
      type: Number,
      default: 3
    },
    
    requireTwoFactor: {
      type: Boolean,
      default: true
    },
    
    lastPasswordChange: Date,
    
    passwordExpiryDays: {
      type: Number,
      default: 90
    }
  },
  
  // Notification Settings
  notificationSettings: {
    systemAlerts: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      },
      sms: {
        type: Boolean,
        default: false
      }
    },
    
    userReports: {
      email: {
        type: Boolean,
        default: true
      },
      frequency: {
        type: String,
        enum: ['immediate', 'hourly', 'daily', 'weekly'],
        default: 'daily'
      }
    },
    
    securityAlerts: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      },
      sms: {
        type: Boolean,
        default: true
      }
    },
    
    maintenanceUpdates: {
      email: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: false
      }
    }
  },
  
  // Dashboard Preferences
  dashboardSettings: {
    defaultView: {
      type: String,
      enum: ['overview', 'users', 'jobs', 'analytics', 'reports'],
      default: 'overview'
    },
    
    widgets: [{
      name: {
        type: String,
        required: true
      },
      position: {
        x: Number,
        y: Number,
        width: Number,
        height: Number
      },
      isVisible: {
        type: Boolean,
        default: true
      },
      settings: {
        type: mongoose.Schema.Types.Mixed
      }
    }],
    
    refreshInterval: {
      type: Number,
      default: 300 // seconds
    },
    
    timezone: {
      type: String,
      default: 'Asia/Kolkata'
    }
  },
  
  // Audit Trail
  auditLog: [{
    action: {
      type: String,
      required: true,
      enum: [
        'login', 'logout', 'create', 'update', 'delete', 'approve', 'reject',
        'suspend', 'activate', 'export', 'import', 'backup', 'restore',
        'settings_change', 'permission_change', 'password_change'
      ]
    },
    
    resource: {
      type: String,
      required: true
    },
    
    resourceId: {
      type: String
    },
    
    details: {
      type: mongoose.Schema.Types.Mixed
    },
    
    ipAddress: {
      type: String,
      required: true
    },
    
    userAgent: {
      type: String,
      required: true
    },
    
    timestamp: {
      type: Date,
      default: Date.now,
      index: true
    },
    
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'low'
    }
  }],
  
  // System Statistics (for dashboard)
  managedStats: {
    totalUsers: {
      type: Number,
      default: 0
    },
    activeUsers: {
      type: Number,
      default: 0
    },
    totalJobs: {
      type: Number,
      default: 0
    },
    activeJobs: {
      type: Number,
      default: 0
    },
    totalApplications: {
      type: Number,
      default: 0
    },
    totalCompanies: {
      type: Number,
      default: 0
    },
    verifiedCompanies: {
      type: Number,
      default: 0
    },
    systemHealth: {
      type: Number,
      default: 100
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  
  // Emergency Contacts
  emergencyContacts: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    relationship: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      trim: true,
      lowercase: true
    },
    isPrimary: {
      type: Boolean,
      default: false
    }
  }],
  
  // Scheduled Tasks & Reminders
  scheduledTasks: [{
    title: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    type: {
      type: String,
      enum: ['maintenance', 'review', 'report', 'backup', 'audit', 'other'],
      required: true
    },
    scheduledDate: {
      type: Date,
      required: true
    },
    isCompleted: {
      type: Boolean,
      default: false
    },
    completedAt: Date,
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },
    assignedTo: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }],
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // API Access & Integration
  apiAccess: {
    hasApiAccess: {
      type: Boolean,
      default: false
    },
    apiKeys: [{
      name: {
        type: String,
        required: true,
        trim: true
      },
      key: {
        type: String,
        required: true,
        select: false
      },
      permissions: [{
        type: String
      }],
      isActive: {
        type: Boolean,
        default: true
      },
      lastUsed: Date,
      createdAt: {
        type: Date,
        default: Date.now
      },
      expiresAt: Date
    }],
    rateLimits: {
      requestsPerMinute: {
        type: Number,
        default: 1000
      },
      requestsPerHour: {
        type: Number,
        default: 10000
      },
      requestsPerDay: {
        type: Number,
        default: 100000
      }
    }
  }
}, {
  timestamps: true,
  versionKey: false,
  toJSON: { 
    virtuals: true,
    transform: function(doc, ret) {
      // Remove sensitive information
      if (ret.apiAccess && ret.apiAccess.apiKeys) {
        ret.apiAccess.apiKeys.forEach(key => {
          delete key.key;
        });
      }
      return ret;
    }
  },
  toObject: { virtuals: true }
});

// Indexes for better query performance
AdminSchema.index({ role: 1, adminLevel: 1 });
AdminSchema.index({ department: 1, status: 1 });
AdminSchema.index({ 'workInfo.employeeId': 1 });
AdminSchema.index({ 'workInfo.isActive': 1 });
AdminSchema.index({ 'auditLog.timestamp': -1 });
AdminSchema.index({ 'auditLog.action': 1, 'auditLog.timestamp': -1 });
AdminSchema.index({ 'systemAccess.allowedIPs.ip': 1 });

// Virtual for total permissions count
AdminSchema.virtual('totalPermissions').get(function() {
  let count = 0;
  const permissions = this.permissions;
  
  Object.keys(permissions).forEach(category => {
    Object.keys(permissions[category]).forEach(permission => {
      if (permissions[category][permission] === true) {
        count++;
      }
    });
  });
  
  return count;
});

// Virtual for work tenure
AdminSchema.virtual('workTenure').get(function() {
  if (!this.workInfo.startDate) return null;
  
  const endDate = this.workInfo.endDate || new Date();
  const startDate = new Date(this.workInfo.startDate);
  
  const diffTime = Math.abs(endDate - startDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  const years = Math.floor(diffDays / 365);
  const months = Math.floor((diffDays % 365) / 30);
  
  return { years, months, totalDays: diffDays };
});

// Pre-save middleware
AdminSchema.pre('save', function(next) {
  // Reset daily/weekly/monthly counters if needed
  const now = new Date();
  const lastReset = this.adminActivity.lastResetDate;
  
  if (lastReset) {
    const daysDiff = Math.floor((now - lastReset) / (1000 * 60 * 60 * 24));
    
    if (daysDiff >= 1) {
      this.adminActivity.actionsToday = 0;
    }
    
    if (daysDiff >= 7) {
      this.adminActivity.actionsThisWeek = 0;
    }
    
    if (daysDiff >= 30) {
      this.adminActivity.actionsThisMonth = 0;
      this.adminActivity.lastResetDate = now;
    }
  }
  
  next();
});

// Instance methods
AdminSchema.methods.logAction = function(action, resource, resourceId = null, details = {}, ipAddress = '', userAgent = '', severity = 'low') {
  this.auditLog.push({
    action,
    resource,
    resourceId,
    details,
    ipAddress,
    userAgent,
    severity,
    timestamp: new Date()
  });
  
  // Update activity counters
  this.adminActivity.totalActions += 1;
  this.adminActivity.actionsToday += 1;
  this.adminActivity.actionsThisWeek += 1;
  this.adminActivity.actionsThisMonth += 1;
  this.adminActivity.lastAction = new Date();
  
  return this.save();
};

AdminSchema.methods.hasPermission = function(category, permission) {
  return this.permissions[category] && this.permissions[category][permission] === true;
};

AdminSchema.methods.addScheduledTask = function(title, type, scheduledDate, description = '', priority = 'medium') {
  this.scheduledTasks.push({
    title,
    description,
    type,
    scheduledDate,
    priority,
    createdAt: new Date()
  });
  
  return this.save();
};

AdminSchema.methods.completeTask = function(taskId) {
  const task = this.scheduledTasks.id(taskId);
  if (task) {
    task.isCompleted = true;
    task.completedAt = new Date();
  }
  
  return this.save();
};

AdminSchema.methods.updateManagedStats = function(stats) {
  this.managedStats = {
    ...this.managedStats,
    ...stats,
    lastUpdated: new Date()
  };
  
  return this.save();
};

AdminSchema.methods.generateApiKey = function(name, permissions = [], expiresInDays = 365) {
  const crypto = require('crypto');
  const apiKey = crypto.randomBytes(32).toString('hex');
  
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expiresInDays);
  
  this.apiAccess.apiKeys.push({
    name,
    key: apiKey,
    permissions,
    expiresAt,
    createdAt: new Date()
  });
  
  return this.save().then(() => apiKey);
};

export default AdminSchema;
