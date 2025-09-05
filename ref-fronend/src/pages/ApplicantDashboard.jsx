import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ui/use-toast';
import { Link, useLocation } from 'wouter';
import api from '../utils/api';
import {
    Users, FileText, Briefcase, Calendar, MapPin, DollarSign, Eye, Edit,
    Grid, List, Search, Plus, CheckCircle, Video, Brain, Sparkles, BarChart3,
    Building, TrendingUp, Bell, Settings, ChevronDown, Mail, ArrowUpRight,
    Send, X, Home, Save, Clock, Globe, Building2, Target, Award, BookOpen,
    Download, Upload, Star, Filter, MessageCircle, Zap, PieChart, Activity,
    Code, MessageSquare
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';

const ProfessionalApplicantDashboard = () => {
    const { user, logout } = useAuth();
    const { toast } = useToast();
    const [location, navigate] = useLocation();
    const [activeTab, setActiveTab] = useState('overview');
    const [viewMode, setViewMode] = useState('cards');
    const [showAIChat, setShowAIChat] = useState(false);
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
            content: 'Hello! I am your AI career assistant. I can help you find the perfect job matches, optimize your applications, and provide career insights. How can I help you today?'
        }
    ]);
    const chatMessagesRef = useRef(null);

    // Applications data from API
    const [applications, setApplications] = useState([]);
    const [applicationsLoading, setApplicationsLoading] = useState(true);

    // Fetch applications from API
    useEffect(() => {
        const fetchApplications = async () => {
            try {
                setApplicationsLoading(true);
                const response = await api.getApplications();
                const data = await response.json();
                setApplications(data.applications || data || []);
            } catch (error) {
                console.error('Error fetching applications:', error);
                // Set mock data for demo purposes
                setApplications([
                    {
                        id: 1,
                        job_title: 'Senior React Developer',
                        company_name: 'Tech Innovations Inc.',
                        company_logo: 'https://images.unsplash.com/photo-1549924231-f129b911e442?w=40&h=40&fit=crop',
                        location: 'San Francisco, CA',
                        remote: true,
                        status: 'pending',
                        ai_match: 95,
                        skills_match: 92,
                        experience_match: 88,
                        salary_min: 120000,
                        salary_max: 160000,
                        applied_at: new Date().toISOString(),
                        response_time: '2-3 days',
                        interview_scheduled: false
                    },
                    {
                        id: 2,
                        job_title: 'Frontend Engineer',
                        company_name: 'StartupX',
                        company_logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=40&h=40&fit=crop',
                        location: 'New York, NY',
                        remote: false,
                        status: 'reviewed',
                        ai_match: 87,
                        skills_match: 85,
                        experience_match: 90,
                        salary_min: 100000,
                        salary_max: 140000,
                        applied_at: new Date(Date.now() - 86400000).toISOString(),
                        response_time: '1-2 days',
                        interview_scheduled: true,
                        interview_date: new Date(Date.now() + 172800000).toISOString()
                    }
                ]);
            } finally {
                setApplicationsLoading(false);
            }
        };

        if (user) {
            fetchApplications();
        }
    }, [user, toast]);

    // Recommended jobs from API
    const [recommendedJobs, setRecommendedJobs] = useState([]);
    const [jobsLoading, setJobsLoading] = useState(true);

    // Fetch recommended jobs from API
    useEffect(() => {
        const fetchRecommendedJobs = async () => {
            try {
                setJobsLoading(true);
                const response = await api.getJobs({ limit: 6, recommended: true });
                const data = await response.json();
                setRecommendedJobs(data.jobs || []);
            } catch (error) {
                console.error('Error fetching recommended jobs:', error);
                // Keep empty array on error
            } finally {
                setJobsLoading(false);
            }
        };

        if (user) {
            fetchRecommendedJobs();
        }
    }, [user]);

    const aiInsights = [
        { type: 'recommendation', message: 'Your React skills are in high demand! 12 new matching jobs available', priority: 'high' },
        { type: 'trend', message: 'Frontend developer salaries increased by 8% in your area', priority: 'medium' },
        { type: 'alert', message: 'Interview reminder: Tech Innovations Inc. tomorrow at 2 PM', priority: 'urgent' }
    ];

    // User profile data from API
    const [userProfile, setUserProfile] = useState(null);
    const [profileLoading, setProfileLoading] = useState(true);

    // Fetch user profile from API
    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                setProfileLoading(true);
                const response = await api.getProfile();
                const data = await response.json();
                setUserProfile({
                    name: data.full_name || user?.full_name || 'User',
                    title: data.title || 'Job Seeker',
                    location: data.location || 'Location not set',
                    experience: data.experience || 'Not specified',
                    skills: data.skills || [],
                    avatar: data.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
                    profile_completion: data.profile_completion || 85,
                    resume_uploaded: data.resume_uploaded || false
                });
            } catch (error) {
                console.error('Error fetching user profile:', error);
                // Set default profile on error
                setUserProfile({
                    name: user?.full_name || 'User',
                    title: 'Job Seeker',
                    location: 'Location not set',
                    experience: 'Not specified',
                    skills: [],
                    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
                    profile_completion: 85,
                    resume_uploaded: false
                });
            } finally {
                setProfileLoading(false);
            }
        };

        if (user) {
            fetchUserProfile();
        }
    }, [user]);

    // Default profile fallback
    const defaultProfile = {
        name: user?.full_name || 'User',
        title: 'Job Seeker',
        location: 'Location not set',
        experience: 'Not specified',
        skills: [],
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face',
        profile_completion: 85,
        resume_uploaded: false
    };

    const currentProfile = userProfile || defaultProfile;

    useEffect(() => {
        if (chatMessagesRef.current) {
            chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
        }
    }, [chatMessages]);

    const showNotification = (message, type = 'success') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const sendChatMessage = () => {
        if (!chatInput.trim()) return;

        const userMessage = { id: Date.now(), type: 'user', content: chatInput };
        setChatMessages(prev => [...prev, userMessage]);
        setChatInput('');
        setIsTyping(true);

        setTimeout(() => {
            const responses = [
                "Based on your profile, I found 5 new job opportunities that match your React expertise. Would you like me to show them?",
                "Your application to Tech Innovations Inc. has a 95% match score. I recommend highlighting your GraphQL experience in your cover letter.",
                "The average response time for Frontend Developer positions is 4 days. Your recent applications are performing well!",
                "I notice you haven't updated your skills recently. Adding Next.js and Tailwind CSS could increase your match scores by 12%.",
                "Great news! Companies in your area are actively hiring React developers. Your profile views increased by 34% this week."
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
        const matchesSearch = app.job_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            app.company_name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-amber-50 text-amber-700 border-amber-200',
            reviewed: 'bg-blue-50 text-blue-700 border-blue-200',
            shortlisted: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            rejected: 'bg-red-50 text-red-700 border-red-200',
            interview: 'bg-purple-50 text-purple-700 border-purple-200'
        };
        return colors[status] || colors.pending;
    };

    const getMatchColor = (score) => {
        if (score >= 90) return 'text-emerald-700 bg-emerald-50';
        if (score >= 80) return 'text-blue-600 bg-blue-50';
        if (score >= 70) return 'text-amber-600 bg-amber-50';
        return 'text-red-600 bg-red-50';
    };

    const ApplicationCard = ({ application }) => (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 hover:border-blue-200 hover:shadow-xl hover:bg-white/80 transition-all duration-300 hover:-translate-y-1 p-6">
            {application.ai_match >= 90 && (
                <div className="flex justify-end mb-3">
                    <div className="inline-flex items-center px-2 py-1 rounded-full bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 text-xs font-medium border border-blue-200">
                        <Sparkles className="w-3 h-3 mr-1" />
                        AI Top Match
                    </div>
                </div>
            )}

            <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-3">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                        <img
                            src={application.company_logo}
                            alt={application.company_name}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {application.job_title}
                        </h3>
                        <p className="text-sm text-gray-600">{application.company_name}</p>
                        <div className="flex items-center text-xs text-gray-500 mt-1 space-x-3">
                            <div className="flex items-center">
                                <MapPin className="w-3 h-3 mr-1" />
                                {application.location}
                            </div>
                            {application.remote && (
                                <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                                    Remote
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(application.status)}`}>
                    {application.status}
                </span>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100/50">
                <div className="text-center">
                    <div className="text-sm font-semibold text-gray-900">{application.ai_match}%</div>
                    <div className="text-xs text-gray-500">AI Match</div>
                </div>
                <div className="text-center">
                    <div className="text-sm font-semibold text-gray-900">{application.skills_match}%</div>
                    <div className="text-xs text-gray-500">Skills</div>
                </div>
                <div className="text-center">
                    <div className="text-sm font-semibold text-gray-900">{application.experience_match}%</div>
                    <div className="text-xs text-gray-500">Experience</div>
                </div>
            </div>

            <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Salary Range</span>
                    <span className="text-gray-900 font-medium">
                        ${application.salary_min?.toLocaleString()} - ${application.salary_max?.toLocaleString()}
                    </span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Applied</span>
                    <span className="text-gray-900">{new Date(application.applied_at).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Response Time</span>
                    <span className="text-gray-900">{application.response_time}</span>
                </div>
            </div>

            {application.interview_scheduled && (
                <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl shadow-sm">
                    <div className="flex items-center text-blue-700">
                        <Video className="w-4 h-4 mr-2" />
                        <span className="text-sm font-medium">Interview Scheduled</span>
                    </div>
                    <p className="text-xs text-blue-600 mt-1">
                        {new Date(application.interview_date).toLocaleDateString()} at 2:00 PM
                    </p>
                </div>
            )}

            <div className="flex space-x-2">
                <button className="flex-1 px-3 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg">
                    <Eye className="w-4 h-4 mr-1 inline" />
                    View Details
                </button>
                <button className="flex-1 px-3 py-2 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all duration-200 text-sm font-medium">
                    <MessageCircle className="w-4 h-4 mr-1 inline" />
                    Message
                </button>
            </div>
        </div>
    );

    const JobRecommendationCard = ({ job }) => (
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 hover:border-blue-200 hover:shadow-xl hover:bg-white/80 transition-all duration-300 hover:-translate-y-1 p-7">
            <div className="flex items-start justify-between mb-5">
                <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{job.title}</h3>
                    <p className="text-base text-gray-600">{job.company}</p>
                    <div className="flex items-center text-sm text-gray-500 mt-2 space-x-4">
                        <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1.5" />
                            {job.location}
                        </div>
                        <div className="flex items-center">
                            <Clock className="w-4 h-4 mr-1.5" />
                            {job.posted}
                        </div>
                    </div>
                </div>
                <div className={`px-3 py-1.5 rounded-lg text-sm font-bold ${getMatchColor(job.match_score)}`}>
                    {job.match_score}% Match
                </div>
            </div>

            <div className="flex justify-between text-base mb-5">
                <span className="text-gray-500 font-medium">Salary</span>
                <span className="text-gray-900 font-bold">{job.salary}</span>
            </div>

            <div className="flex justify-between text-xs text-gray-500 mb-4">
                <span>{job.applicants} applicants</span>
                {job.remote && <span className="text-green-600">Remote Available</span>}
            </div>

            <div className="flex space-x-2">
                <button className="flex-1 px-3 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg">
                    <Plus className="w-4 h-4 mr-1 inline" />
                    Apply Now
                </button>
                <button className="px-3 py-2 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all duration-200">
                    <Save className="w-4 h-4" />
                </button>
            </div>
        </div>
    );

    return (
        <DashboardLayout user={user} logout={logout}>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
                {/* Notification */}
                {notification && (
                    <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-xl shadow-xl backdrop-blur-sm transition-all duration-300 ${notification.type === 'success' ? 'bg-emerald-500/90 text-white border border-emerald-400' : 'bg-red-500/90 text-white border border-red-400'
                        }`}>
                        {notification.message}
                    </div>
                )}

                <div className="flex h-screen">




                    {/* Content Area */}
                    <div className="flex-1 overflow-auto p-6">
                        {/* Overview Tab */}
                        {activeTab === 'overview' && (
                            <div className="space-y-6">
                                {/* Stats Cards */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 p-6 hover:shadow-xl hover:bg-white/80 transition-all duration-300 hover:-translate-y-1">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">Total Applications</p>
                                                <p className="text-3xl font-bold text-gray-900 mt-2">{applications.length}</p>
                                                <p className="text-xs text-green-600 mt-1">+2 this week</p>
                                            </div>
                                            <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                                                <FileText className="w-6 h-6 text-blue-600" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 p-6 hover:shadow-xl hover:bg-white/80 transition-all duration-300 hover:-translate-y-1">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">Shortlisted</p>
                                                <p className="text-3xl font-bold text-gray-900 mt-2">
                                                    {applications.filter(app => app.status === 'shortlisted').length}
                                                </p>
                                                <p className="text-xs text-green-600 mt-1">+1 this week</p>
                                            </div>
                                            <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl flex items-center justify-center">
                                                <CheckCircle className="w-6 h-6 text-emerald-600" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 p-6 hover:shadow-xl hover:bg-white/80 transition-all duration-300 hover:-translate-y-1">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">Interviews</p>
                                                <p className="text-3xl font-bold text-gray-900 mt-2">
                                                    {applications.filter(app => app.interview_scheduled).length}
                                                </p>
                                                <p className="text-xs text-blue-600 mt-1">1 upcoming</p>
                                            </div>
                                            <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center">
                                                <Video className="w-6 h-6 text-purple-600" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-white/20 p-6 hover:shadow-xl hover:bg-white/80 transition-all duration-300 hover:-translate-y-1">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-600">Profile Views</p>
                                                <p className="text-3xl font-bold text-gray-900 mt-2">127</p>
                                                <p className="text-xs text-green-600 mt-1">+34% this week</p>
                                            </div>
                                            <div className="w-12 h-12 bg-gradient-to-br from-amber-100 to-amber-200 rounded-xl flex items-center justify-center">
                                                <Eye className="w-6 h-6 text-amber-600" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* AI Insights */}
                                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200 p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                                                <Sparkles className="w-4 h-4 text-white" />
                                            </div>
                                            <h3 className="text-lg font-semibold text-gray-900">AI Career Insights</h3>
                                        </div>
                                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                                            View All
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        {aiInsights.map((insight, index) => (
                                            <div key={index} className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-blue-100">
                                                <div className={`w-2 h-2 rounded-full mt-2 ${insight.priority === 'urgent' ? 'bg-red-500' :
                                                    insight.priority === 'high' ? 'bg-amber-500' : 'bg-blue-500'
                                                    }`}></div>
                                                <p className="text-sm text-gray-700 flex-1">{insight.message}</p>
                                                <ArrowUpRight className="w-4 h-4 text-gray-400" />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Recent Applications & Recommendations */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Recent Applications */}
                                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-semibold text-gray-900">Recent Applications</h3>
                                            <button
                                                onClick={() => setActiveTab('applications')}
                                                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                            >
                                                View All
                                            </button>
                                        </div>
                                        <div className="space-y-3">
                                            {applications.slice(0, 3).map((app) => (
                                                <div key={app.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                    <div className="flex items-center space-x-3">
                                                        <img
                                                            src={app.company_logo}
                                                            alt={app.company_name}
                                                            className="w-8 h-8 rounded object-cover"
                                                        />
                                                        <div>
                                                            <p className="font-medium text-gray-900 text-sm">{app.job_title}</p>
                                                            <p className="text-xs text-gray-500">{app.company_name}</p>
                                                        </div>
                                                    </div>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(app.status)}`}>
                                                        {app.status}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Top Recommendations */}
                                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-semibold text-gray-900">Top Recommendations</h3>
                                            <button
                                                onClick={() => setActiveTab('recommendations')}
                                                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                            >
                                                View All
                                            </button>
                                        </div>
                                        <div className="space-y-3">
                                            {recommendedJobs.slice(0, 3).map((job) => (
                                                <div key={job.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                    <div>
                                                        <p className="font-medium text-gray-900 text-sm">{job.title}</p>
                                                        <p className="text-xs text-gray-500">{job.company} • {job.location}</p>
                                                    </div>
                                                    <div className={`px-2 py-1 rounded text-xs font-medium ${getMatchColor(job.match_score)}`}>
                                                        {job.match_score}%
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Applications Tab */}
                        {activeTab === 'applications' && (
                            <div className="space-y-6">
                                {/* Application Analytics */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-semibold text-gray-900">Success Rate</h3>
                                            <PieChart className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div className="text-center">
                                            <div className="text-3xl font-bold text-green-600 mb-2">67%</div>
                                            <p className="text-sm text-gray-600">Applications leading to interviews</p>
                                            <div className="mt-4 bg-gray-200 rounded-full h-2">
                                                <div className="bg-green-500 h-2 rounded-full" style={{ width: '67%' }}></div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-semibold text-gray-900">Avg Response Time</h3>
                                            <Clock className="w-5 h-5 text-amber-600" />
                                        </div>
                                        <div className="text-center">
                                            <div className="text-3xl font-bold text-amber-600 mb-2">3.2</div>
                                            <p className="text-sm text-gray-600">Days average response</p>
                                            <p className="text-xs text-green-600 mt-2">15% faster than average</p>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-semibold text-gray-900">Application Trend</h3>
                                            <Activity className="w-5 h-5 text-purple-600" />
                                        </div>
                                        <div className="text-center">
                                            <div className="text-3xl font-bold text-purple-600 mb-2">+23%</div>
                                            <p className="text-sm text-gray-600">Increase this month</p>
                                            <div className="flex justify-center space-x-1 mt-3">
                                                {[20, 35, 25, 45, 30, 55, 40].map((height, i) => (
                                                    <div key={i} className="w-2 bg-purple-200 rounded-t" style={{ height: `${height}px` }}></div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Controls */}
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                                    <div className="flex items-center space-x-4">
                                        <div className="relative">
                                            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="text"
                                                placeholder="Search applications..."
                                                value={searchTerm}
                                                onChange={(e) => setSearchTerm(e.target.value)}
                                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
                                            />
                                        </div>
                                        <select
                                            value={statusFilter}
                                            onChange={(e) => setStatusFilter(e.target.value)}
                                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="all">All Status</option>
                                            <option value="pending">Pending</option>
                                            <option value="reviewed">Reviewed</option>
                                            <option value="shortlisted">Shortlisted</option>
                                            <option value="rejected">Rejected</option>
                                        </select>
                                        <button className="flex items-center px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                                            <Filter className="w-4 h-4 mr-2" />
                                            More Filters
                                        </button>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => setViewMode('cards')}
                                            className={`p-2 rounded-lg transition-colors ${viewMode === 'cards'
                                                ? 'bg-blue-100 text-blue-600'
                                                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                                                }`}
                                        >
                                            <Grid className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => setViewMode('list')}
                                            className={`p-2 rounded-lg transition-colors ${viewMode === 'list'
                                                ? 'bg-blue-100 text-blue-600'
                                                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                                                }`}
                                        >
                                            <List className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Applications Grid */}
                                {applicationsLoading ? (
                                    <div className="flex items-center justify-center py-12">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                        <span className="ml-3 text-gray-600">Loading applications...</span>
                                    </div>
                                ) : filteredApplications.length === 0 ? (
                                    <div className="text-center py-12">
                                        <div className="text-gray-500 mb-2">No applications found</div>
                                        <p className="text-sm text-gray-400">Start applying to jobs to see them here</p>
                                    </div>
                                ) : (
                                    <div className={viewMode === 'cards'
                                        ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6'
                                        : 'space-y-4'
                                    }>
                                        {filteredApplications.map((application) => (
                                            <ApplicationCard key={application.id} application={application} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Job Recommendations Tab */}
                        {activeTab === 'recommendations' && (
                            <div className="space-y-6">
                                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200 p-6">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <Target className="w-5 h-5 text-blue-600" />
                                        <h3 className="text-lg font-semibold text-gray-900">AI-Powered Job Recommendations</h3>
                                    </div>
                                    <p className="text-gray-600 text-sm">
                                        Based on your skills, experience, and preferences, here are the best job matches for you.
                                    </p>
                                </div>

                                {jobsLoading ? (
                                    <div className="flex items-center justify-center py-12">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                        <span className="ml-3 text-gray-600">Loading job recommendations...</span>
                                    </div>
                                ) : recommendedJobs.length === 0 ? (
                                    <div className="text-center py-12">
                                        <div className="text-gray-500 mb-2">No job recommendations available</div>
                                        <p className="text-sm text-gray-400">Complete your profile to get personalized recommendations</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                        {recommendedJobs.map((job) => (
                                            <JobRecommendationCard key={job.id} job={job} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Profile Management Tab */}
                        {activeTab === 'profile' && (
                            <div className="space-y-6">
                                {/* Profile Header */}
                                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200 p-6">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <User className="w-5 h-5 text-blue-600" />
                                        <h3 className="text-lg font-semibold text-gray-900">Profile Management</h3>
                                    </div>
                                    <p className="text-gray-600 text-sm">
                                        Keep your profile updated to get better job matches and attract recruiters.
                                    </p>
                                </div>

                                {profileLoading ? (
                                    <div className="flex items-center justify-center py-12">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                        <span className="ml-3 text-gray-600">Loading profile...</span>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                        {/* Profile Completion */}
                                        <div className="lg:col-span-2 space-y-6">
                                            {/* Basic Information */}
                                            <div className="bg-white rounded-xl border border-gray-200 p-6">
                                                <div className="flex items-center justify-between mb-4">
                                                    <h4 className="text-lg font-semibold text-gray-900">Basic Information</h4>
                                                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                                                        Edit
                                                    </button>
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                                        <input type="text" value={currentProfile.name || ''} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                                        <input type="email" value={currentProfile.email || ''} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                                        <input type="tel" value={currentProfile.phone || ''} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                                        <input type="text" value={currentProfile.location || ''} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Professional Summary */}
                                            <div className="bg-white rounded-xl border border-gray-200 p-6">
                                                <div className="flex items-center justify-between mb-4">
                                                    <h4 className="text-lg font-semibold text-gray-900">Professional Summary</h4>
                                                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                                                        Edit
                                                    </button>
                                                </div>
                                                <textarea
                                                    rows={4}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    placeholder="Write a compelling summary of your professional experience and goals..."
                                                    defaultValue={currentProfile.summary || ''}
                                                />
                                            </div>

                                            {/* Skills */}
                                            <div className="bg-white rounded-xl border border-gray-200 p-6">
                                                <div className="flex items-center justify-between mb-4">
                                                    <h4 className="text-lg font-semibold text-gray-900">Skills & Technologies</h4>
                                                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                                                        Add Skill
                                                    </button>
                                                </div>
                                                <div className="space-y-4">
                                                    {[
                                                        { name: 'React', level: 90, category: 'Frontend' },
                                                        { name: 'JavaScript', level: 95, category: 'Programming' },
                                                        { name: 'TypeScript', level: 85, category: 'Programming' },
                                                        { name: 'Node.js', level: 80, category: 'Backend' },
                                                        { name: 'Python', level: 75, category: 'Programming' },
                                                        { name: 'AWS', level: 70, category: 'Cloud' }
                                                    ].map((skill) => (
                                                        <div key={skill.name} className="flex items-center justify-between">
                                                            <div className="flex items-center space-x-3">
                                                                <span className="font-medium text-gray-900">{skill.name}</span>
                                                                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">{skill.category}</span>
                                                            </div>
                                                            <div className="flex items-center space-x-3">
                                                                <div className="w-24 bg-gray-200 rounded-full h-2">
                                                                    <div
                                                                        className="bg-blue-600 h-2 rounded-full"
                                                                        style={{ width: `${skill.level}%` }}
                                                                    ></div>
                                                                </div>
                                                                <span className="text-sm text-gray-600 w-8">{skill.level}%</span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Experience */}
                                            <div className="bg-white rounded-xl border border-gray-200 p-6">
                                                <div className="flex items-center justify-between mb-4">
                                                    <h4 className="text-lg font-semibold text-gray-900">Work Experience</h4>
                                                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                                                        Add Experience
                                                    </button>
                                                </div>
                                                <div className="space-y-6">
                                                    {[
                                                        {
                                                            title: 'Senior Frontend Developer',
                                                            company: 'TechCorp Inc.',
                                                            period: '2022 - Present',
                                                            description: 'Led development of React-based dashboard applications serving 10k+ users. Improved performance by 40% through code optimization and lazy loading.'
                                                        },
                                                        {
                                                            title: 'Frontend Developer',
                                                            company: 'StartupX',
                                                            period: '2020 - 2022',
                                                            description: 'Built responsive web applications using React and TypeScript. Collaborated with design team to implement pixel-perfect UI components.'
                                                        }
                                                    ].map((exp, index) => (
                                                        <div key={index} className="border-l-2 border-blue-200 pl-4">
                                                            <div className="flex items-center justify-between mb-2">
                                                                <h5 className="font-semibold text-gray-900">{exp.title}</h5>
                                                                <span className="text-sm text-gray-500">{exp.period}</span>
                                                            </div>
                                                            <p className="text-blue-600 font-medium mb-2">{exp.company}</p>
                                                            <p className="text-gray-600 text-sm">{exp.description}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Profile Sidebar */}
                                        <div className="space-y-6">
                                            {/* Profile Completion */}
                                            <div className="bg-white rounded-xl border border-gray-200 p-6">
                                                <h4 className="text-lg font-semibold text-gray-900 mb-4">Profile Completion</h4>
                                                <div className="space-y-4">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm text-gray-600">Overall Progress</span>
                                                        <span className="text-sm font-medium text-gray-900">85%</span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                        <div className="bg-green-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        {[
                                                            { item: 'Basic Info', completed: true },
                                                            { item: 'Professional Summary', completed: true },
                                                            { item: 'Skills', completed: true },
                                                            { item: 'Experience', completed: true },
                                                            { item: 'Education', completed: false },
                                                            { item: 'Portfolio', completed: false }
                                                        ].map((item) => (
                                                            <div key={item.item} className="flex items-center space-x-2">
                                                                <div className={`w-4 h-4 rounded-full flex items-center justify-center ${item.completed ? 'bg-green-100' : 'bg-gray-100'
                                                                    }`}>
                                                                    {item.completed ? (
                                                                        <Check className="w-3 h-3 text-green-600" />
                                                                    ) : (
                                                                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                                                    )}
                                                                </div>
                                                                <span className={`text-sm ${item.completed ? 'text-gray-900' : 'text-gray-500'
                                                                    }`}>{item.item}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Resume Upload */}
                                            <div className="bg-white rounded-xl border border-gray-200 p-6">
                                                <h4 className="text-lg font-semibold text-gray-900 mb-4">Resume</h4>
                                                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                                                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                                    <p className="text-sm text-gray-600 mb-2">Upload your resume</p>
                                                    <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                                                        Choose File
                                                    </button>
                                                </div>
                                                <div className="mt-4">
                                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                        <div className="flex items-center space-x-3">
                                                            <FileText className="w-5 h-5 text-gray-400" />
                                                            <span className="text-sm text-gray-900">John_Doe_Resume.pdf</span>
                                                        </div>
                                                        <button className="text-red-600 hover:text-red-700">
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Visibility Settings */}
                                            <div className="bg-white rounded-xl border border-gray-200 p-6">
                                                <h4 className="text-lg font-semibold text-gray-900 mb-4">Profile Visibility</h4>
                                                <div className="space-y-3">
                                                    <label className="flex items-center space-x-3">
                                                        <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                                        <span className="text-sm text-gray-700">Visible to recruiters</span>
                                                    </label>
                                                    <label className="flex items-center space-x-3">
                                                        <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                                        <span className="text-sm text-gray-700">Show in job recommendations</span>
                                                    </label>
                                                    <label className="flex items-center space-x-3">
                                                        <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                                        <span className="text-sm text-gray-700">Allow direct messages</span>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'jobs' && (
                            <div className="space-y-6">
                                {/* Search Header - Large with Light Colors */}
                                <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-2xl border border-blue-200 p-10">
                                    <div className="flex items-center space-x-4 mb-4">
                                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                            <Search className="w-7 h-7 text-blue-600" />
                                        </div>
                                        <h2 className="text-3xl font-bold text-gray-900">Smart Job Search</h2>
                                    </div>
                                    <p className="text-gray-600 text-lg leading-relaxed">
                                        Find your perfect job with AI-powered matching and advanced filters. Discover opportunities tailored to your skills and preferences.
                                    </p>
                                </div>

                                {/* Search Controls - Compact */}
                                <div className="bg-white rounded-lg border border-gray-200 p-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                                        <div className="relative">
                                            <Search className="w-4 h-4 absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="text"
                                                placeholder="Job title, keywords..."
                                                className="pl-8 pr-3 py-1.5 w-full border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                        <div className="relative">
                                            <MapPin className="w-4 h-4 absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="text"
                                                placeholder="Location"
                                                className="pl-8 pr-3 py-1.5 w-full border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                        <select className="px-2.5 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                            <option>All Experience Levels</option>
                                            <option>Entry Level</option>
                                            <option>Mid Level</option>
                                            <option>Senior Level</option>
                                            <option>Executive</option>
                                        </select>
                                        <select className="px-2.5 py-1.5 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                            <option>All Job Types</option>
                                            <option>Full-time</option>
                                            <option>Part-time</option>
                                            <option>Contract</option>
                                            <option>Remote</option>
                                        </select>
                                    </div>

                                    <div className="flex flex-wrap gap-1.5 mb-3">
                                        <span className="text-xs font-medium text-gray-700">Quick Filters:</span>
                                        {['Remote', 'High Salary', 'Startup', 'Fortune 500', 'AI/ML', 'React'].map((filter) => (
                                            <button key={filter} className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-full text-xs hover:bg-blue-100 hover:text-blue-700 transition-colors">
                                                {filter}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <label className="flex items-center space-x-1.5">
                                                <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5" />
                                                <span className="text-xs text-gray-700">Remote only</span>
                                            </label>
                                            <label className="flex items-center space-x-1.5">
                                                <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5" />
                                                <span className="text-xs text-gray-700">AI Match 80%+</span>
                                            </label>
                                        </div>
                                        <button className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm">
                                            Search Jobs
                                        </button>
                                    </div>
                                </div>

                                {/* Search Results */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <p className="text-gray-600">Found 247 jobs matching your criteria</p>
                                        <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                                            <option>Best Match</option>
                                            <option>Most Recent</option>
                                            <option>Highest Salary</option>
                                            <option>Company Rating</option>
                                        </select>
                                    </div>

                                    {/* Job Results */}
                                    <div className="space-y-4">
                                        {[
                                            {
                                                id: 1,
                                                title: 'Senior React Developer',
                                                company: 'TechCorp Inc.',
                                                location: 'San Francisco, CA',
                                                salary: '$140k - $180k',
                                                match: 96,
                                                posted: '2 days ago',
                                                remote: true,
                                                skills: ['React', 'TypeScript', 'Node.js'],
                                                logo: 'https://images.unsplash.com/photo-1549924231-f129b911e442?w=40&h=40&fit=crop'
                                            },
                                            {
                                                id: 2,
                                                title: 'Frontend Engineer',
                                                company: 'StartupX',
                                                location: 'New York, NY',
                                                salary: '$120k - $160k',
                                                match: 91,
                                                posted: '1 day ago',
                                                remote: false,
                                                skills: ['React', 'Vue.js', 'GraphQL'],
                                                logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=40&h=40&fit=crop'
                                            },
                                            {
                                                id: 3,
                                                title: 'Full Stack Developer',
                                                company: 'Innovation Labs',
                                                location: 'Remote',
                                                salary: '$110k - $150k',
                                                match: 88,
                                                posted: '3 days ago',
                                                remote: true,
                                                skills: ['React', 'Python', 'AWS'],
                                                logo: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=40&h=40&fit=crop'
                                            }
                                        ].map((job) => (
                                            <div key={job.id} className="bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-200 p-6">
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="flex items-start space-x-4">
                                                        <img src={job.logo} alt={job.company} className="w-12 h-12 rounded-lg object-cover" />
                                                        <div className="flex-1">
                                                            <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                                                            <p className="text-gray-600">{job.company}</p>
                                                            <div className="flex items-center text-sm text-gray-500 mt-1 space-x-4">
                                                                <div className="flex items-center">
                                                                    <MapPin className="w-4 h-4 mr-1" />
                                                                    {job.location}
                                                                </div>
                                                                <div className="flex items-center">
                                                                    <Clock className="w-4 h-4 mr-1" />
                                                                    {job.posted}
                                                                </div>
                                                                {job.remote && (
                                                                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                                                                        Remote
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className={`px-3 py-1 rounded-lg text-sm font-medium ${getMatchColor(job.match)}`}>
                                                        {job.match}% Match
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="text-lg font-semibold text-gray-900">{job.salary}</div>
                                                    <div className="flex flex-wrap gap-1">
                                                        {job.skills.map((skill) => (
                                                            <span key={skill} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                                                                {skill}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="flex space-x-3">
                                                    <button className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                                        Apply Now
                                                    </button>
                                                    <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                                                        <Save className="w-4 h-4" />
                                                    </button>
                                                    <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Interview Management Tab */}
                        {activeTab === 'interviews' && (
                            <div className="space-y-6">
                                {/* Interview Header */}
                                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200 p-6">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <Calendar className="w-5 h-5 text-blue-600" />
                                        <h3 className="text-lg font-semibold text-gray-900">Interview Management</h3>
                                    </div>
                                    <p className="text-gray-600 text-sm">
                                        Manage your interviews, prepare effectively, and track your progress.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    {/* Main Interview Content */}
                                    <div className="lg:col-span-2 space-y-6">
                                        {/* Upcoming Interviews */}
                                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <h4 className="text-lg font-semibold text-gray-900">Upcoming Interviews</h4>
                                                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                                                    Schedule New
                                                </button>
                                            </div>
                                            <div className="space-y-4">
                                                {[
                                                    {
                                                        id: 1,
                                                        company: 'TechCorp Inc.',
                                                        position: 'Senior React Developer',
                                                        date: 'Tomorrow',
                                                        time: '2:00 PM',
                                                        type: 'Technical Interview',
                                                        interviewer: 'Sarah Johnson',
                                                        status: 'confirmed',
                                                        logo: 'https://images.unsplash.com/photo-1549924231-f129b911e442?w=40&h=40&fit=crop'
                                                    },
                                                    {
                                                        id: 2,
                                                        company: 'StartupX',
                                                        position: 'Frontend Engineer',
                                                        date: 'Dec 28',
                                                        time: '10:00 AM',
                                                        type: 'HR Interview',
                                                        interviewer: 'Mike Chen',
                                                        status: 'pending',
                                                        logo: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=40&h=40&fit=crop'
                                                    }
                                                ].map((interview) => (
                                                    <div key={interview.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors">
                                                        <div className="flex items-start justify-between mb-3">
                                                            <div className="flex items-start space-x-3">
                                                                <img src={interview.logo} alt={interview.company} className="w-10 h-10 rounded-lg object-cover" />
                                                                <div>
                                                                    <h5 className="font-semibold text-gray-900">{interview.position}</h5>
                                                                    <p className="text-blue-600 font-medium">{interview.company}</p>
                                                                    <p className="text-sm text-gray-600">{interview.type} with {interview.interviewer}</p>
                                                                </div>
                                                            </div>
                                                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${interview.status === 'confirmed'
                                                                ? 'bg-green-100 text-green-700'
                                                                : 'bg-yellow-100 text-yellow-700'
                                                                }`}>
                                                                {interview.status}
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                                                                <div className="flex items-center">
                                                                    <Calendar className="w-4 h-4 mr-1" />
                                                                    {interview.date}
                                                                </div>
                                                                <div className="flex items-center">
                                                                    <Clock className="w-4 h-4 mr-1" />
                                                                    {interview.time}
                                                                </div>
                                                            </div>
                                                            <div className="flex space-x-2">
                                                                <button className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200 transition-colors">
                                                                    Prepare
                                                                </button>
                                                                <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition-colors">
                                                                    Reschedule
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Interview History */}
                                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                                            <h4 className="text-lg font-semibold text-gray-900 mb-4">Interview History</h4>
                                            <div className="space-y-4">
                                                {[
                                                    {
                                                        company: 'Innovation Labs',
                                                        position: 'Full Stack Developer',
                                                        date: 'Dec 20, 2024',
                                                        result: 'Passed',
                                                        feedback: 'Strong technical skills, good problem-solving approach',
                                                        nextStep: 'Final round scheduled'
                                                    },
                                                    {
                                                        company: 'DataTech Solutions',
                                                        position: 'React Developer',
                                                        date: 'Dec 18, 2024',
                                                        result: 'Pending',
                                                        feedback: 'Waiting for feedback from the team',
                                                        nextStep: 'Decision expected by Dec 30'
                                                    }
                                                ].map((history, index) => (
                                                    <div key={index} className="border-l-2 border-gray-200 pl-4">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <h5 className="font-semibold text-gray-900">{history.position}</h5>
                                                            <div className={`px-2 py-1 rounded-full text-xs font-medium ${history.result === 'Passed'
                                                                ? 'bg-green-100 text-green-700'
                                                                : history.result === 'Pending'
                                                                    ? 'bg-yellow-100 text-yellow-700'
                                                                    : 'bg-red-100 text-red-700'
                                                                }`}>
                                                                {history.result}
                                                            </div>
                                                        </div>
                                                        <p className="text-blue-600 font-medium mb-1">{history.company}</p>
                                                        <p className="text-sm text-gray-600 mb-2">{history.date}</p>
                                                        <p className="text-sm text-gray-700 mb-1"><strong>Feedback:</strong> {history.feedback}</p>
                                                        <p className="text-sm text-gray-700"><strong>Next Step:</strong> {history.nextStep}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Interview Preparation */}
                                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                                            <h4 className="text-lg font-semibold text-gray-900 mb-4">Interview Preparation</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {[
                                                    {
                                                        title: 'Technical Questions',
                                                        description: 'Practice coding problems and technical concepts',
                                                        icon: Code,
                                                        color: 'blue'
                                                    },
                                                    {
                                                        title: 'Behavioral Questions',
                                                        description: 'Prepare STAR method responses',
                                                        icon: MessageSquare,
                                                        color: 'green'
                                                    },
                                                    {
                                                        title: 'Company Research',
                                                        description: 'Learn about company culture and values',
                                                        icon: Building,
                                                        color: 'purple'
                                                    },
                                                    {
                                                        title: 'Mock Interviews',
                                                        description: 'Practice with AI-powered mock interviews',
                                                        icon: Video,
                                                        color: 'orange'
                                                    }
                                                ].map((prep, index) => {
                                                    const Icon = prep.icon;
                                                    return (
                                                        <div key={index} className={`border border-gray-200 rounded-lg p-4 hover:border-${prep.color}-300 hover:shadow-md transition-all cursor-pointer`}>
                                                            <div className={`w-10 h-10 bg-${prep.color}-100 rounded-lg flex items-center justify-center mb-3`}>
                                                                <Icon className={`w-5 h-5 text-${prep.color}-600`} />
                                                            </div>
                                                            <h5 className="font-semibold text-gray-900 mb-2">{prep.title}</h5>
                                                            <p className="text-sm text-gray-600">{prep.description}</p>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Interview Sidebar */}
                                    <div className="space-y-6">
                                        {/* Interview Stats */}
                                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                                            <h4 className="text-lg font-semibold text-gray-900 mb-4">Interview Stats</h4>
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-600">Total Interviews</span>
                                                    <span className="text-lg font-semibold text-gray-900">12</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-600">Success Rate</span>
                                                    <span className="text-lg font-semibold text-green-600">75%</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm text-gray-600">Upcoming</span>
                                                    <span className="text-lg font-semibold text-blue-600">2</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Quick Actions */}
                                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                                            <h4 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h4>
                                            <div className="space-y-3">
                                                <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                                                    Schedule Interview
                                                </button>
                                                <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm">
                                                    Practice Questions
                                                </button>
                                                <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm">
                                                    Mock Interview
                                                </button>
                                            </div>
                                        </div>

                                        {/* Interview Tips */}
                                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                                            <h4 className="text-lg font-semibold text-gray-900 mb-4">Interview Tips</h4>
                                            <div className="space-y-3">
                                                {[
                                                    'Research the company thoroughly',
                                                    'Prepare specific examples using STAR method',
                                                    'Practice coding problems daily',
                                                    'Prepare thoughtful questions to ask',
                                                    'Test your tech setup beforehand'
                                                ].map((tip, index) => (
                                                    <div key={index} className="flex items-start space-x-2">
                                                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                                                        <p className="text-sm text-gray-700">{tip}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Calendar Integration */}
                                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                                            <h4 className="text-lg font-semibold text-gray-900 mb-4">Calendar</h4>
                                            <div className="text-center">
                                                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                                                <p className="text-sm text-gray-600 mb-3">Sync with your calendar</p>
                                                <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                                                    Connect Calendar
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Career Insights Tab */}
                        {activeTab === 'career' && (
                            <div className="space-y-6">
                                {/* Career Insights Header */}
                                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200 p-6">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <TrendingUp className="w-5 h-5 text-purple-600" />
                                        <h3 className="text-lg font-semibold text-gray-900">Career Insights</h3>
                                    </div>
                                    <p className="text-gray-600 text-sm">
                                        AI-powered insights to accelerate your career growth and optimize your job search strategy.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    {/* Main Insights Content */}
                                    <div className="lg:col-span-2 space-y-6">
                                        {/* Career Progress */}
        