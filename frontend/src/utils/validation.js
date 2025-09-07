// Validation schemas and utilities
import * as yup from 'yup';

// Common validation rules
const commonValidations = {
  email: yup.string().email('Invalid email format').required('Email is required'),
  password: yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 
      'Password must contain uppercase, lowercase, number and special character')
    .required('Password is required'),
  phone: yup.string()
    .matches(/^[+]?[\d\s\-()]+$/, 'Invalid phone number format')
    .min(10, 'Phone number must be at least 10 digits')
    .required('Phone number is required'),
  name: yup.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .required('Name is required'),
  url: yup.string().url('Invalid URL format'),
  required: (message = 'This field is required') => yup.string().required(message),
};

// Applicant Profile Validation Schema
export const applicantProfileSchema = yup.object({
  firstName: commonValidations.name,
  lastName: commonValidations.name,
  email: commonValidations.email,
  mobile: commonValidations.phone,
  location: yup.string().required('Location is required'),
  githubUrl: commonValidations.url.nullable(),
  linkedinUrl: commonValidations.url.nullable(),
  education: yup.string().required('Education level is required'),
  hasExperience: yup.boolean(),
  yearsOfExperience: yup.number().when('hasExperience', {
    is: true,
    then: () => yup.number().min(0, 'Experience cannot be negative').required('Years of experience is required'),
    otherwise: () => yup.number().nullable(),
  }),
  currentRole: yup.string().when('hasExperience', {
    is: true,
    then: () => yup.string().required('Current role is required'),
    otherwise: () => yup.string().nullable(),
  }),
  currentCompany: yup.string().when('hasExperience', {
    is: true,
    then: () => yup.string().required('Current company is required'),
    otherwise: () => yup.string().nullable(),
  }),
  bio: yup.string().max(500, 'Bio must be less than 500 characters'),
  skills: yup.array().min(1, 'At least one skill is required'),
  resume: yup.mixed().required('Resume is required'),
});

// Job Posting Validation Schema
export const jobPostingSchema = yup.object({
  title: yup.string()
    .min(5, 'Job title must be at least 5 characters')
    .max(100, 'Job title must be less than 100 characters')
    .required('Job title is required'),
  description: yup.string()
    .min(50, 'Job description must be at least 50 characters')
    .max(2000, 'Job description must be less than 2000 characters')
    .required('Job description is required'),
  requirements: yup.string()
    .min(20, 'Requirements must be at least 20 characters')
    .max(1000, 'Requirements must be less than 1000 characters')
    .required('Job requirements are required'),
  salaryMin: yup.number()
    .min(0, 'Minimum salary cannot be negative')
    .required('Minimum salary is required'),
  salaryMax: yup.number()
    .min(yup.ref('salaryMin'), 'Maximum salary must be greater than minimum salary')
    .required('Maximum salary is required'),
  location: yup.string().required('Job location is required'),
  jobType: yup.string()
    .oneOf(['full-time', 'part-time', 'contract', 'internship'], 'Invalid job type')
    .required('Job type is required'),
  experienceLevel: yup.string()
    .oneOf(['entry', 'mid', 'senior', 'executive'], 'Invalid experience level')
    .required('Experience level is required'),
  applicationDeadline: yup.date()
    .min(new Date(), 'Application deadline must be in the future')
    .required('Application deadline is required'),
});

// Company Profile Validation Schema
export const companyProfileSchema = yup.object({
  companyName: yup.string()
    .min(2, 'Company name must be at least 2 characters')
    .max(100, 'Company name must be less than 100 characters')
    .required('Company name is required'),
  companyDescription: yup.string()
    .min(50, 'Company description must be at least 50 characters')
    .max(1000, 'Company description must be less than 1000 characters')
    .required('Company description is required'),
  website: commonValidations.url.required('Company website is required'),
  industry: yup.string().required('Industry is required'),
  companySize: yup.string()
    .oneOf(['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'], 'Invalid company size')
    .required('Company size is required'),
  recruiterRole: yup.string().required('Recruiter role is required'),
  companyLogo: yup.mixed().nullable(),
});

// User Registration Validation Schema
export const userRegistrationSchema = yup.object({
  email: commonValidations.email,
  password: commonValidations.password,
  confirmPassword: yup.string()
    .oneOf([yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
  role: yup.string()
    .oneOf(['applicant', 'recruiter'], 'Invalid role selected')
    .required('Please select a role'),
  termsAccepted: yup.boolean()
    .oneOf([true], 'You must accept the terms and conditions'),
});

// User Login Validation Schema
export const userLoginSchema = yup.object({
  email: commonValidations.email,
  password: yup.string().required('Password is required'),
});

// Application Validation Schema
export const applicationSchema = yup.object({
  coverLetter: yup.string()
    .min(50, 'Cover letter must be at least 50 characters')
    .max(1000, 'Cover letter must be less than 1000 characters')
    .required('Cover letter is required'),
  expectedSalary: yup.number()
    .min(0, 'Expected salary cannot be negative')
    .nullable(),
  availableFrom: yup.date()
    .min(new Date(), 'Available from date must be in the future')
    .required('Available from date is required'),
});

// Settings Validation Schema
export const settingsSchema = yup.object({
  theme: yup.string().oneOf(['light', 'dark'], 'Invalid theme'),
  fontSize: yup.string().oneOf(['small', 'medium', 'large'], 'Invalid font size'),
  emailNotifications: yup.boolean(),
  smsNotifications: yup.boolean(),
  marketingEmails: yup.boolean(),
});

// File validation utilities
export const validateFile = (file, options = {}) => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    required = false
  } = options;

  if (!file && required) {
    return 'File is required';
  }

  if (!file) return null;

  if (file.size > maxSize) {
    return `File size must be less than ${maxSize / (1024 * 1024)}MB`;
  }

  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    return `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`;
  }

  return null;
};

// Generic form validation function
export const validateForm = async (schema, data) => {
  try {
    await schema.validate(data, { abortEarly: false });
    return { isValid: true, errors: {} };
  } catch (error) {
    const errors = {};
    error.inner.forEach((err) => {
      errors[err.path] = err.message;
    });
    return { isValid: false, errors };
  }
};

// Real-time field validation
export const validateField = async (schema, fieldName, value, allData = {}) => {
  try {
    await schema.validateAt(fieldName, { ...allData, [fieldName]: value });
    return null;
  } catch (error) {
    return error.message;
  }
};

export default {
  applicantProfileSchema,
  jobPostingSchema,
  companyProfileSchema,
  userRegistrationSchema,
  userLoginSchema,
  applicationSchema,
  settingsSchema,
  validateFile,
  validateForm,
  validateField,
};
