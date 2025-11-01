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
  const missingFields = [];

  fieldsToCheck.forEach(fieldPath => {
    let value = getNestedValue(user, fieldPath);
    
    // Check alternative field names if primary field is empty
    if (!isFieldCompleted(value, fieldPath)) {
      value = checkAlternativeFields(user, fieldPath);
    }
    
    if (isFieldCompleted(value, fieldPath)) {
      completedFields++;
    } else {
      missingFields.push(fieldPath);
    }
  });

  const percentage = Math.round((completedFields / totalFields) * 100);
  
  // Debug logging
  console.log('📊 Profile Completion Debug:', {
    role,
    totalFields,
    completedFields,
    percentage,
    missingFields,
    userFields: Object.keys(user || {})
  });

  return percentage;
};

/**
 * Check alternative field names for the same data
 * @param {Object} user - User object
 * @param {string} fieldPath - Original field path
 * @returns {any} - Value from alternative field or undefined
 */
const checkAlternativeFields = (user, fieldPath) => {
  const alternatives = {
    'yearsOfExperience': ['experience_years', 'experience', 'experienceYears', 'careerInfo.experienceYears'],
    'currentLocation': ['location', 'city', 'address', 'currentLocation.city'],
    'qualification': ['education', 'degree', 'education[0].degree', 'highestQualification'],
    'companyInfo.companyName': ['company', 'companyName', 'companyInfo.name'],
    'companyInfo.jobTitle': ['job_title', 'jobTitle', 'position', 'designation'],
    'officeLocation': ['location', 'city', 'officeLocation.city', 'address'],
    'bio': ['about', 'description', 'summary', 'professionalSummary'],
    'skills': ['skills.primary', 'skills.technical', 'technicalSkills', 'primarySkills']
  };
  
  const alternativeFields = alternatives[fieldPath];
  if (!alternativeFields) return undefined;
  
  for (const altField of alternativeFields) {
    const value = getNestedValue(user, altField);
    if (value !== undefined && value !== null) {
      console.log(`✅ Found alternative field for ${fieldPath}: ${altField} =`, value);
      return value;
    }
  }
  
  return undefined;
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
    const trimmed = value.trim();
    // Reject placeholder values
    if (trimmed === 'Not specified' || trimmed === 'N/A' || trimmed === 'null' || trimmed === 'undefined') {
      return false;
    }
    return trimmed.length > 0;
  }
  
  // Handle arrays (like skills)
  if (Array.isArray(value)) {
    // Check if array has valid items (not empty strings)
    const validItems = value.filter(item => {
      if (typeof item === 'string') return item.trim().length > 0;
      if (typeof item === 'object' && item !== null) return Object.keys(item).length > 0;
      return Boolean(item);
    });
    return validItems.length > 0;
  }
  
  // Handle numbers (like yearsOfExperience)
  if (typeof value === 'number') {
    return value >= 0; // 0 is valid for experience
  }
  
  // Handle objects (like skills.technical, currentLocation, companyInfo)
  if (typeof value === 'object') {
    // For skills object, check if technical, soft, or primary arrays have items
    if (fieldPath === 'skills') {
      return (value.technical && value.technical.length > 0) || 
             (value.soft && value.soft.length > 0) ||
             (value.primary && value.primary.length > 0) ||
             (Array.isArray(value) && value.length > 0);
    }
    
    // For location objects, check if city or country exists
    if (fieldPath === 'currentLocation' || fieldPath === 'officeLocation') {
      return (value.city && value.city.trim().length > 0) || 
             (value.country && value.country.trim().length > 0);
    }
    
    // For education array, check if it has valid entries
    if (fieldPath === 'qualification' && Array.isArray(value)) {
      return value.some(edu => edu.degree && edu.degree.trim().length > 0);
    }
    
    // For other objects, check if they have any non-empty properties
    const hasValidProps = Object.values(value).some(v => {
      if (typeof v === 'string') return v.trim().length > 0;
      if (typeof v === 'number') return v >= 0;
      if (Array.isArray(v)) return v.length > 0;
      return Boolean(v);
    });
    return hasValidProps;
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
