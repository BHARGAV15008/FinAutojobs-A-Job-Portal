import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Briefcase, 
  Users, 
  Building2, 
  BarChart3, 
  TrendingUp,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  MapPin,
  DollarSign,
  Calendar,
  Filter,
  Download,
  Upload,
  Search,
  Shield,
  Settings,
  MessageSquare,
  Database,
  Activity,
  Zap,
  Send
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import DashboardCard from '../common/DashboardCard';
import UserManagementCard from '../common/UserManagementCard';
import JobManagementCard from '../common/JobManagementCard';
import SystemStatsCard from '../common/SystemStatsCard';

const AdminDashboard = () => {
  // Mock data
  const [user, setUser] = useState({
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@finautojobs.com',
    role: 'System Administrator'
  });

  const [stats, setStats] = useState({
    totalUsers: 15420,
    totalJobs: 3420,
    totalApplications: 89650,
    activeRecruiters: 450
  });

  const [recentUsers, setRecentUsers] = useState([
    {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      role: 'applicant',
      status: 'active',
      joined: '2024-01-20',
      avatar: 'JD'
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane@company.com',
      role: 'recruiter',
      status: 'pending',
      joined: '2024-01-19',
      avatar: 'JS'
    },
    {
      id: 3,
      name: 'Mike Johnson',
      email: 'mike@startup.com',
      role: 'recruiter',
      status: 'active',
      joined: '2024-01-18',
      avatar: 'MJ'
    }
  ]);

  const [systemAlerts, setSystemAlerts] = useState([
    {
      id: 1,
      type: 'security',
      title: 'Unusual login activity detected',
      message: 'Multiple failed login attempts from IP 192.168.1.100',
      severity: 'high',
      time: '2 hours ago'
    },
    {
      id: 2,
      type: 'system',
      title: 'Database backup completed',
      message: 'Daily backup completed successfully',
      severity: 'low',
      time: '5 hours ago'
    },
    {
      id: 3,
      type: 'performance',
      title: 'High server load detected',
      message: 'CPU usage exceeded 80% for the past hour',
      severity: 'medium',
      time: '1 day ago'
    }
  ]);

  // Chart data
  const userGrowthData = [
    { month: 'Jan', applicants: 1200, recruiters: 45, total: 1245 },
    { month: 'Feb', applicants: 1450, recruiters: 52, total: 1502 },
    { month: 'Mar', applicants: 1680, recruiters: 61, total: 1741 },
    { month: 'Apr', applicants: 1920, recruiters: 68, total: 1988 },
    { month: 'May', applicants: 2150, recruiters: 75, total: 2225 },
    { month: 'Jun', applicants: 2380, recruiters: 82, total: 2462 }
  ];

  const jobDistributionData = [
    { category: 'Technology', jobs: 1200, percentage: 35 },
    { category: 'Finance', jobs: 890, percentage: 26 },
    { category: 'Healthcare', jobs: 680, percentage: 20 },
    { category: 'Education', jobs: 450, percentage: 13 },
    { category: 'Other', jobs: 200, percentage: 6 }
  ];

  const systemPerformanceData = [
    { time: '00:00', cpu: 45, memory: 60, disk: 55 },
    { time: '04:00', cpu: 35, memory: 58, disk: 54 },
    { time: '08:00', cpu: 75, memory: 75, disk: 58 },
    { time: '12:00', cpu: 85, memory: 80, disk: 60 },
    { time: '16:00', cpu: 70, memory: 72, disk: 57 },
    { time: '20:00', cpu: 55, memory: 65, disk: 56 },
    { time: '24:00', cpu: 40, memory: 62, disk: 55 }
  ];

  const COLORS = ['#6366F1', '#8B5CF6', '#A855F7', '#D946EF', '#EC4899'];

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'recruiter':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'applicant':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-gradient-to-r from-purple-500 to-pink-600 rounded-md p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Welcome back, {user.firstName}! 👋
              </h1>
              <p className="text-purple-100 text-lg">
                System Administrator Dashboard
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
              <div className="text-purple-100 text-sm">Total Users</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          icon={Users}
          trend="+12%"
          trendType="positive"
          color="blue"
        />
        <DashboardCard
          title="Total Jobs"
          value={stats.totalJobs.toLocaleString()}
          icon={Briefcase}
          trend="+8%"
          trendType="positive"
          color="green"
        />
        <DashboardCard
          title="Applications"
          value={stats.totalApplications.toLocaleString()}
          icon={Send}
          trend="+23%"
          trendType="positive"
          color="purple"
        />
        <DashboardCard
          title="Active Recruiters"
          value={stats.activeRecruiters.toLocaleString()}
          icon={Building2}
          trend="+15%"
          trendType="positive"
          color="indigo"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth */}
        <DashboardCard title="User Growth Trends" icon={TrendingUp}>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="applicants"
                  stackId="1"
                  stroke="#10B981"
                  fill="#10B981"
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="recruiters"
                  stackId="1"
                  stroke="#6366F1"
                  fill="#6366F1"
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  stroke="#8B5CF6"
                  fill="#8B5CF6"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </DashboardCard>

        {/* System Performance */}
        <DashboardCard title="System Performance" icon={Activity}>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={systemPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="cpu" stroke="#EF4444" strokeWidth={2} />
                <Line type="monotone" dataKey="memory" stroke="#3B82F6" strokeWidth={2} />
                <Line type="monotone" dataKey="disk" stroke="#10B981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </DashboardCard>
      </div>

      {/* Job Distribution */}
      <DashboardCard title="Job Distribution by Category" icon={Briefcase}>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={jobDistributionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ category, percentage }) => `${category}: ${percentage}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="jobs"
              >
                {jobDistributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </DashboardCard>

      {/* Recent Users & System Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <DashboardCard 
          title="Recent User Registrations" 
          icon={Users}
          action={
            <button className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 text-sm font-medium">
              View All
            </button>
          }
        >
          <div className="space-y-4">
            {recentUsers.map((user) => (
              <UserManagementCard key={user.id} user={user} />
            ))}
          </div>
        </DashboardCard>

        {/* System Alerts */}
        <DashboardCard 
          title="System Alerts" 
          icon={AlertCircle}
          action={
            <button className="text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 text-sm font-medium">
              View All
            </button>
          }
        >
          <div className="space-y-4">
            {systemAlerts.map((alert) => (
              <SystemStatsCard key={alert.id} alert={alert} />
            ))}
          </div>
        </DashboardCard>
      </div>

      {/* Quick Actions */}
      <DashboardCard title="Quick Actions" icon={Settings}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex flex-col items-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
            <Users className="h-8 w-8 text-blue-600 dark:text-blue-400 mb-2" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Manage Users</span>
          </button>
          <button className="flex flex-col items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
            <Briefcase className="h-8 w-8 text-green-600 dark:text-green-400 mb-2" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Moderate Jobs</span>
          </button>
          <button className="flex flex-col items-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors">
            <Shield className="h-8 w-8 text-purple-600 dark:text-purple-400 mb-2" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Security</span>
          </button>
          <button className="flex flex-col items-center p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors">
            <Database className="h-8 w-8 text-indigo-600 dark:text-indigo-400 mb-2" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Database</span>
          </button>
        </div>
      </DashboardCard>
    </div>
  );
};

export default AdminDashboard;
