import React, { useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { useTheme } from "../../contexts/IntegratedThemeContext";
import { useAuth } from "../../contexts/AuthContext.jsx";
import {
  Home,
  Person,
  Work,
  Description,
  Notifications,
  BarChart,
  Settings,
  Logout,
  Business,
  Group,
  Security,
  ExpandLess,
  ExpandMore,
  Search,
  Star,
  Favorite,
} from "@mui/icons-material";

const DashboardSidebar = ({
  userRole,
  user,
  sidebarOpen,
  setSidebarOpen,
  activeTab,
  activeJobTab,
}) => {
  const [location, setLocation] = useLocation();
  const { darkMode } = useTheme();
  const { logout } = useAuth();
  const [expandedMenus, setExpandedMenus] = useState({});

  const isPathActive = (path, tabId) => {
    if (activeTab && tabId) return activeTab === tabId;
    if (path === `/${userRole}-dashboard`)
      return (
        (location === `/${userRole}-dashboard` || location === "/") &&
        (!activeTab || activeTab === "dashboard")
      );
    return location === path || location.startsWith(path + "/");
  };

  const commonItems = [
    {
      name: "Dashboard",
      icon: <Home />,
      path: `/${userRole}-dashboard`,
      tabId: "dashboard",
      current: isPathActive(`/${userRole}-dashboard`, "dashboard"),
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      color: "#667eea",
    },
  ];

  const getNavigationItems = () => {
    switch (userRole) {
      case "applicant":
        return [
          ...commonItems,
          {
            name: "Profile",
            icon: <Person />,
            path: `/profile`,
            tabId: "profile",
            current: isPathActive("/profile", "profile"),
            gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
            color: "#f093fb",
          },
          {
            name: "Browse Jobs",
            icon: <Work />,
            path: `/jobs`,
            tabId: "jobs",
            current: isPathActive("/jobs", "jobs"),
            submenu: [
              {
                name: "All Jobs",
                icon: <Search fontSize="small" />,
                path: `/jobs`,
                tabId: "jobs",
                gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "#667eea",
              },
              {
                name: "Recommended",
                icon: <Star fontSize="small" />,
                path: `/recommended`,
                tabId: "recommended",
                gradient: "linear-gradient(135deg, #fad961 0%, #f76b1c 100%)",
                color: "#fad961",
              },
              {
                name: "Favorites",
                icon: <Favorite fontSize="small" />,
                path: `/favorites`,
                tabId: "favorites",
                gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
                color: "#fa709a",
              },
            ],
            gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
            color: "#4facfe",
          },
          {
            name: "Applications",
            icon: <Description />,
            path: `/applications`,
            tabId: "applications",
            current: isPathActive("/applications", "applications"),
            gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
            color: "#43e97b",
          },
          {
            name: "Job Alerts",
            icon: <Notifications />,
            path: `/job-alerts`,
            tabId: "job-alerts",
            current: isPathActive("/job-alerts", "job-alerts"),
            gradient:
              "linear-gradient(135deg, #fa8bff 0%, #2bd2ff 90%, #2bff88 100%)",
            color: "#fa8bff",
          },
          {
            name: "Analytics",
            icon: <BarChart />,
            path: `/analytics`,
            tabId: "analytics",
            current: isPathActive("/analytics", "analytics"),
            gradient: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
            color: "#a8edea",
          },
          {
            name: "Settings",
            icon: <Settings />,
            path: `/settings`,
            tabId: "settings",
            current: isPathActive("/settings", "settings"),
            gradient: "linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)",
            color: "#d299c2",
          },
        ];
      case "recruiter":
        return [
          ...commonItems,
          {
            name: "Profile",
            icon: <Person />,
            path: `/profile`,
            tabId: "profile",
            current: isPathActive("/profile", "profile"),
            gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
            color: "#f093fb",
          },
          {
            name: "Post Job",
            icon: <Work />,
            path: `/jobs`,
            tabId: "jobs",
            current: isPathActive("/recruiter-dashboard/jobs", "jobs"),
            gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
            color: "#4facfe",
          },
          {
            name: "Applicants",
            icon: <Group />,
            path: `/applicants`,
            tabId: "applicants",
            current: isPathActive(
              "/recruiter-dashboard/applicants",
              "applicants"
            ),
            gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
            color: "#43e97b",
          },
          {
            name: "Analytics",
            icon: <BarChart />,
            path: `/analytics`,
            tabId: "analytics",
            current: isPathActive(
              "/recruiter-dashboard/analytics",
              "analytics"
            ),
            gradient: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
            color: "#a8edea",
          },
          {
            name: "Settings",
            icon: <Settings />,
            path: `/settings`,
            tabId: "settings",
            current: isPathActive("/recruiter-dashboard/settings", "settings"),
            gradient: "linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)",
            color: "#d299c2",
          },
        ];
      case "admin":
        return [
          ...commonItems,
          {
            name: "Users",
            icon: <Group />,
            path: `/users`,
            tabId: "users",
            current: isPathActive("/admin-dashboard/users"),
            gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
            color: "#10b981",
          },
          {
            name: "OTP Manager",
            icon: <span className="text-xl">🔐</span>,
            path: `/otp`,
            tabId: "otp",
            current: isPathActive("/admin-dashboard/otp"),
            gradient: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
            color: "#8b5cf6",
          },
          {
            name: "Security",
            icon: <Security />,
            path: `/security`,
            tabId: "security",
            current: isPathActive("/admin-dashboard/security"),
            gradient: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
            color: "#ef4444",
          },
          {
            name: "Settings",
            icon: <Settings />,
            path: `/settings`,
            tabId: "settings",
            current: isPathActive("/settings"),
            gradient: "linear-gradient(135deg, #64748b 0%, #475569 100%)",
            color: "#64748b",
          },
        ];
      default:
        return commonItems;
    }
  };

  const navigationItems = getNavigationItems();

  const toggleSubmenu = (itemName) => {
    setExpandedMenus((prev) => ({ ...prev, [itemName]: !prev[itemName] }));
  };

  const handleNavigation = (path, tabId, jobTabId, userTab) => {
    let fullPath;
    const dashboardPrefix = `/${userRole}-dashboard`;
    if (path === `/${userRole}-dashboard`) fullPath = path;
    else if (tabId === "dashboard") fullPath = dashboardPrefix;
    else if (tabId)
      fullPath =
        tabId === "jobs" && jobTabId
          ? `${dashboardPrefix}/${tabId}/${jobTabId}`
          : `${dashboardPrefix}/${tabId}`;
    else fullPath = `${dashboardPrefix}/${path.replace("/", "")}`;

    const navigationEvent = new CustomEvent("dashboardTabChange", {
      detail: { tabId, jobTabId, userTab, path: fullPath },
    });
    window.dispatchEvent(navigationEvent);

    try {
      setLocation(fullPath);
    } catch (error) {
      console.error("Navigation failed:", error);
    }
    if (window.innerWidth < 1024) setSidebarOpen(false);
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-white via-blue-50/30 to-indigo-50/30 dark:bg-gradient-to-b dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 border-r border-gray-200/50 dark:border-gray-700/50 font-sans transition-all duration-300 sidebar shadow-lg">
      {/* Brand */}
      <div className="flex items-center h-16 px-6 border-b border-gray-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <div className="w-9 h-9 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-xl flex items-center justify-center mr-3 shadow-lg shadow-blue-500/30 transform hover:scale-105 transition-transform">
          <span className="text-white font-black text-lg">F</span>
        </div>
        <span className="text-lg font-black text-gray-900 dark:text-white tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent dark:from-blue-400 dark:to-indigo-400">
          FinAutoJobs
        </span>
      </div>

      {/* User Info Card */}
      <div className="p-4 mx-3 mt-4 mb-2 bg-gradient-to-br from-white to-blue-50/50 dark:from-gray-800 dark:to-gray-700/50 rounded-2xl shadow-md border border-blue-100/50 dark:border-gray-700/50 backdrop-blur-sm">
        <div className="flex items-center">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center text-white font-black shadow-lg shadow-blue-500/40 ring-4 ring-white/50 dark:ring-gray-800/50">
            {user?.name?.charAt(0) ||
              user?.firstName?.charAt(0) ||
              user?.email?.charAt(0) ||
              "U"}
          </div>
          <div className="ml-3 overflow-hidden">
            <p className="text-sm font-black text-gray-900 dark:text-white truncate">
              {user?.name ||
                (user?.firstName && user?.lastName
                  ? `${user.firstName} ${user.lastName}`
                  : user?.firstName) ||
                user?.email?.split("@")[0] ||
                "User"}
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400 font-bold capitalize truncate flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2 animate-pulse"></span>
              {userRole}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-2 overflow-y-auto custom-scrollbar">
        {navigationItems.map((item) => (
          <div key={item.name}>
            <motion.button
              className={`
                group w-full flex items-center px-4 py-3.5 text-sm font-black rounded-xl
                transition-all duration-300 relative overflow-hidden
                ${
                  item.current
                    ? "bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 text-white shadow-xl shadow-blue-500/30"
                    : "text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 hover:shadow-md dark:hover:text-white"
                }
              `}
              onClick={() =>
                item.submenu
                  ? toggleSubmenu(item.name)
                  : handleNavigation(item.path, item.tabId)
              }
              whileTap={{ scale: 0.97 }}
              whileHover={{ x: item.current ? 0 : 4 }}
            >
              {/* Active indicator */}
              {item.current && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-xl"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}

              <div
                className="relative flex-shrink-0 mr-3 flex items-center justify-center rounded-xl transition-all duration-300 group-hover:scale-110 group-hover:rotate-3"
                style={{
                  width: "42px",
                  height: "42px",
                  background: item.current
                    ? "rgba(255,255,255,0.2)"
                    : item.gradient,
                  boxShadow: !item.current
                    ? `0 6px 16px ${item.color}50`
                    : "0 4px 12px rgba(0,0,0,0.2)",
                }}
              >
                {React.cloneElement(item.icon, {
                  sx: {
                    fontSize: 22,
                    color: "#ffffff",
                    filter: "drop-shadow(0 2px 6px rgba(0,0,0,0.3))",
                    transition: "all 0.3s ease",
                  },
                })}
              </div>
              <span className="relative flex-1 text-left tracking-tight">
                {item.name}
              </span>

              {/* Shine effect on hover */}
              {!item.current && (
                <motion.div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)",
                  }}
                />
              )}
            </motion.button>

            {/* Submenu */}
            {item.submenu && expandedMenus[item.name] && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="ml-6 pl-4 border-l-2 border-gray-100 dark:border-gray-700 mt-1 space-y-1"
              >
                {item.submenu.map((subItem) => (
                  <button
                    key={subItem.name}
                    className="w-full text-left px-3 py-2 text-xs font-bold text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-white rounded-md transition-colors flex items-center"
                    onClick={() =>
                      handleNavigation(subItem.path, subItem.tabId)
                    }
                  >
                    <div
                      className="mr-3 flex items-center justify-center rounded-lg transition-all duration-300 hover:scale-110"
                      style={{
                        width: "32px",
                        height: "32px",
                        background: subItem.gradient,
                        boxShadow: `0 2px 8px ${subItem.color}40`,
                      }}
                    >
                      {React.cloneElement(subItem.icon, {
                        sx: {
                          fontSize: 16,
                          color: "#ffffff",
                          filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.2))",
                        },
                      })}
                    </div>
                    {subItem.name}
                  </button>
                ))}
              </motion.div>
            )}
          </div>
        ))}
      </nav>

      {/* Footer Actions */}
      <div className="p-4 border-t border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
        <motion.button
          onClick={logout}
          whileHover={{ scale: 1.02, x: 4 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center w-full px-4 py-3 text-sm font-black text-gray-700 hover:text-red-600 bg-gradient-to-r from-red-50 to-rose-50 hover:from-red-100 hover:to-rose-100 dark:from-red-900/20 dark:to-rose-900/20 dark:text-gray-300 dark:hover:text-red-400 rounded-xl transition-all shadow-sm hover:shadow-md"
        >
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center mr-3 shadow-lg shadow-red-500/30">
            <Logout sx={{ fontSize: 18, color: "#ffffff" }} />
          </div>
          Sign Out
        </motion.button>
      </div>
    </div>
  );
};

export default DashboardSidebar;
