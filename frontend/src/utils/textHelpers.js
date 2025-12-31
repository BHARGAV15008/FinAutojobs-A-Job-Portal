/**
 * Text utility functions for consistent text formatting across the application
 */

/**
 * Capitalizes first letter of each word in a string
 * @param {string} str - The string to capitalize
 * @returns {string} - Capitalized string
 */
export const capitalizeWords = (str) => {
  if (!str) return '';
  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

/**
 * Capitalizes first letter of a string
 * @param {string} str - The string to capitalize
 * @returns {string} - Capitalized string
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Formats a full name from first and last name
 * @param {string} firstName - First name
 * @param {string} lastName - Last name
 * @returns {string} - Formatted full name
 */
export const formatFullName = (firstName, lastName) => {
  const first = capitalize(firstName || '');
  const last = capitalize(lastName || '');
  return `${first} ${last}`.trim();
};

/**
 * Gets display name from user object with proper capitalization
 * @param {object} user - User object
 * @returns {string} - Formatted display name
 */
export const getDisplayName = (user) => {
  if (!user) return 'User';
  
  // Try different name field combinations
  if (user.name) {
    return capitalizeWords(user.name);
  }
  
  if (user.fullName) {
    return capitalizeWords(user.fullName);
  }
  
  if (user.firstName || user.lastName) {
    return formatFullName(user.firstName, user.lastName);
  }
  
  return 'User';
};

/**
 * Truncates text to a specified length
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} - Truncated text
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};