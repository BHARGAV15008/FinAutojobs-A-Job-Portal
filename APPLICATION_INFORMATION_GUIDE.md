# ApplicationInformation System - Complete Guide

## Overview

The ApplicationInformation system is a comprehensive solution for storing detailed applicant information when they apply for jobs. It captures a complete snapshot of the applicant's profile, skills, experience, education, and preferences at the time of application.

## Key Features

### ✅ **Flexible Salary Format Support**
- **Range Format**: "10-12", "50-80", "100-150"
- **Plus Format**: "12+", "50+", "100+"
- **Single Value**: "15", "60", "120"
- **Negotiable**: Boolean flag for negotiable salaries
- **Multiple Currencies**: INR, USD, EUR, GBP
- **Period Support**: Hourly, Monthly, Yearly

### ✅ **Flexible Experience Format Support**
- **Range Format**: "1-2", "3-5", "5-10"
- **Plus Format**: "1+", "5+", "10+"
- **Single Value**: "2", "5", "8"
- **Fresher Support**: "0", "0-1"
- **Raw Text Storage**: Preserves original input format

### ✅ **Comprehensive Profile Data**
- **Education**: Institution, degree, field of study, grades, achievements
- **Skills**: Primary, technical, soft skills with proficiency levels
- **Work Experience**: Complete employment history with achievements
- **Social Links**: LinkedIn, GitHub, Portfolio, Twitter, etc.
- **Location**: Current location and preferences
- **Documents**: Resume, cover letter, certificates, portfolio

## Database Schema

### Core Structure

```javascript
{
  applicationId: ObjectId,        // Reference to main Application
  applicantId: ObjectId,          // Reference to applicant
  jobId: ObjectId,               // Reference to job
  
  // Basic Information
  basicInfo: {
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    bio: String,
    profileImage: String
  },
  
  // Expected Salary (flexible formats)
  expectedSalary: {
    salaryRange: {
      min: Number,              // In thousands (10 = 10K, 1000 = 10L)
      max: Number,
      isNegotiable: Boolean,
      currency: String,         // INR, USD, EUR, GBP
      period: String           // hourly, monthly, yearly
    },
    rawSalaryText: String,      // "10-12 LPA", "15+ LPA"
    displayText: String         // Formatted for display
  },
  
  // Experience (flexible formats)
  experience: {
    totalYears: Number,
    experienceRange: {
      min: Number,
      max: Number,
      isPlus: Boolean          // For "5+" format
    },
    rawExperienceText: String,  // "2-3 years", "5+ years"
    currentJob: {
      jobTitle: String,
      companyName: String,
      isCurrentlyWorking: Boolean,
      startDate: Date,
      endDate: Date
    }
  }
}
```

### Skills Schema

```javascript
skills: {
  primary: [{
    skill: String,
    proficiency: String,        // beginner, intermediate, advanced, expert
    yearsOfExperience: Number
  }],
  technical: [{
    skill: String,
    proficiency: String,
    yearsOfExperience: Number,
    category: String           // Programming, Database, Framework
  }],
  soft: [{
    skill: String,
    proficiency: String
  }],
  languages: [{
    language: String,
    proficiency: String,       // basic, intermediate, advanced, native
    canRead: Boolean,
    canWrite: Boolean,
    canSpeak: Boolean
  }]
}
```

## API Endpoints

### 1. Create Application Information
```http
POST /api/application-information
Authorization: Bearer <token>
Content-Type: application/json

{
  "jobId": "60f7b3b3b3b3b3b3b3b3b3b3",
  "applicationData": {
    "expectedSalary": {
      "salaryRange": {
        "min": 500,
        "max": 800,
        "currency": "INR",
        "period": "monthly"
      },
      "rawSalaryText": "5-8 LPA"
    },
    "experience": {
      "totalYears": 3,
      "experienceRange": {
        "min": 2,
        "max": 4
      },
      "rawExperienceText": "2-4 years"
    },
    "skills": {
      "primary": [
        {
          "skill": "React",
          "proficiency": "advanced",
          "yearsOfExperience": 3
        }
      ]
    }
  }
}
```

