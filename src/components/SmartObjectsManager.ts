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