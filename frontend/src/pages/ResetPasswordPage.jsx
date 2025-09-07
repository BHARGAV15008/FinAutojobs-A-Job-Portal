import React, { useState, useEffect } from 'react'
import { Link, useLocation } from 'wouter'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../components/ui/use-toast'
import { Lock, Eye, EyeOff, Shield, CheckCircle } from 'lucide-react'

const ResetPasswordPage = () => {
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [token, setToken] = useState('')
  const { resetPassword } = useAuth()
  const { toast } = useToast()
  const [, setLocation] = useLocation()

  useEffect(() => {
    // Get token from URL parameters
    const urlParams = new URLSearchParams(window.location.search)
    const resetToken = urlParams.get('token')
    
    if (!resetToken) {
      toast({
        title: "Error",
        description: "Invalid reset link. Please request a new password reset.",
        variant: "destructive"
      })
      setLocation('/forgot-password')
      return
    }
    
    setToken(resetToken)
  }, [toast, setLocation])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.newPassword || !formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      })
      return
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive"
      })
      return
    }

    if (formData.newPassword.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters long",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      const result = await resetPassword(token, formData.newPassword)
      if (result.success) {
        setSuccess(true)
        toast({
          title: "Success",
          description: "Password reset successfully!"
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to reset password",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to reset password",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border border-gray-100 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Password Reset Successfully!</h2>
            <p className="text-gray-600 mb-8">
              Your password has been reset. You can now sign in with your new password.
            </p>
            
            <Link
              to="/login"
              className="w-full inline-flex items-center justify-center bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-2xl font-semibold hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all duration-300"
            >
              Sign In Now
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-2">🔐 Reset Password</h2>
          <p className="text-gray-600 text-lg">
            Enter your new password below
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border border-gray-100 space-y-6">
          {/* New Password Field */}
          <div>
            <label htmlFor="newPassword" className="block text-sm font-semibold text-gray-700 mb-2">
              🔒 New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                id="newPassword"
                name="newPassword"
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.newPassword}
                onChange={handleChange}
                className="w-full pl-12 pr-12 py-4 bg-gray-50/80 border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-500"
                placeholder="Enter your new password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors duration-200"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Confirm Password Field */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
              🔐 Confirm New Password
            </label>
            <div className="relative">
              <Shield className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full pl-12 pr-12 py-4 bg-gray-50/80 border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-500"
                placeholder="Confirm your new password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors duration-200"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Password Requirements */}
          <div className="bg-blue-50 p-4 rounded-xl">
            <h4 className="text-sm font-semibold text-blue-900 mb-2">Password Requirements:</h4>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• At least 8 characters long</li>
              <li>• Include uppercase and lowercase letters</li>
              <li>• Include at least one number</li>
              <li>• Use a strong, unique password</li>
            </ul>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-2xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105"
            >
              {loading ? '🔄 Resetting...' : '🔐 Reset Password'}
            </button>
          </div>
        </form>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            Remember your password?{' '}
            <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default ResetPasswordPage