import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Autocomplete,
  Grid,
  Typography
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

// Countries
const COUNTRIES = [
  'India', 'United States', 'United Kingdom', 'Canada', 'Australia',
  'Germany', 'France', 'Singapore', 'UAE', 'Saudi Arabia', 'Qatar',
  'Japan', 'South Korea', 'China', 'Malaysia', 'Thailand', 'Netherlands',
  'Switzerland', 'Sweden', 'Norway', 'Denmark', 'Other'
];

// Major Indian Cities by State
const CITIES_BY_STATE = {
  'Maharashtra': ['Mumbai', 'Pune', 'Nagpur', 'Nashik', 'Aurangabad', 'Solapur', 'Kolhapur', 'Sangli'],
  'Karnataka': ['Bangalore', 'Mysore', 'Hubli', 'Mangalore', 'Belgaum', 'Gulbarga', 'Davangere'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tirunelveli'],
  'Gujarat': ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar'],
  'Rajasthan': ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Bikaner', 'Ajmer'],
  'West Bengal': ['Kolkata', 'Howrah', 'Durgapur', 'Asansol', 'Siliguri'],
  'Uttar Pradesh': ['Lucknow', 'Kanpur', 'Ghaziabad', 'Agra', 'Meerut', 'Varanasi', 'Allahabad'],
  'Telangana': ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar'],
  'Andhra Pradesh': ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool'],
  'Kerala': ['Thiruvananthapuram', 'Kochi', 'Kozhikode', 'Thrissur', 'Kollam'],
  'Punjab': ['Chandigarh', 'Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala'],
  'Haryana': ['Gurgaon', 'Faridabad', 'Panipat', 'Ambala', 'Yamunanagar'],
  'Delhi': ['New Delhi', 'Delhi', 'Dwarka', 'Rohini', 'Lajpat Nagar'],
  'Other': []
};

const LocationSelector = ({ 
  value = {}, 
  onChange, 
  required = false, 
  disabled = false,
  showTitle = true,
  variant = 'outlined',
  size = 'medium'
}) => {
  const [selectedCountry, setSelectedCountry] = useState(value.country || 'India');
  const [selectedState, setSelectedState] = useState(value.state || '');
  const [selectedCity, setSelectedCity] = useState(value.city || '');
  const [availableCities, setAvailableCities] = useState([]);

  // Update available cities when state changes
  useEffect(() => {
    if (selectedCountry === 'India' && selectedState) {
      setAvailableCities(CITIES_BY_STATE[selectedState] || []);
    } else {
      setAvailableCities([]);
    }
  }, [selectedState, selectedCountry]);

  // Update parent component when location changes
  useEffect(() => {
    const locationData = {
      country: selectedCountry,
      state: selectedState,
      city: selectedCity
    };
    
    if (onChange) {
      onChange(locationData);
    }
  }, [selectedCountry, selectedState, selectedCity, onChange]);

  // Initialize from value prop
  useEffect(() => {
    if (value.country) setSelectedCountry(value.country);
    if (value.state) setSelectedState(value.state);
    if (value.city) setSelectedCity(value.city);
  }, [value]);

  return (
    <Box>
      {showTitle && (
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <LocationOn sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="h6" component="h3">
            Location Details
          </Typography>
        </Box>
      )}
      
      <Grid container spacing={2}>
        {/* Country Selection */}
        <Grid item xs={12} md={4}>
          <Autocomplete
            value={selectedCountry}
            onChange={(event, newValue) => {
              setSelectedCountry(newValue || 'India');
              if (newValue !== 'India') {
                setSelectedState('');
                setSelectedCity('');
              }
            }}
            options={COUNTRIES}
            disabled={disabled}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Country"
                variant={variant}
                size={size}
                required={required}
                fullWidth
              />
            )}
          />
        </Grid>

        {/* State Selection (only for India) */}
        <Grid item xs={12} md={4}>
          <Autocomplete
            value={selectedState}
            onChange={(event, newValue) => {
              setSelectedState(newValue || '');
              setSelectedCity(''); // Reset city when state changes
            }}
            options={selectedCountry === 'India' ? INDIAN_STATES : []}
            disabled={disabled || selectedCountry !== 'India'}
            renderInput={(params) => (
              <TextField
                {...params}
                label={selectedCountry === 'India' ? 'State' : 'State/Province'}
                variant={variant}
                size={size}
                required={required && selectedCountry === 'India'}
                fullWidth
                placeholder={selectedCountry === 'India' ? 'Select state' : 'Enter state/province'}
              />
            )}
            freeSolo={selectedCountry !== 'India'}
          />
        </Grid>

        {/* City Selection */}
        <Grid item xs={12} md={4}>
          <Autocomplete
            value={selectedCity}
            onChange={(event, newValue) => {
              setSelectedCity(newValue || '');
            }}
            options={availableCities}
            disabled={disabled}
            freeSolo
            renderInput={(params) => (
              <TextField
                {...params}
                label="City"
                variant={variant}
                size={size}
                required={required}
                fullWidth
                placeholder="Enter city name"
              />
            )}
          />
        </Grid>
      </Grid>

      {/* Location Summary */}
      {(selectedCity || selectedState || selectedCountry) && (
        <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary">
            <strong>Selected Location:</strong>{' '}
            {[selectedCity, selectedState, selectedCountry].filter(Boolean).join(', ')}
          </Typography>
        </Box>
      )}
    </Box>
  );
};

export default LocationSelector;
