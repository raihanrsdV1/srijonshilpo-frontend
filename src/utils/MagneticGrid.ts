import { Editor, Component } from 'grapesjs'

interface GridConfig {
  size: number
  enabled: boolean
  snapThreshold: number
  showGuides: boolean
}

interface SnapGuide {
  element: HTMLElement
  type: 'horizontal' | 'vertical'
  position: number
}

export class MagneticGrid {
  private editor: Editor
  private config: GridConfig
  private snapGuides: SnapGuide[] = []
  private isDragging = false
  private handleDragStart: (component: Component) => void
  private handleDrag: (component: Component) => void
  private handleDragEnd: () => void

  constructor(editor: Editor, config: Partial<GridConfig> = {}) {
    this.editor = editor
    this.config = {
      size: 20,
      enabled: true,
      snapThreshold: 10,
      showGuides: true,
      ...config
    }
    
    // Bind handlers
    this.handleDragStart = this.onDragStart.bind(this)
    this.handleDrag = this.onDrag.bind(this)
    this.handleDragEnd = this.onDragEnd.bind(this)
    
    this.setupGridSystem()
  }

  /**
   * Setup magnetic grid system
   */
  private setupGridSystem() {
    // Enable grid visualization
    this.toggleGridVisibility(this.config.enabled)

    // Setup drag listeners for snapping
    this.setupDragListeners()

    // Add grid controls to editor
    this.addGridControls()
  }

  /**
   * Setup drag event listeners for magnetic snapping
   */
  private setupDragListeners() {
    this.editor.on('component:drag:start', this.handleDragStart)
    this.editor.on('component:drag', this.handleDrag)
    this.editor.on('component:drag:end', this.handleDragEnd)
  }

  private onDragStart(component: Component) {
    this.isDragging = true
    this.showSnapGuides(component)
  }

  private onDrag(component: Component) {
    if (this.config.enabled) {
      this.snapToGrid(component)
      this.updateSnapGuides(component)
    }
  }

  private onDragEnd() {
    this.isDragging = false
    this.hideSnapGuides()
  }

  /**
   * Add grid controls to the editor toolbar
   */
  private addGridControls() {
    this.editor.Panels.addButton('options', {
      id: 'toggle-grid',
      label: 'Grid',
      className: 'gjs-btn-toggle-grid',
      command: 'toggle-grid',
      attributes: { title: 'Toggle Magnetic Grid' },
      active: this.config.enabled
    })

    this.editor.Commands.add('toggle-grid', {
      run: () => {
        this.config.enabled = !this.config.enabled
        this.toggleGridVisibility(this.config.enabled)
        
        const btn = this.editor.Panels.getButton('options', 'toggle-grid')
        if (btn) {
          btn.set('active', this.config.enabled)
        }
      }
    })

    // Add grid size control
    this.editor.Panels.addButton('options', {
      id: 'grid-settings',
      label: 'Grid ⚙️',
      className: 'gjs-btn-grid-settings',
      command: 'open-grid-settings',
      attributes: { title: 'Grid Settings' }
    })

    this.editor.Commands.add('open-grid-settings', {
      run: () => {
        this.openGridSettings()
      }
    })
  }

  /**
   * Toggle grid visibility
   */
  public toggleGridVisibility(enabled: boolean) {
    const canvas = this.editor.Canvas.getFrameEl()
    if (!canvas) return
    
    const canvasBody = canvas?.contentDocument?.body || canvas?.querySelector('body')
    if (!canvasBody) return
    
    if (enabled) {
      canvasBody.classList.add('grid-enabled')
      canvasBody.style.setProperty('--grid-size', `${this.config.size}px`)
    } else {
      canvasBody.classList.remove('grid-enabled')
    }
  }

