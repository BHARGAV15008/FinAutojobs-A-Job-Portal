import express from 'express';

console.log('🏢 Loading simple companies routes...');

const router = express.Router();

// Simple test route
router.get('/test', (req, res) => {
  console.log('📊 Companies test route called');
  res.json({
    success: true,
    message: 'Companies route is working!',
    timestamp: new Date()
  });
});

// GET /api/companies - Simple companies endpoint with mock data
router.get('/', async (req, res) => {
  try {
    console.log('📊 Companies API called with params:', req.query);
    
    const { limit = 20 } = req.query;
    const limitNum = parseInt(limit);

    // Mock companies data
    const mockCompanies = [
      {
        _id: '507f1f77bcf86cd799439011',
        name: 'TechCorp Solutions',
        email: 'hr@techcorp.com',
        website: 'https://techcorp.com',
        logo: 'https://via.placeholder.com/100x100?text=TC',
        description: 'Leading technology solutions provider',
        industry: 'Technology',
        size: '201-500',
        location: { city: 'Mumbai', country: 'India' },
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: '507f1f77bcf86cd799439012',
        name: 'InnovateLabs',
        email: 'careers@innovatelabs.com',
        website: 'https://innovatelabs.com',
        logo: 'https://via.placeholder.com/100x100?text=IL',
        description: 'Innovation-driven software development company',
        industry: 'Software',
        size: '51-200',
        location: { city: 'Bangalore', country: 'India' },
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: '507f1f77bcf86cd799439013',
        name: 'DataDriven Inc',
        email: 'jobs@datadriven.com',
        website: 'https://datadriven.com',
        logo: 'https://via.placeholder.com/100x100?text=DD',
        description: 'Data analytics and AI solutions',
        industry: 'Analytics',
        size: '11-50',
        location: { city: 'Delhi', country: 'India' },
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: '507f1f77bcf86cd799439014',
        name: 'CloudFirst Technologies',
        email: 'hr@cloudfirst.com',
        website: 'https://cloudfirst.com',
        logo: 'https://via.placeholder.com/100x100?text=CF',
        description: 'Cloud infrastructure and DevOps services',
        industry: 'Cloud Computing',
        size: '101-200',
        location: { city: 'Hyderabad', country: 'India' },
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: '507f1f77bcf86cd799439015',
        name: 'FinTech Innovations',
        email: 'careers@fintech.com',
        website: 'https://fintech.com',
        logo: 'https://via.placeholder.com/100x100?text=FI',
        description: 'Financial technology and payment solutions',
        industry: 'FinTech',
        size: '201-500',
        location: { city: 'Pune', country: 'India' },
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: '507f1f77bcf86cd799439016',
        name: 'StartupHub',
        email: 'team@startuphub.com',
        website: 'https://startuphub.com',
        logo: 'https://via.placeholder.com/100x100?text=SH',
        description: 'Startup incubator and venture capital',
        industry: 'Venture Capital',
        size: '1-10',
        location: { city: 'Chennai', country: 'India' },
        isVerified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    const companies = mockCompanies.slice(0, limitNum);
    const totalCount = mockCompanies.length;

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
      isVerified: company.isVerified,
      createdAt: company.createdAt,
      updatedAt: company.updatedAt
    }));

    console.log(`✅ Returning ${transformedCompanies.length} companies`);

    res.json({
      success: true,
      data: {
        companies: transformedCompanies,
        total: totalCount,
        page: 1,
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

console.log('✅ Simple companies routes loaded');

export default router;
