import React, { useState } from 'react';
import { motion } from 'framer-motion';

const FavoritesTab = () => {
  const [favorites, setFavorites] = useState([
    {
      id: 1,
      title: 'Senior Frontend Developer',
      company: 'TechCorp India',
      location: 'Mumbai, India',
      salary: '₹12-18 LPA',
      type: 'Full-time',
      remote: false,
      postedDate: '2024-03-15',
      savedDate: '2024-03-16',
      description: 'We are looking for an experienced Frontend Developer to join our team...',
      requirements: ['React', 'JavaScript', 'TypeScript', 'CSS'],
      benefits: ['Health Insurance', 'Flexible Hours', 'Learning Budget'],
      applicationDeadline: '2024-04-15',
      companyLogo: null,
      isApplied: false,
      matchScore: 92
    },
    {
      id: 2,
      title: 'Full Stack Engineer',
      company: 'StartupXYZ',
      location: 'Remote',
      salary: '₹15-22 LPA',
      type: 'Full-time',
      remote: true,
      postedDate: '2024-03-18',
      savedDate: '2024-03-18',
      description: 'Join our dynamic team as a Full Stack Engineer and work on cutting-edge projects...',
      requirements: ['React', 'Node.js', 'MongoDB', 'AWS'],
      benefits: ['Stock Options', 'Remote Work', 'Health Insurance'],
      applicationDeadline: '2024-04-20',
      companyLogo: null,
      isApplied: true,
      matchScore: 88
    },
    {
      id: 3,
      title: 'React Developer',
      company: 'WebSolutions',
      location: 'Bangalore, India',
      salary: '₹8-14 LPA',
      type: 'Full-time',
      remote: false,
      postedDate: '2024-03-20',
      savedDate: '2024-03-21',
      description: 'Looking for a passionate React Developer to build amazing user interfaces...',
      requirements: ['React', 'Redux', 'JavaScript', 'HTML/CSS'],
      benefits: ['Health Insurance', 'Paid Time Off', 'Team Events'],
      applicationDeadline: '2024-04-10',
      companyLogo: null,
      isApplied: false,
      matchScore: 85
    },
    {
      id: 4,
      title: 'Senior JavaScript Developer',
      company: 'InnovateTech',
      location: 'Hyderabad, India',
      salary: '₹10-16 LPA',
      type: 'Full-time',
      remote: true,
      postedDate: '2024-03-12',
      savedDate: '2024-03-13',
      description: 'We need a Senior JavaScript Developer with expertise in modern frameworks...',
      requirements: ['JavaScript', 'Vue.js', 'Node.js', 'Docker'],
      benefits: ['Flexible Hours', 'Learning Budget', 'Health Insurance'],
      applicationDeadline: '2024-04-05',
      companyLogo: null,
      isApplied: false,
      matchScore: 90
    }
  ]);

  const [sortBy, setSortBy] = useState('savedDate');
  const [filterBy, setFilterBy] = useState('all');
  const [selectedJob, setSelectedJob] = useState(null);

  const removeFavorite = (jobId) => {
    setFavorites(favorites.filter(job => job.id !== jobId));
  };

  const applyToJob = (jobId) => {
    setFavorites(favorites.map(job => 
      job.id === jobId ? { ...job, isApplied: true } : job
    ));
  };

  const filteredFavorites = favorites.filter(job => {
    if (filterBy === 'all') return true;
    if (filterBy === 'applied') return job.isApplied;
    if (filterBy === 'not-applied') return !job.isApplied;
    if (filterBy === 'remote') return job.remote;
    return true;
  });

  const sortedFavorites = [...filteredFavorites].sort((a, b) => {
    switch (sortBy) {
      case 'savedDate':
        return new Date(b.savedDate) - new Date(a.savedDate);
      case 'postedDate':
        return new Date(b.postedDate) - new Date(a.postedDate);
      case 'matchScore':
        return b.matchScore - a.matchScore;
      case 'salary':
        const aSalary = parseInt(a.salary.split('-')[1].replace(/[^\d]/g, ''));
        const bSalary = parseInt(b.salary.split('-')[1].replace(/[^\d]/g, ''));
        return bSalary - aSalary;
      default:
        return 0;
    }
  });

  const getMatchScoreColor = (score) => {
    if (score >= 90) return 'text-green-600 dark:text-green-400';
    if (score >= 80) return 'text-blue-600 dark:text-blue-400';
    if (score >= 70) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getDaysAgo = (date) => {
    const today = new Date();
    const savedDate = new Date(date);
    const diffTime = Math.abs(today - savedDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Favorite Jobs</h2>
        <div className="flex space-x-3">
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">All Jobs</option>
            <option value="applied">Applied</option>
            <option value="not-applied">Not Applied</option>
            <option value="remote">Remote Only</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="savedDate">Recently Saved</option>
            <option value="postedDate">Recently Posted</option>
            <option value="matchScore">Best Match</option>
            <option value="salary">Highest Salary</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg">
              <span className="text-2xl">❤️</span>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Total Favorites</h3>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">{favorites.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
              <span className="text-2xl">✅</span>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Applied</h3>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {favorites.filter(job => job.isApplied).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <span className="text-2xl">🏠</span>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Remote Jobs</h3>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {favorites.filter(job => job.remote).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <span className="text-2xl">📊</span>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Avg Match</h3>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {Math.round(favorites.reduce((sum, job) => sum + job.matchScore, 0) / favorites.length)}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Favorites List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Your Favorite Jobs ({sortedFavorites.length})
          </h3>
        </div>
        
        {sortedFavorites.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💔</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No favorites found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {filterBy === 'all' 
                ? 'Start saving jobs you\'re interested in!'
                : 'No jobs match your current filter.'
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {sortedFavorites.map((job, index) => (
              <motion.div
                key={job.id}
                className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                      {job.company.charAt(0)}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                          {job.title}
                        </h4>
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
                      
                      <p className="text-gray-600 dark:text-gray-400 mb-2">
                        {job.company} • {job.location}
                      </p>
                      
                      <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                        {job.description}
                      </p>
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        {job.requirements.slice(0, 4).map((req, reqIndex) => (
                          <span
                            key={reqIndex}
                            className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded"
                          >
                            {req}
                          </span>
                        ))}
                        {job.requirements.length > 4 && (
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded">
                            +{job.requirements.length - 4} more
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                        <span>💰 {job.salary}</span>
                        <span>📅 Posted {getDaysAgo(job.postedDate)}</span>
                        <span>❤️ Saved {getDaysAgo(job.savedDate)}</span>
                        <span className={`font-medium ${getMatchScoreColor(job.matchScore)}`}>
                          {job.matchScore}% match
                        </span>
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
                      onClick={() => removeFavorite(job.id)}
                      className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Job Detail Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-96 overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {selectedJob.title}
                </h3>
                <button
                  onClick={() => setSelectedJob(null)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Company</h4>
                  <p className="text-gray-600 dark:text-gray-400">{selectedJob.company}</p>
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Description</h4>
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
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setSelectedJob(null)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Close
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

export default FavoritesTab;
