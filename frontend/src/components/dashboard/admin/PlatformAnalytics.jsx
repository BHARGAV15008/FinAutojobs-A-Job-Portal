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
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const PlatformAnalytics = () => {
  // Mock data for charts
  const growthData = [
    { month: "Jan", users: 1200, jobs: 450 },
    { month: "Feb", users: 1500, jobs: 520 },
    { month: "Mar", users: 2000, jobs: 580 },
    { month: "Apr", users: 2400, jobs: 650 },
    { month: "May", users: 2800, jobs: 700 },
    { month: "Jun", users: 3200, jobs: 780 },
  ];

  const categoryData = [
    { name: "Technology", value: 35 },
    { name: "Finance", value: 25 },
    { name: "Marketing", value: 20 },
    { name: "Sales", value: 15 },
    { name: "Other", value: 5 },
  ];

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

  return (
    <div className="space-y-6">
      {/* Platform Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow"
        >
          <h3 className="text-lg font-medium mb-4">Total Users</h3>
          <p className="text-3xl font-bold">3,200</p>
          <p className="text-sm text-gray-500 mt-2">+14% this month</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow"
        >
          <h3 className="text-lg font-medium mb-4">Active Jobs</h3>
          <p className="text-3xl font-bold">780</p>
          <p className="text-sm text-gray-500 mt-2">+8% this month</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow"
        >
          <h3 className="text-lg font-medium mb-4">Successful Hires</h3>
          <p className="text-3xl font-bold">450</p>
          <p className="text-sm text-gray-500 mt-2">+12% this month</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow"
        >
          <h3 className="text-lg font-medium mb-4">Revenue</h3>
          <p className="text-3xl font-bold">$52,000</p>
          <p className="text-sm text-gray-500 mt-2">+16% this month</p>
        </motion.div>
      </div>

      {/* Platform Growth Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow"
      >
        <h3 className="text-lg font-medium mb-4">Platform Growth</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={growthData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="users"
                stroke="#8884d8"
                strokeWidth={2}
                name="Users"
              />
              <Line
                type="monotone"
                dataKey="jobs"
                stroke="#82ca9d"
                strokeWidth={2}
                name="Jobs"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Job Categories Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow"
        >
          <h3 className="text-lg font-medium mb-4">
            Job Categories Distribution
          </h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* User Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow"
        >
          <h3 className="text-lg font-medium mb-4">User Activity</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { day: "Mon", visits: 1200 },
                  { day: "Tue", visits: 1400 },
                  { day: "Wed", visits: 1600 },
                  { day: "Thu", visits: 1400 },
                  { day: "Fri", visits: 1500 },
                  { day: "Sat", visits: 1000 },
                  { day: "Sun", visits: 800 },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="visits" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* System Performance */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow"
      >
        <h3 className="text-lg font-medium mb-4">System Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-500">
              Server Response Time
            </h4>
            <p className="text-2xl font-semibold mt-2">245ms</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500">Uptime</h4>
            <p className="text-2xl font-semibold mt-2">99.9%</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500">Error Rate</h4>
            <p className="text-2xl font-semibold mt-2">0.1%</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default PlatformAnalytics;
