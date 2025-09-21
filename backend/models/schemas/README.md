# FinAutoJobs Database Schema Documentation

## Overview

This directory contains the comprehensive database schema architecture for the FinAutoJobs job portal platform. The schemas are organized by domain for better maintainability, scalability, and separation of concerns.

## Architecture Principles

- **Domain-Driven Design**: Schemas are organized by business domains
- **Role-Based Access**: User schemas support multiple roles with inheritance
- **Scalability**: Optimized indexes and efficient query patterns
- **Data Integrity**: Comprehensive validation and constraints
- **Privacy Compliance**: GDPR-compliant with data retention policies
- **Analytics Ready**: Built-in tracking and metrics collection

## Schema Organization

### 📁 `/users` - User Management
- **BaseUserSchema.js**: Foundation schema with common user fields
- **ApplicantSchema.js**: Job seeker profiles with skills, experience, preferences
- **RecruiterSchema.js**: Recruiter profiles with company info and hiring metrics
- **AdminSchema.js**: System administrator profiles with permissions and audit trails
- **UserFactory.js**: Factory pattern for unified user model management

### 📁 `/jobs` - Job & Application Management
- **JobSchema.js**: Comprehensive job postings with requirements and benefits
- **JobApplicationSchema.js**: Application tracking with status history and evaluations
- **JobBookmarkSchema.js**: User job bookmarks with categorization and notes
- **InterviewSchema.js**: Interview scheduling, execution, and feedback management

### 📁 `/companies` - Company Profiles
- **CompanySchema.js**: Detailed company information with verification and ratings

### 📁 `/activities` - Activity Tracking
- **UserActivitySchema.js**: User behavior tracking for analytics and personalization

### 📁 `/system` - System Management
- **NotificationSchema.js**: Multi-channel notification system with delivery tracking
- **AnalyticsSchema.js**: Comprehensive metrics and business intelligence

## Key Features

### 🔐 User Management
- **Multi-Role Support**: Applicant, Recruiter, Admin with role-specific fields
- **Profile Completion**: Automatic calculation of profile completeness
- **Authentication**: Password hashing, 2FA, session management
- **Privacy Controls**: Granular privacy settings and data visibility

### 💼 Job Management
- **Rich Job Postings**: Skills, requirements, benefits, location, salary
- **Application Tracking**: Complete application lifecycle management
- **Interview System**: Scheduling, feedback, and evaluation workflows
- **Smart Matching**: Skills-based job recommendations

### 🏢 Company Profiles
- **Verification System**: Document verification and compliance tracking
- **Ratings & Reviews**: Multi-dimensional company ratings
- **Culture & Values**: Mission, vision, perks, and work environment
- **Financial Information**: Funding, valuation, and investor details

### 📊 Analytics & Insights
- **User Behavior**: Activity tracking with engagement metrics
- **Business Intelligence**: KPIs, trends, and forecasting
- **A/B Testing**: Experiment tracking and variant analysis
- **Real-time Metrics**: Dashboard-ready analytics

### 🔔 Communication System
- **Multi-Channel Notifications**: Email, SMS, push, in-app
- **Delivery Tracking**: Status monitoring and retry logic
- **Personalization**: Dynamic content and targeting
- **Compliance**: Unsubscribe handling and consent management

## Database Indexes

### Performance Optimization
```javascript
// User queries
{ 'user.userId': 1, 'activity.type': 1, 'timestamp': -1 }
{ 'email': 1, 'status': 1, 'role': 1 }

// Job searches
{ 'location.city': 1, 'category': 1, 'employmentType': 1 }
{ 'skills.required.name': 1, 'experienceLevel': 1 }

// Application tracking
{ 'job.jobId': 1, 'applicant.applicantId': 1, 'status': 1 }
{ 'recruiter.recruiterId': 1, 'status': 1, 'submittedAt': -1 }

// Analytics queries
{ 'metric.name': 1, 'time.period': 1, 'time.periodStart': -1 }
{ 'dimensions.user.role': 1, 'time.timestamp': -1 }
```

