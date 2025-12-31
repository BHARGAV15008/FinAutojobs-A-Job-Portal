import React, { useState } from 'react';
import { motion } from 'framer-motion';

// Jobs Filter Component
export const JobsFilter = ({ filters, onFilterChange, onReset }) => {
  const jobTypes = ['Full-time', 'Part-time', 'Contract', 'Remote'];
  const salaryRanges = ['0-3 LPA', '3-6 LPA', '6-10 LPA', '10+ LPA'];
  const experienceLevels = ['Entry Level', '1-2 years', '3-5 years', '5+ years'];

  return (
    <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-md">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">🔍 Job Filters</h3>
        <button
          className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
          onClick={onReset}
        >
          Clear All
        </button>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search jobs..."
        className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700"
        value={filters.search || ''}
        onChange={(e) => onFilterChange('search', e.target.value)}
      />

      {/* Location */}
      <input
        type="text"
        placeholder="Location..."
        className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700"
        value={filters.location || ''}
        onChange={(e) => onFilterChange('location', e.target.value)}
      />

      {/* Job Type */}
      <div>
        <label className="block text-sm font-medium mb-2">Job Type</label>
        <div className="flex flex-wrap gap-2">
          {jobTypes.map((type) => (
            <button
              key={type}
              className={`px-3 py-1 text-sm rounded-full ${
                filters.jobType === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              onClick={() => onFilterChange('jobType', filters.jobType === type ? '' : type)}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Salary */}
      <div>
        <label className="block text-sm font-medium mb-2">Salary Range</label>
        <select
          className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700"
          value={filters.salary || ''}
          onChange={(e) => onFilterChange('salary', e.target.value)}
        >
          <option value="">All Salaries</option>
          {salaryRanges.map((range) => (
            <option key={range} value={range}>{range}</option>
          ))}
        </select>
      </div>

      {/* Experience */}
      <div>
        <label className="block text-sm font-medium mb-2">Experience</label>
        <select
          className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700"
          value={filters.experience || ''}
          onChange={(e) => onFilterChange('experience', e.target.value)}
        >
          <option value="">All Levels</option>
          {experienceLevels.map((level) => (
            <option key={level} value={level}>{level}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

// Applications Filter Component
export const ApplicationsFilter = ({ filters, onFilterChange, onReset }) => {
  const statuses = ['Applied', 'Under Review', 'Shortlisted', 'Interview', 'Rejected', 'Hired'];
  const dateRanges = ['Last 7 days', 'Last 30 days', 'Last 3 months', 'All time'];

  return (
    <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-md">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">📋 Application Filters</h3>
        <button
          className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
          onClick={onReset}
        >
          Clear All
        </button>
      </div>

      {/* Status */}
      <div>
        <label className="block text-sm font-medium mb-2">Status</label>
        <select
          className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700"
          value={filters.status || ''}
          onChange={(e) => onFilterChange('status', e.target.value)}
        >
          <option value="">All Statuses</option>
          {statuses.map((status) => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      </div>

      {/* Date Range */}
      <div>
        <label className="block text-sm font-medium mb-2">Date Range</label>
        <select
          className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700"
          value={filters.dateRange || ''}
          onChange={(e) => onFilterChange('dateRange', e.target.value)}
        >
          <option value="">All Time</option>
          {dateRanges.map((range) => (
            <option key={range} value={range}>{range}</option>
          ))}
        </select>
      </div>

      {/* Company */}
      <input
        type="text"
        placeholder="Search companies..."
        className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700"
        value={filters.company || ''}
        onChange={(e) => onFilterChange('company', e.target.value)}
      />
    </div>
  );
};

// Analytics Filter Component
export const AnalyticsFilter = ({ filters, onFilterChange, onReset }) => {
  const timeRanges = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '3m', label: 'Last 3 months' },
    { value: '1y', label: 'Last year' }
  ];

  return (
    <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-md">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">📊 Analytics Filters</h3>
        <button
          className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
          onClick={onReset}
        >
          Reset
        </button>
      </div>

      {/* Time Range */}
      <div>
        <label className="block text-sm font-medium mb-2">Time Range</label>
        <select
          className="w-full px-3 py-2 border rounded-lg bg-white dark:bg-gray-700"
          value={filters.timeRange || '30d'}
          onChange={(e) => onFilterChange('timeRange', e.target.value)}
        >
          {timeRanges.map((range) => (
            <option key={range.value} value={range.value}>{range.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default { JobsFilter, ApplicationsFilter, AnalyticsFilter };
