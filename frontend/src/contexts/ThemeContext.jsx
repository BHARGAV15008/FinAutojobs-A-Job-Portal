import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const [themeMode, setThemeMode] = useState('light');
  const [primaryColor, setPrimaryColor] = useState('#1976d2');
  const [fontFamily, setFontFamily] = useState('Inter, system-ui, -apple-system, sans-serif');

  const theme = createTheme({
    palette: {
      mode: themeMode,
      primary: {
        main: primaryColor,
      },
      background: {
        default: themeMode === 'light' ? '#f5f5f5' : '#121212',
        paper: themeMode === 'light' ? '#ffffff' : '#1e1e1e',
      },
    },
    typography: {
      fontFamily,
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            border: themeMode === 'light' ? '1px solid rgba(0,0,0,0.05)' : '1px solid rgba(255,255,255,0.05)',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: '8px',
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: '6px',
          },
        },
      },
    },
  });

  const toggleTheme = () => {
    setThemeMode(prev => prev === 'light' ? 'dark' : 'light');
  };

  const updatePrimaryColor = (color) => {
    setPrimaryColor(color);
  };

  const updateFontFamily = (font) => {
    setFontFamily(font);
  };

  return (
    <ThemeContext.Provider
      value={{
        themeMode,
        toggleTheme,
        primaryColor,
        updatePrimaryColor,
        fontFamily,
        updateFontFamily,
      }}
    >
      <MuiThemeProvider theme={theme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === null) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
