import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ui/use-toast';
import { Link, useLocation } from 'wouter';
import api from '../utils/api';
import {
    Users, Building, Briefcase, TrendingUp, AlertTriangle, CheckCircle,
    XCircle, Clock, DollarSign, Eye, Edit, Trash2, Plus, Search,
    Filter, Download, Upload, Settings, Bell, BarChart3, PieChart,
    Activity, Globe, Mail, Phone, Calendar, MapPin, Star, Award
} from 'lucide-react';

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const { toast } = useToast();
    const [location, navigate] = useLocation();
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');

    // Dashboard data
    const [dashboardStats, setDashboardStats] = useState({
        totalUsers: 0,
        totalCompanies: 0,
        totalJobs: 0,
        totalApplications: 0,
        activeJobs: 0,
        pendingApplications: 0,
        newUsersThisMonth: 0,
        revenue: 0
    });

    const [users, setUsers] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [applications, setApplications] = useState([]);
    const [recentActivity, setRecentActivity] = useState([]);

    // Fetch dashboard data
    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            // Fetch all data in parallel
            const [usersRes, companiesRes, jobsRes, applicationsRes] = await Promise.all([
                api.get('/api/users'),
                api.get('/api/companies'),
                api.get('/api/jobs'),
                api.get('/api/applications')
            ]);

            const usersData = await usersRes.json();
            const companiesData = await companiesRes.json();
            const jobsData = await jobsRes.json();
            const applicationsData = await applicationsRes.json();

            setUsers(usersData.users || usersData || []);
            setCompanies(companiesData.companies || companiesData || []);
            setJobs(jobsData.jobs || jobsData || []);
            setApplications(applicationsData.applications || applicationsData || []);

            // Calculate stats
            const stats = {
                totalUsers: usersData.length || usersData.users?.length || 0,
                totalCompanies: companiesData.length || companiesData.companies?.length || 0,
                totalJobs: jobsData.length || jobsData.jobs?.length || 0,
                totalApplications: applicationsData.length || applicationsData.applications?.length || 0,
                activeJobs: (jobsData.jobs || jobsData || []).filter(job => job.status === 'active').length,
                pendingApplications: (applicationsData.applications || applicationsData || []).filter(app => app.status === 'pending').length,
                newUsersThisMonth: (usersData.users || usersData || []).filter(user => {
                    const createdAt = new Date(user.created_at);
                    const now = new Date();
                    return createdAt.getMonth() === now.getMonth() && createdAt.getFullYear() === now.getFullYear();
                }).length,
                revenue: 125000 // Mock revenue data
            };

            setDashboardStats(stats);

            // Mock recent activity
            setRecentActivity([
                { id: 1, type: 'user_registered', message: 'New user John Doe registered', time: '2 minutes ago' },
                { id: 2, type: 'job_posted', message: 'TechCorp posted a new Software Engineer position', time: '15 minutes ago' },
                { id: 3, type: 'application_submitted', message: 'Jane Smith applied for Marketing Manager role', time: '1 hour ago' },
                { id: 4, type: 'company_verified', message: 'StartupXYZ company profile verified', time: '2 hours ago' },
                { id: 5, type: 'payment_received', message: 'Premium subscription payment received from ABC Corp', time: '3 hours ago' }
            ]);

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            toast({
                title: "Error",
                description: "Failed to load dashboard data",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleUserAction = async (userId, action) => {
        try {
            let endpoint = '';
            let method = 'PUT';
            let body = {};

            switch (action) {
                case 'activate':
                    endpoint = `/api/users/${userId}`;
                    body = { status: 'active' };
                    break;
                case 'deactivate':
                    endpoint = `/api/users/${userId}`;
                    body = { status: 'inactive' };
                    break;
                case 'delete':
                    endpoint = `/api/users/${userId}`;
                    method = 'DELETE';
                    break;
                default:
                    return;
            }

            const response = await api.request(endpoint, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: method !== 'DELETE' ? JSON.stringify(body) : undefined
            });

            if (response.ok) {
                toast({
                    title: "Success",
                    description: `User ${action}d successfully`
                });
                fetchDashboardData(); // Refresh data
            }
        } catch (error) {
            console.error(`Error ${action}ing user:`, error);
            toast({
                title: "Error",
                description: `Failed to ${action} user`,
                variant: "destructive"
            });
        }
    };

    const handleCompanyAction = async (companyId, action) => {
        try {
            let endpoint = '';
            let method = 'PUT';
            let body = {};

            switch (action) {
                case 'verify':
                    endpoint = `/api/companies/${companyId}`;
                    body = { verified: true };
                    break;
                case 'unverify':
                    endpoint = `/api/companies/${companyId}`;
                    body = { verified: false };
                    break;
                case 'delete':
                    endpoint = `/api/companies/${companyId}`;
                    method = 'DELETE';
                    break;
                default:
                    return;
            }

            const response = await api.request(endpoint, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: method !== 'DELETE' ? JSON.stringify(body) : undefined
            });

            if (response.ok) {
                toast({
                    title: "Success",
                    description: `Company ${action}d successfully`
                });
                fetchDashboardData(); // Refresh data
            }
        } catch (error) {
            console.error(`Error ${action}ing company:`, error);
            toast({
                title: "Error",
                description: `Failed to ${action} company`,
                variant: "destructive"
            });
        }
    };

    const StatCard = ({ title, value, icon: Icon, trend, color = "blue" }) => (
        <div className={`bg-white rounded-lg shadow-md p-6 border-l-4 border-${color}-500`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <p className="text-2xl font-bold text-gray-900">{value}</p>
                    {trend && (
                        <p className={`text-sm ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {trend > 0 ? '+' : ''}{trend}% from last month
                        </p>
                    )}
                </div>
                <div className={`p-3 rounded-full bg-${color}-100`}>
                    <Icon className={`h-6 w-6 text-${color}-600`} />
                </div>
            </div>
        </div>
    );

    const UserRow = ({ user }) => (
        <tr className="hover:bg-gray-50">
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <Users className="h-5 w-5 text-gray-600" />
                    </div>
                    <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.full_name || user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                    user.role === 'employer' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                }`}>
                    {user.role}
                </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                    {user.status || 'active'}
                </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(user.created_at).toLocaleDateString()}
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex space-x-2">
                    <button
                        onClick={() => handleUserAction(user.id, user.status === 'active' ? 'deactivate' : 'activate')}
                        className={`text-${user.status === 'active' ? 'red' : 'green'}-600 hover:text-${user.status === 'active' ? 'red' : 'green'}-900`}
                    >
                        {user.status === 'active' ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                        onClick={() => handleUserAction(user.id, 'delete')}
                        className="text-red-600 hover:text-red-900"
                    >
                        Delete
                    </button>
                </div>
            </td>
        </tr>
    );

    const CompanyRow = ({ company }) => (
        <tr className="hover:bg-gray-50">
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                        <Building className="h-5 w-5 text-gray-600" />
                    </div>
                    <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{company.name}</div>
                        <div className="text-sm text-gray-500">{company.industry}</div>
                    </div>
                </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {company.location}
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    company.verified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                    {company.verified ? 'Verified' : 'Pending'}
                </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {company.active_jobs || 0} jobs
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex space-x-2">
                    <button
                        onClick={() => handleCompanyAction(company.id, company.verified ? 'unverify' : 'verify')}
                        className={`text-${company.verified ? 'yellow' : 'green'}-600 hover:text-${company.verified ? 'yellow' : 'green'}-900`}
                    >
                        {company.verified ? 'Unverify' : 'Verify'}
                    </button>
                    <button
                        onClick={() => handleCompanyAction(company.id, 'delete')}
                        className="text-red-600 hover:text-red-900"
                    >
                        Delete
                    </button>
                </div>
            </td>
        </tr>
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                            <p className="text-gray-600">Manage users, companies, and system settings</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                                <Download className="h-4 w-4 inline mr-2" />
                                Export Data
                            </button>
                            <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
                                <Settings className="h-4 w-4 inline mr-2" />
                                Settings
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Navigation Tabs */}
                <div className="mb-8">
                    <nav className="flex space-x-8">
                        {[
                            { id: 'overview', label: 'Overview', icon: BarChart3 },
                            { id: 'users', label: 'Users', icon: Users },
                            { id: 'companies', label: 'Companies', icon: Building },
                            { id: 'jobs', label: 'Jobs', icon: Briefcase },
                            { id: 'analytics', label: 'Analytics', icon: TrendingUp }
                        ].map(tab => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                                        activeTab === tab.id
                                            ? 'bg-blue-100 text-blue-700'
                                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                    <Icon className="h-4 w-4 mr-2" />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div className="space-y-8">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <StatCard
                                title="Total Users"
                                value={dashboardStats.totalUsers.toLocaleString()}
                                icon={Users}
                                trend={12}
                                color="blue"
                            />
                            <StatCard
                                title="Total Companies"
                                value={dashboardStats.totalCompanies.toLocaleString()}
                                icon={Building}
                                trend={8}
                                color="green"
                            />
                            <StatCard
                                title="Active Jobs"
                                value={dashboardStats.activeJobs.toLocaleString()}
                                icon={Briefcase}
                                trend={15}
                                color="purple"
                            />
                            <StatCard
                                title="Total Applications"
                                value={dashboardStats.totalApplications.toLocaleString()}
                                icon={Activity}
                                trend={-3}
                                color="orange"
                            />
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-white rounded-lg shadow-md">
                            <div className="px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-medium text-gray-900">Recent Activity</h3>
                            </div>
                            <div className="p-6">
                                <div className="space-y-4">
                                    {recentActivity.map(activity => (
                                        <div key={activity.id} className="flex items-center space-x-3">
                                            <div className="h-2 w-2 bg-blue-600 rounded-full"></div>
                                            <div className="flex-1">
                                                <p className="text-sm text-gray-900">{activity.message}</p>
                                                <p className="text-xs text-gray-500">{activity.time}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Users Tab */}
                {activeTab === 'users' && (
                    <div className="space-y-6">
                        {/* Search and Filter */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-1">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search users..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="all">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                        </div>

                        {/* Users Table */}
                        <div className="bg-white rounded-lg shadow-md overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            User
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Role
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Joined
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {users.filter(user => {
                                        const matchesSearch = user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                                            user.email?.toLowerCase().includes(searchTerm.toLowerCase());
                                        const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
                                        return matchesSearch && matchesStatus;
                                    }).map(user => (
                                        <UserRow key={user.id} user={user} />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Companies Tab */}
                {activeTab === 'companies' && (
                    <div className="space-y-6">
                        {/* Search and Filter */}
                        <div className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-1">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Search companies..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="all">All Companies</option>
                                    <option value="verified">Verified</option>
                                    <option value="pending">Pending</option>
                                </select>
                            </div>
                        </div>

                        {/* Companies Table */}
                        <div className="bg-white rounded-lg shadow-md overflow-hidden">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Company
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Location
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Jobs
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {companies.filter(company => {
                                        const matchesSearch = company.name?.toLowerCase().includes(searchTerm.toLowerCase());
                                        const matchesStatus = statusFilter === 'all' || 
                                                            (statusFilter === 'verified' && company.verified) ||
                                                            (statusFilter === 'pending' && !company.verified);
                                        return matchesSearch && matchesStatus;
                                    }).map(company => (
                                        <CompanyRow key={company.id} company={company} />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Jobs Tab */}
                {activeTab === 'jobs' && (
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="text-center py-12">
                            <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Job Management</h3>
                            <p className="text-gray-600 mb-4">Manage all job postings across the platform</p>
                            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                                View All Jobs
                            </button>
                        </div>
                    </div>
                )}

                {/* Analytics Tab */}
                {activeTab === 'analytics' && (
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="text-center py-12">
                            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Analytics Dashboard</h3>
                            <p className="text-gray-600 mb-4">Detailed analytics and reporting coming soon</p>
                            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                                Generate Report
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;