  /**
   * Snap component to grid
   */
  private snapToGrid(component: Component) {
    const view = component.view
    if (!view || !view.el) return

    const element = view.el as HTMLElement
    const rect = element.getBoundingClientRect()
    const canvas = this.editor.Canvas.getFrameEl()
    if (!canvas) return

    const canvasRect = canvas.getBoundingClientRect()
    
    // Calculate relative position within canvas
    const relativeX = rect.left - canvasRect.left
    const relativeY = rect.top - canvasRect.top

    // Snap to grid
    const snappedX = this.snapToGridValue(relativeX)
    const snappedY = this.snapToGridValue(relativeY)

    // Only apply if within snap threshold
    if (Math.abs(relativeX - snappedX) <= this.config.snapThreshold) {
      const styles = component.getStyle()
      component.setStyle({
        ...styles,
        left: `${snappedX}px`
      })
    }

    if (Math.abs(relativeY - snappedY) <= this.config.snapThreshold) {
      const styles = component.getStyle()
      component.setStyle({
        ...styles,
        top: `${snappedY}px`
      })
    }
  }

  /**
   * Snap a value to the grid
   */
  private snapToGridValue(value: number): number {
    return Math.round(value / this.config.size) * this.config.size
  }

  /**
   * Show snap guides for alignment
   */
  private showSnapGuides(component: Component) {
    if (!this.config.showGuides) return

    this.hideSnapGuides()

    const view = component.view
    if (!view || !view.el) return

    const element = view.el as HTMLElement
    const rect = element.getBoundingClientRect()
    const canvas = this.editor.Canvas.getFrameEl()
    if (!canvas) return

    const canvasRect = canvas.getBoundingClientRect()

    // Create horizontal guide at element center
    const centerY = rect.top + rect.height / 2 - canvasRect.top
    this.createSnapGuide('horizontal', centerY, true)

    // Create vertical guide at element center
    const centerX = rect.left + rect.width / 2 - canvasRect.left
    this.createSnapGuide('vertical', centerX, true)

    // Create guides at grid lines near the element
    const nearbyGridLinesX = this.getNearbyGridLines(rect.left - canvasRect.left, rect.width)
    const nearbyGridLinesY = this.getNearbyGridLines(rect.top - canvasRect.top, rect.height)

    nearbyGridLinesX.forEach(x => this.createSnapGuide('vertical', x))
    nearbyGridLinesY.forEach(y => this.createSnapGuide('horizontal', y))
  }

  /**
   * Get nearby grid lines for snapping
   */
  private getNearbyGridLines(position: number, size: number): number[] {
    const lines: number[] = []
    const start = position - this.config.snapThreshold * 2
    const end = position + size + this.config.snapThreshold * 2

    for (let i = Math.floor(start / this.config.size); i <= Math.ceil(end / this.config.size); i++) {
      lines.push(i * this.config.size)
    }

    return lines
  }

  /**
   * Create a snap guide element
   */
  private createSnapGuide(type: 'horizontal' | 'vertical', position: number, isCenter = false) {
    const canvas = this.editor.Canvas.getFrameEl()
    if (!canvas) return
    const canvasBody = canvas.contentDocument?.body || undefined
    if (!canvasBody) return

    const guide = (canvas.contentDocument as Document).createElement('div')
    guide.className = `snap-guideline ${type} ${isCenter ? 'center' : ''}`
    // Base styles for guides to make them visible within the canvas
    guide.style.position = 'absolute'
    guide.style.pointerEvents = 'none'
    guide.style.zIndex = '9999'
    guide.style.background = isCenter ? 'rgba(40, 167, 69, 0.7)' : 'rgba(0, 123, 255, 0.6)'
    
    if (type === 'horizontal') {
      guide.style.left = '0'
      guide.style.right = '0'
      guide.style.height = '1px'
      guide.style.top = `${position}px`
    } else {
      guide.style.top = '0'
      guide.style.bottom = '0'
      guide.style.width = '1px'
      guide.style.left = `${position}px`
    }

    canvasBody.appendChild(guide)
    
    this.snapGuides.push({ element: guide, type, position })

    // Auto-hide after a delay
    setTimeout(() => {
      if (guide.parentNode && !this.isDragging) {
        guide.remove()
      }
    }, 2000)
  }