### 2. Get Application Information
```http
GET /api/application-information/:applicationId
Authorization: Bearer <token>
```

### 3. Get Applications by Job (Recruiter Only)
```http
GET /api/application-information/job/:jobId
Authorization: Bearer <token>
```

### 4. Get Applications by Applicant
```http
GET /api/application-information/applicant/:applicantId
Authorization: Bearer <token>
```

### 5. Update Application Information
```http
PUT /api/application-information/:applicationId
Authorization: Bearer <token>
Content-Type: application/json

{
  "applicationData": {
    "expectedSalary": {
      "salaryRange": {
        "min": 600,
        "max": 900
      }
    }
  }
}
```

### 6. Search Applications (Recruiter Only)
```http
GET /api/application-information/search?skills=React,Node.js&experience=2-5&location=Mumbai
Authorization: Bearer <token>
```

## Usage Examples

### Frontend Integration

#### 1. Creating Application Information

```javascript
// When applicant applies for a job
const createApplicationInfo = async (jobId, formData) => {
  try {
    const response = await fetch('/api/application-information', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        jobId,
        applicationData: {
          expectedSalary: {
            salaryRange: {
              min: parseInt(formData.salaryMin),
              max: parseInt(formData.salaryMax),
              currency: 'INR',
              period: 'yearly'
            },
            rawSalaryText: `${formData.salaryMin}-${formData.salaryMax} LPA`
          },
          experience: {
            totalYears: parseInt(formData.experience),
            rawExperienceText: `${formData.experience} years`
          },
          skills: {
            primary: formData.skills.map(skill => ({
              skill,
              proficiency: 'intermediate'
            }))
          },
          applicationDetails: {
            motivation: formData.coverLetter,
            additionalInfo: formData.additionalInfo
          }
        }
      })
    });
    
    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error creating application info:', error);
    throw error;
  }
};
```

#### 2. Displaying Application Information

```javascript
// For recruiters viewing applications
const ApplicationCard = ({ applicationInfo }) => {
  return (
    <div className="application-card">
      <h3>{applicationInfo.basicInfo.firstName} {applicationInfo.basicInfo.lastName}</h3>
      <p>Email: {applicationInfo.basicInfo.email}</p>
      <p>Expected Salary: {applicationInfo.formattedSalary}</p>
      <p>Experience: {applicationInfo.formattedExperience}</p>
      <p>Location: {applicationInfo.location.current.city}</p>
      
      <div className="skills">
        <h4>Primary Skills:</h4>
        {applicationInfo.skills.primary.map(skill => (
          <span key={skill.skill} className="skill-tag">
            {skill.skill} ({skill.proficiency})
          </span>
        ))}
      </div>
      
      <div className="documents">
        {applicationInfo.documents.resume?.url && (
          <a href={applicationInfo.documents.resume.url} target="_blank">
            View Resume
          </a>
        )}
      </div>
    </div>
  );
};
```

#### 3. Search and Filter Applications

```javascript
// For recruiters searching applications
const searchApplications = async (filters) => {
  const queryParams = new URLSearchParams();
  
  if (filters.skills) queryParams.append('skills', filters.skills.join(','));
  if (filters.experience) queryParams.append('experience', filters.experience);
  if (filters.location) queryParams.append('location', filters.location);
  if (filters.salaryRange) queryParams.append('salaryRange', filters.salaryRange);
  
  const response = await fetch(`/api/application-information/search?${queryParams}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return response.json();
};
```

## Salary Format Examples

### Input Formats Supported

```javascript
// Range formats
"10-12"     → { min: 1000, max: 1200, period: "yearly" }
"5-8 LPA"   → { min: 500, max: 800, period: "yearly" }
"50-80K"    → { min: 50, max: 80, period: "yearly" }

