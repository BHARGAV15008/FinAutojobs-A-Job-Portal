import express from "express";
import multer from "multer";
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

    const jwt = await import("jsonwebtoken");
    const jwtSecret =
      process.env.JWT_SECRET || "your-jwt-secret-key-change-this-in-production";

    const decoded = jwt.default.verify(token, jwtSecret);

    // Get user from database
    const user = await BaseUser.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid token - user not found",
      });
    }

    req.user = {
      userId: user._id.toString(),
      username: user.username,
      role: user.role,
      email: user.email,
    };

    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
};

// Configure multer to use memory storage for S3
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Accept documents and images
  const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt/;
  const extname = allowedTypes.test(
    file.originalname.toLowerCase().split(".").pop()
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error("Only documents and images are allowed"), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: fileFilter,
});

// POST /api/files/resume - Upload resume
router.post(
  "/resume",
  authenticateToken,
  upload.single("resume"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No resume file uploaded",
        });
      }

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
      const s3Result = await s3Service.uploadResume(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype,
        req.user.userId,
        userInfo
      );

      // Update user profile with resume URL
      if (user) {
        user.resume_url = s3Result.url;
        await user.save();
        console.log(
          `✅ Resume uploaded to S3: ${s3Result.fileName} for user ${user.username}`
        );
      }

      res.json({
        success: true,
        message: "Resume uploaded successfully",
        resumeUrl: s3Result.url,
        s3Key: s3Result.key,
        fileName: s3Result.fileName,
        originalName: req.file.originalname,
        size: req.file.size,
      });
    } catch (error) {
      console.error("❌ Resume upload error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to upload resume",
        error: error.message,
      });
    }
  }
);

// POST /api/files/profile-picture - Upload profile picture
router.post(
  "/profile-picture",
  authenticateToken,
  upload.single("profilePicture"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No profile picture uploaded",
        });
      }

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

      // Upload to S3 with user info
      const s3Result = await s3Service.uploadProfileImage(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype,
        req.user.userId,
        userInfo
      );

      // Update user profile with profile image URL
      if (user) {
        // Delete old profile image if exists
        if (user.profileImage) {
          try {
            await s3Service.deleteFileByUrl(user.profileImage);
          } catch (deleteError) {
            console.warn("⚠️ Failed to delete old profile image:", deleteError);
          }
        }

        user.profileImage = s3Result.url;
        await user.save();
        console.log(
          `✅ Profile picture uploaded to S3: ${s3Result.fileName} for user ${user.username}`
        );
      }

      res.json({
        success: true,
        message: "Profile picture uploaded successfully",
        profileImageUrl: s3Result.url,
        s3Key: s3Result.key,
        fileName: s3Result.fileName,
        originalName: req.file.originalname,
        size: req.file.size,
      });
    } catch (error) {
      console.error("❌ Profile picture upload error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to upload profile picture",
        error: error.message,
      });
    }
  }
);

// POST /api/files/cover-letter - Upload cover letter
router.post(
  "/cover-letter",
  authenticateToken,
  upload.single("coverLetter"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No cover letter uploaded",
        });
      }

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
      const s3Result = await s3Service.uploadCoverLetter(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype,
        req.user.userId,
        userInfo
      );

      // Update user profile with cover letter URL
      if (user) {
        user.cover_letter_url = s3Result.url;
        await user.save();
        console.log(
          `✅ Cover letter uploaded to S3: ${s3Result.fileName} for user ${user.username}`
        );
      }

      res.json({
        success: true,
        message: "Cover letter uploaded successfully",
        coverLetterUrl: s3Result.url,
        s3Key: s3Result.key,
        fileName: s3Result.fileName,
        originalName: req.file.originalname,
        size: req.file.size,
      });
    } catch (error) {
      console.error("❌ Cover letter upload error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to upload cover letter",
        error: error.message,
      });
    }
  }
);

export default router;
