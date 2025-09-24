/**
 * Validation Middleware
 * 
 * Express-validator based validation middleware for request validation
 * 
 * @author FinAutoJobs Team
 * @version 1.0.0
 */

import { body, validationResult } from 'express-validator';

// Strong password pattern with good mix of requirements
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const phonePattern = /^\+?[\d\s-()]{10,15}$/;
const urlPattern = /^https?:\/\/.+/i;

// Validation middleware function
export const validateRequest = (validationRules) => {
  return async (req, res, next) => {
    // If validationRules is an object with body, query, params
    if (validationRules.body) {
      const rules = [];
      
      // Convert validation rules to express-validator format
      for (const [field, rule] of Object.entries(validationRules.body)) {
        let validator = body(field);
        
        if (rule.notEmpty) validator = validator.notEmpty().withMessage(`${field} is required`);
        if (rule.isEmail) validator = validator.isEmail().withMessage('Invalid email format');
        if (rule.isMobilePhone) validator = validator.isMobilePhone(rule.isMobilePhone.options || 'any').withMessage(rule.isMobilePhone.errorMessage || 'Invalid phone number format');
        if (rule.isNumeric) validator = validator.isNumeric().withMessage(rule.isNumeric.errorMessage || `${field} must contain only numbers`);
        if (rule.isLength) validator = validator.isLength(rule.isLength.options).withMessage(rule.errorMessage || `Invalid ${field} length`);
        if (rule.matches) validator = validator.matches(rule.matches.options).withMessage(rule.matches.errorMessage || rule.errorMessage);
        if (rule.isIn) validator = validator.isIn(rule.isIn.options).withMessage(rule.isIn.errorMessage || rule.errorMessage || `Invalid ${field}`);
        if (rule.isArray) validator = validator.isArray(rule.isArray.options).withMessage(rule.errorMessage || `${field} must be an array`);
        if (rule.isFloat) validator = validator.isFloat(rule.isFloat.options).withMessage(rule.errorMessage || `Invalid ${field}`);
        if (rule.isBoolean) validator = validator.isBoolean().withMessage(rule.errorMessage || `${field} must be boolean`);
        if (rule.normalizeEmail) validator = validator.normalizeEmail();
        if (rule.optional) validator = validator.optional();
        
        rules.push(validator);
      }
      
      // Run validations
      await Promise.all(rules.map(validation => validation.run(req)));
    }
    
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }
    
    next();
  };
};

// Export validation patterns for reuse
export { passwordPattern, phonePattern, urlPattern };
