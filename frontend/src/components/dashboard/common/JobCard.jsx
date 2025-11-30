import React from 'react';
import { Link } from 'wouter';
import { 
  MapPin, 
  Briefcase, 
  Clock,
  ChevronRight,
  IndianRupee,
  Languages
} from 'lucide-react';

const JobCard = ({ job }) => {
  const formatSalary = (min, max, salary) => {
    if (salary) return salary;
    if (min && max) {
      return `₹${min.toLocaleString('en-IN')} - ₹${max.toLocaleString('en-IN')}`;
    }
    return '₹Not Disclosed';
  };

  const getWorkModeText = () => {
    const mode = job.workMode || job.mode || job.location || 'On-site';
    if (mode === 'Remote') return 'Work from home';
    return mode;
  };

  return (
    <Link href={`/job/${job.id}`}>
      <div className="flex items-center p-4 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-indigo-500 transition-all duration-200 cursor-pointer group">
        {/* Company Logo */}
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0 mr-4">
          {job.logo || job.company?.[0] || 'C'}
        </div>

        {/* Main Content */}
        <div className="flex-grow min-w-0">
          {/* Title and Company */}
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 truncate mb-0.5 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {job.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 truncate mb-2">
            {job.company}
          </p>

          {/* Work Mode & Salary Row */}
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-2 flex-wrap">
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
              <span>{getWorkModeText()}</span>
            </div>
            <div className="flex items-center">
              <IndianRupee className="h-4 w-4 mr-0.5 flex-shrink-0" />
              <span>{formatSalary(job.salaryMin, job.salaryMax, job.salary)} {job.salaryPeriod || 'monthly'}</span>
            </div>
          </div>

          {/* Tags Row */}
          <div className="flex gap-2 flex-wrap">
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
              <Briefcase className="h-3 w-3 mr-1" />
              {job.type || 'Full Time'}
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
              <Clock className="h-3 w-3 mr-1" />
              {job.experience || 'Min. 1 year'}
            </span>
            {job.language && (
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                <Languages className="h-3 w-3 mr-1" />
                {job.language}
              </span>
            )}
          </div>
        </div>

        {/* Right Arrow */}
        <div className="text-indigo-500 ml-2 flex-shrink-0">
          <ChevronRight className="h-5 w-5" />
        </div>
      </div>
    </Link>
  );
};

export default JobCard;
