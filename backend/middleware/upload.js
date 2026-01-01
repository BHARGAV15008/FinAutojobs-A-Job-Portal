import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create uploads directory if it doesn't exist - use project root
const projectRoot = path.join(__dirname, "..");
const uploadsDir = path.join(projectRoot, "uploads");
const profileImagesDir = path.join(projectRoot, "uploads", "profiles");
const documentsDir = path.join(projectRoot, "uploads", "documents");
const resumesDir = path.join(projectRoot, "uploads", "resumes");

[uploadsDir, profileImagesDir, documentsDir, resumesDir].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = uploadsDir;

    if (file.fieldname === "profileImage") {
      uploadPath = profileImagesDir;
    } else if (file.fieldname === "resume") {
      uploadPath = resumesDir;
    } else if (file.fieldname === "documents") {
      uploadPath = documentsDir;
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, extension);
    cb(null, `${baseName}-${uniqueSuffix}${extension}`);
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  if (file.fieldname === "profileImage") {
    // Allow only image files
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed for profile pictures"), false);
    }
  } else if (file.fieldname === "resume") {
    // Allow PDF and DOC files
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF and DOC files are allowed for resumes"), false);
    }
  } else {
    cb(null, true);
  }
};

// Multer configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 5, // Maximum 5 files
  },
});

// Upload configurations for different scenarios
export const uploadProfileImage = upload.single("profileImage");
export const uploadResume = upload.single("resume");
export const uploadMultipleDocuments = upload.array("documents", 5);
export const uploadProfileData = upload.fields([
  { name: "profileImage", maxCount: 1 },
  { name: "resume", maxCount: 1 },
  { name: "documents", maxCount: 5 },
]);

// Helper function to get file URL
export const getFileUrl = (filename, type = "profiles") => {
  const baseUrl =
    process.env.BASE_URL ||
    "https://finautojobs-a-job-portal-hk5c.onrender.com";
  return `${baseUrl}/uploads/${type}/${filename}`;
};

// Helper function to delete file
export const deleteFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
  } catch (error) {
    console.error("Error deleting file:", error);
  }
  return false;
};

export default upload;
