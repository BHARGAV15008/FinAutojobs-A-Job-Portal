import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../contexts/IntegratedThemeContext";
import { useDashboard } from "../../contexts/RealDashboardContext";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { useLocation } from "wouter";
import { useRealTimeNotifications } from "../../hooks/useRealTimeNotifications";
import { Search, Notifications, Menu, Settings, Person, Logout, Brightness4, Brightness7 } from "@mui/icons-material";

const DashboardHeader = ({
  title,
  user,
  sidebarOpen,
  setSidebarOpen,
  notificationPanelOpen,
  setNotificationPanelOpen,
  showBreadcrumbs,
  breadcrumbs,
}) => {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);

  const { darkMode, toggleTheme } = useTheme();
  const { dashboardData } = useDashboard();
  const { logout } = useAuth();
  const [, setLocation] = useLocation();

  const { 
    isConnected: isNotificationConnected, 
    notifications: realTimeNotifications,
    unreadCount: realTimeUnreadCount 
  } = useRealTimeNotifications();

  const notifications = dashboardData?.notifications || [];
  const profileDropdownRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setProfileDropdownOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search logic (kept same for functionality)
  const searchJobs = async (query) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://192.168.41.134:5000/api'}/jobs?search=${encodeURIComponent(query)}&limit=10`);
      if (!response.ok) throw new Error("Search failed");
      const data = await response.json();
      return data.success ? (data.data?.jobs || data.jobs || []) : [];
    } catch (error) {
      if (dashboardData?.recentJobs) {
        return dashboardData.recentJobs.filter(job => 
          job.jobTitle?.toLowerCase().includes(query.toLowerCase()) ||
          job.companyName?.toLowerCase().includes(query.toLowerCase())
        );
      }
      return [];
    }
  };

  const handleSearch = async (query = searchQuery) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }
    const results = await searchJobs(query);
    setSearchResults(results.slice(0, 5));
    setShowSearchResults(true);
  };

  useEffect(() => {
    if (searchQuery.trim()) {
      const timeoutId = setTimeout(() => handleSearch(), 500);
      return () => clearTimeout(timeoutId);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  }, [searchQuery]);

  const handleProfileAction = (action) => {
    setProfileDropdownOpen(false);
    switch (action) {
      case "profile": setLocation(`/${user?.role || "applicant"}-dashboard/profile`); break;
      case "settings": setLocation(`/${user?.role || "applicant"}-dashboard/settings`); break;
      case "logout": logout(); break;
    }
  };

  const unreadNotifications = realTimeUnreadCount + (Array.isArray(notifications) ? notifications.filter((n) => !n.read).length : 0);

  return (
    <header className="bg-gradient-to-r from-white via-blue-50/20 to-indigo-50/20 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 h-16 shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50 border-b border-gray-200/50 dark:border-gray-700/50 transition-all duration-300 z-30 backdrop-blur-sm">
      <div className="h-full px-6 flex items-center justify-between gap-4">
        
        {/* Left: Mobile Toggle & Title */}
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="lg:hidden p-2.5 -ml-2 rounded-xl text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white hover:bg-white dark:hover:bg-gray-800 transition-all shadow-sm hover:shadow-md"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu fontSize="small" />
          </motion.button>
          
          <div className="hidden sm:block">
             <h1 className="text-lg font-black bg-gradient-to-r from-gray-900 via-blue-800 to-indigo-800 dark:from-white dark:via-blue-200 dark:to-indigo-200 bg-clip-text text-transparent tracking-tight">{title}</h1>
             {showBreadcrumbs && breadcrumbs.length > 0 && (
               <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-1 font-bold">
                 {breadcrumbs.map((crumb, idx) => (
                   <span key={idx} className="flex items-center">
                     {idx > 0 && <span className="mx-1 opacity-30 text-gray-400 dark:text-gray-500">•</span>}
                     <span className={idx === breadcrumbs.length - 1 ? "text-blue-600 dark:text-blue-400 font-black" : "cursor-pointer hover:text-gray-700 dark:hover:text-gray-300 transition-colors"}>
                       {crumb.name}
                     </span>
                   </span>
                 ))}
               </div>
             )}
          </div>
        </div>

        {/* Center: Search Bar */}
        <div className="flex-1 max-w-xl mx-auto hidden md:block relative" ref={searchRef}>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
              <Search sx={{ fontSize: 18, color: '#94a3b8' }} className="group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400 transition-colors" />
            </div>
            <input
              type="text"
              className="block w-full pl-11 pr-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-200/50 dark:border-gray-700/50 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 dark:focus:border-blue-400 transition-all shadow-sm focus:shadow-md"
              placeholder="Search jobs, candidates, applications..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            {/* Search highlight effect */}
            <div className="absolute inset-0 rounded-xl opacity-0 group-focus-within:opacity-100 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 pointer-events-none transition-opacity"></div>
          </div>
          
          {/* Search Dropdown */}
          <AnimatePresence>
            {showSearchResults && searchResults.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-md shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50"
              >
                {searchResults.map((job) => (
                  <button
                    key={job._id || job.id}
                    onClick={() => {
                      setShowSearchResults(false);
                      setSearchQuery("");
                      setLocation(`/jobs/${job._id || job.id}`);
                    }}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 flex items-center gap-3 transition-colors border-b border-gray-50 dark:border-gray-700 last:border-0"
                  >
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                      {(job.companyName || job.company || "C").charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900 dark:text-white">{job.jobTitle || job.title}</div>
                      <div className="text-xs text-gray-500">{job.companyName || job.company}</div>
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <motion.button 
            whileHover={{ scale: 1.05, rotate: 15 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleTheme}
            className="p-2.5 rounded-xl text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white bg-white hover:bg-gradient-to-br hover:from-yellow-50 hover:to-orange-50 dark:bg-gray-800 dark:hover:from-gray-700 dark:hover:to-gray-600 transition-all shadow-sm hover:shadow-md"
          >
            {darkMode ? <Brightness7 sx={{ fontSize: 19 }} /> : <Brightness4 sx={{ fontSize: 19 }} />}
          </motion.button>

          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setNotificationPanelOpen(!notificationPanelOpen)}
            className="p-2.5 rounded-xl text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white bg-white hover:bg-gradient-to-br hover:from-blue-50 hover:to-indigo-50 dark:bg-gray-800 dark:hover:from-gray-700 dark:hover:to-gray-600 transition-all shadow-sm hover:shadow-md relative"
          >
            <Notifications sx={{ fontSize: 19 }} />
            {unreadNotifications > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-gradient-to-br from-red-500 to-rose-600 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-lg shadow-red-500/40 ring-2 ring-white dark:ring-gray-900"
              >
                {unreadNotifications > 9 ? '9+' : unreadNotifications}
              </motion.span>
            )}
          </motion.button>

          <div className="relative" ref={profileDropdownRef}>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl bg-white dark:bg-gray-800 hover:shadow-md transition-all border-2 border-gray-200/50 dark:border-gray-700/50 hover:border-blue-300 dark:hover:border-blue-600"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30 overflow-hidden ring-2 ring-white/50 dark:ring-gray-800/50">
                   {user?.profile_picture ? (
                     <img src={user.profile_picture} alt="User" className="w-full h-full object-cover" />
                   ) : (
                     <span className="font-black text-white text-xs">
                       {user?.name?.charAt(0) || user?.firstName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                     </span>
                   )}
              </div>
              <div className="hidden md:block text-left">
                <div className="text-xs font-black text-gray-900 dark:text-white leading-tight tracking-tight">
                  {user?.name?.split(' ')[0] || user?.firstName || user?.email?.split('@')[0] || 'User'}
                </div>
                <div className="text-[10px] font-bold text-gray-500 dark:text-gray-400">View Profile</div>
              </div>
            </motion.button>

            <AnimatePresence>
              {profileDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-md shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50"
                >
                  <div className="p-2 space-y-1">
                    <button onClick={() => handleProfileAction("profile")} className="w-full px-4 py-2.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md flex items-center gap-3 transition-colors">
                      <Person fontSize="small" /> Profile
                    </button>
                    <button onClick={() => handleProfileAction("settings")} className="w-full px-4 py-2.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md flex items-center gap-3 transition-colors">
                      <Settings fontSize="small" /> Settings
                    </button>
                    <div className="h-px bg-gray-100 dark:bg-gray-700 my-1 mx-2"></div>
                    <button onClick={() => handleProfileAction("logout")} className="w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-md flex items-center gap-3 transition-colors">
                      <Logout fontSize="small" /> Logout
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
