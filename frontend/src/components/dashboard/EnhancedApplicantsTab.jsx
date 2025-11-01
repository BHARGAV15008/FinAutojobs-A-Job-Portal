import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { applicationsAPI, candidatesAPI, interviewsAPI } from '../../services/api';
import CandidateProfileModal from '../modals/CandidateProfileModal';
import ContactModal from '../modals/ContactModal';
import ScheduleModal from '../modals/ScheduleModal';

const EnhancedApplicantsTab = () => {
  // Use CSS classes for dark mode detection instead of theme context
  const [darkMode] = useState(() => {
    return document.documentElement.classList.contains('dark');
  });
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'cards'
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('appliedDate');
  const [sortOrder, setSortOrder] = useState('desc');
  const [openDropdown, setOpenDropdown] = useState(null);
  
  // Modal states
  const [profileModal, setProfileModal] = useState({ isOpen: false, candidate: null });
  const [contactModal, setContactModal] = useState({ isOpen: false, candidate: null });
  const [scheduleModal, setScheduleModal] = useState({ isOpen: false, candidate: null });

  // Dropdown handlers
  const toggleDropdown = (applicantId) => {
    setOpenDropdown(openDropdown === applicantId ? null : applicantId);
  };

  const closeDropdown = () => {
    setOpenDropdown(null);
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => {
      closeDropdown();
    };

    if (openDropdown) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [openDropdown]);

  // Mock applicants data with comprehensive information
  const mockApplicants = [
    {
      id: 1,
      name: 'Rajesh Kumar',
      email: 'rajesh.kumar@email.com',
      phone: '+91 9876543210',
      jobTitle: 'Senior Frontend Developer',
      jobId: 'job-001',
      appliedDate: '2024-01-15',
      status: 'shortlisted',
      experience: '5 years',
      location: 'Mumbai, India',
      skills: ['React', 'JavaScript', 'TypeScript', 'Node.js'],
      education: [{
        degree: 'B.Tech Computer Science',
        institution: 'Indian Institute of Technology',
        year: '2019',
        grade: '8.2 CGPA'
      }],
      workExperience: [{
        company: 'TechCorp Solutions',
        position: 'Frontend Developer',
        duration: '2019 - Present',
        description: 'Developed responsive web applications using React and modern JavaScript.'
      }],
      portfolioLinks: [{
        type: 'Portfolio',
        url: 'https://rajesh-portfolio.com',
        label: 'Personal Portfolio'
      }],
      resume: 'rajesh_kumar_resume.pdf',
      coverLetter: 'Looking forward to contributing to your team...',
      interviewRound: null,
      rating: 4.5,
      notes: 'Strong technical background, good communication skills',
      avatar: '👨‍💻'
    },
    {
      id: 2,
      name: 'Priya Sharma',
      email: 'priya.sharma@email.com',
      phone: '+91 9876543211',
      jobTitle: 'Full Stack Developer',
      jobId: 'job-002',
      appliedDate: '2024-01-18',
      status: 'interviewed_round1',
      experience: '3 years',
      location: 'Bangalore, India',
      skills: ['React', 'Python', 'Django', 'PostgreSQL'],
      education: [{
        degree: 'MCA',
        institution: 'National Institute of Technology',
        year: '2021',
        grade: '8.5 CGPA'
      }],
      workExperience: [{
        company: 'Digital Solutions Ltd.',
        position: 'Full Stack Developer',
        duration: '2021 - Present',
        description: 'Built web applications using Python Django and React framework.'
      }],
      portfolioLinks: [{
        type: 'GitHub',
        url: 'https://github.com/priya-sharma',
        label: 'GitHub Profile'
      }],
      resume: 'priya_sharma_resume.pdf',
      coverLetter: 'Excited about the opportunity...',
      interviewRound: 1,
      rating: 4.2,
      notes: 'Good problem-solving skills, needs improvement in system design',
      avatar: '👩‍💻'
    },
    {
      id: 3,
      name: 'Amit Patel',
      email: 'amit.patel@email.com',
      phone: '+91 9876543212',
      jobTitle: 'Backend Developer',
      jobId: 'job-003',
      appliedDate: '2024-01-20',
      status: 'pending',
      experience: '2 years',
      location: 'Pune, India',
      skills: ['Java', 'Spring Boot', 'MySQL', 'AWS'],
      education: 'B.E. Information Technology',
      resume: 'amit_patel_resume.pdf',
      coverLetter: 'I am passionate about backend development...',
      interviewRound: null,
      rating: 3.8,
      notes: 'Fresh graduate with good potential',
      avatar: '👨‍💼'
    },
    {
      id: 4,
      name: 'Sneha Reddy',
      email: 'sneha.reddy@email.com',
      phone: '+91 9876543213',
      jobTitle: 'UI/UX Designer',
      jobId: 'job-004',
      appliedDate: '2024-01-22',
      status: 'interviewed_round2',
      experience: '4 years',
      location: 'Hyderabad, India',
      skills: ['Figma', 'Adobe XD', 'Sketch', 'Prototyping'],
      education: 'B.Des Visual Communication',
      resume: 'sneha_reddy_resume.pdf',
      coverLetter: 'Design is my passion...',
      interviewRound: 2,
      rating: 4.7,
      notes: 'Excellent design portfolio, creative thinking',
      avatar: '👩‍🎨'
    },
    {
      id: 5,
      name: 'Vikram Singh',
      email: 'vikram.singh@email.com',
      phone: '+91 9876543214',
      jobTitle: 'DevOps Engineer',
      jobId: 'job-005',
      appliedDate: '2024-01-25',
      status: 'rejected',
      experience: '6 years',
      location: 'Delhi, India',
      skills: ['Docker', 'Kubernetes', 'AWS', 'Jenkins'],
      education: 'M.Tech Computer Science',
      resume: 'vikram_singh_resume.pdf',
      coverLetter: 'Experienced in cloud infrastructure...',
      interviewRound: null,
      rating: 3.5,
      notes: 'Overqualified for the position',
      avatar: '👨‍🔧'
    },
    {
      id: 6,
      name: 'Anita Gupta',
      email: 'anita.gupta@email.com',
      phone: '+91 9876543215',
      jobTitle: 'Data Scientist',
      jobId: 'job-006',
      appliedDate: '2024-01-28',
      status: 'interviewed_final',
      experience: '3 years',
      location: 'Chennai, India',
      skills: ['Python', 'Machine Learning', 'TensorFlow', 'SQL'],
      education: 'M.Sc. Statistics',
      resume: 'anita_gupta_resume.pdf',
      coverLetter: 'Data science enthusiast...',
      interviewRound: 'final',
      rating: 4.8,
      notes: 'Strong analytical skills, excellent candidate',
      avatar: '👩‍🔬'
    }
  ];

  // Status configuration
  const statusConfig = {
    all: { label: 'All Applicants', color: 'bg-gray-100 text-gray-800', count: mockApplicants.length },
    pending: { label: 'Pending Review', color: 'bg-yellow-100 text-yellow-800', count: mockApplicants.filter(a => a.status === 'pending').length },
    shortlisted: { label: 'Shortlisted', color: 'bg-green-100 text-green-800', count: mockApplicants.filter(a => a.status === 'shortlisted').length },
    interviewed_round1: { label: 'Round 1 Interview', color: 'bg-blue-100 text-blue-800', count: mockApplicants.filter(a => a.status === 'interviewed_round1').length },
    interviewed_round2: { label: 'Round 2 Interview', color: 'bg-indigo-100 text-indigo-800', count: mockApplicants.filter(a => a.status === 'interviewed_round2').length },
    interviewed_final: { label: 'Final Interview', color: 'bg-purple-100 text-purple-800', count: mockApplicants.filter(a => a.status === 'interviewed_final').length },
    rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800', count: mockApplicants.filter(a => a.status === 'rejected').length },
    hired: { label: 'Hired', color: 'bg-emerald-100 text-emerald-800', count: mockApplicants.filter(a => a.status === 'hired').length }
  };

  // Filter and sort applicants
  const filteredAndSortedApplicants = useMemo(() => {
    let filtered = mockApplicants;

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(applicant => applicant.status === selectedStatus);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(applicant =>
        applicant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        applicant.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        applicant.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        applicant.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Sort applicants
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === 'appliedDate') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  }, [selectedStatus, searchQuery, sortBy, sortOrder]);

  // Handle status change with database integration
  const handleStatusChange = async (applicantId, newStatus) => {
    try {
      // Map frontend status to backend status format
      const statusMapping = {
        'pending': 'pending',
        'shortlisted': 'shortlisted', 
        'interviewed_round1': 'interview_scheduled',
        'interviewed_round2': 'interviewed',
        'interviewed_final': 'interviewed',
        'rejected': 'rejected',
        'hired': 'hired'
      };

      const backendStatus = statusMapping[newStatus] || newStatus;
      
      const response = await applicationsAPI.updateApplicationStatus(applicantId, backendStatus);
      console.log('Status update result:', response.data);
      
      alert(`✅ Applicant status updated to ${newStatus} - Database updated successfully!`);
      
      // Optionally refresh the applicants list here
      // You could implement a state update instead of page reload
      
    } catch (error) {
      console.error('Failed to update status:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error occurred';
      alert(`❌ Failed to update status: ${errorMessage}. Please try again.`);
    }
  };

  // Modal handlers
  const handleViewApplicant = (applicant) => {
    setProfileModal({ isOpen: true, candidate: applicant });
  };

  const handleContactApplicant = (applicant) => {
    setContactModal({ isOpen: true, candidate: applicant });
  };

  const handleScheduleInterview = (applicant) => {
    setScheduleModal({ isOpen: true, candidate: applicant });
  };

  // Email and messaging handlers
  const handleSendEmail = async (emailData) => {
    try {
      const candidate = contactModal.candidate;
      if (!candidate) throw new Error('No candidate selected');
      
      await candidatesAPI.sendEmailToCandidate(candidate.id, emailData);
      alert('✅ Email sent successfully!');
    } catch (error) {
      console.error('Failed to send email:', error);
      throw error;
    }
  };

  const handleOpenMessaging = (candidate) => {
    alert(`Opening messaging with ${candidate.name}...`);
  };

  const handleDownloadResume = async (candidateId, candidateName, candidateUsername) => {
    try {
      const response = await candidatesAPI.downloadCandidateResume(candidateId, candidateName, candidateUsername);
      
      if (response.success) {
        alert('✅ Resume downloaded successfully!');
      }
    } catch (error) {
      console.error('Failed to download resume:', error);
      throw error;
    }
  };

  // Interview scheduling handlers
  const handleScheduleNewInterview = async (interviewData) => {
    try {
      const response = await interviewsAPI.scheduleInterview(interviewData);
      console.log('Interview scheduled:', response.data);
      alert('✅ Interview scheduled successfully! Notifications sent to candidate.');
    } catch (error) {
      console.error('Failed to schedule interview:', error);
      throw error;
    }
  };

  const handleRescheduleInterview = async (interviewId, newDateTime) => {
    try {
      // Extract the correct fields from newDateTime object
      const updateData = {
        scheduledDate: new Date(newDateTime.date || newDateTime.scheduledDate).toISOString(),
        scheduledTime: newDateTime.time || newDateTime.scheduledTime,
        duration: newDateTime.duration,
        type: newDateTime.type,
        location: newDateTime.location || '',
        meetingLink: newDateTime.meetingLink || '',
        description: newDateTime.notes || newDateTime.description || '',
        status: 'rescheduled'
      };
      
      console.log('🔄 Updating interview with data:', updateData);
      
      const response = await interviewsAPI.updateInterview(interviewId, updateData);
      console.log('Interview rescheduled:', response.data);
      alert('✅ Interview rescheduled successfully! Notifications sent to candidate.');
    } catch (error) {
      console.error('Failed to reschedule interview:', error);
      throw error;
    }
  };

  const handleCancelInterview = async (interviewId) => {
    try {
      const response = await interviewsAPI.cancelInterview(interviewId);
      console.log('Interview cancelled:', response.data);
      alert('✅ Interview cancelled successfully! Notifications sent to candidate.');
    } catch (error) {
      console.error('Failed to cancel interview:', error);
      throw error;
    }
  };

  // Handle applicant action with modal integration
  const handleApplicantAction = async (action, applicant) => {
    switch (action) {
      case 'view':
        handleViewApplicant(applicant);
        break;
      case 'interview':
        handleScheduleInterview(applicant);
        break;
      case 'message':
        handleContactApplicant(applicant);
        break;
      case 'shortlist':
        try {
          await candidatesAPI.updateCandidateStatus(applicant.id, 'shortlisted', 'Shortlisted from applicants tab');
          alert(`✅ ${applicant.name} has been shortlisted!`);
        } catch (error) {
          console.error('Failed to shortlist applicant:', error);
          alert('❌ Failed to shortlist applicant. Please try again.');
        }
        break;
      case 'reject':
        if (!window.confirm(`Are you sure you want to reject ${applicant.name}?`)) {
          return;
        }
        try {
          await candidatesAPI.updateCandidateStatus(applicant.id, 'rejected', 'Rejected from applicants tab');
          alert(`✅ ${applicant.name} has been rejected.`);
        } catch (error) {
          console.error('Failed to reject applicant:', error);
          alert('❌ Failed to reject applicant. Please try again.');
        }
        break;
      default:
        console.log(`Action: ${action} for applicant: ${applicant.name}`);
    }
  };

  return (
    <motion.div
      className="space-y-3"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
              <span className="mr-3 text-blue-600">👥</span>
              Applicant Management
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage and track all job applications • {mockApplicants.length} total applicants
            </p>
          </div>

          {/* View Mode Toggle */}
          <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            <motion.button
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setViewMode('table')}
            >
              📋 Table
            </motion.button>
            <motion.button
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                viewMode === 'cards'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setViewMode('cards')}
            >
              📊 Cards
            </motion.button>
          </div>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-1">
        <div className="flex flex-wrap gap-1">
          {Object.entries(statusConfig).map(([status, config]) => (
            <motion.button
              key={status}
              className={`relative px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                selectedStatus === status
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedStatus(status)}
            >
              <span>{config.label}</span>
              <span className={`px-2 py-1 text-xs rounded-full font-semibold ${
                selectedStatus === status
                  ? 'bg-white/20 text-white'
                  : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
              }`}>
                {config.count}
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Search and Sort Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400">🔍</span>
            </div>
            <input
              type="text"
              placeholder="Search applicants by name, email, job title, or skills..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white dark:focus:bg-gray-600 transition-colors"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="appliedDate">📅 Applied Date</option>
              <option value="name">👤 Name</option>
              <option value="rating">⭐ Rating</option>
              <option value="experience">💼 Experience</option>
            </select>
            <motion.button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
            >
              {sortOrder === 'asc' ? '↑ ASC' : '↓ DESC'}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Applicants Display */}
      <AnimatePresence mode="wait">
        {filteredAndSortedApplicants.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center"
          >
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Applicants Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {searchQuery 
                ? `No applicants match your search "${searchQuery}"`
                : selectedStatus !== 'all' 
                ? `No applicants with status "${statusConfig[selectedStatus]?.label}"`
                : "No applicants have applied yet"
              }
            </p>
            {(searchQuery || selectedStatus !== 'all') && (
              <motion.button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedStatus('all');
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Clear Filters
              </motion.button>
            )}
          </motion.div>
        ) : viewMode === 'table' ? (
          <motion.div
            key="table"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Applicant
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Job Applied
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Applied Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Experience
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Rating
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredAndSortedApplicants.map((applicant, index) => (
                    <motion.tr
                      key={applicant.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-lg">
                              {applicant.avatar}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {applicant.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {applicant.email}
                            </div>
                            <div className="text-xs text-gray-400 dark:text-gray-500">
                              📍 {applicant.location}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {applicant.jobTitle}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {applicant.skills.slice(0, 2).map((skill, skillIndex) => (
                            <span
                              key={skillIndex}
                              className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs rounded"
                            >
                              {skill}
                            </span>
                          ))}
                          {applicant.skills.length > 2 && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              +{applicant.skills.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {new Date(applicant.appliedDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={applicant.status}
                          onChange={(e) => handleStatusChange(applicant.id, e.target.value)}
                          className={`px-3 py-1 rounded-full text-xs font-medium border-0 ${statusConfig[applicant.status]?.color || statusConfig.pending.color}`}
                        >
                          <option value="pending">Pending Review</option>
                          <option value="shortlisted">Shortlisted</option>
                          <option value="interviewed_round1">Round 1 Interview</option>
                          <option value="interviewed_round2">Round 2 Interview</option>
                          <option value="interviewed_final">Final Interview</option>
                          <option value="rejected">Rejected</option>
                          <option value="hired">Hired</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {applicant.experience}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-sm text-gray-900 dark:text-white mr-1">
                            {applicant.rating}
                          </span>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <span
                                key={i}
                                className={`text-xs ${
                                  i < Math.floor(applicant.rating)
                                    ? 'text-yellow-400'
                                    : 'text-gray-300 dark:text-gray-600'
                                }`}
                              >
                                ⭐
                              </span>
                            ))}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="relative">
                          <motion.button
                            className="flex items-center justify-center w-8 h-8 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors duration-200"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleDropdown(applicant.id);
                            }}
                          >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                            </svg>
                          </motion.button>

                          {/* Dropdown Menu */}
                          <AnimatePresence>
                            {openDropdown === applicant.id && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                transition={{ duration: 0.15 }}
                                className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div className="py-1">
                                  <motion.button
                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                                    whileHover={{ x: 4 }}
                                    onClick={() => {
                                      handleApplicantAction('view', applicant);
                                      closeDropdown();
                                    }}
                                  >
                                    <span className="mr-3">👁️</span>
                                    View Profile
                                  </motion.button>
                                  
                                  <motion.button
                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                                    whileHover={{ x: 4 }}
                                    onClick={() => {
                                      handleApplicantAction('message', applicant);
                                      closeDropdown();
                                    }}
                                  >
                                    <span className="mr-3">📧</span>
                                    Contact
                                  </motion.button>
                                  
                                  <motion.button
                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                                    whileHover={{ x: 4 }}
                                    onClick={() => {
                                      handleApplicantAction('download', applicant);
                                      closeDropdown();
                                    }}
                                  >
                                    <span className="mr-3">📄</span>
                                    Download Resume
                                  </motion.button>
                                  
                                  <motion.button
                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                                    whileHover={{ x: 4 }}
                                    onClick={() => {
                                      handleApplicantAction('interview', applicant);
                                      closeDropdown();
                                    }}
                                  >
                                    <span className="mr-3">📅</span>
                                    Schedule Interview
                                  </motion.button>
                                  
                                  <motion.button
                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                                    whileHover={{ x: 4 }}
                                    onClick={() => {
                                      handleApplicantAction('shortlist', applicant);
                                      closeDropdown();
                                    }}
                                  >
                                    <span className="mr-3">⭐</span>
                                    Add to Shortlist
                                  </motion.button>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="cards"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredAndSortedApplicants.map((applicant, index) => (
              <motion.div
                key={applicant.id}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-300"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -2 }}
              >
                {/* Card Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-xl mr-3">
                      {applicant.avatar}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {applicant.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {applicant.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm text-gray-900 dark:text-white mr-1">
                      {applicant.rating}
                    </span>
                    <span className="text-yellow-400">⭐</span>
                  </div>
                </div>

                {/* Job Information */}
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    Applied for: {applicant.jobTitle}
                  </h4>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mb-2">
                    <span className="mr-4">📍 {applicant.location}</span>
                    <span>⏱️ {applicant.experience}</span>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Applied: {new Date(applicant.appliedDate).toLocaleDateString()}
                  </div>
                </div>

                {/* Skills */}
                <div className="mb-4">
                  <div className="flex flex-wrap gap-1">
                    {applicant.skills.map((skill, skillIndex) => (
                      <span
                        key={skillIndex}
                        className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 text-xs rounded"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Status */}
                <div className="mb-4">
                  <select
                    value={applicant.status}
                    onChange={(e) => handleStatusChange(applicant.id, e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg text-sm font-medium ${statusConfig[applicant.status]?.color || statusConfig.pending.color}`}
                  >
                    <option value="pending">Pending Review</option>
                    <option value="shortlisted">Shortlisted</option>
                    <option value="interviewed_round1">Round 1 Interview</option>
                    <option value="interviewed_round2">Round 2 Interview</option>
                    <option value="interviewed_final">Final Interview</option>
                    <option value="rejected">Rejected</option>
                    <option value="hired">Hired</option>
                  </select>
                </div>

                {/* Notes */}
                {applicant.notes && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                      "{applicant.notes}"
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2">
                  <motion.button
                    className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors duration-200 text-sm"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleApplicantAction('view', applicant)}
                  >
                    👁️ View
                  </motion.button>
                  <motion.button
                    className="px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors duration-200 text-sm"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleApplicantAction('message', applicant)}
                  >
                    📧 Contact
                  </motion.button>
                  <motion.button
                    className="px-3 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors duration-200 text-sm"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleApplicantAction('download', applicant)}
                  >
                    📄 Resume
                  </motion.button>
                  <motion.button
                    className="px-3 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors duration-200 text-sm"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleApplicantAction('interview', applicant)}
                  >
                    📅 Schedule
                  </motion.button>
                  <motion.button
                    className="px-3 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition-colors duration-200 text-sm"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleApplicantAction('shortlist', applicant)}
                  >
                    ⭐ Shortlist
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Summary */}
      <div className="text-center text-gray-600 dark:text-gray-400">
        Showing {filteredAndSortedApplicants.length} of {mockApplicants.length} applicants
      </div>

      {/* Modals */}
      <CandidateProfileModal
        candidate={profileModal.candidate}
        isOpen={profileModal.isOpen}
        onClose={() => setProfileModal({ isOpen: false, candidate: null })}
        onContact={handleContactApplicant}
        onSchedule={handleScheduleInterview}
        onShortlist={(candidate) => handleApplicantAction('shortlist', candidate)}
        onDownloadResume={handleDownloadResume}
      />

      <ContactModal
        candidate={contactModal.candidate}
        isOpen={contactModal.isOpen}
        onClose={() => setContactModal({ isOpen: false, candidate: null })}
        onSendEmail={handleSendEmail}
        onOpenMessaging={handleOpenMessaging}
      />

      <ScheduleModal
        candidate={scheduleModal.candidate}
        isOpen={scheduleModal.isOpen}
        onClose={() => setScheduleModal({ isOpen: false, candidate: null })}
        onScheduleInterview={handleScheduleNewInterview}
        onRescheduleInterview={handleRescheduleInterview}
        onCancelInterview={handleCancelInterview}
      />
    </motion.div>
  );
};

export default EnhancedApplicantsTab;
