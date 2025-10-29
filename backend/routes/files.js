import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { BaseUser } from '../models/UserModels.js';

const router = express.Router();

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required'
      });
    }
    
    const jwt = await import('jsonwebtoken');
    const jwtSecret = process.env.JWT_SECRET || 'your-jwt-secret-key-change-this-in-production';
    
    const decoded = jwt.default.verify(token, jwtSecret);
    
    // Get user from database
    const user = await BaseUser.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token - user not found'
      });
    }

    req.user = {
      userId: user._id.toString(),
      username: user.username,
      role: user.role,
      email: user.email
    };
    
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), '..', 'uploads', 'documents');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads with username-based naming
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: async (req, file, cb) => {
    try {
      // Get user data to access username
      const user = await BaseUser.findById(req.user.userId);
      const username = user?.username || req.user.userId;
      
      // Create readable filename based on file type
      const extension = path.extname(file.originalname);
      let filename;
      
      if (file.fieldname === 'resume') {
        filename = `resume_${username}${extension}`;
      } else if (file.fieldname === 'profilePicture') {
        filename = `profile_${username}${extension}`;
      } else if (file.fieldname === 'coverLetter') {
        filename = `coverletter_${username}${extension}`;
      } else if (file.fieldname === 'portfolio') {
        filename = `portfolio_${username}${extension}`;
      } else {
        // Fallback for other document types
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        filename = `${file.fieldname}_${username}_${uniqueSuffix}${extension}`;
      }
      
      cb(null, filename);
    } catch (error) {
      console.error('❌ Error generating filename:', error);
      // Fallback to original naming if user lookup fails
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, `${file.fieldname}-${req.user.userId}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
  }
});

const fileFilter = (req, file, cb) => {
  // Accept documents and images
  const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only documents and images are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: fileFilter
});

// POST /api/files/resume - Upload resume
router.post('/resume', authenticateToken, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No resume file uploaded'
      });
    }

    const resumeUrl = `/uploads/documents/${req.file.filename}`;
    
    // Update user profile with resume URL
    const user = await BaseUser.findById(req.user.userId);
    if (user) {
      user.resume_url = resumeUrl;
      await user.save();
      console.log(`✅ Resume uploaded and profile updated: ${req.file.filename} for user ${user.username}`);
    }

    res.json({
      success: true,
      message: 'Resume uploaded successfully',
      resumeUrl: resumeUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size
    });

  } catch (error) {
    console.error('❌ Resume upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload resume',
      error: error.message
    });
  }
});

// POST /api/files/profile-picture - Upload profile picture
router.post('/profile-picture', authenticateToken, upload.single('profilePicture'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No profile picture uploaded'
      });
    }

    const profileImageUrl = `/uploads/documents/${req.file.filename}`;
    
    // Update user profile with profile image URL
    const user = await BaseUser.findById(req.user.userId);
    if (user) {
      user.profileImage = profileImageUrl;
      await user.save();
      console.log(`✅ Profile picture uploaded: ${req.file.filename} for user ${user.username}`);
    }

    res.json({
      success: true,
      message: 'Profile picture uploaded successfully',
      profileImageUrl: profileImageUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size
    });

  } catch (error) {
    console.error('❌ Profile picture upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload profile picture',
      error: error.message
    });
  }
});

// POST /api/files/cover-letter - Upload cover letter
router.post('/cover-letter', authenticateToken, upload.single('coverLetter'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No cover letter uploaded'
      });
    }

    const coverLetterUrl = `/uploads/documents/${req.file.filename}`;
    
    // Update user profile with cover letter URL
    const user = await BaseUser.findById(req.user.userId);
    if (user) {
      user.cover_letter_url = coverLetterUrl;
      await user.save();
      console.log(`✅ Cover letter uploaded: ${req.file.filename} for user ${user.username}`);
    }

    res.json({
      success: true,
      message: 'Cover letter uploaded successfully',
      coverLetterUrl: coverLetterUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size
    });

  } catch (error) {
    console.error('❌ Cover letter upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload cover letter',
      error: error.message
    });
  }
});

export default router;
