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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading projects...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Projects</h1>
              <p className="text-gray-600">Create and manage your web page builder projects</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
            >
              <span>+</span> New Project
            </button>
          </div>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white rounded-xl shadow-md p-12 max-w-md mx-auto">
              <div className="text-gray-300 text-6xl mb-4">📄</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No projects yet</h3>
              <p className="text-gray-600 mb-6">Create your first project to get started with the visual builder</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Create Your First Project
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="divide-y divide-gray-100">
              {projects.map((project) => (
                <div key={project.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                        {project.isPublished && (
                          <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                            Published
                          </span>
                        )}
                      </div>
                      
                      {project.description ? (
                        <p className="text-gray-600 mb-3 line-clamp-2">{project.description}</p>
                      ) : (
                        <p className="text-gray-400 mb-3 italic">No description provided</p>
                      )}
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>Created: {formatDate(project.createdAt)}</span>
                        {project.updatedAt !== project.createdAt && (
                          <span>Updated: {formatDate(project.updatedAt)}</span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 ml-6">
                      <button
                        onClick={() => navigate(`/builder/${project.id}`)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                      >
                        Edit
                      </button>
                      
                      {!project.isPublished ? (
                        <button
                          onClick={() => publishProject(project.id)}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium text-sm"
                        >
                          Publish
                        </button>
                      ) : (
                        <div className="flex gap-2">
                          <button
                            onClick={() => viewLiveWebsite(project)}
                            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium text-sm"
                          >
                            View Live
                          </button>
                          <span className="text-xs text-gray-500 self-center">
                            {project.slug && `/${project.slug}`}
                          </span>
                        </div>
                      )}
                      
                      <button
                        onClick={() => deleteProject(project.id)}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Create New Project</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Name *
                </label>
                <input
                  type="text"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter project name"
                  maxLength={100}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Enter project description"
                  maxLength={500}
                />
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setNewProject({ name: '', description: '' })
                }}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
                disabled={creating}
              >
                Cancel
              </button>
              <button
                onClick={createProject}
                disabled={!newProject.name.trim() || creating}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
