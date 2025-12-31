import React, { useState } from 'react';
import { motion } from 'framer-motion';

const ResumeBuilderTab = () => {
  const [activeSection, setActiveSection] = useState('personal');
  const [resumeData, setResumeData] = useState({
    personal: {
      fullName: 'John Doe',
      email: 'john.doe@example.com',
      phone: '+91 9876543210',
      location: 'Mumbai, India',
      linkedin: 'https://linkedin.com/in/johndoe',
      github: 'https://github.com/johndoe',
      portfolio: 'https://johndoe.dev'
    },
    summary: 'Experienced software developer with 5+ years in full-stack development...',
    experience: [
      {
        id: 1,
        company: 'TechCorp India',
        position: 'Senior Frontend Developer',
        startDate: '2022-01',
        endDate: 'Present',
        description: 'Led development of React-based applications...'
      }
    ],
    education: [
      {
        id: 1,
        institution: 'Mumbai University',
        degree: 'B.Tech Computer Science',
        startDate: '2016',
        endDate: '2020',
        grade: '8.5 CGPA'
      }
    ],
    skills: ['JavaScript', 'React', 'Node.js', 'Python', 'MongoDB'],
    projects: [
      {
        id: 1,
        name: 'E-commerce Platform',
        description: 'Built a full-stack e-commerce platform using React and Node.js',
        technologies: ['React', 'Node.js', 'MongoDB'],
        link: 'https://github.com/johndoe/ecommerce'
      }
    ]
  });

  const sections = [
    { id: 'personal', name: 'Personal Info', icon: '👤' },
    { id: 'summary', name: 'Summary', icon: '📝' },
    { id: 'experience', name: 'Experience', icon: '💼' },
    { id: 'education', name: 'Education', icon: '🎓' },
    { id: 'skills', name: 'Skills', icon: '⚡' },
    { id: 'projects', name: 'Projects', icon: '🚀' }
  ];

  const templates = [
    { id: 'modern', name: 'Modern', preview: '🎨' },
    { id: 'classic', name: 'Classic', preview: '📄' },
    { id: 'creative', name: 'Creative', preview: '🎭' },
    { id: 'minimal', name: 'Minimal', preview: '⚪' }
  ];

  const renderPersonalInfo = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Full Name
          </label>
          <input
            type="text"
            value={resumeData.personal.fullName}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            onChange={(e) => setResumeData({
              ...resumeData,
              personal: { ...resumeData.personal, fullName: e.target.value }
            })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email
          </label>
          <input
            type="email"
            value={resumeData.personal.email}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            onChange={(e) => setResumeData({
              ...resumeData,
              personal: { ...resumeData.personal, email: e.target.value }
            })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Phone
          </label>
          <input
            type="tel"
            value={resumeData.personal.phone}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            onChange={(e) => setResumeData({
              ...resumeData,
              personal: { ...resumeData.personal, phone: e.target.value }
            })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Location
          </label>
          <input
            type="text"
            value={resumeData.personal.location}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            onChange={(e) => setResumeData({
              ...resumeData,
              personal: { ...resumeData.personal, location: e.target.value }
            })}
          />
        </div>
      </div>
    </div>
  );

  const renderSummary = () => (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Professional Summary
      </label>
      <textarea
        rows={6}
        value={resumeData.summary}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
        placeholder="Write a brief summary of your professional background..."
        onChange={(e) => setResumeData({ ...resumeData, summary: e.target.value })}
      />
    </div>
  );

  const renderSkills = () => (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Skills
      </label>
      <div className="flex flex-wrap gap-2 mb-4">
        {resumeData.skills.map((skill, index) => (
          <span
            key={index}
            className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm flex items-center"
          >
            {skill}
            <button
              onClick={() => {
                const newSkills = resumeData.skills.filter((_, i) => i !== index);
                setResumeData({ ...resumeData, skills: newSkills });
              }}
              className="ml-2 text-blue-600 hover:text-blue-800"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <div className="flex space-x-2">
        <input
          type="text"
          placeholder="Add a skill..."
          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          onKeyPress={(e) => {
            if (e.key === 'Enter' && e.target.value.trim()) {
              setResumeData({
                ...resumeData,
                skills: [...resumeData.skills, e.target.value.trim()]
              });
              e.target.value = '';
            }
          }}
        />
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Add
        </button>
      </div>
    </div>
  );

  const renderSectionContent = () => {
    switch (activeSection) {
      case 'personal':
        return renderPersonalInfo();
      case 'summary':
        return renderSummary();
      case 'skills':
        return renderSkills();
      case 'experience':
        return (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">💼</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Experience Section
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Add your work experience, internships, and professional roles.
            </p>
          </div>
        );
      case 'education':
        return (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🎓</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Education Section
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Add your educational background, certifications, and courses.
            </p>
          </div>
        );
      case 'projects':
        return (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🚀</div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Projects Section
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Showcase your personal projects, open source contributions, and portfolio.
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Resume Builder</h2>
        <div className="flex space-x-3">
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            Preview Resume
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Download PDF
          </button>
        </div>
      </div>

      {/* Template Selection */}
      <div className="bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Choose Template
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {templates.map((template) => (
            <div
              key={template.id}
              className="p-4 border-2 border-gray-200 dark:border-gray-600 rounded-lg cursor-pointer hover:border-blue-500 transition-colors text-center"
            >
              <div className="text-3xl mb-2">{template.preview}</div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {template.name}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Section Navigation */}
        <div className="lg:col-span-1">
          <div className="bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 p-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Resume Sections
            </h3>
            <div className="space-y-2">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    activeSection === section.id
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className="text-lg mr-3">{section.icon}</span>
                  {section.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Section Content */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 p-6">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              {renderSectionContent()}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Resume Preview */}
      <div className="bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Resume Preview
        </h3>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 min-h-96">
          <div className="text-center">
            <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {resumeData.personal.fullName}
            </h4>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {resumeData.personal.email} • {resumeData.personal.phone} • {resumeData.personal.location}
            </p>
            <div className="text-left">
              <h5 className="font-semibold text-gray-900 dark:text-white mb-2">Summary</h5>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{resumeData.summary}</p>
              
              <h5 className="font-semibold text-gray-900 dark:text-white mb-2">Skills</h5>
              <div className="flex flex-wrap gap-2">
                {resumeData.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilderTab;
