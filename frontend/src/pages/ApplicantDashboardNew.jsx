import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'wouter';
import ModernDashboardLayout from '../components/layout/ModernDashboardLayout';
import DashboardCard from '../components/cards/DashboardCard';
import { useDashboard } from '../contexts/DashboardContext';
import { useTheme } from '../contexts/ThemeContext';

// Import sub-components (we'll create these)
import ApplicantProfile from '../components/dashboard/applicant/ApplicantProfile';
import JobBrowser from '../components/dashboard/applicant/JobBrowser';
import ApplicationsManager from '../components/dashboard/applicant/ApplicationsManager';
import ResumeBuilder from '../components/dashboard/applicant/ResumeBuilder';
import JobAlerts from '../components/dashboard/applicant/JobAlerts';
import ApplicantAnalytics from '../components/dashboard/applicant/ApplicantAnalytics';
import ApplicantSettings from '../components/dashboard/applicant/ApplicantSettings';

const ApplicantDashboardNew = () => {
  const [location] = useLocation();
  const [activeTab, setActiveTab] = useState('dashboard');
  const { dashboardStats, jobs, applications, bookmarkedJobs } = useDashboard();
  const { darkMode } = useTheme();

  // Mock user data
  const user = {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+91 9876543210',
    location: 'Mumbai, India',
    bio: 'Experienced software developer with 5+ years in full-stack development',
    skills: ['JavaScript', 'React', 'Node.js', 'Python', 'MongoDB'],
    qualification: 'B.Tech Computer Science',
    experience_years: 5,
    resume_url: null,
    profile_picture: null,
    linkedin_url: 'https://linkedin.com/in/johndoe',
    github_url: 'https://github.com/johndoe',
    portfolio_url: 'https://johndoe.dev',
    role: 'applicant'
  };

  // Extract tab from URL
  useEffect(() => {
    const pathParts = location.split('/');
    const tab = pathParts[pathParts.length - 1];
    if (['profile', 'jobs', 'applications', 'resume-builder', 'job-alerts', 'analytics', 'settings'].includes(tab)) {
      setActiveTab(tab);
    } else {
      setActiveTab('dashboard');
    }
  }, [location]);

  const stats = dashboardStats.applicant;

  // Dashboard overview cards
  const overviewCards = [
    {
      title: 'Profile Completion',
      value: `${stats.profileCompletion}%`,
      change: '+5% from last week',
      changeType: 'positive',
      gradient: 'blue',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
    {
      title: 'Applied Jobs',
      value: stats.appliedJobs,
      change: '+3 this week',
      changeType: 'positive',
      gradient: 'green',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      title: 'Shortlisted',
      value: stats.shortlistedApplications,
      change: '+1 this week',
      changeType: 'positive',
      gradient: 'purple',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    {
      title: 'Interviews',
      value: stats.interviewsScheduled,
      change: 'Next: Tomorrow 2 PM',
      changeType: 'neutral',
      gradient: 'orange',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V6a2 2 0 012-2h4a2 2 0 012 2v1m-6 0h6m-6 0l-1 1v4a2 2 0 01-2 2H9a2 2 0 01-2-2v-4l-1-1m2 0h4a2 2 0 012 2v4a2 2 0 01-2 2h-4a2 2 0 01-2-2V8a2 2 0 012-2z" />
        </svg>
      )
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <ApplicantProfile user={user} />;
      case 'jobs':
        return <JobBrowser />;
      case 'applications':
        return <ApplicationsManager />;
      case 'resume-builder':
        return <ResumeBuilder user={user} />;
      case 'job-alerts':
        return <JobAlerts />;
      case 'analytics':
        return <ApplicantAnalytics />;
      case 'settings':
        return <ApplicantSettings user={user} />;
      default:
        return (
          <div className="space-y-8">
            {/* Welcome Section */}
            <motion.div
              className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold mb-2">
                    Welcome back, {user.name}! 👋
                  </h2>
                  <p className="text-blue-100 text-lg">
                    Ready to find your next opportunity? Let's get started!
                  </p>
                </div>
                <div className="hidden md:block">
                  <svg className="w-24 h-24 text-blue-200" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </motion.div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {overviewCards.map((card, index) => (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <DashboardCard {...card} />
                </motion.div>
              ))}
            </div>

            {/* Quick Actions */}
            <motion.div
              className="grid grid-cols-1 lg:grid-cols-2 gap-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              {/* Recent Applications */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Recent Applications
                  </h3>
                  <button className="text-blue-600 hover:text-blue-700 dark:text-blue-400 text-sm font-medium">
                    View all
                  </button>
                </div>
                <div className="space-y-4">
                  {applications.slice(0, 3).map((app) => (
                    <div key={app.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white">
                          {app.jobTitle}
                        </h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {app.company}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        app.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                        app.status === 'shortlisted' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {app.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommended Jobs */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Recommended Jobs
                  </h3>
                  <button className="text-blue-600 hover:text-blue-700 dark:text-blue-400 text-sm font-medium">
                    View all
                  </button>
                </div>
                <div className="space-y-4">
                  {jobs.slice(0, 3).map((job) => (
                    <div key={job.id} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white">
                            {job.title}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {job.company} • {job.location}
                          </p>
                          <p className="text-sm text-green-600 dark:text-green-400 font-medium mt-1">
                            {job.salary}
                          </p>
                        </div>
                        <button className="ml-4 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                          Apply
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        );
    }
  };

  return (
    <ModernDashboardLayout
      title="Applicant Dashboard"
      userRole="applicant"
      user={user}
      showBreadcrumbs={activeTab !== 'dashboard'}
      breadcrumbs={activeTab !== 'dashboard' ? [
        { name: 'Dashboard', path: '/applicant-dashboard' },
        { name: activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace('-', ' '), path: `/${activeTab}` }
      ] : []}
    >
      {renderTabContent()}
    </ModernDashboardLayout>
  );
};

export default ApplicantDashboardNew;
