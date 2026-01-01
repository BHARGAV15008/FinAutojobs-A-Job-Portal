import express from 'express';
import Company from '../models/Company.js';
import CleanUser from '../models/CleanUser.js';
import joi from 'joi';

const router = express.Router();

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required',
        code: 'TOKEN_REQUIRED'
      });
    }
    
    const jwt = await import('jsonwebtoken');
    const decoded = jwt.default.verify(token, process.env.JWT_SECRET || 'your-jwt-secret-key-change-this-in-production');
    
    const user = await CleanUser.findById(decoded.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }
    
    req.user = {
      ...decoded,
      ...user.toObject(),
      userId: decoded.userId || user._id,
      _id: user._id
    };
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Invalid token',
      code: 'INVALID_TOKEN'
    });
  }
};

// Validation schemas
const createCompanySchema = joi.object({
  name: joi.string().required().min(2).max(100),
  email: joi.string().email().optional(),
  website: joi.string().uri().optional(),
  description: joi.string().max(2000).optional(),
  industry: joi.string().max(50).optional(),
  size: joi.string().valid('1-10', '11-50', '51-200', '201-500', '500+').optional(),
  location: joi.object({
    address: joi.string().max(200).optional(),
    city: joi.string().max(100).optional(),
    state: joi.string().max(100).optional(),
    country: joi.string().max(100).optional(),
    zipCode: joi.string().max(20).optional()
  }).optional(),
  socialLinks: joi.object({
    linkedin: joi.string().uri().optional(),
    twitter: joi.string().uri().optional(),
    facebook: joi.string().uri().optional()
  }).optional()
});

const updateCompanySchema = joi.object({
  name: joi.string().min(2).max(100).optional(),
  email: joi.string().email().optional(),
  website: joi.string().uri().optional(),
  description: joi.string().max(2000).optional(),
  industry: joi.string().max(50).optional(),
  size: joi.string().valid('1-10', '11-50', '51-200', '201-500', '500+').optional(),
  location: joi.object({
    address: joi.string().max(200).optional(),
    city: joi.string().max(100).optional(),
    state: joi.string().max(100).optional(),
    country: joi.string().max(100).optional(),
    zipCode: joi.string().max(20).optional()
  }).optional(),
  socialLinks: joi.object({
    linkedin: joi.string().uri().optional(),
    twitter: joi.string().uri().optional(),
    facebook: joi.string().uri().optional()
  }).optional()
});

// GET /api/companies - Get all companies with pagination and filtering
router.get('/', async (req, res) => {
  try {
    const { 
      search, 
      industry, 
      size, 
      location, 
      isVerified,
      page = 1, 
      limit = 20,
      sort = 'createdAt',
      order = 'desc'
    } = req.query;

    // Build query
    const query = {};
    
    // Search in name, description, and industry
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { industry: { $regex: search, $options: 'i' } }
      ];
    }

    // Filter by industry
    if (industry) {
      query.industry = { $regex: industry, $options: 'i' };
    }

    // Filter by company size
    if (size) {
      query.size = size;
    }

    // Filter by location (city or country)
    if (location) {
      query.$or = [
        { 'location.city': { $regex: location, $options: 'i' } },
        { 'location.country': { $regex: location, $options: 'i' } }
      ];
    }

    // Filter by verification status
    if (isVerified !== undefined) {
      query.isVerified = isVerified === 'true';
    }

    // Calculate pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build sort object
    const sortObj = {};
    sortObj[sort] = order === 'desc' ? -1 : 1;

    // Execute query
    const [companies, totalCount] = await Promise.all([
      Company.find(query)
        .populate('recruiter', 'firstName lastName email')
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Company.countDocuments(query)
    ]);

    // Transform companies data
    const transformedCompanies = companies.map(company => ({
      id: company._id,
      name: company.name,
      email: company.email,
      website: company.website,
      logo: company.logo,
      description: company.description,
      industry: company.industry,
      size: company.size,
      location: company.location,
      recruiter: company.recruiter,
      isVerified: company.isVerified,
      socialLinks: company.socialLinks,
      createdAt: company.createdAt,
      updatedAt: company.updatedAt
    }));

    res.json({
      success: true,
      data: {
        companies: transformedCompanies,
        total: totalCount,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalCount / limitNum)
      }
    });
  } catch (error) {
    console.error('❌ Error fetching companies:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch companies',
      error: error.message
    });
  }
});

