# FinAutoJobs - Job Board Application

A modern job board application built with React, Tailwind CSS, SASS, Express.js, and SQLite.

## 🚀 Features

### Frontend (React + Tailwind CSS + SASS)
- **Modern UI/UX**: Beautiful, responsive design with Tailwind CSS
- **Authentication**: User registration, login, and profile management
- **Job Search**: Advanced job search with filters
- **Job Applications**: Apply to jobs and track applications
- **Resume Builder**: Create and manage resumes
- **Interview Prep**: Resources for interview preparation
- **Responsive Design**: Works on all devices

### Backend (Express.js + SQLite)
- **RESTful API**: Complete API for all features
- **Authentication**: JWT-based authentication
- **Database**: SQLite with proper relationships
- **Security**: Password hashing, rate limiting, CORS
- **File Upload**: Resume and document upload support

## 📁 Project Structure

```
FinAutoJobs/
├── backend/                 # Express.js backend
│   ├── config/             # Database configuration
│   ├── routes/             # API routes
│   ├── data/               # SQLite database files
│   ├── server.js           # Main server file
│   └── package.json        # Backend dependencies
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React contexts
│   │   ├── utils/          # Utility functions
│   │   └── styles/         # SASS styles
│   ├── public/             # Static assets
│   └── package.json        # Frontend dependencies
└── README.md              # This file
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create environment file:**
   ```bash
   cp env.example .env
   ```

4. **Start the backend server:**
   ```bash
   npm run dev
   ```

The backend will start on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

The frontend will start on `http://localhost:3000`

## 🗄️ Database Schema

The application uses SQLite with the following tables:

- **users**: User accounts and profiles
- **companies**: Company information
- **jobs**: Job listings
- **applications**: Job applications

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

### Jobs
- `GET /api/jobs` - Get all jobs (with filters)
- `GET /api/jobs/:id` - Get job by ID
- `POST /api/jobs` - Create new job (HR/Admin)
- `PUT /api/jobs/:id` - Update job (HR/Admin)
- `DELETE /api/jobs/:id` - Delete job (HR/Admin)

### Companies
- `GET /api/companies` - Get all companies
- `GET /api/companies/:id` - Get company by ID
- `GET /api/companies/:id/jobs` - Get jobs by company
- `POST /api/companies` - Create company (Admin)
- `PUT /api/companies/:id` - Update company (Admin)
- `DELETE /api/companies/:id` - Delete company (Admin)

### Applications
- `POST /api/applications` - Apply for a job
- `GET /api/applications` - Get all applications (HR/Admin)
- `GET /api/applications/:id` - Get application by ID
- `PUT /api/applications/:id/status` - Update application status
- `DELETE /api/applications/:id` - Delete application (HR/Admin)

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/change-password` - Change password
- `GET /api/users/applications` - Get user applications

## 🎨 Styling

The project uses:
- **Tailwind CSS**: Utility-first CSS framework
- **SASS**: Advanced CSS preprocessing
- **Custom Components**: Reusable styled components
- **Responsive Design**: Mobile-first approach

## 🔐 Authentication & Authorization

- **JWT Tokens**: Secure authentication
- **Role-based Access**: Different permissions for different user types
- **Password Hashing**: bcrypt for secure password storage
- **Session Management**: Express sessions

## 🚀 Deployment

### Backend Deployment
1. Set environment variables for production
2. Build the application: `npm run build`
3. Start production server: `npm run dev

### Frontend Deployment
1. Build the application: `npm run build`
2. Deploy the `dist` folder to your hosting service

## 📝 Environment Variables

### Backend (.env)
```env
PORT=5000
NODE_ENV=development
JWT_SECRET=your-secret-key
SESSION_SECRET=your-session-secret
FRONTEND_URL=http://localhost:3000
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

If you encounter any issues or have questions:
1. Check the documentation
2. Search existing issues
3. Create a new issue with detailed information

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

**Built with ❤️ using React, Tailwind CSS, SASS, Express.js, and SQLite**
