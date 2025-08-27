import React, { useState, useRef, useEffect } from 'react';
import {
    Users, FileText, Briefcase, Calendar, MapPin, DollarSign, Eye, Edit,
    Grid, List, Search, Plus, CheckCircle, Video, Brain, Sparkles, BarChart3,
    Building, TrendingUp, Bell, Settings, ChevronDown, Mail, ArrowUpRight,
    Send, X, Home, Save, Clock, Globe, Building2
} from 'lucide-react';

const ProfessionalRecruiterDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [viewMode, setViewMode] = useState('cards');
    const [showAIChat, setShowAIChat] = useState(false);
    const [showAddJobModal, setShowAddJobModal] = useState(false);
    const [notification, setNotification] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [chatInput, setChatInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [loading, setLoading] = useState(false);

    const [chatMessages, setChatMessages] = useState([
        {
            id: 1,
            type: 'ai',
            content: 'Hello! I am your AI recruitment assistant. I can help you analyze candidates, optimize job postings, and provide insights. How can I assist you today?'
        }
    ]);
    const chatMessagesRef = useRef(null);

    const [companies] = useState([
        { id: 1, name: 'Tech Innovations Inc.' },
        { id: 2, name: 'Design Studio' },
        { id: 3, name: 'StartupX' },
        { id: 4, name: 'Enterprise Solutions' }
    ]);

    const [jobFormData, setJobFormData] = useState({
        title: '',
        company_id: '',
        location: '',
        salary_min: '',
        salary_max: '',
        salary_currency: 'USD',
        job_type: '',
        work_mode: '',
        experience_min: '',
        experience_max: '',
        english_level: '',
        description: '',
        requirements: '',
        benefits: ''
    });

    const aiInsights = [
        { type: 'recommendation', message: 'Sarah Johnson shows 95% compatibility with your React Developer role', priority: 'high' },
        { type: 'trend', message: 'UX Designer applications increased by 34% this week', priority: 'medium' },
        { type: 'alert', message: '3 high-priority candidates require immediate review', priority: 'urgent' }
    ];

    const [jobs, setJobs] = useState([
        {
            id: 1,
            title: 'Senior React Developer',
            company_name: 'Tech Innovations Inc.',
            location: 'San Francisco, CA',
            salary_min: 120000,
            salary_max: 180000,
            status: 'active',
            created_at: '2024-01-15',
            remote: true,
            views: 2847,
            engagement: 23.5,
            ai_score: 92
        },
        {
            id: 2,
            title: 'UX Designer',
            company_name: 'Design Studio',
            location: 'New York, NY',
            salary_min: 90000,
            salary_max: 130000,
            status: 'active',
            created_at: '2024-01-10',
            remote: false,
            views: 1923,
            engagement: 18.2,
            ai_score: 87
        }
    ]);

    const [applications, setApplications] = useState([
        {
            id: 1,
            applicant_name: 'Sarah Johnson',
            applicant_email: 'sarah.j@email.com',
            job_title: 'Senior React Developer',
            job_id: 1,
            status: 'pending',
            applied_at: '2024-01-20',
            score: 95,
            experience: '5+ years',
            skills: ['React', 'TypeScript', 'Node.js', 'GraphQL', 'AWS'],
            ai_match: 97,
            cultural_fit: 92,
            interview_scheduled: false
        },
        {
            id: 2,
            applicant_name: 'Michael Chen',
            applicant_email: 'michael.c@email.com',
            job_title: 'UX Designer',
            job_id: 2,
            status: 'reviewed',
            applied_at: '2024-01-18',
            score: 88,
            experience: '3+ years',
            skills: ['Figma', 'Adobe XD', 'Prototyping', 'User Research'],
            ai_match: 91,
            cultural_fit: 88,
            interview_scheduled: true
        },
        {
            id: 3,
            applicant_name: 'Emma Wilson',
            applicant_email: 'emma.w@email.com',
            job_title: 'Senior React Developer',
            job_id: 1,
            status: 'shortlisted',
            applied_at: '2024-01-16',
            score: 95,
            experience: '7+ years',
            skills: ['React', 'GraphQL', 'AWS', 'Docker'],
            ai_match: 98,
            cultural_fit: 95,
            interview_scheduled: true
        }
    ]);

    const user = {
        name: 'Alex Morgan',
        role: 'Senior Recruiter',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'
    };

    useEffect(() => {
        if (chatMessagesRef.current) {
            chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
        }
    }, [chatMessages]);

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleJobFormChange = (e) => {
        const { name, value } = e.target;
        setJobFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleJobSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Simulate API call
        setTimeout(() => {
            const newJob = {
                id: jobs.length + 1,
                title: jobFormData.title,
                company_name: companies.find(c => c.id === parseInt(jobFormData.company_id))?.name || '',
                location: jobFormData.location,
                salary_min: parseInt(jobFormData.salary_min) || 0,
                salary_max: parseInt(jobFormData.salary_max) || 0,
                status: 'active',
                created_at: new Date().toISOString().split('T')[0],
                remote: jobFormData.work_mode === 'remote',
                views: 0,
                engagement: 0,
                ai_score: Math.floor(Math.random() * 20) + 80
            };

            setJobs(prev => [newJob, ...prev]);
            setJobFormData({
                title: '',
                company_id: '',
                location: '',
                salary_min: '',
                salary_max: '',
                salary_currency: 'USD',
                job_type: '',
                work_mode: '',
                experience_min: '',
                experience_max: '',
                english_level: '',
                description: '',
                requirements: '',
                benefits: ''
            });
            setShowAddJobModal(false);
            setLoading(false);
            showNotification('Job posted successfully!');
        }, 2000);
    };

    const updateApplicationStatus = (applicationId, newStatus) => {
        setApplications(prev =>
            prev.map(app =>
                app.id === applicationId ? { ...app, status: newStatus } : app
            )
        );
        showNotification(`Application ${newStatus} successfully`);
    };

    const scheduleInterview = (applicationId) => {
        setApplications(prev =>
            prev.map(app =>
                app.id === applicationId ? { ...app, interview_scheduled: true } : app
            )
        );
        showNotification('Interview scheduled successfully');
    };

    const sendChatMessage = () => {
        if (!chatInput.trim()) return;

        const userMessage = { id: Date.now(), type: 'user', content: chatInput };
        setChatMessages(prev => [...prev, userMessage]);
        setChatInput('');
        setIsTyping(true);

        setTimeout(() => {
            const responses = [
                "Based on your current applications, I recommend prioritizing Sarah Johnson and Emma Wilson for the React Developer position. Both have 95%+ AI match scores.",
                "I have analyzed your job postings and suggest increasing the salary range for the UX Designer role by 10% to attract more qualified candidates.",
                "Your interview-to-hire ratio has improved by 23% this month. The AI screening is effectively filtering candidates.",
                "I notice 3 high-potential candidates have not been contacted yet. Would you like me to draft personalized outreach messages?",
                "The React Developer posting has high engagement but low applications. I suggest adjusting the requirements to be less restrictive."
            ];

            const aiMessage = {
                id: Date.now() + 1,
                type: 'ai',
                content: responses[Math.floor(Math.random() * responses.length)]
            };

            setChatMessages(prev => [...prev, aiMessage]);
            setIsTyping(false);
        }, 1500);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendChatMessage();
        }
    };

    const filteredApplications = applications.filter(app => {
        const matchesSearch = app.applicant_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.job_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.applicant_email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const filteredJobs = jobs.filter(job => {
        const matchesSearch = job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.location?.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-amber-50 text-amber-700 border-amber-200',
            reviewed: 'bg-blue-50 text-blue-700 border-blue-200',
            shortlisted: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            rejected: 'bg-red-50 text-red-700 border-red-200',
            active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            inactive: 'bg-gray-50 text-gray-600 border-gray-200'
        };
        return colors[status] || colors.inactive;
    };

    const getScoreColor = (score) => {
        if (score >= 95) return 'text-emerald-700 bg-emerald-50';
        if (score >= 90) return 'text-emerald-600 bg-emerald-50';
        if (score >= 80) return 'text-blue-600 bg-blue-50';
        if (score >= 70) return 'text-amber-600 bg-amber-50';
        return 'text-red-600 bg-red-50';
    };

    const ApplicationCard = ({ application }) => (
        <div className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200 p-6">
            {application.ai_match >= 90 && (
                <div className="flex justify-end mb-2">
                    <div className="inline-flex items-center px-2 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
                        <Sparkles className="w-3 h-3 mr-1" />
                        AI Match
                    </div>
                </div>
            )}

            <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-gray-600 font-semibold">
                        {application.applicant_name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {application.applicant_name}
                        </h3>
                        <p className="text-sm text-gray-600">{application.job_title}</p>
                        <div className="flex items-center text-xs text-gray-500 mt-1">
                            <Mail className="w-3 h-3 mr-1" />
                            {application.applicant_email}
                        </div>
                    </div>
                </div>

                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(application.status)}`}>
                    {application.status}
                </span>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="text-center">
                    <div className="text-sm font-semibold text-gray-900">{application.score}%</div>
                    <div className="text-xs text-gray-500">Skills</div>
                </div>
                <div className="text-center">
                    <div className="text-sm font-semibold text-gray-900">{application.cultural_fit}%</div>
                    <div className="text-xs text-gray-500">Culture</div>
                </div>
                <div className="text-center">
                    <div className="text-sm font-semibold text-gray-900">{application.ai_match}%</div>
                    <div className="text-xs text-gray-500">AI Match</div>
                </div>
            </div>

            <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Experience</span>
                    <span className="text-gray-900 font-medium">{application.experience}</span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="w-4 h-4 mr-1" />
                    Applied {new Date(application.applied_at).toLocaleDateString()}
                </div>

                <div>
                    <div className="text-sm text-gray-500 mb-2">Top Skills:</div>
                    <div className="flex flex-wrap gap-1">
                        {application.skills.slice(0, 3).map((skill, index) => (
                            <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                {skill}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            <div className="flex space-x-2">
                <button
                    onClick={() => updateApplicationStatus(application.id, 'shortlisted')}
                    className="flex-1 px-3 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors text-sm font-medium"
                >
                    <CheckCircle className="w-4 h-4 mr-1 inline" />
                    Shortlist
                </button>
                <button
                    onClick={() => scheduleInterview(application.id)}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                    <Video className="w-4 h-4 mr-1 inline" />
                    Interview
                </button>
            </div>
        </div>
    );

    const JobCard = ({ job }) => {
        const jobApplications = applications.filter(app => app.job_id === job.id);

        return (
            <div className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200 p-6">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Briefcase className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                            <p className="text-sm text-gray-600">{job.company_name}</p>
                        </div>
                    </div>

                    <div className="flex flex-col items-end space-y-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(job.status)}`}>
                            {job.status}
                        </span>
                        <div className={`px-2 py-1 rounded text-xs font-medium ${getScoreColor(job.ai_score)}`}>
                            Score: {job.ai_score}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="text-center">
                        <div className="text-sm font-semibold text-gray-900">{job.views?.toLocaleString() || '0'}</div>
                        <div className="text-xs text-gray-500">Views</div>
                    </div>
                    <div className="text-center">
                        <div className="text-sm font-semibold text-gray-900">{jobApplications.length}</div>
                        <div className="text-xs text-gray-500">Applications</div>
                    </div>
                    <div className="text-center">
                        <div className="text-sm font-semibold text-gray-900">{job.engagement}%</div>
                        <div className="text-xs text-gray-500">Engagement</div>
                    </div>
                </div>

                <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="w-4 h-4 mr-2" />
                        {job.location}
                        {job.remote && (
                            <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                                Remote
                            </span>
                        )}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                        <DollarSign className="w-4 h-4 mr-2" />
                        ${job.salary_min?.toLocaleString()} - ${job.salary_max?.toLocaleString()}
                    </div>
                </div>

                <div className="flex space-x-2">
                    <button className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium">
                        <Eye className="w-4 h-4 mr-1 inline" />
                        View
                    </button>
                    <button className="flex-1 px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-sm font-medium">
                        <Edit className="w-4 h-4 mr-1 inline" />
                        Edit
                    </button>
                </div>
            </div>
        );
    };

    const AddJobModal = () => (
        <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 transition-all duration-300 ${showAddJobModal ? 'opacity-100 visible' : 'opacity-0 invisible'
            }`}>
            <div className={`bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden transition-all duration-300 ${showAddJobModal ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
                }`}>
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Plus className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Create New Job</h2>
                            <p className="text-gray-600">Fill in the details to post a new job</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowAddJobModal(false)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X className="w-6 h-6 text-gray-500" />
                    </button>
                </div>

                <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
                    <form onSubmit={handleJobSubmit} className="p-6 space-y-8">
                        {/* Basic Information */}
                        <div>
                            <div className="flex items-center mb-4">
                                <Building2 className="w-5 h-5 text-blue-600 mr-2" />
                                <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Job Title *
                                    </label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={jobFormData.title}
                                        onChange={handleJobFormChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="e.g. Senior Software Engineer"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Company *
                                    </label>
                                    <select
                                        name="company_id"
                                        value={jobFormData.company_id}
                                        onChange={handleJobFormChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">Select a company</option>
                                        {companies.map(company => (
                                            <option key={company.id} value={company.id}>
                                                {company.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Location *
                                    </label>
                                    <input
                                        type="text"
                                        name="location"
                                        value={jobFormData.location}
                                        onChange={handleJobFormChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="e.g. San Francisco, CA"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        English Level
                                    </label>
                                    <select
                                        name="english_level"
                                        value={jobFormData.english_level}
                                        onChange={handleJobFormChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="">Select level</option>
                                        <option value="basic">Basic</option>
                                        <option value="intermediate">Intermediate</option>
                                        <option value="advanced">Advanced</option>
                                        <option value="native">Native</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Job Details */}
                        <div>
                            <div className="flex items-center mb-4">
                                <Clock className="w-5 h-5 text-green-600 mr-2" />
                                <h3 className="text-lg font-semibold text-gray-900">Job Details</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Job Type *
                                    </label>
                                    <select
                                        name="job_type"
                                        value={jobFormData.job_type}
                                        onChange={handleJobFormChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    >
                                        <option value="">Select job type</option>
                                        <option value="full-time">Full Time</option>
                                        <option value="part-time">Part Time</option>
                                        <option value="contract">Contract</option>
                                        <option value="internship">Internship</option>
                                        <option value="freelance">Freelance</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Work Mode *
                                    </label>
                                    <select
                                        name="work_mode"
                                        value={jobFormData.work_mode}
                                        onChange={handleJobFormChange}
                                        required
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    >
                                        <option value="">Select work mode</option>
                                        <option value="remote">Remote</option>
                                        <option value="onsite">On-site</option>
                                        <option value="hybrid">Hybrid</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Min Experience (years)
                                    </label>
                                    <input
                                        type="number"
                                        name="experience_min"
                                        value={jobFormData.experience_min}
                                        onChange={handleJobFormChange}
                                        min="0"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        placeholder="0"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Max Experience (years)
                                    </label>
                                    <input
                                        type="number"
                                        name="experience_max"
                                        value={jobFormData.experience_max}
                                        onChange={handleJobFormChange}
                                        min="0"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                        placeholder="10"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Salary Information */}
                        <div className="bg-yellow-50 rounded-xl p-6">
                            <div className="flex items-center mb-4">
                                <DollarSign className="w-5 h-5 text-yellow-600 mr-2" />
                                <h3 className="text-lg font-semibold text-gray-900">Salary Information</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Min Salary
                                    </label>
                                    <input
                                        type="number"
                                        name="salary_min"
                                        value={jobFormData.salary_min}
                                        onChange={handleJobFormChange}
                                        min="0"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                        placeholder="80000"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Max Salary
                                    </label>
                                    <input
                                        type="number"
                                        name="salary_max"
                                        value={jobFormData.salary_max}
                                        onChange={handleJobFormChange}
                                        min="0"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                        placeholder="120000"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Currency
                                    </label>
                                    <select
                                        name="salary_currency"
                                        value={jobFormData.salary_currency}
                                        onChange={handleJobFormChange}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                    >
                                        <option value="USD">USD</option>
                                        <option value="INR">INR</option>
                                        <option value="EUR">EUR</option>
                                        <option value="GBP">GBP</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Job Description */}
                        <div>
                            <div className="flex items-center mb-4">
                                <FileText className="w-5 h-5 text-purple-600 mr-2" />
                                <h3 className="text-lg font-semibold text-gray-900">Job Description</h3>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Description *
                                    </label>
                                    <textarea
                                        name="description"
                                        value={jobFormData.description}
                                        onChange={handleJobFormChange}
                                        required
                                        rows={4}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                                        placeholder="Describe the job role, responsibilities, and what the candidate will be doing..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Requirements
                                    </label>
                                    <textarea
                                        name="requirements"
                                        value={jobFormData.requirements}
                                        onChange={handleJobFormChange}
                                        rows={3}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                                        placeholder="List the required skills, qualifications, and experience..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Benefits
                                    </label>
                                    <textarea
                                        name="benefits"
                                        value={jobFormData.benefits}
                                        onChange={handleJobFormChange}
                                        rows={3}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                                        placeholder="List the benefits, perks, and compensation details..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end space-x-4 pt-4 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={() => setShowAddJobModal(false)}
                                className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                                        Posting...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4 mr-2" />
                                        Post Job
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );

    const AIChat = () => (
        <div className={`fixed bottom-4 right-4 w-96 h-96 bg-white rounded-lg shadow-xl border border-gray-200 transition-all duration-300 z-50 ${showAIChat ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'
            }`}>
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Brain className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-900">AI Assistant</h3>
                        <p className="text-xs text-gray-500">Always here to help</p>
                    </div>
                </div>
                <button
                    onClick={() => setShowAIChat(false)}
                    className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <X className="w-4 h-4 text-gray-500" />
                </button>
            </div>

            <div
                ref={chatMessagesRef}
                className="flex-1 p-4 space-y-3 overflow-y-auto h-64"
            >
                {chatMessages.map((message) => (
                    <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs px-3 py-2 rounded-lg text-sm ${message.type === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                            }`}>
                            {message.content}
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div className="flex justify-start">
                        <div className="bg-gray-100 px-3 py-2 rounded-lg">
                            <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-4 border-t border-gray-200">
                <div className="flex space-x-2">
                    <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Ask me anything about recruitment..."
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                        onClick={sendChatMessage}
                        disabled={!chatInput.trim()}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
            {notification && (
                <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg transition-all duration-300 ${notification.type === 'success'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-red-500 text-white'
                    }`}>
                    {notification.message}
                </div>
            )}

            {/* Header */}
            <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-sm border-b border-blue-100 shadow-lg">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md">
                                <Building className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">FinAutoJob</h1>
                                <p className="text-sm text-blue-500/70">Professional Recruiting Platform</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            <button
                                onClick={() => setShowAIChat(!showAIChat)}
                                className={`relative p-2 rounded-xl transition-all duration-200 ${showAIChat
                                    ? 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-600 shadow-md'
                                    : 'text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                                    }`}
                            >
                                <Brain className="w-5 h-5" />
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full shadow-sm"></div>
                            </button>

                            <button className="relative p-2 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-200">
                                <Bell className="w-5 h-5" />
                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full flex items-center justify-center shadow-md">
                                    3
                                </span>
                            </button>

                            <button className="p-2 text-gray-600 hover:bg-gray-50 hover:text-gray-700 rounded-xl transition-all duration-200">
                                <Settings className="w-5 h-5" />
                            </button>

                            <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
                                <img
                                    src={user.avatar}
                                    alt={user.name}
                                    className="w-8 h-8 rounded-lg object-cover"
                                />
                                <div className="hidden sm:block">
                                    <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                                    <p className="text-xs text-gray-500">{user.role}</p>
                                </div>
                                <ChevronDown className="w-4 h-4 text-gray-400" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {[
                        {
                            title: 'Active Jobs',
                            value: jobs.filter(job => job.status === 'active').length,
                            change: '+12%',
                            icon: Briefcase,
                            bgColor: 'bg-blue-100',
                            textColor: 'text-blue-600'
                        },
                        {
                            title: 'Applications',
                            value: applications.length,
                            change: '+8%',
                            icon: Users,
                            bgColor: 'bg-emerald-100',
                            textColor: 'text-emerald-600'
                        },
                        {
                            title: 'AI Matches',
                            value: applications.filter(app => app.ai_match >= 90).length,
                            change: '+24%',
                            icon: Brain,
                            bgColor: 'bg-purple-100',
                            textColor: 'text-purple-600'
                        },
                        {
                            title: 'Interviews',
                            value: applications.filter(app => app.interview_scheduled).length,
                            change: '+15%',
                            icon: Video,
                            bgColor: 'bg-amber-100',
                            textColor: 'text-amber-600'
                        }
                    ].map((stat, index) => {
                        const Icon = stat.icon;
                        const gradientBg = {
                            'bg-blue-100': 'from-blue-400 to-blue-600',
                            'bg-emerald-100': 'from-emerald-400 to-emerald-600',
                            'bg-purple-100': 'from-purple-400 to-purple-600',
                            'bg-amber-100': 'from-amber-400 to-amber-600'
                        };
                        return (
                            <div key={index} className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 p-6 hover:shadow-xl hover:bg-white/80 transition-all duration-300 hover:-translate-y-1">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 mb-2">{stat.title}</p>
                                        <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                                        <p className="text-xs text-emerald-600 font-medium flex items-center">
                                            <ArrowUpRight className="w-3 h-3 mr-1" />
                                            {stat.change} this month
                                        </p>
                                    </div>
                                    <div className={`w-14 h-14 bg-gradient-to-r ${gradientBg[stat.bgColor]} rounded-2xl flex items-center justify-center shadow-lg`}>
                                        <Icon className="w-7 h-7 text-white" />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Navigation */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 shadow-lg mb-8">
                    <div className="border-b border-blue-100/50">
                        <nav className="flex space-x-8 px-6">
                            {[
                                { id: 'overview', name: 'Overview', icon: Home },
                                { id: 'applications', name: 'Applications', icon: FileText },
                                { id: 'jobs', name: 'Jobs', icon: Briefcase },
                                { id: 'analytics', name: 'Analytics', icon: BarChart3 }
                            ].map((tab) => {
                                const Icon = tab.icon;
                                const isActive = activeTab === tab.id;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`relative flex items-center py-4 px-3 font-medium text-sm transition-all duration-200 rounded-t-xl ${isActive
                                            ? 'text-blue-600 bg-gradient-to-t from-blue-50 to-transparent border-b-2 border-blue-500'
                                            : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50/50'
                                            }`}
                                    >
                                        <Icon className="w-4 h-4 mr-2" />
                                        {tab.name}
                                    </button>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Tab Content */}
                    <div className="p-6">
                        {activeTab === 'overview' && (
                            <div className="space-y-6">
                                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                            Welcome back, {user.name.split(' ')[0]}
                                        </h2>
                                        <p className="text-gray-600">
                                            Here is what is happening with your recruitment today
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setShowAddJobModal(true)}
                                        className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        <Plus className="w-4 h-4 mr-2" />
                                        New Job Post
                                    </button>
                                </div>

                                {/* AI Insights Panel */}
                                <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                                    <div className="flex items-center mb-4">
                                        <Brain className="w-5 h-5 text-blue-600 mr-2" />
                                        <h3 className="text-lg font-semibold text-gray-900">AI Insights</h3>
                                    </div>
                                    <div className="space-y-3">
                                        {aiInsights.map((insight, index) => (
                                            <div key={index} className="flex items-start space-x-3 p-3 bg-white rounded-lg">
                                                <div className={`w-2 h-2 rounded-full mt-2 ${insight.priority === 'urgent' ? 'bg-red-500' :
                                                    insight.priority === 'high' ? 'bg-amber-500' : 'bg-blue-500'
                                                    }`} />
                                                <p className="text-sm text-gray-700 flex-1">{insight.message}</p>
                                                <button className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                                                    View
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Recent Activity */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Candidates This Week</h3>
                                        <div className="space-y-4">
                                            {applications.slice(0, 3).map((app) => (
                                                <div key={app.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center text-gray-600 font-semibold">
                                                            {app.applicant_name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-gray-900">{app.applicant_name}</p>
                                                            <p className="text-sm text-gray-500">{app.job_title}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className={`px-2 py-1 rounded text-xs font-medium ${getScoreColor(app.ai_match)}`}>
                                                            {app.ai_match}%
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                                        <div className="space-y-3">
                                            {[
                                                { icon: Plus, label: 'Post New Job', action: () => setShowAddJobModal(true) },
                                                { icon: Users, label: 'Review Applications', action: () => setActiveTab('applications') },
                                                { icon: Video, label: 'Schedule Interviews' },
                                                { icon: BarChart3, label: 'View Analytics', action: () => setActiveTab('analytics') },
                                                { icon: Brain, label: 'AI Recommendations' }
                                            ].map((action, index) => {
                                                const Icon = action.icon;
                                                return (
                                                    <button
                                                        key={index}
                                                        onClick={action.action}
                                                        className="w-full flex items-center px-4 py-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                                    >
                                                        <Icon className="w-4 h-4 mr-3 text-gray-500" />
                                                        <span className="text-sm font-medium text-gray-700">{action.label}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'applications' && (
                            <div className="space-y-6">
                                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Applications</h2>
                                        <p className="text-gray-600">
                                            Manage and review candidate applications with AI insights
                                        </p>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <div className="relative">
                                            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="text"
                                                placeholder="Search candidates..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>

                                        <select
                                            value={statusFilter}
                                            onChange={(e) => setStatusFilter(e.target.value)}
                                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        >
                                            <option value="all">All Status</option>
                                            <option value="pending">Pending</option>
                                            <option value="reviewed">Reviewed</option>
                                            <option value="shortlisted">Shortlisted</option>
                                            <option value="rejected">Rejected</option>
                                        </select>

                                        <div className="flex border border-gray-300 rounded-lg">
                                            <button
                                                onClick={() => setViewMode('cards')}
                                                className={`p-2 ${viewMode === 'cards'
                                                    ? 'bg-blue-50 text-blue-600'
                                                    : 'text-gray-400 hover:text-gray-600'
                                                    }`}
                                            >
                                                <Grid className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => setViewMode('table')}
                                                className={`p-2 ${viewMode === 'table'
                                                    ? 'bg-blue-50 text-blue-600'
                                                    : 'text-gray-400 hover:text-gray-600'
                                                    }`}
                                            >
                                                <List className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {filteredApplications.map((application) => (
                                        <ApplicationCard key={application.id} application={application} />
                                    ))}
                                </div>

                                {filteredApplications.length === 0 && (
                                    <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                                        <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
                                        <p className="text-gray-500">Try adjusting your search or filter criteria.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'jobs' && (
                            <div className="space-y-6">
                                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Job Postings</h2>
                                        <p className="text-gray-600">
                                            Manage your job listings with AI-powered optimization
                                        </p>
                                    </div>
                                    <div className="flex items-center space-x-3">
                                        <div className="relative">
                                            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="text"
                                                placeholder="Search jobs..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                        <button
                                            onClick={() => setShowAddJobModal(true)}
                                            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            <Plus className="w-4 h-4 mr-2" />
                                            Create Job
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                    {filteredJobs.map((job) => (
                                        <JobCard key={job.id} job={job} />
                                    ))}
                                </div>

                                {filteredJobs.length === 0 && (
                                    <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
                                        <Briefcase className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">No jobs found</h3>
                                        <p className="text-gray-500">Start by creating your first job posting.</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'analytics' && (
                            <div className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Analytics & Insights</h2>
                                        <p className="text-gray-600">
                                            Track your recruitment performance with AI-powered analytics
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-6">Hiring Funnel</h3>
                                        <div className="space-y-4">
                                            {[
                                                { stage: 'Applications', count: applications.length, percentage: 100 },
                                                { stage: 'Under Review', count: applications.filter(app => app.status === 'reviewed').length, percentage: 75 },
                                                { stage: 'Shortlisted', count: applications.filter(app => app.status === 'shortlisted').length, percentage: 50 },
                                            ].map((stage, index) => (
                                                <div key={index} className="space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm text-gray-600">{stage.stage}</span>
                                                        <span className="font-semibold text-gray-900">{stage.count}</span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                        <div
                                                            className="h-2 bg-blue-600 rounded-full"
                                                            style={{ width: `${stage.percentage}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-lg border border-gray-200 p-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-6">Performance Metrics</h3>
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600">AI Match Accuracy</span>
                                                <div className="text-right">
                                                    <div className="font-bold text-gray-900">94.2%</div>
                                                    <div className="text-xs text-emerald-600">+2.3%</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600">Time Saved</span>
                                                <div className="text-right">
                                                    <div className="font-bold text-gray-900">18.5h</div>
                                                    <div className="text-xs text-emerald-600">+5.2h</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600">Success Rate</span>
                                                <div className="text-right">
                                                    <div className="font-bold text-gray-900">87%</div>
                                                    <div className="text-xs text-emerald-600">+12%</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Add Job Modal */}
            <AddJobModal />

            {/* AI Chat */}
            <AIChat />

            {/* Floating AI Chat Button */}
            {!showAIChat && (
                <button
                    onClick={() => setShowAIChat(true)}
                    className="fixed bottom-4 left-4 w-12 h-12 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center justify-center text-white shadow-lg transition-all duration-200 hover:scale-110"
                >
                    <Brain className="w-6 h-6" />
                </button>
            )}
        </div>
    );
};

export default ProfessionalRecruiterDashboard;