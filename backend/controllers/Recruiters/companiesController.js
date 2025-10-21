import { Company, Job } from '../models/index.js';

// Get all companies with filtering and pagination
export const getCompanies = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      industry,
      size,
      location,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const query = { status: 'active' };

    if (search) {
      query.$text = { $search: search };
    }

    if (industry) {
      query.industry = industry;
    }

    if (size) {
      query.size = size;
    }

    if (location) {
      query['location.primary.city'] = { $regex: new RegExp(location, 'i') };
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const companies = await Company.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    const total = await Company.countDocuments(query);
    const totalPages = Math.ceil(total / limitNum);

    res.json({
      companies,
      pagination: {
        current_page: pageNum,
        total_pages: totalPages,
        total_items: total,
        items_per_page: limitNum,
        has_next: pageNum < totalPages,
        has_prev: pageNum > 1
      }
    });

  } catch (error) {
    console.error('Get companies error:', error);
    res.status(500).json({ 
      message: 'Internal server error while fetching companies' 
    });
  }
};

// Get single company by ID
export const getCompanyById = async (req, res) => {
  try {
    const { id } = req.params;

    const company = await Company.findById(id);

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    const jobCount = await Job.countDocuments({ 'company.companyId': id, status: 'active' });
    const recentJobs = await Job.find({ 'company.companyId': id, status: 'active' })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('title location employmentType workArrangement salary createdAt');

    res.json({
      company,
      job_count: jobCount,
      recent_jobs: recentJobs
    });

  } catch (error) {
    console.error('Get company by ID error:', error);
    res.status(500).json({ 
      message: 'Internal server error while fetching company' 
    });
  }
};

// Create new company
export const createCompany = async (req, res) => {
  try {
    const { name, description, website, industry, size, location } = req.body;

    if (!name || !location) {
      return res.status(400).json({ message: 'Company name and location are required' });
    }

    const existingCompany = await Company.findOne({ name });
    if (existingCompany) {
      return res.status(409).json({ message: 'Company with this name already exists' });
    }

    const newCompany = new Company({
      name,
      description,
      website,
      industry,
      size,
      location: { primary: location }
    });

    await newCompany.save();

    res.status(201).json({
      message: 'Company created successfully',
      company: newCompany
    });

  } catch (error) {
    console.error('Create company error:', error);
    res.status(500).json({ 
      message: 'Internal server error while creating company' 
    });
  }
};

// Update company
export const updateCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (updateData.name) {
      const existingCompany = await Company.findOne({ name: updateData.name, _id: { $ne: id } });
      if (existingCompany) {
        return res.status(409).json({ message: 'Company with this name already exists' });
      }
    }

    const updatedCompany = await Company.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

    if (!updatedCompany) {
      return res.status(404).json({ message: 'Company not found' });
    }

    res.json({
      message: 'Company updated successfully',
      company: updatedCompany
    });

  } catch (error) {
    console.error('Update company error:', error);
    res.status(500).json({ 
      message: 'Internal server error while updating company' 
    });
  }
};

// Delete company (soft delete)
export const deleteCompany = async (req, res) => {
  try {
    const { id } = req.params;

    const activeJobsCount = await Job.countDocuments({ 'company.companyId': id, status: 'active' });

    if (activeJobsCount > 0) {
      return res.status(400).json({ 
        message: `Cannot delete company with ${activeJobsCount} active job(s). Please deactivate all jobs first.` 
      });
    }

    const company = await Company.findByIdAndUpdate(id, { status: 'deleted' }, { new: true });

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    res.json({ message: 'Company deleted successfully' });

  } catch (error) {
    console.error('Delete company error:', error);
    res.status(500).json({ 
      message: 'Internal server error while deleting company' 
    });
  }
};

// Get company jobs
export const getCompanyJobs = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10, status = 'active', sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const company = await Company.findById(id);

    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }

    const query = { 'company.companyId': id };
    if (status) {
      query.status = status;
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const jobs = await Job.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    const total = await Job.countDocuments(query);
    const totalPages = Math.ceil(total / limitNum);

    res.json({
      company,
      jobs,
      pagination: {
        current_page: pageNum,
        total_pages: totalPages,
        total_items: total,
        items_per_page: limitNum,
        has_next: pageNum < totalPages,
        has_prev: pageNum > 1
      }
    });

  } catch (error) {
    console.error('Get company jobs error:', error);
    res.status(500).json({ 
      message: 'Internal server error while fetching company jobs' 
    });
  }
};

// Get company statistics
export const getCompanyStats = async (req, res) => {
  // TODO: Refactor to Mongoose
  res.status(501).json({ message: 'Not Implemented' });
};

// Export aliases for route compatibility
export const getAllCompanies = getCompanies;
