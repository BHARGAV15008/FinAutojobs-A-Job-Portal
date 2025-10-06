import React, { useState, useEffect } from 'react';
import {
  TextField,
  Autocomplete,
  Box,
  Chip,
  Typography,
  InputAdornment
} from '@mui/material';
import { LocationOn } from '@mui/icons-material';

// Indian States
const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
];

// Major Indian Cities with their states
const INDIAN_CITIES = [
  // Maharashtra
  { city: 'Mumbai', state: 'Maharashtra', country: 'India' },
  { city: 'Pune', state: 'Maharashtra', country: 'India' },
  { city: 'Nagpur', state: 'Maharashtra', country: 'India' },
  { city: 'Nashik', state: 'Maharashtra', country: 'India' },
  { city: 'Aurangabad', state: 'Maharashtra', country: 'India' },
  
  // Karnataka
  { city: 'Bangalore', state: 'Karnataka', country: 'India' },
  { city: 'Mysore', state: 'Karnataka', country: 'India' },
  { city: 'Hubli', state: 'Karnataka', country: 'India' },
  { city: 'Mangalore', state: 'Karnataka', country: 'India' },
  
  // Tamil Nadu
  { city: 'Chennai', state: 'Tamil Nadu', country: 'India' },
  { city: 'Coimbatore', state: 'Tamil Nadu', country: 'India' },
  { city: 'Madurai', state: 'Tamil Nadu', country: 'India' },
  
  // Gujarat
  { city: 'Ahmedabad', state: 'Gujarat', country: 'India' },
  { city: 'Surat', state: 'Gujarat', country: 'India' },
  { city: 'Vadodara', state: 'Gujarat', country: 'India' },
  { city: 'Rajkot', state: 'Gujarat', country: 'India' },
  
  // Delhi
  { city: 'New Delhi', state: 'Delhi', country: 'India' },
  { city: 'Delhi', state: 'Delhi', country: 'India' },
  
  // West Bengal
  { city: 'Kolkata', state: 'West Bengal', country: 'India' },
  { city: 'Howrah', state: 'West Bengal', country: 'India' },
  
  // Uttar Pradesh
  { city: 'Lucknow', state: 'Uttar Pradesh', country: 'India' },
  { city: 'Kanpur', state: 'Uttar Pradesh', country: 'India' },
  { city: 'Ghaziabad', state: 'Uttar Pradesh', country: 'India' },
  { city: 'Agra', state: 'Uttar Pradesh', country: 'India' },
  
  // Telangana
  { city: 'Hyderabad', state: 'Telangana', country: 'India' },
  { city: 'Warangal', state: 'Telangana', country: 'India' },
  
  // Rajasthan
  { city: 'Jaipur', state: 'Rajasthan', country: 'India' },
  { city: 'Jodhpur', state: 'Rajasthan', country: 'India' },
  { city: 'Udaipur', state: 'Rajasthan', country: 'India' },
  
  // Kerala
  { city: 'Thiruvananthapuram', state: 'Kerala', country: 'India' },
  { city: 'Kochi', state: 'Kerala', country: 'India' },
  { city: 'Kozhikode', state: 'Kerala', country: 'India' },
  
  // Punjab
  { city: 'Chandigarh', state: 'Punjab', country: 'India' },
  { city: 'Ludhiana', state: 'Punjab', country: 'India' },
  { city: 'Amritsar', state: 'Punjab', country: 'India' },
  
  // Haryana
  { city: 'Gurgaon', state: 'Haryana', country: 'India' },
  { city: 'Faridabad', state: 'Haryana', country: 'India' },
  
  // International Cities
  { city: 'New York', state: 'New York', country: 'United States' },
  { city: 'London', state: 'England', country: 'United Kingdom' },
  { city: 'Toronto', state: 'Ontario', country: 'Canada' },
  { city: 'Sydney', state: 'New South Wales', country: 'Australia' },
  { city: 'Dubai', state: 'Dubai', country: 'UAE' },
  { city: 'Singapore', state: 'Singapore', country: 'Singapore' },
  { city: 'Remote', state: '', country: '' }
];

