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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Modern Header */}
      <header className="relative z-10 bg-white/80 backdrop-blur-md border-b border-white/50 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white text-xl">🎨</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Dashboard
              </h1>
              <p className="text-sm text-gray-600 font-medium">Welcome to Srijon Shilpo</p>
            </div>
          </div>
          <button 
            onClick={logout} 
            className="bg-white/70 backdrop-blur-sm border border-white/50 text-red-600 hover:text-red-700 px-4 py-2 rounded-xl font-medium transition-all duration-300 hover:bg-white/90 hover:shadow-lg transform hover:scale-105"
          >
            🚪 Logout
          </button>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Welcome Card */}
          <div className="bg-white rounded-lg shadow p-6 md:col-span-2 lg:col-span-2">
            <h2 className="text-lg font-medium mb-2">Welcome{user?.username ? `, ${user.username}` : ''}!</h2>
            <p className="text-gray-600">
              You are signed in{user?.email ? ` as ${user.email}` : ''}. Manage your websites, e-commerce stores, and see your published projects below.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-medium mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/projects')}
                className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="font-medium">�️ Create New Store</div>
                <div className="text-sm text-gray-600">Build a new e-commerce website</div>
              </button>
              <button
                onClick={() => navigate('/websites')}
                className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="font-medium">🌐 Store Manager</div>
                <div className="text-sm text-gray-600">Manage all your stores</div>
              </button>
            </div>
          </div>

          {/* My E-commerce Stores */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-medium mb-4">My E-commerce Stores</h3>
            <div className="space-y-2">
              {publishedProjects.length === 0 ? (
                <div className="text-center py-4">
                  <div className="text-gray-300 text-2xl mb-2">🏪</div>
                  <p className="text-sm text-gray-500 mb-3">No stores yet</p>
                  <button
                    onClick={() => navigate('/projects')}
                    className="text-xs bg-primary text-white px-3 py-1 rounded-full hover:bg-primary/80"
                  >
                    Create First Store
                  </button>
                </div>
              ) : (
                publishedProjects.map((project) => (
                  <div key={project.id} className="border border-gray-200 rounded-lg p-3 hover:border-primary/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="text-lg">🏪</div>
                        <div>
                          <div className="font-medium text-sm">{project.name}</div>
                          <div className="text-xs text-gray-500">{project.description}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => navigate(`/store/${project.id}`)}
                          className="text-xs bg-primary text-white px-2 py-1 rounded hover:bg-primary/80"
                        >
                          Manage Store
                        </button>
                      </div>
                    </div>
                    <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                      <span>Store ID: {project.slug}</span>
                      <button
                        onClick={() => viewLiveWebsite(project)}
                        className="text-green-600 hover:underline"
                      >
                        View Live ↗
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium mb-4">Store Analytics</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Stores:</span>
                <span className="font-medium">{publishedProjects.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Published:</span>
                <span className="font-medium text-green-600">{publishedProjects.filter(p => p.isPublished).length}</span>
              </div>
              <button
                onClick={() => navigate('/projects')}
                className="w-full bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary/80 transition-colors text-sm font-medium mt-4"
              >
                Create New Store
              </button>
            </div>
          </div>
        </div>

        {/* Store Performance Section */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">Your E-commerce Stores</h3>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading your websites...</p>
            </div>
          ) : publishedProjects.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <div className="text-gray-300 text-4xl mb-4">�</div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">No E-commerce Stores</h4>
              <p className="text-gray-600 mb-4">Create your first online store to start selling products.</p>
              <button
                onClick={() => navigate('/projects')}
                className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/80 transition-colors"
              >
                Create Your First Store
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {publishedProjects.map((project) => (
                <div key={project.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow border-l-4 border-l-primary">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl">🏪</div>
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">{project.name}</h4>
                        <p className="text-sm text-gray-500">Store ID: {project.slug}</p>
                      </div>
                    </div>
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      Live
                    </span>
                  </div>
                  
                  {project.description && (
                    <p className="text-gray-600 text-sm mb-4">{project.description}</p>
                  )}
                  
                  {/* Store Stats */}
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <div className="text-lg font-bold text-gray-900">0</div>
                        <div className="text-xs text-gray-500">Products</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-gray-900">0</div>
                        <div className="text-xs text-gray-500">Categories</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-gray-900">0</div>
                        <div className="text-xs text-gray-500">Orders</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/store/${project.id}`)}
                        className="flex-1 bg-primary text-white py-2 px-3 rounded-lg hover:bg-primary/80 transition-colors text-sm font-medium"
                      >
                        Manage Store
                      </button>
                      <button
                        onClick={() => navigate(`/builder/${project.id}`)}
                        className="flex-1 bg-gray-600 text-white py-2 px-3 rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
                      >
                        Edit Design
                      </button>
                    </div>
                    <button
                      onClick={() => viewLiveWebsite(project)}
                      className="w-full bg-green-600 text-white py-2 px-3 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                    >
                      View Live Store ↗
                    </button>
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
