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
        <div style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: '#f87171'
        }} className="px-4 py-3 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}
      
      {/* Username Field */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-white">
          Username
        </label>
        <div className="relative">
          <input
            name="username"
            value={form.username}
            onChange={handleChange}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'white'
            }}
            className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 placeholder-gray-400 font-medium"
            placeholder="Choose a unique username"
            required
          />
        </div>
      </div>
      
      {/* Email Field */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-white">
          Email Address
        </label>
        <div className="relative">
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'white'
            }}
            className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 placeholder-gray-400 font-medium"
            placeholder="your.email@example.com"
            required
          />
        </div>
      </div>
      
      {/* Password Field */}
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-white">
          Password
        </label>
        <div className="relative">
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'white'
            }}
            className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 placeholder-gray-400 font-medium"
            placeholder="Create a strong password"
            required
          />
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        style={{
          background: 'rgba(59, 130, 246, 0.2)',
          border: '1px solid rgba(59, 130, 246, 0.4)',
          color: '#60a5fa'
        }}
        className="w-full font-semibold py-3 px-6 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 disabled:transform-none hover:opacity-80"
      >
        <span className="flex items-center justify-center gap-2">
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
              Creating account...
            </>
          ) : (
            "Create Account"
          )}
        </span>
      </button>

      {/* Terms Notice */}
      <div style={{
        background: 'rgba(168, 85, 247, 0.1)',
        border: '1px solid rgba(168, 85, 247, 0.2)'
      }} className="rounded-xl p-4 mt-6">
        <div className="text-center">
          <p className="text-sm text-purple-400 font-medium">
            Welcome to Srijon Shilpo!
          </p>
          <p className="text-xs text-purple-300 mt-1">
            By creating an account, you agree to our terms of service and privacy policy.
          </p>
        </div>
      </div>
    </form>
  )
}
