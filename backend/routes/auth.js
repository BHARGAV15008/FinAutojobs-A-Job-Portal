import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { body, validationResult } from "express-validator";
import {
  createUserByRole,
  authenticateUser,
  findUserByIdAndRole,
  updateUserProfile,
  checkFieldAvailability,
  BaseUser,
  Applicant,
  Recruiter,
  Admin,
} from "../models/UserModels.js";
import UsernameGenerator from "../utils/usernameGenerator.js";
import redisClient from "../config/redis.js";
import {
  sanitizeSocialLinks,
  sanitizeBio,
  isValidBio,
} from "../utils/urlValidator.js";

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../uploads/documents"));
  },
  filename: async (req, file, cb) => {
    try {
      // Get user data to access username
      const user = await BaseUser.findById(req.user.userId);
      const username = user?.username || req.user.userId;

      // Create readable filename based on file type
      const extension = path.extname(file.originalname);
      let filename;

      if (file.fieldname === "resume") {
        filename = `resume_${username}${extension}`;
      } else if (file.fieldname === "coverLetter") {
        filename = `coverletter_${username}${extension}`;
      } else if (file.fieldname === "portfolio") {
        filename = `portfolio_${username}${extension}`;
      } else if (file.fieldname === "profilePicture") {
        filename = `profile_${username}${extension}`;
      } else {
        // Fallback for other document types
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        filename = `${file.fieldname}_${username}_${uniqueSuffix}${extension}`;
      }

      cb(null, filename);
    } catch (error) {
      console.error("❌ Error generating filename:", error);
      // Fallback to original naming if user lookup fails
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(
        null,
        `${file.fieldname}-${req.user.userId}-${uniqueSuffix}${path.extname(
          file.originalname
        )}`
      );
    }
  },
});

const fileFilter = (req, file, cb) => {
  // Accept documents and images
  const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase()
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

// JWT Secret - get it dynamically to ensure env vars are loaded
const getJWTSecret = () => {
  const secret =
    process.env.JWT_SECRET || "your-jwt-secret-key-change-this-in-production";
  return secret;
};

// Log JWT secret info
console.log(
  "🔍 JWT_SECRET loaded:",
  getJWTSecret().substring(0, 10) + "... (length:",
  getJWTSecret().length + ")"
);

// Enhanced authentication middleware
const authenticateToken = async (req, res, next) => {
  try {
    console.log(
      "🔍 Auth middleware - Headers:",
      req.headers.authorization ? "Token present" : "No token"
    );
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      console.log("❌ No token provided in request");
      return res.status(401).json({
        success: false,
        message: "Access token required",
        code: "TOKEN_REQUIRED",
      });
    }

    // Add more detailed token verification logging
    const JWT_SECRET = getJWTSecret();
    console.log(
      "🔍 Verifying token with JWT_SECRET length:",
      JWT_SECRET.length
    );
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("✅ Token decoded successfully:", {
      userId: decoded.id || decoded.userId,
      role: decoded.role,
      exp: new Date(decoded.exp * 1000),
    });

    console.log("🔍 Calling findUserByIdAndRole with:", {
      searchUserId: decoded.id || decoded.userId,
      searchRole: decoded.role,
    });
    // Find user with role validation
    const user = await findUserByIdAndRole(
      decoded.id || decoded.userId,
      decoded.role
    );

    if (!user) {
      console.log("❌ User not found for decoded token:", {
        userId: decoded.id || decoded.userId,
        role: decoded.role,
      });
      return res.status(404).json({
        success: false,
        message: "User not found",
        code: "USER_NOT_FOUND",
      });
    }

    console.log("✅ User authenticated successfully:", {
      userId: user._id,
      role: user.role,
      email: user.email,
    });
    req.user = user;
    req.userId = user._id;
    req.userRole = user.role;
    next();
  } catch (error) {
    console.error("❌ Auth middleware error:", error.message);

    // Check if it's a token expiry issue
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired",
        code: "TOKEN_EXPIRED",
        error: error.message,
      });
    }

    // Check if it's a malformed token
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token format",
        code: "INVALID_TOKEN_FORMAT",
        error: error.message,
      });
    }

    return res.status(403).json({
      success: false,
      message: "Invalid token",
      code: "INVALID_TOKEN",
      error: error.message,
    });
  }
};

