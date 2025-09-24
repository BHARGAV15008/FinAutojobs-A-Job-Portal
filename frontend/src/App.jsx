import React from 'react'
import { Router as WouterRouter } from 'wouter'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { DashboardProvider } from './contexts/RealDashboardContext';
import { IntegratedThemeProvider } from './contexts/IntegratedThemeContext';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { OAuthProvider } from './contexts/OAuthContext.jsx';
import ErrorBoundary from './components/ui/ErrorBoundary';
import NotificationSystem from './components/notifications/NotificationSystem';
import AppRoutes from './routes/AppRoutes'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 10, // 10 minutes
    },
  },
})

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <WouterRouter>
          <IntegratedThemeProvider>
            <AuthProvider>
              <OAuthProvider>
                <DashboardProvider>
                  <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                    <AppRoutes />
                    <NotificationSystem />
                  </div>
                </DashboardProvider>
              </OAuthProvider>
            </AuthProvider>
          </IntegratedThemeProvider>
        </WouterRouter>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App
