// Complete User Profile Schema for FinAutoJobs
import * as yup from 'yup';

// Enhanced validation schemas with all required fields
export const personalInfoSchema = yup.object({
  firstName: yup.string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters')
    .required('First name is required'),
  lastName: yup.string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters')
    .required('Last name is required'),
  email: yup.string()
    .email('Invalid email format')
    .required('Email is required'),
  phone: yup.string()
    .matches(/^[+]?[\d\s\-()]+$/, 'Invalid phone number format')
    .min(10, 'Phone number must be at least 10 digits')
    .required('Phone number is required'),
  alternatePhone: yup.string()
    .matches(/^[+]?[\d\s\-()]+$/, 'Invalid phone number format')
    .min(10, 'Phone number must be at least 10 digits')
    .nullable(),
  dateOfBirth: yup.date()
    .max(new Date(), 'Date of birth cannot be in the future')
    .required('Date of birth is required'),
  gender: yup.string()
    .oneOf(['Male', 'Female', 'Other', 'Prefer not to say'], 'Invalid gender selection')
    .required('Gender is required'),
  maritalStatus: yup.string()
    .oneOf(['Single', 'Married', 'Divorced', 'Widowed', 'Other'], 'Invalid marital status')
    .required('Marital status is required'),
  nationality: yup.string()
    .required('Nationality is required'),
  currentLocation: yup.object({
    city: yup.string().required('City is required'),
    state: yup.string().required('State is required'),
    country: yup.string().required('Country is required'),
    pincode: yup.string().matches(/^\d{6}$/, 'Invalid pincode format').required('Pincode is required')
  }),
  permanentAddress: yup.object({
    address: yup.string().required('Address is required'),
    city: yup.string().required('City is required'),
    state: yup.string().required('State is required'),
    country: yup.string().required('Country is required'),
    pincode: yup.string().matches(/^\d{6}$/, 'Invalid pincode format').required('Pincode is required')
  }),
  willingToRelocate: yup.boolean().required('Please specify relocation preference')
});

export const educationSchema = yup.object({
  level: yup.string()
    .oneOf(['Secondary', 'Higher Secondary', 'Diploma', 'Bachelor\'s', 'Master\'s', 'PhD', 'Certificate'], 'Invalid education level')
    .required('Education level is required'),
  degree: yup.string().required('Degree is required'),
  fieldOfStudy: yup.string().required('Field of study is required'),
  institution: yup.string().required('Institution name is required'),
  university: yup.string().nullable(),
  location: yup.string().required('Institution location is required'),
  startDate: yup.date().required('Start date is required'),
  endDate: yup.date()
    .min(yup.ref('startDate'), 'End date must be after start date')
    .nullable(),
  isCurrentlyStudying: yup.boolean(),
  gradingSystem: yup.string()
    .oneOf(['Percentage', 'CGPA', 'GPA'], 'Invalid grading system')
    .required('Grading system is required'),
  score: yup.number()
    .min(0, 'Score cannot be negative')
    .required('Score is required'),
  maxScore: yup.number()
    .min(yup.ref('score'), 'Maximum score must be greater than or equal to score')
    .required('Maximum score is required'),
  percentage: yup.number()
    .min(0, 'Percentage cannot be negative')
    .max(100, 'Percentage cannot exceed 100')
    .required('Percentage is required'),
  specialization: yup.string().nullable(),
  projects: yup.array().of(yup.string()),
  achievements: yup.array().of(yup.string()),
  relevantCoursework: yup.array().of(yup.string())
});

export const professionalSchema = yup.object({
  currentTitle: yup.string().nullable(),
  currentCompany: yup.string().nullable(),
  totalExperience: yup.string().required('Total experience is required'),
  currentSalary: yup.string().nullable(),
  expectedSalary: yup.string().required('Expected salary is required'),
  noticePeriod: yup.string()
    .oneOf(['Immediate', '15 days', '30 days', '60 days', '90 days'], 'Invalid notice period')
    .required('Notice period is required'),
  workMode: yup.string()
    .oneOf(['Remote', 'On-site', 'Hybrid'], 'Invalid work mode preference')
    .required('Work mode preference is required'),
  isExperienced: yup.boolean().required(),
  technicalSkills: yup.array().of(yup.object({
    name: yup.string().required('Skill name is required'),
    level: yup.string().oneOf(['Beginner', 'Intermediate', 'Advanced', 'Expert'], 'Invalid skill level'),
    yearsOfExperience: yup.number().min(0, 'Experience cannot be negative')
  })).min(1, 'At least one technical skill is required'),
  softSkills: yup.array().of(yup.string()).min(1, 'At least one soft skill is required'),
  languages: yup.array().of(yup.object({
    name: yup.string().required('Language name is required'),
    proficiency: yup.string().oneOf(['Basic', 'Intermediate', 'Advanced', 'Native'], 'Invalid proficiency level')
  })).min(1, 'At least one language is required'),
  industries: yup.array().of(yup.string()).min(1, 'At least one preferred industry is required'),
  jobTypes: yup.array().of(yup.string()).min(1, 'At least one job type preference is required'),
  preferredLocations: yup.array().of(yup.string()).min(1, 'At least one preferred location is required')
});

