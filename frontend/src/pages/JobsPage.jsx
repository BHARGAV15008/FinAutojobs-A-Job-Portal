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
    Bell,
    Sparkles,
    Layers,
    Grid,
    BarChart3
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

    // Filter options data - Finance and Automotive focused
    const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Internship', 'Temporary', 'Consultant'];
    const workModes = ['Work from office', 'Work from home', 'Hybrid', 'Work from field'];
    const locations = ['Mumbai, Maharashtra', 'Delhi, NCR', 'Bangalore, Karnataka', 'Pune, Maharashtra', 'Chennai, Tamil Nadu', 'Hyderabad, Telangana', 'Gurugram, Haryana', 'Noida, Uttar Pradesh', 'Kolkata, West Bengal', 'Ahmedabad, Gujarat', 'Coimbatore, Tamil Nadu', 'Aurangabad, Maharashtra'];
    const departments = ['Investment Banking', 'Corporate Finance', 'Risk Management', 'Financial Planning & Analysis', 'Treasury & Cash Management', 'Automotive Engineering', 'Vehicle Design', 'Manufacturing Engineering', 'Quality Assurance', 'Research & Development', 'Supply Chain Management', 'Sales & Marketing'];
    const jobRoles = ['Financial Analyst', 'Investment Banking Analyst', 'Risk Analyst', 'Credit Analyst', 'Portfolio Manager', 'Treasury Analyst', 'Automotive Engineer', 'Mechanical Engineer', 'Electrical Engineer', 'Design Engineer', 'Test Engineer', 'Quality Engineer', 'Manufacturing Engineer', 'Product Manager'];
    const skillsList = [
        // Finance Skills
        'Excel', 'Financial Modeling', 'Valuation', 'Risk Analysis', 'Bloomberg Terminal', 'SQL', 'Python', 'R', 'MATLAB', 'VBA', 'PowerPoint', 'Tableau', 'Power BI', 'SAP', 'Oracle', 'Treasury Management', 'Credit Analysis', 'Portfolio Management', 'Derivatives', 'Fixed Income', 'Equity Research', 'Financial Reporting', 'GAAP', 'IFRS', 'CFA', 'FRM',
        // Automotive Skills
        'AutoCAD', 'CATIA V5', 'SolidWorks', 'ANSYS', 'MATLAB Simulink', 'PLC Programming', 'CAN Protocol', 'Automotive Testing', 'ISO/TS 16949', 'Six Sigma', 'Lean Manufacturing', 'APQP', 'FMEA', 'MSA', 'SPC', 'Engine Calibration', 'Emissions Testing', 'Vehicle Dynamics', 'Powertrain', 'Electric Vehicle', 'Hybrid Technology', 'Battery Management', 'AUTOSAR', 'Embedded Systems', 'C/C++', 'LabVIEW'
    ];

    useEffect(() => {
        fetchJobs();
    }, []); // Remove filters dependency to prevent page refresh on every filter change

    // Apply filters when user clicks the search button instead
    const applyFilters = () => {
        fetchJobs();
    };

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
        <div className="min-h-screen bg-gray-50">
            <div className="w-full px-0 py-8">
                {/* Enhanced Header */}
                <div className="text-center mb-10 px-4 py-12 bg-white rounded-xl mx-4 shadow-sm border border-gray-100">
                    <div className="flex justify-center items-center gap-4 mb-6">
                        <div className="p-4 bg-gray-200 rounded-xl shadow-sm">
                            <Briefcase className="h-8 w-8 text-gray-700" />
                        </div>
                        <div className="p-4 bg-gray-200 rounded-xl shadow-sm">
                            <Building2 className="h-8 w-8 text-gray-700" />
                        </div>
                        <div className="p-4 bg-gray-200 rounded-xl shadow-sm">
                            <Sparkles className="h-8 w-8 text-gray-700" />
                        </div>
                    </div>
                    <h1 className="text-5xl font-bold text-gray-900 mb-4 leading-tight">
                        Premium <span className="text-gray-700">Finance & Auto</span> Jobs
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
                        Discover exclusive opportunities in Finance and Automotive industries with top-tier companies
                    </p>
                    <div className="flex justify-center items-center gap-8 mt-6 text-lg text-gray-600">
                        <div className="flex items-center gap-3 bg-gray-100 px-6 py-3 rounded-lg shadow-sm">
                            <Users className="h-6 w-6 text-gray-700" />
                            <span className="font-semibold">10,000+ Jobs</span>
                        </div>
                        <div className="flex items-center gap-3 bg-gray-100 px-6 py-3 rounded-lg shadow-sm">
                            <Building2 className="h-6 w-6 text-gray-700" />
                            <span className="font-semibold">500+ Companies</span>
                        </div>
                        <div className="flex items-center gap-3 bg-gray-100 px-6 py-3 rounded-lg shadow-sm">
                            <Star className="h-6 w-6 text-gray-700" />
                            <span className="font-semibold">Verified</span>
                        </div>
                    </div>
                </div>

                {/* Compact Search & Quick Filters Bar */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-3 mb-8 mx-4">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <input
                                    type="text"
                                    placeholder="Search jobs, companies, skills..."
                                    value={filters.search}
                                    onChange={(e) => handleFilterChange('search', e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:border-gray-400 focus:ring-0 text-sm placeholder-gray-400 bg-white"
                                />
                            </div>
                        </div>
                        <select className="px-3 py-2.5 border border-gray-200 rounded-lg focus:border-gray-400 focus:ring-0 text-sm bg-white min-w-[120px]">
                            <option>All Locations</option>
                            <option>Mumbai</option>
                            <option>Delhi NCR</option>
                            <option>Bangalore</option>
                            <option>Pune</option>
                        </select>
                        <select className="px-3 py-2.5 border border-gray-200 rounded-lg focus:border-gray-400 focus:ring-0 text-sm bg-white min-w-[120px]">
                            <option>Experience</option>
                            <option>0-1 years</option>
                            <option>2-4 years</option>
                            <option>5+ years</option>
                        </select>
                        <button
                            onClick={applyFilters}
                            className="bg-gray-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-all duration-300"
                        >
                            Search
                        </button>
                    </div>
                    <div className="flex justify-center items-center flex-wrap gap-2">
                        {/* Finance Skills */}
                        <span className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium cursor-pointer hover:bg-gray-200 transition-colors">
                            Financial Analyst
                        </span>
                        <span className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium cursor-pointer hover:bg-gray-200 transition-colors">
                            Investment Banking
                        </span>
                        <span className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium cursor-pointer hover:bg-gray-200 transition-colors">
                            Risk Management
                        </span>
                        <span className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium cursor-pointer hover:bg-gray-200 transition-colors">
                            Financial Modeling
                        </span>
                        <span className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium cursor-pointer hover:bg-gray-200 transition-colors">
                            Portfolio Management
                        </span>
                        <span className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium cursor-pointer hover:bg-gray-200 transition-colors">
                            Equity Research
                        </span>

                        {/* Automotive Skills */}
                        <span className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium cursor-pointer hover:bg-gray-200 transition-colors">
                            Automotive Engineer
                        </span>
                        <span className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium cursor-pointer hover:bg-gray-200 transition-colors">
                            Vehicle Design
                        </span>
                        <span className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium cursor-pointer hover:bg-gray-200 transition-colors">
                            Powertrain Development
                        </span>
                        <span className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium cursor-pointer hover:bg-gray-200 transition-colors">
                            EV Technology
                        </span>
                        <span className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium cursor-pointer hover:bg-gray-200 transition-colors">
                            Automotive Manufacturing
                        </span>
                        <span className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium cursor-pointer hover:bg-gray-200 transition-colors">
                            ADAS Systems
                        </span>
                    </div>
                </div>

                {/* Responsive Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mx-4">
                    {/* Left Column - Extra Filters */}
                    <div className="lg:col-span-2 hidden lg:block">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 sticky top-8">
                            <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Filter className="h-4 w-4 text-gray-700" />
                                Filters
                            </h3>
                            {/* Date Posted */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-800 mb-2 flex items-center gap-1">
                                    <Calendar className="h-4 w-4 text-gray-700" />
                                    Date
                                </label>
                                <div className="space-y-1">
                                    <label className="flex items-center group cursor-pointer py-1">
                                        <input type="radio" name="datePosted" value="all" defaultChecked className="w-4 h-4 text-gray-700 border border-gray-300 focus:ring-gray-500 focus:ring-1 flex-shrink-0" />
                                        <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900 transition-colors">All</span>
                                    </label>
                                    <label className="flex items-center group cursor-pointer py-1">
                                        <input type="radio" name="datePosted" value="24h" className="w-4 h-4 text-gray-700 border border-gray-300 focus:ring-gray-500 focus:ring-1 flex-shrink-0" />
                                        <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900 transition-colors">24h</span>
                                    </label>
                                    <label className="flex items-center group cursor-pointer py-1">
                                        <input type="radio" name="datePosted" value="3d" className="w-4 h-4 text-gray-700 border border-gray-300 focus:ring-gray-500 focus:ring-1 flex-shrink-0" />
                                        <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900 transition-colors">Last 3 days</span>
                                    </label>
                                    <label className="flex items-center group cursor-pointer py-1">
                                        <input type="radio" name="datePosted" value="7d" className="w-4 h-4 text-gray-700 border border-gray-300 focus:ring-gray-500 focus:ring-1 flex-shrink-0" />
                                        <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900 transition-colors">Last 7 days</span>
                                    </label>
                                </div>
                            </div>

                            {/* Salary Range with Progress Bar */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-800 mb-2 flex items-center gap-1">
                                    <TrendingUp className="h-4 w-4 text-gray-700" />
                                    Salary
                                </label>
                                <div className="mb-2">
                                    <p className="text-sm text-gray-600 mb-1">Minimum monthly salary</p>
                                    <div className="bg-gray-700 text-white px-2 py-1 rounded text-sm font-medium inline-block mb-2">
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
                                        <div className="flex justify-between text-sm text-gray-500 mt-1">
                                            <span>0</span>
                                            <span>1.5 Lakhs</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Work Mode */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-800 mb-2 flex items-center gap-1">
                                    <Home className="h-4 w-4 text-gray-700" />
                                    Work Mode
                                </label>
                                <div className="space-y-1">
                                    {workModes.map((mode) => (
                                        <label key={mode} className="flex items-center group cursor-pointer py-1">
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
                                                className="w-4 h-4 text-gray-600 border border-gray-200 rounded focus:ring-blue-200 focus:ring-1 flex-shrink-0"
                                            />
                                            <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900 transition-colors">{mode}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Locations */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-800 mb-2 flex items-center gap-1">
                                    <MapPin className="h-4 w-4 text-gray-700" />
                                    Locations
                                </label>
                                <div className="space-y-1 max-h-24 overflow-y-auto">
                                    {locations.slice(0, 6).map((location) => (
                                        <label key={location} className="flex items-center group cursor-pointer py-1">
                                            <input
                                                type="radio"
                                                name="location"
                                                className="w-4 h-4 text-gray-600 border border-gray-300 focus:ring-gray-500 focus:ring-1 flex-shrink-0"
                                                checked={filters.location === location}
                                                onChange={() => {
                                                    setFilters(prev => ({
                                                        ...prev,
                                                        location: location
                                                    }));
                                                }}
                                            />
                                            <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900 transition-colors">{location.split(',')[0]}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Sort By */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-800 mb-2 flex items-center gap-1">
                                    <Award className="h-4 w-4 text-gray-700" />
                                    Sort By
                                </label>
                                <div className="space-y-1">
                                    <label className="flex items-center group cursor-pointer py-1">
                                        <input type="radio" name="sortBy" value="relevant" defaultChecked className="w-4 h-4 text-gray-600 border border-gray-300 focus:ring-gray-500 focus:ring-1 flex-shrink-0" />
                                        <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900 transition-colors">Relevant</span>
                                    </label>
                                    <label className="flex items-center group cursor-pointer py-1">
                                        <input type="radio" name="sortBy" value="salary" className="w-4 h-4 text-gray-600 border border-gray-300 focus:ring-gray-500 focus:ring-1 flex-shrink-0" />
                                        <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900 transition-colors">Salary - High to low</span>
                                    </label>
                                    <label className="flex items-center group cursor-pointer py-1">
                                        <input type="radio" name="sortBy" value="date" className="w-4 h-4 text-gray-600 border border-gray-300 focus:ring-gray-500 focus:ring-1 flex-shrink-0" />
                                        <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900 transition-colors">Date posted - New to Old</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Main Column - Job Cards */}
                    <div className="lg:col-span-8 col-span-1">
                        <div className="bg-gray-50/30 rounded-lg shadow-sm border border-gray-50 p-4 min-h-[300px]">
                            {/* Job Cards */}
                            <div className="space-y-3">
                                {jobs && jobs.length > 0 ? (
                                    jobs.map((job) => (
                                        <div key={job.id} className={`bg-white/70 rounded-lg shadow-sm hover:shadow transition-all duration-300 p-6 border ${job.featured ? 'border-gray-100 bg-gray-50/50' : 'border-gray-50 hover:border-gray-100'} relative group backdrop-blur-sm`}>
                                            {/* Top Row - Company Logo, Title, and Actions */}
                                            <div className="flex items-start justify-between gap-4 mb-4">
                                                <div className="flex items-start gap-4 flex-1">
                                                    {/* Company Logo */}
                                                    <div className="w-14 h-14 bg-gray-50 rounded-lg flex items-center justify-center shadow-sm flex-shrink-0 border border-gray-100">
                                                        <span className="text-gray-600 font-bold text-lg">{job.companyLogo}</span>
                                                    </div>
                                                    {/* Job Info */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-start justify-between gap-3">
                                                            <div className="flex-1 min-w-0">
                                                                <h4 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
                                                                    <Link to={`/job/${job.id}`} className="hover:text-gray-700 transition-colors">{job.title}</Link>
                                                                </h4>
                                                                <div className="flex items-center gap-3 mb-2">
                                                                    <p className="text-base text-gray-700 font-semibold">{job.company}</p>
                                                                    {job.verified && <CheckCircle className="h-4 w-4 text-gray-700" />}
                                                                    {job.urgentHiring && (
                                                                        <span className="bg-orange-50 text-orange-600 px-3 py-1.5 rounded-lg text-xs font-semibold border border-orange-100">
                                                                            🚀 Urgent Hiring
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <div className="flex items-center gap-3 text-base text-gray-600">
                                                                    <div className="flex items-center gap-1.5">
                                                                        <Star className="h-4 w-4 text-gray-700" />
                                                                        <span className="font-medium">{job.rating}</span>
                                                                    </div>
                                                                    <span className="text-gray-400">•</span>
                                                                    <div className="flex items-center gap-1.5">
                                                                        <Users className="h-4 w-4 text-gray-600" />
                                                                        <span className="font-medium">{job.applicants} applied</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            {/* Action Buttons */}
                                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                                <button className="p-2.5 rounded-lg hover:bg-gray-100 transition-colors group">
                                                                    <Heart className="h-5 w-5 text-gray-400 group-hover:text-gray-700 transition-colors" />
                                                                </button>
                                                                <button className="p-2.5 rounded-lg hover:bg-gray-100 transition-colors group">
                                                                    <Bookmark className="h-5 w-5 text-gray-400 group-hover:text-gray-700 transition-colors" />
                                                                </button>
                                                                <button className="p-2.5 rounded-lg hover:bg-gray-100 transition-colors group">
                                                                    <Share2 className="h-5 w-5 text-gray-400 group-hover:text-gray-700 transition-colors" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Middle Row - Job Details */}
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                                                <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50/50 rounded-lg px-4 py-3 border border-gray-100/50">
                                                    <MapPin className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                                    <span className="truncate font-medium">{job.location.split(',')[0]}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50/80 rounded-lg px-4 py-3">
                                                    <Home className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                                    <span className="truncate font-medium">{job.workMode.replace('Work from ', '')}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50/80 rounded-lg px-4 py-3">
                                                    <DollarSign className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                                    <span className="font-bold text-gray-700 truncate">{job.salary.split(' - ')[0]}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50/80 rounded-lg px-4 py-3">
                                                    <Briefcase className="h-4 w-4 text-gray-500 flex-shrink-0" />
                                                    <span className="truncate font-medium">{job.experience}</span>
                                                </div>
                                            </div>

                                            {/* Skills and Tags */}
                                            <div className="flex flex-wrap gap-2 mb-4">
                                                <span className={`px-4 py-2 rounded-lg text-sm font-semibold ${job.type === 'Full-time' ? 'bg-blue-50 text-blue-600 border border-blue-100' : job.type === 'Part-time' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-purple-50 text-purple-600 border border-purple-100'}`}>
                                                    {job.type}
                                                </span>
                                                {job.skills?.slice(0, 3).map((skill, index) => (
                                                    <span key={index} className="px-4 py-2 bg-gray-50/70 text-gray-600 rounded-lg text-sm font-semibold border border-gray-100/70">
                                                        {skill}
                                                    </span>
                                                ))}
                                                {job.skills?.length > 3 && (
                                                    <span className="px-4 py-2 bg-gray-50 text-gray-500 rounded-lg text-sm font-semibold border border-gray-100">
                                                        +{job.skills.length - 3} more
                                                    </span>
                                                )}
                                                {job.featured && (
                                                    <span className="bg-yellow-50 text-yellow-600 px-4 py-2 text-sm font-bold rounded-lg shadow-sm border border-yellow-100">
                                                        ✨ FEATURED
                                                    </span>
                                                )}
                                            </div>

                                            {/* Bottom Row - Time and Apply Button */}
                                            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                                    <div className="flex items-center gap-1.5">
                                                        <Clock className="h-4 w-4 text-gray-500" />
                                                        <span className="font-medium">{job.posted}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <Eye className="h-4 w-4 text-gray-500" />
                                                        <span className="font-medium">View details</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <button className="border border-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm font-semibold hover:border-gray-300 hover:text-gray-700 hover:bg-gray-50 transition-all duration-200">
                                                        View Details
                                                    </button>
                                                    <button className="bg-blue-50 text-blue-600 px-6 py-2 rounded-lg text-sm font-bold hover:bg-blue-100 transition-all duration-200 shadow-sm border border-blue-100">
                                                        Apply Now
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-12">
                                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
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
                                    className="px-5 py-2 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600"
                                >
                                    <ChevronLeft className="w-5 h-5" />
                                </button>
                                <div className="px-5 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium border border-blue-100">
                                    Page {pagination.page} of {pagination.pages}
                                </div>
                                <button
                                    disabled={pagination.page >= pagination.pages}
                                    onClick={() => setFilters(prev => ({ ...prev, page: (prev.page || 1) + 1 }))}
                                    className="px-5 py-2 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-gray-600"
                                >
                                    <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Job Roles & Skills */}
                    <div className="lg:col-span-2 hidden lg:block">
                        <div className="bg-gray-50/50 rounded-lg shadow-sm border border-gray-100/50 p-6 sticky top-8 backdrop-blur-sm">
                            <h3 className="text-base font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <Star className="h-5 w-5 text-gray-700" />
                                Job Roles & Skills
                            </h3>
                            {/* Job Roles */}
                            <div className="mb-6">
                                <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                    <Briefcase className="h-4 w-4 text-gray-700" />
                                    Job Roles
                                </h4>
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {jobRoles.map((role) => (
                                        <label key={role} className="flex items-center group cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 text-gray-600 border border-gray-200 rounded focus:ring-blue-200 focus:ring-1 flex-shrink-0"
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
                                            <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900 transition-colors">{role}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Skills */}
                            <div className="mb-6">
                                <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                    <Award className="h-4 w-4 text-gray-700" />
                                    Required Skills
                                </h4>
                                <div className="mb-3">
                                    <input
                                        type="text"
                                        placeholder="Search skills..."
                                        className="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-200 focus:border-blue-200 bg-gray-50/50"
                                    />
                                </div>
                                <div className="space-y-2 max-h-56 overflow-y-auto">
                                    {skillsList.slice(0, 15).map((skill) => (
                                        <label key={skill} className="flex items-center group cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 text-gray-600 border border-gray-300 rounded focus:ring-gray-500 focus:ring-1 flex-shrink-0"
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
                                            <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900 transition-colors">{skill}</span>
                                        </label>
                                    ))}
                                    {skillsList.length > 15 && (
                                        <button className="text-gray-600 text-sm font-medium hover:text-gray-700 transition-colors p-2 rounded-lg hover:bg-gray-50 w-full text-left">
                                            Show {skillsList.length - 15} more skills →
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Department */}
                            <div className="mb-4">
                                <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                                    <Building2 className="h-4 w-4 text-gray-700" />
                                    Department
                                </label>
                                <div className="mb-3">
                                    <div className="relative">
                                        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                        <input
                                            type="text"
                                            placeholder="Search"
                                            className="w-full pl-8 pr-3 py-2.5 border border-gray-200 rounded-lg focus:border-blue-200 focus:ring-1 focus:ring-blue-200 bg-gray-50/50 text-sm"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1 max-h-24 overflow-y-auto">
                                    {departments.slice(0, 6).map((dept) => (
                                        <label key={dept} className="flex items-center group cursor-pointer py-1 hover:bg-gray-50 px-2 rounded-lg transition-colors">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 text-gray-600 border border-gray-300 rounded focus:ring-gray-500 focus:ring-1 flex-shrink-0"
                                                checked={filters.department === dept}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        handleFilterChange('department', dept);
                                                    } else {
                                                        handleFilterChange('department', '');
                                                    }
                                                }}
                                            />
                                            <span className="ml-3 text-sm text-gray-700 group-hover:text-gray-900 transition-colors">{dept}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Clear Filters */}
                            <div className="pt-4 border-t border-gray-100">
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
                                    className="w-full bg-gray-50 text-gray-600 py-3 px-4 rounded-lg text-sm font-medium hover:bg-gray-100 transition-all duration-300 shadow-sm hover:shadow-md border border-gray-100"
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
                        <div className="bg-gray-50/50 rounded-xl shadow-lg border border-gray-100/50 p-4 backdrop-blur-sm">
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
