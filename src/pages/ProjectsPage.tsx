import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { builderService } from '../services/api'

interface Project {
  id: number
  name: string
  description: string
  userId: string
  slug: string
  htmlContent: string
  cssContent: string
  jsContent: string
  grapejsData: string
  isPublished: boolean
  createdAt: string
  updatedAt: string
}

export default function ProjectsPage() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newProject, setNewProject] = useState({ name: '', description: '' })
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    loadProjects()
  }, [])

  const loadProjects = async () => {
    try {
      console.log('Loading user projects...')
      const data = await builderService.getUserProjects()
      console.log('Loaded projects:', data)
      setProjects(data)
    } catch (error) {
      console.error('Failed to load projects:', error)
      // If unauthorized, redirect to login
      if ((error as any)?.response?.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        navigate('/login')
      }
    } finally {
      setLoading(false)
    }
  }

  const createProject = async () => {
    if (!newProject.name.trim()) return

    setCreating(true)
    try {
      console.log('Creating project:', newProject)
      const data = await builderService.createProject(newProject.name, newProject.description)
      console.log('Created project:', data)
      setProjects([...projects, data])
      setNewProject({ name: '', description: '' })
      setShowCreateModal(false)
    } catch (error) {
      console.error('Failed to create project:', error)
      alert('Failed to create project. Please try again.')
    } finally {
      setCreating(false)
    }
  }

  const deleteProject = async (projectId: number) => {
    if (!confirm('Are you sure you want to delete this project?')) return

    try {
      await builderService.deleteProject(projectId)
      setProjects(projects.filter(p => p.id !== projectId))
    } catch (error) {
      console.error('Failed to delete project:', error)
      alert('Failed to delete project. Please try again.')
    }
  }

  const publishProject = async (projectId: number) => {
    try {
      console.log('Publishing project:', projectId)
      await builderService.publishProject(projectId)
      console.log('Project published successfully')
      // Reload projects to get updated status
      await loadProjects()
    } catch (error) {
      console.error('Failed to publish project:', error)
      alert('Failed to publish project. Please try again.')
    }
  }

  const viewLiveWebsite = (project: Project) => {
    if (project.isPublished && project.slug) {
      const url = `http://localhost:8083/public/sites/${project.slug}/render`
      window.open(url, '_blank')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500/20 rounded-full filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-500/20 rounded-full filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500/20 rounded-full filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>
        
        {/* Loading Content */}
        <div className="relative z-10 text-center">
          <div className="relative inline-block mb-6">
            <div className="w-20 h-20 border-4 border-purple-400/30 border-t-purple-400 rounded-full animate-spin"></div>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400/20 to-pink-400/20 animate-pulse"></div>
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
            Loading Your Projects
          </h2>
          <p className="text-gray-300 font-medium">
            Preparing your creative workspace...
          </p>
          
          {/* Loading dots animation */}
          <div className="flex justify-center space-x-2 mt-4">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{
      background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 25%, #16213e 50%, #0f3460 75%, #533483 100%)',
      backgroundSize: '400% 400%',
      animation: 'gradientShift 20s ease infinite'
    }}>
      {/* Inject animations */}
      <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Modern Header */}
        <div className="text-center mb-12">
          <div className="relative">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
              Your Projects
            </h1>
            <p className="text-xl max-w-2xl mx-auto leading-relaxed" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Create stunning websites with our visual builder. Bring your ideas to life with drag-and-drop simplicity.
            </p>
          </div>
          
          {/* Navigation and Create Button */}
          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              onClick={() => navigate('/dashboard')}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: 'rgba(255, 255, 255, 0.9)'
              }}
              className="px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:opacity-80"
            >
              ← Dashboard
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              style={{
                background: 'rgba(59, 130, 246, 0.2)',
                border: '1px solid rgba(59, 130, 246, 0.4)',
                color: '#60a5fa'
              }}
              className="px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-200 hover:opacity-80 transform hover:scale-105"
            >
              Create New Project
            </button>
          </div>
        </div>

        {/* Empty State or Projects Grid */}
        {projects.length === 0 ? (
          /* Empty State */
          <div className="text-center py-20">
            <div className="relative inline-block">
              <div style={{
                background: 'rgba(15, 15, 35, 0.95)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(20px)'
              }} className="w-32 h-32 rounded-full flex items-center justify-center mb-8 mx-auto">
                <span className="text-6xl text-blue-400 font-bold">S</span>
              </div>
              <div style={{
                background: 'rgba(59, 130, 246, 0.4)',
                border: '1px solid rgba(59, 130, 246, 0.6)'
              }} className="absolute -top-2 -right-2 w-8 h-8 rounded-full animate-pulse"></div>
            </div>
            <h3 className="text-3xl font-bold text-white mb-4">Ready to Create Magic?</h3>
            <p className="text-xl mb-8 max-w-md mx-auto" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
              Your creative journey starts here. Build beautiful websites without any coding knowledge.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              style={{
                background: 'rgba(59, 130, 246, 0.2)',
                border: '1px solid rgba(59, 130, 246, 0.4)',
                color: '#60a5fa'
              }}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 font-semibold text-lg hover:opacity-80"
            >
              Create Your First Project
            </button>
          </div>
        ) : (
          /* Projects Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project, index) => (
              <div 
                key={project.id} 
                style={{
                  background: 'rgba(15, 15, 35, 0.95)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(20px)'
                }}
                className="group relative rounded-3xl p-6 transition-all duration-500 transform hover:scale-105 hover:opacity-90"
              >
                {/* Project Status Badge */}
                <div className="absolute -top-2 -right-2">
                  {project.isPublished ? (
                    <div style={{
                      background: 'rgba(34, 197, 94, 0.2)',
                      border: '1px solid rgba(34, 197, 94, 0.4)',
                      color: '#4ade80'
                    }} className="text-xs px-3 py-1 rounded-full font-bold animate-pulse">
                      LIVE
                    </div>
                  ) : (
                    <div style={{
                      background: 'rgba(251, 146, 60, 0.2)',
                      border: '1px solid rgba(251, 146, 60, 0.4)',
                      color: '#fb923c'
                    }} className="text-xs px-3 py-1 rounded-full font-bold">
                      DRAFT
                    </div>
                  )}
                </div>

                {/* Project Content */}
                <div className="relative z-10 space-y-4">
                  {/* Project Icon & Title */}
                  <div className="flex items-start gap-3">
                    <div style={{
                      background: 'rgba(59, 130, 246, 0.2)',
                      border: '1px solid rgba(59, 130, 246, 0.4)'
                    }} className="w-12 h-12 rounded-xl flex items-center justify-center text-blue-400 text-xl font-bold">
                      {project.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-white truncate transition-colors duration-300">
                        {project.name}
                      </h3>
                      <p className="text-sm mt-1" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                        Created {formatDate(project.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Project Description */}
                  <div className="min-h-[60px]">
                    {project.description ? (
                      <p className="text-sm leading-relaxed line-clamp-3" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
                        {project.description}
                      </p>
                    ) : (
                      <p className="text-sm italic" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                        Add a description to make your project shine
                      </p>
                    )}
                  </div>

                  {/* Project Actions */}
                  <div className="flex flex-wrap gap-2 pt-4 border-t border-opacity-10 border-white">
                    <button
                      onClick={() => navigate(`/builder/${project.id}`)}
                      style={{
                        background: 'rgba(59, 130, 246, 0.2)',
                        border: '1px solid rgba(59, 130, 246, 0.4)',
                        color: '#60a5fa'
                      }}
                      className="flex-1 px-4 py-2 rounded-xl transition-all duration-300 font-medium text-sm transform hover:scale-105 hover:opacity-80"
                    >
                      Edit
                    </button>
                    
                    {!project.isPublished ? (
                      <button
                        onClick={() => publishProject(project.id)}
                        style={{
                          background: 'rgba(34, 197, 94, 0.2)',
                          border: '1px solid rgba(34, 197, 94, 0.4)',
                          color: '#4ade80'
                        }}
                        className="flex-1 px-4 py-2 rounded-xl transition-all duration-300 font-medium text-sm transform hover:scale-105 hover:opacity-80"
                      >
                        Publish
                      </button>
                    ) : (
                      <button
                        onClick={() => viewLiveWebsite(project)}
                        style={{
                          background: 'rgba(168, 85, 247, 0.2)',
                          border: '1px solid rgba(168, 85, 247, 0.4)',
                          color: '#a855f7'
                        }}
                        className="flex-1 px-4 py-2 rounded-xl transition-all duration-300 font-medium text-sm transform hover:scale-105 hover:opacity-80"
                      >
                        View Live
                      </button>
                    )}
                    
                    <button
                      onClick={() => deleteProject(project.id)}
                      style={{
                        background: 'rgba(239, 68, 68, 0.2)',
                        border: '1px solid rgba(239, 68, 68, 0.4)',
                        color: '#f87171'
                      }}
                      className="px-3 py-2 rounded-xl transition-all duration-300 font-medium text-sm transform hover:scale-105 hover:opacity-80"
                    >
                      Delete
                    </button>
                  </div>

                  {/* Live URL Preview */}
                  {project.isPublished && project.slug && (
                    <div className="pt-2 border-t border-opacity-10 border-white">
                      <div style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)'
                      }} className="rounded-lg px-3 py-2">
                        <span className="text-xs font-mono" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                          /{project.slug}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div style={{
            background: 'rgba(15, 15, 35, 0.95)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(20px)'
          }} className="rounded-3xl p-8 w-full max-w-md transform animate-fadeIn">
            {/* Modal Header */}
            <div className="text-center mb-6">
              <div style={{
                background: 'rgba(59, 130, 246, 0.2)',
                border: '1px solid rgba(59, 130, 246, 0.4)'
              }} className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl text-blue-400 font-bold">+</span>
              </div>
              <h2 className="text-2xl font-bold text-white">
                Create New Project
              </h2>
              <p className="mt-2" style={{ color: 'rgba(255, 255, 255, 0.7)' }}>Start building your amazing website</p>
            </div>
            
            {/* Form Fields */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-white mb-3">
                  Project Name *
                </label>
                <input
                  type="text"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: 'white'
                  }}
                  className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 placeholder-gray-400"
                  placeholder="Enter an awesome project name"
                  maxLength={100}
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-white mb-3">
                  Description
                </label>
                <textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    color: 'white'
                  }}
                  className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 placeholder-gray-400 resize-none"
                  rows={3}
                  placeholder="Describe your project (optional)"
                  maxLength={500}
                />
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-4 mt-8">
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setNewProject({ name: '', description: '' })
                }}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  color: 'rgba(255, 255, 255, 0.9)'
                }}
                className="flex-1 px-6 py-3 rounded-xl transition-all duration-300 font-semibold transform hover:scale-105 hover:opacity-80"
                disabled={creating}
              >
                Cancel
              </button>
              <button
                onClick={createProject}
                disabled={!newProject.name.trim() || creating}
                style={{
                  background: 'rgba(59, 130, 246, 0.2)',
                  border: '1px solid rgba(59, 130, 246, 0.4)',
                  color: '#60a5fa'
                }}
                className="flex-1 px-6 py-3 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transform hover:scale-105 disabled:transform-none hover:opacity-80"
              >
                {creating ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                    Creating...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">&nbsp;
                    🚀 Create Project
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
