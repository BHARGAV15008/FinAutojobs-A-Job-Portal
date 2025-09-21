import React from "react";
import { motion } from "framer-motion";
import DashboardCard from "../../cards/DashboardCard";

const DashboardOverview = ({ stats }) => {
  const overviewCards = [
    {
      title: "Applications",
      value: stats.totalApplications,
      change: `${stats.newApplications} new this week`,
      changeType: "positive",
      gradient: "blue",
      icon: "📄",
    },
    {
      title: "Saved Jobs",
      value: stats.savedJobs,
      change: `${stats.newSavedJobs} new matches`,
      changeType: "positive",
      gradient: "purple",
      icon: "❤️",
    },
    {
      title: "Profile Views",
      value: stats.profileViews,
      change: `+${stats.profileViewsChange}%`,
      changeType: "positive",
      gradient: "green",
      icon: "👁️",
    },
    {
      title: "Profile Strength",
      value: `${stats.profileStrength}%`,
      change: "Keep improving!",
      changeType: stats.profileStrength > 80 ? "positive" : "neutral",
      gradient: "orange",
      icon: "💪",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {overviewCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <DashboardCard {...card} />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-medium mb-4">Recent Applications</h3>
          {/* Recent applications list component */}
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-medium mb-4">Recommended Jobs</h3>
          {/* Recommended jobs list component */}
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
