# FinAutoJobs - Production Setup Guide

## 🚀 Production-Ready Dashboard System

This guide covers the complete setup and deployment of the FinAutoJobs production-ready dashboard system with full backend integration.

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [Prerequisites](#prerequisites)
3. [Environment Setup](#environment-setup)
4. [Backend Integration](#backend-integration)
5. [Database Setup](#database-setup)
6. [Authentication System](#authentication-system)
7. [File Upload Configuration](#file-upload-configuration)
8. [Real-time Features](#real-time-features)
9. [Deployment](#deployment)
10. [Monitoring & Analytics](#monitoring--analytics)
11. [Security Considerations](#security-considerations)
12. [Troubleshooting](#troubleshooting)

## 🏗️ System Overview

### Architecture Components

- **Frontend**: React.js with Vite, Tailwind CSS, Framer Motion
- **State Management**: Context API with custom hooks
- **Authentication**: JWT-based with refresh tokens
- **API Layer**: Axios with interceptors and error handling
- **Real-time**: Polling-based notifications (WebSocket ready)
- **File Storage**: Cloud storage integration (Cloudinary/AWS S3)
- **Validation**: Yup schemas with real-time validation
- **UI Components**: Custom components with dark mode support

### Dashboard Features

- **Role-based Access**: Applicant, Recruiter, Admin dashboards
- **Real-time Notifications**: Toast notifications with polling
- **File Management**: Resume, profile picture, document uploads
- **Advanced Search**: Backend-integrated search and filtering
- **Analytics**: Comprehensive reporting and insights
- **Responsive Design**: Mobile-first approach

## 🔧 Prerequisites

### Development Environment

```bash
Node.js >= 18.0.0
npm >= 8.0.0 or yarn >= 1.22.0
Git >= 2.30.0
```

### Production Environment

```bash
# Frontend Hosting
Netlify, Vercel, or AWS S3 + CloudFront

# Backend Hosting
AWS EC2, DigitalOcean, Heroku, or Railway

# Database
PostgreSQL >= 13.0 or MongoDB >= 5.0

# Cache/Sessions
Redis >= 6.0

# File Storage
AWS S3, Cloudinary, or Google Cloud Storage

# Email Service
SendGrid, AWS SES, or Gmail SMTP
```

## 🌍 Environment Setup

### 1. Clone and Install

```bash
git clone <repository-url>
cd FinAutojobs-A-Job-Portal/frontend
npm install
```

### 2. Environment Configuration

Copy the environment template:

```bash
cp env.example .env.local
```

Configure your environment variables:

```env
# API Configuration
VITE_API_URL=https://api.finautojobs.com/api
VITE_APP_NAME=FinAutoJobs
VITE_APP_VERSION=1.0.0

# Authentication
VITE_JWT_SECRET=your-super-secret-jwt-key-here
VITE_JWT_EXPIRES_IN=7d

# File Upload
VITE_MAX_FILE_SIZE=5242880
VITE_ALLOWED_FILE_TYPES=application/pdf,application/msword

# External Services
VITE_CLOUDINARY_CLOUD_NAME=your-cloudinary-name
VITE_CLOUDINARY_API_KEY=your-cloudinary-key

# Feature Flags
VITE_ENABLE_REAL_TIME_NOTIFICATIONS=true
VITE_ENABLE_FILE_UPLOADS=true
VITE_ENABLE_SOCIAL_LOGIN=true

# Production Settings
VITE_NODE_ENV=production
VITE_DEBUG=false
```

### 3. Development Server

```bash
npm run dev
```

Access the application at `http://localhost:3000`

## 🔗 Backend Integration

### API Endpoints Structure

The frontend is configured to work with the following API structure:

```
/api
├── /auth
│   ├── POST /login
│   ├── POST /register
│   ├── POST /logout
│   ├── POST /refresh
│   ├── GET /profile
│   └── PUT /profile
├── /dashboard
│   ├── GET /applicant
│   ├── GET /recruiter
│   └── GET /admin
├── /jobs
│   ├── GET /
│   ├── POST /
│   ├── GET /:id
│   ├── PUT /:id
│   ├── DELETE /:id
│   ├── POST /search
│   ├── GET /saved
│   ├── POST /:id/save
│   └── GET /recommended
├── /applications
│   ├── GET /
│   ├── POST /
│   ├── GET /:id
│   ├── PUT /:id/status
│   └── PUT /bulk-update
├── /files
│   ├── POST /resume
│   ├── POST /profile-picture
│   └── POST /company-logo
└── /notifications
    ├── GET /
    ├── PUT /:id/read
    └── PUT /read-all
```

### API Response Format

All API responses should follow this format:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data here
  },
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

### Error Response Format

```json
{
  "success": false,
  "message": "Error description",
  "error": {
    "code": "ERROR_CODE",
    "field": "fieldName",
    "details": "Detailed error information"
  }
}
```

## 🗄️ Database Setup

### PostgreSQL Schema

```sql
-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'applicant',
    full_name VARCHAR(255),
    phone VARCHAR(20),
    location VARCHAR(255),
    profile_picture_url TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Jobs table
CREATE TABLE jobs (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    requirements TEXT,
    salary_min INTEGER,
    salary_max INTEGER,
    location VARCHAR(255),
    job_type VARCHAR(50),
    experience_level VARCHAR(50),
    company_id INTEGER REFERENCES companies(id),
    recruiter_id INTEGER REFERENCES users(id),
    application_deadline DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Applications table
CREATE TABLE applications (
    id SERIAL PRIMARY KEY,
    job_id INTEGER REFERENCES jobs(id),
    applicant_id INTEGER REFERENCES users(id),
    cover_letter TEXT,
    resume_url TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Companies table
CREATE TABLE companies (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    website VARCHAR(255),
    industry VARCHAR(100),
    company_size VARCHAR(50),
    logo_url TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications table
CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Indexes for Performance

```sql
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_jobs_active ON jobs(is_active);
CREATE INDEX idx_jobs_company ON jobs(company_id);
CREATE INDEX idx_applications_job ON applications(job_id);
CREATE INDEX idx_applications_applicant ON applications(applicant_id);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read);
```

## 🔐 Authentication System

### JWT Token Structure

```javascript
// Access Token Payload
{
  "sub": "user_id",
  "email": "user@example.com",
  "role": "applicant",
  "iat": 1640995200,
  "exp": 1641081600
}

// Refresh Token Payload
{
  "sub": "user_id",
  "type": "refresh",
  "iat": 1640995200,
  "exp": 1641600000
}
```

### Frontend Token Management

The frontend automatically handles:

- Token storage in localStorage
- Automatic token refresh
- Request interceptors for authentication
- Logout on token expiration
- Role-based route protection

### Backend Authentication Middleware

```javascript
// Example middleware for token verification
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Access token required' 
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ 
        success: false, 
        message: 'Invalid or expired token' 
      });
    }
    req.user = user;
    next();
  });
};
```

## 📁 File Upload Configuration

### Frontend Configuration

The frontend supports multiple file upload scenarios:

```javascript
// Resume Upload
const uploadResume = async (file) => {
  const formData = new FormData();
  formData.append('resume', file);
  
  return await filesAPI.uploadResume(formData);
};

// Profile Picture Upload
const uploadProfilePicture = async (file) => {
  const formData = new FormData();
  formData.append('profilePicture', file);
  
  return await filesAPI.uploadProfilePicture(formData);
};
```

### Backend File Handling

```javascript
// Example using multer and cloudinary
const multer = require('multer');
const cloudinary = require('cloudinary').v2;

const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'application/msword'];
    cb(null, allowedTypes.includes(file.mimetype));
  }
});

