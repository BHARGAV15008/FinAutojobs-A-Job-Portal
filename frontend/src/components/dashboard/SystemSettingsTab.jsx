import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { adminAPI } from '../../services/api';

const SystemSettingsTab = () => {
    const [settings, setSettings] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeCategory, setActiveCategory] = useState('general');

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            console.log('🔍 Fetching system settings');
            
            const response = await adminAPI.getSettings();
            console.log('✅ Settings fetched:', response.data);
            
            if (response.data.success) {
                setSettings(response.data.data || {});
            } else {
                throw new Error(response.data.message || 'Failed to fetch settings');
            }
        } catch (error) {
            console.error('❌ Error fetching settings:', error);
            // Fallback to default settings
            setSettings({
                general: {
                    siteName: 'FinAutoJobs',
                    siteDescription: 'Professional Job Portal Platform',
                    contactEmail: 'admin@finautojobs.com',
                    supportEmail: 'support@finautojobs.com',
                    timezone: 'Asia/Kolkata',
                    language: 'en',
                    currency: 'INR'
                },
                system: {
                    maintenanceMode: false,
                    registrationEnabled: true,
                    emailNotifications: true,
                    smsNotifications: false,
                    autoApproveJobs: false,
                    moderationRequired: true,
                    allowGuestViewing: true,
                    enableAnalytics: true
                },
                security: {
                    sessionTimeout: 30,
                    passwordMinLength: 8,
                    requireEmailVerification: true,
                    enableTwoFactor: false,
                    maxLoginAttempts: 5,
                    lockoutDuration: 15,
                    requireStrongPasswords: true,
                    enableCaptcha: false
                },
                fileUpload: {
                    maxFileSize: '10MB',
                    allowedFileTypes: ['pdf', 'doc', 'docx', 'jpg', 'png'],
                    maxFilesPerUser: 10,
                    enableVirusScanning: false,
                    autoDeleteOldFiles: true,
                    fileRetentionDays: 365
                }
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSettingChange = (category, key, value) => {
        setSettings(prev => ({
            ...prev,
            [category]: {
                ...prev[category],
                [key]: value
            }
        }));
    };

    const handleSaveSettings = async (category) => {
        try {
            setSaving(true);
            console.log(`🔍 Saving ${category} settings:`, settings[category]);
            
            const response = await adminAPI.updateSettings({
                category: category,
                settings: settings[category]
            });
            
            if (response.data.success) {
                console.log('✅ Settings saved successfully');
                alert(`${category} settings saved successfully!`);
            } else {
                throw new Error(response.data.message || 'Failed to save settings');
            }
        } catch (error) {
            console.error('❌ Error saving settings:', error);
            alert(`Error saving settings: ${error.response?.data?.message || error.message}`);
        } finally {
            setSaving(false);
        }
    };

    const handleBackupSettings = async () => {
        try {
            console.log('🔍 Creating settings backup');
            
            const response = await adminAPI.createBackup();
            
            if (response.data.success) {
                console.log('✅ Backup created successfully');
                alert('Settings backup created successfully!');
            } else {
                throw new Error(response.data.message || 'Failed to create backup');
            }
        } catch (error) {
            console.error('❌ Error creating backup:', error);
            alert(`Error creating backup: ${error.response?.data?.message || error.message}`);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    const categories = [
        { id: 'general', name: 'General', icon: '⚙️' },
        { id: 'system', name: 'System', icon: '🖥️' },
        { id: 'security', name: 'Security', icon: '🔒' },
        { id: 'fileUpload', name: 'File Upload', icon: '📁' },
        { id: 'notifications', name: 'Notifications', icon: '🔔' },
        { id: 'jobPosting', name: 'Job Posting', icon: '💼' },
        { id: 'applications', name: 'Applications', icon: '📄' }
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">System Settings</h2>
                <div className="flex space-x-3">
                    <button
                        onClick={handleBackupSettings}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                        Create Backup
                    </button>
                    <button
                        onClick={() => handleSaveSettings(activeCategory)}
                        disabled={saving}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                        {saving ? 'Saving...' : `Save ${categories.find(c => c.id === activeCategory)?.name || ''} Settings`}
                    </button>
                </div>
            </div>

            {/* Category Tabs */}
            <div className="border-b border-gray-200 dark:border-gray-700">
                <nav className="-mb-px flex space-x-8">
                    {categories.map((category) => (
                        <button
                            key={category.id}
                            onClick={() => setActiveCategory(category.id)}
                            className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center space-x-2 ${
                                activeCategory === category.id
                                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                            }`}
                        >
                            <span>{category.icon}</span>
                            <span>{category.name}</span>
                        </button>
                    ))}
                </nav>
            </div>

            {/* Dynamic Settings Content */}
            {activeCategory === 'general' && (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">General Settings</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Site Name
                            </label>
                            <input
                                type="text"
                                value={settings.general?.siteName || ''}
                                onChange={(e) => handleSettingChange('general', 'siteName', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Site Description
                            </label>
                            <input
                                type="text"
                                value={settings.general?.siteDescription || ''}
                                onChange={(e) => handleSettingChange('general', 'siteDescription', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Contact Email
                            </label>
                            <input
                                type="email"
                                value={settings.general?.contactEmail || ''}
                                onChange={(e) => handleSettingChange('general', 'contactEmail', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Support Email
                            </label>
                            <input
                                type="email"
                                value={settings.general?.supportEmail || ''}
                                onChange={(e) => handleSettingChange('general', 'supportEmail', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Timezone
                            </label>
                            <select
                                value={settings.general?.timezone || 'Asia/Kolkata'}
                                onChange={(e) => handleSettingChange('general', 'timezone', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            >
                                <option value="Asia/Kolkata">Asia/Kolkata</option>
                                <option value="America/New_York">America/New_York</option>
                                <option value="Europe/London">Europe/London</option>
                                <option value="Asia/Tokyo">Asia/Tokyo</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Currency
                            </label>
                            <select
                                value={settings.general?.currency || 'INR'}
                                onChange={(e) => handleSettingChange('general', 'currency', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            >
                                <option value="INR">INR (₹)</option>
                                <option value="USD">USD ($)</option>
                                <option value="EUR">EUR (€)</option>
                                <option value="GBP">GBP (£)</option>
                            </select>
                        </div>
                    </div>
                </div>
            )}

            {activeCategory === 'system' && (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">System Controls</h3>
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="text-sm font-medium text-gray-900 dark:text-white">Maintenance Mode</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Enable maintenance mode to restrict site access</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.system?.maintenanceMode || false}
                                    onChange={(e) => handleSettingChange('system', 'maintenanceMode', e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="text-sm font-medium text-gray-900 dark:text-white">User Registration</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Allow new users to register</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.system?.registrationEnabled || false}
                                    onChange={(e) => handleSettingChange('system', 'registrationEnabled', e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="text-sm font-medium text-gray-900 dark:text-white">Auto Approve Jobs</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Automatically approve job postings</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.system?.autoApproveJobs || false}
                                    onChange={(e) => handleSettingChange('system', 'autoApproveJobs', e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="text-sm font-medium text-gray-900 dark:text-white">Enable Analytics</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Collect and display system analytics</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.system?.enableAnalytics || false}
                                    onChange={(e) => handleSettingChange('system', 'enableAnalytics', e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                    </div>
                </div>
            )}

            {activeCategory === 'security' && (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Security Settings</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Session Timeout (minutes)
                            </label>
                            <input
                                type="number"
                                min="5"
                                max="480"
                                value={settings.security?.sessionTimeout || 30}
                                onChange={(e) => handleSettingChange('security', 'sessionTimeout', parseInt(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Password Minimum Length
                            </label>
                            <input
                                type="number"
                                min="6"
                                max="20"
                                value={settings.security?.passwordMinLength || 8}
                                onChange={(e) => handleSettingChange('security', 'passwordMinLength', parseInt(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Max Login Attempts
                            </label>
                            <input
                                type="number"
                                min="3"
                                max="10"
                                value={settings.security?.maxLoginAttempts || 5}
                                onChange={(e) => handleSettingChange('security', 'maxLoginAttempts', parseInt(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Lockout Duration (minutes)
                            </label>
                            <input
                                type="number"
                                min="5"
                                max="60"
                                value={settings.security?.lockoutDuration || 15}
                                onChange={(e) => handleSettingChange('security', 'lockoutDuration', parseInt(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                        </div>
                    </div>
                    
                    <div className="mt-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="text-sm font-medium text-gray-900 dark:text-white">Require Email Verification</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Users must verify email before accessing account</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.security?.requireEmailVerification || false}
                                    onChange={(e) => handleSettingChange('security', 'requireEmailVerification', e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="text-sm font-medium text-gray-900 dark:text-white">Require Strong Passwords</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Enforce uppercase, lowercase, numbers, and symbols</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.security?.requireStrongPasswords || false}
                                    onChange={(e) => handleSettingChange('security', 'requireStrongPasswords', e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="text-sm font-medium text-gray-900 dark:text-white">Enable Two-Factor Authentication</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Require 2FA for admin accounts</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.security?.enableTwoFactor || false}
                                    onChange={(e) => handleSettingChange('security', 'enableTwoFactor', e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                    </div>
                </div>
            )}

            {activeCategory === 'fileUpload' && (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">File Upload Settings</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Maximum File Size
                            </label>
                            <select
                                value={settings.fileUpload?.maxFileSize || '10MB'}
                                onChange={(e) => handleSettingChange('fileUpload', 'maxFileSize', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            >
                                <option value="5MB">5MB</option>
                                <option value="10MB">10MB</option>
                                <option value="25MB">25MB</option>
                                <option value="50MB">50MB</option>
                                <option value="100MB">100MB</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Max Files Per User
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="50"
                                value={settings.fileUpload?.maxFilesPerUser || 10}
                                onChange={(e) => handleSettingChange('fileUpload', 'maxFilesPerUser', parseInt(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                File Retention Days
                            </label>
                            <input
                                type="number"
                                min="30"
                                max="3650"
                                value={settings.fileUpload?.fileRetentionDays || 365}
                                onChange={(e) => handleSettingChange('fileUpload', 'fileRetentionDays', parseInt(e.target.value))}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Allowed File Types
                            </label>
                            <input
                                type="text"
                                value={settings.fileUpload?.allowedFileTypes?.join(', ') || 'pdf, doc, docx, jpg, png'}
                                onChange={(e) => handleSettingChange('fileUpload', 'allowedFileTypes', e.target.value.split(', '))}
                                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                placeholder="pdf, doc, docx, jpg, png"
                            />
                        </div>
                    </div>
                    
                    <div className="mt-6 space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="text-sm font-medium text-gray-900 dark:text-white">Enable Virus Scanning</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Scan uploaded files for viruses</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.fileUpload?.enableVirusScanning || false}
                                    onChange={(e) => handleSettingChange('fileUpload', 'enableVirusScanning', e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="text-sm font-medium text-gray-900 dark:text-white">Auto Delete Old Files</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Automatically delete files after retention period</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.fileUpload?.autoDeleteOldFiles || false}
                                    onChange={(e) => handleSettingChange('fileUpload', 'autoDeleteOldFiles', e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                    </div>
                </div>
            )}

            {activeCategory === 'notifications' && (
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Notification Settings</h3>
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="text-sm font-medium text-gray-900 dark:text-white">Email Notifications</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Send email notifications to users</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.notifications?.emailNotifications || false}
                                    onChange={(e) => handleSettingChange('notifications', 'emailNotifications', e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="text-sm font-medium text-gray-900 dark:text-white">SMS Notifications</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Send SMS notifications to users</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.notifications?.smsNotifications || false}
                                    onChange={(e) => handleSettingChange('notifications', 'smsNotifications', e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                            </label>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="text-sm font-medium text-gray-900 dark:text-white">Push Notifications</h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Send browser push notifications</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.notifications?.pushNotifications || false}
                                    onChange={(e) => handleSettingChange('notifications', 'pushNotifications', e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                            </label>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Notification Frequency
                                </label>
                                <select
                                    value={settings.notifications?.notificationFrequency || 'immediate'}
                                    onChange={(e) => handleSettingChange('notifications', 'notificationFrequency', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                                >
                                    <option value="immediate">Immediate</option>
                                    <option value="daily">Daily Digest</option>
                                    <option value="weekly">Weekly Summary</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SystemSettingsTab;
