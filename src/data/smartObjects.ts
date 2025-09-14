import { SmartObjectTemplate, COLOR_SCHEMES, LAYOUT_VARIANTS, SIZE_VARIANTS, ANIMATION_OPTIONS } from '../types/smartObjects'

// Smart Product Card Object
export const SMART_PRODUCT_CARD: SmartObjectTemplate = {
  id: 'smart-product-card',
  name: 'Smart Product Card',
  description: 'Professional product card with image, title, price, and buy button',
  category: 'ecommerce',
  difficulty: 'beginner',
  thumbnail: '/smart-objects/product-card-thumb.png',
  preview: '/smart-objects/product-card-preview.png',
  
  component: {
    type: 'smart-product-card',
    defaults: {
      tagName: 'div',
      classes: ['smart-product-card'],
      attributes: {
        'data-smart-object': 'product-card',
        'data-version': '1.0'
      },
      traits: [
        {
          type: 'text',
          name: 'productTitle',
          label: 'Product Title',
          value: 'Amazing Product'
        },
        {
          type: 'number',
          name: 'productPrice',
          label: 'Price ($)',
          value: 99.99
        },
        {
          type: 'image-asset',
          name: 'productImage',
          label: 'Product Image',
          value: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop'
        },
        {
          type: 'textarea',
          name: 'productDescription',
          label: 'Description',
          value: 'High-quality product with amazing features'
        },
        {
          type: 'select',
          name: 'colorScheme',
          label: 'Color Scheme',
          options: COLOR_SCHEMES.map(scheme => ({ value: scheme.id, name: scheme.name })),
          value: 'modern'
        },
        {
          type: 'select',
          name: 'layout',
          label: 'Layout',
          options: LAYOUT_VARIANTS.map(variant => ({ value: variant.id, name: variant.name })),
          value: 'vertical-center'
        },
        {
          type: 'select',
          name: 'size',
          label: 'Size',
          options: SIZE_VARIANTS.map(variant => ({ value: variant.id, name: variant.name })),
          value: 'medium'
        }
      ]
    },
    model: {
      init() {
        this.on('change:attributes:data-product-title', this.updateProductTitle)
        this.on('change:attributes:data-product-price', this.updateProductPrice)
        this.on('change:attributes:data-product-image', this.updateProductImage)
        this.on('change:attributes:data-color-scheme', this.updateColorScheme)
        this.on('change:attributes:data-layout', this.updateLayout)

        // Map traits to data-* attributes so Trait Manager updates persist
        const traitMap: Record<string, string> = {
          productTitle: 'data-product-title',
          productPrice: 'data-product-price',
          productImage: 'data-product-image',
          colorScheme: 'data-color-scheme',
          layout: 'data-layout',
          size: 'data-size'
        }
        
        // Listen for trait changes and update attributes
        this.on('change:traits', () => {
          const traits = this.get('traits')
          if (traits && traits.models) {
            traits.models.forEach((trait: any) => {
              const traitName = trait.get('name')
              const traitValue = trait.get('value')
              const dataAttr = traitMap[traitName]
              if (dataAttr && traitValue !== undefined) {
                const attrs = this.getAttributes() || {}
                this.set({ attributes: { ...attrs, [dataAttr]: traitValue } })
              }
            })
          }
        })
      },
      
      updateProductTitle() {
        const title = this.getAttributes()['data-product-title']
        if (title) {
          const titleEl = this.view?.$el?.find('.product-title')
          if (titleEl && titleEl.length) titleEl.text(title)
        }
      },
      
      updateProductPrice() {
        const price = this.getAttributes()['data-product-price']
        if (price) {
          const priceEl = this.view?.$el?.find('.product-price')
          if (priceEl && priceEl.length) priceEl.text(`$${price}`)
        }
      },
      
      updateProductImage() {
        const imageUrl = this.getAttributes()['data-product-image']
        if (imageUrl) {
          const imgEl = this.view?.$el?.find('.product-image')
          if (imgEl && imgEl.length) imgEl.attr('src', imageUrl)
        }
      },
      
      updateColorScheme() {
        const schemeId = this.getAttributes()['data-color-scheme']
        const scheme = COLOR_SCHEMES.find(s => s.id === schemeId)
        if (scheme && this.view?.$el) {
          this.view.$el.get(0).style.setProperty('--primary-color', scheme.primary)
          this.view.$el.get(0).style.setProperty('--secondary-color', scheme.secondary)
          this.view.$el.get(0).style.setProperty('--accent-color', scheme.accent)
          this.view.$el.get(0).style.setProperty('--background-color', scheme.background)
          this.view.$el.get(0).style.setProperty('--text-color', scheme.text)
        }
      },
      
      updateLayout() {
        const layoutId = this.getAttributes()['data-layout']
        const layout = LAYOUT_VARIANTS.find(l => l.id === layoutId)
        if (layout && this.view?.$el) {
          // Remove existing layout classes
          this.view.$el.removeClass('layout-vertical layout-horizontal layout-grid')
          // Add new layout class
          this.view.$el.addClass(`layout-${layout.direction}`)
          this.view.$el.addClass(`align-${layout.alignment}`)
          this.view.$el.addClass(`spacing-${layout.spacing}`)
        }
      }
    },
    view: {
      init() {
        this.listenTo(this.model, 'change', this.render)
      }
    }
  },
  
  quickCustomization: {
    colorSchemes: COLOR_SCHEMES,
    layouts: LAYOUT_VARIANTS,
    sizes: SIZE_VARIANTS,
    animations: ANIMATION_OPTIONS
  },
  
  advancedCustomization: {
    spacing: {
      min: 0,
      max: 50,
      step: 5,
      unit: 'px',
      default: 20
    },
    typography: {
      fontFamily: ['Inter', 'Roboto', 'Arial', 'Georgia'],
      fontSize: { min: 12, max: 24, step: 1, unit: 'px', default: 16 },
      fontWeight: [300, 400, 500, 600, 700],
      lineHeight: { min: 1.0, max: 2.0, step: 0.1, unit: '', default: 1.5 },
      letterSpacing: { min: -2, max: 5, step: 0.5, unit: 'px', default: 0 }
    },
    borders: {
      width: { min: 0, max: 10, step: 1, unit: 'px', default: 1 },
      style: ['solid', 'dashed', 'dotted', 'none'],
      radius: { min: 0, max: 30, step: 2, unit: 'px', default: 8 },
      color: '#E5E7EB'
    },
    shadows: {
      presets: ['none', 'soft', 'medium', 'hard', 'glow'],
      custom: {
        offsetX: { min: -20, max: 20, step: 1, unit: 'px', default: 0 },
        offsetY: { min: -20, max: 20, step: 1, unit: 'px', default: 4 },
        blur: { min: 0, max: 50, step: 1, unit: 'px', default: 6 },
        spread: { min: -10, max: 10, step: 1, unit: 'px', default: 0 },
        color: '#000000',
        opacity: { min: 0, max: 1, step: 0.1, unit: '', default: 0.1 }
      }
    }
  },
  
  dataBinding: {
    source: 'ecommerce',
    schema: {
      id: 'number',
      name: 'string',
      price: 'number',
      description: 'string',
      imageUrls: 'string[]',
      category: 'string',
      inStock: 'boolean'
    },
    sampleData: {
      id: 1,
      name: 'Premium Headphones',
      price: 199.99,
      description: 'High-quality wireless headphones with noise cancellation',
      imageUrls: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop'],
      category: 'Electronics',
      inStock: true
    }
  }
}

