/**
 * Companies Controller
 * 
 * Handles company profile management, verification, and company-related operations
 * using Mongoose models and comprehensive company schemas.
 * 
 * @author FinAutoJobs Team
 * @version 1.0.0
 */

import { 
  getCompanyModel, 
  searchCompanies, 
  getCompanyRecommendations,
  getCompanyAnalytics,
  companyVerification,
  companyRatings
} from '../../models/schemas/companies/CompanyFactory.js';
import { trackActivity } from '../../models/schemas/activities/ActivityFactory.js';
import { notificationManager } from '../../models/schemas/system/SystemFactory.js';

// Get all companies with filtering and pagination
export const getCompanies = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      name,
      industry,
      location,
      size,
      verified,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Build filters
    const filters = {};
    
    if (name) filters.name = name;
    if (industry) filters.industry = industry.split(',');
    if (location) filters.location = location;
    if (size) filters.size = size.split(',');
    if (verified !== undefined) filters.verified = verified === 'true';

    // Build options
    const options = {
      limit: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit),
      sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 }
    };

    const result = await searchCompanies(filters, options);

    // Track company search activity if user is authenticated
    if (req.user) {
      await trackActivity({
        user: {
          userId: req.user.userId,
          role: req.user.userRole,
          email: req.user.email
        },
        activity: {
          type: 'company_search',
          category: 'search',
          action: 'Company search performed',
          description: `Searched for companies with filters: ${JSON.stringify(filters)}`
        },
        context: {
          searchContext: {
            filters,
            results: {
              count: result.companies.length,
              totalPages: Math.ceil(result.totalCount / parseInt(limit)),
              page: parseInt(page)
            }
          }
        }
      });
    }

    res.json({
      success: true,
      data: {
        companies: result.companies,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(result.totalCount / parseInt(limit)),
          totalCount: result.totalCount,
          hasMore: result.hasMore
        },
        filters: result.filters
      }
    });

  } catch (error) {
    console.error('Get companies error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching companies'
    });
  }
};

// Get company by ID
export const getCompanyById = async (req, res) => {
  try {
    const { companyId } = req.params;
    
    const CompanyModel = getCompanyModel();
    const company = await CompanyModel.findById(companyId);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    // Increment view count
    company.analytics.profileViews += 1;
    company.analytics.lastViewed = new Date();
    await company.save();

    // Track company view activity if user is authenticated
    if (req.user) {
      await trackActivity({
        user: {
          userId: req.user.userId,
          role: req.user.userRole,
          email: req.user.email
        },
        activity: {
          type: 'company_view',
          category: 'engagement',
          action: 'Company profile viewed',
          description: `Viewed company profile: ${company.name}`
        },
        context: {
          resource: {
            type: 'company',
            id: company._id.toString(),
            name: company.name,
            url: `/companies/${company._id}`
          }
        }
      });
    }

    res.json({
      success: true,
      data: {
        company: company.toObject()
      }
    });

  } catch (error) {
    console.error('Get company by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching company'
    });
  }
};

// Create new company (Recruiter/Admin only)
export const createCompany = async (req, res) => {
  try {
    const { userId, userRole } = req.user;

    if (userRole !== 'recruiter' && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only recruiters and admins can create companies'
      });
    }

    const companyData = {
      ...req.body,
      createdBy: {
        userId,
        role: userRole,
        name: `${req.user.firstName} ${req.user.lastName}`
      },
      status: 'active'
    };

    const CompanyModel = getCompanyModel();
    const company = new CompanyModel(companyData);
    await company.save();

    // Track company creation activity
    await trackActivity({
      user: {
        userId,
        role: userRole,
        email: req.user.email
      },
      activity: {
        type: 'company_create',
        category: 'company',
        action: 'Company created',
        description: `Created new company: ${company.name}`
      },
      context: {
        resource: {
          type: 'company',
          id: company._id.toString(),
          name: company.name
        }
      },
      conversion: {
        isConversion: true,
        conversionType: 'company_creation'
      }
    });

    res.status(201).json({
      success: true,
      message: 'Company created successfully',
      data: {
        company: company.toObject()
      }
    });

  } catch (error) {
    console.error('Create company error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while creating company'
    });
  }
};

