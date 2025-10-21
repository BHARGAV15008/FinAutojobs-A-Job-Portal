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

  // Font size options (using relative scaling instead of absolute px)
  const fontSizeOptions = {
    small: 0.875,  // 14px equivalent
    medium: 1,     // 16px equivalent (default)
    large: 1.125,  // 18px equivalent
    xlarge: 1.25   // 20px equivalent
  };

  // Font family options with better fallbacks
  const fontFamilyOptions = {
    'Inter': '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica", "Arial", sans-serif',
    'Roboto': '"Roboto", -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica", "Arial", sans-serif',
    'Poppins': '"Poppins", -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica", "Arial", sans-serif',
    'Open Sans': '"Open Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica", "Arial", sans-serif',
    'Lato': '"Lato", -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica", "Arial", sans-serif',
    'Montserrat': '"Montserrat", -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica", "Arial", sans-serif',
    'Source Sans Pro': '"Source Sans Pro", -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica", "Arial", sans-serif',
    'Nunito': '"Nunito", -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica", "Arial", sans-serif'
  };

  // Enhanced language options with proper locale codes
  const languageOptions = {
    'en': 'English',
    'hi': 'हिन्दी (Hindi)',
    'ta': 'தமிழ் (Tamil)',
    'te': 'తెలుగు (Telugu)',
    'bn': 'বাংলা (Bengali)',
    'gu': 'ગુજરાતી (Gujarati)',
    'mr': 'मराठी (Marathi)',
    'kn': 'ಕನ್ನಡ (Kannada)',
    'ml': 'മലയാളം (Malayalam)',
    'or': 'ଓଡ଼ିଆ (Odia)',
    'pa': 'ਪੰਜਾਬੀ (Punjabi)',
    'ur': 'اردو (Urdu)'
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

    // Apply font size scaling to root element
    const fontScale = fontSizeOptions[fontSize];
    document.documentElement.style.fontSize = `${16 * fontScale}px`; // Base 16px scaled
    
    // Apply font size class for CSS targeting
    document.documentElement.className = document.documentElement.className
      .replace(/font-size-\w+/g, '') + ` font-size-${fontSize}`;

    // Apply font family to root and body
    const selectedFontFamily = fontFamilyOptions[fontFamily];
    document.documentElement.style.fontFamily = selectedFontFamily;
    document.body.style.fontFamily = selectedFontFamily;
    
    // Apply font family class for CSS targeting
    document.documentElement.className = document.documentElement.className
      .replace(/font-family-\w+/g, '') + ` font-family-${fontFamily.toLowerCase().replace(/\s+/g, '-')}`;

    // Apply language (for font rendering and RTL support)
    document.documentElement.lang = language;
    
    // Apply language class for CSS targeting
    document.documentElement.className = document.documentElement.className
      .replace(/lang-\w+/g, '') + ` lang-${language}`;

    // Save to localStorage
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    localStorage.setItem('systemTheme', JSON.stringify(systemTheme));
    localStorage.setItem('fontSize', fontSize);
    localStorage.setItem('fontFamily', fontFamily);
    localStorage.setItem('language', language);
    
    console.log('🎨 Theme settings applied:', {
      darkMode,
      fontSize: `${16 * fontScale}px`,
      fontFamily: selectedFontFamily,
      language
    });
  }, [darkMode, fontSize, fontFamily, language, systemTheme, fontSizeOptions, fontFamilyOptions]);

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
      fontSize: 14 * fontSizeOptions[fontSize], // Base 14px scaled by selected size
      // Override all typography variants to use the scaled font size
      h1: { ...muiTheme.typography.h1, fontSize: `${2.5 * fontSizeOptions[fontSize]}rem` },
      h2: { ...muiTheme.typography.h2, fontSize: `${2 * fontSizeOptions[fontSize]}rem` },
      h3: { ...muiTheme.typography.h3, fontSize: `${1.75 * fontSizeOptions[fontSize]}rem` },
      h4: { ...muiTheme.typography.h4, fontSize: `${1.5 * fontSizeOptions[fontSize]}rem` },
      h5: { ...muiTheme.typography.h5, fontSize: `${1.25 * fontSizeOptions[fontSize]}rem` },
      h6: { ...muiTheme.typography.h6, fontSize: `${1.125 * fontSizeOptions[fontSize]}rem` },
      body1: { ...muiTheme.typography.body1, fontSize: `${1 * fontSizeOptions[fontSize]}rem` },
      body2: { ...muiTheme.typography.body2, fontSize: `${0.875 * fontSizeOptions[fontSize]}rem` },
      button: { ...muiTheme.typography.button, fontSize: `${0.875 * fontSizeOptions[fontSize]}rem` },
      caption: { ...muiTheme.typography.caption, fontSize: `${0.75 * fontSizeOptions[fontSize]}rem` },
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
