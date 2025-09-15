import { Editor, Component } from 'grapesjs'

interface ResizeHandle {
  element: HTMLElement
  direction: string
}

export class ResizeManager {
  private editor: Editor
  private currentComponent: Component | null = null
  private resizeHandles: ResizeHandle[] = []
  private isResizing = false
  private startX = 0
  private startY = 0
  private startWidth = 0
  private startHeight = 0
  private currentDirection = ''
  private boundHandlers: { [key: string]: Function } = {}

  constructor(editor: Editor) {
    this.editor = editor
    this.setupResizeHandlers()
  }

  /**
   * Setup resize event handlers
   */
  private setupResizeHandlers() {
    // Store bound handlers for cleanup
    this.boundHandlers.componentSelected = (component: Component) => this.showResizeHandles(component)
    this.boundHandlers.componentDeselected = () => this.hideResizeHandles()
    this.boundHandlers.canvasFrameLoad = () => {
      if (this.currentComponent) {
        this.updateHandlePositions()
      }
    }

    // Listen for component selection
    this.editor.on('component:selected', this.boundHandlers.componentSelected as any)

    // Listen for component deselected
    this.editor.on('component:deselected', this.boundHandlers.componentDeselected as any)

    // Listen for canvas changes to update handle positions
    this.editor.on('canvas:frame:load', this.boundHandlers.canvasFrameLoad as any)
  }

  /**
   * Show resize handles for the selected component
   */
  private showResizeHandles(component: Component) {
    this.hideResizeHandles()
    this.currentComponent = component

    const view = component.view
    if (!view || !view.el) return

    const element = view.el as HTMLElement
    const rect = element.getBoundingClientRect()
    
    // Don't show resize handles for text elements or inline elements
    const computedStyle = window.getComputedStyle(element)
    if (computedStyle.display === 'inline' || element.tagName === 'SPAN') {
      return
    }

    this.createResizeHandles(element)
  }

  /**
   * Create resize handles around the element
   */
  private createResizeHandles(element: HTMLElement) {
    const directions = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w']
    
    // Get canvas container
    const canvas = this.editor.Canvas.getFrameEl()
    const canvasDoc = canvas?.contentDocument || document
    const canvasBody = canvas?.contentDocument?.body || canvas?.querySelector('body') || document.body
    
    directions.forEach(direction => {
      const handle = canvasDoc.createElement('div')
      handle.className = `resize-handle ${direction}`
      handle.dataset.direction = direction
      
      // Enhanced handle styling for better visibility
      handle.style.cssText = `
        position: absolute;
        width: 12px;
        height: 12px;
        background: #3b82f6;
        border: 2px solid white;
        border-radius: 50%;
        cursor: ${this.getCursorForDirection(direction)};
        z-index: 10000;
        pointer-events: auto;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        transition: all 0.2s ease;
      `
      
      // Add hover effect
      handle.addEventListener('mouseenter', () => {
        handle.style.background = '#1d4ed8'
        handle.style.transform = 'scale(1.2)'
        handle.style.boxShadow = '0 4px 12px rgba(0,0,0,0.4)'
      })
      
      handle.addEventListener('mouseleave', () => {
        handle.style.background = '#3b82f6'
        handle.style.transform = 'scale(1)'
        handle.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)'
      })
      
      // Add event listeners
      handle.addEventListener('mousedown', (e) => this.startResize(e, direction))
      
      // Append to canvas body instead of element
      canvasBody.appendChild(handle)
      
      this.resizeHandles.push({ element: handle, direction })
    })
    
