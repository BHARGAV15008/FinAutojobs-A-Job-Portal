import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../services/api";

const OTPManagementTab = () => {
  const [otpRecords, setOtpRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    expired: 0,
    used: 0,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showSettings, setShowSettings] = useState(false);
  const [otpSettings, setOtpSettings] = useState({
    length: 9,
    pattern: "mixed",
    expiryMinutes: 1440,
    excludeConfusing: true,
    maxRequestsPerHour: 5,
    requestCooldown: 60,
    blockAfterFailures: 10,
    blockDuration: 60,
  });

  useEffect(() => {
    fetchOTPRecords();
    fetchStats();
    fetchOTPSettings();
  }, [filterStatus]);

  const fetchOTPRecords = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterStatus !== "all") {
        params.append("status", filterStatus);
      }

      const response = await api.get(`/admin/otp/records?${params.toString()}`);

      if (response.data.success) {
        setOtpRecords(response.data.data || []);
      }
    } catch (error) {
      console.error("❌ Error fetching OTP records:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get("/admin/otp/stats");
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error("❌ Error fetching OTP stats:", error);
    }
  };

  const fetchOTPSettings = async () => {
    try {
      const response = await api.get("/admin/otp/settings");
      if (response.data.success) {
        setOtpSettings(response.data.data);
      }
    } catch (error) {
      console.error("❌ Error fetching OTP settings:", error);
    }
  };

  const handleSaveSettings = async () => {
    try {
      const response = await api.put("/admin/otp/settings", otpSettings);
      if (response.data.success) {
        alert("✅ OTP settings saved successfully!");
        setShowSettings(false);
      }
    } catch (error) {
      console.error("❌ Error saving OTP settings:", error);
      alert("Failed to save OTP settings");
    }
  };

  const handleResendOTP = async (userId, email) => {
    if (window.confirm(`Resend verification code to ${email}?`)) {
      try {
        const response = await api.post(
          `/admin/users/${userId}/resend-verification`
        );
        if (response.data.success) {
          alert(`✅ Verification code sent to ${email}`);
          await fetchOTPRecords();
          await fetchStats();
        }
      } catch (error) {
        console.error("❌ Error resending OTP:", error);
        alert("Failed to resend verification code");
      }
    }
  };

  const handleDeleteOTP = async (userId) => {
    if (window.confirm("Delete this verification code?")) {
      try {
        const response = await api.delete(`/admin/otp/${userId}`);
        if (response.data.success) {
          alert("✅ OTP deleted successfully");
          await fetchOTPRecords();
          await fetchStats();
        }
      } catch (error) {
        console.error("❌ Error deleting OTP:", error);
        alert("Failed to delete OTP");
      }
    }
  };

  const handleCleanupExpired = async () => {
    if (window.confirm("Clean up all expired verification codes?")) {
      try {
        const response = await api.delete("/admin/otp/cleanup-expired");
        if (response.data.success) {
          alert(
            `✅ Cleaned up ${
              response.data.data.deletedCount || 0
            } expired codes`
          );
          await fetchOTPRecords();
          await fetchStats();
        }
      } catch (error) {
        console.error("❌ Error cleaning up expired OTPs:", error);
        alert("Failed to cleanup expired codes");
      }
    }
  };

  const getExpiryDisplay = (minutes) => {
    if (minutes < 60) return `${minutes} minutes`;
    if (minutes < 1440) return `${Math.round(minutes / 60)} hours`;
    return `${Math.round(minutes / 1440)} days`;
  };

  const filteredRecords = otpRecords.filter((record) => {
    const matchesSearch =
      record.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.verificationCode?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="relative">
          <div className="animate-spin rounded-full h-20 w-20 border-t-4 border-b-4 border-purple-600"></div>
          <div className="absolute inset-0 animate-ping rounded-full h-20 w-20 border-4 border-purple-400 opacity-20"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-3xl">🔐</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-1">
      {/* Modern Header with Gradient */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 rounded-3xl shadow-2xl p-8"
      >
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white opacity-5 rounded-full -ml-32 -mb-32"></div>
        <div className="absolute top-1/2 right-1/4 w-32 h-32 bg-white opacity-10 rounded-full blur-3xl"></div>

        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl">
              <span className="text-5xl">🔐</span>
            </div>
            <div>
              <h2 className="text-4xl font-black text-white mb-2 tracking-tight">
                OTP Management
              </h2>
              <p className="text-purple-100 text-lg font-medium">
                Manage verification codes and security settings
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <motion.button
              onClick={() => setShowSettings(!showSettings)}
              className="px-6 py-3 bg-white/20 backdrop-blur-md text-white rounded-xl hover:bg-white/30 transition-all flex items-center gap-2 shadow-lg border border-white/10"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-2xl">⚙️</span>
              <span className="font-bold">Settings</span>
            </motion.button>
            <motion.button
              onClick={handleCleanupExpired}
              className="px-6 py-3 bg-red-500/90 backdrop-blur-md text-white rounded-xl hover:bg-red-600 transition-all flex items-center gap-2 shadow-lg"
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-2xl">🗑️</span>
              <span className="font-bold">Cleanup</span>
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          {
            label: "Total OTPs",
            value: stats.total,
            icon: "📊",
            gradient: "from-blue-500 to-cyan-500",
            iconBg: "bg-blue-500",
          },
          {
            label: "Active",
            value: stats.active,
            icon: "✅",
            gradient: "from-green-500 to-emerald-500",
            iconBg: "bg-green-500",
          },
          {
            label: "Expired",
            value: stats.expired,
            icon: "⏰",
            gradient: "from-orange-500 to-red-500",
            iconBg: "bg-orange-500",
          },
          {
            label: "Used",
            value: stats.used,
            icon: "🔓",
            gradient: "from-purple-500 to-pink-500",
            iconBg: "bg-purple-500",
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`relative overflow-hidden bg-gradient-to-br ${stat.gradient} rounded-2xl p-6 shadow-xl`}
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-16 -mt-16"></div>
            <div className="relative flex items-center justify-between">
              <div>
                <p className="text-white/80 font-semibold mb-1">{stat.label}</p>
                <p className="text-4xl font-black text-white">
                  {stat.value || 0}
                </p>
              </div>
              <div
                className={`${stat.iconBg}/20 backdrop-blur-sm p-4 rounded-2xl`}
              >
                <span className="text-4xl">{stat.icon}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-purple-200 dark:border-purple-800 p-8"
          >
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-3xl font-black bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-3">
                <span className="text-4xl">🛠️</span>
                OTP Configuration
              </h3>
              <button
                onClick={() => setShowSettings(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors text-3xl font-bold"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Code Length */}
              <div className="space-y-3">
                <label className="block text-sm font-black text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                  📊 Code Length
                </label>
                <input
                  type="number"
                  min="6"
                  max="15"
                  value={otpSettings.length}
                  onChange={(e) =>
                    setOtpSettings({
                      ...otpSettings,
                      length: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-5 py-4 border-2 border-purple-200 dark:border-purple-700 rounded-2xl focus:ring-4 focus:ring-purple-300 focus:border-purple-500 dark:bg-gray-700 dark:text-white transition-all font-bold text-lg shadow-sm"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2 font-medium">
                  <span>🛡️</span> Recommended: 9 characters for security
                </p>
              </div>

              {/* Pattern Type */}
              <div className="space-y-3">
                <label className="block text-sm font-black text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                  🎨 Pattern Type
                </label>
                <select
                  value={otpSettings.pattern}
                  onChange={(e) =>
                    setOtpSettings({ ...otpSettings, pattern: e.target.value })
                  }
                  className="w-full px-5 py-4 border-2 border-purple-200 dark:border-purple-700 rounded-2xl focus:ring-4 focus:ring-purple-300 focus:border-purple-500 dark:bg-gray-700 dark:text-white transition-all font-bold text-lg shadow-sm"
                >
                  <option value="mixed">Mixed (Capital-small-number)</option>
                  <option value="numbers">Numbers Only</option>
                  <option value="letters">Letters Only</option>
                  <option value="capitals">Capital Letters + Numbers</option>
                  <option value="smalls">Small Letters + Numbers</option>
                </select>
                <p className="text-sm text-purple-600 dark:text-purple-400 font-mono font-black">
                  Preview:{" "}
                  {
                    {
                      mixed: "Aa2Bb3Cc4",
                      numbers: "847293615",
                      letters: "AbCdEfGh",
                      capitals: "AB3CD5EF7",
                      smalls: "ab3cd5ef7",
                    }[otpSettings.pattern]
                  }
                </p>
              </div>

              {/* Expiry Time */}
              <div className="space-y-3">
                <label className="block text-sm font-black text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                  ⏰ Expiry Time (minutes)
                </label>
                <input
                  type="number"
                  min="5"
                  max="10080"
                  value={otpSettings.expiryMinutes}
                  onChange={(e) =>
                    setOtpSettings({
                      ...otpSettings,
                      expiryMinutes: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-5 py-4 border-2 border-purple-200 dark:border-purple-700 rounded-2xl focus:ring-4 focus:ring-purple-300 focus:border-purple-500 dark:bg-gray-700 dark:text-white transition-all font-bold text-lg shadow-sm"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                  Current: {getExpiryDisplay(otpSettings.expiryMinutes)}
                </p>
              </div>

              {/* Exclude Confusing */}
              <div className="space-y-3">
                <label className="block text-sm font-black text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                  🔤 Character Options
                </label>
                <label className="flex items-center gap-3 px-5 py-4 bg-gray-50 dark:bg-gray-700 rounded-2xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-all">
                  <input
                    type="checkbox"
                    checked={otpSettings.excludeConfusing}
                    onChange={(e) =>
                      setOtpSettings({
                        ...otpSettings,
                        excludeConfusing: e.target.checked,
                      })
                    }
                    className="w-6 h-6 text-purple-600 rounded-lg focus:ring-purple-500 focus:ring-2"
                  />
                  <span className="font-bold text-gray-700 dark:text-gray-200">
                    Exclude Confusing Characters
                  </span>
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                  Excludes: I, O, l, o, 0, 1
                </p>
              </div>

              {/* Rate Limiting Section */}
              <div className="col-span-2 pt-6 border-t-2 border-purple-200 dark:border-purple-700">
                <h3 className="text-xl font-black text-purple-600 dark:text-purple-400 mb-4 uppercase tracking-wide">
                  🛡️ Rate Limiting & Security
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Max Requests Per Hour */}
                  <div className="space-y-3">
                    <label className="block text-sm font-black text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                      📊 Max Requests/Hour
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={otpSettings.maxRequestsPerHour}
                      onChange={(e) =>
                        setOtpSettings({
                          ...otpSettings,
                          maxRequestsPerHour: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-5 py-4 border-2 border-purple-200 dark:border-purple-700 rounded-2xl focus:ring-4 focus:ring-purple-300 focus:border-purple-500 dark:bg-gray-700 dark:text-white transition-all font-bold text-lg shadow-sm"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                      Maximum OTP requests per user per hour (1-20)
                    </p>
                  </div>

                  {/* Request Cooldown */}
                  <div className="space-y-3">
                    <label className="block text-sm font-black text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                      ⏱️ Request Cooldown (seconds)
                    </label>
                    <input
                      type="number"
                      min="30"
                      max="300"
                      value={otpSettings.requestCooldown}
                      onChange={(e) =>
                        setOtpSettings({
                          ...otpSettings,
                          requestCooldown: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-5 py-4 border-2 border-purple-200 dark:border-purple-700 rounded-2xl focus:ring-4 focus:ring-purple-300 focus:border-purple-500 dark:bg-gray-700 dark:text-white transition-all font-bold text-lg shadow-sm"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                      Minimum time between requests (30-300 seconds)
                    </p>
                  </div>

                  {/* Block After Failures */}
                  <div className="space-y-3">
                    <label className="block text-sm font-black text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                      🚫 Block After Failures
                    </label>
                    <input
                      type="number"
                      min="3"
                      max="20"
                      value={otpSettings.blockAfterFailures}
                      onChange={(e) =>
                        setOtpSettings({
                          ...otpSettings,
                          blockAfterFailures: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-5 py-4 border-2 border-purple-200 dark:border-purple-700 rounded-2xl focus:ring-4 focus:ring-purple-300 focus:border-purple-500 dark:bg-gray-700 dark:text-white transition-all font-bold text-lg shadow-sm"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                      Block user after this many failed attempts (3-20)
                    </p>
                  </div>

                  {/* Block Duration */}
                  <div className="space-y-3">
                    <label className="block text-sm font-black text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                      🔒 Block Duration (minutes)
                    </label>
                    <input
                      type="number"
                      min="10"
                      max="1440"
                      value={otpSettings.blockDuration}
                      onChange={(e) =>
                        setOtpSettings({
                          ...otpSettings,
                          blockDuration: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-5 py-4 border-2 border-purple-200 dark:border-purple-700 rounded-2xl focus:ring-4 focus:ring-purple-300 focus:border-purple-500 dark:bg-gray-700 dark:text-white transition-all font-bold text-lg shadow-sm"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                      How long to block after failures (10-1440 minutes)
                    </p>
                  </div>
                </div>

                {/* Security Notice */}
                <div className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-2 border-yellow-300 dark:border-yellow-700 rounded-xl">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200 font-bold flex items-start gap-2">
                    <span className="text-xl">⚠️</span>
                    <span>
                      Rate limiting helps prevent abuse and brute-force attacks.
                      Lower values increase security but may inconvenience
                      legitimate users.
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-8">
              <motion.button
                onClick={() => setShowSettings(false)}
                className="px-8 py-4 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-2xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-all font-bold"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Cancel
              </motion.button>
              <motion.button
                onClick={handleSaveSettings}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl hover:from-purple-700 hover:to-indigo-700 transition-all font-bold shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                💾 Save Settings
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search and Filter */}
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-xl p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-2xl">
                🔍
              </span>
              <input
                type="text"
                placeholder="Search by email, name, or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-4 py-4 border-2 border-gray-200 dark:border-gray-600 rounded-2xl focus:ring-4 focus:ring-purple-300 focus:border-purple-500 dark:bg-gray-700 dark:text-white transition-all font-semibold"
              />
            </div>
          </div>
          <div className="flex gap-3">
            {["all", "active", "expired", "used"].map((status) => (
              <motion.button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-6 py-4 rounded-2xl font-bold transition-all ${
                  filterStatus === status
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </motion.button>
            ))}
          </div>
        </div>
      </div>

      {/* OTP Records Table */}
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gradient-to-r from-purple-600 to-indigo-600">
              <tr>
                {["User", "Email", "Code", "Status", "Expires", "Actions"].map(
                  (header) => (
                    <th
                      key={header}
                      className="px-6 py-4 text-left text-xs font-black text-white uppercase tracking-wider"
                    >
                      {header}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <span className="text-6xl">📭</span>
                      <p className="text-xl font-bold text-gray-500 dark:text-gray-400">
                        No OTP records found
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record, index) => (
                  <motion.tr
                    key={record._id || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-purple-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-bold text-gray-900 dark:text-white">
                        {record.name || "N/A"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                        {record.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <code className="px-3 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded-lg font-mono font-bold">
                        {record.verificationCode || "N/A"}
                      </code>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-black ${
                          record.status === "active"
                            ? "bg-green-100 text-green-800"
                            : record.status === "expired"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {record.status || "unknown"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 font-medium">
                      {record.verificationExpiry
                        ? new Date(record.verificationExpiry).toLocaleString()
                        : "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <motion.button
                          onClick={() =>
                            handleResendOTP(
                              record.userId || record._id,
                              record.email
                            )
                          }
                          className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-bold"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          📧 Resend
                        </motion.button>
                        <motion.button
                          onClick={() =>
                            handleDeleteOTP(record.userId || record._id)
                          }
                          className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-bold"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          🗑️ Delete
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OTPManagementTab;
