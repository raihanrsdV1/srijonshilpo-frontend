import { Component, Editor } from 'grapesjs'
import { SmartObjectTemplate } from '../types/smartObjects'
import { SMART_OBJECTS, SMART_OBJECTS_BY_CATEGORY } from '../data/smartObjects'

export class SmartObjectsManager {
  private editor: Editor
  private templates: SmartObjectTemplate[]
  
  constructor(editor: Editor) {
    this.editor = editor
    this.templates = SMART_OBJECTS
    this.registerSmartObjects()
    this.setupSmartObjectsPanel()
    this.setupTraitHandlers()
  }
  
  /**
   * Setup trait change handlers for Smart Objects
   */
  private setupTraitHandlers() {
    this.editor.on('component:update:traits', (component: Component) => {
      const smartObjectId = component.get('attributes')?.['data-smart-object-id']
      if (smartObjectId) {
        this.handleSmartObjectTraitChange(component, smartObjectId)
      }
    })

    // GrapesJS passes a Trait instance to 'trait:change'. Extract the component safely.
    this.editor.on('trait:change', (trait: any) => {
      try {
        const comp: Component | undefined = trait?.target || trait?.getTarget?.() || this.editor.getSelected()
        if (!comp) return
        const smartObjectId = comp.get('attributes')?.['data-smart-object-id']
        if (smartObjectId) {
          this.handleSmartObjectTraitChange(comp, smartObjectId)
        }
      } catch (err) {
        console.warn('Trait change handling error:', err)
      }
    })
  }

  /**
   * Handle trait changes for Smart Objects
   */
  private handleSmartObjectTraitChange(component: Component, smartObjectId: string) {
    const template = this.getTemplate(smartObjectId)
    if (!template) return

    const traits = component.get('traits')
    if (!traits || !Array.isArray(traits)) return
    
    const attributes = component.get('attributes') || {}
    
    // Update component attributes based on trait values
    traits.forEach((trait: any) => {
      const traitName = trait.get('name')
      const traitValue = trait.get('value')
      
      // Map trait names to data attributes
      const dataAttr = this.getDataAttributeForTrait(traitName)
      if (dataAttr) {
        attributes[dataAttr] = traitValue
      }
    })

    // Update component attributes
    component.set('attributes', attributes)

    // Apply visual changes based on specific traits
    this.applyTraitVisualChanges(component, template, traits)
    
    // Trigger component update
    component.trigger('change:attributes')
    this.editor.trigger('component:update', component)
  }

  /**
   * Map trait names to data attributes
   */
  private getDataAttributeForTrait(traitName: string): string {
    const traitMapping: Record<string, string> = {
      'colorScheme': 'data-color-scheme',
      'layout': 'data-layout',
      'enableZoom': 'data-enable-zoom',
      'enableGallery': 'data-enable-gallery',
      'autoPlay': 'data-auto-play',
      'showDots': 'data-show-dots',
      'showArrows': 'data-show-arrows',
      'allowMultiple': 'data-allow-multiple',
      'showSearch': 'data-show-search',
      'showDrawer': 'data-show-drawer',
      'productTitle': 'data-product-title',
      'productPrice': 'data-product-price',
      'productDescription': 'data-product-description',
      'sectionTitle': 'data-section-title'
    }
    return traitMapping[traitName] || `data-${traitName}`
  }

  /**
   * Apply visual changes based on trait values
   */
  private applyTraitVisualChanges(component: Component, template: SmartObjectTemplate, traits: any[]) {
    const view = component.view
    if (!view || !view.el) return

    const element = view.el

    traits.forEach((trait: any) => {
      const traitName = trait.get('name')
      const traitValue = trait.get('value')

      switch (traitName) {
        case 'colorScheme':
          this.applyColorScheme(element, traitValue)
          // Also apply to component styles for persistence
          this.applyColorSchemeToComponent(component, traitValue)
          break
        case 'layout':
          this.applyLayout(element, traitValue)
          this.applyLayoutToComponent(component, traitValue)
          break
        case 'productTitle':
          this.updateProductTitle(element, traitValue)
          break
        case 'productPrice':
          this.updateProductPrice(element, traitValue)
          break
        case 'productDescription':
          this.updateProductDescription(element, traitValue)
          break
        case 'sectionTitle':
          this.updateSectionTitle(element, traitValue)
          break
      }
    })

    // Force component update to ensure changes are saved
    component.view?.render()
    this.editor.trigger('component:update', component)
  }

