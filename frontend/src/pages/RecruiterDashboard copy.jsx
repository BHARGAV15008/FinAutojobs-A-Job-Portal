// import React, { useState, useEffect } from 'react';
// import {
//     Users,
//     FileText,
//     Briefcase,
//     Calendar,
//     MapPin,
//     DollarSign,
//     Eye,
//     Edit,
//     Trash2,
//     Grid,
//     List,
//     Search,
//     Filter,
//     Download,
//     Upload,
//     Plus,
//     CheckCircle,
//     XCircle,
//     Clock,
//     Building,
//     TrendingUp,
//     UserCheck,
//     UserX,
//     Bell,
//     Settings,
//     MoreVertical,
//     Star,
//     Award,
//     Target,
//     Zap,
//     ArrowUpRight,
//     Activity,
//     ChevronDown,
//     Mail,
//     Phone,
//     ExternalLink
// } from 'lucide-react';

// const ModernRecruiterDashboard = () => {
//     const [activeTab, setActiveTab] = useState('overview');
//     const [viewMode, setViewMode] = useState('cards');
//     const [jobs, setJobs] = useState([
//         {
//             id: 1,
//             title: 'Senior React Developer',
//             company_name: 'Tech Innovations Inc.',
//             location: 'San Francisco, CA',
//             salary_min: 120000,
//             salary_max: 180000,
//             status: 'active',
//             created_at: '2024-01-15',
//             type: 'Full-time',
//             remote: true,
//             urgency: 'high'
//         },
//         {
//             id: 2,
//             title: 'UX Designer',
//             company_name: 'Design Studio',
//             location: 'New York, NY',
//             salary_min: 90000,
//             salary_max: 130000,
//             status: 'active',
//             created_at: '2024-01-10',
//             type: 'Full-time',
//             remote: false,
//             urgency: 'medium'
//         },
//         {
//             id: 3,
//             title: 'Product Manager',
//             company_name: 'StartupX',
//             location: 'Austin, TX',
//             salary_min: 110000,
//             salary_max: 160000,
//             status: 'inactive',
//             created_at: '2024-01-05',
//             type: 'Full-time',
//             remote: true,
//             urgency: 'low'
//         }
//     ]);

//     const [applications, setApplications] = useState([
//         {
//             id: 1,
//             applicant_name: 'Sarah Johnson',
//             applicant_email: 'sarah.j@email.com',
//             job_title: 'Senior React Developer',
//             job_id: 1,
//             status: 'pending',
//             applied_at: '2024-01-20',
//             cover_letter: true,
//             resume_url: 'resume1.pdf',
//             score: 92,
//             experience: '5+ years',
//             skills: ['React', 'TypeScript', 'Node.js']
//         },
//         {
//             id: 2,
//             applicant_name: 'Michael Chen',
//             applicant_email: 'michael.c@email.com',
//             job_title: 'UX Designer',
//             job_id: 2,
//             status: 'reviewed',
//             applied_at: '2024-01-18',
//             cover_letter: true,
//             resume_url: 'resume2.pdf',
//             score: 88,
//             experience: '3+ years',
//             skills: ['Figma', 'Adobe XD', 'Prototyping']
//         },
//         {
//             id: 3,
//             applicant_name: 'Emma Wilson',
//             applicant_email: 'emma.w@email.com',
//             job_title: 'Senior React Developer',
//             job_id: 1,
//             status: 'shortlisted',
//             applied_at: '2024-01-16',
//             cover_letter: false,
//             resume_url: 'resume3.pdf',
//             score: 95,
//             experience: '7+ years',
//             skills: ['React', 'GraphQL', 'AWS']
//         }
//     ]);

//     const [loading, setLoading] = useState(false);
//     const [searchTerm, setSearchTerm] = useState('');
//     const [statusFilter, setStatusFilter] = useState('all');
//     const [jobFilter, setJobFilter] = useState('all');

//     // Mock user data
//     const user = {
//         name: 'Alex Morgan',
//         role: 'Senior Recruiter',
//         avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face'
//     };

//     const updateApplicationStatus = (applicationId, newStatus) => {
//         setApplications(prev =>
//             prev.map(app =>
//                 app.id === applicationId
//                     ? { ...app, status: newStatus }
//                     : app
//             )
//         );
//     };

//     const filteredApplications = applications.filter(app => {
//         const matchesSearch = app.applicant_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//             app.job_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//             app.applicant_email?.toLowerCase().includes(searchTerm.toLowerCase());
//         const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
//         const matchesJob = jobFilter === 'all' || app.job_id === parseInt(jobFilter);
//         return matchesSearch && matchesStatus && matchesJob;
//     });

//     const filteredJobs = jobs.filter(job => {
//         const matchesSearch = job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//             job.location?.toLowerCase().includes(searchTerm.toLowerCase());
//         return matchesSearch;
//     });