// Update company (Recruiter/Admin only)
export const updateCompany = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { userId, userRole } = req.user;

    const CompanyModel = getCompanyModel();
    const company = await CompanyModel.findById(companyId);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    // Check if user can update this company
    if (userRole !== 'admin' && company.createdBy.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only update companies you created'
      });
    }

    // Update company
    const updateData = {
      ...req.body,
      lastModifiedAt: new Date(),
      'lastModifiedBy.userId': userId,
      'lastModifiedBy.role': userRole,
      'lastModifiedBy.name': `${req.user.firstName} ${req.user.lastName}`
    };

    const updatedCompany = await CompanyModel.findByIdAndUpdate(
      companyId,
      updateData,
      { new: true, runValidators: true }
    );

    // Track company update activity
    await trackActivity({
      user: {
        userId,
        role: userRole,
        email: req.user.email
      },
      activity: {
        type: 'company_update',
        category: 'company',
        action: 'Company updated',
        description: `Updated company: ${updatedCompany.name}`
      },
      context: {
        resource: {
          type: 'company',
          id: updatedCompany._id.toString(),
          name: updatedCompany.name
        },
        changes: {
          fields: Object.keys(req.body)
        }
      }
    });

    res.json({
      success: true,
      message: 'Company updated successfully',
      data: {
        company: updatedCompany.toObject()
      }
    });

  } catch (error) {
    console.error('Update company error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while updating company'
    });
  }
};

// Delete company (Admin only)
export const deleteCompany = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { userId, userRole } = req.user;

    if (userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can delete companies'
      });
    }

    const CompanyModel = getCompanyModel();
    const company = await CompanyModel.findById(companyId);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    // Soft delete by updating status
    company.status = 'deleted';
    company.lastModifiedAt = new Date();
    company.lastModifiedBy = {
      userId,
      role: userRole,
      name: `${req.user.firstName} ${req.user.lastName}`
    };
    await company.save();

    // Track company deletion activity
    await trackActivity({
      user: {
        userId,
        role: userRole,
        email: req.user.email
      },
      activity: {
        type: 'company_delete',
        category: 'company',
        action: 'Company deleted',
        description: `Deleted company: ${company.name}`
      },
      context: {
        resource: {
          type: 'company',
          id: company._id.toString(),
          name: company.name
        }
      }
    });

    res.json({
      success: true,
      message: 'Company deleted successfully'
    });

  } catch (error) {
    console.error('Delete company error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while deleting company'
    });
  }
};

// Verify company (Admin only)
export const verifyCompanyProfile = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { verified, verificationNotes } = req.body;
    const { userId, userRole } = req.user;

    if (userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can verify companies'
      });
    }

    const result = await verifyCompany(companyId, {
      verified,
      verifiedBy: userId,
      verificationNotes,
      verifiedAt: verified ? new Date() : null
    });

    // Track verification activity
    await trackActivity({
      user: {
        userId,
        role: userRole,
        email: req.user.email
      },
      activity: {
        type: 'company_verify',
        category: 'company',
        action: verified ? 'Company verified' : 'Company verification removed',
        description: `${verified ? 'Verified' : 'Unverified'} company: ${result.name}`
      },
      context: {
        resource: {
          type: 'company',
          id: result._id.toString(),
          name: result.name
        },
        verification: {
          verified,
          notes: verificationNotes
        }
      }
    });

    // Send notification to company creator
    if (result.createdBy.userId) {
      await notificationManager.send({
        recipient: {
          userId: result.createdBy.userId,
          role: result.createdBy.role
        },
        content: {
          type: 'company_verification',
          category: 'company',
          priority: 'high',
          title: verified ? 'Company Verified' : 'Company Verification Removed',
          message: `Your company "${result.name}" has been ${verified ? 'verified' : 'unverified'} by our team.`,
          actionText: 'View Company',
          actionUrl: `/companies/${result._id}`
        },
        context: {
          resourceType: 'company',
          resourceId: result._id.toString(),
          verified
        }
      });
    }

    res.json({
      success: true,
      message: `Company ${verified ? 'verified' : 'verification removed'} successfully`,
      data: {
        company: result.toObject()
      }
    });

  } catch (error) {
    console.error('Verify company error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while verifying company'
    });
  }
};

