/**
 * Location utility functions for parsing and formatting location data
 */

/**
 * Parse a location string into structured location object
 * @param {string} locationString - Location string like "Mumbai, Maharashtra, India"
 * @returns {object} - Structured location object
 */
export const parseLocationString = (locationString) => {
  if (!locationString || typeof locationString !== 'string') {
    return { city: '', state: '', country: 'India' };
  }

  const parts = locationString.split(',').map(part => part.trim());
  
  return {
    city: parts[0] || '',
    state: parts[1] || '',
    country: parts[2] || 'India'
  };
};

/**
 * Format location object into a display string
 * @param {object} location - Location object with city, state, country
 * @returns {string} - Formatted location string
 */
export const formatLocationString = (location) => {
  if (!location || typeof location !== 'object') {
    return '';
  }

  const { city, state, country } = location;
  return [city, state, country].filter(Boolean).join(', ');
};

/**
 * Get location display string from various location formats
 * @param {string|object} location - Location in various formats
 * @returns {string} - Display string
 */
export const getLocationDisplay = (location) => {
  if (typeof location === 'string') {
    return location;
  }
  
  if (location && typeof location === 'object') {
    return formatLocationString(location);
  }
  
  return '';
};

/**
 * Validate if a location string is properly formatted
 * @param {string} locationString - Location string to validate
 * @returns {boolean} - True if valid
 */
export const isValidLocationString = (locationString) => {
  if (!locationString || typeof locationString !== 'string') {
    return false;
  }
  
  // At minimum, should have a city name
  const parts = locationString.split(',').map(part => part.trim());
  return parts[0] && parts[0].length > 0;
};

/**
 * Get default location object
 * @returns {object} - Default location object
 */
export const getDefaultLocation = () => ({
  city: '',
  state: '',
  country: 'India'
});

/**
 * Check if location is in India
 * @param {string|object} location - Location to check
 * @returns {boolean} - True if location is in India
 */
export const isIndianLocation = (location) => {
  if (typeof location === 'string') {
    const parsed = parseLocationString(location);
    return parsed.country.toLowerCase() === 'india';
  }
  
  if (location && typeof location === 'object') {
    return location.country && location.country.toLowerCase() === 'india';
  }
  
  return false;
};

/**
 * Normalize location data for database storage
 * @param {string|object} location - Location data to normalize
 * @returns {object} - Normalized location object
 */
export const normalizeLocationForStorage = (location) => {
  if (typeof location === 'string') {
    return parseLocationString(location);
  }
  
  if (location && typeof location === 'object') {
    return {
      city: location.city || '',
      state: location.state || '',
      country: location.country || 'India'
    };
  }
  
  return getDefaultLocation();
};