//     const getStatusColor = (status) => {
//         switch (status) {
//             case 'pending': return 'bg-amber-50 text-amber-700 border-amber-200';
//             case 'reviewed': return 'bg-blue-50 text-blue-700 border-blue-200';
//             case 'shortlisted': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
//             case 'rejected': return 'bg-red-50 text-red-700 border-red-200';
//             case 'active': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
//             case 'inactive': return 'bg-slate-50 text-slate-700 border-slate-200';
//             case 'closed': return 'bg-red-50 text-red-700 border-red-200';
//             default: return 'bg-slate-50 text-slate-700 border-slate-200';
//         }
//     };

//     const getUrgencyColor = (urgency) => {
//         switch (urgency) {
//             case 'high': return 'bg-red-100 text-red-800';
//             case 'medium': return 'bg-yellow-100 text-yellow-800';
//             case 'low': return 'bg-green-100 text-green-800';
//             default: return 'bg-gray-100 text-gray-800';
//         }
//     };

//     const getScoreColor = (score) => {
//         if (score >= 90) return 'text-emerald-600 bg-emerald-50';
//         if (score >= 80) return 'text-blue-600 bg-blue-50';
//         if (score >= 70) return 'text-amber-600 bg-amber-50';
//         return 'text-red-600 bg-red-50';
//     };

//     // Modern Job Card Component
//     const JobCard = ({ job }) => {
//         const jobApplications = applications.filter(app => app.job_id === job.id);
//         return (
//             <div className="group bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl hover:border-slate-300 transition-all duration-300 overflow-hidden">
//                 <div className="p-6">
//                     <div className="flex justify-between items-start mb-4">
//                         <div className="flex items-start space-x-3">
//                             <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
//                                 {job.company_name.charAt(0)}
//                             </div>
//                             <div>
//                                 <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
//                                     {job.title}
//                                 </h3>
//                                 <p className="text-slate-600 font-medium">{job.company_name}</p>
//                             </div>
//                         </div>
//                         <div className="flex flex-col items-end space-y-2">
//                             <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(job.status)}`}>
//                                 {job.status}
//                             </span>
//                             {job.urgency && (
//                                 <span className={`px-2 py-1 rounded-full text-xs font-medium ${getUrgencyColor(job.urgency)}`}>
//                                     {job.urgency} priority
//                                 </span>
//                             )}
//                         </div>
//                     </div>

//                     <div className="space-y-3 mb-6">
//                         <div className="flex items-center text-slate-600">
//                             <MapPin className="w-4 h-4 mr-2 text-slate-400" />
//                             <span className="text-sm">{job.location}</span>
//                             {job.remote && (
//                                 <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
//                                     Remote
//                                 </span>
//                             )}
//                         </div>
//                         <div className="flex items-center text-slate-600">
//                             <DollarSign className="w-4 h-4 mr-2 text-slate-400" />
//                             <span className="text-sm font-medium">
//                                 ${job.salary_min?.toLocaleString()} - ${job.salary_max?.toLocaleString()}
//                             </span>
//                         </div>
//                         <div className="flex items-center text-slate-600">
//                             <Users className="w-4 h-4 mr-2 text-slate-400" />
//                             <span className="text-sm">{jobApplications.length} applications</span>
//                         </div>
//                         <div className="flex items-center text-slate-600">
//                             <Calendar className="w-4 h-4 mr-2 text-slate-400" />
//                             <span className="text-sm">Posted {new Date(job.created_at).toLocaleDateString()}</span>
//                         </div>
//                     </div>

//                     <div className="flex items-center justify-between pt-4 border-t border-slate-100">
//                         <div className="flex space-x-2">
//                             <button className="flex items-center px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium">
//                                 <Eye className="w-4 h-4 mr-1" />
//                                 View
//                             </button>
//                             <button className="flex items-center px-3 py-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors text-sm font-medium">
//                                 <Edit className="w-4 h-4 mr-1" />
//                                 Edit
//                             </button>
//                         </div>
//                         <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
//                             <MoreVertical className="w-4 h-4" />
//                         </button>
//                     </div>
//                 </div>
//             </div>
//         );
//     };

//     // Modern Application Card Component
//     const ApplicationCard = ({ application }) => (
//         <div className="group bg-white rounded-2xl shadow-sm border border-slate-200 hover:shadow-xl hover:border-slate-300 transition-all duration-300 overflow-hidden">
//             <div className="p-6">
//                 <div className="flex justify-between items-start mb-4">
//                     <div className="flex items-start space-x-4">
//                         <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
//                             {application.applicant_name.charAt(0)}
//                         </div>
//                         <div>
//                             <h3 className="text-xl font-bold text-slate-900 group-hover:text-purple-600 transition-colors">
//                                 {application.applicant_name}
//                             </h3>
//                             <p className="text-slate-600 font-medium">{application.job_title}</p>
//                             <div className="flex items-center space-x-2 mt-1">
//                                 <Mail className="w-3 h-3 text-slate-400" />
//                                 <span className="text-sm text-slate-500">{application.applicant_email}</span>
//                             </div>
//                         </div>
//                     </div>
//                     <div className="flex flex-col items-end space-y-2">
//                         <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(application.status)}`}>
//                             {application.status}
//                         </span>
//                         {application.score && (
//                             <div className={`px-2 py-1 rounded-lg text-xs font-bold ${getScoreColor(application.score)}`}>
//                                 {application.score}% match
//                             </div>
//                         )}
//                     </div>
//                 </div>

