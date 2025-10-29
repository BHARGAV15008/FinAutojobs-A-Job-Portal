import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../contexts/IntegratedThemeContext';

const ProfileEditModal = ({ isOpen, onClose, user, userRole, onSave }) => {
  const { darkMode } = useTheme();
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen && user) {
      console.log('🔍 ProfileEditModal initializing with user:', user);
      console.log('🔍 ProfileEditModal user type:', typeof user);
      console.log('🔍 ProfileEditModal user.success:', user.success);
      console.log('🔍 ProfileEditModal user.data:', user.data);
      
      // Handle case where user might be API response object
      const actualUser = user.data ? user.data : user;
      console.log('🔍 ProfileEditModal actual user:', actualUser);
      console.log('🔍 ProfileEditModal actualUser.firstName:', actualUser.firstName);
      console.log('🔍 ProfileEditModal actualUser.lastName:', actualUser.lastName);
      console.log('🔍 ProfileEditModal actualUser.email:', actualUser.email);
      console.log('🔍 ProfileEditModal actualUser.phone:', actualUser.phone);
      console.log('🔍 ProfileEditModal document URLs debug:');
      console.log('  - resume_url:', actualUser.resume_url);
      console.log('  - documents?.resumeUrl:', actualUser.documents?.resumeUrl);
      console.log('  - cover_letter_url:', actualUser.cover_letter_url);
      console.log('  - documents?.coverLetterUrl:', actualUser.documents?.coverLetterUrl);
      console.log('  - portfolio_url:', actualUser.portfolio_url);
      console.log('  - documents?.portfolioUrl:', actualUser.documents?.portfolioUrl);
      console.log('  - professionalLinks?.personalWebsite:', actualUser.professionalLinks?.personalWebsite);
      
      setFormData({
        name: `${actualUser.firstName || ''} ${actualUser.lastName || ''}`.trim() || '',
        phone: actualUser.phone || '',
        location: actualUser.currentLocation?.city || actualUser.location || '',
        bio: actualUser.bio || '',
        linkedin_url: actualUser.linkedin_url || actualUser.professionalLinks?.linkedin || '',
        portfolio_url: actualUser.portfolio_url || actualUser.professionalLinks?.personalWebsite || '',
        ...(userRole === 'applicant' && {
          skills: (() => {
            // Handle different skill formats from registration
            console.log('🔍 ProfileEditModal skills debug:', actualUser.skills);
            console.log('🔍 ProfileEditModal skills_array debug:', actualUser.skills_array);
            console.log('🔍 ProfileEditModal primary_skills debug:', actualUser.primary_skills);
            console.log('🔍 ProfileEditModal experience_years debug:', actualUser.experience_years);
            console.log('🔍 ProfileEditModal yearsOfExperience debug:', actualUser.yearsOfExperience);
            console.log('🔍 ProfileEditModal qualification debug:', actualUser.qualification);
            console.log('🔍 ProfileEditModal education debug:', actualUser.education);
            
            // Try multiple sources for skills
            if (Array.isArray(actualUser.skills_array)) {
              return actualUser.skills_array;
            } else if (Array.isArray(actualUser.primary_skills)) {
              return actualUser.primary_skills;
            } else if (Array.isArray(actualUser.skills)) {
              return actualUser.skills;
            } else if (actualUser.skills?.primary && Array.isArray(actualUser.skills.primary)) {
              return actualUser.skills.primary;
            } else if (actualUser.skills?.technical && Array.isArray(actualUser.skills.technical)) {
              return actualUser.skills.technical;
            } else if (actualUser.skills?.soft && Array.isArray(actualUser.skills.soft)) {
              return actualUser.skills.soft;
            } else if (typeof actualUser.skills === 'string') {
              return actualUser.skills.split(',').map(s => s.trim()).filter(s => s);
            }
            return [];
          })(),
          experience_years: actualUser.experience_years || actualUser.yearsOfExperience || 0,
          qualification: actualUser.qualification || actualUser.education?.[0]?.degree || '',
          // Document URLs - check multiple sources
          resume_url: actualUser.resume_url || actualUser.documents?.resumeUrl || '',
          cover_letter_url: actualUser.cover_letter_url || actualUser.documents?.coverLetterUrl || '',
          portfolio_url: actualUser.portfolio_url || actualUser.documents?.portfolioUrl || actualUser.professionalLinks?.personalWebsite || '',
          // Education and Work Experience
          education: actualUser.education || [],
          workExperience: actualUser.workExperience || []
        }),
        ...(userRole === 'recruiter' && {
          company: actualUser.companyInfo?.companyName || actualUser.companyName || actualUser.company || '',
          department: actualUser.companyInfo?.department || actualUser.department || '',
          job_title: actualUser.companyInfo?.jobTitle || actualUser.companyInfo?.designation || actualUser.position || actualUser.job_title || '',
          experience_years: actualUser.yearsOfExperience || actualUser.experience_years || 0
        })
      });
    }
  }, [isOpen, user, userRole]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({}); // Clear previous errors
    
    try {
      console.log('🔍 ProfileEditModal handleSubmit called');
      console.log('🔍 Form data being submitted:', formData);
      console.log('🔍 User role:', userRole);
      console.log('🔍 Specific field values:');
      console.log('  - qualification:', formData.qualification);
      console.log('  - experience_years:', formData.experience_years);
      console.log('  - skills:', formData.skills);
      
      // If there's a resume file, we need to handle it specially
      if (formData.resumeFile) {
        console.log('🔍 Handling file upload with resume');
        const formDataWithFile = new FormData();
        
        // Add all form fields
        Object.keys(formData).forEach(key => {
          if (key !== 'resumeFile' && formData[key] !== null && formData[key] !== undefined) {
            if (Array.isArray(formData[key])) {
              formDataWithFile.append(key, JSON.stringify(formData[key]));
            } else {
              formDataWithFile.append(key, formData[key]);
            }
          }
        });
        
        // Add the resume file
        formDataWithFile.append('resume', formData.resumeFile);
        
        console.log('🔍 Calling onSave with file upload');
        const result = await onSave(formDataWithFile, true); // true indicates file upload
        console.log('✅ File upload result:', result);
      } else {
        console.log('🔍 Handling regular form submission');
        console.log('🔍 Calling onSave with form data');
        const result = await onSave(formData);
        console.log('✅ Regular form submission result:', result);
      }
      
      console.log('✅ Profile update successful, closing modal');
      
      // Show success message
      if (window.showToast) {
        window.showToast('Profile updated successfully!', 'success');
      }
      
      onClose();
    } catch (error) {
      console.error('❌ ProfileEditModal handleSubmit error:', error);
      console.error('❌ Error details:', error.message);
      console.error('❌ Error stack:', error.stack);
      setErrors({ 
        general: error.message || 'Failed to save profile. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Edit Profile</h2>
              <button
                onClick={onClose}
                className={`${darkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Name *</label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
                    required
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Phone</label>
                  <input
                    type="tel"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Location</label>
                <input
                  type="text"
                  value={formData.location || ''}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Bio</label>
                <textarea
                  value={formData.bio || ''}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  rows={3}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
                />
              </div>

              {/* Role-specific fields */}
              {userRole === 'applicant' && (
                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Skills (comma-separated)</label>
                    <input
                      type="text"
                      value={Array.isArray(formData.skills) ? formData.skills.join(', ') : (formData.skills || '')}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Allow typing commas and other characters
                        setFormData({
                          ...formData, 
                          skills: value // Store as string while typing, will be converted to array on save
                        });
                      }}
                      onBlur={(e) => {
                        // Convert to array when field loses focus
                        const value = e.target.value;
                        const skillsArray = value.split(',').map(s => s.trim()).filter(s => s);
                        setFormData({...formData, skills: skillsArray});
                      }}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
                      placeholder="e.g. JavaScript, React, Node.js"
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Qualification</label>
                    <input
                      type="text"
                      value={formData.qualification || ''}
                      onChange={(e) => setFormData({...formData, qualification: e.target.value})}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
                      placeholder="e.g. Bachelor's in Computer Science"
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Years of Experience</label>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={formData.experience_years || ''}
                      onChange={(e) => setFormData({...formData, experience_years: parseInt(e.target.value) || 0})}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
                      placeholder="e.g. 3"
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Resume</label>
                    <div className="space-y-2">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            setFormData({...formData, resumeFile: file});
                          }
                        }}
                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                      {formData.resume_url && (
                        <div className="text-sm text-gray-600">
                          Current: <a href={formData.resume_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View Resume</a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Education Section */}
                  <div className="border-t pt-4 mt-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>🎓 Education</h3>
                      <button
                        type="button"
                        onClick={() => {
                          const newEducation = [...(formData.education || []), {
                            institution: '',
                            degree: '',
                            fieldOfStudy: '',
                            startDate: '',
                            endDate: '',
                            grade: '',
                            isCurrentlyStudying: false
                          }];
                          setFormData({...formData, education: newEducation});
                        }}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        + Add Education
                      </button>
                    </div>
                    {formData.education && formData.education.length > 0 ? (
                      formData.education.map((edu, index) => (
                        <div key={index} className={`mb-4 p-4 border rounded-lg ${darkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-50'}`}>
                          <div className="grid grid-cols-2 gap-3">
                            <input
                              type="text"
                              placeholder="Institution"
                              value={edu.institution || ''}
                              onChange={(e) => {
                                const newEducation = [...formData.education];
                                newEducation[index].institution = e.target.value;
                                setFormData({...formData, education: newEducation});
                              }}
                              className={`px-3 py-2 border rounded-lg ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'}`}
                            />
                            <input
                              type="text"
                              placeholder="Degree"
                              value={edu.degree || ''}
                              onChange={(e) => {
                                const newEducation = [...formData.education];
                                newEducation[index].degree = e.target.value;
                                setFormData({...formData, education: newEducation});
                              }}
                              className={`px-3 py-2 border rounded-lg ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'}`}
                            />
                            <input
                              type="text"
                              placeholder="Field of Study"
                              value={edu.fieldOfStudy || ''}
                              onChange={(e) => {
                                const newEducation = [...formData.education];
                                newEducation[index].fieldOfStudy = e.target.value;
                                setFormData({...formData, education: newEducation});
                              }}
                              className={`px-3 py-2 border rounded-lg ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'}`}
                            />
                            <input
                              type="text"
                              placeholder="Grade/GPA"
                              value={edu.grade || ''}
                              onChange={(e) => {
                                const newEducation = [...formData.education];
                                newEducation[index].grade = e.target.value;
                                setFormData({...formData, education: newEducation});
                              }}
                              className={`px-3 py-2 border rounded-lg ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'}`}
                            />
                            <input
                              type="date"
                              placeholder="Start Date"
                              value={edu.startDate || ''}
                              onChange={(e) => {
                                const newEducation = [...formData.education];
                                newEducation[index].startDate = e.target.value;
                                setFormData({...formData, education: newEducation});
                              }}
                              className={`px-3 py-2 border rounded-lg ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'}`}
                            />
                            <input
                              type="date"
                              placeholder="End Date"
                              value={edu.endDate || ''}
                              onChange={(e) => {
                                const newEducation = [...formData.education];
                                newEducation[index].endDate = e.target.value;
                                setFormData({...formData, education: newEducation});
                              }}
                              disabled={edu.isCurrentlyStudying}
                              className={`px-3 py-2 border rounded-lg ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'}`}
                            />
                          </div>
                          <div className="flex justify-between items-center mt-2">
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={edu.isCurrentlyStudying || false}
                                onChange={(e) => {
                                  const newEducation = [...formData.education];
                                  newEducation[index].isCurrentlyStudying = e.target.checked;
                                  setFormData({...formData, education: newEducation});
                                }}
                                className="mr-2"
                              />
                              <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Currently studying here</span>
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                const newEducation = formData.education.filter((_, i) => i !== index);
                                setFormData({...formData, education: newEducation});
                              }}
                              className="px-3 py-1 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>No education added yet. Click "Add Education" to get started.</p>
                    )}
                  </div>

                  {/* Work Experience Section */}
                  <div className="border-t pt-4 mt-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>💼 Work Experience</h3>
                      <button
                        type="button"
                        onClick={() => {
                          const newWorkExperience = [...(formData.workExperience || []), {
                            company: '',
                            position: '',
                            location: '',
                            startDate: '',
                            endDate: '',
                            isCurrentlyWorking: false,
                            description: ''
                          }];
                          setFormData({...formData, workExperience: newWorkExperience});
                        }}
                        className="px-3 py-1 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        + Add Experience
                      </button>
                    </div>
                    {formData.workExperience && formData.workExperience.length > 0 ? (
                      formData.workExperience.map((exp, index) => (
                        <div key={index} className={`mb-4 p-4 border rounded-lg ${darkMode ? 'border-gray-600 bg-gray-700' : 'border-gray-300 bg-gray-50'}`}>
                          <div className="grid grid-cols-2 gap-3">
                            <input
                              type="text"
                              placeholder="Company"
                              value={exp.company || ''}
                              onChange={(e) => {
                                const newWorkExperience = [...formData.workExperience];
                                newWorkExperience[index].company = e.target.value;
                                setFormData({...formData, workExperience: newWorkExperience});
                              }}
                              className={`px-3 py-2 border rounded-lg ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'}`}
                            />
                            <input
                              type="text"
                              placeholder="Position/Role"
                              value={exp.position || ''}
                              onChange={(e) => {
                                const newWorkExperience = [...formData.workExperience];
                                newWorkExperience[index].position = e.target.value;
                                setFormData({...formData, workExperience: newWorkExperience});
                              }}
                              className={`px-3 py-2 border rounded-lg ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'}`}
                            />
                            <input
                              type="text"
                              placeholder="Location"
                              value={exp.location || ''}
                              onChange={(e) => {
                                const newWorkExperience = [...formData.workExperience];
                                newWorkExperience[index].location = e.target.value;
                                setFormData({...formData, workExperience: newWorkExperience});
                              }}
                              className={`px-3 py-2 border rounded-lg ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'}`}
                            />
                            <div></div>
                            <input
                              type="date"
                              placeholder="Start Date"
                              value={exp.startDate || ''}
                              onChange={(e) => {
                                const newWorkExperience = [...formData.workExperience];
                                newWorkExperience[index].startDate = e.target.value;
                                setFormData({...formData, workExperience: newWorkExperience});
                              }}
                              className={`px-3 py-2 border rounded-lg ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'}`}
                            />
                            <input
                              type="date"
                              placeholder="End Date"
                              value={exp.endDate || ''}
                              onChange={(e) => {
                                const newWorkExperience = [...formData.workExperience];
                                newWorkExperience[index].endDate = e.target.value;
                                setFormData({...formData, workExperience: newWorkExperience});
                              }}
                              disabled={exp.isCurrentlyWorking}
                              className={`px-3 py-2 border rounded-lg ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'}`}
                            />
                          </div>
                          <textarea
                            placeholder="Job Description"
                            value={exp.description || ''}
                            onChange={(e) => {
                              const newWorkExperience = [...formData.workExperience];
                              newWorkExperience[index].description = e.target.value;
                              setFormData({...formData, workExperience: newWorkExperience});
                            }}
                            rows={3}
                            className={`w-full mt-3 px-3 py-2 border rounded-lg ${darkMode ? 'bg-gray-600 border-gray-500 text-white' : 'bg-white border-gray-300'}`}
                          />
                          <div className="flex justify-between items-center mt-2">
                            <label className="flex items-center">
                              <input
                                type="checkbox"
                                checked={exp.isCurrentlyWorking || false}
                                onChange={(e) => {
                                  const newWorkExperience = [...formData.workExperience];
                                  newWorkExperience[index].isCurrentlyWorking = e.target.checked;
                                  setFormData({...formData, workExperience: newWorkExperience});
                                }}
                                className="mr-2"
                              />
                              <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Currently working here</span>
                            </label>
                            <button
                              type="button"
                              onClick={() => {
                                const newWorkExperience = formData.workExperience.filter((_, i) => i !== index);
                                setFormData({...formData, workExperience: newWorkExperience});
                              }}
                              className="px-3 py-1 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>No work experience added yet. Click "Add Experience" to get started.</p>
                    )}
                  </div>
                </div>
              )}

              {userRole === 'recruiter' && (
                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Company *</label>
                    <input
                      type="text"
                      value={formData.company || ''}
                      onChange={(e) => setFormData({...formData, company: e.target.value})}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
                      required
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Department</label>
                    <input
                      type="text"
                      value={formData.department || ''}
                      onChange={(e) => setFormData({...formData, department: e.target.value})}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Job Title</label>
                    <input
                      type="text"
                      value={formData.job_title || ''}
                      onChange={(e) => setFormData({...formData, job_title: e.target.value})}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Years of Experience</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.experience_years || 0}
                      onChange={(e) => setFormData({...formData, experience_years: parseInt(e.target.value) || 0})}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Resume</label>
                    <div className="space-y-2">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            setFormData({...formData, resumeFile: file});
                          }
                        }}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                      />
                      {formData.resume_url && (
                        <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          Current: <a href={formData.resume_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">View Resume</a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Social Links */}
              <div className="space-y-4">
                <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Social Links</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>LinkedIn</label>
                    <input
                      type="url"
                      value={formData.linkedin_url || ''}
                      onChange={(e) => setFormData({...formData, linkedin_url: e.target.value})}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>GitHub</label>
                    <input
                      type="url"
                      value={formData.github_url || ''}
                      onChange={(e) => setFormData({...formData, github_url: e.target.value})}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
                    />
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Portfolio</label>
                  <input
                    type="url"
                    value={formData.portfolio_url || ''}
                    onChange={(e) => setFormData({...formData, portfolio_url: e.target.value})}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'}`}
                  />
                </div>
              </div>

              {errors.general && (
                <div className={`text-sm ${darkMode ? 'text-red-400' : 'text-red-500'}`}>{errors.general}</div>
              )}

              {/* Buttons */}
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className={`px-4 py-2 border rounded-lg ${darkMode ? 'text-gray-300 border-gray-600 hover:bg-gray-700' : 'text-gray-600 border-gray-300 hover:bg-gray-50'}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ProfileEditModal;