  /**
   * Apply color scheme to Smart Object
   */
  private applyColorScheme(element: HTMLElement, colorSchemeId: string) {
    const colorSchemes = [
      { id: 'modern', primary: '#3b82f6', secondary: '#1d4ed8', accent: '#f59e0b', background: '#ffffff', text: '#1f2937' },
      { id: 'warm', primary: '#f59e0b', secondary: '#d97706', accent: '#ef4444', background: '#fef7ed', text: '#1c1917' },
      { id: 'cool', primary: '#06b6d4', secondary: '#0891b2', accent: '#8b5cf6', background: '#f0f9ff', text: '#164e63' },
      { id: 'dark', primary: '#6366f1', secondary: '#4f46e5', accent: '#ec4899', background: '#1f2937', text: '#f9fafb' },
      { id: 'nature', primary: '#10b981', secondary: '#059669', accent: '#f59e0b', background: '#f0fdf4', text: '#064e3b' },
      { id: 'sunset', primary: '#f59e0b', secondary: '#d97706', accent: '#ef4444', background: '#fffbeb', text: '#92400e' }
    ]

    const scheme = colorSchemes.find(s => s.id === colorSchemeId)
    if (scheme) {
      element.style.setProperty('--primary-color', scheme.primary)
      element.style.setProperty('--secondary-color', scheme.secondary)
      element.style.setProperty('--accent-color', scheme.accent)
      element.style.setProperty('--background-color', scheme.background)
      element.style.setProperty('--text-color', scheme.text)
    }
  }

  /**
   * Apply color scheme to component styles for persistence
   */
  private applyColorSchemeToComponent(component: Component, colorSchemeId: string) {
    const colorSchemes = [
      { id: 'modern', primary: '#3b82f6', secondary: '#1d4ed8', accent: '#f59e0b', background: '#ffffff', text: '#1f2937' },
      { id: 'warm', primary: '#f59e0b', secondary: '#d97706', accent: '#ef4444', background: '#fef7ed', text: '#1c1917' },
      { id: 'cool', primary: '#06b6d4', secondary: '#0891b2', accent: '#8b5cf6', background: '#f0f9ff', text: '#164e63' },
      { id: 'dark', primary: '#6366f1', secondary: '#4f46e5', accent: '#ec4899', background: '#1f2937', text: '#f9fafb' },
      { id: 'nature', primary: '#10b981', secondary: '#059669', accent: '#f59e0b', background: '#f0fdf4', text: '#064e3b' },
      { id: 'sunset', primary: '#f59e0b', secondary: '#d97706', accent: '#ef4444', background: '#fffbeb', text: '#92400e' }
    ]

    const scheme = colorSchemes.find(s => s.id === colorSchemeId)
    if (scheme) {
      const currentStyles = component.getStyle() || {}
      component.setStyle({
        ...currentStyles,
        '--primary-color': scheme.primary,
        '--secondary-color': scheme.secondary,
        '--accent-color': scheme.accent,
        '--background-color': scheme.background,
        '--text-color': scheme.text
      })
    }
  }

  /**
   * Apply layout changes to Smart Object
   */
  private applyLayout(element: HTMLElement, layout: string) {
    // Remove existing layout classes
    element.classList.remove('layout-horizontal', 'layout-vertical', 'layout-centered')
    // Add new layout class
    element.classList.add(`layout-${layout}`)
  }

  /**
   * Apply layout to component for persistence
   */
  private applyLayoutToComponent(component: Component, layout: string) {
    try {
      // Use addClass/removeClass for simpler class management
      const layoutClasses = ['layout-horizontal', 'layout-vertical', 'layout-centered']
      layoutClasses.forEach(cls => {
        if (component.removeClass) {
          component.removeClass(cls)
        }
      })
      
      if (component.addClass) {
        component.addClass(`layout-${layout}`)
      }
    } catch (e) {
      console.warn('Failed to apply layout class:', e)
    }
  }

  /**
   * Update product title
   */
  private updateProductTitle(element: HTMLElement, title: string) {
    const titleElement = element.querySelector('.product-title')
    if (titleElement) {
      titleElement.textContent = title
    }
  }

  /**
   * Update product price
   */
  private updateProductPrice(element: HTMLElement, price: string | number) {
    const priceElement = element.querySelector('.product-price')
    if (priceElement) {
      const formattedPrice = typeof price === 'number' ? `$${price.toFixed(2)}` : price
      priceElement.textContent = formattedPrice
    }
  }