//                 <div className="space-y-3 mb-6">
//                     <div className="flex items-center justify-between">
//                         <span className="text-sm text-slate-600">Experience</span>
//                         <span className="text-sm font-semibold text-slate-900">{application.experience}</span>
//                     </div>
//                     <div className="flex items-center text-slate-600">
//                         <Calendar className="w-4 h-4 mr-2 text-slate-400" />
//                         <span className="text-sm">Applied {new Date(application.applied_at).toLocaleDateString()}</span>
//                     </div>
//                     {application.skills && (
//                         <div>
//                             <span className="text-sm text-slate-600 block mb-2">Key Skills:</span>
//                             <div className="flex flex-wrap gap-1">
//                                 {application.skills.slice(0, 3).map((skill, index) => (
//                                     <span key={index} className="px-2 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-medium">
//                                         {skill}
//                                     </span>
//                                 ))}
//                             </div>
//                         </div>
//                     )}
//                 </div>

//                 <div className="grid grid-cols-2 gap-2 mb-4">
//                     <button
//                         onClick={() => updateApplicationStatus(application.id, 'shortlisted')}
//                         className="flex items-center justify-center px-3 py-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors text-sm font-medium"
//                     >
//                         <CheckCircle className="w-4 h-4 mr-1" />
//                         Shortlist
//                     </button>
//                     <button
//                         onClick={() => updateApplicationStatus(application.id, 'rejected')}
//                         className="flex items-center justify-center px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm font-medium"
//                     >
//                         <XCircle className="w-4 h-4 mr-1" />
//                         Reject
//                     </button>
//                 </div>

//                 <div className="flex items-center justify-between pt-4 border-t border-slate-100">
//                     <div className="flex space-x-2">
//                         <button className="flex items-center px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium">
//                             <Eye className="w-4 h-4 mr-1" />
//                             Review
//                         </button>
//                         {application.resume_url && (
//                             <button className="flex items-center px-3 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors text-sm font-medium">
//                                 <Download className="w-4 h-4 mr-1" />
//                                 Resume
//                             </button>
//                         )}
//                     </div>
//                     <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
//                         <MoreVertical className="w-4 h-4" />
//                     </button>
//                 </div>
//             </div>
//         </div>
//     );

//     return (
//         <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
//             {/* Header */}
//             <div className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-50">
//                 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//                     <div className="flex justify-between items-center py-4">
//                         <div className="flex items-center space-x-4">
//                             <div className="flex items-center space-x-3">
//                                 <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
//                                     <Building className="w-5 h-5 text-white" />
//                                 </div>
//                                 <div>
//                                     <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
//                                         TalentHub
//                                     </h1>
//                                     <p className="text-sm text-slate-500">Recruiter Dashboard</p>
//                                 </div>
//                             </div>
//                         </div>
//                         <div className="flex items-center space-x-4">
//                             <button className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
//                                 <Bell className="w-5 h-5" />
//                                 <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
//                             </button>
//                             <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors">
//                                 <Settings className="w-5 h-5" />
//                             </button>
//                             <div className="flex items-center space-x-3 pl-4 border-l border-slate-200">
//                                 <img
//                                     src={user.avatar}
//                                     alt={user.name}
//                                     className="w-10 h-10 rounded-xl object-cover shadow-lg"
//                                 />
//                                 <div className="hidden sm:block">
//                                     <p className="text-sm font-semibold text-slate-900">{user.name}</p>
//                                     <p className="text-xs text-slate-500">{user.role}</p>
//                                 </div>
//                                 <ChevronDown className="w-4 h-4 text-slate-400" />
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
//                 {/* Stats Cards */}
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
//                     <div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-sm border border-white/20 p-6 hover:shadow-lg transition-all duration-300">
//                         <div className="flex items-center justify-between">
//                             <div>
//                                 <p className="text-sm font-medium text-slate-600 mb-1">Active Jobs</p>
//                                 <p className="text-3xl font-bold text-slate-900">
//                                     {jobs.filter(job => job.status === 'active').length}
//                                 </p>
//                                 <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center">
//                                     <ArrowUpRight className="w-3 h-3 mr-1" />
//                                     +12% this month
//                                 </p>
//                             </div>
//                             <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
//                                 <Briefcase className="w-6 h-6 text-white" />
//                             </div>
//                         </div>
//                     </div>

//                     <div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-sm border border-white/20 p-6 hover:shadow-lg transition-all duration-300">
//                         <div className="flex items-center justify-between">
//                             <div>
//                                 <p className="text-sm font-medium text-slate-600 mb-1">Applications</p>
//                                 <p className="text-3xl font-bold text-slate-900">{applications.length}</p>
//                                 <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center">
//                                     <ArrowUpRight className="w-3 h-3 mr-1" />
//                                     +8% this week
//                                 </p>
//                             </div>
//                             <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
//                                 <Users className="w-6 h-6 text-white" />
//                             </div>
//                         </div>
//                     </div>

