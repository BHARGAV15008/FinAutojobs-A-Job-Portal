/**
 * Company Factory
 * 
 * Factory pattern implementation for creating and managing company-related models.
 * Provides unified interface for company profiles, verification, and analytics.
 * 
 * @author FinAutoJobs Team
 * @version 1.0.0
 */

import mongoose from 'mongoose';
import CompanySchema from './CompanySchema.js';

// Model cache to avoid re-compilation
const modelCache = new Map();

/**
 * Get company-related model based on type
 * @param {string} type - Model type (company)
 * @returns {mongoose.Model} Mongoose model for the specified type
 */
export const getCompanyModel = (type = 'company') => {
  const normalizedType = type.toLowerCase();
  
  // Check cache first
  if (modelCache.has(normalizedType)) {
    return modelCache.get(normalizedType);
  }
  
  let model;
  
  switch (normalizedType) {
    case 'company':
    case 'companies':
      model = mongoose.model('Company', CompanySchema);
      break;
      
    default:
      throw new Error(`Invalid company model type: ${type}. Supported types: company`);
  }
  
  // Cache the model
  modelCache.set(normalizedType, model);
  
  return model;
};

/**
 * Create a new company-related model instance
 * @param {string} type - Model type
 * @param {Object} data - Model data
 * @returns {mongoose.Document} New model document
 */
export const createCompanyModel = (type = 'company', data = {}) => {
  const Model = getCompanyModel(type);
  return new Model(data);
};

/**
 * Company search with advanced filtering
 * @param {Object} filters - Search filters
 * @param {Object} options - Query options (sort, limit, skip)
 * @returns {Promise<Array>} Search results
 */
export const searchCompanies = async (filters = {}, options = {}) => {
  const CompanyModel = getCompanyModel('company');
  
  // Build query
  const query = {};
  
  // Text search
  if (filters.keywords) {
    query.$text = { $search: filters.keywords };
  }
  
  // Location filter
  if (filters.location) {
    if (filters.location.city) {
      query['headquarters.address.city'] = new RegExp(filters.location.city, 'i');
    }
    if (filters.location.state) {
      query['headquarters.address.state'] = new RegExp(filters.location.state, 'i');
    }
    if (filters.location.country) {
      query['headquarters.address.country'] = new RegExp(filters.location.country, 'i');
    }
  }
  
  // Industry filter
  if (filters.industry && filters.industry.length > 0) {
    query['industry.primary'] = { $in: filters.industry };
  }
  
  // Company size filter
  if (filters.companySize && filters.companySize.length > 0) {
    query['companySize.category'] = { $in: filters.companySize };
  }
  
  // Company type filter
  if (filters.companyType && filters.companyType.length > 0) {
    query.companyType = { $in: filters.companyType };
  }
  
  // Verification status filter
  if (filters.verificationStatus) {
    query['verification.status'] = filters.verificationStatus;
  }
  
  // Rating filter
  if (filters.minRating) {
    query['ratings.overall.average'] = { $gte: filters.minRating };
  }
  
  // Status filter (default to active)
  query.status = filters.status || 'active';
  
  // Build options
  const queryOptions = {
    sort: options.sort || { 'ratings.overall.average': -1, createdAt: -1 },
    limit: options.limit || 20,
    skip: options.skip || 0
  };
  
  // Execute query
  const companies = await CompanyModel.find(query, null, queryOptions)
    .select({
      name: 1,
      slug: 1,
      description: 1,
      shortDescription: 1,
      'industry.primary': 1,
      companyType: 1,
      'companySize.category': 1,
      'headquarters.address': 1,
      'media.logo': 1,
      'ratings.overall': 1,
      'verification.status': 1,
      'jobStats.activeJobs': 1,
      status: 1,
      establishedDate: 1
    });
  
  // Get total count for pagination
  const totalCount = await CompanyModel.countDocuments(query);
  
  return {
    companies,
    totalCount,
    hasMore: (options.skip || 0) + companies.length < totalCount,
    filters: filters,
    options: queryOptions
  };
};

