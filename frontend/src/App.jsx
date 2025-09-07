import { Route, Router as WouterRouter, useLocation } from 'wouter'
import { AuthProvider } from './contexts/AuthContext'
import { QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "./components/ui/toaster"
import { TooltipProvider } from "./components/ui/tooltip"
import { queryClient } from "./lib/queryClient"
import { ThemeProvider, CssBaseline } from '@mui/material'
import theme from './theme'
import ErrorBoundary from './components/ErrorBoundary'
import Navigation from './components/Navigation'
import HomePageNew from './pages/HomePageNew'
import JobsPage from './pages/JobsPage'
import JobDetailPage from './pages/JobDetailPage'
import AddJobPage from './pages/AddJobPage'
import {
  HRLoginPage,
  ApplicationsPage,
  AdminDashboard,
  AboutPage,
  ContactPage,
  PrivacyPolicyPage,
  TermsOfServicePage,
  PricingPage,
  CompanyDetailPage,
  JobAlertsPage,
} from './pages/BasicPages'
import ProfilePage from './pages/ProfilePage'
import ResumePage from './pages/ResumeBuilderPage'
import CompaniesPage from './pages/CompaniesPage'
import SkillsAssessmentPage from './pages/SkillsAssessmentPage'
import SalaryInsightsPage from './pages/SalaryInsightsPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import SignupPage from './pages/SignupPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import ApplicantDashboard from './pages/ApplicantDashboard'
import RecruiterDashboard from './pages/RecruiterDashboard'
import ProtectedRoute from './components/ProtectedRoute'
import NotFound from './pages/NotFound'


function Router() {
  const [location] = useLocation();
  const isDashboard = location.includes('-dashboard');

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#fafafa' }}>
      {!isDashboard && <Navigation />}
      <main style={{ flex: 1 }}>
        <Route path="/">{() => <HomePageNew />}</Route>
        <Route path="/jobs">{() => <JobsPage />}</Route>
        <Route path="/job/:id">{(params) => <JobDetailPage id={params.id} />}</Route>
        <Route path="/add-job">{() => <AddJobPage />}</Route>
        <Route path="/resume">{() => <ResumePage />}</Route>
        <Route path="/hr-login">{() => <HRLoginPage />}</Route>
        <Route path="/login">{() => <LoginPage />}</Route>
        <Route path="/register">{() => <RegisterPage />}</Route>
        <Route path="/signup">{() => <SignupPage />}</Route>
        <Route path="/forgot-password">{() => <ForgotPasswordPage />}</Route>
        <Route path="/reset-password">{() => <ResetPasswordPage />}</Route>
        <Route path="/profile">{() => <ProfilePage />}</Route>
        <Route path="/applications">{() => <ApplicationsPage />}</Route>
        <Route path="/applicant-dashboard">{() => <ApplicantDashboard />}</Route>
        <Route path="/recruiter-dashboard">{() => <RecruiterDashboard />}</Route>
        <Route path="/admin-dashboard">
          {() => (
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          )}
        </Route>
        <Route path="/companies">{() => <CompaniesPage />}</Route>
        <Route path="/company/:id">{(params) => <CompanyDetailPage id={params.id} />}</Route>
        <Route path="/skills-assessment">{() => <SkillsAssessmentPage />}</Route>
        <Route path="/salary-insights">{() => <SalaryInsightsPage />}</Route>
        <Route path="/job-alerts">
          {() => (
            <ProtectedRoute requiredRole="jobseeker">
              <JobAlertsPage />
            </ProtectedRoute>
          )}
        </Route>
        <Route path="/about">{() => <AboutPage />}</Route>
        <Route path="/contact">{() => <ContactPage />}</Route>
        <Route path="/pricing">{() => <PricingPage />}</Route>
        <Route path="/privacy-policy">{() => <PrivacyPolicyPage />}</Route>
        <Route path="/terms-of-service">{() => <TermsOfServicePage />}</Route>
        <Route path="/:rest*">{() => <NotFound />}</Route>
      </main>

      {/* Footer */}
      <footer className="bg-neutral-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold text-primary-500 mb-4">FinAutoJobs</h3>
              <p className="text-neutral-400 mb-4">India's #1 job platform connecting millions of job seekers with top employers.</p>
              <div className="flex space-x-4">
                <a href="#" className="text-neutral-400 hover:text-primary-500 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z" />
                  </svg>
                </a>
                <a href="#" className="text-neutral-400 hover:text-primary-500 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
                <a href="#" className="text-neutral-400 hover:text-primary-500 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.746-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z" />
                  </svg>
                </a>
              </div>
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
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Support</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-neutral-400">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-neutral-800 mt-8 pt-8 text-center text-neutral-400">
            <p>&copy; 2025 FinAutoJobs. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <TooltipProvider>
          <AuthProvider>
            <ErrorBoundary>
              <Toaster />
              <WouterRouter>
                <Router />
              </WouterRouter>
            </ErrorBoundary>
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App