//                     <div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-sm border border-white/20 p-6 hover:shadow-lg transition-all duration-300">
//                         <div className="flex items-center justify-between">
//                             <div>
//                                 <p className="text-sm font-medium text-slate-600 mb-1">Shortlisted</p>
//                                 <p className="text-3xl font-bold text-slate-900">
//                                     {applications.filter(app => app.status === 'shortlisted').length}
//                                 </p>
//                                 <p className="text-xs text-purple-600 font-medium mt-1 flex items-center">
//                                     <Star className="w-3 h-3 mr-1" />
//                                     Top candidates
//                                 </p>
//                             </div>
//                             <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
//                                 <UserCheck className="w-6 h-6 text-white" />
//                             </div>
//                         </div>
//                     </div>

//                     <div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-sm border border-white/20 p-6 hover:shadow-lg transition-all duration-300">
//                         <div className="flex items-center justify-between">
//                             <div>
//                                 <p className="text-sm font-medium text-slate-600 mb-1">Pending</p>
//                                 <p className="text-3xl font-bold text-slate-900">
//                                     {applications.filter(app => app.status === 'pending').length}
//                                 </p>
//                                 <p className="text-xs text-amber-600 font-medium mt-1 flex items-center">
//                                     <Clock className="w-3 h-3 mr-1" />
//                                     Needs review
//                                 </p>
//                             </div>
//                             <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
//                                 <Clock className="w-6 h-6 text-white" />
//                             </div>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Navigation Tabs */}
//                 <div className="bg-white/60 backdrop-blur-xl rounded-2xl shadow-sm border border-white/20 mb-8">
//                     <div className="border-b border-slate-200/60">
//                         <nav className="flex space-x-8 px-6">
//                             {[
//                                 { id: 'overview', name: 'Overview', icon: Activity },
//                                 { id: 'applications', name: 'Applications', icon: FileText },
//                                 { id: 'jobs', name: 'Job Postings', icon: Briefcase },
//                                 { id: 'analytics', name: 'Analytics', icon: TrendingUp }
//                             ].map((tab) => {
//                                 const Icon = tab.icon;
//                                 return (
//                                     <button
//                                         key={tab.id}
//                                         onClick={() => setActiveTab(tab.id)}
//                                         className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
//                                                 ? 'border-blue-500 text-blue-600'
//                                                 : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
//                                             }`}
//                                     >
//                                         <Icon className="w-5 h-5 mr-2" />
//                                         {tab.name}
//                                     </button>
//                                 );
//                             })}
//                         </nav>
//                     </div>

//                     {/* Tab Content */}
//                     <div className="p-6">
//                         {activeTab === 'overview' && (
//                             <div className="space-y-6">
//                                 <div className="flex justify-between items-center">
//                                     <h2 className="text-2xl font-bold text-slate-900">Dashboard Overview</h2>
//                                     <button className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl">
//                                         <Plus className="w-4 h-4 mr-2" />
//                                         New Job Post
//                                     </button>
//                                 </div>

//                                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//                                     <div className="lg:col-span-2 bg-slate-50/50 rounded-2xl p-6 border border-slate-200/60">
//                                         <div className="flex items-center justify-between mb-4">
//                                             <h3 className="text-lg font-semibold text-slate-900">Recent Applications</h3>
//                                             <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
//                                                 View all
//                                             </button>
//                                         </div>
//                                         <div className="space-y-3">
//                                             {applications.slice(0, 5).map((app) => (
//                                                 <div key={app.id} className="flex items-center justify-between p-4 bg-white/80 rounded-xl hover:bg-white transition-colors">
//                                                     <div className="flex items-center space-x-3">
//                                                         <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center text-white font-semibold">
//                                                             {app.applicant_name.charAt(0)}
//                                                         </div>
//                                                         <div>
//                                                             <p className="font-medium text-slate-900">{app.applicant_name}</p>
//                                                             <p className="text-sm text-slate-500">{app.job_title}</p>
//                                                         </div>
//                                                     </div>
//                                                     <div className="flex items-center space-x-2">
//                                                         {app.score && (
//                                                             <div className={`px-2 py-1 rounded-lg text-xs font-bold ${getScoreColor(app.score)}`}>
//                                                                 {app.score}%
//                                                             </div>
//                                                         )}
//                                                         <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(app.status)}`}>
//                                                             {app.status}
//                                                         </span>
//                                                     </div>
//                                                 </div>
//                                             ))}
//                                         </div>
//                                     </div>

//                                     <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-200/60">
//                                         <h3 className="text-lg font-semibold text-slate-900 mb-4">Quick Actions</h3>
//                                         <div className="space-y-3">
//                                             <button className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl">
//                                                 <Plus className="w-4 h-4 mr-2" />
//                                                 Post New Job
//                                             </button>
//                                             <button className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl hover:from-emerald-700 hover:to-emerald-800 transition-all duration-300 shadow-lg hover:shadow-xl">
//                                                 <Users className="w-4 h-4 mr-2" />
//                                                 Review Applications
//                                             </button>
//                                             <button className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-300 shadow-lg hover:shadow-xl">
//                                                 <TrendingUp className="w-4 h-4 mr-2" />
//                                                 View Analytics
//                                             </button>
//                                             <button className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-amber-600 to-amber-700 text-white rounded-xl hover:from-amber-700 hover:to-amber-800 transition-all duration-300 shadow-lg hover:shadow-xl">
//                                                 <Zap className="w-4 h-4 mr-2" />
//                                                 AI Insights
//                                             </button>
//                                         </div>
//                                     </div>
//                                 </div>
//                             </div>
//                         )}

