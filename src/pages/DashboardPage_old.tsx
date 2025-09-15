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
    <div className="min-h-screen" style={{
      background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 25%, #16213e 50%, #0f3460 75%, #533483 100%)',
      backgroundSize: '400% 400%',
      animation: 'gradientShift 20s ease infinite'
    }}>
      <style>
        {`
          @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}
      </style>

      {/* Modern Header */}
      <header style={{ 
        background: 'rgba(15, 15, 35, 0.95)', 
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white text-xl font-bold">S</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Dashboard
              </h1>
              <p className="text-sm text-gray-300 font-medium">Welcome to Srijon Shilpo</p>
            </div>
          </div>
          <button 
            onClick={logout} 
            className="transition-all duration-300 hover:scale-105 font-medium"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#ef4444',
              padding: '8px 16px',
              borderRadius: '8px'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'
              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)'
            }}
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Welcome Card */}
          <div className="p-6 md:col-span-2 lg:col-span-2 rounded-lg" style={{
            background: 'rgba(15, 15, 35, 0.95)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)'
          }}>
            <h2 className="text-lg font-medium mb-2 text-white">Welcome{user?.username ? `, ${user.username}` : ''}!</h2>
            <p className="text-gray-300">
              You are signed in{user?.email ? ` as ${user.email}` : ''}. Manage your websites, e-commerce stores, and see your published projects below.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="p-6 rounded-lg" style={{
            background: 'rgba(15, 15, 35, 0.95)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)'
          }}>
            <h3 className="font-medium mb-4 text-white">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/projects')}
                className="w-full text-left p-3 rounded-lg transition-all hover:scale-105"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                }}
              >
                <div className="font-medium text-white">Create New Store</div>
                <div className="text-sm text-gray-300">Build a new e-commerce website</div>
              </button>
              <button
                onClick={() => navigate('/websites')}
                className="w-full text-left p-3 rounded-lg transition-all hover:scale-105"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'
                }}
              >
                <div className="font-medium text-white">Store Manager</div>
                <div className="text-sm text-gray-300">Manage all your stores</div>
              </button>
            </div>
          </div>

          {/* My E-commerce Stores */}
          <div className="p-6 rounded-lg" style={{
            background: 'rgba(15, 15, 35, 0.95)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)'
          }}>
            <h3 className="font-medium mb-4 text-white">My E-commerce Stores</h3>
            <div className="space-y-2">
              {publishedProjects.length === 0 ? (
                <div className="text-center py-4">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center">
                    <span className="text-white text-lg font-bold">S</span>
                  </div>
                  <p className="text-sm text-gray-400 mb-3">No stores yet</p>
                  <button
                    onClick={() => navigate('/projects')}
                    className="text-xs px-3 py-1 rounded-full transition-all hover:scale-105"
                    style={{
                      background: 'rgba(59, 130, 246, 0.2)',
                      border: '1px solid rgba(59, 130, 246, 0.4)',
                      color: '#60a5fa'
                    }}
                  >
                    Create First Store
                  </button>
                </div>
              ) : (
                publishedProjects.map((project) => (
                  <div 
                    key={project.id} 
                    className="p-3 rounded-lg transition-all hover:scale-105"
                    style={{
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.border = '1px solid rgba(59, 130, 246, 0.4)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.1)'
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                          <span className="text-white text-xs font-medium">S</span>
                        </div>
                        <div>
                          <div className="font-medium text-sm text-white">{project.name}</div>
                          <div className="text-xs text-gray-400">{project.description}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => navigate(`/store/${project.id}`)}
                          className="text-xs px-2 py-1 rounded transition-all hover:scale-105"
                          style={{
                            background: 'rgba(59, 130, 246, 0.2)',
                            border: '1px solid rgba(59, 130, 246, 0.4)',
                            color: '#60a5fa'
                          }}
                        >
                          Manage Store
                        </button>
                      </div>
                    </div>
                    <div className="mt-2 pt-2 flex items-center justify-between text-xs" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                      <span className="text-gray-400">Store ID: {project.slug}</span>
                      <button
                        onClick={() => viewLiveWebsite(project)}
                        className="text-green-400 hover:text-green-300 transition-colors"
                      >
                        View Live ↗
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Store Analytics */}
          <div className="p-6 rounded-lg" style={{
            background: 'rgba(15, 15, 35, 0.95)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)'
          }}>
            <h3 className="text-lg font-medium mb-4 text-white">Store Analytics</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Total Stores:</span>
                <span className="font-medium text-white">{publishedProjects.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">Published:</span>
                <span className="font-medium text-green-400">{publishedProjects.filter(p => p.isPublished).length}</span>
              </div>
              <button
                onClick={() => navigate('/projects')}
                className="w-full py-2 px-4 rounded-lg transition-all hover:scale-105 text-sm font-medium mt-4"
                style={{
                  background: 'rgba(59, 130, 246, 0.2)',
                  border: '1px solid rgba(59, 130, 246, 0.4)',
                  color: '#60a5fa'
                }}
              >
                Create New Store
              </button>
            </div>
          </div>
        </div>

        {/* Store Performance Section */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4 text-white">Your E-commerce Stores</h3>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto"></div>
              <p className="mt-2 text-gray-300">Loading your websites...</p>
            </div>
          ) : publishedProjects.length === 0 ? (
            <div className="p-8 text-center rounded-lg" style={{
              background: 'rgba(15, 15, 35, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(20px)'
            }}>
              <div className="w-16 h-16 mx-auto mb-4 rounded-lg bg-gradient-to-br from-gray-600 to-gray-700 flex items-center justify-center">
                <span className="text-white text-xl font-bold">S</span>
              </div>
              <h4 className="text-lg font-medium text-white mb-2">No E-commerce Stores</h4>
              <p className="text-gray-300 mb-4">Create your first online store to start selling products.</p>
              <button
                onClick={() => navigate('/projects')}
                className="px-6 py-2 rounded-lg transition-all hover:scale-105"
                style={{
                  background: 'rgba(59, 130, 246, 0.2)',
                  border: '1px solid rgba(59, 130, 246, 0.4)',
                  color: '#60a5fa'
                }}
              >
                Get Started
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {publishedProjects.map((project) => (
                <div 
                  key={project.id} 
                  className="p-6 rounded-lg transition-all hover:scale-105"
                  style={{
                    background: 'rgba(15, 15, 35, 0.95)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(20px)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.border = '1px solid rgba(59, 130, 246, 0.4)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                >
                  <div className="flex items-center mb-4">
                    <div className="w-12 h-12 rounded bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mr-3">
                      <span className="text-white font-bold">S</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-white">{project.name}</h4>
                      <p className="text-sm text-gray-400">{project.description}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-300">Status:</span>
                      <span className="text-xs px-2 py-1 rounded" style={{
                        background: project.isPublished ? 'rgba(34, 197, 94, 0.2)' : 'rgba(234, 179, 8, 0.2)',
                        color: project.isPublished ? '#4ade80' : '#fbbf24'
                      }}>
                        {project.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-300">Store ID:</span>
                      <span className="text-sm text-gray-400">{project.slug}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => navigate(`/store/${project.id}`)}
                      className="flex-1 py-2 px-3 rounded transition-all hover:scale-105 text-sm"
                      style={{
                        background: 'rgba(59, 130, 246, 0.2)',
                        border: '1px solid rgba(59, 130, 246, 0.4)',
                        color: '#60a5fa'
                      }}
                    >
                      Manage
                    </button>
                    <button
                      onClick={() => viewLiveWebsite(project)}
                      className="flex-1 py-2 px-3 rounded transition-all hover:scale-105 text-sm"
                      style={{
                        background: 'rgba(34, 197, 94, 0.2)',
                        border: '1px solid rgba(34, 197, 94, 0.4)',
                        color: '#4ade80'
                      }}
                    >
                      View Live
                    </button>
                  </div>
                </div>
              ))}
            </div>
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
