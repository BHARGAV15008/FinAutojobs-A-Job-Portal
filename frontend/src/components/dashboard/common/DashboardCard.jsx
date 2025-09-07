import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Box,
  IconButton,
  Chip,
  useTheme,
  alpha,
  Skeleton,
} from '@mui/material';
import { MoreVert, TrendingUp, TrendingDown } from '@mui/icons-material';

const DashboardCard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  color = 'primary',
  loading = false,
  onClick,
  actions,
  subtitle,
  animation = true,
}) => {
  const theme = useTheme();

  const cardContent = (
    <>
      <CardContent>
        {loading ? (
          <>
            <Skeleton width="60%" height={24} />
            <Skeleton width="40%" height={34} sx={{ my: 1 }} />
            {subtitle && <Skeleton width="80%" height={20} />}
          </>
        ) : (
          <>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                {title}
              </Typography>
              {actions && (
                <IconButton size="small">
                  <MoreVert fontSize="small" />
                </IconButton>
              )}
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: subtitle ? 1 : 0 }}>
              <Typography variant="h4" component="div" sx={{ fontWeight: 'bold', mr: 1 }}>
                {value}
              </Typography>
              {Icon && (
                <Box
                  sx={{
                    p: 1,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette[color].main, 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icon sx={{ color: theme.palette[color].main }} />
                </Box>
              )}
            </Box>

            {subtitle && (
              <Typography variant="body2" color="textSecondary">
                {subtitle}
              </Typography>
            )}
          </>
        )}
      </CardContent>

      {(trend || trendValue) && !loading && (
        <CardActions sx={{ pt: 0 }}>
          <Chip
            icon={trend === 'up' ? <TrendingUp fontSize="small" /> : <TrendingDown fontSize="small" />}
            label={`${trendValue}%`}
            size="small"
            color={trend === 'up' ? 'success' : 'error'}
            variant="outlined"
          />
        </CardActions>
      )}
    </>
  );

  return (
    <Card
      sx={{
        borderRadius: 2,
        boxShadow: theme.shadows[2],
        transition: animation ? 'transform 0.2s, box-shadow 0.2s' : 'none',
        cursor: onClick ? 'pointer' : 'default',
        '&:hover': onClick ? {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[8],
        } : {},
      }}
      onClick={onClick}
    >
      {cardContent}
    </Card>
  );
};

export default DashboardCard;