//                         {activeTab === 'applications' && (
//                             <div className="space-y-6">
//                                 <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
//                                     <div>
//                                         <h2 className="text-2xl font-bold text-slate-900 mb-2">Applications</h2>
//                                         <p className="text-slate-600">Manage and review candidate applications</p>
//                                     </div>
//                                     <div className="flex items-center space-x-3">
//                                         <div className="relative">
//                                             <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
//                                             <input
//                                                 type="text"
//                                                 placeholder="Search candidates..."
//                                                 value={searchTerm}
//                                                 onChange={(e) => setSearchTerm(e.target.value)}
//                                                 className="pl-10 pr-4 py-2 bg-white/80 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
//                                             />
//                                         </div>
//                                         <select
//                                             value={statusFilter}
//                                             onChange={(e) => setStatusFilter(e.target.value)}
//                                             className="px-4 py-2 bg-white/80 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
//                                         >
//                                             <option value="all">All Status</option>
//                                             <option value="pending">Pending</option>
//                                             <option value="reviewed">Reviewed</option>
//                                             <option value="shortlisted">Shortlisted</option>
//                                             <option value="rejected">Rejected</option>
//                                         </select>
//                                         <div className="flex items-center bg-white/80 rounded-xl border border-slate-200">
//                                             <button
//                                                 onClick={() => setViewMode('cards')}
//                                                 className={`p-2 rounded-l-xl transition-colors ${viewMode === 'cards'
//                                                         ? 'bg-blue-100 text-blue-600'
//                                                         : 'text-slate-400 hover:text-slate-600'
//                                                     }`}
//                                             >
//                                                 <Grid className="w-5 h-5" />
//                                             </button>
//                                             <button
//                                                 onClick={() => setViewMode('table')}
//                                                 className={`p-2 rounded-r-xl transition-colors ${viewMode === 'table'
//                                                         ? 'bg-blue-100 text-blue-600'
//                                                         : 'text-slate-400 hover:text-slate-600'
//                                                     }`}
//                                             >
//                                                 <List className="w-5 h-5" />
//                                             </button>
//                                         </div>
//                                     </div>
//                                 </div>

//                                 {viewMode === 'cards' ? (
//                                     <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
//                                         {filteredApplications.map((application) => (
//                                             <ApplicationCard key={application.id} application={application} />
//                                         ))}
//                                     </div>
//                                 ) : (
//                                     <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-white/20 overflow-hidden">
//                                         <div className="overflow-x-auto">
//                                             <table className="min-w-full divide-y divide-slate-200">
//                                                 <thead className="bg-slate-50/50">
//                                                     <tr>
//                                                         <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
//                                                             Candidate
//                                                         </th>
//                                                         <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
//                                                             Job Title
//                                                         </th>
//                                                         <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
//                                                             Score
//                                                         </th>
//                                                         <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
//                                                             Status
//                                                         </th>
//                                                         <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
//                                                             Applied Date
//                                                         </th>
//                                                         <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
//                                                             Actions
//                                                         </th>
//                                                     </tr>
//                                                 </thead>
//                                                 <tbody className="divide-y divide-slate-100">
//                                                     {filteredApplications.map((application) => (
//                                                         <tr key={application.id} className="hover:bg-slate-50/50 transition-colors">
//                                                             <td className="px-6 py-4 whitespace-nowrap">
//                                                                 <div className="flex items-center space-x-3">
//                                                                     <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center text-white font-semibold">
//                                                                         {application.applicant_name.charAt(0)}
//                                                                     </div>
//                                                                     <div>
//                                                                         <div className="font-semibold text-slate-900">{application.applicant_name}</div>
//                                                                         <div className="text-sm text-slate-500">{application.applicant_email}</div>
//                                                                     </div>
//                                                                 </div>
//                                                             </td>
//                                                             <td className="px-6 py-4 whitespace-nowrap">
//                                                                 <div className="font-medium text-slate-900">{application.job_title}</div>
//                                                                 <div className="text-sm text-slate-500">{application.experience}</div>
//                                                             </td>
//                                                             <td className="px-6 py-4 whitespace-nowrap">
//                                                                 {application.score && (
//                                                                     <div className={`inline-flex px-2 py-1 rounded-lg text-sm font-bold ${getScoreColor(application.score)}`}>
//                                                                         {application.score}%
//                                                                     </div>
//                                                                 )}
//                                                             </td>
//                                                             <td className="px-6 py-4 whitespace-nowrap">
//                                                                 <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(application.status)}`}>
//                                                                     {application.status}
//                                                                 </span>
//                                                             </td>
//                                                             <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
//                                                                 {new Date(application.applied_at).toLocaleDateString()}
//                                                             </td>
//                                                             <td className="px-6 py-4 whitespace-nowrap">
//                                                                 <div className="flex items-center space-x-2">
//                                                                     <button
//                                                                         onClick={() => updateApplicationStatus(application.id, 'reviewed')}
//                                                                         className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
//                                                                         title="Review"
//                                                                     >
//                                                                         <Eye className="w-4 h-4" />
//                                                                     </button>
//                                                                     <button
//                                                                         onClick={() => updateApplicationStatus(application.id, 'shortlisted')}
//                                                                         className="p-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
//                                                                         title="Shortlist"
//                                                                     >
//                                                                         <CheckCircle className="w-4 h-4" />
//                                                                     </button>
//                                                                     <button
//                                                                         onClick={() => updateApplicationStatus(application.id, 'rejected')}
//                                                                         className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
//                                                                         title="Reject"
//                                                                     >
//                                                                         <XCircle className="w-4 h-4" />
//                                                                     </button>
//                                                                     {application.resume_url && (
//                                                                         <button className="p-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors" title="Download Resume">
//                                                                             <Download className="w-4 h-4" />
//                                                                         </button>
//                                                                     )}
//                                                                 </div>
//                                                             </td>
//                                                         </tr>
//                                                     ))}
//                                                 </tbody>
//                                             </table>
//                                         </div>
//                                     </div>
//                                 )}

