import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Wand2, Mic, Camera, Code, Palette, Layout, Type, X, Send, Loader, Sparkles, Eye, EyeOff } from 'lucide-react'
import { aiBuilderService, AICommandRequest, AICommandResponse } from '../services/aiService'
import '../styles/mockAIBuilder.css'

interface AICommand {
  id: string
  text: string
  componentId: string
  timestamp: Date
  status: 'processing' | 'completed' | 'error'
  result?: AICommandResponse
}

interface ComponentData {
  id: string
  type: string
  styles: Record<string, any>
  content: string
  visible: boolean
}

export default function MockAIBuilder() {
  const editorRef = useRef<HTMLDivElement>(null)
  const [editor, setEditor] = useState<any>(null)
  const [selectedComponent, setSelectedComponent] = useState<any>(null)
  const [showAIDialog, setShowAIDialog] = useState(false)
  const [aiCommand, setAICommand] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [aiHistory, setAIHistory] = useState<AICommand[]>([])
  const [grapesLoaded, setGrapesLoaded] = useState(false)
  const [isInitializing, setIsInitializing] = useState(false)
  const [contextualSuggestions, setContextualSuggestions] = useState<string[]>([])
  const [quickCommands] = useState([
    "Make this blue",
    "Center this text",
    "Add a border",
    "Make it larger",
    "Hide this element",
    "Change background to light gray",
    "Add shadow effect",
    "Make it rounded"
  ])

  // Initialize GrapesJS
  const initializeGrapesJS = useCallback(async () => {
    try {
      console.log('initializeGrapesJS called - container:', !!editorRef.current, 'isInitializing:', isInitializing)
      
      if (isInitializing) {
        console.log('Already initializing, skipping...')
        return
      }

      setIsInitializing(true)
      console.log('Starting GrapesJS initialization...')
      
      if (!editorRef.current) {
        console.error('No editor container available')
        setIsInitializing(false)
        return
      }

      console.log('Container dimensions:', editorRef.current.offsetWidth, 'x', editorRef.current.offsetHeight)
      console.log('Importing GrapesJS...')
      
      const grapesModule = await import('grapesjs')
      const grapesjs = grapesModule.default || grapesModule
      console.log('GrapesJS module loaded:', !!grapesjs)

      console.log('Initializing GrapesJS editor...')
      setGrapesLoaded(true)
      setIsInitializing(false)

      // Initialize GrapesJS with basic setup
      const grapesEditor = grapesjs.init({
        container: editorRef.current,

        height: '100%',
        width: '100%',
        storageManager: false,
        // Add basic blocks
        blockManager: {
          appendTo: '.blocks-container',
          blocks: [
            {
              id: 'text',
              label: 'Text',
              content: '<div style="padding: 10px">Insert your text here</div>',
              category: 'Basic'
            },
            {
              id: 'image',
              label: 'Image',
              content: '<img src="https://via.placeholder.com/350x250/78c5d6/fff" alt="placeholder" style="width: 100%; height: auto;">',
              category: 'Basic'
            },
            {
              id: 'button',
              label: 'Button',
              content: '<button style="background: #3b82f6; color: white; padding: 12px 24px; border: none; border-radius: 6px; cursor: pointer;">Click me</button>',
              category: 'Basic'
            },
            {
              id: 'container',
              label: 'Container',
              content: '<div style="padding: 20px; border: 1px dashed #ccc; min-height: 100px;">Container</div>',
              category: 'Layout'
            }
          ]
        },
        canvas: {
          styles: [`
            body { 
              margin: 0; 
              padding: 20px; 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
              background: #f8fafc;
            }
            .ai-selected {
              outline: 2px solid #3b82f6 !important;
              outline-offset: 2px;
              position: relative;
            }
            .ai-selected::after {
              content: '🤖 AI Ready';
              position: absolute;
              top: -25px;
              left: 0;
              background: #3b82f6;
              color: white;
              padding: 2px 8px;
              border-radius: 4px;
              font-size: 11px;
              z-index: 1000;
            }
          `]
        }
      })

      // Add sample content
      grapesEditor.setComponents(`
        <div style="max-width: 800px; margin: 0 auto; padding: 40px 20px;">
          <h1 style="font-size: 2.5rem; font-weight: bold; color: #1f2937; margin-bottom: 16px; text-align: center;">
            Welcome to AI-Powered Builder
          </h1>
          <p style="font-size: 1.1rem; color: #6b7280; text-align: center; margin-bottom: 32px; line-height: 1.6;">
            Click on any element and use AI commands to modify it instantly. Experience the future of web design.
          </p>
          <div style="display: flex; gap: 16px; justify-content: center; margin-bottom: 32px; flex-wrap: wrap;">
            <button style="background: #3b82f6; color: white; padding: 12px 24px; border: none; border-radius: 6px; cursor: pointer; font-weight: 500;">
              Primary Button
            </button>
            <button style="background: transparent; color: #3b82f6; padding: 12px 24px; border: 2px solid #3b82f6; border-radius: 6px; cursor: pointer; font-weight: 500;">
              Secondary Button
            </button>
          </div>
          <div style="background: white; padding: 24px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); margin-bottom: 24px;">
            <h3 style="font-size: 1.25rem; font-weight: 600; color: #1f2937; margin-bottom: 12px;">
              AI Features Card
            </h3>
            <p style="color: #6b7280; margin-bottom: 16px;">
              This card demonstrates AI capabilities. Try commands like "make this blue", "center this text", or "add a border".
            </p>
            <div style="display: flex; gap: 8px;">
              <span style="background: #dbeafe; color: #1d4ed8; padding: 4px 8px; border-radius: 4px; font-size: 0.875rem;">
                AI-Powered
              </span>
              <span style="background: #dcfce7; color: #166534; padding: 4px 8px; border-radius: 4px; font-size: 0.875rem;">
                Smart Design
              </span>
            </div>
          </div>
          <div style="text-align: center; padding: 24px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; color: white;">
            <h2 style="font-size: 1.5rem; margin-bottom: 8px;">Try AI Commands</h2>
            <p style="opacity: 0.9;">Select any element and tell AI what you want to change!</p>
          </div>
        </div>
      `)

      // Component selection handler
      grapesEditor.on('component:selected', async (component: any) => {
        setSelectedComponent(component)
        
        // Add visual indicator
        const el = component.getEl()
        if (el) {
          // Remove previous indicators
          document.querySelectorAll('.ai-selected').forEach(elem => {
            elem.classList.remove('ai-selected')
          })
          // Add to current element
          el.classList.add('ai-selected')
        }

        // Load contextual suggestions
        try {
          const suggestions = await aiBuilderService.getContextualSuggestions(
            component.get('tagName')
          )
          setContextualSuggestions(suggestions)
        } catch (error) {
          console.error('Failed to load suggestions:', error)
        }
      })

      grapesEditor.on('component:deselected', () => {
        // Remove all indicators
        document.querySelectorAll('.ai-selected').forEach(elem => {
          elem.classList.remove('ai-selected')
        })
        setContextualSuggestions([])
      })

      setEditor(grapesEditor)
    } catch (error) {
      console.error('Failed to load GrapesJS:', error)
      setIsInitializing(false)
    }
  }, [])

  // Callback ref to handle when the container becomes available
  const setEditorContainer = useCallback((node: HTMLDivElement | null) => {
    console.log('setEditorContainer called with node:', !!node, 'editor exists:', !!editor)
    editorRef.current = node
    if (node && !editor && !grapesLoaded && !isInitializing) {
      console.log('Editor container is now available, initializing GrapesJS...')
      // Small delay to ensure the container is properly rendered
      setTimeout(() => {
        initializeGrapesJS()
      }, 100)
    } else if (node && editor) {
      console.log('Container available but editor already exists')
    }
  }, [editor, grapesLoaded, isInitializing, initializeGrapesJS])

  // Fallback effect to ensure initialization happens
  useEffect(() => {
    console.log('Fallback effect - grapesLoaded:', grapesLoaded, 'isInitializing:', isInitializing, 'editor:', !!editor, 'container:', !!editorRef.current)
    if (!grapesLoaded && !isInitializing && !editor) {
      if (editorRef.current) {
        console.log('Fallback: Triggering GrapesJS initialization...')
        initializeGrapesJS()
      } else {
        console.log('Fallback: Container not ready yet')
        // Set a timeout to try again
        setTimeout(() => {
          if (editorRef.current && !grapesLoaded && !isInitializing && !editor) {
            console.log('Fallback delayed: Triggering GrapesJS initialization...')
            initializeGrapesJS()
          }
        }, 1000)
      }
    }
  }, [grapesLoaded, isInitializing, editor, initializeGrapesJS])

  // Direct initialization effect
  useEffect(() => {
    console.log('Direct initialization check - container exists:', !!editorRef.current)
    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      if (editorRef.current && !grapesLoaded && !isInitializing && !editor) {
        console.log('Direct: Container found, initializing GrapesJS...')
        initializeGrapesJS()
      }
    }, 500)
    
    return () => clearTimeout(timer)
  }, []) // Only run once on mount

  // Add component function
  const addComponent = (type: string) => {
    if (!editor) return

    const components: Record<string, string> = {
      text: '<div style="padding: 16px; font-size: 16px; line-height: 1.6; color: #374151;">Click me and try AI commands like "make this blue" or "center this text"</div>',
      button: '<button style="background: #3b82f6; color: white; padding: 12px 24px; border: none; border-radius: 6px; cursor: pointer; font-weight: 500; transition: all 0.3s;">AI-Ready Button</button>',
      container: '<div style="padding: 24px; border: 2px dashed #d1d5db; border-radius: 8px; min-height: 120px; background: #f9fafb; display: flex; align-items: center; justify-content: center; color: #6b7280;">Drag content here or use AI to modify</div>',
      image: '<img src="https://via.placeholder.com/400x250/3b82f6/ffffff?text=AI+Image" alt="AI Placeholder" style="width: 100%; height: auto; border-radius: 8px;" />'
    }

    const wrapper = editor.getWrapper()
    const newComponent = editor.addComponents(components[type] || components.text)[0]
    
    // Auto-select the new component
    editor.select(newComponent)
  }

  // Handle AI command processing
  const handleAICommand = async () => {
    if (!aiCommand.trim() || !selectedComponent || isProcessing) return

    setIsProcessing(true)
    
    const command: AICommand = {
      id: Date.now().toString(),
      text: aiCommand,
      componentId: selectedComponent.getId(),
      timestamp: new Date(),
      status: 'processing'
    }

    setAIHistory(prev => [...prev, command])

    try {
      // Prepare enhanced AI request with full context
      const componentElement = selectedComponent.getEl()
      const computedStyles = componentElement ? window.getComputedStyle(componentElement) : {} as CSSStyleDeclaration
      
      // Get current styles (both inline and computed)
      const currentStyles = {
        ...selectedComponent.getStyle(),
        // Add important computed styles for better context
        display: (computedStyles as any).display || 'block',
        position: (computedStyles as any).position || 'static',
        fontSize: (computedStyles as any).fontSize || '16px',
        fontFamily: (computedStyles as any).fontFamily || 'inherit',
        lineHeight: (computedStyles as any).lineHeight || 'normal',
        textAlign: (computedStyles as any).textAlign || 'left',
        margin: (computedStyles as any).margin || '0px',
        padding: (computedStyles as any).padding || '0px'
      }

      // Get component hierarchy for better context
      const parentComponent = selectedComponent.parent()
      const parentContext = parentComponent ? {
        type: parentComponent.get('tagName'),
        styles: parentComponent.getStyle() || {}
      } : null

      const aiRequest: AICommandRequest = {
        command: aiCommand,
        componentId: selectedComponent.getId(),
        componentType: selectedComponent.get('tagName'),
        currentStyles: currentStyles,
        currentContent: selectedComponent.get('content') || selectedComponent.get('innerHTML') || '',
        pageContext: {
          device: 'desktop',
          theme: 'modern',
          totalComponents: editor?.getComponents().length || 0,
          // Add more context
          parentContext: parentContext || undefined,
          elementHTML: componentElement?.outerHTML || '',
          isSelected: true,
          builderMode: 'grapesjs'
        }
      }

      // Process with AI service
      const result = await aiBuilderService.processCommand(aiRequest)

      if (result.success) {
        // Apply changes to component
        if (result.action === 'style_change' || result.action === 'layout_modification') {
          selectedComponent.addStyle(result.changes)
        } else if (result.action === 'content_update') {
          selectedComponent.set('content', result.changes.content)
        } else if (result.action === 'visibility_toggle') {
          selectedComponent.addStyle(result.changes)
        }

        // Add visual feedback
        const el = selectedComponent.getEl()
        if (el) {
          el.classList.add('ai-success')
          setTimeout(() => el.classList.remove('ai-success'), 600)
        }
      }

      // Update command status
      setAIHistory(prev => 
        prev.map(cmd => 
          cmd.id === command.id 
            ? { ...cmd, status: result.success ? 'completed' : 'error', result }
            : cmd
        )
      )

      setAICommand('')
    } catch (error) {
      console.error('AI command error:', error)
      setAIHistory(prev => 
        prev.map(cmd => 
          cmd.id === command.id 
            ? { ...cmd, status: 'error' }
            : cmd
        )
      )
    } finally {
      setIsProcessing(false)
    }
  }

  const openAIDialog = () => {
    if (selectedComponent) {
      setShowAIDialog(true)
    }
  }

  const closeAIDialog = () => {
    setShowAIDialog(false)
    setAICommand('')
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleAICommand()
    }
  }

  if (!grapesLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading AI Builder...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="ai-builder-container">
      {/* Header */}
      <header className="ai-builder-header">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-blue-400" />
              <h1 className="text-xl font-bold text-white">AI Builder Mock</h1>
            </div>
            <div className="text-sm text-gray-300">
              Click elements → Use AI commands
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {selectedComponent && (
              <button
                onClick={openAIDialog}
                className="ai-command-btn"
              >
                <Wand2 className="w-4 h-4" />
                AI Command
              </button>
            )}
            <div className="text-sm text-gray-400">
              {selectedComponent ? `Selected: ${selectedComponent.get('tagName')}` : 'No selection'}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="ai-builder-main">
        {/* Left Sidebar - Blocks */}
        <aside className="ai-builder-sidebar">
          <div className="p-4">
            <h3 className="text-white font-semibold mb-4">Components</h3>
            
            {/* Manual Components */}
            <div className="mb-4 space-y-2">
              <button 
                onClick={() => addComponent('text')}
                className="w-full p-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors flex items-center gap-2"
              >
                <Type className="w-4 h-4" />
                Text Block
              </button>
              <button 
                onClick={() => addComponent('button')}
                className="w-full p-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors flex items-center gap-2"
              >
                <Layout className="w-4 h-4" />
                Button
              </button>
              <button 
                onClick={() => addComponent('container')}
                className="w-full p-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors flex items-center gap-2"
              >
                <Layout className="w-4 h-4" />
                Container
              </button>
              <button 
                onClick={() => addComponent('image')}
                className="w-full p-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors flex items-center gap-2"
              >
                <Camera className="w-4 h-4" />
                Image
              </button>
            </div>
            
            {/* GrapesJS Blocks Container */}
            <div className="blocks-container"></div>
          </div>
        </aside>

        {/* Center - Canvas */}
        <main className="ai-builder-canvas">
          <div className="canvas-wrapper">
            {!grapesLoaded && (
              <div className="flex items-center justify-center h-full bg-gray-100">
                <div className="text-center">
                  <Loader className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-2" />
                  <p className="text-gray-600">
                    {isInitializing ? 'Initializing AI Builder...' : 'Loading AI Builder...'}
                  </p>
                </div>
              </div>
            )}
            <div 
              ref={setEditorContainer}
              className="grapesjs-editor"
              style={{ 
                width: '100%', 
                height: '100%',
                minHeight: '500px',
                display: grapesLoaded ? 'block' : 'none'
              }}
            ></div>
          </div>
        </main>

        {/* Right Sidebar - AI History */}
        <aside className="ai-builder-history">
          <div className="p-4">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              AI Activity
            </h3>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {aiHistory.length === 0 ? (
                <div className="text-gray-400 text-sm text-center py-8">
                  <Wand2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  No AI commands yet.<br/>
                  Select an element and try AI!
                </div>
              ) : (
                aiHistory.slice().reverse().map(command => (
                  <div key={command.id} className="ai-history-item">
                    <div className="flex items-start justify-between mb-2">
                      <div className="text-sm text-gray-300 flex-1">
                        "{command.text}"
                      </div>
                      <div className={`status-badge status-${command.status}`}>
                        {command.status === 'processing' && <Loader className="w-3 h-3 animate-spin" />}
                        {command.status}
                      </div>
                    </div>
                    
                    {command.result && (
                      <div className="text-xs text-gray-400 mt-2">
                        <div className="flex items-center gap-1 mb-1">
                          <Sparkles className="w-3 h-3" />
                          {command.result.reasoning}
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-blue-400">
                            Confidence: {Math.round(command.result.confidence * 100)}%
                          </div>
                          {command.result.suggestions && command.result.suggestions.length > 0 && (
                            <div className="text-purple-400 text-xs">
                              +{command.result.suggestions.length} tips
                            </div>
                          )}
                        </div>
                        {command.result.suggestions && command.result.suggestions.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {command.result.suggestions.map((suggestion, idx) => (
                              <div key={idx} className="text-xs text-gray-500 italic">
                                💡 {suggestion}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </aside>
      </div>

      {/* AI Command Dialog */}
      {showAIDialog && (
        <div className="ai-dialog-overlay">
          <div className="ai-dialog">
            <div className="ai-dialog-header">
              <div className="flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-blue-400" />
                <h3 className="font-semibold text-white">AI Command</h3>
              </div>
              <button 
                onClick={closeAIDialog}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="ai-dialog-content">
              <div className="mb-4">
                <div className="text-sm text-gray-300 mb-2">
                  Selected: <span className="text-blue-400">{selectedComponent?.get('tagName')}</span>
                </div>
                <div className="text-xs text-gray-400">
                  Tell AI what you want to change about this element
                </div>
              </div>

              <textarea
                value={aiCommand}
                onChange={(e) => setAICommand(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="e.g., 'make this blue', 'center the text', 'add a border', 'make it larger'"
                className="ai-command-input"
                rows={3}
                disabled={isProcessing}
              />

              <div className="flex gap-2 mt-4">
                <button
                  onClick={handleAICommand}
                  disabled={isProcessing || !aiCommand.trim()}
                  className="ai-submit-btn"
                >
                  {isProcessing ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send to AI
                    </>
                  )}
                </button>
                
                <button
                  onClick={closeAIDialog}
                  className="ai-cancel-btn"
                >
                  Cancel
                </button>
              </div>

              {/* Quick Commands */}
              <div className="mt-4 pt-4 border-t border-gray-600">
                <div className="text-xs text-gray-400 mb-2">
                  {contextualSuggestions.length > 0 ? 'Smart Suggestions:' : 'Quick Commands:'}
                </div>
                <div className="flex flex-wrap gap-2">
                  {(contextualSuggestions.length > 0 ? contextualSuggestions : quickCommands).map(cmd => (
                    <button
                      key={cmd}
                      onClick={() => setAICommand(cmd)}
                      className="quick-command-btn"
                    >
                      {cmd}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
