/**
 * Calculate profile completion percentage based on filled fields
 * @param {Object} user - User object
 * @param {string} role - User role (applicant/recruiter)
 * @returns {number} - Completion percentage (0-100)
 */
export const calculateProfileCompletion = (user, role) => {
  if (!user) return 0;

  const requiredFields = {
    // Common fields for all roles
    common: [
      'firstName',
      'lastName', 
      'email',
      'phone'
    ],
    
    // Role-specific fields
    applicant: [
      'bio',
      'skills',
      'qualification',
      'yearsOfExperience',
      'currentLocation'
    ],
    
    recruiter: [
      'bio',
      'companyInfo.companyName',
      'companyInfo.jobTitle',
      'yearsOfExperience',
      'officeLocation'
    ]
  };

  // Get the appropriate field list
  const fieldsToCheck = [
    ...requiredFields.common,
    ...(requiredFields[role] || [])
  ];

  let completedFields = 0;
  const totalFields = fieldsToCheck.length;

  fieldsToCheck.forEach(fieldPath => {
    const value = getNestedValue(user, fieldPath);
    
    if (isFieldCompleted(value, fieldPath)) {
      completedFields++;
    }
  });

  return Math.round((completedFields / totalFields) * 100);
};

/**
 * Get nested object value using dot notation
 * @param {Object} obj - Object to search in
 * @param {string} path - Dot notation path (e.g., 'companyInfo.companyName')
 * @returns {any} - Value at path or undefined
 */
const getNestedValue = (obj, path) => {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined;
  }, obj);
};

/**
 * Check if a field is considered completed
 * @param {any} value - Field value
 * @param {string} fieldPath - Field path for special handling
 * @returns {boolean} - True if field is completed
 */
const isFieldCompleted = (value, fieldPath) => {
  // Handle null/undefined
  if (value === null || value === undefined) return false;
  
  // Handle strings
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  
  // Handle arrays (like skills)
  if (Array.isArray(value)) {
    return value.length > 0;
  }
  
  // Handle numbers (like yearsOfExperience)
  if (typeof value === 'number') {
    return value >= 0; // 0 is valid for experience
  }
  
  // Handle objects (like skills.technical)
  if (typeof value === 'object') {
    // For skills object, check if technical or soft arrays have items
    if (fieldPath === 'skills') {
      return (value.technical && value.technical.length > 0) || 
             (value.soft && value.soft.length > 0) ||
             (Array.isArray(value) && value.length > 0);
    }
    
    // For other objects, check if they have any properties
    return Object.keys(value).length > 0;
  }
  
  return Boolean(value);
};

/**
 * Get profile completion details for display
 * @param {Object} user - User object
 * @param {string} role - User role
 * @returns {Object} - Completion details
 */
export const getProfileCompletionDetails = (user, role) => {
  if (!user) return { percentage: 0, missingFields: [], completedFields: [] };

  const requiredFields = {
    common: [
      { key: 'firstName', label: 'First Name' },
      { key: 'lastName', label: 'Last Name' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Phone' }
    ],
    
    applicant: [
      { key: 'bio', label: 'Bio' },
      { key: 'skills', label: 'Skills' },
      { key: 'qualification', label: 'Qualification' },
      { key: 'yearsOfExperience', label: 'Years of Experience' },
      { key: 'currentLocation', label: 'Location' }
    ],
    
    recruiter: [
      { key: 'bio', label: 'Bio' },
      { key: 'companyInfo.companyName', label: 'Company Name' },
      { key: 'companyInfo.jobTitle', label: 'Job Title' },
      { key: 'yearsOfExperience', label: 'Years of Experience' },
      { key: 'officeLocation', label: 'Office Location' }
    ]
  };

  const fieldsToCheck = [
    ...requiredFields.common,
    ...(requiredFields[role] || [])
  ];

  const completedFields = [];
  const missingFields = [];

  fieldsToCheck.forEach(field => {
    const value = getNestedValue(user, field.key);
    
    if (isFieldCompleted(value, field.key)) {
      completedFields.push(field);
    } else {
      missingFields.push(field);
    }
  });

  const percentage = Math.round((completedFields.length / fieldsToCheck.length) * 100);

  return {
    percentage,
    completedFields,
    missingFields,
    totalFields: fieldsToCheck.length
  };
};