### Text Search Indexes
```javascript
// Full-text search capabilities
{ 'title': 'text', 'description': 'text', 'skills': 'text' }
{ 'firstName': 'text', 'lastName': 'text', 'email': 'text' }
{ 'name': 'text', 'description': 'text', 'industry': 'text' }
```

## Data Validation

### Field Validation
- **Email**: RFC-compliant email validation
- **Phone**: International phone number formats
- **URLs**: Proper URL format validation
- **Dates**: Logical date constraints (e.g., start < end)
- **Enums**: Predefined value sets for consistency

### Business Logic Validation
- **Salary Ranges**: Minimum ≤ Maximum validation
- **Experience**: Logical experience range validation
- **Application Status**: Valid status transitions
- **Interview Scheduling**: Time conflict prevention

## Security Features

### Data Protection
- **Password Hashing**: bcrypt with salt rounds
- **Sensitive Data**: Selective field exclusion from queries
- **API Keys**: Secure storage and rotation
- **Session Management**: Timeout and concurrent session limits

### Privacy Compliance
- **GDPR Ready**: Data retention and deletion policies
- **Consent Tracking**: User consent management
- **Data Anonymization**: PII removal capabilities
- **Audit Trails**: Complete action logging

## Usage Examples

### Creating Users
```javascript
import { createUserModel } from './users/UserFactory.js';

// Create an applicant
const applicant = createUserModel('applicant', {
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  password: 'securePassword123'
});

// Create a recruiter
const recruiter = createUserModel('recruiter', {
  firstName: 'Jane',
  lastName: 'Smith',
  email: 'jane.smith@company.com',
  company: { name: 'TechCorp' }
});
```

### Job Posting
```javascript
import JobSchema from './jobs/JobSchema.js';

const job = new JobSchema({
  title: 'Senior Frontend Developer',
  company: { name: 'TechCorp', companyId: companyId },
  location: { 
    primary: { city: 'Mumbai', state: 'Maharashtra', country: 'India' }
  },
  skills: {
    required: [
      { name: 'React', level: 'advanced', isMandatory: true },
      { name: 'JavaScript', level: 'expert', isMandatory: true }
    ]
  },
  salary: {
    type: 'range',
    minimum: 1500000,
    maximum: 2500000,
    currency: 'INR',
    period: 'yearly'
  }
});
```

### Analytics Tracking
```javascript
import UserActivitySchema from './activities/UserActivitySchema.js';

const activity = new UserActivitySchema({
  user: { userId, role: 'applicant', email },
  activity: {
    type: 'job_apply',
    category: 'application',
    action: 'Applied to job'
  },
  context: {
    resource: { type: 'job', id: jobId, title: 'Senior Developer' }
  }
});
```

## Migration & Maintenance

### Schema Versioning
- Version tracking in schema files
- Migration scripts for schema updates
- Backward compatibility considerations
- Data transformation utilities

### Performance Monitoring
- Query performance tracking
- Index usage analysis
- Storage optimization
- Automated maintenance tasks

## Best Practices

### Development Guidelines
1. **Always use factory methods** for user creation
2. **Validate data** before saving to database
3. **Use indexes** for frequently queried fields
4. **Handle errors gracefully** with proper error messages
5. **Log activities** for audit and analytics purposes

### Production Considerations
1. **Monitor query performance** regularly
2. **Implement data archiving** for old records
3. **Regular backup** and disaster recovery testing
4. **Security audits** and vulnerability assessments
5. **Compliance reviews** for data protection regulations

## Support & Documentation

For detailed API documentation and usage examples, refer to:
- `/docs/api/` - API endpoint documentation
- `/docs/examples/` - Code examples and tutorials
- `/docs/deployment/` - Production deployment guides

## Contributing

When adding new schemas or modifying existing ones:
1. Follow the established naming conventions
2. Add comprehensive validation rules
3. Include appropriate indexes
4. Update this documentation
5. Add unit tests for new functionality

---

**Version**: 1.0.0  
**Last Updated**: January 2025  
**Maintainer**: FinAutoJobs Development Team
