import express from "express";
import multer from "multer";
import path from "path";
import jwt from "jsonwebtoken";
import { BaseUser } from "../models/UserModels.js";
import s3Service from "../services/s3Service.js";

const router = express.Router();

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access token is required",
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-jwt-secret-key-change-this-in-production"
    );

    const user = await BaseUser.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    req.user = {
      ...decoded,
      ...user.toObject(),
      userId: decoded.userId || user._id,
      _id: user._id,
    };
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
};

// File type configurations
const fileConfigs = {
  resume: {
    allowedTypes: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
    maxSize: 5 * 1024 * 1024, // 5MB
    uploadMethod: "uploadResume",
  },
  coverLetter: {
    allowedTypes: [
      "application/pdf",
      "text/plain",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
    maxSize: 3 * 1024 * 1024, // 3MB
    uploadMethod: "uploadCoverLetter",
  },
  profile: {
    allowedTypes: [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ],
    maxSize: 2 * 1024 * 1024, // 2MB
    uploadMethod: "uploadProfileImage",
  },
  portfolio: {
    allowedTypes: [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
      "application/zip",
      "application/x-zip-compressed",
    ],
    maxSize: 10 * 1024 * 1024, // 10MB
    uploadMethod: "uploadPortfolio",
  },
  document: {
    allowedTypes: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "image/jpeg",
      "image/jpg",
      "image/png",
    ],
    maxSize: 10 * 1024 * 1024, // 10MB
    uploadMethod: "uploadFile",
  },
  companyDocument: {
    allowedTypes: ["application/pdf", "image/jpeg", "image/jpg", "image/png"],
    maxSize: 5 * 1024 * 1024, // 5MB
    uploadMethod: "uploadCompanyDocument",
  },
};

// Configure multer to use memory storage for S3
const storage = multer.memoryStorage();

const createMulterConfig = (fileType) => {
  const config = fileConfigs[fileType];

  if (!config) {
    throw new Error(`Invalid file type: ${fileType}`);
  }

  const fileFilter = (req, file, cb) => {
    if (config.allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          `Invalid file type. Allowed types: ${config.allowedTypes.join(", ")}`
        ),
        false
      );
    }
  };

  return multer({
    storage,
    fileFilter,
    limits: {
      fileSize: config.maxSize,
      files: fileType === "portfolio" ? 5 : 1,
    },
  });
};