const uploadToCloudinary = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder, resource_type: 'auto' },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    ).end(buffer);
  });
};
```

## ⚡ Real-time Features

### Notification Polling

The frontend implements polling for real-time notifications:

```javascript
// Automatic polling every 30 seconds
const { data: notifications } = usePolling(
  () => notificationsAPI.getNotifications({ unread: true }),
  30000
);
```

### WebSocket Integration (Optional)

For true real-time features, you can integrate WebSocket:

```javascript
// WebSocket connection
const useWebSocket = (url) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const ws = new WebSocket(url);
    
    ws.onopen = () => {
      setConnected(true);
      setSocket(ws);
    };
    
    ws.onclose = () => {
      setConnected(false);
      setSocket(null);
    };
    
    return () => ws.close();
  }, [url]);

  return { socket, connected };
};
```

## 🚀 Deployment

### Frontend Deployment (Netlify)

1. **Build the application:**

```bash
npm run build
```

2. **Deploy to Netlify:**

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=dist
```

3. **Environment Variables:**

Set the following in Netlify dashboard:
- `VITE_API_URL`
- `VITE_CLOUDINARY_CLOUD_NAME`
- `VITE_ENABLE_*` feature flags

### Frontend Deployment (Vercel)

1. **Install Vercel CLI:**

