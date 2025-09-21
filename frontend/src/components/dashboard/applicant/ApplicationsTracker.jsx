import React, { useState } from "react";
import { motion } from "framer-motion";

const ApplicationsTracker = () => {
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Mock applications data
  const applications = [
    {
      id: 1,
      jobTitle: "Senior Frontend Developer",
      company: "TechCorp",
      appliedDate: "2023-09-15",
      status: "interview",
      stage: "Technical Interview",
      nextStep: "System Design Interview",
      nextStepDate: "2023-09-25",
      feedback: "Strong technical skills, proceed to system design round",
      history: [
        { date: "2023-09-15", event: "Application Submitted" },
        { date: "2023-09-18", event: "Resume Screened" },
        { date: "2023-09-20", event: "Technical Interview Scheduled" },
        { date: "2023-09-22", event: "Technical Interview Completed" },
      ],
    },
    // Add more mock applications...
  ];

  const getStatusColor = (status) => {
    const colors = {
      submitted: { bg: "bg-gray-100", text: "text-gray-800" },
      screening: { bg: "bg-blue-100", text: "text-blue-800" },
      interview: { bg: "bg-yellow-100", text: "text-yellow-800" },
      offer: { bg: "bg-green-100", text: "text-green-800" },
      rejected: { bg: "bg-red-100", text: "text-red-800" },
    };
    return colors[status] || colors.submitted;
  };

  const filteredApplications = applications.filter((app) => {
    const matchesSearch =
      searchQuery === "" ||
      app.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === "all" || app.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Total Applications", value: applications.length },
          {
            label: "Active Processes",
            value: applications.filter(
              (a) => !["rejected", "withdrawn"].includes(a.status)
            ).length,
          },
          {
            label: "Interviews Scheduled",
            value: applications.filter((a) => a.status === "interview").length,
          },
          {
            label: "Offers Received",
            value: applications.filter((a) => a.status === "offer").length,
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow"
          >
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {stat.label}
            </h3>
            <p className="mt-2 text-3xl font-semibold">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search applications..."
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            className="px-4 py-2 border rounded-lg"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Applications</option>
            <option value="submitted">Submitted</option>
            <option value="screening">Screening</option>
            <option value="interview">Interview</option>
            <option value="offer">Offer</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {filteredApplications.map((application, index) => (
          <motion.div
            key={application.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-medium">{application.jobTitle}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {application.company}
                </p>
              </div>
              <div className="flex items-center">
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    getStatusColor(application.status).bg
                  } ${getStatusColor(application.status).text}`}
                >
                  {application.status.charAt(0).toUpperCase() +
                    application.status.slice(1)}
                </span>
              </div>
            </div>

            {/* Application Timeline */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute left-3 top-0 h-full w-0.5 bg-gray-200"></div>
                {application.history.map((event, i) => (
                  <div key={i} className="relative flex items-start mb-4">
                    <div className="absolute left-0 mt-1 w-6 h-6 bg-blue-500 rounded-full"></div>
                    <div className="ml-10">
                      <p className="font-medium">{event.event}</p>
                      <p className="text-sm text-gray-500">{event.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Next Steps & Feedback */}
            {application.nextStep && (
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                <h4 className="font-medium text-blue-900 dark:text-blue-100">
                  Next Step
                </h4>
                <p className="mt-1 text-blue-800 dark:text-blue-200">
                  {application.nextStep}
                </p>
                {application.nextStepDate && (
                  <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                    Scheduled for{" "}
                    {new Date(application.nextStepDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            )}

            {application.feedback && (
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/30 rounded-lg">
                <h4 className="font-medium">Feedback</h4>
                <p className="mt-1 text-gray-600 dark:text-gray-300">
                  {application.feedback}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="mt-6 flex justify-end space-x-2">
              <button
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                onClick={() => {
                  /* Handle withdraw */
                }}
              >
                Withdraw Application
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                onClick={() => {
                  /* Handle view details */
                }}
              >
                View Details
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredApplications.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            No applications found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            {searchQuery
              ? "Try adjusting your search terms"
              : "Start applying to jobs to track your applications here"}
          </p>
        </div>
      )}
    </div>
  );
};

export default ApplicationsTracker;
