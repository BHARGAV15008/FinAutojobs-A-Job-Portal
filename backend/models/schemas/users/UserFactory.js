/**
 * User Factory
 * 
 * Factory pattern implementation for creating and managing different user types.
 * Provides a unified interface for user model creation and retrieval.
 * 
 * @author FinAutoJobs Team
 * @version 1.0.0
 */

import mongoose from 'mongoose';
import ApplicantSchema from './ApplicantSchema.js';
import RecruiterSchema from './RecruiterSchema.js';
import AdminSchema from './AdminSchema.js';

// Model cache to avoid re-compilation
const modelCache = new Map();

/**
 * Get user model based on role
 * @param {string} role - User role (applicant, recruiter, admin)
 * @returns {mongoose.Model} Mongoose model for the specified role
 */
export const getUserModel = (role) => {
  if (!role) {
    throw new Error('Role is required to get user model');
  }
  
  const normalizedRole = role.toLowerCase();
  
  // Check cache first
  if (modelCache.has(normalizedRole)) {
    return modelCache.get(normalizedRole);
  }
  
  let model;
  
  switch (normalizedRole) {
    case 'applicant':
    case 'jobseeker':
      model = mongoose.model('Applicant', ApplicantSchema);
      break;
      
    case 'recruiter':
    case 'employer':
      model = mongoose.model('Recruiter', RecruiterSchema);
      break;
      
    case 'admin':
    case 'administrator':
      model = mongoose.model('Admin', AdminSchema);
      break;
      
    default:
      throw new Error(`Invalid user role: ${role}. Supported roles: applicant, recruiter, admin`);
  }
  
  // Cache the model
  modelCache.set(normalizedRole, model);
  
  return model;
};

/**
 * Create a new user model instance
 * @param {string} role - User role
 * @param {Object} userData - User data
 * @returns {mongoose.Document} New user document
 */
export const createUserModel = (role, userData = {}) => {
  const UserModel = getUserModel(role);
  return new UserModel({
    ...userData,
    role: role.toLowerCase()
  });
};

/**
 * Get all available user models
 * @returns {Object} Object containing all user models
 */
export const getAllUserModels = () => {
  return {
    Applicant: getUserModel('applicant'),
    Recruiter: getUserModel('recruiter'),
    Admin: getUserModel('admin')
  };
};

/**
 * Check if a role is valid
 * @param {string} role - Role to validate
 * @returns {boolean} True if role is valid
 */
export const isValidRole = (role) => {
  const validRoles = ['applicant', 'jobseeker', 'recruiter', 'employer', 'admin', 'administrator'];
  return validRoles.includes(role.toLowerCase());
};

/**
 * Get normalized role name
 * @param {string} role - Role to normalize
 * @returns {string} Normalized role name
 */
export const getNormalizedRole = (role) => {
  const roleMap = {
    'applicant': 'applicant',
    'jobseeker': 'applicant',
    'recruiter': 'recruiter',
    'employer': 'recruiter',
    'admin': 'admin',
    'administrator': 'admin'
  };
  
  return roleMap[role.toLowerCase()] || null;
};

/**
 * Find user by email across all user types
 * @param {string} email - User email
 * @returns {Promise<Object|null>} User document with role information
 */
export const findUserByEmail = async (email) => {
  const models = getAllUserModels();
  
  for (const [roleName, Model] of Object.entries(models)) {
    try {
      const user = await Model.findOne({ email: email.toLowerCase() });
      if (user) {
        return {
          user,
          role: roleName.toLowerCase(),
          model: Model
        };
      }
    } catch (error) {
      console.error(`Error searching for user in ${roleName} model:`, error);
    }
  }
  
  return null;
};

/**
 * Find user by ID with role detection
 * @param {string} userId - User ID
 * @param {string} role - Optional role hint for optimization
 * @returns {Promise<Object|null>} User document with role information
 */
export const findUserById = async (userId, role = null) => {
  if (role) {
    try {
      const Model = getUserModel(role);
      const user = await Model.findById(userId);
      if (user) {
        return {
          user,
          role: getNormalizedRole(role),
          model: Model
        };
      }
    } catch (error) {
      console.error(`Error finding user by ID in ${role} model:`, error);
    }
  }
  
  // If role not provided or user not found, search all models
  const models = getAllUserModels();
  
  for (const [roleName, Model] of Object.entries(models)) {
    try {
      const user = await Model.findById(userId);
      if (user) {
        return {
          user,
          role: roleName.toLowerCase(),
          model: Model
        };
      }
    } catch (error) {
      console.error(`Error searching for user by ID in ${roleName} model:`, error);
    }
  }
  
  return null;
};

