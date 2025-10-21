import React from 'react';
import { Box, Typography } from '@mui/material';
import ComprehensiveSkillsAssessment from '../components/assessment/ComprehensiveSkillsAssessment';

const SkillsAssessmentPage = () => {
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
                        Skills Assessment
                    </Typography>
                    <Typography variant="h6" color="text.secondary" paragraph>
                        Validate your expertise with comprehensive skill assessments and earn certificates
                    </Typography>
                </Box>

                {/* Content */}
                <ComprehensiveSkillsAssessment />
            </Box>
        </Box>
    );
};

export default SkillsAssessmentPage;
