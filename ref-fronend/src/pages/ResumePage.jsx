import React, { useState, useCallback } from 'react';
import { Download, Edit, Plus, Trash2, Eye, ArrowLeft, ArrowRight, Check, X, Upload, FileText, User, Briefcase, Star, Sparkles, Zap } from 'lucide-react';

// Enhanced resume templates with more variety and realistic previews
const resumeTemplates = [
    {
        id: 'modern-professional',
        name: 'Modern Professional',
        category: 'Professional',
        description: 'Clean and modern design perfect for corporate roles and business professionals',
        colors: ['#2563eb', '#1e40af', '#3b82f6'],
        features: ['ATS-friendly', 'Clean layout', 'Professional fonts', 'Modern styling'],
        suitable: ['Finance', 'Corporate', 'Management', 'Consulting'],
        premium: false
    },
    {
        id: 'executive-classic',
        name: 'Executive Classic',
        category: 'Executive',
        description: 'Sophisticated design for senior-level positions with elegant typography',
        colors: ['#1f2937', '#374151', '#6b7280'],
        features: ['Executive summary focus', 'Achievement highlights', 'Premium look', 'Leadership emphasis'],
        suitable: ['Executive', 'Senior Management', 'Director', 'C-Level'],
        premium: true
    },
    {
        id: 'creative-modern',
        name: 'Creative Modern',
        category: 'Creative',
        description: 'Eye-catching design for creative professionals with visual appeal',
        colors: ['#7c3aed', '#8b5cf6', '#a78bfa'],
        features: ['Visual appeal', 'Color accents', 'Modern typography', 'Portfolio ready'],
        suitable: ['Design', 'Marketing', 'Creative', 'Media'],
        premium: false
    },
    {
        id: 'minimalist-clean',
        name: 'Minimalist Clean',
        category: 'Minimalist',
        description: 'Simple and clean design focusing on content with maximum readability',
        colors: ['#000000', '#4b5563', '#9ca3af'],
        features: ['Minimal design', 'Content focus', 'Easy to read', 'Scannable'],
        suitable: ['Tech', 'Engineering', 'Research', 'Academia'],
        premium: false
    },
    {
        id: 'finance-professional',
        name: 'Finance Professional',
        category: 'Finance',
        description: 'Tailored for finance and banking professionals with metrics focus',
        colors: ['#059669', '#10b981', '#34d399'],
        features: ['Numbers-focused', 'Achievement metrics', 'Professional layout', 'Data visualization'],
        suitable: ['Finance', 'Banking', 'Investment', 'Accounting'],
        premium: false
    },
    {
        id: 'automotive-engineer',
        name: 'Automotive Engineer',
        category: 'Engineering',
        description: 'Designed for automotive and engineering roles with technical emphasis',
        colors: ['#dc2626', '#ef4444', '#f87171'],
        features: ['Technical skills focus', 'Project highlights', 'Engineering layout', 'Innovation showcase'],
        suitable: ['Automotive', 'Engineering', 'Manufacturing', 'R&D'],
        premium: false
    },
    {
        id: 'tech-innovator',
        name: 'Tech Innovator',
        category: 'Technology',
        description: 'Modern design for tech professionals with cutting-edge styling',
        colors: ['#0891b2', '#06b6d4', '#22d3ee'],
        features: ['Tech-focused', 'Skills visualization', 'Modern layout', 'Innovation emphasis'],
        suitable: ['Technology', 'Software', 'IT', 'Startups'],
        premium: false
    },
    {
        id: 'consultant-premium',
        name: 'Consultant Premium',
        category: 'Consulting',
        description: 'Premium design for consulting professionals with impact focus',
        colors: ['#7c2d12', '#ea580c', '#fb923c'],
        features: ['Consulting focus', 'Client impact', 'Premium feel', 'Results-driven'],
        suitable: ['Consulting', 'Strategy', 'Advisory', 'Management'],
        premium: true
    },
    {
        id: 'startup-dynamic',
        name: 'Startup Dynamic',
        category: 'Startup',
        description: 'Dynamic design for startup environments with growth metrics',
        colors: ['#be185d', '#ec4899', '#f472b6'],
        features: ['Dynamic layout', 'Growth metrics', 'Startup culture', 'Agility showcase'],
        suitable: ['Startup', 'Growth', 'Innovation', 'Entrepreneurship'],
        premium: false
    },
    {
        id: 'academic-scholar',
        name: 'Academic Scholar',
        category: 'Academic',
        description: 'Professional design for academic positions with research focus',
        colors: ['#4338ca', '#6366f1', '#818cf8'],
        features: ['Research focus', 'Publications', 'Academic layout', 'Scholarly presentation'],
        suitable: ['Academic', 'Research', 'Education', 'PhD'],
        premium: false
    },
    {
        id: 'sales-achiever',
        name: 'Sales Achiever',
        category: 'Sales',
        description: 'Results-focused design for sales professionals with performance metrics',
        colors: ['#16a34a', '#22c55e', '#4ade80'],
        features: ['Results-driven', 'Achievement focus', 'Sales metrics', 'Performance showcase'],
        suitable: ['Sales', 'Business Development', 'Account Management', 'Revenue'],
        premium: false
    },
    {
        id: 'healthcare-professional',
        name: 'Healthcare Professional',
        category: 'Healthcare',
        description: 'Clean design for healthcare professionals with certifications focus',
        colors: ['#0d9488', '#14b8a6', '#5eead4'],
        features: ['Healthcare focus', 'Certifications', 'Professional layout', 'Patient care emphasis'],
        suitable: ['Healthcare', 'Medical', 'Nursing', 'Therapy'],
        premium: false
    },
    {
        id: 'legal-advocate',
        name: 'Legal Advocate',
        category: 'Legal',
        description: 'Professional design for legal professionals with case highlights',
        colors: ['#1e40af', '#3b82f6', '#60a5fa'],
        features: ['Legal focus', 'Case highlights', 'Professional tone', 'Advocacy showcase'],
        suitable: ['Legal', 'Law', 'Compliance', 'Paralegal'],
        premium: false
    },
    {
        id: 'project-manager',
        name: 'Project Manager',
        category: 'Management',
        description: 'Organized design for project managers with delivery metrics',
        colors: ['#7c3aed', '#8b5cf6', '#a78bfa'],
        features: ['Project focus', 'Team leadership', 'Delivery metrics', 'Process optimization'],
        suitable: ['Project Management', 'Operations', 'Leadership', 'Agile'],
        premium: false
    },
    {
        id: 'data-scientist',
        name: 'Data Scientist',
        category: 'Data Science',
        description: 'Analytics-focused design for data professionals with technical skills',
        colors: ['#dc2626', '#ef4444', '#f87171'],
        features: ['Data visualization', 'Analytics focus', 'Technical skills', 'ML/AI showcase'],
        suitable: ['Data Science', 'Analytics', 'Research', 'Machine Learning'],
        premium: false
    },
    {
        id: 'marketing-creative',
        name: 'Marketing Creative',
        category: 'Marketing',
        description: 'Creative design for marketing professionals with campaign highlights',
        colors: ['#f59e0b', '#fbbf24', '#fcd34d'],
        features: ['Campaign highlights', 'Creative layout', 'Brand focus', 'ROI metrics'],
        suitable: ['Marketing', 'Brand Management', 'Digital Marketing', 'Social Media'],
        premium: false
    },
    {
        id: 'operations-efficient',
        name: 'Operations Efficient',
        category: 'Operations',
        description: 'Streamlined design for operations professionals with efficiency metrics',
        colors: ['#059669', '#10b981', '#34d399'],
        features: ['Process focus', 'Efficiency metrics', 'Operations layout', 'Cost optimization'],
        suitable: ['Operations', 'Supply Chain', 'Logistics', 'Process Improvement'],
        premium: false
    },
    {
        id: 'hr-people-focused',
        name: 'HR People Focused',
        category: 'Human Resources',
        description: 'People-centered design for HR professionals with culture highlights',
        colors: ['#be185d', '#ec4899', '#f472b6'],
        features: ['People focus', 'Culture highlights', 'HR metrics', 'Employee engagement'],
        suitable: ['Human Resources', 'Talent Acquisition', 'People Operations', 'HRBP'],
        premium: false
    },
    {
        id: 'classic-traditional',
        name: 'Classic Traditional',
        category: 'Professional',
        description: 'Timeless design perfect for conservative industries and traditional roles',
        colors: ['#1f2937', '#6b7280', '#9ca3af'],
        features: ['Conservative layout', 'Traditional fonts', 'Formal structure', 'Time-tested'],
        suitable: ['Banking', 'Law', 'Government', 'Insurance'],
        premium: false
    },
    {
        id: 'modern-sidebar',
        name: 'Modern Sidebar',
        category: 'Creative',
        description: 'Contemporary design with sidebar layout for creative professionals',
        colors: ['#6366f1', '#8b5cf6', '#d946ef'],
        features: ['Sidebar layout', 'Modern design', 'Color blocks', 'Visual hierarchy'],
        suitable: ['Design', 'Creative', 'Architecture', 'Marketing'],
        premium: false
    },
    {
        id: 'corporate-elite',
        name: 'Corporate Elite',
        category: 'Executive',
        description: 'Premium corporate design for C-level executives and board members',
        colors: ['#0f172a', '#1e293b', '#334155'],
        features: ['Executive presence', 'Premium styling', 'Leadership focus', 'Board-ready'],
        suitable: ['CEO', 'CFO', 'VP', 'Board Member'],
        premium: true
    },
    {
        id: 'startup-founder',
        name: 'Startup Founder',
        category: 'Startup',
        description: 'Innovative design for entrepreneurs and startup founders',
        colors: ['#f59e0b', '#f97316', '#ea580c'],
        features: ['Innovation focus', 'Entrepreneurial', 'Growth metrics', 'Venture-ready'],
        suitable: ['Founder', 'Entrepreneur', 'Startup', 'Innovation'],
        premium: false
    },
    {
        id: 'tech-senior',
        name: 'Tech Senior',
        category: 'Technology',
        description: 'Advanced template for senior technology professionals and architects',
        colors: ['#059669', '#0891b2', '#0284c7'],
        features: ['Technical leadership', 'Architecture focus', 'System design', 'Senior level'],
        suitable: ['Tech Lead', 'Architect', 'CTO', 'Principal Engineer'],
        premium: true
    },
    {
        id: 'medical-specialist',
        name: 'Medical Specialist',
        category: 'Healthcare',
        description: 'Specialized design for medical doctors and healthcare specialists',
        colors: ['#0d9488', '#0891b2', '#0284c7'],
        features: ['Medical focus', 'Specialization', 'Credentials', 'Research'],
        suitable: ['Doctor', 'Specialist', 'Surgeon', 'Medical Research'],
        premium: false
    },
    {
        id: 'finance-executive',
        name: 'Finance Executive',
        category: 'Finance',
        description: 'Executive-level template for senior finance professionals',
        colors: ['#1e40af', '#1d4ed8', '#2563eb'],
        features: ['Financial leadership', 'Strategic focus', 'P&L responsibility', 'Board reporting'],
        suitable: ['CFO', 'Finance Director', 'VP Finance', 'Controller'],
        premium: true
    }
];