/**
 * Enhanced Location Input Component
 * Supports both simple text input and structured location selection
 */
const LocationInput = ({
  value = '',
  onChange,
  label = 'Location',
  placeholder = 'Enter city, state, country or select from suggestions',
  required = false,
  disabled = false,
  variant = 'outlined',
  size = 'medium',
  fullWidth = true,
  showIcon = true,
  mode = 'smart' // 'smart', 'simple', 'structured'
}) => {
  const [inputValue, setInputValue] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(null);

  // Initialize input value from prop
  useEffect(() => {
    if (typeof value === 'string') {
      setInputValue(value);
    } else if (value && typeof value === 'object') {
      // Handle structured location object
      const locationString = [value.city, value.state, value.country]
        .filter(Boolean)
        .join(', ');
      setInputValue(locationString);
    }
  }, [value]);

  // Handle location selection from autocomplete
  const handleLocationSelect = (event, newValue) => {
    if (newValue && typeof newValue === 'object') {
      const locationString = [newValue.city, newValue.state, newValue.country]
        .filter(Boolean)
        .join(', ');
      
      setInputValue(locationString);
      setSelectedLocation(newValue);
      
      if (onChange) {
        onChange(locationString);
      }
    } else if (typeof newValue === 'string') {
      setInputValue(newValue);
      setSelectedLocation(null);
      
      if (onChange) {
        onChange(newValue);
      }
    }
  };

  // Handle manual text input
  const handleInputChange = (event, newInputValue) => {
    setInputValue(newInputValue);
    
    if (onChange) {
      onChange(newInputValue);
    }
  };

  // Format option display
  const getOptionLabel = (option) => {
    if (typeof option === 'string') {
      return option;
    }
    
    if (option.city === 'Remote') {
      return 'Remote';
    }
    
    return [option.city, option.state, option.country]
      .filter(Boolean)
      .join(', ');
  };

  // Filter options based on input
  const filterOptions = (options, { inputValue }) => {
    const filterValue = inputValue.toLowerCase();
    return options.filter(option => {
      const label = getOptionLabel(option).toLowerCase();
      return label.includes(filterValue);
    });
  };

  if (mode === 'simple') {
    // Simple text field mode
    return (
      <TextField
        label={label}
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
          if (onChange) onChange(e.target.value);
        }}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        variant={variant}
        size={size}
        fullWidth={fullWidth}
        InputProps={{
          startAdornment: showIcon ? (
            <InputAdornment position="start">
              <LocationOn color="primary" />
            </InputAdornment>
          ) : null,
        }}
      />
    );
  }

  // Smart autocomplete mode (default)
  return (
    <Autocomplete
      value={selectedLocation}
      onChange={handleLocationSelect}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      options={INDIAN_CITIES}
      getOptionLabel={getOptionLabel}
      filterOptions={filterOptions}
      freeSolo
      disabled={disabled}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          required={required}
          variant={variant}
          size={size}
          fullWidth={fullWidth}
          InputProps={{
            ...params.InputProps,
            startAdornment: (
              <>
                {showIcon && (
                  <InputAdornment position="start">
                    <LocationOn color="primary" />
                  </InputAdornment>
                )}
                {params.InputProps.startAdornment}
              </>
            ),
          }}
        />
      )}
      renderOption={(props, option) => (
        <Box component="li" {...props}>
          <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
            <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />
            <Box>
              <Typography variant="body1">
                {option.city}
              </Typography>
              {option.state && option.country && (
                <Typography variant="caption" color="text.secondary">
                  {option.state}, {option.country}
                </Typography>
              )}
            </Box>
          </Box>
        </Box>
      )}
    />
  );
};

export default LocationInput;
