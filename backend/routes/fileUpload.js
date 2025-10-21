import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { BaseUser } from '../models/UserModels.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-jwt-secret-key-change-this-in-production');
    
    const user = await BaseUser.findById(decoded.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
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
      message: 'Invalid token'
    });
  }
};

// Create upload directories if they don't exist
const createUploadDirs = () => {
  // Get the main project directory (parent of backend)
  const projectRoot = path.join(__dirname, '..', '..');
  
  const dirs = [
    'uploads/applications/resumes',
    'uploads/applications/cover-letters',
    'uploads/applications/portfolios',
    'uploads/applications/documents',
    'uploads/documents', // Direct documents folder
    'uploads/temp'
  ];

  dirs.forEach(dir => {
    const fullPath = path.join(projectRoot, dir);
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
      console.log(`✅ Created directory: ${fullPath}`);
    }
  });
};

// Initialize upload directories
createUploadDirs();

// Get the main project directory (parent of backend)
const projectRoot = path.join(__dirname, '..', '..');

// File type configurations
const fileConfigs = {
  resume: {
    allowedTypes: [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ],
    maxSize: 5 * 1024 * 1024, // 5MB
    destination: path.join(projectRoot, 'uploads', 'documents') // Direct to uploads/documents
  },
  coverLetter: {
    allowedTypes: [
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ],
    maxSize: 5 * 1024 * 1024, // 5MB
    destination: path.join(projectRoot, 'uploads', 'documents')
  },
  portfolio: {
    allowedTypes: [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp'
    ],
    maxSize: 10 * 1024 * 1024, // 10MB
    destination: path.join(projectRoot, 'uploads', 'documents')
  },
  additional: {
    allowedTypes: [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ],
    maxSize: 10 * 1024 * 1024, // 10MB
    destination: path.join(projectRoot, 'uploads', 'documents')
  }
};

