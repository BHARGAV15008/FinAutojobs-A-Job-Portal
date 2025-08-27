import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import {
    Search,
    MapPin,
    Briefcase,
    DollarSign,
    Clock,
    Building2,
    Users,
    Star,
    Filter,
    ChevronLeft,
    ChevronRight,
    Heart,
    Share2,
    Home,
    Car,
    Award,
    Calendar,
    TrendingUp,
    Bookmark,
    Target,
    Zap,
    Eye,
    ExternalLink,
    CheckCircle,
    AlertCircle,
    Lightbulb,
    Bell
} from 'lucide-react';

const JobsPage = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        search: '',
        location: '',
        department: '',
        jobType: '',
        salaryRange: [0, 1500000],
        experience: '',
        workMode: '',
        skills: [],
        jobRole: '',
        page: 1
    });
    const [pagination, setPagination] = useState({
        page: 1,
        pages: 1,
        total: 0
    });

    // Mock data for demonstration
    const mockJobs = [
        {
            id: 1,
            title: "Senior Financial Analyst",
            company: "Goldman Sachs",
            companyLogo: "GS",
            location: "Mumbai, Maharashtra",
            department: "Finance",
            type: "Full-time",
            salary: "₹12,00,000 - ₹18,00,000",
            salaryMin: 1200000,
            salaryMax: 1800000,
            posted: "2 days ago",
            workMode: "Work from office",
            experience: "3-5 years",
            description: "We are seeking a Senior Financial Analyst to join our dynamic team in Mumbai...",
            skills: ["Excel", "Python", "SQL", "Financial Modeling", "Risk Analysis"],
            jobRole: "Financial Analyst",
            featured: true,
            urgentHiring: false,
            verified: true,
            applicants: "24+",
            rating: 4.5
        },
        {
            id: 2,
            title: "Automotive Design Engineer",
            company: "Tata Motors",
            companyLogo: "TM",
            location: "Pune, Maharashtra",
            department: "Engineering",
            type: "Full-time",
            salary: "₹8,00,000 - ₹12,00,000",
            salaryMin: 800000,
            salaryMax: 1200000,
            posted: "1 day ago",
            workMode: "Work from office",
            experience: "2-4 years",
            description: "Join our innovative team working on next-generation electric vehicles...",
            skills: ["CAD", "CATIA", "Automotive Systems", "Testing", "Design"],
            jobRole: "Automotive Engineer",
            featured: false,
            urgentHiring: true,
            verified: true,
            applicants: "15+",
            rating: 4.2
        },
        {
            id: 3,
            title: "Investment Banking Associate",
            company: "ICICI Bank",
            companyLogo: "IB",
            location: "Delhi, NCR",
            department: "Finance",
            type: "Full-time",
            salary: "₹15,00,000 - ₹25,00,000",
            salaryMin: 1500000,
            salaryMax: 2500000,
            posted: "3 days ago",
            workMode: "Hybrid",
            experience: "4-6 years",
            description: "Looking for experienced Investment Banking Associate for our Delhi office...",
            skills: ["Financial Analysis", "Valuation", "Excel", "PowerPoint", "Due Diligence"],
            jobRole: "Investment Banker",
            featured: true,
            urgentHiring: false,
            verified: true,
            applicants: "50+",
            rating: 4.7
        },
        {
            id: 4,
            title: "Automotive Test Engineer",
            company: "Mahindra & Mahindra",
            companyLogo: "MM",
            location: "Chennai, Tamil Nadu",
            department: "Engineering",
            type: "Contract",
            salary: "₹6,00,000 - ₹9,00,000",
            salaryMin: 600000,
            salaryMax: 900000,
            posted: "5 days ago",
            workMode: "Work from field",
            experience: "1-3 years",
            description: "Seeking Test Engineer for automotive testing and validation projects...",
            skills: ["Testing", "Validation", "Automotive Standards", "Data Analysis"],
            jobRole: "Test Engineer",
            featured: false,
            urgentHiring: true,
            verified: false,
            applicants: "8+",
            rating: 4.0
        },
        {
            id: 5,
            title: "Financial Risk Analyst",
            company: "HDFC Bank",
            companyLogo: "HD",
            location: "Bangalore, Karnataka",
            department: "Finance",
            type: "Part-time",
            salary: "₹4,00,000 - ₹7,00,000",
            salaryMin: 400000,
            salaryMax: 700000,
            posted: "1 week ago",
            workMode: "Work from home",
            experience: "2-4 years",
            description: "Remote opportunity for Financial Risk Analyst with flexible working hours...",
            skills: ["Risk Management", "Statistics", "Python", "R", "Financial Modeling"],
            jobRole: "Risk Analyst",
            featured: false,
            urgentHiring: false,
            verified: true,
            applicants: "12+",
            rating: 4.3
        }
    ];

    // Filter options data
    const jobTypes = ['Full-time', 'Part-time', 'Seasonal', 'Contract', 'Temporary', 'Internship', 'At-will'];
    const workModes = ['Work from office', 'Work from home', 'Work from field', 'Hybrid'];
    const locations = ['Mumbai, Maharashtra', 'Delhi, NCR', 'Bangalore, Karnataka', 'Pune, Maharashtra', 'Chennai, Tamil Nadu', 'Hyderabad, Telangana', 'Kolkata, West Bengal', 'Ahmedabad, Gujarat'];
    const departments = ['Finance', 'Engineering', 'IT', 'HR', 'Marketing', 'Operations', 'Sales', 'Legal'];
    const jobRoles = ['Financial Analyst', 'Investment Banker', 'Risk Analyst', 'Automotive Engineer', 'Test Engineer', 'Design Engineer', 'Quality Engineer', 'Sales Manager'];
    const skillsList = ['Excel', 'Python', 'SQL', 'Financial Modeling', 'Risk Analysis', 'CAD', 'CATIA', 'Testing', 'Validation', 'Design', 'PowerPoint', 'Due Diligence', 'Statistics', 'R', 'Data Analysis', 'Automotive Standards'];

    useEffect(() => {
        fetchJobs();
    }, [filters]);

    const fetchJobs = async () => {
        setLoading(true);
        try {
            setTimeout(() => {
                setJobs(mockJobs);
                setPagination({ page: 1, pages: 1, total: mockJobs.length });
                setLoading(false);
            }, 1000);
        } catch (err) {
            setError('Failed to fetch jobs');
            setLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
                        <div className="space-y-4">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="bg-white p-6 rounded-lg shadow-sm">
                                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Jobs</h2>
                        <p className="text-gray-600">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            <div className="w-full px-0 py-4">
                {/* Header */}
                <div className="text-center mb-6 px-4">
                    <div className="flex justify-center items-center gap-2 mb-4">
                        <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg">
                            <Briefcase className="h-4 w-4 text-white" />
                        </div>
                        <div className="p-2 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg">
                            <Building2 className="h-4 w-4 text-white" />
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Premium <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Finance & Auto</span> Jobs
                    </h1>
                    <p className="text-sm text-gray-600 max-w-2xl mx-auto mb-4">
                        Discover exclusive opportunities in Finance and Automotive industries
                    </p>
                    <div className="flex justify-center items-center gap-6 mt-2 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            <span>10,000+ Jobs</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            <span>500+ Companies</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Star className="h-4 w-4" />
                            <span>Verified</span>
                        </div>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-4 mb-6 mx-4">
                    <div className="flex items-center gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                                <input
                                    type="text"
                                    placeholder="Search jobs, companies..."
                                    value={filters.search}
                                    onChange={(e) => handleFilterChange('search', e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:border-blue-500 focus:ring-0 text-sm placeholder-gray-400 bg-white/90"
                                />
                            </div>
                        </div>
                        <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg text-sm font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300">
                            Search
                        </button>
                    </div>
                    <div className="flex justify-center items-center flex-wrap gap-3 mt-4">
                        <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium cursor-pointer hover:bg-blue-200 transition-colors">
                            Financial Analyst
                        </span>
                        <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium cursor-pointer hover:bg-green-200 transition-colors">
                            Automotive Engineer
                        </span>
                        <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium cursor-pointer hover:bg-purple-200 transition-colors">
                            Investment Banking
                        </span>
                        <span className="px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-medium cursor-pointer hover:bg-orange-200 transition-colors">
                            Vehicle Design
                        </span>
                    </div>
                </div>

                {/* Responsive Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mx-4">
                    {/* Left Column - Extra Filters */}
                    <div className="lg:col-span-3 hidden lg:block">
                        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-md border border-white/20 p-6 sticky top-8">
                            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <Filter className="h-5 w-5 text-blue-600" />
                                Filters
                            </h3>
                            {/* Date Posted */}
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-blue-600" />
                                    Date
                                </label>
                                <div className="space-y-2">
                                    <label className="flex items-center group cursor-pointer">
                                        <input type="radio" name="datePosted" value="all" defaultChecked className="w-4 h-4 text-blue-600 border border-gray-300 focus:ring-blue-500 focus:ring-1" />
                                        <span className="ml-2 text-sm text-gray-700 group-hover:text-gray-900 transition-colors">All</span>
                                    </label>
                                    <label className="flex items-center group cursor-pointer">
                                        <input type="radio" name="datePosted" value="24h" className="w-4 h-4 text-blue-600 border border-gray-300 focus:ring-blue-500 focus:ring-1" />
                                        <span className="ml-2 text-sm text-gray-700 group-hover:text-gray-900 transition-colors">24h</span>
                                    </label>
                                    <label className="flex items-center group cursor-pointer">
                                        <input type="radio" name="datePosted" value="3d" className="w-4 h-4 text-blue-600 border border-gray-300 focus:ring-blue-500 focus:ring-1" />
                                        <span className="ml-2 text-sm text-gray-700 group-hover:text-gray-900 transition-colors">Last 3 days</span>
                                    </label>
                                    <label className="flex items-center group cursor-pointer">
                                        <input type="radio" name="datePosted" value="7d" className="w-4 h-4 text-blue-600 border border-gray-300 focus:ring-blue-500 focus:ring-1" />
                                        <span className="ml-2 text-sm text-gray-700 group-hover:text-gray-900 transition-colors">Last 7 days</span>
                                    </label>
                                </div>
                            </div>

                            {/* Salary Range with Progress Bar */}
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4 text-green-600" />
                                    Salary
                                </label>
                                <div className="mb-3">
                                    <p className="text-sm text-gray-600 mb-2">Minimum monthly salary</p>
                                    <div className="bg-green-600 text-white px-3 py-2 rounded text-sm font-medium inline-block mb-3">
                                        ₹{(filters.salaryRange[0] / 100000).toFixed(0)}L
                                    </div>
                                    <div className="relative">
                                        <input
                                            type="range"
                                            min="0"
                                            max="1500000"
                                            step="50000"
                                            value={filters.salaryRange[0]}
                                            onChange={(e) => handleFilterChange('salaryRange', [parseInt(e.target.value), filters.salaryRange[1]])}
                                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                                        />
                                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                                            <span>0</span>
                                            <span>1.5 Lakhs</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Work Mode */}
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                    <Home className="h-4 w-4 text-purple-600" />
                                    Work Mode
                                </label>
                                <div className="space-y-2">
                                    {workModes.map((mode) => (
                                        <label key={mode} className="flex items-center group cursor-pointer">
                                            <input
                                                type="checkbox"
                                                value={mode}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        handleFilterChange('workMode', mode);
                                                    } else {
                                                        handleFilterChange('workMode', '');
                                                    }
                                                }}
                                                className="w-4 h-4 text-blue-600 border border-gray-300 rounded focus:ring-blue-500 focus:ring-1"
                                            />
                                            <span className="ml-2 text-sm text-gray-700 group-hover:text-gray-900 transition-colors">{mode}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Department */}
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                    <Building2 className="h-4 w-4 text-indigo-600" />
                                    Department
                                </label>
                                <div className="mb-3">
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                        <input
                                            type="text"
                                            placeholder="Search"
                                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-gray-50 text-sm"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2 max-h-32 overflow-y-auto">
                                    {departments.map((dept) => (
                                        <label key={dept} className="flex items-center group cursor-pointer">
                                            <input type="checkbox" className="w-4 h-4 text-blue-600 border border-gray-300 rounded focus:ring-blue-500 focus:ring-1" />
                                            <span className="ml-2 text-sm text-gray-700 group-hover:text-gray-900 transition-colors">{dept}</span>
                                        </label>
                                    ))}
                                </div>
                                <button className="text-teal-600 text-sm font-medium mt-2 hover:text-teal-700 transition-colors">
                                    Show 38 more ▷
                                </button>
                            </div>

                            {/* Sort By */}
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                    <Award className="h-4 w-4 text-yellow-600" />
                                    Sort By
                                </label>
                                <div className="space-y-2">
                                    <label className="flex items-center group cursor-pointer">
                                        <input type="radio" name="sortBy" value="relevant" defaultChecked className="w-4 h-4 text-blue-600 border border-gray-300 focus:ring-blue-500 focus:ring-1" />
                                        <span className="ml-2 text-sm text-gray-700 group-hover:text-gray-900 transition-colors">Relevant</span>
                                    </label>
                                    <label className="flex items-center group cursor-pointer">
                                        <input type="radio" name="sortBy" value="salary" className="w-4 h-4 text-blue-600 border border-gray-300 focus:ring-blue-500 focus:ring-1" />
                                        <span className="ml-2 text-sm text-gray-700 group-hover:text-gray-900 transition-colors">Salary - High to low</span>
                                    </label>
                                    <label className="flex items-center group cursor-pointer">
                                        <input type="radio" name="sortBy" value="date" className="w-4 h-4 text-blue-600 border border-gray-300 focus:ring-blue-500 focus:ring-1" />
                                        <span className="ml-2 text-sm text-gray-700 group-hover:text-gray-900 transition-colors">Date posted - New to Old</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Column - Job Cards */}
                    <div className="lg:col-span-6 col-span-1">
                        <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-md border border-white/20 p-4 min-h-[300px]">
                            {/* Job Cards */}
                            <div className="space-y-3">
                                {jobs && jobs.length > 0 ? (
                                    jobs.map((job) => (
                                        <div key={job.id} className={`bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 p-4 border ${job.featured ? 'border-blue-200 bg-gradient-to-r from-blue-50/30 to-purple-50/30' : 'border-gray-200 hover:border-blue-300'} relative group`}>
                                            {/* Top Row - Company Logo, Title, and Actions */}
                                            <div className="flex items-start justify-between gap-3 mb-3">
                                                <div className="flex items-start gap-3 flex-1">
                                                    {/* Company Logo */}
                                                    <div className={`w-10 h-10 ${job.jobRole.includes('Financial') || job.jobRole.includes('Investment') || job.jobRole.includes('Risk') ? 'bg-gradient-to-br from-emerald-500 to-teal-600' : 'bg-gradient-to-br from-blue-500 to-indigo-600'} rounded-lg flex items-center justify-center shadow-sm flex-shrink-0`}>
                                                        <span className="text-white font-bold text-sm">{job.companyLogo}</span>
                                                    </div>
                                                    {/* Job Info */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div className="flex-1 min-w-0">
                                                                <h4 className="text-lg font-semibold text-gray-900 mb-1 leading-tight truncate">
                                                                    <Link to={`/job/${job.id}`} className="hover:text-blue-600 transition-colors">{job.title}</Link>
                                                                </h4>
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <p className="text-sm text-gray-600 font-medium">{job.company}</p>
                                                                    {job.verified && <CheckCircle className="h-3.5 w-3.5 text-green-500" />}
                                                                    {job.urgentHiring && (
                                                                        <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs font-medium">
                                                                            Urgent
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                                                    <div className="flex items-center gap-1">
                                                                        <Star className="h-3.5 w-3.5 text-yellow-500" />
                                                                        <span>{job.rating}</span>
                                                                    </div>
                                                                    <span>•</span>
                                                                    <div className="flex items-center gap-1">
                                                                        <Users className="h-3.5 w-3.5" />
                                                                        <span>{job.applicants} applied</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            {/* Action Buttons */}
                                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                                <button className="p-2 rounded hover:bg-red-50 transition-colors group">
                                                                    <Heart className="h-4 w-4 text-gray-400 group-hover:text-red-500 transition-colors" />
                                                                </button>
                                                                <button className="p-2 rounded hover:bg-blue-50 transition-colors group">
                                                                    <Bookmark className="h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                                                                </button>
                                                                <button className="p-2 rounded hover:bg-gray-50 transition-colors group">
                                                                    <Share2 className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Middle Row - Job Details */}
                                            <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 mb-3">
                                                <div className="flex items-center gap-1 text-sm text-gray-600 bg-gray-50/80 rounded px-3 py-2">
                                                    <MapPin className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
                                                    <span className="truncate">{job.location.split(',')[0]}</span>
                                                </div>
                                                <div className="flex items-center gap-1 text-sm text-gray-600 bg-purple-50/80 rounded px-3 py-2">
                                                    <Home className="h-3.5 w-3.5 text-purple-500 flex-shrink-0" />
                                                    <span className="truncate">{job.workMode.replace('Work from ', '')}</span>
                                                </div>
                                                <div className="flex items-center gap-1 text-sm text-gray-600 bg-emerald-50/80 rounded px-3 py-2">
                                                    <DollarSign className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
                                                    <span className="font-semibold text-emerald-700 truncate">{job.salary.split(' - ')[0]}</span>
                                                </div>
                                                <div className="flex items-center gap-1 text-sm text-gray-600 bg-blue-50/80 rounded px-3 py-2">
                                                    <Briefcase className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
                                                    <span className="truncate">{job.experience}</span>
                                                </div>
                                            </div>

                                            {/* Skills and Tags */}
                                            <div className="flex flex-wrap gap-2 mb-3">
                                                <span className={`px-3 py-1 rounded text-sm font-medium ${job.type === 'Full-time' ? 'bg-emerald-100 text-emerald-700' : job.type === 'Part-time' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
                                                    {job.type}
                                                </span>
                                                {job.skills?.slice(0, 3).map((skill, index) => (
                                                    <span key={index} className="px-3 py-1 bg-blue-50 text-blue-700 rounded text-sm font-medium border border-blue-100">
                                                        {skill}
                                                    </span>
                                                ))}
                                                {job.skills?.length > 3 && (
                                                    <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded text-sm font-medium">
                                                        +{job.skills.length - 3}
                                                    </span>
                                                )}
                                                {job.featured && (
                                                    <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-white px-3 py-1 text-sm font-semibold rounded">
                                                        ✨ FEATURED
                                                    </span>
                                                )}
                                            </div>

                                            {/* Bottom Row - Time and Apply Button */}
                                            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                                                <div className="flex items-center gap-3 text-sm text-gray-500">
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="h-3.5 w-3.5" />
                                                        <span>{job.posted}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Eye className="h-3.5 w-3.5" />
                                                        <span>View salary & more info</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <button className="border border-gray-300 text-gray-600 px-3 py-1.5 rounded text-sm font-medium hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50/50 transition-all duration-200">
                                                        Details
                                                    </button>
                                                    <button className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-1.5 rounded text-sm font-semibold hover:from-blue-700 hover:to-blue-800 transition-all duration-200">
                                                        Apply
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Search className="h-8 w-8 text-gray-400" />
                                        </div>
                                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Jobs Found</h3>
                                        <p className="text-gray-600">Try adjusting your search criteria</p>
                                    </div>
                                )}
                            </div>

                            {/* Pagination */}
                            <div className="flex items-center justify-center gap-4 mt-8">
                                <button
                                    disabled={pagination.page <= 1}
                                    onClick={() => setFilters(prev => ({ ...prev, page: (prev.page || 1) - 1 }))}
                                    className="px-5 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <div className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">
                                    Page {pagination.page} of {pagination.pages}
                                </div>
                                <button
                                    disabled={pagination.page >= pagination.pages}
                                    onClick={() => setFilters(prev => ({ ...prev, page: (prev.page || 1) + 1 }))}
                                    className="px-5 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Job Roles & Skills */}
                    <div className="lg:col-span-3 hidden lg:block">
                        <div className="bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-6 sticky top-8">
                            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <Star className="h-5 w-5 text-purple-600" />
                                Job Roles & Skills
                            </h3>
                            {/* Job Roles */}
                            <div className="mb-6">
                                <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                    <Briefcase className="h-4 w-4 text-blue-600" />
                                    Job Roles
                                </h4>
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {jobRoles.map((role) => (
                                        <label key={role} className="flex items-center group cursor-pointer hover:bg-blue-50 p-2 rounded-lg transition-colors">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 text-blue-600 border border-gray-300 rounded focus:ring-blue-500 focus:ring-1"
                                                checked={filters.jobRole.includes(role)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setFilters(prev => ({
                                                            ...prev,
                                                            jobRole: [...prev.jobRole, role]
                                                        }));
                                                    } else {
                                                        setFilters(prev => ({
                                                            ...prev,
                                                            jobRole: prev.jobRole.filter(r => r !== role)
                                                        }));
                                                    }
                                                }}
                                            />
                                            <span className="ml-2 text-sm text-gray-700 group-hover:text-gray-900 transition-colors">{role}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Skills */}
                            <div className="mb-6">
                                <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                    <Award className="h-4 w-4 text-green-600" />
                                    Required Skills
                                </h4>
                                <div className="mb-3">
                                    <input
                                        type="text"
                                        placeholder="Search skills..."
                                        className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                                <div className="space-y-2 max-h-56 overflow-y-auto">
                                    {skillsList.slice(0, 15).map((skill) => (
                                        <label key={skill} className="flex items-center group cursor-pointer hover:bg-green-50 p-2 rounded-lg transition-colors">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 text-green-600 border border-gray-300 rounded focus:ring-green-500 focus:ring-1"
                                                checked={filters.skills.includes(skill)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setFilters(prev => ({
                                                            ...prev,
                                                            skills: [...prev.skills, skill]
                                                        }));
                                                    } else {
                                                        setFilters(prev => ({
                                                            ...prev,
                                                            skills: prev.skills.filter(s => s !== skill)
                                                        }));
                                                    }
                                                }}
                                            />
                                            <span className="ml-2 text-sm text-gray-700 group-hover:text-gray-900 transition-colors">{skill}</span>
                                        </label>
                                    ))}
                                    {skillsList.length > 15 && (
                                        <button className="text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors p-2 rounded-lg hover:bg-blue-50 w-full text-left">
                                            Show {skillsList.length - 15} more skills →
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Locations */}
                            <div className="mb-6">
                                <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-purple-600" />
                                    Locations
                                </h4>
                                <div className="space-y-2 max-h-40 overflow-y-auto">
                                    {locations.map((location) => (
                                        <label key={location} className="flex items-center group cursor-pointer hover:bg-purple-50 p-2 rounded-lg transition-colors">
                                            <input
                                                type="radio"
                                                name="location"
                                                className="w-4 h-4 text-purple-600 border border-gray-300 focus:ring-purple-500 focus:ring-1"
                                                checked={filters.location === location}
                                                onChange={() => {
                                                    setFilters(prev => ({
                                                        ...prev,
                                                        location: location
                                                    }));
                                                }}
                                            />
                                            <span className="ml-2 text-sm text-gray-700 group-hover:text-gray-900 transition-colors">{location}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Clear Filters */}
                            <div className="pt-4 border-t border-gray-200">
                                <button
                                    onClick={() => setFilters({
                                        search: '',
                                        location: '',
                                        department: '',
                                        jobType: '',
                                        salaryRange: [0, 1500000],
                                        experience: '',
                                        workMode: '',
                                        skills: [],
                                        jobRole: '',
                                        page: 1
                                    })}
                                    className="w-full bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 py-3 px-4 rounded-xl text-sm font-medium hover:from-gray-200 hover:to-gray-300 transition-all duration-300 shadow-sm hover:shadow-md"
                                >
                                    🗑️ Clear All Filters
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Job Market Insights (Visible on lg+) */}
                <div className="lg:col-span-12 lg:block hidden mt-6 mx-4">
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                        {/* Job Market Insights */}
                        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
                            <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <TrendingUp className="h-4 w-4 text-blue-600" />
                                Job Market Insights
                            </h3>
                            <div className="space-y-3">
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-lg border border-blue-100">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm font-medium text-blue-800">Tech Jobs</span>
                                        <span className="text-sm text-blue-600">+15%</span>
                                    </div>
                                    <div className="w-full bg-blue-200 rounded-full h-2">
                                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                                    </div>
                                </div>
                                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-lg border border-green-100">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm font-medium text-green-800">Finance</span>
                                        <span className="text-sm text-green-600">+8%</span>
                                    </div>
                                    <div className="w-full bg-green-200 rounded-full h-2">
                                        <div className="bg-green-600 h-2 rounded-full" style={{ width: '60%' }}></div>
                                    </div>
                                </div>
                                <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-3 rounded-lg border border-purple-100">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm font-medium text-purple-800">Healthcare</span>
                                        <span className="text-sm text-purple-600">+12%</span>
                                    </div>
                                    <div className="w-full bg-purple-200 rounded-full h-2">
                                        <div className="bg-purple-600 h-2 rounded-full" style={{ width: '70%' }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Trending Jobs */}
                        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
                            <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Star className="h-4 w-4 text-yellow-500" />
                                Trending Jobs
                            </h3>
                            <div className="space-y-3">
                                {[
                                    { title: 'AI/ML Engineer', company: 'TechCorp', salary: '₹25-40L', trend: 'hot' },
                                    { title: 'Full Stack Developer', company: 'StartupXYZ', salary: '₹15-25L', trend: 'rising' },
                                    { title: 'Data Scientist', company: 'DataInc', salary: '₹20-35L', trend: 'hot' },
                                    { title: 'DevOps Engineer', company: 'CloudTech', salary: '₹18-30L', trend: 'rising' },
                                    { title: 'Product Manager', company: 'InnovateCo', salary: '₹22-40L', trend: 'stable' }
                                ].map((job, index) => (
                                    <div key={index} className="p-3 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-all cursor-pointer">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-semibold text-gray-900 truncate">{job.title}</h4>
                                                <p className="text-sm text-gray-600 truncate">{job.company}</p>
                                                <p className="text-sm font-medium text-green-600">{job.salary}</p>
                                            </div>
                                            <div className="ml-2 flex-shrink-0">
                                                {job.trend === 'hot' && <span className="text-sm bg-red-100 text-red-600 px-2 py-1 rounded-full font-medium">🔥</span>}
                                                {job.trend === 'rising' && <span className="text-sm bg-green-100 text-green-600 px-2 py-1 rounded-full font-medium">📈</span>}
                                                {job.trend === 'stable' && <span className="text-sm bg-blue-100 text-blue-600 px-2 py-1 rounded-full font-medium">📊</span>}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Quick Apply Tips */}
                        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl shadow-lg border border-yellow-200 p-4">
                            <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Lightbulb className="h-4 w-4 text-yellow-600" />
                                Quick Tips
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                                    <p className="text-sm text-gray-700">Update your profile for better matches</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                                    <p className="text-sm text-gray-700">Apply within 24 hours for higher visibility</p>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                                    <p className="text-sm text-gray-700">Customize your resume for each role</p>
                                </div>
                            </div>
                        </div>

                        {/* Job Alerts */}
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-lg border border-blue-200 p-4">
                            <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Bell className="h-4 w-4 text-blue-600" />
                                Job Alerts
                            </h3>
                            <p className="text-sm text-gray-600 mb-4">Get notified about new jobs matching your preferences</p>
                            <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2.5 px-4 rounded-lg text-sm font-medium hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-sm hover:shadow-md">
                                Set Up Alerts
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JobsPage;
