import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Grid,
  Chip,
  Avatar,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Card,
  CardContent,
} from '@mui/material';
import {
  Close as CloseIcon,
  LocationOn,
  Work,
  AttachMoney,
  Schedule,
  Business,
  Person,
  CalendarToday,
  Star,
  Verified,
  Bookmark,
  BookmarkBorder,
  Share,
  Send as ApplyIcon,
  Visibility,
} from '@mui/icons-material';
import { motion } from 'framer-motion';

const JobDetailsModal = ({ open, onClose, job, onApply }) => {
  const [bookmarked, setBookmarked] = useState(false);

  if (!job) return null;

  // Debug: Log job data to see all available fields
  console.log('🔍 JobDetailsModal received job data:', job);
  console.log('🔍 Job fields available:', Object.keys(job));

  const handleBookmark = () => {
    setBookmarked(!bookmarked);
    // TODO: Implement bookmark functionality
  };

  const handleShare = () => {
    // TODO: Implement share functionality
    navigator.share({
      title: job.title,
      text: `Check out this job: ${job.title} at ${job.company}`,
      url: window.location.href,
    });
  };

  const handleApply = () => {
    onApply(job);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          maxHeight: '90vh',
        },
      }}
    >
      {/* Header */}
      <DialogTitle sx={{ p: 0 }}>
        <Box sx={{ p: 3, pb: 2, position: 'relative' }}>
          <IconButton
            onClick={onClose}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
          
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, pr: 5 }}>
            <Avatar
              sx={{
                bgcolor: 'primary.main',
                width: 64,
                height: 64,
                fontSize: '1.5rem',
                fontWeight: 'bold',
              }}
            >
              {(job.companyName || job.company)?.substring(0, 2).toUpperCase()}
            </Avatar>
            
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                {job.jobTitle || job.title}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="h6" color="primary" fontWeight="bold">
                  {job.companyName || job.company}
                </Typography>
                {job.verified && (
                  <Verified sx={{ fontSize: 20, color: 'success.main' }} />
                )}
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <Star sx={{ fontSize: 16, color: 'warning.main' }} />
                  <Typography variant="body2" color="text.secondary">
                    {job.rating || 4.5}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {job.applicants || 0}+ applied
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {job.views || 0} views
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title={bookmarked ? 'Remove bookmark' : 'Bookmark job'}>
                  <IconButton onClick={handleBookmark} size="small">
                    {bookmarked ? <Bookmark color="primary" /> : <BookmarkBorder />}
                  </IconButton>
                </Tooltip>
                <Tooltip title="Share job">
                  <IconButton onClick={handleShare} size="small">
                    <Share />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ px: 3 }}>
          {/* Job Details Table */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Job Details
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold', width: '30%' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LocationOn sx={{ fontSize: 16 }} />
                          Location
                        </Box>
                      </TableCell>
                      <TableCell>{job.location}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <AttachMoney sx={{ fontSize: 16 }} />
                          Salary
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography color="primary" fontWeight="bold">
                          {job.formattedSalary || job.salary || 
                           (job.salaryRange?.min && job.salaryRange?.max ? 
                            `₹${(job.salaryRange.min / 100000).toFixed(1)}L - ₹${(job.salaryRange.max / 100000).toFixed(1)}L ${job.salaryRange.period || 'Yearly'}` :
                            job.salaryRange?.min ? 
                            `₹${(job.salaryRange.min / 100000).toFixed(1)}L+ ${job.salaryRange.period || 'Yearly'}` : 
                            'Negotiable')}
                        </Typography>
                        {job.salaryRange && (
                          <Typography variant="caption" color="text.secondary" display="block">
                            {job.salaryRange.currency || 'INR'} {job.salaryRange.min?.toLocaleString()} - {job.salaryRange.max?.toLocaleString()} {job.salaryRange.period || 'Yearly'}
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Work sx={{ fontSize: 16 }} />
                          Experience Required
                        </Box>
                      </TableCell>
                      <TableCell>
                        {job.experience && (job.experience.minimum !== undefined || job.experience.maximum !== undefined) ? 
                          `${job.experience.minimum || 0} - ${job.experience.maximum || 0} years` : 
                          job.experience && (job.experience.min !== undefined || job.experience.max !== undefined) ?
                          `${job.experience.min || 0} - ${job.experience.max || 0} years` :
                          typeof job.experience === 'string' ? job.experience :
                          'Not specified'
                        }
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Schedule sx={{ fontSize: 16 }} />
                          Job Type
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip label={job.jobType || job.type} size="small" />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Business sx={{ fontSize: 16 }} />
                          Industry
                        </Box>
                      </TableCell>
                      <TableCell>{job.industry || 'Not specified'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Work sx={{ fontSize: 16 }} />
                          Job Category
                        </Box>
                      </TableCell>
                      <TableCell>{job.jobCategory || job.category || 'General'}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Work sx={{ fontSize: 16 }} />
                          Work Arrangement
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={job.workArrangement || job.workMode || 'On-site'} 
                          size="small" 
                          color={
                            (job.workArrangement || job.workMode) === 'Remote' ? 'success' : 
                            (job.workArrangement || job.workMode) === 'Hybrid' ? 'warning' : 'default'
                          }
                        />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CalendarToday sx={{ fontSize: 16 }} />
                          Posted Date
                        </Box>
                      </TableCell>
                      <TableCell>
                        {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : job.posted || 'Recently'}
                        {job.daysSincePosted && (
                          <Typography variant="caption" color="text.secondary" display="block">
                            {job.daysSincePosted} days ago
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                    {job.applicationDeadline && (
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CalendarToday sx={{ fontSize: 16 }} />
                            Application Deadline
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography color="error" fontWeight="bold">
                            {new Date(job.applicationDeadline).toLocaleDateString()}
                          </Typography>
                          {job.daysUntilDeadline && (
                            <Typography variant="caption" color="text.secondary" display="block">
                              {job.daysUntilDeadline > 0 ? `${job.daysUntilDeadline} days left` : 'Expired'}
                            </Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    )}
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Star sx={{ fontSize: 16 }} />
                          Job Priority
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={job.jobUrgency || job.urgency || 'Normal Priority'} 
                          size="small" 
                          color={
                            (job.jobUrgency || job.urgency) === 'High Priority' ? 'error' :
                            (job.jobUrgency || job.urgency) === 'Urgent' ? 'warning' : 'default'
                          }
                        />
                      </TableCell>
                    </TableRow>
                    {job.contactEmail && (
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Person sx={{ fontSize: 16 }} />
                            Contact Email
                          </Box>
                        </TableCell>
                        <TableCell>{job.contactEmail}</TableCell>
                      </TableRow>
                    )}
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Visibility sx={{ fontSize: 16 }} />
                          Views & Applications
                        </Box>
                      </TableCell>
                      <TableCell>
                        {job.views || 0} views • {job.applicationsCount || 0} applications
                      </TableCell>
                    </TableRow>
                    {job.status && (
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Star sx={{ fontSize: 16 }} />
                            Job Status
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={job.status} 
                            size="small" 
                            color={job.status === 'Active' ? 'success' : 'default'}
                          />
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>

          {/* Job Description */}
          {(job.jobDescription || job.description) && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Job Description
                </Typography>
                <Typography variant="body1" sx={{ lineHeight: 1.6, whiteSpace: 'pre-line' }}>
                  {job.jobDescription || job.description}
                </Typography>
                {job.isAiEnhanced && (
                  <Box sx={{ mt: 2, p: 1, bgcolor: 'info.light', borderRadius: 1 }}>
                    <Typography variant="caption" color="info.dark">
                      ✨ This job description has been enhanced with AI
                    </Typography>
                  </Box>
                )}
                {job.aiKeywords && job.aiKeywords.length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      AI Keywords:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {job.aiKeywords.map((keyword, index) => (
                        <Chip
                          key={index}
                          label={keyword}
                          size="small"
                          variant="outlined"
                          color="info"
                        />
                      ))}
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          )}

          {/* Required Skills */}
          {(job.requiredSkills || job.skills) && (job.requiredSkills || job.skills).length > 0 && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Required Skills
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {(job.requiredSkills || job.skills).map((skill, index) => (
                    <Chip
                      key={index}
                      label={skill}
                      variant="filled"
                      color="primary"
                      size="small"
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Preferred Skills */}
          {job.preferredSkills && job.preferredSkills.length > 0 && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Preferred Skills (Nice to Have)
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {job.preferredSkills.map((skill, index) => (
                    <Chip
                      key={index}
                      label={skill}
                      variant="outlined"
                      color="secondary"
                      size="small"
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Job Responsibilities */}
          {(job.keyResponsibilities || job.responsibilities) && (job.keyResponsibilities || job.responsibilities).length > 0 && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Key Responsibilities
                </Typography>
                <Box component="ul" sx={{ pl: 2, m: 0 }}>
                  {(job.keyResponsibilities || job.responsibilities).map((resp, index) => (
                    <Typography component="li" key={index} variant="body2" sx={{ mb: 0.5 }}>
                      {resp}
                    </Typography>
                  ))}
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Requirements */}
          {job.requirements && job.requirements.length > 0 && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Requirements
                </Typography>
                <Box component="ul" sx={{ pl: 2, m: 0 }}>
                  {job.requirements.map((req, index) => (
                    <Typography component="li" key={index} variant="body2" sx={{ mb: 0.5 }}>
                      {req}
                    </Typography>
                  ))}
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Qualifications */}
          {job.qualifications && job.qualifications.length > 0 && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Preferred Qualifications
                </Typography>
                <Box component="ul" sx={{ pl: 2, m: 0 }}>
                  {job.qualifications.map((qual, index) => (
                    <Typography component="li" key={index} variant="body2" sx={{ mb: 0.5 }}>
                      {qual}
                    </Typography>
                  ))}
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Benefits */}
          {job.benefits && job.benefits.length > 0 && (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Benefits & Perks
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {job.benefits.map((benefit, index) => (
                    <Chip
                      key={index}
                      label={benefit}
                      variant="filled"
                      color="success"
                      size="small"
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Company Info */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                About {job.companyName || job.company}
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                {job.companyDescription || 
                 `${job.companyName || job.company} is a leading company in the ${job.industry || 'technology'} sector, committed to innovation and excellence.`}
              </Typography>
              
              {/* Company Details Grid */}
              <Grid container spacing={2} sx={{ mt: 2 }}>
                {job.industry && (
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Industry
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {job.industry}
                    </Typography>
                  </Grid>
                )}
                {job.companySize && (
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Company Size
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {job.companySize}
                    </Typography>
                  </Grid>
                )}
                {job.founded && (
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Founded
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {job.founded}
                    </Typography>
                  </Grid>
                )}
                {job.website && (
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Website
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      <a href={job.website} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>
                        {job.website}
                      </a>
                    </Typography>
                  </Grid>
                )}
                {/* Recruiter Information */}
                {job.recruiterInfo && (
                  <>
                    {job.recruiterInfo.companyInfo?.department && (
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                          Department
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {job.recruiterInfo.companyInfo.department}
                        </Typography>
                      </Grid>
                    )}
                    {job.recruiterInfo.companyInfo?.designation && (
                      <Grid item xs={6}>
                        <Typography variant="caption" color="text.secondary">
                          Posted By
                        </Typography>
                        <Typography variant="body2" fontWeight="bold">
                          {job.recruiterInfo.companyInfo.designation}
                        </Typography>
                      </Grid>
                    )}
                  </>
                )}
                {job.postedBy && (
                  <Grid item xs={6}>
                    <Typography variant="caption" color="text.secondary">
                      Recruiter
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {job.postedBy.firstName} {job.postedBy.lastName}
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>

          {/* Additional Job Information */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Additional Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" color="text.secondary">
                    Job Category
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {job.jobCategory || job.category || 'General'}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" color="text.secondary">
                    Salary Period
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {job.salaryRange?.period || job.salaryPeriod || 'Yearly'}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" color="text.secondary">
                    Currency
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {job.salaryRange?.currency || job.currency || 'INR'}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" color="text.secondary">
                    Posted Date
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : 
                     job.postedDate ? new Date(job.postedDate).toLocaleDateString() : 
                     job.posted || 'Recently'}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" color="text.secondary">
                    Job ID
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {job.id || job._id || 'N/A'}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="caption" color="text.secondary">
                    Job Slug
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {job.slug || 'Not generated'}
                  </Typography>
                </Grid>
                {job.aiKeywords && job.aiKeywords.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">
                      AI Keywords
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                      {job.aiKeywords.map((keyword, index) => (
                        <Chip
                          key={index}
                          label={keyword}
                          size="small"
                          variant="outlined"
                          color="info"
                        />
                      ))}
                    </Box>
                  </Grid>
                )}
                {job.tags && job.tags.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="caption" color="text.secondary">
                      Tags
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                      {job.tags.map((tag, index) => (
                        <Chip
                          key={index}
                          label={tag}
                          size="small"
                          variant="outlined"
                          color="default"
                        />
                      ))}
                    </Box>
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button
            onClick={handleApply}
            variant="contained"
            startIcon={<ApplyIcon />}
            size="large"
            sx={{ minWidth: 120 }}
          >
            Apply Now
          </Button>
        </motion.div>
      </DialogActions>
    </Dialog>
  );
};

export default JobDetailsModal;