// File upload endpoint
router.post("/application-document", authenticateToken, async (req, res) => {
  try {
    const { type } = req.body;

    if (!type || !fileConfigs[type]) {
      return res.status(400).json({
        success: false,
        message: "Invalid or missing file type",
        allowedTypes: Object.keys(fileConfigs),
      });
    }

    // Create multer instance for this file type
    const upload = createMulterConfig(type);

    // Handle file upload
    upload.single("file")(req, res, async (err) => {
      if (err) {
        console.error("❌ File upload error:", err);

        if (err instanceof multer.MulterError) {
          if (err.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({
              success: false,
              message: `File too large. Maximum size: ${
                fileConfigs[type].maxSize / (1024 * 1024)
              }MB`,
              code: "FILE_TOO_LARGE",
            });
          }
          if (err.code === "LIMIT_UNEXPECTED_FILE") {
            return res.status(400).json({
              success: false,
              message: "Unexpected file field",
              code: "UNEXPECTED_FILE",
            });
          }
        }

        return res.status(400).json({
          success: false,
          message: err.message || "File upload failed",
          code: "UPLOAD_ERROR",
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded",
          code: "NO_FILE",
        });
      }

      try {
        // Get user info for filename
        const user = await BaseUser.findById(req.user.userId);
        const userInfo = {
          name:
            user?.firstName && user?.lastName
              ? `${user.firstName}_${user.lastName}`
              : null,
          username: user?.username,
          fullname:
            user?.firstName && user?.lastName
              ? `${user.firstName}_${user.lastName}`
              : user?.username,
        };

        // Upload to S3
        const config = fileConfigs[type];
        const uploadMethod = s3Service[config.uploadMethod];

        if (!uploadMethod) {
          throw new Error(`Upload method ${config.uploadMethod} not found`);
        }

        const s3Result = await uploadMethod.call(
          s3Service,
          req.file.buffer,
          req.file.originalname,
          req.file.mimetype,
          req.user.userId,
          userInfo
        );

        // File upload successful
        const fileData = {
          filename: s3Result.fileName,
          originalName: req.file.originalname,
          fileUrl: s3Result.url,
          s3Key: s3Result.key,
          fileSize: req.file.size,
          mimeType: req.file.mimetype,
          uploadedAt: new Date(),
          uploadedBy: req.user.userId,
        };

        // For resumes, extract text content for keyword matching
        if (type === "resume") {
          try {
            // You can implement PDF text extraction here using libraries like pdf-parse
            // For now, we'll store a placeholder
            fileData.extractedText = "Text extraction will be implemented";
            fileData.parsedData = {
              skills: [],
              experience: [],
              education: [],
              extractionStatus: "pending",
            };
          } catch (extractionError) {
            console.warn("⚠️ Text extraction failed:", extractionError);
            fileData.extractedText = "";
            fileData.parsedData = { extractionStatus: "failed" };
          }
        }

        // Virus scanning placeholder (implement with ClamAV or similar)
        fileData.virusScanned = false;
        fileData.scanStatus = "pending";

        res.json({
          success: true,
          message: "File uploaded successfully",
          data: fileData,
        });

        // Log successful upload
        console.log(
          `✅ File uploaded: ${req.file.filename} by user ${req.user.userId}`
        );
      } catch (processingError) {
        console.error("❌ File processing error:", processingError);

        // Clean up uploaded file if processing fails
        try {
          fs.unlinkSync(req.file.path);
        } catch (cleanupError) {
          console.error("❌ File cleanup error:", cleanupError);
        }

        res.status(500).json({
          success: false,
          message: "File processing failed",
          code: "PROCESSING_ERROR",
          error: processingError.message,
        });
      }
    });
  } catch (error) {
    console.error("❌ Upload endpoint error:", error);
    res.status(500).json({
      success: false,
      message: "Upload service error",
      code: "SERVICE_ERROR",
      error: error.message,
    });
  }
});

// Multiple file upload endpoint (for portfolios)
router.post(
  "/application-documents-multiple",
  authenticateToken,
  async (req, res) => {
    try {
      const { type } = req.body;

      if (!type || !fileConfigs[type]) {
        return res.status(400).json({
          success: false,
          message: "Invalid or missing file type",
          allowedTypes: Object.keys(fileConfigs),
        });
      }

      const upload = createMulterConfig(type);

      upload.array("files", 5)(req, res, async (err) => {
        if (err) {
          console.error("❌ Multiple file upload error:", err);
          return res.status(400).json({
            success: false,
            message: err.message || "Multiple file upload failed",
            code: "MULTI_UPLOAD_ERROR",
          });
        }

        if (!req.files || req.files.length === 0) {
          return res.status(400).json({
            success: false,
            message: "No files uploaded",
            code: "NO_FILES",
          });
        }

        try {
          // Get user info for filename
          const user = await BaseUser.findById(req.user.userId);
          const userInfo = {
            name:
              user?.firstName && user?.lastName
                ? `${user.firstName}_${user.lastName}`
                : null,
            username: user?.username,
            fullname:
              user?.firstName && user?.lastName
                ? `${user.firstName}_${user.lastName}`
                : user?.username,
          };

          // Upload each file to S3
          const config = fileConfigs[type];
          const uploadMethod = s3Service[config.uploadMethod];

          const uploadPromises = req.files.map((file) =>
            uploadMethod.call(
              s3Service,
              file.buffer,
              file.originalname,
              file.mimetype,
              req.user.userId,
              userInfo
            )
          );

          const s3Results = await Promise.all(uploadPromises);

          const uploadedFiles = s3Results.map((s3Result, index) => ({
            filename: s3Result.fileName,
            originalName: req.files[index].originalname,
            fileUrl: s3Result.url,
            s3Key: s3Result.key,
            fileSize: req.files[index].size,
            mimeType: req.files[index].mimetype,
            uploadedAt: new Date(),
            uploadedBy: req.user.userId,
          }));

          res.json({
            success: true,
            message: `${uploadedFiles.length} files uploaded successfully`,
            data: uploadedFiles,
          });

          console.log(
            `✅ Multiple files uploaded to S3: ${uploadedFiles.length} files by user ${req.user.userId}`
          );
        } catch (processingError) {
          console.error("❌ Multiple file processing error:", processingError);

          res.status(500).json({
            success: false,
            message: "File processing failed",
            code: "PROCESSING_ERROR",
            error: processingError.message,
          });
        }
      });
    } catch (error) {
      console.error("❌ Multiple upload endpoint error:", error);
      res.status(500).json({
        success: false,
        message: "Upload service error",
        code: "SERVICE_ERROR",
        error: error.message,
      });
    }
  }
);

