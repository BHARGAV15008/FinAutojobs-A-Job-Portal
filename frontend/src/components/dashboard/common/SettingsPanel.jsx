import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  Divider,
  Button,
  useTheme,
} from '@mui/material';
import { Brightness4, FormatSize, Language, Palette } from '@mui/icons-material';

const SettingsPanel = ({ onThemeChange, onFontChange, currentTheme = 'light', currentFont = 'default' }) => {
  const theme = useTheme();
  const [themeMode, setThemeMode] = useState(currentTheme);
  const [fontSize, setFontSize] = useState(currentFont);
  
  const handleThemeChange = (event) => {
    setThemeMode(event.target.checked ? 'dark' : 'light');
    onThemeChange?.(event.target.checked ? 'dark' : 'light');
  };

  const handleFontChange = (event) => {
    setFontSize(event.target.value);
    onFontChange?.(event.target.value);
  };

  return (
    <Card sx={{ borderRadius: 2, boxShadow: theme.shadows[3] }}>
      <CardContent>
        <Typography variant="h6" gutterBottom fontWeight="bold">
          Display Settings
        </Typography>
        
        <Stack spacing={3}>
          <Box>
            <FormControlLabel
              control={
                <Switch
                  checked={themeMode === 'dark'}
                  onChange={handleThemeChange}
                  icon={<Brightness4 />}
                  checkedIcon={<Brightness4 />}
                />
              }
              label="Dark Mode"
            />
          </Box>

          <Divider />

          <FormControl fullWidth>
            <InputLabel>Font Size</InputLabel>
            <Select
              value={fontSize}
              onChange={handleFontChange}
              label="Font Size"
              startAdornment={<FormatSize sx={{ mr: 1 }} />}
            >
              <MenuItem value="small">Small</MenuItem>
              <MenuItem value="default">Default</MenuItem>
              <MenuItem value="large">Large</MenuItem>
            </Select>
          </FormControl>

          <Divider />

          <FormControl fullWidth>
            <InputLabel>Color Theme</InputLabel>
            <Select
              defaultValue="default"
              label="Color Theme"
              startAdornment={<Palette sx={{ mr: 1 }} />}
            >
              <MenuItem value="default">Default Blue</MenuItem>
              <MenuItem value="purple">Professional Purple</MenuItem>
              <MenuItem value="green">Modern Green</MenuItem>
              <MenuItem value="custom">Custom</MenuItem>
            </Select>
          </FormControl>

          <Divider />

          <FormControl fullWidth>
            <InputLabel>Language</InputLabel>
            <Select
              defaultValue="en"
              label="Language"
              startAdornment={<Language sx={{ mr: 1 }} />}
            >
              <MenuItem value="en">English</MenuItem>
              <MenuItem value="es">Español</MenuItem>
              <MenuItem value="fr">Français</MenuItem>
              <MenuItem value="de">Deutsch</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
          >
            Save Settings
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default SettingsPanel;
