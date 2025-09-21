import React from "react";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const HiringAnalytics = ({ stats }) => {
  // Mock data for charts
  const applicationData = [
    { month: "Jan", applications: 65 },
    { month: "Feb", applications: 85 },
    { month: "Mar", applications: 120 },
    { month: "Apr", applications: 90 },
    { month: "May", applications: 110 },
    { month: "Jun", applications: 130 },
  ];

  const hiringStatusData = [
    { name: "Hired", value: 30 },
    { name: "In Process", value: 45 },
    { name: "Rejected", value: 25 },
  ];

  const COLORS = ["#0088FE", "#00C49F", "#FF8042"];

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow"
        >
          <h3 className="text-lg font-medium mb-4">Total Applications</h3>
          <p className="text-3xl font-bold">{stats.totalApplications}</p>
          <p className="text-sm text-gray-500 mt-2">
            +{stats.applicationGrowth}% from last month
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow"
        >
          <h3 className="text-lg font-medium mb-4">Hiring Rate</h3>
          <p className="text-3xl font-bold">{stats.hiringRate}%</p>
          <p className="text-sm text-gray-500 mt-2">
            Average time to hire: {stats.timeToHire} days
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow"
        >
          <h3 className="text-lg font-medium mb-4">Active Jobs</h3>
          <p className="text-3xl font-bold">{stats.activeJobs}</p>
          <p className="text-sm text-gray-500 mt-2">
            Across {stats.departments} departments
          </p>
        </motion.div>
      </div>

      {/* Application Trends Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow"
      >
        <h3 className="text-lg font-medium mb-4">Application Trends</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={applicationData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="applications"
                stroke="#8884d8"
                fill="#8884d8"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Hiring Status Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow"
        >
          <h3 className="text-lg font-medium mb-4">
            Hiring Status Distribution
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={hiringStatusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label
                >
                  {hiringStatusData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Department Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow"
        >
          <h3 className="text-lg font-medium mb-4">Department Performance</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { department: "Engineering", hired: 12 },
                  { department: "Sales", hired: 8 },
                  { department: "Marketing", hired: 6 },
                  { department: "Design", hired: 4 },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="department" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="hired" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HiringAnalytics;