// Plus formats
"12+"       → { min: 1200, isPlus: true, period: "yearly" }
"15+ LPA"   → { min: 1500, isPlus: true, period: "yearly" }

// Single values
"10"        → { min: 1000, period: "yearly" }
"15 LPA"    → { min: 1500, period: "yearly" }

// Negotiable
"Negotiable" → { isNegotiable: true }
```

### Display Formatting

```javascript
// Virtual getter for formatted salary
formattedSalary: function() {
  const salary = this.expectedSalary;
  if (!salary || !salary.salaryRange) return 'Not specified';
  
  const { min, max, isNegotiable, currency, period } = salary.salaryRange;
  
  if (isNegotiable) return 'Negotiable';
  
  const formatAmount = (amount) => {
    if (amount >= 100) return `${(amount / 100).toFixed(1)}L`; // Lakhs
    return `${amount}K`; // Thousands
  };
  
  if (min && max) {
    return `₹${formatAmount(min)} - ₹${formatAmount(max)} ${period}`;
  } else if (min) {
    return `₹${formatAmount(min)}+ ${period}`;
  }
  
  return 'Not specified';
}
```

## Experience Format Examples

### Input Formats Supported

```javascript
// Range formats
"1-2"       → { min: 1, max: 2 }
"3-5 years" → { min: 3, max: 5 }
"0-1"       → { min: 0, max: 1 }

// Plus formats
"5+"        → { min: 5, isPlus: true }
"10+ years" → { min: 10, isPlus: true }

// Single values
"3"         → { min: 3, max: 3 }
"2 years"   → { min: 2, max: 2 }

// Fresher
"0"         → { min: 0, max: 0 }
"Fresher"   → { min: 0, max: 0 }
```

## Validation Rules

### Salary Validation
- Min/Max values: 0-10000 (in thousands)
- Currency: INR, USD, EUR, GBP
- Period: hourly, monthly, yearly
- Min cannot be greater than max

### Experience Validation
- Years: 0-50
- Min cannot be greater than max
- Date validation for work experience

### Skills Validation
- Maximum 10 primary skills
- Maximum 20 technical skills
- Maximum 10 soft skills
- Maximum 10 languages

### Document Validation
- File size: Maximum 10MB
- File types: PDF, DOC, DOCX for resumes
- URL validation for online documents

## Security & Permissions

### Role-Based Access
- **Applicants**: Can create, view, and update their own application information
- **Recruiters**: Can view application information for jobs they posted
- **Admin**: Full access to all application information

### Data Privacy
- Personal information is only accessible to relevant parties
- Documents are stored securely with proper access controls
- Sensitive data is not logged or exposed in error messages

## Performance Considerations

### Database Indexes
```javascript
// Optimized indexes for common queries
{ applicationId: 1 }                    // Unique lookup
{ applicantId: 1 }                      // Applicant's applications
{ jobId: 1 }                           // Job applications
{ 'skills.primary.skill': 1 }          // Skill-based search
{ 'experience.totalYears': 1 }         // Experience filtering
{ 'expectedSalary.salaryRange.min': 1 } // Salary filtering
```

### Query Optimization
- Use lean() for read-only operations
- Populate only required fields
- Implement pagination for large result sets
- Cache frequently accessed data

## Error Handling

### Common Error Scenarios
```javascript
// Job not found
{
  "success": false,
  "message": "Job not found",
  "code": "JOB_NOT_FOUND"
}

// Validation errors
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "expectedSalary.salaryRange.min",
      "message": "Minimum salary cannot be greater than maximum salary"
    }
  ]
}

