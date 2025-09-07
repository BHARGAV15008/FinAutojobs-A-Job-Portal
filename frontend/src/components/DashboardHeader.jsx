import React from 'react';
import { Box, Typography, Button, IconButton, Breadcrumbs, Link, TextField } from '@mui/material';
import { Home, KeyboardArrowRight, Search as SearchIcon, FilterList, Refresh, Download, Upload } from '@mui/icons-material';

const DashboardHeader = ({
  title,
  subtitle,
  actions,
  breadcrumbs,
  showSearch = false,
  onSearch,
  searchPlaceholder = 'Search...',
  variant = 'default',
  className = '',
  refreshData,
}) => {
  return (
    <Box className={`mb-6 ${className}`}>
      {/* Breadcrumbs */}
      {breadcrumbs && (
        <Breadcrumbs
          separator={<KeyboardArrowRight fontSize="small" />}
          aria-label="breadcrumb"
          className="mb-4"
        >
          <Link
            color="inherit"
            href="/"
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <Home fontSize="small" className="mr-1" />
            Home
          </Link>
          {breadcrumbs.map((item, index) => (
            <Link
              key={index}
              color="inherit"
              href={item.href}
              className={`text-${index === breadcrumbs.length - 1 ? 'gray-900' : 'gray-600'} hover:text-gray-900`}
            >
              {item.text}
            </Link>
          ))}
        </Breadcrumbs>
      )}

      {/* Header Content */}
      <Box className={`flex flex-col sm:flex-row ${variant === 'centered' ? 'items-center' : 'items-start sm:items-center'} justify-between gap-4`}>
        {/* Title Section */}
        <div className={variant === 'centered' ? 'text-center w-full sm:w-auto' : ''}>
          <Typography variant="h4" className="font-bold text-gray-900">
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body1" color="text.secondary" className="mt-1">
              {subtitle}
            </Typography>
          )}
        </div>

        {/* Actions Section */}
        <Box className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          {showSearch && (
            <TextField
              size="small"
              placeholder={searchPlaceholder}
              onChange={(e) => onSearch?.(e.target.value)}
              InputProps={{
                startAdornment: <SearchIcon className="mr-2 text-gray-400" />,
              }}
              className="min-w-[200px]"
            />
          )}

          {refreshData && (
            <IconButton
              onClick={refreshData}
              className="text-gray-600 hover:text-gray-900"
              size="small"
            >
              <Refresh />
            </IconButton>
          )}

          {actions && (
            <div className="flex gap-2">
              {actions}
            </div>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardHeader;
