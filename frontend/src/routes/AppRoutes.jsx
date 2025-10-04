import React from 'react';
import { Route, Switch, useLocation } from 'wouter';
import { useAuth } from '../contexts/AuthContext.jsx';
import { CircularProgress, Box } from '@mui/material';
import Navigation from '../components/Navigation';
import ProtectedRoute from '../components/auth/ProtectedRoute';

// Direct imports for dashboards
import ApplicantDashboard from '../pages/ApplicantDashboard';
import RecruiterDashboard from '../pages/RecruiterDashboard';
import AdminDashboard from '../pages/AdminDashboard';
import AdminLoginPage from '../pages/AdminLoginPage';
import OTPLoginPage from '../pages/OTPLoginPage';
import OTPSignupPage from '../pages/OTPSignupPage';
import RegisterPage from '../pages/RegisterPage';
import LoginPage from '../pages/LoginPage';
import JobsPage from '../pages/JobsPage';
import ForgotPasswordForm from '../components/auth/ForgotPasswordForm';
import ResetPasswordForm from '../components/auth/ResetPasswordForm';
import OAuthCallback from '../pages/OAuthCallback';
import OAuthError from '../pages/OAuthError';

// Import existing pages with fallback handling
const SafeImport = ({ component: Component, fallback, ...props }) => {
  try {
    return <Component {...props} />;
  } catch (error) {
    console.error('Component import error:', error);
    return fallback || <div>Loading...</div>;
  }
};

// Lazy load components with error handling
const HomePageNew = React.lazy(() => import('../pages/HomePageNew').catch(() => ({ 
  default: () => <div>Home Page Loading...</div> 
})));

// JobsPage now imported directly above

const CompaniesPage = React.lazy(() => import('../pages/CompaniesPage').catch(() => ({ 
  default: () => <div>Companies Page Loading...</div> 
})));

const SalaryInsightsPage = React.lazy(() => import('../pages/SalaryInsightsPage').catch(() => ({ 
  default: () => <div>Salary Insights Page Loading...</div> 
})));

const SkillsAssessmentPage = React.lazy(() => import('../pages/SkillsAssessmentPage').catch(() => ({ 
  default: () => <div>Skills Assessment Page Loading...</div> 
})));

const ResumeBuilderPage = React.lazy(() => import('../pages/ResumeBuilderPage').catch(() => ({ 
  default: () => <div>Resume Builder Page Loading...</div> 
})));

const SignupPage = React.lazy(() => import('../pages/SignupPage').catch(() => ({ 
  default: () => <div>Signup Page Loading...</div> 
})));

const JobAlertsPage = React.lazy(() => import('../pages/JobAlertsPage').catch(() => ({ 
  default: () => <div>Job Alerts Page Loading...</div> 
})));

const AddJobPage = React.lazy(() => import('../pages/AddJobPage').catch(() => ({ 
  default: () => <div>Add Job Page Loading...</div> 
})));


