import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
    pattern: "mixed", // 'mixed', 'numbers', 'letters', 'custom'
    expiryMinutes: 1440, // 24 hours
    excludeConfusing: true,
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
    if (window.confirm("Delete this OTP record?")) {
      try {
        const response = await api.delete(`/admin/otp/${userId}`);
        if (response.data.success) {
          alert("✅ OTP record deleted");
          await fetchOTPRecords();
          await fetchStats();
        }
      } catch (error) {
        console.error("❌ Error deleting OTP:", error);
        alert("Failed to delete OTP record");
      }
    }
  };

  const handleCleanupExpired = async () => {
    if (window.confirm("Delete all expired OTP records?")) {
      try {
        const response = await api.delete("/admin/otp/cleanup-expired");
        if (response.data.success) {
          alert(`✅ Cleaned up ${response.data.deletedCount} expired records`);
          await fetchOTPRecords();
          await fetchStats();
        }
      } catch (error) {
        console.error("❌ Error cleaning up expired OTPs:", error);
        alert("Failed to cleanup expired records");
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "expired":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "used":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const filteredRecords = otpRecords.filter((record) => {
    const matchesSearch =
      record.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.code?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          OTP Management
        </h2>
        <div className="flex gap-3">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            ⚙️ Settings
          </button>
          <button
            onClick={handleCleanupExpired}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            🗑️ Cleanup Expired
          </button>
        </div>
      </div>

      {/* OTP Settings Panel */}
      {showSettings && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-md shadow-sm border border-gray-200 dark:border-gray-700 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              OTP Configuration
            </h3>
            <button
              onClick={() => setShowSettings(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* OTP Length */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Code Length
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
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Recommended: 9 characters for security
              </p>
            </div>

            {/* Pattern Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Pattern Type
              </label>
              <select
                value={otpSettings.pattern}
                onChange={(e) =>
                  setOtpSettings({ ...otpSettings, pattern: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="mixed">Mixed (Capital-small-number)</option>
                <option value="numbers">Numbers Only</option>
                <option value="letters">Letters Only</option>
                <option value="capitals">Capital Letters + Numbers</option>
                <option value="smalls">Small Letters + Numbers</option>
              </select>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {otpSettings.pattern === "mixed" && "Example: Aa2Bb3"}
                {otpSettings.pattern === "numbers" && "Example: 847293"}
                {otpSettings.pattern === "letters" && "Example: AbCdEf"}
                {otpSettings.pattern === "capitals" && "Example: AB3CD5"}
                {otpSettings.pattern === "smalls" && "Example: ab3cd5"}
              </p>
            </div>

            {/* Expiry Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Expiry Time (minutes)
              </label>
              <input
                type="number"
                min="5"
                max="10080"
                step="5"
                value={otpSettings.expiryMinutes}
                onChange={(e) =>
                  setOtpSettings({
                    ...otpSettings,
                    expiryMinutes: parseInt(e.target.value),
                  })
                }
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {otpSettings.expiryMinutes >= 1440
                  ? `${Math.round(otpSettings.expiryMinutes / 1440)} day(s)`
                  : otpSettings.expiryMinutes >= 60
                  ? `${Math.round(otpSettings.expiryMinutes / 60)} hour(s)`
                  : `${otpSettings.expiryMinutes} minute(s)`}
              </p>
            </div>

            {/* Exclude Confusing Characters */}
            <div>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={otpSettings.excludeConfusing}
                  onChange={(e) =>
                    setOtpSettings({
                      ...otpSettings,
                      excludeConfusing: e.target.checked,
                    })
                  }
                  className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Exclude Confusing Characters
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Excludes: I, O, i, l, o, 0, 1
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Preview */}
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Preview Pattern:
            </p>
            <div className="font-mono text-2xl text-purple-600 dark:text-purple-400">
              {otpSettings.pattern === "mixed" && "Kd3Mf7Rb2"}
              {otpSettings.pattern === "numbers" && "847293"}
              {otpSettings.pattern === "letters" && "KdMfRb"}
              {otpSettings.pattern === "capitals" && "KD3MF7"}
              {otpSettings.pattern === "smalls" && "kd3mf7"}
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => setShowSettings(false)}
              className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveSettings}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Save Settings
            </button>
          </div>
        </motion.div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <span className="text-2xl">📊</span>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total OTPs
              </h3>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.total}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
              <span className="text-2xl">✅</span>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Active
              </h3>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {stats.active}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg">
              <span className="text-2xl">⏰</span>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Expired
              </h3>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {stats.expired}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <span className="text-2xl">✔️</span>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Used
              </h3>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {stats.used}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by email, name, or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="expired">Expired</option>
          <option value="used">Used</option>
        </select>
      </div>

      {/* OTP Records Table */}
      <div className="bg-white dark:bg-gray-800 rounded-md shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Expires
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-4 text-center text-gray-500 dark:text-gray-400"
                  >
                    No OTP records found
                  </td>
                </tr>
              ) : (
                filteredRecords.map((record) => (
                  <motion.tr
                    key={record.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {record.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {record.email}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <code className="text-sm font-mono bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded">
                        {record.code}
                      </code>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {record.type || "Email"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          record.status
                        )}`}
                      >
                        {record.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {record.expiresAt}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {record.status === "active" && (
                        <button
                          onClick={() =>
                            handleResendOTP(record.userId, record.email)
                          }
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 mr-3"
                        >
                          Resend
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteOTP(record.userId)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400"
                      >
                        Delete
                      </button>
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