const templateCategories = [
    'All Templates',
    'Professional',
    'Executive',
    'Creative',
    'Finance',
    'Engineering',
    'Technology',
    'Consulting',
    'Academic',
    'Healthcare',
    'Legal',
    'Marketing',
    'Operations',
    'Sales',
    'Startup',
    'Data Science',
    'Human Resources',
    'Minimalist'
];

// Template Thumbnail Component
const TemplateThumbnail = ({ template }) => {
    const [primaryColor, secondaryColor, accentColor] = template.colors;

    return (
        <div className="w-full h-80 bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            <div className="p-4 h-full flex flex-col text-xs">
                <div className="text-center mb-3">
                    <div
                        className="h-4 rounded mb-1"
                        style={{ backgroundColor: primaryColor }}
                    ></div>
                    <div className="h-1 bg-gray-400 rounded mb-1 w-3/4 mx-auto"></div>
                    <div className="h-1 bg-gray-300 rounded w-1/2 mx-auto"></div>
                </div>

                <div className="text-center mb-3 space-y-0.5">
                    <div className="h-0.5 bg-gray-400 rounded w-2/3 mx-auto"></div>
                    <div className="h-0.5 bg-gray-400 rounded w-1/2 mx-auto"></div>
                    <div className="h-0.5 bg-gray-400 rounded w-3/5 mx-auto"></div>
                </div>

                <div className="mb-3">
                    <div
                        className="h-2 rounded mb-1 w-1/3"
                        style={{ backgroundColor: secondaryColor }}
                    ></div>
                    <div className="space-y-0.5">
                        <div className="h-0.5 bg-gray-300 rounded"></div>
                        <div className="h-0.5 bg-gray-300 rounded w-5/6"></div>
                        <div className="h-0.5 bg-gray-300 rounded w-4/5"></div>
                    </div>
                </div>

                <div className="mb-3 flex-1">
                    <div
                        className="h-2 rounded mb-1 w-2/5"
                        style={{ backgroundColor: secondaryColor }}
                    ></div>
                    <div className="space-y-2">
                        <div className="border-l-2 pl-2" style={{ borderColor: accentColor }}>
                            <div className="h-1 bg-gray-400 rounded w-3/4 mb-0.5"></div>
                            <div className="h-0.5 bg-gray-300 rounded w-1/2 mb-1"></div>
                            <div className="space-y-0.5">
                                <div className="h-0.5 bg-gray-300 rounded"></div>
                                <div className="h-0.5 bg-gray-300 rounded w-4/5"></div>
                            </div>
                        </div>

                        <div className="border-l-2 pl-2" style={{ borderColor: accentColor }}>
                            <div className="h-1 bg-gray-400 rounded w-2/3 mb-0.5"></div>
                            <div className="h-0.5 bg-gray-300 rounded w-2/5 mb-1"></div>
                            <div className="space-y-0.5">
                                <div className="h-0.5 bg-gray-300 rounded w-5/6"></div>
                                <div className="h-0.5 bg-gray-300 rounded w-3/4"></div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mb-2">
                    <div
                        className="h-2 rounded mb-1 w-1/4"
                        style={{ backgroundColor: secondaryColor }}
                    ></div>
                    <div className="flex flex-wrap gap-1">
                        {[...Array(6)].map((_, i) => (
                            <div
                                key={i}
                                className="h-1.5 rounded w-8"
                                style={{
                                    backgroundColor: i < 3 ? primaryColor : accentColor,
                                    opacity: 0.8
                                }}
                            ></div>
                        ))}
                    </div>
                </div>

                <div>
                    <div
                        className="h-2 rounded mb-1 w-1/3"
                        style={{ backgroundColor: secondaryColor }}
                    ></div>
                    <div className="h-1 bg-gray-400 rounded w-3/4 mb-0.5"></div>
                    <div className="h-0.5 bg-gray-300 rounded w-1/2"></div>
                </div>
            </div>
        </div>
    );
};

