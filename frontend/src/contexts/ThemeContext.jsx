import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
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

  // Apply theme to document
  useEffect(() => {
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
  }, [darkMode, fontSize, fontFamily, language]);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  const setThemeMode = (mode) => {
    switch (mode) {
      case 'light':
        setDarkMode(false);
        setSystemTheme(false);
        localStorage.setItem('darkMode', 'false');
        localStorage.setItem('systemTheme', 'false');
        break;
      case 'dark':
        setDarkMode(true);
        setSystemTheme(false);
        localStorage.setItem('darkMode', 'true');
        localStorage.setItem('systemTheme', 'false');
        break;
      case 'system':
        setSystemTheme(true);
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setDarkMode(isDark);
        localStorage.setItem('systemTheme', 'true');
        localStorage.setItem('darkMode', isDark.toString());
        break;
      default:
        break;
    }
  };

  // Enhanced setter functions with localStorage
  const setFontSizeWithStorage = (size) => {
    setFontSize(size);
    localStorage.setItem('fontSize', size);
  };

  const setFontFamilyWithStorage = (family) => {
    setFontFamily(family);
    localStorage.setItem('fontFamily', family);
  };

  const setLanguageWithStorage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
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
    setLanguage: setLanguageWithStorage
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
