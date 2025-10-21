import React from "react";
import { motion } from "framer-motion";

const RecommendedJobs = () => {
  // Mock recommended jobs based on user profile and preferences
  const recommendedJobs = [
    {
      id: 1,
      title: "Senior Frontend Developer",
      company: "TechCorp",
      location: "Remote",
      salary: "$120,000 - $150,000",
      matchScore: 95,
      skills: ["React", "TypeScript", "TailwindCSS"],
      posted: "2 days ago",
    },
    {
      id: 2,
      title: "Full Stack Engineer",
      company: "FinTech Solutions",
      location: "New York, NY",
      salary: "$130,000 - $160,000",
      matchScore: 90,
      skills: ["Node.js", "React", "PostgreSQL"],
      posted: "1 day ago",
    },
    // Add more mock jobs...
  ];

  return (
    <div className="space-y-6">
      {/* Match Criteria */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Your Match Criteria</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500">Skills Match</h3>
            <div className="mt-2 flex items-center">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: "85%" }}
                />
              </div>
              <span className="ml-2 text-sm font-medium">85%</span>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">
              Experience Match
            </h3>
            <div className="mt-2 flex items-center">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: "90%" }}
                />
              </div>
              <span className="ml-2 text-sm font-medium">90%</span>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500">
              Location Match
            </h3>
            <div className="mt-2 flex items-center">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-purple-500 h-2 rounded-full"
                  style={{ width: "75%" }}
                />
              </div>
              <span className="ml-2 text-sm font-medium">75%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Jobs List */}
      <div className="space-y-4">
        {recommendedJobs.map((job, index) => (
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
              <div className="flex items-center">
                <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  {job.matchScore}% Match
                </div>
              </div>
            </div>

            <div className="mt-4">
              <p className="text-gray-600 dark:text-gray-400">{job.salary}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {job.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-4 flex justify-between items-center">
              <span className="text-sm text-gray-500">Posted {job.posted}</span>
              <div className="space-x-2">
                <button
                  className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50"
                  onClick={() => {
                    /* Handle save */
                  }}
                >
                  Save
                </button>
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  onClick={() => {
                    /* Handle apply */
                  }}
                >
                  Apply Now
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Job Preferences */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Job Preferences</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {["React", "TypeScript", "Node.js", "PostgreSQL"].map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm"
                >
                  {skill}
                </span>
              ))}
              <button className="px-3 py-1 border border-dashed border-gray-300 rounded-full text-sm text-gray-500 hover:border-gray-400">
                + Add Skill
              </button>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              Preferred Locations
            </h3>
            <div className="flex flex-wrap gap-2">
              {["Remote", "New York, NY", "San Francisco, CA"].map(
                (location) => (
                  <span
                    key={location}
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm"
                  >
                    {location}
                  </span>
                )
              )}
              <button className="px-3 py-1 border border-dashed border-gray-300 rounded-full text-sm text-gray-500 hover:border-gray-400">
                + Add Location
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecommendedJobs;
