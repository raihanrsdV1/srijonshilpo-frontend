import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { builderService } from '../services/api'
import SmartObjectsManager from '../components/SmartObjectsManager'
import SmartObjectCustomizer from '../components/SmartObjectCustomizer'
import AssetManager from '../components/AssetManager'
import ResizeManager from '../utils/ResizeManager'
import MagneticGrid from '../utils/MagneticGrid'
import '../utils/TestSuite'
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
  const [resizeManager, setResizeManager] = useState<ResizeManager | null>(null)
  const [magneticGrid, setMagneticGrid] = useState<MagneticGrid | null>(null)
  const [selectedSmartObject, setSelectedSmartObject] = useState<any>(null)
  const [smartObjectsMode, setSmartObjectsMode] = useState(false)
  const [blockSearch, setBlockSearch] = useState('')
  const [showSmartOnly, setShowSmartOnly] = useState(false)
  const [rightPanelWidth, setRightPanelWidth] = useState<number>(320)
  const [activeDevice, setActiveDevice] = useState<'Desktop' | 'Tablet' | 'Mobile'>('Desktop')
  const [zoom, setZoom] = useState<number>(100)
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
  const onDevice = () => setActiveDevice((editor.getDevice() as 'Desktop' | 'Tablet' | 'Mobile') || 'Desktop')
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

  // Setup simple end drop zone in viewport
  const setupEndDropZone = (editor: any) => {
    // Store currently dragged block
    let currentDraggedBlock: any = null
    
    // Listen for block drag start to capture the block
    editor.on('block:drag:start', (block: any) => {
      currentDraggedBlock = block
      console.log('Block drag started:', block)
    })
    
    editor.on('block:drag:stop', () => {
      currentDraggedBlock = null
    })
    
    // Create a simple drop zone element in the viewport
    const createEndDropZone = () => {
      setTimeout(() => {
        const canvasViewport = document.querySelector('.canvas-viewport')
        if (!canvasViewport) return
        
        // Remove existing drop zone
        const existingZone = canvasViewport.querySelector('.end-drop-zone')
        if (existingZone) {
          existingZone.remove()
        }
        
        // Create drop zone element
        const dropZone = document.createElement('div')
        dropZone.className = 'end-drop-zone'
        dropZone.style.cssText = `
          position: absolute;
          bottom: 20px;
          left: 20px;
          right: 20px;
          height: 60px;
          border: 2px dashed rgba(59, 130, 246, 0.4);
          border-radius: 8px;
          background: rgba(59, 130, 246, 0.05);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0.8;
          pointer-events: auto;
          z-index: 1000;
        `
        
        dropZone.innerHTML = `
          <div style="
            color: rgba(59, 130, 246, 0.8);
            font-size: 14px;
            font-weight: 500;
          ">
            📍 Drop components here to add at the end
          </div>
        `
        
        // Add drag event handlers
        dropZone.addEventListener('dragover', (e) => {
          e.preventDefault()
          dropZone.style.borderColor = '#22c55e'
          dropZone.style.backgroundColor = 'rgba(34, 197, 94, 0.1)'
        })
        
        dropZone.addEventListener('dragleave', () => {
          dropZone.style.borderColor = 'rgba(59, 130, 246, 0.4)'
          dropZone.style.backgroundColor = 'rgba(59, 130, 246, 0.05)'
        })
        
        dropZone.addEventListener('drop', (e) => {
          e.preventDefault()
          
          try {
            console.log('Drop event triggered, currentDraggedBlock:', currentDraggedBlock)
            
            // Add component to end using GrapesJS
            const wrapper = editor.DomComponents.getWrapper()
            let content = null
            
            // Approach 1: Use the captured dragged block
            if (currentDraggedBlock) {
              content = currentDraggedBlock.get('content') || currentDraggedBlock.get('label')
              console.log('Using captured block content:', content)
            }
            
            // Approach 2: Try block manager
            if (!content) {
              const blockManager = editor.BlockManager
              const draggedBlock = blockManager.getDraggedBlock && blockManager.getDraggedBlock()
              if (draggedBlock) {
                content = draggedBlock.get('content') || draggedBlock.get('label')
                console.log('Using block manager content:', content)
              }
            }
            
            // Approach 3: Get from drag data
            if (!content) {
              const dragData = e.dataTransfer?.getData('text/html') || e.dataTransfer?.getData('text/plain')
              if (dragData) {
                content = dragData
                console.log('Using drag data as content:', content)
              }
            }
            
            // Approach 4: Use a simple default component if nothing else works
            if (!content) {
              content = '<div style="padding: 20px; border: 2px dashed #ccc; text-align: center; background: #f8f9fa;">New Component Added</div>'
              console.log('Using fallback content')
            }
            
            if (content) {
              const newComponent = wrapper.append(content)[0]
              if (newComponent) {
                editor.select(newComponent)
                console.log('Component added to end successfully')
                
                // Scroll to the new component
                setTimeout(() => {
                  const element = newComponent.getEl()
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' })
                  }
                }, 100)
              } else {
                console.warn('Failed to create component from content:', content)
              }
            } else {
              console.warn('No content available to add')
            }
          } catch (error) {
            console.error('Error in drop handler:', error)
            
            // Fallback: add a simple div
            try {
              const wrapper = editor.DomComponents.getWrapper()
              const fallbackContent = '<div style="padding: 20px; background: #e3f2fd; border: 1px solid #2196f3; margin: 10px 0; border-radius: 4px; text-align: center;">Component Added Successfully</div>'
              const newComponent = wrapper.append(fallbackContent)[0]
              if (newComponent) {
                editor.select(newComponent)
                console.log('Fallback component added')
              }
            } catch (fallbackError) {
              console.error('Fallback also failed:', fallbackError)
            }
          }
          
          // Reset styles
          dropZone.style.borderColor = 'rgba(59, 130, 246, 0.4)'
          dropZone.style.backgroundColor = 'rgba(59, 130, 246, 0.05)'
        })
        
        canvasViewport.appendChild(dropZone)
        console.log('End drop zone created in viewport')
      }, 500)
    }
    
    createEndDropZone()
  }

  const initializeEditor = () => {
    if (!project) return

    const grapesjs = (window as any).grapesjs
    const gjsPresetWebpage = (window as any).gjsPresetWebpage
    const gjsBlocksBasic = (window as any).gjsBlocksBasic

    if (!grapesjs) return

    const grapesEditor = grapesjs.init({
      container: editorRef.current!,
      height: 'calc(100vh - 180px)',
      width: '100%',
      
      // Canvas configuration for magnetic grid and proper sizing
      canvas: {
        styles: [
          `
          * { box-sizing: border-box; }
          body { 
            margin: 0; 
            padding: 20px; 
            background: transparent; 
            overflow: auto; 
            min-height: 100vh; 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }
          body.grid-enabled {
            --grid-size: 20px;
            background-image: 
              linear-gradient(to right, rgba(99, 102, 241, 0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(99, 102, 241, 0.1) 1px, transparent 1px);
            background-size: var(--grid-size) var(--grid-size);
            background-position: 0 0;
          }
          .snap-guideline.horizontal { height: 1px; left: 0; right: 0; background: rgba(59, 130, 246, 0.8) !important; }
          .snap-guideline.vertical { width: 1px; top: 0; bottom: 0; background: rgba(59, 130, 246, 0.8) !important; }
          .snap-guideline.center { background: rgba(34, 197, 94, 0.8) !important; }
          .gjs-selected { outline: 2px solid #3b82f6 !important; outline-offset: 2px; }
          `
        ],
        scripts: []
      },
      
      // Essential configuration for blocks to show - use built-in blocks
      plugins: [gjsPresetWebpage, gjsBlocksBasic],
      
      pluginsOpts: {
        [gjsPresetWebpage]: {
          modalImportTitle: 'Import Template',
          modalImportLabel: '<div style="margin-bottom: 10px; font-size: 13px;">Paste here your HTML/CSS and click Import</div>',
          modalImportContent: function(editor: any) {
            return editor.getHtml() + '<style>' + editor.getCss() + '</style>'
          }
        },
        [gjsBlocksBasic]: {
          flexGrid: true
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
      
      // Block manager configuration - let GrapesJS handle block rendering
      blockManager: {
        appendTo: '.blocks-container'
      },

      // Devices (page view options)
      deviceManager: {
        devices: [
          { id: 'Desktop', name: 'Desktop', width: '', widthMedia: '' },
          { id: 'Tablet', name: 'Tablet', width: '768px', widthMedia: '991px' },
          { id: 'Mobile', name: 'Mobile', width: '375px', widthMedia: '575px' },
        ],
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
        // Mount the built-in 'options' panel (where we add grid buttons) into our header container
        defaults: [
          {
            id: 'options',
            el: '.panel__basic-actions',
            buttons: []
          }
        ]
      },

      // Drag and Drop configuration - ensure it works properly
      dragDrop: {
        // Allow dragging from blocks panel
        allowDrop: true,
        showOffsets: true,
        guidesColor: '#3b82f6',
        guidesOpacity: 0.8,
        // Enable drag feedback
        showDropZone: true,
        dropzoneColor: 'rgba(59, 130, 246, 0.1)',
        borderColor: '#3b82f6',
        borderWidth: '2px'
      },

      // Enhanced drop zone configuration
      domComponents: {
        draggableComponents: '*',
        storeWrapper: 1,
        storageType: 'local'
      },

      // Enable all interactions
      allowScripts: true,
      fromElement: false,
      undoManager: true
    })

    // Initialize managers and load project data AFTER the editor is fully loaded
    grapesEditor.on('load', () => {
      // Ensure default device
      try { grapesEditor.setDevice('Desktop') } catch {}

      // Center page wrapper with a reasonable width and proper background
      try {
        const wrapper = grapesEditor.DomComponents.getWrapper()
        // Apply once; avoid repeatedly merging styles
        const existing = wrapper.getStyle() || {}
        wrapper.setStyle({
          ...existing,
          maxWidth: existing.maxWidth || '100%',
          margin: existing.margin || '0',
          background: existing.background || '#ffffff',
          minHeight: existing.minHeight || '100vh',
          padding: existing.padding || '40px',
          boxShadow: existing.boxShadow || 'none',
          borderRadius: existing.borderRadius || '0',
        })
      } catch (e) {
        console.warn('Wrapper style setup skipped:', e)
      }
      // Initialize Smart Objects types and blocks
      try {
        const smartManager = new SmartObjectsManager(grapesEditor)
        setSmartObjectsManager(smartManager)

        // Listen for component selection to show Smart Object customizer
        grapesEditor.on('component:selected', (component: any) => {
          // Always show inspector when a component is selected
          setShowInspector(true)
          
          // Re-render managers when inspector becomes visible
          setTimeout(() => {
            const sm = grapesEditor.StyleManager
            const lm = grapesEditor.LayerManager
            const tm = grapesEditor.TraitManager
            
            const styleEl = document.querySelector('#inspector-styles') as HTMLElement | null
            const layerEl = document.querySelector('#inspector-layers') as HTMLElement | null
            const traitEl = document.querySelector('#inspector-traits') as HTMLElement | null
            
            if (styleEl && sm) {
              try {
                styleEl.innerHTML = ''
                sm.render(styleEl)
              } catch (e) {
                console.warn('StyleManager re-render failed:', e)
              }
            }
            if (layerEl && lm) {
              try {
                layerEl.innerHTML = ''
                lm.render(layerEl)
              } catch (e) {
                console.warn('LayerManager re-render failed:', e)
              }
            }
            if (traitEl && tm) {
              try {
                traitEl.innerHTML = ''
                tm.render(traitEl)
              } catch (e) {
                console.warn('TraitManager re-render failed:', e)
              }
            }
          }, 100)
          
          const attrs = component.get('attributes') || {}
          const smartId = attrs['data-smart-object-id'] || attrs['data-smart-object']
          if (smartId) {
            const template = smartManager.getTemplate(smartId)
            if (template) return setSelectedSmartObject({ component, template })
          }
          setSelectedSmartObject(null)
        })
        
        grapesEditor.on('component:deselected', () => {
          // Keep inspector open but clear smart object selection
          setSelectedSmartObject(null)
        })
      } catch (error) {
        console.error('Failed to initialize Smart Objects Manager:', error)
      }

      // Initialize ResizeManager for component resizing
      const resizeManager = new ResizeManager(grapesEditor)
      setResizeManager(resizeManager)

      // Initialize MagneticGrid for grid-based layout
      const magneticGrid = new MagneticGrid(grapesEditor, {
        size: 20,
        enabled: true,
        snapThreshold: 10,
        showGuides: true
      })
      setMagneticGrid(magneticGrid)
      magneticGrid.toggleGridVisibility(true) // Ensure grid is visible on load

      // Add simple end drop zone functionality
      setupEndDropZone(grapesEditor)

      // Let GrapesJS handle block rendering automatically - blocks should appear from plugins

      // Render core managers into custom containers
      const sm = grapesEditor.StyleManager
      const lm = grapesEditor.LayerManager
      const tm = grapesEditor.TraitManager
      const pm = grapesEditor.Panels
      const cm = grapesEditor.Commands
      
      // Add grid toggle command FIRST
      let gridEnabled = true
      cm.add('toggle-grid', {
        run: (editor: any) => {
          gridEnabled = !gridEnabled
          if (magneticGrid) {
            magneticGrid.toggleGridVisibility(gridEnabled)
          }
          // Update button state
          const btn = pm.getButton('options', 'grid-toggle')
          if (btn) {
            btn.set('active', gridEnabled)
          }
        }
      })
      
      // Add command for appending to end of container
      cm.add('append-to-end', {
        run: (editor: any, sender: any, options: any = {}) => {
          const { component, target } = options
          if (component && target) {
            // Remove component from current position
            component.remove()
            // Append to end of target container
            target.append(component)
            // Select the moved component
            editor.select(component)
          }
        }
      })
      
      // Render managers with proper timing to ensure DOM elements exist
      setTimeout(() => {
        try {
          const styleEl = document.querySelector('#inspector-styles') as HTMLElement | null
          const layerEl = document.querySelector('#inspector-layers') as HTMLElement | null
          const traitEl = document.querySelector('#inspector-traits') as HTMLElement | null
          
          if (styleEl) {
            styleEl.innerHTML = '' // Clear existing content
            sm.render(styleEl)
            console.log('StyleManager rendered successfully')
          } else {
            console.warn('StyleManager container not found')
          }
          
          if (layerEl) {
            layerEl.innerHTML = '' // Clear existing content
            lm.render(layerEl)
            console.log('LayerManager rendered successfully')
          } else {
            console.warn('LayerManager container not found')
          }
          
          if (traitEl) {
            traitEl.innerHTML = '' // Clear existing content
            tm.render(traitEl)
            console.log('TraitManager rendered successfully')
          } else {
            console.warn('TraitManager container not found')
          }
        } catch (error) {
          console.error('Error rendering managers:', error)
        }

        // Add grid toggle button to panels - this should make it visible
        const panel = pm.getPanel('options') || pm.addPanel({
          id: 'options',
          el: '.panel__basic-actions'
        })
        
        panel.get('buttons').add({
          id: 'grid-toggle',
          className: 'btn-grid-toggle',
          label: '⊞ Grid',
          command: 'toggle-grid',
          context: 'toggle-grid',
          attributes: { title: 'Toggle Grid Visibility' },
          active: true
        })

        console.log('Grid toggle button added to panel')

        // Add undo/redo buttons
        panel.get('buttons').add({
          id: 'undo',
          className: 'btn-undo',
          label: '↶',
          command: 'core:undo',
          attributes: { title: 'Undo (Ctrl+Z)' }
        })

        panel.get('buttons').add({
          id: 'redo', 
          className: 'btn-redo',
          label: '↷',
          command: 'core:redo',
          attributes: { title: 'Redo (Ctrl+Y)' }
        })

        console.log('Undo/Redo buttons added to panel')
      }, 300)

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
    })

    // Add image asset trait type
    const tm = grapesEditor.TraitManager
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
          setAssetSelectionCallback(() => (url: string) => {
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

  // Cleanup managers on component unmount
  useEffect(() => {
    return () => {
      if (resizeManager) {
        resizeManager.destroy()
      }
      if (magneticGrid) {
        magneticGrid.destroy()
      }
    }
  }, [resizeManager, magneticGrid])

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
      {/* Modern Header */}
      <div className="builder-header">
        <div className="flex items-center justify-between h-full px-6">
          <div className="flex items-center space-x-6">
            <button 
              onClick={() => navigate('/projects')}
              className="header-back-btn"
            >
              ← Back to Projects
            </button>
            <div>
              <h1 className="text-xl font-bold text-white">{project.name}</h1>
              {project.description && (
                <p className="text-sm text-white/70 mt-1">{project.description}</p>
              )}
            </div>
            {saving && (
              <div className="flex items-center gap-2 text-blue-400">
                <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm font-medium">Saving...</span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setSmartObjectsMode(!smartObjectsMode)}
              className={`header-btn ${smartObjectsMode ? 'header-btn-active' : ''}`}
            >
              🪄 Smart Objects
            </button>
            <button 
              onClick={saveProject}
              disabled={saving || !editor}
              className="header-btn header-btn-success"
            >
              💾 {saving ? 'Saving...' : 'Save'}
            </button>
            <button 
              onClick={publishProject}
              disabled={!editor}
              className="header-btn header-btn-primary"
            >
              🚀 Publish
            </button>
          </div>
        </div>
      </div>

      {/* Builder Workspace */}
      <div className="builder-workspace">
        {/* Left Sidebar: Components */}
        <aside className="builder-sidebar">
          <div className="sidebar-header">
            <h3 className="sidebar-title">Components</h3>
            <div className="sidebar-search">
              <input
                value={blockSearch}
                onChange={(e) => setBlockSearch(e.target.value)}
                placeholder="Search components..."
                className="search-input"
              />
              <span className="search-icon">🔎</span>
            </div>
            <div className="sidebar-filters">
              <button
                onClick={() => setShowSmartOnly((v) => !v)}
                className={`filter-btn ${showSmartOnly ? 'filter-btn-active' : ''}`}
              >
                🪄 Smart Only
              </button>
            </div>
          </div>
          <div className="blocks-container"></div>
        </aside>

        {/* Center: Canvas Area */}
        <div className="builder-canvas-area">
          {/* Canvas Controls */}
          <div className="canvas-controls">
            <div className="canvas-controls-left">
              <div className="device-tabs">
                <button
                  onClick={() => { editor?.setDevice('Desktop'); setActiveDevice('Desktop') }}
                  className={`device-tab ${activeDevice === 'Desktop' ? 'device-tab-active' : ''}`}
                >
                  🖥️ Desktop
                </button>
                <button
                  onClick={() => { editor?.setDevice('Tablet'); setActiveDevice('Tablet') }}
                  className={`device-tab ${activeDevice === 'Tablet' ? 'device-tab-active' : ''}`}
                >
                  📟 Tablet
                </button>
                <button
                  onClick={() => { editor?.setDevice('Mobile'); setActiveDevice('Mobile') }}
                  className={`device-tab ${activeDevice === 'Mobile' ? 'device-tab-active' : ''}`}
                >
                  📱 Mobile
                </button>
              </div>
            </div>
            <div className="canvas-controls-right">
              <div className="zoom-controls">
                <button
                  onClick={() => {
                    if (!editor) return
                    const next = Math.max(25, zoom - 10)
                    editor.Canvas.setZoom(next)
                    setZoom(next)
                  }}
                  className="zoom-btn"
                >
                  −
                </button>
                <span className="zoom-display">{zoom}%</span>
                <button
                  onClick={() => {
                    if (!editor) return
                    const next = Math.min(200, zoom + 10)
                    editor.Canvas.setZoom(next)
                    setZoom(next)
                  }}
                  className="zoom-btn"
                >
                  +
                </button>
                <button
                  onClick={() => { if (!editor) return; editor.Canvas.setZoom(100); setZoom(100) }}
                  className="zoom-reset"
                >
                  Reset
                </button>
              </div>
              <div className="canvas-options panel__basic-actions"></div>
            </div>
          </div>
          
          {/* Canvas Container with Visual Boundaries */}
          <div className="canvas-container">
            <div className={`canvas-viewport canvas-viewport-${activeDevice.toLowerCase()}`}>
              <div 
                ref={editorRef} 
                className="canvas-editor"
              ></div>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Properties */}
        <aside className="builder-properties">
          {selectedSmartObject ? (
            <div className="properties-panel">
              <div className="properties-header">
                <h3 className="properties-title">Smart Object Settings</h3>
                <button
                  onClick={() => setSelectedSmartObject(null)}
                  className="properties-close"
                >
                  ✕
                </button>
              </div>
              <SmartObjectCustomizer
                template={selectedSmartObject.template}
                selectedComponent={selectedSmartObject.component}
                onCustomizationChange={handleSmartObjectCustomization}
              />
            </div>
          ) : showInspector ? (
            <div className="properties-panel photoshop-style">
              {/* Top Section (60%): Object Properties */}
              <div className="properties-top-section">
                <div className="properties-header">
                  <h3 className="properties-title">Properties</h3>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <button
                      onClick={() => {
                        // Force re-render all panels
                        setTimeout(() => {
                          if (editor) {
                            const sm = editor.StyleManager
                            const lm = editor.LayerManager
                            const tm = editor.TraitManager
                            
                            const styleEl = document.querySelector('#inspector-styles') as HTMLElement | null
                            const layerEl = document.querySelector('#inspector-layers') as HTMLElement | null
                            const traitEl = document.querySelector('#inspector-traits') as HTMLElement | null
                            
                            if (styleEl && sm) {
                              try {
                                styleEl.innerHTML = ''
                                sm.render(styleEl)
                                console.log('StyleManager force refreshed')
                              } catch (e) {
                                console.warn('StyleManager refresh failed:', e)
                              }
                            }
                            if (layerEl && lm) {
                              try {
                                layerEl.innerHTML = ''
                                lm.render(layerEl)
                                console.log('LayerManager force refreshed')
                              } catch (e) {
                                console.warn('LayerManager refresh failed:', e)
                              }
                            }
                            if (traitEl && tm) {
                              try {
                                traitEl.innerHTML = ''
                                tm.render(traitEl)
                                console.log('TraitManager force refreshed')
                              } catch (e) {
                                console.warn('TraitManager refresh failed:', e)
                              }
                            }
                          }
                        }, 50)
                      }}
                      style={{
                        background: 'rgba(59, 130, 246, 0.2)',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        color: '#60a5fa',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                      title="Refresh panels if they're not showing"
                    >
                      🔄
                    </button>
                    <button
                      onClick={() => setShowInspector(false)}
                      className="properties-close"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                
                <div className="properties-tabs">
                  <button 
                    onClick={() => {
                      setInspectorTab('styles')
                      // Re-render StyleManager when switching to styles tab
                      setTimeout(() => {
                        if (editor) {
                          const sm = editor.StyleManager
                          const styleEl = document.querySelector('#inspector-styles') as HTMLElement | null
                          if (styleEl && sm) {
                            try {
                              styleEl.innerHTML = ''
                              sm.render(styleEl)
                            } catch (e) {
                              console.warn('StyleManager tab re-render failed:', e)
                            }
                          }
                        }
                      }, 50)
                    }} 
                    className={`properties-tab ${inspectorTab==='styles'?'properties-tab-active':''}`}
                  >
                    🎨 Styles
                  </button>
                  <button 
                    onClick={() => {
                      setInspectorTab('traits')
                      // Re-render TraitManager when switching to traits tab
                      setTimeout(() => {
                        if (editor) {
                          const tm = editor.TraitManager
                          const traitEl = document.querySelector('#inspector-traits') as HTMLElement | null
                          if (traitEl && tm) {
                            try {
                              traitEl.innerHTML = ''
                              tm.render(traitEl)
                            } catch (e) {
                              console.warn('TraitManager tab re-render failed:', e)
                            }
                          }
                        }
                      }, 50)
                    }} 
                    className={`properties-tab ${inspectorTab==='traits'?'properties-tab-active':''}`}
                  >
                    ⚙️ Settings
                  </button>
                </div>
                
                <div className="properties-content">
                  <div id="inspector-styles" style={{ display: inspectorTab==='styles' ? 'block' : 'none' }}></div>
                  <div id="inspector-traits" style={{ display: inspectorTab==='traits' ? 'block' : 'none' }}></div>
                </div>
              </div>
              
              {/* Bottom Section (40%): Layer Management */}
              <div className="properties-bottom-section">
                <div className="layers-header">
                  <h3 className="layers-title">🗂️ Layers</h3>
                </div>
                <div className="layers-content">
                  <div id="inspector-layers"></div>
                </div>
              </div>
            </div>
          ) : (
            <div className="properties-panel">
              <div className="properties-placeholder">
                <div className="placeholder-content">
                  <div className="placeholder-icon">🎨</div>
                  <h3>Select an Element</h3>
                  <p>Choose an element to edit its properties and see them in the panels above</p>
                  <div className="placeholder-hint">
                    <strong>Layout Structure:</strong><br/>
                    • Top 60%: Object properties & styling<br/>
                    • Bottom 40%: Layer management & hierarchy
                  </div>
                  <button 
                    onClick={() => setShowInspector(true)}
                    className="placeholder-btn"
                  >
                    Open Inspector
                  </button>
                </div>
              </div>
            </div>
          )}
        </aside>
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
