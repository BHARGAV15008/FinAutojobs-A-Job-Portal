import React, { useState } from "react";
import { motion } from "framer-motion";

const SavedJobs = () => {
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Mock saved jobs data
  const savedJobs = [
    {
      id: 1,
      title: "Senior Frontend Developer",
      company: "TechCorp",
      location: "Remote",
      salary: "$120,000 - $150,000",
      status: "open",
      savedDate: "2023-09-15",
      deadlineDate: "2023-10-15",
      requirements: ["5+ years React", "TypeScript", "UI/UX knowledge"],
      type: "Full-time",
    },
    // Add more mock jobs...
  ];

  const filteredJobs = savedJobs.filter((job) => {
    const matchesSearch =
      searchQuery === "" ||
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === "all" || job.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex-1 min-w-[200px]">
            <input
              type="text"
              placeholder="Search saved jobs..."
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
            <option value="all">All Saved Jobs</option>
            <option value="open">Open Positions</option>
            <option value="closed">Closed Positions</option>
            <option value="applied">Applied</option>
          </select>
        </div>
      </div>

      {/* Saved Jobs List */}
      <div className="space-y-4">
        {filteredJobs.map((job, index) => (
          <motion.div
            key={job.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-medium">{job.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {job.company} • {job.location}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span
                  className={`px-3 py-1 rounded-full text-sm
                  ${
                    job.status === "open"
                      ? "bg-green-100 text-green-800"
                      : job.status === "closed"
                      ? "bg-red-100 text-red-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                </span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <span className="text-sm text-gray-500">Salary Range</span>
                <p className="font-medium">{job.salary}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Saved On</span>
                <p className="font-medium">
                  {new Date(job.savedDate).toLocaleDateString()}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-500">
                  Application Deadline
                </span>
                <p className="font-medium">
                  {new Date(job.deadlineDate).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-500">
                Requirements
              </h4>
              <ul className="mt-2 list-disc list-inside space-y-1">
                {job.requirements.map((req, i) => (
                  <li key={i} className="text-gray-600 dark:text-gray-400">
                    {req}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 flex justify-between items-center">
              <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm">
                {job.type}
              </span>
              <div className="space-x-2">
                <button
                  onClick={() => {
                    /* Handle remove */
                  }}
                  className="px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50"
                >
                  Remove
                </button>
                {job.status === "open" && (
                  <button
                    onClick={() => {
                      /* Handle apply */
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Apply Now
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {filteredJobs.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📌</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            No saved jobs found
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            {searchQuery
              ? "Try adjusting your search terms"
              : "Start saving jobs you're interested in to see them here"}
          </p>
        </div>
      )}
    </div>
  );
};

export default SavedJobs;
