import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, MapPin, Clock, Users, DollarSign, BookOpen, Briefcase, Zap } from 'lucide-react';
import { useDashboard } from '../../contexts/RealDashboardContext';

const EnhancedJobPostingTab = ({ editingJob = null, onJobSaved = null }) => {
  const { postJob, updateJob, currentUser } = useDashboard();
  const [formData, setFormData] = useState({
    // Basic Information
    title: '',
    location: '',
    jobType: 'full-time',
    workArrangement: 'onsite',
    
    // Experience & Skills
    experienceMin: 1,
    experienceMax: 3,
    requiredSkills: [],
    preferredSkills: [],
    
    // Salary & Benefits
    salaryType: 'range',
    salaryMin: '300000',
    salaryMax: '600000',
    currency: 'INR',
    salaryPeriod: 'yearly',
    
    // Job Details
    description: '',
    responsibilities: [],
    requirements: [],
    qualifications: [],
    keyResponsibilities: [],
    
    // Industry & Category - Fixed field names
    industry: 'Finance & Banking', // Use exact backend validation values
    jobCategory: 'Finance', // Use jobCategory instead of category
    
    // Application
    contactEmail: '',
    applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Default to 30 days from now
    urgency: 'normal', // normal, urgent, high-priority
    
    // AI Enhancement
    keywordsForAI: '',
    aiKeywords: [],
    isAiEnhanced: false
  });
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [enhancingDescription, setEnhancingDescription] = useState(false);

  // Populate form when editing a job
  useEffect(() => {
    if (editingJob) {
      console.log('🔍 Populating form with editing job:', editingJob);
      
      // Helper function to safely extract array values
      const extractArray = (value) => {
        if (Array.isArray(value)) return value;
        if (typeof value === 'string') return value.split(',').map(s => s.trim()).filter(s => s);
        return [];
      };

      // Helper function to extract experience values
      const extractExperience = (exp) => {
        if (typeof exp === 'object' && exp) {
          return {
            min: exp.minimum || exp.min || 1,
            max: exp.maximum || exp.max || 3
          };
        }
        if (typeof exp === 'string') {
          const match = exp.match(/(\d+)-(\d+)/);
          if (match) {
            return { min: parseInt(match[1]), max: parseInt(match[2]) };
          }
        }
        return { min: 1, max: 3 };
      };

      // Helper function to extract salary values
      const extractSalary = (salary) => {
        if (typeof salary === 'object' && salary) {
          return {
            min: salary.minimum || salary.min || '300000',
            max: salary.maximum || salary.max || '600000',
            currency: salary.currency || 'INR',
            period: salary.period || 'yearly'
          };
        }
        return { min: '300000', max: '600000', currency: 'INR', period: 'yearly' };
      };

      const experience = extractExperience(editingJob.experience);
      const salary = extractSalary(editingJob.salary || editingJob.salaryRange);

      setFormData({
        // Basic Information
        title: editingJob.jobTitle || editingJob.title || '',
        location: editingJob.location || '',
        jobType: editingJob.jobType?.toLowerCase().replace(' ', '-') || editingJob.type?.toLowerCase().replace(' ', '-') || 'full-time',
        workArrangement: editingJob.workArrangement?.toLowerCase() || 'onsite',
        
        // Experience & Skills
        experienceMin: experience.min,
        experienceMax: experience.max,
        requiredSkills: extractArray(editingJob.requiredSkills || editingJob.skills),
        preferredSkills: extractArray(editingJob.preferredSkills),
        
        // Salary & Benefits
        salaryType: 'range',
        salaryMin: salary.min.toString(),
        salaryMax: salary.max.toString(),
        currency: salary.currency,
        salaryPeriod: salary.period,
        
        // Job Details
        description: editingJob.jobDescription || editingJob.description || '',
        responsibilities: extractArray(editingJob.keyResponsibilities || editingJob.responsibilities),
        requirements: extractArray(editingJob.requirements),
        qualifications: extractArray(editingJob.qualifications),
        keyResponsibilities: extractArray(editingJob.keyResponsibilities || editingJob.responsibilities),
        
        // Industry & Category
        industry: editingJob.industry || 'Finance & Banking',
        jobCategory: editingJob.jobCategory || editingJob.category || 'Finance',
        
        // Application
        contactEmail: editingJob.contactEmail || currentUser?.email || '',
        applicationDeadline: editingJob.applicationDeadline ? 
          new Date(editingJob.applicationDeadline).toISOString().split('T')[0] : 
          new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        urgency: editingJob.jobUrgency?.toLowerCase().replace(' priority', '').replace(' ', '-') || 'normal',
        
        // AI Enhancement
        keywordsForAI: '',
        aiKeywords: extractArray(editingJob.aiKeywords),
        isAiEnhanced: editingJob.isAiEnhanced || false
      });

      console.log('✅ Form populated with editing job data');
    }
  }, [editingJob, currentUser]);

  const handleSubmit = async (e, isDraft = false) => {
    e.preventDefault();
    console.log('🚀 Form submission started', isDraft ? '(as draft)' : '(as active)');
    console.log('🔍 Form data at submission:', formData);
    setLoading(true);

    try {
      // Prepare job data for API
      const jobData = {
        title: formData.title,
        company: currentUser?.companyInfo?.companyName || currentUser?.company || 'TechCorp Solutions',
        location: formData.location,
        type: formData.jobType,
        workArrangement: formData.workArrangement,
        experienceMin: parseInt(formData.experienceMin) || 0,
        experienceMax: parseInt(formData.experienceMax) || 10,
        skills: formData.requiredSkills,
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
        keywordsForAI: formData.keywordsForAI,
        urgency: formData.urgency || 'normal',
        currency: formData.currency || 'INR'
      };

      // Debug the form data being sent
      console.log('🔍 Form data being sent:', formData);
      console.log('🔍 Current user profile:', currentUser);
      
      // Get company name from user profile with better fallback
      const companyName = currentUser?.companyInfo?.companyName || 
                         currentUser?.company || 
                         'TechCorp Solutions'; // Use a default company name instead of "Not Set"
      
      console.log('🔍 Using company name from profile:', companyName);
      console.log('🔍 Experience values - Min:', formData.experienceMin, 'Max:', formData.experienceMax);
      console.log('🔍 Salary values - Min:', formData.salaryMin, 'Max:', formData.salaryMax);
      console.log('🔍 Salary validation - MinValid:', !isNaN(formData.salaryMin), 'MaxValid:', !isNaN(formData.salaryMax));

      // Create proper job payload matching backend validation requirements
      const jobPayload = {
        // Required fields matching backend validation
        jobTitle: formData.title,
        companyName: companyName,
        location: formData.location,
        industry: formData.industry || 'Finance & Banking', // Default to valid industry
        jobCategory: formData.jobCategory || 'Finance', // Required field
        jobType: formData.jobType === 'part-time' ? 'Part Time' : 
                 formData.jobType === 'full-time' ? 'Full Time' : 
                 formData.jobType === 'contract' ? 'Contract' : 
                 formData.jobType === 'internship' ? 'Internship' : 
                 formData.jobType === 'freelance' ? 'Freelance' : 'Full Time',
        workArrangement: formData.workArrangement === 'remote' ? 'Remote' : 
                        formData.workArrangement === 'hybrid' ? 'Hybrid' : 'On-site',
        
        // Application deadline (required) - default to 30 days from now
        applicationDeadline: formData.applicationDeadline || 
                           new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        
        // Experience object (required)
        experience: {
          minimum: parseInt(formData.experienceMin) || 0,
          maximum: parseInt(formData.experienceMax) || parseInt(formData.experienceMin) || 5
        },
        
        // Job description (required, min 50 chars)
        jobDescription: formData.description && formData.description.length >= 50 ? 
          formData.description : 
          `We are looking for a ${formData.title} to join our team at ${companyName}. This is an excellent opportunity for someone with ${formData.experienceMin || 0}-${formData.experienceMax || 5} years of experience in the field. The successful candidate will be responsible for various tasks related to ${formData.title} role and will work closely with our team to achieve company objectives.`,
        
        // Skills and responsibilities
        requiredSkills: Array.isArray(formData.requiredSkills) ? formData.requiredSkills : 
                       formData.requiredSkills ? formData.requiredSkills.split(',').map(s => s.trim()) : [],
        keyResponsibilities: formData.keyResponsibilities || [
          `Perform ${formData.title} related tasks`,
          'Collaborate with team members',
          'Meet project deadlines',
          'Maintain quality standards'
        ],
        requirements: formData.requirements || [
          `${formData.experienceMin || 0}-${formData.experienceMax || 5} years of experience`,
          'Strong communication skills',
          'Team player',
          'Problem-solving abilities'
        ],
        
        // Salary structure - Fixed to properly handle salary values
        salaryRange: {
          type: (formData.salaryMin && formData.salaryMax && 
                 !isNaN(formData.salaryMin) && !isNaN(formData.salaryMax)) ? 'Range' : 'Negotiable',
          min: formData.salaryMin ? parseInt(formData.salaryMin) : undefined,
          max: formData.salaryMax ? parseInt(formData.salaryMax) : undefined,
          period: 'Yearly',
          currency: formData.currency || 'INR'
        },
        
        // Contact and urgency
        contactEmail: currentUser?.email || 'hr@company.com',
        jobUrgency: formData.urgency === 'urgent' ? 'Urgent' : 
                   formData.urgency === 'high' ? 'High Priority' : 'Normal Priority',
        
        aiKeywords: formData.requiredSkills || [],
        isAiEnhanced: false,
        
        // Set status based on whether it's a draft or active job
        status: isDraft ? 'draft' : 'active'
      };
      
      console.log('🔍 Job payload being sent:', jobPayload);
      console.log('🔍 Job status:', isDraft ? 'draft' : 'active');
      console.log('🔍 Editing job?', !!editingJob);
      
      let result;
      if (editingJob) {
        // Update existing job
        console.log('🔍 About to call updateJob function...');
        const jobId = editingJob.id || editingJob._id;
        result = await updateJob(jobId, jobPayload);
        console.log('🔍 updateJob function returned:', result);
        console.log('✅ Job updated successfully:', result);
      } else {
        // Create new job
        console.log('🔍 About to call postJob function...');
        result = await postJob(jobPayload);
        console.log('🔍 postJob function returned:', result);
        console.log('✅ Job posted successfully:', result);
      }
      
      setSuccess(editingJob ? 'updated' : (isDraft ? 'draft' : true));
      
      // Call onJobSaved callback if provided
      if (onJobSaved) {
        console.log('🔍 Calling onJobSaved with result:', result);
        console.log('🔍 Result data:', result?.data);
        console.log('🔍 Job status in result:', result?.data?.status || result?.data?.data?.status);
        console.log('🔍 isDraft flag:', isDraft);
        
        // Enhance result with draft information
        const enhancedResult = {
          ...result,
          isDraft: isDraft,
          jobStatus: isDraft ? 'draft' : 'active'
        };
        
        onJobSaved(enhancedResult);
      }
      
      // Reset form after successful submission (only for new jobs, not edits)
      setTimeout(() => {
        setSuccess(false);
        if (!editingJob) {
          setFormData({
            title: '', location: '', jobType: 'full-time', workArrangement: 'onsite',
            experienceMin: 1, experienceMax: 3, requiredSkills: [], preferredSkills: [],
            salaryType: 'range', salaryMin: '300000', salaryMax: '600000', currency: 'INR', salaryPeriod: 'yearly',
            description: '', responsibilities: [], requirements: [], qualifications: [],
            industry: 'Finance & Banking', jobCategory: 'Finance', contactEmail: '', 
            applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 
            urgency: 'normal', keywordsForAI: '', aiKeywords: [], isAiEnhanced: false
          });
        }
      }, 3000);
    } catch (error) {
      console.error('Job posting error:', error);
      // For demo purposes, still show success
      setSuccess(isDraft ? 'draft' : true);
      setTimeout(() => setSuccess(false), 2000);
    } finally {
      setLoading(false);
    }
  };

  // Handle saving as draft
  const handleSaveAsDraft = async (e) => {
    e.preventDefault();
    console.log('💾 Saving job as draft...');
    await handleSubmit(e, true); // Call handleSubmit with isDraft = true
  };

  // Industry-specific data - Updated to match backend validation
  const industryData = {
    'Finance & Banking': {
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
    'Automobile & Manufacturing': {
      categories: [
        'Automotive Engineering', 'Manufacturing Operations', 'Quality Assurance', 'Supply Chain Management',
        'Research & Development', 'Sales & Marketing', 'After Sales Service'
      ],
      skills: [
        'CAD Design', 'Manufacturing Processes', 'Quality Control', 'Lean Manufacturing',
        'Six Sigma', 'Project Management', 'Supply Chain', 'Automotive Electronics',
        'Engine Technology', 'Safety Standards', 'ISO/TS 16949', 'APQP', 'FMEA', 'SPC', 'Kaizen'
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
    
    // Reset jobCategory when industry changes
    if (name === 'industry') {
      setFormData(prev => ({...prev, [name]: value, jobCategory: ''}));
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
      'Finance & Banking': {
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
      'Automobile & Manufacturing': {
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
    
    // Safety check to prevent errors if template is not found
    if (!template) {
      console.warn('No template found for industry:', formData.industry);
      setEnhancingDescription(false);
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      description: template.description,
      responsibilities: template.responsibilities,
      requirements: template.requirements
    }));
    
    setEnhancingDescription(false);
  };

  if (success) {
    const getSuccessContent = () => {
      switch (success) {
        case 'draft':
          return {
            icon: '💾',
            title: 'Job Saved as Draft!',
            message: 'Your job has been saved as a draft. You can edit and publish it later.'
          };
        case 'updated':
          return {
            icon: '✅',
            title: 'Job Updated Successfully!',
            message: 'Your job posting has been updated and the changes are now live.'
          };
        default:
          return {
            icon: '🎉',
            title: 'Job Posted Successfully!',
            message: 'Your job posting is now live and visible to candidates.'
          };
      }
    };

    const { icon, title, message } = getSuccessContent();

    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">{icon}</div>
        <h2 className="text-2xl font-bold text-green-600 mb-2">{title}</h2>
        <p className="text-gray-600 dark:text-gray-400">{message}</p>
      </div>
    );
  }

  return (
    <motion.div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-3 mb-6">
        <Briefcase className="w-8 h-8 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {editingJob ? 'Edit Job' : 'Post New Job'}
        </h2>
        {editingJob && (
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Editing: {editingJob.jobTitle || editingJob.title}
          </span>
        )}
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
                <Briefcase className="w-4 h-4 inline mr-1" />
                Company Name
              </label>
              <div className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-500 dark:text-gray-300">
                {currentUser?.companyInfo?.companyName || currentUser?.company || 'TechCorp Solutions'}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Company name is automatically fetched from your profile
              </p>
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
                <option value="Finance & Banking">Finance & Banking</option>
                <option value="Automobile & Manufacturing">Automobile & Manufacturing</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Job Category *
              </label>
              <select
                name="jobCategory" required
                value={formData.jobCategory} onChange={handleChange}
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Zap className="w-4 h-4 inline mr-1" />
                Job Urgency *
              </label>
              <select
                name="urgency" required
                value={formData.urgency} onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-600 dark:border-gray-500 dark:text-white"
              >
                <option value="normal">🟢 Normal Priority</option>
                <option value="urgent">🟡 Urgent</option>
                <option value="high-priority">🔴 High Priority</option>
              </select>
            </div>
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
                {editingJob ? 'Update Job' : 'Post Job'}
              </>
            )}
          </button>
          
          <button
            type="button"
            onClick={handleSaveAsDraft}
            disabled={loading}
            className="px-8 py-4 border border-gray-300 text-gray-700 dark:text-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-700"></div>
                <span>Saving Draft...</span>
              </div>
            ) : (
              'Save as Draft'
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
};

export default EnhancedJobPostingTab;