// Smart Product Grid Object
export const SMART_PRODUCT_GRID: SmartObjectTemplate = {
  id: 'smart-product-grid',
  name: 'Smart Product Grid',
  description: 'Responsive grid layout showing multiple products',
  category: 'ecommerce',
  difficulty: 'intermediate',
  thumbnail: '/smart-objects/product-grid-thumb.png',
  preview: '/smart-objects/product-grid-preview.png',
  
  component: {
    type: 'smart-product-grid',
    defaults: {
      tagName: 'div',
      classes: ['smart-product-grid'],
      attributes: {
        'data-smart-object': 'product-grid',
        'data-version': '1.0'
      },
      traits: [
        {
          type: 'number',
          name: 'columns',
          label: 'Columns',
          min: 1,
          max: 6,
          value: 3
        },
        {
          type: 'number',
          name: 'productsCount',
          label: 'Products to Show',
          min: 1,
          max: 20,
          value: 6
        },
        {
          type: 'select',
          name: 'colorScheme',
          label: 'Color Scheme',
          options: COLOR_SCHEMES.map(scheme => ({ value: scheme.id, name: scheme.name })),
          value: 'modern'
        },
        {
          type: 'checkbox',
          name: 'showPagination',
          label: 'Show Pagination',
          value: true
        }
      ]
    },
    model: {
      init() {
        this.on('change:attributes:data-columns', this.updateColumns)
        this.on('change:attributes:data-products-count', this.updateProductsCount)
        this.on('change:attributes:data-color-scheme', this.updateColorScheme)
      },
      
      updateColumns() {
        const columns = this.getAttributes()['data-columns']
        if (this.view?.$el) {
          this.view.$el.css('grid-template-columns', `repeat(${columns}, 1fr)`)
        }
      },
      
      updateProductsCount() {
        // This would trigger a data refetch with new count
        this.trigger('request:products-update')
      }
    },
    view: {
      init() {
        this.listenTo(this.model, 'change', this.render)
      }
    }
  },
  
  quickCustomization: {
    colorSchemes: COLOR_SCHEMES,
    layouts: [
      {
        id: 'grid-2',
        name: '2 Columns',
        direction: 'grid',
        alignment: 'center',
        spacing: 'normal'
      },
      {
        id: 'grid-3',
        name: '3 Columns',
        direction: 'grid',
        alignment: 'center',
        spacing: 'normal'
      },
      {
        id: 'grid-4',
        name: '4 Columns',
        direction: 'grid',
        alignment: 'center',
        spacing: 'normal'
      }
    ],
    sizes: SIZE_VARIANTS,
    animations: ANIMATION_OPTIONS
  },
  
  advancedCustomization: {
    spacing: {
      min: 0,
      max: 50,
      step: 5,
      unit: 'px',
      default: 20
    },
    typography: {
      fontFamily: ['Inter', 'Roboto', 'Arial', 'Georgia'],
      fontSize: { min: 12, max: 24, step: 1, unit: 'px', default: 16 },
      fontWeight: [300, 400, 500, 600, 700],
      lineHeight: { min: 1.0, max: 2.0, step: 0.1, unit: '', default: 1.5 },
      letterSpacing: { min: -2, max: 5, step: 0.5, unit: 'px', default: 0 }
    },
    borders: {
      width: { min: 0, max: 10, step: 1, unit: 'px', default: 1 },
      style: ['solid', 'dashed', 'dotted', 'none'],
      radius: { min: 0, max: 30, step: 2, unit: 'px', default: 8 },
      color: '#E5E7EB'
    },
    shadows: {
      presets: ['none', 'soft', 'medium', 'hard', 'glow'],
      custom: {
        offsetX: { min: -20, max: 20, step: 1, unit: 'px', default: 0 },
        offsetY: { min: -20, max: 20, step: 1, unit: 'px', default: 4 },
        blur: { min: 0, max: 50, step: 1, unit: 'px', default: 6 },
        spread: { min: -10, max: 10, step: 1, unit: 'px', default: 0 },
        color: '#000000',
        opacity: { min: 0, max: 1, step: 0.1, unit: '', default: 0.1 }
      }
    }
  },
  
  dataBinding: {
    source: 'api',
    schema: {
      products: {
        type: 'array',
        items: {
          id: 'number',
          name: 'string',
          price: 'number',
          imageUrls: 'string[]',
          category: 'string'
        }
      }
    },
    sampleData: {
      products: [
        { id: 1, name: 'Product 1', price: 99.99, imageUrls: ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300'], category: 'Electronics' },
        { id: 2, name: 'Product 2', price: 149.99, imageUrls: ['https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=300'], category: 'Electronics' },
        { id: 3, name: 'Product 3', price: 79.99, imageUrls: ['https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=300'], category: 'Accessories' }
      ]
    }
  }
}

// Hero Section Smart Object
export const SMART_HERO_SECTION: SmartObjectTemplate = {
  id: 'smart-hero-section',
  name: 'Smart Hero Section',
  description: 'Eye-catching hero section with title, subtitle, and call-to-action',
  category: 'content',
  difficulty: 'beginner',
  thumbnail: '/smart-objects/hero-section-thumb.png',
  preview: '/smart-objects/hero-section-preview.png',
  
  component: {
    type: 'smart-hero-section',
    defaults: {
      tagName: 'section',
      classes: ['smart-hero-section'],
      attributes: {
        'data-smart-object': 'hero-section',
        'data-version': '1.0'
      },
      traits: [
        {
          type: 'text',
          name: 'heroTitle',
          label: 'Main Title',
          value: 'Welcome to Our Amazing Platform'
        },
        {
          type: 'textarea',
          name: 'heroSubtitle',
          label: 'Subtitle',
          value: 'Discover incredible products and services that will transform your experience'
        },
        {
          type: 'text',
          name: 'ctaText',
          label: 'Button Text',
          value: 'Get Started'
        },
        {
          type: 'text',
          name: 'ctaLink',
          label: 'Button Link',
          value: '#'
        },
        {
          type: 'text',
          name: 'backgroundImage',
          label: 'Background Image URL',
          value: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=1200&h=600&fit=crop'
        },
        {
          type: 'select',
          name: 'colorScheme',
          label: 'Color Scheme',
          options: COLOR_SCHEMES.map(scheme => ({ value: scheme.id, name: scheme.name })),
          value: 'modern'
        },
        {
          type: 'select',
          name: 'textAlignment',
          label: 'Text Alignment',
          options: [
            { value: 'left', name: 'Left' },
            { value: 'center', name: 'Center' },
            { value: 'right', name: 'Right' }
          ],
          value: 'center'
        }
      ]
    },
    model: {
      init() {
        this.on('change:attributes:data-hero-title', this.updateTitle)
        this.on('change:attributes:data-hero-subtitle', this.updateSubtitle)
        this.on('change:attributes:data-cta-text', this.updateCtaText)
        this.on('change:attributes:data-background-image', this.updateBackgroundImage)
        this.on('change:attributes:data-color-scheme', this.updateColorScheme)
        this.on('change:attributes:data-text-alignment', this.updateAlignment)
      },
      
      updateTitle() {
        const title = this.getAttributes()['data-hero-title']
        const titleEl = this.view?.$el.find('.hero-title')
        if (titleEl) titleEl.text(title)
      },
      
      updateSubtitle() {
        const subtitle = this.getAttributes()['data-hero-subtitle']
        const subtitleEl = this.view?.$el.find('.hero-subtitle')
        if (subtitleEl) subtitleEl.text(subtitle)
      },
      
      updateCtaText() {
        const ctaText = this.getAttributes()['data-cta-text']
        const ctaEl = this.view?.$el.find('.hero-cta')
        if (ctaEl) ctaEl.text(ctaText)
      },
      
      updateBackgroundImage() {
        const imageUrl = this.getAttributes()['data-background-image']
        if (this.view?.$el) {
          this.view.$el.css('background-image', `url(${imageUrl})`)
        }
      },
      
      updateColorScheme() {
        const schemeId = this.getAttributes()['data-color-scheme']
        const scheme = COLOR_SCHEMES.find(s => s.id === schemeId)
        if (scheme && this.view?.$el) {
          this.view.$el.get(0).style.setProperty('--primary-color', scheme.primary)
          this.view.$el.get(0).style.setProperty('--secondary-color', scheme.secondary)
          this.view.$el.get(0).style.setProperty('--accent-color', scheme.accent)
          this.view.$el.get(0).style.setProperty('--background-color', scheme.background)
          this.view.$el.get(0).style.setProperty('--text-color', scheme.text)
        }
      },
      
      updateAlignment() {
        const alignment = this.getAttributes()['data-text-alignment']
        if (this.view?.$el) {
          this.view.$el.removeClass('text-left text-center text-right')
          this.view.$el.addClass(`text-${alignment}`)
        }
      }
    },
    view: {
      init() {
        this.listenTo(this.model, 'change', this.render)
      }
    }
  },
  
  quickCustomization: {
    colorSchemes: COLOR_SCHEMES,
    layouts: [
      {
        id: 'center-overlay',
        name: 'Center Overlay',
        direction: 'vertical',
        alignment: 'center',
        spacing: 'normal'
      },
      {
        id: 'left-overlay',
        name: 'Left Overlay',
        direction: 'vertical',
        alignment: 'left',
        spacing: 'normal'
      },
      {
        id: 'split-content',
        name: 'Split Content',
        direction: 'horizontal',
        alignment: 'center',
        spacing: 'spacious'
      }
    ],
    sizes: [
      {
        id: 'compact',
        name: 'Compact',
        width: '100%',
        height: '400px',
        scale: 0.8
      },
      {
        id: 'standard',
        name: 'Standard',
        width: '100%',
        height: '600px',
        scale: 1.0
      },
      {
        id: 'full-screen',
        name: 'Full Screen',
        width: '100%',
        height: '100vh',
        scale: 1.2
      }
    ],
    animations: ANIMATION_OPTIONS
  },
  
  advancedCustomization: {
    spacing: {
      min: 0,
      max: 100,
      step: 10,
      unit: 'px',
      default: 40
    },
    typography: {
      fontFamily: ['Inter', 'Roboto', 'Arial', 'Georgia', 'Playfair Display'],
      fontSize: { min: 24, max: 72, step: 4, unit: 'px', default: 48 },
      fontWeight: [300, 400, 500, 600, 700, 800, 900],
      lineHeight: { min: 1.0, max: 2.0, step: 0.1, unit: '', default: 1.2 },
      letterSpacing: { min: -2, max: 5, step: 0.5, unit: 'px', default: 0 }
    },
    borders: {
      width: { min: 0, max: 10, step: 1, unit: 'px', default: 0 },
      style: ['solid', 'dashed', 'dotted', 'none'],
      radius: { min: 0, max: 50, step: 5, unit: 'px', default: 0 },
      color: '#E5E7EB'
    },
    shadows: {
      presets: ['none', 'text-shadow', 'box-shadow', 'glow'],
      custom: {
        offsetX: { min: -20, max: 20, step: 1, unit: 'px', default: 0 },
        offsetY: { min: -20, max: 20, step: 1, unit: 'px', default: 2 },
        blur: { min: 0, max: 50, step: 1, unit: 'px', default: 4 },
        spread: { min: -10, max: 10, step: 1, unit: 'px', default: 0 },
        color: '#000000',
        opacity: { min: 0, max: 1, step: 0.1, unit: '', default: 0.5 }
      }
    }
  }
}

// Smart CTA Banner
export const SMART_CTA_BANNER: SmartObjectTemplate = {
  id: 'smart-cta-banner',
  name: 'Smart CTA Banner',
  description: 'Full-width banner with text and call-to-action',
  category: 'content',
  difficulty: 'beginner',
  thumbnail: '/smart-objects/cta-banner-thumb.png',
  preview: '/smart-objects/cta-banner-preview.png',
  component: {
    type: 'smart-cta-banner',
    defaults: {
      tagName: 'section',
      classes: ['smart-cta-banner', 'layout-horizontal', 'align-center', 'spacing-normal'],
      attributes: {
        'data-smart-object': 'cta-banner',
        'data-version': '1.0',
        'data-color-scheme': 'modern'
      },
      traits: [
        { type: 'text', name: 'title', label: 'Title', value: 'Level-up your storefront' },
        { type: 'textarea', name: 'subtitle', label: 'Subtitle', value: 'Launch fast with beautiful, smart components' },
        { type: 'text', name: 'ctaText', label: 'CTA Text', value: 'Get Started' },
        { type: 'text', name: 'ctaLink', label: 'CTA Link', value: '#' },
        { type: 'select', name: 'colorScheme', label: 'Color Scheme', options: COLOR_SCHEMES.map(s => ({ value: s.id, name: s.name })), value: 'modern' }
      ]
    },
    model: {
      init() {
        this.on('change:attributes:data-color-scheme', this.updateScheme)
        // trait mapping
        const traitMap: Record<string, string> = {
          colorScheme: 'data-color-scheme',
          title: 'data-title',
          subtitle: 'data-subtitle',
          ctaText: 'data-cta-text',
          ctaLink: 'data-cta-link'
        }
        this.on('change:traits', () => {
          const traits = this.get('traits') || []
          traits.forEach((t: any) => {
            const traitName = t.get && t.get('name')
            const dataAttr = traitMap[traitName]
            if (dataAttr) {
              const val = t.get('value')
              const attrs = this.getAttributes() || {}
              this.set({ attributes: { ...attrs, [dataAttr]: val } })
              
              // Update content immediately
              if (traitName === 'title') this.updateTitle()
              if (traitName === 'subtitle') this.updateSubtitle()
              if (traitName === 'ctaText') this.updateCtaText()
              if (traitName === 'ctaLink') this.updateCtaLink()
            }
          })
        })
      },
      
      updateTitle() {
        const title = this.getAttributes()['data-title']
        if (title) {
          const titleEl = this.view?.$el?.find('.cta-title')
          if (titleEl && titleEl.length) titleEl.text(title)
        }
      },
      
      updateSubtitle() {
        const subtitle = this.getAttributes()['data-subtitle']
        if (subtitle) {
          const subtitleEl = this.view?.$el?.find('.cta-subtitle')
          if (subtitleEl && subtitleEl.length) subtitleEl.text(subtitle)
        }
      },
      
      updateCtaText() {
        const ctaText = this.getAttributes()['data-cta-text']
        if (ctaText) {
          const ctaEl = this.view?.$el?.find('.cta-button')
          if (ctaEl && ctaEl.length) ctaEl.text(ctaText)
        }
      },
      
      updateCtaLink() {
        const ctaLink = this.getAttributes()['data-cta-link']
        if (ctaLink) {
          const ctaEl = this.view?.$el?.find('.cta-button')
          if (ctaEl && ctaEl.length) ctaEl.attr('href', ctaLink)
        }
      },
      updateScheme() {
        const schemeId = this.getAttributes()['data-color-scheme']
        const scheme = COLOR_SCHEMES.find(s => s.id === schemeId)
        const el = this.view?.$el && this.view.$el.get(0)
        if (scheme && el) {
          el.style.setProperty('--primary-color', scheme.primary)
          el.style.setProperty('--secondary-color', scheme.secondary)
          el.style.setProperty('--accent-color', scheme.accent)
          el.style.setProperty('--background-color', scheme.background)
          el.style.setProperty('--text-color', scheme.text)
        }
      }
    },
    view: {
      init() {
        this.listenTo(this.model, 'change', this.render)
      }
    }
  },
  quickCustomization: {
    colorSchemes: COLOR_SCHEMES,
    layouts: [
      { id: 'horizontal-center', name: 'Centered', direction: 'horizontal', alignment: 'center', spacing: 'normal' },
      { id: 'horizontal-left', name: 'Left Align', direction: 'horizontal', alignment: 'left', spacing: 'normal' }
    ],
    sizes: [
      { id: 'compact', name: 'Compact', width: '100%', height: 'auto', scale: 0.9 },
      { id: 'standard', name: 'Standard', width: '100%', height: 'auto', scale: 1.0 },
    ],
    animations: [
      { id: 'fade-in', name: 'Fade In', type: 'entrance', duration: 500, easing: 'ease', cssClass: 'animate-fade' },
    ],
  },
  advancedCustomization: {
    spacing: { min: 0, max: 60, step: 4, unit: 'px', default: 24 },
    typography: {
      fontFamily: ['Inter', 'Roboto', 'Arial', 'Georgia'],
      fontSize: { min: 12, max: 28, step: 1, unit: 'px', default: 16 },
      fontWeight: [400, 500, 600, 700],
      lineHeight: { min: 1, max: 2, step: 0.1, unit: '', default: 1.5 },
      letterSpacing: { min: -1, max: 2, step: 0.25, unit: 'px', default: 0 }
    },
    borders: {
      width: { min: 0, max: 8, step: 1, unit: 'px', default: 0 },
      style: ['solid', 'dashed', 'dotted', 'none'],
      radius: { min: 0, max: 24, step: 2, unit: 'px', default: 12 },
      color: '#E5E7EB'
    },
    shadows: {
      presets: ['none', 'soft', 'hard'],
      custom: {
        offsetX: { min: -10, max: 10, step: 1, unit: 'px', default: 0 },
        offsetY: { min: -10, max: 10, step: 1, unit: 'px', default: 4 },
        blur: { min: 0, max: 30, step: 1, unit: 'px', default: 8 },
        spread: { min: -5, max: 10, step: 1, unit: 'px', default: 0 },
        color: '#000000',
        opacity: { min: 0, max: 1, step: 0.1, unit: '', default: 0.15 }
      }
    }
  }
}

// Export all smart objects
export const SMART_OBJECTS: SmartObjectTemplate[] = [
  SMART_PRODUCT_CARD,
  SMART_PRODUCT_GRID,
  SMART_HERO_SECTION,
  SMART_CTA_BANNER
]

export const SMART_OBJECTS_BY_CATEGORY = {
  ecommerce: [SMART_PRODUCT_CARD, SMART_PRODUCT_GRID],
  content: [SMART_HERO_SECTION, SMART_CTA_BANNER],
  layout: [],
  interactive: []
}