import mongoose from 'mongoose';
import BaseUser from './unified/BaseUser.js';
import Applicant from './unified/Applicant.js';
import Recruiter from './unified/Recruiter.js';
import Admin from './unified/Admin.js';
import SimpleUser from './User.js'; // Simple User model for admin accounts

/**
 * Unified User Models with Role-Based Registration and Authentication
 * 
 * This module provides:
 * 1. Role-based user creation (Applicant/Recruiter)
 * 2. Authentication validation
 * 3. Profile management
 * 4. Unified data access
 */

// Export models
export { BaseUser, Applicant, Recruiter, Admin };

/**
 * Get the appropriate model based on user role
 * @param {string} role - User role ('applicant', 'recruiter', or 'admin')
 * @returns {Model} Mongoose model for the specified role
 */
export const getUserModel = (role) => {
  switch (role?.toLowerCase()) {
    case 'applicant':
      return Applicant;
    case 'recruiter':
      return Recruiter;
    case 'admin':
      return Admin;
    default:
      return BaseUser;
  }
};

/**
 * Create a new user based on role
 * @param {Object} userData - User registration data
 * @param {string} userData.role - User role ('applicant' or 'recruiter')
 * @returns {Promise<Object>} Created user object
 */
export const createUserByRole = async (userData) => {
  try {
    const { role, ...data } = userData;
    
    // Validate role
    if (!['applicant', 'recruiter', 'admin'].includes(role)) {
      throw new Error('Invalid role. Must be "applicant", "recruiter", or "admin"');
    }
    
    // Create user based on role
    let user;
    if (role === 'applicant') {
      user = new Applicant({
        ...data,
        role: 'applicant'
      });
    } else if (role === 'recruiter') {
      user = new Recruiter({
        ...data,
        role: 'recruiter'
      });
    } else if (role === 'admin') {
      user = new Admin({
        ...data,
        role: 'admin'
      });
    }
    
    // Save user
    await user.save();
    
    // Return user without password
    const userObj = user.toObject();
    delete userObj.password;
    
    // Fix malformed languages data if it exists
    if (userObj.languages && typeof userObj.languages === 'string') {
      try {
        userObj.languages = JSON.parse(userObj.languages);
      } catch (e) {
        if (userObj.languages.includes(',')) {
          userObj.languages = userObj.languages.split(',').map(lang => lang.trim());
        } else {
          userObj.languages = [userObj.languages];
        }
      }
    }
    
    if (!Array.isArray(userObj.languages)) {
      userObj.languages = [];
    }
    
    // Fix malformed skills.languages data if it exists
    if (userObj.skills && userObj.skills.languages && typeof userObj.skills.languages === 'string') {
      try {
        userObj.skills.languages = JSON.parse(userObj.skills.languages);
      } catch (e) {
        if (userObj.skills.languages.includes(',')) {
          userObj.skills.languages = userObj.skills.languages.split(',').map(lang => lang.trim());
        } else {
          userObj.skills.languages = [userObj.skills.languages];
        }
      }
    }
    
    if (userObj.skills && !Array.isArray(userObj.skills.languages)) {
      userObj.skills.languages = [];
    }
    
    return userObj;
  } catch (error) {
    throw error;
  }
};

/**
 * Authenticate user with role validation
 * @param {string} identifier - Email, username, or phone
 * @param {string} password - User password
 * @param {string} role - Expected role ('applicant', 'recruiter', or 'admin')
 * @returns {Promise<Object>} Authenticated user object
 */