//                                 {filteredApplications.length === 0 && (
//                                     <div className="text-center py-12 bg-white/60 backdrop-blur-xl rounded-2xl border border-white/20">
//                                         <Users className="mx-auto h-16 w-16 text-slate-400 mb-4" />
//                                         <h3 className="text-xl font-semibold text-slate-900 mb-2">No applications found</h3>
//                                         <p className="text-slate-600">
//                                             {searchTerm || statusFilter !== 'all' || jobFilter !== 'all'
//                                                 ? 'Try adjusting your search or filter criteria.'
//                                                 : 'No applications received yet.'}
//                                         </p>
//                                     </div>
//                                 )}
//                             </div>
//                         )}

//                         {activeTab === 'jobs' && (
//                             <div className="space-y-6">
//                                 <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
//                                     <div>
//                                         <h2 className="text-2xl font-bold text-slate-900 mb-2">Job Postings</h2>
//                                         <p className="text-slate-600">Manage your active and inactive job listings</p>
//                                     </div>
//                                     <div className="flex items-center space-x-3">
//                                         <div className="relative">
//                                             <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
//                                             <input
//                                                 type="text"
//                                                 placeholder="Search jobs..."
//                                                 value={searchTerm}
//                                                 onChange={(e) => setSearchTerm(e.target.value)}
//                                                 className="pl-10 pr-4 py-2 bg-white/80 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
//                                             />
//                                         </div>
//                                         <button className="flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl">
//                                             <Plus className="w-4 h-4 mr-2" />
//                                             Add Job
//                                         </button>
//                                         <div className="flex items-center bg-white/80 rounded-xl border border-slate-200">
//                                             <button
//                                                 onClick={() => setViewMode('cards')}
//                                                 className={`p-2 rounded-l-xl transition-colors ${viewMode === 'cards'
//                                                         ? 'bg-blue-100 text-blue-600'
//                                                         : 'text-slate-400 hover:text-slate-600'
//                                                     }`}
//                                             >
//                                                 <Grid className="w-5 h-5" />
//                                             </button>
//                                             <button
//                                                 onClick={() => setViewMode('table')}
//                                                 className={`p-2 rounded-r-xl transition-colors ${viewMode === 'table'
//                                                         ? 'bg-blue-100 text-blue-600'
//                                                         : 'text-slate-400 hover:text-slate-600'
//                                                     }`}
//                                             >
//                                                 <List className="w-5 h-5" />
//                                             </button>
//                                         </div>
//                                     </div>
//                                 </div>