// Validation rules for registration
const registerValidation = [
  body("firstName")
    .trim()
    .isLength({ min: 2 })
    .withMessage("First name must be at least 2 characters"),
  body("lastName")
    .trim()
    .isLength({ min: 2 })
    .withMessage("Last name must be at least 2 characters"),
  body("username")
    .optional()
    .trim()
    .isLength({ min: 3 })
    .withMessage("Username must be at least 3 characters if provided"),
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Valid email is required"),
  body("phone").isMobilePhone().withMessage("Valid phone number is required"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("role")
    .isIn(["applicant", "recruiter"])
    .withMessage("Role must be applicant or recruiter"),
];

// Role-based registration endpoint
router.post("/register", registerValidation, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    let {
      firstName,
      lastName,
      username,
      email,
      phone,
      password,
      role,
      ...additionalData
    } = req.body;

    console.log("🔍 ===== REGISTRATION REQUEST =====");
    console.log("🔍 Role:", role);
    console.log("🔍 Additional Data Keys:", Object.keys(additionalData));
    console.log("🔍 Additional Data:", JSON.stringify(additionalData, null, 2));
    console.log("🔍 =====================================");

    // Check if email is already taken for this role
    const emailAvailable = await checkFieldAvailability("email", email, role);
    if (!emailAvailable) {
      return res.status(409).json({
        success: false,
        message: `An ${role} account with this email already exists`,
      });
    }

    // Auto-generate username if not provided or validate if provided
    if (!username || username.trim() === "") {
      console.log(
        "🔄 Auto-generating username for:",
        firstName,
        lastName,
        "Role:",
        role
      );

      const usernameResult = await UsernameGenerator.generateUniqueUsername(
        firstName,
        lastName,
        {
          role: role,
          returnSuggestions: true,
        }
      );

      if (usernameResult.success) {
        username = usernameResult.username;
        console.log(
          "✅ Generated username:",
          username,
          "Pattern:",
          usernameResult.pattern
        );
      } else {
        return res.status(500).json({
          success: false,
          message: "Failed to generate username",
          error: usernameResult.error,
        });
      }
    } else {
      // Validate provided username
      const validation = UsernameGenerator.validateUsername(username);
      if (!validation.valid) {
        return res.status(400).json({
          success: false,
          message: "Invalid username format",
          errors: validation.errors,
        });
      }

      // Check if provided username is available
      const usernameAvailable = await checkFieldAvailability(
        "username",
        username
      );
      if (!usernameAvailable) {
        return res.status(409).json({
          success: false,
          message: "Username is already taken",
        });
      }
    }

    // Prepare user data based on role with proper field transformation
    const userData = {
      firstName,
      lastName,
      username,
      email,
      phone,
      password,
      role,
      ...additionalData,
    };

    console.log("🔍 ===== TRANSFORMED USER DATA =====");
    console.log("🔍 Final userData Keys:", Object.keys(userData));
    console.log("🔍 Final userData:", JSON.stringify(userData, null, 2));
    console.log("🔍 =====================================");

    // Create user with role-specific schema
    const user = await createUserByRole(userData);

    // Generate JWT token
    const JWT_SECRET = getJWTSecret();
    const token = jwt.sign(
      {
        id: user._id,
        userId: user.userId,
        role: user.role,
        email: user.email,
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(201).json({
      success: true,
      message: `${
        role.charAt(0).toUpperCase() + role.slice(1)
      } account created successfully`,
      data: {
        user: {
          id: user._id,
          userId: user.userId,
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
          email: user.email,
          phone: user.phone,
          role: user.role,
          fullName: user.fullName,
        },
        token,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({
      success: false,
      message: "Registration failed",
      error: error.message,
    });
  }
});

// Validation rules for login
const loginValidation = [
  body("identifier")
    .trim()
    .notEmpty()
    .withMessage("Email, username, or phone is required"),
  body("password").notEmpty().withMessage("Password is required"),
  body("role")
    .isIn(["applicant", "recruiter", "admin"])
    .withMessage("Role must be applicant, recruiter, or admin"),
];

// Role-based login endpoint
router.post("/login", loginValidation, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }

    const { identifier, password, role } = req.body;

    // Authenticate user with role validation
    const user = await authenticateUser(identifier, password, role);

    // Generate JWT token
    const JWT_SECRET = getJWTSecret();
    const token = jwt.sign(
      {
        id: user._id,
        userId: user._id, // Use _id for consistency across all user models
        role: user.role,
        email: user.email,
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Generate refresh token
    const refreshToken = jwt.sign(
      {
        id: user._id,
        userId: user._id, // Use _id for consistency
        role: user.role,
      },
      JWT_SECRET + "_refresh",
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      message: `${
        role.charAt(0).toUpperCase() + role.slice(1)
      } login successful`,
      data: {
        user: {
          id: user._id,
          userId: user.userId,
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
          email: user.email,
          phone: user.phone,
          role: user.role,
          fullName: user.fullName,
        },
        token,
        refreshToken,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    // Handle specific error messages
    if (
      error.message.includes("No ") ||
      error.message.includes("Invalid password")
    ) {
      return res.status(401).json({
        success: false,
        message: error.message,
      });
    }

    if (error.message.includes("locked")) {
      return res.status(423).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message,
    });
  }
});

// Logout user (client-side token invalidation)
router.post("/logout", (req, res) => {
  // Since JWT is stateless, logout is handled client-side by removing token
  res.json({ message: "Logout successful" });
});

// Token validation endpoint for debugging
router.get("/validate-token", authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: "Token is valid",
    data: {
      userId: req.user._id,
      role: req.user.role,
      email: req.user.email,
      tokenValid: true,
    },
  });
});

// Forgot password
router.post(
  "/forgot-password",
  [
    body("email")
      .isEmail()
      .normalizeEmail()
      .withMessage("Please provide a valid email address"),
  ],
  async (req, res) => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { email } = req.body;
      console.log(`🔍 Password reset requested for email: ${email}`);

      // Find user by email (works with discriminator pattern)
      const user = await BaseUser.findOne({ email: email.toLowerCase() });

      if (!user) {
        // For security, don't reveal if email exists or not
        return res.json({
          success: true,
          message:
            "If an account with that email exists, we have sent a password reset link.",
        });
      }

      // Generate secure reset token
      const resetToken = crypto.randomBytes(32).toString("hex");

      // Create password reset record
      const PasswordReset = (await import("../models/PasswordReset.js"))
        .default;

      // Remove any existing reset tokens for this user
      await PasswordReset.deleteMany({ userId: user._id });

      // Create new reset token
      await PasswordReset.create({
        userId: user._id,
        email: user.email,
        token: resetToken,
        expiresAt: new Date(Date.now() + 3600000), // 1 hour
      });

      console.log(
        `🔍 Reset token created: ${resetToken.substring(0, 8)}... for user ${
          user.email
        }`
      );

      // Send password reset email using EmailService
      try {
        const emailService = (await import("../services/emailService.js"))
          .default;

        await emailService.sendPasswordResetEmail(
          user.email,
          `${user.firstName} ${user.lastName}`,
          resetToken
        );

        console.log(`✅ Password reset email sent to ${user.email}`);
      } catch (emailError) {
        console.error("❌ Failed to send password reset email:", emailError);
        // Don't fail the request if email fails, just log it
      }

      res.json({
        success: true,
        message:
          "If an account with that email exists, we have sent a password reset link.",
      });
    } catch (error) {
      console.error("❌ Forgot password error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to process password reset request",
      });
    }
  }
);

