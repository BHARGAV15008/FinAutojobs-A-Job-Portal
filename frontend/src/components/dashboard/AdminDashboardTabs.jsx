import React, { useState } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Button, TextField,
  List, ListItem, ListItemText, ListItemAvatar, Avatar, Chip,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TablePagination, Dialog, DialogTitle, DialogContent, DialogActions,
  Alert, IconButton, Tooltip, Stack, FormControl, InputLabel, Select,
  MenuItem, Switch, FormControlLabel, Accordion, AccordionSummary,
  AccordionDetails, Paper
} from '@mui/material';
import {
  People, Work, Business, Analytics, Delete, Edit, Visibility, Block,
  Restore, Add, Search, FilterList, BarChart, PieChart, ShowChart,
  Timeline, CheckCircle, Cancel, Warning, Info, Error, Success,
  ExpandMore, Security, Database, Report, PersonAdd, WorkOutline,
  AdminPanelSettings, Shield, Storage, Speed, Memory, CloudDownload
} from '@mui/icons-material';
import { format, parseISO } from 'date-fns';

// Manage Users Tab
export const ManageUsersTab = ({ data, onUserAction, setConfirmDialog }) => {
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const users = data?.recentUsers || [];
  const filteredUsers = users.filter(user => {
    const matchesFilter = filter === 'all' || user.role === filter || user.status === filter;
    const matchesSearch = user.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const filterOptions = [
    { value: 'all', label: 'All Users' },
    { value: 'jobseeker', label: 'Job Seekers' },
    { value: 'employer', label: 'Employers' },
    { value: 'admin', label: 'Administrators' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'suspended', label: 'Suspended' }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'warning';
      case 'suspended': return 'error';
      default: return 'default';
    }
  };

  const getUserRoleColor = (role) => {
    switch (role) {
      case 'admin': return 'error';
      case 'employer': return 'primary';
      case 'jobseeker': return 'secondary';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">
          Manage Users
        </Typography>
        <Button variant="contained" startIcon={<Add />}>
          Add User
        </Button>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3, borderRadius: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'action.active' }} />
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Filter</InputLabel>
                <Select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  label="Filter"
                >
                  {filterOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button variant="outlined" startIcon={<FilterList />} fullWidth>
                Advanced
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card sx={{ borderRadius: 3 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Joined</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredUsers
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: getUserRoleColor(user.role) }}>
                          {user.fullName?.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" fontWeight="medium">
                            {user.fullName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {user.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.role}
                        color={getUserRoleColor(user.role)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.status}
                        color={getStatusColor(user.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {format(parseISO(user.createdAt), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="View Details">
                          <IconButton size="small">
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit User">
                          <IconButton size="small">
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        {user.status === 'active' ? (
                          <Tooltip title="Suspend User">
                            <IconButton
                              size="small"
                              color="warning"
                              onClick={() => setConfirmDialog({
                                open: true,
                                action: 'suspend',
                                user: user
                              })}
                            >
                              <Block />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          <Tooltip title="Activate User">
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => setConfirmDialog({
                                open: true,
                                action: 'activate',
                                user: user
                              })}
                            >
                              <Restore />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Delete User">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => setConfirmDialog({
                              open: true,
                              action: 'delete',
                              user: user
                            })}
                          >
                            <Delete />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={filteredUsers.length}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
        />
      </Card>
    </Box>
  );
};

// Applicants Tab
export const ApplicantsTab = ({ data }) => {
  const applicants = data?.recentUsers?.filter(user => user.role === 'jobseeker') || [];

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Applicants Management
      </Typography>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, textAlign: 'center', p: 2 }}>
            <PersonAdd sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
            <Typography variant="h4" fontWeight="bold">
              {applicants.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Applicants
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, textAlign: 'center', p: 2 }}>
            <CheckCircle sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
            <Typography variant="h4" fontWeight="bold">
              {applicants.filter(a => a.status === 'active').length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Active Applicants
            </Typography>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Recent Applicants
          </Typography>
          <List>
            {applicants.slice(0, 10).map((applicant, index) => (
              <React.Fragment key={applicant.id}>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'secondary.main' }}>
                      {applicant.fullName?.charAt(0)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={applicant.fullName}
                    secondary={`${applicant.email} • Joined ${format(parseISO(applicant.createdAt), 'MMM dd, yyyy')}`}
                  />
                  <Chip
                    label={applicant.status}
                    color={getStatusColor(applicant.status)}
                    size="small"
                  />
                </ListItem>
                {index < applicants.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </CardContent>
      </Card>
    </Box>
  );
};

// Recruiters Tab
export const RecruitersTab = ({ data }) => {
  const recruiters = data?.recentUsers?.filter(user => user.role === 'employer') || [];

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Recruiters Management
      </Typography>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, textAlign: 'center', p: 2 }}>
            <WorkOutline sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
            <Typography variant="h4" fontWeight="bold">
              {recruiters.length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Recruiters
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, textAlign: 'center', p: 2 }}>
            <CheckCircle sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
            <Typography variant="h4" fontWeight="bold">
              {recruiters.filter(r => r.status === 'active').length}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Active Recruiters
            </Typography>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Recent Recruiters
          </Typography>
          <List>
            {recruiters.slice(0, 10).map((recruiter, index) => (
              <React.Fragment key={recruiter.id}>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      {recruiter.fullName?.charAt(0)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={recruiter.fullName}
                    secondary={`${recruiter.email} • Joined ${format(parseISO(recruiter.createdAt), 'MMM dd, yyyy')}`}
                  />
                  <Chip
                    label={recruiter.status}
                    color={getStatusColor(recruiter.status)}
                    size="small"
                  />
                </ListItem>
                {index < recruiters.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </CardContent>
      </Card>
    </Box>
  );
};

// Jobs Management Tab
export const JobsManagementTab = ({ data }) => {
  const jobs = data?.recentJobs || [];

  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Jobs Management
      </Typography>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, textAlign: 'center', p: 2 }}>
            <Work sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
            <Typography variant="h4" fontWeight="bold">
              {data?.stats?.jobs?.total || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Jobs
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, textAlign: 'center', p: 2 }}>
            <CheckCircle sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
            <Typography variant="h4" fontWeight="bold">
              {data?.stats?.jobs?.active || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Active Jobs
            </Typography>
          </Card>
        </Grid>
      </Grid>

      <Card sx={{ borderRadius: 3 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Job Title</TableCell>
                <TableCell>Company</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Applications</TableCell>
                <TableCell>Posted</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {jobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight="medium">
                      {job.title}
                    </Typography>
                  </TableCell>
                  <TableCell>{job.companyName}</TableCell>
                  <TableCell>{job.location}</TableCell>
                  <TableCell>
                    <Chip
                      label={job.status}
                      color={job.status === 'active' ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{job.applicationsCount || 0}</TableCell>
                  <TableCell>
                    {format(parseISO(job.createdAt), 'MMM dd, yyyy')}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="View Job">
                        <IconButton size="small">
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Edit Job">
                        <IconButton size="small">
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Job">
                        <IconButton size="small" color="error">
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Box>
  );
};

// Companies Tab
export const CompaniesTab = ({ data }) => {
  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Companies Management
      </Typography>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, textAlign: 'center', p: 2 }}>
            <Business sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
            <Typography variant="h4" fontWeight="bold">
              {data?.stats?.companies?.total || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Companies
            </Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, textAlign: 'center', p: 2 }}>
            <CheckCircle sx={{ fontSize: 48, color: 'success.main', mb: 1 }} />
            <Typography variant="h4" fontWeight="bold">
              {data?.stats?.companies?.verified || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Verified Companies
            </Typography>
          </Card>
        </Grid>
      </Grid>

      <Alert severity="info" sx={{ mb: 3 }}>
        Company management features are being developed. This will include company verification, profile management, and analytics.
      </Alert>
    </Box>
  );
};

// Admin Analytics Tab
export const AdminAnalyticsTab = ({ data }) => {
  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        System Analytics
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Platform Overview
              </Typography>
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <BarChart sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="body2" color="text.secondary">
                  Advanced analytics dashboard coming soon
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Key Metrics
              </Typography>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Total Users</Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {data?.stats?.users?.total || 0}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Active Jobs</Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {data?.stats?.jobs?.active || 0}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Applications</Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {data?.stats?.applications?.total || 0}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

// Reports Tab
export const ReportsTab = ({ data }) => {
  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        System Reports
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Generate Reports
              </Typography>
              <Stack spacing={2}>
                <Button variant="outlined" startIcon={<CloudDownload />} fullWidth>
                  User Activity Report
                </Button>
                <Button variant="outlined" startIcon={<CloudDownload />} fullWidth>
                  Job Statistics Report
                </Button>
                <Button variant="outlined" startIcon={<CloudDownload />} fullWidth>
                  Application Analytics Report
                </Button>
                <Button variant="outlined" startIcon={<CloudDownload />} fullWidth>
                  System Performance Report
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              <List>
                {data?.recentActivity?.slice(0, 5).map((activity, index) => (
                  <ListItem key={activity.id} sx={{ px: 0 }}>
                    <ListItemText
                      primary={`${activity.userName} ${activity.action}`}
                      secondary={format(parseISO(activity.createdAt), 'MMM dd, yyyy HH:mm')}
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

// Database Tab
export const DatabaseTab = ({ data }) => {
  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Database Management
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Database Operations
              </Typography>
              <Stack spacing={2}>
                <Button variant="outlined" startIcon={<Database />} fullWidth>
                  Backup Database
                </Button>
                <Button variant="outlined" startIcon={<Restore />} fullWidth>
                  Restore Database
                </Button>
                <Button variant="outlined" startIcon={<Storage />} fullWidth>
                  Optimize Tables
                </Button>
                <Button variant="outlined" color="error" startIcon={<Delete />} fullWidth>
                  Clean Old Data
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Database Status
              </Typography>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Connection Status</Typography>
                  <Chip label="Connected" color="success" size="small" />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Storage Used</Typography>
                  <Typography variant="body2">245 MB</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Last Backup</Typography>
                  <Typography variant="body2">2 hours ago</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Performance</Typography>
                  <Chip label="Good" color="success" size="small" />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

// Security Tab
export const SecurityTab = ({ data }) => {
  return (
    <Box>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Security Settings
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Security Configuration
              </Typography>
              <Stack spacing={3}>
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Two-Factor Authentication"
                />
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Password Complexity Requirements"
                />
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Session Timeout"
                />
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Login Attempt Monitoring"
                />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Security Status
              </Typography>
              <Stack spacing={2}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">SSL Certificate</Typography>
                  <Chip label="Valid" color="success" size="small" />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Firewall Status</Typography>
                  <Chip label="Active" color="success" size="small" />
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Failed Login Attempts</Typography>
                  <Typography variant="body2">0 (24h)</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2">Security Score</Typography>
                  <Chip label="95/100" color="success" size="small" />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

// Helper functions
const getStatusColor = (status) => {
  switch (status) {
    case 'active': return 'success';
    case 'inactive': return 'warning';
    case 'suspended': return 'error';
    default: return 'default';
  }
};

const getUserRoleColor = (role) => {
  switch (role) {
    case 'admin': return 'error';
    case 'employer': return 'primary';
    case 'jobseeker': return 'secondary';
    default: return 'default';
  }
};

export default {
  ManageUsersTab,
  ApplicantsTab,
  RecruitersTab,
  JobsManagementTab,
  CompaniesTab,
  AdminAnalyticsTab,
  ReportsTab,
  DatabaseTab,
  SecurityTab
};
