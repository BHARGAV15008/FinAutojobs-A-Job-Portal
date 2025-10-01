import express from 'express';
import { body, validationResult } from 'express-validator';
import Favorite from '../../models/enhanced/Favorite.js';
import Job from '../../models/Job.js';
import { authenticateToken } from '../../middleware/auth.js';

const router = express.Router();

// Validation schemas
const favoriteValidation = [
  body('jobId')
    .isMongoId()
    .withMessage('Valid job ID is required'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes must not exceed 500 characters'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be low, medium, or high'),
];

// @route   POST /api/favorites
// @desc    Add job to favorites
// @access  Private (Applicant only)
router.post('/', authenticateToken, favoriteValidation, async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Verify user is an applicant
    if (req.user.role !== 'applicant') {
      return res.status(403).json({
        success: false,
        message: 'Only applicants can save jobs to favorites'
      });
    }

    const { jobId, notes, tags, priority } = req.body;
    const userId = req.user.userId;

    // Check if job exists and is active
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    if (job.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Cannot save inactive jobs to favorites'
      });
    }

    // Check if already favorited
    const existingFavorite = await Favorite.findOne({
      userId,
      jobId,
      status: 'active'
    });

    if (existingFavorite) {
      return res.status(400).json({
        success: false,
        message: 'Job is already in your favorites'
      });
    }

    // Create favorite
    const favoriteData = {
      userId,
      jobId,
      notes: notes || '',
      tags: tags || [],
      priority: priority || 'medium',
      status: 'active'
    };

    const favorite = new Favorite(favoriteData);
    await favorite.save();

    // Populate the response
    await favorite.populate('jobId', 'jobTitle companyName location salary jobType workType');

    res.status(201).json({
      success: true,
      message: 'Job added to favorites successfully',
      data: { favorite }
    });

  } catch (error) {
    console.error('Error adding to favorites:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/favorites
// @desc    Get user's favorite jobs
// @access  Private (Applicant only)
router.get('/', authenticateToken, async (req, res) => {
  try {
    // Verify user is an applicant
    if (req.user.role !== 'applicant') {
      return res.status(403).json({
        success: false,
        message: 'Only applicants can view favorites'
      });
    }

    const {
      page = 1,
      limit = 20,
      priority,
      tags,
      status = 'active',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const userId = req.user.userId;

    // Build query
    const query = { userId };

    if (status !== 'all') {
      query.status = status;
    }

    if (priority) {
      const priorities = Array.isArray(priority) ? priority : [priority];
      query.priority = { $in: priorities };
    }

    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : tags.split(',');
      query.tags = { $in: tagArray };
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const [favorites, totalFavorites] = await Promise.all([
      Favorite.find(query)
        .populate({
          path: 'jobId',
          select: 'jobTitle companyName location salary jobType workType status applicationDeadline createdAt',
          populate: {
            path: 'postedBy',
            select: 'firstName lastName companyName profilePicture'
          }
        })
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Favorite.countDocuments(query)
    ]);

    // Filter out favorites where job no longer exists or is inactive
    const validFavorites = favorites.filter(fav => 
      fav.jobId && fav.jobId.status === 'active'
    );

    // Update status for favorites with inactive jobs
    const invalidFavoriteIds = favorites
      .filter(fav => !fav.jobId || fav.jobId.status !== 'active')
      .map(fav => fav._id);

    if (invalidFavoriteIds.length > 0) {
      await Favorite.updateMany(
        { _id: { $in: invalidFavoriteIds } },
        { status: 'expired' }
      );
    }

    // Enrich favorites with additional data
    const enrichedFavorites = validFavorites.map(fav => ({
      ...fav,
      daysAgo: Math.floor((Date.now() - new Date(fav.createdAt).getTime()) / (1000 * 60 * 60 * 24)),
      jobDaysLeft: fav.jobId.applicationDeadline 
        ? Math.ceil((new Date(fav.jobId.applicationDeadline) - Date.now()) / (1000 * 60 * 60 * 24))
        : null,
      isJobExpiring: fav.jobId.applicationDeadline
        ? (new Date(fav.jobId.applicationDeadline) - Date.now()) < (7 * 24 * 60 * 60 * 1000)
        : false
    }));

    // Get summary statistics
    const summary = await getFavoritesSummary(userId);

    res.json({
      success: true,
      data: {
        favorites: enrichedFavorites,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalFavorites / parseInt(limit)),
          totalFavorites,
          validFavorites: validFavorites.length,
          limit: parseInt(limit)
        },
        summary,
        filters: {
          priority,
          tags: tags ? (Array.isArray(tags) ? tags : tags.split(',')) : [],
          status
        }
      }
    });

  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/favorites/:id
// @desc    Get single favorite
// @access  Private (Owner only)
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Validate ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid favorite ID format'
      });
    }

    const favorite = await Favorite.findById(id)
      .populate({
        path: 'jobId',
        populate: {
          path: 'postedBy',
          select: 'firstName lastName companyName profilePicture email'
        }
      });

    if (!favorite) {
      return res.status(404).json({
        success: false,
        message: 'Favorite not found'
      });
    }

    // Check ownership
    if (favorite.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Enrich favorite data
    const enrichedFavorite = {
      ...favorite.toObject(),
      daysAgo: Math.floor((Date.now() - new Date(favorite.createdAt).getTime()) / (1000 * 60 * 60 * 24)),
      jobDaysLeft: favorite.jobId.applicationDeadline 
        ? Math.ceil((new Date(favorite.jobId.applicationDeadline) - Date.now()) / (1000 * 60 * 60 * 24))
        : null
    };

    res.json({
      success: true,
      data: { favorite: enrichedFavorite }
    });

  } catch (error) {
    console.error('Error fetching favorite:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   PUT /api/favorites/:id
// @desc    Update favorite
// @access  Private (Owner only)
router.put('/:id', authenticateToken, [
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes must not exceed 500 characters'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Priority must be low, medium, or high'),
  body('reminderDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid reminder date format'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const userId = req.user.userId;
    const { notes, tags, priority, reminderDate } = req.body;

    // Find favorite and verify ownership
    const favorite = await Favorite.findById(id);

    if (!favorite) {
      return res.status(404).json({
        success: false,
        message: 'Favorite not found'
      });
    }

    if (favorite.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own favorites'
      });
    }

    // Update favorite
    const updateData = {};
    if (notes !== undefined) updateData.notes = notes;
    if (tags !== undefined) updateData.tags = tags;
    if (priority !== undefined) updateData.priority = priority;
    if (reminderDate !== undefined) {
      updateData.reminderDate = reminderDate;
      updateData.reminderSent = false;
    }

    const updatedFavorite = await Favorite.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('jobId', 'jobTitle companyName location salary');

    res.json({
      success: true,
      message: 'Favorite updated successfully',
      data: { favorite: updatedFavorite }
    });

  } catch (error) {
    console.error('Error updating favorite:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   DELETE /api/favorites/:jobId
// @desc    Remove job from favorites
// @access  Private (Owner only)
router.delete('/:jobId', authenticateToken, async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.user.userId;

    // Find and remove favorite
    const favorite = await Favorite.findOneAndUpdate(
      { userId, jobId, status: 'active' },
      { status: 'removed' },
      { new: true }
    );

    if (!favorite) {
      return res.status(404).json({
        success: false,
        message: 'Favorite not found or already removed'
      });
    }

    res.json({
      success: true,
      message: 'Job removed from favorites successfully'
    });

  } catch (error) {
    console.error('Error removing favorite:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/favorites/bulk-action
// @desc    Perform bulk actions on favorites
// @access  Private (Applicant only)
router.post('/bulk-action', authenticateToken, [
  body('action')
    .isIn(['remove', 'update-priority', 'add-tags', 'remove-tags'])
    .withMessage('Invalid bulk action'),
  body('favoriteIds')
    .isArray({ min: 1 })
    .withMessage('At least one favorite ID is required'),
  body('favoriteIds.*')
    .isMongoId()
    .withMessage('Invalid favorite ID format'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    // Verify user is an applicant
    if (req.user.role !== 'applicant') {
      return res.status(403).json({
        success: false,
        message: 'Only applicants can perform bulk actions on favorites'
      });
    }

    const { action, favoriteIds, priority, tags } = req.body;
    const userId = req.user.userId;

    // Verify ownership of all favorites
    const favorites = await Favorite.find({
      _id: { $in: favoriteIds },
      userId
    });

    if (favorites.length !== favoriteIds.length) {
      return res.status(403).json({
        success: false,
        message: 'You can only modify your own favorites'
      });
    }

    let updateData = {};
    let message = '';

    switch (action) {
      case 'remove':
        updateData = { status: 'removed' };
        message = 'Favorites removed successfully';
        break;
      
      case 'update-priority':
        if (!priority || !['low', 'medium', 'high'].includes(priority)) {
          return res.status(400).json({
            success: false,
            message: 'Valid priority is required for priority update'
          });
        }
        updateData = { priority };
        message = `Priority updated to ${priority} for selected favorites`;
        break;
      
      case 'add-tags':
        if (!tags || !Array.isArray(tags)) {
          return res.status(400).json({
            success: false,
            message: 'Tags array is required for adding tags'
          });
        }
        updateData = { $addToSet: { tags: { $each: tags } } };
        message = 'Tags added to selected favorites';
        break;
      
      case 'remove-tags':
        if (!tags || !Array.isArray(tags)) {
          return res.status(400).json({
            success: false,
            message: 'Tags array is required for removing tags'
          });
        }
        updateData = { $pullAll: { tags } };
        message = 'Tags removed from selected favorites';
        break;
    }

    // Perform bulk update
    const result = await Favorite.updateMany(
      { _id: { $in: favoriteIds }, userId },
      updateData
    );

    res.json({
      success: true,
      message,
      data: {
        modifiedCount: result.modifiedCount,
        matchedCount: result.matchedCount
      }
    });

  } catch (error) {
    console.error('Error performing bulk action:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/favorites/tags
// @desc    Get all unique tags used by user
// @access  Private (Applicant only)
router.get('/tags/list', authenticateToken, async (req, res) => {
  try {
    // Verify user is an applicant
    if (req.user.role !== 'applicant') {
      return res.status(403).json({
        success: false,
        message: 'Only applicants can view favorite tags'
      });
    }

    const userId = req.user.userId;

    // Get all unique tags
    const tags = await Favorite.aggregate([
      { $match: { userId: userId, status: 'active' } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1, _id: 1 } },
      { $project: { tag: '$_id', count: 1, _id: 0 } }
    ]);

    res.json({
      success: true,
      data: { tags }
    });

  } catch (error) {
    console.error('Error fetching favorite tags:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Helper function to get favorites summary
const getFavoritesSummary = async (userId) => {
  const summary = await Favorite.aggregate([
    { $match: { userId } },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        active: { $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] } },
        expired: { $sum: { $cond: [{ $eq: ['$status', 'expired'] }, 1, 0] } },
        removed: { $sum: { $cond: [{ $eq: ['$status', 'removed'] }, 1, 0] } },
        highPriority: { $sum: { $cond: [{ $eq: ['$priority', 'high'] }, 1, 0] } },
        mediumPriority: { $sum: { $cond: [{ $eq: ['$priority', 'medium'] }, 1, 0] } },
        lowPriority: { $sum: { $cond: [{ $eq: ['$priority', 'low'] }, 1, 0] } }
      }
    }
  ]);

  return summary[0] || {
    total: 0,
    active: 0,
    expired: 0,
    removed: 0,
    highPriority: 0,
    mediumPriority: 0,
    lowPriority: 0
  };
};

export default router;