// Reset password
router.post(
  "/reset-password",
  [
    body("token").notEmpty().withMessage("Reset token is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long"),
  ],
  async (req, res) => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { token, password } = req.body;
      console.log(
        `🔍 Password reset attempt with token: ${token.substring(0, 8)}...`
      );

      // Find password reset record
      const PasswordReset = (await import("../models/PasswordReset.js"))
        .default;
      const resetRecord = await PasswordReset.findOne({
        token: token,
        used: false,
        expiresAt: { $gt: new Date() },
      });

      if (!resetRecord) {
        return res.status(400).json({
          success: false,
          message: "Invalid or expired reset token",
        });
      }

      // Find the user
      const user = await BaseUser.findById(resetRecord.userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Hash new password and update user
      const hashedPassword = await bcrypt.hash(password, 12);

      // Update only the password field to avoid validation issues with other fields
      await BaseUser.findByIdAndUpdate(
        user._id,
        {
          password: hashedPassword,
        },
        {
          validateBeforeSave: false,
          runValidators: false,
        }
      );

      // Mark reset token as used
      resetRecord.used = true;
      await resetRecord.save();

      console.log(`✅ Password reset successful for user: ${user.email}`);

      res.json({
        success: true,
        message:
          "Password reset successful. You can now login with your new password.",
      });
    } catch (error) {
      console.error("❌ Password reset error:", error);
      res.status(500).json({
        success: false,
        message: "Password reset failed",
      });
    }
  }
);

// Test endpoint to generate a reset link (for development only)
router.get("/test-reset-link/:email", async (req, res) => {
  try {
    const { email } = req.params;

    // Find user
    const user = await BaseUser.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Delete any existing reset tokens for this user
    const PasswordReset = (await import("../models/PasswordReset.js")).default;
    await PasswordReset.deleteMany({ userId: user._id });

    // Create new reset token
    await PasswordReset.create({
      userId: user._id,
      email: user.email,
      token: resetToken,
      expiresAt: new Date(Date.now() + 3600000), // 1 hour
    });

    const resetLink = `${
      process.env.FRONTEND_URL || "http://192.168.41.134:3000"
    }/reset-password?token=${resetToken}`;

    res.json({
      success: true,
      message: "Test reset link generated",
      resetLink: resetLink,
      token: resetToken,
    });
  } catch (error) {
    console.error("❌ Test reset link error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate test reset link",
    });
  }
});

// Verify email
router.get("/verify-email/:token", async (req, res) => {
  try {
    const { token } = req.params;
    // Implement email verification logic here
    res.json({ message: "Email verified" });
  } catch (error) {
    res.status(500).json({ message: "Verification failed" });
  }
});

// Refresh token
router.post("/refresh-token", async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken)
      return res.status(401).json({ message: "No refresh token" });

    jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, user) => {
      if (err)
        return res.status(403).json({ message: "Invalid refresh token" });

      const accessToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
        expiresIn: "1h",
      });
      res.json({ token: accessToken });
    });
  } catch (error) {
    res.status(500).json({ message: "Token refresh failed" });
  }
});