//                                 {viewMode === 'cards' ? (
//                                     <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
//                                         {filteredJobs.map((job) => (
//                                             <JobCard key={job.id} job={job} />
//                                         ))}
//                                     </div>
//                                 ) : (
//                                     <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-sm border border-white/20 overflow-hidden">
//                                         <div className="overflow-x-auto">
//                                             <table className="min-w-full divide-y divide-slate-200">
//                                                 <thead className="bg-slate-50/50">
//                                                     <tr>
//                                                         <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
//                                                             Job Title
//                                                         </th>
//                                                         <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
//                                                             Location
//                                                         </th>
//                                                         <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
//                                                             Salary Range
//                                                         </th>
//                                                         <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
//                                                             Status
//                                                         </th>
//                                                         <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
//                                                             Applications
//                                                         </th>
//                                                         <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
//                                                             Posted Date
//                                                         </th>
//                                                         <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
//                                                             Actions
//                                                         </th>
//                                                     </tr>
//                                                 </thead>
//                                                 <tbody className="divide-y divide-slate-100">
//                                                     {filteredJobs.map((job) => {
//                                                         const jobApplications = applications.filter(app => app.job_id === job.id);
//                                                         return (
//                                                             <tr key={job.id} className="hover:bg-slate-50/50 transition-colors">
//                                                                 <td className="px-6 py-4 whitespace-nowrap">
//                                                                     <div className="flex items-center space-x-3">
//                                                                         <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-semibold">
//                                                                             {job.company_name.charAt(0)}
//                                                                         </div>
//                                                                         <div>
//                                                                             <div className="font-semibold text-slate-900">{job.title}</div>
//                                                                             <div className="text-sm text-slate-500">{job.company_name}</div>
//                                                                         </div>
//                                                                     </div>
//                                                                 </td>
//                                                                 <td className="px-6 py-4 whitespace-nowrap">
//                                                                     <div className="flex items-center">
//                                                                         <span className="text-slate-900">{job.location}</span>
//                                                                         {job.remote && (
//                                                                             <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
//                                                                                 Remote
//                                                                             </span>
//                                                                         )}
//                                                                     </div>
//                                                                 </td>
//                                                                 <td className="px-6 py-4 whitespace-nowrap text-slate-900 font-medium">
//                                                                     ${job.salary_min?.toLocaleString()} - ${job.salary_max?.toLocaleString()}
//                                                                 </td>
//                                                                 <td className="px-6 py-4 whitespace-nowrap">
//                                                                     <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(job.status)}`}>
//                                                                         {job.status}
//                                                                     </span>
//                                                                 </td>
//                                                                 <td className="px-6 py-4 whitespace-nowrap">
//                                                                     <div className="flex items-center">
//                                                                         <span className="text-slate-900 font-semibold">{jobApplications.length}</span>
//                                                                         <span className="ml-1 text-slate-500">applications</span>
//                                                                     </div>
//                                                                 </td>
//                                                                 <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
//                                                                     {new Date(job.created_at).toLocaleDateString()}
//                                                                 </td>
//                                                                 <td className="px-6 py-4 whitespace-nowrap">
//                                                                     <div className="flex items-center space-x-2">
//                                                                         <button className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors" title="View">
//                                                                             <Eye className="w-4 h-4" />
//                                                                         </button>
//                                                                         <button className="p-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors" title="Edit">
//                                                                             <Edit className="w-4 h-4" />
//                                                                         </button>
//                                                                         <button className="p-2 text-slate-600 hover:text-slate-700 hover:bg-slate-50 rounded-lg transition-colors" title="More">
//                                                                             <MoreVertical className="w-4 h-4" />
//                                                                         </button>
//                                                                     </div>
//                                                                 </td>
//                                                             </tr>
//                                                         );
//                                                     })}
//                                                 </tbody>
//                                             </table>
//                                         </div>
//                                     </div>
//                                 )}

//                                 {filteredJobs.length === 0 && (
//                                     <div className="text-center py-12 bg-white/60 backdrop-blur-xl rounded-2xl border border-white/20">
//                                         <Briefcase className="mx-auto h-16 w-16 text-slate-400 mb-4" />
//                                         <h3 className="text-xl font-semibold text-slate-900 mb-2">No jobs found</h3>
//                                         <p className="text-slate-600">
//                                             {searchTerm
//                                                 ? 'Try adjusting your search criteria.'
//                                                 : 'Start by creating your first job posting.'}
//                                         </p>
//                                         <button className="mt-4 flex items-center mx-auto px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl">
//                                             <Plus className="w-4 h-4 mr-2" />
//                                             Create Job Post
//                                         </button>
//                                     </div>
//                                 )}
//                             </div>
//                         )}

//                         {activeTab === 'analytics' && (
//                             <div className="space-y-6">
//                                 <div className="flex justify-between items-center">
//                                     <div>
//                                         <h2 className="text-2xl font-bold text-slate-900 mb-2">Analytics & Insights</h2>
//                                         <p className="text-slate-600">Track your recruitment performance</p>
//                                     </div>
//                                     <button className="flex items-center px-4 py-2 bg-white/80 border border-slate-200 rounded-xl hover:bg-white transition-colors">
//                                         <Download className="w-4 h-4 mr-2" />
//                                         Export Report
//                                     </button>
//                                 </div>

//                                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//                                     <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
//                                         <h3 className="text-lg font-semibold text-slate-900 mb-4">Hiring Funnel</h3>
//                                         <div className="space-y-4">
//                                             <div className="flex items-center justify-between">
//                                                 <span className="text-sm text-slate-600">Applications Received</span>
//                                                 <span className="font-semibold text-slate-900">{applications.length}</span>
//                                             </div>
//                                             <div className="w-full bg-slate-200 rounded-full h-2">
//                                                 <div className="bg-blue-500 h-2 rounded-full w-full"></div>
//                                             </div>

//                                             <div className="flex items-center justify-between">
//                                                 <span className="text-sm text-slate-600">Under Review</span>
//                                                 <span className="font-semibold text-slate-900">{applications.filter(app => app.status === 'reviewed').length}</span>
//                                             </div>
//                                             <div className="w-full bg-slate-200 rounded-full h-2">
//                                                 <div className="bg-amber-500 h-2 rounded-full w-3/4"></div>
//                                             </div>

