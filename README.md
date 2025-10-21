# FinAutoJobs - Job Portal Platform 🚀

A comprehensive job portal platform built with modern web technologies, featuring real-time data synchronization and MongoDB Atlas cloud database.

## 🏗️ Architecture

### Frontend
- **React 18** with modern hooks and context
- **Material-UI (MUI)** for professional UI components
- **Real-time data fetching** with custom hooks
- **Responsive design** for all devices
- **TypeScript support** for type safety

### Backend
- **Node.js & Express** REST API
- **MongoDB Atlas** cloud database (exclusively)
- **Mongoose ODM** for data modeling
- **JWT authentication** with refresh tokens
- **Real-time WebSocket** communication
- **Comprehensive API** with role-based access

### Database
- **MongoDB Atlas** - Cloud-native NoSQL database
- **Mongoose schemas** for data validation
- **Automatic indexing** for performance
- **Real-time synchronization** across all clients
- **Enterprise-grade security** and backups

## ✨ Key Features

### For Job Seekers (Applicants)
- 🔍 **Advanced Job Search** with filters and recommendations
- 📝 **Application Tracking** with real-time status updates
- 📊 **Personal Analytics** dashboard
- 🔔 **Smart Notifications** for job matches and updates
- 💼 **Profile Management** with skills and experience
- ⭐ **Job Bookmarking** and alerts

### For Employers (Recruiters)
- 📋 **Job Posting** with rich descriptions and requirements
- 👥 **Applicant Management** with filtering and sorting
- 📈 **Company Analytics** and hiring insights
- 💬 **Direct Messaging** with candidates
- 🎯 **Candidate Matching** algorithms
- 📊 **Recruitment Pipeline** tracking

### For Administrators
- 🛡️ **User Management** with role-based permissions
- 🏢 **Company Verification** and moderation
- 📊 **Platform Analytics** and reporting
- 🚨 **Content Moderation** tools
- ⚙️ **System Configuration** and monitoring

## 🚀 Quick Start

### Prerequisites
- Node.js 20+ and npm 10+
- MongoDB Atlas account and cluster
- Git for version control

### 1. Clone Repository
```bash
git clone https://github.com/finautojobs/FinAutojobs-A-Job-Portal.git
cd FinAutojobs-A-Job-Portal
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and other config
npm run setup:mongodb
npm run dev
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
cp .env.example .env
# Edit .env with backend URL
npm start
```

### 4. Access Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health**: http://localhost:5000/api/health

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```bash
# Database (MongoDB Atlas)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/finautojobs

# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Authentication
JWT_SECRET=your-jwt-secret-key
JWT_REFRESH_SECRET=your-refresh-secret-key

# Email Service
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

#### Frontend (.env)
```bash
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_WEBSOCKET_URL=http://localhost:5000
REACT_APP_ENV=development
```

## 📊 Database Schema

### Core Collections
- **users** - Base user accounts with authentication
- **applicants** - Job seeker profiles and preferences
- **recruiters** - Employer profiles and company associations
- **companies** - Company information and verification
- **jobs** - Job postings with requirements and benefits
- **applications** - Job applications with status tracking
- **notifications** - Real-time user notifications
- **messages** - Direct messaging between users
- **interviews** - Interview scheduling and management

### Analytics Collections
- **user_analytics** - User activity and engagement metrics
- **job_analytics** - Job performance and application stats
- **company_analytics** - Recruitment and hiring insights
- **platform_analytics** - Overall platform metrics

## 🔗 API Endpoints

### Authentication
```
POST /api/auth/register     - User registration
POST /api/auth/login        - User login
POST /api/auth/refresh      - Token refresh
POST /api/auth/logout       - User logout
```

### Jobs
```
GET    /api/jobs                 - Get all jobs
GET    /api/jobs/recommended     - Get recommended jobs
GET    /api/jobs/search          - Search jobs
GET    /api/jobs/:id             - Get single job
POST   /api/jobs                 - Create job (recruiters)
PUT    /api/jobs/:id             - Update job
DELETE /api/jobs/:id             - Delete job
```

### Applications
```
GET  /api/applications/my-applications  - Get user applications
POST /api/applications                  - Submit application
GET  /api/applications/job/:jobId       - Get job applications
PUT  /api/applications/:id              - Update application status
```

### Analytics
```
GET /api/analytics/user        - User analytics
GET /api/analytics/company     - Company analytics
GET /api/analytics/platform    - Platform analytics (admin)
```

### Admin
```
GET    /api/admin/users           - Get all users
GET    /api/admin/companies       - Get all companies
GET    /api/admin/moderation      - Get moderation items
POST   /api/admin/moderation/:id/approve - Approve content
POST   /api/admin/moderation/:id/reject  - Reject content
```

## 🛡️ Security Features

### Authentication & Authorization
- **JWT tokens** with automatic refresh
- **Role-based access control** (applicant, recruiter, admin)
- **Session management** with MongoDB store
- **Password hashing** with bcrypt
- **Account lockout** protection

### Data Protection
- **Input validation** and sanitization
- **XSS protection** with helmet
- **SQL injection prevention** (NoSQL injection for MongoDB)
- **Rate limiting** on API endpoints
- **CORS configuration** for cross-origin requests

### Database Security
- **MongoDB Atlas** enterprise security
- **TLS/SSL encryption** in transit
- **Network access control** with IP whitelisting
- **Automatic backups** and point-in-time recovery

## 📈 Performance & Monitoring

### Database Optimization
- **Automatic indexing** for frequently queried fields
- **Aggregation pipelines** for complex analytics
- **Connection pooling** for optimal resource usage
- **Query optimization** with MongoDB Compass

### Application Performance
- **React code splitting** for faster loading
- **API response caching** where appropriate
- **Image optimization** and lazy loading
- **Bundle size optimization** with webpack

### Monitoring
- **MongoDB Atlas monitoring** dashboard
- **Application health checks** endpoint
- **Error logging** and tracking
- **Performance metrics** collection

## 🚀 Deployment

### Production Environment
```bash
# Backend
npm run build
npm start

# Frontend
npm run build
# Serve build folder with nginx or similar
```

### Environment Setup
- **MongoDB Atlas** production cluster
- **Environment variables** for production
- **SSL certificates** for HTTPS
- **Domain configuration** and DNS

### Recommended Hosting
- **Backend**: Railway, Render, or AWS EC2
- **Frontend**: Vercel, Netlify, or AWS S3 + CloudFront
- **Database**: MongoDB Atlas (already cloud-native)

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test
```

### Frontend Testing
```bash
cd frontend
npm test
```

### API Testing
```bash
# Test API endpoints
npm run test:api

# Test authentication
npm run test:auth
```

## 📚 Documentation

- [MongoDB Migration Guide](backend/MONGODB_MIGRATION.md)
- [API Documentation](docs/API.md)
- [Frontend Components](frontend/docs/)
- [Database Schema](docs/DATABASE.md)
- [Deployment Guide](docs/DEPLOYMENT.md)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Development Guidelines
- Follow ESLint configuration
- Write tests for new features
- Update documentation
- Use conventional commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **MongoDB Atlas** for cloud database services
- **Material-UI** for React components
- **Express.js** for backend framework
- **React** for frontend framework
- **Mongoose** for MongoDB object modeling

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/finautojobs/FinAutojobs-A-Job-Portal/issues)
- **Discussions**: [GitHub Discussions](https://github.com/finautojobs/FinAutojobs-A-Job-Portal/discussions)
- **Email**: support@finautojobs.com

---

**FinAutoJobs** - Connecting talent with opportunity through modern technology 🌟
