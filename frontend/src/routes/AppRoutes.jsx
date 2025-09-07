import React from 'react';
import { Route, Switch, useLocation } from 'wouter';
import { useAuth } from '../contexts/AuthContext';
import { ProtectedRoute, ApplicantRoute, RecruiterRoute, AdminRoute } from '../components/auth';
import { CircularProgress, Box } from '@mui/material';
import Navigation from '../components/Navigation';

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

const JobsPage = React.lazy(() => import('../pages/JobsPage').catch(() => ({ 
  default: () => <div>Jobs Page Loading...</div> 
})));

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

const RegisterPage = React.lazy(() => import('../pages/RegisterPage').catch(() => ({ 
  default: () => <div>Register Page Loading...</div> 
})));

const JobAlertsPage = React.lazy(() => import('../pages/JobAlertsPage').catch(() => ({ 
  default: () => <div>Job Alerts Page Loading...</div> 
})));

const ApplicantDashboard = React.lazy(() => import('../pages/ApplicantDashboard').catch(() => ({ 
  default: () => <div>Applicant Dashboard Loading...</div> 
})));

const RecruiterDashboard = React.lazy(() => import('../pages/RecruiterDashboard').catch(() => ({ 
  default: () => <div>Recruiter Dashboard Loading...</div> 
})));

const AdminDashboard = React.lazy(() => import('../pages/AdminDashboard').catch(() => ({ 
  default: () => <div>Admin Dashboard Loading...</div> 
})));

const DashboardDemo = React.lazy(() => import('../pages/DashboardDemo').catch(() => ({ 
  default: () => <div>Dashboard Demo Loading...</div> 
})));

const LoginPage = React.lazy(() => import('../pages/LoginPage').catch(() => ({ 
  default: () => <div>Login Page Loading...</div> 
})));

const AppRoutes = () => {
  const { loading } = useAuth();
  const [location] = useLocation();
  const isDashboard = location.includes('-dashboard') || location.includes('/demo');

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
      {!isDashboard && <Navigation />}
      
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
            <Route path="/login">{() => <LoginPage />}</Route>
            <Route path="/register">{() => <RegisterPage />}</Route>
            <Route path="/demo">{() => <DashboardDemo />}</Route>

            {/* Protected Routes - Applicant */}
            <Route path="/applicant-dashboard">
              {() => (
                <ApplicantRoute>
                  <ApplicantDashboard />
                </ApplicantRoute>
              )}
            </Route>

            {/* Protected Routes - Recruiter */}
            <Route path="/recruiter-dashboard">
              {() => (
                <RecruiterRoute>
                  <RecruiterDashboard />
                </RecruiterRoute>
              )}
            </Route>

            {/* Protected Routes - Admin */}
            <Route path="/admin-dashboard">
              {() => (
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              )}
            </Route>

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
      <footer className="bg-neutral-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
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
          <div className="border-t border-neutral-800 mt-8 pt-8 text-center text-neutral-400">
            <p>&copy; 2025 FinAutoJobs. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AppRoutes;
