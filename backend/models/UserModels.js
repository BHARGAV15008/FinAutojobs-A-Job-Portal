import mongoose from "mongoose";
import BaseUser from "./unified/BaseUser.js";
import Applicant from "./unified/Applicant.js";
import Recruiter from "./unified/Recruiter.js";
import Admin from "./unified/Admin.js";

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
    case "applicant":
      return Applicant;
    case "recruiter":
      return Recruiter;
    case "admin":
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
    if (!["applicant", "recruiter", "admin"].includes(role)) {
      throw new Error(
        'Invalid role. Must be "applicant", "recruiter", or "admin"'
      );
    }

    // Create user based on role
    let user;
    if (role === "applicant") {
      user = new Applicant({
        ...data,
        role: "applicant",
      });
    } else if (role === "recruiter") {
      user = new Recruiter({
        ...data,
        role: "recruiter",
      });
    } else if (role === "admin") {
      user = new Admin({
        ...data,
      });
    }

    // Save user
    await user.save();

    // Return user without password
    const userObj = user.toObject();
    delete userObj.password;

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
    console.log("🔍 authenticateUser called with:", { identifier, role });
    let user;

    console.log("🔍 Looking in BaseUser model...");
    user = await BaseUser.findOne({
      $and: [
        {
          $or: [
            { email: identifier.toLowerCase() },
            { username: identifier.toLowerCase() },
            { phone: identifier },
          ],
        },
        { role: role.toLowerCase() },
      ],
    });
    console.log("🔍 BaseUser search result:", user ? "Found" : "Not found");

    if (!user) {
      console.log(
        "❌ No user found with identifier:",
        identifier,
        "and role:",
        role
      );
      throw new Error(`No ${role} account found with these credentials`);
    }

    // Check if account is locked
    if (user.lockUntil && user.lockUntil > Date.now()) {
      throw new Error("Account is temporarily locked. Please try again later.");
    }

    // Check if account is active
    if (user.isActive === false) {
      throw new Error("Account is inactive. Please contact support.");
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      // Increment login attempts
      const updateData = {
        loginAttempts: (user.loginAttempts || 0) + 1,
      };

      // Lock account after 5 failed attempts
      if ((user.loginAttempts || 0) >= 4) {
        // >= 4 because we're incrementing by 1
        updateData.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
      }

      // Update in the appropriate model
      await BaseUser.findByIdAndUpdate(user._id, updateData, {
        validateBeforeSave: false,
        runValidators: false,
      });
      throw new Error("Invalid password");
    }

    // Reset login attempts and update lastLogin on successful login
    await BaseUser.findByIdAndUpdate(
      user._id,
      {
        loginAttempts: 0,
        $unset: { lockUntil: 1 },
        lastLogin: new Date(),
        lastActivity: new Date(),
      },
      {
        validateBeforeSave: false,
        runValidators: false,
      }
    );

    // Return user without password
    const userObj = user.toObject();
    delete userObj.password;

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
      role: role,
    });

    if (!user) {
      throw new Error(`${role} not found`);
    }

    const userObj = user.toObject();
    delete userObj.password;

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
    console.log("🔍 updateUserProfile called with:", {
      userId,
      role,
      updateDataKeys: Object.keys(updateData),
    });

    // Remove sensitive fields that shouldn't be updated directly
    const {
      password,
      role: userRole,
      _id,
      userId: uid,
      ...safeUpdateData
    } = updateData;

    // Create a mapped update object to handle frontend vs backend field differences
    const mappedData = {};

    // Process and map fields
    Object.keys(safeUpdateData).forEach((key) => {
      let value = safeUpdateData[key];

      // 1. Handle JSON stringified arrays (from some frontend forms)
      if (
        [
          "education",
          "workExperience",
          "primarySkills",
          "technicalSkills",
          "softSkills",
        ].includes(key) &&
        typeof value === "string"
      ) {
        try {
          if (value.startsWith("[") || value.startsWith("{")) {
            const parsedValue = JSON.parse(value);
            console.log(`🔍 Parsed JSON for ${key}:`, parsedValue);
            value = parsedValue;
          }
        } catch (e) {
          console.warn(`⚠️ Failed to parse ${key} as JSON:`, e.message);
        }
      }

            // 2. Map fields based on known frontend-backend mismatches

            if (key === 'full_name' || key === 'fullName' || key === 'name') {

              mappedData.fullName = value;

              // Also try to split into firstName/lastName if they aren't provided by the form

              if (!safeUpdateData.firstName && !safeUpdateData.lastName && typeof value === 'string') {

                const parts = value.split(' ');

                mappedData.firstName = parts[0];

                mappedData.lastName = parts.slice(1).join(' ') || parts[0] || '';

              }

            } else if (key === 'experience_years') {

              mappedData.yearsOfExperience = value;

              // Also keep experience_years for compatibility if needed elsewhere

              mappedData.experience_years = value;

            } else if (key === 'location') {

              // Map location to currentLocation.city and also keep top-level location for compatibility

              if (typeof value === 'string') {

                mappedData['currentLocation.city'] = value;

                mappedData.location = value; // Compatibility field

              }

            } else if (key === 'company_name' && role === 'applicant') {

              mappedData['careerInfo.currentCompany'] = value;

              mappedData.company_name = value; // Compatibility field

            } else if (key === 'position' && role === 'applicant') {

              mappedData['careerInfo.currentJobTitle'] = value;

              mappedData.position = value; // Compatibility field

            } else if (key === 'qualification') {

              mappedData.qualification = value; // Compatibility field

              mappedData.highestEducation = value;

            } else if (key === 'linkedin_url') {

              mappedData['socialLinks.linkedinUrl'] = value;

              mappedData.linkedin_url = value; // Compatibility field

            } else if (key === 'github_url') {

              mappedData['socialLinks.githubUrl'] = value;

              mappedData.github_url = value; // Compatibility field

            } else if (key === 'portfolio_url') {

              mappedData['socialLinks.portfolioUrl'] = value;

              mappedData.portfolio_url = value; // Compatibility field

            } else if (key === 'skills' && Array.isArray(value) && role === 'applicant') {

              mappedData.skills = value; // 'skills' is now a direct array in Applicant schema

            } else if (key === 'company' && role === 'recruiter') {

              mappedData['companyInfo.companyName'] = value;

            } else if (key === 'job_title' && role === 'recruiter') {

              mappedData['companyInfo.designation'] = value;

            }

            

            // Default: keep as is if not handled by specific mapping

            mappedData[key] = value;
    });

    console.log("🔍 Mapped update data:", {
      mappedDataKeys: Object.keys(mappedData),
    });

    const user = await BaseUser.findOneAndUpdate(
      {
        $or: [{ _id: userId }, { userId: userId }],
        role: role.toLowerCase(),
      },
      { $set: mappedData },
      { new: true, runValidators: false } // Disable validators temporarily to allow compatibility fields
    );

    if (!user) {
                // Always parse skills as array if stringified
                let skillsArr = value;
                if (typeof value === 'string') {
                  try {
                    const parsed = JSON.parse(value);
                    if (Array.isArray(parsed)) {
                      skillsArr = parsed;
                    } else {
                      skillsArr = [value];
                    }
                  } catch (e) {
                    skillsArr = [value];
                  }
                }
                if (Array.isArray(skillsArr)) {
                  mappedData["skills.primary"] = skillsArr;
                  hasSkillsPrimary = true;
                }
                // Only set top-level skills if not setting subfield
                if (!hasSkillsPrimary) {
                  mappedData.skills = skillsArr;
                }
      throw new Error("User not found");
    }

    // Return user without password
    const userObj = user.toObject();
    delete userObj.password;

    return userObj;
  } catch (error) {
    console.error("❌ updateUserProfile error:", error);
    throw error;
  }
};

/**
 * Check if a field value is available (not taken by another user)
 * @param {string} field - Field to check ('email', 'username', or 'phone')
 * @param {string} value - Value to check
 * @param {string} role - Optional role to scope the check (for email/phone)
 * @returns {Promise<boolean>} True if available, false if taken
 */
export const checkFieldAvailability = async (field, value, role) => {
  try {
    const query = {};

    if (field === "email" || field === "username") {
      query[field] = value.toLowerCase();
    } else {
      query[field] = value;
    }

    // For email and phone, we usually check within the same role
    // depending on business requirements. Here we check globally for username,
    // and by role for email/phone if role is provided.
    if (role && (field === "email" || field === "phone")) {
      query.role = role.toLowerCase();
    }

    const existingUser = await BaseUser.findOne(query);
    return !existingUser;
  } catch (error) {
    console.error(`Error checking ${field} availability:`, error);
    throw error;
  }
};