export const authenticateUser = async (identifier, password, role) => {
  try {
    console.log('🔍 authenticateUser called with:', { identifier, role });
    let user;
    
    // For admin role, try SimpleUser model first (where admin accounts are created)
    if (role.toLowerCase() === 'admin') {
      console.log('🔍 Looking for admin in SimpleUser model...');
      user = await SimpleUser.findOne({
        $or: [
          { email: identifier.toLowerCase() },
          { phoneNumber: identifier }
        ],
        role: 'admin'
      });
      console.log('🔍 SimpleUser search result:', user ? 'Found admin user' : 'Not found');
      if (user) {
        console.log('✅ Admin found:', { email: user.email, id: user._id });
      }
    }
    
    // If not found in SimpleUser or not admin, try BaseUser
    if (!user) {
      console.log('🔍 Looking in BaseUser model...');
      user = await BaseUser.findOne({
        $and: [
          {
            $or: [
              { email: identifier.toLowerCase() },
              { username: identifier.toLowerCase() },
              { phone: identifier },
              { phoneNumber: identifier }
            ]
          },
          { role: role.toLowerCase() }
        ]
      });
      console.log('🔍 BaseUser search result:', user ? 'Found' : 'Not found');
    }
    
    if (!user) {
      console.log('❌ No user found with identifier:', identifier, 'and role:', role);
      throw new Error(`No ${role} account found with these credentials`);
    }
    
    // Check if account is locked
    if (user.lockUntil && user.lockUntil > Date.now()) {
      throw new Error('Account is temporarily locked. Please try again later.');
    }
    
    // Check if account is active
    if (user.isActive === false) {
      throw new Error('Account is inactive. Please contact support.');
    }
    
    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      // Increment login attempts
      const updateData = {
        loginAttempts: (user.loginAttempts || 0) + 1
      };
      
      // Lock account after 5 failed attempts
      if ((user.loginAttempts || 0) >= 4) { // >= 4 because we're incrementing by 1
        updateData.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
      }
      
      // Update in the appropriate model
      const UserModel = role.toLowerCase() === 'admin' ? SimpleUser : BaseUser;
      await UserModel.findByIdAndUpdate(user._id, updateData, { 
        validateBeforeSave: false,
        runValidators: false 
      });
      throw new Error('Invalid password');
    }
    
    // Reset login attempts and update lastLogin on successful login
    const UserModel = role.toLowerCase() === 'admin' ? SimpleUser : BaseUser;
    await UserModel.findByIdAndUpdate(user._id, {
      loginAttempts: 0,
      $unset: { lockUntil: 1 },
      lastLogin: new Date(),
      lastActivity: new Date()
    }, { 
      validateBeforeSave: false,
      runValidators: false 
    });
    
    // Return user without password
    const userObj = user.toObject();
    delete userObj.password;
    
    // Fix malformed languages data if it exists
    if (userObj.languages && typeof userObj.languages === 'string') {
      try {
        // Try to parse JSON string to array
        userObj.languages = JSON.parse(userObj.languages);
      } catch (e) {
        // If parsing fails, split by comma or set to empty array
        if (userObj.languages.includes(',')) {
          userObj.languages = userObj.languages.split(',').map(lang => lang.trim());
        } else {
          userObj.languages = [userObj.languages];
        }
      }
    }
    
    // Ensure languages is always an array
    if (!Array.isArray(userObj.languages)) {
      userObj.languages = [];
    }
    
    // Fix malformed skills.languages data if it exists
    if (userObj.skills && userObj.skills.languages && typeof userObj.skills.languages === 'string') {
      try {
        userObj.skills.languages = JSON.parse(userObj.skills.languages);
      } catch (e) {
        if (userObj.skills.languages.includes(',')) {
          userObj.skills.languages = userObj.skills.languages.split(',').map(lang => lang.trim());
        } else {
          userObj.skills.languages = [userObj.skills.languages];
        }
      }
    }
    
    // Ensure skills.languages is always an array
    if (userObj.skills && !Array.isArray(userObj.skills.languages)) {
      userObj.skills.languages = [];
    }
    
    return userObj;
  } catch (error) {
    throw error;
  }
};

/**
 * Find user by ID with role validation
 * @param {string} userId - User ID
 * @param {string} role - Expected role
 * @returns {Promise<Object>} User object
 */
