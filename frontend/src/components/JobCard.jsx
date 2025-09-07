import { useState } from 'react';
import { Link } from 'wouter';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  Chip,
  Avatar,
  IconButton,
  Button,
  Tooltip,
  Rating,
  Stack,
} from '@mui/material';
import {
  LocationOn,
  Work,
  Schedule,
  Business,
  Favorite,
  FavoriteBorder,
  Share,
  Bookmark,
  BookmarkBorder,
  Verified,
  Star,
  FlashOn,
  Home,
  Visibility,
  Groups,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const StyledJobCard = styled(Card)(({ theme, featured }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'all 0.3s ease-in-out',
  position: 'relative',
  cursor: 'pointer',
  ...(featured && {
    border: `2px solid ${theme.palette.primary.main}`,
    backgroundColor: theme.palette.primary.light + '10',
  }),
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: theme.shadows[12],
  },
}));

const JobCard = ({ job, onFavoriteToggle, onBookmarkToggle, isFavorited = false, isBookmarked = false }) => {
  const [localFavorited, setLocalFavorited] = useState(isFavorited);
  const [localBookmarked, setLocalBookmarked] = useState(isBookmarked);

  const handleFavoriteClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setLocalFavorited(!localFavorited);
    onFavoriteToggle?.(job.id);
  };

  const handleBookmarkClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setLocalBookmarked(!localBookmarked);
    onBookmarkToggle?.(job.id);
  };

  const handleShareClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: job.title,
        text: `Check out this job at ${job.company}`,
        url: window.location.origin + `/job/${job.id}`,
      });
    }
  };

  const formatSalary = (min, max) => {
    const formatAmount = (amount) => {
      if (amount >= 100000) {
        return `₹${(amount / 100000).toFixed(0)}L`;
      } else {
        return `₹${(amount / 1000).toFixed(0)}K`;
      }
    };
    return `${formatAmount(min)} - ${formatAmount(max)}`;
  };

  return (
    <StyledJobCard featured={job.featured}>
      <CardContent sx={{ flexGrow: 1 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Stack direction="row" spacing={2} sx={{ flexGrow: 1, minWidth: 0 }}>
            <Avatar
              sx={{ 
                bgcolor: 'primary.main', 
                color: 'white',
                width: 56,
                height: 56,
                fontSize: '1.2rem',
                fontWeight: 'bold'
              }}
            >
              {job.companyLogo || job.company?.[0]}
            </Avatar>
            <Box sx={{ minWidth: 0, flexGrow: 1 }}>
              <Typography variant="h6" fontWeight="bold" gutterBottom noWrap>
                {job.title}
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="subtitle1" color="primary" fontWeight="bold">
                  {job.company}
                </Typography>
                {job.verified && (
                  <Verified sx={{ fontSize: 16, color: 'success.main' }} />
                )}
              </Stack>
              <Stack direction="row" spacing={2} alignItems="center">
                <Rating value={job.rating || 4.0} precision={0.1} size="small" readOnly />
                <Typography variant="body2" color="text.secondary">
                  {job.rating || 4.0} • {job.applicants || 0}+ applied
                </Typography>
              </Stack>
            </Box>
          </Stack>
          
          <Stack direction="column" spacing={1}>
            <Tooltip title={localFavorited ? 'Remove from favorites' : 'Add to favorites'}>
              <IconButton onClick={handleFavoriteClick} size="small">
                {localFavorited ? 
                  <Favorite color="error" /> : 
                  <FavoriteBorder />
                }
              </IconButton>
            </Tooltip>
            <Tooltip title={localBookmarked ? 'Remove bookmark' : 'Bookmark job'}>
              <IconButton onClick={handleBookmarkClick} size="small">
                {localBookmarked ? 
                  <Bookmark color="primary" /> : 
                  <BookmarkBorder />
                }
              </IconButton>
            </Tooltip>
            <Tooltip title="Share job">
              <IconButton onClick={handleShareClick} size="small">
                <Share />
              </IconButton>
            </Tooltip>
          </Stack>
        </Box>

        {/* Job Details */}
        <Stack direction="row" spacing={3} sx={{ mb: 2, flexWrap: 'wrap' }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {job.location?.split(',')[0] || 'Remote'}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <Work sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {job.experience || '0-2 years'}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <Schedule sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary">
              {job.type || 'Full-time'}
            </Typography>
          </Stack>
        </Stack>

        {/* Salary */}
        <Typography variant="h6" color="primary" fontWeight="bold" gutterBottom>
          {job.salaryMin && job.salaryMax ? 
            formatSalary(job.salaryMin, job.salaryMax) : 
            job.salary || '₹5-10L'
          }
        </Typography>

        {/* Tags and Badges */}
        <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap' }}>
          <Chip
            label={job.workMode || job.mode || 'On-site'}
            size="small"
            color={
              (job.workMode === 'Remote' || job.mode === 'Remote') ? 'success' : 
              (job.workMode === 'Hybrid' || job.mode === 'Hybrid') ? 'warning' : 'default'
            }
            icon={(job.workMode === 'Remote' || job.mode === 'Remote') ? <Home /> : undefined}
          />
          {job.featured && (
            <Chip
              label="Featured"
              size="small"
              color="primary"
              icon={<Star />}
            />
          )}
          {job.urgentHiring && (
            <Chip
              label="Urgent Hiring"
              size="small"
              color="error"
              icon={<FlashOn />}
            />
          )}
          <Chip
            label={job.posted || '2 days ago'}
            size="small"
            variant="outlined"
          />
        </Stack>

        {/* Skills */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" gutterBottom>
            Required Skills:
          </Typography>
          <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap' }}>
            {(job.skills || ['React', 'JavaScript', 'Node.js']).slice(0, 4).map((skill, index) => (
              <Chip
                key={index}
                label={skill}
                size="small"
                variant="outlined"
                color="primary"
                sx={{ mb: 0.5 }}
              />
            ))}
            {(job.skills?.length || 3) > 4 && (
              <Chip
                label={`+${(job.skills?.length || 3) - 4} more`}
                size="small"
                variant="outlined"
                sx={{ mb: 0.5 }}
              />
            )}
          </Stack>
        </Box>

        {/* Description */}
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {job.description?.substring(0, 120) || 'Join our team and work on exciting projects with cutting-edge technology...'}...
        </Typography>

        {/* Job Stats */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Visibility sx={{ fontSize: 16, color: 'text.secondary' }} />
            <Typography variant="caption" color="text.secondary">
              {job.views || 1250} views
            </Typography>
          </Stack>
          <Typography variant="caption" color="text.secondary">
            {job.industry || 'Technology'}
          </Typography>
        </Stack>
      </CardContent>

      <CardActions sx={{ p: 2, pt: 0 }}>
        <Button
          component={Link}
          href={`/job/${job.id}`}
          variant="outlined"
          size="small"
          sx={{ mr: 1 }}
        >
          View Details
        </Button>
        <Button
          variant="contained"
          size="small"
          fullWidth
        >
          Apply Now
        </Button>
      </CardActions>

      {/* Featured Badge */}
      {job.featured && (
        <Box
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            bgcolor: 'primary.main',
            color: 'white',
            px: 1,
            py: 0.5,
            borderRadius: 1,
            fontSize: '0.75rem',
            fontWeight: 'bold',
          }}
        >
          FEATURED
        </Box>
      )}
    </StyledJobCard>
  );
};

export default JobCard;