// Get user profile with role-specific data
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    // req.user is already populated by the authenticateToken middleware
    // This 'user' object is directly from the database (BaseUser.findOne or findUserByIdAndRole)
    const userDoc = req.user;

    // Explicitly construct the response object to include all expected frontend fields,
    // handling both canonical and compatibility field names.
    const userProfile = {
      id: userDoc._id,
      userId: userDoc.userId,
      firstName: userDoc.firstName,
      lastName: userDoc.lastName,
      email: userDoc.email,
      phone: userDoc.phone,
      role: userDoc.role,
      username: userDoc.username,
      bio: userDoc.bio,
      profileImage: userDoc.profileImage,
      createdAt: userDoc.createdAt,
      updatedAt: userDoc.updatedAt,
      lastLogin: userDoc.lastLogin,
      lastActivity: userDoc.lastActivity,

      // Handle fullName/full_name
      fullName: userDoc.fullName || `${userDoc.firstName} ${userDoc.lastName}`.trim(),
      full_name: userDoc.fullName || `${userDoc.firstName} ${userDoc.lastName}`.trim(), // Compatibility field

      // Handle location/city/currentLocation
      city: userDoc.currentLocation?.city || userDoc.city || userDoc.location || '',
      location: userDoc.currentLocation?.city || userDoc.city || userDoc.location || '', // Compatibility field
      current_location: userDoc.currentLocation?.city || userDoc.city || userDoc.location || '', // Compatibility field

      // Handle experience
      yearsOfExperience: userDoc.yearsOfExperience || userDoc.experience_years || 0,
      experience_years: userDoc.yearsOfExperience || userDoc.experience_years || 0, // Compatibility field

      // Handle qualification/highestEducation
      qualification: userDoc.highestEducation || userDoc.qualification || userDoc.education?.[0]?.degree || '', // Compatibility field
      highestEducation: userDoc.highestEducation || userDoc.qualification || userDoc.education?.[0]?.degree || '',

      // Handle company_name/careerInfo.currentCompany (for applicant)
      company_name: userDoc.role === 'applicant' ? (userDoc.careerInfo?.currentCompany || userDoc.company_name || '') : '', // Compatibility field
      currentCompany: userDoc.role === 'applicant' ? (userDoc.careerInfo?.currentCompany || userDoc.company_name || '') : '',

      // Handle position/careerInfo.currentJobTitle (for applicant)
      position: userDoc.role === 'applicant' ? (userDoc.careerInfo?.currentJobTitle || userDoc.position || '') : '', // Compatibility field
      currentJobTitle: userDoc.role === 'applicant' ? (userDoc.careerInfo?.currentJobTitle || userDoc.position || '') : '',

      // Handle skills (now a direct array)
      skills: Array.isArray(userDoc.skills) ? userDoc.skills : [], // Should be an array now
      
      // Handle social links (top-level and nested)
      linkedin_url: userDoc.socialLinks?.linkedinUrl || userDoc.linkedin_url || '', // Compatibility field
      github_url: userDoc.socialLinks?.githubUrl || userDoc.github_url || '', // Compatibility field
      portfolio_url: userDoc.socialLinks?.portfolioUrl || userDoc.portfolio_url || '', // Compatibility field
      socialLinks: userDoc.socialLinks || {},

      // Handle education and workExperience (should already be arrays)
      education: userDoc.education || [],
      workExperience: userDoc.workExperience || [],

      // Other specific applicant/recruiter fields (if any and not already covered)
      ...(userDoc.role === 'recruiter' && {
        companyName: userDoc.companyInfo?.companyName || userDoc.companyName || '',
        department: userDoc.companyInfo?.department || userDoc.department || '',
        job_title: userDoc.companyInfo?.jobTitle || userDoc.companyInfo?.designation || userDoc.job_title || '',
      }),
    };

    res.json({
      success: true,
      data: userProfile,
    });
  } catch (error) {
    console.error("Profile fetch error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch profile",
      error: error.message,
    });
  }
});



