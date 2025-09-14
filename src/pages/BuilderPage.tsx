import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { builderService } from '../services/api'
import SmartObjectsManager from '../components/SmartObjectsManager'
import SmartObjectCustomizer from '../components/SmartObjectCustomizer'
import AssetManager from '../components/AssetManager'
import '../styles/builder.css'
import '../styles/smartObjects.css'
import '../components/SmartObjectCustomizer.css'

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
  const [smartObjectsManager, setSmartObjectsManager] = useState<SmartObjectsManager | null>(null)
  const [selectedSmartObject, setSelectedSmartObject] = useState<any>(null)
  const [smartObjectsMode, setSmartObjectsMode] = useState(false)
  const [blockSearch, setBlockSearch] = useState('')
  const [showSmartOnly, setShowSmartOnly] = useState(false)
  const [rightPanelWidth, setRightPanelWidth] = useState<number>(320)
  const [activeDevice, setActiveDevice] = useState<'Desktop' | 'Mobile'>('Desktop')
  const [showInspector, setShowInspector] = useState<boolean>(false)
  const [inspectorTab, setInspectorTab] = useState<'styles' | 'layers' | 'traits'>('styles')
  const [showAssetManager, setShowAssetManager] = useState<boolean>(false)
  const [assetSelectionCallback, setAssetSelectionCallback] = useState<((url: string) => void) | null>(null)

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

  // Live filter for blocks (search + smart-only)
  useEffect(() => {
    if (!editor) return
    const container = document.querySelector('.blocks-container') as HTMLElement | null
    if (!container) return
    const blocks = Array.from(container.querySelectorAll('.gjs-block')) as HTMLElement[]
    const query = blockSearch.trim().toLowerCase()
    blocks.forEach((el) => {
      const label = (el.querySelector('.gjs-block-label')?.textContent || '').toLowerCase()
      const isSmart = el.classList.contains('smart-object-block')
      const matchSearch = !query || label.includes(query)
      const matchSmart = !showSmartOnly || isSmart
      el.style.display = matchSearch && matchSmart ? '' : 'none'
    })
  }, [editor, blockSearch, showSmartOnly])

  // Keyboard shortcuts: Save (Cmd/Ctrl+S) and Publish (Cmd/Ctrl+Shift+P)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!editor) return
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
      const ctrlOrCmd = isMac ? e.metaKey : e.ctrlKey
      if (ctrlOrCmd && e.key.toLowerCase() === 's') {
        e.preventDefault()
        saveProject()
      }
      if (ctrlOrCmd && e.shiftKey && e.key.toLowerCase() === 'p') {
        e.preventDefault()
        publishProject()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [editor, project])

  // Track device changes
  useEffect(() => {
    if (!editor) return
    const onDevice = () => setActiveDevice((editor.getDevice() as any) || 'Desktop')
    editor.on('change:device', onDevice)
    return () => {
      editor.off('change:device', onDevice)
    }
  }, [editor])

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
      const data = await builderService.getProject(Number(projectId))
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
      
      // Essential configuration for blocks to show
      plugins: [gjsPresetWebpage, gjsBlocksBasic],
      
      pluginsOpts: {
        [gjsPresetWebpage]: {
          modalImportTitle: 'Import Template',
          modalImportLabel: '<div style="margin-bottom: 10px; font-size: 13px;">Paste here your HTML/CSS and click Import</div>',
          modalImportContent: function(editor: any) {
            return editor.getHtml() + '<style>' + editor.getCss() + '</style>'
          },
          // Ensure basic blocks are available
          blocks: ['column1', 'column2', 'column3', 'text', 'link', 'image', 'video', 'map'],
          // Show the blocks panel by default
          showBlocksPanel: true,
        },
        [gjsBlocksBasic]: {
          blocks: ['column1', 'column2', 'column3', 'text', 'link', 'image', 'video', 'map'],
          flexGrid: true,
        }
      },
      
      // Storage configuration
      storageManager: {
        type: 'local',
        autosave: false,
        options: {
          local: {
            key: `grapesjs-project-${projectId}`
          }
        }
      },
      
      // Block manager configuration to ensure blocks are visible
      blockManager: {
        appendTo: '.blocks-container',
        blocks: [
          'column1', 'column2', 'column3', 'text', 'link', 'image', 'video', 'map'
        ]
      },

      // Style Manager for in-depth element control
      styleManager: {
        sectors: [
          {
            name: 'Layout',
            open: false,
            buildProps: ['display', 'position', 'top', 'right', 'bottom', 'left', 'z-index', 'overflow'],
          },
          {
            name: 'Spacing',
            open: true,
            buildProps: ['margin', 'padding'],
            properties: [
              { property: 'margin', type: 'composite' },
              { property: 'padding', type: 'composite' },
            ],
          },
          {
            name: 'Typography',
            open: true,
            buildProps: ['font-family', 'font-size', 'font-weight', 'line-height', 'letter-spacing', 'color', 'text-align'],
          },
          {
            name: 'Background',
            open: false,
            buildProps: ['background-color', 'background-image', 'background-repeat', 'background-position', 'background-size'],
            properties: [
              { property: 'background-image', type: 'file' },
              { property: 'background-size', type: 'select', options: [
                { id: 'auto', label: 'Auto' },
                { id: 'cover', label: 'Cover' },
                { id: 'contain', label: 'Contain' }
              ]}
            ]
          },
          {
            name: 'Borders',
            open: false,
            buildProps: ['border', 'border-width', 'border-style', 'border-color', 'border-radius'],
          },
          {
            name: 'Effects',
            open: false,
            buildProps: ['box-shadow', 'opacity', 'transform'],
          },
          {
            name: 'Theme',
            open: false,
            properties: [
              { property: '--primary-color', type: 'color', name: 'Primary' },
              { property: '--secondary-color', type: 'color', name: 'Secondary' },
              { property: '--accent-color', type: 'color', name: 'Accent' },
              { property: '--background-color', type: 'color', name: 'Background' },
              { property: '--text-color', type: 'color', name: 'Text' },
            ],
          },
        ]
      },

      // Panel configuration
      panels: {
        defaults: [{
          id: 'basic-actions',
          el: '.panel__basic-actions',
          buttons: [{
            id: 'visibility',
            active: true,
            className: 'btn-toggle-borders',
            label: '<i class="fa fa-clone"></i>',
            command: 'sw-visibility',
          }, {
            id: 'export',
            className: 'btn-open-export',
            label: '<i class="fa fa-code"></i>',
            command: 'export-template',
            context: 'export-template',
          }, {
            id: 'show-json',
            className: 'btn-show-json',
            label: '<i class="fa fa-edit"></i>',
            context: 'show-json',
            command(editor: any) {
              editor.Modal.setTitle('Components JSON')
                .setContent(`<textarea style="width:100%; height: 250px;">
                  ${JSON.stringify(editor.getComponents(), null, 2)}
                </textarea>`)
                .open();
            },
          }]
        }, {
          id: 'panel-devices',
          el: '.panel__devices',
          buttons: [{
            id: 'device-desktop',
            label: '<i class="fa fa-desktop"></i>',
            command: 'set-device-desktop',
            active: true,
            togglable: false,
          }, {
            id: 'device-mobile',
            label: '<i class="fa fa-mobile"></i>',
            command: 'set-device-mobile',
            togglable: false,
          }]
        }]
      }
    })

    // Initialize Smart Objects types and blocks BEFORE loading project data
    try {
      const smartManager = new SmartObjectsManager(grapesEditor)
      setSmartObjectsManager(smartManager)
      // Listen for component selection to show Smart Object customizer
      grapesEditor.on('component:selected', (component: any) => {
        const smartObjectId = component.get('attributes')?.['data-smart-object-id']
        if (smartObjectId) {
          const template = smartManager.getTemplate(smartObjectId)
          if (template) {
            setSelectedSmartObject({ component, template })
          }
        } else {
          setSelectedSmartObject(null)
        }
      })
      grapesEditor.on('component:deselected', () => {
        setSelectedSmartObject(null)
      })
    } catch (error) {
      console.error('Failed to initialize Smart Objects Manager:', error)
    }

    // Ensure blocks panel visibility when editor finishes loading
    grapesEditor.on('load', () => {
      const panelsViews = grapesEditor.Panels.getPanel('views-container')
      if (panelsViews) {
        panelsViews.set('visible', true)
      }
      // Render core managers into custom containers if present
      const sm = grapesEditor.StyleManager
      const lm = grapesEditor.LayerManager
      const tm = grapesEditor.TraitManager
      
      // Add image asset trait type
      tm.addType('image-asset', {
        createInput({ trait }: { trait: any }) {
          const input = document.createElement('div')
          input.className = 'image-asset-input'
          
          const preview = document.createElement('div')
          preview.className = 'image-preview'
          
          const img = document.createElement('img')
          img.style.width = '100%'
          img.style.height = '60px'
          img.style.objectFit = 'cover'
          img.style.borderRadius = '6px'
          img.style.border = '1px solid #e5e7eb'
          
          const button = document.createElement('button')
          button.textContent = '📁 Select Image'
          button.className = 'asset-select-btn'
          button.style.cssText = `
            width: 100%;
            padding: 8px;
            margin-top: 8px;
            background: #3b82f6;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 12px;
          `
          
          const updatePreview = (url: string) => {
            if (url) {
              img.src = url
              img.style.display = 'block'
            } else {
              img.style.display = 'none'
            }
          }
          
          button.addEventListener('click', () => {
            setAssetSelectionCallback((url: string) => {
              trait.set('value', url)
              updatePreview(url)
            })
            setShowAssetManager(true)
          })
          
          // Initialize
          updatePreview(trait.get('value'))
          
          preview.appendChild(img)
          input.appendChild(preview)
          input.appendChild(button)
          
          return input
        }
      })
      
      const styleEl = document.querySelector('#inspector-styles') as HTMLElement | null
      const layerEl = document.querySelector('#inspector-layers') as HTMLElement | null
      const traitEl = document.querySelector('#inspector-traits') as HTMLElement | null
      if (styleEl) sm.render(styleEl)
      if (layerEl) lm.render(layerEl)
      if (traitEl) tm.render(traitEl)
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

    // Add save command (use editor instance passed by GrapesJS)
    grapesEditor.Commands.add('save-project', {
      run: async (ed: any) => {
        if (!project) return
        const e = ed || grapesEditor
        setSaving(true)
        try {
          const projectData = e.getProjectData()
          await builderService.saveProject(project.id, {
            htmlContent: e.getHtml(),
            cssContent: e.getCss(),
            jsContent: e.getJs ? e.getJs() : '',
            grapejsData: JSON.stringify(projectData)
          })
          console.log('Project saved successfully')
        } catch (error) {
          console.error('Failed to save project:', error)
        } finally {
          setSaving(false)
        }
      }
    })

    // Add publish command
    grapesEditor.Commands.add('publish-project', {
      run: async () => {
        if (!project) return
        try {
          await builderService.publishProject(project.id)
          console.log('Project published successfully')
        } catch (error) {
          console.error('Failed to publish project:', error)
        }
      }
    })

    // Add Smart Objects toggle command
    grapesEditor.Commands.add('toggle-smart-objects', {
      run: () => {
        setSmartObjectsMode(!smartObjectsMode)
      }
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
    }, {
      id: 'smart-objects-btn',
      className: 'btn-smart-objects',
      label: '🪄 Smart Objects',
      command: 'toggle-smart-objects',
      attributes: { title: 'Toggle Smart Objects Mode' },
      active: smartObjectsMode
    }])

    setEditor(grapesEditor)
  }

  const saveProject = async () => {
    if (!editor || !project) return

    setSaving(true)
    try {
      const projectData = editor.getProjectData()
      
      await builderService.saveProject(project.id, {
        htmlContent: editor.getHtml(),
        cssContent: editor.getCss(),
        jsContent: editor.getJs ? editor.getJs() : '',
        grapejsData: JSON.stringify(projectData)
      })

      console.log('Project saved successfully')
    } catch (error) {
      console.error('Failed to save project:', error)
    } finally {
      setSaving(false)
    }
  }

  const publishProject = async () => {
    if (!project || !editor) return

    try {
      await builderService.publishProject(project.id)
      console.log('Project published successfully')
    } catch (error) {
      console.error('Failed to publish project:', error)
    }
  }

  const handleSmartObjectCustomization = (property: string, value: any) => {
    if (!selectedSmartObject || !editor) return

    const { component } = selectedSmartObject
    // Helper setters to ensure persistence into the model (and saved data)
    const addAttrs = (attrs: Record<string, any>) => {
      const current = component.get('attributes') || {}
      component.set('attributes', { ...current, ...attrs })
      if (component.addAttributes) {
        try { component.addAttributes(attrs) } catch {}
      }
    }
    const addStyles = (styles: Record<string, any>) => {
      // Support CSS variables and normal CSS props
      if (component.addStyle) {
        component.addStyle(styles)
      } else {
        const current = component.getStyle() || {}
        component.setStyle({ ...current, ...styles })
      }
    }
    const addClasses = (classes: string[]) => {
      classes.forEach(cls => component.addClass && component.addClass(cls))
    }
    const removeClasses = (classes: string[]) => {
      classes.forEach(cls => component.removeClass && component.removeClass(cls))
    }
    
    // Handle different types of customization
    if (property === 'colorScheme') {
      // Apply color scheme to component
      const scheme = value
      addStyles({
        '--primary-color': scheme.primary,
        '--secondary-color': scheme.secondary,
        '--accent-color': scheme.accent,
        '--background-color': scheme.background,
        '--text-color': scheme.text,
      })
      addAttrs({ 'data-color-scheme': scheme.id })
    } else if (property === 'layout') {
      // Apply layout changes
      const layout = value
      // Remove existing layout classes then add the new ones on the model
      removeClasses(['layout-vertical','layout-horizontal','layout-grid','align-left','align-center','align-right','spacing-compact','spacing-normal','spacing-spacious'])
      addClasses([`layout-${layout.direction}`, `align-${layout.alignment}`, `spacing-${layout.spacing}`])
      addAttrs({ 'data-layout': layout.id })
    } else if (property === 'size') {
      // Apply size changes
      const size = value
      addStyles({ width: size.width, height: size.height, transform: `scale(${size.scale})` })
      addAttrs({ 'data-size': size.id })
    } else if (property === 'animation') {
      // Apply animation
      const animation = value
      removeClasses(['animate-fade','animate-slide','animate-scale'])
      addClasses([`animate-${animation.type}`])
      addAttrs({ 'data-animation': animation.id })
    } else if (property.includes('.')) {
      // Handle advanced customization (nested properties)
      const [section, prop] = property.split('.')
      switch (section) {
        case 'spacing':
          addStyles({ padding: `${value}px` })
          break
        case 'typography': {
          const styleMap: Record<string, any> = {
            fontFamily: value,
            fontSize: typeof value === 'number' ? `${value}px` : value,
            fontWeight: value,
            lineHeight: value,
            letterSpacing: typeof value === 'number' ? `${value}px` : value,
          }
          addStyles(styleMap)
          break
        }
        case 'borders': {
          const styleMap: Record<string, any> = {}
          if (prop === 'width') styleMap.borderWidth = `${value}px`
          if (prop === 'style') styleMap.borderStyle = value
          if (prop === 'radius') styleMap.borderRadius = `${value}px`
          if (prop === 'color') styleMap.borderColor = value
          addStyles(styleMap)
          break
        }
        case 'shadows':
          if (prop === 'preset') {
            const presets: Record<string, string> = {
              none: 'none',
              soft: '0 2px 4px rgba(0,0,0,0.1)',
              medium: '0 4px 8px rgba(0,0,0,0.15)',
              hard: '0 8px 16px rgba(0,0,0,0.2)',
              glow: '0 0 20px rgba(59, 130, 246, 0.5)'
            }
            addStyles({ boxShadow: presets[value as keyof typeof presets] || 'none' })
          }
          break
      }
      // Persist as data-* as well for portability
      addAttrs({ [`data-${section}-${prop}`]: value })
    }

    // Trigger editor update
    editor.trigger('component:update', component)
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
      <div className="builder-header bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-6">
          <button 
            onClick={() => navigate('/projects')}
            className="text-gray-600 hover:text-gray-800 px-4 py-2 rounded-lg border border-gray-300 hover:border-gray-400 transition-all duration-200 font-medium flex items-center gap-2"
          >
            ← Back to Projects
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{project.name}</h1>
            {project.description && (
              <p className="text-sm text-gray-600 mt-1">{project.description}</p>
            )}
          </div>
          {saving && (
            <div className="flex items-center gap-2 text-blue-600">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm font-medium">Saving...</span>
            </div>
          )}
        </div>
        <div className="flex items-center space-x-3">
          {/* Device toggles */}
          <div className="hidden md:flex rounded-lg overflow-hidden border border-white/20">
            <button
              disabled={!editor}
              onClick={() => { editor?.setDevice('Desktop'); setActiveDevice('Desktop') }}
              className={`px-3 py-2 text-sm ${activeDevice === 'Desktop' ? 'bg-white/30 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}
              title="Desktop view"
            >
              🖥️ Desktop
            </button>
            <button
              disabled={!editor}
              onClick={() => { editor?.setDevice('Mobile'); setActiveDevice('Mobile') }}
              className={`px-3 py-2 text-sm ${activeDevice === 'Mobile' ? 'bg-white/30 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}
              title="Mobile view"
            >
              📱 Mobile
            </button>
          </div>
          <button
            onClick={() => setShowAssetManager(true)}
            className="px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800"
            title="Manage Assets"
          >
            🖼️ Assets
          </button>
          <button
            onClick={() => setShowInspector((v) => !v)}
            className={`px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 ${
              showInspector
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800'
                : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300'
            }`}
            title="Open Styles/Layers/Traits"
          >
            🧰 Inspector
          </button>
          <button 
            onClick={() => setSmartObjectsMode(!smartObjectsMode)}
            className={`px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2 ${
              smartObjectsMode 
                ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800' 
                : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300'
            }`}
          >
            <span className="text-lg">🪄</span>
            {smartObjectsMode ? 'Exit Smart Mode' : 'Smart Objects'}
          </button>
          <button 
            onClick={saveProject}
            disabled={saving || !editor}
            className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-green-800 disabled:opacity-50 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            <span className="text-lg">💾</span>
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button 
            onClick={publishProject}
            disabled={!editor}
            className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl flex items-center gap-2"
          >
            <span className="text-lg">🚀</span>
            Publish
          </button>
        </div>
      </div>

      {/* Builder Workspace */}
      <div className="builder-workspace flex-1 flex">
        {/* Left Sidebar: Blocks, search, filters */}
        <aside className="builder-sidebar-left hidden md:flex md:flex-col md:w-80 shrink-0 min-h-0">
          <div className="builder-sidebar-top p-3 border-b border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <div className="flex-1 relative">
                <input
                  value={blockSearch}
                  onChange={(e) => setBlockSearch(e.target.value)}
                  placeholder="Search components..."
                  className="w-full rounded-lg bg-white/10 border border-white/20 py-2 pl-9 pr-3 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30"
                />
                <span className="absolute left-2 top-1/2 -translate-y-1/2 text-white/60">🔎</span>
                {blockSearch && (
                  <button
                    onClick={() => setBlockSearch('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                    title="Clear"
                  >
                    ✕
                  </button>
                )}
              </div>
              <button
                onClick={() => setShowSmartOnly((v) => !v)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  showSmartOnly ? 'bg-purple-600/80 text-white' : 'bg-white/10 text-white/80 hover:bg-white/20'
                }`}
                title="Show only Smart Objects"
              >
                🪄 Smart
              </button>
            </div>
            <div className="flex items-center justify-between text-xs text-white/70">
              <span>{showSmartOnly ? 'Showing Smart Objects' : 'Showing all components'}</span>
              <div className="flex gap-2">
                <button
                  className="px-2 py-1 rounded bg-white/10 hover:bg-white/20"
                  onClick={() => {
                    if (!editor) return
                    const cats = editor.BlockManager.getCategories()
                    cats.forEach((c: any) => c.set('open', true))
                  }}
                >
                  Expand All
                </button>
                <button
                  className="px-2 py-1 rounded bg-white/10 hover:bg-white/20"
                  onClick={() => {
                    if (!editor) return
                    const cats = editor.BlockManager.getCategories()
                    cats.forEach((c: any) => c.set('open', false))
                  }}
                >
                  Collapse All
                </button>
              </div>
            </div>
          </div>
          {/* Blocks will be injected here by GrapeJS */}
          <div className="blocks-container flex-1 overflow-y-auto p-2 min-h-0"></div>
        </aside>

        <div 
          ref={editorRef} 
          className={`flex-1 h-full transition-all duration-300 ${smartObjectsMode ? 'smart-objects-mode' : ''}`}
          style={{ marginRight: (selectedSmartObject ? rightPanelWidth : 0) + (showInspector ? 360 : 0) }}
        ></div>
        
        {/* Inspector Drawer */}
        {showInspector && (
          <div className="fixed right-0 top-[73px] bottom-0 bg-white/95 border-l border-gray-200 z-40 w-[360px] backdrop-blur-md">
            <div className="h-12 px-3 flex items-center justify-between border-b border-gray-200">
              <div className="flex gap-2">
                <button onClick={() => setInspectorTab('styles')} className={`px-3 py-1 rounded ${inspectorTab==='styles'?'bg-blue-600 text-white':'bg-gray-100 text-gray-700'}`}>Styles</button>
                <button onClick={() => setInspectorTab('layers')} className={`px-3 py-1 rounded ${inspectorTab==='layers'?'bg-blue-600 text-white':'bg-gray-100 text-gray-700'}`}>Layers</button>
                <button onClick={() => setInspectorTab('traits')} className={`px-3 py-1 rounded ${inspectorTab==='traits'?'bg-blue-600 text-white':'bg-gray-100 text-gray-700'}`}>Traits</button>
              </div>
              <button onClick={() => setShowInspector(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <div className="h-[calc(100%-48px)] overflow-y-auto">
              <div id="inspector-styles" style={{ display: inspectorTab==='styles' ? 'block' : 'none' }} className="p-2"></div>
              <div id="inspector-layers" style={{ display: inspectorTab==='layers' ? 'block' : 'none' }} className="p-2"></div>
              <div id="inspector-traits" style={{ display: inspectorTab==='traits' ? 'block' : 'none' }} className="p-2"></div>
            </div>
          </div>
        )}

        {/* Smart Object Customizer Panel */}
        {selectedSmartObject && (
          <div
            className="fixed right-0 top-0 bottom-0 bg-white border-l border-gray-200 z-50 mt-[73px] overflow-y-auto"
            style={{ width: rightPanelWidth }}
          >
            {/* Drag handle */}
            <div
              className="absolute left-0 top-0 bottom-0 w-1 cursor-col-resize bg-transparent hover:bg-blue-400/40"
              onMouseDown={(e) => {
                e.preventDefault()
                const startX = e.clientX
                const startWidth = rightPanelWidth
                const onMove = (ev: MouseEvent) => {
                  const delta = startX - ev.clientX
                  let next = Math.min(520, Math.max(280, startWidth + delta))
                  setRightPanelWidth(next)
                }
                const onUp = () => {
                  window.removeEventListener('mousemove', onMove)
                  window.removeEventListener('mouseup', onUp)
                }
                window.addEventListener('mousemove', onMove)
                window.addEventListener('mouseup', onUp)
              }}
            />
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Customize {selectedSmartObject.template.name}
                </h3>
                <button
                  onClick={() => setSelectedSmartObject(null)}
                  className="text-gray-400 hover:text-gray-600 text-xl"
                >
                  ×
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {selectedSmartObject.template.description}
              </p>
            </div>
            <SmartObjectCustomizer
              template={selectedSmartObject.template}
              selectedComponent={selectedSmartObject.component}
              onCustomizationChange={handleSmartObjectCustomization}
            />
          </div>
        )}
      </div>
      
      {/* Asset Manager Modal */}
      {showAssetManager && (
        <AssetManager
          onSelectAsset={(url) => {
            if (assetSelectionCallback) {
              assetSelectionCallback(url)
              setAssetSelectionCallback(null)
            }
          }}
          onClose={() => {
            setShowAssetManager(false)
            setAssetSelectionCallback(null)
          }}
        />
      )}
    </div>
  )
}
