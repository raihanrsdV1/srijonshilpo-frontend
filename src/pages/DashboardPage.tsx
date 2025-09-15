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

  const logout = async () => {
    try {
      // Clear local storage and navigate to login
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      navigate('/login')
    } catch (error) {
      console.error('Logout failed:', error)
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      navigate('/login')
    }
  }

  const viewLiveWebsite = (project: Project) => {
    const liveUrl = `http://localhost:8084/live/${project.slug}`
    window.open(liveUrl, '_blank')
  }

  return (
    <div className="min-h-screen" style={{
      background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 25%, #16213e 50%, #0f3460 75%, #533483 100%)',
      backgroundSize: '300% 300%',
      animation: 'gradientShift 8s ease infinite'
    }}>
      {/* Inject animations */}
      <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        .glassmorphism-header {
          background: rgba(15, 15, 35, 0.85) !important;
          backdrop-filter: blur(20px) !important;
          -webkit-backdrop-filter: blur(20px) !important;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3) !important;
        }
        
        .glassmorphism-card {
          background: rgba(15, 15, 35, 0.8) !important;
          backdrop-filter: blur(16px) !important;
          -webkit-backdrop-filter: blur(16px) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2) !important;
        }
        
        .glassmorphism-subtle {
          background: rgba(255, 255, 255, 0.05) !important;
          backdrop-filter: blur(10px) !important;
          -webkit-backdrop-filter: blur(10px) !important;
          border: 1px solid rgba(255, 255, 255, 0.1) !important;
        }
      `}</style>

      {/* Header */}
      <header className="glassmorphism-header relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div style={{
              background: 'rgba(59, 130, 246, 0.2)',
              border: '1px solid rgba(59, 130, 246, 0.4)'
            }} className="w-12 h-12 rounded-2xl flex items-center justify-center overflow-hidden">
              <img 
                src="/images/srijon_shilpo.jpeg" 
                alt="Srijon Shilpo Logo"
                className="w-full h-full object-cover rounded-2xl"
                onError={(e) => {
                  // Fallback to text if image fails to load
                  const target = e.target as HTMLImageElement
                  target.style.display = 'none'
                  target.parentElement!.innerHTML = '<span class="text-blue-400 text-xl font-bold">S</span>'
                }}
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Dashboard</h1>
              <p className="text-sm font-medium" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Welcome to Srijon Shilpo
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/projects')}
              style={{
                background: 'rgba(59, 130, 246, 0.2)',
                border: '1px solid rgba(59, 130, 246, 0.4)',
                color: '#60a5fa'
              }}
              className="px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:opacity-80"
            >
              Projects
            </button>
            <button 
              onClick={logout} 
              style={{
                background: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#f87171'
              }}
              className="px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:opacity-80"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="glassmorphism-card rounded-2xl p-6">
            <h2 className="text-xl font-semibold mb-2 text-white">
              Welcome{user?.username ? `, ${user.username}` : ''}!
            </h2>
            <p style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              You are signed in{user?.email ? ` as ${user.email}` : ''}. 
              Manage your e-commerce stores and see your published projects below.
            </p>
          </div>
        </div>

        {/* Dashboard Overview */}
        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Quick Actions */}
          <div className="glassmorphism-card rounded-2xl p-6">
            <h3 className="text-lg font-medium mb-4 text-white">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/projects')}
                style={{
                  background: 'rgba(59, 130, 246, 0.2)',
                  border: '1px solid rgba(59, 130, 246, 0.4)',
                  color: '#60a5fa'
                }}
                className="w-full py-2 px-4 rounded-lg transition-all duration-200 hover:opacity-80 text-sm font-medium"
              >
                Create New Store
              </button>
              <button
                onClick={() => navigate('/builder')}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: 'rgba(255, 255, 255, 0.9)'
                }}
                className="w-full py-2 px-4 rounded-lg transition-all duration-200 hover:opacity-80 text-sm font-medium"
              >
                Open Builder
              </button>
            </div>
          </div>

          {/* Store Analytics */}
          <div className="glassmorphism-card rounded-2xl p-6">
            <h3 className="text-lg font-medium mb-4 text-white">Store Analytics</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Total Stores:</span>
                <span className="font-medium text-white">{publishedProjects.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Published:</span>
                <span className="font-medium text-green-400">
                  {publishedProjects.filter(p => p.isPublished).length}
                </span>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div style={{
            background: 'rgba(15, 15, 35, 0.95)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)'
          }} className="rounded-lg p-6">
            <h3 className="text-lg font-medium mb-4 text-white">Recent Activity</h3>
            <div className="space-y-2">
              <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                {publishedProjects.length > 0 
                  ? `Last updated: ${publishedProjects[0]?.name}` 
                  : 'No recent activity'
                }
              </p>
            </div>
          </div>
        </div>

        {/* E-commerce Stores Section */}
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4 text-white">Your E-commerce Stores</h3>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto"></div>
              <p className="mt-2" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Loading your stores...
              </p>
            </div>
          ) : publishedProjects.length === 0 ? (
            <div className="glassmorphism-card rounded-2xl p-8 text-center">
              <div className="text-blue-400 text-4xl mb-4 font-bold">S</div>
              <h4 className="text-lg font-medium text-white mb-2">No E-commerce Stores</h4>
              <p className="mb-4" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                Create your first online store to start selling products.
              </p>
              <button
                onClick={() => navigate('/projects')}
                style={{
                  background: 'rgba(59, 130, 246, 0.2)',
                  border: '1px solid rgba(59, 130, 246, 0.4)',
                  color: '#60a5fa'
                }}
                className="px-6 py-2 rounded-lg transition-all duration-200 hover:opacity-80"
              >
                Create Your First Store
              </button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {publishedProjects.map((project) => (
                <div key={project.id} className="glassmorphism-card rounded-2xl p-6 hover:opacity-90 transition-all duration-200" style={{
                  borderLeft: '4px solid #60a5fa'
                }}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="text-2xl text-blue-400 font-bold">S</div>
                      <div>
                        <h4 className="text-lg font-medium text-white">{project.name}</h4>
                        <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                          Store ID: {project.slug}
                        </p>
                      </div>
                    </div>
                    <span style={{
                      background: 'rgba(34, 197, 94, 0.2)',
                      border: '1px solid rgba(34, 197, 94, 0.4)',
                      color: '#4ade80'
                    }} className="text-xs px-2 py-1 rounded-full">
                      Live
                    </span>
                  </div>
                  
                  {project.description && (
                    <p className="text-sm mb-4" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                      {project.description}
                    </p>
                  )}
                  
                  {/* Store Stats */}
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }} className="rounded-lg p-3 mb-4">
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div>
                        <div className="text-lg font-bold text-white">0</div>
                        <div className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Products</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-white">0</div>
                        <div className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Categories</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-white">0</div>
                        <div className="text-xs" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Orders</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => navigate(`/store/${project.id}`)}
                        style={{
                          background: 'rgba(59, 130, 246, 0.2)',
                          border: '1px solid rgba(59, 130, 246, 0.4)',
                          color: '#60a5fa'
                        }}
                        className="flex-1 py-2 px-3 rounded-lg transition-all duration-200 hover:opacity-80 text-sm font-medium"
                      >
                        Manage Store
                      </button>
                      <button
                        onClick={() => navigate(`/builder/${project.id}`)}
                        style={{
                          background: 'rgba(255, 255, 255, 0.1)',
                          border: '1px solid rgba(255, 255, 255, 0.2)',
                          color: 'rgba(255, 255, 255, 0.9)'
                        }}
                        className="flex-1 py-2 px-3 rounded-lg transition-all duration-200 hover:opacity-80 text-sm font-medium"
                      >
                        Edit Design
                      </button>
                    </div>
                    <button
                      onClick={() => viewLiveWebsite(project)}
                      style={{
                        background: 'rgba(34, 197, 94, 0.2)',
                        border: '1px solid rgba(34, 197, 94, 0.4)',
                        color: '#4ade80'
                      }}
                      className="w-full py-2 px-3 rounded-lg transition-all duration-200 hover:opacity-80 text-sm font-medium"
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
          <div style={{
            background: 'rgba(15, 15, 35, 0.95)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)'
          }} className="rounded-lg p-6">
            <div className="text-4xl mb-4 text-blue-400 font-bold">B</div>
            <h3 className="text-lg font-medium mb-2 text-white">Visual Builder</h3>
            <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Create beautiful websites with our drag-and-drop visual builder powered by GrapeJS.
            </p>
          </div>

          <div style={{
            background: 'rgba(15, 15, 35, 0.95)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)'
          }} className="rounded-lg p-6">
            <div className="text-4xl mb-4 text-green-400 font-bold">R</div>
            <h3 className="text-lg font-medium mb-2 text-white">Responsive Design</h3>
            <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Build responsive websites that look great on desktop, tablet, and mobile devices.
            </p>
          </div>

          <div style={{
            background: 'rgba(15, 15, 35, 0.95)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)'
          }} className="rounded-lg p-6">
            <div className="text-4xl mb-4 text-purple-400 font-bold">E</div>
            <h3 className="text-lg font-medium mb-2 text-white">E-commerce Ready</h3>
            <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Built-in e-commerce features to help you sell products and manage your online store.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}