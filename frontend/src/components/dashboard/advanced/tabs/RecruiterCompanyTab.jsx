import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Avatar,
  IconButton,
  useTheme,
  useMediaQuery,
  Paper,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
  Divider,
  LinearProgress,
} from '@mui/material';
import {
  Business,
  Edit,
  Save,
  Cancel,
  Add,
  Delete,
  PhotoCamera,
  Language,
  LocationOn,
  People,
  Work,
  Star,
  Visibility,
  Share,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const RecruiterCompanyTab = ({ data, onDataUpdate, user }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [companyData, setCompanyData] = useState({
    name: 'TechCorp India',
    logo: null,
    description: 'Leading technology company focused on innovative solutions for the digital age.',
    industry: 'Technology',
    size: '500-1000',
    founded: '2015',
    website: 'https://techcorp.com',
    location: 'Mumbai, India',
    headquarters: 'Mumbai, Maharashtra, India',
    benefits: [
      'Health Insurance',
      'Flexible Working Hours',
      'Remote Work Options',
      'Learning & Development',
      'Stock Options',
      'Gym Membership'
    ],
    culture: [
      'Innovation-driven',
      'Collaborative',
      'Work-life balance',
      'Continuous learning',
      'Diversity & inclusion'
    ],
    socialLinks: {
      linkedin: 'https://linkedin.com/company/techcorp',
      twitter: 'https://twitter.com/techcorp',
      facebook: 'https://facebook.com/techcorp',
      instagram: 'https://instagram.com/techcorp'
    },
    gallery: [],
    awards: [
      'Best Tech Company 2023',
      'Great Place to Work 2022',
      'Innovation Award 2021'
    ]
  });

  const [editMode, setEditMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [showBenefitDialog, setShowBenefitDialog] = useState(false);
  const [newBenefit, setNewBenefit] = useState('');
  const [showCultureDialog, setShowCultureDialog] = useState(false);
  const [newCulture, setNewCulture] = useState('');

  const handleSave = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setEditMode(false);
      setSnackbar({ open: true, message: 'Company profile updated successfully!', severity: 'success' });
      if (onDataUpdate) {
        onDataUpdate(companyData);
      }
    } catch (error) {
      setSnackbar({ open: true, message: 'Failed to update company profile', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditMode(false);
    // Reset to original data if needed
  };

  const handleAddBenefit = () => {
    if (newBenefit.trim()) {
      setCompanyData(prev => ({
        ...prev,
        benefits: [...prev.benefits, newBenefit.trim()]
      }));
      setNewBenefit('');
      setShowBenefitDialog(false);
    }
  };

  const handleRemoveBenefit = (index) => {
    setCompanyData(prev => ({
      ...prev,
      benefits: prev.benefits.filter((_, i) => i !== index)
    }));
  };

  const handleAddCulture = () => {
    if (newCulture.trim()) {
      setCompanyData(prev => ({
        ...prev,
        culture: [...prev.culture, newCulture.trim()]
      }));
      setNewCulture('');
      setShowCultureDialog(false);
    }
  };

  const handleRemoveCulture = (index) => {
    setCompanyData(prev => ({
      ...prev,
      culture: prev.culture.filter((_, i) => i !== index)
    }));
  };

  const handleInputChange = (field, value) => {
    setCompanyData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSocialLinkChange = (platform, value) => {
    setCompanyData(prev => ({
      ...prev,
      socialLinks: {
        ...prev.socialLinks,
        [platform]: value
      }
    }));
  };

  const profileCompleteness = () => {
    const fields = [
      companyData.name,
      companyData.description,
      companyData.industry,
      companyData.size,
      companyData.website,
      companyData.location,
      companyData.benefits.length > 0,
      companyData.culture.length > 0
    ];
    const completed = fields.filter(Boolean).length;
    return Math.round((completed / fields.length) * 100);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
            Company Profile
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your company information and branding
          </Typography>
        </Box>
        
        {!editMode ? (
          <Button
            variant="contained"
            startIcon={<Edit />}
            onClick={() => setEditMode(true)}
            size={isMobile ? 'small' : 'medium'}
          >
            Edit Profile
          </Button>
        ) : (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={<Cancel />}
              onClick={handleCancel}
              size={isMobile ? 'small' : 'medium'}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              startIcon={<Save />}
              onClick={handleSave}
              disabled={loading}
              size={isMobile ? 'small' : 'medium'}
            >
              Save Changes
            </Button>
          </Box>
        )}
      </Box>

      {/* Profile Completeness */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              Profile Completeness
            </Typography>
            <Typography variant="h6" color="primary">
              {profileCompleteness()}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={profileCompleteness()}
            sx={{ height: 8, borderRadius: 4 }}
          />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Complete your profile to attract better candidates
          </Typography>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Basic Information */}
        <Grid item xs={12} lg={8}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Basic Information
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Company Name"
                    value={companyData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Industry"
                    value={companyData.industry}
                    onChange={(e) => handleInputChange('industry', e.target.value)}
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Company Size"
                    value={companyData.size}
                    onChange={(e) => handleInputChange('size', e.target.value)}
                    disabled={!editMode}
                    placeholder="e.g., 100-500"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Founded Year"
                    value={companyData.founded}
                    onChange={(e) => handleInputChange('founded', e.target.value)}
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Website"
                    value={companyData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Location"
                    value={companyData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    disabled={!editMode}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Company Description"
                    value={companyData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    disabled={!editMode}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Benefits */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Employee Benefits
                </Typography>
                {editMode && (
                  <Button
                    startIcon={<Add />}
                    onClick={() => setShowBenefitDialog(true)}
                    size="small"
                  >
                    Add Benefit
                  </Button>
                )}
              </Box>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {companyData.benefits.map((benefit, index) => (
                  <Chip
                    key={index}
                    label={benefit}
                    onDelete={editMode ? () => handleRemoveBenefit(index) : undefined}
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Box>
            </CardContent>
          </Card>

          {/* Company Culture */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Company Culture
                </Typography>
                {editMode && (
                  <Button
                    startIcon={<Add />}
                    onClick={() => setShowCultureDialog(true)}
                    size="small"
                  >
                    Add Value
                  </Button>
                )}
              </Box>
              
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {companyData.culture.map((value, index) => (
                  <Chip
                    key={index}
                    label={value}
                    onDelete={editMode ? () => handleRemoveCulture(index) : undefined}
                    color="secondary"
                    variant="outlined"
                  />
                ))}
              </Box>
            </CardContent>
          </Card>

          {/* Social Links */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Social Media Links
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="LinkedIn"
                    value={companyData.socialLinks.linkedin}
                    onChange={(e) => handleSocialLinkChange('linkedin', e.target.value)}
                    disabled={!editMode}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Twitter"
                    value={companyData.socialLinks.twitter}
                    onChange={(e) => handleSocialLinkChange('twitter', e.target.value)}
                    disabled={!editMode}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Facebook"
                    value={companyData.socialLinks.facebook}
                    onChange={(e) => handleSocialLinkChange('facebook', e.target.value)}
                    disabled={!editMode}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Instagram"
                    value={companyData.socialLinks.instagram}
                    onChange={(e) => handleSocialLinkChange('instagram', e.target.value)}
                    disabled={!editMode}
                    size="small"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid item xs={12} lg={4}>
          {/* Company Logo */}
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Avatar
                src={companyData.logo}
                sx={{ 
                  width: 120, 
                  height: 120, 
                  mx: 'auto', 
                  mb: 2,
                  bgcolor: 'primary.main',
                  fontSize: '2rem'
                }}
              >
                {companyData.name[0]}
              </Avatar>
              
              <Typography variant="h6" gutterBottom>
                {companyData.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {companyData.industry}
              </Typography>
              
              {editMode && (
                <Button
                  variant="outlined"
                  startIcon={<PhotoCamera />}
                  sx={{ mt: 2 }}
                  size="small"
                >
                  Upload Logo
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Company Stats
              </Typography>
              
              <List dense>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
                      <People sx={{ fontSize: 18 }} />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Employees"
                    secondary={companyData.size}
                  />
                </ListItem>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'info.main', width: 32, height: 32 }}>
                      <Work sx={{ fontSize: 18 }} />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Active Jobs"
                    secondary="18 positions"
                  />
                </ListItem>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'success.main', width: 32, height: 32 }}>
                      <Visibility sx={{ fontSize: 18 }} />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Profile Views"
                    secondary="1,234 this month"
                  />
                </ListItem>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'warning.main', width: 32, height: 32 }}>
                      <Star sx={{ fontSize: 18 }} />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Company Rating"
                    secondary="4.5/5 stars"
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>

          {/* Awards & Recognition */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Awards & Recognition
              </Typography>
              
              <List dense>
                {companyData.awards.map((award, index) => (
                  <ListItem key={index}>
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: 'warning.main', width: 32, height: 32 }}>
                        <Star sx={{ fontSize: 18 }} />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText primary={award} />
                  </ListItem>
                ))}
              </List>
              
              {editMode && (
                <Button
                  startIcon={<Add />}
                  size="small"
                  sx={{ mt: 1 }}
                >
                  Add Award
                </Button>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Add Benefit Dialog */}
      <Dialog open={showBenefitDialog} onClose={() => setShowBenefitDialog(false)}>
        <DialogTitle>Add Employee Benefit</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Benefit"
            value={newBenefit}
            onChange={(e) => setNewBenefit(e.target.value)}
            margin="normal"
            placeholder="e.g., Health Insurance"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowBenefitDialog(false)}>Cancel</Button>
          <Button onClick={handleAddBenefit} variant="contained">Add</Button>
        </DialogActions>
      </Dialog>

      {/* Add Culture Dialog */}
      <Dialog open={showCultureDialog} onClose={() => setShowCultureDialog(false)}>
        <DialogTitle>Add Culture Value</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="Culture Value"
            value={newCulture}
            onChange={(e) => setNewCulture(e.target.value)}
            margin="normal"
            placeholder="e.g., Innovation-driven"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCultureDialog(false)}>Cancel</Button>
          <Button onClick={handleAddCulture} variant="contained">Add</Button>
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

export default RecruiterCompanyTab;
