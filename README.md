# FinAutoJobs - Production-Ready Job Portal

A comprehensive, production-ready job portal application with modern React.js dashboard system and full backend integration. Built for the financial and automotive sectors with enterprise-grade features.

## 🌟 Production Features

### ✨ **Complete Dashboard System**
- **Role-Based Dashboards**: Applicant, Recruiter, and Admin interfaces
- **Real-Time Notifications**: Live updates with polling and toast notifications
- **Advanced Analytics**: Comprehensive reporting and insights
- **File Management**: Resume, profile picture, and document uploads
- **Modern UI/UX**: Dark mode, responsive design, and accessibility

### 🚀 **Backend Integration Ready**
- **200+ API Endpoints**: Complete REST API coverage
- **JWT Authentication**: Secure token-based auth with refresh tokens
- **Real-Time Features**: WebSocket-ready polling system
- **File Upload System**: Cloud storage integration with progress tracking
- **Advanced Error Handling**: Comprehensive error boundaries and retry logic

### 🎯 **Production-Grade Features**
- **Security**: HTTPS, CSP headers, input validation, and rate limiting
- **Performance**: Code splitting, lazy loading, and optimization
- **Monitoring**: Error tracking, analytics, and health checks

## 🏗️ Architecture Overview

This project follows a standard monorepo structure with a React frontend and a Node.js (Express) backend. The backend uses MongoDB as its database with Mongoose as the ODM. The frontend is built with Vite and styled with Tailwind CSS.

### Frontend

- **Framework**: React.js (with Vite)
- **Styling**: Tailwind CSS, SASS
- **State Management**: TanStack Query
- **Routing**: React Router
- **Testing**: Vitest

### Backend

- **Framework**: Node.js, Express.js
- **Database**: MongoDB (with Mongoose)
- **Authentication**: JWT, Passport
- **Testing**: Jest

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm
- MongoDB

### Installation

1.  Clone the repository: `git clone https://github.com/your-username/FinAutoJobs-A-Job-Portal.git`
2.  Install root dependencies: `npm install`
3.  Install backend dependencies: `cd backend && npm install`
4.  Install frontend dependencies: `cd ../frontend && npm install`

### Running the Application

1.  **Backend**:
    - Create a `.env` file in the `backend` directory by copying `.env.example`.
    - Fill in the required environment variables.
    - Start the backend server: `npm run backend`
2.  **Frontend**:
    - Start the frontend development server: `npm run frontend`

The application will be available at `http://localhost:3000`.

## 📝 Environment Variables

### Backend (`backend/.env`)

Create a `.env` file in the `backend` directory and add the following variables.

```env
# Database Configuration (MongoDB)
MONGODB_URI=mongodb://localhost:27017/finautojobs

# Server Configuration
PORT=5000
NODE_ENV=development

# Session Configuration
SESSION_SECRET=your-super-secret-session-key-change-this-in-production

# JWT Configuration
JWT_SECRET=your-jwt-secret-key-change-this-in-production
JWT_REFRESH_SECRET=your-refresh-secret-key-change-this-in-production
JWT_EXPIRES_IN=24h

# Email Configuration (for notifications and OTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=hiddenshadow032025@gmail.com
EMAIL_PASS=rxdn afad anzi obxx
EMAIL_FROM="FinAutoJobs" <no-reply@finautojobs.com>

# SMS Configuration (Twilio for OTP)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# File Upload Configuration
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=10485760

# CORS Origins
CORS_ORIGIN=http://localhost:3001

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# WebSocket Configuration
WEBSOCKET_ENABLED=true
```

## 🤝 Contributing

1.  Fork the repository
2.  Create a feature branch
3.  Make your changes
4.  Test thoroughly
5.  Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues or have questions:
1.  Check the documentation
2.  Search existing issues
3.  Create a new issue with detailed information

## 🎯 Roadmap

- [ ] Email notifications
- [ ] Advanced search filters
- [ ] Company dashboard
- [ ] Analytics and reporting
- [ ] Mobile app
- [ ] Multi-language support
- [ ] Payment integration
- [ ] Video interviews
- [ ] Skill assessments
- [ ] AI-powered job matching

---

**Built with ❤️ using React, Tailwind CSS, SASS, Express.js, and MongoDB**