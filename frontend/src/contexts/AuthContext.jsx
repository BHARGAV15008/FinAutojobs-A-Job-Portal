import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../api/apiClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      console.log('🔍 AuthContext loadUser called, token:', token ? 'exists' : 'not found');
      if (token) {
        try {
          console.log('🔍 Calling profile endpoint...');
          const response = await apiClient.get('/auth/profile');
          console.log('✅ Profile response:', response.data);
          const user = response.data.data?.user || response.data.user || response.data;
          setUser(user);
          console.log('✅ User set:', user);
        } catch (error) {
          console.error('❌ Failed to load user', error);
          
          // If profile endpoint is disabled (503), keep user logged in with token data
          if (error.response?.status === 503) {
            // Try to decode user info from token or use stored user data
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
              try {
                setUser(JSON.parse(storedUser));
              } catch (parseError) {
                console.error('Failed to parse stored user', parseError);
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
              }
            }
          } else {
            // For other errors, clear tokens
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
          }
        }
      } else {
        // No token found, user is not authenticated
        console.log('🔍 No token found, user not authenticated');
        setUser(null);
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  const login = async (credentials) => {
    try {
      const { data } = await apiClient.post('/auth/login', credentials);
      
      if (data.success) {
        const { user, token } = data.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user)); // Store user data for offline access
        setUser(user);
        
        // Redirect based on user role
        const role = user.role;
        if (role === 'recruiter' || role === 'employer') {
          window.location.replace('/recruiter-dashboard');
        } else if (role === 'admin') {
          window.location.replace('/admin-dashboard');
        } else {
          window.location.replace('/applicant-dashboard');
        }
        
        return { success: true };
      } else {
        return { success: false, error: data.message || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed. Please try again.' 
      };
    }
  };

  const register = async (userData) => {
    try {
      const { data } = await apiClient.post('/auth/register', userData);
      
      if (data.success) {
        const { user, token } = data.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user)); // Store user data for offline access
        setUser(user);
        
        // Redirect based on user role
        const role = user.role;
        if (role === 'recruiter' || role === 'employer') {
          window.location.replace('/recruiter-dashboard');
        } else if (role === 'admin') {
          window.location.replace('/admin-dashboard');
        } else {
          window.location.replace('/applicant-dashboard');
        }
        
        return { success: true };
      } else {
        return { success: false, error: data.message || 'Registration failed' };
      }
    } catch (error) {
      console.error('Registration error:', error);
      const errorData = error.response?.data;
      return { 
        success: false, 
        error: errorData?.message || 'Registration failed. Please try again.',
        field: errorData?.field // Include field information for specific error handling
      };
    }
  };

  const logout = async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user'); // Clear stored user data
      setUser(null);
      window.location.href = '/login';
    }
  };

  // OTP Functions
  const sendEmailOTP = async (email) => {
    try {
      const { data } = await apiClient.post('/auth/send-otp-email', { email });
      return { success: data.success || true, message: data.message };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to send OTP' 
      };
    }
  };

  const verifyEmailOTP = async (email, otp) => {
    try {
      const { data } = await apiClient.post('/auth/verify-otp', { 
        identifier: email, 
        otp, 
        type: 'email' 
      });
      return { success: data.success || true, message: data.message };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Invalid OTP' 
      };
    }
  };

  const sendSMSOTP = async (phone) => {
    try {
      const { data } = await apiClient.post('/auth/send-otp-sms', { phone });
      return { success: data.success || true, message: data.message };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to send SMS OTP' 
      };
    }
  };

  const verifySMSOTP = async (phone, otp) => {
    try {
      const { data } = await apiClient.post('/auth/verify-otp', { 
        identifier: phone, 
        otp, 
        type: 'sms' 
      });
      return { success: data.success || true, message: data.message };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Invalid SMS OTP' 
      };
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user, // Add isAuthenticated property
    login,
    register,
    logout,
    sendEmailOTP,
    verifyEmailOTP,
    sendSMSOTP,
    verifySMSOTP
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