  /**
   * Update product description
   */
  private updateProductDescription(element: HTMLElement, description: string) {
    const descElement = element.querySelector('.product-description')
    if (descElement) {
      descElement.textContent = description
    }
  }

  /**
   * Update section title for components like testimonials, FAQ
   */
  private updateSectionTitle(element: HTMLElement, title: string) {
    const titleSelectors = ['.testimonial-section-title', '.faq-section-title']
    for (const selector of titleSelectors) {
      const titleElement = element.querySelector(selector)
      if (titleElement) {
        titleElement.textContent = title
        break
      }
    }
  }
  
  /**
   * Register all Smart Object components with GrapeJS
   */
  private registerSmartObjects() {
    this.templates.forEach(template => {
      this.registerSmartObject(template)
    })
  }
  
  /**
   * Register a single Smart Object template as a GrapeJS component
   */
  private registerSmartObject(template: SmartObjectTemplate) {
    const { component } = template
    
    // Register the component type with GrapeJS
    this.editor.DomComponents.addType(component.type, {
      model: {
        defaults: {
          ...component.defaults,
          content: this.generateSmartObjectHTML(template),
          attributes: {
            ...component.defaults.attributes,
            'data-smart-object-id': template.id
          }
        },
        ...component.model
      },
      view: {
        ...component.view,
        onRender() {
          console.log(`Initialized Smart Object: ${template.name}`)
        }
      }
    })
  }
  
