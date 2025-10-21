import { useState, useEffect, useCallback } from 'react';
import dataService from '../services/dataService';
import { useAuth } from '../contexts/AuthContext';

export const useDataFetching = (dataType, options = {}) => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEmpty, setIsEmpty] = useState(false);

  const {
    autoFetch = true,
    dependencies = [],
    filters = {},
    limit,
    timeRange = '30d'
  } = options;

  const fetchData = useCallback(async () => {
    if (!user || !dataService.isAuthenticated()) {
      setData(null);
      setLoading(false);
      setIsEmpty(true);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      let result;
      switch (dataType) {
        case 'applications':
          result = await dataService.getUserApplications();
          break;
        case 'jobs':
          result = await dataService.getJobRecommendations(limit);
          break;
        case 'notifications':
          result = await dataService.getUserNotifications();
          break;
        case 'analytics':
          result = await dataService.getUserAnalytics(timeRange);
          break;
        case 'profile':
          result = await dataService.getUserProfile();
          break;
        case 'skills':
          result = await dataService.getUserSkills();
          break;
        case 'education':
          result = await dataService.getUserEducation();
          break;
        case 'experience':
          result = await dataService.getUserExperience();
          break;
        case 'certifications':
          result = await dataService.getUserCertifications();
          break;
        case 'projects':
          result = await dataService.getUserProjects();
          break;
        case 'bookmarks':
          result = await dataService.getJobBookmarks();
          break;
        case 'alerts':
          result = await dataService.getJobAlerts();
          break;
        case 'interviews':
          result = await dataService.getInterviewSchedules();
          break;
        case 'conversations':
          result = await dataService.getConversations();
          break;
        case 'company':
          result = await dataService.getCompanyData();
          break;
        case 'company-jobs':
          result = await dataService.getCompanyJobs();
          break;
        case 'company-analytics':
          result = await dataService.getCompanyAnalytics(timeRange);
          break;
        case 'platform-analytics':
          result = await dataService.getPlatformAnalytics(timeRange);
          break;
        case 'users':
          result = await dataService.getUsers(filters);
          break;
        case 'companies':
          result = await dataService.getCompanies(filters);
          break;
        case 'admin-jobs':
          result = await dataService.getJobs(filters);
          break;
        case 'moderation':
          result = await dataService.getModerationItems(filters);
          break;
        case 'salary-insights':
          result = await dataService.getSalaryInsights(filters);
          break;
        case 'skills-assessments':
          result = await dataService.getSkillsAssessments();
          break;
        default:
          throw new Error(`Unknown data type: ${dataType}`);
      }

      setData(result);
      
      // Check if data is empty
      if (Array.isArray(result)) {
        setIsEmpty(result.length === 0);
      } else if (typeof result === 'object') {
        setIsEmpty(Object.keys(result).length === 0);
      } else {
        setIsEmpty(!result);
      }

    } catch (err) {
      console.error(`Error fetching ${dataType}:`, err);
      setError(err.message);
      setData(null);
      setIsEmpty(true);
    } finally {
      setLoading(false);
    }
  }, [user, dataType, timeRange, JSON.stringify(filters), limit]);

  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [fetchData, autoFetch, ...dependencies]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    isEmpty,
    refetch
  };
};

// Specialized hooks for common data types
export const useApplications = (options = {}) => {
  return useDataFetching('applications', options);
};

export const useJobs = (options = {}) => {
  return useDataFetching('jobs', options);
};

export const useNotifications = (options = {}) => {
  return useDataFetching('notifications', options);
};

export const useAnalytics = (timeRange = '30d', options = {}) => {
  return useDataFetching('analytics', { ...options, timeRange });
};

export const useProfile = (options = {}) => {
  return useDataFetching('profile', options);
};

export const useSkills = (options = {}) => {
  return useDataFetching('skills', options);
};

export const useEducation = (options = {}) => {
  return useDataFetching('education', options);
};

export const useExperience = (options = {}) => {
  return useDataFetching('experience', options);
};

export const useCertifications = (options = {}) => {
  return useDataFetching('certifications', options);
};

export const useProjects = (options = {}) => {
  return useDataFetching('projects', options);
};

export const useBookmarks = (options = {}) => {
  return useDataFetching('bookmarks', options);
};

export const useAlerts = (options = {}) => {
  return useDataFetching('alerts', options);
};

export const useInterviews = (options = {}) => {
  return useDataFetching('interviews', options);
};

export const useConversations = (options = {}) => {
  return useDataFetching('conversations', options);
};

// Company-specific hooks
export const useCompanyData = (options = {}) => {
  return useDataFetching('company', options);
};

export const useCompanyJobs = (options = {}) => {
  return useDataFetching('company-jobs', options);
};

export const useCompanyAnalytics = (timeRange = '30d', options = {}) => {
  return useDataFetching('company-analytics', { ...options, timeRange });
};

// Admin-specific hooks
export const useUsers = (filters = {}, options = {}) => {
  return useDataFetching('users', { ...options, filters });
};

export const useCompanies = (filters = {}, options = {}) => {
  return useDataFetching('companies', { ...options, filters });
};

export const useAdminJobs = (filters = {}, options = {}) => {
  return useDataFetching('admin-jobs', { ...options, filters });
};

export const useModeration = (filters = {}, options = {}) => {
  return useDataFetching('moderation', { ...options, filters });
};

export const usePlatformAnalytics = (timeRange = '30d', options = {}) => {
  return useDataFetching('platform-analytics', { ...options, timeRange });
};

// Other specialized hooks
export const useSalaryInsights = (filters = {}, options = {}) => {
  return useDataFetching('salary-insights', { ...options, filters });
};

export const useSkillsAssessments = (options = {}) => {
  return useDataFetching('skills-assessments', options);
};