// AI content suggestions
const aiContentSuggestions = {
    finance: {
        summaries: [
            "Results-driven finance professional with [years] years of experience in financial analysis, risk management, and strategic planning. Proven track record of improving financial performance and driving cost optimization initiatives.",
            "Experienced financial analyst with expertise in financial modeling, valuation, and investment analysis. Strong background in corporate finance and capital markets with a focus on delivering actionable insights.",
            "Detail-oriented finance professional specializing in financial planning & analysis, budgeting, and forecasting. Demonstrated ability to support strategic decision-making through comprehensive financial analysis."
        ],
        skills: [
            'Financial Modeling', 'Excel', 'SQL', 'Python', 'Tableau', 'Bloomberg Terminal', 'Risk Analysis', 'Valuation', 'Financial Reporting', 'GAAP', 'IFRS', 'Budget Analysis', 'Forecasting', 'Investment Analysis', 'Portfolio Management'
        ],
        achievements: [
            "Improved financial reporting accuracy by [percentage]% through implementation of automated processes",
            "Led cost reduction initiative resulting in $[amount] annual savings",
            "Developed financial models that supported $[amount] in strategic investments",
            "Reduced month-end close process by [days] days through process optimization"
        ]
    },
    technology: {
        summaries: [
            "Innovative software engineer with [years] years of experience in full-stack development, cloud architecture, and agile methodologies. Passionate about creating scalable solutions and driving digital transformation.",
            "Results-oriented technology professional with expertise in software development, system design, and team leadership. Strong background in emerging technologies and continuous improvement.",
            "Experienced tech professional specializing in software architecture, DevOps, and product development. Proven ability to deliver high-quality solutions on time and within budget."
        ],
        skills: [
            'JavaScript', 'Python', 'React', 'Node.js', 'AWS', 'Docker', 'Kubernetes', 'MongoDB', 'PostgreSQL', 'Git', 'CI/CD', 'Microservices', 'RESTful APIs', 'Agile/Scrum', 'Machine Learning'
        ],
        achievements: [
            "Developed microservices architecture that improved system performance by [percentage]%",
            "Led development team of [number] engineers to deliver [number] major features",
            "Reduced deployment time by [percentage]% through CI/CD pipeline optimization",
            "Built scalable application serving [amount] monthly active users"
        ]
    },
    marketing: {
        summaries: [
            "Creative marketing professional with [years] years of experience in digital marketing, brand management, and campaign optimization. Proven track record of driving customer acquisition and engagement.",
            "Strategic marketing leader with expertise in content marketing, social media, and data analytics. Strong background in brand development and multi-channel campaign management.",
            "Results-driven marketing professional specializing in growth marketing, performance optimization, and customer journey mapping. Demonstrated ability to scale marketing operations and ROI."
        ],
        skills: [
            'Digital Marketing', 'Google Analytics', 'Facebook Ads', 'Google Ads', 'SEO/SEM', 'Content Marketing', 'Social Media', 'Email Marketing', 'Marketing Automation', 'A/B Testing', 'CRM', 'Conversion Optimization', 'Brand Management', 'Copywriting', 'Photoshop'
        ],
        achievements: [
            "Increased lead generation by [percentage]% through multi-channel marketing campaigns",
            "Improved conversion rate by [percentage]% through A/B testing and optimization",
            "Managed marketing budget of $[amount] with [percentage]% ROI improvement",
            "Grew social media following by [percentage]% in [number] months"
        ]
    }
};