/**
 * Get company recommendations for a user
 * @param {string} userId - User ID
 * @param {string} userRole - User role
 * @param {number} limit - Number of recommendations
 * @returns {Promise<Array>} Recommended companies
 */
export const getCompanyRecommendations = async (userId, userRole = 'applicant', limit = 10) => {
  if (userRole !== 'applicant') {
    return [];
  }
  
  const { getUserModel } = await import('../users/UserFactory.js');
  const UserModel = getUserModel('applicant');
  const CompanyModel = getCompanyModel('company');
  
  // Get user profile
  const user = await UserModel.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  
  // Build recommendation query based on user profile
  const query = {
    status: 'active',
    'verification.status': 'verified'
  };
  
  // Industry preference matching
  if (user.jobPreferences && user.jobPreferences.preferredIndustries) {
    query['industry.primary'] = { $in: user.jobPreferences.preferredIndustries };
  }
  
  // Location preference matching
  if (user.jobPreferences && user.jobPreferences.preferredLocations) {
    const preferredCities = user.jobPreferences.preferredLocations.map(loc => loc.city);
    if (preferredCities.length > 0) {
      query['headquarters.address.city'] = { $in: preferredCities };
    }
  }
  
  // Company size preference
  if (user.jobPreferences && user.jobPreferences.companySizePreference) {
    query['companySize.category'] = { $in: user.jobPreferences.companySizePreference };
  }
  
  // Execute recommendation query
  const recommendations = await CompanyModel.find(query)
    .sort({ 'ratings.overall.average': -1, 'jobStats.activeJobs': -1 })
    .limit(limit)
    .select({
      name: 1,
      slug: 1,
      shortDescription: 1,
      'industry.primary': 1,
      'companySize.category': 1,
      'headquarters.address.city': 1,
      'headquarters.address.state': 1,
      'media.logo': 1,
      'ratings.overall': 1,
      'jobStats.activeJobs': 1
    });
  
  return recommendations;
};

/**
 * Get company analytics and insights
 * @param {string} companyId - Company ID
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Company analytics
 */
