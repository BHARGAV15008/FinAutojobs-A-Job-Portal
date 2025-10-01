# FinAutoJobs Enhanced Backend

## 🚀 Complete MERN Job Portal Backend Solution

This is a comprehensive, production-ready backend for the FinAutoJobs MERN stack job portal application. It provides all the necessary APIs, real-time features, and infrastructure for a modern job portal platform.

## ✨ Features

### 🔐 Authentication & Authorization
- JWT-based authentication with refresh tokens
- Role-based access control (Applicant, Recruiter, Admin)
- Password reset and email verification
- Multi-role support (same email for different roles)
- Session management and security

### 👥 User Management
- Comprehensive user profiles for applicants and recruiters
- Profile completion tracking
- Social links and professional information
- Real-time profile analytics

### 💼 Job Management
- Complete job posting and management system
- Advanced search and filtering
- Job recommendations based on skills matching
- Job analytics and performance tracking
- Salary range management with multiple periods

### 📄 Application System
- Full application lifecycle management
- Status tracking with timeline
- Application analytics and funnel metrics
- Bulk operations for recruiters
- Application withdrawal and status updates

### 📋 Resume Management
- Multiple resume upload and management
- Resume parsing and content extraction
- Version control and default resume setting
- Resume analytics (views, downloads)
- File validation and security

### ⭐ Favorites System
- Job bookmarking with tags and priorities
- Bulk operations on favorites
- Reminder system for application deadlines
- Advanced filtering and organization

### 💬 Real-time Messaging
- Direct messaging between recruiters and applicants
- Real-time message delivery with Socket.IO
- Message status tracking (sent, delivered, read)
- Conversation management
- Message search and history

### 📅 Interview Management
- Interview scheduling with conflict detection
- Multiple interview rounds support
- Interview rescheduling and cancellation
- Status tracking and feedback collection
- Email notifications for all interview events

### 📊 Advanced Analytics
- Comprehensive dashboard analytics for all roles
- Real-time statistics and metrics
- Profile view tracking
- Job performance analytics
- Application funnel analysis
- Time-series data for trends

### 📧 Email & Notifications
- Comprehensive email template system
- Real-time push notifications
- Notification preferences management
- Bulk email capabilities
- Email verification and password reset

### 🔍 Search & Recommendations
- Advanced job search with multiple filters
- AI-powered job recommendations
- Skill-based matching algorithm
- Location and salary filtering
- Similar job suggestions

### 📈 Reporting System
- Automated report generation
- Scheduled reports with email delivery
- Custom report creation
- Data export capabilities
- Performance metrics and KPIs

## 🏗️ Architecture

### Database Schema
```
├── Users (BaseUser with discriminator pattern)
│   ├── Applicants (extended with skills, experience, etc.)
│   └── Recruiters (extended with company info, etc.)
├── Jobs (with full job posting details)
├── Applications (with status tracking and timeline)
├── Resumes (with file management and parsing)
├── Favorites (with tags and priorities)
├── Messages (real-time messaging system)
├── Interviews (scheduling and management)
├── Analytics (comprehensive tracking)
├── Notifications (multi-channel notifications)
└── Reports (automated reporting system)
```

### API Structure
```
/api/v2/
├── auth/          # Authentication endpoints
├── jobs/          # Job management
├── applications/  # Application system
├── resumes/       # Resume management
├── favorites/     # Favorites system
├── messages/      # Real-time messaging
├── interviews/    # Interview management
├── analytics/     # Analytics and reporting
└── notifications/ # Notification system
```

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ 
- MongoDB 4.4+
- Redis (optional, for caching)

### Installation

1. **Clone and install dependencies:**
```bash
cd backend
npm install
```

2. **Environment Configuration:**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Required Environment Variables:**
```env
# Database
MONGODB_URI=mongodb://localhost:27017/finauto_jobs

# JWT
JWT_SECRET=your-super-secure-jwt-secret-key
JWT_EXPIRES_IN=7d

# Email Service
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@finautojobs.com

# Frontend URL
FRONTEND_URL=http://localhost:3000

# File Upload
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# Redis (optional)
REDIS_URL=redis://localhost:6379
```

4. **Start the server:**
```bash
# Development
npm run dev

# Production
npm start

# Enhanced server with all features
node server-enhanced.js
```

## 📋 API Documentation

### Authentication Endpoints

#### POST /api/v2/auth/register
Register a new user (applicant or recruiter)

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "firstName": "John",
  "lastName": "Doe",
  "role": "applicant",
  "phone": "+1234567890",
  "companyName": "Tech Corp" // for recruiters
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": { /* user object */ },
    "token": "jwt-token",
    "expiresIn": "7d"
  }
}
```

#### POST /api/v2/auth/login
Authenticate user and get access token

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "rememberMe": true
}
```

### Job Management Endpoints

#### GET /api/v2/jobs
Get jobs with advanced filtering and search

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)
- `search` - Search query
- `location` - Location filter
- `jobType` - Job type filter
- `workType` - Work type filter
- `salaryMin` - Minimum salary
- `salaryMax` - Maximum salary
- `skills` - Skills filter (comma-separated)
- `remote` - Remote work filter
- `sortBy` - Sort field
- `sortOrder` - Sort order (asc/desc)

#### POST /api/v2/jobs
Create a new job posting (Recruiter only)

**Request:**
```json
{
  "jobTitle": "Senior React Developer",
  "companyName": "Tech Corp",
  "description": "We are looking for...",
  "location": {
    "city": "San Francisco",
    "state": "CA",
    "country": "USA"
  },
  "jobType": "full-time",
  "workType": "hybrid",
  "experienceLevel": "senior",
  "salary": {
    "amount": 120000,
    "currency": "USD",
    "period": "yearly"
  },
  "requiredSkills": ["React", "JavaScript", "Node.js"],
  "applicationDeadline": "2024-12-31T23:59:59Z"
}
```

