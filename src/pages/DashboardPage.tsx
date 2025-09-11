import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'

interface AuthResponse {
  token?: string
  username?: string
  email?: string
  role?: string
  message?: string
}

export default function DashboardPage() {
  const [user, setUser] = useState<{username?: string; email?: string; role?: string} | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }
    ;(async () => {
      try {
        const { data } = await api.post<AuthResponse>('/api/auth/validate', null, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (data?.username) {
          setUser({ username: data.username, email: data.email, role: data.role })
        }
      } catch (e) {
        localStorage.removeItem('token')
        navigate('/login')
      }
    })()
  }, [navigate])

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Dashboard</h1>
          <button onClick={logout} className="text-sm text-red-600 hover:underline">Logout</button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Welcome Card */}
          <div className="bg-white rounded-lg shadow p-6 md:col-span-2 lg:col-span-2">
            <h2 className="text-lg font-medium mb-2">Welcome{user?.username ? `, ${user.username}` : ''}!</h2>
            <p className="text-gray-600">
              You are signed in{user?.email ? ` as ${user.email}` : ''}. Use the navigation below to explore features.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/projects')}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <span>🛠️</span>
                <span>Website Builder</span>
              </button>
            </div>
          </div>
        </div>

        {/* Features Overview */}
        <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-4xl mb-4">🎨</div>
            <h3 className="text-lg font-medium mb-2">Visual Builder</h3>
            <p className="text-gray-600 text-sm">
              Create beautiful websites with our drag-and-drop visual builder powered by GrapeJS.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-4xl mb-4">📱</div>
            <h3 className="text-lg font-medium mb-2">Responsive Design</h3>
            <p className="text-gray-600 text-sm">
              Build responsive websites that look great on desktop, tablet, and mobile devices.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-4xl mb-4">🚀</div>
            <h3 className="text-lg font-medium mb-2">Publish & Share</h3>
            <p className="text-gray-600 text-sm">
              Publish your projects and share them with the world with a single click.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