export const findUserByIdAndRole = async (userId, role) => {
  try {
    const user = await BaseUser.findOne({ 
      $or: [{ _id: userId }, { userId: userId }],
      role: role 
    });
    
    if (!user) {
      throw new Error(`${role} not found`);
    }
    
    const userObj = user.toObject();
    delete userObj.password;
    
    // Fix malformed languages data if it exists
    if (userObj.languages && typeof userObj.languages === 'string') {
      try {
        userObj.languages = JSON.parse(userObj.languages);
      } catch (e) {
        if (userObj.languages.includes(',')) {
          userObj.languages = userObj.languages.split(',').map(lang => lang.trim());
        } else {
          userObj.languages = [userObj.languages];
        }
      }
    }
    
    if (!Array.isArray(userObj.languages)) {
      userObj.languages = [];
    }
    
    // Fix malformed skills.languages data if it exists
    if (userObj.skills && userObj.skills.languages && typeof userObj.skills.languages === 'string') {
      try {
        userObj.skills.languages = JSON.parse(userObj.skills.languages);
      } catch (e) {
        if (userObj.skills.languages.includes(',')) {
          userObj.skills.languages = userObj.skills.languages.split(',').map(lang => lang.trim());
        } else {
          userObj.skills.languages = [userObj.skills.languages];
        }
      }
    }
    
    if (userObj.skills && !Array.isArray(userObj.skills.languages)) {
      userObj.skills.languages = [];
    }
    
    return userObj;
  } catch (error) {
    throw error;
  }
};

/**
 * Update user profile
 * @param {string} userId - User ID
 * @param {Object} updateData - Data to update
 * @param {string} role - User role
 * @returns {Promise<Object>} Updated user object
 */
export const updateUserProfile = async (userId, updateData, role) => {
  try {
    console.log('🔍 updateUserProfile called with:', {
      userId,
      role,
      updateDataKeys: Object.keys(updateData),
      updateData
    });
    
    // Remove sensitive fields that shouldn't be updated directly
    const { password, role: userRole, _id, userId: uid, ...safeUpdateData } = updateData;
    
    console.log('🔍 Safe update data:', {
      safeUpdateDataKeys: Object.keys(safeUpdateData),
      safeUpdateData
    });
    
    // For nested object updates, we need to use $set with dot notation
    const updateQuery = {};
    
    // Handle nested objects properly
    for (const [key, value] of Object.entries(safeUpdateData)) {
      if (key === 'companyInfo' && typeof value === 'object' && value !== null) {
        // Handle companyInfo nested updates
        for (const [nestedKey, nestedValue] of Object.entries(value)) {
          updateQuery[`companyInfo.${nestedKey}`] = nestedValue;
        }
      } else if (key === 'professionalLinks' && typeof value === 'object' && value !== null) {
        // Handle professionalLinks nested updates
        for (const [nestedKey, nestedValue] of Object.entries(value)) {
          updateQuery[`professionalLinks.${nestedKey}`] = nestedValue;
        }
      } else if (key === 'officeLocation' && typeof value === 'object' && value !== null) {
        // Handle officeLocation nested updates
        for (const [nestedKey, nestedValue] of Object.entries(value)) {
          updateQuery[`officeLocation.${nestedKey}`] = nestedValue;
        }
      } else if (key === 'currentLocation' && typeof value === 'object' && value !== null) {
        // Handle currentLocation nested updates for applicants
        for (const [nestedKey, nestedValue] of Object.entries(value)) {
          updateQuery[`currentLocation.${nestedKey}`] = nestedValue;
        }
      } else if (key === 'skills' && typeof value === 'object' && value !== null) {
        // Handle skills nested updates for applicants
        for (const [nestedKey, nestedValue] of Object.entries(value)) {
          updateQuery[`skills.${nestedKey}`] = nestedValue;
        }
      } else if (key === 'careerInfo' && typeof value === 'object' && value !== null) {
        // Handle careerInfo nested updates for applicants
        for (const [nestedKey, nestedValue] of Object.entries(value)) {
          updateQuery[`careerInfo.${nestedKey}`] = nestedValue;
        }
      } else if (key === 'documents' && typeof value === 'object' && value !== null) {
        // Handle documents nested updates for applicants
        for (const [nestedKey, nestedValue] of Object.entries(value)) {
          updateQuery[`documents.${nestedKey}`] = nestedValue;
        }
      } else if (key === 'jobPreferences' && typeof value === 'object' && value !== null) {
        // Handle jobPreferences nested updates for applicants
        for (const [nestedKey, nestedValue] of Object.entries(value)) {
          updateQuery[`jobPreferences.${nestedKey}`] = nestedValue;
        }
      } else {
        // Handle flat fields normally
        updateQuery[key] = value;
      }
    }
    
    console.log('🔍 Final update query:', updateQuery);
    
    const user = await BaseUser.findOneAndUpdate(
      { 
        $or: [{ _id: userId }, { userId: userId }],
        role: role 
      },
      { $set: updateQuery },
      { new: true, runValidators: true }
    );
    
    console.log('🔍 User found and updated:', user ? 'Yes' : 'No');
    
    if (!user) {
      throw new Error(`${role} not found`);
    }
    
    const userObj = user.toObject();
    delete userObj.password;
    
    // Fix malformed languages data if it exists
    if (userObj.languages && typeof userObj.languages === 'string') {
      try {
        userObj.languages = JSON.parse(userObj.languages);
      } catch (e) {
        if (userObj.languages.includes(',')) {
          userObj.languages = userObj.languages.split(',').map(lang => lang.trim());
        } else {
          userObj.languages = [userObj.languages];
        }
      }
    }
    
    if (!Array.isArray(userObj.languages)) {
      userObj.languages = [];
    }
    
    // Fix malformed skills.languages data if it exists
    if (userObj.skills && userObj.skills.languages && typeof userObj.skills.languages === 'string') {
      try {
        userObj.skills.languages = JSON.parse(userObj.skills.languages);
      } catch (e) {
        if (userObj.skills.languages.includes(',')) {
          userObj.skills.languages = userObj.skills.languages.split(',').map(lang => lang.trim());
        } else {
          userObj.skills.languages = [userObj.skills.languages];
        }
      }
    }
    
    if (userObj.skills && !Array.isArray(userObj.skills.languages)) {
      userObj.skills.languages = [];
    }
    
    return userObj;
  } catch (error) {
    throw error;
  }
};

