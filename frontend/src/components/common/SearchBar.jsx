import React, { useState } from 'react';
import {
  TextField,
  InputAdornment,
  IconButton,
  Box,
  Autocomplete,
  Chip,
  Paper
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';

const SearchBar = ({
  placeholder = "Search...",
  onSearch,
  onClear,
  suggestions = [],
  filters = [],
  selectedFilters = [],
  onFilterChange,
  showFilters = false,
  fullWidth = true,
  size = "medium",
  variant = "outlined"
}) => {
  const [query, setQuery] = useState('');
  const [showFilterPanel, setShowFilterPanel] = useState(false);

  const handleSearch = () => {
    if (onSearch) {
      onSearch(query, selectedFilters);
    }
  };

  const handleClear = () => {
    setQuery('');
    if (onClear) {
      onClear();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Box sx={{ width: fullWidth ? '100%' : 'auto' }}>
      <Autocomplete
        freeSolo
        options={suggestions}
        value={query}
        onInputChange={(event, newValue) => setQuery(newValue || '')}
        renderInput={(params) => (
          <TextField
            {...params}
            fullWidth={fullWidth}
            size={size}
            variant={variant}
            placeholder={placeholder}
            onKeyPress={handleKeyPress}
            InputProps={{
              ...params.InputProps,
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  {query && (
                    <IconButton
                      size="small"
                      onClick={handleClear}
                      edge="end"
                    >
                      <ClearIcon />
                    </IconButton>
                  )}
                  {showFilters && (
                    <IconButton
                      size="small"
                      onClick={() => setShowFilterPanel(!showFilterPanel)}
                      edge="end"
                      color={selectedFilters.length > 0 ? "primary" : "default"}
                    >
                      <FilterIcon />
                    </IconButton>
                  )}
                </InputAdornment>
              ),
            }}
          />
        )}
      />
      
      {showFilters && showFilterPanel && (
        <Paper sx={{ p: 2, mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {filters.map((filter) => (
            <Chip
              key={filter.value}
              label={filter.label}
              onClick={() => onFilterChange && onFilterChange(filter.value)}
              color={selectedFilters.includes(filter.value) ? "primary" : "default"}
              variant={selectedFilters.includes(filter.value) ? "filled" : "outlined"}
              size="small"
            />
          ))}
        </Paper>
      )}
    </Box>
  );
};

export default SearchBar;
