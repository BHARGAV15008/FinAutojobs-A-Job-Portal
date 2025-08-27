import React, { useState, useEffect } from 'react';
import {
    Building2,
    MapPin,
    DollarSign,
    Clock,
    Users,
    FileText,
    Briefcase,
    Globe,
    Save,
    ArrowLeft,
    AlertCircle,
    Sparkles
} from 'lucide-react';

const AddJobPage = () => {
    const [loading, setLoading] = useState(false);
    const [companies, setCompanies] = useState([
        { id: 1, name: 'Tech Corp' },
        { id: 2, name: 'StartupXYZ' },
        { id: 3, name: 'Enterprise Solutions' }
    ]);

    const [formData, setFormData] = useState({
        title: '',
        company_id: '',
        location: '',
        salary_min: '',
        salary_max: '',
        salary_currency: 'INR',
        job_type: '',
        work_mode: '',
        experience_min: '',
        experience_max: '',
        english_level: '',
        description: '',
        requirements: '',
        benefits: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            alert('Job posted successfully!');
        }, 2000);
    };

    // Calculate salary progress bar values
    const salaryMin = parseFloat(formData.salary_min) || 0;
    const salaryMax = parseFloat(formData.salary_max) || 0;
    const maxSalaryRange = 2000000; // 20 LPA max for visualization
    const minProgress = (salaryMin / maxSalaryRange) * 100;
    const maxProgress = (salaryMax / maxSalaryRange) * 100;

    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
                <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
            </div>

            <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Floating Header */}
                <div className="mb-8 animate-fadeInUp">
                    <button className="group flex items-center text-gray-600 hover:text-indigo-600 mb-6 transition-all duration-300 transform hover:-translate-x-1">
                        <ArrowLeft className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
                        <span className="font-medium">Back to Jobs</span>
                    </button>
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl mb-4 shadow-lg animate-bounce-slow">
                            <Sparkles className="h-8 w-8 text-white" />
                        </div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-2">
                            Create Amazing Opportunity
                        </h1>
                        <p className="text-lg text-gray-600">Craft the perfect job posting with our enhanced form</p>
                    </div>
                </div>

                {/* Main Form Card */}
                <div className="bg-white/80 backdrop-blur-lg shadow-2xl rounded-3xl border border-white/20 overflow-hidden animate-slideInUp">
                    <div className="p-8 space-y-8">

                        {/* Basic Information Section */}
                        <div className="group animate-fadeInUp animation-delay-200">
                            <div className="flex items-center mb-6">
                                <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl mr-3 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                                    <Briefcase className="h-6 w-6 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-800">Basic Information</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2 group">
                                    <label className="block text-sm font-semibold text-gray-700 group-hover:text-indigo-600 transition-colors">
                                        Job Title *
                                    </label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 bg-gray-50/50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all duration-300 hover:border-gray-300"
                                        placeholder="e.g. Senior Software Engineer"
                                    />
                                </div>

                                <div className="space-y-2 group">
                                    <label className="block text-sm font-semibold text-gray-700 group-hover:text-indigo-600 transition-colors">
                                        Company *
                                    </label>
                                    <select
                                        name="company_id"
                                        value={formData.company_id}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 bg-gray-50/50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all duration-300 hover:border-gray-300"
                                    >
                                        <option value="">Select a company</option>
                                        {companies.map(company => (
                                            <option key={company.id} value={company.id}>
                                                {company.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2 group">
                                    <label className="block text-sm font-semibold text-gray-700 group-hover:text-indigo-600 transition-colors">
                                        Location *
                                    </label>
                                    <input
                                        type="text"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 bg-gray-50/50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all duration-300 hover:border-gray-300"
                                        placeholder="e.g. Mumbai, Maharashtra"
                                    />
                                </div>

                                <div className="space-y-2 group">
                                    <label className="block text-sm font-semibold text-gray-700 group-hover:text-indigo-600 transition-colors">
                                        English Level
                                    </label>
                                    <select
                                        name="english_level"
                                        value={formData.english_level}
                                        onChange={handleInputChange}
                                        className="w-full px-4 py-3 bg-gray-50/50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all duration-300 hover:border-gray-300"
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

                        {/* Job Details Section */}
                        <div className="group animate-fadeInUp animation-delay-400">
                            <div className="flex items-center mb-6">
                                <div className="p-2 bg-gradient-to-r from-green-500 to-teal-600 rounded-xl mr-3 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                                    <Clock className="h-6 w-6 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-800">Job Details</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2 group">
                                    <label className="block text-sm font-semibold text-gray-700 group-hover:text-green-600 transition-colors">
                                        Job Type *
                                    </label>
                                    <select
                                        name="job_type"
                                        value={formData.job_type}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 bg-gray-50/50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:bg-white transition-all duration-300 hover:border-gray-300"
                                    >
                                        <option value="">Select job type</option>
                                        <option value="full-time">Full Time</option>
                                        <option value="part-time">Part Time</option>
                                        <option value="contract">Contract</option>
                                        <option value="internship">Internship</option>
                                        <option value="freelance">Freelance</option>
                                    </select>
                                </div>

                                <div className="space-y-2 group">
                                    <label className="block text-sm font-semibold text-gray-700 group-hover:text-green-600 transition-colors">
                                        Work Mode *
                                    </label>
                                    <select
                                        name="work_mode"
                                        value={formData.work_mode}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-4 py-3 bg-gray-50/50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:bg-white transition-all duration-300 hover:border-gray-300"
                                    >
                                        <option value="">Select work mode</option>
                                        <option value="remote">Remote</option>
                                        <option value="onsite">On-site</option>
                                        <option value="hybrid">Hybrid</option>
                                    </select>
                                </div>

                                <div className="space-y-2 group">
                                    <label className="block text-sm font-semibold text-gray-700 group-hover:text-green-600 transition-colors">
                                        Min Experience (years)
                                    </label>
                                    <input
                                        type="number"
                                        name="experience_min"
                                        value={formData.experience_min}
                                        onChange={handleInputChange}
                                        min="0"
                                        className="w-full px-4 py-3 bg-gray-50/50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:bg-white transition-all duration-300 hover:border-gray-300"
                                        placeholder="0"
                                    />
                                </div>

                                <div className="space-y-2 group">
                                    <label className="block text-sm font-semibold text-gray-700 group-hover:text-green-600 transition-colors">
                                        Max Experience (years)
                                    </label>
                                    <input
                                        type="number"
                                        name="experience_max"
                                        value={formData.experience_max}
                                        onChange={handleInputChange}
                                        min="0"
                                        className="w-full px-4 py-3 bg-gray-50/50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-green-500 focus:bg-white transition-all duration-300 hover:border-gray-300"
                                        placeholder="10"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Salary Information with Progress Bar */}
                        <div className="group animate-fadeInUp animation-delay-600">
                            <div className="flex items-center mb-6">
                                <div className="p-2 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl mr-3 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                                    <DollarSign className="h-6 w-6 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-800">Salary Information</h2>
                            </div>

                            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-200">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                                    <div className="space-y-2 group">
                                        <label className="block text-sm font-semibold text-gray-700 group-hover:text-yellow-600 transition-colors">
                                            Min Salary
                                        </label>
                                        <input
                                            type="number"
                                            name="salary_min"
                                            value={formData.salary_min}
                                            onChange={handleInputChange}
                                            min="0"
                                            className="w-full px-4 py-3 bg-white border-2 border-yellow-200 rounded-xl focus:outline-none focus:border-yellow-500 transition-all duration-300"
                                            placeholder="300000"
                                        />
                                    </div>

                                    <div className="space-y-2 group">
                                        <label className="block text-sm font-semibold text-gray-700 group-hover:text-yellow-600 transition-colors">
                                            Max Salary
                                        </label>
                                        <input
                                            type="number"
                                            name="salary_max"
                                            value={formData.salary_max}
                                            onChange={handleInputChange}
                                            min="0"
                                            className="w-full px-4 py-3 bg-white border-2 border-yellow-200 rounded-xl focus:outline-none focus:border-yellow-500 transition-all duration-300"
                                            placeholder="800000"
                                        />
                                    </div>

                                    <div className="space-y-2 group">
                                        <label className="block text-sm font-semibold text-gray-700 group-hover:text-yellow-600 transition-colors">
                                            Currency
                                        </label>
                                        <select
                                            name="salary_currency"
                                            value={formData.salary_currency}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 bg-white border-2 border-yellow-200 rounded-xl focus:outline-none focus:border-yellow-500 transition-all duration-300"
                                        >
                                            <option value="INR">INR</option>
                                            <option value="USD">USD</option>
                                            <option value="EUR">EUR</option>
                                            <option value="GBP">GBP</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Salary Range Visualization */}
                                {(salaryMin > 0 || salaryMax > 0) && (
                                    <div className="mt-4">
                                        <div className="flex justify-between text-sm font-medium text-gray-600 mb-2">
                                            <span>Salary Range Visualization</span>
                                            <span>
                                                {formData.salary_currency} {salaryMin.toLocaleString()} - {salaryMax.toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className="absolute h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full transition-all duration-500 ease-out"
                                                style={{
                                                    left: `${Math.min(minProgress, maxProgress)}%`,
                                                    width: `${Math.abs(maxProgress - minProgress)}%`
                                                }}
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                                        </div>
                                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                                            <span>0</span>
                                            <span>20L</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Job Description Section */}
                        <div className="group animate-fadeInUp animation-delay-800">
                            <div className="flex items-center mb-6">
                                <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl mr-3 shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                                    <FileText className="h-6 w-6 text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-800">Job Description</h2>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2 group">
                                    <label className="block text-sm font-semibold text-gray-700 group-hover:text-purple-600 transition-colors">
                                        Description *
                                    </label>
                                    <textarea
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        required
                                        rows={6}
                                        className="w-full px-4 py-3 bg-gray-50/50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:bg-white transition-all duration-300 hover:border-gray-300 resize-none"
                                        placeholder="Describe the job role, responsibilities, and what the candidate will be doing..."
                                    />
                                </div>

                                <div className="space-y-2 group">
                                    <label className="block text-sm font-semibold text-gray-700 group-hover:text-purple-600 transition-colors">
                                        Requirements
                                    </label>
                                    <textarea
                                        name="requirements"
                                        value={formData.requirements}
                                        onChange={handleInputChange}
                                        rows={4}
                                        className="w-full px-4 py-3 bg-gray-50/50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:bg-white transition-all duration-300 hover:border-gray-300 resize-none"
                                        placeholder="List the required skills, qualifications, and experience..."
                                    />
                                </div>

                                <div className="space-y-2 group">
                                    <label className="block text-sm font-semibold text-gray-700 group-hover:text-purple-600 transition-colors">
                                        Benefits
                                    </label>
                                    <textarea
                                        name="benefits"
                                        value={formData.benefits}
                                        onChange={handleInputChange}
                                        rows={4}
                                        className="w-full px-4 py-3 bg-gray-50/50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-purple-500 focus:bg-white transition-all duration-300 hover:border-gray-300 resize-none"
                                        placeholder="List the benefits, perks, and compensation details..."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-end space-x-4 pt-6 animate-fadeInUp animation-delay-1000">
                            <button
                                type="button"
                                className="px-8 py-3 border-2 border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-4 focus:ring-gray-200 transition-all duration-300 transform hover:scale-105"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="relative px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl overflow-hidden group"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                <div className="relative flex items-center">
                                    {loading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                                            <span>Creating Magic...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Save className="h-5 w-5 mr-3" />
                                            <span>Post Job</span>
                                        </>
                                    )}
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes blob {
                    0% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                    100% { transform: translate(0px, 0px) scale(1); }
                }
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes slideInUp {
                    from { opacity: 0; transform: translateY(50px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes bounce-slow {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                .animate-blob { animation: blob 7s infinite; }
                .animate-fadeInUp { animation: fadeInUp 0.6s ease-out; }
                .animate-slideInUp { animation: slideInUp 0.8s ease-out; }
                .animate-bounce-slow { animation: bounce-slow 3s ease-in-out infinite; }
                .animate-shimmer { animation: shimmer 2s ease-in-out infinite; }
                .animation-delay-200 { animation-delay: 0.2s; }
                .animation-delay-400 { animation-delay: 0.4s; }
                .animation-delay-600 { animation-delay: 0.6s; }
                .animation-delay-800 { animation-delay: 0.8s; }
                .animation-delay-1000 { animation-delay: 1s; }
                .animation-delay-2000 { animation-delay: 2s; }
                .animation-delay-4000 { animation-delay: 4s; }
            `}</style>
        </div>
    );
};

export default AddJobPage;