router.put(
  "/profile",
  authenticateToken,
  upload.fields([
    { name: "resume", maxCount: 1 },
    { name: "coverLetter", maxCount: 1 },
    { name: "portfolio", maxCount: 1 },
    { name: "profilePicture", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      console.log("--- START PUT /profile REQUEST ---");
      console.log(
        "🔍 Request body BEFORE multer processing (might be empty for multipart/form-data):",
        req.body
      );
      console.log("🔍 req.user from authenticateToken:", {
        userId: req.user.userId || req.user._id,
        role: req.user.role,
      });

      const userId = req.user.userId || req.user._id;
      const userRole = req.user.role;
      let updateData = { ...req.body }; // Make a mutable copy of req.body

      console.log("🔍 Request body AFTER multer processing:", updateData);
      console.log("🔍 Files received by multer:", req.files);

      // Handle file uploads
      if (req.files) {
        console.log("🔍 Processing uploaded files...");
        try {
          // Process resume file
          if (req.files.resume && req.files.resume[0]) {
            const resumeFile = req.files.resume[0];
            updateData.resume_url = `/uploads/documents/${resumeFile.filename}`;
            console.log("📄 Resume uploaded:", updateData.resume_url);
          }
          // Process cover letter file
          if (req.files.coverLetter && req.files.coverLetter[0]) {
            const coverLetterFile = req.files.coverLetter[0];
            updateData.cover_letter_url = `/uploads/documents/${coverLetterFile.filename}`;
            console.log(
              "📄 Cover letter uploaded:",
              updateData.cover_letter_url
            );
          }
          // Process portfolio file
          if (req.files.portfolio && req.files.portfolio[0]) {
            const portfolioFile = req.files.portfolio[0];
            updateData.portfolio_url = `/uploads/documents/${portfolioFile.filename}`;
            console.log("📄 Portfolio uploaded:", updateData.portfolio_url);
          }
          // Process profile picture
          if (req.files.profilePicture && req.files.profilePicture[0]) {
            const profilePictureFile = req.files.profilePicture[0];
            updateData.profileImage = `/uploads/documents/${profilePictureFile.filename}`;
            console.log(
              "🖼️ Profile picture uploaded:",
              updateData.profileImage
            );
          }
        } catch (fileError) {
          console.error(
            "❌ Error during file processing in PUT /profile:",
            fileError
          );
          // Add more details for debugging
          console.error("❌ Multer file error details:", {
            files: req.files,
            fileErrorStack: fileError.stack,
            fileErrorName: fileError.name,
            fileErrorCode: fileError.code,
          });
          return res.status(500).json({
            success: false,
            message: "Failed to process uploaded files",
            error: fileError.message,
            details:
              process.env.NODE_ENV === "development"
                ? fileError.stack
                : undefined,
          });
        }
      }

      // Remove sensitive fields that shouldn't be updated via this endpoint
      delete updateData.password;
      delete updateData.email;
      delete updateData._id;
      delete updateData.role;
      delete updateData.userId;

      console.log("🔍 Calling updateUserProfile with:", {
        userId,
        updateData: JSON.stringify(updateData, null, 2),
        userRole,
      });

      let updatedUser;
      try {
        updatedUser = await updateUserProfile(userId, updateData, userRole);
      } catch (dbError) {
        console.error("❌ Error during updateUserProfile DB update:", dbError);
        console.error("❌ DB error details:", {
          dbErrorStack: dbError.stack,
          dbErrorName: dbError.name,
          dbErrorCode: dbError.code,
          updateData,
        });
        return res.status(500).json({
          success: false,
          message: "Failed to update user profile in database",
          error: dbError.message,
          details:
            process.env.NODE_ENV === "development" ? dbError.stack : undefined,
        });
      }

      console.log("✅ Profile update successful!");
      console.log("✅ Updated user keys:", Object.keys(updatedUser));
      console.log("--- END PUT /profile REQUEST ---");

      res.json({
        success: true,
        message: "Profile updated successfully",
        data: updatedUser,
      });
    } catch (error) {
      console.error("❌ Profile update route handler error:", error);
      console.error("❌ Error stack:", error.stack);
      console.error("❌ Error details:", {
        message: error.message,
        name: error.name,
        code: error.code,
      });
      res.status(500).json({
        success: false,
        message: "Failed to update profile",
        error: error.message,
        details:
          process.env.NODE_ENV === "development" ? error.stack : undefined,
      });
    }
  }
);
// Check field availability endpoint
router.post("/check-availability", async (req, res) => {
  try {
    const { field, value, role } = req.body;

    if (!["email", "username", "phone"].includes(field)) {
      return res.status(400).json({
        success: false,
        message: "Invalid field. Must be email, username, or phone",
      });
    }

    const available = await checkFieldAvailability(field, value, role);

    res.json({
      success: true,
      available,
      message: available
        ? `${field} is available`
        : `${field} is already taken`,
    });
  } catch (error) {
    console.error("Availability check error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to check availability",
      error: error.message,
    });
  }
});

// Generate username suggestions endpoint
router.post("/generate-username", async (req, res) => {
  try {
    const { firstName, lastName, role = "applicant" } = req.body;

    if (!firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: "First name and last name are required",
      });
    }

    const result = await UsernameGenerator.generateUniqueUsername(
      firstName,
      lastName,
      {
        role: role,
        returnSuggestions: true,
      }
    );

    if (result.success) {
      res.json({
        success: true,
        data: {
          recommended: result.username,
          pattern: result.pattern,
          method: result.method,
          suggestions: result.suggestions || [],
          message: `Generated username using ${result.pattern} pattern`,
        },
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to generate username suggestions",
        error: result.error,
      });
    }
  } catch (error) {
    console.error("Username generation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate username suggestions",
      error: error.message,
    });
  }
});

// Validate username format endpoint
router.post("/validate-username", async (req, res) => {
  try {
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({
        success: false,
        message: "Username is required",
      });
    }

    const validation = UsernameGenerator.validateUsername(username);
    const available = validation.valid
      ? await checkFieldAvailability("username", username)
      : false;

    res.json({
      success: true,
      data: {
        valid: validation.valid,
        available: available,
        errors: validation.errors,
        message: validation.valid
          ? available
            ? "Username is valid and available"
            : "Username is valid but already taken"
          : "Username format is invalid",
      },
    });
  } catch (error) {
    console.error("Username validation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to validate username",
      error: error.message,
    });
  }
});

