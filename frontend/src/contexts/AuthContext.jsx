import { createContext, useContext, useState, useEffect } from 'react'
import { useLocation } from 'wouter'
import { useToast } from '../components/ui/use-toast'
import api from '../utils/api'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [, setLocation] = useLocation()
  const { toast } = useToast()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token')
      if (token) {
        const response = await api.getProfile()
        const userData = await response.json()
        setUser(userData.user)
      }
    } catch (error) {
      localStorage.removeItem('token')
    } finally {
      setLoading(false)
    }
  }

  const login = async (credentials) => {
    try {
      console.log('AuthContext: Starting login with email:', credentials.email)
      const response = await api.login(credentials)
      console.log('AuthContext: Login API response received')
      
      const data = await response.json()
      console.log('AuthContext: Login successful:', { ...data, user: { ...data.user, password: undefined } })
      const { token, user } = data

      localStorage.setItem('token', token)
      setUser(user)

      toast({
        title: "🎉 Welcome back!",
        description: `Successfully logged in as ${user.full_name || user.username}`,
        variant: "default"
      })

      // Redirect based on user role
      if (user.role === 'recruiter' || user.role === 'employer') {
        setLocation('/recruiter-dashboard')
      } else {
        setLocation('/applicant-dashboard')
      }

      return { success: true }
    } catch (error) {
      console.error('AuthContext: Login error:', error)
      let errorMessage = 'Login failed. Please try again.'
      
      const errorText = error.message || error.toString()
      
      if (errorText.includes('401')) {
        // Parse specific 401 error messages
        try {
          const errorMatch = errorText.match(/401: (.+)/);
          if (errorMatch) {
            const errorData = JSON.parse(errorMatch[1]);
            if (errorData.field === 'password') {
              errorMessage = 'Incorrect password. Please check your password and try again.'
            } else {
              errorMessage = errorData.message || 'Invalid email or password. Please check your credentials.'
            }
          } else {
            errorMessage = 'Invalid email or password. Please check your credentials.'
          }
        } catch (parseError) {
          errorMessage = 'Invalid email or password. Please check your credentials.'
        }
      } else if (errorText.includes('400')) {
        errorMessage = 'Please fill in both email and password fields.'
      } else if (errorText.includes('403')) {
        errorMessage = 'Please verify your email address before logging in.'
      } else if (errorText.includes('Network') || errorText.includes('fetch')) {
        errorMessage = 'Network error. Please check your connection and try again.'
      }

      toast({
        title: "❌ Login Failed",
        description: errorMessage,
        variant: "destructive"
      })

      return {
        success: false,
        error: errorMessage
      }
    }
  }

  const signup = async (userData) => {
    try {
      console.log('AuthContext: Starting signup with data:', { ...userData, password: '[HIDDEN]' })
      const response = await api.register(userData)
      console.log('AuthContext: API response received')
      
      const data = await response.json()
      console.log('AuthContext: Registration successful:', { ...data, user: { ...data.user, password: undefined } })
      const { token, user } = data

      localStorage.setItem('token', token)
      setUser(user)

      toast({
        title: "🎉 Account Created!",
        description: `Welcome to FinAutoJobs, ${user.full_name || user.username}! Your account has been created successfully.`,
        variant: "default"
      })

      // Redirect based on user role
      if (user.role === 'recruiter' || user.role === 'employer') {
        setLocation('/recruiter-dashboard')
      } else {
        setLocation('/applicant-dashboard')
      }

      return { success: true }
    } catch (error) {
      console.error('AuthContext: Signup error:', error)
      let errorMessage = 'Registration failed. Please try again.'
      
      // Parse error message from the thrown error
      const errorText = error.message || error.toString()
      
      if (errorText.includes('409')) {
        // Parse the actual error message from 409 response
        try {
          const errorMatch = errorText.match(/409: (.+)/);
          if (errorMatch) {
            const errorData = JSON.parse(errorMatch[1]);
            if (errorData.field === 'email') {
              errorMessage = 'An account with this email already exists. Please use a different email or try logging in.'
            } else if (errorData.field === 'username') {
              errorMessage = 'This username is already taken. Please choose a different username.'
            } else if (errorData.field === 'phone') {
              errorMessage = 'An account with this phone number already exists. Please use a different phone number.'
            } else {
              errorMessage = errorData.message || 'Registration failed due to duplicate information.'
            }
          }
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError)
          errorMessage = 'Registration failed. This information may already be in use.'
        }
      } else if (errorText.includes('400')) {
        // Parse specific 400 error messages
        try {
          const errorMatch = errorText.match(/400: (.+)/);
          if (errorMatch) {
            const errorData = JSON.parse(errorMatch[1]);
            if (errorData.field === 'email') {
              errorMessage = 'Please enter a valid email address.'
            } else if (errorData.field === 'password') {
              errorMessage = 'Password must be at least 6 characters long.'
            } else if (errorData.field === 'phone') {
              errorMessage = 'Please enter a valid phone number (10-15 digits).'
            } else {
              errorMessage = errorData.message || 'Please fill in all required fields correctly.'
            }
          } else {
            errorMessage = 'Please fill in all required fields correctly.'
          }
        } catch (parseError) {
          errorMessage = 'Please fill in all required fields correctly.'
        }
      } else if (errorText.includes('Network') || errorText.includes('fetch')) {
        errorMessage = 'Network error. Please check your connection and try again.'
      }

      toast({
        title: "❌ Registration Failed",
        description: errorMessage,
        variant: "destructive"
      })

      return {
        success: false,
        error: errorMessage
      }
    }
  }

  const sendEmailOTP = async (email) => {
    try {
      const response = await api.sendEmailOTP(email)
      const data = await response.json()
      return { success: true, data }
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to send email OTP'
      }
    }
  }

  const verifyEmailOTP = async (email, otp) => {
    try {
      const response = await api.verifyEmailOTP(email, otp)
      const data = await response.json()
      return { success: true, data }
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to verify email OTP'
      }
    }
  }

  const sendSMSOTP = async (phone) => {
    try {
      const response = await api.sendSMSOTP(phone)
      const data = await response.json()
      return { success: true, data }
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to send SMS OTP'
      }
    }
  }

  const verifySMSOTP = async (phone, otp) => {
    try {
      const response = await api.verifySMSOTP(phone, otp)
      const data = await response.json()
      return { success: true, data }
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to verify SMS OTP'
      }
    }
  }

  const forgotPassword = async (email) => {
    try {
      const response = await api.forgotPassword(email)
      const data = await response.json()
      return { success: true, data }
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to send reset email'
      }
    }
  }

  const resetPassword = async (token, newPassword) => {
    try {
      const response = await api.resetPassword(token, newPassword)
      const data = await response.json()
      return { success: true, data }
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to reset password'
      }
    }
  }

  const logout = async () => {
    try {
      await api.logout()
      localStorage.removeItem('token')
      setUser(null)
      toast({
        title: "👋 See you later!",
        description: "You have been logged out successfully",
        variant: "default"
      })
      setLocation('/login')
    } catch (error) {
      console.error('Logout error:', error)
      // Still logout locally even if server request fails
      localStorage.removeItem('token')
      setUser(null)
      toast({
        title: "👋 Logged out",
        description: "You have been logged out locally",
        variant: "default"
      })
      setLocation('/login')
    }
  }

  const updateProfile = async (profileData) => {
    try {
      const response = await api.updateProfile(profileData)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update profile')
      }
      
      const data = await response.json()
      setUser(data.user)
      toast({
        title: "✅ Profile Updated",
        description: "Your profile has been updated successfully",
        variant: "default"
      })
      return { success: true }
    } catch (error) {
      let errorMessage = 'Failed to update profile. Please try again.'
      
      if (error.message.includes('Network')) {
        errorMessage = 'Network error. Please check your connection and try again.'
      } else if (error.message.includes('Unauthorized')) {
        errorMessage = 'Session expired. Please log in again.'
      }

      toast({
        title: "❌ Update Failed",
        description: errorMessage,
        variant: "destructive"
      })

      return {
        success: false,
        error: errorMessage
      }
    }
  }

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    updateProfile,
    sendEmailOTP,
    verifyEmailOTP,
    sendSMSOTP,
    verifySMSOTP,
    forgotPassword,
    resetPassword,
    isAuthenticated: !!user,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
