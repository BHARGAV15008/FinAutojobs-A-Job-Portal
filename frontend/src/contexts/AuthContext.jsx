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
      setLocation('/')

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Login failed'
      }
    }
  }

  const register = async (userData) => {
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
      setLocation('/')

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Registration failed'
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
    register,
    logout,
    updateProfile,
    isAuthenticated: !!user,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
