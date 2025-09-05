import { useState } from 'react';
import { Link } from 'wouter';
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Avatar,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  Work,
  PostAdd,
  People,
  TrendingUp,
  Visibility,
  Schedule,
  CheckCircle,
  Person,
} from '@mui/icons-material';

const RecruiterDashboard = () => {
  const [user] = useState({
    name: 'Sarah Johnson',
    company: 'Goldman Sachs',
    position: 'HR Manager',
    avatar: '',
  });

  const [stats] = useState({
    activeJobs: 8,
    totalApplications: 156,
    interviewsScheduled: 12,
    hiredCandidates: 5,
  });

  const [recentJobs] = useState([
    {
      id: 1,
      title: 'Senior Financial Analyst',
      applications: 24,
      status: 'Active',
      posted: '2024-01-15',
    },
    {
      id: 2,
      title: 'Investment Banking Associate',
      applications: 45,
      status: 'Active',
      posted: '2024-01-12',
    },
    {
      id: 3,
      title: 'Risk Management Specialist',
      applications: 18,
      status: 'Closed',
      posted: '2024-01-08',
    },
  ]);

  const [recentApplications] = useState([
    {
      id: 1,
      candidateName: 'John Smith',
      jobTitle: 'Senior Financial Analyst',
      appliedDate: '2024-01-16',
      status: 'New',
    },
    {
      id: 2,
      candidateName: 'Emily Davis',
      jobTitle: 'Investment Banking Associate',
      appliedDate: '2024-01-16',
      status: 'Under Review',
    },
    {
      id: 3,
      candidateName: 'Michael Brown',
      jobTitle: 'Senior Financial Analyst',
      appliedDate: '2024-01-15',
      status: 'Interview Scheduled',
    },
  ]);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom fontWeight="bold">
          Welcome back, {user.name}! 👋
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Manage your job postings and find the best candidates
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Left Column */}
        <Grid item xs={12} md={8}>
          {/* Quick Stats */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Work sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                  <Typography variant="h4" fontWeight="bold">
                    {stats.activeJobs}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Jobs
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <People sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                  <Typography variant="h4" fontWeight="bold">
                    {stats.totalApplications}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Applications
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Schedule sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                  <Typography variant="h4" fontWeight="bold">
                    {stats.interviewsScheduled}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Interviews
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: 'center' }}>
                  <CheckCircle sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                  <Typography variant="h4" fontWeight="bold">
                    {stats.hiredCandidates}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Hired
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Recent Job Postings */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight="bold">
                  Recent Job Postings
                </Typography>
                <Button
                  component={Link}
                  href="/add-job"
                  variant="contained"
                  startIcon={<PostAdd />}
                >
                  Post New Job
                </Button>
              </Box>
              <List>
                {recentJobs.map((job, index) => (
                  <Box key={job.id}>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon>
                        <Work />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="subtitle1" fontWeight="bold">
                              {job.title}
                            </Typography>
                            <Chip
                              label={job.status}
                              color={job.status === 'Active' ? 'success' : 'default'}
                              size="small"
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              {job.applications} applications
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Posted on {new Date(job.posted).toLocaleDateString()}
                            </Typography>
                          </Box>
                        }
                      />
                      <Button
                        component={Link}
                        href={`/job/${job.id}`}
                        variant="outlined"
                        size="small"
                      >
                        View
                      </Button>
                    </ListItem>
                    {index < recentJobs.length - 1 && <Divider />}
                  </Box>
                ))}
              </List>
            </CardContent>
          </Card>

          {/* Recent Applications */}
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight="bold">
                  Recent Applications
                </Typography>
                <Button component={Link} href="/applications" variant="outlined" size="small">
                  View All
                </Button>
              </Box>
              <List>
                {recentApplications.map((application, index) => (
                  <Box key={application.id}>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon>
                        <Person />
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="subtitle1" fontWeight="bold">
                              {application.candidateName}
                            </Typography>
                            <Chip
                              label={application.status}
                              color={
                                application.status === 'New' ? 'info' :
                                application.status === 'Under Review' ? 'warning' :
                                'success'
                              }
                              size="small"
                            />
                          </Box>
                        }
                        secondary={
                          <Box>
                            <Typography variant="body2" color="text.secondary">
                              Applied for {application.jobTitle}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(application.appliedDate).toLocaleDateString()}
                            </Typography>
                          </Box>
                        }
                      />
                      <Button variant="outlined" size="small">
                        Review
                      </Button>
                    </ListItem>
                    {index < recentApplications.length - 1 && <Divider />}
                  </Box>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} md={4}>
          {/* Profile Card */}
          <Card sx={{ mb: 4 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  mx: 'auto',
                  mb: 2,
                  bgcolor: 'primary.main',
                  fontSize: '2rem',
                }}
              >
                {user.name.charAt(0)}
              </Avatar>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                {user.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {user.position}
              </Typography>
              <Typography variant="body2" color="primary" fontWeight="bold" gutterBottom>
                {user.company}
              </Typography>
              
              <Button
                component={Link}
                href="/profile"
                variant="contained"
                fullWidth
                startIcon={<Person />}
                sx={{ mt: 2 }}
              >
                Edit Profile
              </Button>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  component={Link}
                  href="/add-job"
                  variant="outlined"
                  fullWidth
                  startIcon={<PostAdd />}
                >
                  Post New Job
                </Button>
                <Button
                  component={Link}
                  href="/applications"
                  variant="outlined"
                  fullWidth
                  startIcon={<People />}
                >
                  Review Applications
                </Button>
                <Button
                  component={Link}
                  href="/companies"
                  variant="outlined"
                  fullWidth
                  startIcon={<TrendingUp />}
                >
                  Company Analytics
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Recent Activity
              </Typography>
              <List dense>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <PostAdd color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Posted new job"
                    secondary="2 hours ago"
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <Person color="info" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Reviewed 5 applications"
                    secondary="1 day ago"
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemIcon>
                    <Schedule color="warning" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Scheduled 3 interviews"
                    secondary="2 days ago"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default RecruiterDashboard;