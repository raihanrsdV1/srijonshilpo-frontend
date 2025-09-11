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
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <div className="p-3 rounded bg-red-50 text-red-700 text-sm">{error}</div>}
      <div>
        <label className="form-label">Username</label>
        <input
          name="username"
          value={form.username}
          onChange={handleChange}
          className="form-input"
          placeholder="johndoe"
          required
        />
      </div>
      <div>
        <label className="form-label">Email</label>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          className="form-input"
          placeholder="john@example.com"
          required
        />
      </div>
      <div>
        <label className="form-label">Password</label>
        <input
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          className="form-input"
          placeholder="••••••••"
          required
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="btn-primary"
      >
        {loading ? 'Creating account…' : 'Create Account'}
      </button>
    </form>
  )
}
