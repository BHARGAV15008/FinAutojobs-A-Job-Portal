import { useTheme, useMediaQuery } from '@mui/material';

// Custom hook for responsive breakpoints
export const useResponsive = () => {
  const theme = useTheme();
  
  return {
    isMobile: useMediaQuery(theme.breakpoints.down('sm')),
    isTablet: useMediaQuery(theme.breakpoints.between('sm', 'md')),
    isDesktop: useMediaQuery(theme.breakpoints.up('md')),
    isLargeDesktop: useMediaQuery(theme.breakpoints.up('lg')),
    isExtraLarge: useMediaQuery(theme.breakpoints.up('xl')),
  };
};

// Responsive grid configurations
export const getResponsiveGridProps = (type = 'default') => {
  const configs = {
    default: {
      xs: 12,
      sm: 6,
      md: 4,
      lg: 3
    },
    cards: {
      xs: 12,
      sm: 6,
      md: 4,
      lg: 3
    },
    stats: {
      xs: 12,
      sm: 6,
      md: 3
    },
    featured: {
      xs: 12,
      sm: 6,
      md: 6,
      lg: 4
    },
    charts: {
      xs: 12,
      md: 6,
      lg: 4
    },
    tables: {
      xs: 12
    },
    sidebar: {
      xs: 12,
      md: 4,
      lg: 3
    },
    content: {
      xs: 12,
      md: 8,
      lg: 9
    }
  };
  
  return configs[type] || configs.default;
};

// Responsive spacing configurations
export const getResponsiveSpacing = (size = 'medium') => {
  const spacings = {
    small: { xs: 1, sm: 2, md: 2 },
    medium: { xs: 2, sm: 3, md: 3 },
    large: { xs: 3, sm: 4, md: 4 },
    xlarge: { xs: 4, sm: 5, md: 6 }
  };
  
  return spacings[size] || spacings.medium;
};

// Responsive font sizes
export const getResponsiveFontSize = (variant = 'body1') => {
  const fontSizes = {
    h1: { xs: '2rem', sm: '2.5rem', md: '3rem' },
    h2: { xs: '1.75rem', sm: '2rem', md: '2.5rem' },
    h3: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
    h4: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' },
    h5: { xs: '1.125rem', sm: '1.25rem', md: '1.5rem' },
    h6: { xs: '1rem', sm: '1.125rem', md: '1.25rem' },
    body1: { xs: '0.875rem', sm: '1rem', md: '1rem' },
    body2: { xs: '0.75rem', sm: '0.875rem', md: '0.875rem' }
  };
  
  return fontSizes[variant] || fontSizes.body1;
};

// Responsive container max widths
export const getResponsiveMaxWidth = (size = 'lg') => {
  return size;
};

// Mobile-first responsive utilities
export const mobileFirst = {
  // Hide on mobile, show on desktop
  hideOnMobile: {
    display: { xs: 'none', md: 'block' }
  },
  
  // Show on mobile, hide on desktop
  showOnMobile: {
    display: { xs: 'block', md: 'none' }
  },
  
  // Responsive flex direction
  flexColumn: {
    flexDirection: { xs: 'column', md: 'row' }
  },
  
  // Responsive text alignment
  centerOnMobile: {
    textAlign: { xs: 'center', md: 'left' }
  },
  
  // Responsive padding
  responsivePadding: {
    p: { xs: 2, sm: 3, md: 4 }
  },
  
  // Responsive margin
  responsiveMargin: {
    m: { xs: 1, sm: 2, md: 3 }
  }
};

export default {
  useResponsive,
  getResponsiveGridProps,
  getResponsiveSpacing,
  getResponsiveFontSize,
  getResponsiveMaxWidth,
  mobileFirst
};
