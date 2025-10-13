/**
 * URL validation utilities to prevent invalid URLs from being saved to database
 */

/**
 * Validates if a URL is a proper external URL (allows localhost in development)
 * @param {string} url - The URL to validate
 * @returns {boolean} - True if valid URL, false otherwise
 */
export function isValidExternalUrl(url) {
  if (!url || typeof url !== 'string') {
    return false;
  }
  
  // Allow empty strings (user clearing the field)
  if (url.trim() === '') {
    return true;
  }
  
  try {
    const urlObj = new URL(url);
    
    // Check if it's a valid HTTP/HTTPS URL
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return false;
    }
    
    const hostname = urlObj.hostname.toLowerCase();
    
    // In development mode, allow localhost URLs
    const isDevelopment = process.env.NODE_ENV === 'development' || process.env.NODE_ENV !== 'production';
    
    if (isDevelopment) {
      // Allow localhost and local network URLs in development
      if (
        hostname === 'localhost' ||
        hostname === '127.0.0.1' ||
        hostname.startsWith('192.168.') ||
        hostname.startsWith('10.') ||
        hostname.startsWith('172.') ||
        hostname.endsWith('.local')
      ) {
        return true; // ✅ Allow localhost in development
      }
    } else {
      // In production, reject localhost and local network URLs
      if (
        hostname === 'localhost' ||
        hostname === '127.0.0.1' ||
        hostname.startsWith('192.168.') ||
        hostname.startsWith('10.') ||
        hostname.startsWith('172.') ||
        hostname.endsWith('.local')
      ) {
        return false;
      }
    }
    
    // Must have a proper domain (skip this check for localhost in development)
    if (!isDevelopment && (!hostname.includes('.') || hostname.length < 4)) {
      return false;
    }
    
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Validates LinkedIn URL format
 * @param {string} url - The LinkedIn URL to validate
 * @returns {boolean} - True if valid LinkedIn URL, false otherwise
 */
export function isValidLinkedInUrl(url) {
  if (!url || url.trim() === '') return true; // Allow empty
  
  if (!isValidExternalUrl(url)) return false;
  
  // In development mode, allow any valid URL for testing
  const isDevelopment = process.env.NODE_ENV === 'development' || process.env.NODE_ENV !== 'production';
  if (isDevelopment) {
    return true; // Allow any valid URL in development
  }
  
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.toLowerCase().includes('linkedin.com');
  } catch {
    return false;
  }
}

/**
 * Validates GitHub URL format
 * @param {string} url - The GitHub URL to validate
 * @returns {boolean} - True if valid GitHub URL, false otherwise
 */
export function isValidGitHubUrl(url) {
  if (!url || url.trim() === '') return true; // Allow empty
  
  if (!isValidExternalUrl(url)) return false;
  
  // In development mode, allow any valid URL for testing
  const isDevelopment = process.env.NODE_ENV === 'development' || process.env.NODE_ENV !== 'production';
  if (isDevelopment) {
    return true; // Allow any valid URL in development
  }
  
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.toLowerCase().includes('github.com');
  } catch {
    return false;
  }
}

/**
 * Validates portfolio/website URL format
 * @param {string} url - The portfolio URL to validate
 * @returns {boolean} - True if valid portfolio URL, false otherwise
 */
export function isValidPortfolioUrl(url) {
  if (!url || url.trim() === '') return true; // Allow empty
  
  return isValidExternalUrl(url);
}

/**
 * Sanitizes and validates social media URLs
 * @param {object} socialLinks - Object containing social media URLs
 * @returns {object} - Sanitized social links object
 */
export function sanitizeSocialLinks(socialLinks) {
  const sanitized = {};
  
  if (socialLinks.linkedin_url !== undefined) {
    sanitized.linkedin_url = isValidLinkedInUrl(socialLinks.linkedin_url) 
      ? socialLinks.linkedin_url.trim() 
      : '';
  }
  
  if (socialLinks.github_url !== undefined) {
    sanitized.github_url = isValidGitHubUrl(socialLinks.github_url) 
      ? socialLinks.github_url.trim() 
      : '';
  }
  
  if (socialLinks.portfolio_url !== undefined) {
    sanitized.portfolio_url = isValidPortfolioUrl(socialLinks.portfolio_url) 
      ? socialLinks.portfolio_url.trim() 
      : '';
  }
  
  return sanitized;
}

/**
 * Validates bio text to ensure it doesn't contain URLs
 * @param {string} bio - The bio text to validate
 * @returns {boolean} - True if valid bio, false if contains URLs
 */
export function isValidBio(bio) {
  if (!bio || typeof bio !== 'string') {
    return true; // Allow empty bio
  }
  
  // Check if bio contains URLs (http, https, www, or localhost patterns)
  const urlPattern = /(https?:\/\/|www\.|localhost|192\.168\.|127\.0\.0\.1)/i;
  return !urlPattern.test(bio);
}

/**
 * Sanitizes bio text by removing URLs
 * @param {string} bio - The bio text to sanitize
 * @returns {string} - Sanitized bio text
 */
export function sanitizeBio(bio) {
  if (!bio || typeof bio !== 'string') {
    return '';
  }
  
  // If bio contains URLs, return empty string to force user to enter proper bio
  if (!isValidBio(bio)) {
    return '';
  }
  
  return bio.trim();
}
