import React from 'react';
import { Card, CardContent, Typography, IconButton, Box, CircularProgress } from '@mui/material';
import { motion } from 'framer-motion';

const DashboardCard = ({
  title,
  value,
  icon: Icon,
  trend,
  color = 'primary',
  loading = false,
  onClick,
  variant = 'default',
  secondaryValue,
  secondaryLabel,
  className = '',
}) => {
  const cardVariants = {
    hover: { scale: 1.02, transition: { duration: 0.2 } },
    tap: { scale: 0.98 },
  };

  const getColorClass = (color) => {
    const colors = {
      primary: 'bg-blue-50 text-blue-600',
      secondary: 'bg-purple-50 text-purple-600',
      success: 'bg-green-50 text-green-600',
      warning: 'bg-yellow-50 text-yellow-600',
      error: 'bg-red-50 text-red-600',
      info: 'bg-cyan-50 text-cyan-600',
    };
    return colors[color] || colors.primary;
  };

  const getTrendColor = (trend) => {
    if (trend > 0) return 'text-green-600';
    if (trend < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const renderCardContent = () => {
    switch (variant) {
      case 'metric':
        return (
          <Box className="flex flex-col">
            <Box className="flex items-center justify-between mb-4">
              <Typography variant="h6" className="font-semibold text-gray-700">
                {title}
              </Typography>
              {Icon && (
                <Box className={`p-2 rounded-lg ${getColorClass(color)}`}>
                  <Icon className="h-5 w-5" />
                </Box>
              )}
            </Box>
            <Box className="flex items-baseline justify-between">
              <Typography variant="h4" className="font-bold text-gray-900">
                {loading ? <CircularProgress size={24} /> : value}
              </Typography>
              {trend !== undefined && (
                <Typography className={`text-sm font-medium ${getTrendColor(trend)}`}>
                  {trend > 0 ? '+' : ''}{trend}%
                </Typography>
              )}
            </Box>
            {secondaryValue && (
              <Box className="mt-2">
                <Typography variant="body2" color="text.secondary">
                  {secondaryLabel}
                </Typography>
                <Typography variant="subtitle2" className="font-medium">
                  {secondaryValue}
                </Typography>
              </Box>
            )}
          </Box>
        );

      case 'stat':
        return (
          <Box className="flex flex-col items-center text-center p-4">
            {Icon && (
              <Box className={`p-3 rounded-full mb-3 ${getColorClass(color)}`}>
                <Icon className="h-6 w-6" />
              </Box>
            )}
            <Typography variant="h3" className="font-bold mb-2">
              {loading ? <CircularProgress size={24} /> : value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {title}
            </Typography>
            {trend !== undefined && (
              <Typography className={`text-sm font-medium mt-2 ${getTrendColor(trend)}`}>
                {trend > 0 ? '+' : ''}{trend}% from last month
              </Typography>
            )}
          </Box>
        );

      default:
        return (
          <Box className="flex items-center justify-between">
            <Box>
              <Typography variant="h5" className="font-bold text-gray-900">
                {loading ? <CircularProgress size={24} /> : value}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {title}
              </Typography>
              {trend !== undefined && (
                <Typography className={`text-sm font-medium mt-1 ${getTrendColor(trend)}`}>
                  {trend > 0 ? '+' : ''}{trend}% from last month
                </Typography>
              )}
            </Box>
            {Icon && (
              <Box className={`p-3 rounded-full ${getColorClass(color)}`}>
                <Icon className="h-6 w-6" />
              </Box>
            )}
          </Box>
        );
    }
  };

  return (
    <motion.div
      whileHover="hover"
      whileTap="tap"
      variants={cardVariants}
      className={`w-full ${className}`}
    >
      <Card
        onClick={onClick}
        className={`h-full shadow-sm hover:shadow-md transition-shadow duration-200 ${
          onClick ? 'cursor-pointer' : ''
        }`}
      >
        <CardContent className="p-6">
          {renderCardContent()}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DashboardCard;
