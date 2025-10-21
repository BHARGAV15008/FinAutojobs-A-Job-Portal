import React from 'react';
import { Box, Typography } from '@mui/material';
import ComprehensiveSalaryInsights from '../components/salary/ComprehensiveSalaryInsights';

const SalaryInsightsPage = () => {
    return (
        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', py: 4 }}>
            <Box sx={{ 
                width: { xs: 'calc(100% - 16px)', sm: '800px', md: '1000px', lg: '1200px' }, 
                px: { xs: 1, sm: 3, md: 4 },
                maxWidth: '100vw'
            }}>
                {/* Header */}
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <Typography variant="h3" component="h1" gutterBottom fontWeight="bold" color="text.primary">
                        Salary Insights
                    </Typography>
                    <Typography variant="h6" color="text.secondary" paragraph>
                        Discover competitive salary ranges and market trends across industries
                    </Typography>
                </Box>

                {/* Content */}
                <ComprehensiveSalaryInsights />
            </Box>
        </Box>
    );
};

export default SalaryInsightsPage;