// Dynamic multer configuration
const createMulterConfig = (fileType) => {
  const config = fileConfigs[fileType];
  if (!config) {
    throw new Error(`Unsupported file type: ${fileType}`);
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, config.destination);
    },
    filename: (req, file, cb) => {
      // Generate unique filename
      const uniqueSuffix = Date.now() + '-' + crypto.randomBytes(6).toString('hex');
      const extension = path.extname(file.originalname);
      const baseName = path.basename(file.originalname, extension)
        .replace(/[^a-zA-Z0-9]/g, '_')
        .substring(0, 50);
      
      const filename = `${req.user.userId}_${baseName}_${uniqueSuffix}${extension}`;
      cb(null, filename);
    }
  });

  const fileFilter = (req, file, cb) => {
    if (config.allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Invalid file type. Allowed types: ${config.allowedTypes.join(', ')}`), false);
    }
  };

  return multer({
    storage,
    fileFilter,
    limits: {
      fileSize: config.maxSize,
      files: fileType === 'portfolio' ? 5 : 1 // Allow multiple portfolio files
    }
  });
};

// File upload endpoint
router.post('/application-document', authenticateToken, async (req, res) => {
  try {
    const { type } = req.body;
    
    if (!type || !fileConfigs[type]) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or missing file type',
        allowedTypes: Object.keys(fileConfigs)
      });
    }

    // Create multer instance for this file type
    const upload = createMulterConfig(type);
    
    // Handle file upload
    upload.single('file')(req, res, async (err) => {
      if (err) {
        console.error('❌ File upload error:', err);
        
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
              success: false,
              message: `File too large. Maximum size: ${fileConfigs[type].maxSize / (1024 * 1024)}MB`,
              code: 'FILE_TOO_LARGE'
            });
          }
          if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
              success: false,
              message: 'Unexpected file field',
              code: 'UNEXPECTED_FILE'
            });
          }
        }
        
        return res.status(400).json({
          success: false,
          message: err.message || 'File upload failed',
          code: 'UPLOAD_ERROR'
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded',
          code: 'NO_FILE'
        });
      }

      try {
        // File upload successful
        const fileData = {
          filename: req.file.filename,
          originalName: req.file.originalname,
          fileUrl: `/uploads/documents/${req.file.filename}`, // Simplified path
          fileSize: req.file.size,
          mimeType: req.file.mimetype,
          uploadedAt: new Date(),
          uploadedBy: req.user.userId
        };

        // For resumes, extract text content for keyword matching
        if (type === 'resume') {
          try {
            // You can implement PDF text extraction here using libraries like pdf-parse
            // For now, we'll store a placeholder
            fileData.extractedText = 'Text extraction will be implemented';
            fileData.parsedData = {
              skills: [],
              experience: [],
              education: [],
              extractionStatus: 'pending'
            };
          } catch (extractionError) {
            console.warn('⚠️ Text extraction failed:', extractionError);
            fileData.extractedText = '';
            fileData.parsedData = { extractionStatus: 'failed' };
          }
        }

        // Virus scanning placeholder (implement with ClamAV or similar)
        fileData.virusScanned = false;
        fileData.scanStatus = 'pending';

        res.json({
          success: true,
          message: 'File uploaded successfully',
          data: fileData
        });

        // Log successful upload
        console.log(`✅ File uploaded: ${req.file.filename} by user ${req.user.userId}`);

      } catch (processingError) {
        console.error('❌ File processing error:', processingError);
        
        // Clean up uploaded file if processing fails
        try {
          fs.unlinkSync(req.file.path);
        } catch (cleanupError) {
          console.error('❌ File cleanup error:', cleanupError);
        }

        res.status(500).json({
          success: false,
          message: 'File processing failed',
          code: 'PROCESSING_ERROR',
          error: processingError.message
        });
      }
    });

  } catch (error) {
    console.error('❌ Upload endpoint error:', error);
    res.status(500).json({
      success: false,
      message: 'Upload service error',
      code: 'SERVICE_ERROR',
      error: error.message
    });
  }
});

// Multiple file upload endpoint (for portfolios)
router.post('/application-documents-multiple', authenticateToken, async (req, res) => {
  try {
    const { type } = req.body;
    
    if (!type || !fileConfigs[type]) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or missing file type',
        allowedTypes: Object.keys(fileConfigs)
      });
    }

    const upload = createMulterConfig(type);
    
    upload.array('files', 5)(req, res, async (err) => {
      if (err) {
        console.error('❌ Multiple file upload error:', err);
        return res.status(400).json({
          success: false,
          message: err.message || 'Multiple file upload failed',
          code: 'MULTI_UPLOAD_ERROR'
        });
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No files uploaded',
          code: 'NO_FILES'
        });
      }

      try {
        const uploadedFiles = req.files.map(file => ({
          filename: file.filename,
          originalName: file.originalname,
          fileUrl: `/uploads/documents/${file.filename}`, // Simplified path
          fileSize: file.size,
          mimeType: file.mimetype,
          uploadedAt: new Date(),
          uploadedBy: req.user.userId
        }));

        res.json({
          success: true,
          message: `${uploadedFiles.length} files uploaded successfully`,
          data: uploadedFiles
        });

        console.log(`✅ Multiple files uploaded: ${uploadedFiles.length} files by user ${req.user.userId}`);

      } catch (processingError) {
        console.error('❌ Multiple file processing error:', processingError);
        
        // Clean up uploaded files if processing fails
        req.files.forEach(file => {
          try {
            fs.unlinkSync(file.path);
          } catch (cleanupError) {
            console.error('❌ File cleanup error:', cleanupError);
          }
        });

        res.status(500).json({
          success: false,
          message: 'File processing failed',
          code: 'PROCESSING_ERROR',
          error: processingError.message
        });
      }
    });

  } catch (error) {
    console.error('❌ Multiple upload endpoint error:', error);
    res.status(500).json({
      success: false,
      message: 'Upload service error',
      code: 'SERVICE_ERROR',
      error: error.message
    });
  }
});

// File deletion endpoint
router.delete('/application-document/:filename', authenticateToken, async (req, res) => {
  try {
    const { filename } = req.params;
    const { type } = req.query;

    if (!type || !fileConfigs[type]) {
      return res.status(400).json({
        success: false,
        message: 'File type is required',
        allowedTypes: Object.keys(fileConfigs)
      });
    }

    // Verify file ownership (filename should contain user ID)
    if (!filename.startsWith(req.user.userId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied',
        code: 'ACCESS_DENIED'
      });
    }

    const filePath = path.join(fileConfigs[type].destination, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found',
        code: 'FILE_NOT_FOUND'
      });
    }

    // Delete file
    fs.unlinkSync(filePath);

    res.json({
      success: true,
      message: 'File deleted successfully'
    });

    console.log(`✅ File deleted: ${filename} by user ${req.user.userId}`);

  } catch (error) {
    console.error('❌ File deletion error:', error);
    res.status(500).json({
      success: false,
      message: 'File deletion failed',
      code: 'DELETION_ERROR',
      error: error.message
    });
  }
});

// File download/view endpoint for documents (with authentication)
router.get('/application-document/:filename', authenticateToken, async (req, res) => {
  try {
    const { filename } = req.params;
    const { type } = req.query;

    if (!type || !fileConfigs[type]) {
      return res.status(400).json({
        success: false,
        message: 'File type is required'
      });
    }

    // Basic ownership check (can be enhanced with database lookup)
    if (!filename.startsWith(req.user.userId)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const filePath = path.join(fileConfigs[type].destination, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Set appropriate headers
    const stat = fs.statSync(filePath);
    const mimeType = getMimeType(path.extname(filename));
    
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Length', stat.size);
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);

    // Stream file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    console.log(`✅ File accessed: ${filename} by user ${req.user.userId}`);

  } catch (error) {
    console.error('❌ File access error:', error);
    res.status(500).json({
      success: false,
      message: 'File access failed',
      error: error.message
    });
  }
});

// Public file serving endpoint for documents (no authentication required)
router.get('/documents/:type/:filename', async (req, res) => {
  try {
    const { type, filename } = req.params;

    if (!type || !fileConfigs[type]) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file type'
      });
    }

    const filePath = path.join(fileConfigs[type].destination, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    // Set appropriate headers
    const stat = fs.statSync(filePath);
    const mimeType = getMimeType(path.extname(filename));
    
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Length', stat.size);
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    res.setHeader('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour

    // Stream file
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    console.log(`✅ Public file served: ${filename}`);

  } catch (error) {
    console.error('❌ Public file access error:', error);
    res.status(500).json({
      success: false,
      message: 'File access failed',
      error: error.message
    });
  }
});

// Get file upload limits and allowed types
router.get('/upload-config', (req, res) => {
  const config = {};
  
  Object.keys(fileConfigs).forEach(type => {
    config[type] = {
      allowedTypes: fileConfigs[type].allowedTypes,
      maxSize: fileConfigs[type].maxSize,
      maxSizeMB: Math.round(fileConfigs[type].maxSize / (1024 * 1024))
    };
  });

  res.json({
    success: true,
    data: config
  });
});

// Helper function to get MIME type
const getMimeType = (extension) => {
  const mimeTypes = {
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.txt': 'text/plain',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp'
  };
  
  return mimeTypes[extension.toLowerCase()] || 'application/octet-stream';
};

export default router;
