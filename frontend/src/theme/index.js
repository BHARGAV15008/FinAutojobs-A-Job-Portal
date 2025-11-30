import { createTheme } from '@mui/material/styles';

// Base theme configuration
const baseTheme = {
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 900,
      lg: 1200,
      xl: 1536,
    },
  },
  typography: {
    fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
    // Responsive typography
    h1: {
      fontWeight: 800,
      fontSize: 'clamp(2rem, 5vw, 3.5rem)',
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontWeight: 700,
      fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontWeight: 700,
      fontSize: 'clamp(1.5rem, 3vw, 2rem)',
      lineHeight: 1.4,
    },
    h4: {
      fontWeight: 600,
      fontSize: 'clamp(1.25rem, 2.5vw, 1.5rem)',
      lineHeight: 1.4,
    },
    h5: {
      fontWeight: 600,
      fontSize: 'clamp(1.125rem, 2vw, 1.25rem)',
      lineHeight: 1.5,
    },
    h6: {
      fontWeight: 600,
      fontSize: 'clamp(1rem, 1.5vw, 1.125rem)',
      lineHeight: 1.5,
    },
    subtitle1: {
      fontWeight: 500,
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    subtitle2: {
      fontWeight: 500,
      fontSize: '0.875rem',
      lineHeight: 1.6,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      fontSize: '0.875rem',
    },
    caption: {
      fontSize: '0.75rem',
      lineHeight: 1.5,
    },
    overline: {
      fontSize: '0.75rem',
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.1em',
    },
  },
  shape: {
    borderRadius: 6,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: '6px',
          padding: '10px 24px',
          fontSize: '0.875rem',
          fontWeight: 600,
          textTransform: 'none',
          boxShadow: 'none',
          minHeight: '44px', // Touch-friendly
          '&:hover': {
            boxShadow: '0px 4px 8px rgba(0,0,0,0.12)',
          },
          // Responsive padding
          [theme.breakpoints.down('sm')]: {
            padding: '8px 16px',
            fontSize: '0.8rem',
            minHeight: '40px',
          },
        }),
        contained: {
          '&:hover': {
            boxShadow: '0px 6px 12px rgba(0,0,0,0.15)',
          },
        },
        outlined: {
          borderWidth: '2px',
          '&:hover': {
            borderWidth: '2px',
          },
        },
        sizeSmall: ({ theme }) => ({
          padding: '6px 16px',
          fontSize: '0.75rem',
          [theme.breakpoints.down('sm')]: {
            padding: '4px 12px',
            fontSize: '0.7rem',
          },
        }),
        sizeLarge: ({ theme }) => ({
          padding: '12px 32px',
          fontSize: '1rem',
          [theme.breakpoints.down('sm')]: {
            padding: '10px 24px',
            fontSize: '0.9rem',
          },
        }),
      },
    },
    MuiCard: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: '6px',
          boxShadow: '0px 4px 12px rgba(0,0,0,0.05)',
          '&:hover': {
            boxShadow: '0px 8px 24px rgba(0,0,0,0.1)',
          },
          // Responsive margins and padding
          [theme.breakpoints.down('sm')]: {
            borderRadius: '6px',
            margin: '8px',
          },
        }),
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: ({ theme }) => ({
          '& .MuiOutlinedInput-root': {
            borderRadius: '6px',
            minHeight: '48px', // Touch-friendly
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#8B5CF6',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderWidth: '2px',
            },
            // Responsive sizing
            [theme.breakpoints.down('sm')]: {
              minHeight: '44px',
              fontSize: '16px', // Prevents zoom on iOS
            },
          },
        }),
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '6px',
          fontWeight: 500,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '6px',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0px 1px 3px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.875rem',
          minHeight: '48px',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: ({ theme }) => ({
          borderRadius: '6px',
          margin: '16px',
          width: 'calc(100% - 32px)',
          maxWidth: 'calc(100% - 32px)',
          [theme.breakpoints.down('sm')]: {
            borderRadius: '6px',
            margin: '8px',
            width: 'calc(100% - 16px)',
            maxWidth: 'calc(100% - 16px)',
          },
        }),
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: ({ theme }) => ({
          fontWeight: 600,
          [theme.breakpoints.down('sm')]: {
            width: '32px',
            height: '32px',
            fontSize: '0.875rem',
          },
        }),
      },
    },
    // Add responsive Grid component
    MuiGrid: {
      styleOverrides: {
        container: {
          width: '100%',
          margin: 0,
        },
        item: ({ theme }) => ({
          [theme.breakpoints.down('sm')]: {
            paddingLeft: theme.spacing(1),
            paddingRight: theme.spacing(1),
          },
        }),
      },
    },
    // Add responsive Container - Force full width
    MuiContainer: {
      styleOverrides: {
        root: ({ theme }) => ({
          paddingLeft: theme.spacing(2),
          paddingRight: theme.spacing(2),
          width: '100% !important',
          maxWidth: 'none !important',
          marginLeft: '0 !important',
          marginRight: '0 !important',
          [theme.breakpoints.up('sm')]: {
            paddingLeft: theme.spacing(3),
            paddingRight: theme.spacing(3),
          },
          [theme.breakpoints.up('lg')]: {
            paddingLeft: theme.spacing(4),
            paddingRight: theme.spacing(4),
          },
          // Only constrain width on very large screens
          [theme.breakpoints.up('xl')]: {
            maxWidth: '1400px !important',
            marginLeft: 'auto !important',
            marginRight: 'auto !important',
          },
        }),
        maxWidthXs: {
          maxWidth: 'none !important',
        },
        maxWidthSm: {
          maxWidth: 'none !important',
        },
        maxWidthMd: {
          maxWidth: 'none !important',
        },
        maxWidthLg: {
          maxWidth: 'none !important',
        },
        maxWidthXl: {
          maxWidth: 'none !important',
        },
      },
    },
    // Add responsive Toolbar
    MuiToolbar: {
      styleOverrides: {
        root: ({ theme }) => ({
          minHeight: '64px !important',
          [theme.breakpoints.down('sm')]: {
            minHeight: '56px !important',
            paddingLeft: theme.spacing(1),
            paddingRight: theme.spacing(1),
          },
        }),
      },
    },
  },
  // Add spacing system
  spacing: 8,
  // Add responsive mixins
  mixins: {
    toolbar: {
      minHeight: 64,
      '@media (max-width:600px)': {
        minHeight: 56,
      },
    },
  },
};

