# FinAutoJobs Backend API (Mongoose)

A comprehensive, enterprise-grade backend API for the FinAutoJobs job portal application built with Node.js, Express.js, and Mongoose ODM for MongoDB.

## 🚀 Features

### Core Functionality
- **User Management**: Role-based authentication (Applicant, Recruiter, Admin)
- **Job Management**: Complete job posting, searching, and application system
- **Company Profiles**: Comprehensive company management with verification
- **Application Tracking**: Full application lifecycle management
- **Analytics & Insights**: User activity tracking and business intelligence
- **Notifications**: Multi-channel notification system

### Technical Features
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT-based with refresh tokens
- **Security**: Helmet, CORS, rate limiting, input sanitization
- **Validation**: Comprehensive request validation
- **Error Handling**: Centralized error management
- **Logging**: Morgan HTTP request logging
- **Performance**: Compression, caching, optimized queries

## 📋 Prerequisites

- Node.js >= 18.0.0
- MongoDB >= 5.0
- npm or yarn package manager

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd FinAutojobs-A-Job-Portal/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or using the mongoose-specific package.json
   cp package-mongoose.json package.json
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables**
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # Database
   MONGODB_URI=mongodb://localhost:27017/finautojobs

   # JWT Secrets
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production

   # CORS
   CORS_ORIGIN=http://localhost:3001

   # Optional: Email Service (for notifications)
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password

   # Optional: SMS Service (for notifications)
   TWILIO_ACCOUNT_SID=your-twilio-sid
   TWILIO_AUTH_TOKEN=your-twilio-token
   TWILIO_PHONE_NUMBER=your-twilio-phone
   ```

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server will start on `http://localhost:5000` (or your configured PORT).

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "SecurePass123!",
  "role": "applicant"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john.doe@example.com",
  "password": "SecurePass123!"
}
```

#### Get Profile
```http
GET /api/auth/profile
Authorization: Bearer <your-jwt-token>
```

### Job Endpoints

#### Get All Jobs
```http
GET /api/jobs?page=1&limit=20&keywords=developer&location=remote
```

#### Create Job (Recruiter/Admin only)
```http
POST /api/jobs
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "title": "Senior Full Stack Developer",
  "description": "We are looking for an experienced full stack developer...",
  "requirements": {
    "skills": ["JavaScript", "React", "Node.js", "MongoDB"],
    "experience": "3-5 years",
    "education": "Bachelor's degree in Computer Science or related field"
  },
  "location": {
    "type": "hybrid",
    "city": "San Francisco",
    "state": "CA",
    "country": "USA"
  },
  "employmentType": "full_time",
  "experienceLevel": "mid",
  "salary": {
    "min": 80000,
    "max": 120000,
    "currency": "USD",
    "period": "yearly"
  },
  "company": {
    "name": "Tech Innovations Inc.",
    "companyId": "company-id-here"
  }
}
```

#### Apply to Job (Applicant only)
```http
POST /api/jobs/{jobId}/apply
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "coverLetter": "I am excited to apply for this position...",
  "resume": {
    "url": "https://example.com/resume.pdf",
    "filename": "john_doe_resume.pdf"
  }
}
```

### Application Endpoints

#### Get Applications
```http
GET /api/applications?status=submitted,under_review&page=1&limit=20
Authorization: Bearer <your-jwt-token>
```

#### Update Application Status (Recruiter/Admin only)
```http
PUT /api/applications/{applicationId}/status
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "status": "shortlisted",
  "feedback": "Great candidate, moving to next round",
  "notes": "Technical skills look strong"
}
```

### Company Endpoints

#### Get Companies
```http
GET /api/companies?industry=technology&verified=true&page=1&limit=20
```

#### Create Company (Recruiter/Admin only)
```http
POST /api/companies
Authorization: Bearer <your-jwt-token>
Content-Type: application/json

{
  "name": "Tech Innovations Inc.",
  "description": "A leading technology company...",
  "industry": "Technology",
  "size": "medium",
  "location": {
    "country": "USA",
    "state": "CA",
    "city": "San Francisco",
    "address": "123 Tech Street"
  },
  "website": "https://techinnovations.com"
}
```

## 🔐 Authentication & Authorization

### JWT Token Structure
```json
{
  "userId": "user-id",
  "userRole": "applicant|recruiter|admin",
  "email": "user@example.com",
  "name": "User Name",
  "iat": 1234567890,
  "exp": 1234567890
}
```

### Role-Based Access Control

- **Applicant**: Can view jobs, apply to jobs, manage own applications
- **Recruiter**: Can create/manage jobs, view/manage applications for their jobs, manage company profiles
- **Admin**: Full access to all resources, user management, system administration

### Protected Routes
All routes requiring authentication should include the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## 📊 Database Schema

### User Collections
- **applicants**: Applicant-specific data (skills, experience, preferences)
- **recruiters**: Recruiter-specific data (company info, recruiting metrics)
- **admins**: Admin-specific data (permissions, audit logs)

### Core Collections
- **jobs**: Job postings with comprehensive details
- **jobapplications**: Application tracking with status history
- **companies**: Company profiles with verification status
- **useractivities**: User activity tracking for analytics
- **notifications**: Multi-channel notification system
- **analytics**: Business intelligence and metrics

## 🧪 Testing

### Run Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Test Coverage
```bash
npm run test:coverage
```

## 🚀 Deployment

### Environment Variables for Production
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/finautojobs
JWT_SECRET=your-production-jwt-secret
JWT_REFRESH_SECRET=your-production-refresh-secret
CORS_ORIGIN=https://your-frontend-domain.com
```

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 📈 Performance Optimization

### Database Indexes
The application includes optimized indexes for:
- User authentication (email, role)
- Job searching (title, skills, location, status)
- Application filtering (status, dates, user references)
- Analytics queries (timestamps, user activities)

### Caching Strategy
- JWT token validation caching
- Frequently accessed data caching
- Database query result caching

## 🔧 Monitoring & Logging

### Health Check
```http
GET /health
```

### API Documentation
```http
GET /api/docs
```

### Log Levels
- **Development**: Detailed request/response logging
- **Production**: Error and access logging only

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the API documentation at `/api/docs`

---

**FinAutoJobs Backend API v1.0.0**  
Built with ❤️ by the FinAutoJobs Team
