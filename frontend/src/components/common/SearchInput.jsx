import React from 'react';
import { TextField, InputAdornment } from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';

/**
 * Reusable search input component with controlled behavior
 * Based on CompaniesPage implementation - no page refresh, just simple state update
 */
const SearchInput = ({ 
    value, 
    onChange, 
    placeholder = "Search...",
    fullWidth = true,
    ...props 
}) => {
    return (
        <TextField
            fullWidth={fullWidth}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            InputProps={{
                startAdornment: (
                    <InputAdornment position="start">
                        <SearchIcon />
                    </InputAdornment>
                ),
            }}
            {...props}
        />
    );
};

export default SearchInput;