// Rate company (Authenticated users only)
export const rateCompanyProfile = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { rating, review, anonymous = false } = req.body;
    const { userId, userRole } = req.user;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    const ratingData = {
      userId,
      userRole,
      rating: parseFloat(rating),
      review,
      anonymous
    };

    const result = await companyRatings.addRating(companyId, ratingData);

    // Track rating activity
    await trackActivity({
      user: {
        userId,
        role: userRole,
        email: req.user.email
      },
      activity: {
        type: 'company_rate',
        category: 'engagement',
        action: 'Company rated',
        description: `Rated company: ${result.name} (${rating}/5)`
      },
      context: {
        resource: {
          type: 'company',
          id: result._id.toString(),
          name: result.name
        },
        rating: {
          score: rating,
          hasReview: !!review,
          anonymous
        }
      }
    });

    res.json({
      success: true,
      message: 'Company rated successfully',
      data: {
        company: {
          id: result._id,
          name: result.name,
          ratings: result.ratings
        }
      }
    });

  } catch (error) {
    console.error('Rate company error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while rating company'
    });
  }
};

// Get company recommendations (Applicant only)
export const getRecommendations = async (req, res) => {
  try {
    const { userId, userRole } = req.user;
    const { limit = 10 } = req.query;

    if (userRole !== 'applicant') {
      return res.status(403).json({
        success: false,
        message: 'Company recommendations are only available for applicants'
      });
    }

    const recommendations = await getCompanyRecommendations(userId, userRole, parseInt(limit));

    // Track recommendation view activity
    await trackActivity({
      user: {
        userId,
        role: userRole,
        email: req.user.email
      },
      activity: {
        type: 'company_recommendation',
        category: 'engagement',
        action: 'Viewed company recommendations',
        description: `Viewed ${recommendations.length} company recommendations`
      }
    });

    res.json({
      success: true,
      data: {
        recommendations,
        count: recommendations.length
      }
    });

  } catch (error) {
    console.error('Get company recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching company recommendations'
    });
  }
};

// Get company analytics (Admin/Company owner only)
export const getCompanyAnalyticsData = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { userId, userRole } = req.user;
    const { period = '30d' } = req.query;

    const CompanyModel = getCompanyModel();
    const company = await CompanyModel.findById(companyId);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    // Check if user can view analytics for this company
    if (userRole !== 'admin' && company.createdBy.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only view analytics for your own companies'
      });
    }

    const analytics = await getCompanyAnalytics(companyId, period);

    res.json({
      success: true,
      data: {
        company: {
          id: company._id,
          name: company.name,
          status: company.status
        },
        analytics,
        period,
        generatedAt: new Date()
      }
    });

  } catch (error) {
    console.error('Get company analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching company analytics'
    });
  }
};

// Get company jobs
export const getCompanyJobs = async (req, res) => {
  try {
    const { companyId } = req.params;
    const {
      page = 1,
      limit = 20,
      status = 'active',
      sortBy = 'publishedAt',
      sortOrder = 'desc'
    } = req.query;

    const CompanyModel = getCompanyModel();
    const company = await CompanyModel.findById(companyId);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    // Import JobModel here to avoid circular dependency
    const { getJobModel } = await import('../../models/schemas/jobs/JobFactory.js');
    const JobModel = getJobModel('job');

    // Build query
    const query = {
      'company.companyId': companyId,
      status: { $in: status.split(',') }
    };

    // Build options
    const options = {
      limit: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit),
      sort: { [sortBy]: sortOrder === 'desc' ? -1 : 1 }
    };

    const jobs = await JobModel.find(query, null, options);
    const totalCount = await JobModel.countDocuments(query);

    res.json({
      success: true,
      data: {
        company: {
          id: company._id,
          name: company.name,
          logo: company.media.logo
        },
        jobs,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / parseInt(limit)),
          totalCount,
          hasMore: (parseInt(page) * parseInt(limit)) < totalCount
        }
      }
    });

  } catch (error) {
    console.error('Get company jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching company jobs'
    });
  }
};

export default {
  getCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  deleteCompany,
  verifyCompanyProfile,
  rateCompanyProfile,
  getRecommendations,
  getCompanyAnalyticsData,
  getCompanyJobs
};
