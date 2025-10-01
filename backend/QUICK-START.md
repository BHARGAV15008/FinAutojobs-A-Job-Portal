# 🚀 FinAutoJobs Enhanced Backend - Quick Start Guide

## **IMMEDIATE SETUP - GET RUNNING IN 5 MINUTES**

### **📋 Prerequisites**
- Node.js 18+ installed
- MongoDB running (local or cloud)
- Git installed

### **⚡ Quick Setup Commands**

```bash
# 1. Navigate to backend directory
cd backend

# 2. Install all dependencies
npm install

# 3. Set up environment variables
cp .env.enhanced.example .env

# 4. Edit .env file with your configuration
nano .env  # or use your preferred editor

# 5. Start the enhanced server
npm run dev
```

**🎉 Your enhanced backend is now running on http://localhost:5000**

---

## **🔧 Essential Environment Variables**

**Minimum required configuration in `.env`:**

```env
# Database
MONGODB_URI=mongodb://localhost:27017/finauto_jobs

# JWT Security
JWT_SECRET=your-super-secure-jwt-secret-key-change-this
JWT_REFRESH_SECRET=your-refresh-token-secret

# Email (Gmail example)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=noreply@finautojobs.com

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Server
PORT=5000
NODE_ENV=development
```

---

## **🎯 Available Servers**

### **Enhanced Server (Recommended)**
```bash
npm run dev          # Development with auto-reload
npm start            # Production
```
**Features:** All enhanced APIs, real-time messaging, analytics, file uploads

### **Legacy Server (Backward Compatibility)**
```bash
npm run legacy       # Original server.js
```

---

## **📊 API Endpoints Overview**

### **🔐 Authentication - `/api/v2/auth/`**
```
POST /register       - User registration
POST /login          - User login  
POST /logout         - User logout
GET  /verify-token   - Token verification
POST /forgot-password - Password reset request
POST /reset-password - Password reset
```

### **💼 Jobs - `/api/v2/jobs/`**
```
GET    /             - List all jobs (with filters)
GET    /:id          - Get single job
POST   /             - Create job (recruiter only)
PUT    /:id          - Update job (recruiter only)
DELETE /:id          - Delete job (recruiter only)
GET    /recommended  - Get recommended jobs (applicant)
```

### **📄 Applications - `/api/v2/applications/`**
```
POST   /             - Submit application
GET    /             - Get user's applications
GET    /:id          - Get single application
PUT    /:id/status   - Update application status
DELETE /:id          - Withdraw application
```

### **📋 Resumes - `/api/v2/resumes/`**
```
POST   /upload       - Upload resume
GET    /             - List user resumes
GET    /:id/download - Download resume
PUT    /:id          - Update resume
DELETE /:id          - Delete resume
```

### **💬 Messages - `/api/v2/messages/`**
```
POST   /conversation - Create/get conversation
GET    /conversations - List conversations
POST   /             - Send message
GET    /:conversationId - Get messages
```

### **📊 Analytics - `/api/v2/analytics/`**
```
GET    /dashboard/:role - Dashboard analytics
GET    /stats          - Real-time statistics
GET    /profile        - Profile analytics
```

---

## **🔄 Real-time Features (Socket.IO)**

**Connection:** `http://localhost:5000`

**Events:**
```javascript
// Client-side connection
const socket = io('http://localhost:5000');

// Authentication
socket.emit('authenticate', { userId, role });

// Messaging
socket.emit('join_conversation', conversationId);
socket.emit('send_message', { conversationId, message });

// Listen for events
socket.on('new_message', (data) => { /* handle message */ });
socket.on('notification', (data) => { /* handle notification */ });
```

---

## **📁 Project Structure**

```
backend/
├── server-enhanced.js          # Main enhanced server
├── server.js                   # Legacy server
├── package.json               # Enhanced dependencies
├── .env.enhanced.example      # Environment template
├── 
├── models/
│   ├── unified/               # Unified user models
│   └── enhanced/              # Enhanced feature models
├── 
├── routes/
│   ├── enhanced/              # Enhanced API routes
│   └── legacy/                # Original routes
├── 
├── middleware/
│   ├── auth.js               # Authentication middleware
│   ├── validation.js         # Input validation
│   └── errorHandler.js       # Error handling
├── 
├── services/
│   ├── emailService.js       # Email functionality
│   ├── notificationService.js # Notifications
│   └── fileService.js        # File handling
├── 
├── utils/
│   ├── database.js           # Database connection
│   ├── helpers.js            # Utility functions
│   └── constants.js          # App constants
└── 
└── uploads/                  # File uploads directory
```

