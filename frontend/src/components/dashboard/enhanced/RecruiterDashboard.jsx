import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User,
  Briefcase,
  Plus,
  Edit,
  Trash2,
  Users,
  MessageSquare,
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
  Building2,
  Search,
} from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import DashboardCard from "../common/DashboardCard";
import JobPostingCard from "../common/JobPostingCard";
import ApplicantCard from "../common/ApplicantCard";
import MessageCard from "../common/MessageCard";

const RecruiterDashboard = () => {
  // Mock data
  const [user, setUser] = useState({
    firstName: "Sarah",
    lastName: "Johnson",
    email: "sarah.johnson@techcorp.com",
    company: "TechCorp",
    role: "HR Manager",
  });

  const [stats, setStats] = useState({
    activeJobs: 12,
    totalApplications: 156,
    interviewsScheduled: 24,
    hireRate: 15,
  });

  const [jobPostings, setJobPostings] = useState([
    {
      id: 1,
      title: "Senior Frontend Developer",
      applications: 45,
      views: 234,
      status: "active",
      posted: "2024-01-15",
      location: "San Francisco, CA",
      salary: "$120,000 - $150,000",
    },
    {
      id: 2,
      title: "Full Stack Engineer",
      applications: 32,
      views: 189,
      status: "active",
      posted: "2024-01-10",
      location: "Remote",
      salary: "$100,000 - $130,000",
    },
    {
      id: 3,
      title: "React Developer",
      applications: 28,
      views: 156,
      status: "paused",
      posted: "2024-01-08",
      location: "New York, NY",
      salary: "$90,000 - $110,000",
    },
  ]);

  const [recentApplicants, setRecentApplicants] = useState([
    {
      id: 1,
      name: "John Doe",
      position: "Senior Frontend Developer",
      applied: "2024-01-20",
      status: "review",
      match: 92,
      avatar: "JD",
    },
    {
      id: 2,
      name: "Jane Smith",
      position: "Full Stack Engineer",
      applied: "2024-01-19",
      status: "interview",
      match: 88,
      avatar: "JS",
    },
    {
      id: 3,
      name: "Mike Johnson",
      position: "React Developer",
      applied: "2024-01-18",
      status: "pending",
      match: 85,
      avatar: "MJ",
    },
  ]);

  const [messages, setMessages] = useState([
    {
      id: 1,
      name: "John Doe",
      subject: "Interview Confirmation",
      message:
        "Thank you for scheduling the interview. I look forward to discussing the position...",
      time: "2 hours ago",
      unread: true,
      avatar: "JD",
    },
    {
      id: 2,
      name: "Jane Smith",
      subject: "Application Status",
      message:
        "I wanted to follow up on my application for the Full Stack Engineer position...",
      time: "5 hours ago",
      unread: false,
      avatar: "JS",
    },
  ]);

  // Chart data
  const applicationData = [
    { month: "Jan", applications: 45, interviews: 12, hires: 3 },
    { month: "Feb", applications: 52, interviews: 15, hires: 4 },
    { month: "Mar", applications: 48, interviews: 18, hires: 5 },
    { month: "Apr", applications: 61, interviews: 22, hires: 6 },
    { month: "May", applications: 58, interviews: 25, hires: 7 },
    { month: "Jun", applications: 67, interviews: 28, hires: 8 },
  ];

  const jobPerformanceData = [
    { job: "Frontend Dev", views: 234, applications: 45, hires: 3 },
    { job: "Full Stack", views: 189, applications: 32, hires: 2 },
    { job: "React Dev", views: 156, applications: 28, hires: 1 },
    { job: "Backend Dev", views: 145, applications: 22, hires: 2 },
    { job: "DevOps", views: 98, applications: 15, hires: 1 },
  ];

  const COLORS = ["#6366F1", "#8B5CF6", "#A855F7", "#D946EF", "#EC4899"];

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "paused":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "closed":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  return (
    <div
      className={
        `space-y-6 min-h-screen ` +
        (typeof window !== "undefined" &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "bg-gray-900 text-white"
          : "bg-gray-50 text-gray-900")
      }
    >
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-md p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Welcome back, {user.firstName}! 👋
              </h1>
              <p className="text-blue-100 text-lg">
                {user.company} • {user.role}
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{stats.activeJobs}</div>
              <div className="text-blue-100 text-sm">Active Jobs</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="Active Jobs"
          value={stats.activeJobs}
          icon={Briefcase}
          trend="+8%"
          trendType="positive"
          color="blue"
        />
        <DashboardCard
          title="Total Applications"
          value={stats.totalApplications}
          icon={Users}
          trend="+23%"
          trendType="positive"
          color="green"
        />
        <DashboardCard
          title="Interviews Scheduled"
          value={stats.interviewsScheduled}
          icon={Calendar}
          trend="+15%"
          trendType="positive"
          color="purple"
        />
        <DashboardCard
          title="Hire Rate"
          value={`${stats.hireRate}%`}
          icon={TrendingUp}
          trend="+3%"
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
                  dataKey="hires"
                  stackId="1"
                  stroke="#10B981"
                  fill="#10B981"
                  fillOpacity={0.6}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </DashboardCard>

        {/* Job Performance */}
        <DashboardCard title="Job Performance" icon={TrendingUp}>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={jobPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="job" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="views" fill="#6366F1" />
                <Bar dataKey="applications" fill="#8B5CF6" />
                <Bar dataKey="hires" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </DashboardCard>
      </div>

      {/* Job Postings */}
      <DashboardCard
        title="Active Job Postings"
        icon={Briefcase}
        action={
          <button className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium">
            View All
          </button>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobPostings.map((job) => (
            <JobPostingCard key={job.id} job={job} />
          ))}
        </div>
      </DashboardCard>

      {/* Recent Applicants & Messages */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Applicants */}
        <DashboardCard
          title="Recent Applicants"
          icon={Users}
          action={
            <button className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium">
              View All
            </button>
          }
        >
          <div className="space-y-4">
            {recentApplicants.map((applicant) => (
              <ApplicantCard key={applicant.id} applicant={applicant} />
            ))}
          </div>
        </DashboardCard>

        {/* Messages */}
        <DashboardCard
          title="Recent Messages"
          icon={MessageSquare}
          action={
            <button className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium">
              View All
            </button>
          }
        >
          <div className="space-y-4">
            {messages.map((message) => (
              <MessageCard key={message.id} message={message} />
            ))}
          </div>
        </DashboardCard>
      </div>

      {/* Quick Actions */}
      <DashboardCard title="Quick Actions" icon={Plus}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="flex flex-col items-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
            <Plus className="h-8 w-8 text-blue-600 dark:text-blue-400 mb-2" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Post Job
            </span>
          </button>
          <button className="flex flex-col items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
            <Users className="h-8 w-8 text-green-600 dark:text-green-400 mb-2" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              View Applicants
            </span>
          </button>
          <button className="flex flex-col items-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors">
            <Calendar className="h-8 w-8 text-purple-600 dark:text-purple-400 mb-2" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Schedule Interview
            </span>
          </button>
          <button className="flex flex-col items-center p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/30 transition-colors">
            <Download className="h-8 w-8 text-indigo-600 dark:text-indigo-400 mb-2" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Export Reports
            </span>
          </button>
        </div>
      </DashboardCard>
    </div>
  );
};

export default RecruiterDashboard;
