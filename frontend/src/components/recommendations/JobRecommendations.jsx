import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  MapPin, 
  Clock, 
  DollarSign, 
  Users, 
  Star,
  TrendingUp,
  Target,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Briefcase
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { recommendationsAPI } from '../../services/api';

const JobRecommendations = ({ limit = 10, showTitle = true }) => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (user && user.role === 'applicant') {
      fetchRecommendations();
      fetchStats();
    }
  }, [user, limit]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const response = await recommendationsAPI.getJobRecommendations({
        limit: limit,
        minMatchPercentage: 1 // Extremely low threshold to show any matching jobs
      });

      console.log('🔍 Recommendations response:', response.data);
      console.log('🔍 Number of jobs returned:', response.data.data?.jobs?.length || 0);
      console.log('🔍 First few jobs:', response.data.data?.jobs?.slice(0, 3));

      if (response.data.success) {
        const jobs = response.data.data.jobs || [];
        console.log('🔍 Setting recommendations:', jobs.length, 'jobs');
        setRecommendations(jobs);
        
        // Log each job for debugging
        jobs.forEach((job, index) => {
          console.log(`🔍 Job ${index + 1}: ${job.jobTitle} - Match: ${job.matchScore?.overall}% - Skills: ${job.matchScore?.skills?.matchPercentage}%`);
        });
      } else {
        console.error('❌ Recommendations API error:', response.data.message);
        setError(response.data.message || 'Failed to fetch recommendations');
      }
    } catch (err) {
      console.error('❌ Recommendations fetch error:', err);
      setError('Failed to load job recommendations');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await recommendationsAPI.getRecommendationStats();
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (err) {
    }
  };

  const getMatchScoreColor = (score) => {
    if (score >= 70) return 'text-green-600 bg-green-100';
    if (score >= 50) return 'text-blue-600 bg-blue-100';
    if (score >= 25) return 'text-yellow-600 bg-yellow-100';
    if (score >= 10) return 'text-orange-600 bg-orange-100';
    return 'text-purple-600 bg-purple-100';
  };

  const getMatchScoreText = (score) => {
    if (score >= 70) return 'Excellent Match';
    if (score >= 50) return 'Good Match';
    if (score >= 25) return 'Fair Match';
    if (score >= 10) return 'Potential Match';
    return 'Skills Match';
  };

  const debugAllJobs = async () => {
    try {
      console.log('🔍 DEBUG: Fetching recommendations for debugging...');
      
      // Get current recommendations
      const recResponse = await recommendationsAPI.getRecommendations(50);
      
      if (recResponse.data.success) {
        const recData = recResponse.data;
        console.log('🔍 CURRENT RECOMMENDATIONS:', {
          totalRecommendations: recData.data?.jobs?.length || 0,
          applicantSkills: recData.data?.applicantProfile?.skills,
          jobs: recData.data?.jobs?.map(job => ({
            title: job.jobTitle,
            requiredSkills: job.requiredSkills,
            matchedSkills: job.matchScore?.skills?.matchedSkills,
            matchPercentage: job.matchScore?.skills?.matchPercentage
          })) || []
        });
        
        console.log('🔍 FILTERING EXPLANATION:');
        console.log('- Only jobs with at least 1 skill match are shown');
        console.log('- Skills are compared case-insensitive');
        console.log('- Comma-separated skills are handled properly');
        console.log('- Partial matches and aliases are considered');
      } else {
        console.error('🔍 Failed to fetch recommendations:', recResponse);
      }
    } catch (error) {
      console.error('🔍 DEBUG ERROR:', error);
    }
  };

  const formatSalary = (job) => {
    if (job.salary) return job.salary;
    if (job.salaryRange) {
      const { min, max, period } = job.salaryRange;
      if (min && max) {
        return `₹${(min / 100000).toFixed(1)}L - ₹${(max / 100000).toFixed(1)}L ${period || 'Yearly'}`;
      }
    }
    return 'Negotiable';
  };

  const formatExperience = (experience) => {
    if (!experience) return 'Not specified';
    const { minimum, maximum } = experience;
    if (minimum !== undefined && maximum !== undefined) {
      return `${minimum}-${maximum} years`;
    }
    if (minimum !== undefined) {
      return `${minimum}+ years`;
    }
    return 'Not specified';
  };

  if (user?.role !== 'applicant') {
    return null;
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <div className="flex items-center space-x-3 mb-6">
          <Sparkles className="w-6 h-6 text-purple-600" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Recommended Jobs
          </h2>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg">
        <div className="flex items-center space-x-3 mb-4">
          <AlertCircle className="w-6 h-6 text-red-600" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Recommendations Unavailable
          </h2>
        </div>
        <p className="text-gray-600 dark:text-gray-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
      {showTitle && (
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Sparkles className="w-6 h-6" />
              <div>
                <h2 className="text-xl font-bold">Recommended Jobs</h2>
                <p className="text-purple-100">
                  {recommendations.length} jobs match your profile
                </p>
              </div>
            </div>
            {stats && (
              <div className="text-right">
                <div className="text-2xl font-bold">{stats.matchingJobs.high + stats.matchingJobs.medium}</div>
                <div className="text-sm text-purple-100">Total Matches</div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="p-6">
        {recommendations.length === 0 ? (
          <div className="text-center py-8">
            <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No Job Matches Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              We couldn't find jobs matching your current profile. Here are some suggestions:
            </p>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <p>• Add more skills to your profile</p>
              <p>• Update your education and experience</p>
              <p>• Consider broadening your job preferences</p>
              <p>• Check back later for new job postings</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <AnimatePresence>
              {recommendations.map((job, index) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:shadow-md transition-shadow"
                >
                  {/* Job Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {job.jobTitle}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getMatchScoreColor(job.matchScore.overall)}`}>
                          {job.matchScore.overall}% Match
                        </span>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 font-medium">
                        {job.companyName}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {getMatchScoreText(job.matchScore.overall)}
                      </div>
                    </div>
                  </div>

                  {/* Job Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {job.location || 'Remote'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Briefcase className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {formatExperience(job.experience)}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {formatSalary(job)}
                      </span>
                    </div>
                  </div>

                  {/* Match Breakdown */}
                  <div className="mb-4">
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center space-x-1">
                        <div className={`w-2 h-2 rounded-full ${
                          job.matchScore.skills.matchPercentage >= 30 ? 'bg-green-500' : 
                          job.matchScore.skills.matchPercentage > 0 ? 'bg-blue-500' : 'bg-gray-400'
                        }`}></div>
                        <span className="text-gray-600 dark:text-gray-400">
                          Skills: {job.matchScore.skills.matchPercentage}%
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className={`w-2 h-2 rounded-full ${
                          job.matchScore.experience >= 60 ? 'bg-green-500' : 
                          job.matchScore.experience >= 30 ? 'bg-blue-500' : 'bg-yellow-500'
                        }`}></div>
                        <span className="text-gray-600 dark:text-gray-400">
                          Experience: {job.matchScore.experience}%
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className={`w-2 h-2 rounded-full ${
                          job.matchScore.location >= 50 ? 'bg-green-500' : 
                          job.matchScore.location >= 20 ? 'bg-blue-500' : 'bg-gray-400'
                        }`}></div>
                        <span className="text-gray-600 dark:text-gray-400">
                          Location: {job.matchScore.location}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Matched Skills */}
                  {job.matchScore.skills.matchedSkills.length > 0 && (
                    <div className="mb-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          Matching Skills:
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {job.matchScore.skills.matchedSkills.slice(0, 5).map((skill, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                        {job.matchScore.skills.matchedSkills.length > 5 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            +{job.matchScore.skills.matchedSkills.length - 5} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Recommendation Reasons */}
                  {job.recommendationReasons && job.recommendationReasons.length > 0 ? (
                    <div className="mb-4">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        <strong>Why this job:</strong> {job.recommendationReasons.join(', ')}
                      </div>
                    </div>
                  ) : job.matchScore.skills.matchPercentage === 0 ? (
                    <div className="mb-4">
                      <div className="text-sm text-blue-600 dark:text-blue-400">
                        <strong>New Opportunity:</strong> Recent job posting that might interest you
                      </div>
                    </div>
                  ) : (
                    <div className="mb-4">
                      <div className="text-sm text-green-600 dark:text-green-400">
                        <strong>Skills Match:</strong> Your profile aligns with this job's requirements
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2">
                      <span>Apply Now</span>
                    </button>
                    <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2">
                      <ExternalLink className="w-4 h-4" />
                      <span>View Details</span>
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Debug and View More Buttons */}
        <div className="text-center mt-6 space-y-3">
          {/* Debug Button for troubleshooting */}
          <div>
            <button 
              onClick={debugAllJobs}
              className="text-red-600 hover:text-red-700 font-medium text-sm border border-red-300 px-3 py-1 rounded"
            >
              🔍 Debug: Check All Jobs
            </button>
          </div>
          
          {/* View More Button */}
          {recommendations.length > 0 && recommendations.length >= limit && (
            <div>
              <button 
                onClick={() => fetchRecommendations()}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                View More Recommendations
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobRecommendations;