// GET /api/companies/:id - Get company by ID
router.get('/:id', async (req, res) => {
  try {
    const companyId = req.params.id;

    // Validate MongoDB ObjectId
    if (!companyId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid company ID format'
      });
    }

    const company = await Company.findById(companyId)
      .populate('recruiter', 'firstName lastName email companyInfo')
      .lean();

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    // Get company statistics (jobs posted, etc.)
    const Job = await import('../models/Job.js').then(module => module.default);
    const jobStats = await Job.aggregate([
      { $match: { company: companyId } },
      {
        $group: {
          _id: null,
          totalJobs: { $sum: 1 },
          activeJobs: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
          totalApplications: { $sum: '$applications' }
        }
      }
    ]);

    const stats = jobStats[0] || { totalJobs: 0, activeJobs: 0, totalApplications: 0 };

    // Transform company data
    const transformedCompany = {
      id: company._id,
      name: company.name,
      email: company.email,
      website: company.website,
      logo: company.logo,
      description: company.description,
      industry: company.industry,
      size: company.size,
      location: company.location,
      recruiter: company.recruiter,
      isVerified: company.isVerified,
      socialLinks: company.socialLinks,
      stats: stats,
      createdAt: company.createdAt,
      updatedAt: company.updatedAt
    };

    res.json({
      success: true,
      data: { company: transformedCompany }
    });
  } catch (error) {
    console.error('❌ Error fetching company:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch company',
      error: error.message
    });
  }
});

// POST /api/companies - Create new company (Recruiters only)
router.post('/', authenticateToken, async (req, res) => {
  try {
    // Check if user is recruiter
    if (req.user.role !== 'recruiter') {
      return res.status(403).json({
        success: false,
        message: 'Only recruiters can create company profiles'
      });
    }

    // Validate request body
    const { error, value } = createCompanySchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }

    // Check if company already exists for this recruiter
    const existingCompany = await Company.findOne({ recruiter: req.user.userId });
    if (existingCompany) {
      return res.status(409).json({
        success: false,
        message: 'You already have a company profile. Please update it instead.'
      });
    }

    // Create new company
    const companyData = {
      ...value,
      recruiter: req.user.userId
    };

    const newCompany = new Company(companyData);
    const savedCompany = await newCompany.save();

    // Update user's company info
    await CleanUser.findByIdAndUpdate(req.user.userId, {
      $set: {
        'companyInfo.companyName': savedCompany.name,
        'companyInfo.companyId': savedCompany._id
      }
    });

    // Emit real-time notification
    const io = req.app.get('io');
    if (io) {
      io.to('role-admin').emit('new-company-registered', {
        message: 'New company registered and awaiting verification',
        company: {
          id: savedCompany._id,
          name: savedCompany.name,
          recruiter: req.user.userId
        },
        timestamp: new Date()
      });
    }

    // Transform for response
    const responseCompany = {
      id: savedCompany._id,
      name: savedCompany.name,
      email: savedCompany.email,
      website: savedCompany.website,
      description: savedCompany.description,
      industry: savedCompany.industry,
      size: savedCompany.size,
      location: savedCompany.location,
      isVerified: savedCompany.isVerified,
      createdAt: savedCompany.createdAt
    };

    res.status(201).json({
      success: true,
      message: 'Company profile created successfully',
      data: { company: responseCompany }
    });
  } catch (error) {
    console.error('❌ Error creating company:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Company validation failed',
        errors: Object.keys(error.errors).map(key => ({
          field: key,
          message: error.errors[key].message
        }))
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to create company',
      error: error.message
    });
  }
});

