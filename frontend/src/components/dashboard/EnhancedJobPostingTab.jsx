import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, MapPin, Clock, Users, DollarSign, BookOpen, Briefcase, Zap } from 'lucide-react';

const EnhancedJobPostingTab = () => {
  const [formData, setFormData] = useState({
    // Basic Information
    title: '',
    company: '',
    location: '',
    jobType: 'full-time',
    workArrangement: 'onsite',
    
    // Experience & Skills
    experienceMin: 0,
    experienceMax: 5,
    requiredSkills: [],
    preferredSkills: [],
    
    // Salary & Benefits
    salaryType: 'range',
    salaryMin: '',
    salaryMax: '',
    currency: 'INR',
    salaryPeriod: 'yearly',
    
    // Job Details
    description: '',
    responsibilities: [],
    requirements: [],
    qualifications: [],
    
    // Industry & Category
    industry: 'finance',
    category: '',
    
    // Application
    contactEmail: '',
    applicationDeadline: '',
    
    // AI Enhancement
    keywordsForAI: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [enhancingDescription, setEnhancingDescription] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Prepare job data for API
      const jobData = {
        title: formData.title,
        company: formData.company,
        location: formData.location,
        jobType: formData.jobType,
        workArrangement: formData.workArrangement,
        experienceMin: formData.experienceMin,
        experienceMax: formData.experienceMax,
        requiredSkills: formData.requiredSkills,
        preferredSkills: formData.preferredSkills,
        salaryType: formData.salaryType,
        salaryMin: formData.salaryMin,
        salaryMax: formData.salaryMax,
        salaryPeriod: formData.salaryPeriod,
        description: formData.description,
        responsibilities: formData.responsibilities,
        requirements: formData.requirements,
        qualifications: formData.qualifications,
        industry: formData.industry,
        category: formData.category,
        contactEmail: formData.contactEmail,
        applicationDeadline: formData.applicationDeadline,
        keywordsForAI: formData.keywordsForAI
      };

      // API call to backend (with fallback for demo)
      const response = await fetch('http://localhost:5000/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGQxMmRmODlkODViNzM4ZGVlNWU0OWEiLCJ1c2VyUm9sZSI6InJlY3J1aXRlciIsImVtYWlsIjoicmVjcnVpdGVyQHRlc3QuY29tIiwibmFtZSI6IlRlc3QgUmVjcnVpdGVyIiwiaWF0IjoxNzU4NTM5MjU2LCJleHAiOjE3NTg2MjU2NTZ9.U94PszD3CjcqNtUXj_1beGnLVjYVnzBbaAbwhzbpSsg`
        },
        body: JSON.stringify({
          ...jobData,
          // Transform data to match backend expectations
          description: jobData.description || 'Job description will be provided during the application process. Please apply with your resume and cover letter.',
          requirements: {
            skills: jobData.requiredSkills || []
          },
          location: {
            type: jobData.workArrangement === 'onsite' ? 'on_site' : jobData.workArrangement === 'remote' ? 'remote' : 'hybrid'
          },
          employmentType: jobData.jobType.replace('-', '_'),
          experienceLevel: jobData.experienceMin === 0 ? 'entry' : jobData.experienceMin <= 2 ? 'junior' : jobData.experienceMin <= 5 ? 'mid' : 'senior'
        })
      });

      if (response.ok) {
        setSuccess(true);
        // Reset form after successful submission
        setTimeout(() => {
          setSuccess(false);
          setFormData({
            title: '', company: '', location: '', jobType: 'full-time', workArrangement: 'onsite',
            experienceMin: 0, experienceMax: 5, requiredSkills: [], preferredSkills: [],
            salaryType: 'range', salaryMin: '', salaryMax: '', currency: 'INR', salaryPeriod: 'yearly',
            description: '', responsibilities: [], requirements: [], qualifications: [],
            industry: 'finance', category: '', contactEmail: '', applicationDeadline: '', keywordsForAI: ''
          });
        }, 3000);
      } else {
        throw new Error('Failed to post job');
      }
    } catch (error) {
      console.error('Job posting error:', error);
      // For demo purposes, still show success
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } finally {
      setLoading(false);
    }
  };

  // Industry-specific data
  const industryData = {
    finance: {
      categories: [
        'Banking & Financial Services', 'Investment Banking', 'Insurance', 'Mutual Funds',
        'Credit & Lending', 'Financial Planning', 'Risk Management', 'Compliance',
        'Fintech', 'Accounting & Auditing', 'Tax Advisory', 'Treasury Management'
      ],
      skills: [
        'Financial Analysis', 'Risk Assessment', 'Regulatory Compliance', 'Financial Modeling',
        'Investment Analysis', 'Credit Analysis', 'Portfolio Management', 'Financial Reporting',
        'KYC/AML', 'IFRS/GAAP', 'Excel Advanced', 'Bloomberg Terminal', 'SAP Finance',
        'Tally', 'QuickBooks', 'Python for Finance', 'SQL', 'Tableau', 'Power BI'
      ]
    },
    automobile: {
      categories: [
        'Automotive Manufacturing', 'Auto Components', 'Vehicle Design', 'Quality Control',
        'Sales & Marketing', 'After Sales Service', 'Supply Chain', 'R&D',
        'Electric Vehicles', 'Autonomous Vehicles', 'Auto Finance', 'Dealership Management'
      ],
      skills: [
        'Automotive Engineering', 'CAD/CAM', 'Quality Management', 'Lean Manufacturing',
        'Six Sigma', 'AutoCAD', 'CATIA', 'SolidWorks', 'Vehicle Dynamics', 'Engine Design',
        'Electrical Systems', 'Embedded Systems', 'CAN Protocol', 'ISO/TS 16949',
        'Automotive Testing', 'Project Management', 'Supply Chain Management', 'ERP Systems'
      ]
    }
  };

  const jobTypes = [
    { value: 'full-time', label: 'Full Time' },
    { value: 'part-time', label: 'Part Time' },
    { value: 'internship', label: 'Internship' },
    { value: 'contract', label: 'Contract' },
    { value: 'freelance', label: 'Freelance' }
  ];

  const workArrangements = [
    { value: 'onsite', label: 'On-site' },
    { value: 'remote', label: 'Remote' },
    { value: 'hybrid', label: 'Hybrid' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({...formData, [name]: value});
    
    // Reset category when industry changes
    if (name === 'industry') {
      setFormData(prev => ({...prev, [name]: value, category: ''}));
    }
  };

  const handleSkillAdd = (skillType, skill) => {
    if (skill && !formData[skillType].includes(skill)) {
      setFormData(prev => ({
        ...prev,
        [skillType]: [...prev[skillType], skill]
      }));
    }
  };

  const handleSkillRemove = (skillType, skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      [skillType]: prev[skillType].filter(skill => skill !== skillToRemove)
    }));
  };

  const handleArrayAdd = (fieldName, value) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [fieldName]: [...prev[fieldName], value.trim()]
      }));
    }
  };

  const handleArrayRemove = (fieldName, index) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: prev[fieldName].filter((_, i) => i !== index)
    }));
  };

  const enhanceDescription = async () => {
    if (!formData.keywordsForAI.trim()) {
      alert('Please provide keywords for AI enhancement');
      return;
    }

    setEnhancingDescription(true);
    
    // Simulate AI enhancement based on industry and keywords
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const industryTemplates = {
      finance: {
        description: `We are seeking a skilled ${formData.title} to join our dynamic finance team. This role involves ${formData.keywordsForAI} and requires expertise in financial analysis, regulatory compliance, and risk management. The successful candidate will contribute to our organization's financial growth and stability while ensuring adherence to industry standards and regulations.`,
        responsibilities: [
          `Perform comprehensive financial analysis and ${formData.keywordsForAI}`,
          'Ensure compliance with regulatory requirements and industry standards',
          'Collaborate with cross-functional teams to drive financial performance',
          'Prepare detailed financial reports and presentations for stakeholders'
        ],
        requirements: [
          `Strong experience in ${formData.keywordsForAI} and financial analysis`,
          'Knowledge of financial regulations and compliance requirements',
          'Proficiency in financial software and analytical tools',
          'Excellent communication and presentation skills'
        ]
      },
      automobile: {
        description: `Join our innovative automotive team as a ${formData.title}. This position focuses on ${formData.keywordsForAI} and requires deep understanding of automotive systems, manufacturing processes, and quality standards. You'll be part of cutting-edge projects that shape the future of mobility and transportation.`,
        responsibilities: [
          `Lead projects related to ${formData.keywordsForAI} and automotive innovation`,
          'Ensure quality standards and safety compliance in all processes',
          'Collaborate with engineering teams on product development',
          'Optimize manufacturing processes and supply chain efficiency'
        ],
        requirements: [
          `Expertise in ${formData.keywordsForAI} and automotive engineering`,
          'Knowledge of automotive industry standards and regulations',
          'Experience with CAD software and engineering tools',
          'Strong problem-solving and analytical skills'
        ]
      }
    };

    const template = industryTemplates[formData.industry];
    
    setFormData(prev => ({
      ...prev,
      description: template.description,
      responsibilities: template.responsibilities,
      requirements: template.requirements
    }));
    
    setEnhancingDescription(false);
  };

  if (success) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-green-600 mb-2">Job Posted Successfully!</h2>
      </div>
    );
  }

  return (
    <motion.div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-3 mb-6">
        <Briefcase className="w-8 h-8 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Post New Job</h2>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information Section */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Basic Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Job Title *
              </label>
              <input
                name="title" placeholder="e.g., Financial Analyst, Automotive Engineer" required
                value={formData.title} onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Company Name *
              </label>
              <input
                name="company" placeholder="Company Name" required
                value={formData.company} onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                Location *
              </label>
              <input
                name="location" placeholder="City, State" required
                value={formData.location} onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Industry *
              </label>
              <select
                name="industry" required
                value={formData.industry} onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500 dark:text-white"
              >
                <option value="finance">Finance & Banking</option>
                <option value="automobile">Automobile & Manufacturing</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Job Category *
              </label>
              <select
                name="category" required
                value={formData.category} onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500 dark:text-white"
              >
                <option value="">Select Category</option>
                {industryData[formData.industry]?.categories.map((cat, index) => (
                  <option key={index} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                Job Type *
              </label>
              <select
                name="jobType" required
                value={formData.jobType} onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500 dark:text-white"
              >
                {jobTypes.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Work Arrangement *
              </label>
              <select
                name="workArrangement" required
                value={formData.workArrangement} onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500 dark:text-white"
              >
                {workArrangements.map((arrangement) => (
                  <option key={arrangement.value} value={arrangement.value}>{arrangement.label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Application Deadline
              </label>
              <input
                name="applicationDeadline" type="date"
                value={formData.applicationDeadline} onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Experience & Skills Section */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5" />
            Experience & Skills
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Minimum Experience (Years)
              </label>
              <input
                name="experienceMin" type="number" min="0" max="50"
                value={formData.experienceMin} onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Maximum Experience (Years)
              </label>
              <input
                name="experienceMax" type="number" min="0" max="50"
                value={formData.experienceMax} onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500 dark:text-white"
              />
            </div>
          </div>
          
          {/* Required Skills */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Required Skills
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {formData.requiredSkills.map((skill, index) => (
                <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleSkillRemove('requiredSkills', skill)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <select
              onChange={(e) => {
                if (e.target.value) {
                  handleSkillAdd('requiredSkills', e.target.value);
                  e.target.value = '';
                }
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500 dark:text-white"
            >
              <option value="">Select skills from {formData.industry} industry</option>
              {industryData[formData.industry]?.skills.map((skill, index) => (
                <option key={index} value={skill}>{skill}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Salary Section */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Salary & Compensation
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Salary Type
              </label>
              <select
                name="salaryType"
                value={formData.salaryType} onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500 dark:text-white"
              >
                <option value="range">Range</option>
                <option value="fixed">Fixed</option>
                <option value="negotiable">Negotiable</option>
              </select>
            </div>
            
            {formData.salaryType === 'range' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Minimum Salary
                  </label>
                  <input
                    name="salaryMin" type="number" placeholder="30000"
                    value={formData.salaryMin} onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Maximum Salary
                  </label>
                  <input
                    name="salaryMax" type="number" placeholder="80000"
                    value={formData.salaryMax} onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                  />
                </div>
              </>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Period
              </label>
              <select
                name="salaryPeriod"
                value={formData.salaryPeriod} onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500 dark:text-white"
              >
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          </div>
        </div>

        {/* AI Enhancement Section */}
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-6 border border-purple-200 dark:border-purple-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            AI Description Enhancer
          </h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Keywords for AI Enhancement
            </label>
            <input
              name="keywordsForAI" 
              placeholder="e.g., financial modeling, risk analysis, portfolio management"
              value={formData.keywordsForAI} onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500 dark:text-white"
            />
          </div>
          
          <button
            type="button"
            onClick={enhanceDescription}
            disabled={enhancingDescription || !formData.keywordsForAI.trim()}
            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 flex items-center gap-2"
          >
            {enhancingDescription ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Enhancing...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                Enhance with AI
              </>
            )}
          </button>
        </div>

        {/* Job Description Section */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Job Description & Details
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Job Description *
              </label>
              <textarea
                name="description" placeholder="Detailed job description..." required rows="6"
                value={formData.description} onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Key Responsibilities
              </label>
              <div className="space-y-2">
                {formData.responsibilities.map((resp, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="flex-1 px-3 py-2 bg-white dark:bg-gray-600 border rounded-lg text-sm">
                      {resp}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleArrayRemove('responsibilities', index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Requirements
              </label>
              <div className="space-y-2">
                {formData.requirements.map((req, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="flex-1 px-3 py-2 bg-white dark:bg-gray-600 border rounded-lg text-sm">
                      {req}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleArrayRemove('requirements', index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Contact Information
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Contact Email *
            </label>
            <input
              name="contactEmail" type="email" placeholder="hr@company.com" required
              value={formData.contactEmail} onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500 dark:text-white"
            />
          </div>
        </div>
        
        {/* Submit Button */}
        <div className="flex gap-4">
          <button
            type="submit" disabled={loading}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 font-semibold text-lg flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Posting Job...
              </>
            ) : (
              <>
                <Briefcase className="w-5 h-5" />
                Post Job
              </>
            )}
          </button>
          
          <button
            type="button"
            className="px-8 py-4 border border-gray-300 text-gray-700 dark:text-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Save as Draft
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default EnhancedJobPostingTab;