  /**
   * Generate HTML content for Smart Object based on template
   */
  private generateSmartObjectHTML(template: SmartObjectTemplate): string {
    switch (template.id) {
      case 'smart-product-showcase':
        return `
          <div class="smart-product-showcase-container">
            <div class="product-gallery-section">
              <div class="main-image-wrapper">
                <img class="main-product-image" src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop" alt="Premium Wireless Headphones" />
                <button class="zoom-button">🔍</button>
              </div>
              <div class="thumbnail-gallery">
                <img class="thumbnail active" src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&h=100&fit=crop" alt="View 1" />
                <img class="thumbnail" src="https://images.unsplash.com/photo-1583394838336-acd977736f90?w=100&h=100&fit=crop" alt="View 2" />
                <img class="thumbnail" src="https://images.unsplash.com/photo-1484704849700-f032a568e944?w=100&h=100&fit=crop" alt="View 3" />
              </div>
            </div>
            <div class="product-details-section">
              <h1 class="product-title">Premium Wireless Headphones</h1>
              <div class="product-price">$299.99</div>
              <div class="product-rating">
                <span class="stars">⭐⭐⭐⭐⭐</span>
                <span class="rating-count">(127 reviews)</span>
              </div>
              <p class="product-description">Professional-grade wireless headphones with active noise cancellation and superior sound quality.</p>
              <div class="product-options">
                <div class="option-group">
                  <label>Color:</label>
                  <div class="color-options">
                    <span class="color-option active" data-color="black" style="background: #000"></span>
                    <span class="color-option" data-color="white" style="background: #fff"></span>
                    <span class="color-option" data-color="blue" style="background: #007bff"></span>
                  </div>
                </div>
                <div class="option-group">
                  <label for="quantity">Quantity:</label>
                  <input type="number" id="quantity" value="1" min="1" class="quantity-input" />
                </div>
              </div>
              <div class="product-actions">
                <button class="add-to-cart-btn primary">Add to Cart</button>
                <button class="wishlist-btn secondary">♡ Save</button>
              </div>
            </div>
          </div>
        `
      
      case 'smart-testimonial-carousel':
        return `
          <div class="smart-testimonial-carousel-container">
            <h2 class="testimonial-section-title">What Our Customers Say</h2>
            <div class="testimonial-carousel">
              <div class="testimonial-track">
                <div class="testimonial-card active">
                  <div class="testimonial-content">
                    <div class="quote-icon">"</div>
                    <p class="testimonial-text">This platform has revolutionized how we build and manage our online presence. Absolutely fantastic!</p>
                    <div class="testimonial-rating">
                      <span class="stars">⭐⭐⭐⭐⭐</span>
                    </div>
                  </div>
                  <div class="testimonial-author">
                    <img class="author-avatar" src="https://images.unsplash.com/photo-1494790108755-2616b612b786?w=60&h=60&fit=crop&crop=face" alt="Sarah Johnson" />
                    <div class="author-info">
                      <h4 class="author-name">Sarah Johnson</h4>
                      <p class="author-role">Marketing Director at TechCorp</p>
                    </div>
                  </div>
                </div>
                <div class="testimonial-card">
                  <div class="testimonial-content">
                    <div class="quote-icon">"</div>
                    <p class="testimonial-text">The ease of use combined with powerful features makes this our go-to solution for all web projects.</p>
                    <div class="testimonial-rating">
                      <span class="stars">⭐⭐⭐⭐⭐</span>
                    </div>
                  </div>
                  <div class="testimonial-author">
                    <img class="author-avatar" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=60&h=60&fit=crop&crop=face" alt="Michael Chen" />
                    <div class="author-info">
                      <h4 class="author-name">Michael Chen</h4>
                      <p class="author-role">CEO at InnovateLab</p>
                    </div>
                  </div>
                </div>
              </div>
              <div class="carousel-controls">
                <button class="carousel-arrow prev" aria-label="Previous testimonial">‹</button>
                <div class="carousel-dots">
                  <span class="dot active" data-slide="0"></span>
                  <span class="dot" data-slide="1"></span>
                </div>
                <button class="carousel-arrow next" aria-label="Next testimonial">›</button>
              </div>
            </div>
          </div>
        `
      
      case 'smart-faq-accordion':
        return `
          <div class="smart-faq-accordion-container">
            <h2 class="faq-section-title">Frequently Asked Questions</h2>
            <div class="faq-search-wrapper">
              <input type="text" class="faq-search" placeholder="Search questions..." />
              <span class="search-icon">🔍</span>
            </div>
            <div class="faq-list">
              <div class="faq-item">
                <button class="faq-question" aria-expanded="false">
                  <span class="question-text">How do I get started?</span>
                  <span class="question-icon">+</span>
                </button>
                <div class="faq-answer">
                  <p>Getting started is easy! Simply sign up for an account and choose from our pre-designed templates or start from scratch.</p>
                </div>
              </div>
              <div class="faq-item">
                <button class="faq-question" aria-expanded="false">
                  <span class="question-text">What payment methods do you accept?</span>
                  <span class="question-icon">+</span>
                </button>
                <div class="faq-answer">
                  <p>We accept all major credit cards, PayPal, and bank transfers for annual subscriptions.</p>
                </div>
              </div>
              <div class="faq-item">
                <button class="faq-question" aria-expanded="false">
                  <span class="question-text">Can I cancel my subscription anytime?</span>
                  <span class="question-icon">+</span>
                </button>
                <div class="faq-answer">
                  <p>Yes, you can cancel your subscription at any time from your account settings. No questions asked.</p>
                </div>
              </div>
            </div>
          </div>
        `
      
      case 'smart-shopping-cart':
        return `
          <div class="smart-shopping-cart-container">
            <button class="cart-trigger">
              <span class="cart-icon">🛒</span>
              <span class="cart-count">1</span>
            </button>
            <div class="cart-drawer">
              <div class="cart-header">
                <h3>Shopping Cart</h3>
                <button class="cart-close">×</button>
              </div>
              <div class="cart-items">
                <div class="cart-item">
                  <img class="item-image" src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=80&h=80&fit=crop" alt="Premium Headphones" />
                  <div class="item-details">
                    <h4 class="item-name">Premium Headphones</h4>
                    <p class="item-variant">Color: Black</p>
                    <div class="item-controls">
                      <button class="quantity-btn minus">-</button>
                      <span class="quantity">1</span>
                      <button class="quantity-btn plus">+</button>
                    </div>
                  </div>
                  <div class="item-price-section">
                    <span class="item-price">$299.99</span>
                    <button class="remove-item">🗑️</button>
                  </div>
                </div>
              </div>
              <div class="cart-summary">
                <div class="summary-line">
                  <span>Subtotal:</span>
                  <span>$299.99</span>
                </div>
                <div class="summary-line">
                  <span>Shipping:</span>
                  <span>$9.99</span>
                </div>
                <div class="summary-line">
                  <span>Tax:</span>
                  <span>$27.00</span>
                </div>
                <div class="summary-line total">
                  <span>Total:</span>
                  <span>$336.98</span>
                </div>
                <div class="coupon-section">
                  <input type="text" placeholder="Coupon code" class="coupon-input" />
                  <button class="apply-coupon">Apply</button>
                </div>
              </div>
              <div class="cart-actions">
                <button class="checkout-btn primary">Proceed to Checkout</button>
                <button class="continue-shopping secondary">Continue Shopping</button>
              </div>
            </div>
          </div>
        `

      case 'smart-product-card':
        return `
          <div class="smart-product-card-container">
            <div class="product-image-wrapper">
              <img class="product-image" src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop" alt="Product" />
            </div>
            <div class="product-content">
              <h3 class="product-title">Amazing Product</h3>
              <p class="product-description">High-quality product with amazing features</p>
              <div class="product-price">$99.99</div>
              <button class="product-cta">Add to Cart</button>
            </div>
          </div>
        `
      
      case 'smart-product-grid':
        return `
          <div class="smart-product-grid-container">
            <div class="product-grid">
              ${Array.from({ length: 6 }, (_, i) => `
                <div class="grid-product-card">
                  <img src="https://images.unsplash.com/photo-${1505740420928 + i}?w=300&h=300&fit=crop" alt="Product ${i + 1}" />
                  <h4>Product ${i + 1}</h4>
                  <span class="price">$${(99 + i * 10).toFixed(2)}</span>
                </div>
              `).join('')}
            </div>
          </div>
        `
      
      case 'smart-hero-section':
        return `
          <div class="smart-hero-content">
            <div class="hero-overlay">
              <h1 class="hero-title">Welcome to Our Amazing Platform</h1>
              <p class="hero-subtitle">Discover incredible products and services that will transform your experience</p>
              <button class="hero-cta">Get Started</button>
            </div>
          </div>
        `
      
      case 'smart-cta-banner':
        return `
          <div class="smart-cta-banner-content">
            <div class="cta-text-section">
              <h2 class="cta-title">Level-up your storefront</h2>
              <p class="cta-subtitle">Launch fast with beautiful, smart components</p>
            </div>
            <div class="cta-action-section">
              <button class="cta-button">Get Started</button>
            </div>
          </div>
        `
      
      default:
        return '<div class="smart-object-placeholder">Smart Object Content</div>'
    }
  }
  
