import React from 'react';
import { render } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import theme from '../../theme';
import { AuthProvider } from '../../contexts/AuthContext';
import { NotificationProvider } from '../../contexts/NotificationContext';

// Create a test query client
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

// Custom render function with all providers
export const renderWithProviders = (ui, options = {}) => {
  const {
    preloadedState = {},
    queryClient = createTestQueryClient(),
    ...renderOptions
  } = options;

  const Wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <BrowserRouter>
          <AuthProvider>
            <NotificationProvider>
              {children}
            </NotificationProvider>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );

  return render(ui, { wrapper: Wrapper, ...renderOptions });
};

// Mock user data for testing
export const mockUsers = {
  applicant: {
    id: '1',
    email: 'applicant@test.com',
    role: 'applicant',
    fullName: 'John Doe',
    isAuthenticated: true,
  },
  recruiter: {
    id: '2',
    email: 'recruiter@test.com',
    role: 'recruiter',
    fullName: 'Jane Smith',
    companyName: 'Tech Corp',
    isAuthenticated: true,
  },
  admin: {
    id: '3',
    email: 'admin@test.com',
    role: 'admin',
    fullName: 'Admin User',
    isAuthenticated: true,
  },
};

// Mock API responses
export const mockApiResponses = {
  jobs: [
    {
      id: '1',
      title: 'Frontend Developer',
      company: 'Tech Corp',
      location: 'Mumbai',
      salary: '₹8-12 LPA',
      type: 'Full-time',
      description: 'Looking for a skilled frontend developer...',
    },
    {
      id: '2',
      title: 'Backend Developer',
      company: 'StartupXYZ',
      location: 'Bangalore',
      salary: '₹10-15 LPA',
      type: 'Full-time',
      description: 'Seeking an experienced backend developer...',
    },
  ],
  applications: [
    {
      id: '1',
      jobId: '1',
      status: 'pending',
      appliedAt: '2024-01-15T10:00:00Z',
      jobTitle: 'Frontend Developer',
      companyName: 'Tech Corp',
    },
    {
      id: '2',
      jobId: '2',
      status: 'reviewed',
      appliedAt: '2024-01-10T14:30:00Z',
      jobTitle: 'Backend Developer',
      companyName: 'StartupXYZ',
    },
  ],
  notifications: [
    {
      id: '1',
      title: 'New Job Match',
      message: 'We found a job that matches your profile',
      type: 'job_match',
      isRead: false,
      createdAt: '2024-01-20T09:00:00Z',
    },
    {
      id: '2',
      title: 'Application Update',
      message: 'Your application has been reviewed',
      type: 'job_application',
      isRead: true,
      createdAt: '2024-01-19T15:30:00Z',
    },
  ],
};

// Helper function to wait for async operations
export const waitFor = (callback, options = {}) => {
  return new Promise((resolve, reject) => {
    const { timeout = 1000, interval = 50 } = options;
    const startTime = Date.now();

    const check = () => {
      try {
        const result = callback();
        if (result) {
          resolve(result);
        } else if (Date.now() - startTime >= timeout) {
          reject(new Error('Timeout waiting for condition'));
        } else {
          setTimeout(check, interval);
        }
      } catch (error) {
        if (Date.now() - startTime >= timeout) {
          reject(error);
        } else {
          setTimeout(check, interval);
        }
      }
    };

    check();
  });
};

// Mock fetch responses
export const mockFetch = (responses) => {
  global.fetch = jest.fn((url) => {
    const response = responses[url] || responses.default;
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve(response),
      text: () => Promise.resolve(JSON.stringify(response)),
    });
  });
};

// Clean up function for tests
export const cleanup = () => {
  jest.clearAllMocks();
  localStorage.clear();
  sessionStorage.clear();
};

export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
