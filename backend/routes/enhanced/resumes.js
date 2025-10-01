import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs/promises';
import { body, validationResult } from 'express-validator';
import Resume from '../../models/enhanced/Resume.js';
import { authenticateToken } from '../../middleware/auth.js';

const router = express.Router();

// Configure multer for resume uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'uploads', 'resumes');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, `resume-${req.user.userId}-${uniqueSuffix}${extension}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, DOC, and DOCX files are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 1
  }
});

// Validation schemas
const resumeUpdateValidation = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Title must be between 3 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  body('isDefault')
    .optional()
    .isBoolean()
    .withMessage('isDefault must be a boolean value'),
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean value'),
];

// @route   POST /api/resumes/upload
// @desc    Upload a new resume
// @access  Private (Applicant only)
router.post('/upload', authenticateToken, upload.single('resume'), async (req, res) => {
  try {
    // Verify user is an applicant
    if (req.user.role !== 'applicant') {
      return res.status(403).json({
        success: false,
        message: 'Only applicants can upload resumes'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No resume file provided'
      });
    }

    const { title, description, isDefault = false } = req.body;
    const userId = req.user.userId;

    // Generate file URL
    const fileUrl = `/uploads/resumes/${req.file.filename}`;

    // Extract text content from file
    let extractedText = '';
    let parsedData = {};

    try {
      if (req.file.mimetype === 'application/pdf') {
        extractedText = await extractTextFromPDF(req.file.path);
      } else if (req.file.mimetype.includes('word')) {
        extractedText = await extractTextFromDOC(req.file.path);
      }

      // Parse resume content for structured data
      if (extractedText) {
        parsedData = await parseResumeContent(extractedText);
      }
    } catch (parseError) {
      console.error('Error parsing resume content:', parseError);
      // Continue without parsed data
    }

    // Create resume record
    const resumeData = {
      userId,
      fileName: req.file.filename,
      originalName: req.file.originalname,
      fileUrl,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      title: title || req.file.originalname.replace(/\.[^/.]+$/, ''),
      description: description || '',
      extractedText,
      parsedData,
      isDefault: Boolean(isDefault),
      status: 'active'
    };

    const resume = new Resume(resumeData);
    await resume.save();

    res.status(201).json({
      success: true,
      message: 'Resume uploaded successfully',
      data: { resume }
    });

  } catch (error) {
    // Clean up uploaded file if database save fails
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (unlinkError) {
        console.error('Error deleting uploaded file:', unlinkError);
      }
    }

    console.error('Error uploading resume:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during resume upload',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/resumes
// @desc    Get all resumes for the authenticated user
// @access  Private
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status = 'active', page = 1, limit = 20 } = req.query;
    const userId = req.user.userId;

    // Build query
    const query = { userId };
    if (status !== 'all') {
      query.status = status;
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get resumes
    const [resumes, totalResumes] = await Promise.all([
      Resume.find(query)
        .sort({ isDefault: -1, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Resume.countDocuments(query)
    ]);

    // Enrich resume data
    const enrichedResumes = resumes.map(resume => ({
      ...resume,
      fileExtension: resume.fileName.split('.').pop().toLowerCase(),
      fileSizeFormatted: formatFileSize(resume.fileSize),
      ageInDays: Math.floor((Date.now() - new Date(resume.createdAt).getTime()) / (1000 * 60 * 60 * 24))
    }));

    res.json({
      success: true,
      data: {
        resumes: enrichedResumes,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalResumes / parseInt(limit)),
          totalResumes,
          limit: parseInt(limit)
        },
        summary: {
          total: totalResumes,
          active: resumes.filter(r => r.status === 'active').length,
          default: resumes.find(r => r.isDefault)?._id || null
        }
      }
    });

  } catch (error) {
    console.error('Error fetching resumes:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/resumes/:id
// @desc    Get single resume
// @access  Private
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Validate ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid resume ID format'
      });
    }

    const resume = await Resume.findById(id);

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    // Check access permissions
    const hasAccess = 
      resume.userId.toString() === userId || 
      (req.user.role === 'recruiter' && resume.isPublic);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Update view count if accessed by recruiter
    if (req.user.role === 'recruiter' && resume.userId.toString() !== userId) {
      resume.viewCount += 1;
      resume.lastViewed = new Date();
      await resume.save();
    }

    // Enrich resume data
    const enrichedResume = {
      ...resume.toObject(),
      fileExtension: resume.fileName.split('.').pop().toLowerCase(),
      fileSizeFormatted: formatFileSize(resume.fileSize),
      ageInDays: Math.floor((Date.now() - new Date(resume.createdAt).getTime()) / (1000 * 60 * 60 * 24))
    };

    res.json({
      success: true,
      data: { resume: enrichedResume }
    });

  } catch (error) {
    console.error('Error fetching resume:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/resumes/:id/download
// @desc    Download resume file
// @access  Private
router.get('/:id/download', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const resume = await Resume.findById(id);

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    // Check access permissions
    const hasAccess = 
      resume.userId.toString() === userId || 
      (req.user.role === 'recruiter' && resume.isPublic);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Update download count
    resume.downloadCount += 1;
    await resume.save();

    // Get file path
    const filePath = path.join(process.cwd(), 'uploads', 'resumes', resume.fileName);

    // Check if file exists
    try {
      await fs.access(filePath);
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: 'Resume file not found on server'
      });
    }

    // Set appropriate headers
    res.setHeader('Content-Disposition', `attachment; filename="${resume.originalName}"`);
    res.setHeader('Content-Type', resume.mimeType);

    // Send file
    res.sendFile(filePath);

  } catch (error) {
    console.error('Error downloading resume:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   PUT /api/resumes/:id
// @desc    Update resume metadata
// @access  Private (Owner only)
router.put('/:id', authenticateToken, resumeUpdateValidation, async (req, res) => {
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
    const { title, description, isDefault, isPublic } = req.body;

    // Find resume and verify ownership
    const resume = await Resume.findById(id);

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    if (resume.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own resumes'
      });
    }

    // Update resume
    const updateData = {
      title,
      description,
      isPublic
    };

    // Handle default resume setting
    if (isDefault !== undefined) {
      updateData.isDefault = isDefault;
    }

    const updatedResume = await Resume.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Resume updated successfully',
      data: { resume: updatedResume }
    });

  } catch (error) {
    console.error('Error updating resume:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   PUT /api/resumes/:id/set-default
// @desc    Set resume as default
// @access  Private (Owner only)
router.put('/:id/set-default', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Find resume and verify ownership
    const resume = await Resume.findById(id);

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    if (resume.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only modify your own resumes'
      });
    }

    // Remove default from all other resumes
    await Resume.updateMany(
      { userId, _id: { $ne: id } },
      { isDefault: false }
    );

    // Set this resume as default
    resume.isDefault = true;
    await resume.save();

    res.json({
      success: true,
      message: 'Default resume updated successfully',
      data: { resume }
    });

  } catch (error) {
    console.error('Error setting default resume:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   DELETE /api/resumes/:id
// @desc    Delete resume
// @access  Private (Owner only)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Find resume and verify ownership
    const resume = await Resume.findById(id);

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    if (resume.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own resumes'
      });
    }

    // Check if this is the only resume
    const resumeCount = await Resume.countDocuments({ userId, status: 'active' });
    if (resumeCount === 1) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your only resume. Please upload another resume first.'
      });
    }

    // Archive resume instead of hard delete
    resume.status = 'archived';
    await resume.save();

    // If this was the default resume, set another as default
    if (resume.isDefault) {
      const nextResume = await Resume.findOne({
        userId,
        status: 'active',
        _id: { $ne: id }
      }).sort({ createdAt: -1 });

      if (nextResume) {
        nextResume.isDefault = true;
        await nextResume.save();
      }
    }

    res.json({
      success: true,
      message: 'Resume deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting resume:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   POST /api/resumes/:id/reprocess
// @desc    Reprocess resume content extraction
// @access  Private (Owner only)
router.post('/:id/reprocess', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // Find resume and verify ownership
    const resume = await Resume.findById(id);

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: 'Resume not found'
      });
    }

    if (resume.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only reprocess your own resumes'
      });
    }

    // Get file path
    const filePath = path.join(process.cwd(), 'uploads', 'resumes', resume.fileName);

    // Check if file exists
    try {
      await fs.access(filePath);
    } catch (error) {
      return res.status(404).json({
        success: false,
        message: 'Resume file not found on server'
      });
    }

    // Re-extract text content
    let extractedText = '';
    let parsedData = {};

    try {
      if (resume.mimeType === 'application/pdf') {
        extractedText = await extractTextFromPDF(filePath);
      } else if (resume.mimeType.includes('word')) {
        extractedText = await extractTextFromDOC(filePath);
      }

      // Parse resume content for structured data
      if (extractedText) {
        parsedData = await parseResumeContent(extractedText);
      }
    } catch (parseError) {
      console.error('Error reprocessing resume content:', parseError);
      return res.status(500).json({
        success: false,
        message: 'Error processing resume content'
      });
    }

    // Update resume with new extracted data
    resume.extractedText = extractedText;
    resume.parsedData = parsedData;
    resume.status = 'active';
    await resume.save();

    res.json({
      success: true,
      message: 'Resume reprocessed successfully',
      data: { resume }
    });

  } catch (error) {
    console.error('Error reprocessing resume:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Helper function to format file size
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default router;
