/**
 * Helper utility to fetch presigned URLs for S3 documents
 * Provides secure temporary access to private S3 files
 */

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

/**
 * Fetch presigned URL for a specific document type
 * @param {string} type - Document type: 'resume', 'coverLetter', 'portfolio', 'profileImage'
 * @param {string} token - Authentication token
 * @returns {Promise<string|null>} - Presigned URL or null if not available
 */
export const fetchPresignedUrl = async (type, token) => {
  if (!token) {
    console.warn("No token provided for fetching presigned URL");
    return null;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/auth/file-url/${type}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      return data.url;
    } else {
      console.warn(
        `Failed to fetch presigned URL for ${type}:`,
        response.status
      );
      return null;
    }
  } catch (error) {
    console.error(`Error fetching presigned URL for ${type}:`, error);
    return null;
  }
};

/**
 * Fetch all document presigned URLs for a user
 * @param {Object} user - User object with document URLs
 * @param {string} token - Authentication token
 * @returns {Promise<Object>} - Object with presigned URLs
 */
export const fetchAllDocumentUrls = async (user, token) => {
  if (!user || !token) {
    return { resume: null, coverLetter: null, portfolio: null };
  }

  const urls = {};

  // Fetch resume URL
  if (user?.resume_url || user?.documents?.resumeUrl) {
    urls.resume = await fetchPresignedUrl("resume", token);
    // Fallback to direct URL if presigned fails
    if (!urls.resume) {
      urls.resume = user?.resume_url || user?.documents?.resumeUrl;
    }
  }

  // Fetch cover letter URL
  if (user?.cover_letter_url || user?.documents?.coverLetterUrl) {
    urls.coverLetter = await fetchPresignedUrl("coverLetter", token);
    if (!urls.coverLetter) {
      urls.coverLetter =
        user?.cover_letter_url || user?.documents?.coverLetterUrl;
    }
  }

  // Fetch portfolio URL
  if (user?.portfolio_url || user?.documents?.portfolioUrl) {
    urls.portfolio = await fetchPresignedUrl("portfolio", token);
    if (!urls.portfolio) {
      urls.portfolio = user?.portfolio_url || user?.documents?.portfolioUrl;
    }
  }

  return urls;
};

/**
 * Fetch presigned URL for application document
 * @param {Object} application - Application object
 * @param {string} documentType - 'resume', 'coverLetter', 'portfolio'
 * @returns {Promise<string|null>} - Presigned URL or direct URL
 */
export const getApplicationDocumentUrl = async (
  application,
  documentType = "resume"
) => {
  // First try to get URL from application
  let directUrl = null;

  switch (documentType) {
    case "resume":
      directUrl =
        application?.documents?.resumeUrl ||
        application?.resumeUrl ||
        application?.applicantSnapshot?.resume_url ||
        application?.applicantSnapshot?.documents?.resumeUrl;
      break;
    case "coverLetter":
      directUrl =
        application?.documents?.coverLetterUrl ||
        application?.coverLetterUrl ||
        application?.applicantSnapshot?.cover_letter_url ||
        application?.applicantSnapshot?.documents?.coverLetterUrl;
      break;
    case "portfolio":
      directUrl =
        application?.documents?.portfolioUrl ||
        application?.portfolioUrl ||
        application?.applicantSnapshot?.portfolio_url ||
        application?.applicantSnapshot?.documents?.portfolioUrl;
      break;
  }

  if (!directUrl) {
    return null;
  }

  // If it's an S3 URL, try to get presigned URL
  if (directUrl.includes("amazonaws.com") || directUrl.includes("s3")) {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const presignedUrl = await fetchPresignedUrl(documentType, token);
        if (presignedUrl) {
          return presignedUrl;
        }
      } catch (error) {
        console.warn(`Failed to get presigned URL, using direct URL:`, error);
      }
    }
  }

  // Return direct URL as fallback
  return directUrl;
};

/**
 * Download document with presigned URL
 * @param {string} url - Document URL (direct or S3)
 * @param {string} filename - Download filename
 * @param {string} documentType - Type for presigned URL fetching
 */
export const downloadDocument = async (
  url,
  filename,
  documentType = "resume"
) => {
  if (!url) {
    alert("Document not available");
    return;
  }

  try {
    let downloadUrl = url;

    // If S3 URL, get presigned URL
    if (url.includes("amazonaws.com") || url.includes("s3")) {
      const token = localStorage.getItem("token");
      if (token) {
        const presignedUrl = await fetchPresignedUrl(documentType, token);
        if (presignedUrl) {
          downloadUrl = presignedUrl;
        }
      }
    }

    // Create temporary link and trigger download
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.target = "_blank";
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error("Error downloading document:", error);
    alert("Failed to download document");
  }
};

export default {
  fetchPresignedUrl,
  fetchAllDocumentUrls,
  getApplicationDocumentUrl,
  downloadDocument,
};
