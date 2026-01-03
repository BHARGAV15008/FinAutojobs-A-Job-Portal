import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Building2,
  Upload,
  MapPin,
  Users,
  Globe,
  Linkedin,
  Twitter,
  Facebook,
  FileText,
  Award,
  Briefcase,
  DollarSign,
  Calendar,
  Phone,
  Mail,
  Link as LinkIcon,
  Image,
  X,
  Plus,
  Check,
} from "lucide-react";
import api from "../../services/api";

const CompanyVerificationForm = ({ onClose, onSuccess }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Basic Information
    name: "",
    tagline: "",
    email: "",
    website: "",
    foundedYear: "",
    industry: "",
    subIndustry: [],
    companyType: "Private",
    size: "",
    description: "",

    // Location
    headquarters: {
      address: "",
      city: "",
      state: "",
      country: "",
      zipCode: "",
    },

    // Contact Information
    contactInfo: {
      phone: "",
      alternatePhone: "",
      email: "",
      hrEmail: "",
      supportEmail: "",
    },

    // Social Links
    socialLinks: {
      linkedin: "",
      twitter: "",
      facebook: "",
      instagram: "",
      youtube: "",
    },

    // Culture & Values
    culture: {
      workEnvironment: "",
      values: [],
      mission: "",
      vision: "",
    },

    // Benefits
    benefits: [],
    perks: [],

    // Hiring Information
    hiringInfo: {
      activelyHiring: true,
      averageResponseTime: "",
      hiringProcess: [],
    },

    // Stats
    stats: {
      totalEmployees: "",
      femaleEmployees: "",
      maleEmployees: "",
    },

    // Leadership
    leadership: [],

    // Technologies
    technologies: [],

    // Awards
    awards: [],
  });

  const [files, setFiles] = useState({
    logo: null,
    coverImage: null,
    documents: [],
  });

  const [previews, setPreviews] = useState({
    logo: null,
    coverImage: null,
  });

  const industries = [
    "Technology",
    "Finance",
    "Healthcare",
    "Education",
    "E-commerce",
    "Manufacturing",
    "Retail",
    "Real Estate",
    "Consulting",
    "Marketing",
    "Media & Entertainment",
    "Telecommunications",
    "Automotive",
    "Aerospace",
    "Energy",
    "Agriculture",
    "Hospitality",
    "Transportation",
    "Construction",
  ];

  const companySizes = [
    "1-10",
    "11-50",
    "51-200",
    "201-500",
    "501-1000",
    "1001-5000",
    "5000+",
  ];

  const companyTypes = [
    "Private",
    "Public",
    "Government",
    "Startup",
    "MNC",
    "Non-Profit",
  ];

  const benefitTypes = [
    "Health Insurance",
    "Life Insurance",
    "Retirement Plans",
    "Paid Time Off",
    "Remote Work",
    "Flexible Hours",
    "Learning & Development",
    "Gym Membership",
    "Free Meals",
    "Transportation",
    "Relocation Assistance",
    "Stock Options",
    "Performance Bonus",
    "Parental Leave",
    "Child Care",
  ];

  const handleInputChange = (section, field, value) => {
    if (section) {
      setFormData((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [field]: value,
        },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleFileChange = (type, files) => {
    const file = files[0];
    if (type === "documents") {
      setFiles((prev) => ({
        ...prev,
        documents: [...prev.documents, ...Array.from(files)],
      }));
    } else {
      setFiles((prev) => ({ ...prev, [type]: file }));
      if (file && (type === "logo" || type === "coverImage")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviews((prev) => ({ ...prev, [type]: reader.result }));
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const addArrayItem = (field, item) => {
    if (!item.trim()) return;
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], item],
    }));
  };

  const removeArrayItem = (field, index) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const addBenefit = () => {
    setFormData((prev) => ({
      ...prev,
      benefits: [...prev.benefits, { type: "", description: "" }],
    }));
  };

  const removeBenefit = (index) => {
    setFormData((prev) => ({
      ...prev,
      benefits: prev.benefits.filter((_, i) => i !== index),
    }));
  };

  const addLeader = () => {
    setFormData((prev) => ({
      ...prev,
      leadership: [
        ...prev.leadership,
        { name: "", position: "", bio: "", linkedinUrl: "" },
      ],
    }));
  };

  const removeLeader = (index) => {
    setFormData((prev) => ({
      ...prev,
      leadership: prev.leadership.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitFormData = new FormData();
      submitFormData.append("companyData", JSON.stringify(formData));

      if (files.logo) submitFormData.append("logo", files.logo);
      if (files.coverImage)
        submitFormData.append("coverImage", files.coverImage);
      files.documents.forEach((doc) => {
        submitFormData.append("documents", doc);
      });

      const response = await api.post("/companies", submitFormData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert(
        "Company registration submitted successfully! Awaiting admin verification."
      );
      if (onSuccess) onSuccess(response.data.company);
      if (onClose) onClose();
    } catch (error) {
      console.error("Error submitting company:", error);
      alert(
        error.response?.data?.message || "Failed to submit company registration"
      );
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 5) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-between mb-8">
      {[1, 2, 3, 4, 5].map((step) => (
        <div key={step} className="flex items-center">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
              currentStep >= step
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400"
            }`}
          >
            {step}
          </div>
          {step < 5 && (
            <div
              className={`w-16 h-1 ${
                currentStep > step
                  ? "bg-blue-600"
                  : "bg-gray-200 dark:bg-gray-700"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        Basic Information
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Company Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange(null, "name", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Enter company name"
            required
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Tagline
          </label>
          <input
            type="text"
            value={formData.tagline}
            onChange={(e) => handleInputChange(null, "tagline", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="e.g., Innovation at its best"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email *
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange(null, "email", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="company@example.com"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Website
          </label>
          <input
            type="url"
            value={formData.website}
            onChange={(e) => handleInputChange(null, "website", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="https://example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Industry *
          </label>
          <select
            value={formData.industry}
            onChange={(e) =>
              handleInputChange(null, "industry", e.target.value)
            }
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            required
          >
            <option value="">Select Industry</option>
            {industries.map((ind) => (
              <option key={ind} value={ind}>
                {ind}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Company Type *
          </label>
          <select
            value={formData.companyType}
            onChange={(e) =>
              handleInputChange(null, "companyType", e.target.value)
            }
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            required
          >
            {companyTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Company Size *
          </label>
          <select
            value={formData.size}
            onChange={(e) => handleInputChange(null, "size", e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            required
          >
            <option value="">Select Size</option>
            {companySizes.map((size) => (
              <option key={size} value={size}>
                {size} employees
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Founded Year
          </label>
          <input
            type="number"
            value={formData.foundedYear}
            onChange={(e) =>
              handleInputChange(null, "foundedYear", e.target.value)
            }
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="2020"
            min="1800"
            max={new Date().getFullYear()}
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description *
          </label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              handleInputChange(null, "description", e.target.value)
            }
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Tell us about your company..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Company Logo
          </label>
          <div className="flex items-center gap-4">
            {previews.logo && (
              <img
                src={previews.logo}
                alt="Logo preview"
                className="w-16 h-16 rounded object-cover"
              />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange("logo", e.target.files)}
              className="flex-1 text-sm text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Cover Image
          </label>
          <div className="flex items-center gap-4">
            {previews.coverImage && (
              <img
                src={previews.coverImage}
                alt="Cover preview"
                className="w-32 h-16 rounded object-cover"
              />
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange("coverImage", e.target.files)}
              className="flex-1 text-sm text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
        Location & Contact Details
      </h3>

      <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg space-y-4">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
          Headquarters
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Address *
            </label>
            <input
              type="text"
              value={formData.headquarters.address}
              onChange={(e) =>
                handleInputChange("headquarters", "address", e.target.value)
              }
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Street address"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              City *
            </label>
            <input
              type="text"
              value={formData.headquarters.city}
              onChange={(e) =>
                handleInputChange("headquarters", "city", e.target.value)
              }
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              State/Province
            </label>
            <input
              type="text"
              value={formData.headquarters.state}
              onChange={(e) =>
                handleInputChange("headquarters", "state", e.target.value)
              }
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Country *
            </label>
            <input
              type="text"
              value={formData.headquarters.country}
              onChange={(e) =>
                handleInputChange("headquarters", "country", e.target.value)
              }
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              ZIP Code
            </label>
            <input
              type="text"
              value={formData.headquarters.zipCode}
              onChange={(e) =>
                handleInputChange("headquarters", "zipCode", e.target.value)
              }
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg space-y-4">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
          Contact Information
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Primary Phone
            </label>
            <input
              type="tel"
              value={formData.contactInfo.phone}
              onChange={(e) =>
                handleInputChange("contactInfo", "phone", e.target.value)
              }
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Alternate Phone
            </label>
            <input
              type="tel"
              value={formData.contactInfo.alternatePhone}
              onChange={(e) =>
                handleInputChange(
                  "contactInfo",
                  "alternatePhone",
                  e.target.value
                )
              }
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              HR Email
            </label>
            <input
              type="email"
              value={formData.contactInfo.hrEmail}
              onChange={(e) =>
                handleInputChange("contactInfo", "hrEmail", e.target.value)
              }
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Support Email
            </label>
            <input
              type="email"
              value={formData.contactInfo.supportEmail}
              onChange={(e) =>
                handleInputChange("contactInfo", "supportEmail", e.target.value)
              }
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg space-y-4">
        <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
          Social Links
        </h4>

        <div className="grid grid-cols-1 gap-4">
          {Object.keys(formData.socialLinks).map((platform) => (
            <div key={platform}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 capitalize">
                {platform}
              </label>
              <input
                type="url"
                value={formData.socialLinks[platform]}
                onChange={(e) =>
                  handleInputChange("socialLinks", platform, e.target.value)
                }
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder={`https://${platform}.com/yourcompany`}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Render other steps similarly... (continuing in next file due to length)

  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
      >
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-900 z-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Company Verification Request
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X size={24} />
            </button>
          </div>
          {renderStepIndicator()}
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {/* Add other steps as needed */}

          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            {currentStep < 5 ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Next Step
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {loading ? "Submitting..." : "Submit for Verification"}
              </button>
            )}
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default CompanyVerificationForm;
