import React, { useState } from 'react';
import { motion } from 'framer-motion';

const CandidatesTab = () => {
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  const candidates = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+91 9876543210',
      position: 'Senior Frontend Developer',
      experience: '5 years',
      skills: ['React', 'JavaScript', 'TypeScript', 'Node.js'],
      location: 'Mumbai, India',
      status: 'shortlisted',
      appliedDate: '2024-03-15',
      resumeUrl: '#',
      profilePicture: null,
      rating: 4.5,
      notes: 'Strong technical skills, good communication'
    },
    {
      id: 2,
      name: 'Sarah Johnson',
      email: 'sarah.j@example.com',
      phone: '+91 9876543211',
      position: 'Backend Developer',
      experience: '3 years',
      skills: ['Python', 'Django', 'PostgreSQL', 'AWS'],
      location: 'Bangalore, India',
      status: 'interviewed',
      appliedDate: '2024-03-18',
      resumeUrl: '#',
      profilePicture: null,
      rating: 4.2,
      notes: 'Great problem-solving skills'
    },
    {
      id: 3,
      name: 'Mike Wilson',
      email: 'mike.w@example.com',
      phone: '+91 9876543212',
      position: 'Full Stack Developer',
      experience: '4 years',
      skills: ['React', 'Node.js', 'MongoDB', 'Express'],
      location: 'Delhi, India',
      status: 'pending',
      appliedDate: '2024-03-20',
      resumeUrl: '#',
      profilePicture: null,
      rating: 3.8,
      notes: 'Needs technical assessment'
    },
    {
      id: 4,
      name: 'Lisa Chen',
      email: 'lisa.c@example.com',
      phone: '+91 9876543213',
      position: 'DevOps Engineer',
      experience: '6 years',
      skills: ['Docker', 'Kubernetes', 'AWS', 'Jenkins'],
      location: 'Hyderabad, India',
      status: 'hired',
      appliedDate: '2024-03-12',
      resumeUrl: '#',
      profilePicture: null,
      rating: 4.8,
      notes: 'Excellent candidate, hired!'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'shortlisted':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'interviewed':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'hired':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const filteredCandidates = filterStatus === 'all' 
    ? candidates 
    : candidates.filter(candidate => candidate.status === filterStatus);

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Candidates</h2>
        <div className="flex space-x-3">
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">All Candidates</option>
            <option value="pending">Pending</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="interviewed">Interviewed</option>
            <option value="hired">Hired</option>
            <option value="rejected">Rejected</option>
          </select>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Export List
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <span className="text-2xl">⏳</span>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Pending</h3>
              <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                {candidates.filter(c => c.status === 'pending').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <span className="text-2xl">⭐</span>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Shortlisted</h3>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {candidates.filter(c => c.status === 'shortlisted').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <span className="text-2xl">🗣️</span>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Interviewed</h3>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                {candidates.filter(c => c.status === 'interviewed').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
              <span className="text-2xl">✅</span>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Hired</h3>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {candidates.filter(c => c.status === 'hired').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Candidates List */}
      <div className="bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {filterStatus === 'all' ? 'All Candidates' : `${filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)} Candidates`}
          </h3>
        </div>
        
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {filteredCandidates.map((candidate, index) => (
            <motion.div
              key={candidate.id}
              className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              onClick={() => setSelectedCandidate(candidate)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                    {candidate.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                        {candidate.name}
                      </h4>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(candidate.status)}`}>
                        {candidate.status}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      {candidate.position} • {candidate.experience} experience
                    </p>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      📍 {candidate.location} • 📧 {candidate.email}
                    </p>
                    
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Rating:</span>
                      <div className="flex items-center space-x-1">
                        {renderStars(candidate.rating)}
                        <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">
                          ({candidate.rating})
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-2">
                      {candidate.skills.slice(0, 4).map((skill, skillIndex) => (
                        <span
                          key={skillIndex}
                          className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full"
                        >
                          {skill}
                        </span>
                      ))}
                      {candidate.skills.length > 4 && (
                        <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full">
                          +{candidate.skills.length - 4} more
                        </span>
                      )}
                    </div>
                    
                    {candidate.notes && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                        💭 {candidate.notes}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col space-y-2 ml-4">
                  <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors">
                    View Profile
                  </button>
                  <button className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors">
                    Schedule Interview
                  </button>
                  <button className="px-3 py-1 bg-gray-600 text-white text-sm rounded hover:bg-gray-700 transition-colors">
                    Download Resume
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CandidatesTab;