// Email OTP endpoint
router.post("/send-otp-email", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP in Redis with 5-minute expiry
    await redisClient.set(`otp:${email}`, otp, "EX", 300);

    // Check if email configuration is available and valid
    const hasEmailConfig =
      (process.env.SMTP_USER || process.env.EMAIL_USER) &&
      (process.env.SMTP_PASS || process.env.EMAIL_PASS);

    if (!hasEmailConfig) {
      // For development, log the OTP instead of sending email
      console.log(
        `📧 Email OTP for ${email}: ${otp} (Email not configured - check console)`
      );

      res.json({
        success: true,
        message: "OTP sent successfully to your email",
        data: {
          email: email,
          expiresIn: 300, // 5 minutes in seconds
          // In development mode, include OTP for testing
          ...(process.env.NODE_ENV === "development" && {
            otp: otp,
            note: "Email not configured - OTP shown for development",
          }),
        },
      });
      return;
    }

    // Try to send email, but fall back to console logging if it fails
    try {
      // Configure email transporter only if credentials are available
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === "true" || false,
        auth: {
          user: process.env.SMTP_USER || process.env.EMAIL_USER,
          pass: process.env.SMTP_PASS || process.env.EMAIL_PASS,
        },
      });

      // Send OTP email
      const mailOptions = {
        from: `"FinAutoJobs" <${
          process.env.FROM_EMAIL ||
          process.env.SMTP_USER ||
          process.env.EMAIL_USER
        }>`,
        to: email,
        subject: "Your FinAutoJobs Verification Code",
        html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #2196F3; color: white; padding: 20px; text-align: center;">
            <h1>Email Verification</h1>
          </div>
          <div style="padding: 20px; background: #f9f9f9;">
            <h2>Your Verification Code</h2>
            <p>Use the following code to verify your email address:</p>
            <div style="background: white; padding: 20px; text-align: center; margin: 20px 0; border-radius: 6px;">
              <h1 style="color: #2196F3; font-size: 32px; letter-spacing: 8px; margin: 0;">${otp}</h1>
            </div>
            <p><strong>This code will expire in 5 minutes.</strong></p>
            <p>If you didn't request this code, please ignore this email.</p>
          </div>
          <div style="padding: 20px; text-align: center; color: #666;">
            <p>&copy; 2024 FinAutoJobs. All rights reserved.</p>
          </div>
        </div>
      `,
      };

      // Add timeout to email sending to prevent hanging
      await Promise.race([
        transporter.sendMail(mailOptions),
        new Promise(
          (_, reject) =>
            setTimeout(() => reject(new Error("Connection timeout")), 10000) // 10 second timeout
        ),
      ]);

      console.log(`✅ Email OTP sent to ${email}: ${otp}`);

      res.json({
        success: true,
        message: "OTP sent successfully to your email",
        data: {
          email: email,
          expiresIn: 300, // 5 minutes in seconds
        },
      });
    } catch (emailError) {
      // If email sending fails, fall back to console logging
      console.warn(
        "⚠️ Email sending failed, falling back to console logging:",
        emailError.message
      );
      console.log(
        `📧 Email OTP for ${email}: ${otp} (Email sending failed - check console)`
      );

      res.json({
        success: true,
        message: "OTP sent successfully to your email",
        data: {
          email: email,
          expiresIn: 300, // 5 minutes in seconds
          // In development mode, include OTP for testing when email fails
          ...(process.env.NODE_ENV === "development" && {
            otp: otp,
            note: "Email sending failed - OTP shown for development",
          }),
        },
      });
    }
  } catch (error) {
    console.error("❌ Email OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send email OTP",
      error: error.message,
    });
  }
});

// SMS OTP endpoint
router.post("/send-otp-sms", async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        success: false,
        message: "Phone number is required",
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP in Redis with 5-minute expiry
    await redisClient.set(`otp:${phone}`, otp, "EX", 300);

    // For development, we'll just log the OTP instead of sending SMS
    // In production, integrate with SMS service like Twilio, AWS SNS, etc.
    console.log(`📱 SMS OTP for ${phone}: ${otp}`);

    // Simulate SMS sending delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    res.json({
      success: true,
      message: "OTP sent successfully to your phone",
      data: {
        phone: phone,
        expiresIn: 300, // 5 minutes in seconds
        // In development, include OTP for testing
        ...(process.env.NODE_ENV === "development" && { otp: otp }),
      },
    });
  } catch (error) {
    console.error("❌ SMS OTP error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send SMS OTP",
      error: error.message,
    });
  }
});

// Verify OTP endpoint
router.post("/verify-otp", async (req, res) => {
  try {
    const { identifier, otp } = req.body; // identifier can be email or phone

    if (!identifier || !otp) {
      return res.status(400).json({
        success: false,
        message: "Identifier and OTP are required",
      });
    }

    const storedOtp = await redisClient.get(`otp:${identifier}`);

    if (!storedOtp) {
      return res.status(400).json({
        success: false,
        message: "OTP not found or expired. Please request a new one.",
      });
    }

    // Check if OTP matches
    if (storedOtp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP. Please try again.",
      });
    }

    // OTP is valid, remove it from store
    await redisClient.del(`otp:${identifier}`);

    console.log(`✅ OTP verified successfully for ${identifier}`);

    res.json({
      success: true,
      message: "OTP verified successfully",
      data: {
        identifier: identifier,
        verified: true,
      },
    });
  } catch (error) {
    console.error("❌ OTP verification error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to verify OTP",
      error: error.message,
    });
  }
});

// Change password endpoint (temporarily without auth for testing)
router.put(
  "/change-password-test",
  [
    body("currentPassword")
      .notEmpty()
      .withMessage("Current password is required"),
    body("newPassword")
      .isLength({ min: 6 })
      .withMessage("New password must be at least 6 characters long"),
    body("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error("Password confirmation does not match");
      }
      return true;
    }),
  ],
  async (req, res) => {
    try {
      console.log("🔍 Test change password endpoint hit (no auth)");
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log("❌ Validation errors:", errors.array());
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { currentPassword, newPassword } = req.body;

      // Extract user ID from JWT token (even though we're bypassing full auth)
      let userId;
      try {
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1];
        if (token) {
          const decoded = jwt.verify(token, JWT_SECRET);
          userId = decoded.userId || decoded.id;
          console.log("🔍 Extracted user ID from token:", userId);
        } else {
          // Fallback to hardcoded ID if no token (for testing)
          userId = "68dd0ee2c795122ec2e79479";
          console.log("🔍 Using fallback user ID (no token provided)");
        }
      } catch (error) {
        // Fallback to hardcoded ID if token is invalid
        userId = "68dd0ee2c795122ec2e79479";
        console.log("🔍 Using fallback user ID (invalid token)");
      }

      // Find user and verify current password
      const user = await BaseUser.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(
        currentPassword,
        user.password
      );
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          success: false,
          message: "Current password is incorrect",
        });
      }

      // Hash new password
      const saltRounds = 12;
      const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update password
      await BaseUser.findByIdAndUpdate(
        userId,
        {
          password: hashedNewPassword,
          updatedAt: new Date(),
        },
        {
          validateBeforeSave: false,
          runValidators: false,
        }
      );

      console.log(
        `✅ Password updated successfully for user: ${userId} (TEST MODE)`
      );

      res.status(200).json({
        success: true,
        message: "Password updated successfully (TEST MODE)",
      });
    } catch (error) {
      console.error("❌ Error changing password (TEST):", error);
      res.status(500).json({
        success: false,
        message: "Failed to change password",
      });
    }
  }
);

// Change password endpoint
router.put(
  "/change-password",
  [
    authenticateToken,
    body("currentPassword")
      .notEmpty()
      .withMessage("Current password is required"),
    body("newPassword")
      .isLength({ min: 6 })
      .withMessage("New password must be at least 6 characters long"),
    body("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error("Password confirmation does not match");
      }
      return true;
    }),
  ],
  async (req, res) => {
    try {
      console.log("🔍 Change password endpoint hit with body:", req.body);
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log("❌ Validation errors:", errors.array());
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { currentPassword, newPassword } = req.body;
      const userId = req.user.userId || req.user._id;

      // Find user and verify current password
      const user = await BaseUser.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(
        currentPassword,
        user.password
      );
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          success: false,
          message: "Current password is incorrect",
        });
      }

      // Hash new password
      const saltRounds = 12;
      const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update password
      await BaseUser.findByIdAndUpdate(userId, {
        password: hashedNewPassword,
        updatedAt: new Date(),
      });

      console.log(`✅ Password updated successfully for user: ${userId}`);

      const response = {
        success: true,
        message: "Password updated successfully",
      };
      console.log("🔍 Sending response:", response);
      res.status(200).json(response);
    } catch (error) {
      console.error("❌ Error changing password:", error);
      res.status(500).json({
        success: false,
        message: "Failed to change password",
      });
    }
  }
);

// Change username endpoint (test version without auth)
router.put(
  "/change-username-test",
  [
    body("newUsername")
      .isLength({ min: 3, max: 30 })
      .withMessage("Username must be between 3 and 30 characters")
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage(
        "Username can only contain letters, numbers, and underscores"
      ),
    body("password")
      .notEmpty()
      .withMessage("Password is required for username change"),
  ],
  async (req, res) => {
    try {
      console.log("🔍 Test change username endpoint hit (no auth)");
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log("❌ Validation errors:", errors.array());
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { newUsername, password } = req.body;

      // Extract user ID from JWT token (even though we're bypassing full auth)
      let userId;
      try {
        const authHeader = req.headers["authorization"];
        const token = authHeader && authHeader.split(" ")[1];
        if (token) {
          const decoded = jwt.verify(token, JWT_SECRET);
          userId = decoded.userId || decoded.id;
          console.log("🔍 Extracted user ID from token:", userId);
        } else {
          // Fallback to hardcoded ID if no token (for testing)
          userId = "68dd0ee2c795122ec2e79479";
          console.log("🔍 Using fallback user ID (no token provided)");
        }
      } catch (error) {
        // Fallback to hardcoded ID if token is invalid
        userId = "68dd0ee2c795122ec2e79479";
        console.log("🔍 Using fallback user ID (invalid token)");
      }

      // Find user and verify password
      const user = await BaseUser.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({
          success: false,
          message: "Password is incorrect",
        });
      }

      // Check if username is already taken
      const existingUser = await BaseUser.findOne({
        username: newUsername.toLowerCase(),
        _id: { $ne: userId }, // Exclude current user
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Username is already taken",
        });
      }

      // Update username
      await BaseUser.findByIdAndUpdate(
        userId,
        {
          username: newUsername.toLowerCase(),
          updatedAt: new Date(),
        },
        {
          validateBeforeSave: false,
          runValidators: false,
        }
      );

      console.log(
        `✅ Username updated successfully for user: ${userId} to: ${newUsername} (TEST MODE)`
      );

      res.json({
        success: true,
        message: "Username updated successfully (TEST MODE)",
        data: {
          username: newUsername.toLowerCase(),
        },
      });
    } catch (error) {
      console.error("❌ Error changing username (TEST):", error);
      res.status(500).json({
        success: false,
        message: "Failed to change username",
      });
    }
  }
);

// Change username endpoint
router.put(
  "/change-username",
  [
    authenticateToken,
    body("newUsername")
      .isLength({ min: 3, max: 30 })
      .withMessage("Username must be between 3 and 30 characters")
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage(
        "Username can only contain letters, numbers, and underscores"
      ),
    body("password")
      .notEmpty()
      .withMessage("Password is required for username change"),
  ],
  async (req, res) => {
    try {
      console.log("🔍 Change username endpoint hit with body:", req.body);
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { newUsername, password } = req.body;
      const userId = req.user.userId || req.user._id;

      // Find user and verify password
      const user = await BaseUser.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({
          success: false,
          message: "Password is incorrect",
        });
      }

      // Check if username is already taken
      const existingUser = await BaseUser.findOne({
        username: newUsername.toLowerCase(),
        _id: { $ne: userId }, // Exclude current user
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Username is already taken",
        });
      }

      // Update username
      await BaseUser.findByIdAndUpdate(userId, {
        username: newUsername.toLowerCase(),
        updatedAt: new Date(),
      });

      console.log(
        `✅ Username updated successfully for user: ${userId} to: ${newUsername}`
      );

      res.json({
        success: true,
        message: "Username updated successfully",
        data: {
          username: newUsername.toLowerCase(),
        },
      });
    } catch (error) {
      console.error("❌ Error changing username:", error);
      res.status(500).json({
        success: false,
        message: "Failed to change username",
      });
    }
  }
);

// Test endpoint to verify routes are working
router.get("/test-routes", (req, res) => {
  console.log("🔍 Test routes endpoint hit");
  res.json({
    success: true,
    message: "Auth routes are working",
    availableRoutes: [
      "GET /test-routes",
      "PUT /change-password",
      "PUT /change-username",
      "GET /profile",
      "PUT /profile",
    ],
  });
});

// Test endpoint for frontend connectivity (no auth required)
router.post("/test-frontend", (req, res) => {
  console.log("🔍 Frontend test endpoint hit with body:", req.body);
  res.status(200).json({
    success: true,
    message: "Frontend can reach backend successfully",
    receivedData: req.body,
    timestamp: new Date().toISOString(),
  });
});

// Test PUT endpoint (no auth required)
router.put("/test-put", (req, res) => {
  console.log("🔍 PUT test endpoint hit with body:", req.body);
  res.status(200).json({
    success: true,
    message: "PUT request successful",
    receivedData: req.body,
    timestamp: new Date().toISOString(),
  });
});

// Import SMS OTP functions for backward compatibility
import {
  generateAndSendSMSOTP,
  verifySMSOTP,
  sendOTPViaPreferredMethod,
  verifyOTPAnyMethod,
} from "../services/smsOtpService.js";

// Send OTP endpoint (backward compatibility)
router.post(
  "/send-otp",
  [
    body("phoneNumber")
      .optional()
      .matches(/^(\+91|91)?[6-9]\d{9}$/)
      .withMessage("Please provide a valid Indian mobile number"),
    body("email")
      .optional()
      .isEmail()
      .withMessage("Please provide a valid email address"),
    body("method")
      .optional()
      .isIn(["sms", "email"])
      .withMessage('Method must be either "sms" or "email"'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { phoneNumber, email, method = "sms" } = req.body;
      const contact = phoneNumber || email;

      if (!contact) {
        return res.status(400).json({
          success: false,
          message: "Either phoneNumber or email is required",
        });
      }

      const result = await sendOTPViaPreferredMethod(
        contact,
        method,
        "verification"
      );

      res.json({
        success: true,
        message: result.message,
        data: {
          method: method,
          expiresIn: result.expiresIn,
          mock: result.mock || false,
        },
      });
    } catch (error) {
      console.error("❌ Send OTP error:", error.message);
      res.status(500).json({
        success: false,
        message: "Failed to send OTP",
        error: error.message,
      });
    }
  }
);

// Verify OTP endpoint (backward compatibility)
router.post(
  "/verify-otp",
  [
    body("phoneNumber")
      .optional()
      .matches(/^(\+91|91)?[6-9]\d{9}$/)
      .withMessage("Please provide a valid Indian mobile number"),
    body("email")
      .optional()
      .isEmail()
      .withMessage("Please provide a valid email address"),
    body("otp")
      .isLength({ min: 6, max: 6 })
      .isNumeric()
      .withMessage("OTP must be a 6-digit number"),
    body("method")
      .optional()
      .isIn(["sms", "email"])
      .withMessage('Method must be either "sms" or "email"'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: errors.array(),
        });
      }

      const { phoneNumber, email, otp, method = "sms" } = req.body;
      const contact = phoneNumber || email;

      if (!contact) {
        return res.status(400).json({
          success: false,
          message: "Either phoneNumber or email is required",
        });
      }

      const result = verifyOTPAnyMethod(contact, otp, method, "verification");

      if (result.success) {
        res.json({
          success: true,
          message: result.message,
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.message,
          attemptsLeft: result.attemptsLeft,
        });
      }
    } catch (error) {
      console.error("❌ Verify OTP error:", error.message);
      res.status(500).json({
        success: false,
        message: "Failed to verify OTP",
        error: error.message,
      });
    }
  }
);

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File too large. Maximum size is 10MB.",
      });
    }
    if (error.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        success: false,
        message: "Too many files uploaded.",
      });
    }
  }

  if (error.message === "Only documents and images are allowed") {
    return res.status(400).json({
      success: false,
      message: "Only documents and images are allowed",
    });
  }

  next(error);
});

export default router;
