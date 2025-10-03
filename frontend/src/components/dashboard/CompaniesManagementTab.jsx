import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../services/api';

const CompaniesManagementTab = () => {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedCompany, setSelectedCompany] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchCompanies();
    }, []);

    const fetchCompanies = async () => {
        try {
            setLoading(true);
            const response = await api.get('/admin/companies');
            setCompanies(response.data);
        } catch (error) {
            console.error('Error fetching companies:', error);
            // Fallback to mock data
            setCompanies([
                {
                    id: 1,
                    name: 'TechCorp Solutions',
                    email: 'hr@techcorp.com',
                    industry: 'Technology',
                    size: '100-500',
                    status: 'verified',
                    joinDate: '2024-01-15',
                    jobsPosted: 25,
                    applicationsReceived: 150,
                    verifiedAt: '2024-01-20'
                },
                {
                    id: 2,
                    name: 'StartupXYZ',
                    email: 'careers@startupxyz.com',
                    industry: 'Fintech',
                    size: '10-50',
                    status: 'pending',
                    joinDate: '2024-02-10',
                    jobsPosted: 8,
                    applicationsReceived: 45,
                    verifiedAt: null
                },
                {
                    id: 3,
                    name: 'WebSolutions Inc',
                    email: 'jobs@websolutions.com',
                    industry: 'Web Development',
                    size: '50-100',
                    status: 'verified',
                    joinDate: '2024-01-25',
                    jobsPosted: 15,
                    applicationsReceived: 89,
                    verifiedAt: '2024-01-30'
                }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyCompany = async (companyId) => {
        try {
            await api.post(`/admin/companies/${companyId}/verify`);
            setCompanies(prev => prev.map(company =>
                company.id === companyId
                    ? { ...company, status: 'verified', verifiedAt: new Date().toISOString().split('T')[0] }
                    : company
            ));
            alert('Company verified successfully!');
        } catch (error) {
            console.error('Error verifying company:', error);
            alert('Error verifying company');
        }
    };

    const handleSuspendCompany = async (companyId) => {
        try {
            await api.post(`/admin/companies/${companyId}/suspend`);
            setCompanies(prev => prev.map(company =>
                company.id === companyId
                    ? { ...company, status: 'suspended' }
                    : company
            ));
            alert('Company suspended successfully!');
        } catch (error) {
            console.error('Error suspending company:', error);
            alert('Error suspending company');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'verified':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'suspended':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
        }
    };

    const filteredCompanies = companies.filter(company => {
        const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            company.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || company.status === filterStatus;
        return matchesSearch && matchesStatus;
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
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Companies Management</h2>
                <div className="flex space-x-3">
                    <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                        Verify All Pending
                    </button>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        Export Data
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                            <span className="text-2xl">🏢</span>
                        </div>
                        <div className="ml-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Total Companies</h3>
                            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{companies.length}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center">
                        <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                            <span className="text-2xl">✅</span>
                        </div>
                        <div className="ml-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Verified</h3>
                            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                                {companies.filter(c => c.status === 'verified').length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center">
                        <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                            <span className="text-2xl">⏳</span>
                        </div>
                        <div className="ml-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Pending</h3>
                            <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                                {companies.filter(c => c.status === 'pending').length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center">
                        <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                            <span className="text-2xl">💼</span>
                        </div>
                        <div className="ml-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Total Jobs</h3>
                            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                                {companies.reduce((sum, c) => sum + c.jobsPosted, 0)}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Search Companies
                        </label>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by name or email..."
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
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
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
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(company.status)}`}>
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
                                        {company.status === 'pending' && (
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
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Name:</label>
                                    <p className="text-gray-900 dark:text-white">{selectedCompany.name}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email:</label>
                                    <p className="text-gray-900 dark:text-white">{selectedCompany.email}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Industry:</label>
                                    <p className="text-gray-900 dark:text-white">{selectedCompany.industry}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Size:</label>
                                    <p className="text-gray-900 dark:text-white">{selectedCompany.size}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Jobs Posted:</label>
                                    <p className="text-gray-900 dark:text-white">{selectedCompany.jobsPosted}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Applications Received:</label>
                                    <p className="text-gray-900 dark:text-white">{selectedCompany.applicationsReceived}</p>
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
