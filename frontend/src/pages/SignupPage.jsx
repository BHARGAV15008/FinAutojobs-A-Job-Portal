import React, { useState } from 'react'
import { Link, useLocation } from 'wouter'
import API_BASE_URL, { SOCKET_URL } from '../services/apiConfig'
import { useAuth } from '../contexts/AuthContext.jsx';
import { useToast } from '../components/ui/use-toast'
import { Eye, EyeOff, Mail, Lock, User, Building2, Car, Calculator, TrendingUp, Shield, Users, Phone } from 'lucide-react'
import OAuthPopup from '../components/auth/OAuthPopup'
import PhoneVerification from '../components/auth/PhoneVerification'

const SignupPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    role: 'job_seeker'
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [oauthPopupOpen, setOauthPopupOpen] = useState(false)
  const [phoneVerificationOpen, setPhoneVerificationOpen] = useState(false)
  const [registrationStep, setRegistrationStep] = useState('form') // 'form', 'phone-verify', 'complete'
  const { signup } = useAuth()
  const { toast } = useToast()
  const [, setLocation] = useLocation()

  const handleOAuthSuccess = (result) => {
    // Handle successful OAuth signup
    if (result.user) {
      setLocation('/dashboard')
    }
  }

  const handleOAuthSignup = (provider) => {
    // Get role from URL params or form data
    const urlParams = new URLSearchParams(window.location.search)
    const roleFromUrl = urlParams.get('role')
    const role = roleFromUrl || formData.role
    
    // Open OAuth popup with role parameter
    const oauthUrl = `${API_BASE_URL}/oauth/${provider}?role=${role}`
    const popup = window.open(
      oauthUrl,
      'oauth-popup',
      'width=500,height=600,scrollbars=yes,resizable=yes'
    )

    // Listen for popup messages
    const messageListener = (event) => {
      if (event.origin !== SOCKET_URL) return

      if (event.data.type === 'OAUTH_SUCCESS') {
        popup.close()
        window.removeEventListener('message', messageListener)
        
        toast({
          title: "Success",
          description: "Account created successfully!"
        })
        
        // Redirect based on role
        if (role === 'employer') {
          setLocation('/employer-dashboard')
        } else {
          setLocation('/applicant-dashboard')
        }
      } else if (event.data.type === 'OAUTH_ERROR') {
        popup.close()
        window.removeEventListener('message', messageListener)
        
        toast({
          title: "Error",
          description: event.data.error || "OAuth signup failed",
          variant: "destructive"
        })
      }
    }

    window.addEventListener('message', messageListener)

    // Check if popup was closed manually
    const checkClosed = setInterval(() => {
      if (popup.closed) {
        clearInterval(checkClosed)
        window.removeEventListener('message', messageListener)
      }
    }, 1000)
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      // Send the data in the format backend expects
      const signupData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        full_name: formData.full_name,
        role: formData.role
      }

      const result = await signup(signupData)
      if (result.success) {
        toast({
          title: "Success",
          description: "Account created successfully!"
        })
        // Redirect based on role
        if (formData.role === 'employer') {
          setLocation('/employer-dashboard')
        } else {
          setLocation('/applicant-dashboard')
        }
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to create account",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to create account",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePhoneSignup = () => {
    // Open phone verification for signup
    setPhoneVerificationOpen(true)
  }

  const handlePhoneVerificationSuccess = (authResult) => {
    console.log('Phone verification success during signup:', authResult)
    
    // Store token if provided
    if (authResult.token) {
      localStorage.setItem('token', authResult.token)
    }
    
    // Redirect based on user role
    const role = authResult.user.role || 'applicant'
    if (role === 'recruiter' || role === 'employer') {
      setLocation('/recruiter-dashboard')
    } else {
      setLocation('/applicant-dashboard')
    }
    
    toast({
      title: "Registration Successful!",
      description: "Your account has been created and phone number verified.",
      variant: "default"
    })
  }

  const handlePhoneVerificationError = (error) => {
    console.error('Phone verification error during signup:', error)
    toast({
      title: "Phone Verification Failed",
      description: error.message || "Failed to verify phone number. Please try again.",
      variant: "destructive"
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <div className="mb-8">
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              🚀 FinAutoJobs
            </h1>
            <p className="text-xl text-blue-100 leading-relaxed">
              Join the premier platform connecting talent with opportunities in Finance & Automotive industries
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 p-3 rounded-xl">
                <Calculator className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">💼 Finance Roles</h3>
                <p className="text-blue-100">Investment Banking, Financial Analysis, Risk Management</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="bg-white/20 p-3 rounded-xl">
                <Car className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">🚗 Automotive Careers</h3>
                <p className="text-blue-100">Engineering, Manufacturing, Sales & Marketing</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="bg-white/20 p-3 rounded-xl">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">📈 Career Growth</h3>
                <p className="text-blue-100">Premium opportunities with top-tier companies</p>
              </div>
            </div>
          </div>

          <div className="mt-12 flex items-center space-x-8">
            <div className="text-center">
              <div className="text-3xl font-bold">50K+</div>
              <div className="text-blue-100">Active Jobs</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">25K+</div>
              <div className="text-blue-100">Companies</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">100K+</div>
              <div className="text-blue-100">Professionals</div>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-purple-300/20 rounded-full blur-lg"></div>
        <div className="absolute top-1/2 right-10 w-16 h-16 bg-blue-300/20 rounded-full blur-md"></div>
      </div>

      {/* Right Side - Signup Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-gray-900 mb-2">🎉 Join Us!</h2>
            <p className="text-gray-600 text-lg">Create your account and start your career journey</p>
            <p className="mt-4 text-sm text-gray-500">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                Sign in here
              </Link>
            </p>
          </div>

          {/* OAuth Buttons */}
          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl shadow-2xl border border-gray-100 mb-6">
            <p className="text-center text-sm font-semibold text-gray-700 mb-4">
              Quick sign up with:
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => handleOAuthSignup('google')}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors duration-200 text-gray-700 font-medium"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </button>
              <button
                type="button"
                onClick={() => handleOAuthSignup('microsoft')}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors duration-200 text-gray-700 font-medium"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#F25022" d="M11.4 11.4H0V0h11.4v11.4z"/>
                  <path fill="#00A4EF" d="M24 11.4H12.6V0H24v11.4z"/>
                  <path fill="#7FBA00" d="M11.4 24H0V12.6h11.4V24z"/>
                  <path fill="#FFB900" d="M24 24H12.6V12.6H24V24z"/>
                </svg>
                Microsoft
              </button>
              <button
                type="button"
                onClick={() => handleOAuthSignup('apple')}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors duration-200 text-gray-700 font-medium"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                Apple
              </button>
            </div>

            {/* Phone Verification Button */}
            <div className="mt-4">
              <button
                type="button"
                onClick={handlePhoneSignup}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-blue-500 rounded-xl hover:bg-blue-50 transition-colors duration-200 text-blue-600 font-semibold"
              >
                <Phone className="w-5 h-5" />
                Sign up with Phone Number
              </button>
            </div>
          </div>

          <div className="text-center">
            <span className="text-gray-500 text-sm">or continue with email</span>
          </div>

          <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border border-gray-100 space-y-6">
            {/* Full Name Field */}
            <div>
              <label htmlFor="full_name" className="block text-sm font-semibold text-gray-700 mb-2">
                👤 Full Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  required
                  value={formData.full_name}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50/80 border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-500"
                  placeholder="Enter your full name"
                />
              </div>
            </div>

            {/* Username Field */}
            <div>
              <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">
                🏷️ Username
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="username"
                  name="username"
                  type="text"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50/80 border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-500"
                  placeholder="Enter your username (optional)"
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                📧 Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50/80 border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-500"
                  placeholder="Enter your email address"
                />
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label htmlFor="role" className="block text-sm font-semibold text-gray-700 mb-2">
                🎯 I am a
              </label>
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-4 bg-gray-50/80 border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 text-gray-900"
              >
                <option value="job_seeker">🔍 Job Seeker</option>
                <option value="employer">🏢 Employer / Recruiter</option>
              </select>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                🔒 Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-12 pr-12 py-4 bg-gray-50/80 border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-500"
                  placeholder="Create a strong password"
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
                🔐 Confirm Password
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
                  placeholder="Confirm your password"
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

            {/* Terms and Conditions */}
            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded-lg"
              />
              <label htmlFor="terms" className="ml-3 block text-sm font-medium text-gray-700">
                📋 I agree to the{' '}
                <Link to="/terms-of-service" className="text-blue-600 hover:text-blue-700 font-semibold">
                  Terms & Conditions
                </Link>{' '}
                and{' '}
                <Link to="/privacy-policy" className="text-blue-600 hover:text-blue-700 font-semibold">
                  Privacy Policy
                </Link>
              </label>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-2xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105"
              >
                {loading ? '🔄 Creating Account...' : '🎉 Create Account'}
              </button>
            </div>
          </form>

          {/* Social Signup */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium">✨ Or sign up with</span>
              </div>
            </div>

            <button 
              onClick={() => setOauthPopupOpen(true)}
              className="w-full inline-flex justify-center items-center py-3 px-4 border border-gray-200 rounded-xl shadow-sm bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 hover:shadow-md"
            >
              Continue with Social Login
            </button>
          </div>
        </div>
      </div>

      {/* OAuth Popup */}
      <OAuthPopup
        open={oauthPopupOpen}
        onClose={() => setOauthPopupOpen(false)}
        onSuccess={handleOAuthSuccess}
        title="Sign up for FinAutoJobs"
      />

      {/* Phone Verification Dialog */}
      <PhoneVerification
        open={phoneVerificationOpen}
        onClose={() => setPhoneVerificationOpen(false)}
        onSuccess={handlePhoneVerificationSuccess}
        onError={handlePhoneVerificationError}
        userRole="applicant"
        isRegistration={true}
      />
    </div>
  )
}

export default SignupPage