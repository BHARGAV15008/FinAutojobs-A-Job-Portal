import React from 'react';
import { useParams, Link, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Briefcase, Clock, DollarSign, Building, Calendar, ArrowLeft } from 'lucide-react';
import api from '../utils/api';

const JobDetailPage = () => {
    const [, params] = useLocation();
    const id = params.split('/').pop();

    const { data, isLoading, error } = useQuery({
        queryKey: ['job', id],
        queryFn: async () => {
            const response = await api.getJob(id);
            return await response.json();
        }
    });
    const job = data?.job;

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
                        <div className="bg-white p-8 rounded-lg shadow-sm">
                            <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
                            <div className="space-y-3">
                                <div className="h-4 bg-gray-200 rounded w-full"></div>
                                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                                <div className="h-4 bg-gray-200 rounded w-4/5"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Job Not Found</h2>
                        <p className="text-gray-600 mb-6">The job you're looking for doesn't exist or has been removed.</p>
                        <Link to="/jobs" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                            Back to Jobs
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    if (!job) return null;

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Back Button */}
                <Link
                    to="/jobs"
                    className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6"
                >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Jobs
                </Link>

                {/* Job Header */}
                <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
                    <div className="flex items-start justify-between mb-6">
                        <div className="flex-1">
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
                            <p className="text-xl text-gray-600 mb-4">{job.company?.name}</p>

                            <div className="flex flex-wrap gap-6 text-sm text-gray-500">
                                <div className="flex items-center">
                                    <MapPin className="h-4 w-4 mr-2" />
                                    {job.location}
                                </div>
                                <div className="flex items-center">
                                    <Briefcase className="h-4 w-4 mr-2" />
                                    {job.type}
                                </div>
                                <div className="flex items-center">
                                    <Clock className="h-4 w-4 mr-2" />
                                    {job.mode}
                                </div>
                                {job.salary && (
                                    <div className="flex items-center">
                                        <DollarSign className="h-4 w-4 mr-2" />
                                        {job.salary}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="ml-6">
                            <button className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold">
                                Apply Now
                            </button>
                        </div>
                    </div>

                    {/* Job Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="flex items-center">
                                <Building className="h-5 w-5 text-gray-400 mr-3" />
                                <span className="text-gray-700">Company: {job.company?.name}</span>
                            </div>
                            <div className="flex items-center">
                                <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                                <span className="text-gray-700">Location: {job.location}</span>
                            </div>
                            <div className="flex items-center">
                                <Briefcase className="h-5 w-5 text-gray-400 mr-3" />
                                <span className="text-gray-700">Job Type: {job.job_type}</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center">
                                <Clock className="h-5 w-5 text-gray-400 mr-3" />
                                <span className="text-gray-700">Work Mode: {job.work_mode}</span>
                            </div>
                            {job.experience_min && job.experience_max && (
                                <div className="flex items-center">
                                    <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                                    <span className="text-gray-700">
                                        Experience: {job.experience_min}-{job.experience_max} years
                                    </span>
                                </div>
                            )}
                            {job.english_level && (
                                <div className="flex items-center">
                                    <span className="text-gray-700">English Level: {job.english_level}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Job Description */}
                <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Job Description</h2>
                    <div className="prose max-w-none">
                        <p className="text-gray-700 leading-relaxed mb-6">{job.description}</p>

                        {job.requirements && (
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">Requirements</h3>
                                <div className="text-gray-700 whitespace-pre-line">{job.requirements}</div>
                            </div>
                        )}

                        {job.benefits && (
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-3">Benefits</h3>
                                <div className="text-gray-700 whitespace-pre-line">{job.benefits}</div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Apply Section */}
                <div className="bg-white rounded-lg shadow-sm p-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Apply for this Position</h2>
                    <p className="text-gray-600 mb-6">
                        Ready to join our team? Click the button below to submit your application.
                    </p>
                    <button className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold">
                        Apply Now
                    </button>
                </div>
            </div>
        </div>
    );
};

export default JobDetailPage;
