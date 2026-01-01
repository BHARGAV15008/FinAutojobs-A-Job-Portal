import BaseUser from './BaseUser.js';
import Recruiter from './Recruiter.js';
import Applicant from './Applicant.js';

/**
 * Unified User Management with consistent naming
 */
export class UserManager {
  
  static getModel(role) {
    switch (role) {
      case 'recruiter': return Recruiter;
      case 'applicant': return Applicant;
      default: return BaseUser;
    }
  }
  
  // Create user with unified data structure
  static async createUser(userData) {
    const UserModel = this.getModel(userData.role);
    const unifiedData = this.transformRegistrationData(userData);
    return await new UserModel(unifiedData).save();
  }
  
  // Transform registration to unified format
  static transformRegistrationData(formData) {
    const baseData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
      role: formData.role
    };
    
    if (formData.role === 'recruiter') {
      baseData.companyInfo = {
        companyName: formData.companyName || formData.company,
        jobTitle: formData.position || formData.jobTitle
      };
    }
    
    return baseData;
  }
  
  // Update profile with unified field mapping
  static async updateProfile(userId, role, updateData) {
    const UserModel = this.getModel(role);
    const transformedData = this.transformProfileData(updateData, role);
    
    return await UserModel.findByIdAndUpdate(
      userId,
      { $set: transformedData },
      { new: true, runValidators: true }
    ).select('-password');
  }
  
  // Transform profile data with consistent naming
  static transformProfileData(formData, role) {
    const data = {};
    
    // Basic fields
    if (formData.firstName) data.firstName = formData.firstName;
    if (formData.lastName) data.lastName = formData.lastName;
    if (formData.phone) data.phone = formData.phone;
    if (formData.bio) data.bio = formData.bio;
    
    // Social links (unified naming)
    if (formData.linkedinUrl || formData.linkedin_url) {
      data['socialLinks.linkedinUrl'] = formData.linkedinUrl || formData.linkedin_url;
    }
    if (formData.githubUrl || formData.github_url) {
      data['socialLinks.githubUrl'] = formData.githubUrl || formData.github_url;
    }
    if (formData.portfolioUrl || formData.portfolio_url) {
      data['socialLinks.portfolioUrl'] = formData.portfolioUrl || formData.portfolio_url;
    }
    
    // Role-specific fields
    if (role === 'recruiter') {
      if (formData.companyName || formData.company) {
        data['companyInfo.companyName'] = formData.companyName || formData.company;
      }
      if (formData.jobTitle || formData.position) {
        data['companyInfo.jobTitle'] = formData.jobTitle || formData.position;
      }
    }
    
    return data;
  }
  
  static async findByEmailAndRole(email, role) {
    const UserModel = this.getModel(role);
    return await UserModel.findOne({ email: email.toLowerCase(), role });
  }
}
