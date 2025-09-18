import { Editor, Component } from 'grapesjs'

export class UniversalHoverOutline {
  private editor: Editor
  private canvas: HTMLIFrameElement | null = null
  private canvasDocument: Document | null = null
  private hoverOutline: HTMLElement | null = null
  private currentHoveredElement: HTMLElement | null = null
  private isEnabled: boolean = true

  constructor(editor: Editor) {
    this.editor = editor
    this.initializeHoverSystem()
  }

  /**
   * Initialize the hover outline system
   */
  private initializeHoverSystem() {
    // Wait for editor to be ready
    this.editor.on('load', () => {
      this.setupCanvas()
      this.createHoverOutline()
      this.attachHoverEvents()
    })

    // Re-setup when canvas is updated
    this.editor.on('canvas:frame:load', () => {
      this.setupCanvas()
      this.attachHoverEvents()
    })
  }

  /**
   * Setup canvas references
   */
  private setupCanvas() {
    try {
      this.canvas = this.editor.Canvas.getFrameEl()
      this.canvasDocument = this.canvas?.contentDocument || null
      
      if (this.canvasDocument) {
        this.injectHoverStyles()
      }
    } catch (error) {
      console.warn('Failed to setup canvas for hover outlines:', error)
    }
  }

  /**
   * Inject hover outline styles into canvas
   */
  private injectHoverStyles() {
    if (!this.canvasDocument) return

    // Remove existing styles
    const existingStyle = this.canvasDocument.getElementById('universal-hover-styles')
    if (existingStyle) {
      existingStyle.remove()
    }

    // Create new style element
    const style = this.canvasDocument.createElement('style')
    style.id = 'universal-hover-styles'
    style.textContent = `
      .universal-hover-outline {
        position: absolute !important;
        pointer-events: none !important;
        border: 2px solid #10b981 !important;
        border-radius: 4px !important;
        background: rgba(16, 185, 129, 0.1) !important;
        box-shadow: 0 0 0 1px rgba(16, 185, 129, 0.2) !important;
        transition: all 0.15s ease !important;
        z-index: 9999 !important;
        opacity: 0 !important;
      }
      
      .universal-hover-outline.active {
        opacity: 1 !important;
      }
      
      .universal-hover-outline::before {
        content: attr(data-component-type) !important;
        position: absolute !important;
        top: -24px !important;
        left: 0 !important;
        background: #10b981 !important;
        color: white !important;
        font-size: 11px !important;
        font-weight: 500 !important;
        padding: 2px 6px !important;
        border-radius: 3px !important;
        white-space: nowrap !important;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
      }
      
      /* Hide outline for selected elements to avoid conflict */
      [data-gjs-type] {
        transition: box-shadow 0.15s ease !important;
      }
      
      [data-gjs-type]:not(.gjs-selected):hover {
        box-shadow: inset 0 0 0 2px rgba(16, 185, 129, 0.3) !important;
      }
    `
    
    this.canvasDocument.head.appendChild(style)
  }

  /**
   * Create hover outline element
   */
  private createHoverOutline() {
    if (!this.canvasDocument) return

    // Remove existing outline
    const existing = this.canvasDocument.getElementById('universal-hover-outline')
    if (existing) {
      existing.remove()
    }

    // Create new outline element
    this.hoverOutline = this.canvasDocument.createElement('div')
    this.hoverOutline.id = 'universal-hover-outline'
    this.hoverOutline.className = 'universal-hover-outline'
    
    this.canvasDocument.body.appendChild(this.hoverOutline)
  }

  /**
   * Attach hover event listeners to canvas
   */
  private attachHoverEvents() {
    if (!this.canvasDocument) return

    // Remove existing listeners
    this.removeHoverEvents()

    // Add mouseover listener
    this.canvasDocument.addEventListener('mouseover', this.handleMouseOver.bind(this), true)
    this.canvasDocument.addEventListener('mouseout', this.handleMouseOut.bind(this), true)
  }

  /**
   * Handle mouse over events
   */
  private handleMouseOver(event: MouseEvent) {
    if (!this.isEnabled) return

    const target = event.target as HTMLElement
    if (!target || !this.canvasDocument) return

    // Skip if target is the outline itself or body/html
    if (target.classList.contains('universal-hover-outline') || 
        target.tagName === 'BODY' || 
        target.tagName === 'HTML') {
      return
    }

    // Find the nearest component element
    const componentElement = this.findComponentElement(target)
    if (!componentElement) return

    // Skip if already selected
    if (componentElement.classList.contains('gjs-selected')) {
      this.hideHoverOutline()
      return
    }

    // Skip if same element already hovered
    if (componentElement === this.currentHoveredElement) return

    this.currentHoveredElement = componentElement
    this.showHoverOutline(componentElement)
  }

