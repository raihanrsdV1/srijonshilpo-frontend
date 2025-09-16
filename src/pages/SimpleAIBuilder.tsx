import React, { useState, useRef, useEffect } from 'react'
import { Wand2, Send, Loader } from 'lucide-react'
import { aiBuilderService } from '../services/aiService'

export default function SimpleAIBuilder() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [editor, setEditor] = useState<any>(null)
  const [selectedComponent, setSelectedComponent] = useState<any>(null)
  const [aiCommand, setAICommand] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [showAIDialog, setShowAIDialog] = useState(false)

  useEffect(() => {
    const initGrapesJS = async () => {
      try {
        console.log('Initializing simple GrapesJS...')
        
        // Import GrapesJS
        const grapesjs = await import('grapesjs')
        const gjs = grapesjs.default || grapesjs

        if (!containerRef.current) {
          console.error('Container not found')
          return
        }

        // Initialize with minimal config
        const grapesEditor = gjs.init({
          container: containerRef.current,
          height: '500px',
          width: '100%',
          storageManager: false,
          fromElement: false,
          blockManager: {
            appendTo: '#blocks-panel',
            blocks: [
              {
                id: 'text',
                label: 'Text',
                content: '<div style="padding: 10px; border: 1px dashed #ccc;">Hello World! Click me and use AI to modify.</div>'
              },
              {
                id: 'button',
                label: 'Button',
                content: '<button style="padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer;">Click Me</button>'
              },
              {
                id: 'heading',
                label: 'Heading',
                content: '<h1 style="color: #333; font-size: 2em;">Heading Text</h1>'
              }
            ]
          },
          panels: {
            defaults: []
          }
        })

        // Add some initial content
        grapesEditor.setComponents(`
          <div style="padding: 20px; font-family: Arial, sans-serif;">
            <h1 style="color: #333; text-align: center;">AI Builder Test</h1>
            <p style="color: #666; text-align: center; margin: 20px 0;">
              Click on any element below and use AI commands to modify it!
            </p>
            <div style="display: flex; gap: 10px; justify-content: center; margin: 20px 0;">
              <button style="padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 4px;">Primary Button</button>
              <button style="padding: 10px 20px; background: #6b7280; color: white; border: none; border-radius: 4px;">Secondary Button</button>
            </div>
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Test Card</h3>
              <p>This is a test card. Try selecting it and saying "make this blue" or "add a border".</p>
            </div>
          </div>
        `)

        // Handle component selection
        grapesEditor.on('component:selected', (component: any) => {
          console.log('Component selected:', component.get('tagName'))
          setSelectedComponent(component)
          setShowAIDialog(true)
        })

        grapesEditor.on('component:deselected', () => {
          setSelectedComponent(null)
          setShowAIDialog(false)
        })

        setEditor(grapesEditor)
        console.log('GrapesJS initialized successfully!')

      } catch (error) {
        console.error('Error initializing GrapesJS:', error)
      }
    }

    // Small delay to ensure DOM is ready
    setTimeout(initGrapesJS, 100)
  }, [])

  const handleAICommand = async () => {
    if (!selectedComponent || !aiCommand.trim()) return

    setIsProcessing(true)
    try {
      const request = {
        command: aiCommand,
        componentId: selectedComponent.getId(),
        componentType: selectedComponent.get('tagName'),
        currentStyles: selectedComponent.getStyle(),
        currentContent: selectedComponent.get('content') || ''
      }

      const response = await aiBuilderService.processCommand(request)
      
      if (response.success && response.changes) {
        // Apply style changes
        Object.entries(response.changes).forEach(([property, value]) => {
          if (value === null) {
            selectedComponent.removeStyle(property)
          } else {
            selectedComponent.addStyle({ [property]: value })
          }
        })
        
        console.log('AI changes applied:', response.changes)
        console.log('Reasoning:', response.reasoning)
      }

      setAICommand('')
    } catch (error) {
      console.error('AI command failed:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Wand2 className="w-6 h-6 text-blue-500" />
            Simple AI Builder
          </h1>
          <div className="text-sm text-gray-500">
            Select an element and use AI commands to modify it
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Blocks Panel */}
        <div className="w-64 bg-white border-r border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900 mb-4">Blocks</h3>
          <div id="blocks-panel"></div>
        </div>

        {/* Editor Canvas */}
        <div className="flex-1 relative">
          <div ref={containerRef} className="w-full h-full"></div>
          
          {/* Clean AI Dialog - only shows when element is selected */}
          {showAIDialog && selectedComponent && (
            <div 
              className="fixed bottom-6 left-1/2 transform -translate-x-1/2 w-96 z-50"
              style={{ zIndex: 10000 }}
            >
              <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Wand2 className="w-4 h-4 text-blue-500" />
                  <span className="font-medium text-gray-900">AI Assistant</span>
                  <span className="text-sm text-gray-500">
                    ({selectedComponent.get('tagName')})
                  </span>
                </div>
                
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={aiCommand}
                    onChange={(e) => setAICommand(e.target.value)}
                    placeholder="Tell AI what to change..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyPress={(e) => e.key === 'Enter' && handleAICommand()}
                    disabled={isProcessing}
                  />
                  <button
                    onClick={handleAICommand}
                    disabled={isProcessing || !aiCommand.trim()}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isProcessing ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Quick suggestions */}
                <div className="flex flex-wrap gap-2">
                  {['Make this blue', 'Center text', 'Add border', 'Make larger'].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => setAICommand(suggestion)}
                      className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
