import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useDashboardData } from '../hooks/useDashboardData';
import AdvancedDashboardLayout from '../components/AdvancedDashboardLayout';
import ApplicantDashboard from '../components/dashboard/advanced/ApplicantDashboard';
import DashboardErrorBoundary from '../components/DashboardErrorBoundary';
import DashboardLoading from '../components/DashboardLoading';

const ApplicantDashboardPage = () => {
  const { user } = useAuth();
  const { dashboardData, loading, error, refreshData, lastUpdated } = useDashboardData('jobseeker');

  // Handle loading state
  if (loading) {
    return (
      <AdvancedDashboardLayout 
        title="Applicant Dashboard" 
        userRole="applicant"
        user={user}
        showRefresh={false}
      >
        <DashboardLoading type="overview" userRole="applicant" />
      </AdvancedDashboardLayout>
    );
  }

  // Handle error state
  if (error) {
    return (
      <AdvancedDashboardLayout 
        title="Applicant Dashboard" 
        userRole="applicant"
        user={user}
        showRefresh={true}
        onRefresh={refreshData}
      >
        <DashboardErrorBoundary
          fallback={({ refresh }) => (
            <div style={{ 
              padding: '2rem', 
              textAlign: 'center',
              minHeight: '400px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <h3>Unable to load dashboard</h3>
              <p>{error.message}</p>
              <button 
                onClick={refresh}
                style={{
                  marginTop: '1rem',
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#1976d2',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Try Again
              </button>
            </div>
          )}
        />
      </AdvancedDashboardLayout>
    );
  }

  // Transform user data to match expected format
  const transformedUser = user ? {
    id: user.id,
    fullName: user.full_name || user.name || 'User',
    email: user.email,
    phone: user.phone,
    location: user.location,
    bio: user.bio,
    skills: user.skills ? (typeof user.skills === 'string' ? JSON.parse(user.skills) : user.skills) : [],
    qualification: user.qualification,
    experienceYears: user.experience_years,
    resumeUrl: user.resume_url,
    profilePicture: user.profile_picture,
    linkedinUrl: user.linkedin_url,
    githubUrl: user.github_url,
    portfolioUrl: user.portfolio_url,
    profileComplete: dashboardData?.stats?.profileCompletion || 0
  } : null;

  // Enhanced dashboard data
  const enhancedDashboardData = {
    ...dashboardData,
    lastUpdated,
    refreshData
  };

  return (
    <AdvancedDashboardLayout 
      title="Applicant Dashboard" 
      userRole="applicant"
      user={transformedUser}
      onRefresh={refreshData}
      lastUpdated={lastUpdated}
    >
      <DashboardErrorBoundary>
        <ApplicantDashboard 
          user={transformedUser} 
          data={enhancedDashboardData}
          onDataUpdate={refreshData}
        />
      </DashboardErrorBoundary>
    </AdvancedDashboardLayout>
  );
};

export default ApplicantDashboardPage;