// File deletion endpoint
router.delete(
  "/application-document/:s3Key(*)",
  authenticateToken,
  async (req, res) => {
    try {
      const s3Key = req.params.s3Key;

      if (!s3Key) {
        return res.status(400).json({
          success: false,
          message: "S3 key is required",
        });
      }

      // Verify file ownership (s3Key should contain user ID)
      if (!s3Key.includes(req.user.userId)) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
          code: "ACCESS_DENIED",
        });
      }

      // Check if file exists
      const exists = await s3Service.fileExists(s3Key);
      if (!exists) {
        return res.status(404).json({
          success: false,
          message: "File not found",
          code: "FILE_NOT_FOUND",
        });
      }

      // Delete file from S3
      await s3Service.deleteFile(s3Key);

      res.json({
        success: true,
        message: "File deleted successfully",
      });

      console.log(
        `✅ File deleted from S3: ${s3Key} by user ${req.user.userId}`
      );
    } catch (error) {
      console.error("❌ File deletion error:", error);
      res.status(500).json({
        success: false,
        message: "File deletion failed",
        code: "DELETION_ERROR",
        error: error.message,
      });
    }
  }
);

// File download/view endpoint - returns presigned URL for S3 access
router.get(
  "/application-document/:s3Key(*)",
  authenticateToken,
  async (req, res) => {
    try {
      const s3Key = req.params.s3Key;

      if (!s3Key) {
        return res.status(400).json({
          success: false,
          message: "S3 key is required",
        });
      }

      // Basic ownership check
      if (!s3Key.includes(req.user.userId)) {
        return res.status(403).json({
          success: false,
          message: "Access denied",
        });
      }

      // Check if file exists
      const exists = await s3Service.fileExists(s3Key);
      if (!exists) {
        return res.status(404).json({
          success: false,
          message: "File not found",
        });
      }

      // Generate presigned URL (valid for 1 hour)
      const signedUrl = await s3Service.getSignedUrl(s3Key, 3600);

      res.json({
        success: true,
        url: signedUrl,
        expiresIn: 3600,
      });

      console.log(
        `✅ File access granted: ${s3Key} by user ${req.user.userId}`
      );
    } catch (error) {
      console.error("❌ File access error:", error);
      res.status(500).json({
        success: false,
        message: "File access failed",
        error: error.message,
      });
    }
  }
);

// Public file serving endpoint - returns presigned URL for public access
router.get("/documents/:type/:s3Key(*)", async (req, res) => {
  try {
    const { type, s3Key } = req.params;

    if (!type || !fileConfigs[type]) {
      return res.status(400).json({
        success: false,
        message: "Invalid file type",
      });
    }

    const fullKey = `${type}/${s3Key}`;

    // Check if file exists
    const exists = await s3Service.fileExists(fullKey);
    if (!exists) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    // Generate presigned URL (valid for 1 hour)
    const signedUrl = await s3Service.getSignedUrl(fullKey, 3600);

    res.json({
      success: true,
      url: signedUrl,
      expiresIn: 3600,
    });

    console.log(`✅ Public file access granted: ${fullKey}`);
  } catch (error) {
    console.error("❌ Public file access error:", error);
    res.status(500).json({
      success: false,
      message: "File access failed",
      error: error.message,
    });
  }
});

// Get file upload limits and allowed types
router.get("/upload-config", (req, res) => {
  const config = {};

  Object.keys(fileConfigs).forEach((type) => {
    config[type] = {
      allowedTypes: fileConfigs[type].allowedTypes,
      maxSize: fileConfigs[type].maxSize,
      maxSizeMB: Math.round(fileConfigs[type].maxSize / (1024 * 1024)),
    };
  });

  res.json({
    success: true,
    data: config,
  });
});

export default router;