  /**
   * Handle mouse out events
   */
  private handleMouseOut(event: MouseEvent) {
    if (!this.isEnabled) return

    const target = event.target as HTMLElement
    const relatedTarget = event.relatedTarget as HTMLElement

    // If moving to outline element or within same component, keep outline
    if (relatedTarget?.classList.contains('universal-hover-outline')) {
      return
    }

    // If moving within the same component, keep outline
    if (this.currentHoveredElement && 
        (relatedTarget === this.currentHoveredElement || 
         this.currentHoveredElement.contains(relatedTarget))) {
      return
    }

    // Small delay to prevent flickering when moving between child elements
    setTimeout(() => {
      if (this.currentHoveredElement === target || 
          this.currentHoveredElement?.contains(target)) {
        this.hideHoverOutline()
      }
    }, 50)
  }

  /**
   * Find the nearest component element
   */
  private findComponentElement(element: HTMLElement): HTMLElement | null {
    let current = element

    while (current && current !== this.canvasDocument?.body) {
      // Check if element has GrapesJS component attributes
      if (current.hasAttribute('data-gjs-type') || 
          current.classList.contains('gjs-comp') ||
          current.hasAttribute('data-smart-object-id')) {
        return current
      }
      current = current.parentElement as HTMLElement
    }

    return null
  }

  /**
   * Show hover outline for element
   */
  private showHoverOutline(element: HTMLElement) {
    if (!this.hoverOutline || !element) return

    const rect = element.getBoundingClientRect()
    const canvasBody = this.canvasDocument?.body
    if (!canvasBody) return

    // Get component type for label
    const componentType = this.getComponentTypeName(element)

    // Position the outline
    this.hoverOutline.style.left = `${element.offsetLeft}px`
    this.hoverOutline.style.top = `${element.offsetTop}px`
    this.hoverOutline.style.width = `${element.offsetWidth}px`
    this.hoverOutline.style.height = `${element.offsetHeight}px`
    this.hoverOutline.setAttribute('data-component-type', componentType)

    // Show outline
    this.hoverOutline.classList.add('active')
  }

  /**
   * Hide hover outline
   */
  private hideHoverOutline() {
    if (this.hoverOutline) {
      this.hoverOutline.classList.remove('active')
    }
    this.currentHoveredElement = null
  }

  /**
   * Get human-readable component type name
   */
  private getComponentTypeName(element: HTMLElement): string {
    // Check for smart object type first
    const smartObjectId = element.getAttribute('data-smart-object-id')
    if (smartObjectId) {
      return smartObjectId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    }

    // Check GrapesJS type
    const gjsType = element.getAttribute('data-gjs-type')
    if (gjsType) {
      return gjsType.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
    }

    // Check class names for component types
    const classList = Array.from(element.classList)
    for (const className of classList) {
      if (className.includes('smart-')) {
        return className.replace('smart-', '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
      }
    }

    // Fallback to tag name
    const tagName = element.tagName.toLowerCase()
    switch (tagName) {
      case 'div': return 'Container'
      case 'p': return 'Text'
      case 'h1': case 'h2': case 'h3': case 'h4': case 'h5': case 'h6': return 'Heading'
      case 'img': return 'Image'
      case 'button': return 'Button'
      case 'a': return 'Link'
      case 'section': return 'Section'
      case 'article': return 'Article'
      case 'header': return 'Header'
      case 'footer': return 'Footer'
      case 'nav': return 'Navigation'
      default: return tagName.charAt(0).toUpperCase() + tagName.slice(1)
    }
  }

  /**
   * Remove hover event listeners
   */
  private removeHoverEvents() {
    if (this.canvasDocument) {
      this.canvasDocument.removeEventListener('mouseover', this.handleMouseOver.bind(this), true)
      this.canvasDocument.removeEventListener('mouseout', this.handleMouseOut.bind(this), true)
    }
  }

  /**
   * Enable/disable hover outlines
   */
  setEnabled(enabled: boolean) {
    this.isEnabled = enabled
    if (!enabled) {
      this.hideHoverOutline()
    }
  }

  /**
   * Check if hover outlines are enabled
   */
  isHoverEnabled(): boolean {
    return this.isEnabled
  }

  /**
   * Cleanup and destroy
   */
  destroy() {
    this.removeHoverEvents()
    this.hideHoverOutline()
    
    if (this.hoverOutline) {
      this.hoverOutline.remove()
    }

    // Remove injected styles
    if (this.canvasDocument) {
      const style = this.canvasDocument.getElementById('universal-hover-styles')
      if (style) {
        style.remove()
      }
    }
  }
}

export default UniversalHoverOutline