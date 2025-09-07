import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
  useMediaQuery,
  Pagination,
  Alert,
  Snackbar,
  Tooltip,
  Menu,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Person,
  Edit,
  Delete,
  Block,
  CheckCircle,
  MoreVert,
  Search,
  FilterList,
  Add,
  Email,
  Phone,
  Business,
  AdminPanelSettings,
  PersonAdd,
  Refresh,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const AdminUsersTab = ({ data, onDataUpdate, user }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [anchorEl, setAnchorEl] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);

  const sampleUsers = [
    {
      id: 1,
      name: 'John Smith',
      email: 'john.smith@email.com',
      phone: '+91 9876543210',
      role: 'applicant',
      status: 'active',
      joinDate: '2024-01-15',
      lastLogin: '2024-01-25T10:30:00',
      profileComplete: 85,
      applications: 12,
      avatar: null,
      company: null
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      email: 'sarah.johnson@techcorp.com',
      phone: '+91 9876543211',
      role: 'recruiter',
      status: 'active',
      joinDate: '2024-01-10',
      lastLogin: '2024-01-25T14:15:00',
      profileComplete: 95,
      applications: null,
      avatar: null,
      company: 'TechCorp India'
    },
    {
      id: 3,
      name: 'Mike Chen',
      email: 'mike.chen@email.com',
      phone: '+91 9876543212',
      role: 'applicant',
      status: 'suspended',
      joinDate: '2024-01-20',
      lastLogin: '2024-01-24T09:45:00',
      profileComplete: 60,
      applications: 5,
      avatar: null,
      company: null
    },
    {
      id: 4,
      name: 'Admin User',
      email: 'admin@finautojobs.com',
      phone: '+91 9876543213',
      role: 'admin',
      status: 'active',
      joinDate: '2023-12-01',
      lastLogin: '2024-01-25T15:00:00',
      profileComplete: 100,
      applications: null,
      avatar: null,
      company: 'FinAutoJobs'
    }
  ];

  const tabLabels = ['All Users', 'Applicants', 'Recruiters', 'Admins', 'Suspended'];

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setUsers(sampleUsers);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleConfig = (role) => {
    const configs = {
      applicant: { color: 'primary', label: 'Applicant' },
      recruiter: { color: 'info', label: 'Recruiter' },
      admin: { color: 'error', label: 'Admin' }
    };
    return configs[role] || configs.applicant;
  };

  const getStatusConfig = (status) => {
    const configs = {
      active: { color: 'success', label: 'Active' },
      suspended: { color: 'error', label: 'Suspended' },
      pending: { color: 'warning', label: 'Pending' }
    };
    return configs[status] || configs.active;
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    const matchesTab = activeTab === 0 || 
                      (activeTab === 1 && user.role === 'applicant') ||
                      (activeTab === 2 && user.role === 'recruiter') ||
                      (activeTab === 3 && user.role === 'admin') ||
                      (activeTab === 4 && user.status === 'suspended');
    
    return matchesSearch && matchesRole && matchesStatus && matchesTab;
  });

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * usersPerPage,
    currentPage * usersPerPage
  );

  const handleUserAction = (action, user) => {
    switch (action) {
      case 'edit':
        setSelectedUser(user);
        setShowUserDialog(true);
        break;
      case 'suspend':
        setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: 'suspended' } : u));
        setSnackbar({ open: true, message: 'User suspended successfully!', severity: 'warning' });
        break;
      case 'activate':
        setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: 'active' } : u));
        setSnackbar({ open: true, message: 'User activated successfully!', severity: 'success' });
        break;
      case 'delete':
        setUsers(prev => prev.filter(u => u.id !== user.id));
        setSnackbar({ open: true, message: 'User deleted successfully!', severity: 'success' });
        break;
      default:
        break;
    }
    setAnchorEl(null);
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                {['User', 'Role', 'Status', 'Last Login', 'Actions'].map((header) => (
                  <TableCell key={header}>
                    <Box sx={{ height: 20, bgcolor: 'grey.200', borderRadius: 1 }} />
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {[1, 2, 3, 4, 5].map((row) => (
                <TableRow key={row}>
                  {[1, 2, 3, 4, 5].map((cell) => (
                    <TableCell key={cell}>
                      <Box sx={{ height: 16, bgcolor: 'grey.200', borderRadius: 1 }} />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
            User Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage platform users and their permissions
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={loadUsers}
            size={isMobile ? 'small' : 'medium'}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<PersonAdd />}
            onClick={() => {
              setSelectedUser(null);
              setShowUserDialog(true);
            }}
            size={isMobile ? 'small' : 'medium'}
          >
            Add User
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
                {users.filter(u => u.role === 'applicant').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Applicants
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="info.main" sx={{ fontWeight: 'bold' }}>
                {users.filter(u => u.role === 'recruiter').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Recruiters
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main" sx={{ fontWeight: 'bold' }}>
                {users.filter(u => u.status === 'active').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active Users
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main" sx={{ fontWeight: 'bold' }}>
                {users.filter(u => u.status === 'suspended').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Suspended
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant={isMobile ? 'scrollable' : 'standard'}
          scrollButtons="auto"
        >
          {tabLabels.map((label, index) => (
            <Tab key={index} label={label} />
          ))}
        </Tabs>
      </Box>

      {/* Search and Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="small"
          InputProps={{
            startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
          }}
          sx={{ minWidth: 250 }}
        />
        
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Role</InputLabel>
          <Select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            label="Role"
          >
            <MenuItem value="all">All Roles</MenuItem>
            <MenuItem value="applicant">Applicant</MenuItem>
            <MenuItem value="recruiter">Recruiter</MenuItem>
            <MenuItem value="admin">Admin</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            label="Status"
          >
            <MenuItem value="all">All Status</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="suspended">Suspended</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Users Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Last Login</TableCell>
              <TableCell>Profile</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedUsers.map((user) => {
              const roleConfig = getRoleConfig(user.role);
              const statusConfig = getStatusConfig(user.status);
              
              return (
                <TableRow key={user.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar
                        src={user.avatar}
                        sx={{ width: 40, height: 40, bgcolor: 'primary.main' }}
                      >
                        {user.name[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                          {user.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {user.email}
                        </Typography>
                        {user.company && (
                          <Typography variant="caption" color="text.secondary">
                            {user.company}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={roleConfig.label}
                      color={roleConfig.color}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={statusConfig.label}
                      color={statusConfig.color}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(user.lastLogin).toLocaleDateString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(user.lastLogin).toLocaleTimeString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2">
                        {user.profileComplete}%
                      </Typography>
                      <Box sx={{ width: 60, height: 4, bgcolor: 'grey.300', borderRadius: 2 }}>
                        <Box
                          sx={{
                            width: `${user.profileComplete}%`,
                            height: '100%',
                            bgcolor: user.profileComplete > 80 ? 'success.main' : 
                                   user.profileComplete > 50 ? 'warning.main' : 'error.main',
                            borderRadius: 2
                          }}
                        />
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        setAnchorEl(e.currentTarget);
                        setSelectedUser(user);
                      }}
                    >
                      <MoreVert />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {filteredUsers.length > usersPerPage && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={Math.ceil(filteredUsers.length / usersPerPage)}
            page={currentPage}
            onChange={(e, page) => setCurrentPage(page)}
            color="primary"
          />
        </Box>
      )}

      {/* User Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => handleUserAction('edit', selectedUser)}>
          <Edit sx={{ mr: 1 }} /> Edit User
        </MenuItem>
        {selectedUser?.status === 'active' ? (
          <MenuItem onClick={() => handleUserAction('suspend', selectedUser)}>
            <Block sx={{ mr: 1 }} /> Suspend User
          </MenuItem>
        ) : (
          <MenuItem onClick={() => handleUserAction('activate', selectedUser)}>
            <CheckCircle sx={{ mr: 1 }} /> Activate User
          </MenuItem>
        )}
        <MenuItem onClick={() => handleUserAction('delete', selectedUser)} sx={{ color: 'error.main' }}>
          <Delete sx={{ mr: 1 }} /> Delete User
        </MenuItem>
      </Menu>

      {/* User Dialog */}
      <Dialog
        open={showUserDialog}
        onClose={() => setShowUserDialog(false)}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>
          {selectedUser ? 'Edit User' : 'Add New User'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Full Name"
                defaultValue={selectedUser?.name || ''}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                defaultValue={selectedUser?.email || ''}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                defaultValue={selectedUser?.phone || ''}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  defaultValue={selectedUser?.role || 'applicant'}
                  label="Role"
                >
                  <MenuItem value="applicant">Applicant</MenuItem>
                  <MenuItem value="recruiter">Recruiter</MenuItem>
                  <MenuItem value="admin">Admin</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  defaultValue={selectedUser?.status || 'active'}
                  label="Status"
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="suspended">Suspended</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Company"
                defaultValue={selectedUser?.company || ''}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowUserDialog(false)}>
            Cancel
          </Button>
          <Button variant="contained">
            {selectedUser ? 'Update User' : 'Create User'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminUsersTab;
