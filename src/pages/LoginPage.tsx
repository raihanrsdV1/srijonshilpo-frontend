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
        {loading ? 'Signing in…' : 'Sign In'}
      </button>
    </form>
  )
}
