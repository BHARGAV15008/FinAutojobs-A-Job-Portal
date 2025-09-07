import React from 'react';
import AdvancedDashboardLayout from '../components/AdvancedDashboardLayout';
import AdminDashboard from '../components/dashboard/advanced/AdminDashboard';

const AdminDashboardPage = () => {
  // Mock user data - in real app, this would come from auth context
  const user = {
    id: 3,
    name: 'Admin User',
    email: 'admin@finautojobs.com',
    role: 'admin',
    avatar: null,
    company: 'FinAutoJobs',
    profileComplete: 100
  };

  return (
    <AdvancedDashboardLayout 
      title="Admin Dashboard" 
      userRole="admin"
      user={user}
    >
      <AdminDashboard user={user} />
    </AdvancedDashboardLayout>
  );
};

export default AdminDashboardPage;
