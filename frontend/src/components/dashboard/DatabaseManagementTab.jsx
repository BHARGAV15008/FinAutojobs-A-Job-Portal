import React, { useState } from 'react';
import { motion } from 'framer-motion';

const DatabaseManagementTab = () => {
    const [tables, setTables] = useState([
        {
            name: 'users',
            records: 1250,
            size: '45.2 MB',
            lastUpdated: '2024-03-22 14:30:25',
            status: 'healthy'
        },
        {
            name: 'jobs',
            records: 420,
            size: '12.8 MB',
            lastUpdated: '2024-03-22 14:28:15',
            status: 'healthy'
        },
        {
            name: 'applications',
            records: 8500,
            size: '156.7 MB',
            lastUpdated: '2024-03-22 14:25:42',
            status: 'healthy'
        },
        {
            name: 'companies',
            records: 85,
            size: '3.2 MB',
            lastUpdated: '2024-03-22 14:20:18',
            status: 'healthy'
        },
        {
            name: 'sessions',
            records: 892,
            size: '8.9 MB',
            lastUpdated: '2024-03-22 14:15:33',
            status: 'warning'
        },
        {
            name: 'notifications',
            records: 12500,
            size: '89.3 MB',
            lastUpdated: '2024-03-22 14:10:25',
            status: 'healthy'
        }
    ]);

    const [backups, setBackups] = useState([
        {
            id: 1,
            name: 'backup_2024_03_22_full.sql',
            size: '312.5 MB',
            createdAt: '2024-03-22 02:00:00',
            type: 'Full Backup',
            status: 'completed'
        },
        {
            id: 2,
            name: 'backup_2024_03_21_incremental.sql',
            size: '45.2 MB',
            createdAt: '2024-03-21 02:00:00',
            type: 'Incremental',
            status: 'completed'
        },
        {
            id: 3,
            name: 'backup_2024_03_20_full.sql',
            size: '298.7 MB',
            createdAt: '2024-03-20 02:00:00',
            type: 'Full Backup',
            status: 'completed'
        }
    ]);

    const [isOptimizing, setIsOptimizing] = useState(false);
    const [isBackingUp, setIsBackingUp] = useState(false);

    const getStatusColor = (status) => {
        switch (status) {
            case 'healthy':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            case 'warning':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'error':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
        }
    };

    const optimizeDatabase = async () => {
        setIsOptimizing(true);
        // Simulate optimization process
        await new Promise(resolve => setTimeout(resolve, 3000));
        setIsOptimizing(false);
        alert('Database optimization completed successfully!');
    };

    const createBackup = async () => {
        setIsBackingUp(true);
        // Simulate backup process
        await new Promise(resolve => setTimeout(resolve, 5000));
        setIsBackingUp(false);
        alert('Database backup created successfully!');
    };

    const restoreBackup = (backupId) => {
        if (window.confirm('Are you sure you want to restore this backup? This will overwrite the current database.')) {
            alert(`Restoring backup ${backupId}...`);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Database Management</h2>
                <div className="flex space-x-3">
                    <button
                        onClick={createBackup}
                        disabled={isBackingUp}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                        {isBackingUp ? 'Creating Backup...' : 'Create Backup'}
                    </button>
                    <button
                        onClick={optimizeDatabase}
                        disabled={isOptimizing}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                        {isOptimizing ? 'Optimizing...' : 'Optimize Database'}
                    </button>
                </div>
            </div>

            {/* Database Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                            <span className="text-2xl">🗄️</span>
                        </div>
                        <div className="ml-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Total Tables</h3>
                            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{tables.length}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center">
                        <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                            <span className="text-2xl">📊</span>
                        </div>
                        <div className="ml-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Total Records</h3>
                            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                                {tables.reduce((sum, table) => sum + table.records, 0).toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center">
                        <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                            <span className="text-2xl">💾</span>
                        </div>
                        <div className="ml-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Database Size</h3>
                            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">316.1 MB</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center">
                        <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                            <span className="text-2xl">⚡</span>
                        </div>
                        <div className="ml-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Performance</h3>
                            <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">98.5%</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Database Tables */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Database Tables</h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Table Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Records
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Size
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Last Updated
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {tables.map((table, index) => (
                                <motion.tr
                                    key={table.name}
                                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.1 }}
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                                            {table.name}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                        {table.records.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                        {table.size}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {table.lastUpdated}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(table.status)}`}>
                                            {table.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 mr-3">
                                            Analyze
                                        </button>
                                        <button className="text-green-600 hover:text-green-900 dark:text-green-400">
                                            Optimize
                                        </button>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Database Backups */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Database Backups</h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Backup Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Type
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Size
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Created
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {backups.map((backup, index) => (
                                <motion.tr
                                    key={backup.id}
                                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.1 }}
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                                            {backup.name}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                        {backup.type}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                        {backup.size}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {backup.createdAt}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(backup.status)}`}>
                                            {backup.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                            onClick={() => restoreBackup(backup.id)}
                                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 mr-3"
                                        >
                                            Restore
                                        </button>
                                        <button className="text-green-600 hover:text-green-900 dark:text-green-400 mr-3">
                                            Download
                                        </button>
                                        <button className="text-red-600 hover:text-red-900 dark:text-red-400">
                                            Delete
                                        </button>
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

export default DatabaseManagementTab;
