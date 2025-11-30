import { useState } from 'react';
import { Link } from 'wouter';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Avatar,
} from '@mui/material';
import {
  LocationOn,
  Work,
  Schedule,
  ChevronRight,
  CurrencyRupee,
  Business,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const StyledJobCard = styled(Card)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  padding: '14px 16px',
  borderRadius: '6px',
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: 'none',
  transition: 'all 0.2s ease',
  cursor: 'pointer',
  backgroundColor: theme.palette.background.paper,
  '&:hover': {
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    borderColor: theme.palette.primary.light,
  },
}));

const JobCard = ({ job, onFavoriteToggle, onBookmarkToggle, isFavorited = false, isBookmarked = false }) => {
  const formatSalary = (min, max, salary) => {
    if (salary) return salary;
    if (min && max) {
      const formatAmount = (amount) => {
        if (amount >= 100000) {
          return `₹${(amount / 1000).toLocaleString('en-IN')}`;
        }
        return `₹${amount.toLocaleString('en-IN')}`;
      };
      return `${formatAmount(min)} - ${formatAmount(max)}`;
    }
    return 'Not disclosed';
  };

  const getWorkModeText = () => {
    const mode = job.workMode || job.mode || 'On-site';
    if (mode === 'Remote') return 'Work from home';
    if (mode === 'Hybrid') return 'Hybrid';
    return 'Work from Office';
  };

  return (
    <Link href={`/job/${job.id}`} style={{ textDecoration: 'none' }}>
      <StyledJobCard>
        {/* Company Logo */}
        <Avatar
          sx={{
            bgcolor: job.companyColor || 'primary.main',
            color: 'white',
            width: 44,
            height: 44,
            fontSize: '0.85rem',
            fontWeight: 'bold',
            mr: 2,
            flexShrink: 0,
            borderRadius: '6px',
          }}
          variant="rounded"
          src={job.companyLogoUrl}
        >
          {job.companyLogo || job.company?.substring(0, 2).toUpperCase() || 'CO'}
        </Avatar>

        {/* Main Content */}
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          {/* Title */}
          <Typography 
            variant="subtitle1" 
            fontWeight="600" 
            sx={{ 
              color: 'text.primary',
              mb: 0.25,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              fontSize: '0.95rem'
            }}
          >
            {job.title}
          </Typography>
          
          {/* Company Name */}
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'text.secondary',
              mb: 1,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              fontSize: '0.8rem'
            }}
          >
            {job.company}
          </Typography>

          {/* Location Row */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.75 }}>
            <LocationOn sx={{ fontSize: 15, color: 'text.secondary', mr: 0.5 }} />
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
              {job.location || 'Location not specified'}
            </Typography>
          </Box>

          {/* Salary Row */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.25 }}>
            <CurrencyRupee sx={{ fontSize: 15, color: 'text.secondary', mr: 0.25 }} />
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
              {formatSalary(job.salaryMin, job.salaryMax, job.salary)}
            </Typography>
          </Box>

          {/* Tags Row */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <Chip
              icon={<Business sx={{ fontSize: '13px !important' }} />}
              label={getWorkModeText()}
              size="small"
              sx={{
                height: 22,
                fontSize: '0.7rem',
                bgcolor: 'action.hover',
                color: 'text.secondary',
                '& .MuiChip-icon': { color: 'text.secondary', ml: 0.5 },
                '& .MuiChip-label': { px: 1 }
              }}
            />
            <Chip
              icon={<Work sx={{ fontSize: '13px !important' }} />}
              label={job.type || 'Full Time'}
              size="small"
              sx={{
                height: 22,
                fontSize: '0.7rem',
                bgcolor: 'action.hover',
                color: 'text.secondary',
                '& .MuiChip-icon': { color: 'text.secondary', ml: 0.5 },
                '& .MuiChip-label': { px: 1 }
              }}
            />
            <Chip
              icon={<Schedule sx={{ fontSize: '13px !important' }} />}
              label={job.experience || 'Min. 1 year'}
              size="small"
              sx={{
                height: 22,
                fontSize: '0.7rem',
                bgcolor: 'action.hover',
                color: 'text.secondary',
                '& .MuiChip-icon': { color: 'text.secondary', ml: 0.5 },
                '& .MuiChip-label': { px: 1 }
              }}
            />
          </Box>
        </Box>

        {/* Right Arrow */}
        <ChevronRight 
          sx={{ 
            color: 'text.secondary',
            ml: 1,
            flexShrink: 0,
            fontSize: 24
          }} 
        />
      </StyledJobCard>
    </Link>
  );
};

export default JobCard;