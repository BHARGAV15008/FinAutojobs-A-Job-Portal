import { useState, useCallback } from 'react';
import api from '../utils/api';

export const useSearch = (type = 'jobs') => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);

  const search = useCallback(async (query, filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      let response;
      
      switch (type) {
        case 'jobs':
          response = await api.searchJobs(query, filters);
          break;
        case 'companies':
          response = await api.searchCompanies(query, filters);
          break;
        default:
          response = await api.searchJobs(query, filters);
      }
      
      if (response.success) {
        setResults(response.data || response.jobs || response.companies || []);
        setTotal(response.total || response.count || 0);
      } else {
        setError(response.message || 'Search failed');
        setResults([]);
        setTotal(0);
      }
    } catch (err) {
      console.error('Search error:', err);
      setError(err.message || 'Search failed');
      setResults([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [type]);

  const clearSearch = useCallback(() => {
    setResults([]);
    setError(null);
    setTotal(0);
  }, []);

  return {
    results,
    loading,
    error,
    total,
    search,
    clearSearch
  };
};

export default useSearch;