export const getCompanyAnalytics = async (companyId, options = {}) => {
  const CompanyModel = getCompanyModel('company');
  const { getJobModel } = await import('../jobs/JobFactory.js');
  const JobModel = getJobModel('job');
  const ApplicationModel = getJobModel('application');
  
  const {
    dateRange = 30
  } = options;
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - dateRange);
  
  // Get company details
  const company = await CompanyModel.findById(companyId);
  if (!company) {
    throw new Error('Company not found');
  }
  
  // Get job statistics
  const jobStats = await JobModel.aggregate([
    {
      $match: {
        'company.companyId': new mongoose.Types.ObjectId(companyId),
        publishedAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: null,
        totalJobs: { $sum: 1 },
        activeJobs: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
        totalViews: { $sum: '$analytics.views' },
        avgViews: { $avg: '$analytics.views' },
        totalApplications: { $sum: '$applicationStats.totalApplications' }
      }
    }
  ]);
  
  // Get application statistics
  const applicationStats = await ApplicationModel.aggregate([
    {
      $match: {
        'job.companyId': new mongoose.Types.ObjectId(companyId),
        submittedAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
  
  // Get hiring funnel metrics
  const hiringFunnel = await ApplicationModel.aggregate([
    {
      $match: {
        'job.companyId': new mongoose.Types.ObjectId(companyId),
        submittedAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: null,
        totalApplications: { $sum: 1 },
        shortlisted: { $sum: { $cond: [{ $eq: ['$status', 'shortlisted'] }, 1, 0] } },
        interviewed: { $sum: { $cond: [{ $in: ['$status', ['interview_scheduled', 'interview_completed']] }, 1, 0] } },
        offered: { $sum: { $cond: [{ $eq: ['$status', 'offer_extended'] }, 1, 0] } },
        hired: { $sum: { $cond: [{ $eq: ['$status', 'hired'] }, 1, 0] } }
      }
    },
    {
      $addFields: {
        shortlistRate: { $multiply: [{ $divide: ['$shortlisted', '$totalApplications'] }, 100] },
        interviewRate: { $multiply: [{ $divide: ['$interviewed', '$shortlisted'] }, 100] },
        offerRate: { $multiply: [{ $divide: ['$offered', '$interviewed'] }, 100] },
        hireRate: { $multiply: [{ $divide: ['$hired', '$offered'] }, 100] }
      }
    }
  ]);
  
  return {
    company: {
      id: company._id,
      name: company.name,
      industry: company.industry.primary,
      size: company.companySize.category,
      rating: company.ratings.overall.average
    },
    jobMetrics: jobStats.length > 0 ? jobStats[0] : {},
    applicationBreakdown: applicationStats,
    hiringFunnel: hiringFunnel.length > 0 ? hiringFunnel[0] : {},
    dateRange,
    generatedAt: new Date()
  };
};

/**
 * Company verification utilities
 */
export const companyVerification = {
  /**
   * Submit company for verification
   * @param {string} companyId - Company ID
   * @param {Array} documents - Verification documents
   * @returns {Promise<mongoose.Document>} Updated company
   */
  submitForVerification: async (companyId, documents = []) => {
    const CompanyModel = getCompanyModel('company');
    
    const updateData = {
      'verification.status': 'pending',
      'verification.documents': documents.map(doc => ({
        ...doc,
        uploadedAt: new Date(),
        isVerified: false
      }))
    };
    
    return await CompanyModel.findByIdAndUpdate(companyId, updateData, { new: true });
  },
  
  /**
   * Verify company
   * @param {string} companyId - Company ID
   * @param {string} verifiedBy - Verifier user ID
   * @param {Array} verifiedDocuments - Verified document types
   * @returns {Promise<mongoose.Document>} Updated company
   */
  verifyCompany: async (companyId, verifiedBy, verifiedDocuments = []) => {
    const CompanyModel = getCompanyModel('company');
    
    const company = await CompanyModel.findById(companyId);
    if (!company) {
      throw new Error('Company not found');
    }
    
    // Mark specified documents as verified
    if (verifiedDocuments.length > 0) {
      company.verification.documents.forEach(doc => {
        if (verifiedDocuments.includes(doc.type)) {
          doc.isVerified = true;
        }
      });
    }
    
    company.verification.status = 'verified';
    company.verification.verifiedBy = verifiedBy;
    company.verification.verifiedAt = new Date();
    
    return await company.save();
  },
  
  /**
   * Reject company verification
   * @param {string} companyId - Company ID
   * @param {string} rejectedBy - Rejector user ID
   * @param {string} reason - Rejection reason
   * @returns {Promise<mongoose.Document>} Updated company
   */
  rejectVerification: async (companyId, rejectedBy, reason) => {
    const CompanyModel = getCompanyModel('company');
    
    const updateData = {
      'verification.status': 'rejected',
      'verification.verifiedBy': rejectedBy,
      'verification.verifiedAt': new Date(),
      'verification.rejectionReason': reason
    };
    
    return await CompanyModel.findByIdAndUpdate(companyId, updateData, { new: true });
  },
  
  /**
   * Get companies pending verification
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Companies pending verification
   */
  getPendingVerifications: async (options = {}) => {
    const CompanyModel = getCompanyModel('company');
    
    const {
      limit = 20,
      skip = 0,
      sortBy = 'createdAt'
    } = options;
    
    return await CompanyModel.find({
      'verification.status': 'pending'
    })
    .sort({ [sortBy]: -1 })
    .limit(limit)
    .skip(skip)
    .select({
      name: 1,
      'industry.primary': 1,
      'companySize.category': 1,
      'headquarters.address': 1,
      'verification.documents': 1,
      createdAt: 1
    });
  }
};

/**
 * Company rating and review utilities
 */
export const companyRatings = {
  /**
   * Add company rating
   * @param {string} companyId - Company ID
   * @param {string} category - Rating category
   * @param {number} rating - Rating value (1-5)
   * @param {string} userId - User ID who gave the rating
   * @returns {Promise<mongoose.Document>} Updated company
   */
  addRating: async (companyId, category, rating, userId) => {
    const CompanyModel = getCompanyModel('company');
    
    const company = await CompanyModel.findById(companyId);
    if (!company) {
      throw new Error('Company not found');
    }
    
    // Update category rating
    if (company.ratings.categories[category]) {
      const current = company.ratings.categories[category];
      const newAverage = ((current.average * current.count) + rating) / (current.count + 1);
      
      company.ratings.categories[category].average = newAverage;
      company.ratings.categories[category].count += 1;
    }
    
    // Update overall rating
    const categories = Object.keys(company.ratings.categories);
    const totalRating = categories.reduce((sum, cat) => sum + company.ratings.categories[cat].average, 0);
    company.ratings.overall.average = totalRating / categories.length;
    company.ratings.overall.count = Math.max(...categories.map(cat => company.ratings.categories[cat].count));
    
    company.ratings.lastUpdated = new Date();
    
    return await company.save();
  },
  
  /**
   * Get top rated companies
   * @param {Object} filters - Filter criteria
   * @param {number} limit - Number of companies to return
   * @returns {Promise<Array>} Top rated companies
   */
  getTopRated: async (filters = {}, limit = 10) => {
    const CompanyModel = getCompanyModel('company');
    
    const query = {
      status: 'active',
      'verification.status': 'verified',
      'ratings.overall.count': { $gte: 5 } // At least 5 ratings
    };
    
    if (filters.industry) {
      query['industry.primary'] = filters.industry;
    }
    
    if (filters.location) {
      query['headquarters.address.city'] = filters.location;
    }
    
    return await CompanyModel.find(query)
      .sort({ 'ratings.overall.average': -1, 'ratings.overall.count': -1 })
      .limit(limit)
      .select({
        name: 1,
        slug: 1,
        'industry.primary': 1,
        'headquarters.address.city': 1,
        'media.logo': 1,
        'ratings.overall': 1,
        'jobStats.activeJobs': 1
      });
  }
};

/**
 * Bulk operations for company management
 */
export const bulkCompanyOperations = {
  /**
   * Update multiple companies
   * @param {Array} updates - Array of {companyId, updateData}
   * @returns {Promise<Array>} Results array
   */
  updateCompanies: async (updates) => {
    const CompanyModel = getCompanyModel('company');
    const results = [];
    
    for (const update of updates) {
      try {
        const { companyId, updateData } = update;
        const result = await CompanyModel.findByIdAndUpdate(companyId, updateData, { new: true });
        results.push({ success: true, companyId, result });
      } catch (error) {
        results.push({ success: false, companyId: update.companyId, error: error.message });
      }
    }
    
    return results;
  },
  
  /**
   * Bulk verify companies
   * @param {Array} companyIds - Array of company IDs
   * @param {string} verifiedBy - Verifier user ID
   * @returns {Promise<Object>} Operation result
   */
  bulkVerify: async (companyIds, verifiedBy) => {
    const CompanyModel = getCompanyModel('company');
    
    const result = await CompanyModel.updateMany(
      { _id: { $in: companyIds } },
      {
        $set: {
          'verification.status': 'verified',
          'verification.verifiedBy': verifiedBy,
          'verification.verifiedAt': new Date()
        }
      }
    );
    
    return {
      success: true,
      modifiedCount: result.modifiedCount,
      matchedCount: result.matchedCount
    };
  }
};

export default {
  getCompanyModel,
  createCompanyModel,
  searchCompanies,
  getCompanyRecommendations,
  getCompanyAnalytics,
  companyVerification,
  companyRatings,
  bulkCompanyOperations
};