    this.updateHandlePositions()
  }

  /**
   * Get cursor style for resize direction
   */
  private getCursorForDirection(direction: string): string {
    const cursors: { [key: string]: string } = {
      'nw': 'nw-resize',
      'n': 'n-resize', 
      'ne': 'ne-resize',
      'e': 'e-resize',
      'se': 'se-resize',
      's': 's-resize',
      'sw': 'sw-resize',
      'w': 'w-resize'
    }
    return cursors[direction] || 'default'
  }

  /**
   * Start resizing operation
   */
  private startResize(event: MouseEvent, direction: string) {
    event.preventDefault()
    event.stopPropagation()

    if (!this.currentComponent) return

    this.isResizing = true
    this.startX = event.clientX
    this.startY = event.clientY

    const element = this.currentComponent.view?.el as HTMLElement
    if (element) {
      const rect = element.getBoundingClientRect()
      this.startWidth = rect.width
      this.startHeight = rect.height
    }

    // Store the current direction for use in handleResize
    this.currentDirection = direction

    // Add document-level event listeners on the iframe document if possible
    const frame = this.editor.Canvas.getFrameEl()
    const doc = frame?.contentDocument || document
    doc.addEventListener('mousemove', this.handleResize)
    doc.addEventListener('mouseup', this.stopResize)

    // Add visual feedback
    ;(doc.body as HTMLElement).style.cursor = this.getCursorForDirection(direction)
    ;(doc.body as HTMLElement).style.userSelect = 'none'
  }

  /**
   * Handle resize mouse movement
   */
  private handleResize = (event: MouseEvent) => {
    if (!this.isResizing || !this.currentComponent) return

    const element = this.currentComponent.view?.el as HTMLElement
    if (!element) return

    const deltaX = event.clientX - this.startX
    const deltaY = event.clientY - this.startY

    // Use the stored direction from startResize
    const direction = this.currentDirection
    let newWidth = this.startWidth
    let newHeight = this.startHeight

    // Calculate new dimensions based on direction
    switch (direction) {
      case 'e':
      case 'ne':
      case 'se':
        newWidth = Math.max(50, this.startWidth + deltaX)
        break
      case 'w':
      case 'nw':
      case 'sw':
        newWidth = Math.max(50, this.startWidth - deltaX)
        break
    }

    switch (direction) {
      case 's':
      case 'se':
      case 'sw':
        newHeight = Math.max(30, this.startHeight + deltaY)
        break
      case 'n':
      case 'ne':
      case 'nw':
        newHeight = Math.max(30, this.startHeight - deltaY)
        break
    }

    // Apply grid snapping if enabled
    if (this.isGridSnapEnabled()) {
      newWidth = this.snapToGrid(newWidth)
      newHeight = this.snapToGrid(newHeight)
    }

    // Update component styles
    this.updateComponentSize(newWidth, newHeight)
    
    // Update handle positions
    this.updateHandlePositions()
  }

  /**
   * Stop resizing operation
   */
  private stopResize = () => {
    if (!this.isResizing) return

    this.isResizing = false

  // Remove document-level event listeners (iframe aware)
  const frame = this.editor.Canvas.getFrameEl()
  const doc = frame?.contentDocument || document
  doc.removeEventListener('mousemove', this.handleResize)
  doc.removeEventListener('mouseup', this.stopResize)

    // Reset visual feedback
  ;(doc.body as HTMLElement).style.cursor = ''
  ;(doc.body as HTMLElement).style.userSelect = ''

    // Trigger component update for undo/redo system
    if (this.currentComponent) {
      this.editor.trigger('component:update', this.currentComponent)
    }
  }

  /**
   * Update component size
   */
  private updateComponentSize(width: number, height: number) {
    if (!this.currentComponent) return

    const styles = this.currentComponent.getStyle()
    
    this.currentComponent.setStyle({
      ...styles,
      width: `${width}px`,
      height: `${height}px`
    })
  }

  /**
   * Hide all resize handles
   */
  private hideResizeHandles() {
    this.resizeHandles.forEach(({ element }) => {
      element.remove()
    })
    this.resizeHandles = []
    this.currentComponent = null
  }

  /**
   * Update handle positions when component changes
   */
  private updateHandlePositions() {
    if (!this.currentComponent || this.resizeHandles.length === 0) return
    
    const view = this.currentComponent.view
    if (!view || !view.el) return
    
    const element = view.el as HTMLElement
    const rect = element.getBoundingClientRect()
    const canvas = this.editor.Canvas.getFrameEl()
    const canvasRect = canvas?.getBoundingClientRect()
    
    if (!canvasRect) return
    
    // Calculate positions relative to canvas
    const left = rect.left - canvasRect.left
    const top = rect.top - canvasRect.top
    const width = rect.width
    const height = rect.height
    
    this.resizeHandles.forEach(({ element: handle, direction }) => {
      let x = left
      let y = top
      
      switch (direction) {
        case 'nw': x = left - 5; y = top - 5; break
        case 'n': x = left + width/2 - 5; y = top - 5; break
        case 'ne': x = left + width - 5; y = top - 5; break
        case 'e': x = left + width - 5; y = top + height/2 - 5; break
        case 'se': x = left + width - 5; y = top + height - 5; break
        case 's': x = left + width/2 - 5; y = top + height - 5; break
        case 'sw': x = left - 5; y = top + height - 5; break
        case 'w': x = left - 5; y = top + height/2 - 5; break
      }
      
      handle.style.left = `${x}px`
      handle.style.top = `${y}px`
    })
  }

  /**
   * Check if grid snapping is enabled
   */
  private isGridSnapEnabled(): boolean {
    const frame = this.editor.Canvas.getFrameEl()
    const body = frame?.contentDocument?.body
    return body?.classList.contains('grid-enabled') || false
  }

  /**
   * Snap value to grid
   */
  private snapToGrid(value: number, gridSize: number = 20): number {
    return Math.round(value / gridSize) * gridSize
  }

  /**
   * Toggle grid visibility and snapping
   */
  toggleGrid() {
    const canvas = this.editor.Canvas.getFrameEl()
    if (canvas) {
      canvas.classList.toggle('grid-enabled')
    }
  }

  /**
   * Destroy resize manager
   */
  destroy() {
    this.hideResizeHandles()
    this.editor.off('component:selected', this.boundHandlers.componentSelected as any)
    this.editor.off('component:deselected', this.boundHandlers.componentDeselected as any)
    this.editor.off('canvas:frame:load', this.boundHandlers.canvasFrameLoad as any)
  }
}

export default ResizeManager