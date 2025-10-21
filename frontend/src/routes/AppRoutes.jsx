import React, { Suspense, lazy } from 'react'
import { Route, Switch, useLocation } from 'wouter'
import { Box, CircularProgress, Typography } from '@mui/material'
import { useAuth } from '../contexts/AuthContext'
import FloatingActions from '../components/ui/FloatingActions'
import SmoothLoader from '../components/ui/SmoothLoader'
import ScrollProgress from '../components/ui/ScrollProgress'
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
import AnimationTestPage from '../pages/AnimationTestPage';
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


const SignupPage = React.lazy(() => import('../pages/SignupPage').catch(() => ({ 
  default: () => <div>Signup Page Loading...</div> 
})));

const JobAlertsPage = React.lazy(() => import('../pages/JobAlertsPage').catch(() => ({ 
  default: () => <div>Job Alerts Page Loading...</div> 
})));

const AddJobPage = React.lazy(() => import('../pages/AddJobPage').catch(() => ({ 
  default: () => <div>Add Job Page Loading...</div> 
})));

const MessagesPage = React.lazy(() => import('../pages/MessagesPage').catch(() => ({ 
  default: () => <div>Messages Page Loading...</div> 
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
      <SmoothLoader 
        loading={true} 
        message="Initializing FinAutoJobs..." 
        fullScreen={true}
        size={60}
      />
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column', width: '100%' }}>
      {/* Scroll Progress Indicator */}
      {!isDashboard && <ScrollProgress />}
      
      {!isDashboard && !isAdminLogin && <Navigation />}
      
      <Box component="main" sx={{ flex: 1, width: '100%', overflow: 'visible' }}>
        <React.Suspense fallback={
          <SmoothLoader 
            loading={true} 
            message="Loading page..." 
            size={50}
          />
        }>
          <Switch>
            {/* Public Routes */}
            <Route path="/">{() => <HomePageNew />}</Route>
            <Route path="/jobs">{() => <JobsPage />}</Route>
            <Route path="/companies">{() => <CompaniesPage />}</Route>
            <Route path="/salary-insights">{() => <SalaryInsightsPage />}</Route>
            <Route path="/skills-assessment">{() => <SkillsAssessmentPage />}</Route>
            <Route path="/job-alerts">{() => <JobAlertsPage />}</Route>
            <Route path="/messages">{() => <MessagesPage />}</Route>
            <Route path="/add-job">{() => <AddJobPage />}</Route>
            <Route path="/post-job">{() => <AddJobPage />}</Route>
            <Route path="/animation-test">{() => <AnimationTestPage />}</Route>
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
        <Box component="footer" sx={{ bgcolor: 'grey.900', color: 'white', py: 4, mt: 'auto' }}>
          <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <Box sx={{ 
              width: { xs: 'calc(100% - 16px)', sm: '800px', md: '1000px', lg: '1200px' }, 
              px: { xs: 1, sm: 3, md: 4 } 
            }}>
              <Box sx={{ 
                display: 'grid', 
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(4, 1fr)' }, 
                gap: { xs: 3, md: 4 }
              }}>
                <Box>
                  <Box component="h3" sx={{ fontSize: '1rem', fontWeight: 'bold', color: 'primary.main', mb: 1.5 }}>
                    FinAutoJobs
                  </Box>
                  <Box component="p" sx={{ color: 'grey.400', mb: 1.5, fontSize: '0.875rem', lineHeight: 1.5 }}>
                    India's leading specialized job platform connecting top talent with premier opportunities in Finance and Automotive sectors.
                  </Box>
                </Box>
                <Box>
                  <Box component="h4" sx={{ fontWeight: 600, mb: 1.5, fontSize: '0.9rem', color: 'white' }}>For Job Seekers</Box>
                  <Box component="ul" sx={{ listStyle: 'none', p: 0, '& li': { mb: 0.5 } }}>
                    <li><Box component="a" href="/jobs" sx={{ color: 'grey.400', textDecoration: 'none', fontSize: '0.9rem', '&:hover': { color: 'primary.main' } }}>Browse Jobs</Box></li>
                    <li><Box component="a" href="/companies" sx={{ color: 'grey.400', textDecoration: 'none', fontSize: '0.9rem', '&:hover': { color: 'primary.main' } }}>Top Companies</Box></li>
                    <li><Box component="a" href="/resume-builder" sx={{ color: 'grey.400', textDecoration: 'none', fontSize: '0.9rem', '&:hover': { color: 'primary.main' } }}>Resume Builder</Box></li>
                    <li><Box component="a" href="/skills-assessment" sx={{ color: 'grey.400', textDecoration: 'none', fontSize: '0.9rem', '&:hover': { color: 'primary.main' } }}>Skills Assessment</Box></li>
                  </Box>
                </Box>
                <Box>
                  <Box component="h4" sx={{ fontWeight: 600, mb: 1.5, fontSize: '0.9rem', color: 'white' }}>Resources</Box>
                  <Box component="ul" sx={{ listStyle: 'none', p: 0, '& li': { mb: 0.5 } }}>
                    <li><Box component="a" href="/salary-insights" sx={{ color: 'grey.400', textDecoration: 'none', fontSize: '0.85rem', '&:hover': { color: 'primary.main' } }}>Salary Insights</Box></li>
                    <li><Box component="a" href="/salary-calculator" sx={{ color: 'grey.400', textDecoration: 'none', fontSize: '0.85rem', '&:hover': { color: 'primary.main' } }}>Salary Calculator</Box></li>
                    <li><Box component="a" href="/career-guidance" sx={{ color: 'grey.400', textDecoration: 'none', fontSize: '0.85rem', '&:hover': { color: 'primary.main' } }}>Career Guidance</Box></li>
                    <li><Box component="a" href="/interview-prep" sx={{ color: 'grey.400', textDecoration: 'none', fontSize: '0.85rem', '&:hover': { color: 'primary.main' } }}>Interview Prep</Box></li>
                  </Box>
                </Box>
                <Box>
                  <Box component="h4" sx={{ fontWeight: 600, mb: 1.5, fontSize: '0.9rem', color: 'white' }}>Company</Box>
                  <Box component="ul" sx={{ listStyle: 'none', p: 0, '& li': { mb: 0.5 } }}>
                    <li><Box component="a" href="/about" sx={{ color: 'grey.400', textDecoration: 'none', fontSize: '0.9rem', '&:hover': { color: 'primary.main' } }}>About Us</Box></li>
                    <li><Box component="a" href="/contact" sx={{ color: 'grey.400', textDecoration: 'none', fontSize: '0.9rem', '&:hover': { color: 'primary.main' } }}>Contact</Box></li>
                    <li><Box component="a" href="/privacy-policy" sx={{ color: 'grey.400', textDecoration: 'none', fontSize: '0.9rem', '&:hover': { color: 'primary.main' } }}>Privacy Policy</Box></li>
                    <li><Box component="a" href="/terms-of-service" sx={{ color: 'grey.400', textDecoration: 'none', fontSize: '0.9rem', '&:hover': { color: 'primary.main' } }}>Terms of Service</Box></li>
                  </Box>
                </Box>
              </Box>
              <Box sx={{ borderTop: '1px solid', borderColor: 'grey.800', mt: 4, pt: 3, textAlign: 'center', color: 'grey.400' }}>
                <Box component="p" sx={{ fontSize: '0.8rem', m: 0 }}>&copy; 2025 FinAutoJobs. All rights reserved.</Box>
              </Box>
            </Box>
          </Box>
        </Box>
      )}
      
      {/* Floating Actions - Show on all pages except dashboards */}
      {!isDashboard && <FloatingActions />}
    </Box>
  );
};

export default AppRoutes;