/**
 * Check if email/username/phone is already taken
 * @param {string} field - Field name ('email', 'username', 'phone')
 * @param {string} value - Field value
 * @param {string} role - Role to check against
 * @param {string} excludeUserId - User ID to exclude from check (for updates)
 * @returns {Promise<boolean>} True if available, false if taken
 */
export const checkFieldAvailability = async (field, value, role, excludeUserId = null) => {
  try {
    const query = { [field]: field === 'email' || field === 'username' ? value.toLowerCase() : value };
    
    // For email and phone, check within the same role
    if (field === 'email' || field === 'phone') {
      query.role = role;
    }
    
    // Exclude current user if updating
    if (excludeUserId) {
      query._id = { $ne: excludeUserId };
    }
    
    const existingUser = await BaseUser.findOne(query);
    return !existingUser; // Return true if available (no existing user)
  } catch (error) {
    throw error;
  }
};

/**
 * Get user statistics by role
 * @param {string} role - User role
 * @returns {Promise<Object>} User statistics
 */
export const getUserStatsByRole = async (role) => {
  try {
    const totalUsers = await BaseUser.countDocuments({ role });
    const activeUsers = await BaseUser.countDocuments({ role, status: 'active' });
    const verifiedUsers = await BaseUser.countDocuments({ role, isEmailVerified: true });
    
    return {
      total: totalUsers,
      active: activeUsers,
      verified: verifiedUsers,
      verificationRate: totalUsers > 0 ? (verifiedUsers / totalUsers * 100).toFixed(2) : 0
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Search users by role with filters
 * @param {string} role - User role
 * @param {Object} filters - Search filters
 * @param {Object} options - Pagination and sorting options
 * @returns {Promise<Object>} Search results
 */
export const searchUsersByRole = async (role, filters = {}, options = {}) => {
  try {
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = -1 } = options;
    const skip = (page - 1) * limit;
    
    // Build query
    const query = { role, ...filters };
    
    // Execute search
    const users = await BaseUser.find(query)
      .select('-password')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(limit);
    
    const total = await BaseUser.countDocuments(query);
    
    return {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    throw error;
  }
};

// Default export
export default {
  BaseUser,
  Applicant,
  Recruiter,
  createUserByRole,
  authenticateUser,
  findUserByIdAndRole,
  updateUserProfile,
  checkFieldAvailability,
  getUserStatsByRole,
  searchUsersByRole
};