---

## **🧪 Testing Your Setup**

### **1. Health Check**
```bash
curl http://localhost:5000/api/health
```

### **2. Test User Registration**
```bash
curl -X POST http://localhost:5000/api/v2/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!",
    "firstName": "Test",
    "lastName": "User",
    "role": "applicant"
  }'
```

### **3. Test Job Listing**
```bash
curl http://localhost:5000/api/v2/jobs
```

---

## **🔍 Troubleshooting**

### **Common Issues:**

**1. MongoDB Connection Error**
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:** Ensure MongoDB is running
```bash
# Start MongoDB (varies by OS)
sudo systemctl start mongod  # Linux
brew services start mongodb  # macOS
```

**2. Port Already in Use**
```
Error: listen EADDRINUSE :::5000
```
**Solution:** Change port in `.env` or kill existing process
```bash
# Find process using port 5000
lsof -i :5000
# Kill process
kill -9 <PID>
```

**3. JWT Secret Error**
```
Error: secretOrPrivateKey has a value of "undefined"
```
**Solution:** Set JWT_SECRET in `.env` file

**4. Email Service Error**
```
Error: Invalid login
```
**Solution:** 
- For Gmail: Enable 2FA and use App Password
- Check EMAIL_USER and EMAIL_PASS in `.env`

---

## **📊 Development Scripts**

```bash
# Development
npm run dev              # Start with auto-reload
npm run legacy           # Start legacy server

# Testing
npm test                 # Run all tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report

# Code Quality
npm run lint             # Check code style
npm run lint:fix         # Fix code style

# Database
npm run seed             # Seed sample data
npm run migrate          # Run migrations

# Utilities
npm run logs             # View logs
npm run health           # Health check
npm run clean            # Clean install
```

---

## **🌐 Frontend Integration**

### **API Base URL**
```javascript
const API_BASE_URL = 'http://localhost:5000/api/v2';
```

### **Authentication Headers**
```javascript
const token = localStorage.getItem('accessToken');
const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
};
```

### **Example API Calls**
```javascript
// Login
const login = async (email, password) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return response.json();
};

// Get Jobs
const getJobs = async (filters = {}) => {
  const queryString = new URLSearchParams(filters).toString();
  const response = await fetch(`${API_BASE_URL}/jobs?${queryString}`, {
    headers
  });
  return response.json();
};

// Apply to Job
const applyToJob = async (jobId, applicationData) => {
  const response = await fetch(`${API_BASE_URL}/applications`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ jobId, ...applicationData })
  });
  return response.json();
};
```

---

## **🚀 Production Deployment**

### **Environment Setup**
```bash
# Set production environment
export NODE_ENV=production

# Use production MongoDB URI
export MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/finauto_jobs

# Set secure JWT secrets
export JWT_SECRET=production-secret-key
export JWT_REFRESH_SECRET=production-refresh-secret
```

### **PM2 Process Management**
```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start server-enhanced.js --name "finauto-backend"

# Configure startup
pm2 startup
pm2 save

# Monitor
pm2 monit
```

### **Nginx Configuration**
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
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## **📞 Support & Documentation**

- **Full Documentation:** `README-ENHANCED.md`
- **API Documentation:** Available at `/api/docs` when server is running
- **Environment Variables:** `.env.enhanced.example`
- **Database Schemas:** `models/enhanced/` directory

---

## **✅ Verification Checklist**

After setup, verify these work:

- [ ] Server starts without errors
- [ ] MongoDB connection successful
- [ ] User registration works
- [ ] User login works
- [ ] Job listing returns data
- [ ] File upload works (resume)
- [ ] Email service configured
- [ ] Socket.IO connection works
- [ ] API documentation accessible

---

**🎉 Congratulations! Your FinAutoJobs Enhanced Backend is ready for development!**

For detailed API documentation and advanced features, see `README-ENHANCED.md`.
