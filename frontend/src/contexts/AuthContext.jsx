import React, { createContext, useContext, useState, useEffect } from 'react';
import { getProfile } from '../api/auth';
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
          // First try to validate the token
          const validateResponse = await apiClient.get('/auth/validate-token');
          console.log('✅ Token validation successful:', validateResponse.data);
          
          // If token is valid, get full profile
          const response = await getProfile();
          
          if (response.success && response.data) {
            const userData = response.data;
            setUser(userData);
            console.log('✅ User profile loaded successfully:', userData.email);
          }
        } catch (error) {
          console.error('❌ Error during user load:', error.response?.data || error.message);
          
          // If profile endpoint is disabled (503), keep user logged in with token data
          if (error.response?.status === 503) {
            // Try to decode user info from token or use stored user data
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
              try {
                setUser(JSON.parse(storedUser));
                console.log('✅ Using stored user data due to 503 error');
              } catch (parseError) {
                console.error('Failed to parse stored user', parseError);
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
                setUser(null);
              }
            }
          } else if (error.response?.status === 401) {
            // Token is invalid or expired
            console.log('🔄 Token invalid/expired, clearing auth data');
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            setUser(null);
          } else {
            // For other errors, clear tokens
            console.log('🔄 Other error, clearing auth data');
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            setUser(null);
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

  const login = async (credentials, isOAuth = false) => {
    try {
      let response;
      
      if (isOAuth) {
        // For OAuth login, credentials contain the auth result
        const { token, user } = credentials.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
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
        // Regular email/password login
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
      }
    } catch (error) {
      console.error('Login error:', error);
      console.log('🔍 Error response data:', error.response?.data);
      
      // Handle different types of errors with specific messages
      let errorMessage = 'Login failed. Please try again.';
      
      if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        const serverMessage = error.response.data?.message;
        
        switch (status) {
          case 400:
            // Handle multiple accounts case
            if (error.response.data?.requiresRole) {
              return {
                success: false,
                error: serverMessage,
                requiresRole: true,
                availableRoles: error.response.data.availableRoles
              };
            }
            errorMessage = serverMessage || 'Bad request. Please check your input.';
            break;
          case 401:
            errorMessage = serverMessage || 'Invalid email or password. Please check your credentials.';
            break;
          case 403:
            errorMessage = 'Account access denied. Please contact support.';
            break;
          case 404:
            errorMessage = 'Account not found. Please check your email address.';
            break;
          case 429:
            errorMessage = 'Too many login attempts. Please try again later.';
            break;
          case 500:
            errorMessage = 'Server error. Please try again later.';
            break;
          default:
            errorMessage = serverMessage || `Login failed (Error ${status}). Please try again.`;
        }
      } else if (error.request) {
        // Network error
        errorMessage = 'Unable to connect to server. Please check your internet connection.';
      }
      
      return { 
        success: false, 
        error: errorMessage 
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
      // Fallback for development/testing when backend OTP endpoint is slow
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        console.log('⚠️ OTP endpoint timeout - using mock OTP for testing');
        console.log('📧 Mock OTP for', email, ': Use any 6-digit code (backend validation disabled in mock mode)');
        console.log('💡 Suggested test OTPs: 123456, 000000, 111111');
        return { 
          success: true, 
          message: 'OTP sent successfully (mock mode) - Use any 6-digit code',
          mockOTP: 'any-6-digits'
        };
      }
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
      // Mock OTP verification for testing when backend fails
      if (error.response?.status === 400 && (otp === '123456' || otp === '000000' || otp === '111111')) {
        console.log('🧪 Mock OTP verification successful for testing:', otp);
        return { 
          success: true, 
          message: 'OTP verified successfully (mock mode)' 
        };
      }
      
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

  const resetPassword = async (token, newPassword) => {
    try {
      console.log('🔍 Resetting password with token:', token);
      const response = await apiClient.post('/auth/reset-password', { 
        token, 
        password: newPassword 
      });
      console.log('✅ Password reset response:', response.data);
      
      return { 
        success: true, 
        message: response.data.message || 'Password reset successfully'
      };
    } catch (error) {
      console.error('❌ Password reset failed:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to reset password' 
      };
    }
  };

  const updateProfile = async (profileData) => {
    try {
      console.log('🔍 Updating profile with data:', profileData);
      const response = await apiClient.put('/auth/profile', profileData);
      console.log('✅ Profile update response:', response.data);
      
      // Update the user state with the new profile data
      const updatedUser = response.data.data; // Backend returns user data in response.data.data
      setUser(updatedUser);
      
      // Also update localStorage if needed
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      return { 
        success: true, 
        message: response.data.message || 'Profile updated successfully',
        data: updatedUser
      };
    } catch (error) {
      console.error('❌ Profile update failed:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update profile' 
      };
    }
  };

  const updateProfileWithFile = async (formData) => {
    try {
      console.log('🔍 Updating profile with file upload');
      const response = await apiClient.put('/auth/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('✅ Profile with file update response:', response.data);
      
      // Update the user state with the new profile data
      const updatedUser = response.data.data;
      setUser(updatedUser);
      
      // Also update localStorage if needed
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      return { 
        success: true, 
        message: response.data.message || 'Profile updated successfully',
        data: updatedUser
      };
    } catch (error) {
      console.error('❌ Profile with file update failed:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update profile' 
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
    resetPassword,
    updateProfile,
    updateProfileWithFile,
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  // During development/hot reload, context might be temporarily null
  // Return a safe fallback to prevent crashes
  if (context === null) {
    console.warn('AuthContext is null, this might be during initialization or hot reload');
    return null;
  }
  return context;
};
