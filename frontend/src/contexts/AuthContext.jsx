import { createContext, useContext, useState } from 'react'
import { useLocation } from 'wouter'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({
    id: 1,
    name: 'Demo User',
    email: 'demo@finautojobs.com',
    role: 'applicant',
    profileComplete: 85,
    phone: '+91 9876543210',
    location: 'Mumbai, India',
    bio: 'Passionate software developer looking for new opportunities',
    skills: ['JavaScript', 'React', 'Node.js', 'Python'],
    experience_years: 3,
    qualification: 'B.Tech Computer Science',
    linkedin_url: 'https://linkedin.com/in/demo-user',
    github_url: 'https://github.com/demo-user',
    portfolio_url: 'https://demo-user.dev'
  })
  const [loading, setLoading] = useState(false)
  const [, setLocation] = useLocation()

  const login = async (credentials) => {
    try {
      const mockUser = {
        ...user,
        email: credentials.email
      }
      
      setUser(mockUser)
      localStorage.setItem('token', 'demo-token')
      
      // Redirect based on user role
      const dashboardPath = `/${mockUser.role === 'jobseeker' ? 'applicant' : mockUser.role}-dashboard`
      setLocation(dashboardPath)
      
      return { success: true, user: mockUser }
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  const register = async (userData) => {
    try {
      const mockUser = {
        ...user,
        ...userData,
        id: Date.now()
      }

      setUser(mockUser)
      localStorage.setItem('token', 'demo-token')
      
      // Redirect based on user role
      const dashboardPath = `/${mockUser.role === 'jobseeker' ? 'applicant' : mockUser.role}-dashboard`
      setLocation(dashboardPath)
      
      return { success: true, user: mockUser }
    } catch (error) {
      console.error('Registration error:', error)
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
    setLocation('/')
  }

  const updateUser = (updatedUser) => {
    setUser(prev => ({ ...prev, ...updatedUser }))
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