export const socialLinksSchema = yup.object({
  linkedin: yup.object({
    url: yup.string().url('Invalid LinkedIn URL').nullable(),
    username: yup.string().nullable(),
    isPublic: yup.boolean().default(true)
  }),
  github: yup.object({
    url: yup.string().url('Invalid GitHub URL').nullable(),
    username: yup.string().nullable(),
    repositories: yup.number().min(0).nullable(),
    followers: yup.number().min(0).nullable(),
    isPublic: yup.boolean().default(true)
  }),
  portfolio: yup.object({
    url: yup.string().url('Invalid portfolio URL').nullable(),
    title: yup.string().nullable(),
    isActive: yup.boolean().default(true)
  }),
  personalWebsite: yup.object({
    url: yup.string().url('Invalid website URL').nullable(),
    title: yup.string().nullable()
  }),
  stackoverflow: yup.object({
    url: yup.string().url('Invalid Stack Overflow URL').nullable(),
    reputation: yup.number().min(0).nullable(),
    username: yup.string().nullable()
  }),
  behance: yup.object({
    url: yup.string().url('Invalid Behance URL').nullable(),
    username: yup.string().nullable()
  }),
  dribbble: yup.object({
    url: yup.string().url('Invalid Dribbble URL').nullable(),
    username: yup.string().nullable()
  }),
  medium: yup.object({
    url: yup.string().url('Invalid Medium URL').nullable(),
    username: yup.string().nullable(),
    articles: yup.number().min(0).nullable()
  }),
  devto: yup.object({
    url: yup.string().url('Invalid Dev.to URL').nullable(),
    username: yup.string().nullable()
  }),
  twitter: yup.object({
    url: yup.string().url('Invalid Twitter URL').nullable(),
    username: yup.string().nullable(),
    isPublic: yup.boolean().default(false)
  })
});

export const certificationsSchema = yup.object({
  name: yup.string().required('Certification name is required'),
  issuingOrganization: yup.string().required('Issuing organization is required'),
  issueDate: yup.date().required('Issue date is required'),
  expiryDate: yup.date()
    .min(yup.ref('issueDate'), 'Expiry date must be after issue date')
    .nullable(),
  credentialId: yup.string().nullable(),
  credentialUrl: yup.string().url('Invalid credential URL').nullable(),
  skills: yup.array().of(yup.string()),
  isActive: yup.boolean().default(true)
});

export const documentsSchema = yup.object({
  resume: yup.object({
    fileName: yup.string().required('Resume file name is required'),
    filePath: yup.string().required('Resume file path is required'),
    uploadDate: yup.date().required('Upload date is required'),
    fileSize: yup.string().required('File size is required')
  }).required('Resume is required'),
  coverLetter: yup.object({
    fileName: yup.string().nullable(),
    filePath: yup.string().nullable()
  }),
  portfolio: yup.object({
    fileName: yup.string().nullable(),
    filePath: yup.string().nullable()
  }),
  certificates: yup.array().of(yup.object({
    name: yup.string().required('Certificate name is required'),
    filePath: yup.string().required('Certificate file path is required')
  }))
});

// Complete profile schema combining all sections
export const completeProfileSchema = yup.object({
  personalInfo: personalInfoSchema,
  education: yup.array().of(educationSchema).min(1, 'At least one education entry is required'),
  professional: professionalSchema,
  socialLinks: socialLinksSchema,
  certifications: yup.array().of(certificationsSchema),
  documents: documentsSchema,
  preferences: yup.object({
    jobTypes: yup.array().of(yup.string()).min(1, 'Select at least one job type'),
    industries: yup.array().of(yup.string()).min(1, 'Select at least one industry'),
    preferredLocations: yup.array().of(yup.string()).min(1, 'Select at least one location'),
    workSchedule: yup.string().oneOf(['Full-time', 'Part-time', 'Flexible'], 'Invalid work schedule'),
    travelWillingness: yup.string().oneOf(['Never', 'Occasionally', 'Frequently', 'Extensively'], 'Invalid travel preference')
  }),
  profileCompletion: yup.number().min(0).max(100),
  isProfilePublic: yup.boolean().default(true),
  isOpenToWork: yup.boolean().default(true)
});

// Utility functions
export const calculateProfileCompletion = (profileData) => {
  const sections = [
    'personalInfo',
    'education',
    'professional',
    'socialLinks',
    'certifications',
    'documents'
  ];
  
  let completedSections = 0;
  const totalSections = sections.length;
  
  sections.forEach(section => {
    if (profileData[section] && Object.keys(profileData[section]).length > 0) {
      completedSections++;
    }
  });
  
  return Math.round((completedSections / totalSections) * 100);
};

export const getIncompleteFields = (profileData) => {
  const incompleteFields = [];
  
  // Check each section for completeness
  if (!profileData.personalInfo?.firstName) incompleteFields.push('Personal Information');
  if (!profileData.education?.length) incompleteFields.push('Education Details');
  if (!profileData.professional?.expectedSalary) incompleteFields.push('Professional Information');
  if (!profileData.documents?.resume) incompleteFields.push('Resume Upload');
  
  return incompleteFields;
};

export default {
  personalInfoSchema,
  educationSchema,
  professionalSchema,
  socialLinksSchema,
  certificationsSchema,
  documentsSchema,
  completeProfileSchema,
  calculateProfileCompletion,
  getIncompleteFields
};
