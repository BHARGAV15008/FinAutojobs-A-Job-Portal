import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { getTheme } from '../theme/index';

const IntegratedThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(IntegratedThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within an IntegratedThemeProvider');
  }
  return context;
};

export const IntegratedThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  
  const [systemTheme, setSystemTheme] = useState(() => {
    const saved = localStorage.getItem('systemTheme');
    return saved ? JSON.parse(saved) : false;
  });
  
  const [fontSize, setFontSize] = useState(() => {
    return localStorage.getItem('fontSize') || 'medium';
  });
  
  const [fontFamily, setFontFamily] = useState(() => {
    return localStorage.getItem('fontFamily') || 'Inter';
  });
  
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('language') || 'en';
  });

  // Font size options
  const fontSizeOptions = {
    small: '14px',
    medium: '16px',
    large: '18px',
    xlarge: '20px'
  };

  // Font family options
  const fontFamilyOptions = {
    'Inter': '"Inter", "Helvetica", "Arial", sans-serif',
    'Roboto': '"Roboto", "Helvetica", "Arial", sans-serif',
    'Poppins': '"Poppins", "Helvetica", "Arial", sans-serif',
    'Open Sans': '"Open Sans", "Helvetica", "Arial", sans-serif'
  };

  // Language options
  const languageOptions = {
    'en': 'English',
    'hi': 'हिन्दी (Hindi)',
    'ta': 'தமிழ் (Tamil)',
    'te': 'తెలుగు (Telugu)',
    'bn': 'বাংলা (Bengali)'
  };

  // Check system theme preference
  useEffect(() => {
    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      if (systemTheme) {
        setDarkMode(e.matches);
      }
    };

    darkModeQuery.addEventListener('change', handleChange);
    return () => darkModeQuery.removeEventListener('change', handleChange);
  }, [systemTheme]);

  // Apply theme to document and save to localStorage
  useEffect(() => {
    // Apply dark mode class to document
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Apply font size
    document.documentElement.style.fontSize = fontSizeOptions[fontSize];

    // Apply font family
    document.documentElement.style.fontFamily = fontFamilyOptions[fontFamily];

    // Apply language (for font rendering)
    document.documentElement.lang = language;

    // Save to localStorage
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    localStorage.setItem('systemTheme', JSON.stringify(systemTheme));
    localStorage.setItem('fontSize', fontSize);
    localStorage.setItem('fontFamily', fontFamily);
    localStorage.setItem('language', language);
  }, [darkMode, fontSize, fontFamily, language, systemTheme]);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    setSystemTheme(false); // Disable system theme when manually toggling
  };

  const setThemeMode = (mode) => {
    switch (mode) {
      case 'light':
        setDarkMode(false);
        setSystemTheme(false);
        break;
      case 'dark':
        setDarkMode(true);
        setSystemTheme(false);
        break;
      case 'system':
        setSystemTheme(true);
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setDarkMode(isDark);
        break;
      default:
        break;
    }
  };

  // Enhanced setter functions with localStorage
  const setFontSizeWithStorage = (size) => {
    setFontSize(size);
  };

  const setFontFamilyWithStorage = (family) => {
    setFontFamily(family);
  };

  const setLanguageWithStorage = (lang) => {
    setLanguage(lang);
  };

  // Get current theme mode for display
  const getCurrentThemeMode = () => {
    if (systemTheme) return 'system';
    return darkMode ? 'dark' : 'light';
  };

  // Get Material-UI theme based on current mode
  const muiTheme = getTheme(darkMode ? 'dark' : 'light');

  // Update MUI theme with current font settings
  const customizedTheme = {
    ...muiTheme,
    typography: {
      ...muiTheme.typography,
      fontFamily: fontFamilyOptions[fontFamily],
      fontSize: parseInt(fontSizeOptions[fontSize]),
    }
  };

  const value = {
    darkMode,
    systemTheme,
    fontSize,
    fontFamily,
    language,
    fontSizeOptions,
    fontFamilyOptions,
    languageOptions,
    toggleTheme,
    setThemeMode,
    setFontSize: setFontSizeWithStorage,
    setFontFamily: setFontFamilyWithStorage,
    setLanguage: setLanguageWithStorage,
    getCurrentThemeMode,
    muiTheme: customizedTheme,
  };

  return (
    <IntegratedThemeContext.Provider value={value}>
      <MuiThemeProvider theme={customizedTheme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </IntegratedThemeContext.Provider>
  );
};