  /**
   * Setup Smart Objects panel in the editor
   */
  private setupSmartObjectsPanel() {
    // Add Smart Objects blocks to the existing blocks panel
    this.addSmartObjectBlocks()
  }
  
  /**
   * Add Smart Object blocks to the blocks panel
   */
  private addSmartObjectBlocks() {
    const blockManager = this.editor.BlockManager
    
    // Add Smart Objects to blocks panel
    this.templates.forEach(template => {
      blockManager.add(template.id, {
        label: template.name,
        category: this.getCategoryLabel(template.category),
        content: {
          type: template.component.type,
          attributes: {
            'data-smart-object-id': template.id,
            'data-smart-object-version': '1.0'
          }
        },
        media: this.getDefaultThumbnail(template.category),
        attributes: {
          class: 'smart-object-block',
          'data-category': template.category,
          'data-difficulty': template.difficulty,
          title: template.description
        }
      })
    })
  }
  
  /**
   * Get category label for blocks panel
   */
  private getCategoryLabel(category: string): string {
    const categoryLabels = {
      ecommerce: '🛒 Smart E-commerce',
      content: '📝 Smart Content',
      layout: '📐 Smart Layout',
      interactive: '⚡ Smart Interactive'
    }
    return categoryLabels[category as keyof typeof categoryLabels] || 'Smart Other'
  }
  
  /**
   * Get default thumbnail for category
   */
  private getDefaultThumbnail(category: string): string {
    const thumbnails = {
      ecommerce: `<div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); width: 50px; height: 40px; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: white; font-size: 18px;">🛒</div>`,
      content: `<div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); width: 50px; height: 40px; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: white; font-size: 18px;">📝</div>`,
      layout: `<div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); width: 50px; height: 40px; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: white; font-size: 18px;">📐</div>`,
      interactive: `<div style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); width: 50px; height: 40px; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: white; font-size: 18px;">⚡</div>`
    }
    return thumbnails[category as keyof typeof thumbnails] || `<div style="background: #6b7280; width: 50px; height: 40px; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: white; font-size: 18px;">🔷</div>`
  }
  
  /**
   * Get Smart Object template by ID
   */
  getTemplate(id: string): SmartObjectTemplate | undefined {
    return this.templates.find(template => template.id === id)
  }
  
  /**
   * Get Smart Objects by category
   */
  getTemplatesByCategory(category: string): SmartObjectTemplate[] {
    return SMART_OBJECTS_BY_CATEGORY[category as keyof typeof SMART_OBJECTS_BY_CATEGORY] || []
  }
  
  /**
   * Add custom Smart Object template
   */
  addTemplate(template: SmartObjectTemplate) {
    this.templates.push(template)
    this.registerSmartObject(template)
  }
}

export default SmartObjectsManager