/**
 * Get user statistics across all roles
 * @returns {Promise<Object>} Statistics object
 */
export const getUserStatistics = async () => {
  const models = getAllUserModels();
  const stats = {
    total: 0,
    byRole: {},
    byStatus: {
      active: 0,
      inactive: 0,
      suspended: 0,
      pending_verification: 0
    },
    verified: {
      email: 0,
      phone: 0,
      both: 0
    }
  };
  
  for (const [roleName, Model] of Object.entries(models)) {
    try {
      const roleStats = await Model.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
            inactive: { $sum: { $cond: [{ $eq: ['$status', 'inactive'] }, 1, 0] } },
            suspended: { $sum: { $cond: [{ $eq: ['$status', 'suspended'] }, 1, 0] } },
            pending: { $sum: { $cond: [{ $eq: ['$status', 'pending_verification'] }, 1, 0] } },
            emailVerified: { $sum: { $cond: ['$isEmailVerified', 1, 0] } },
            phoneVerified: { $sum: { $cond: ['$isPhoneVerified', 1, 0] } },
            bothVerified: { 
              $sum: { 
                $cond: [
                  { $and: ['$isEmailVerified', '$isPhoneVerified'] }, 
                  1, 
                  0
                ] 
              } 
            }
          }
        }
      ]);
      
      if (roleStats.length > 0) {
        const roleStat = roleStats[0];
        stats.byRole[roleName.toLowerCase()] = roleStat.total;
        stats.total += roleStat.total;
        stats.byStatus.active += roleStat.active;
        stats.byStatus.inactive += roleStat.inactive;
        stats.byStatus.suspended += roleStat.suspended;
        stats.byStatus.pending_verification += roleStat.pending;
        stats.verified.email += roleStat.emailVerified;
        stats.verified.phone += roleStat.phoneVerified;
        stats.verified.both += roleStat.bothVerified;
      }
    } catch (error) {
      console.error(`Error getting statistics for ${roleName}:`, error);
      stats.byRole[roleName.toLowerCase()] = 0;
    }
  }
  
  return stats;
};

/**
 * Bulk operations across user models
 */
export const bulkOperations = {
  /**
   * Update multiple users across different roles
   * @param {Array} updates - Array of {userId, role, updateData}
   * @returns {Promise<Array>} Results array
   */
  updateUsers: async (updates) => {
    const results = [];
    
    for (const update of updates) {
      try {
        const { userId, role, updateData } = update;
        const Model = getUserModel(role);
        const result = await Model.findByIdAndUpdate(userId, updateData, { new: true });
        results.push({ success: true, userId, result });
      } catch (error) {
        results.push({ success: false, userId: update.userId, error: error.message });
      }
    }
    
    return results;
  },
  
  /**
   * Delete multiple users across different roles
   * @param {Array} deletions - Array of {userId, role}
   * @returns {Promise<Array>} Results array
   */
  deleteUsers: async (deletions) => {
    const results = [];
    
    for (const deletion of deletions) {
      try {
        const { userId, role } = deletion;
        const Model = getUserModel(role);
        await Model.findByIdAndDelete(userId);
        results.push({ success: true, userId });
      } catch (error) {
        results.push({ success: false, userId: deletion.userId, error: error.message });
      }
    }
    
    return results;
  }
};

/**
 * Migration utilities
 */
export const migrationUtils = {
  /**
   * Migrate user from one role to another
   * @param {string} userId - User ID
   * @param {string} fromRole - Current role
   * @param {string} toRole - Target role
   * @param {Object} additionalData - Additional data for new role
   * @returns {Promise<Object>} Migration result
   */
  migrateUserRole: async (userId, fromRole, toRole, additionalData = {}) => {
    try {
      const FromModel = getUserModel(fromRole);
      const ToModel = getUserModel(toRole);
      
      // Get existing user data
      const existingUser = await FromModel.findById(userId);
      if (!existingUser) {
        throw new Error('User not found');
      }
      
      // Create new user with migrated data
      const userData = existingUser.toObject();
      delete userData._id;
      delete userData.__v;
      
      const newUser = new ToModel({
        ...userData,
        ...additionalData,
        role: getNormalizedRole(toRole)
      });
      
      await newUser.save();
      
      // Delete old user
      await FromModel.findByIdAndDelete(userId);
      
      return {
        success: true,
        oldUserId: userId,
        newUserId: newUser._id,
        fromRole,
        toRole
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
};

export default {
  getUserModel,
  createUserModel,
  getAllUserModels,
  isValidRole,
  getNormalizedRole,
  findUserByEmail,
  findUserById,
  getUserStatistics,
  bulkOperations,
  migrationUtils
};