// Access denied
{
  "success": false,
  "message": "Access denied. You can only view your own application information."
}
```

## Testing

### Unit Tests
```javascript
describe('ApplicationInformation', () => {
  test('should create application information with valid data', async () => {
    const appInfo = await ApplicationInformation.createFromProfile(
      applicationId,
      applicantId,
      jobId,
      applicantProfile,
      additionalData
    );
    
    expect(appInfo.formattedSalary).toBe('₹5.0L - ₹8.0L yearly');
    expect(appInfo.formattedExperience).toBe('2-4 years');
  });
  
  test('should validate salary range consistency', () => {
    const invalidData = {
      expectedSalary: {
        salaryRange: { min: 1000, max: 500 }
      }
    };
    
    expect(() => validateSalaryRange(invalidData)).toThrow();
  });
});
```

### Integration Tests
```javascript
describe('ApplicationInformation API', () => {
  test('POST /api/application-information should create new record', async () => {
    const response = await request(app)
      .post('/api/application-information')
      .set('Authorization', `Bearer ${token}`)
      .send(validApplicationData)
      .expect(201);
    
    expect(response.body.success).toBe(true);
    expect(response.body.data.applicationInfo).toBeDefined();
  });
});
```

## Migration Guide

### From Existing Application System
```javascript
// Migration script to convert existing applications
const migrateApplications = async () => {
  const applications = await Application.find({}).populate('applicant');
  
  for (const app of applications) {
    if (!app.applicationInfo) {
      const appInfo = await ApplicationInformation.createFromProfile(
        app._id,
        app.applicant._id,
        app.job,
        app.applicant,
        {
          motivation: app.coverLetter,
          documents: {
            resume: { url: app.resume }
          }
        }
      );
      
      app.applicationInfo = appInfo._id;
      await app.save();
    }
  }
};
```

## Best Practices

### 1. Data Consistency
- Always create ApplicationInformation when creating Application
- Use transactions for multi-document operations
- Validate data before saving

### 2. Performance
- Use indexes for frequently queried fields
- Implement pagination for large datasets
- Cache static data like skill categories

### 3. Security
- Validate all input data
- Implement proper access controls
- Sanitize user-generated content

### 4. User Experience
- Provide clear validation messages
- Support multiple input formats
- Show loading states during operations

## Troubleshooting

### Common Issues

#### 1. Application Information Not Created
```javascript
// Check if applicant profile exists
const applicant = await Applicant.findById(applicantId);
if (!applicant) {
  throw new Error('Applicant profile not found');
}

// Check if job is active
const job = await Job.findById(jobId);
if (job.status !== 'active') {
  throw new Error('Job is not accepting applications');
}
```

#### 2. Salary Format Not Recognized
```javascript
// Add custom salary parsing logic
const parseSalary = (salaryText) => {
  // Handle various formats: "10-12", "15+", "Negotiable"
  if (salaryText.toLowerCase() === 'negotiable') {
    return { isNegotiable: true };
  }
  
  const rangeMatch = salaryText.match(/(\d+)-(\d+)/);
  if (rangeMatch) {
    return {
      min: parseInt(rangeMatch[1]) * 100, // Convert to thousands
      max: parseInt(rangeMatch[2]) * 100
    };
  }
  
  // Add more parsing logic as needed
};
```

#### 3. Search Not Working
```javascript
// Ensure proper indexing
await ApplicationInformation.createIndex({ 'skills.primary.skill': 1 });
await ApplicationInformation.createIndex({ 'experience.totalYears': 1 });

// Use text search for complex queries
const searchQuery = {
  $text: { $search: searchTerm },
  'experience.totalYears': { $gte: minExperience }
};
```

## Conclusion

The ApplicationInformation system provides a comprehensive solution for storing and managing detailed applicant data. It supports flexible input formats, maintains data integrity, and provides powerful search and filtering capabilities for recruiters.

Key benefits:
- ✅ Complete applicant profile snapshot
- ✅ Flexible salary and experience formats
- ✅ Comprehensive validation and security
- ✅ Optimized for performance and scalability
- ✅ Easy integration with existing systems

For additional support or feature requests, please refer to the project documentation or contact the development team.
