import React from 'react';
import { Container, Box } from '@mui/material';
import ComprehensiveSalaryInsights from '../components/salary/ComprehensiveSalaryInsights';

const SalaryInsightsPage = () => {
    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <ComprehensiveSalaryInsights />
        </Container>
    );
};

export default SalaryInsightsPage;
