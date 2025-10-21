import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Eye, 
  Download, 
  Star, 
  Briefcase, 
  Code, 
  Palette, 
  TrendingUp,
  Users,
  Award,
  Zap
} from 'lucide-react';
import ModernCard from '../ui/ModernCard';
import ModernButton from '../ui/ModernButton';

// Resume template data
const resumeTemplates = [
  // Professional Templates
  {
    id: 'professional-1',
    name: 'Executive Pro',
    category: 'professional',
    description: 'Clean, professional layout perfect for corporate roles',
    preview: '/templates/professional-1.jpg',
    features: ['ATS-Friendly', 'Clean Layout', 'Professional'],
    rating: 4.9,
    downloads: 15420,
    isPremium: false,
    colors: ['#2563eb', '#1f2937', '#374151'],
    industries: ['Finance', 'Consulting', 'Management'],
    difficulty: 'Easy'
  },
  {
    id: 'professional-2',
    name: 'Corporate Elite',
    category: 'professional',
    description: 'Sophisticated design for senior-level positions',
    preview: '/templates/professional-2.jpg',
    features: ['Executive Level', 'Sophisticated', 'ATS-Optimized'],
    rating: 4.8,
    downloads: 12340,
    isPremium: true,
    colors: ['#1e40af', '#374151', '#6b7280'],
    industries: ['Banking', 'Law', 'Healthcare'],
    difficulty: 'Medium'
  },
  {
    id: 'professional-3',
    name: 'Business Classic',
    category: 'professional',
    description: 'Timeless professional template for all industries',
    preview: '/templates/professional-3.jpg',
    features: ['Versatile', 'Classic Design', 'Industry Neutral'],
    rating: 4.7,
    downloads: 18750,
    isPremium: false,
    colors: ['#374151', '#1f2937', '#4b5563'],
    industries: ['All Industries'],
    difficulty: 'Easy'
  },
  {
    id: 'professional-4',
    name: 'Modern Professional',
    category: 'professional',
    description: 'Contemporary professional design with subtle modern touches',
    preview: '/templates/professional-4.jpg',
    features: ['Modern Touch', 'Professional', 'Clean'],
    rating: 4.8,
    downloads: 9870,
    isPremium: false,
    colors: ['#3b82f6', '#1e293b', '#475569'],
    industries: ['Technology', 'Finance', 'Consulting'],
    difficulty: 'Easy'
  },

  // Creative Templates
  {
    id: 'creative-1',
    name: 'Creative Spark',
    category: 'creative',
    description: 'Vibrant and creative design for artistic professionals',
    preview: '/templates/creative-1.jpg',
    features: ['Colorful', 'Creative Layout', 'Visual Impact'],
    rating: 4.6,
    downloads: 8920,
    isPremium: false,
    colors: ['#f59e0b', '#ec4899', '#8b5cf6'],
    industries: ['Design', 'Marketing', 'Media'],
    difficulty: 'Medium'
  },
  {
    id: 'creative-2',
    name: 'Designer Portfolio',
    category: 'creative',
    description: 'Portfolio-style resume perfect for designers',
    preview: '/templates/creative-2.jpg',
    features: ['Portfolio Style', 'Visual Showcase', 'Creative'],
    rating: 4.7,
    downloads: 6540,
    isPremium: true,
    colors: ['#06b6d4', '#f97316', '#84cc16'],
    industries: ['Graphic Design', 'UX/UI', 'Architecture'],
    difficulty: 'Advanced'
  },
  {
    id: 'creative-3',
    name: 'Artistic Flair',
    category: 'creative',
    description: 'Bold and artistic template for creative professionals',
    preview: '/templates/creative-3.jpg',
    features: ['Bold Design', 'Artistic', 'Eye-catching'],
    rating: 4.5,
    downloads: 7230,
    isPremium: false,
    colors: ['#dc2626', '#7c3aed', '#059669'],
    industries: ['Arts', 'Entertainment', 'Fashion'],
    difficulty: 'Medium'
  },

  // Modern Templates
  {
    id: 'modern-1',
    name: 'Tech Innovator',
    category: 'modern',
    description: 'Sleek modern design perfect for tech professionals',
    preview: '/templates/modern-1.jpg',
    features: ['Tech-Focused', 'Modern Design', 'Clean'],
    rating: 4.9,
    downloads: 21340,
    isPremium: false,
    colors: ['#0ea5e9', '#1e293b', '#64748b'],
    industries: ['Technology', 'Software', 'Startups'],
    difficulty: 'Easy'
  },
  {
    id: 'modern-2',
    name: 'Minimalist Pro',
    category: 'modern',
    description: 'Clean minimalist design with maximum impact',
    preview: '/templates/modern-2.jpg',
    features: ['Minimalist', 'Clean', 'Impactful'],
    rating: 4.8,
    downloads: 16780,
    isPremium: false,
    colors: ['#000000', '#374151', '#9ca3af'],
    industries: ['Design', 'Technology', 'Consulting'],
    difficulty: 'Easy'
  },
  {
    id: 'modern-3',
    name: 'Future Forward',
    category: 'modern',
    description: 'Cutting-edge design for forward-thinking professionals',
    preview: '/templates/modern-3.jpg',
    features: ['Futuristic', 'Innovative', 'Bold'],
    rating: 4.6,
    downloads: 11250,
    isPremium: true,
    colors: ['#6366f1', '#8b5cf6', '#ec4899'],
    industries: ['AI/ML', 'Blockchain', 'Innovation'],
    difficulty: 'Advanced'
  },

  // Executive Templates
  {
    id: 'executive-1',
    name: 'C-Suite Executive',
    category: 'executive',
    description: 'Premium template designed for C-level executives',
    preview: '/templates/executive-1.jpg',
    features: ['Executive Level', 'Premium', 'Leadership Focus'],
    rating: 4.9,
    downloads: 5420,
    isPremium: true,
    colors: ['#1e40af', '#374151', '#d1d5db'],
    industries: ['Executive', 'Leadership', 'Board Level'],
    difficulty: 'Advanced'
  },
  {
    id: 'executive-2',
    name: 'Senior Leadership',
    category: 'executive',
    description: 'Sophisticated template for senior management roles',
    preview: '/templates/executive-2.jpg',
    features: ['Senior Level', 'Sophisticated', 'Results-Focused'],
    rating: 4.8,
    downloads: 4680,
    isPremium: true,
    colors: ['#0f172a', '#475569', '#94a3b8'],
    industries: ['Management', 'Strategy', 'Operations'],
    difficulty: 'Advanced'
  },

  // Technical Templates
  {
    id: 'technical-1',
    name: 'Software Engineer',
    category: 'technical',
    description: 'Technical template optimized for software developers',
    preview: '/templates/technical-1.jpg',
    features: ['Code-Friendly', 'Technical Skills', 'Project Focus'],
    rating: 4.8,
    downloads: 19870,
    isPremium: false,
    colors: ['#059669', '#1f2937', '#4b5563'],
    industries: ['Software Development', 'Engineering', 'DevOps'],
    difficulty: 'Medium'
  },
  {
    id: 'technical-2',
    name: 'Data Scientist',
    category: 'technical',
    description: 'Specialized template for data science professionals',
    preview: '/templates/technical-2.jpg',
    features: ['Data-Focused', 'Analytics', 'Research'],
    rating: 4.7,
    downloads: 13450,
    isPremium: false,
    colors: ['#7c3aed', '#1e293b', '#64748b'],
    industries: ['Data Science', 'Analytics', 'Research'],
    difficulty: 'Medium'
  },
  {
    id: 'technical-3',
    name: 'DevOps Engineer',
    category: 'technical',
    description: 'Template tailored for DevOps and infrastructure roles',
    preview: '/templates/technical-3.jpg',
    features: ['Infrastructure Focus', 'Technical', 'Cloud-Ready'],
    rating: 4.6,
    downloads: 8920,
    isPremium: true,
    colors: ['#f59e0b', '#dc2626', '#1f2937'],
    industries: ['DevOps', 'Cloud', 'Infrastructure'],
    difficulty: 'Advanced'
  },

  // Academic Templates
  {
    id: 'academic-1',
    name: 'Research Scholar',
    category: 'academic',
    description: 'Academic template for researchers and scholars',
    preview: '/templates/academic-1.jpg',
    features: ['Research Focus', 'Publication Ready', 'Academic'],
    rating: 4.7,
    downloads: 6780,
    isPremium: false,
    colors: ['#1e40af', '#374151', '#6b7280'],
    industries: ['Academia', 'Research', 'Education'],
    difficulty: 'Medium'
  },
  {
    id: 'academic-2',
    name: 'Professor CV',
    category: 'academic',
    description: 'Comprehensive CV template for academic professionals',
    preview: '/templates/academic-2.jpg',
    features: ['CV Format', 'Comprehensive', 'Academic'],
    rating: 4.8,
    downloads: 4320,
    isPremium: true,
    colors: ['#0f172a', '#475569', '#94a3b8'],
    industries: ['Higher Education', 'Research', 'Academia'],
    difficulty: 'Advanced'
  }
];

