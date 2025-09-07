import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';

// Custom hook for API calls with loading, error, and success states
export const useApi = (apiFunction, dependencies = [], options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { isAuthenticated } = useAuth();

  const {
    immediate = true,
    onSuccess,
    onError,
    transform,
  } = options;

  const execute = useCallback(async (...args) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiFunction(...args);
      const result = response.data;
      
      const transformedData = transform ? transform(result) : result;
      setData(transformedData);
      
      if (onSuccess) {
        onSuccess(transformedData);
      }
      
      return transformedData;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred';
      setError(errorMessage);
      
      if (onError) {
        onError(errorMessage);
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunction, onSuccess, onError, transform]);

  useEffect(() => {
    if (immediate && isAuthenticated) {
      execute();
    }
  }, [...dependencies, immediate, isAuthenticated]);

  const retry = useCallback(() => {
    execute();
  }, [execute]);

  return {
    data,
    loading,
    error,
    execute,
    retry,
    refetch: execute,
  };
};

// Hook for paginated API calls
export const usePaginatedApi = (apiFunction, initialParams = {}, options = {}) => {
  const [data, setData] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [params, setParams] = useState({ page: 1, limit: 10, ...initialParams });
  const { isAuthenticated } = useAuth();

  const {
    immediate = true,
    onSuccess,
    onError,
    transform,
  } = options;

  const execute = useCallback(async (newParams = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const queryParams = { ...params, ...newParams };
      const response = await apiFunction(queryParams);
      const result = response.data;
      
      const transformedData = transform ? transform(result.data) : result.data;
      setData(transformedData);
      setTotalCount(result.totalCount || result.total || 0);
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      return result;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred';
      setError(errorMessage);
      
      if (onError) {
        onError(errorMessage);
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunction, params, onSuccess, onError, transform]);

  useEffect(() => {
    if (immediate && isAuthenticated) {
      execute();
    }
  }, [immediate, isAuthenticated]);

  const updateParams = useCallback((newParams) => {
    setParams(prev => ({ ...prev, ...newParams }));
  }, []);

  const nextPage = useCallback(() => {
    const newParams = { page: params.page + 1 };
    setParams(prev => ({ ...prev, ...newParams }));
    execute(newParams);
  }, [params.page, execute]);

  const prevPage = useCallback(() => {
    if (params.page > 1) {
      const newParams = { page: params.page - 1 };
      setParams(prev => ({ ...prev, ...newParams }));
      execute(newParams);
    }
  }, [params.page, execute]);

  const goToPage = useCallback((page) => {
    const newParams = { page };
    setParams(prev => ({ ...prev, ...newParams }));
    execute(newParams);
  }, [execute]);

  const changeLimit = useCallback((limit) => {
    const newParams = { page: 1, limit };
    setParams(prev => ({ ...prev, ...newParams }));
    execute(newParams);
  }, [execute]);

  const search = useCallback((searchQuery) => {
    const newParams = { page: 1, search: searchQuery };
    setParams(prev => ({ ...prev, ...newParams }));
    execute(newParams);
  }, [execute]);

  const sort = useCallback((sortBy, sortOrder = 'asc') => {
    const newParams = { page: 1, sortBy, sortOrder };
    setParams(prev => ({ ...prev, ...newParams }));
    execute(newParams);
  }, [execute]);

  const filter = useCallback((filters) => {
    const newParams = { page: 1, ...filters };
    setParams(prev => ({ ...prev, ...newParams }));
    execute(newParams);
  }, [execute]);

  const refresh = useCallback(() => {
    execute();
  }, [execute]);

  const totalPages = Math.ceil(totalCount / params.limit);
  const hasNextPage = params.page < totalPages;
  const hasPrevPage = params.page > 1;

  return {
    data,
    loading,
    error,
    params,
    totalCount,
    totalPages,
    hasNextPage,
    hasPrevPage,
    execute,
    updateParams,
    nextPage,
    prevPage,
    goToPage,
    changeLimit,
    search,
    sort,
    filter,
    refresh,
  };
};

// Hook for mutations (POST, PUT, DELETE)
export const useMutation = (apiFunction, options = {}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const {
    onSuccess,
    onError,
    onSettled,
    transform,
  } = options;

  const mutate = useCallback(async (...args) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiFunction(...args);
      const result = response.data;
      
      const transformedData = transform ? transform(result) : result;
      setData(transformedData);
      
      if (onSuccess) {
        onSuccess(transformedData);
      }
      
      return transformedData;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'An error occurred';
      setError(errorMessage);
      
      if (onError) {
        onError(errorMessage);
      }
      
      throw err;
    } finally {
      setLoading(false);
      
      if (onSettled) {
        onSettled();
      }
    }
  }, [apiFunction, onSuccess, onError, onSettled, transform]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    mutate,
    data,
    loading,
    error,
    reset,
  };
};

// Hook for file uploads with progress
export const useFileUpload = (uploadFunction, options = {}) => {
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const {
    onSuccess,
    onError,
    onProgress,
  } = options;

  const upload = useCallback(async (file, additionalData = {}) => {
    try {
      setLoading(true);
      setError(null);
      setProgress(0);
      
      const formData = new FormData();
      formData.append('file', file);
      
      Object.keys(additionalData).forEach(key => {
        formData.append(key, additionalData[key]);
      });

      const response = await uploadFunction(formData, {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setProgress(percentCompleted);
          
          if (onProgress) {
            onProgress(percentCompleted);
          }
        },
      });
      
      const result = response.data;
      setData(result);
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      return result;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Upload failed';
      setError(errorMessage);
      
      if (onError) {
        onError(errorMessage);
      }
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, [uploadFunction, onSuccess, onError, onProgress]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
    setProgress(0);
  }, []);

  return {
    upload,
    data,
    loading,
    error,
    progress,
    reset,
  };
};

// Hook for real-time data with polling
export const usePolling = (apiFunction, interval = 5000, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isPolling, setIsPolling] = useState(false);
  const { isAuthenticated } = useAuth();

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiFunction();
      setData(response.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [apiFunction]);

  const startPolling = useCallback(() => {
    setIsPolling(true);
  }, []);

  const stopPolling = useCallback(() => {
    setIsPolling(false);
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !isPolling) return;

    fetchData();
    const intervalId = setInterval(fetchData, interval);

    return () => clearInterval(intervalId);
  }, [fetchData, interval, isPolling, isAuthenticated, ...dependencies]);

  return {
    data,
    loading,
    error,
    isPolling,
    startPolling,
    stopPolling,
    refetch: fetchData,
  };
};

export default {
  useApi,
  usePaginatedApi,
  useMutation,
  useFileUpload,
  usePolling,
};
