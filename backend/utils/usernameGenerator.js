

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
   * Following predefined rules with multiple patterns:
   * - {firstname}{number}
   * - {firstname[0]}{lastname}{number}
   * - {firstname}{lastname[0]}{number}
   * - {firstname}{lastname}{number}
   * - Role-based prefixes for professional accounts
   * @param {string} firstName - User's first name
   * @param {string} lastName - User's last name
   * @param {string} role - User role ('applicant' or 'recruiter')
   * @returns {Array<string>} - Array of base username patterns (without numbers)
   */
  static generateSuggestions(firstName, lastName, role = 'applicant') {
    const cleanFirst = this.cleanString(firstName);
    const cleanLast = this.cleanString(lastName);
    
    const suggestions = [];
    
    // Core Pattern 1: {firstname} (firstname only)
    if (cleanFirst.length >= 3) {
      suggestions.push(cleanFirst);
    }
    
    // Core Pattern 2: {firstname[0]}{lastname} (first initial + lastname)
    if (cleanFirst.length > 0 && cleanLast.length > 0) {
      suggestions.push(cleanFirst.charAt(0) + cleanLast);
    }
    
    // Core Pattern 3: {firstname}{lastname[0]} (firstname + last initial)
    if (cleanFirst.length > 0 && cleanLast.length > 0) {
      suggestions.push(cleanFirst + cleanLast.charAt(0));
    }
    
    // Core Pattern 4: {firstname}{lastname} (firstname + lastname)
    if (cleanFirst.length > 0 && cleanLast.length > 0) {
      suggestions.push(cleanFirst + cleanLast);
    }
    
    // Pattern 5: lastname only (if unique enough)
    if (cleanLast.length >= 3) {
      suggestions.push(cleanLast);
    }
    
    // Pattern 6: lastname + firstname
    if (cleanFirst.length > 0 && cleanLast.length > 0) {
      suggestions.push(cleanLast + cleanFirst);
    }
    
    // Pattern 7: First 3 chars of first + first 3 chars of last
    if (cleanFirst.length >= 3 && cleanLast.length >= 3) {
      suggestions.push(cleanFirst.substring(0, 3) + cleanLast.substring(0, 3));
    }
    
    // Pattern 8: Abbreviated forms
    if (cleanFirst.length >= 2 && cleanLast.length >= 2) {
      suggestions.push(cleanFirst.substring(0, 2) + cleanLast.substring(0, 2));
    }
    
    // Role-based patterns for professional accounts
    if (role === 'recruiter') {
      // Professional recruiter patterns
      suggestions.push('hr' + cleanFirst);
      suggestions.push('recruiter' + cleanFirst);
      suggestions.push(cleanFirst + 'hr');
      suggestions.push(cleanFirst + 'recruiter');
      
      if (cleanLast.length > 0) {
        suggestions.push('hr' + cleanFirst + cleanLast.charAt(0));
        suggestions.push(cleanFirst + cleanLast + 'hr');
      }
    }
    
    // Pattern 9: Vowel removal for shorter usernames
    const noVowelsFirst = cleanFirst.replace(/[aeiou]/g, '');
    const noVowelsLast = cleanLast.replace(/[aeiou]/g, '');
    if (noVowelsFirst.length >= 2 && noVowelsLast.length >= 2) {
      suggestions.push(noVowelsFirst + noVowelsLast);
    }
    
    // Pattern 10: Alternating characters
    if (cleanFirst.length >= 2 && cleanLast.length >= 2) {
      let alternating = '';
      const maxLen = Math.min(cleanFirst.length, cleanLast.length, 4);
      for (let i = 0; i < maxLen; i++) {
        if (i < cleanFirst.length) alternating += cleanFirst.charAt(i);
        if (i < cleanLast.length) alternating += cleanLast.charAt(i);
      }
      if (alternating.length >= 3) {
        suggestions.push(alternating);
      }
    }
    
    return suggestions.filter(s => s.length >= 3 && s.length <= 20); // 3-20 characters
  }

  /**
   * Check if a username is available
   * @param {string} username - Username to check
   * @returns {Promise<boolean>} - True if available, false if taken
   */
  static async isUsernameAvailable(username) {
    try {
      // Import User model dynamically
      const { BaseUser } = await import('../models/UserModels.js');
      const existingUser = await BaseUser.findOne({ username });
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
      role = 'applicant',
      returnSuggestions = false
    } = options;

    try {
      // Generate base suggestions with role-specific patterns
      const suggestions = this.generateSuggestions(firstName, lastName, role);
      let selectedUsername = null;
      const availableSuggestions = [];

      // Check each suggestion for availability
      for (const suggestion of suggestions) {
        if (await this.isUsernameAvailable(suggestion)) {
          if (!selectedUsername) {
            selectedUsername = suggestion;
          }
          if (returnSuggestions) {
            availableSuggestions.push(suggestion);
          }
        }
      }

      // If we found an available username, return it
      if (selectedUsername) {
        const result = {
          success: true,
          username: selectedUsername,
          method: 'direct',
          pattern: this.identifyPattern(selectedUsername, firstName, lastName, role)
        };
        
        if (returnSuggestions) {
          result.suggestions = availableSuggestions.slice(0, 5); // Return top 5 suggestions
        }
        
        return result;
      }

      // No direct matches found, try with numbers
      const baseUsername = suggestions[0] || (this.cleanString(firstName) + this.cleanString(lastName));
      
      selectedUsername = await this.generateWithNumber(baseUsername, maxAttempts);
      
      const result = {
        success: true,
        username: selectedUsername,
        method: 'numbered',
        pattern: 'numbered_suffix',
        basePattern: this.identifyPattern(baseUsername, firstName, lastName, role)
      };
      
      if (returnSuggestions) {
        // Generate numbered suggestions
        const numberedSuggestions = [];
        for (let i = 1; i <= 5; i++) {
          const numberedUsername = baseUsername + i;
          if (await this.isUsernameAvailable(numberedUsername)) {
            numberedSuggestions.push(numberedUsername);
          }
        }
        result.suggestions = numberedSuggestions;
      }
      
      return result;

    } catch (error) {
      console.error('Error generating username:', error);
      
      // Fallback: create a safe username
      const fallbackUsername = this.cleanString(firstName) + this.cleanString(lastName) + Date.now().toString().slice(-6);
      
      return {
        success: false,
        username: fallbackUsername,
        method: 'fallback',
        pattern: 'timestamp_fallback',
        error: error.message
      };
    }
  }

  /**
   * Identify the pattern used for a username
   * @param {string} username - Generated username
   * @param {string} firstName - Original first name
   * @param {string} lastName - Original last name
   * @param {string} role - User role
   * @returns {string} - Pattern identifier
   */
  static identifyPattern(username, firstName, lastName, role) {
    const cleanFirst = this.cleanString(firstName);
    const cleanLast = this.cleanString(lastName);
    
    if (username === cleanFirst) return 'firstname_only';
    if (username === cleanFirst.charAt(0) + cleanLast) return 'first_initial_lastname';
    if (username === cleanFirst + cleanLast.charAt(0)) return 'firstname_last_initial';
    if (username === cleanFirst + cleanLast) return 'firstname_lastname';
    if (username === cleanLast) return 'lastname_only';
    if (username === cleanLast + cleanFirst) return 'lastname_firstname';
    if (username.startsWith('hr') || username.startsWith('recruiter')) return 'role_prefix';
    if (username.endsWith('hr') || username.endsWith('recruiter')) return 'role_suffix';
    
    return 'custom_pattern';
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
