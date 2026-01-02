import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";
import path from "path";

class S3Service {
  constructor() {
    // Initialize S3 client
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION || "us-east-1",
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });

    this.bucketName = process.env.AWS_S3_BUCKET_NAME;
    this.cloudFrontUrl = process.env.AWS_CLOUDFRONT_URL; // Optional CDN

    if (!this.bucketName) {
      console.warn(
        "⚠️ AWS_S3_BUCKET_NAME not configured. File uploads will fail."
      );
    }
  }

  /**
   * Generate unique filename with user info
   * Format: {name/username/fullname}_{type}.{ext}
   * @param {string} originalName - Original filename
   * @param {string} userId - User ID
   * @param {string} type - File type (resume, profile, etc.)
   * @param {Object} userInfo - User information (name, username, fullname)
   */
  generateFileName(originalName, userId, type, userInfo = {}) {
    const ext = path.extname(originalName).toLowerCase();

    // Use fullname, then name, then username, fallback to userId
    const userName = (
      userInfo.fullname ||
      userInfo.name ||
      userInfo.username ||
      userId
    )
      .toString()
      .replace(/[^a-zA-Z0-9]/g, "_")
      .toLowerCase()
      .substring(0, 50);

    // Add timestamp to avoid overwriting if same user uploads multiple times
    const timestamp = Date.now();
    const fileName = `${userName}_${type}_${timestamp}${ext}`;

    return `${type}/${userId}/${fileName}`;
  }

  /**
   * Upload file to S3
   * @param {Buffer} fileBuffer - File buffer
   * @param {string} originalName - Original filename
   * @param {string} mimeType - File MIME type
   * @param {string} userId - User ID
   * @param {string} type - File type (resume, profile, document, etc.)
   * @param {Object} userInfo - User information {name, username, fullname}
   * @returns {Promise<{url: string, key: string, fileName: string}>}
   */
  async uploadFile(
    fileBuffer,
    originalName,
    mimeType,
    userId,
    type = "documents",
    userInfo = {}
  ) {
    try {
      if (!this.bucketName) {
        throw new Error("AWS S3 bucket not configured");
      }

      const fileName = this.generateFileName(
        originalName,
        userId,
        type,
        userInfo
      );

      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: fileName,
        Body: fileBuffer,
        ContentType: mimeType,
        Metadata: {
          originalName: originalName,
          userId: userId,
          uploadDate: new Date().toISOString(),
        },
        // Make files private by default
        ACL: "private",
      });

      await this.s3Client.send(command);

      // Generate URL
      const url = this.cloudFrontUrl
        ? `${this.cloudFrontUrl}/${fileName}`
        : `https://${this.bucketName}.s3.${
            process.env.AWS_REGION || "us-east-1"
          }.amazonaws.com/${fileName}`;

      console.log(`✅ File uploaded to S3: ${fileName}`);

      return {
        url,
        key: fileName,
        bucket: this.bucketName,
      };
    } catch (error) {
      console.error("❌ S3 upload error:", error);
      throw new Error(`Failed to upload file to S3: ${error.message}`);
    }
  }

  /**
   * Delete file from S3
   * @param {string} key - S3 object key
   */
  async deleteFile(key) {
    try {
      if (!this.bucketName) {
        throw new Error("AWS S3 bucket not configured");
      }

      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
      console.log(`✅ File deleted from S3: ${key}`);

      return true;
    } catch (error) {
      console.error("❌ S3 delete error:", error);
      throw new Error(`Failed to delete file from S3: ${error.message}`);
    }
  }

  /**
   * Generate presigned URL for temporary access
   * @param {string} key - S3 object key
   * @param {number} expiresIn - Expiration time in seconds (default: 1 hour)
   */
  async getSignedUrl(key, expiresIn = 3600) {
    try {
      if (!this.bucketName) {
        throw new Error("AWS S3 bucket not configured");
      }

      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const signedUrl = await getSignedUrl(this.s3Client, command, {
        expiresIn,
      });

      return signedUrl;
    } catch (error) {
      console.error("❌ S3 signed URL error:", error);
      throw new Error(`Failed to generate signed URL: ${error.message}`);
    }
  }

  /**
   * Check if file exists in S3
   * @param {string} key - S3 object key
   */
  async fileExists(key) {
    try {
      if (!this.bucketName) {
        return false;
      }

      const command = new HeadObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(command);
      return true;
    } catch (error) {
      if (error.name === "NotFound") {
        return false;
      }
      console.error("❌ S3 file check error:", error);
      return false;
    }
  }

  /**
   * Upload profile image
   */
  async uploadProfileImage(
    fileBuffer,
    originalName,
    mimeType,
    userId,
    userInfo = {}
  ) {
    return this.uploadFile(
      fileBuffer,
      originalName,
      mimeType,
      userId,
      "profile",
      userInfo
    );
  }

  /**
   * Upload resume
   */
  async uploadResume(
    fileBuffer,
    originalName,
    mimeType,
    userId,
    userInfo = {}
  ) {
    return this.uploadFile(
      fileBuffer,
      originalName,
      mimeType,
      userId,
      "resume",
      userInfo
    );
  }

  /**
   * Upload cover letter
   */
  async uploadCoverLetter(
    fileBuffer,
    originalName,
    mimeType,
    userId,
    userInfo = {}
  ) {
    return this.uploadFile(
      fileBuffer,
      originalName,
      mimeType,
      userId,
      "coverletter",
      userInfo
    );
  }

  /**
   * Upload company document
   */
  async uploadCompanyDocument(
    fileBuffer,
    originalName,
    mimeType,
    userId,
    userInfo = {}
  ) {
    return this.uploadFile(
      fileBuffer,
      originalName,
      mimeType,
      userId,
      "document",
      userInfo
    );
  }

  /**
   * Upload portfolio file
   */
  async uploadPortfolio(
    fileBuffer,
    originalName,
    mimeType,
    userId,
    userInfo = {}
  ) {
    return this.uploadFile(
      fileBuffer,
      originalName,
      mimeType,
      userId,
      "portfolio",
      userInfo
    );
  }

  /**
   * Extract S3 key from URL
   */
  extractKeyFromUrl(url) {
    try {
      if (!url) return null;

      // Handle CloudFront URLs
      if (this.cloudFrontUrl && url.startsWith(this.cloudFrontUrl)) {
        return url.replace(`${this.cloudFrontUrl}/`, "");
      }

      // Handle S3 URLs
      const s3Pattern = new RegExp(
        `https://${this.bucketName}\\.s3\\..*\\.amazonaws\\.com/(.+)`
      );
      const match = url.match(s3Pattern);

      if (match && match[1]) {
        return decodeURIComponent(match[1]);
      }

      return null;
    } catch (error) {
      console.error("❌ Error extracting S3 key:", error);
      return null;
    }
  }

  /**
   * Delete file by URL
   */
  async deleteFileByUrl(url) {
    const key = this.extractKeyFromUrl(url);
    if (key) {
      return this.deleteFile(key);
    }
    console.warn("⚠️ Could not extract S3 key from URL:", url);
    return false;
  }
}

// Export singleton instance
export default new S3Service();
