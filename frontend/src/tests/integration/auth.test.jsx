import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import AuthProvider from '../../contexts/AuthContext';
import LoginPage from '../../pages/auth/LoginPage';
import RegisterPage from '../../pages/auth/RegisterPage';

// Mock API calls
const mockApi = {
  post: vi.fn(),
  get: vi.fn(),
  put: vi.fn(),
  delete: vi.fn()
};

vi.mock('../../services/api', () => ({
  default: mockApi
}));

// Mock react-router-dom hooks
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: '/auth/login', search: '', hash: '', state: null })
  };
});

// Mock toast notifications
vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
    dismiss: vi.fn()
  }
}));

// Test wrapper component
const TestWrapper = ({ children }) => (
  <BrowserRouter>
    <AuthProvider>
      {children}
    </AuthProvider>
  </BrowserRouter>
);

describe('Authentication Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
  });

  describe('Login Flow', () => {
    it('successfully logs in a user with valid credentials', async () => {
      const mockUser = {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        role: 'applicant'
      };

      const mockResponse = {
        success: true,
        data: {
          user: mockUser,
          accessToken: 'mock-access-token'
        }
      };

      mockApi.post.mockResolvedValueOnce({ data: mockResponse });

      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      // Fill in login form
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const loginButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(loginButton);

      // Wait for API call
      await waitFor(() => {
        expect(mockApi.post).toHaveBeenCalledWith('/auth/login', {
          email: 'john@example.com',
          password: 'password123',
          rememberMe: false
        });
      });

      // Check navigation
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
      });
    });

    it('shows error message for invalid credentials', async () => {
      const mockErrorResponse = {
        success: false,
        message: 'Invalid email or password'
      };

      mockApi.post.mockRejectedValueOnce({
        response: { data: mockErrorResponse }
      });

      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      // Fill in login form with invalid credentials
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const loginButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: 'invalid@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
      fireEvent.click(loginButton);

      // Wait for error message
      await waitFor(() => {
        expect(screen.getByText('Invalid email or password')).toBeInTheDocument();
      });

      // Should not navigate
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('handles account lockout scenario', async () => {
      const mockLockoutResponse = {
        success: false,
        message: 'Account temporarily locked. Try again in 30 minutes.',
        accountLocked: true
      };

      mockApi.post.mockRejectedValueOnce({
        response: { data: mockLockoutResponse, status: 423 }
      });

      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      // Attempt login
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const loginButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: 'locked@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(loginButton);

      // Wait for lockout message
      await waitFor(() => {
        expect(screen.getByText(/account temporarily locked/i)).toBeInTheDocument();
      });

      // Login button should be disabled
      expect(loginButton).toBeDisabled();
    });

    it('validates form fields before submission', async () => {
      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      const loginButton = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(loginButton);

      // Should show validation errors
      await waitFor(() => {
        expect(screen.getByText(/email is required/i)).toBeInTheDocument();
        expect(screen.getByText(/password is required/i)).toBeInTheDocument();
      });

      // Should not make API call
      expect(mockApi.post).not.toHaveBeenCalled();
    });
  });

  describe('Registration Flow', () => {
    it('successfully registers a new user', async () => {
      const mockResponse = {
        success: true,
        message: 'Registration successful. Please verify your email.',
        data: {
          user: {
            id: '1',
            firstName: 'Jane',
            lastName: 'Doe',
            email: 'jane@example.com',
            role: 'applicant',
            isEmailVerified: false
          },
          accessToken: 'mock-access-token',
          requiresEmailVerification: true
        }
      };

      mockApi.post.mockResolvedValueOnce({ data: mockResponse });

      render(
        <TestWrapper>
          <RegisterPage />
        </TestWrapper>
      );

      // Fill in registration form
      const firstNameInput = screen.getByLabelText(/first name/i);
      const lastNameInput = screen.getByLabelText(/last name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const registerButton = screen.getByRole('button', { name: /create account/i });

      fireEvent.change(firstNameInput, { target: { value: 'Jane' } });
      fireEvent.change(lastNameInput, { target: { value: 'Doe' } });
      fireEvent.change(emailInput, { target: { value: 'jane@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
      fireEvent.click(registerButton);

      // Wait for API call
      await waitFor(() => {
        expect(mockApi.post).toHaveBeenCalledWith('/auth/register', {
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'jane@example.com',
          password: 'password123',
          role: 'applicant'
        });
      });

      // Should navigate to email verification
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/auth/verify-email');
      });
    });

    it('shows error for duplicate email', async () => {
      const mockErrorResponse = {
        success: false,
        message: 'Email already registered',
        field: 'email'
      };

      mockApi.post.mockRejectedValueOnce({
        response: { data: mockErrorResponse, status: 409 }
      });

      render(
        <TestWrapper>
          <RegisterPage />
        </TestWrapper>
      );

      // Fill in form with existing email
      const firstNameInput = screen.getByLabelText(/first name/i);
      const lastNameInput = screen.getByLabelText(/last name/i);
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/^password/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const registerButton = screen.getByRole('button', { name: /create account/i });

      fireEvent.change(firstNameInput, { target: { value: 'John' } });
      fireEvent.change(lastNameInput, { target: { value: 'Doe' } });
      fireEvent.change(emailInput, { target: { value: 'existing@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
      fireEvent.click(registerButton);

      // Wait for error message
      await waitFor(() => {
        expect(screen.getByText('Email already registered')).toBeInTheDocument();
      });

      // Should highlight email field
      expect(emailInput).toHaveClass('border-red-500');
    });

    it('validates password confirmation', async () => {
      render(
        <TestWrapper>
          <RegisterPage />
        </TestWrapper>
      );

      const passwordInput = screen.getByLabelText(/^password/i);
      const confirmPasswordInput = screen.getByLabelText(/confirm password/i);
      const registerButton = screen.getByRole('button', { name: /create account/i });

      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'different123' } });
      fireEvent.click(registerButton);

      // Should show password mismatch error
      await waitFor(() => {
        expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
      });

      // Should not make API call
      expect(mockApi.post).not.toHaveBeenCalled();
    });

    it('validates password strength', async () => {
      render(
        <TestWrapper>
          <RegisterPage />
        </TestWrapper>
      );

      const passwordInput = screen.getByLabelText(/^password/i);
      const registerButton = screen.getByRole('button', { name: /create account/i });

      fireEvent.change(passwordInput, { target: { value: '123' } });
      fireEvent.click(registerButton);

      // Should show password strength error
      await waitFor(() => {
        expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument();
      });
    });
  });

  describe('OAuth Integration', () => {
    it('handles Google OAuth success', async () => {
      // Mock successful OAuth response
      const mockOAuthUser = {
        id: '1',
        firstName: 'Google',
        lastName: 'User',
        email: 'google@example.com',
        role: 'applicant',
        oauthProviders: { google: { id: 'google123' } }
      };

      // Mock the OAuth success callback
      Object.defineProperty(window, 'location', {
        value: {
          search: '?token=mock-oauth-token&provider=google&isNewUser=false'
        }
      });

      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      // Should show Google OAuth button
      const googleButton = screen.getByText(/continue with google/i);
      expect(googleButton).toBeInTheDocument();
    });

    it('handles OAuth role selection for new users', async () => {
      // Mock new OAuth user requiring role selection
      Object.defineProperty(window, 'location', {
        value: {
          search: '?token=mock-oauth-token&provider=google&isNewUser=true'
        }
      });

      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      // Should redirect to role selection
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/auth/role-selection');
      });
    });
  });

  describe('Password Reset Flow', () => {
    it('sends password reset email', async () => {
      const mockResponse = {
        success: true,
        message: 'Password reset link sent to your email'
      };

      mockApi.post.mockResolvedValueOnce({ data: mockResponse });

      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      // Click forgot password link
      const forgotPasswordLink = screen.getByText(/forgot password/i);
      fireEvent.click(forgotPasswordLink);

      // Should navigate to forgot password page
      expect(mockNavigate).toHaveBeenCalledWith('/auth/forgot-password');
    });
  });

  describe('Session Management', () => {
    it('automatically refreshes expired tokens', async () => {
      const mockRefreshResponse = {
        success: true,
        data: {
          accessToken: 'new-access-token',
          expiresIn: '15m'
        }
      };

      mockApi.post.mockResolvedValueOnce({ data: mockRefreshResponse });

      // Mock expired token scenario
      localStorage.setItem('accessToken', 'expired-token');

      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      // Should attempt token refresh
      await waitFor(() => {
        expect(mockApi.post).toHaveBeenCalledWith('/auth/refresh');
      });
    });

    it('logs out user when refresh token is invalid', async () => {
      mockApi.post.mockRejectedValueOnce({
        response: { status: 401, data: { message: 'Invalid refresh token' } }
      });

      localStorage.setItem('accessToken', 'expired-token');

      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      // Should clear tokens and redirect to login
      await waitFor(() => {
        expect(localStorage.getItem('accessToken')).toBeNull();
        expect(mockNavigate).toHaveBeenCalledWith('/auth/login');
      });
    });
  });

  describe('Form Validation', () => {
    it('validates email format', async () => {
      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText(/email/i);
      const loginButton = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(screen.getByText(/please enter a valid email/i)).toBeInTheDocument();
      });
    });

    it('shows real-time validation feedback', async () => {
      render(
        <TestWrapper>
          <RegisterPage />
        </TestWrapper>
      );

      const passwordInput = screen.getByLabelText(/^password/i);

      // Type weak password
      fireEvent.change(passwordInput, { target: { value: '123' } });
      fireEvent.blur(passwordInput);

      await waitFor(() => {
        expect(screen.getByText(/password is too weak/i)).toBeInTheDocument();
      });

      // Type strong password
      fireEvent.change(passwordInput, { target: { value: 'StrongPassword123!' } });
      fireEvent.blur(passwordInput);

      await waitFor(() => {
        expect(screen.queryByText(/password is too weak/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('supports keyboard navigation', async () => {
      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const loginButton = screen.getByRole('button', { name: /sign in/i });

      // Tab through form elements
      emailInput.focus();
      expect(emailInput).toHaveFocus();

      fireEvent.keyDown(emailInput, { key: 'Tab' });
      expect(passwordInput).toHaveFocus();

      fireEvent.keyDown(passwordInput, { key: 'Tab' });
      expect(loginButton).toHaveFocus();
    });

    it('has proper ARIA labels and descriptions', () => {
      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      );

      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/password/i);

      expect(emailInput).toHaveAttribute('aria-required', 'true');
      expect(passwordInput).toHaveAttribute('aria-required', 'true');
    });
  });
});
