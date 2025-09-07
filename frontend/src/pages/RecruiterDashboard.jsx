import React from 'react';
import AdvancedDashboardLayout from '../components/AdvancedDashboardLayout';
import RecruiterDashboard from '../components/dashboard/advanced/RecruiterDashboard';

const RecruiterDashboardPage = () => {
  // Mock user data - in real app, this would come from auth context
  const user = {
    id: 2,
    name: 'Sarah Johnson',
    email: 'sarah.johnson@techcorp.com',
    role: 'recruiter',
    avatar: null,
    company: 'TechCorp India',
    profileComplete: 95
  };

  return (
    <AdvancedDashboardLayout 
      title="Recruiter Dashboard" 
      userRole="recruiter"
      user={user}
    >
      <RecruiterDashboard user={user} />
    </AdvancedDashboardLayout>
  );
};

export default RecruiterDashboardPage;
