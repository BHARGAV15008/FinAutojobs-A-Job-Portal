import React, { createContext, useContext, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';

const OAuthContext = createContext();

export const useOAuth = () => {
  const context = useContext(OAuthContext);
  if (!context) {
    throw new Error('useOAuth must be used within an OAuthProvider');
  }
  return context;
};

export const OAuthProvider = ({ children }) => {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Google OAuth login
  const loginWithGoogle = useCallback(async (role = 'jobseeker') => {
    setLoading(true);
    setError(null);

    try {
      // Load Google Identity Services
      if (!window.google) {
        throw new Error('Google Identity Services not loaded');
      }

      return new Promise((resolve, reject) => {
        window.google.accounts.id.initialize({
          client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
          callback: async (response) => {
            try {
              // Send the credential to backend
              const result = await fetch('/api/oauth/google', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  token: response.credential,
                  role: role
                })
              });

              const data = await result.json();

              if (!result.ok) {
                throw new Error(data.message || 'Google login failed');
              }

              // Use existing auth context login
              await login(data.user, data.token, data.refreshToken);
              setLoading(false);
              resolve(data);
            } catch (error) {
              setError(error.message);
              setLoading(false);
              reject(error);
            }
          }
        });

        // Trigger the sign-in flow
        window.google.accounts.id.prompt();
      });
    } catch (error) {
      setError(error.message);
      setLoading(false);
      throw error;
    }
  }, [login]);

  // Microsoft OAuth login
  const loginWithMicrosoft = useCallback(async (role = 'jobseeker') => {
    setLoading(true);
    setError(null);

    try {
      // Load Microsoft Authentication Library
      if (!window.msal) {
        throw new Error('Microsoft Authentication Library not loaded');
      }

      const msalInstance = new window.msal.PublicClientApplication({
        auth: {
          clientId: process.env.REACT_APP_MICROSOFT_CLIENT_ID,
          authority: 'https://login.microsoftonline.com/common',
          redirectUri: window.location.origin
        }
      });

      const loginRequest = {
        scopes: ['User.Read']
      };

      const response = await msalInstance.loginPopup(loginRequest);
      
      // Send the access token to backend
      const result = await fetch('/api/oauth/microsoft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: response.accessToken,
          role: role
        })
      });

      const data = await result.json();

      if (!result.ok) {
        throw new Error(data.message || 'Microsoft login failed');
      }

      // Use existing auth context login
      await login(data.user, data.token, data.refreshToken);
      setLoading(false);
      return data;
    } catch (error) {
      setError(error.message);
      setLoading(false);
      throw error;
    }
  }, [login]);

  // Apple OAuth login
  const loginWithApple = useCallback(async (role = 'jobseeker') => {
    setLoading(true);
    setError(null);

    try {
      // Load Apple ID SDK
      if (!window.AppleID) {
        throw new Error('Apple ID SDK not loaded');
      }

      const response = await window.AppleID.auth.signIn({
        clientId: process.env.REACT_APP_APPLE_CLIENT_ID,
        redirectURI: window.location.origin,
        scope: 'name email',
        responseType: 'code id_token',
        responseMode: 'web_message',
        usePopup: true
      });

      // Send the identity token to backend
      const result = await fetch('/api/oauth/apple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identityToken: response.authorization.id_token,
          authorizationCode: response.authorization.code,
          role: role
        })
      });

      const data = await result.json();

      if (!result.ok) {
        throw new Error(data.message || 'Apple login failed');
      }

      // Use existing auth context login
      await login(data.user, data.token, data.refreshToken);
      setLoading(false);
      return data;
    } catch (error) {
      setError(error.message);
      setLoading(false);
      throw error;
    }
  }, [login]);

  // Get OAuth configuration
  const getOAuthConfig = useCallback(async () => {
    try {
      const response = await fetch('/api/oauth/config');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to get OAuth config');
      }
      
      return data;
    } catch (error) {
      console.error('OAuth config error:', error);
      return {
        google: { enabled: false },
        microsoft: { enabled: false },
        apple: { enabled: false }
      };
    }
  }, []);

  const value = {
    loading,
    error,
    loginWithGoogle,
    loginWithMicrosoft,
    loginWithApple,
    getOAuthConfig,
    clearError: () => setError(null)
  };

  return (
    <OAuthContext.Provider value={value}>
      {children}
    </OAuthContext.Provider>
  );
};
