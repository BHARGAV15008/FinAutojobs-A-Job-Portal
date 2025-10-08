import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../services/api';

const SecurityManagementTab = () => {
    const [securitySettings, setSecuritySettings] = useState({
        twoFactorAuth: true,
        passwordPolicy: {
            minLength: 8,
            requireUppercase: true,
            requireLowercase: true,
            requireNumbers: true,
            requireSpecialChars: true,
            maxAttempts: 5,
            lockoutDuration: 30
        },
        sessionSettings: {
            timeout: 30,
            maxConcurrentSessions: 3,
            requireReauth: false
        },
        ipWhitelist: [],
        suspiciousActivityThreshold: 5,
        autoBlockSuspiciousIPs: true
    });

    const [securityLogs, setSecurityLogs] = useState([]);
    const [blockedIPs, setBlockedIPs] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchSecurityData();
    }, []);

    const fetchSecurityData = async () => {
        try {
            setLoading(true);
            const [settingsResponse, logsResponse, blockedResponse] = await Promise.all([
                api.get('/admin/security/settings'),
                api.get('/admin/security/logs'),
                api.get('/admin/security/blocked-ips')
            ]);

            setSecuritySettings(settingsResponse.data);
            setSecurityLogs(logsResponse.data);
            setBlockedIPs(blockedResponse.data);
        } catch (error) {
            console.error('Error fetching security data:', error);
            // Mock data
            setSecurityLogs([
                {
                    id: 1,
                    timestamp: '2024-03-22 14:30:25',
                    event: 'Failed Login Attempt',
                    severity: 'high',
                    ip: '192.168.1.100',
                    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                    location: 'Mumbai, India',
                    userId: 'user_123',
                    details: 'Multiple failed login attempts detected'
                },
                {
                    id: 2,
                    timestamp: '2024-03-22 14:25:15',
                    event: 'Suspicious Activity',
                    severity: 'medium',
                    ip: '192.168.1.101',
                    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                    location: 'Delhi, India',
                    userId: null,
                    details: 'Unusual access pattern detected'
                },
                {
                    id: 3,
                    timestamp: '2024-03-22 14:20:42',
                    event: 'Password Changed',
                    severity: 'low',
                    ip: '192.168.1.102',
                    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
                    location: 'Bangalore, India',
                    userId: 'user_456',
                    details: 'User successfully changed password'
                }
            ]);

            setBlockedIPs([
                { ip: '192.168.1.200', blockedAt: '2024-03-20 10:30:00', reason: 'Multiple failed login attempts', attempts: 15 },
                { ip: '192.168.1.201', blockedAt: '2024-03-21 15:45:00', reason: 'Suspicious activity', attempts: 8 },
                { ip: '192.168.1.202', blockedAt: '2024-03-22 09:20:00', reason: 'Brute force attack', attempts: 25 }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const updateSecuritySettings = async () => {
        try {
            await api.put('/admin/security/settings', securitySettings);
            alert('Security settings updated successfully!');
        } catch (error) {
            console.error('Error updating security settings:', error);
            alert('Error updating security settings');
        }
    };

    const blockIP = async (ip) => {
        try {
            await api.post('/admin/security/block-ip', { ip });
            setBlockedIPs(prev => [...prev, {
                ip,
                blockedAt: new Date().toISOString().replace('T', ' ').split('.')[0],
                reason: 'Manually blocked',
                attempts: 0
            }]);
            alert(`IP ${ip} blocked successfully!`);
        } catch (error) {
            console.error('Error blocking IP:', error);
            alert('Error blocking IP');
        }
    };

    const unblockIP = async (ip) => {
        try {
            await api.delete(`/admin/security/unblock-ip/${ip}`);
            setBlockedIPs(prev => prev.filter(blocked => blocked.ip !== ip));
            alert(`IP ${ip} unblocked successfully!`);
        } catch (error) {
            console.error('Error unblocking IP:', error);
            alert('Error unblocking IP');
        }
    };

    const getSeverityColor = (severity) => {
        switch (severity) {
            case 'high':
                return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
            case 'medium':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
            case 'low':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Security Management</h2>
                <button
                    onClick={updateSecuritySettings}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Save Settings
                </button>
            </div>

            {/* Security Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center">
                        <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg">
                            <span className="text-2xl">🚨</span>
                        </div>
                        <div className="ml-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">High Risk Events</h3>
                            <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                                {securityLogs.filter(log => log.severity === 'high').length}
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
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Medium Risk Events</h3>
                            <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                                {securityLogs.filter(log => log.severity === 'medium').length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                            <span className="text-2xl">🔒</span>
                        </div>
                        <div className="ml-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Blocked IPs</h3>
                            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{blockedIPs.length}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <div className="flex items-center">
                        <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                            <span className="text-2xl">🛡️</span>
                        </div>
                        <div className="ml-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Security Score</h3>
                            <p className="text-3xl font-bold text-green-600 dark:text-green-400">95%</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Security Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Security Settings</h3>

                <div className="space-y-6">
                    {/* Two-Factor Authentication */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="text-sm font-medium text-gray-900 dark:text-white">Two-Factor Authentication</h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Require 2FA for all admin accounts</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={securitySettings.twoFactorAuth}
                                onChange={(e) => setSecuritySettings(prev => ({ ...prev, twoFactorAuth: e.target.checked }))}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        </label>
                    </div>

                    {/* Password Policy */}
                    <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Password Policy</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Minimum Length
                                </label>
                                <input
                                    type="number"
                                    value={securitySettings.passwordPolicy.minLength}
                                    onChange={(e) => setSecuritySettings(prev => ({
                                        ...prev,
                                        passwordPolicy: { ...prev.passwordPolicy, minLength: parseInt(e.target.value) }
                                    }))}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Max Login Attempts
                                </label>
                                <input
                                    type="number"
                                    value={securitySettings.passwordPolicy.maxAttempts}
                                    onChange={(e) => setSecuritySettings(prev => ({
                                        ...prev,
                                        passwordPolicy: { ...prev.passwordPolicy, maxAttempts: parseInt(e.target.value) }
                                    }))}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                            </div>
                        </div>

                        <div className="mt-4 space-y-2">
                            {Object.entries(securitySettings.passwordPolicy).filter(([key]) => key.startsWith('require')).map(([key, value]) => (
                                <div key={key} className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600 dark:text-gray-400 capitalize">
                                        {key.replace('require', 'Require ').replace(/([A-Z])/g, ' $1').trim()}
                                    </span>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={value}
                                            onChange={(e) => setSecuritySettings(prev => ({
                                                ...prev,
                                                passwordPolicy: { ...prev.passwordPolicy, [key]: e.target.checked }
                                            }))}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Session Settings */}
                    <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Session Settings</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Session Timeout (minutes)
                                </label>
                                <input
                                    type="number"
                                    value={securitySettings.sessionSettings.timeout}
                                    onChange={(e) => setSecuritySettings(prev => ({
                                        ...prev,
                                        sessionSettings: { ...prev.sessionSettings, timeout: parseInt(e.target.value) }
                                    }))}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Max Concurrent Sessions
                                </label>
                                <input
                                    type="number"
                                    value={securitySettings.sessionSettings.maxConcurrentSessions}
                                    onChange={(e) => setSecuritySettings(prev => ({
                                        ...prev,
                                        sessionSettings: { ...prev.sessionSettings, maxConcurrentSessions: parseInt(e.target.value) }
                                    }))}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Security Logs */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Security Logs</h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Timestamp
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Event
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Severity
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    IP Address
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Location
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {securityLogs.map((log, index) => (
                                <motion.tr
                                    key={log.id}
                                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.1 }}
                                >
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {log.timestamp}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                        {log.event}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSeverityColor(log.severity)}`}>
                                            {log.severity}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                        {log.ip}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {log.location}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                            onClick={() => blockIP(log.ip)}
                                            className="text-red-600 hover:text-red-900 dark:text-red-400 mr-3"
                                        >
                                            Block IP
                                        </button>
                                        <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400">
                                            View Details
                                        </button>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Blocked IPs */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Blocked IP Addresses</h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    IP Address
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Blocked At
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Reason
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Attempts
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                            {blockedIPs.map((blocked, index) => (
                                <motion.tr
                                    key={blocked.ip}
                                    className="hover:bg-gray-50 dark:hover:bg-gray-700"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.1 }}
                                >
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                        {blocked.ip}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                        {blocked.blockedAt}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                        {blocked.reason}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                        {blocked.attempts}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <button
                                            onClick={() => unblockIP(blocked.ip)}
                                            className="text-green-600 hover:text-green-900 dark:text-green-400"
                                        >
                                            Unblock
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

export default SecurityManagementTab;
