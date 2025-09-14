import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'

interface AuthResponse {
  token?: string
  username?: string
  email?: string
  role?: string
  message?: string
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const { data } = await api.post<AuthResponse>('/api/auth/register', form)
      if (data?.token) {
        localStorage.setItem('token', data.token)
        localStorage.setItem('user', JSON.stringify({ username: data.username, email: data.email, role: data.role }))
        navigate('/dashboard')
      } else {
        setError(data?.message || 'Registration failed')
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Registration failed')
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
            placeholder="Choose a unique username"
            required
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-gray-400">👤</span>
          </div>
        </div>
      </div>
      
      {/* Email Field */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700">
          Email Address
        </label>
        <div className="relative">
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 placeholder-gray-500 font-medium"
            placeholder="your.email@example.com"
            required
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-gray-400">📧</span>
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
            placeholder="Create a strong password"
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
              Creating account...
            </>
          ) : (
            <>
              <span>✨</span>
              Create Account
            </>
          )}
        </span>
        {!loading && (
          <div className="absolute inset-0 bg-gradient-to-r from-purple-700 via-pink-700 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
        )}
      </button>

      {/* Terms Notice */}
      <div className="bg-purple-50/70 backdrop-blur-sm border border-purple-200/50 rounded-xl p-4 mt-6">
        <div className="text-center">
          <p className="text-sm text-purple-700 font-medium">
            🎉 Welcome to Srijon Shilpo!
          </p>
          <p className="text-xs text-purple-600 mt-1">
            By creating an account, you agree to our terms of service and privacy policy.
          </p>
        </div>
      </div>
    </form>
  )
}
