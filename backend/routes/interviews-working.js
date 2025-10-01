import express from 'express';
import Interview from '../models/Interview.js';
import { findUserByIdAndRole } from '../models/UserModels.js';
import jwt from 'jsonwebtoken';

const router = express.Router();

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret-key-change-this-in-production';
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const user = await findUserByIdAndRole(decoded.id || decoded.userId, decoded.role);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('❌ Authentication error:', error);
    return res.status(403).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

// GET /api/interviews - Get interviews
router.get('/', authenticateToken, async (req, res) => {
  try {
    console.log('🔍 Fetching interviews for user:', req.user._id, 'role:', req.user.role);
    
    let query = {};
    if (req.user.role === 'recruiter') {
      // Use the correct user ID - the one that created the interview
      query.recruiterId = req.user._id;
    } else if (req.user.role === 'applicant') {
      query.candidateId = req.user._id;
    }

    console.log('🔍 Interview query:', query);

    const interviews = await Interview.find(query)
      .populate({
        path: 'candidateId',
        select: 'firstName lastName email phone',
        model: 'BaseUser'
      })
      .populate({
        path: 'jobId',
        select: 'title jobTitle companyName'
      })
      .sort({ scheduledDate: 1 });
    
    console.log('📊 Found interviews:', interviews.length);

    // Transform for frontend
    const transformedInterviews = interviews.map((interview) => ({
      _id: interview._id,
      id: interview._id,
      title: interview.title,
      candidateName: interview.candidateId ? 
        `${interview.candidateId.firstName} ${interview.candidateId.lastName}` : 
        'Unknown Candidate',
      candidateEmail: interview.candidateId?.email || 'unknown@email.com',
      jobTitle: interview.jobId?.title || interview.jobId?.jobTitle || 'Position',
      scheduledDate: interview.scheduledDate,
      scheduledTime: interview.scheduledTime,
      duration: interview.duration,
      status: interview.status,
      type: interview.type,
      meetingLink: interview.meetingLink,
      description: interview.description
    }));

    res.json({
      success: true,
      data: transformedInterviews
    });

  } catch (error) {
    console.error('❌ Error fetching interviews:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch interviews',
      error: error.message
    });
  }
});

// POST /api/interviews - Create interview
router.post('/', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'recruiter') {
      return res.status(403).json({
        success: false,
        message: 'Only recruiters can create interviews'
      });
    }

    const newInterview = new Interview({
      ...req.body,
      recruiterId: req.user._id,
      status: 'scheduled'
    });

    const saved = await newInterview.save();
    console.log('✅ Interview created:', saved._id);
    
    res.status(201).json({ 
      success: true, 
      data: saved,
      message: 'Interview created successfully'
    });
  } catch (error) {
    console.error('❌ Error creating interview:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to create interview',
      error: error.message
    });
  }
});

// PUT /api/interviews/:id - Update interview
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'recruiter') {
      return res.status(403).json({
        success: false,
        message: 'Only recruiters can update interviews'
      });
    }

    let updateData = req.body;
    
    // Handle nested data format from frontend
    if (req.body.scheduled_date) {
      const formData = req.body.scheduled_date;
      updateData = {
        scheduledDate: formData.date,
        scheduledTime: formData.time,
        duration: formData.duration || 60,
        type: formData.type || 'video',
        location: formData.location || '',
        meetingLink: formData.meetingLink || '',
        description: formData.notes || ''
      };
    }

    const updated = await Interview.findByIdAndUpdate(
      req.params.id,
      { ...updateData, updatedAt: new Date() },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ 
        success: false, 
        message: 'Interview not found' 
      });
    }

    console.log('✅ Interview updated:', req.params.id);
    res.json({ 
      success: true, 
      data: updated,
      message: 'Interview updated successfully'
    });
  } catch (error) {
    console.error('❌ Error updating interview:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to update interview',
      error: error.message
    });
  }
});

// DELETE /api/interviews/:id - Delete interview
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'recruiter') {
      return res.status(403).json({
        success: false,
        message: 'Only recruiters can delete interviews'
      });
    }

    const deleted = await Interview.findByIdAndDelete(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    console.log('✅ Interview deleted:', req.params.id);
    res.json({
      success: true,
      message: 'Interview deleted successfully'
    });
  } catch (error) {
    console.error('❌ Error deleting interview:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete interview',
      error: error.message
    });
  }
});

export default router;