// Light theme
export const lightTheme = createTheme({
  ...baseTheme,
  palette: {
    mode: 'light',
    primary: {
      main: '#6B46C1', // Purple
      light: '#8B5CF6',
      dark: '#553C9A',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#3182CE', // Blue
      light: '#4299E1',
      dark: '#2C5282',
      contrastText: '#FFFFFF',
    },
    error: {
      main: '#E53E3E',
      light: '#FC8181',
      dark: '#C53030',
      contrastText: '#FFFFFF',
    },
    warning: {
      main: '#DD6B20',
      light: '#F6AD55',
      dark: '#C05621',
      contrastText: '#FFFFFF',
    },
    info: {
      main: '#3182CE',
      light: '#63B3ED',
      dark: '#2C5282',
      contrastText: '#FFFFFF',
    },
    success: {
      main: '#38A169',
      light: '#68D391',
      dark: '#2F855A',
      contrastText: '#FFFFFF',
    },
    text: {
      primary: '#1A202C',
      secondary: '#718096',
      disabled: '#A0AEC0',
    },
    background: {
      default: '#F7FAFC',
      paper: '#FFFFFF',
    },
    grey: {
      50: '#F7FAFC',
      100: '#EDF2F7',
      200: '#E2E8F0',
      300: '#CBD5E0',
      400: '#A0AEC0',
      500: '#718096',
      600: '#4A5568',
      700: '#2D3748',
      800: '#1A202C',
      900: '#171923',
    },
    divider: '#E2E8F0',
  },
  components: {
    ...baseTheme.components,
    MuiCard: {
      styleOverrides: {
        root: {
          ...baseTheme.components.MuiCard.styleOverrides.root,
          border: '1px solid #E2E8F0',
          backgroundColor: '#FFFFFF',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          ...baseTheme.components.MuiAppBar.styleOverrides.root,
          backgroundColor: '#FFFFFF',
          color: '#1A202C',
          borderBottom: '1px solid #E2E8F0',
        },
      },
    },
  },
});

// Dark theme
export const darkTheme = createTheme({
  ...baseTheme,
  palette: {
    mode: 'dark',
    primary: {
      main: '#8B5CF6', // Lighter purple for dark mode
      light: '#A78BFA',
      dark: '#7C3AED',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#4299E1', // Lighter blue for dark mode
      light: '#63B3ED',
      dark: '#3182CE',
      contrastText: '#FFFFFF',
    },
    error: {
      main: '#FC8181',
      light: '#FEB2B2',
      dark: '#E53E3E',
      contrastText: '#FFFFFF',
    },
    warning: {
      main: '#F6AD55',
      light: '#FBD38D',
      dark: '#DD6B20',
      contrastText: '#000000',
    },
    info: {
      main: '#63B3ED',
      light: '#90CDF4',
      dark: '#4299E1',
      contrastText: '#000000',
    },
    success: {
      main: '#68D391',
      light: '#9AE6B4',
      dark: '#48BB78',
      contrastText: '#000000',
    },
    text: {
      primary: '#F7FAFC',
      secondary: '#CBD5E0',
      disabled: '#718096',
    },
    background: {
      default: '#1A202C',
      paper: '#2D3748',
    },
    grey: {
      50: '#171923',
      100: '#1A202C',
      200: '#2D3748',
      300: '#4A5568',
      400: '#718096',
      500: '#A0AEC0',
      600: '#CBD5E0',
      700: '#E2E8F0',
      800: '#EDF2F7',
      900: '#F7FAFC',
    },
    divider: '#4A5568',
  },
  components: {
    ...baseTheme.components,
    MuiCard: {
      styleOverrides: {
        root: {
          ...baseTheme.components.MuiCard.styleOverrides.root,
          border: '1px solid #4A5568',
          backgroundColor: '#2D3748',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          ...baseTheme.components.MuiAppBar.styleOverrides.root,
          backgroundColor: '#2D3748',
          color: '#F7FAFC',
          borderBottom: '1px solid #4A5568',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          ...baseTheme.components.MuiTextField.styleOverrides.root,
          '& .MuiOutlinedInput-root': {
            ...baseTheme.components.MuiTextField.styleOverrides.root['& .MuiOutlinedInput-root'],
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: '#4A5568',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#8B5CF6',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#8B5CF6',
              borderWidth: '2px',
            },
          },
        },
      },
    },
  },
});

// Function to get theme based on mode
export const getTheme = (mode) => {
  return mode === 'dark' ? darkTheme : lightTheme;
};

export default lightTheme;
