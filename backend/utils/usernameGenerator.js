

/**
 * Smart username generation utility
 * Handles duplicate usernames by trying multiple strategies
 */
export default class UsernameGenerator {
  /**
   * Clean and normalize a string for username use
   * @param {string} str - Input string
   * @returns {string} - Cleaned string
   */
  static cleanString(str) {
    return str
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '') // Remove special characters
      .replace(/\s+/g, ''); // Remove spaces
  }

  /**
   * Generate username suggestions based on first name and last name
   * Following your specific patterns:
   * - {username}{number}
   * - {username[0]}{lastname}{number}
   * - {username}{lastname[0]}{number}
   * - {username}{lastname}{number}
   * @param {string} firstName - User's first name
   * @param {string} lastName - User's last name
   * @returns {Array<string>} - Array of base username patterns (without numbers)
   */
  static generateSuggestions(firstName, lastName) {
    const cleanFirst = this.cleanString(firstName);
    const cleanLast = this.cleanString(lastName);
    
    const suggestions = [];
    
    // Pattern 1: {username} (firstname only)
    if (cleanFirst.length >= 3) {
      suggestions.push(cleanFirst);
    }
    
    // Pattern 2: {username[0]}{lastname} (first initial + lastname)
    if (cleanFirst.length > 0 && cleanLast.length > 0) {
      suggestions.push(cleanFirst.charAt(0) + cleanLast);
    }
    
    // Pattern 3: {username}{lastname[0]} (firstname + last initial)
    if (cleanFirst.length > 0 && cleanLast.length > 0) {
      suggestions.push(cleanFirst + cleanLast.charAt(0));
    }
    
    // Pattern 4: {username}{lastname} (firstname + lastname)
    suggestions.push(cleanFirst + cleanLast);
    
    // Additional patterns for better variety
    // Pattern 5: lastname only (if unique enough)
    if (cleanLast.length >= 3) {
      suggestions.push(cleanLast);
    }
    
    // Pattern 6: lastname + firstname
    suggestions.push(cleanLast + cleanFirst);
    
    return suggestions.filter(s => s.length >= 3); // Minimum 3 characters
  }

  /**
   * Check if a username is available
   * @param {string} username - Username to check
   * @returns {Promise<boolean>} - True if available, false if taken
   */
  static async isUsernameAvailable(username) {
    try {
      // Import User model dynamically
      const User = (await import('../models/UserMongoose.js')).default;
      const existingUser = await User.findOne({ username });
      return !existingUser; // Return true if no user found (available)
    } catch (error) {
      console.error('Error checking username availability:', error);
      return false;
    }
  }

  /**
   * Generate a unique username with number suffix
   * @param {string} baseUsername - Base username
   * @param {number} maxAttempts - Maximum number of attempts (default: 100)
   * @returns {Promise<string>} - Unique username with number suffix
   */
  static async generateWithNumber(baseUsername, maxAttempts = 100) {
    for (let i = 1; i <= maxAttempts; i++) {
      const username = baseUsername + i;
      if (await this.isUsernameAvailable(username)) {
        return username;
      }
    }
    
    // If all numbered attempts fail, add timestamp
    const timestamp = Date.now().toString().slice(-6);
    return baseUsername + timestamp;
  }

  /**
   * Main function to generate a unique username
   * @param {string} firstName - User's first name
   * @param {string} lastName - User's last name
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} - Result object with username and suggestions
   */
  static async generateUniqueUsername(firstName, lastName, options = {}) {
    const {
      maxAttempts = 50,
    } = options;

    try {
      // Generate base suggestions
      const suggestions = this.generateSuggestions(firstName, lastName);
      let selectedUsername = null;

      // Check each suggestion for availability
      for (const suggestion of suggestions) {
        if (await this.isUsernameAvailable(suggestion)) {
          selectedUsername = suggestion;
          break;
        }
      }

      // If we found an available username, return it
      if (selectedUsername) {
        return {
          success: true,
          username: selectedUsername,
          method: 'direct'
        };
      }

      // No direct matches found, try with numbers
      const baseUsername = suggestions[0] || (this.cleanString(firstName) + this.cleanString(lastName));
      
      selectedUsername = await this.generateWithNumber(baseUsername, maxAttempts);
      return {
        success: true,
        username: selectedUsername,
        method: 'numbered'
      };

    } catch (error) {
      console.error('Error generating username:', error);
      
      // Fallback: create a safe username
      const fallbackUsername = this.cleanString(firstName) + this.cleanString(lastName) + Date.now().toString().slice(-6);
      
      return {
        success: false,
        username: fallbackUsername,
        method: 'fallback',
        error: error.message
      };
    }
  }

  /**
   * Validate username format
   * @param {string} username - Username to validate
   * @returns {Object} - Validation result
   */
  static validateUsername(username) {
    const errors = [];
    
    if (!username || username.length < 3) {
      errors.push('Username must be at least 3 characters long');
    }
    
    if (username.length > 30) {
      errors.push('Username must be less than 30 characters');
    }
    
    if (!/^[a-zA-Z0-9._-]+$/.test(username)) {
      errors.push('Username can only contain letters, numbers, dots, underscores, and hyphens');
    }
    
    if (/^[._-]/.test(username) || /[._-]$/.test(username)) {
      errors.push('Username cannot start or end with special characters');
    }
    
    if (/[._-]{2,}/.test(username)) {
      errors.push('Username cannot contain consecutive special characters');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
}
