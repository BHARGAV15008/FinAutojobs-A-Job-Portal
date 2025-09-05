import { useState } from 'react';
import { Link } from 'wouter';
import {
  Search,
  MapPin,
  Briefcase,
  TrendingUp,
  Users,
  Building2,
  Award,
  ChevronRight,
  Star,
  Heart,
  ArrowRight,
  Zap,
  Lightbulb,
  BookOpen,
  ShieldCheck,
  Rocket,
  Code,
  DollarSign,
  Globe,
  UserPlus,
  Laptop,
  User,
  BarChart2,
  Smile,
  Clock,
  CheckCircle,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');

  const { data: jobsData } = useQuery({
    queryKey: ['jobs', 'featured'],
    queryFn: () => api.getJobs({ limit: 6 }).then((res) => res.json()),
  });

  const { data: companiesData } = useQuery({
    queryKey: ['companies', 'featured'],
    queryFn: () => api.getCompanies({ limit: 6 }).then((res) => res.json()),
  });

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.append('search', searchQuery);
    if (location) params.append('location', location);
    window.location.href = `/jobs?${params.toString()}`;
  };

  const stats = [
    { icon: Users, label: 'Active Users', value: '2M+' },
    { icon: Building2, label: 'Companies', value: '50K+' },
    { icon: Briefcase, label: 'Jobs Posted', value: '100K+' },
    { icon: Award, label: 'Success Rate', value: '95%' },
  ];

  const popularSearches = [
    { title: 'Jobs for Freshers', trending: '#1', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300' },
    { title: 'Work from Home Jobs', trending: '#2', image: 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300' },
    { title: 'Part-Time Jobs', trending: '#3', image: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300' },
    { title: 'Jobs for Women', trending: '#4', image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300' },
    { title: 'Full-Time Jobs', trending: '#5', image: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300' },
  ];

  const features = [
    { icon: Zap, title: 'Fast Matching', description: 'Get matched with jobs in seconds using AI-powered recommendations.' },
    { icon: ShieldCheck, title: 'Verified Jobs', description: 'All jobs are verified for authenticity and quality.' },
    { icon: Rocket, title: 'Career Growth', description: 'Access tools and resources to boost your career.' },
    { icon: Code, title: 'Tech-Driven', description: 'Cutting-edge technology for a seamless job search experience.' },
  ];

  const testimonials = [
    {
      name: 'Priya Sharma',
      role: 'Software Engineer',
      company: 'TechMahindra',
      quote: 'I found my dream job in just 2 weeks! The platform’s AI matching is incredible.',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
    },
    {
      name: 'Rahul Verma',
      role: 'Marketing Manager',
      company: 'Flipkart',
      quote: 'The best job search experience I’ve ever had. Highly recommend to all job seekers!',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
    },
    {
      name: 'Ananya Gupta',
      role: 'Product Designer',
      company: 'Zomato',
      quote: 'From application to offer in record time. The process was smooth and efficient.',
      avatar: 'https://randomuser.me/api/portraits/women/68.jpg',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-purple-600 to-blue-500 text-white py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
            Find Your <span className="text-yellow-300">Dream Job</span>
          </h1>
          <p className="text-xl md:text-2xl mb-10 text-blue-100 max-w-3xl mx-auto animate-fade-in">
            India’s #1 job platform connecting millions of job seekers with top employers
          </p>

          {/* Search Form */}
          <form onSubmit={handleSearch} className="max-w-4xl mx-auto bg-white rounded-xl shadow-2xl p-4 md:p-6 transform hover:scale-105 transition-transform">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Job title, keywords, or company"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex-1 relative">
                <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                type="submit"
                className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300 shadow-lg transform hover:scale-105"
              >
                Search Jobs
              </button>
            </div>
          </form>

          <div className="mt-12 flex justify-center space-x-4">
            <span className="text-sm bg-white/20 px-4 py-2 rounded-full animate-pulse">🔥 Trending: AI Jobs, Remote Work, Startups</span>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center p-6 bg-gray-50 rounded-xl shadow-sm hover:shadow-lg transition-shadow transform hover:scale-105">
                <div className="flex justify-center mb-4">
                  <stat.icon className="w-8 h-8 text-purple-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 animate-fade-in">
              Why Choose Us?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto animate-fade-in">
              Discover the benefits of using our platform for your job search
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-sm hover:shadow-lg transition-shadow transform hover:scale-105">
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                    <feature.icon className="w-8 h-8 text-purple-600" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Jobs */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 animate-fade-in">
              Featured Jobs
            </h2>
            <p className="text-gray-600 animate-fade-in">
              Discover the latest opportunities from top companies
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {jobsData?.jobs?.map((job) => (
              <div key={job.id} className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-shadow overflow-hidden transform hover:scale-105">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      {job.logo ? (
                        <img src={job.logo} alt={job.company} className="w-12 h-12 rounded-lg object-cover" />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                          <Briefcase className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">{job.title}</h3>
                        <p className="text-gray-600">{job.company}</p>
                      </div>
                    </div>
                    <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                      <Heart className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      {job.location}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Briefcase className="w-4 h-4 mr-2" />
                      {job.type} • {job.mode}
                    </div>
                    <div className="text-sm font-medium text-green-600">₹{job.salary}/month</div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {job.skills?.slice(0, 3).map((skill, i) => (
                      <span key={i} className="px-3 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">{skill}</span>
                    ))}
                  </div>

                  <Link
                    to={`/job/${job.id}`}
                    className="block w-full text-center bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white py-2.5 px-4 rounded-lg transition-all duration-300 font-medium"
                  >
                    View Job
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/jobs"
              className="inline-block bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white py-3 px-8 rounded-lg transition-all duration-300 shadow-lg transform hover:scale-105"
            >
              View All Jobs
            </Link>
          </div>
        </div>
      </section>

      {/* Popular Searches */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 animate-fade-in">
              Popular Searches
            </h2>
            <p className="text-gray-600 animate-fade-in">
              Trending job categories this week
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {popularSearches.map((search, index) => (
              <div key={index} className="relative group cursor-pointer rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow transform hover:scale-105">
                <div className="relative overflow-hidden">
                  <img
                    src={search.image}
                    alt={search.title}
                    className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-30 group-hover:bg-opacity-20 transition-all duration-300" />
                  <div className="absolute top-3 right-3 bg-red-500 text-white text-xs px-2.5 py-1.5 rounded-full font-semibold">
                    {search.trending}
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/80 to-transparent">
                    <h3 className="text-white font-semibold text-lg">{search.title}</h3>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Companies */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 animate-fade-in">
              Top Companies
            </h2>
            <p className="text-gray-600 animate-fade-in">
              Work with the best companies in India
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {companiesData?.companies?.map((company) => (
              <div key={company.id} className="text-center group cursor-pointer">
                <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-shadow transform hover:scale-105 h-full flex flex-col items-center justify-center">
                  {company.logo_url ? (
                    <img
                      src={company.logo_url}
                      alt={company.name}
                      className="w-16 h-16 mx-auto mb-4 object-contain transition-transform duration-300 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                      <Building2 className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  <h3 className="font-semibold text-gray-900 text-sm group-hover:text-purple-600 transition-colors">{company.name}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4 animate-fade-in">
              Success Stories
            </h2>
            <p className="text-gray-600 animate-fade-in">
              Hear from people who found their dream jobs
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-sm hover:shadow-lg transition-shadow transform hover:scale-105">
                <div className="flex items-center mb-6">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-16 h-16 rounded-full object-cover mr-4 border-2 border-purple-500"
                  />
                  <div>
                    <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                    <p className="text-gray-600 text-sm">{testimonial.role} at {testimonial.company}</p>
                  </div>
                </div>
                <p className="text-gray-700 italic mb-4">"{testimonial.quote}"</p>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-purple-600 to-blue-500 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6 animate-fade-in">
            Ready to Start Your Career?
          </h2>
          <p className="text-xl mb-10 text-blue-100 max-w-2xl mx-auto animate-fade-in">
            Join millions of job seekers and find your perfect match today
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="bg-white text-purple-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition-all duration-300 shadow-lg transform hover:scale-105 flex items-center gap-2 justify-center"
            >
              Create Account <UserPlus className="w-5 h-5" />
            </Link>
            <Link
              to="/jobs"
              className="border-2 border-white text-white hover:bg-white hover:text-purple-600 font-semibold py-3 px-8 rounded-lg transition-all duration-300 shadow-lg transform hover:scale-105 flex items-center gap-2 justify-center"
            >
              Browse Jobs <Search className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
