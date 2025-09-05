
import React from 'react';
import { Box, Drawer, List, ListItem, ListItemIcon, ListItemText, Toolbar, Typography, Avatar, Tooltip, IconButton } from '@mui/material';
import { NavLink, useLocation } from 'wouter';
import { Home, Work, BarChart, Person, Settings, ExitToApp } from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const drawerWidth = 280;

const CustomNavLink = ({ href, children }) => {
    const [isActive] = useLocation(href);
    return (
        <NavLink href={href}>
            <a className={`flex items-center p-3 my-1 text-sm font-medium rounded-lg transition-colors ${isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}>
                {children}
            </a>
        </NavLink>
    );
};

const DashboardLayout = ({ children, title, headerContent }) => {
    const { user, logout } = useAuth();
    const [location] = useLocation();

    const recruiterNavItems = [
        { text: 'Overview', icon: <Home />, path: '/recruiter-dashboard' },
        { text: 'Jobs', icon: <Work />, path: '/recruiter-dashboard/jobs' },
        { text: 'Candidates', icon: <Person />, path: '/recruiter-dashboard/candidates' },
        { text: 'Analytics', icon: <BarChart />, path: '/recruiter-dashboard/analytics' },
        { text: 'Settings', icon: <Settings />, path: '/recruiter-dashboard/settings' },
    ];

    const applicantNavItems = [
        { text: 'Overview', icon: <Home />, path: '/applicant-dashboard' },
        { text: 'My Applications', icon: <Work />, path: '/applicant-dashboard/applications' },
        { text: 'Profile', icon: <Person />, path: '/applicant-dashboard/profile' },
        { text: 'Assessments', icon: <BarChart />, path: '/applicant-dashboard/assessments' },
        { text: 'Settings', icon: <Settings />, path: '/applicant-dashboard/settings' },
    ];

    const navItems = user?.role === 'recruiter' ? recruiterNavItems : applicantNavItems;

    const drawer = (
        <div className="flex flex-col h-full p-4 bg-white border-r border-gray-200">
            <div className="flex items-center mb-8">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                    <Work sx={{ color: 'white' }} />
                </div>
                <Typography variant="h6" className="font-bold text-gray-800">
                    FinAutoJobs
                </Typography>
            </div>

            <nav className="flex-grow">
                {navItems.map((item) => (
                    <CustomNavLink key={item.text} href={item.path}>
                        <div className="flex items-center">
                            {item.icon && <div className="mr-3">{item.icon}</div>}
                            {item.text}
                        </div>
                    </CustomNavLink>
                ))}
            </nav>

            <div className="mt-auto">
                <div className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                        <Avatar src={user?.avatar} alt={user?.name} className="w-10 h-10 mr-3">
                            {user?.name?.charAt(0)}
                        </Avatar>
                        <div className="flex-1">
                            <Typography variant="subtitle2" className="font-semibold text-gray-800">{user?.name}</Typography>
                            <Typography variant="body2" className="text-gray-500">{user?.role}</Typography>
                        </div>
                        <Tooltip title="Logout">
                            <IconButton onClick={logout} size="small">
                                <ExitToApp className="text-gray-500" />
                            </IconButton>
                        </Tooltip>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen bg-gray-50">
            <aside className="w-64 fixed inset-y-0 z-30">
                {drawer}
            </aside>

            <main className="flex-1 ml-64">
                <header className="bg-white border-b border-gray-200 sticky top-0 z-20">
                    <div className="flex items-center justify-between h-16 px-8">
                        <Typography variant="h5" className="font-bold text-gray-800">
                            {title}
                        </Typography>
                        <div>
                            {headerContent}
                        </div>
                    </div>
                </header>

                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;