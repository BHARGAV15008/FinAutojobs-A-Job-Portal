import React, { useState } from "react";
import { motion } from "framer-motion";

const ResumeBuilder = () => {
  const [activeSection, setActiveSection] = useState("personal");
  const [resumeData, setResumeData] = useState({
    personal: {
      name: "",
      email: "",
      phone: "",
      location: "",
      summary: "",
    },
    experience: [
      {
        id: 1,
        company: "",
        position: "",
        startDate: "",
        endDate: "",
        current: false,
        description: "",
      },
    ],
    education: [
      {
        id: 1,
        institution: "",
        degree: "",
        field: "",
        startDate: "",
        endDate: "",
        gpa: "",
      },
    ],
    skills: [],
    projects: [
      {
        id: 1,
        name: "",
        description: "",
        technologies: "",
        url: "",
      },
    ],
    certifications: [
      {
        id: 1,
        name: "",
        issuer: "",
        date: "",
        url: "",
      },
    ],
  });

  const handleChange = (section, field, value, index = null) => {
    setResumeData((prev) => {
      if (index !== null && Array.isArray(prev[section])) {
        const newArray = [...prev[section]];
        newArray[index] = { ...newArray[index], [field]: value };
        return { ...prev, [section]: newArray };
      }
      return {
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value,
        },
      };
    });
  };

  const addItem = (section) => {
    setResumeData((prev) => ({
      ...prev,
      [section]: [
        ...prev[section],
        {
          id: Date.now(),
          ...getEmptyItem(section),
        },
      ],
    }));
  };

  const removeItem = (section, index) => {
    setResumeData((prev) => ({
      ...prev,
      [section]: prev[section].filter((_, i) => i !== index),
    }));
  };

  const getEmptyItem = (section) => {
    switch (section) {
      case "experience":
        return {
          company: "",
          position: "",
          startDate: "",
          endDate: "",
          current: false,
          description: "",
        };
      case "education":
        return {
          institution: "",
          degree: "",
          field: "",
          startDate: "",
          endDate: "",
          gpa: "",
        };
      case "projects":
        return { name: "", description: "", technologies: "", url: "" };
      case "certifications":
        return { name: "", issuer: "", date: "", url: "" };
      default:
        return {};
    }
  };

  const renderPersonalInfo = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Full Name</label>
          <input
            type="text"
            value={resumeData.personal.name}
            onChange={(e) => handleChange("personal", "name", e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={resumeData.personal.email}
            onChange={(e) => handleChange("personal", "email", e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Phone</label>
          <input
            type="tel"
            value={resumeData.personal.phone}
            onChange={(e) => handleChange("personal", "phone", e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Location</label>
          <input
            type="text"
            value={resumeData.personal.location}
            onChange={(e) =>
              handleChange("personal", "location", e.target.value)
            }
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">
          Professional Summary
        </label>
        <textarea
          value={resumeData.personal.summary}
          onChange={(e) => handleChange("personal", "summary", e.target.value)}
          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          rows={4}
        />
      </div>
    </div>
  );

  const renderExperience = () => (
    <div className="space-y-6">
      {resumeData.experience.map((exp, index) => (
        <div
          key={exp.id}
          className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Company</label>
              <input
                type="text"
                value={exp.company}
                onChange={(e) =>
                  handleChange("experience", "company", e.target.value, index)
                }
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Position</label>
              <input
                type="text"
                value={exp.position}
                onChange={(e) =>
                  handleChange("experience", "position", e.target.value, index)
                }
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={exp.startDate}
                onChange={(e) =>
                  handleChange("experience", "startDate", e.target.value, index)
                }
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">End Date</label>
              <input
                type="date"
                value={exp.endDate}
                disabled={exp.current}
                onChange={(e) =>
                  handleChange("experience", "endDate", e.target.value, index)
                }
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center mt-6">
              <input
                type="checkbox"
                checked={exp.current}
                onChange={(e) =>
                  handleChange("experience", "current", e.target.checked, index)
                }
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
              />
              <span className="ml-2">Current Position</span>
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              value={exp.description}
              onChange={(e) =>
                handleChange("experience", "description", e.target.value, index)
              }
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>
          {resumeData.experience.length > 1 && (
            <button
              onClick={() => removeItem("experience", index)}
              className="mt-4 px-4 py-2 text-red-600 hover:text-red-700"
            >
              Remove Experience
            </button>
          )}
        </div>
      ))}
      <button
        onClick={() => addItem("experience")}
        className="mt-4 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50"
      >
        Add Experience
      </button>
    </div>
  );

  const sections = [
    { id: "personal", label: "Personal Info" },
    { id: "experience", label: "Experience" },
    { id: "education", label: "Education" },
    { id: "skills", label: "Skills" },
    { id: "projects", label: "Projects" },
    { id: "certifications", label: "Certifications" },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-6">Resume Builder</h2>

        {/* Progress Bar */}
        <div className="w-full h-2 bg-gray-200 rounded-full mb-6">
          <div
            className="h-full bg-blue-600 rounded-full"
            style={{ width: "50%" }}
          />
        </div>

        {/* Section Navigation */}
        <div className="flex space-x-4 mb-6 overflow-x-auto pb-2">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`px-4 py-2 rounded-lg whitespace-nowrap ${
                activeSection === section.id
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200"
              }`}
            >
              {section.label}
            </button>
          ))}
        </div>

        {/* Section Content */}
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeSection === "personal" && renderPersonalInfo()}
          {activeSection === "experience" && renderExperience()}
          {/* Add other section renderers */}
        </motion.div>
      </div>

      {/* Preview and Actions */}
      <div className="flex justify-between items-center">
        <button
          onClick={() => {
            /* Handle preview */
          }}
          className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
        >
          Preview Resume
        </button>
        <div className="space-x-4">
          <button
            onClick={() => {
              /* Handle save draft */
            }}
            className="px-6 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50"
          >
            Save Draft
          </button>
          <button
            onClick={() => {
              /* Handle download */
            }}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;
