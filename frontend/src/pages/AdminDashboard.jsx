import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import ModernDashboardLayout from "../components/layout/ModernDashboardLayout";
import DashboardCard from "../components/cards/DashboardCard";
import { DashboardProvider, useDashboard } from "../contexts/RealDashboardContext";
import { useTheme } from "../contexts/IntegratedThemeContext";
import {
  EnhancedProfileTab,
  EnhancedSettingsTab,
} from "../components/dashboard/EnhancedDashboardTabs";
import AdminDashboardMain from "../components/dashboard/AdminDashboardMain";
import UserManagementTab from "../components/dashboard/UserManagementTab";
import JobManagementTab from "../components/dashboard/JobManagementTab";
import AnalyticsTab from "../components/dashboard/AnalyticsTab";
import ModerationTab from "../components/dashboard/ModerationTab";
import LoginStatusBanner from "../components/dashboard/LoginStatusBanner";
import MessagesTab from "../components/dashboard/MessagesTab";

const AdminDashboardContent = () => {
  const [location] = useLocation();
  const [activeTab, setActiveTab] = useState("dashboard");
  const { 
    currentUser, 
    isAuthenticated, 
    getStats, 
    dashboardData, 
    loading 
  } = useDashboard();

  // Mock user data - authentication removed
  const user = {
    id: 3,
    name: "Admin User",
    email: "admin@finautojobs.com",
    phone: "+91 9876543212",
    location: "Mumbai, India",
    company: "FinAutoJobs",
    role: "admin",
    profileComplete: 100,
  };

  // Extract tab from URL
  useEffect(() => {
    const pathParts = location.split('/');
    const tab = pathParts[pathParts.length - 1];
    if (['profile', 'users', 'jobs', 'analytics', 'moderation', 'messages', 'settings'].includes(tab)) {
      setActiveTab(tab);
    } else {
      setActiveTab('dashboard');
    }
  }, [location]);

  // Tab change handler
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    const basePath = "/admin-dashboard";
    const newPath = tab === "dashboard" ? basePath : `${basePath}/${tab}`;
    window.history.pushState({}, "", newPath);
  };

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <EnhancedProfileTab user={user} userRole="admin" />;
      case 'settings':
        return <EnhancedSettingsTab user={user} userRole="admin" />;
      case 'users':
        return <UserManagementTab />;
      case 'jobs':
        return <JobManagementTab />;
      case 'analytics':
        return <AnalyticsTab />;
      case 'moderation':
        return <ModerationTab />;
      case 'messages':
        return <MessagesTab userRole="admin" />;
      default:
        return <AdminDashboardMain user={user} />;
    }
  };

  const stats = getStats('admin');

  // Dashboard overview cards
  const overviewCards = [
    {
      title: "Total Users",
      value: stats.totalUsers || 0,
      change: "+45 this month",
      changeType: "positive",
      gradient: "blue",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
          />
        </svg>
      ),
    },
    {
      title: "Active Jobs",
      value: stats.activeJobs || 0,
      change: "+12 this week",
      changeType: "positive",
      gradient: "green",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v2a2 2 0 01-2 2H10a2 2 0 01-2-2V6"
          />
        </svg>
      ),
    },
    {
      title: "Applications",
      value: stats.totalApplications || 0,
      change: "+89 this week",
      changeType: "positive",
      gradient: "purple",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
    },
    {
      title: "System Health",
      value: `${stats.systemHealth || 0}%`,
      change: "All systems operational",
      changeType: "positive",
      gradient: "orange",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
          />
        </svg>
      ),
    },
  ];

  return (
    <ModernDashboardLayout
      title="Admin Dashboard"
      userRole="admin"
      user={user}
      showBreadcrumbs={activeTab !== "dashboard"}
      breadcrumbs={
        activeTab !== "dashboard"
          ? [
              { name: "Dashboard", path: "/admin-dashboard" },
              {
                name:
                  activeTab.charAt(0).toUpperCase() +
                  activeTab.slice(1).replace("-", " "),
                path: `/${activeTab}`,
              },
            ]
          : []
      }
    >
      <div className="space-y-6">
        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {renderTabContent()}
        </motion.div>
      </div>
    </ModernDashboardLayout>
  );
};

const AdminDashboard = () => {
  return <AdminDashboardContent />;
};

export default AdminDashboard;
