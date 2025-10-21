import React from 'react';
import { Container } from '@mui/material';
import ComprehensiveSkillsAssessment from '../components/assessment/ComprehensiveSkillsAssessment';

const SkillsAssessmentPage = () => {
    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <ComprehensiveSkillsAssessment />
        </Container>
    );
};

export default SkillsAssessmentPage;