//                                             <div className="flex items-center justify-between">
//                                                 <span className="text-sm text-slate-600">Shortlisted</span>
//                                                 <span className="font-semibold text-slate-900">{applications.filter(app => app.status === 'shortlisted').length}</span>
//                                             </div>
//                                             <div className="w-full bg-slate-200 rounded-full h-2">
//                                                 <div className="bg-emerald-500 h-2 rounded-full w-1/2"></div>
//                                             </div>
//                                         </div>
//                                     </div>

//                                     <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-6 border border-white/20">
//                                         <h3 className="text-lg font-semibold text-slate-900 mb-4">Top Performing Jobs</h3>
//                                         <div className="space-y-4">
//                                             {jobs.slice(0, 3).map((job) => {
//                                                 const jobApps = applications.filter(app => app.job_id === job.id);
//                                                 return (
//                                                     <div key={job.id} className="flex items-center justify-between p-3 bg-slate-50/50 rounded-xl">
//                                                         <div>
//                                                             <p className="font-medium text-slate-900">{job.title}</p>
//                                                             <p className="text-sm text-slate-500">{jobApps.length} applications</p>
//                                                         </div>
//                                                         <div className="text-right">
//                                                             <p className="font-semibold text-emerald-600">
//                                                                 {jobApps.length > 0 ? Math.round((jobApps.filter(app => app.status === 'shortlisted').length / jobApps.length) * 100) : 0}%
//                                                             </p>
//                                                             <p className="text-xs text-slate-500">conversion rate</p>
//                                                         </div>
//                                                     </div>
//                                                 );
//                                             })}
//                                         </div>
//                                     </div>
//                                 </div>
//                             </div>
//                         )}
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default ModernRecruiterDashboard;

import React, { useState, useRef, useEffect } from 'react';
import {
    Users, FileText, Briefcase, Calendar, MapPin, DollarSign, Eye, Edit,
    Grid, List, Search, Plus, CheckCircle, Video, Brain, Sparkles, BarChart3,
    Building, TrendingUp, Bell, Settings, ChevronDown, Mail, ArrowUpRight,
    Send, X, Home
} from 'lucide-react';

const ProfessionalRecruiterDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [viewMode, setViewMode] = useState('cards');
    const [showAIChat, setShowAIChat] = useState(false);
    const [notification, setNotification] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [chatInput, setChatInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [chatMessages, setChatMessages] = useState([
        {
            id: 1,
            type: 'ai',
            content: 'Hello! I am your AI recruitment assistant. I can help you analyze candidates, optimize job postings, and provide insights. How can I assist you today?'
        }
    ]);
    const chatMessagesRef = useRef(null);

    const aiInsights = [
        { type: 'recommendation', message: 'Sarah Johnson shows 95% compatibility with your React Developer role', priority: 'high' },
        { type: 'trend', message: 'UX Designer applications increased by 34% this week', priority: 'medium' },
        { type: 'alert', message: '3 high-priority candidates require immediate review', priority: 'urgent' }
    ];

    const [jobs] = useState([
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
        <div className="min-h-screen bg-gray-50">
            {notification && (
                <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg transition-all duration-300 ${notification.type === 'success'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-red-500 text-white'
                    }`}>
                    {notification.message}
                </div>
            )}

            {/* Header */}
            <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                                <Building className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">FinAutoJob</h1>
                                <p className="text-sm text-gray-500">Professional Recruiting Platform</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-3">
                            <button
                                onClick={() => setShowAIChat(!showAIChat)}
                                className={`relative p-2 rounded-lg transition-colors ${showAIChat
                                    ? 'bg-blue-100 text-blue-600'
                                    : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                            >
                                <Brain className="w-5 h-5" />
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full"></div>
                            </button>

                            <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                                <Bell className="w-5 h-5" />
                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                                    3
                                </span>
                            </button>

                            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
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
                        return (
                            <div key={index} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                                        <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                                        <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center">
                                            <ArrowUpRight className="w-3 h-3 mr-1" />
                                            {stat.change} this month
                                        </p>
                                    </div>
                                    <div className={`w-12 h-12 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                                        <Icon className={`w-6 h-6 ${stat.textColor}`} />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Navigation */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-8">
                    <div className="border-b border-gray-200">
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
                                        className={`relative flex items-center py-4 px-1 font-medium text-sm transition-colors ${isActive
                                            ? 'text-blue-600 border-b-2 border-blue-600'
                                            : 'text-gray-500 hover:text-gray-700'
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
                                            Welcome back, {user.name.split(' ')[0]} 👋
                                        </h2>
                                        <p className="text-gray-600">
                                            Here is what is happening with your recruitment today
                                        </p>
                                    </div>
                                    <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
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
                                                { icon: Plus, label: 'Post New Job' },
                                                { icon: Users, label: 'Review Applications' },
                                                { icon: Video, label: 'Schedule Interviews' },
                                                { icon: BarChart3, label: 'View Analytics' },
                                                { icon: Brain, label: 'AI Recommendations' }
                                            ].map((action, index) => {
                                                const Icon = action.icon;
                                                return (
                                                    <button key={index} className="w-full flex items-center px-4 py-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
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
                                        <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
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