  /**
   * Update snap guides during drag
   */
  private updateSnapGuides(component: Component) {
    // Remove old guides and create new ones
    this.showSnapGuides(component)
  }

  /**
   * Hide all snap guides
   */
  private hideSnapGuides() {
    this.snapGuides.forEach(guide => {
      if (guide.element.parentNode) {
        guide.element.remove()
      }
    })
    this.snapGuides = []
  }

  /**
   * Open grid settings modal
   */
  private openGridSettings() {
    const modal = this.editor.Modal
    modal.setTitle('Grid Settings')
    modal.setContent(`
      <div class="grid-settings">
        <div class="setting-group">
          <label for="grid-size">Grid Size (px):</label>
          <input type="number" id="grid-size" value="${this.config.size}" min="5" max="100" step="5">
        </div>
        <div class="setting-group">
          <label for="snap-threshold">Snap Threshold (px):</label>
          <input type="number" id="snap-threshold" value="${this.config.snapThreshold}" min="1" max="50">
        </div>
        <div class="setting-group">
          <label>
            <input type="checkbox" id="show-guides" ${this.config.showGuides ? 'checked' : ''}>
            Show Snap Guides
          </label>
        </div>
        <div class="setting-actions">
          <button id="apply-grid-settings" class="btn-primary">Apply</button>
          <button id="reset-grid-settings" class="btn-secondary">Reset</button>
        </div>
      </div>
    `)

    modal.open()

    // Handle settings application
    const applyBtn = modal.getContentEl()?.querySelector('#apply-grid-settings')
    applyBtn?.addEventListener('click', () => {
      this.applyGridSettings()
      modal.close()
    })

    const resetBtn = modal.getContentEl()?.querySelector('#reset-grid-settings')
    resetBtn?.addEventListener('click', () => {
      this.resetGridSettings()
      modal.close()
    })
  }

  /**
   * Apply grid settings from modal
   */
  private applyGridSettings() {
    const modal = this.editor.Modal
    const contentEl = modal.getContentEl()
    if (!contentEl) return

    const sizeInput = contentEl.querySelector('#grid-size') as HTMLInputElement
    const thresholdInput = contentEl.querySelector('#snap-threshold') as HTMLInputElement
    const guidesInput = contentEl.querySelector('#show-guides') as HTMLInputElement

    if (sizeInput) {
      this.config.size = parseInt(sizeInput.value)
    }
    if (thresholdInput) {
      this.config.snapThreshold = parseInt(thresholdInput.value)
    }
    if (guidesInput) {
      this.config.showGuides = guidesInput.checked
    }

    // Update grid visualization
    this.toggleGridVisibility(this.config.enabled)
  }

  /**
   * Reset grid settings to defaults
   */
  private resetGridSettings() {
    this.config = {
      size: 20,
      enabled: true,
      snapThreshold: 10,
      showGuides: true
    }
    this.toggleGridVisibility(this.config.enabled)
  }

  /**
   * Get current grid configuration
   */
  getConfig(): GridConfig {
    return { ...this.config }
  }

  /**
   * Update grid configuration
   */
  updateConfig(newConfig: Partial<GridConfig>) {
    this.config = { ...this.config, ...newConfig }
    this.toggleGridVisibility(this.config.enabled)
  }

  /**
   * Enable/disable magnetic grid
   */
  setEnabled(enabled: boolean) {
    this.config.enabled = enabled
    this.toggleGridVisibility(enabled)
  }

  /**
   * Destroy magnetic grid
   */
  destroy() {
    this.hideSnapGuides()
    this.editor.off('component:drag:start', this.handleDragStart)
    this.editor.off('component:drag', this.handleDrag)
    this.editor.off('component:drag:end', this.handleDragEnd)
  }
}

export default MagneticGrid