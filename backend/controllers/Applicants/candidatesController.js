import mongoDataService from '../../services/mongoDataService.js';

// Get all candidates with filtering and search
export const getCandidates = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      skills,
      experience_min,
      experience_max,
      location,
      status = 'active',
      sort_by = 'createdAt',
      sort_order = 'desc'
    } = req.query;

    // Build MongoDB filter
    const filters = { role: 'applicant' };

    if (status) filters.status = status;
    if (search) {
      filters.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (location) filters.location = { $regex: location, $options: 'i' };
    if (skills) {
      const skillsArray = skills.split(',').map(skill => skill.trim());
      filters.skills = { $in: skillsArray };
    }

    // Get candidates using MongoDB
    const result = await mongoDataService.getAllUsers(filters, {
      page: parseInt(page),
      limit: parseInt(limit)
    });

    res.json({
      candidates: result.users,
      pagination: result.pagination
    });

  } catch (error) {
    console.error('Get candidates error:', error);
    res.status(500).json({ 
      message: 'Internal server error while fetching candidates' 
    });
  }
};

// Get single candidate by ID
export const getCandidateById = async (req, res) => {
  try {
    const { id } = req.params;
    const candidate = await mongoDataService.getUserById(id);

    if (!candidate || candidate.role !== 'applicant') {
      return res.status(404).json({ 
        message: 'Candidate not found' 
      });
    }

    res.json({ candidate });

  } catch (error) {
    console.error('Get candidate by ID error:', error);
    res.status(500).json({ 
      message: 'Internal server error while fetching candidate' 
    });
  }
};

export default {
  getCandidates,
  getCandidateById
};