const AppRoutes = () => {
  const { loading } = useAuth();
  const [location] = useLocation();
  const isDashboard = location.includes('-dashboard') || location.includes('/demo');
  const isAdminLogin = location === '/admin-login';

  // Show loading screen while auth is initializing
  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#fafafa' }}>
      {!isDashboard && !isAdminLogin && <Navigation />}
      
      <main style={{ flex: 1 }}>
        <React.Suspense fallback={
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
            <CircularProgress />
          </Box>
        }>
          <Switch>
            {/* Public Routes */}
            <Route path="/">{() => <HomePageNew />}</Route>
            <Route path="/jobs">{() => <JobsPage />}</Route>
            <Route path="/companies">{() => <CompaniesPage />}</Route>
            <Route path="/salary-insights">{() => <SalaryInsightsPage />}</Route>
            <Route path="/skills-assessment">{() => <SkillsAssessmentPage />}</Route>
            <Route path="/resume">{() => <ResumeBuilderPage />}</Route>
            <Route path="/job-alerts">{() => <JobAlertsPage />}</Route>
            <Route path="/add-job">{() => <AddJobPage />}</Route>
            <Route path="/post-job">{() => <AddJobPage />}</Route>
            <Route path="/login">{() => <LoginPage />}</Route>
            <Route path="/otp-login">{() => <OTPLoginPage />}</Route>
            <Route path="/register">{() => <RegisterPage />}</Route>
            <Route path="/signup">{() => <SignupPage />}</Route>
            <Route path="/otp-signup">{() => <OTPSignupPage />}</Route>
            <Route path="/forgot-password">{() => <ForgotPasswordForm />}</Route>
            <Route path="/reset-password">{() => <ResetPasswordForm />}</Route>
            
            {/* OAuth Routes */}
            <Route path="/oauth/callback">{() => <OAuthCallback />}</Route>
            <Route path="/oauth/error">{() => <OAuthError />}</Route>

            {/* Admin Login Route */}
            <Route path="/admin-login">{() => <AdminLoginPage />}</Route>

            {/* General Dashboard Route - Redirects based on user role */}
            <Route path="/dashboard">{() => {
              const { user } = useAuth();
              if (!user) {
                return <LoginPage />;
              }
              
              // User object should now be the direct user object from backend
              const userRole = user?.role;
              
              console.log('🔍 Dashboard redirect - User:', user);
              console.log('🔍 Dashboard redirect - Role:', userRole);
              
              if (userRole === 'recruiter') {
                return (
                  <ProtectedRoute allowedRoles={['recruiter']}>
                    <RecruiterDashboard />
                  </ProtectedRoute>
                );
              } else if (userRole === 'applicant') {
                return (
                  <ProtectedRoute allowedRoles={['applicant']}>
                    <ApplicantDashboard />
                  </ProtectedRoute>
                );
              } else if (userRole === 'admin') {
                return (
                  <ProtectedRoute requiredRole="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                );
              } else {
                // Default to applicant dashboard if role is unclear
                return (
                  <ProtectedRoute allowedRoles={['applicant', 'recruiter']}>
                    <ApplicantDashboard />
                  </ProtectedRoute>
                );
              }
            }}</Route>

            {/* Protected Dashboard Routes */}
            <Route path="/applicant-dashboard">{() => (
              <ProtectedRoute allowedRoles={['applicant']}>
                <ApplicantDashboard />
              </ProtectedRoute>
            )}</Route>
            <Route path="/applicant-dashboard/:tab">{() => (
              <ProtectedRoute allowedRoles={['applicant']}>
                <ApplicantDashboard />
              </ProtectedRoute>
            )}</Route>

            <Route path="/recruiter-dashboard">{() => (
              <ProtectedRoute allowedRoles={['recruiter']}>
                <RecruiterDashboard />
              </ProtectedRoute>
            )}</Route>
            <Route path="/recruiter-dashboard/:tab">{() => (
              <ProtectedRoute allowedRoles={['recruiter']}>
                <RecruiterDashboard />
              </ProtectedRoute>
            )}</Route>

            <Route path="/admin-dashboard">{() => (
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            )}</Route>
            <Route path="/admin-dashboard/:tab">{() => (
              <ProtectedRoute requiredRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            )}</Route>

            {/* 404 Route */}
            <Route path="/:rest*">{() => (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <h2>404 - Page Not Found</h2>
                <p>The page you're looking for doesn't exist.</p>
              </Box>
            )}</Route>
          </Switch>
        </React.Suspense>
      </main>

      {/* Footer */}
      <footer className="bg-neutral-900 text-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <h3 className="text-xl font-bold text-primary-500 mb-4">FinAutoJobs</h3>
              <p className="text-neutral-400 mb-4">India's #1 job platform connecting millions of job seekers with top employers.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">For Job Seekers</h4>
              <ul className="space-y-2 text-neutral-400">
                <li><a href="/jobs" className="hover:text-white transition-colors">Browse Jobs</a></li>
                <li><a href="/resume" className="hover:text-white transition-colors">Resume Builder</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">For Employers</h4>
              <ul className="space-y-2 text-neutral-400">
                <li><a href="#" className="hover:text-white transition-colors">Post Jobs</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Search Candidates</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-neutral-400">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-neutral-800 mt-6 pt-4 text-center text-neutral-400">
            <p>&copy; 2025 FinAutoJobs. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AppRoutes;