// Category icons
const categoryIcons = {
  professional: Briefcase,
  creative: Palette,
  modern: Zap,
  executive: Award,
  technical: Code,
  academic: Users
};

// Category colors
const categoryColors = {
  professional: 'from-blue-500 to-indigo-600',
  creative: 'from-pink-500 to-purple-600',
  modern: 'from-cyan-500 to-blue-600',
  executive: 'from-gray-700 to-gray-900',
  technical: 'from-green-500 to-teal-600',
  academic: 'from-indigo-500 to-purple-600'
};

const ResumeTemplates = ({ onSelectTemplate }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [showFilters, setShowFilters] = useState(false);

  // Get unique categories
  const categories = ['all', ...new Set(resumeTemplates.map(template => template.category))];

  // Filter and sort templates
  const filteredTemplates = useMemo(() => {
    let filtered = resumeTemplates.filter(template => {
      const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          template.features.some(feature => feature.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });

    // Sort templates
    switch (sortBy) {
      case 'popular':
        filtered.sort((a, b) => b.downloads - a.downloads);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'newest':
        // For demo purposes, we'll use downloads as a proxy for newness
        filtered.sort((a, b) => a.downloads - b.downloads);
        break;
      default:
        break;
    }

    return filtered;
  }, [searchTerm, selectedCategory, sortBy]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <motion.h1 
          className="text-4xl font-bold text-gray-900 dark:text-white mb-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Professional Resume Templates
        </motion.h1>
        <motion.p 
          className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          Choose from our collection of ATS-friendly, professionally designed resume templates
        </motion.p>
      </div>

      {/* Search and Filters */}
      <ModernCard className="mb-8" padding="lg">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search templates..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Category Filter */}
          <select
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
              </option>
            ))}
          </select>

          {/* Sort */}
          <select
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="popular">Most Popular</option>
            <option value="rating">Highest Rated</option>
            <option value="name">Name A-Z</option>
            <option value="newest">Newest</option>
          </select>

          {/* Filter Toggle */}
          <ModernButton
            variant="outline"
            icon={<Filter className="w-4 h-4" />}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filters
          </ModernButton>
        </div>

        {/* Advanced Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Industry
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                    <option>All Industries</option>
                    <option>Technology</option>
                    <option>Finance</option>
                    <option>Healthcare</option>
                    <option>Education</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Experience Level
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                    <option>All Levels</option>
                    <option>Entry Level</option>
                    <option>Mid Level</option>
                    <option>Senior Level</option>
                    <option>Executive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Template Type
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                    <option>All Types</option>
                    <option>Free</option>
                    <option>Premium</option>
                    <option>ATS-Friendly</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </ModernCard>

      {/* Results Count */}
      <div className="mb-6">
        <p className="text-gray-600 dark:text-gray-400">
          Showing {filteredTemplates.length} of {resumeTemplates.length} templates
        </p>
      </div>

      {/* Templates Grid */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {filteredTemplates.map((template) => {
          const CategoryIcon = categoryIcons[template.category];
          
          return (
            <motion.div key={template.id} variants={itemVariants}>
              <ModernCard 
                className="h-full group cursor-pointer"
                hover={true}
                shadow="lg"
                onClick={() => onSelectTemplate?.(template)}
              >
                {/* Template Preview */}
                <div className="relative mb-4 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700">
                  <div className="aspect-[3/4] flex items-center justify-center">
                    <div className={`w-full h-full bg-gradient-to-br ${categoryColors[template.category]} opacity-10`} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <CategoryIcon className="w-16 h-16 text-gray-400" />
                    </div>
                  </div>
                  
                  {/* Premium Badge */}
                  {template.isPremium && (
                    <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                      Premium
                    </div>
                  )}

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                    <ModernButton
                      size="sm"
                      variant="secondary"
                      icon={<Eye className="w-4 h-4" />}
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle preview
                      }}
                    >
                      Preview
                    </ModernButton>
                    <ModernButton
                      size="sm"
                      variant="primary"
                      icon={<Download className="w-4 h-4" />}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectTemplate?.(template);
                      }}
                    >
                      Use
                    </ModernButton>
                  </div>
                </div>

                {/* Template Info */}
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                      {template.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {template.description}
                    </p>
                  </div>

                  {/* Features */}
                  <div className="flex flex-wrap gap-1">
                    {template.features.slice(0, 3).map((feature, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span>{template.rating}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Download className="w-4 h-4" />
                      <span>{template.downloads.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </ModernCard>
            </motion.div>
          );
        })}
      </motion.div>

      {/* No Results */}
      {filteredTemplates.length === 0 && (
        <motion.div
          className="text-center py-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div className="text-gray-400 mb-4">
            <Search className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
            No templates found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Try adjusting your search criteria or browse all templates
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default ResumeTemplates;
