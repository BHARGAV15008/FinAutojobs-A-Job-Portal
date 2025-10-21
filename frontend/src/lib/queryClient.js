import { QueryClient } from "@tanstack/react-query";
import API_BASE_URL from "../services/apiConfig";

async function throwIfResNotOk(res) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}
export async function apiRequest(
  method,
  url,
  data,
  options = {}
) {
  const token = localStorage.getItem('token');
  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
  
  // Create AbortController for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeout || 60000); // 60 seconds default

  try {
    const res = await fetch(fullUrl, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
      signal: controller.signal,
      ...options
    });

    clearTimeout(timeoutId);
    await throwIfResNotOk(res);
    return res;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      console.log('⚠️ API request timeout - using fallback behavior');
      throw new Error('timeout of 60000ms exceeded');
    }
    
    // Network error handling
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      console.log('Network error:', error.message);
      throw new Error('Network error: ' + error.message);
    }
    
    throw error;
  }
}

export const getQueryFn = ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = queryKey.join("/");
    const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
    const res = await fetch(fullUrl, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors (client errors)
        if (error.message.includes('4')) return false;
        // Don't retry on timeout errors
        if (error.message.includes('timeout')) return false;
        // Retry up to 2 times for other errors
        return failureCount < 2;
      },
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: (failureCount, error) => {
        // Don't retry mutations on client errors or timeouts
        if (error.message.includes('4') || error.message.includes('timeout')) return false;
        return failureCount < 1;
      },
    },
  },
});