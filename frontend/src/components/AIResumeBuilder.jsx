import React, { useState, useEffect } from 'react';
import { generateAIContent } from '../data/resumeTemplates';
import './AIResumeBuilder.css';

const AIResumeBuilder = ({ selectedTemplate, onDataChange, resumeData }) => {
  const [formData, setFormData] = useState({
    personalInfo: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      location: '',
      linkedin: '',
      website: ''
    },
    professionalSummary: '',
    experience: [],
    education: [],
    skills: [],
    achievements: [],
    certifications: [],
    languages: []
  });

  const [currentSection, setCurrentSection] = useState('personal');
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [selectedIndustry, setSelectedIndustry] = useState('finance');
  const [experienceLevel, setExperienceLevel] = useState('3-5');

  useEffect(() => {
    if (resumeData) {
      setFormData(resumeData);
    }
  }, [resumeData]);

  useEffect(() => {
    onDataChange(formData);
  }, [formData, onDataChange]);

  const handlePersonalInfoChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [field]: value
      }
    }));
  };

  const handleSummaryChange = (value) => {
    setFormData(prev => ({
      ...prev,
      professionalSummary: value
    }));
  };

  const addExperience = () => {
    setFormData(prev => ({
      ...prev,
      experience: [...prev.experience, {
        id: Date.now(),
        jobTitle: '',
        company: '',
        location: '',
        startDate: '',
        endDate: '',
        current: false,
        description: ''
      }]
    }));
  };

  const updateExperience = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.map(exp => 
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    }));
  };

  const removeExperience = (id) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.filter(exp => exp.id !== id)
    }));
  };

  const addEducation = () => {
    setFormData(prev => ({
      ...prev,
      education: [...prev.education, {
        id: Date.now(),
        degree: '',
        institution: '',
        location: '',
        graduationDate: '',
        gpa: '',
        relevant: ''
      }]
    }));
  };

  const updateEducation = (id, field, value) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.map(edu => 
        edu.id === id ? { ...edu, [field]: value } : edu
      )
    }));
  };

  const removeEducation = (id) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.filter(edu => edu.id !== id)
    }));
  };

  const generateAISuggestions = () => {
    const suggestions = generateAIContent(selectedIndustry, 'general', experienceLevel);
    setAiSuggestions(suggestions);
  };

  const applyAISuggestion = (type, content) => {
    if (type === 'summary') {
      handleSummaryChange(content);
    } else if (type === 'skills') {
      setFormData(prev => ({
        ...prev,
        skills: [...new Set([...prev.skills, ...content])]
      }));
    } else if (type === 'achievements') {
      setFormData(prev => ({
        ...prev,
        achievements: [...prev.achievements, ...content]
      }));
    }
  };

  const addSkill = (skill) => {
    if (skill && !formData.skills.includes(skill)) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skill]
      }));
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const sections = [
    { id: 'personal', name: 'Personal Details', icon: '👤' },
    { id: 'summary', name: 'Professional Summary', icon: '📝' },
    { id: 'experience', name: 'Work Experience', icon: '💼' },
    { id: 'education', name: 'Education', icon: '🎓' },
    { id: 'skills', name: 'Skills', icon: '⚡' },
    { id: 'achievements', name: 'Achievements', icon: '🏆' }
  ];

  const renderPersonalSection = () => (
    <div className="form-section">
      <h3>Personal Information</h3>
      <div className="form-grid">
        <div className="form-group">
          <label>First Name *</label>
          <input
            type="text"
            value={formData.personalInfo.firstName}
            onChange={(e) => handlePersonalInfoChange('firstName', e.target.value)}
            placeholder="John"
            required
          />
        </div>
        <div className="form-group">
          <label>Last Name *</label>
          <input
            type="text"
            value={formData.personalInfo.lastName}
            onChange={(e) => handlePersonalInfoChange('lastName', e.target.value)}
            placeholder="Doe"
            required
          />
        </div>
        <div className="form-group">
          <label>Email *</label>
          <input
            type="email"
            value={formData.personalInfo.email}
            onChange={(e) => handlePersonalInfoChange('email', e.target.value)}
            placeholder="john.doe@email.com"
            required
          />
        </div>
        <div className="form-group">
          <label>Phone *</label>
          <input
            type="tel"
            value={formData.personalInfo.phone}
            onChange={(e) => handlePersonalInfoChange('phone', e.target.value)}
            placeholder="+1 (555) 123-4567"
            required
          />
        </div>
        <div className="form-group">
          <label>Location</label>
          <input
            type="text"
            value={formData.personalInfo.location}
            onChange={(e) => handlePersonalInfoChange('location', e.target.value)}
            placeholder="New York, NY"
          />
        </div>
        <div className="form-group">
          <label>LinkedIn</label>
          <input
            type="url"
            value={formData.personalInfo.linkedin}
            onChange={(e) => handlePersonalInfoChange('linkedin', e.target.value)}
            placeholder="https://linkedin.com/in/johndoe"
          />
        </div>
      </div>
    </div>
  );

  const renderSummarySection = () => (
    <div className="form-section">
      <div className="section-header">
        <h3>Professional Summary</h3>
        <div className="ai-controls">
          <select 
            value={selectedIndustry} 
            onChange={(e) => setSelectedIndustry(e.target.value)}
            className="industry-select"
          >
            <option value="finance">Finance</option>
            <option value="automotive">Automotive</option>
          </select>
          <select 
            value={experienceLevel} 
            onChange={(e) => setExperienceLevel(e.target.value)}
            className="experience-select"
          >
            <option value="0-2">0-2 years</option>
            <option value="3-5">3-5 years</option>
            <option value="6-10">6-10 years</option>
            <option value="10+">10+ years</option>
          </select>
          <button type="button" onClick={generateAISuggestions} className="ai-btn">
            🤖 Generate AI Suggestions
          </button>
        </div>
      </div>
      
      {aiSuggestions && (
        <div className="ai-suggestions">
          <h4>AI-Generated Summary Suggestions:</h4>
          {aiSuggestions.summary && (
            <div className="suggestion-item">
              <p>{aiSuggestions.summary}</p>
              <button 
                type="button" 
                onClick={() => applyAISuggestion('summary', aiSuggestions.summary)}
                className="apply-btn"
              >
                Use This Summary
              </button>
            </div>
          )}
        </div>
      )}
      
      <div className="form-group">
        <label>Professional Summary *</label>
        <textarea
          value={formData.professionalSummary}
          onChange={(e) => handleSummaryChange(e.target.value)}
          placeholder="Write a compelling professional summary that highlights your key achievements and career objectives..."
          rows={4}
          required
        />
      </div>
    </div>
  );

  const renderExperienceSection = () => (
    <div className="form-section">
      <div className="section-header">
        <h3>Work Experience</h3>
        <button type="button" onClick={addExperience} className="add-btn">
          + Add Experience
        </button>
      </div>
      
      {formData.experience.map((exp, index) => (
        <div key={exp.id} className="experience-item">
          <div className="item-header">
            <h4>Experience #{index + 1}</h4>
            <button 
              type="button" 
              onClick={() => removeExperience(exp.id)}
              className="remove-btn"
            >
              Remove
            </button>
          </div>
          
          <div className="form-grid">
            <div className="form-group">
              <label>Job Title *</label>
              <input
                type="text"
                value={exp.jobTitle}
                onChange={(e) => updateExperience(exp.id, 'jobTitle', e.target.value)}
                placeholder="Senior Financial Analyst"
                required
              />
            </div>
            <div className="form-group">
              <label>Company *</label>
              <input
                type="text"
                value={exp.company}
                onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                placeholder="Goldman Sachs"
                required
              />
            </div>
            <div className="form-group">
              <label>Location</label>
              <input
                type="text"
                value={exp.location}
                onChange={(e) => updateExperience(exp.id, 'location', e.target.value)}
                placeholder="New York, NY"
              />
            </div>
            <div className="form-group">
              <label>Start Date *</label>
              <input
                type="month"
                value={exp.startDate}
                onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>End Date</label>
              <input
                type="month"
                value={exp.endDate}
                onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                disabled={exp.current}
              />
            </div>
            <div className="form-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={exp.current}
                  onChange={(e) => updateExperience(exp.id, 'current', e.target.checked)}
                />
                Currently working here
              </label>
            </div>
          </div>
          
          <div className="form-group">
            <label>Job Description</label>
            <textarea
              value={exp.description}
              onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
              placeholder="Describe your key responsibilities and achievements in this role..."
              rows={3}
            />
          </div>
        </div>
      ))}
    </div>
  );

  const renderEducationSection = () => (
    <div className="form-section">
      <div className="section-header">
        <h3>Education</h3>
        <button type="button" onClick={addEducation} className="add-btn">
          + Add Education
        </button>
      </div>
      
      {formData.education.map((edu, index) => (
        <div key={edu.id} className="education-item">
          <div className="item-header">
            <h4>Education #{index + 1}</h4>
            <button 
              type="button" 
              onClick={() => removeEducation(edu.id)}
              className="remove-btn"
            >
              Remove
            </button>
          </div>
          
          <div className="form-grid">
            <div className="form-group">
              <label>Degree *</label>
              <input
                type="text"
                value={edu.degree}
                onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                placeholder="Bachelor of Science in Finance"
                required
              />
            </div>
            <div className="form-group">
              <label>Institution *</label>
              <input
                type="text"
                value={edu.institution}
                onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                placeholder="Harvard University"
                required
              />
            </div>
            <div className="form-group">
              <label>Location</label>
              <input
                type="text"
                value={edu.location}
                onChange={(e) => updateEducation(edu.id, 'location', e.target.value)}
                placeholder="Cambridge, MA"
              />
            </div>
            <div className="form-group">
              <label>Graduation Date</label>
              <input
                type="month"
                value={edu.graduationDate}
                onChange={(e) => updateEducation(edu.id, 'graduationDate', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>GPA</label>
              <input
                type="text"
                value={edu.gpa}
                onChange={(e) => updateEducation(edu.id, 'gpa', e.target.value)}
                placeholder="3.8/4.0"
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderSkillsSection = () => {
    const [newSkill, setNewSkill] = useState('');
    
    return (
      <div className="form-section">
        <div className="section-header">
          <h3>Skills</h3>
          {aiSuggestions && aiSuggestions.skills && (
            <button 
              type="button" 
              onClick={() => applyAISuggestion('skills', aiSuggestions.skills)}
              className="ai-btn"
            >
              🤖 Add AI Suggested Skills
            </button>
          )}
        </div>
        
        <div className="skills-input">
          <input
            type="text"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            placeholder="Add a skill..."
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addSkill(newSkill);
                setNewSkill('');
              }
            }}
          />
          <button 
            type="button" 
            onClick={() => {
              addSkill(newSkill);
              setNewSkill('');
            }}
            className="add-skill-btn"
          >
            Add
          </button>
        </div>
        
        <div className="skills-list">
          {formData.skills.map((skill, index) => (
            <div key={index} className="skill-tag">
              <span>{skill}</span>
              <button 
                type="button" 
                onClick={() => removeSkill(skill)}
                className="remove-skill-btn"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        
        {aiSuggestions && aiSuggestions.skills && (
          <div className="ai-suggestions">
            <h4>AI-Suggested Skills:</h4>
            <div className="suggested-skills">
              {aiSuggestions.skills.map((skill, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => addSkill(skill)}
                  className="suggested-skill"
                  disabled={formData.skills.includes(skill)}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderCurrentSection = () => {
    switch (currentSection) {
      case 'personal': return renderPersonalSection();
      case 'summary': return renderSummarySection();
      case 'experience': return renderExperienceSection();
      case 'education': return renderEducationSection();
      case 'skills': return renderSkillsSection();
      default: return renderPersonalSection();
    }
  };

  return (
    <div className="ai-resume-builder">
      <div className="builder-header">
        <h2>Build Your Resume</h2>
        {selectedTemplate && (
          <div className="selected-template-info">
            <span>Using template: <strong>{selectedTemplate.name}</strong></span>
          </div>
        )}
      </div>
      
      <div className="builder-navigation">
        {sections.map(section => (
          <button
            key={section.id}
            className={`nav-btn ${currentSection === section.id ? 'active' : ''}`}
            onClick={() => setCurrentSection(section.id)}
          >
            <span className="nav-icon">{section.icon}</span>
            <span className="nav-text">{section.name}</span>
          </button>
        ))}
      </div>
      
      <div className="builder-content">
        {renderCurrentSection()}
      </div>
    </div>
  );
};

export default AIResumeBuilder;