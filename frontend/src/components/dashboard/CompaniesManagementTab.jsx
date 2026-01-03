import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../services/api";
import {
  Building2,
  Search,
  Filter,
  Download,
  Check,
  X,
  Eye,
  Edit,
  Trash2,
  MessageSquare,
  Ban,
  CheckCircle,
  Clock,
  AlertCircle,
  Users,
  Briefcase,
  TrendingUp,
  Star,
  MapPin,
  Globe,
  Mail,
  Phone,
} from "lucide-react";

const CompaniesManagementTab = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterVerified, setFilterVerified] = useState("all");
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [verificationModal, setVerificationModal] = useState(false);
  const [verificationNotes, setVerificationNotes] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchCompanies();
  }, [filterStatus, filterVerified]);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterStatus !== "all") params.append("status", filterStatus);
      if (filterVerified !== "all") params.append("verified", filterVerified);

      const response = await api.get(
        `/companies/admin/all?${params.toString()}`
      );
      setCompanies(response.data.companies || []);
    } catch (error) {
      console.error("Error fetching companies:", error);
      // Fallback to empty array
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCompany = async (companyId) => {
    try {
      setActionLoading(true);
      await api.put(`/companies/admin/${companyId}/verify`, {
        notes: verificationNotes,
      });
      alert("Company verified successfully!");
      fetchCompanies();
      setVerificationModal(false);
      setVerificationNotes("");
    } catch (error) {
      console.error("Error verifying company:", error);
      alert(error.response?.data?.message || "Error verifying company");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectCompany = async (companyId, reason) => {
    try {
      setActionLoading(true);
      await api.put(`/companies/admin/${companyId}/reject`, { reason });
      alert("Company verification rejected");
      fetchCompanies();
      setShowModal(false);
    } catch (error) {
      console.error("Error rejecting company:", error);
      alert(error.response?.data?.message || "Error rejecting company");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSuspendCompany = async (companyId, reason) => {
    try {
      setActionLoading(true);
      await api.put(`/companies/admin/${companyId}/suspend`, { reason });
      alert("Company suspended successfully!");
      fetchCompanies();
      setShowModal(false);
    } catch (error) {
      console.error("Error suspending company:", error);
      alert(error.response?.data?.message || "Error suspending company");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCompany = async (companyId) => {
    if (
      !confirm(
        "Are you sure you want to delete this company? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      setActionLoading(true);
      await api.delete(`/companies/admin/${companyId}`);
      alert("Company deleted successfully!");
      fetchCompanies();
      setShowModal(false);
    } catch (error) {
      console.error("Error deleting company:", error);
      alert(error.response?.data?.message || "Error deleting company");
    } finally {
      setActionLoading(false);
    }
  };

  const exportData = () => {
    const csvContent = [
      ["Name", "Email", "Industry", "Size", "Status", "Verified", "Join Date"],
      ...companies.map((c) => [
        c.name,
        c.email,
        c.industry,
        c.size,
        c.status,
        c.verificationStatus?.isVerified ? "Yes" : "No",
        new Date(c.createdAt).toLocaleDateString(),
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `companies-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const getStatusColor = (status) => {
    const colors = {
      active:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
      pending:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      suspended: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      rejected: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
      inactive: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
    };
    return colors[status] || colors.inactive;
  };

  const getStatusIcon = (status) => {
    const icons = {
      active: <CheckCircle size={16} className="text-green-600" />,
      pending: <Clock size={16} className="text-yellow-600" />,
      suspended: <Ban size={16} className="text-red-600" />,
      rejected: <X size={16} className="text-gray-600" />,
    };
    return icons[status];
  };

  const filteredCompanies = companies.filter((company) => {
    const matchesSearch =
      company.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      company.industry?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const stats = {
    total: companies.length,
    verified: companies.filter((c) => c.verificationStatus?.isVerified).length,
    pending: companies.filter((c) => c.status === "pending").length,
    suspended: companies.filter((c) => c.status === "suspended").length,
    totalJobs: companies.reduce(
      (sum, c) => sum + (c.stats?.totalJobsPosted || 0),
      0
    ),
  };

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
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Companies Management
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage and verify company registrations
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => fetchCompanies()}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <TrendingUp size={18} />
            Refresh
          </button>
          <button
            onClick={exportData}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Download size={18} />
            Export Data
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <motion.div
          className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">
                Total Companies
              </p>
              <p className="text-3xl font-bold mt-2">{stats.total}</p>
            </div>
            <Building2 size={40} className="opacity-80" />
          </div>
        </motion.div>

        <motion.div
          className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Verified</p>
              <p className="text-3xl font-bold mt-2">{stats.verified}</p>
            </div>
            <CheckCircle size={40} className="opacity-80" />
          </div>
        </motion.div>

        <motion.div
          className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg p-6 text-white"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm font-medium">Pending</p>
              <p className="text-3xl font-bold mt-2">{stats.pending}</p>
            </div>
            <Clock size={40} className="opacity-80" />
          </div>
        </motion.div>

        <motion.div
          className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg p-6 text-white"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100 text-sm font-medium">Suspended</p>
              <p className="text-3xl font-bold mt-2">{stats.suspended}</p>
            </div>
            <Ban size={40} className="opacity-80" />
          </div>
        </motion.div>

        <motion.div
          className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white"
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Total Jobs</p>
              <p className="text-3xl font-bold mt-2">{stats.totalJobs}</p>
            </div>
            <Briefcase size={40} className="opacity-80" />
          </div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search Companies
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or email... (auto-search enabled)"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Filter by Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="verified">Verified</option>
              <option value="pending">Pending</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      {/* Companies Table */}
      <div className="bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Companies ({filteredCompanies.length})
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Industry
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Jobs Posted
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Join Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredCompanies.map((company, index) => (
                <motion.tr
                  key={company.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {company.name}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {company.email}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {company.industry}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {company.size}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        company.status
                      )}`}
                    >
                      {company.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {company.jobsPosted}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {company.joinDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {company.status === "pending" && (
                      <button
                        onClick={() => handleVerifyCompany(company.id)}
                        className="text-green-600 hover:text-green-900 dark:text-green-400 mr-3"
                      >
                        Verify
                      </button>
                    )}
                    <button
                      onClick={() => handleSuspendCompany(company.id)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 mr-3"
                    >
                      Suspend
                    </button>
                    <button
                      onClick={() => {
                        setSelectedCompany(company);
                        setShowModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400"
                    >
                      View
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Company Details Modal */}
      {showModal && selectedCompany && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Company Details
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Name:
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {selectedCompany.name}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email:
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {selectedCompany.email}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Industry:
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {selectedCompany.industry}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Size:
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {selectedCompany.size}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Jobs Posted:
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {selectedCompany.jobsPosted}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Applications Received:
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {selectedCompany.applicationsReceived}
                  </p>
                </div>
              </div>
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompaniesManagementTab;
