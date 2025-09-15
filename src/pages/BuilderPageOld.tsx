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

  const initializeEditor = () => {
    if (!project) return

    const grapesjs = (window as any).grapesjs
    if (!grapesjs) return

    // Clean up any existing editor
    if (editor) {
      try {
        editor.destroy()
      } catch (e) {
        console.log('Editor cleanup skipped:', e)
      }
    }

    const grapesEditor = grapesjs.init({
      container: editorRef.current!,
      height: '100%',
      width: '100%',
      
      // Simplified canvas configuration to ensure drag-drop works
      canvas: {
        styles: [`
          * { box-sizing: border-box; }
          body { 
            margin: 0; 
            padding: 20px; 
            background: transparent; 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }
          .gjs-selected { outline: 2px solid #3b82f6 !important; outline-offset: 2px; }
        `]
      },
      
      // Enable all essential features for drag-drop
      fromElement: false,
      allowScripts: false,
      showOffsets: true,
      
      // Storage - disable for now to prevent conflicts
      storageManager: { type: 'none' },
      
      // Essential managers
      blockManager: {
        appendTo: '.blocks-container'
      },

      styleManager: {
        appendTo: '#inspector-styles',
        sectors: [
          {
            name: 'Dimension',
            open: true,
            buildProps: ['width', 'height', 'max-width', 'min-height', 'margin', 'padding'],
          },
          {
            name: 'Typography',
            open: false,
            buildProps: ['font-family', 'font-size', 'font-weight', 'line-height', 'color', 'text-align'],
          },
          {
            name: 'Decorations',
            open: false,
            buildProps: ['background-color', 'border-radius', 'border', 'box-shadow', 'text-shadow'],
          },
          {
            name: 'Extra',
            open: false,
            buildProps: ['opacity', 'transition', 'perspective', 'transform'],
          }
        ]
      },

      layerManager: {
        appendTo: '#inspector-layers'
      },

      traitManager: {
        appendTo: '#inspector-traits'
      },

      deviceManager: {
        devices: [
          { id: 'Desktop', name: 'Desktop', width: '' },
          { id: 'Tablet', name: 'Tablet', width: '768px' },
          { id: 'Mobile', name: 'Mobile', width: '375px' },
        ]
      },

      // Panel configuration for our custom buttons
      panels: {
        defaults: [
          {
            id: 'basic-actions',
            el: '.panel__basic-actions',
            buttons: [
              {
                id: 'visibility',
                active: true,
                className: 'btn-toggle-borders',
                label: 'Grid',
                command: 'sw-visibility',
              },
              {
                id: 'export',
                className: 'btn-open-export',
                label: 'Code',
                command: 'export-template',
              },
              {
                id: 'show-json',
                className: 'btn-show-json',
                label: 'JSON',
                context: 'show-json',
                command(editor: any) {
                  editor.Modal.setTitle('Components JSON')
                    .setContent(`<textarea style="width:100%; height: 250px;">${JSON.stringify(editor.getComponents())}</textarea>`)
                    .open()
                },
              }
            ]
          }
        ]
      }
    })

    // Add essential commands
    grapesEditor.Commands.add('sw-visibility', {
      run(editor: any, sender: any) {
        const body = editor.Canvas.getBody()
        const isActive = sender.get('active')
        
        if (isActive) {
          body.classList.add('grid-enabled')
        } else {
          body.classList.remove('grid-enabled')
        }
      }
    })

    // Add CSS for grid in canvas
    grapesEditor.Canvas.getDocument().head.insertAdjacentHTML('beforeend', `
      <style>
        body.grid-enabled {
          background-image: 
            linear-gradient(to right, rgba(99, 102, 241, 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(99, 102, 241, 0.1) 1px, transparent 1px);
          background-size: 20px 20px;
        }
      </style>
    `)

    // Add draggable blocks immediately
    const bm = grapesEditor.BlockManager
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
          const attrs = component.get('attributes') || {}
          const smartId = attrs['data-smart-object-id'] || attrs['data-smart-object']
          if (smartId) {
            const template = smartManager.getTemplate(smartId)
            if (template) return setSelectedSmartObject({ component, template })
          }
          setSelectedSmartObject(null)
        })
        grapesEditor.on('component:deselected', () => {
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

      // Add essential blocks for drag and drop
      const blockManager = grapesEditor.BlockManager
      
      // Clear existing blocks to avoid duplicates
      blockManager.getAll().forEach((block: any) => {
        if (!block.id.startsWith('smart-')) {
          blockManager.remove(block.id)
        }
      })

      // Add basic blocks
      blockManager.add('text', {
        label: 'Text',
        category: 'Basic',
        content: '<div data-gjs-type="text">Insert your text here</div>',
        media: '<i class="fa fa-font"></i>'
      })

      blockManager.add('heading', {
        label: 'Heading',
        category: 'Basic', 
        content: '<h1>Heading</h1>',
        media: '<i class="fa fa-header"></i>'
      })

      blockManager.add('image', {
        label: 'Image',
        category: 'Media',
        content: '<img src="https://via.placeholder.com/300x200" alt="Image">',
        media: '<i class="fa fa-image"></i>'
      })

      blockManager.add('button', {
        label: 'Button',
        category: 'Basic',
        content: '<button type="button" class="btn">Click me</button>',
        media: '<i class="fa fa-hand-pointer-o"></i>'
      })

      blockManager.add('link', {
        label: 'Link',
        category: 'Basic',
        content: '<a href="#" data-gjs-type="link">Link</a>',
        media: '<i class="fa fa-link"></i>'
      })

      blockManager.add('container', {
        label: 'Container',
        category: 'Layout',
        content: '<div style="padding: 20px; background: #f8f9fa; min-height: 100px;">Container</div>',
        media: '<i class="fa fa-square-o"></i>'
      })

      blockManager.add('row', {
        label: 'Row',
        category: 'Layout',
        content: '<div style="display: flex; flex-wrap: wrap; gap: 10px; padding: 10px;"><div style="flex: 1; padding: 10px; background: #e9ecef;">Column 1</div><div style="flex: 1; padding: 10px; background: #e9ecef;">Column 2</div></div>',
        media: '<i class="fa fa-columns"></i>'
      })

      // Force render blocks to ensure they're visible
      setTimeout(() => {
        const container = document.querySelector('.blocks-container')
        if (container && blockManager) {
          blockManager.render(container)
        }
      }, 100)

      // Render core managers into custom containers
      const sm = grapesEditor.StyleManager
      const lm = grapesEditor.LayerManager
      const tm = grapesEditor.TraitManager
      
      const styleEl = document.querySelector('#inspector-styles') as HTMLElement | null
      const layerEl = document.querySelector('#inspector-layers') as HTMLElement | null
      const traitEl = document.querySelector('#inspector-traits') as HTMLElement | null
      if (styleEl) sm.render(styleEl)
      if (layerEl) lm.render(layerEl)
      if (traitEl) tm.render(traitEl)

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
            <div className="properties-panel">
              <div className="properties-header">
                <div className="properties-tabs">
                  <button 
                    onClick={() => setInspectorTab('styles')} 
                    className={`properties-tab ${inspectorTab==='styles'?'properties-tab-active':''}`}
                  >
                    Styles
                  </button>
                  <button 
                    onClick={() => setInspectorTab('layers')} 
                    className={`properties-tab ${inspectorTab==='layers'?'properties-tab-active':''}`}
                  >
                    Layers
                  </button>
                  <button 
                    onClick={() => setInspectorTab('traits')} 
                    className={`properties-tab ${inspectorTab==='traits'?'properties-tab-active':''}`}
                  >
                    Traits
                  </button>
                </div>
                <button
                  onClick={() => setShowInspector(false)}
                  className="properties-close"
                >
                  ✕
                </button>
              </div>
              <div className="properties-content">
                <div id="inspector-styles" style={{ display: inspectorTab==='styles' ? 'block' : 'none' }}></div>
                <div id="inspector-layers" style={{ display: inspectorTab==='layers' ? 'block' : 'none' }}></div>
                <div id="inspector-traits" style={{ display: inspectorTab==='traits' ? 'block' : 'none' }}></div>
              </div>
            </div>
          ) : (
            <div className="properties-panel">
              <div className="properties-placeholder">
                <div className="placeholder-content">
                  <div className="placeholder-icon">🎨</div>
                  <h3>Select an Element</h3>
                  <p>Choose an element to edit its properties</p>
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
