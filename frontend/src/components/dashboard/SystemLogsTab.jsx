import React, { useState } from 'react';
import { motion } from 'framer-motion';

const SystemLogsTab = () => {
    const [logs, setLogs] = useState([
        {
            id: 1,
            timestamp: '2024-03-22 14:30:25',
            level: 'INFO',
            message: 'User john.doe@example.com logged in successfully',
            source: 'Authentication',
            userId: 'user_123',
            ip: '192.168.1.100'
        },
        {
            id: 2,
            timestamp: '2024-03-22 14:28:15',
            level: 'WARNING',
            message: 'Failed login attempt for admin@finautojobs.com',
            source: 'Authentication',
            userId: null,
            ip: '192.168.1.101'
        },
        {
            id: 3,
            timestamp: '2024-03-22 14:25:42',
            level: 'ERROR',
            message: 'Database connection timeout',
            source: 'Database',
            userId: null,
            ip: null
        },
        {
            id: 4,
            timestamp: '2024-03-22 14:20:18',
            level: 'INFO',
            message: 'Job posting created: Senior Frontend Developer',
            source: 'Job Management',
            userId: 'recruiter_456',
            ip: '192.168.1.102'
        },
        {
            id: 5,
            timestamp: '2024-03-22 14:15:33',
            level: 'INFO',
            message: 'User profile updated: sarah.johnson@techcorp.com',
            source: 'User Management',
            userId: 'user_789',
            ip: '192.168.1.103'
        }
    ]);

    const [filter, setFilter] = useState({
        level: 'all',
        source: 'all',
        search: ''
    });

    const getLevelColor = (level) => {
        switch (level) {
            case 'ERROR':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            case 'WARNING':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'INFO':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
            case 'DEBUG':
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
        }
    };

    const filteredLogs = logs.filter(log => {
        const matchesLevel = filter.level === 'all' || log.level === filter.level;
        const matchesSource = filter.source === 'all' || log.source === filter.source;
        const matchesSearch = filter.search === '' ||
            log.message.toLowerCase().includes(filter.search.toLowerCase()) ||
            log.source.toLowerCase().includes(filter.search.toLowerCase());

        return matchesLevel && matchesSource && matchesSearch;
    });

    const exportLogs = () => {
        const csvContent = [
            'Timestamp,Level,Source,Message,User ID,IP',
            ...filteredLogs.map(log =>
                `"${log.timestamp}","${log.level}","${log.source}","${log.message}","${log.userId || ''}","${log.ip || ''}"`
            )
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `system_logs_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">System Logs</h2>
                <div className="flex space-x-3">
                    <button
                        onClick={exportLogs}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                        Export Logs
                    </button>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                        Refresh
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Filters</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Log Level
                        </label>
                        <select
                            value={filter.level}
                            onChange={(e) => setFilter(prev => ({ ...prev, level: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                            <option value="all">All Levels</option>
                            <option value="ERROR">Error</option>
                            <option value="WARNING">Warning</option>
                            <option value="INFO">Info</option>
                            <option value="DEBUG">Debug</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Source
                        </label>
                        <select
                            value={filter.source}
                            onChange={(e) => setFilter(prev => ({ ...prev, source: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                            <option value="all">All Sources</option>
                            <option value="Authentication">Authentication</option>
                            <option value="Database">Database</option>
                            <option value="Job Management">Job Management</option>
                            <option value="User Management">User Management</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Search
                        </label>
                        <input
                            type="text"
                            value={filter.search}
                            onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))}
                            placeholder="Search logs..."
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                    </div>
                </div>
            </div>

            {/* Log Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center">
                        <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg">
                            <span className="text-2xl">❌</span>
                        </div>
                        <div className="ml-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Errors</h3>
                            <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                                {logs.filter(log => log.level === 'ERROR').length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center">
                        <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                            <span className="text-2xl">⚠️</span>
                        </div>
                        <div className="ml-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Warnings</h3>
                            <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                                {logs.filter(log => log.level === 'WARNING').length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                            <span className="text-2xl">ℹ️</span>
                        </div>
                        <div className="ml-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Info</h3>
                            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                                {logs.filter(log => log.level === 'INFO').length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center">
                        <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                            <span className="text-2xl">📊</span>
                        </div>
                        <div className="ml-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Total</h3>
                            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                                {logs.length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Logs Table */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        System Logs ({filteredLogs.length} entries)
                    </h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Timestamp
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Level
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Source
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Message
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    User ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    IP Address
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {filteredLogs.map((log, index) => (
                                <motion.tr
                                    key={log.id}
                                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                >
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {log.timestamp}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLevelColor(log.level)}`}>
                                            {log.level}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                        {log.source}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white max-w-xs truncate">
                                        {log.message}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {log.userId || '-'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {log.ip || '-'}
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SystemLogsTab;
