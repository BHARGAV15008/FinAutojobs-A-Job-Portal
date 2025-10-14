import React, { useMemo } from 'react'
import { Router as WouterRouter } from 'wouter'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { DashboardProvider } from './contexts/RealDashboardContext';
import { IntegratedThemeProvider } from './contexts/IntegratedThemeContext';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { OAuthProvider } from './contexts/OAuthContext.jsx';
import { FavoritesProvider } from './contexts/FavoritesContext.jsx';
import ErrorBoundary from './components/ui/ErrorBoundary';
import NotificationSystem from './components/notifications/NotificationSystem';
import AppRoutes from './routes/AppRoutes'
import './styles/modern-theme.css'

function App() {
  // Memoize query client to prevent recreation on re-renders
  const queryClient = useMemo(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 minutes
        cacheTime: 1000 * 60 * 10, // 10 minutes
        refetchOnWindowFocus: false, // Prevent refetch on window focus
        refetchOnMount: false, // Prevent refetch on component mount
        retry: 1, // Reduce retry attempts
      },
    },
  }), []);
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <WouterRouter>
          <IntegratedThemeProvider>
            <AuthProvider>
              <FavoritesProvider>
                <OAuthProvider>
                  <DashboardProvider>
                    <div className="page-background typography-fix">
                      <AppRoutes />
                      <NotificationSystem />
                    </div>
                  </DashboardProvider>
                </OAuthProvider>
              </FavoritesProvider>
            </AuthProvider>
          </IntegratedThemeProvider>
        </WouterRouter>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App
