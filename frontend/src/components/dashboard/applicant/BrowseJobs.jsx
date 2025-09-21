import React, { useState } from "react";
import { motion } from "framer-motion";

const BrowseJobs = () => {
  const [filters, setFilters] = useState({
    category: "",
    location: "",
    type: "",
    experience: "",
    salary: "",
  });
  const [searchQuery, setSearchQuery] = useState("");

  // Mock jobs data
  const jobs = [
    {
      id: 1,
      title: "Senior Frontend Developer",
      company: "Tech Corp",
      location: "Remote",
      type: "Full-time",
      salary: "$80,000 - $120,000",
      posted: "2 days ago",
      description: "We're looking for an experienced frontend developer...",
      requirements: ["5+ years React", "TypeScript", "UI/UX knowledge"],
    },
    // Add more mock jobs...
  ];

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search jobs..."
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select
            className="px-4 py-2 border rounded-lg"
            value={filters.category}
            onChange={(e) =>
              setFilters({ ...filters, category: e.target.value })
            }
          >
            <option value="">All Categories</option>
            <option value="development">Development</option>
            <option value="design">Design</option>
            <option value="marketing">Marketing</option>
          </select>
          {/* Add more filter dropdowns */}
        </div>
      </div>

      {/* Jobs List */}
      <div className="space-y-4">
        {jobs.map((job) => (
          <motion.div
            key={job.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {job.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {job.company} • {job.location}
                </p>
              </div>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                onClick={() => {
                  /* Handle apply */
                }}
              >
                Apply Now
              </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm">
                {job.type}
              </span>
              <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm">
                {job.salary}
              </span>
              <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm">
                Posted {job.posted}
              </span>
            </div>

            <p className="mt-4 text-gray-600 dark:text-gray-400">
              {job.description}
            </p>

            <div className="mt-4">
              <h4 className="font-medium">Requirements:</h4>
              <ul className="list-disc list-inside mt-2">
                {job.requirements.map((req, index) => (
                  <li key={index} className="text-gray-600 dark:text-gray-400">
                    {req}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center space-x-2">
        <button className="px-4 py-2 border rounded-lg">Previous</button>
        <button className="px-4 py-2 border rounded-lg">Next</button>
      </div>
    </div>
  );
};

export default BrowseJobs;
