import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { builderService } from '../services/api'
import SmartObjectsManager from '../components/SmartObjectsManager'
import SmartObjectCustomizer from '../components/SmartObjectCustomizer'
import AssetManager from '../components/AssetManager'
import UniversalHoverOutline from '../components/UniversalHoverOutline'
import { ReactSettingsPanel } from '../components/ReactSettingsPanel'
import ReactStylesPanel from '../components/ReactStylesPanel'
import { ICON_CATEGORIES, renderIcon } from '../components/IconSystem'
import MagneticGrid from '../utils/MagneticGrid'
import '../utils/TestSuite'
import '../styles/builder.css'
import '../styles/smartObjects.css'
import '../components/SmartObjectCustomizer.css'

// Debug mode flag - set to true for comprehensive logging
const DEBUG_MODE = true

// Debug logger utilities - simplified without in-app console
const debugLog = (...args: any[]) => {
  if (DEBUG_MODE) {
    console.log('🔍 [DEBUG]', ...args)
  }
}

const debugWarn = (...args: any[]) => {
  if (DEBUG_MODE) {
    console.warn('⚠️ [DEBUG]', ...args)
  }
}

const debugError = (...args: any[]) => {
  if (DEBUG_MODE) {
    console.error('❌ [DEBUG]', ...args)
  }
}

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
  const [magneticGrid, setMagneticGrid] = useState<MagneticGrid | null>(null)
  const [hoverOutline, setHoverOutline] = useState<UniversalHoverOutline | null>(null)
  // Debounce/guard for selection handling to prevent repeated heavy work/freezes
  const lastSelectedIdRef = useRef<string | null>(null)
  const [gridSize, setGridSize] = useState<number>(20)
  const [showGridSizeMenu, setShowGridSizeMenu] = useState<boolean>(false)
  const [selectedSmartObject, setSelectedSmartObject] = useState<any>(null)
  const [selectedComponent, setSelectedComponent] = useState<any>(null)
  const [componentType, setComponentType] = useState<string>('')
  const [smartObjectsMode, setSmartObjectsMode] = useState(false)
  const [blockSearch, setBlockSearch] = useState('')
  const [showSmartOnly, setShowSmartOnly] = useState(false)
  const [viewMode, setViewMode] = useState<'icon' | 'compact'>('icon') // Default to icon-only view
  const [rightPanelWidth, setRightPanelWidth] = useState<number>(320)
  const [activeDevice, setActiveDevice] = useState<'Desktop' | 'Tablet' | 'Mobile'>('Desktop')
  const [zoom, setZoom] = useState<number>(100)
  const [showInspector, setShowInspector] = useState<boolean>(true)
  const [inspectorTab, setInspectorTab] = useState<'styles' | 'layers' | 'traits'>('traits')
  const [showAssetManager, setShowAssetManager] = useState<boolean>(false)
  const [assetSelectionCallback, setAssetSelectionCallback] = useState<((url: string) => void) | null>(null)
  
  // New toggles for object highlighting and grid
  const [showObjectHighlights, setShowObjectHighlights] = useState<boolean>(true)
  const [gridViewEnabled, setGridViewEnabled] = useState<boolean>(false)
  
  // Guard against infinite update loops
  const componentUpdateLock = useRef<Set<string>>(new Set())

  // Helper function to determine component type
  const getComponentType = (component: any): string => {
    if (!component) {
      debugError('getComponentType: No component provided')
      return 'unknown'
    }
    
    try {
      debugLog('getComponentType: Analyzing component:', component)
      
      const type = component.get('type') || ''
      const tagName = component.get('tagName') || ''
      
      // Safely get classes - handle different GrapeJS API versions
      let classes: string[] = []
      try {
        const classesObj = component.get('classes')
        if (classesObj && typeof classesObj.getNames === 'function') {
          classes = classesObj.getNames() || []
        } else if (Array.isArray(classesObj)) {
          classes = classesObj
        } else if (typeof classesObj === 'string') {
          classes = classesObj.split(' ').filter(Boolean)
        }
      } catch (classError) {
        debugWarn('getComponentType: Error getting classes:', classError)
        classes = []
      }
      
      const attrs = component.get('attributes') || {}
      
      debugLog('getComponentType: type:', type, 'tagName:', tagName, 'classes:', classes, 'attrs:', attrs)
      
      // Check for smart objects first
      if (attrs['data-smart-object-id'] || attrs['data-smart-object']) {
        debugLog('getComponentType: Detected smart-object')
        return 'smart-object'
      }
      
      // Text components
      if (type === 'text' || tagName === 'span' || tagName === 'p' || 
          tagName === 'h1' || tagName === 'h2' || tagName === 'h3' || 
          tagName === 'h4' || tagName === 'h5' || tagName === 'h6') {
        debugLog('getComponentType: Detected text component')
        return 'text'
      }
    
      // Button components
      if (type === 'button' || tagName === 'button' || 
          classes.includes('btn') || classes.includes('button')) {
        debugLog('getComponentType: Detected button component')
        return 'button'
      }
      
      // Image components
      if (type === 'image' || tagName === 'img') {
        debugLog('getComponentType: Detected image component')
        return 'image'
      }
      
      // Link components
      if (type === 'link' || tagName === 'a') {
        debugLog('getComponentType: Detected link component')
        return 'link'
      }
      
      // Container/div components
      if (type === 'default' || tagName === 'div' || tagName === 'section' || 
          tagName === 'article' || tagName === 'header' || tagName === 'footer') {
        debugLog('getComponentType: Detected container component')
        return 'container'
      }
      
      // Grid/layout components
      if (classes.includes('grid') || classes.includes('flex') || 
          classes.includes('row') || classes.includes('col')) {
        debugLog('getComponentType: Detected grid component')
        return 'grid'
      }
      
      debugLog('getComponentType: Detected as type:', type || 'unknown')
      return type || 'unknown'
    } catch (error) {
      debugError('getComponentType: Fatal error analyzing component:', error)
      return 'unknown'
    }
  }

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

  // Initialize object highlights when editor is ready
  useEffect(() => {
    if (editor && showObjectHighlights) {
      document.body.classList.add('object-highlights-enabled')
    } else {
      document.body.classList.remove('object-highlights-enabled')
    }
  }, [editor, showObjectHighlights])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (editor) {
        editor.destroy()
      }
      document.body.classList.remove('object-highlights-enabled')
    }
  }, [])

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

  // Click outside handler for grid size menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.grid-size-dropdown')) {
        setShowGridSizeMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Apply view mode to blocks container
  useEffect(() => {
    const blocksContainer = document.querySelector('.blocks-container')
    if (blocksContainer) {
      // Remove existing view mode classes
      blocksContainer.classList.remove('view-mode-icon', 'view-mode-compact')
      // Add current view mode class
      blocksContainer.classList.add(`view-mode-${viewMode}`)
    }
  }, [viewMode])

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

  const initializeEditor = (retryCount = 0) => {
    if (!project) return
    
    const maxRetries = 20 // Maximum retry attempts

    debugLog('initializeEditor: Starting initialization', `(attempt ${retryCount + 1}/${maxRetries})`)
    
    // Clean up existing blocks container content to prevent duplication
    if (retryCount === 0) {
      // Destroy any existing GrapesJS instance first
      if (editorRef.current && (window as any).grapesEditorInstance) {
        try {
          (window as any).grapesEditorInstance.destroy()
          delete (window as any).grapesEditorInstance
          debugLog('initializeEditor: Destroyed existing GrapesJS instance')
        } catch (e) {
          debugWarn('initializeEditor: Error destroying existing instance:', e)
        }
      }
      
      const blocksContainer = document.querySelector('.blocks-container')
      if (blocksContainer) {
        // More thorough cleanup - remove all children
        while (blocksContainer.firstChild) {
          blocksContainer.removeChild(blocksContainer.firstChild)
        }
        debugLog('initializeEditor: Cleaned existing blocks container')
      }
    }
    
    // Check if required containers exist (only for containers we actually use)
    const requiredContainers = [
      { id: '#inspector-layers', name: 'LayerManager' },
      { id: '.blocks-container', name: 'BlockManager' }
    ]
    
    const missingContainers = requiredContainers.filter(container => {
      const element = document.querySelector(container.id)
      if (!element) {
        debugWarn(`initializeEditor: Missing container ${container.id} for ${container.name}`)
        return true
      }
      debugLog(`initializeEditor: Found container ${container.id} for ${container.name}`)
      return false
    })
    
    if (missingContainers.length > 0) {
      if (retryCount < maxRetries) {
        debugError('initializeEditor: Missing containers, retrying in 100ms:', missingContainers.map(c => c.name), `(attempt ${retryCount + 1}/${maxRetries})`)
        setTimeout(() => initializeEditor(retryCount + 1), 100)
        return
      } else {
        debugError('initializeEditor: Max retries reached, proceeding without missing containers:', missingContainers.map(c => c.name))
        // Continue initialization even with missing containers
      }
    }
    
    debugLog('initializeEditor: All containers found, proceeding with initialization')

    const grapesjs = (window as any).grapesjs
    const gjsPresetWebpage = (window as any).gjsPresetWebpage
    const gjsBlocksBasic = (window as any).gjsBlocksBasic

    if (!grapesjs) {
      debugError('initializeEditor: GrapesJS not available')
      return
    }

    debugLog('initializeEditor: Creating GrapesJS instance')

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
            overflow: hidden !important; 
            min-height: 100vh; 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }
          body.grid-enabled {
            --grid-size: 20px;
            background-image: 
              linear-gradient(to right, rgba(99, 102, 241, 0.2) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(99, 102, 241, 0.2) 1px, transparent 1px);
            background-size: var(--grid-size) var(--grid-size);
            background-position: 0 0;
          }
          .snap-guideline.horizontal { height: 2px; left: 0; right: 0; background: rgba(59, 130, 246, 0.9) !important; box-shadow: 0 0 4px rgba(59, 130, 246, 0.4); }
          .snap-guideline.vertical { width: 2px; top: 0; bottom: 0; background: rgba(59, 130, 246, 0.9) !important; box-shadow: 0 0 4px rgba(59, 130, 246, 0.4); }
          .snap-guideline.center { background: rgba(34, 197, 94, 0.9) !important; box-shadow: 0 0 6px rgba(34, 197, 94, 0.4); }
          .gjs-selected { outline: 3px dotted #3b82f6 !important; outline-offset: 3px; box-shadow: 0 0 12px rgba(59, 130, 246, 0.4) !important; }
          .gjs-dashed { border: 3px dashed #3b82f6 !important; opacity: 0.9 !important; }
          .gjs-highlighter { background: rgba(59, 130, 246, 0.15) !important; border: 2px dashed #3b82f6 !important; }
          .gjs-cv-canvas { overflow: hidden !important; }
          .gjs-frame-wrapper { overflow: hidden !important; }
          .gjs-frame { border: none !important; }
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

      // Style Manager for in-depth element control - disabled since using React components
      styleManager: {
        // appendTo: '#inspector-styles', // Disabled - using ReactStylesPanel instead
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
      
      // Trait Manager - DISABLED (using React panel instead)
      // traitManager: {
      //   appendTo: '#inspector-traits'
      // },

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

      // Drag and Drop configuration - Fixed for cross-browser compatibility
      dragDrop: {
        // Core drag-drop settings
        allowDrop: true,
        
        // Visual feedback during drag
        showOffsets: true,
        showGuides: true,
        guidesColor: '#3b82f6',
        guidesOpacity: 0.9,
        guidesStroke: 2,
        
        // Drop zone appearance
        showDropZone: true,
        dropzoneColor: 'rgba(59, 130, 246, 0.15)',
        borderColor: '#3b82f6',
        borderWidth: '3px',
        
        // Enhanced compatibility settings
        allowedTargets: '*',
        preventDragOver: false,  // Allow drag over
        showHover: true,         // Show hover indicators
        
        // Fixes for common drag-drop issues
        dragDelay: 0,           // No delay for responsiveness
        dragOffset: 5,          // Minimum pixels to start drag
        useHover: true          // Enable hover detection
      },

      // Enhanced DOM Components configuration for better drag support and resizing
      domComponents: {
        draggableComponents: '*',
        storeWrapper: 1,
        storageType: 'local',
        
        // Better component handling
        avoidInlineStyle: false,
        allowEditableContent: true,
        
        // Drag and drop settings
        dragMode: 'default',    // Use default drag mode (not absolute)
        resetId: false,
        
        // Default component properties - make most components resizable
        componentDefaults: {
          resizable: true,       // Enable GrapesJS built-in resizer
          draggable: true,
          selectable: true,
          hoverable: true,
          // Default minimum dimensions
          style: {
            minWidth: '20px',
            minHeight: '20px'
          }
        }
      },

      // Enable all interactions
      allowScripts: true,
      fromElement: false,
      undoManager: true
    })

    // Store the instance globally for proper cleanup
    ;(window as any).grapesEditorInstance = grapesEditor

    // Initialize managers and load project data AFTER the editor is fully loaded
    grapesEditor.on('load', () => {
      // Verify managers initialization (React panel replaces TraitManager)
      debugLog('Managers available after load:', {
        'StyleManager': !!grapesEditor.StyleManager,
        'LayerManager': !!grapesEditor.LayerManager,
        'ReactSettingsPanel': 'Will be used for traits'
      })
      
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
      // Initialize Smart Objects types and blocks - ONLY ONCE
      try {
        if (!smartObjectsManager) {
          console.log('Creating SmartObjectsManager for the first time')
          const smartManager = new SmartObjectsManager(grapesEditor)
          setSmartObjectsManager(smartManager)
        } else {
          console.log('SmartObjectsManager already exists, skipping re-creation')
        }

        // Listen for component selection with comprehensive trait configuration
        grapesEditor.on('component:selected', (component: any) => {
          debugLog('=== COMPONENT SELECTION EVENT ===')
          debugLog('component:selected - Raw component:', component)

          // Skip repeated heavy work if the same component is reselected
          try {
            const compId = (typeof component.getId === 'function' && component.getId()) || (component as any).ccid || ''
            if (lastSelectedIdRef.current === compId) {
              const tm = grapesEditor.TraitManager
              if (tm && typeof tm.select === 'function') tm.select(component)
              return
            }
            lastSelectedIdRef.current = compId
          } catch {}
          
          // Track selected component and determine its type
          setSelectedComponent(component)
          const detectedType = getComponentType(component)
          debugLog('component:selected - Detected type:', detectedType)
          setComponentType(detectedType)
          setShowInspector(true)

          // AUTO-SWITCH TO SETTINGS TAB when component is selected
          debugLog('component:selected - Switching to traits tab')
          setInspectorTab('traits')

          // Get element properties for display
          const type = component.get('type') || 'div'
          const attrs = component.get('attributes') || {}
          const smartObjectId = attrs['data-smart-object-id'] || attrs['data-smart-object']
          const componentId = component.getId() || component.ccid || 'No ID'
          const tagName = component.get('tagName') || type
          
          debugLog('component:selected - Component details:', { type, smartObjectId, componentId, tagName })
          
          // Update element info display
          const elementInfo = document.querySelector('.element-info')
          if (elementInfo) {
            debugLog('component:selected - Updating element info display')
            const titleElement = elementInfo.querySelector('.element-title')
            const typeElement = elementInfo.querySelector('.element-type')
            const idElement = elementInfo.querySelector('.element-id')
            
            if (titleElement) {
              if (smartObjectId) {
                titleElement.textContent = `Smart Object: ${smartObjectId.replace('smart-', '').replace(/-/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}`
              } else {
                titleElement.textContent = `${type.charAt(0).toUpperCase() + type.slice(1)} Element`
              }
            }
            
            if (typeElement) {
              typeElement.textContent = smartObjectId || tagName || type
            }
            
            if (idElement) {
              idElement.textContent = componentId
            }
          } else {
            debugWarn('component:selected - Element info display not found')
          }

          debugLog('component:selected - Loading trait configurations...')
          // Import and apply comprehensive trait configurations
          import('../utils/TraitConfigurations').then(({ getTraitConfig }) => {
            debugLog('component:selected - TraitConfigurations loaded successfully')
            
            // Get comprehensive trait configuration using detectedType for better mapping
            const traitConfig = getTraitConfig(detectedType || type, smartObjectId)
            
            debugLog('component:selected - Applying comprehensive trait configuration:', traitConfig)
            
            // Ensure StyleManager and TraitManager are ready
            const sm = grapesEditor.StyleManager
            const tm = grapesEditor.TraitManager
            
            debugLog('component:selected - Manager availability:', { 
              styleManager: !!sm, 
              traitManager: !!tm,
              smSelect: !!(sm && typeof sm.select === 'function'),
              tmSelect: !!(tm && typeof tm.select === 'function')
            })
            
            // Set traits on component using GrapeJS's trait system - CORRECT APPROACH
            debugLog('component:selected - Setting comprehensive traits:', traitConfig)
            
            // Apply traits the PROPER GrapesJS way
            component.set('traits', traitConfig)
            
            // Verify that traits were actually set
            setTimeout(() => {
              const verifyTraits = component.get('traits')
              debugLog('Traits verification after set:', {
                'original config length': traitConfig.length,
                'component traits length': verifyTraits ? verifyTraits.length : 'N/A',
                'traits are same': verifyTraits === component.get('traits'),
                'component has traits collection': !!verifyTraits
              })
              
              if (verifyTraits) {
                debugLog('First few traits from component:', verifyTraits.slice(0, 3).map((t: any) => ({
                  name: t.name || t.get?.('name'),
                  type: t.type || t.get?.('type'),
                  label: t.label || t.get?.('label')
                })))
              }
            }, 50)
            
            // Update managers using the correct API
            if (sm && typeof sm.select === 'function') {
              debugLog('component:selected - Selecting component in StyleManager')
              sm.select(component)
            }
            
            // Update our React Settings Panel state
            debugLog('component:selected - Updating React Settings Panel with component')
            setSelectedComponent(component)
            
            debugLog('component:selected - Trait configuration applied successfully')
            console.log('Applied comprehensive trait configuration:', traitConfig.length, 'traits')
          }).catch(error => {
            console.error('Failed to load trait configurations:', error)
            
            // Fallback to basic traits
            const basicTraits = [
              { type: 'text', name: 'id', label: 'Element ID' },
              { type: 'text', name: 'class', label: 'CSS Classes' },
              { type: 'text', name: 'title', label: 'Title Attribute' }
            ]
            
            // Apply fallback traits the CORRECT way
            component.set('traits', basicTraits)
            try {
              const tmLocal = grapesEditor.TraitManager
              if (tmLocal && typeof tmLocal.select === 'function') {
                tmLocal.select(component)
                console.log('Applied fallback traits')
              }
            } catch {}
          })

          // Don't set selectedSmartObject - integrate everything into inspector traits instead
          debugLog('component:selected - Smart object detection completed, traits configured')
        })
        
        grapesEditor.on('component:deselected', () => {
          // Keep inspector open for next selection
          debugLog('component:deselected - Component deselected')
        })
      } catch (error) {
        console.error('Failed to initialize Smart Objects Manager:', error)
      }

      // Initialize Universal Hover Outline system
      const hoverOutlineSystem = new UniversalHoverOutline(grapesEditor)
      setHoverOutline(hoverOutlineSystem)

      // Initialize MagneticGrid for grid-based layout
      const magneticGrid = new MagneticGrid(grapesEditor, {
        size: 20,
        enabled: true,
        snapThreshold: 10,
        showGuides: true
      })
      setMagneticGrid(magneticGrid)
      magneticGrid.toggleGridVisibility(true) // Ensure grid is visible on load

      // Make default component types resizable using GrapesJS built-in resizer
      const domComponents = grapesEditor.DomComponents

      // Update existing basic component types to be resizable
      const componentTypes = ['default', 'image', 'text', 'video', 'link', 'map']
      
      componentTypes.forEach(type => {
        try {
          const existingType = domComponents.getType(type)
          if (existingType) {
            // Extend existing type to add resizable property
            domComponents.addType(type, {
              model: {
                defaults: {
                  ...existingType.model?.defaults,
                  resizable: true,
                  draggable: true,
                  selectable: true,
                  hoverable: true
                }
              }
            })
            console.log(`Made ${type} component resizable`)
          }
        } catch (error) {
          console.warn(`Could not update ${type} component:`, error)
        }
      })

      // Add simple end drop zone functionality
      setupEndDropZone(grapesEditor)

      // Let GrapesJS handle block rendering automatically - blocks should appear from plugins

      // Render core managers into custom containers
      const sm = grapesEditor.StyleManager
      const lm = grapesEditor.LayerManager
      const tm = grapesEditor.TraitManager
      const pm = grapesEditor.Panels
      const cm = grapesEditor.Commands
      
      // Add enhanced grid toggle command FIRST
      let gridEnabled = true
      cm.add('toggle-grid', {
        run: (editor: any) => {
          gridEnabled = !gridEnabled
          if (magneticGrid) {
            magneticGrid.toggleGridVisibility(gridEnabled)
          }
          // Update button state with enhanced visual feedback
          const btn = pm.getButton('options', 'grid-toggle')
          if (btn) {
            btn.set('active', gridEnabled)
            // Update button appearance based on state
            const btnEl = btn.get('el')
            if (btnEl) {
              if (gridEnabled) {
                btnEl.classList.add('grid-active')
                btnEl.style.background = '#3b82f6'
                btnEl.style.color = 'white'
                btnEl.style.boxShadow = '0 0 8px rgba(59, 130, 246, 0.4)'
                btnEl.innerHTML = '⊞ Grid ON'
              } else {
                btnEl.classList.remove('grid-active')
                btnEl.style.background = ''
                btnEl.style.color = ''
                btnEl.style.boxShadow = ''
                btnEl.innerHTML = '⊞ Grid OFF'
              }
            }
          }
          console.log('Grid toggled:', gridEnabled ? 'ON' : 'OFF')
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
          
          // NOTE: TraitManager replaced with ReactSettingsPanel - no rendering needed
          console.log('ReactSettingsPanel will handle traits (no TraitManager needed)')
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
          className: 'btn-grid-toggle grid-active',
          label: '⊞ Grid ON',
          command: 'toggle-grid',
          context: 'toggle-grid',
          attributes: { 
            title: 'Toggle Grid Visibility (ON/OFF)',
            style: 'background: #3b82f6; color: white; box-shadow: 0 0 8px rgba(59, 130, 246, 0.4); border-radius: 4px; transition: all 0.2s ease;'
          },
          active: true
        })

        console.log('Grid toggle button added to panel')

        // Add enhanced button styling
        const addButtonStyling = () => {
          const styleEl = document.createElement('style')
          styleEl.innerHTML = `
            .btn-grid-toggle {
              position: relative;
              transition: all 0.3s ease !important;
              border-radius: 6px !important;
              font-weight: 600 !important;
              min-width: 80px !important;
              text-align: center !important;
            }
            
            .btn-grid-toggle:hover {
              transform: translateY(-1px) !important;
              box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4) !important;
            }
            
            .btn-grid-toggle.grid-active {
              background: linear-gradient(135deg, #3b82f6, #1d4ed8) !important;
              color: white !important;
              box-shadow: 0 0 8px rgba(59, 130, 246, 0.4) !important;
            }
            
            .btn-grid-toggle:not(.grid-active) {
              background: #f3f4f6 !important;
              color: #6b7280 !important;
              border: 2px solid #d1d5db !important;
            }
            
            .btn-undo, .btn-redo {
              transition: all 0.2s ease !important;
              border-radius: 4px !important;
              min-width: 36px !important;
              text-align: center !important;
            }
            
            .btn-undo:hover, .btn-redo:hover {
              background: #f3f4f6 !important;
              transform: translateY(-1px) !important;
            }
          `
          document.head.appendChild(styleEl)
          console.log('Enhanced button styling added')
        }
        
        setTimeout(addButtonStyling, 100)

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

    // Add trait change event handlers to ensure visual updates
    grapesEditor.on('component:update', (component: any) => {
      debugLog('=== component:update EVENT ===')
      debugLog('Updated component:', component)
      
      // Prevent infinite loops
      const componentId = component.getId?.() || component.cid || 'unknown'
      if (componentUpdateLock.current.has(componentId)) {
        debugWarn('Already processing component:update for', componentId, 'skipping to prevent infinite loop')
        return
      }
      
      componentUpdateLock.current.add(componentId)
      
      try {
        const traits = component.get('traits')
        debugLog('Component traits:', traits)
        
        if (traits && traits.length > 0) {
          debugLog('Processing', traits.length, 'traits for component update...')
          
          // Apply trait values to component attributes and styles
          traits.forEach((trait: any, index: number) => {
            const name = trait.get('name')
            const value = trait.get('value')
            
            debugLog(`Processing trait ${index + 1}/${traits.length}: ${name} = ${value}`)
            
            if (value) {
              // Handle different trait types
              switch(name) {
                case 'content':
                  debugLog('Updating component content:', value)
                  if (component.set) {
                    component.set('content', value)
                  }
                  break
                case 'src':
                  debugLog('Updating component src attribute:', value)
                component.addAttributes({ src: value })
                break
              case 'alt':
                component.addAttributes({ alt: value })
                break
              case 'href':
                component.addAttributes({ href: value })
                break
              case 'target':
                component.addAttributes({ target: value })
                break
              case 'placeholder':
                component.addAttributes({ placeholder: value })
                break
              case 'colorScheme':
                // Apply color scheme styling
                if (value === 'modern') {
                  component.addStyle({ 
                    '--primary-color': '#3b82f6',
                    '--secondary-color': '#1e40af',
                    '--accent-color': '#06b6d4'
                  })
                } else if (value === 'warm') {
                  component.addStyle({ 
                    '--primary-color': '#f97316',
                    '--secondary-color': '#ea580c',
                    '--accent-color': '#dc2626'
                  })
                } else if (value === 'cool') {
                  component.addStyle({ 
                    '--primary-color': '#06b6d4',
                    '--secondary-color': '#0891b2',
                    '--accent-color': '#0d9488'
                  })
                }
                break
              case 'align':
              case 'textAlignment':
                component.addStyle({ 'text-align': value })
                break
              case 'width':
                component.addStyle({ width: value + 'px' })
                break
              case 'height':
                component.addStyle({ height: value + 'px' })
                break
              default:
                // For other traits, try to apply as attributes
                if (value !== undefined && value !== '') {
                  component.addAttributes({ [name]: value })
                }
            }
          }
        })
        
        // Trigger component refresh
        component.view?.render()
      }
      } finally {
        // Remove from lock after a small delay
        setTimeout(() => {
          componentUpdateLock.current.delete(componentId)
        }, 50)
      }
    })
    
    // Also listen for trait changes specifically
    grapesEditor.on('component:update:traits', (component: any) => {
      debugLog('=== component:update:traits EVENT ===')
      debugLog('Component with updated traits:', component)
      
      const smartObjectId = component.get('attributes')?.['data-smart-object-id']
      debugLog('Smart Object ID:', smartObjectId)
      
      // Prevent double processing
      const componentId = component.getId?.() || component.cid || 'unknown'
      const traitUpdateKey = `traits-${componentId}`
      
      if (componentUpdateLock.current.has(traitUpdateKey)) {
        debugWarn('Already processing trait update for', componentId, 'skipping')
        return
      }
      
      componentUpdateLock.current.add(traitUpdateKey)
      
      try {
        // Force re-render when traits change
        if (component.view) {
          debugLog('Re-rendering component view after trait update')
          component.view.render()
        } else {
          debugWarn('No view available for component trait update')
        }
      } finally {
        setTimeout(() => {
          componentUpdateLock.current.delete(traitUpdateKey)
        }, 50)
      }
    })
    
    // Get TraitManager instance
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

    // Add a simple textarea trait type used in TraitConfigurations
    tm.addType('textarea', {
      createInput({ trait }: { trait: any }) {
        const input = document.createElement('textarea') as HTMLTextAreaElement
        input.style.width = '100%'
        input.style.minHeight = '70px'
        input.style.padding = '8px'
        input.style.border = '1px solid #d1d5db'
        input.style.borderRadius = '6px'
        input.style.fontSize = '14px'
        input.placeholder = trait.get('placeholder') || ''
        const val = trait.get('value') || ''
        input.value = typeof val === 'string' ? val : String(val)
        input.addEventListener('input', () => {
          trait.set('value', input.value)
        })
        return input
      },
      onUpdate({ elInput, trait }: { elInput: HTMLTextAreaElement, trait: any }) {
        const val = trait.get('value') || ''
        if (elInput && elInput.value !== val) {
          elInput.value = val
        }
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
      if (magneticGrid) {
        magneticGrid.destroy()
      }
      if (hoverOutline) {
        hoverOutline.destroy()
      }
    }
  }, [magneticGrid, hoverOutline])

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
              onClick={saveProject}
              disabled={saving || !editor}
              className="header-btn header-btn-success"
            >
              <span dangerouslySetInnerHTML={{ __html: renderIcon(ICON_CATEGORIES.TOOLBAR.save, { size: 16, color: 'currentColor' }) }} />
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button 
              onClick={publishProject}
              disabled={!editor}
              className="header-btn header-btn-primary"
            >
              <span dangerouslySetInnerHTML={{ __html: renderIcon(ICON_CATEGORIES.TOOLBAR.publish, { size: 16, color: 'currentColor' }) }} />
              Publish
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
              <span className="search-icon" dangerouslySetInnerHTML={{ __html: renderIcon(ICON_CATEGORIES.TOOLBAR.zoomIn, { size: 14, color: '#6b7280' }) }} />
            </div>
            <div className="sidebar-filters">
              <div className="view-mode-toggle">
                <button
                  onClick={() => setViewMode('compact')}
                  className={`view-mode-btn ${viewMode === 'compact' ? 'view-mode-active' : ''}`}
                  title="Compact view with icons and titles"
                >
                  <span dangerouslySetInnerHTML={{ __html: renderIcon(ICON_CATEGORIES.LAYOUT.grid, { size: 14, color: 'currentColor' }) }} />
                  Compact
                </button>
                <button
                  onClick={() => setViewMode('icon')}
                  className={`view-mode-btn ${viewMode === 'icon' ? 'view-mode-active' : ''}`}
                  title="Icon only view with hover descriptions"
                >
                  <span dangerouslySetInnerHTML={{ __html: renderIcon(ICON_CATEGORIES.BASIC.image, { size: 14, color: 'currentColor' }) }} />
                  Icon Only
                </button>
              </div>
            </div>
          </div>
          <div className="blocks-container"></div>
        </aside>

        {/* Center: Canvas Area */}
        <div className="builder-canvas-area">
          {/* Enhanced Canvas Toolbar */}
          <div className="canvas-toolbar">
            {/* Left Section: Device Controls */}
            <div className="toolbar-section">
              <div className="device-tabs">
                <button
                  onClick={() => { editor?.setDevice('Desktop'); setActiveDevice('Desktop') }}
                  className={`device-tab ${activeDevice === 'Desktop' ? 'device-tab-active' : ''}`}
                  title="Desktop View"
                >
                  <span dangerouslySetInnerHTML={{ __html: renderIcon(ICON_CATEGORIES.DEVICES.desktop, { size: 18, color: 'currentColor' }) }} />
                </button>
                <button
                  onClick={() => { editor?.setDevice('Tablet'); setActiveDevice('Tablet') }}
                  className={`device-tab ${activeDevice === 'Tablet' ? 'device-tab-active' : ''}`}
                  title="Tablet View"
                >
                  <span dangerouslySetInnerHTML={{ __html: renderIcon(ICON_CATEGORIES.DEVICES.tablet, { size: 18, color: 'currentColor' }) }} />
                </button>
                <button
                  onClick={() => { editor?.setDevice('Mobile'); setActiveDevice('Mobile') }}
                  className={`device-tab ${activeDevice === 'Mobile' ? 'device-tab-active' : ''}`}
                  title="Mobile View"
                >
                  <span dangerouslySetInnerHTML={{ __html: renderIcon(ICON_CATEGORIES.DEVICES.mobile, { size: 18, color: 'currentColor' }) }} />
                </button>
              </div>
            </div>

            {/* Center Section: Canvas Tools */}
            <div className="toolbar-section">
              <div className="canvas-tools">
                <div className="tool-group">
                  <button
                    onClick={() => {
                      if (magneticGrid) {
                        const isVisible = magneticGrid.isGridVisible()
                        magneticGrid.toggleGridVisibility(!isVisible)
                        setGridViewEnabled(!isVisible)
                      }
                    }}
                    className={`tool-btn ${gridViewEnabled ? 'tool-btn-active' : ''}`}
                    title="Toggle Grid"
                  >
                    <span dangerouslySetInnerHTML={{ __html: renderIcon(ICON_CATEGORIES.TOOLBAR.grid, { size: 16, color: 'currentColor' }) }} />
                  </button>
                  <div className="grid-size-dropdown">
                    <button
                      onClick={() => setShowGridSizeMenu(!showGridSizeMenu)}
                      className="grid-size-btn"
                      title="Grid Size"
                    >
                      {gridSize}px
                      <span className="dropdown-arrow">▼</span>
                    </button>
                    {showGridSizeMenu && (
                      <div className="grid-size-menu">
                        {[8, 12, 16, 20, 24, 32].map(size => (
                          <button
                            key={size}
                            onClick={() => {
                              setGridSize(size)
                              if (magneticGrid) {
                                magneticGrid.setGridSize(size)
                              }
                              setShowGridSizeMenu(false)
                            }}
                            className={`grid-size-option ${size === gridSize ? 'active' : ''}`}
                          >
                            {size}px
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowObjectHighlights(!showObjectHighlights)
                    // Add CSS class to body to enable/disable highlights
                    document.body.classList.toggle('object-highlights-enabled', !showObjectHighlights)
                  }}
                  className={`tool-btn ${showObjectHighlights ? 'tool-btn-active' : ''}`}
                  title="Toggle Object Highlights"
                >
                  <span dangerouslySetInnerHTML={{ __html: renderIcon(ICON_CATEGORIES.LAYOUT.container, { size: 16, color: 'currentColor' }) }} />
                </button>
                <button
                  onClick={() => {
                    if (hoverOutline) {
                      const isEnabled = hoverOutline.isHoverEnabled()
                      hoverOutline.setEnabled(!isEnabled)
                    }
                  }}
                  className={`tool-btn ${hoverOutline?.isHoverEnabled() ? 'tool-btn-active' : ''}`}
                  title="Toggle Hover Outlines"
                >
                  <span dangerouslySetInnerHTML={{ __html: renderIcon(ICON_CATEGORIES.BASIC.button, { size: 16, color: 'currentColor' }) }} />
                </button>
              </div>
            </div>

            {/* Right Section: Zoom Controls */}
            <div className="toolbar-section">
              <div className="zoom-controls">
                <button
                  onClick={() => {
                    if (!editor) return
                    const next = Math.max(25, zoom - 10)
                    editor.Canvas.setZoom(next)
                    setZoom(next)
                  }}
                  className="zoom-btn"
                  title="Zoom Out"
                >
                  <span dangerouslySetInnerHTML={{ __html: renderIcon(ICON_CATEGORIES.TOOLBAR.zoomOut, { size: 14, color: 'currentColor' }) }} />
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
                  title="Zoom In"
                >
                  <span dangerouslySetInnerHTML={{ __html: renderIcon(ICON_CATEGORIES.TOOLBAR.zoomIn, { size: 14, color: 'currentColor' }) }} />
                </button>
                <button
                  onClick={() => { if (!editor) return; editor.Canvas.setZoom(100); setZoom(100) }}
                  className="zoom-reset"
                  title="Reset Zoom (100%)"
                >
                  <span dangerouslySetInnerHTML={{ __html: renderIcon(ICON_CATEGORIES.BASIC.text, { size: 12, color: 'currentColor' }) }} />
                </button>
              </div>
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
          {(showInspector || selectedComponent) ? (
            <div className="properties-panel modern-layout">
              {/* Top Section (60%): Selected Element Properties */}
              <div className="properties-top-section">
                <div className="properties-header">
                  <div className="header-content">
                    <h3 className="properties-title">
                      <span dangerouslySetInnerHTML={{ __html: renderIcon(ICON_CATEGORIES.TOOLBAR.settings, { size: 16, color: 'currentColor' }) }} />
                      Element Properties
                    </h3>
                    <div className="element-info">
                      <span className="element-type">
                        {selectedComponent ? (
                          (() => {
                            const attrs = selectedComponent.get('attributes') || {}
                            const smartObjectId = attrs['data-smart-object-id'] || attrs['data-smart-object']
                            
                            if (smartObjectId) {
                              const smartObjectName = smartObjectId.replace('smart-', '').replace(/-/g, ' ')
                              return `Smart ${smartObjectName.charAt(0).toUpperCase() + smartObjectName.slice(1)}`
                            }
                            
                            if (componentType) {
                              return `${componentType.charAt(0).toUpperCase() + componentType.slice(1)} Element`
                            }
                            
                            return selectedComponent.get('tagName')?.toUpperCase() || 'Element'
                          })()
                        ) : 'No element selected'}
                      </span>
                      {selectedComponent && (
                        <div className="element-details">
                          <span className="element-id">
                            {(() => {
                              const attrs = selectedComponent.get('attributes') || {}
                              const smartObjectId = attrs['data-smart-object-id'] || attrs['data-smart-object']
                              const regularId = attrs.id
                              const elementId = selectedComponent.getId?.()
                              
                              if (smartObjectId) {
                                return `Smart Object: ${smartObjectId}`
                              } else if (regularId) {
                                return `ID: ${regularId}`
                              } else if (elementId) {
                                return `Element: ${elementId}`
                              } else {
                                return `Tag: ${selectedComponent.get('tagName') || 'div'}`
                              }
                            })()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="properties-tabs">
                  <button 
                    onClick={() => {
                      setInspectorTab('traits')
                      // Refresh TraitManager by selecting current component; avoid heavy re-render
                      setTimeout(() => {
                        if (editor) {
                          try {
                            const tm = editor.TraitManager
                            const selected = editor.getSelected?.()
                            debugLog('Traits tab clicked - TraitManager:', !!tm, 'Selected:', !!selected)
                            
                            if (tm && typeof tm.select === 'function' && selected) {
                              tm.select(selected)
                              debugLog('TraitManager refreshed on tab switch')
                              
                              // Check container after tab switch
                              setTimeout(() => {
                                const traitContainer = document.querySelector('#inspector-traits')
                                if (traitContainer) {
                                  debugLog('After tab switch - container children:', traitContainer.children.length)
                                  if (traitContainer.children.length === 0) {
                                    debugWarn('Container still empty after tab switch, forcing render...')
                                    tm.render(traitContainer)
                                    tm.select(selected)
                                  }
                                }
                              }, 50)
                            }
                          } catch (e) {
                            debugError('TraitManager tab refresh failed:', e)
                          }
                        }
                      }, 50)
                    }} 
                    className={`properties-tab ${inspectorTab==='traits'?'properties-tab-active':''}`}
                    title="Element Configuration"
                  >
                    <svg 
                      width="14" 
                      height="14" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                      className="mr-1"
                    >
                      <circle cx="12" cy="12" r="3"/>
                      <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"/>
                    </svg>
                    Configuration
                  </button>
                  <button 
                    onClick={() => {
                      setInspectorTab('styles')
                      // Refresh StyleManager by selecting current component; avoid heavy re-render
                      setTimeout(() => {
                        if (editor) {
                          try {
                            const sm = editor.StyleManager
                            const selected = editor.getSelected?.()
                            if (sm && typeof sm.select === 'function' && selected) {
                              sm.select(selected)
                            }
                          } catch (e) {
                            console.warn('StyleManager tab refresh failed:', e)
                          }
                        }
                      }, 50)
                    }} 
                    className={`properties-tab ${inspectorTab==='styles'?'properties-tab-active':''}`}
                    title="Element Styles"
                  >
                    <svg 
                      width="14" 
                      height="14" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="2" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                      className="mr-1"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    Styles
                  </button>
                </div>
                
                <div className="properties-content">
                  {/* GrapesJS Inspector Containers */}
                  <div style={{ display: inspectorTab==='traits' ? 'block' : 'none', height: '100%' }}>
                    <ReactSettingsPanel 
                      editor={editor}
                      selectedComponent={selectedComponent}
                      onSettingsChange={(settings) => {
                        debugLog('Settings changed from React panel:', settings)
                      }}
                    />
                  </div>
                  <div style={{ display: inspectorTab==='styles' ? 'block' : 'none', height: '100%' }}>
                    <ReactStylesPanel 
                      editor={editor}
                      selectedComponent={selectedComponent}
                      onSettingsChange={(settings) => {
                        debugLog('Styles changed from React panel:', settings)
                      }}
                    />
                  </div>
                </div>
              </div>
              
              {/* Bottom Section (40%): Layer Management */}
              <div className="properties-bottom-section">
                <div className="layers-header">
                  <h3 className="layers-title">
                    <span dangerouslySetInnerHTML={{ __html: renderIcon(ICON_CATEGORIES.LAYOUT.container, { size: 16, color: 'currentColor' }) }} />
                    Layers
                  </h3>
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