const generateAIContent = (industry, field, experience = '3-5') => {
    const suggestions = aiContentSuggestions[industry.toLowerCase()];
    if (!suggestions) return null;

    const randomSummary = suggestions.summaries[Math.floor(Math.random() * suggestions.summaries.length)];
    const randomAchievements = suggestions.achievements.slice(0, 3);

    return {
        summary: randomSummary.replace('[years]', experience),
        skills: suggestions.skills.slice(0, 10),
        achievements: randomAchievements.map(achievement =>
            achievement
                .replace('[percentage]', Math.floor(Math.random() * 30) + 10)
                .replace('[amount]', (Math.floor(Math.random() * 500) + 100) + 'K')
                .replace('[days]', Math.floor(Math.random() * 5) + 2)
                .replace('[number]', Math.floor(Math.random() * 10) + 5)
        )
    };
};

// Main Resume Builder Component
const EnhancedResumeBuilder = () => {
    const [showStartModal, setShowStartModal] = useState(true);
    const [currentStep, setCurrentStep] = useState('template');
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('All Templates');
    const [searchTerm, setSearchTerm] = useState('');
    const [resumeData, setResumeData] = useState({
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

    const [aiSuggestions, setAiSuggestions] = useState(null);
    const [selectedIndustry, setSelectedIndustry] = useState('finance');
    const [experienceLevel, setExperienceLevel] = useState('3-5');
    const [currentSection, setCurrentSection] = useState('personal');

    const handleStartOption = (option) => {
        setShowStartModal(false);
        if (option === 'ai') {
            setCurrentStep('template');
        }
    };

    const filteredTemplates = resumeTemplates.filter(template => {
        const matchesCategory = selectedCategory === 'All Templates' || template.category === selectedCategory;
        const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            template.suitable.some(suit => suit.toLowerCase().includes(searchTerm.toLowerCase()));
        return matchesCategory && matchesSearch;
    });

    const handleTemplateSelect = (template) => {
        setSelectedTemplate(template);
    };

    const handleNextStep = () => {
        if (currentStep === 'template' && selectedTemplate) {
            setCurrentStep('builder');
        } else if (currentStep === 'builder') {
            setCurrentStep('preview');
        }
    };

    const handlePrevStep = () => {
        if (currentStep === 'builder') {
            setCurrentStep('template');
        } else if (currentStep === 'preview') {
            setCurrentStep('builder');
        }
    };

    const generateAISuggestions = () => {
        const suggestions = generateAIContent(selectedIndustry, 'general', experienceLevel);
        setAiSuggestions(suggestions);
    };

    const applyAISuggestion = (type, content) => {
        if (type === 'summary') {
            setResumeData(prev => ({
                ...prev,
                professionalSummary: content
            }));
        } else if (type === 'skills') {
            setResumeData(prev => ({
                ...prev,
                skills: [...new Set([...prev.skills, ...content])]
            }));
        } else if (type === 'achievements') {
            setResumeData(prev => ({
                ...prev,
                achievements: [...prev.achievements, ...content]
            }));
        }
    };

    const StartModal = () => (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Let's get started</h2>
                    <button
                        onClick={() => setShowStartModal(false)}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <p className="text-gray-600 mb-6">How do you want to create your resume?</p>

                <div className="space-y-4">
                    <button
                        onClick={() => handleStartOption('new')}
                        className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                    >
                        <div className="flex items-center">
                            <FileText className="h-6 w-6 text-gray-600 mr-3" />
                            <span className="font-medium text-gray-900">Create new resume</span>
                        </div>
                        <ArrowRight className="h-5 w-5 text-gray-400" />
                    </button>

                    <button
                        onClick={() => handleStartOption('ai')}
                        className="w-full flex items-center justify-between p-4 border border-blue-200 bg-blue-50 rounded-lg hover:border-blue-300 hover:bg-blue-100 transition-colors"
                    >
                        <div className="flex items-center">
                            <Sparkles className="h-6 w-6 text-blue-600 mr-3" />
                            <div className="text-left">
                                <span className="font-medium text-gray-900 block">Create with AI assistance</span>
                                <span className="text-sm text-blue-600">Recommended</span>
                            </div>
                        </div>
                        <ArrowRight className="h-5 w-5 text-gray-400" />
                    </button>

                    <button
                        onClick={() => handleStartOption('upload')}
                        className="w-full flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                    >
                        <div className="flex items-center">
                            <Upload className="h-6 w-6 text-gray-600 mr-3" />
                            <span className="font-medium text-gray-900">Upload resume</span>
                        </div>
                        <ArrowRight className="h-5 w-5 text-gray-400" />
                    </button>
                </div>
            </div>
        </div>
    );

    const TemplateSelector = () => (
        <div className="p-8">
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Resume Template</h2>
                <p className="text-lg text-gray-600">Select from our collection of 25+ professional, ATS-friendly resume templates</p>
            </div>

            <div className="mb-8">
                <div className="flex justify-center mb-6">
                    <input
                        type="text"
                        placeholder="Search templates..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                <div className="flex flex-wrap gap-3 justify-center">
                    {templateCategories.map(category => (
                        <button
                            key={category}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedCategory === category
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            onClick={() => setSelectedCategory(category)}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {filteredTemplates.map(template => (
                    <div
                        key={template.id}
                        className={`bg-white border-2 rounded-lg overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 ${selectedTemplate?.id === template.id
                                ? 'border-blue-500 ring-2 ring-blue-200'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                        onClick={() => handleTemplateSelect(template)}
                    >
                        <div className="relative">
                            <TemplateThumbnail template={template} />

                            {selectedTemplate?.id === template.id && (
                                <div className="absolute top-2 right-2 bg-blue-600 rounded-full p-1">
                                    <Check className="h-4 w-4 text-white" />
                                </div>
                            )}

                            {template.premium && (
                                <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded">
                                    Premium
                                </div>
                            )}
                        </div>

                        <div className="p-4">
                            <h3 className="font-semibold text-gray-900 mb-1">{template.name}</h3>
                            <p className="text-sm text-gray-600 mb-3">{template.description}</p>

                            <div className="flex flex-wrap gap-1 mb-3">
                                {template.features.slice(0, 2).map((feature, index) => (
                                    <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                        {feature}
                                    </span>
                                ))}
                            </div>

                            <div>
                                <p className="text-xs text-gray-500 font-medium">Best for:</p>
                                <p className="text-xs text-gray-600">{template.suitable.slice(0, 2).join(', ')}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredTemplates.length === 0 && (
                <div className="text-center py-12">
                    <p className="text-gray-500 mb-4">No templates found matching your criteria.</p>
                    <button
                        onClick={() => { setSearchTerm(''); setSelectedCategory('All Templates'); }}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Clear Filters
                    </button>
                </div>
            )}

            {selectedTemplate && (
                <div className="flex justify-center">
                    <button
                        onClick={handleNextStep}
                        className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center"
                    >
                        Continue to Builder
                        <ArrowRight className="h-5 w-5 ml-2" />
                    </button>
                </div>
            )}
        </div>
    );

    const ResumeBuilder = () => {
        const sections = [
            { id: 'personal', name: 'Personal Details', icon: '👤' },
            { id: 'summary', name: 'Professional Summary', icon: '📝' },
            { id: 'experience', name: 'Work Experience', icon: '💼' },
            { id: 'skills', name: 'Skills', icon: '⚡' }
        ];

        const renderPersonalSection = () => (
            <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                        <input
                            type="text"
                            value={resumeData.personalInfo.firstName}
                            onChange={(e) => setResumeData(prev => ({
                                ...prev,
                                personalInfo: { ...prev.personalInfo, firstName: e.target.value }
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="John"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                        <input
                            type="text"
                            value={resumeData.personalInfo.lastName}
                            onChange={(e) => setResumeData(prev => ({
                                ...prev,
                                personalInfo: { ...prev.personalInfo, lastName: e.target.value }
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Doe"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                        <input
                            type="email"
                            value={resumeData.personalInfo.email}
                            onChange={(e) => setResumeData(prev => ({
                                ...prev,
                                personalInfo: { ...prev.personalInfo, email: e.target.value }
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="john.doe@email.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                        <input
                            type="tel"
                            value={resumeData.personalInfo.phone}
                            onChange={(e) => setResumeData(prev => ({
                                ...prev,
                                personalInfo: { ...prev.personalInfo, phone: e.target.value }
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="+1 (555) 123-4567"
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
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="New York, NY"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
                        <input
                            type="url"
                            value={resumeData.personalInfo.linkedin}
                            onChange={(e) => setResumeData(prev => ({
                                ...prev,
                                personalInfo: { ...prev.personalInfo, linkedin: e.target.value }
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="https://linkedin.com/in/johndoe"
                        />
                    </div>
                </div>
            </div>
        );

        const renderSummarySection = () => (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-gray-900">Professional Summary</h3>
                    <div className="flex items-center space-x-4">
                        <select
                            value={selectedIndustry}
                            onChange={(e) => setSelectedIndustry(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                        >
                            <option value="finance">Finance</option>
                            <option value="technology">Technology</option>
                            <option value="marketing">Marketing</option>
                        </select>
                        <select
                            value={experienceLevel}
                            onChange={(e) => setExperienceLevel(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                        >
                            <option value="0-2">0-2 years</option>
                            <option value="3-5">3-5 years</option>
                            <option value="6-10">6-10 years</option>
                            <option value="10+">10+ years</option>
                        </select>
                        <button
                            type="button"
                            onClick={generateAISuggestions}
                            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-md hover:from-purple-700 hover:to-blue-700 transition-colors flex items-center text-sm"
                        >
                            <Zap className="h-4 w-4 mr-2" />
                            AI Generate
                        </button>
                    </div>
                </div>

                {aiSuggestions && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-medium text-blue-900 mb-3">AI-Generated Summary:</h4>
                        <div className="bg-white p-3 rounded border border-blue-200 mb-3">
                            <p className="text-gray-700">{aiSuggestions.summary}</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => applyAISuggestion('summary', aiSuggestions.summary)}
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors text-sm"
                        >
                            Use This Summary
                        </button>
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Professional Summary *</label>
                    <textarea
                        value={resumeData.professionalSummary}
                        onChange={(e) => setResumeData(prev => ({
                            ...prev,
                            professionalSummary: e.target.value
                        }))}
                        placeholder="Write a compelling professional summary that highlights your key achievements and career objectives..."
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
            </div>
        );

        const renderExperienceSection = () => (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-gray-900">Work Experience</h3>
                    <button
                        type="button"
                        onClick={() => setResumeData(prev => ({
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
                        }))}
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors flex items-center text-sm"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Experience
                    </button>
                </div>

                {resumeData.experience.map((exp, index) => (
                    <div key={exp.id} className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="font-medium text-gray-900">Experience #{index + 1}</h4>
                            <button
                                type="button"
                                onClick={() => setResumeData(prev => ({
                                    ...prev,
                                    experience: prev.experience.filter(e => e.id !== exp.id)
                                }))}
                                className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                            >
                                Remove
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
                                <input
                                    type="text"
                                    value={exp.jobTitle}
                                    onChange={(e) => setResumeData(prev => ({
                                        ...prev,
                                        experience: prev.experience.map(e =>
                                            e.id === exp.id ? { ...e, jobTitle: e.target.value } : e
                                        )
                                    }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Senior Financial Analyst"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Company *</label>
                                <input
                                    type="text"
                                    value={exp.company}
                                    onChange={(e) => setResumeData(prev => ({
                                        ...prev,
                                        experience: prev.experience.map(e =>
                                            e.id === exp.id ? { ...e, company: e.target.value } : e
                                        )
                                    }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Goldman Sachs"
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
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-semibold text-gray-900">Skills</h3>
                        {aiSuggestions && aiSuggestions.skills && (
                            <button
                                type="button"
                                onClick={() => applyAISuggestion('skills', aiSuggestions.skills)}
                                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-md hover:from-purple-700 hover:to-blue-700 transition-colors flex items-center text-sm"
                            >
                                <Zap className="h-4 w-4 mr-2" />
                                Add AI Skills
                            </button>
                        )}
                    </div>

                    <div className="flex gap-3">
                        <input
                            type="text"
                            value={newSkill}
                            onChange={(e) => setNewSkill(e.target.value)}
                            placeholder="Add a skill..."
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            onKeyPress={(e) => {
                                if (e.key === 'Enter' && newSkill.trim()) {
                                    setResumeData(prev => ({
                                        ...prev,
                                        skills: [...prev.skills, newSkill.trim()]
                                    }));
                                    setNewSkill('');
                                }
                            }}
                        />
                        <button
                            type="button"
                            onClick={() => {
                                if (newSkill.trim()) {
                                    setResumeData(prev => ({
                                        ...prev,
                                        skills: [...prev.skills, newSkill.trim()]
                                    }));
                                    setNewSkill('');
                                }
                            }}
                            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                        >
                            Add
                        </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {resumeData.skills.map((skill, index) => (
                            <div key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm flex items-center">
                                <span>{skill}</span>
                                <button
                                    type="button"
                                    onClick={() => setResumeData(prev => ({
                                        ...prev,
                                        skills: prev.skills.filter((_, i) => i !== index)
                                    }))}
                                    className="ml-2 text-blue-600 hover:text-blue-800"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            );
        };

        const renderCurrentSection = () => {
            switch (currentSection) {
                case 'personal': return renderPersonalSection();
                case 'summary': return renderSummarySection();
                case 'experience': return renderExperienceSection();
                case 'skills': return renderSkillsSection();
                default: return renderPersonalSection();
            }
        };

        return (
            <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Build Your Resume</h2>
                        <p className="text-lg text-gray-600">Fill in your information with AI assistance</p>
                    </div>
                    <div className="text-sm text-gray-500">
                        Template: <span className="font-medium text-gray-900">{selectedTemplate?.name}</span>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-8 bg-gray-50 p-4 rounded-lg">
                    {sections.map(section => (
                        <button
                            key={section.id}
                            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${currentSection === section.id
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                                }`}
                            onClick={() => setCurrentSection(section.id)}
                        >
                            <span>{section.icon}</span>
                            <span>{section.name}</span>
                        </button>
                    ))}
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                    {renderCurrentSection()}
                </div>

                <div className="flex justify-between mt-8">
                    <button
                        onClick={handlePrevStep}
                        className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors flex items-center"
                    >
                        <ArrowLeft className="h-5 w-5 mr-2" />
                        Back to Templates
                    </button>
                    <button
                        onClick={handleNextStep}
                        className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center"
                    >
                        Preview Resume
                        <ArrowRight className="h-5 w-5 ml-2" />
                    </button>
                </div>
            </div>
        );
    };

    const ResumePreview = () => {
        const fullName = `${resumeData.personalInfo.firstName} ${resumeData.personalInfo.lastName}`.trim();

        return (
            <div className="p-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Preview Your Resume</h2>
                        <p className="text-lg text-gray-600">Review and download your professional resume</p>
                    </div>
                    <div className="flex space-x-4">
                        <button
                            onClick={() => console.log('Downloading resume...')}
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                        >
                            <Download className="h-5 w-5 mr-2" />
                            Download PDF
                        </button>
                    </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-8 max-w-4xl mx-auto">
                    <div className="text-center mb-8 pb-6 border-b border-gray-200">
                        <h1 className="text-3xl font-bold text-gray-900 mb-3">
                            {fullName || 'Your Name'}
                        </h1>
                        <div className="text-gray-600 space-y-1">
                            {resumeData.personalInfo.email && <p>{resumeData.personalInfo.email}</p>}
                            {resumeData.personalInfo.phone && <p>{resumeData.personalInfo.phone}</p>}
                            {resumeData.personalInfo.location && <p>{resumeData.personalInfo.location}</p>}
                            {resumeData.personalInfo.linkedin && <p>{resumeData.personalInfo.linkedin}</p>}
                        </div>
                    </div>

                    {resumeData.professionalSummary && (
                        <div className="mb-8">
                            <h3 className="text-xl font-semibold text-gray-900 mb-3">Professional Summary</h3>
                            <p className="text-gray-700 leading-relaxed">{resumeData.professionalSummary}</p>
                        </div>
                    )}

                    {resumeData.experience.length > 0 && (
                        <div className="mb-8">
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">Work Experience</h3>
                            <div className="space-y-6">
                                {resumeData.experience.map((exp, index) => (
                                    <div key={index} className="border-l-2 border-blue-200 pl-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="text-lg font-medium text-gray-900">{exp.jobTitle}</h4>
                                            <span className="text-sm text-gray-600">
                                                {exp.startDate} - {exp.current ? 'Present' : exp.endDate}
                                            </span>
                                        </div>
                                        <p className="text-gray-700 mb-2 font-medium">{exp.company} • {exp.location}</p>
                                        {exp.description && <p className="text-gray-600">{exp.description}</p>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {resumeData.skills.length > 0 && (
                        <div className="mb-8">
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">Skills</h3>
                            <div className="flex flex-wrap gap-3">
                                {resumeData.skills.map((skill, index) => (
                                    <span
                                        key={index}
                                        className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium"
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex justify-center mt-8">
                    <button
                        onClick={handlePrevStep}
                        className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors flex items-center"
                    >
                        <ArrowLeft className="h-5 w-5 mr-2" />
                        Back to Builder
                    </button>
                </div>
            </div>
        );
    };

    const StepIndicator = () => {
        const steps = [
            { id: 'template', name: 'Choose Template', completed: selectedTemplate !== null },
            { id: 'builder', name: 'Build Resume', completed: currentStep === 'preview' },
            { id: 'preview', name: 'Preview & Download', completed: false }
        ];

        return (
            <div className="flex items-center justify-center mb-8">
                {steps.map((step, index) => (
                    <div key={step.id} className="flex items-center">
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${currentStep === step.id
                                ? 'border-blue-600 bg-blue-600 text-white'
                                : step.completed
                                    ? 'border-green-600 bg-green-600 text-white'
                                    : 'border-gray-300 bg-white text-gray-500'
                            }`}>
                            {step.completed ? (
                                <Check className="h-5 w-5" />
                            ) : (
                                <span className="text-sm font-medium">{index + 1}</span>
                            )}
                        </div>
                        <div className="ml-3 mr-8">
                            <p className={`text-sm font-medium ${currentStep === step.id ? 'text-blue-600' : 'text-gray-500'
                                }`}>
                                {step.name}
                            </p>
                        </div>
                        {index < steps.length - 1 && (
                            <div className={`w-16 h-0.5 mr-8 ${step.completed ? 'bg-green-600' : 'bg-gray-300'
                                }`} />
                        )}
                    </div>
                ))}
            </div>
        );
    };

    const renderCurrentStep = () => {
        switch (currentStep) {
            case 'template':
                return <TemplateSelector />;
            case 'builder':
                return <ResumeBuilder />;
            case 'preview':
                return <ResumePreview />;
            default:
                return <TemplateSelector />;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            {showStartModal && <StartModal />}

            <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">AI-Powered Resume Builder</h1>
                    <p className="text-lg text-gray-600">Create professional resumes with AI assistance and beautiful templates</p>
                </div>

                <StepIndicator />

                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    {renderCurrentStep()}
                </div>
            </div>
        </div>
    );
};

export default EnhancedResumeBuilder;