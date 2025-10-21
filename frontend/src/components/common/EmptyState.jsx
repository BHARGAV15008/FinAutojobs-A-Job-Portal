import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import {
  Work,
  Business,
  Notifications,
  Assessment,
  School,
  Message,
  BookmarkBorder,
  Schedule,
  TrendingUp,
  Person,
  Settings,
  Search,
  Add,
  Refresh
} from '@mui/icons-material';

const EmptyState = ({ 
  type = 'general',
  title,
  description,
  actionText,
  onAction,
  showRefresh = false,
  onRefresh,
  icon: CustomIcon,
  size = 'medium'
}) => {
  // Default configurations for different data types
  const configs = {
    applications: {
      icon: Work,
      title: 'No Applications Yet',
      description: 'You haven\'t applied to any jobs yet. Start exploring opportunities and apply to jobs that match your skills.',
      actionText: 'Browse Jobs',
      onAction: () => window.location.href = '/jobs'
    },
    jobs: {
      icon: Search,
      title: 'No Jobs Found',
      description: 'We couldn\'t find any jobs matching your criteria. Try adjusting your filters or check back later for new opportunities.',
      actionText: 'View All Jobs',
      onAction: () => window.location.href = '/jobs'
    },
    notifications: {
      icon: Notifications,
      title: 'No Notifications',
      description: 'You\'re all caught up! No new notifications at the moment.',
      actionText: null
    },
    bookmarks: {
      icon: BookmarkBorder,
      title: 'No Saved Jobs',
      description: 'You haven\'t saved any jobs yet. Bookmark interesting opportunities to review them later.',
      actionText: 'Browse Jobs',
      onAction: () => window.location.href = '/jobs'
    },
    interviews: {
      icon: Schedule,
      title: 'No Interviews Scheduled',
      description: 'You don\'t have any upcoming interviews. Keep applying to jobs to get interview opportunities.',
      actionText: 'View Applications',
      onAction: () => window.location.href = '/dashboard?tab=applications'
    },
    messages: {
      icon: Message,
      title: 'No Messages',
      description: 'Your inbox is empty. Start conversations with recruiters or respond to messages from employers.',
      actionText: null
    },
    skills: {
      icon: Assessment,
      title: 'No Skills Added',
      description: 'Add your skills to help employers find you and get better job recommendations.',
      actionText: 'Add Skills',
      onAction: () => window.location.href = '/profile?section=skills'
    },
    education: {
      icon: School,
      title: 'No Education Added',
      description: 'Add your educational background to strengthen your profile and attract employers.',
      actionText: 'Add Education',
      onAction: () => window.location.href = '/profile?section=education'
    },
    experience: {
      icon: Work,
      title: 'No Work Experience',
      description: 'Add your work experience to showcase your professional background to employers.',
      actionText: 'Add Experience',
      onAction: () => window.location.href = '/profile?section=experience'
    },
    certifications: {
      icon: Assessment,
      title: 'No Certifications',
      description: 'Add your certifications and achievements to stand out to employers.',
      actionText: 'Add Certification',
      onAction: () => window.location.href = '/profile?section=certifications'
    },
    projects: {
      icon: Work,
      title: 'No Projects',
      description: 'Showcase your projects to demonstrate your skills and experience to potential employers.',
      actionText: 'Add Project',
      onAction: () => window.location.href = '/profile?section=projects'
    },
    companies: {
      icon: Business,
      title: 'No Companies Found',
      description: 'No companies match your current filters. Try adjusting your search criteria.',
      actionText: 'View All Companies',
      onAction: () => window.location.href = '/companies'
    },
    users: {
      icon: Person,
      title: 'No Users Found',
      description: 'No users match the current filters. Try adjusting your search criteria.',
      actionText: null
    },
    analytics: {
      icon: TrendingUp,
      title: 'No Analytics Data',
      description: 'Analytics data will appear here once you start using the platform more actively.',
      actionText: null
    },
    alerts: {
      icon: Notifications,
      title: 'No Job Alerts',
      description: 'Create job alerts to get notified when new opportunities matching your criteria are posted.',
      actionText: 'Create Alert',
      onAction: () => window.location.href = '/job-alerts'
    },
    moderation: {
      icon: Settings,
      title: 'No Items to Moderate',
      description: 'All content has been reviewed. No items require moderation at this time.',
      actionText: null
    },
    general: {
      icon: Search,
      title: 'No Data Available',
      description: 'There\'s no data to display at the moment.',
      actionText: null
    }
  };

  const config = configs[type] || configs.general;
  const Icon = CustomIcon || config.icon;
  const finalTitle = title || config.title;
  const finalDescription = description || config.description;
  const finalActionText = actionText || config.actionText;
  const finalOnAction = onAction || config.onAction;

  const iconSizes = {
    small: 48,
    medium: 64,
    large: 80
  };

  const paddingSizes = {
    small: 3,
    medium: 4,
    large: 6
  };

  return (
    <Paper 
      sx={{ 
        p: paddingSizes[size], 
        textAlign: 'center',
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider'
      }}
    >
      <Box sx={{ mb: 2 }}>
        <Icon 
          sx={{ 
            fontSize: iconSizes[size], 
            color: 'text.secondary',
            mb: 2
          }} 
        />
      </Box>
      
      <Typography 
        variant={size === 'small' ? 'h6' : 'h5'} 
        color="text.secondary" 
        gutterBottom
        sx={{ fontWeight: 'medium' }}
      >
        {finalTitle}
      </Typography>
      
      <Typography 
        variant="body2" 
        color="text.secondary" 
        paragraph
        sx={{ maxWidth: 400, mx: 'auto', mb: 3 }}
      >
        {finalDescription}
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
        {finalActionText && finalOnAction && (
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={finalOnAction}
            size={size === 'small' ? 'small' : 'medium'}
          >
            {finalActionText}
          </Button>
        )}
        
        {showRefresh && onRefresh && (
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={onRefresh}
            size={size === 'small' ? 'small' : 'medium'}
          >
            Refresh
          </Button>
        )}
      </Box>
    </Paper>
  );
};

export default EmptyState;
