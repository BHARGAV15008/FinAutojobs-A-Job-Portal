import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#6B46C1', // Purple
      light: '#8B5CF6',
      dark: '#553C9A',
      contrastText: '#FFFFFF',
      50: '#F3F0FF',
      100: '#E9E2FF',
      200: '#D4C5FF',
      300: '#BFA8FF',
      400: '#AA8BFF',
      500: '#8B5CF6',
      600: '#7C3AED',
      700: '#6D28D9',
      800: '#5B21B6',
      900: '#4C1D95',
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
  typography: {
    fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 800,
      fontSize: '3.5rem',
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontWeight: 700,
      fontSize: '2.5rem',
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontWeight: 700,
      fontSize: '2rem',
      lineHeight: 1.4,
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.4,
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.5,
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.125rem',
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
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0px 1px 3px rgba(0, 0, 0, 0.12), 0px 1px 2px rgba(0, 0, 0, 0.24)',
    '0px 3px 6px rgba(0, 0, 0, 0.16), 0px 3px 6px rgba(0, 0, 0, 0.23)',
    '0px 10px 20px rgba(0, 0, 0, 0.19), 0px 6px 6px rgba(0, 0, 0, 0.23)',
    '0px 14px 28px rgba(0, 0, 0, 0.25), 0px 10px 10px rgba(0, 0, 0, 0.22)',
    '0px 19px 38px rgba(0, 0, 0, 0.30), 0px 15px 12px rgba(0, 0, 0, 0.22)',
    '0px 2px 4px rgba(0, 0, 0, 0.1)',
    '0px 4px 8px rgba(0, 0, 0, 0.12)',
    '0px 8px 16px rgba(0, 0, 0, 0.15)',
    '0px 16px 24px rgba(0, 0, 0, 0.15)',
    '0px 24px 32px rgba(0, 0, 0, 0.15)',
    '0px 32px 40px rgba(0, 0, 0, 0.15)',
    '0px 40px 48px rgba(0, 0, 0, 0.15)',
    '0px 48px 56px rgba(0, 0, 0, 0.15)',
    '0px 56px 64px rgba(0, 0, 0, 0.15)',
    '0px 64px 72px rgba(0, 0, 0, 0.15)',
    '0px 72px 80px rgba(0, 0, 0, 0.15)',
    '0px 80px 88px rgba(0, 0, 0, 0.15)',
    '0px 88px 96px rgba(0, 0, 0, 0.15)',
    '0px 96px 104px rgba(0, 0, 0, 0.15)',
    '0px 104px 112px rgba(0, 0, 0, 0.15)',
    '0px 112px 120px rgba(0, 0, 0, 0.15)',
    '0px 120px 128px rgba(0, 0, 0, 0.15)',
    '0px 128px 136px rgba(0, 0, 0, 0.15)',
    '0px 136px 144px rgba(0, 0, 0, 0.15)',
  ],
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          padding: '10px 24px',
          fontSize: '0.875rem',
          fontWeight: 600,
          textTransform: 'none',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 4px 8px rgba(0,0,0,0.12)',
          },
        },
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
        sizeSmall: {
          padding: '6px 16px',
          fontSize: '0.75rem',
        },
        sizeLarge: {
          padding: '12px 32px',
          fontSize: '1rem',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          boxShadow: '0px 4px 12px rgba(0,0,0,0.05)',
          border: '1px solid #E2E8F0',
          '&:hover': {
            boxShadow: '0px 8px 24px rgba(0,0,0,0.1)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: '12px',
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#8B5CF6',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderWidth: '2px',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          fontWeight: 500,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
        },
        elevation1: {
          boxShadow: '0px 2px 4px rgba(0,0,0,0.05)',
        },
        elevation2: {
          boxShadow: '0px 4px 8px rgba(0,0,0,0.08)',
        },
        elevation3: {
          boxShadow: '0px 8px 16px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0px 1px 3px rgba(0,0,0,0.1)',
          borderBottom: '1px solid #E2E8F0',
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
        paper: {
          borderRadius: '20px',
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          fontWeight: 600,
        },
      },
    },
  },
});

export default theme;