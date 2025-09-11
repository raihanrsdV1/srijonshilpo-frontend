import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'

interface Project {
  id: number
  name: string
  description: string
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
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      const { data } = await api.get<Project[]>('/api/builder/projects', {
        headers: { 'X-User-ID': user.username }
      })
      setProjects(data)
    } catch (error) {
      console.error('Failed to load projects:', error)
    } finally {
      setLoading(false)
    }
  }

  const createProject = async () => {
    if (!newProject.name.trim()) return

    setCreating(true)
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      const { data } = await api.post<Project>('/api/builder/projects', newProject, {
        headers: { 'X-User-ID': user.username }
      })
      
      setProjects([...projects, data])
      setNewProject({ name: '', description: '' })
      setShowCreateModal(false)
    } catch (error) {
      console.error('Failed to create project:', error)
    } finally {
      setCreating(false)
    }
  }

  const deleteProject = async (projectId: number) => {
    if (!confirm('Are you sure you want to delete this project?')) return

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      await api.delete(`/api/builder/projects/${projectId}`, {
        headers: { 'X-User-ID': user.username }
      })
      
      setProjects(projects.filter(p => p.id !== projectId))
    } catch (error) {
      console.error('Failed to delete project:', error)
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
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Projects</h1>
              <p className="text-gray-600 mt-2">Create and manage your web page builder projects</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              + New Project
            </button>
          </div>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📄</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No projects yet</h3>
            <p className="text-gray-600 mb-6">Create your first project to get started with the visual builder</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Your First Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div key={project.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">{project.name}</h3>
                    {project.isPublished && (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        Published
                      </span>
                    )}
                  </div>
                  
                  {project.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">{project.description}</p>
                  )}
                  
                  <div className="text-xs text-gray-500 mb-4">
                    <div>Created: {formatDate(project.createdAt)}</div>
                    {project.updatedAt !== project.createdAt && (
                      <div>Updated: {formatDate(project.updatedAt)}</div>
                    )}
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => navigate(`/builder/${project.id}`)}
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors text-sm"
                    >
                      Edit
                    </button>
                    
                    {project.isPublished && (
                      <button
                        onClick={() => window.open(`/public/projects/${project.id}/render`, '_blank')}
                        className="flex-1 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 transition-colors text-sm"
                      >
                        View
                      </button>
                    )}
                    
                    <button
                      onClick={() => deleteProject(project.id)}
                      className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 transition-colors text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
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
