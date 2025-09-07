import React, { useState } from 'react'
import { Link } from 'wouter'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../components/ui/use-toast'
import { Mail, ArrowLeft, Check } from 'lucide-react'

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const { forgotPassword } = useAuth()
  const { toast } = useToast()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter your email address",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    try {
      const result = await forgotPassword(email)
      if (result.success) {
        setSent(true)
        toast({
          title: "Email sent",
          description: "If an account with that email exists, you will receive a password reset email."
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to send reset email",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to send reset email",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border border-gray-100 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Check your email</h2>
            <p className="text-gray-600 mb-6">
              We've sent a password reset link to <strong>{email}</strong>
            </p>
            <p className="text-sm text-gray-500 mb-8">
              Didn't receive the email? Check your spam folder or try again.
            </p>
            
            <div className="space-y-4">
              <button
                onClick={() => setSent(false)}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-2xl font-semibold hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all duration-300"
              >
                Send another email
              </button>
              
              <Link
                to="/login"
                className="w-full inline-flex items-center justify-center py-3 px-6 border border-gray-200 rounded-2xl font-semibold text-gray-700 hover:bg-gray-50 transition-all duration-200"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to login
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-2">🔒 Forgot Password</h2>
          <p className="text-gray-600 text-lg">
            Enter your email address and we'll send you a reset link
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl shadow-2xl border border-gray-100 space-y-6">
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-gray-50/80 border border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-200 text-gray-900 placeholder-gray-500"
                placeholder="Enter your email address"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-2xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105"
            >
              {loading ? '📤 Sending...' : '📤 Send Reset Link'}
            </button>
          </div>

          <div className="text-center">
            <Link
              to="/login"
              className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to login
            </Link>
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

export default ForgotPasswordPage