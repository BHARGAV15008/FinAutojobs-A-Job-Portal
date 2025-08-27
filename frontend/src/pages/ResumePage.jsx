import React, { useState } from 'react';
import { Download, Edit, Plus, Trash2, Eye } from 'lucide-react';

const ResumePage = () => {
    const [activeTab, setActiveTab] = useState('builder');
    const [resumeData, setResumeData] = useState({
        personalInfo: {
            name: '',
            email: '',
            phone: '',
            location: '',
            summary: ''
        },
        experience: [
            {
                id: 1,
                title: '',
                company: '',
                location: '',
                startDate: '',
                endDate: '',
                current: false,
                description: ''
            }
        ],
        education: [
            {
                id: 1,
                degree: '',
                institution: '',
                location: '',
                startDate: '',
                endDate: '',
                gpa: ''
            }
        ],
        skills: []
    });

    const addExperience = () => {
        const newExperience = {
            id: Date.now(),
            title: '',
            company: '',
            location: '',
            startDate: '',
            endDate: '',
            current: false,
            description: ''
        };
        setResumeData(prev => ({
            ...prev,
            experience: [...prev.experience, newExperience]
        }));
    };

    const removeExperience = (id) => {
        setResumeData(prev => ({
            ...prev,
            experience: prev.experience.filter(exp => exp.id !== id)
        }));
    };

    const updateExperience = (id, field, value) => {
        setResumeData(prev => ({
            ...prev,
            experience: prev.experience.map(exp =>
                exp.id === id ? { ...exp, [field]: value } : exp
            )
        }));
    };

    const addEducation = () => {
        const newEducation = {
            id: Date.now(),
            degree: '',
            institution: '',
            location: '',
            startDate: '',
            endDate: '',
            gpa: ''
        };
        setResumeData(prev => ({
            ...prev,
            education: [...prev.education, newEducation]
        }));
    };

    const removeEducation = (id) => {
        setResumeData(prev => ({
            ...prev,
            education: prev.education.filter(edu => edu.id !== id)
        }));
    };

    const updateEducation = (id, field, value) => {
        setResumeData(prev => ({
            ...prev,
            education: prev.education.map(edu =>
                edu.id === id ? { ...edu, [field]: value } : edu
            )
        }));
    };

    const addSkill = () => {
        const skill = prompt('Enter a skill:');
        if (skill && skill.trim()) {
            setResumeData(prev => ({
                ...prev,
                skills: [...prev.skills, skill.trim()]
            }));
        }
    };

    const removeSkill = (index) => {
        setResumeData(prev => ({
            ...prev,
            skills: prev.skills.filter((_, i) => i !== index)
        }));
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Resume Builder</h1>
                    <p className="text-gray-600">Create a professional resume that stands out to employers</p>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-lg shadow-sm mb-8">
                    <div className="border-b border-gray-200">
                        <nav className="flex space-x-8 px-6">
                            <button
                                onClick={() => setActiveTab('builder')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'builder'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                Resume Builder
                            </button>
                            <button
                                onClick={() => setActiveTab('preview')}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'preview'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                Preview
                            </button>
                        </nav>
                    </div>

                    <div className="p-6">
                        {activeTab === 'builder' ? (
                            <div className="space-y-8">
                                {/* Personal Information */}
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900 mb-4">Personal Information</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                                            <input
                                                type="text"
                                                value={resumeData.personalInfo.name}
                                                onChange={(e) => setResumeData(prev => ({
                                                    ...prev,
                                                    personalInfo: { ...prev.personalInfo, name: e.target.value }
                                                }))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                            <input
                                                type="email"
                                                value={resumeData.personalInfo.email}
                                                onChange={(e) => setResumeData(prev => ({
                                                    ...prev,
                                                    personalInfo: { ...prev.personalInfo, email: e.target.value }
                                                }))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                            <input
                                                type="tel"
                                                value={resumeData.personalInfo.phone}
                                                onChange={(e) => setResumeData(prev => ({
                                                    ...prev,
                                                    personalInfo: { ...prev.personalInfo, phone: e.target.value }
                                                }))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                            <input
                                                type="text"
                                                value={resumeData.personalInfo.location}
                                                onChange={(e) => setResumeData(prev => ({
                                                    ...prev,
                                                    personalInfo: { ...prev.personalInfo, location: e.target.value }
                                                }))}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                    </div>
                                    <div className="mt-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Professional Summary</label>
                                        <textarea
                                            value={resumeData.personalInfo.summary}
                                            onChange={(e) => setResumeData(prev => ({
                                                ...prev,
                                                personalInfo: { ...prev.personalInfo, summary: e.target.value }
                                            }))}
                                            rows={4}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            placeholder="Write a brief summary of your professional background and career objectives..."
                                        />
                                    </div>
                                </div>

                                {/* Work Experience */}
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-xl font-semibold text-gray-900">Work Experience</h2>
                                        <button
                                            onClick={addExperience}
                                            className="flex items-center text-blue-600 hover:text-blue-700"
                                        >
                                            <Plus className="h-4 w-4 mr-1" />
                                            Add Experience
                                        </button>
                                    </div>
                                    <div className="space-y-6">
                                        {resumeData.experience.map((exp, index) => (
                                            <div key={exp.id} className="border border-gray-200 rounded-lg p-4">
                                                <div className="flex items-center justify-between mb-4">
                                                    <h3 className="text-lg font-medium text-gray-900">Experience {index + 1}</h3>
                                                    {resumeData.experience.length > 1 && (
                                                        <button
                                                            onClick={() => removeExperience(exp.id)}
                                                            className="text-red-600 hover:text-red-700"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                                                        <input
                                                            type="text"
                                                            value={exp.title}
                                                            onChange={(e) => updateExperience(exp.id, 'title', e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                                                        <input
                                                            type="text"
                                                            value={exp.company}
                                                            onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                                        <input
                                                            type="text"
                                                            value={exp.location}
                                                            onChange={(e) => updateExperience(exp.id, 'location', e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                                        <input
                                                            type="month"
                                                            value={exp.startDate}
                                                            onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                                        <input
                                                            type="month"
                                                            value={exp.endDate}
                                                            onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                                                            disabled={exp.current}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                                                        />
                                                    </div>
                                                    <div className="flex items-center">
                                                        <input
                                                            type="checkbox"
                                                            checked={exp.current}
                                                            onChange={(e) => updateExperience(exp.id, 'current', e.target.checked)}
                                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                                        />
                                                        <label className="ml-2 text-sm text-gray-700">Current Position</label>
                                                    </div>
                                                </div>
                                                <div className="mt-4">
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                                    <textarea
                                                        value={exp.description}
                                                        onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                                                        rows={3}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        placeholder="Describe your responsibilities and achievements..."
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Education */}
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-xl font-semibold text-gray-900">Education</h2>
                                        <button
                                            onClick={addEducation}
                                            className="flex items-center text-blue-600 hover:text-blue-700"
                                        >
                                            <Plus className="h-4 w-4 mr-1" />
                                            Add Education
                                        </button>
                                    </div>
                                    <div className="space-y-6">
                                        {resumeData.education.map((edu, index) => (
                                            <div key={edu.id} className="border border-gray-200 rounded-lg p-4">
                                                <div className="flex items-center justify-between mb-4">
                                                    <h3 className="text-lg font-medium text-gray-900">Education {index + 1}</h3>
                                                    {resumeData.education.length > 1 && (
                                                        <button
                                                            onClick={() => removeEducation(edu.id)}
                                                            className="text-red-600 hover:text-red-700"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Degree</label>
                                                        <input
                                                            type="text"
                                                            value={edu.degree}
                                                            onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Institution</label>
                                                        <input
                                                            type="text"
                                                            value={edu.institution}
                                                            onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                                        <input
                                                            type="text"
                                                            value={edu.location}
                                                            onChange={(e) => updateEducation(edu.id, 'location', e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">GPA</label>
                                                        <input
                                                            type="text"
                                                            value={edu.gpa}
                                                            onChange={(e) => updateEducation(edu.id, 'gpa', e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                            placeholder="e.g., 3.8/4.0"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                                                        <input
                                                            type="month"
                                                            value={edu.startDate}
                                                            onChange={(e) => updateEducation(edu.id, 'startDate', e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                                                        <input
                                                            type="month"
                                                            value={edu.endDate}
                                                            onChange={(e) => updateEducation(edu.id, 'endDate', e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Skills */}
                                <div>
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="text-xl font-semibold text-gray-900">Skills</h2>
                                        <button
                                            onClick={addSkill}
                                            className="flex items-center text-blue-600 hover:text-blue-700"
                                        >
                                            <Plus className="h-4 w-4 mr-1" />
                                            Add Skill
                                        </button>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {resumeData.skills.map((skill, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full"
                                            >
                                                <span className="text-sm">{skill}</span>
                                                <button
                                                    onClick={() => removeSkill(index)}
                                                    className="ml-2 text-blue-600 hover:text-blue-800"
                                                >
                                                    <Trash2 className="h-3 w-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white border border-gray-200 rounded-lg p-8">
                                <div className="text-center mb-8">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-2">{resumeData.personalInfo.name || 'Your Name'}</h2>
                                    <p className="text-gray-600">{resumeData.personalInfo.email}</p>
                                    <p className="text-gray-600">{resumeData.personalInfo.phone}</p>
                                    <p className="text-gray-600">{resumeData.personalInfo.location}</p>
                                </div>

                                {resumeData.personalInfo.summary && (
                                    <div className="mb-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Professional Summary</h3>
                                        <p className="text-gray-700">{resumeData.personalInfo.summary}</p>
                                    </div>
                                )}

                                {resumeData.experience.some(exp => exp.title) && (
                                    <div className="mb-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Work Experience</h3>
                                        <div className="space-y-4">
                                            {resumeData.experience.map((exp, index) => (
                                                exp.title && (
                                                    <div key={exp.id} className="border-l-4 border-blue-500 pl-4">
                                                        <h4 className="font-semibold text-gray-900">{exp.title}</h4>
                                                        <p className="text-gray-600">{exp.company} • {exp.location}</p>
                                                        <p className="text-sm text-gray-500">
                                                            {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                                                        </p>
                                                        {exp.description && (
                                                            <p className="text-gray-700 mt-2">{exp.description}</p>
                                                        )}
                                                    </div>
                                                )
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {resumeData.education.some(edu => edu.degree) && (
                                    <div className="mb-6">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Education</h3>
                                        <div className="space-y-4">
                                            {resumeData.education.map((edu, index) => (
                                                edu.degree && (
                                                    <div key={edu.id} className="border-l-4 border-green-500 pl-4">
                                                        <h4 className="font-semibold text-gray-900">{edu.degree}</h4>
                                                        <p className="text-gray-600">{edu.institution} • {edu.location}</p>
                                                        <p className="text-sm text-gray-500">
                                                            {edu.startDate} - {edu.endDate}
                                                            {edu.gpa && ` • GPA: ${edu.gpa}`}
                                                        </p>
                                                    </div>
                                                )
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {resumeData.skills.length > 0 && (
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Skills</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {resumeData.skills.map((skill, index) => (
                                                <span
                                                    key={index}
                                                    className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm"
                                                >
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center space-x-4">
                    <button className="flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
                        <Download className="h-4 w-4 mr-2" />
                        Download PDF
                    </button>
                    <button className="flex items-center bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors">
                        <Eye className="h-4 w-4 mr-2" />
                        Save Draft
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ResumePage;
