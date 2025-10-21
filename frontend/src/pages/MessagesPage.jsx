import React from 'react';
import { Box, Typography } from '@mui/material';
import ComprehensiveMessagingSystem from '../components/messaging/ComprehensiveMessagingSystem';

const MessagesPage = () => {
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
                        Messages
                    </Typography>
                    <Typography variant="h6" color="text.secondary" paragraph>
                        Communicate with recruiters and hiring managers about job opportunities
                    </Typography>
                </Box>

                {/* Content */}
                <ComprehensiveMessagingSystem />
            </Box>
        </Box>
    );
};

export default MessagesPage;