// PUT /api/companies/:id - Update company (Recruiters/Admins only)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const companyId = req.params.id;

    // Validate MongoDB ObjectId
    if (!companyId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid company ID format'
      });
    }

    // Find the company
    const existingCompany = await Company.findById(companyId);
    
    if (!existingCompany) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    // Check permissions
    const canUpdate = req.user.role === 'admin' || 
                     (req.user.role === 'recruiter' && existingCompany.recruiter.toString() === req.user.userId);

    if (!canUpdate) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own company profile'
      });
    }

    // Validate request body
    const { error, value } = updateCompanySchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }

    // Update company
    const updateData = { ...value };
    delete updateData.recruiter; // Prevent changing the owner
    delete updateData.isVerified; // Only admins can verify

    const updatedCompany = await Company.findByIdAndUpdate(
      companyId,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate('recruiter', 'firstName lastName email');

    // Transform for response
    const responseCompany = {
      id: updatedCompany._id,
      name: updatedCompany.name,
      email: updatedCompany.email,
      website: updatedCompany.website,
      logo: updatedCompany.logo,
      description: updatedCompany.description,
      industry: updatedCompany.industry,
      size: updatedCompany.size,
      location: updatedCompany.location,
      recruiter: updatedCompany.recruiter,
      isVerified: updatedCompany.isVerified,
      socialLinks: updatedCompany.socialLinks,
      updatedAt: updatedCompany.updatedAt
    };

    res.json({
      success: true,
      message: 'Company updated successfully',
      data: { company: responseCompany }
    });
  } catch (error) {
    console.error('❌ Error updating company:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update company',
      error: error.message
    });
  }
});

// DELETE /api/companies/:id - Delete company (Admins only)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only administrators can delete companies'
      });
    }

    const companyId = req.params.id;

    // Validate MongoDB ObjectId
    if (!companyId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid company ID format'
      });
    }

    // Find and delete the company
    const deletedCompany = await Company.findByIdAndDelete(companyId);
    
    if (!deletedCompany) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    // Update associated recruiter's company info
    await CleanUser.findByIdAndUpdate(deletedCompany.recruiter, {
      $unset: {
        'companyInfo.companyName': '',
        'companyInfo.companyId': ''
      }
    });

    res.json({
      success: true,
      message: 'Company deleted successfully',
      data: { company: { id: companyId } }
    });
  } catch (error) {
    console.error('❌ Error deleting company:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete company',
      error: error.message
    });
  }
});

// POST /api/companies/:id/verify - Verify company (Admins only)
router.post('/:id/verify', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only administrators can verify companies'
      });
    }

    const companyId = req.params.id;

    // Validate MongoDB ObjectId
    if (!companyId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid company ID format'
      });
    }

    // Find and update the company
    const updatedCompany = await Company.findByIdAndUpdate(
      companyId,
      { isVerified: true, updatedAt: new Date() },
      { new: true }
    ).populate('recruiter', 'firstName lastName email');

    if (!updatedCompany) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    // Emit real-time notification to recruiter
    const io = req.app.get('io');
    if (io) {
      io.to(`user-${updatedCompany.recruiter._id}`).emit('company-verified', {
        message: 'Your company profile has been verified!',
        company: {
          id: updatedCompany._id,
          name: updatedCompany.name,
          isVerified: true
        },
        timestamp: new Date()
      });
    }

    // Transform for response
    const responseCompany = {
      id: updatedCompany._id,
      name: updatedCompany.name,
      email: updatedCompany.email,
      website: updatedCompany.website,
      isVerified: updatedCompany.isVerified,
      updatedAt: updatedCompany.updatedAt
    };

    res.json({
      success: true,
      message: 'Company verified successfully',
      data: { company: responseCompany }
    });
  } catch (error) {
    console.error('❌ Error verifying company:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify company',
      error: error.message
    });
  }
});

export default router;
