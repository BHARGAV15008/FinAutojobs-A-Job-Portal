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
      const response = await api.login(credentials)
      const data = await response.json()
      const { token, user } = data

      localStorage.setItem('token', token)
      setUser(user)

      toast({
        title: "Success",
        description: "Login successful!"
      })

      // Redirect based on user role
      if (user.role === 'recruiter' || user.role === 'employer') {
        setLocation('/recruiter-dashboard')
      } else {
        setLocation('/applicant-dashboard')
      }

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Login failed'
      }
    }
  }

  const signup = async (userData) => {
    try {
      const response = await api.register(userData)
      const data = await response.json()
      const { token, user } = data

      localStorage.setItem('token', token)
      setUser(user)

      toast({
        title: "Success",
        description: "Registration successful!"
      })

      // Redirect based on user role
      if (user.role === 'recruiter' || user.role === 'employer') {
        setLocation('/recruiter-dashboard')
      } else {
        setLocation('/applicant-dashboard')
      }

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Registration failed'
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

  const logout = async () => {
    try {
      await api.logout()
      localStorage.removeItem('token')
      setUser(null)
      toast({
        title: "Success",
        description: "Logged out successfully"
      })
      setLocation('/login')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const updateProfile = async (profileData) => {
    try {
      const response = await api.updateProfile(profileData)
      const data = await response.json()
      setUser(data.user)
      toast({
        title: "Success",
        description: "Profile updated successfully"
      })
      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to update profile'
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
    isAuthenticated: !!user,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
