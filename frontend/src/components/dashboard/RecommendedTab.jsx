import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getRecommendedJobs, getRecommendationStats } from '../../api/recommendations';
import { useAuth } from '../../contexts/AuthContext';

const RecommendedTab = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);

  const [filterBy, setFilterBy] = useState('all');
  const [sortBy, setSortBy] = useState('matchScore');
  const [selectedJob, setSelectedJob] = useState(null);

  // Fetch recommended jobs on component mount
  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!user || user.role !== 'applicant') {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch both recommendations and stats
        const [recommendationsResponse, statsResponse] = await Promise.all([
          getRecommendedJobs({ limit: 20, minMatchPercentage: 10 }),
          getRecommendationStats()
        ]);

        if (recommendationsResponse.success) {
          // Transform the data to match the component's expected format
          const transformedJobs = recommendationsResponse.data.jobs.map(job => ({
            id: job.id,
            title: job.jobTitle,
            company: job.companyName,
            location: job.location,
            salary: formatSalary(job.salary),
            type: job.workArrangement || 'Full-time',
            remote: job.workArrangement === 'Remote',
            postedDate: new Date(job.postedDate).toISOString().split('T')[0],
            description: job.description || 'No description available',
            requirements: job.requiredSkills || [],
            benefits: [], // Could be added to job schema later
            matchScore: job.matchScore.overall,
            matchReasons: job.recommendationReasons || [],
            companyRating: 4.0, // Default rating, could be added to company schema
            applicants: 0, // Could be calculated from applications
            isApplied: false, // Could be checked against user's applications
            isFavorite: false, // Could be checked against user's saved jobs
            urgency: job.matchScore.overall >= 80 ? 'high' : job.matchScore.overall >= 50 ? 'medium' : 'low',
            applicationDeadline: job.applicationDeadline ? new Date(job.applicationDeadline).toISOString().split('T')[0] : null,
            // Additional match data
            skillsMatch: job.matchScore.skills,
            locationMatch: job.matchScore.location,
            experienceMatch: job.matchScore.experience
          }));

          setRecommendations(transformedJobs);
        }

        if (statsResponse.success) {
          setStats(statsResponse.data);
        }

      } catch (err) {
        console.error('Error fetching recommendations:', err);
        setError('Failed to load job recommendations. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [user]);

  // Helper function to format salary
  const formatSalary = (salary) => {
    if (!salary) return 'Salary not specified';
    
    if (salary.type === 'Negotiable') return 'Negotiable';
    if (salary.type === 'Fixed') return `₹${(salary.minimum / 100000).toFixed(1)}L ${salary.period}`;
    if (salary.type === 'Range') {
      return `₹${(salary.minimum / 100000).toFixed(1)}-${(salary.maximum / 100000).toFixed(1)}L ${salary.period}`;
    }
    
    return 'Salary not specified';
  };

  const toggleFavorite = (jobId) => {
    setRecommendations(recommendations.map(job => 
      job.id === jobId ? { ...job, isFavorite: !job.isFavorite } : job
    ));
  };

  const applyToJob = (jobId) => {
    setRecommendations(recommendations.map(job => 
      job.id === jobId ? { ...job, isApplied: true } : job
    ));
  };

  const filteredRecommendations = recommendations.filter(job => {
    if (filterBy === 'all') return true;
    if (filterBy === 'not-applied') return !job.isApplied;
    if (filterBy === 'remote') return job.remote;
    if (filterBy === 'high-match') return job.matchScore >= 90;
    return true;
  });

  const sortedRecommendations = [...filteredRecommendations].sort((a, b) => {
    switch (sortBy) {
      case 'matchScore':
        return b.matchScore - a.matchScore;
      case 'postedDate':
        return new Date(b.postedDate) - new Date(a.postedDate);
      case 'salary':
        const aSalary = parseInt(a.salary.split('-')[1].replace(/[^\d]/g, ''));
        const bSalary = parseInt(b.salary.split('-')[1].replace(/[^\d]/g, ''));
        return bSalary - aSalary;
      case 'urgency':
        const urgencyOrder = { high: 3, medium: 2, low: 1 };
        return urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
      default:
        return 0;
    }
  });

  const getMatchScoreColor = (score) => {
    if (score >= 90) return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900';
    if (score >= 80) return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900';
    if (score >= 70) return 'text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900';
    return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900';
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
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

  const getDaysAgo = (date) => {
    const today = new Date();
    const postedDate = new Date(date);
    const diffTime = Math.abs(today - postedDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={i} className="text-yellow-400">★</span>);
    }
    if (hasHalfStar) {
      stars.push(<span key="half" className="text-yellow-400">☆</span>);
    }
    for (let i = stars.length; i < 5; i++) {
      stars.push(<span key={i} className="text-gray-300">☆</span>);
    }
    return stars;
  };

  // Show loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Recommended Jobs</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Loading personalized job recommendations...
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <span className="ml-3 text-gray-600 dark:text-gray-400">Finding jobs that match your skills...</span>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Recommended Jobs</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Unable to load recommendations
            </p>
          </div>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
          <div className="flex items-center">
            <span className="text-2xl mr-3">⚠️</span>
            <div>
              <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">Error Loading Recommendations</h3>
              <p className="text-red-600 dark:text-red-400 mt-1">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show empty state if no recommendations
  if (recommendations.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Recommended Jobs</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              No matching jobs found
            </p>
          </div>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-8 text-center">
          <span className="text-6xl mb-4 block">🔍</span>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No Recommendations Yet</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            We couldn't find jobs matching your current skills. Try updating your profile with more skills or check back later for new opportunities.
          </p>
          <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
            <p>💡 <strong>Tip:</strong> Add more skills to your profile to get better recommendations</p>
            <p>📈 <strong>Tip:</strong> Update your experience level and location preferences</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Recommended Jobs</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {recommendations.length} jobs matched with your skills and preferences
          </p>
        </div>
        <div className="flex space-x-3">
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">All Recommendations</option>
            <option value="not-applied">Not Applied</option>
            <option value="remote">Remote Only</option>
            <option value="high-match">High Match (90%+)</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="matchScore">Best Match</option>
            <option value="postedDate">Recently Posted</option>
            <option value="salary">Highest Salary</option>
            <option value="urgency">Most Urgent</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <span className="text-2xl">🎯</span>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recommendations</h3>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {recommendations.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
              <span className="text-2xl">🏆</span>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">High Match</h3>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {recommendations.filter(job => job.matchScore >= 70).length}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">70%+ match</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <span className="text-2xl">🎯</span>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Skill Matches</h3>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {recommendations.reduce((total, job) => total + (job.skillsMatch?.totalMatched || 0), 0)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Total skills matched</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-lg">
              <span className="text-2xl">📊</span>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Avg Match</h3>
              <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
                {Math.round(recommendations.reduce((sum, job) => sum + job.matchScore, 0) / recommendations.length)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* AI Recommendation Insights */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-md border border-blue-200 dark:border-blue-800 p-6">
        <div className="flex items-center mb-4">
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg mr-3">
            <span className="text-xl">🤖</span>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Insights</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">🔥 Hot Skills</h4>
            <p className="text-gray-600 dark:text-gray-400">React, JavaScript, and TypeScript are trending in your recommendations</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">💡 Tip</h4>
            <p className="text-gray-600 dark:text-gray-400">Companies prefer candidates with full-stack experience</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">📈 Trend</h4>
            <p className="text-gray-600 dark:text-gray-400">Remote positions are 40% more likely to match your profile</p>
          </div>
        </div>
      </div>

      {/* Recommendations List */}
      <div className="bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Personalized Recommendations ({sortedRecommendations.length})
          </h3>
        </div>
        
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {sortedRecommendations.map((job, index) => (
            <motion.div
              key={job.id}
              className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                    {job.company.charAt(0)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                        {job.title}
                      </h4>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getMatchScoreColor(job.matchScore)}`}>
                        {job.matchScore}% match
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getUrgencyColor(job.jobUrgency)}`}>
                        {job.jobUrgency} priority
                      </span>
                      {job.isApplied && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          Applied
                        </span>
                      )}
                      {job.remote && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          Remote
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-4 mb-2">
                      <p className="text-gray-600 dark:text-gray-400">
                        {job.company} • {job.location}
                      </p>
                      <div className="flex items-center space-x-1">
                        {renderStars(job.companyRating)}
                        <span className="text-sm text-gray-500 dark:text-gray-400 ml-1">
                          ({job.companyRating})
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                      {job.description}
                    </p>
                    
                    <div className="mb-3">
                      <h5 className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                        Why this matches you:
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {job.matchReasons.map((reason, reasonIndex) => (
                          <span
                            key={reasonIndex}
                            className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 text-xs rounded-full"
                          >
                            ✓ {reason}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      {job.requirements.slice(0, 5).map((req, reqIndex) => (
                        <span
                          key={reqIndex}
                          className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded"
                        >
                          {req}
                        </span>
                      ))}
                      {job.requirements.length > 5 && (
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded">
                          +{job.requirements.length - 5} more
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                      <span>💰 {job.salary}</span>
                      <span>📅 Posted {getDaysAgo(job.postedDate)}</span>
                      <span>👥 {job.applicants} applicants</span>
                      <span>⏰ Apply by {new Date(job.applicationDeadline).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col space-y-2 ml-4">
                  <button
                    onClick={() => setSelectedJob(job)}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                  >
                    View Details
                  </button>
                  {!job.isApplied ? (
                    <button
                      onClick={() => applyToJob(job.id)}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                    >
                      Apply Now
                    </button>
                  ) : (
                    <button
                      disabled
                      className="px-3 py-1 bg-gray-400 text-white text-sm rounded cursor-not-allowed"
                    >
                      Applied
                    </button>
                  )}
                  <button
                    onClick={() => toggleFavorite(job.id)}
                    className={`px-3 py-1 text-sm rounded transition-colors ${
                      job.isFavorite
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : 'bg-gray-600 text-white hover:bg-gray-700'
                    }`}
                  >
                    {job.isFavorite ? '❤️ Saved' : '🤍 Save'}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Job Detail Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg max-w-[95vw] sm:max-w-[460px] md:max-w-[490px] lg:max-w-[510px] w-full max-h-96 overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {selectedJob.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {selectedJob.company} • {selectedJob.location}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedJob(null)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Job Description</h4>
                    <p className="text-gray-600 dark:text-gray-400">{selectedJob.description}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Requirements</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedJob.requirements.map((req, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                        >
                          {req}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Benefits</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedJob.benefits.map((benefit, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm"
                        >
                          {benefit}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Match Analysis</h4>
                    <div className="space-y-2">
                      {selectedJob.matchReasons.map((reason, index) => (
                        <div key={index} className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <span className="text-green-500 mr-2">✓</span>
                          {reason}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setSelectedJob(null)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => toggleFavorite(selectedJob.id)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    selectedJob.isFavorite
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-gray-600 text-white hover:bg-gray-700'
                  }`}
                >
                  {selectedJob.isFavorite ? '❤️ Remove from Favorites' : '🤍 Add to Favorites'}
                </button>
                {!selectedJob.isApplied && (
                  <button
                    onClick={() => {
                      applyToJob(selectedJob.id);
                      setSelectedJob(null);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Apply Now
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default RecommendedTab;