```bash
npm install -g vercel
```

2. **Deploy:**

```bash
vercel --prod
```

3. **Configure vercel.json:**

```json
{
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ]
}
```

### Backend Deployment

Choose your preferred platform:

- **AWS EC2**: Full control, requires setup
- **Heroku**: Easy deployment, good for MVPs
- **Railway**: Modern alternative to Heroku
- **DigitalOcean App Platform**: Balanced option

### Database Deployment

- **AWS RDS**: Managed PostgreSQL
- **Heroku Postgres**: Easy setup
- **DigitalOcean Managed Database**: Cost-effective
- **Supabase**: PostgreSQL with real-time features

## 📊 Monitoring & Analytics

### Error Tracking

Integrate error tracking services:

```javascript
// Sentry integration
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: process.env.NODE_ENV,
});
```

### Performance Monitoring

```javascript
// Web Vitals tracking
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

getCLS(console.log);
getFID(console.log);
getFCP(console.log);
getLCP(console.log);
getTTFB(console.log);
```

### Analytics Integration

```javascript
// Google Analytics 4
import { gtag } from 'ga-gtag';

gtag('config', 'GA_MEASUREMENT_ID', {
  page_title: document.title,
  page_location: window.location.href,
});
```

## 🔒 Security Considerations

### Frontend Security

1. **Environment Variables**: Never expose sensitive data
2. **XSS Protection**: Sanitize user inputs
3. **CSRF Protection**: Use CSRF tokens for forms
4. **Content Security Policy**: Implement CSP headers
5. **HTTPS**: Always use HTTPS in production

### Backend Security

1. **Input Validation**: Validate all inputs
2. **SQL Injection**: Use parameterized queries
3. **Rate Limiting**: Implement API rate limiting
4. **CORS**: Configure CORS properly
5. **Security Headers**: Use security headers

### Example Security Headers

```javascript
// Express.js security middleware
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

## 🛠️ Troubleshooting

### Common Issues

1. **CORS Errors**
   - Configure backend CORS settings
   - Check API URL in environment variables

2. **Authentication Issues**
   - Verify JWT secret matches
   - Check token expiration times

3. **File Upload Failures**
   - Check file size limits
   - Verify allowed file types
   - Ensure cloud storage credentials

4. **Database Connection Issues**
   - Verify database credentials
   - Check network connectivity
   - Ensure database is running

### Debug Mode

Enable debug mode for detailed logging:

```env
VITE_DEBUG=true
```

### Performance Issues

1. **Slow Loading**
   - Implement code splitting
   - Optimize images
   - Use CDN for static assets

2. **Memory Leaks**
   - Check for unsubscribed event listeners
   - Verify useEffect cleanup

### Support

For technical support:
- Email: support@finautojobs.com
- Documentation: [Link to docs]
- GitHub Issues: [Link to repository]

---

## 🎉 Congratulations!

Your FinAutoJobs production-ready dashboard is now set up and ready for deployment. The system includes:

✅ Complete backend integration
✅ Real-time notifications
✅ File upload capabilities
✅ Advanced authentication
✅ Comprehensive error handling
✅ Production-ready deployment configuration

Happy coding! 🚀
