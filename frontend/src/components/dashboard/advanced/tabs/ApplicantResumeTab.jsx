import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  useTheme,
  useMediaQuery,
  Alert,
  Snackbar,
  LinearProgress,
  Chip,
  Avatar,
  Divider,
  Menu,
  MenuItem,
  Tooltip,
} from '@mui/material';
import {
  CloudUpload,
  Download,
  Delete,
  Edit,
  Visibility,
  Star,
  StarBorder,
  MoreVert,
  Add,
  Description,
  CheckCircle,
  Warning,
  Error as ErrorIcon,
  Refresh,
  Share,
  FileCopy,
} from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';

const ApplicantResumeTab = ({ data, onDataUpdate, user }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // State management
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadDialog, setUploadDialog] = useState(false);
  const [editDialog, setEditDialog] = useState(false);
  const [selectedResume, setSelectedResume] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [menuResume, setMenuResume] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  
  // Form states
  const [resumeTitle, setResumeTitle] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  // Sample resume data
  const sampleResumes = [
    {
      id: 1,
      title: 'Senior Frontend Developer Resume',
      fileName: 'resume_frontend_2024.pdf',
      fileSize: 245760, // bytes
      fileType: 'pdf',
      uploadDate: '2024-01-15',
      lastModified: '2024-01-15',
      isDefault: true,
      downloadCount: 12,
      lastDownloaded: '2024-01-20',
      status: 'active',
      fileUrl: '/resumes/resume_frontend_2024.pdf',
      thumbnail: null,
      tags: ['Frontend', 'React', 'JavaScript']
    },
    {
      id: 2,
      title: 'Full Stack Developer Resume',
      fileName: 'resume_fullstack_2024.pdf',
      fileSize: 198400,
      fileType: 'pdf',
      uploadDate: '2024-01-10',
      lastModified: '2024-01-12',
      isDefault: false,
      downloadCount: 8,
      lastDownloaded: '2024-01-18',
      status: 'active',
      fileUrl: '/resumes/resume_fullstack_2024.pdf',
      thumbnail: null,
      tags: ['Full Stack', 'Node.js', 'React']
    },
    {
      id: 3,
      title: 'Entry Level Resume',
      fileName: 'resume_entry_level.docx',
      fileSize: 156800,
      fileType: 'docx',
      uploadDate: '2024-01-05',
      lastModified: '2024-01-05',
      isDefault: false,
      downloadCount: 3,
      lastDownloaded: '2024-01-15',
      status: 'archived',
      fileUrl: '/resumes/resume_entry_level.docx',
      thumbnail: null,
      tags: ['Entry Level', 'Fresher']
    }
  ];

  useEffect(() => {
    loadResumes();
  }, []);

  const loadResumes = async () => {
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setResumes(sampleResumes);
    } catch (error) {
      console.error('Error loading resumes:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load resumes',
        severity: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!allowedTypes.includes(file.type)) {
        setSnackbar({
          open: true,
          message: 'Please select a PDF or Word document',
          severity: 'error'
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setSnackbar({
          open: true,
          message: 'File size must be less than 5MB',
          severity: 'error'
        });
        return;
      }

      setSelectedFile(file);
      setResumeTitle(file.name.replace(/\.[^/.]+$/, "")); // Remove extension
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !resumeTitle.trim()) {
      setSnackbar({
        open: true,
        message: 'Please select a file and enter a title',
        severity: 'error'
      });
      return;
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      clearInterval(progressInterval);
      setUploadProgress(100);

      const newResume = {
        id: Date.now(),
        title: resumeTitle,
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        fileType: selectedFile.type.includes('pdf') ? 'pdf' : 'docx',
        uploadDate: new Date().toISOString().split('T')[0],
        lastModified: new Date().toISOString().split('T')[0],
        isDefault: resumes.length === 0,
        downloadCount: 0,
        lastDownloaded: null,
        status: 'active',
        fileUrl: URL.createObjectURL(selectedFile),
        thumbnail: null,
        tags: []
      };

      setResumes(prev => [newResume, ...prev]);
      setUploadDialog(false);
      setSelectedFile(null);
      setResumeTitle('');
      setUploadProgress(0);

      setSnackbar({
        open: true,
        message: 'Resume uploaded successfully!',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to upload resume',
        severity: 'error'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSetDefault = async (resumeId) => {
    try {
      setResumes(prev =>
        prev.map(resume => ({
          ...resume,
          isDefault: resume.id === resumeId
        }))
      );

      setSnackbar({
        open: true,
        message: 'Default resume updated',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to update default resume',
        severity: 'error'
      });
    }
  };

  const handleDelete = async (resumeId) => {
    try {
      setResumes(prev => prev.filter(resume => resume.id !== resumeId));
      setSnackbar({
        open: true,
        message: 'Resume deleted successfully',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to delete resume',
        severity: 'error'
      });
    }
  };

  const handleDownload = async (resume) => {
    try {
      // Simulate download
      const link = document.createElement('a');
      link.href = resume.fileUrl;
      link.download = resume.fileName;
      link.click();

      // Update download count
      setResumes(prev =>
        prev.map(r =>
          r.id === resume.id
            ? {
                ...r,
                downloadCount: r.downloadCount + 1,
                lastDownloaded: new Date().toISOString().split('T')[0]
              }
            : r
        )
      );
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to download resume',
        severity: 'error'
      });
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType) => {
    return <Description color={fileType === 'pdf' ? 'error' : 'primary'} />;
  };

  const handleMenuOpen = (event, resume) => {
    setAnchorEl(event.currentTarget);
    setMenuResume(resume);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuResume(null);
  };

  const ResumeCard = ({ resume }) => (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card
        sx={{
          height: '100%',
          position: 'relative',
          border: resume.isDefault ? '2px solid' : '1px solid',
          borderColor: resume.isDefault ? 'primary.main' : 'divider',
          '&:hover': {
            boxShadow: 3,
          }
        }}
      >
        {resume.isDefault && (
          <Chip
            label="Default"
            color="primary"
            size="small"
            icon={<Star />}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              zIndex: 1
            }}
          />
        )}

        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
            <Avatar
              sx={{
                bgcolor: resume.fileType === 'pdf' ? 'error.main' : 'primary.main',
                mr: 2,
                width: 48,
                height: 48
              }}
            >
              {getFileIcon(resume.fileType)}
            </Avatar>
            
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography variant="h6" noWrap sx={{ fontWeight: 'bold', mb: 0.5 }}>
                {resume.title}
              </Typography>
              <Typography variant="body2" color="text.secondary" noWrap>
                {resume.fileName}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatFileSize(resume.fileSize)} • {resume.fileType.toUpperCase()}
              </Typography>
            </Box>

            <IconButton
              size="small"
              onClick={(e) => handleMenuOpen(e, resume)}
            >
              <MoreVert />
            </IconButton>
          </Box>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
            {resume.tags.map((tag, index) => (
              <Chip
                key={index}
                label={tag}
                size="small"
                variant="outlined"
                sx={{ fontSize: '0.75rem' }}
              />
            ))}
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="caption" color="text.secondary" display="block">
                Uploaded: {new Date(resume.uploadDate).toLocaleDateString()}
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                Downloads: {resume.downloadCount}
              </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {resume.status === 'active' ? (
                <CheckCircle color="success" sx={{ fontSize: 16 }} />
              ) : (
                <Warning color="warning" sx={{ fontSize: 16 }} />
              )}
              <Typography variant="caption" sx={{ ml: 0.5, textTransform: 'capitalize' }}>
                {resume.status}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<Download />}
              onClick={() => handleDownload(resume)}
              sx={{ flex: 1 }}
            >
              Download
            </Button>
            <Button
              size="small"
              variant="contained"
              startIcon={<Visibility />}
              sx={{ flex: 1 }}
            >
              Preview
            </Button>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {[1, 2, 3].map((item) => (
            <Grid item xs={12} md={6} lg={4} key={item}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Box sx={{ width: 48, height: 48, bgcolor: 'grey.300', borderRadius: '50%', mr: 2 }} />
                    <Box sx={{ flexGrow: 1 }}>
                      <Box sx={{ height: 20, bgcolor: 'grey.300', mb: 1, borderRadius: 1 }} />
                      <Box sx={{ height: 16, bgcolor: 'grey.200', width: '60%', borderRadius: 1 }} />
                    </Box>
                  </Box>
                  <Box sx={{ height: 40, bgcolor: 'grey.200', borderRadius: 1 }} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
            My Resumes
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your resume versions and keep them updated
          </Typography>
        </Box>
        
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setUploadDialog(true)}
          size={isMobile ? 'small' : 'medium'}
        >
          Upload Resume
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
                {resumes.filter(r => r.status === 'active').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Active Resumes
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="success.main" sx={{ fontWeight: 'bold' }}>
                {resumes.reduce((sum, r) => sum + r.downloadCount, 0)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Downloads
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="info.main" sx={{ fontWeight: 'bold' }}>
                {resumes.filter(r => r.isDefault).length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Default Resume
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main" sx={{ fontWeight: 'bold' }}>
                {Math.round(resumes.reduce((sum, r) => sum + r.fileSize, 0) / (1024 * 1024) * 10) / 10}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Size (MB)
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Resume Tips */}
      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Pro Tips:</strong> Keep multiple versions of your resume tailored for different job types. 
          Set one as default for quick applications. Supported formats: PDF, DOC, DOCX (max 5MB).
        </Typography>
      </Alert>

      {/* Resumes Grid */}
      {resumes.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <CloudUpload sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No resumes uploaded yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Upload your first resume to get started with job applications
          </Typography>
          <Button
            variant="contained"
            startIcon={<CloudUpload />}
            onClick={() => setUploadDialog(true)}
          >
            Upload Resume
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          <AnimatePresence>
            {resumes.map((resume) => (
              <Grid item xs={12} md={6} lg={4} key={resume.id}>
                <ResumeCard resume={resume} />
              </Grid>
            ))}
          </AnimatePresence>
        </Grid>
      )}

      {/* Upload Dialog */}
      <Dialog
        open={uploadDialog}
        onClose={() => !isUploading && setUploadDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Upload New Resume</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Resume Title"
              value={resumeTitle}
              onChange={(e) => setResumeTitle(e.target.value)}
              placeholder="e.g., Senior Frontend Developer Resume"
              sx={{ mb: 3 }}
              disabled={isUploading}
            />
            
            <Paper
              variant="outlined"
              sx={{
                p: 3,
                textAlign: 'center',
                border: '2px dashed',
                borderColor: selectedFile ? 'primary.main' : 'grey.300',
                bgcolor: selectedFile ? 'primary.50' : 'transparent',
                cursor: isUploading ? 'not-allowed' : 'pointer'
              }}
              component="label"
            >
              <input
                type="file"
                hidden
                accept=".pdf,.doc,.docx"
                onChange={handleFileSelect}
                disabled={isUploading}
              />
              <CloudUpload sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                {selectedFile ? selectedFile.name : 'Choose a file or drag it here'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Supported formats: PDF, DOC, DOCX (max 5MB)
              </Typography>
              {selectedFile && (
                <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
                  {formatFileSize(selectedFile.size)}
                </Typography>
              )}
            </Paper>

            {isUploading && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="body2" gutterBottom>
                  Uploading... {uploadProgress}%
                </Typography>
                <LinearProgress variant="determinate" value={uploadProgress} />
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialog(false)} disabled={isUploading}>
            Cancel
          </Button>
          <Button
            onClick={handleUpload}
            variant="contained"
            disabled={!selectedFile || !resumeTitle.trim() || isUploading}
          >
            {isUploading ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => {
          // Handle preview
          handleMenuClose();
        }}>
          <Visibility sx={{ mr: 2 }} />
          Preview
        </MenuItem>
        <MenuItem onClick={() => {
          handleDownload(menuResume);
          handleMenuClose();
        }}>
          <Download sx={{ mr: 2 }} />
          Download
        </MenuItem>
        <MenuItem onClick={() => {
          // Handle share
          handleMenuClose();
        }}>
          <Share sx={{ mr: 2 }} />
          Share
        </MenuItem>
        <MenuItem onClick={() => {
          // Handle duplicate
          handleMenuClose();
        }}>
          <FileCopy sx={{ mr: 2 }} />
          Duplicate
        </MenuItem>
        {!menuResume?.isDefault && (
          <MenuItem onClick={() => {
            handleSetDefault(menuResume.id);
            handleMenuClose();
          }}>
            <Star sx={{ mr: 2 }} />
            Set as Default
          </MenuItem>
        )}
        <MenuItem onClick={() => {
          setSelectedResume(menuResume);
          setEditDialog(true);
          handleMenuClose();
        }}>
          <Edit sx={{ mr: 2 }} />
          Edit Details
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleDelete(menuResume.id);
            handleMenuClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <Delete sx={{ mr: 2 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Edit Dialog */}
      <Dialog
        open={editDialog}
        onClose={() => setEditDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Resume Details</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Resume Title"
            value={selectedResume?.title || ''}
            onChange={(e) => setSelectedResume(prev => ({ ...prev, title: e.target.value }))}
            sx={{ mt: 2, mb: 2 }}
          />
          {/* Add more edit fields as needed */}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialog(false)}>Cancel</Button>
          <Button variant="contained">Save Changes</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ApplicantResumeTab;
