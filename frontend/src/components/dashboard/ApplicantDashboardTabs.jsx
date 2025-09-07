import React, { useState } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Button, TextField,
  List, ListItem, ListItemText, Chip, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Dialog, DialogTitle,
  DialogContent, DialogActions, Alert, IconButton, Tooltip
} from '@mui/material';
import {
  Search, Add, Edit, Delete, Schedule, BarChart, Assessment,
  Notifications, CalendarToday, TrendingUp
} from '@mui/icons-material';

// Browse Jobs Tab
export const BrowseJobsTab = ({ searchQuery, setSearchQuery }) => {
  const [filters, setFilters] = useState({
    location: '',
    jobType: '',
    salaryRange: '',
    experience: ''
  });

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Browse Jobs
      </Typography>
      
      <Card sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search jobs, companies, keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'action.active' }} />
                }}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                select
                label="Location"
                value={filters.location}
                onChange={(e) => setFilters({...filters, location: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                fullWidth
                select
                label="Job Type"
                value={filters.jobType}
                onChange={(e) => setFilters({...filters, jobType: e.target.value})}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <Button variant="contained" fullWidth sx={{ height: '56px' }}>
                Search
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Alert severity="info" sx={{ mb: 3 }}>
        This feature will integrate with the main jobs page. Use the navigation to browse all available jobs.
      </Alert>
    </Box>
  );
};

// Job Alerts Tab
export const JobAlertsTab = () => {
  const [alerts, setAlerts] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">
          Job Alerts
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setDialogOpen(true)}
        >
          Create Alert
        </Button>
      </Box>

      {alerts.length === 0 ? (
        <Card sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
          <Notifications sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No job alerts yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Create job alerts to get notified when new jobs matching your criteria are posted.
          </Typography>
          <Button variant="contained" startIcon={<Add />} onClick={() => setDialogOpen(true)}>
            Create Your First Alert
          </Button>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {alerts.map((alert, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>{alert.title}</Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Chip label={alert.location} size="small" />
                    <Chip label={alert.jobType} size="small" />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {alert.frequency} notifications
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

// Interviews Tab
export const InterviewsTab = ({ data }) => {
  const interviews = data?.upcomingInterviews || [];

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Interview Schedule
      </Typography>

      {interviews.length === 0 ? (
        <Card sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
          <Schedule sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No upcoming interviews
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Your scheduled interviews will appear here.
          </Typography>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {interviews.map((interview) => (
            <Grid item xs={12} md={6} key={interview.id}>
              <Card sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {interview.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {interview.jobTitle} at {interview.companyName}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <CalendarToday fontSize="small" />
                    <Typography variant="body2">
                      {new Date(interview.scheduledAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Schedule fontSize="small" />
                    <Typography variant="body2">
                      {interview.duration} minutes • {interview.type}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

// Analytics Tab
export const AnalyticsTab = ({ data }) => {
  const stats = data?.stats || {};

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Analytics & Insights
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Application Performance
              </Typography>
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <BarChart sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="body2" color="text.secondary">
                  Analytics dashboard coming soon
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3, mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Stats
              </Typography>
              <List>
                <ListItem sx={{ px: 0 }}>
                  <ListItemText
                    primary="Total Applications"
                    secondary={stats.applications?.total || 0}
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemText
                    primary="Response Rate"
                    secondary="0%"
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemText
                    primary="Profile Views"
                    secondary={stats.profileViews || 0}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default {
  BrowseJobsTab,
  JobAlertsTab,
  InterviewsTab,
  AnalyticsTab
};