### Application System Endpoints

#### POST /api/v2/applications
Submit a job application

**Request:**
```json
{
  "jobId": "job-id",
  "resumeId": "resume-id",
  "coverLetter": "I am interested in...",
  "expectedSalary": 100000,
  "availabilityDate": "2024-02-01"
}
```

#### PUT /api/v2/applications/:id/status
Update application status (Recruiter only)

**Request:**
```json
{
  "status": "shortlisted",
  "notes": "Great candidate, moving to next round",
  "feedback": "Strong technical skills"
}
```

### Resume Management Endpoints

#### POST /api/v2/resumes/upload
Upload a new resume

**Request:** (multipart/form-data)
- `resume` - Resume file (PDF, DOC, DOCX)
- `title` - Resume title
- `description` - Resume description
- `isDefault` - Set as default resume

#### GET /api/v2/resumes
Get user's resumes

#### GET /api/v2/resumes/:id/download
Download resume file

### Real-time Messaging Endpoints

#### POST /api/v2/messages/conversation
Create or get conversation

**Request:**
```json
{
  "participantId": "user-id"
}
```

#### POST /api/v2/messages
Send a message

**Request:**
```json
{
  "recipientId": "user-id",
  "content": "Hello, I'm interested in the position",
  "subject": "Job Inquiry"
}
```

### Analytics Endpoints

#### GET /api/v2/analytics/dashboard/:role
Get comprehensive dashboard analytics

**Roles:** `applicant`, `recruiter`, `admin`

**Response:**
```json
{
  "success": true,
  "data": {
    "role": "applicant",
    "analytics": {
      "applications": {
        "total": 25,
        "pending": 10,
        "shortlisted": 8,
        "interviewed": 5,
        "hired": 2,
        "shortlistRate": "32.0",
        "hireRate": "8.0"
      },
      "profile": {
        "views": { "total": 150, "thisMonth": 45 },
        "completeness": 85
      },
      "trends": [ /* monthly data */ ]
    }
  }
}
```

## 🔧 Advanced Features

### Real-time Socket.IO Events

#### Client-side Connection
```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

// Authenticate
socket.emit('authenticate', { userId, role });

// Join conversation
socket.emit('join_conversation', conversationId);

// Send message
socket.emit('send_message', { conversationId, message });

// Listen for events
socket.on('new_message', (data) => {
  // Handle new message
});

socket.on('notification', (data) => {
  // Handle notification
});
```

### Email Templates

The system includes comprehensive email templates for:
- Email verification
- Password reset
- Application confirmations
- Status updates
- Interview scheduling
- Job alerts

### File Upload System

Supports secure file uploads with:
- File type validation
- Size limits
- Virus scanning (configurable)
- Cloud storage integration ready
- Automatic thumbnail generation

### Analytics & Reporting

Comprehensive analytics system tracking:
- User engagement metrics
- Job performance data
- Application funnel analysis
- Profile completion rates
- Search and filter usage
- Time-series trends

## 🛡️ Security Features

### Authentication Security
- Bcrypt password hashing with salt rounds
- JWT tokens with expiration
- Rate limiting on auth endpoints
- Account lockout after failed attempts
- Password strength requirements

### Data Protection
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CORS configuration
- Helmet security headers
- File upload restrictions

### API Security
- Role-based access control
- Resource ownership verification
- Request rate limiting
- Payload size limits
- Error message sanitization

## 📊 Performance Optimizations

### Database Optimizations
- Proper indexing on frequently queried fields
- Aggregation pipelines for analytics
- Connection pooling
- Query optimization
- Data pagination

### Caching Strategy
- Redis caching for frequently accessed data
- API response caching
- Session storage optimization
- File caching for uploads

### Real-time Optimizations
- Socket.IO connection management
- Room-based message broadcasting
- Event debouncing
- Connection pooling

## 🧪 Testing

### Running Tests
```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# Coverage report
npm run test:coverage
```

### Test Structure
```
tests/
├── unit/
│   ├── models/
│   ├── services/
│   └── utils/
├── integration/
│   ├── auth/
│   ├── jobs/
│   └── applications/
└── fixtures/
```

## 🚀 Deployment

### Production Setup

1. **Environment Configuration:**
```bash
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/finauto_jobs
JWT_SECRET=production-secret-key
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=your-sendgrid-key
```

2. **Process Management:**
```bash
# Using PM2
npm install -g pm2
pm2 start server-enhanced.js --name "finauto-backend"
pm2 startup
pm2 save
```

3. **Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name api.finautojobs.com;
    
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### Docker Deployment
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["node", "server-enhanced.js"]
```

## 📝 API Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data
  },
  "pagination": {
    // Pagination info (for list endpoints)
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message",
  "errors": [
    // Validation errors array
  ]
}
```

## 🔄 Migration Guide

### From Legacy Backend
1. Update API endpoints to use `/api/v2/`
2. Update authentication headers
3. Modify response handling for new format
4. Update Socket.IO event listeners
5. Configure new environment variables

### Database Migration
```bash
# Run migration script
node scripts/migrate-to-enhanced.js
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Ensure all tests pass
6. Submit a pull request

## 📞 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the API examples
- Test with the provided Postman collection

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**🎉 Your enhanced FinAutoJobs backend is ready for production!**

This comprehensive backend provides all the features needed for a modern job portal platform with real-time capabilities, advanced analytics, and production-ready security.
