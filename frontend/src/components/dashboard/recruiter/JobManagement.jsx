import React, { useState } from "react";
import { motion } from "framer-motion";

const JobManagement = ({ jobs = [] }) => {
  const [activeTab, setActiveTab] = useState("active");
  const [searchQuery, setSearchQuery] = useState("");

  const filterJobs = (status) => {
    return jobs.filter(
      (job) =>
        job.status === status &&
        (searchQuery === "" ||
          job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          job.company.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  };

  const stats = {
    active: filterJobs("active").length,
    draft: filterJobs("draft").length,
    closed: filterJobs("closed").length,
    total: jobs.length,
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Jobs", value: stats.total },
          { label: "Active Jobs", value: stats.active },
          { label: "Draft Jobs", value: stats.draft },
          { label: "Closed Jobs", value: stats.closed },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow"
          >
            <h3 className="text-sm text-gray-500 dark:text-gray-400">
              {stat.label}
            </h3>
            <p className="text-2xl font-semibold mt-1">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Actions Bar */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search jobs..."
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          onClick={() => {
            /* Handle new job */
          }}
        >
          Post New Job
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          {["active", "draft", "closed"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                py-4 px-1 border-b-2 font-medium text-sm
                ${
                  activeTab === tab
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }
              `}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                {stats[tab]}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Jobs List */}
      <div className="space-y-4">
        {filterJobs(activeTab).map((job) => (
          <motion.div
            key={job.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-medium">{job.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {job.company} • {job.location}
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  className="px-3 py-1 border rounded-lg hover:bg-gray-50"
                  onClick={() => {
                    /* Handle edit */
                  }}
                >
                  Edit
                </button>
                <button
                  className="px-3 py-1 border rounded-lg hover:bg-gray-50"
                  onClick={() => {
                    /* Handle view applications */
                  }}
                >
                  View Applications
                </button>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm">
                {job.type}
              </span>
              <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm">
                {typeof job.applicationsCount === "number"
                  ? job.applicationsCount
                  : 0}{" "}
                applications
              </span>
              <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm">
                Posted {job.posted}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default JobManagement;
