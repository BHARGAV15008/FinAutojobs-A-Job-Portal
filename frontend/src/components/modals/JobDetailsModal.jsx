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
      maxWidth={false}
      PaperProps={{
        sx: {
          width: { xs: '95vw', sm: '460px', md: '500px' },
          maxWidth: '500px',
          maxHeight: '90vh',
          m: 1.5,
          borderRadius: '6px',
        },
      }}
    >
      {/* Header */}
      <DialogTitle sx={{ p: 0 }}>
        <Box sx={{ p: 2, pb: 1.5, position: 'relative' }}>
          <IconButton
            onClick={onClose}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
          
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, pr: 4 }}>
            <Avatar
              sx={{
                bgcolor: 'primary.main',
                width: 48,
                height: 48,
                fontSize: '1.1rem',
                fontWeight: 'bold',
              }}
            >
              {(job.companyName || job.company)?.substring(0, 2).toUpperCase()}
            </Avatar>
            
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" fontWeight="bold" sx={{ mb: 0.5, fontSize: '1.1rem' }}>
                {job.jobTitle || job.title}
              </Typography>
              
              <Typography variant="body2" color="primary" fontWeight="600" sx={{ mb: 1 }}>
                {job.companyName || job.company}
              </Typography>
            </Box>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ px: 2, py: 1 }}>
          {/* Job Details Table */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ fontSize: '1rem', mb: 1.5 }}>
              Job Details
            </Typography>
              <TableContainer>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold', width: '35%', py: 0.75, fontSize: '0.85rem' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <LocationOn sx={{ fontSize: 14 }} />
                          Location
                        </Box>
                      </TableCell>
                      <TableCell sx={{ py: 0.75, fontSize: '0.85rem' }}>{job.location}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold', py: 0.75, fontSize: '0.85rem' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <AttachMoney sx={{ fontSize: 14 }} />
                          Salary
                        </Box>
                      </TableCell>
                      <TableCell sx={{ py: 0.75, fontSize: '0.85rem' }}>
                        <Typography color="primary" fontWeight="bold" sx={{ fontSize: '0.85rem' }}>
                          {job.formattedSalary || job.salary || 
                           (job.salaryRange?.min && job.salaryRange?.max ? 
                            `₹${(job.salaryRange.min / 100000).toFixed(1)}L - ₹${(job.salaryRange.max / 100000).toFixed(1)}L ${job.salaryRange.period || 'Yearly'}` :
                            job.salaryRange?.min ? 
                            `₹${(job.salaryRange.min / 100000).toFixed(1)}L+ ${job.salaryRange.period || 'Yearly'}` : 
                            'Negotiable')}
                        </Typography>
                        {job.salaryRange && (
                          <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: '0.75rem' }}>
                            {job.salaryRange.currency || 'INR'} {job.salaryRange.min?.toLocaleString()} - {job.salaryRange.max?.toLocaleString()} {job.salaryRange.period || 'Yearly'}
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold', py: 0.75, fontSize: '0.85rem' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Work sx={{ fontSize: 14 }} />
                          Experience Required
                        </Box>
                      </TableCell>
                      <TableCell sx={{ py: 0.75, fontSize: '0.85rem' }}>
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
                      <TableCell sx={{ fontWeight: 'bold', py: 0.75, fontSize: '0.85rem' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Schedule sx={{ fontSize: 14 }} />
                          Job Type
                        </Box>
                      </TableCell>
                      <TableCell sx={{ py: 0.75 }}>
                        <Chip label={job.jobType || job.type} size="small" sx={{ fontSize: '0.75rem', height: '22px' }} />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold', py: 0.75, fontSize: '0.85rem' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Work sx={{ fontSize: 14 }} />
                          Work Arrangement
                        </Box>
                      </TableCell>
                      <TableCell sx={{ py: 0.75 }}>
                        <Chip 
                          label={job.workArrangement || job.workMode || 'On-site'} 
                          size="small" 
                          sx={{ fontSize: '0.75rem', height: '22px' }}
                          color={
                            (job.workArrangement || job.workMode) === 'Remote' ? 'success' : 
                            (job.workArrangement || job.workMode) === 'Hybrid' ? 'warning' : 'default'
                          }
                        />
                      </TableCell>
                    </TableRow>
                    {job.applicationDeadline && (
                      <TableRow>
                        <TableCell sx={{ fontWeight: 'bold', py: 0.75, fontSize: '0.85rem' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            <CalendarToday sx={{ fontSize: 14 }} />
                            Application Deadline
                          </Box>
                        </TableCell>
                        <TableCell sx={{ py: 0.75 }}>
                          <Typography color="error" fontWeight="bold" sx={{ fontSize: '0.85rem' }}>
                            {new Date(job.applicationDeadline).toLocaleDateString()}
                          </Typography>
                          {job.daysUntilDeadline && (
                            <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: '0.75rem' }}>
                              {job.daysUntilDeadline > 0 ? `${job.daysUntilDeadline} days left` : 'Expired'}
                            </Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    )}
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold', py: 0.75, fontSize: '0.85rem' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Star sx={{ fontSize: 14 }} />
                          Job Priority
                        </Box>
                      </TableCell>
                      <TableCell sx={{ py: 0.75 }}>
                        <Chip 
                          label={job.jobUrgency || job.urgency || 'Normal Priority'} 
                          size="small" 
                          sx={{ fontSize: '0.75rem', height: '22px' }}
                          color={
                            (job.jobUrgency || job.urgency) === 'High Priority' ? 'error' :
                            (job.jobUrgency || job.urgency) === 'Urgent' ? 'warning' : 'default'
                          }
                        />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
          </Box>

          {/* Job Description */}
          {(job.jobDescription || job.description) && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ fontSize: '1rem', mb: 1.5 }}>
                Job Description
              </Typography>
                <Typography variant="body2" sx={{ lineHeight: 1.5, whiteSpace: 'pre-line', fontSize: '0.85rem' }}>
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
            </Box>
          )}

          {/* Required Skills */}
          {(job.requiredSkills || job.skills) && (job.requiredSkills || job.skills).length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ fontSize: '1rem', mb: 1.5 }}>
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
            </Box>
          )}

          {/* Preferred Skills */}
          {job.preferredSkills && job.preferredSkills.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ fontSize: '1rem', mb: 1.5 }}>
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
            </Box>
          )}

          {/* Job Responsibilities */}
          {(job.keyResponsibilities || job.responsibilities) && (job.keyResponsibilities || job.responsibilities).length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ fontSize: '1rem', mb: 1.5 }}>
                Key Responsibilities
              </Typography>
                <Box component="ul" sx={{ pl: 2, m: 0 }}>
                  {(job.keyResponsibilities || job.responsibilities).map((resp, index) => (
                    <Typography component="li" key={index} variant="body2" sx={{ mb: 0.5 }}>
                      {resp}
                    </Typography>
                  ))}
                </Box>
            </Box>
          )}

          {/* Requirements */}
          {job.requirements && job.requirements.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ fontSize: '1rem', mb: 1.5 }}>
                Requirements
              </Typography>
                <Box component="ul" sx={{ pl: 2, m: 0 }}>
                  {job.requirements.map((req, index) => (
                    <Typography component="li" key={index} variant="body2" sx={{ mb: 0.5 }}>
                      {req}
                    </Typography>
                  ))}
                </Box>
            </Box>
          )}

          {/* Qualifications */}
          {job.qualifications && job.qualifications.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ fontSize: '1rem', mb: 1.5 }}>
                Preferred Qualifications
              </Typography>
                <Box component="ul" sx={{ pl: 2, m: 0 }}>
                  {job.qualifications.map((qual, index) => (
                    <Typography component="li" key={index} variant="body2" sx={{ mb: 0.5 }}>
                      {qual}
                    </Typography>
                  ))}
                </Box>
            </Box>
          )}

          {/* Benefits */}
          {job.benefits && job.benefits.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ fontSize: '1rem', mb: 1.5 }}>
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
            </Box>
          )}

        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, pt: 0, gap: 1 }}>
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
