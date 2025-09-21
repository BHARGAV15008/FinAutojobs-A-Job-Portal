import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Briefcase, 
  Search, 
  Star, 
  Bookmark, 
  Send, 
  Calendar, 
  Bell, 
  BarChart3, 
  Settings, 
  FileText, 
  TrendingUp,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  MapPin,
  DollarSign,
  Users,
  Plus,
  Filter,
  Download,
  Upload
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import DashboardCard from '../common/DashboardCard';
import JobCard from '../common/JobCard';
import ApplicationCard from '../common/ApplicationCard';
import InterviewCard from '../common/InterviewCard';

const ApplicantDashboard = () => {
  // Mock data
  const [user, setUser] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    profileCompletion: 85,
    skills: ['React', 'Node.js', 'Python', 'AWS', 'Docker'],
    experience: 5,
    education: 'Master\'s Degree in Computer Science'
  });

  const [stats, setStats] = useState({
    profileViews: 124,
    applicationsSent: 15,
    interviewsScheduled: 3,
    responseRate: 20
  });

  const [recommendedJobs, setRecommendedJobs] = useState([
    {
      id: 1,
      title: 'Senior Frontend Developer',
      company: 'TechCorp',
      location: 'San Francisco, CA',
      salary: '$120,000 - $150,000',
      type: 'Full-time',
      match: 92,
      posted: '2 days ago',
      logo: 'TC'
    },
    {
      id: 2,
      title: 'Full Stack Engineer',
      company: 'StartupXYZ',
      location: 'Remote',
      salary: '$100,000 - $130,000',
      type: 'Full-time',
      match: 88,
      posted: '1 week ago',
      logo: 'SX'
    },
    {
      id: 3,
      title: 'React Developer',
      company: 'WebSolutions',
      location: 'New York, NY',
      salary: '$90,000 - $110,000',
      type: 'Full-time',
      match: 85,
      posted: '3 days ago',
      logo: 'WS'
    }
  ]);

  const [recentApplications, setRecentApplications] = useState([
    {
      id: 1,
      position: 'Senior Software Engineer',
      company: 'TechCorp',
      status: 'pending',
      appliedDate: '2024-01-20',
      location: 'San Francisco, CA'
    },
    {
      id: 2,
      position: 'Frontend Developer',
      company: 'StartupXYZ',
      status: 'interview',
      appliedDate: '2024-01-18',
      location: 'Remote'
    },
    {
      id: 3,
      position: 'React Developer',
      company: 'WebSolutions',
      status: 'accepted',
      appliedDate: '2024-01-15',
      location: 'New York, NY'
    }
  ]);

  const [upcomingInterviews, setUpcomingInterviews] = useState([
    {
      id: 1,
      company: 'TechCorp',
      position: 'Senior Software Engineer',
      date: '2024-01-25',
      time: '10:00 AM',
      type: 'Video Call',
      status: 'scheduled'
    },
    {
      id: 2,
      company: 'StartupXYZ',
      position: 'Frontend Developer',
      date: '2024-01-26',
      time: '2:00 PM',
      type: 'Technical Round',
      status: 'scheduled'
    }
  ]);

  // Chart data
  const applicationData = [
    { month: 'Jan', applications: 5, interviews: 2, offers: 1 },
    { month: 'Feb', applications: 8, interviews: 3, offers: 1 },
    { month: 'Mar', applications: 12, interviews: 5, offers: 2 },
    { month: 'Apr', applications: 15, interviews: 6, offers: 2 },
    { month: 'May', applications: 18, interviews: 8, offers: 3 },
    { month: 'Jun', applications: 20, interviews: 10, offers: 4 }
  ];

  const skillsData = [
    { skill: 'React', level: 90 },
    { skill: 'Node.js', level: 85 },
    { skill: 'Python', level: 80 },
    { skill: 'AWS', level: 75 },
    { skill: 'Docker', level: 70 }
  ];

  const COLORS = ['#6366F1', '#8B5CF6', '#A855F7', '#D946EF', '#EC4899'];

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'interview':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'accepted':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'interview':
        return <Calendar className="h-4 w-4" />;
      case 'accepted':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
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
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Welcome back, {user.firstName}! 👋
              </h1>
              <p className="text-indigo-100 text-lg">
                Your dream job is just around the corner
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{user.profileCompletion}%</div>
              <div className="text-indigo-100 text-sm">Profile Complete</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="Profile Views"
          value={stats.profileViews}
          icon={Eye}
          trend="+12%"
          trendType="positive"
          color="blue"
        />
        <DashboardCard
          title="Applications Sent"
          value={stats.applicationsSent}
          icon={Send}
          trend="+25%"
          trendType="positive"
          color="green"
        />
        <DashboardCard
          title="Interviews Scheduled"
          value={stats.interviewsScheduled}
          icon={Calendar}
          trend="+50%"
          trendType="positive"
          color="purple"
        />
        <DashboardCard
          title="Response Rate"
          value={`${stats.responseRate}%`}
          icon={TrendingUp}
          trend="+5%"
          trendType="positive"
          color="indigo"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Application Trends */}
        <DashboardCard title="Application Trends" icon={BarChart3}>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={applicationData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="applications"
                  stackId="1"
                  stroke="#6366F1"
                  fill="#6366F1"
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="interviews"
                  stackId="1"
                  stroke="#8B5CF6"
                  fill="#8B5CF6"
                  fillOpacity={0.6}
                />
                <Area
                  type="monotone"
                  dataKey="offers"
                  stackId="1"
                  stroke="#10B981"
                  fill="#10B981"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </DashboardCard>

        {/* Skills Overview */}
        <DashboardCard title="Skills Overview" icon={User}>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={skillsData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ skill, level }) => `${skill}: ${level}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="level"
                >
                  {skillsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </DashboardCard>
      </div>

      {/* Recommended Jobs */}
      <DashboardCard 
        title="Recommended Jobs" 
        icon={Star}
        action={
          <button className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm font-medium">
            View All
          </button>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recommendedJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      </DashboardCard>

      {/* Recent Applications & Upcoming Interviews */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Applications */}
        <DashboardCard 
          title="Recent Applications" 
          icon={Send}
          action={
            <button className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm font-medium">
              View All
            </button>
          }
        >
          <div className="space-y-4">
            {recentApplications.map((application) => (
              <ApplicationCard key={application.id} application={application} />
            ))}
          </div>
        </DashboardCard>

        {/* Upcoming Interviews */}
        <DashboardCard 
          title="Upcoming Interviews" 
          icon={Calendar}
          action={
            <button className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 text-sm font-medium">
              View All
            </button>
          }
        >
          <div className="space-y-4">
            {upcomingInterviews.map((interview) => (
              <InterviewCard key={interview.id} interview={interview} />
            ))}
          </div>
        </DashboardCard>
      </div>

      {/* Quick Actions */}
      <DashboardCard title="Quick Actions" icon={Plus}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex flex-col items-center p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors">
            <Search className="h-8 w-8 text-indigo-600 dark:text-indigo-400 mb-2" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Browse Jobs</span>
          </button>
          <button className="flex flex-col items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
            <Upload className="h-8 w-8 text-green-600 dark:text-green-400 mb-2" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Upload Resume</span>
          </button>
          <button className="flex flex-col items-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors">
            <FileText className="h-8 w-8 text-purple-600 dark:text-purple-400 mb-2" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Build Resume</span>
          </button>
          <button className="flex flex-col items-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
            <Bell className="h-8 w-8 text-blue-600 dark:text-blue-400 mb-2" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Job Alerts</span>
          </button>
        </div>
      </DashboardCard>
    </div>
  );
};

export default ApplicantDashboard;
