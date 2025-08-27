import { useState } from 'react'
import { Link, useLocation } from 'wouter'
import { useAuth } from '../contexts/AuthContext'
import { Eye, EyeOff, Mail, Lock, Building2, Car, Calculator, TrendingUp, Shield, Users, User, Briefcase } from 'lucide-react'
import { useToast } from '../components/ui/use-toast'

const LoginPage = () => {
  const [activeTab, setActiveTab] = useState('applicant')
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()
  const [, setLocation] = useLocation()
  const { toast } = useToast()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const result = await login(formData)
    if (!result.success) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive"
      })
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="mb-12">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Building2 className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">FinAutoJobs</h1>
                <p className="text-blue-100">Premium Career Platform</p>
              </div>
            </div>

            <h2 className="text-4xl font-bold mb-6 leading-tight">
              Connect with Top Finance & Automotive Companies
            </h2>
            <p className="text-xl text-blue-100 mb-12 leading-relaxed">
              Join thousands of professionals who've found their dream careers in finance and automotive industries.
            </p>

            <div className="grid grid-cols-2 gap-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Calculator className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold">Finance Roles</h3>
                  <p className="text-sm text-blue-100">Investment Banking, Fintech, Trading</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Car className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold">Automotive Jobs</h3>
                  <p className="text-sm text-blue-100">Engineering, Design, Manufacturing</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold">Career Growth</h3>
                  <p className="text-sm text-blue-100">Premium opportunities</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <Shield className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold">Trusted Platform</h3>
                  <p className="text-sm text-blue-100">Verified companies only</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-purple-300/20 rounded-full blur-lg"></div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 flex flex-col justify-center px-8 sm:px-12 lg:px-16 xl:px-20">
        <div className="w-full max-w-md mx-auto">
          <div className="text-center mb-12">
            <div className="lg:hidden flex justify-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
                <Building2 className="h-8 w-8 text-white" />
              </div>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Welcome Back! 👋
            </h2>
            <p className="text-lg text-gray-600">
              Sign in to access premium job opportunities
            </p>
            <p className="mt-4 text-sm text-gray-500">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                Create one here
              </Link>
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl shadow-blue-500/10 border border-white/20 overflow-hidden">
            {/* Role Tabs */}
            <div className="flex bg-gray-50/80">
              <button
                type="button"
                onClick={() => setActiveTab('applicant')}
                className={`flex-1 py-4 px-6 text-center font-semibold transition-all duration-300 ${activeTab === 'applicant'
                    ? 'bg-white text-blue-600 shadow-sm border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-white/50'
                  }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <User className="w-5 h-5" />
                  <span>Applicant</span>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('recruiter')}
                className={`flex-1 py-4 px-6 text-center font-semibold transition-all duration-300 ${activeTab === 'recruiter'
                    ? 'bg-white text-blue-600 shadow-sm border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-white/50'
                  }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  <span>Recruiter / HR</span>
                </div>
              </button>
            </div>

            <form className="space-y-8 p-10" onSubmit={handleSubmit}>
              <div>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:bg-white transition-all duration-300 text-gray-900 placeholder-gray-500 font-medium shadow-sm hover:shadow-md"
                    placeholder="📧 Enter your username or email"
                  />
                </div>
              </div>

              <div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-12 pr-12 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:border-blue-500 focus:bg-white transition-all duration-300 text-gray-900 placeholder-gray-500 font-medium shadow-sm hover:shadow-md"
                    placeholder="🔒 Enter your password"
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

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded-lg"
                  />
                  <label htmlFor="remember-me" className="ml-3 block text-sm font-medium text-gray-700">
                    💾 Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <a href="#" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                    🔑 Forgot password?
                  </a>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-2xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105"
                >
                  {loading ? '🔄 Signing in...' : '🚀 Sign In'}
                </button>
              </div>
            </form>

            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500 font-medium">✨ Or continue with</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-3 gap-3">
                <button className="w-full inline-flex justify-center items-center py-3 px-3 border border-gray-200 rounded-xl shadow-sm bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 hover:shadow-md">
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Google
                </button>

                <button className="w-full inline-flex justify-center items-center py-3 px-3 border border-gray-200 rounded-xl shadow-sm bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 hover:shadow-md">
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M23.64 11.2c-.45-.07-.84-.15-1.18-.27-.34-.12-.62-.27-.84-.45s-.39-.39-.51-.63c-.12-.24-.18-.51-.18-.81V4.5c0-.69-.56-1.25-1.25-1.25H18.5c-.69 0-1.25.56-1.25 1.25v4.54c0 .3-.06.57-.18.81-.12.24-.29.45-.51.63s-.5.33-.84.45c-.34.12-.73.2-1.18.27-.45.07-.93.1-1.44.1s-.99-.03-1.44-.1c-.45-.07-.84-.15-1.18-.27-.34-.12-.62-.27-.84-.45s-.39-.39-.51-.63c-.12-.24-.18-.51-.18-.81V4.5c0-.69-.56-1.25-1.25-1.25H6.5c-.69 0-1.25.56-1.25 1.25v4.54c0 .3-.06.57-.18.81-.12.24-.29.45-.51.63s-.5.33-.84.45c-.34.12-.73.2-1.18.27-.45.07-.93.1-1.44.1s-.99-.03-1.44-.1z" fill="#00BCF2" />
                    <path d="M11.03 1.68c-.69-.69-1.8-.69-2.49 0L.46 9.76c-.69.69-.69 1.8 0 2.49l8.08 8.08c.69.69 1.8.69 2.49 0l8.08-8.08c.69-.69.69-1.8 0-2.49L11.03 1.68z" fill="#0078D4" />
                  </svg>
                  Microsoft
                </button>

                <button className="w-full inline-flex justify-center items-center py-3 px-3 border border-gray-200 rounded-xl shadow-sm bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 hover:shadow-md">
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M.045 18.02c.072-.116.187-.124.348-.022 3.636 2.11 7.594 3.166 11.87 3.166 2.852 0 5.668-.533 8.447-1.595l-9.398-16.275c-.113-.196-.195-.348-.246-.458-.051-.109-.051-.174 0-.196.025-.011.072-.011.145 0 .196.022.402.116.618.283l8.447 14.65c1.729-1.08 3.166-2.498 4.307-4.256.898-1.39 1.348-2.852 1.348-4.388 0-2.17-.533-4.062-1.595-5.668C22.618 1.342 20.726.045 18.556.045c-1.729 0-3.28.533-4.65 1.595C12.536 2.7 11.726 4.25 11.726 6.42c0 1.348.283 2.498.848 3.447.565.949 1.348 1.595 2.347 1.938.22.076.22.174 0 .294-.22.12-.565.174-1.033.162-.468-.011-.936-.174-1.404-.489-.468-.315-.825-.76-1.071-1.336-.246-.576-.369-1.2-.369-1.871 0-1.729.533-3.28 1.595-4.65C13.64 2.536 15.19 1.726 17.36 1.726c1.348 0 2.498.283 3.447.848.949.565 1.595 1.348 1.938 2.347.076.22.076.22-.098.0-.174-.22-.489-.402-.945-.545-.456-.143-.98-.215-1.571-.215-1.348 0-2.498.402-3.447 1.207-.949.805-1.424 1.871-1.424 3.198 0 .805.174 1.5.522 2.085.348.585.825 1.033 1.424 1.348.599.315 1.272.472 2.02.472.599 0 1.142-.087 1.629-.261.487-.174.9-.435 1.24-.783.34-.348.599-.783.783-1.305.184-.522.276-1.109.276-1.762 0-.805-.174-1.5-.522-2.085-.348-.585-.825-1.033-1.424-1.348-.599-.315-1.272-.472-2.02-.472-.599 0-1.142.087-1.629.261-.487.174-.9.435-1.24.783-.34.348-.599.783-.783 1.305-.184.522-.276 1.109-.276 1.762z" fill="#FF9900" />
                  </svg>
                  Amazon
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
