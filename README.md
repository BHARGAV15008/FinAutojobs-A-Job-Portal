# FinAutoJobs - Job Portal Application

A modern, full-stack job portal application built with React frontend and Node.js/Express backend.

## 🚀 Quick Start

### Prerequisites
- Node.js >= 20.0.0
- npm >= 10.0.0
- MongoDB (local or Atlas)

### 1. Clone and Setup
```bash
git clone <repository-url>
cd FinAutojobs-A-Job-Portal
```

### 2. Automated Setup (Recommended)
```bash
chmod +x setup-dev.sh
./setup-dev.sh
```

### 3. Manual Setup (Alternative)
```bash
# Install all dependencies
npm run install-all

# Create environment files (see Environment Configuration below)
```

### 4. Start Development Server
```bash
npm run dev
```

This will start:
- **Backend**: http://localhost:5000
- **Frontend**: http://localhost:3000
- **API Health Check**: http://localhost:5000/api/health

## 📁 Project Structure

```
FinAutojobs-A-Job-Portal/
├── backend/                 # Node.js/Express API server
│   ├── config/             # Configuration files
│   ├── controllers/        # Route controllers
│   ├── middleware/         # Custom middleware
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── services/          # Business logic
│   └── server.js          # Main server file
├── frontend/              # React application
│   ├── public/           # Static assets
│   ├── src/              # Source code
│   │   ├── components/   # React components
│   │   ├── contexts/     # React contexts
│   │   ├── hooks/        # Custom hooks
│   │   ├── pages/        # Page components
│   │   ├── services/     # API services
│   │   └── utils/        # Utility functions
│   └── vite.config.js    # Vite configuration
└── package.json          # Root package.json
```

## ⚙️ Environment Configuration

### Backend (.env)
Create `backend/.env` with:
```env
# Server Configuration
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

# Database
MONGODB_URI=mongodb://localhost:27017/finautojobs

# JWT
JWT_SECRET=your-jwt-secret-key
JWT_EXPIRES_IN=24h

# Session
SESSION_SECRET=your-session-secret-key

# CORS
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

### Frontend (.env)
Create `frontend/.env` with:
```env
# API Configuration
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=FinAutoJobs
VITE_APP_VERSION=1.0.0

# Development
VITE_NODE_ENV=development
VITE_DEBUG=true
```

## 🛠️ Available Scripts

### Root Level
- `npm run dev` - Start both frontend and backend in development mode
- `npm run backend` - Start only the backend server
- `npm run frontend` - Start only the frontend server
- `npm run install-all` - Install dependencies for root, backend, and frontend
- `npm run build` - Build the frontend for production

### Backend
- `npm start` - Start the production server
- `npm run dev` - Start with nodemon for development
- `npm test` - Run tests
- `npm run lint` - Run ESLint

### Frontend
- `npm start` - Start development server (alias for `npm run dev`)
- `npm run dev` - Start Vite development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm test` - Run tests

## 🔧 API Integration

The frontend and backend are properly integrated with:

### API Configuration
- **Base URL**: `http://localhost:5000/api` (development)
- **Proxy**: Vite dev server proxies `/api` requests to backend
- **CORS**: Configured to allow frontend origin

### Key API Endpoints
- `GET /api/health` - Health check
- `POST /api/auth/login` - User authentication
- `GET /api/jobs` - Job listings
- `POST /api/applications` - Job applications
- `GET /api/dashboard` - Dashboard data

### Socket.IO Integration
- **Backend**: Socket.IO server on port 5000
- **Frontend**: Socket.IO client connects to backend
- **Real-time features**: Job notifications, application updates

## 🗄️ Database Setup

### MongoDB Local Setup
1. Install MongoDB locally
2. Start MongoDB service
3. Database will be created automatically on first run

### MongoDB Atlas (Cloud)
1. Create MongoDB Atlas account
2. Create cluster and get connection string
3. Update `MONGODB_URI` in backend `.env`

## 🚀 Deployment

### Backend Deployment
1. Set `NODE_ENV=production`
2. Configure production MongoDB URI
3. Set secure JWT and session secrets
4. Deploy to your preferred platform (Render, Heroku, etc.)

### Frontend Deployment
1. Update `VITE_API_URL` to production backend URL
2. Run `npm run build`
3. Deploy `dist` folder to static hosting (Netlify, Vercel, etc.)

## 🔍 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure backend CORS is configured for frontend URL
   - Check `backend/config/cors.js`

2. **API Connection Failed**
   - Verify backend is running on port 5000
   - Check `frontend/src/services/apiConfig.js`

3. **Database Connection Error**
   - Ensure MongoDB is running
   - Verify `MONGODB_URI` in backend `.env`

4. **Port Already in Use**
   - Backend: Change `PORT` in backend `.env`
   - Frontend: Change port in `frontend/vite.config.js`

### Debug Mode
Enable debug logging by setting:
```env
# Backend
DEBUG_MODE=true

# Frontend
VITE_DEBUG=true
```

## 📝 Development Workflow

1. **Start Development**
   ```bash
   npm run dev
   ```

2. **Make Changes**
   - Backend changes auto-restart with nodemon
   - Frontend changes hot-reload with Vite

3. **Test Integration**
   - Check API health: http://localhost:5000/api/health
   - Test frontend: http://localhost:3000

4. **Build for Production**
   ```bash
   npm run build
   ```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section above
- Review the API documentation at `/api/docs`
