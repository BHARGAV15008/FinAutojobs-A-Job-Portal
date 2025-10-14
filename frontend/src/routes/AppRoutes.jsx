import React from 'react';
import { Route, Switch, useLocation } from 'wouter';
import { useAuth } from '../contexts/AuthContext.jsx';
import { CircularProgress, Box } from '@mui/material';
import Navigation from '../components/Navigation';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import ResponsiveLayout from '../components/layout/ResponsiveLayout';

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
import OAuthLinkCallback from '../pages/OAuthLinkCallback';

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
  const isAuthPage = location === '/login' || location === '/register' || location === '/admin-login';

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
    <Box sx={{ minHeight: '100vh', backgroundColor: '#fafafa', display: 'flex', flexDirection: 'column', width: '100%' }}>
      {!isDashboard && !isAdminLogin && <Navigation />}
      
      <Box component="main" sx={{ flex: 1, width: '100%', overflow: 'visible' }}>
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
            <Route path="/auth/oauth-callback">{() => <OAuthCallback />}</Route>
            <Route path="/oauth/link-callback">{() => <OAuthLinkCallback />}</Route>
            <Route path="/oauth/error">{() => <OAuthError />}</Route>
            <Route path="/auth/oauth-error">{() => <OAuthError />}</Route>

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
            <Route path="/recruiter-dashboard/:tab/:subtab">{() => (
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
      </Box>

      {/* Footer - Hide on dashboard and auth pages */}
      {!isDashboard && !isAuthPage && (
        <Box component="footer" sx={{ bgcolor: 'grey.900', color: 'white', py: 1.5, mt: 'auto' }}>
        <Box sx={{ maxWidth: '1200px', mx: 'auto', px: { xs: 2, sm: 3, lg: 4 } }}>
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: '1fr', md: 'repeat(4, 1fr)' }, 
            gap: 1.5 
          }}>
            <Box>
              <Box component="h3" sx={{ fontSize: '0.875rem', fontWeight: 'bold', color: 'primary.main', mb: 0.5 }}>
                FinAutoJobs
              </Box>
              <Box component="p" sx={{ color: 'grey.400', mb: 0.5, fontSize: '0.875rem' }}>
                India's #1 job platform connecting millions of job seekers with top employers.
              </Box>
            </Box>
            <Box>
              <Box component="h4" sx={{ fontWeight: 600, mb: 0.5, fontSize: '0.875rem' }}>For Job Seekers</Box>
              <Box component="ul" sx={{ listStyle: 'none', p: 0, '& li': { mb: 0.25 } }}>
                <li><Box component="a" href="/jobs" sx={{ color: 'grey.400', textDecoration: 'none', fontSize: '0.875rem', '&:hover': { color: 'white' } }}>Browse Jobs</Box></li>
                <li><Box component="a" href="/resume" sx={{ color: 'grey.400', textDecoration: 'none', fontSize: '0.875rem', '&:hover': { color: 'white' } }}>Resume Builder</Box></li>
              </Box>
            </Box>
            <Box>
              <Box component="h4" sx={{ fontWeight: 600, mb: 0.5, fontSize: '0.875rem' }}>For Employers</Box>
              <Box component="ul" sx={{ listStyle: 'none', p: 0, '& li': { mb: 0.25 } }}>
                <li><Box component="a" href="#" sx={{ color: 'grey.400', textDecoration: 'none', fontSize: '0.875rem', '&:hover': { color: 'white' } }}>Post Jobs</Box></li>
                <li><Box component="a" href="#" sx={{ color: 'grey.400', textDecoration: 'none', fontSize: '0.875rem', '&:hover': { color: 'white' } }}>Search Candidates</Box></li>
              </Box>
            </Box>
            <Box>
              <Box component="h4" sx={{ fontWeight: 600, mb: 0.5, fontSize: '0.875rem' }}>Company</Box>
              <Box component="ul" sx={{ listStyle: 'none', p: 0, '& li': { mb: 0.25 } }}>
                <li><Box component="a" href="#" sx={{ color: 'grey.400', textDecoration: 'none', fontSize: '0.875rem', '&:hover': { color: 'white' } }}>About Us</Box></li>
                <li><Box component="a" href="#" sx={{ color: 'grey.400', textDecoration: 'none', fontSize: '0.875rem', '&:hover': { color: 'white' } }}>Contact</Box></li>
              </Box>
            </Box>
          </Box>
          <Box sx={{ borderTop: '1px solid', borderColor: 'grey.800', mt: 1.5, pt: 0.75, textAlign: 'center', color: 'grey.400' }}>
            <Box component="p" sx={{ fontSize: '0.875rem', m: 0 }}>&copy; 2025 FinAutoJobs. All rights reserved.</Box>
          </Box>
        </Box>
        </Box>
      )}
    </Box>
  );
};

export default AppRoutes;
