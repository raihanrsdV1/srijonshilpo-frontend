import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../services/api'

interface AuthResponse {
  token?: string
  username?: string
  email?: string
  role?: string
  message?: string
}

export default function LoginPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ 
    username: 'jamdani_arts_user', 
    password: 'jamdani123' 
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    console.log('Login attempt:', { username: form.username, passwordLength: form.password.length })
    
    try {
      const data = await authService.login(form.username, form.password)
      console.log('Login response:', data)
      
      if (data?.token) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify({ 
          username: data.username, 
          email: data.email, 
          role: data.role 
        }))
        console.log('Login successful, navigating to dashboard')
        navigate('/dashboard') // Navigate to dashboard first
      } else {
        console.log('Login failed - no token in response')
        setError(data?.message || 'Login failed')
      }
    } catch (err: any) {
      console.error('Login error:', err)
      console.error('Error details:', err?.response?.data)
      setError(err?.response?.data?.message || err?.message || 'Invalid username or password. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Error Alert */}
      {error && (
        <div className="bg-red-50/70 backdrop-blur-sm border border-red-200/50 text-red-700 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2">
          <span className="text-red-500">⚠️</span>
          {error}
        </div>
      )}
      
      {/* Username Field */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700">
          Username
        </label>
        <div className="relative">
          <input
            name="username"
            value={form.username}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 placeholder-gray-500 font-medium"
            placeholder="Enter your username"
            required
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-gray-400">👤</span>
          </div>
        </div>
      </div>
      
      {/* Password Field */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700">
          Password
        </label>
        <div className="relative">
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 placeholder-gray-500 font-medium"
            placeholder="Enter your password"
            required
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-gray-400">🔒</span>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white font-semibold py-3 px-6 rounded-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 disabled:transform-none relative overflow-hidden group"
      >
        {loading && (
          <div className="absolute inset-0 bg-gradient-to-r from-purple-700 via-pink-700 to-blue-700 rounded-xl"></div>
        )}
        <span className="relative z-10 flex items-center justify-center gap-2">
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Signing in...
            </>
          ) : (
            <>
              <span>🚀</span>
              Sign In
            </>
          )}
        </span>
        {!loading && (
          <div className="absolute inset-0 bg-gradient-to-r from-purple-700 via-pink-700 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
        )}
      </button>

      {/* Demo Credentials */}
      <div className="bg-blue-50/70 backdrop-blur-sm border border-blue-200/50 rounded-xl p-4 mt-6">
        <div className="text-center">
          <p className="text-sm text-blue-700 font-medium mb-2">
            🎯 Demo Credentials
          </p>
          <div className="text-xs text-blue-600 space-y-1">
            <p><strong>Username:</strong> jamdani_arts_user</p>
            <p><strong>Password:</strong> jamdani123</p>
          </div>
        </div>
      </div>
    </form>
  )
}
