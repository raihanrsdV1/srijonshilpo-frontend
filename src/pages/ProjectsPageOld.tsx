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
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>
        
        {/* Loading Content */}
        <div className="relative z-10 text-center">
          <div className="relative inline-block mb-6">
            <div className="w-20 h-20 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 opacity-20 animate-pulse"></div>
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
            Loading Your Projects
          </h2>
          <p className="text-gray-600 font-medium">
            Preparing your creative workspace...
          </p>
          
          {/* Loading dots animation */}
          <div className="flex justify-center space-x-2 mt-4">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Modern Header */}
        <div className="text-center mb-12">
          <div className="relative">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent mb-4">
              Your Projects
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Create stunning websites with our visual builder. Bring your ideas to life with drag-and-drop simplicity.
            </p>
          </div>
          
          {/* Glassmorphism Create Button */}
          <div className="mt-8">
            <button
              onClick={() => setShowCreateModal(true)}
              className="group relative inline-flex items-center gap-3 bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl px-8 py-4 text-gray-800 font-semibold text-lg hover:bg-white/30 hover:border-white/50 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-lg"
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="relative z-10 text-lg">✨ Create New Project</span>
              <div className="relative z-10 w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold transform group-hover:rotate-90 transition-transform duration-300">
                +
              </div>
            </button>
          </div>
        </div>

        {/* Empty State or Projects Grid */}
        {projects.length === 0 ? (
          /* Empty State */
          <div className="text-center py-20">
            <div className="relative inline-block">
              <div className="w-32 h-32 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center mb-8 mx-auto backdrop-blur-sm border border-white/50 shadow-xl">
                <span className="text-6xl">🎨</span>
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-pulse"></div>
            </div>
            <h3 className="text-3xl font-bold text-gray-800 mb-4">Ready to Create Magic?</h3>
            <p className="text-xl text-gray-600 mb-8 max-w-md mx-auto">
              Your creative journey starts here. Build beautiful websites without any coding knowledge.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white px-8 py-4 rounded-2xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 font-semibold text-lg"
            >
              🚀 Create Your First Project
            </button>
          </div>
        ) : (
          /* Projects Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project, index) => (
              <div 
                key={project.id} 
                className="group relative bg-white/60 backdrop-blur-md border border-white/50 rounded-3xl p-6 hover:bg-white/80 hover:border-white/70 transition-all duration-500 transform hover:scale-105 hover:shadow-2xl shadow-lg"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Project Card Gradient Overlay */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                {/* Project Status Badge */}
                <div className="absolute -top-2 -right-2">
                  {project.isPublished ? (
                    <div className="bg-gradient-to-r from-green-400 to-emerald-500 text-white text-xs px-3 py-1 rounded-full font-bold shadow-lg animate-pulse">
                      ✅ LIVE
                    </div>
                  ) : (
                    <div className="bg-gradient-to-r from-orange-400 to-yellow-500 text-white text-xs px-3 py-1 rounded-full font-bold shadow-lg">
                      📝 DRAFT
                    </div>
                  )}
                </div>

                {/* Project Content */}
                <div className="relative z-10 space-y-4">
                  {/* Project Icon & Title */}
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-lg">
                      {project.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-gray-800 truncate group-hover:text-purple-700 transition-colors duration-300">
                        {project.name}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Created {formatDate(project.createdAt)}
                      </p>
                    </div>
                  </div>

                  {/* Project Description */}
                  <div className="min-h-[60px]">
                    {project.description ? (
                      <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">
                        {project.description}
                      </p>
                    ) : (
                      <p className="text-gray-400 text-sm italic">
                        ✨ Add a description to make your project shine
                      </p>
                    )}
                  </div>

                  {/* Project Actions */}
                  <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200/50">
                    <button
                      onClick={() => navigate(`/builder/${project.id}`)}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-xl hover:shadow-lg transition-all duration-300 font-medium text-sm transform hover:scale-105"
                    >
                      ✏️ Edit
                    </button>
                    
                    {!project.isPublished ? (
                      <button
                        onClick={() => publishProject(project.id)}
                        className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-xl hover:shadow-lg transition-all duration-300 font-medium text-sm transform hover:scale-105"
                      >
                        🚀 Publish
                      </button>
                    ) : (
                      <button
                        onClick={() => viewLiveWebsite(project)}
                        className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 text-white px-4 py-2 rounded-xl hover:shadow-lg transition-all duration-300 font-medium text-sm transform hover:scale-105"
                      >
                        👁️ View Live
                      </button>
                    )}
                    
                    <button
                      onClick={() => deleteProject(project.id)}
                      className="bg-gradient-to-r from-red-400 to-red-600 text-white px-3 py-2 rounded-xl hover:shadow-lg transition-all duration-300 font-medium text-sm transform hover:scale-105"
                    >
                      🗑️
                    </button>
                  </div>

                  {/* Live URL Preview */}
                  {project.isPublished && project.slug && (
                    <div className="pt-2 border-t border-gray-200/50">
                      <div className="bg-gray-50/50 rounded-lg px-3 py-2">
                        <span className="text-xs text-gray-500 font-mono">
                          🌐 /{project.slug}
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
          <div className="bg-white/90 backdrop-blur-md border border-white/50 rounded-3xl p-8 w-full max-w-md shadow-2xl transform animate-fadeIn">
            {/* Modal Header */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <span className="text-2xl text-white">✨</span>
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Create New Project
              </h2>
              <p className="text-gray-600 mt-2">Start building your amazing website</p>
            </div>
            
            {/* Form Fields */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Project Name *
                </label>
                <input
                  type="text"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 placeholder-gray-500"
                  placeholder="Enter an awesome project name"
                  maxLength={100}
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Description
                </label>
                <textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  className="w-full px-4 py-3 bg-white/70 backdrop-blur-sm border border-white/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 placeholder-gray-500 resize-none"
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
                className="flex-1 px-6 py-3 text-gray-700 bg-gray-200/70 backdrop-blur-sm border border-gray-300/50 rounded-xl hover:bg-gray-300/70 transition-all duration-300 font-semibold transform hover:scale-105"
                disabled={creating}
              >
                Cancel
              </button>
              <button
                onClick={createProject}
                disabled={!newProject.name.trim() || creating}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white rounded-xl hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold transform hover:scale-105 disabled:transform-none"
              >
                {creating ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Creating...
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
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
