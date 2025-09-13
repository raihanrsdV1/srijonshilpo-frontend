import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { builderService } from '../services/api'
import ThemeSelector from '../components/ThemeSelector'

interface Website {
  id: string
  name: string
  description: string
  type: 'builder' | 'ecommerce'
  status: 'active' | 'draft' | 'published'
  url?: string
  lastModified: string
  thumbnail?: string
}

interface Theme {
  id: string
  name: string
  description: string
  preview: string
  category: string
  colors: {
    primary: string
    secondary: string
    accent: string
  }
}

export default function WebsiteManagementPage() {
  const navigate = useNavigate()
  const [websites, setWebsites] = useState<Website[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showWebsiteSwitcher, setShowWebsiteSwitcher] = useState(false)
  const [currentWebsite, setCurrentWebsite] = useState<Website | null>(null)
  const [showThemeSelector, setShowThemeSelector] = useState(false)
  const [newWebsite, setNewWebsite] = useState({
    name: '',
    description: '',
    type: 'builder' as 'builder' | 'ecommerce'
  })
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null)

  useEffect(() => {
    loadWebsites()
  }, [])

  const loadWebsites = async () => {
    try {
      // For now, we'll create mock data. In real implementation, this would come from the backend
      const mockWebsites: Website[] = [
        {
          id: 'default-store',
          name: 'Default Store',
          description: 'Main e-commerce website',
          type: 'ecommerce',
          status: 'active',
          lastModified: new Date().toISOString(),
          thumbnail: '🛒'
        },
        {
          id: 'portfolio-site',
          name: 'Portfolio Site',
          description: 'Personal portfolio website',
          type: 'builder',
          status: 'published',
          url: 'portfolio.example.com',
          lastModified: new Date(Date.now() - 86400000).toISOString(),
          thumbnail: '🎨'
        }
      ]
      setWebsites(mockWebsites)
      setCurrentWebsite(mockWebsites[0])
    } catch (error) {
      console.error('Failed to load websites:', error)
    }
  }

  const handleCreateWebsite = async () => {
    if (newWebsite.type === 'builder' && !selectedTheme) {
      setShowThemeSelector(true)
      return
    }

    try {
      if (newWebsite.type === 'builder') {
        // Create a new builder project
        const project = await builderService.createProject(newWebsite.name, newWebsite.description)
        navigate(`/builder/${project.id}`)
      } else {
        // Create a new e-commerce website
        const website: Website = {
          id: `ecommerce-${Date.now()}`,
          name: newWebsite.name,
          description: newWebsite.description,
          type: 'ecommerce',
          status: 'draft',
          lastModified: new Date().toISOString(),
          thumbnail: '🏪'
        }
        setWebsites([...websites, website])
        setShowCreateModal(false)
        setNewWebsite({ name: '', description: '', type: 'builder' })
        navigate('/ecommerce')
      }
    } catch (error) {
      console.error('Failed to create website:', error)
    }
  }

  const handleThemeSelected = (theme: Theme) => {
    setSelectedTheme(theme)
    setShowThemeSelector(false)
    handleCreateWebsite()
  }

  const switchWebsite = (website: Website) => {
    setCurrentWebsite(website)
    setShowWebsiteSwitcher(false)
    
    if (website.type === 'ecommerce') {
      navigate('/ecommerce')
    } else {
      navigate('/projects')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'published':
        return 'bg-green-100 text-green-800'
      case 'draft':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ecommerce':
        return '🛒'
      case 'builder':
        return '🏗️'
      default:
        return '🌐'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Website Switcher */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-gray-900">Website Management</h1>
              
              {/* Current Website Indicator */}
              {currentWebsite && (
                <button
                  onClick={() => setShowWebsiteSwitcher(true)}
                  className="ml-4 flex items-center space-x-2 px-3 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <span className="text-lg">{getTypeIcon(currentWebsite.type)}</span>
                  <span className="font-medium">{currentWebsite.name}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary"
              >
                Create New Website
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="text-gray-600 hover:text-gray-900"
              >
                ← Back to Dashboard
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {websites.map((website) => (
              <div
                key={website.id}
                className={`bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer border-2 ${
                  currentWebsite?.id === website.id ? 'border-primary' : 'border-transparent'
                }`}
                onClick={() => switchWebsite(website)}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-3xl">{website.thumbnail || getTypeIcon(website.type)}</div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(website.status)}`}>
                      {website.status}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{website.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">{website.description}</p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span className="capitalize">{website.type}</span>
                    <span>Modified {new Date(website.lastModified).toLocaleDateString()}</span>
                  </div>
                  
                  {website.url && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <a
                        href={`https://${website.url}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {website.url} ↗
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Add New Website Card */}
            <div
              className="bg-white rounded-lg shadow border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors cursor-pointer"
              onClick={() => setShowCreateModal(true)}
            >
              <div className="p-6 flex flex-col items-center justify-center h-full min-h-[200px]">
                <div className="text-4xl mb-4">➕</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Create New Website</h3>
                <p className="text-sm text-gray-600 text-center">
                  Start building a new website or online store
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Website Switcher Modal */}
      {showWebsiteSwitcher && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900">Switch Website</h3>
              <button
                onClick={() => setShowWebsiteSwitcher(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {websites.map((website) => (
                <button
                  key={website.id}
                  onClick={() => switchWebsite(website)}
                  className={`p-4 border-2 rounded-lg text-left transition-colors ${
                    currentWebsite?.id === website.id
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{website.thumbnail || getTypeIcon(website.type)}</div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{website.name}</h4>
                      <p className="text-sm text-gray-600">{website.description}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-gray-500 capitalize">{website.type}</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(website.status)}`}>
                          {website.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Create Website Modal */}
      {showCreateModal && !showThemeSelector && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Website</h3>
            
            <div className="space-y-4">
              <div>
                <label className="form-label">Website Name</label>
                <input
                  type="text"
                  value={newWebsite.name}
                  onChange={(e) => setNewWebsite({...newWebsite, name: e.target.value})}
                  className="form-input w-full"
                  placeholder="My Awesome Website"
                />
              </div>
              
              <div>
                <label className="form-label">Description</label>
                <textarea
                  value={newWebsite.description}
                  onChange={(e) => setNewWebsite({...newWebsite, description: e.target.value})}
                  className="form-input w-full h-20"
                  placeholder="Brief description of your website"
                />
              </div>
              
              <div>
                <label className="form-label">Website Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setNewWebsite({...newWebsite, type: 'builder'})}
                    className={`p-4 border rounded-lg text-center ${
                      newWebsite.type === 'builder'
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-2">🏗️</div>
                    <div className="font-medium">Website Builder</div>
                    <div className="text-sm text-gray-600">Custom design with visual editor</div>
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setNewWebsite({...newWebsite, type: 'ecommerce'})}
                    className={`p-4 border rounded-lg text-center ${
                      newWebsite.type === 'ecommerce'
                        ? 'border-primary bg-primary/5'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-2">🛒</div>
                    <div className="font-medium">Online Store</div>
                    <div className="text-sm text-gray-600">E-commerce with products & inventory</div>
                  </button>
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setNewWebsite({ name: '', description: '', type: 'builder' })
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateWebsite}
                disabled={!newWebsite.name}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {newWebsite.type === 'builder' ? 'Choose Theme' : 'Create Store'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Theme Selector Modal */}
      {showThemeSelector && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-medium text-gray-900">Choose a Theme</h3>
              <button
                onClick={() => setShowThemeSelector(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <ThemeSelector onSelectTheme={handleThemeSelected} />
          </div>
        </div>
      )}
    </div>
  )
}
