import React from 'react';
import { Switch, Route, useLocation } from 'wouter';
import { AuthProvider } from './contexts/AuthContext';
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "./components/ui/toaster";
import { TooltipProvider } from "./components/ui/tooltip";
import { queryClient } from "./lib/queryClient";
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';
import Navigation from './components/Navigation';
import HomePage from './pages/HomePageNew';
import JobsPage from './pages/JobsPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NotFound from './pages/NotFound';
import JobCard from './components/JobCard';
import { Container, Grid, Typography, Box } from '@mui/material';

// Mock job data for JobCard preview
const mockJob = {
  id: 1,
  title: "Senior Financial Analyst",
  company: "Goldman Sachs",
  companyLogo: "GS",
  location: "Mumbai, Maharashtra",
  department: "Finance",
  type: "Full-time",
  workMode: "Hybrid",
  salary: "₹15,00,000 - ₹25,00,000",
  salaryMin: 1500000,
  salaryMax: 2500000,
  posted: "2 days ago",
  experience: "3-5 years",
  description: "We are seeking a Senior Financial Analyst to join our dynamic team in Mumbai. You will be responsible for financial modeling, analysis, and reporting.",
  skills: ["Excel", "Python", "SQL", "Financial Modeling", "Risk Analysis"],
  featured: true,
  urgentHiring: false,
  verified: true,
  applicants: 24,
  rating: 4.5,
  views: 1250,
  remote: false,
  benefits: ["Health Insurance", "Stock Options", "Flexible Hours"],
  companySize: "10,000+",
  industry: "Investment Banking",
};

function ComponentShowcase() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" gutterBottom align="center" fontWeight="bold">
        FinAutoJobs - Component Showcase
      </Typography>
      
      <Box sx={{ mb: 6 }}>
        <Typography variant="h4" gutterBottom>
          Job Card Component
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6} lg={4}>
            <JobCard 
              job={mockJob} 
              onFavoriteToggle={(id) => console.log('Favorite toggled:', id)}
              onBookmarkToggle={(id) => console.log('Bookmark toggled:', id)}
            />
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <JobCard 
              job={{
                ...mockJob,
                id: 2,
                title: "Automotive Design Engineer",
                company: "Tata Motors",
                companyLogo: "TM",
                featured: false,
                urgentHiring: true,
                workMode: "On-site",
                skills: ["CAD", "CATIA", "Automotive Systems"],
                industry: "Automotive",
              }}
              onFavoriteToggle={(id) => console.log('Favorite toggled:', id)}
              onBookmarkToggle={(id) => console.log('Bookmark toggled:', id)}
            />
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}

function Router() {
  const [location] = useLocation();
  const isDashboard = location.includes('-dashboard');

  return (
    <div className="min-h-screen bg-neutral-50">
      {!isDashboard && <Navigation />}
      <main className="flex-1">
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/jobs" component={JobsPage} />
          <Route path="/login" component={LoginPage} />
          <Route path="/register" component={RegisterPage} />
          <Route path="/components" component={ComponentShowcase} />
          <Route component={NotFound} />
        </Switch>
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
                <li><a href="/job-prep" className="hover:text-white transition-colors">Interview Prep</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">For Employers</h4>
              <ul className="space-y-2 text-neutral-400">
                <li><a href="#" className="hover:text-white transition-colors">Post Jobs</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Search Candidates</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-neutral-400">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
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
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <TooltipProvider>
          <AuthProvider>
            <Toaster />
            <Router />
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;