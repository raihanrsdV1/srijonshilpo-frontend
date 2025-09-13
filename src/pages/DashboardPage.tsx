import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService, builderService } from '../services/api'

interface Project {
  id: number
  name: string
  description: string
  userId: string
  slug: string
  isPublished: boolean
  createdAt: string
  updatedAt: string
}

export default function DashboardPage() {
  const [user, setUser] = useState<{username?: string; email?: string; role?: string} | null>(null)
  const [publishedProjects, setPublishedProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    
    if (!token || !savedUser) {
      navigate('/login')
      return
    }

    try {
      const userData = JSON.parse(savedUser)
      setUser(userData)
      loadPublishedProjects()
    } catch (error) {
      console.error('Error loading user data:', error)
      navigate('/login')
    }
  }, [navigate])

  const loadPublishedProjects = async () => {
    try {
      const projects = await builderService.getProjects()
      setPublishedProjects(projects.filter((p: Project) => p.isPublished))
    } catch (error) {
      console.error('Failed to load published projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/login')
  }

  const viewLiveWebsite = (project: Project) => {
    if (project.slug) {
      const url = `http://localhost:8083/public/sites/${project.slug}/render`
      window.open(url, '_blank')
    }
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
              You are signed in{user?.email ? ` as ${user.email}` : ''}. Manage your websites and see your published projects below.
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
                <span>Manage Projects</span>
              </button>
            </div>
          </div>
        </div>

        {/* Published Websites Section */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">Your Published Websites</h3>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading your websites...</p>
            </div>
          ) : publishedProjects.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <div className="text-gray-300 text-4xl mb-4">🌐</div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">No Published Websites</h4>
              <p className="text-gray-600 mb-4">Create and publish your first website to see it here.</p>
              <button
                onClick={() => navigate('/projects')}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Create Your First Website
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {publishedProjects.map((project) => (
                <div key={project.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="text-lg font-medium text-gray-900">{project.name}</h4>
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      Live
                    </span>
                  </div>
                  
                  {project.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{project.description}</p>
                  )}
                  
                  <div className="space-y-3">
                    <div className="text-xs text-gray-500">
                      <span className="font-medium">URL:</span> /{project.slug}
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => viewLiveWebsite(project)}
                        className="flex-1 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                      >
                        View Live Site
                      </button>
                      <button
                        onClick={() => navigate(`/builder/${project.id}`)}
                        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
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
