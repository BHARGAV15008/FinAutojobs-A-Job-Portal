import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Chip,
  useTheme,
  useMediaQuery,
  Paper,
  Avatar,
  Divider,
} from '@mui/material';
import {
  Person,
  Business,
  AdminPanelSettings,
  Dashboard,
  Launch,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

// Import dashboard pages
import ApplicantDashboardPage from './ApplicantDashboard';
import RecruiterDashboardPage from './RecruiterDashboard';
import AdminDashboardPage from './AdminDashboard';

const DashboardDemo = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [selectedDashboard, setSelectedDashboard] = useState(null);

  const dashboards = [
    {
      id: 'applicant',
      title: 'Applicant Dashboard',
      description: 'Complete job seeker experience with profile management, job search, applications tracking, and analytics.',
      icon: <Person sx={{ fontSize: 40 }} />,
      color: 'primary',
      features: [
        'Profile Management',
        'Job Search & Filters',
        'Application Tracking',
        'Interview Scheduling',
        'Resume Builder',
        'Analytics & Insights'
      ],
      component: ApplicantDashboardPage,
      user: {
        name: 'John Smith',
        email: 'john.smith@email.com',
        role: 'applicant'
      }
    },
    {
      id: 'recruiter',
      title: 'Recruiter Dashboard',
      description: 'Comprehensive recruitment platform with job posting, candidate management, and hiring analytics.',
      icon: <Business sx={{ fontSize: 40 }} />,
      color: 'info',
      features: [
        'Job Posting Management',
        'Candidate Screening',
        'Interview Coordination',
        'Company Profile',
        'Hiring Analytics',
        'Team Collaboration'
      ],
      component: RecruiterDashboardPage,
      user: {
        name: 'Sarah Johnson',
        email: 'sarah.johnson@techcorp.com',
        role: 'recruiter'
      }
    },
    {
      id: 'admin',
      title: 'Admin Dashboard',
      description: 'Platform administration with user management, system analytics, security monitoring, and configuration.',
      icon: <AdminPanelSettings sx={{ fontSize: 40 }} />,
      color: 'error',
      features: [
        'User Management',
        'Company Verification',
        'System Analytics',
        'Security Monitoring',
        'Platform Settings',
        'Notification Management'
      ],
      component: AdminDashboardPage,
      user: {
        name: 'Admin User',
        email: 'admin@finautojobs.com',
        role: 'admin'
      }
    }
  ];

  if (selectedDashboard) {
    const DashboardComponent = selectedDashboard.component;
    return (
      <Box sx={{ position: 'relative', height: '100vh' }}>
        <Button
          variant="outlined"
          onClick={() => setSelectedDashboard(null)}
          sx={{
            position: 'fixed',
            top: 20,
            right: 20,
            zIndex: 1300,
            bgcolor: 'background.paper'
          }}
        >
          ← Back to Demo
        </Button>
        <DashboardComponent />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      minHeight: '100vh',
      bgcolor: 'background.default',
      py: { xs: 2, md: 4 }
    }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Typography 
              variant="h3" 
              component="h1" 
              gutterBottom 
              sx={{ 
                fontWeight: 'bold',
                background: 'linear-gradient(45deg, #1976d2, #42a5f5)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                mb: 2
              }}
            >
              FinAutoJobs Dashboard Suite
            </Typography>
            <Typography 
              variant="h6" 
              color="text.secondary" 
              sx={{ mb: 4, maxWidth: 800, mx: 'auto' }}
            >
              Experience our comprehensive dashboard system designed for different user roles. 
              Each dashboard is fully responsive, feature-rich, and built with modern UI/UX principles.
            </Typography>
          </motion.div>
        </Box>

        {/* Dashboard Cards */}
        <Grid container spacing={4}>
          {dashboards.map((dashboard, index) => (
            <Grid item xs={12} md={4} key={dashboard.id}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                <Card 
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: theme.shadows[8]
                    }
                  }}
                  onClick={() => setSelectedDashboard(dashboard)}
                >
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    {/* Icon and Title */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar
                        sx={{
                          bgcolor: `${dashboard.color}.main`,
                          width: 60,
                          height: 60,
                          mr: 2
                        }}
                      >
                        {dashboard.icon}
                      </Avatar>
                      <Box>
                        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                          {dashboard.title}
                        </Typography>
                        <Chip 
                          label={dashboard.user.role.toUpperCase()} 
                          color={dashboard.color}
                          size="small"
                        />
                      </Box>
                    </Box>

                    {/* Description */}
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ mb: 3, lineHeight: 1.6 }}
                    >
                      {dashboard.description}
                    </Typography>

                    {/* Features */}
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                        Key Features:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {dashboard.features.map((feature, idx) => (
                          <Chip
                            key={idx}
                            label={feature}
                            size="small"
                            variant="outlined"
                            sx={{ fontSize: '0.75rem' }}
                          />
                        ))}
                      </Box>
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    {/* User Info */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ width: 32, height: 32, mr: 1, bgcolor: 'grey.300' }}>
                        {dashboard.user.name[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {dashboard.user.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {dashboard.user.email}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Launch Button */}
                    <Button
                      variant="contained"
                      color={dashboard.color}
                      fullWidth
                      startIcon={<Launch />}
                      sx={{ mt: 'auto' }}
                    >
                      Launch Dashboard
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        {/* Features Overview */}
        <Box sx={{ mt: 8 }}>
          <Typography variant="h4" align="center" gutterBottom sx={{ fontWeight: 'bold' }}>
            Dashboard Features
          </Typography>
          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, textAlign: 'center', height: '100%' }}>
                <Dashboard sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Modern UI/UX
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Built with Material-UI, featuring responsive design, dark mode support, 
                  and smooth animations powered by Framer Motion.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, textAlign: 'center', height: '100%' }}>
                <Business sx={{ fontSize: 48, color: 'info.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Role-Based Access
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tailored experiences for applicants, recruiters, and administrators 
                  with role-specific features and navigation.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, textAlign: 'center', height: '100%' }}>
                <AdminPanelSettings sx={{ fontSize: 48, color: 'error.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Comprehensive Analytics
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Advanced charts and insights using Recharts, providing actionable 
                  data for all user roles and platform management.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>

        {/* Technical Stack */}
        <Box sx={{ mt: 6, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
            Built With Modern Technologies
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 1, mt: 2 }}>
            {[
              'React 18', 'Material-UI v5', 'Framer Motion', 'Recharts', 
              'Node.js', 'Express', 'SQLite', 'JWT Auth'
            ].map((tech) => (
              <Chip key={tech} label={tech} variant="outlined" />
            ))}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default DashboardDemo;
