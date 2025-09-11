import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../services/api'
import '../styles/builder.css'

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

export default function BuilderPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const editorRef = useRef<HTMLDivElement>(null)
  const [editor, setEditor] = useState<any>(null)
  const [project, setProject] = useState<Project | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [grapesLoaded, setGrapesLoaded] = useState(false)

  useEffect(() => {
    if (!projectId) {
      navigate('/dashboard')
      return
    }

    loadProject()
    loadGrapeJS()
  }, [projectId])

  useEffect(() => {
    if (editorRef.current && project && grapesLoaded && !editor) {
      initializeEditor()
    }
  }, [project, editor, grapesLoaded])

  const loadGrapeJS = async () => {
    try {
      // Dynamically import GrapeJS modules
      const [grapesModule, presetModule, blocksModule] = await Promise.all([
        import('grapesjs'),
        import('grapesjs-preset-webpage'),  
        import('grapesjs-blocks-basic')
      ])

      // Store the modules globally for use in initializeEditor
      ;(window as any).grapesjs = grapesModule.default || grapesModule
      ;(window as any).gjsPresetWebpage = presetModule.default || presetModule
      ;(window as any).gjsBlocksBasic = blocksModule.default || blocksModule

      setGrapesLoaded(true)
    } catch (error) {
      console.error('Failed to load GrapeJS:', error)
      // Fallback: show manual editor
    }
  }

  const loadProject = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      const { data } = await api.get<Project>(`/api/builder/projects/${projectId}`, {
        headers: { 'X-User-ID': user.username }
      })
      setProject(data)
    } catch (error) {
      console.error('Failed to load project:', error)
      navigate('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const initializeEditor = () => {
    if (!project) return

    const grapesjs = (window as any).grapesjs
    const gjsPresetWebpage = (window as any).gjsPresetWebpage
    const gjsBlocksBasic = (window as any).gjsBlocksBasic

    if (!grapesjs) return

    const grapesEditor = grapesjs.init({
      container: editorRef.current!,
      height: '100vh',
      width: '100%',
      plugins: [gjsPresetWebpage, gjsBlocksBasic],
      pluginsOpts: {
        [gjsPresetWebpage]: {
          modalImportTitle: 'Import Template',
          modalImportLabel: '<div style="margin-bottom: 10px; font-size: 13px;">Paste here your HTML/CSS and click Import</div>',
          modalImportContent: function(editor: any) {
            return editor.getHtml() + '<style>' + editor.getCss() + '</style>'
          },
        }
      },
      storageManager: {
        type: 'local',
        autosave: false,
        options: {
          local: {
            key: `grapesjs-project-${projectId}`
          }
        }
      }
    })

    // Load project data
    try {
      if (project.grapejsData && project.grapejsData !== '{}') {
        grapesEditor.loadProjectData(JSON.parse(project.grapejsData))
      } else if (project.htmlContent || project.cssContent) {
        grapesEditor.setComponents(project.htmlContent || '')
        grapesEditor.setStyle(project.cssContent || '')
      }
    } catch (error) {
      console.error('Failed to load project data:', error)
    }

    // Add save command
    grapesEditor.Commands.add('save-project', {
      run: () => saveProject()
    })

    // Add publish command
    grapesEditor.Commands.add('publish-project', {
      run: () => publishProject()
    })

    // Add custom buttons to toolbar
    grapesEditor.Panels.addButton('options', [{
      id: 'save-btn',
      className: 'btn-save',
      label: '💾 Save',
      command: 'save-project',
      attributes: { title: 'Save Project' }
    }, {
      id: 'publish-btn',
      className: 'btn-publish',
      label: '🚀 Publish',
      command: 'publish-project',
      attributes: { title: 'Publish Project' }
    }])

    setEditor(grapesEditor)
  }

  const saveProject = async () => {
    if (!editor || !project) return

    setSaving(true)
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      const projectData = editor.getProjectData()
      
      await api.post(`/api/builder/projects/${project.id}/save`, {
        htmlContent: editor.getHtml(),
        cssContent: editor.getCss(),
        jsContent: editor.getJs ? editor.getJs() : '',
        grapejsData: JSON.stringify(projectData)
      }, {
        headers: { 'X-User-ID': user.username }
      })

      // Show success message
      if (editor.Modal) {
        editor.Modal.open({
          title: 'Success!',
          content: 'Project saved successfully.',
        })
        
        setTimeout(() => editor.Modal.close(), 2000)
      }
    } catch (error) {
      console.error('Failed to save project:', error)
      if (editor.Modal) {
        editor.Modal.open({
          title: 'Error',
          content: 'Failed to save project. Please try again.',
        })
      }
    } finally {
      setSaving(false)
    }
  }

  const publishProject = async () => {
    if (!project) return

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      await api.post(`/api/builder/projects/${project.id}/publish`, {}, {
        headers: { 'X-User-ID': user.username }
      })

      if (editor?.Modal) {
        editor.Modal.open({
          title: 'Published!',
          content: `Project published successfully! You can view it at: <br><a href="/public/projects/${project.id}/render" target="_blank">View Published Project</a>`,
        })
      } else {
        alert('Project published successfully!')
      }
    } catch (error) {
      console.error('Failed to publish project:', error)
      if (editor?.Modal) {
        editor.Modal.open({
          title: 'Error',
          content: 'Failed to publish project. Please try again.',
        })
      } else {
        alert('Failed to publish project. Please try again.')
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading project...</p>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Project not found</h2>
          <button 
            onClick={() => navigate('/dashboard')}
            className="btn-primary"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  if (!grapesLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading builder...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="builder-container">
      {/* Header */}
      <div className="builder-header bg-white border-b px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate('/projects')}
            className="text-gray-600 hover:text-gray-800 px-3 py-1 rounded border"
          >
            ← Back
          </button>
          <h1 className="text-lg font-semibold">{project.name}</h1>
          {saving && <span className="text-sm text-gray-500">Saving...</span>}
        </div>
        <div className="flex space-x-2">
          <button 
            onClick={saveProject}
            disabled={saving || !editor}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Saving...' : '💾 Save'}
          </button>
          <button 
            onClick={publishProject}
            disabled={!editor}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
          >
            🚀 Publish
          </button>
        </div>
      </div>

      {/* Builder Workspace */}
      <div className="builder-workspace flex-1">
        <div ref={editorRef} className="w-full h-full"></div>
      </div>

      <style>{`
        .builder-container {
          height: 100vh;
          display: flex;
          flex-direction: column;
        }
        
        .builder-workspace {
          flex: 1;
          position: relative;
          overflow: hidden;
        }
        
        /* GrapesJS Custom Styles */
        .gjs-pn-panel {
          background: #fff !important;
        }
        
        .btn-save {
          background: #28a745 !important;
          color: white !important;
          margin-right: 5px !important;
        }
        
        .btn-publish {
          background: #007bff !important;
          color: white !important;
        }
        
        .gjs-pn-btn {
          padding: 8px 12px !important;
          border-radius: 4px !important;
        }
        
        .gjs-editor {
          height: 100% !important;
        }
      `}</style>
    </div>
  )
}
