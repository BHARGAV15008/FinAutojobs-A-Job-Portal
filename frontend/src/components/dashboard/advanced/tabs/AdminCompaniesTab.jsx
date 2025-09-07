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
  LinearProgress,
} from '@mui/material';
import {
  Business,
  Edit,
  Delete,
  Block,
  CheckCircle,
  MoreVert,
  Search,
  Add,
  Visibility,
  People,
  Work,
  TrendingUp,
  Refresh,
  Verified,
  Warning,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const AdminCompaniesTab = ({ data, onDataUpdate, user }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showCompanyDialog, setShowCompanyDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterSize, setFilterSize] = useState('all');
  const [anchorEl, setAnchorEl] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [currentPage, setCurrentPage] = useState(1);
  const [companiesPerPage] = useState(10);

  const sampleCompanies = [
    {
      id: 1,
      name: 'TechCorp India',
      industry: 'Technology',
      size: '500-1000',
      location: 'Mumbai, India',
      status: 'verified',
      joinDate: '2024-01-10',
      activeJobs: 18,
      totalApplications: 234,
      employees: 45,
      logo: null,
      website: 'https://techcorp.com',
      description: 'Leading technology company focused on innovative solutions',
      contactEmail: 'hr@techcorp.com',
      contactPhone: '+91 9876543210'
    },
    {
      id: 2,
      name: 'StartupXYZ',
      industry: 'Fintech',
      size: '50-100',
      location: 'Bangalore, India',
      status: 'pending',
      joinDate: '2024-01-20',
      activeJobs: 8,
      totalApplications: 89,
      employees: 12,
      logo: null,
      website: 'https://startupxyz.com',
      description: 'Innovative fintech startup revolutionizing payments',
      contactEmail: 'careers@startupxyz.com',
      contactPhone: '+91 9876543211'
    },
    {
      id: 3,
      name: 'InnovateLab',
      industry: 'Software',
      size: '100-500',
      location: 'Delhi, India',
      status: 'verified',
      joinDate: '2024-01-05',
      activeJobs: 12,
      totalApplications: 156,
      employees: 28,
      logo: null,
      website: 'https://innovatelab.com',
      description: 'Software development and consulting services',
      contactEmail: 'jobs@innovatelab.com',
      contactPhone: '+91 9876543212'
    },
    {
      id: 4,
      name: 'BlockedCorp',
      industry: 'Marketing',
      size: '10-50',
      location: 'Pune, India',
      status: 'suspended',
      joinDate: '2024-01-15',
      activeJobs: 0,
      totalApplications: 23,
      employees: 5,
      logo: null,
      website: 'https://blockedcorp.com',
      description: 'Digital marketing agency',
      contactEmail: 'info@blockedcorp.com',
      contactPhone: '+91 9876543213'
    }
  ];

  const tabLabels = ['All Companies', 'Verified', 'Pending', 'Suspended'];

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCompanies(sampleCompanies);
    } catch (error) {
      console.error('Error loading companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      verified: { color: 'success', label: 'Verified', icon: <Verified /> },
      pending: { color: 'warning', label: 'Pending', icon: <Warning /> },
      suspended: { color: 'error', label: 'Suspended', icon: <Block /> }
    };
    return configs[status] || configs.pending;
  };

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         company.industry.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || company.status === filterStatus;
    const matchesSize = filterSize === 'all' || company.size === filterSize;
    const matchesTab = activeTab === 0 || 
                      (activeTab === 1 && company.status === 'verified') ||
                      (activeTab === 2 && company.status === 'pending') ||
                      (activeTab === 3 && company.status === 'suspended');
    
    return matchesSearch && matchesStatus && matchesSize && matchesTab;
  });

  const paginatedCompanies = filteredCompanies.slice(
    (currentPage - 1) * companiesPerPage,
    currentPage * companiesPerPage
  );

  const handleCompanyAction = (action, company) => {
    switch (action) {
      case 'edit':
        setSelectedCompany(company);
        setShowCompanyDialog(true);
        break;
      case 'verify':
        setCompanies(prev => prev.map(c => c.id === company.id ? { ...c, status: 'verified' } : c));
        setSnackbar({ open: true, message: 'Company verified successfully!', severity: 'success' });
        break;
      case 'suspend':
        setCompanies(prev => prev.map(c => c.id === company.id ? { ...c, status: 'suspended' } : c));
        setSnackbar({ open: true, message: 'Company suspended successfully!', severity: 'warning' });
        break;
      case 'delete':
        setCompanies(prev => prev.filter(c => c.id !== company.id));
        setSnackbar({ open: true, message: 'Company deleted successfully!', severity: 'success' });
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
                {['Company', 'Industry', 'Status', 'Jobs', 'Applications', 'Actions'].map((header) => (
                  <TableCell key={header}>
                    <Box sx={{ height: 20, bgcolor: 'grey.200', borderRadius: 1 }} />
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {[1, 2, 3, 4, 5].map((row) => (
                <TableRow key={row}>
                  {[1, 2, 3, 4, 5, 6].map((cell) => (
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
            Company Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage registered companies and their verification status
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={loadCompanies}
            size={isMobile ? 'small' : 'medium'}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => {
              setSelectedCompany(null);
              setShowCompanyDialog(true);
            }}
            size={isMobile ? 'small' : 'medium'}
          >
            Add Company
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main" sx={{ fontWeight: 'bold' }}>
                {companies.filter(c => c.status === 'verified').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Verified
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main" sx={{ fontWeight: 'bold' }}>
                {companies.filter(c => c.status === 'pending').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pending Review
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary.main" sx={{ fontWeight: 'bold' }}>
                {companies.reduce((sum, c) => sum + c.activeJobs, 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Jobs
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="info.main" sx={{ fontWeight: 'bold' }}>
                {companies.reduce((sum, c) => sum + c.employees, 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Employees
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
          placeholder="Search companies..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="small"
          InputProps={{
            startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
          }}
          sx={{ minWidth: 250 }}
        />
        
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            label="Status"
          >
            <MenuItem value="all">All Status</MenuItem>
            <MenuItem value="verified">Verified</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="suspended">Suspended</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Company Size</InputLabel>
          <Select
            value={filterSize}
            onChange={(e) => setFilterSize(e.target.value)}
            label="Company Size"
          >
            <MenuItem value="all">All Sizes</MenuItem>
            <MenuItem value="1-10">1-10</MenuItem>
            <MenuItem value="10-50">10-50</MenuItem>
            <MenuItem value="50-100">50-100</MenuItem>
            <MenuItem value="100-500">100-500</MenuItem>
            <MenuItem value="500-1000">500-1000</MenuItem>
            <MenuItem value="1000+">1000+</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Companies Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Company</TableCell>
              <TableCell>Industry</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Jobs</TableCell>
              <TableCell>Applications</TableCell>
              <TableCell>Employees</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedCompanies.map((company) => {
              const statusConfig = getStatusConfig(company.status);
              
              return (
                <TableRow key={company.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Avatar
                        src={company.logo}
                        sx={{ width: 40, height: 40, bgcolor: 'primary.main' }}
                      >
                        {company.name[0]}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                          {company.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {company.location}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Size: {company.size}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {company.industry}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={statusConfig.label}
                      color={statusConfig.color}
                      size="small"
                      icon={statusConfig.icon}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {company.activeJobs}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      active jobs
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {company.totalApplications}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      applications
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                      {company.employees}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      employees
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        setAnchorEl(e.currentTarget);
                        setSelectedCompany(company);
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
      {filteredCompanies.length > companiesPerPage && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={Math.ceil(filteredCompanies.length / companiesPerPage)}
            page={currentPage}
            onChange={(e, page) => setCurrentPage(page)}
            color="primary"
          />
        </Box>
      )}

      {/* Company Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => handleCompanyAction('edit', selectedCompany)}>
          <Edit sx={{ mr: 1 }} /> Edit Company
        </MenuItem>
        <MenuItem onClick={() => window.open(selectedCompany?.website, '_blank')}>
          <Visibility sx={{ mr: 1 }} /> View Website
        </MenuItem>
        {selectedCompany?.status === 'pending' && (
          <MenuItem onClick={() => handleCompanyAction('verify', selectedCompany)}>
            <CheckCircle sx={{ mr: 1 }} /> Verify Company
          </MenuItem>
        )}
        {selectedCompany?.status !== 'suspended' && (
          <MenuItem onClick={() => handleCompanyAction('suspend', selectedCompany)}>
            <Block sx={{ mr: 1 }} /> Suspend Company
          </MenuItem>
        )}
        <MenuItem onClick={() => handleCompanyAction('delete', selectedCompany)} sx={{ color: 'error.main' }}>
          <Delete sx={{ mr: 1 }} /> Delete Company
        </MenuItem>
      </Menu>

      {/* Company Dialog */}
      <Dialog
        open={showCompanyDialog}
        onClose={() => setShowCompanyDialog(false)}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>
          {selectedCompany ? 'Edit Company' : 'Add New Company'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Company Name"
                defaultValue={selectedCompany?.name || ''}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Industry"
                defaultValue={selectedCompany?.industry || ''}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Company Size</InputLabel>
                <Select
                  defaultValue={selectedCompany?.size || ''}
                  label="Company Size"
                >
                  <MenuItem value="1-10">1-10</MenuItem>
                  <MenuItem value="10-50">10-50</MenuItem>
                  <MenuItem value="50-100">50-100</MenuItem>
                  <MenuItem value="100-500">100-500</MenuItem>
                  <MenuItem value="500-1000">500-1000</MenuItem>
                  <MenuItem value="1000+">1000+</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Location"
                defaultValue={selectedCompany?.location || ''}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Website"
                defaultValue={selectedCompany?.website || ''}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  defaultValue={selectedCompany?.status || 'pending'}
                  label="Status"
                >
                  <MenuItem value="verified">Verified</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="suspended">Suspended</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Contact Email"
                type="email"
                defaultValue={selectedCompany?.contactEmail || ''}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Contact Phone"
                defaultValue={selectedCompany?.contactPhone || ''}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                defaultValue={selectedCompany?.description || ''}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCompanyDialog(false)}>
            Cancel
          </Button>
          <Button variant="contained">
            {selectedCompany ? 'Update Company' : 'Create Company'}
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

export default AdminCompaniesTab;
