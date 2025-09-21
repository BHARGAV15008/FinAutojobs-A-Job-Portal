import React, { useState } from "react";
import { motion } from "framer-motion";

const JobAlerts = () => {
  const [alerts, setAlerts] = useState([
    {
      id: 1,
      name: "Senior Frontend Developer",
      keywords: ["React", "TypeScript", "Frontend"],
      locations: ["Remote", "New York"],
      salary: "$100k+",
      frequency: "daily",
      active: true,
      lastTriggered: "2023-09-20",
      matches: 12,
    },
    // Add more mock alerts...
  ]);

  const [showNewAlert, setShowNewAlert] = useState(false);
  const [newAlert, setNewAlert] = useState({
    name: "",
    keywords: [],
    locations: [],
    salary: "",
    frequency: "daily",
  });

  const handleToggleAlert = (id) => {
    setAlerts((prev) =>
      prev.map((alert) =>
        alert.id === id ? { ...alert, active: !alert.active } : alert
      )
    );
  };

  const handleDeleteAlert = (id) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  };

  const handleAddAlert = () => {
    setAlerts((prev) => [
      ...prev,
      {
        id: Date.now(),
        ...newAlert,
        active: true,
        lastTriggered: new Date().toISOString().split("T")[0],
        matches: 0,
      },
    ]);
    setShowNewAlert(false);
    setNewAlert({
      name: "",
      keywords: [],
      locations: [],
      salary: "",
      frequency: "daily",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Job Alerts</h2>
        <button
          onClick={() => setShowNewAlert(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Create New Alert
        </button>
      </div>

      {/* New Alert Form */}
      {showNewAlert && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
        >
          <h3 className="text-lg font-medium mb-4">Create New Job Alert</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Alert Name
              </label>
              <input
                type="text"
                value={newAlert.name}
                onChange={(e) =>
                  setNewAlert((prev) => ({ ...prev, name: e.target.value }))
                }
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Senior Developer Positions"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Keywords</label>
              <input
                type="text"
                value={newAlert.keywords.join(", ")}
                onChange={(e) =>
                  setNewAlert((prev) => ({
                    ...prev,
                    keywords: e.target.value.split(",").map((k) => k.trim()),
                  }))
                }
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="React, TypeScript, Frontend"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Locations
              </label>
              <input
                type="text"
                value={newAlert.locations.join(", ")}
                onChange={(e) =>
                  setNewAlert((prev) => ({
                    ...prev,
                    locations: e.target.value.split(",").map((l) => l.trim()),
                  }))
                }
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Remote, New York, San Francisco"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Minimum Salary
              </label>
              <input
                type="text"
                value={newAlert.salary}
                onChange={(e) =>
                  setNewAlert((prev) => ({ ...prev, salary: e.target.value }))
                }
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., $100k+"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Frequency
              </label>
              <select
                value={newAlert.frequency}
                onChange={(e) =>
                  setNewAlert((prev) => ({
                    ...prev,
                    frequency: e.target.value,
                  }))
                }
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="instant">Instant</option>
              </select>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowNewAlert(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddAlert}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create Alert
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Alerts List */}
      <div className="space-y-4">
        {alerts.map((alert, index) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-medium">{alert.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {alert.matches} matches in the last 7 days
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleToggleAlert(alert.id)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full
                    ${alert.active ? "bg-blue-600" : "bg-gray-200"}`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition
                      ${alert.active ? "translate-x-6" : "translate-x-1"}`}
                  />
                </button>
                <button
                  onClick={() => handleDeleteAlert(alert.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <span className="sr-only">Delete</span>
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500">Keywords</h4>
                <div className="mt-1 flex flex-wrap gap-2">
                  {alert.keywords.map((keyword) => (
                    <span
                      key={keyword}
                      className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Locations</h4>
                <div className="mt-1 flex flex-wrap gap-2">
                  {alert.locations.map((location) => (
                    <span
                      key={location}
                      className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                    >
                      {location}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">
                  Minimum Salary
                </h4>
                <p className="mt-1">{alert.salary}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-500">Frequency</h4>
                <p className="mt-1 capitalize">{alert.frequency}</p>
              </div>
            </div>

            <div className="mt-4 text-sm text-gray-500">
              Last updated: {new Date(alert.lastTriggered).toLocaleDateString()}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {alerts.length === 0 && (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔔</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            No job alerts set
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Create your first job alert to get notified about new matching
            positions
          </p>
          <button
            onClick={() => setShowNewAlert(true)}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Create First Alert
          </button>
        </div>
      )}
    </div>
  );
};

export default JobAlerts;
