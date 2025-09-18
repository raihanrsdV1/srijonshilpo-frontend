import { SmartObjectTemplate, COLOR_SCHEMES, LAYOUT_VARIANTS, SIZE_VARIANTS, ANIMATION_OPTIONS } from '../types/smartObjects'
import { ICON_CATEGORIES, renderIcon } from '../components/IconSystem'

// Smart Product Showcase Object (Enhanced)
export const SMART_PRODUCT_SHOWCASE: SmartObjectTemplate = {
  id: 'smart-product-showcase',
  name: 'Product Showcase',
  description: 'Enhanced product display with gallery, zoom, and 360° view capabilities',
  category: 'ecommerce',
  difficulty: 'intermediate',
  thumbnail: renderIcon(ICON_CATEGORIES.SMART_OBJECTS.productShowcase, { size: 40, color: '#8b5cf6' }),
  preview: renderIcon(ICON_CATEGORIES.SMART_OBJECTS.productShowcase, { size: 60, color: '#8b5cf6' }),
  
  component: {
    type: 'smart-product-showcase',
    defaults: {
      tagName: 'div',
      classes: ['smart-product-showcase', 'layout-horizontal', 'align-center', 'spacing-normal'],
      style: {
        width: '400px',
        height: 'auto',
        minHeight: '300px',
        position: 'relative',
        display: 'inline-block',
        margin: '10px'
      },
      attributes: {
        'data-smart-object': 'product-showcase',
        'data-version': '1.0',
        'data-product-title': 'Premium Wireless Headphones',
        'data-product-price': '299.99',
        'data-product-description': 'Professional-grade wireless headphones with active noise cancellation',
        'data-product-images': JSON.stringify([
          'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop',
          'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&h=600&fit=crop',
          'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600&h=600&fit=crop'
        ]),
        'data-color-scheme': 'modern',
        'data-layout': 'horizontal',
        'data-enable-zoom': 'true',
        'data-enable-gallery': 'true'
      },
      traits: [
        { type: 'text', name: 'productTitle', label: 'Product Title', value: 'Premium Wireless Headphones' },
        { type: 'number', name: 'productPrice', label: 'Price ($)', value: 299.99, min: 0, step: 0.01 },
        { type: 'textarea', name: 'productDescription', label: 'Description', value: 'Professional-grade wireless headphones with active noise cancellation' },
        { type: 'image-asset', name: 'mainImage', label: 'Main Product Image', value: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop' },
        { 
          type: 'select', 
          name: 'layout', 
          label: 'Layout', 
          options: [
            { value: 'horizontal', name: 'Horizontal (Image + Content)' },
            { value: 'vertical', name: 'Vertical (Image Top)' },
            { value: 'centered', name: 'Centered Layout' }
          ],
          value: 'horizontal' 
        },
        { type: 'checkbox', name: 'enableZoom', label: 'Enable Image Zoom', value: true },
        { type: 'checkbox', name: 'enableGallery', label: 'Enable Image Gallery', value: true },
        { type: 'checkbox', name: 'showBadges', label: 'Show Product Badges', value: true },
        { type: 'select', name: 'colorScheme', label: 'Color Scheme', options: COLOR_SCHEMES.map(s => ({ value: s.id, name: s.name })), value: 'modern' }
      ]
    },
    model: {
      init() {
        // Enhanced trait mapping for product showcase
        const traitMap: Record<string, string> = {
          productTitle: 'data-product-title',
          productPrice: 'data-product-price',
          productDescription: 'data-product-description',
          mainImage: 'data-main-image',
          layout: 'data-layout',
          enableZoom: 'data-enable-zoom',
          enableGallery: 'data-enable-gallery',
          showBadges: 'data-show-badges',
          colorScheme: 'data-color-scheme'
        }
        
        this.on('change:traits', () => {
          const traits = this.get('traits') || []
          traits.forEach((trait: any) => {
            const traitName = trait.get && trait.get('name')
            const dataAttr = traitMap[traitName]
            if (dataAttr) {
              const val = trait.get('value')
              const attrs = this.getAttributes() || {}
              this.set({ attributes: { ...attrs, [dataAttr]: val } })
              
              // Trigger specific update methods
              if (traitName === 'productTitle') this.updateTitle()
              if (traitName === 'productPrice') this.updatePrice()
              if (traitName === 'productDescription') this.updateDescription()
              if (traitName === 'mainImage') this.updateMainImage()
              if (traitName === 'layout') this.updateLayout()
              if (traitName === 'colorScheme') this.updateColorScheme()
            }
          })
        })
      },
      
      updateTitle() {
        const title = this.getAttributes()['data-product-title']
        if (title) {
          const titleEl = this.view?.$el?.find('.product-showcase-title')
          if (titleEl && titleEl.length) titleEl.text(title)
        }
      },
      
      updatePrice() {
        const price = this.getAttributes()['data-product-price']
        if (price) {
          const priceEl = this.view?.$el?.find('.product-showcase-price')
          if (priceEl && priceEl.length) priceEl.text(`$${parseFloat(price).toFixed(2)}`)
        }
      },
      
      updateDescription() {
        const description = this.getAttributes()['data-product-description']
        if (description) {
          const descEl = this.view?.$el?.find('.product-showcase-description')
          if (descEl && descEl.length) descEl.text(description)
        }
      },
      
      updateMainImage() {
        const imageUrl = this.getAttributes()['data-main-image']
        if (imageUrl) {
          const imgEl = this.view?.$el?.find('.product-showcase-main-image')
          if (imgEl && imgEl.length) imgEl.attr('src', imageUrl)
        }
      },
      
      updateLayout() {
        const layout = this.getAttributes()['data-layout']
        if (this.view?.$el) {
          this.view.$el.removeClass('layout-horizontal layout-vertical layout-centered')
          this.view.$el.addClass(`layout-${layout}`)
        }
      },
      
      updateColorScheme() {
        const schemeId = this.getAttributes()['data-color-scheme']
        const scheme = COLOR_SCHEMES.find(s => s.id === schemeId)
        if (scheme && this.view?.$el) {
          const el = this.view.$el.get(0)
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
      { id: 'horizontal', name: 'Horizontal Split', direction: 'horizontal', alignment: 'center', spacing: 'normal' },
      { id: 'vertical', name: 'Vertical Stack', direction: 'vertical', alignment: 'center', spacing: 'normal' },
      { id: 'centered', name: 'Centered Layout', direction: 'vertical', alignment: 'center', spacing: 'compact' }
    ],
    sizes: SIZE_VARIANTS,
    animations: ANIMATION_OPTIONS
  },
  
  advancedCustomization: {
    spacing: { min: 0, max: 60, step: 4, unit: 'px', default: 24 },
    typography: {
      fontFamily: ['Inter', 'Roboto', 'Arial', 'Georgia'],
      fontSize: { min: 14, max: 32, step: 1, unit: 'px', default: 18 },
      fontWeight: [300, 400, 500, 600, 700],
      lineHeight: { min: 1.2, max: 2.0, step: 0.1, unit: '', default: 1.5 },
      letterSpacing: { min: -1, max: 2, step: 0.25, unit: 'px', default: 0 }
    },
    borders: {
      width: { min: 0, max: 8, step: 1, unit: 'px', default: 1 },
      style: ['solid', 'dashed', 'dotted', 'none'],
      radius: { min: 0, max: 24, step: 2, unit: 'px', default: 12 },
      color: '#E5E7EB'
    },
    shadows: {
      presets: ['none', 'soft', 'medium', 'hard', 'glow'],
      custom: {
        offsetX: { min: -10, max: 10, step: 1, unit: 'px', default: 0 },
        offsetY: { min: -10, max: 10, step: 1, unit: 'px', default: 4 },
        blur: { min: 0, max: 30, step: 1, unit: 'px', default: 8 },
        spread: { min: -5, max: 10, step: 1, unit: 'px', default: 0 },
        color: '#000000',
        opacity: { min: 0, max: 1, step: 0.1, unit: '', default: 0.15 }
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
      images: 'string[]',
      badges: 'string[]',
      inStock: 'boolean',
      rating: 'number'
    },
    sampleData: {
      id: 1,
      name: 'Premium Wireless Headphones',
      price: 299.99,
      description: 'Professional-grade wireless headphones with active noise cancellation',
      images: [
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=600&fit=crop',
        'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&h=600&fit=crop'
      ],
      badges: ['Best Seller', 'Free Shipping'],
      inStock: true,
      rating: 4.8
    }
  }
}

// Original Smart Product Card Object
export const SMART_PRODUCT_CARD: SmartObjectTemplate = {
  id: 'smart-product-card',
  name: 'Product Card',
  description: 'Professional product card with image, title, price, and buy button',
  category: 'ecommerce',
  difficulty: 'beginner',
  thumbnail: renderIcon(ICON_CATEGORIES.SMART_OBJECTS.productCard, { size: 40, color: '#8b5cf6' }),
  preview: renderIcon(ICON_CATEGORIES.SMART_OBJECTS.productCard, { size: 60, color: '#8b5cf6' }),
  
  component: {
    type: 'smart-product-card',
    defaults: {
      tagName: 'div',
      classes: ['smart-product-card'],
      style: {
        width: '300px',
        height: 'auto',
        minHeight: '400px',
        position: 'relative',
        display: 'inline-block',
        margin: '10px'
      },
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
  name: 'Product Grid',
  description: 'Responsive grid layout showing multiple products',
  category: 'ecommerce',
  difficulty: 'intermediate',
  thumbnail: renderIcon(ICON_CATEGORIES.SMART_OBJECTS.productGrid, { size: 40, color: '#8b5cf6' }),
  preview: renderIcon(ICON_CATEGORIES.SMART_OBJECTS.productGrid, { size: 60, color: '#8b5cf6' }),
  
  component: {
    type: 'smart-product-grid',
    defaults: {
      tagName: 'div',
      classes: ['smart-product-grid'],
      attributes: {
        'data-smart-object': 'product-grid',
        'data-version': '1.0'
      },
      style: {
        width: '100%',
        height: 'auto',
        minHeight: '400px',
        position: 'relative',
        display: 'block',
        margin: '10px auto'
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
  name: 'Hero Section',
  description: 'Eye-catching hero section with title, subtitle, and call-to-action',
  category: 'content',
  difficulty: 'beginner',
  thumbnail: renderIcon(ICON_CATEGORIES.SMART_OBJECTS.heroSection, { size: 40, color: '#ec4899' }),
  preview: renderIcon(ICON_CATEGORIES.SMART_OBJECTS.heroSection, { size: 60, color: '#ec4899' }),
  
  component: {
    type: 'smart-hero-section',
    defaults: {
      tagName: 'section',
      classes: ['smart-hero-section'],
      attributes: {
        'data-smart-object': 'hero-section',
        'data-version': '1.0'
      },
      style: {
        width: '100%',
        height: '500px',
        position: 'relative',
        display: 'block',
        margin: '10px auto'
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
  name: 'CTA Banner',
  description: 'Full-width banner with text and call-to-action',
  category: 'content',
  difficulty: 'beginner',
  thumbnail: renderIcon(ICON_CATEGORIES.SMART_OBJECTS.ctaBanner, { size: 40, color: '#ec4899' }),
  preview: renderIcon(ICON_CATEGORIES.SMART_OBJECTS.ctaBanner, { size: 60, color: '#ec4899' }),
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
      style: {
        width: '100%',
        height: '200px',
        position: 'relative',
        display: 'block',
        margin: '10px auto'
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

// Smart Testimonial Carousel
export const SMART_TESTIMONIAL_CAROUSEL: SmartObjectTemplate = {
  id: 'smart-testimonial-carousel',
  name: 'Testimonials',
  description: 'Customer testimonials carousel with photos, ratings, and smooth transitions',
  category: 'content',
  difficulty: 'intermediate',
  thumbnail: renderIcon(ICON_CATEGORIES.SMART_OBJECTS.testimonialCarousel, { size: 40, color: '#ec4899' }),
  preview: renderIcon(ICON_CATEGORIES.SMART_OBJECTS.testimonialCarousel, { size: 60, color: '#ec4899' }),
  
  component: {
    type: 'smart-testimonial-carousel',
    defaults: {
      tagName: 'section',
      classes: ['smart-testimonial-carousel'],
      attributes: {
        'data-smart-object': 'testimonial-carousel',
        'data-version': '1.0',
        'data-color-scheme': 'modern',
        'data-auto-play': 'true',
        'data-show-dots': 'true',
        'data-show-arrows': 'true'
      },
      style: {
        width: '100%',
        height: '350px',
        position: 'relative',
        display: 'block',
        margin: '10px auto'
      },
      traits: [
        { type: 'text', name: 'sectionTitle', label: 'Section Title', value: 'What Our Customers Say' },
        { type: 'number', name: 'autoPlaySpeed', label: 'Auto-play Speed (ms)', value: 5000, min: 2000, max: 10000, step: 500 },
        { type: 'checkbox', name: 'autoPlay', label: 'Enable Auto-play', value: true },
        { type: 'checkbox', name: 'showDots', label: 'Show Navigation Dots', value: true },
        { type: 'checkbox', name: 'showArrows', label: 'Show Navigation Arrows', value: true },
        { type: 'checkbox', name: 'showRatings', label: 'Show Star Ratings', value: true },
        { type: 'select', name: 'colorScheme', label: 'Color Scheme', options: COLOR_SCHEMES.map(s => ({ value: s.id, name: s.name })), value: 'modern' }
      ]
    },
    model: {
      init() {
        const traitMap: Record<string, string> = {
          sectionTitle: 'data-section-title',
          autoPlaySpeed: 'data-auto-play-speed',
          autoPlay: 'data-auto-play',
          showDots: 'data-show-dots',
          showArrows: 'data-show-arrows',
          showRatings: 'data-show-ratings',
          colorScheme: 'data-color-scheme'
        }
        
        this.on('change:traits', () => {
          const traits = this.get('traits') || []
          traits.forEach((trait: any) => {
            const traitName = trait.get && trait.get('name')
            const dataAttr = traitMap[traitName]
            if (dataAttr) {
              const val = trait.get('value')
              const attrs = this.getAttributes() || {}
              this.set({ attributes: { ...attrs, [dataAttr]: val } })
              
              if (traitName === 'sectionTitle') this.updateSectionTitle()
              if (traitName === 'colorScheme') this.updateColorScheme()
            }
          })
        })
      },
      
      updateSectionTitle() {
        const title = this.getAttributes()['data-section-title']
        if (title) {
          const titleEl = this.view?.$el?.find('.testimonial-section-title')
          if (titleEl && titleEl.length) titleEl.text(title)
        }
      },
      
      updateColorScheme() {
        const schemeId = this.getAttributes()['data-color-scheme']
        const scheme = COLOR_SCHEMES.find(s => s.id === schemeId)
        if (scheme && this.view?.$el) {
          const el = this.view.$el.get(0)
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
      { id: 'cards', name: 'Card Layout', direction: 'horizontal', alignment: 'center', spacing: 'normal' },
      { id: 'minimal', name: 'Minimal Layout', direction: 'vertical', alignment: 'center', spacing: 'compact' },
      { id: 'detailed', name: 'Detailed Layout', direction: 'horizontal', alignment: 'left', spacing: 'spacious' }
    ],
    sizes: SIZE_VARIANTS,
    animations: ANIMATION_OPTIONS
  },
  
  advancedCustomization: {
    spacing: { min: 0, max: 60, step: 4, unit: 'px', default: 32 },
    typography: {
      fontFamily: ['Inter', 'Roboto', 'Georgia', 'Playfair Display'],
      fontSize: { min: 14, max: 24, step: 1, unit: 'px', default: 16 },
      fontWeight: [300, 400, 500, 600, 700],
      lineHeight: { min: 1.3, max: 2.0, step: 0.1, unit: '', default: 1.6 },
      letterSpacing: { min: -0.05, max: 0.1, step: 0.01, unit: 'em', default: 0 }
    },
    borders: {
      width: { min: 0, max: 10, step: 1, unit: 'px', default: 1 },
      style: ['solid', 'dashed', 'dotted', 'double'],
      radius: { min: 0, max: 50, step: 1, unit: 'px', default: 8 },
      color: '#e2e8f0'
    },
    shadows: {
      presets: ['none', 'sm', 'md', 'lg', 'xl'],
      custom: {
        offsetX: { min: -50, max: 50, step: 1, unit: 'px', default: 0 },
        offsetY: { min: -50, max: 50, step: 1, unit: 'px', default: 4 },
        blur: { min: 0, max: 100, step: 1, unit: 'px', default: 6 },
        spread: { min: -50, max: 50, step: 1, unit: 'px', default: 0 },
        color: '#000000',
        opacity: { min: 0, max: 1, step: 0.1, unit: '', default: 0.1 }
      }
    }
  },
  
  dataBinding: {
    source: 'api',
    schema: {
      testimonials: {
        type: 'array',
        items: {
          id: 'number',
          name: 'string',
          role: 'string',
          company: 'string',
          content: 'string',
          rating: 'number',
          avatar: 'string'
        }
      }
    },
    sampleData: {
      testimonials: [
        {
          id: 1,
          name: 'Sarah Johnson',
          role: 'Marketing Director',
          company: 'TechCorp',
          content: 'This platform has revolutionized how we build and manage our online presence. Absolutely fantastic!',
          rating: 5,
          avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
        },
        {
          id: 2,
          name: 'Michael Chen',
          role: 'CEO',
          company: 'InnovateLab',
          content: 'The ease of use combined with powerful features makes this our go-to solution for all web projects.',
          rating: 5,
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
        }
      ]
    }
  }
}

// Smart FAQ Accordion
export const SMART_FAQ_ACCORDION: SmartObjectTemplate = {
  id: 'smart-faq-accordion',
  name: 'FAQ Accordion',
  description: 'Expandable FAQ section with search functionality and smooth animations',
  category: 'content',
  difficulty: 'beginner',
  thumbnail: renderIcon(ICON_CATEGORIES.SMART_OBJECTS.faqAccordion, { size: 40, color: '#ec4899' }),
  preview: renderIcon(ICON_CATEGORIES.SMART_OBJECTS.faqAccordion, { size: 60, color: '#ec4899' }),
  
  component: {
    type: 'smart-faq-accordion',
    defaults: {
      tagName: 'section',
      classes: ['smart-faq-accordion'],
      attributes: {
        'data-smart-object': 'faq-accordion',
        'data-version': '1.0',
        'data-color-scheme': 'modern',
        'data-allow-multiple': 'false',
        'data-show-search': 'true'
      },
      style: {
        width: '600px',
        height: 'auto',
        minHeight: '400px',
        position: 'relative',
        display: 'block',
        margin: '10px auto'
      },
      traits: [
        { type: 'text', name: 'sectionTitle', label: 'Section Title', value: 'Frequently Asked Questions' },
        { type: 'checkbox', name: 'allowMultiple', label: 'Allow Multiple Open', value: false },
        { type: 'checkbox', name: 'showSearch', label: 'Show Search Bar', value: true },
        { type: 'checkbox', name: 'showNumbers', label: 'Show Question Numbers', value: false },
        { type: 'select', name: 'colorScheme', label: 'Color Scheme', options: COLOR_SCHEMES.map(s => ({ value: s.id, name: s.name })), value: 'modern' }
      ]
    },
    model: {
      init() {
        const traitMap: Record<string, string> = {
          sectionTitle: 'data-section-title',
          allowMultiple: 'data-allow-multiple',
          showSearch: 'data-show-search',
          showNumbers: 'data-show-numbers',
          colorScheme: 'data-color-scheme'
        }
        
        this.on('change:traits', () => {
          const traits = this.get('traits') || []
          traits.forEach((trait: any) => {
            const traitName = trait.get && trait.get('name')
            const dataAttr = traitMap[traitName]
            if (dataAttr) {
              const val = trait.get('value')
              const attrs = this.getAttributes() || {}
              this.set({ attributes: { ...attrs, [dataAttr]: val } })
              
              if (traitName === 'sectionTitle') this.updateSectionTitle()
              if (traitName === 'colorScheme') this.updateColorScheme()
            }
          })
        })
      },
      
      updateSectionTitle() {
        const title = this.getAttributes()['data-section-title']
        if (title) {
          const titleEl = this.view?.$el?.find('.faq-section-title')
          if (titleEl && titleEl.length) titleEl.text(title)
        }
      },
      
      updateColorScheme() {
        const schemeId = this.getAttributes()['data-color-scheme']
        const scheme = COLOR_SCHEMES.find(s => s.id === schemeId)
        if (scheme && this.view?.$el) {
          const el = this.view.$el.get(0)
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
      { id: 'standard', name: 'Standard Layout', direction: 'vertical', alignment: 'left', spacing: 'normal' },
      { id: 'centered', name: 'Centered Layout', direction: 'vertical', alignment: 'center', spacing: 'normal' },
      { id: 'compact', name: 'Compact Layout', direction: 'vertical', alignment: 'left', spacing: 'compact' }
    ],
    sizes: SIZE_VARIANTS,
    animations: ANIMATION_OPTIONS
  },
  
  advancedCustomization: {
    spacing: { min: 0, max: 40, step: 4, unit: 'px', default: 16 },
    typography: {
      fontFamily: ['Inter', 'Roboto', 'Arial', 'Georgia'],
      fontSize: { min: 14, max: 20, step: 1, unit: 'px', default: 16 },
      fontWeight: [400, 500, 600, 700],
      lineHeight: { min: 1.4, max: 2.0, step: 0.1, unit: '', default: 1.6 },
      letterSpacing: { min: -0.02, max: 0.05, step: 0.01, unit: 'em', default: 0 }
    },
    borders: {
      width: { min: 0, max: 5, step: 1, unit: 'px', default: 1 },
      style: ['solid', 'dashed', 'dotted'],
      radius: { min: 0, max: 20, step: 1, unit: 'px', default: 4 },
      color: '#e2e8f0'
    },
    shadows: {
      presets: ['none', 'sm', 'md'],
      custom: {
        offsetX: { min: -20, max: 20, step: 1, unit: 'px', default: 0 },
        offsetY: { min: -20, max: 20, step: 1, unit: 'px', default: 2 },
        blur: { min: 0, max: 20, step: 1, unit: 'px', default: 4 },
        spread: { min: -10, max: 10, step: 1, unit: 'px', default: 0 },
        color: '#000000',
        opacity: { min: 0, max: 0.3, step: 0.05, unit: '', default: 0.1 }
      }
    }
  },
  
  dataBinding: {
    source: 'static',
    schema: {
      faqs: {
        type: 'array',
        items: {
          id: 'number',
          question: 'string',
          answer: 'string',
          category: 'string'
        }
      }
    },
    sampleData: {
      faqs: [
        {
          id: 1,
          question: 'How do I get started?',
          answer: 'Getting started is easy! Simply sign up for an account and choose from our pre-designed templates or start from scratch.',
          category: 'general'
        },
        {
          id: 2,
          question: 'What payment methods do you accept?',
          answer: 'We accept all major credit cards, PayPal, and bank transfers for annual subscriptions.',
          category: 'billing'
        },
        {
          id: 3,
          question: 'Can I cancel my subscription anytime?',
          answer: 'Yes, you can cancel your subscription at any time from your account settings. No questions asked.',
          category: 'billing'
        }
      ]
    }
  }
}

// Smart Shopping Cart
export const SMART_SHOPPING_CART: SmartObjectTemplate = {
  id: 'smart-shopping-cart',
  name: 'Shopping Cart',
  description: 'Advanced shopping cart with slide-out drawer, quantity controls, and discounts',
  category: 'ecommerce',
  difficulty: 'advanced',
  thumbnail: renderIcon(ICON_CATEGORIES.SMART_OBJECTS.shoppingCart, { size: 40, color: '#8b5cf6' }),
  preview: renderIcon(ICON_CATEGORIES.SMART_OBJECTS.shoppingCart, { size: 60, color: '#8b5cf6' }),
  
  component: {
    type: 'smart-shopping-cart',
    defaults: {
      tagName: 'div',
      classes: ['smart-shopping-cart'],
      attributes: {
        'data-smart-object': 'shopping-cart',
        'data-version': '1.0',
        'data-color-scheme': 'modern',
        'data-show-drawer': 'true',
        'data-show-thumbnails': 'true',
        'data-auto-save': 'true'
      },
      style: {
        width: '400px',
        height: 'auto',
        minHeight: '300px',
        position: 'relative',
        display: 'block',
        margin: '10px auto'
      },
      traits: [
        { type: 'checkbox', name: 'showDrawer', label: 'Enable Slide-out Drawer', value: true },
        { type: 'checkbox', name: 'showThumbnails', label: 'Show Product Thumbnails', value: true },
        { type: 'checkbox', name: 'autoSave', label: 'Auto-save Cart State', value: true },
        { type: 'checkbox', name: 'showCoupons', label: 'Enable Coupon Codes', value: true },
        { type: 'checkbox', name: 'showShipping', label: 'Show Shipping Calculator', value: true },
        { type: 'text', name: 'checkoutUrl', label: 'Checkout Page URL', value: '/checkout' },
        { type: 'select', name: 'colorScheme', label: 'Color Scheme', options: COLOR_SCHEMES.map(s => ({ value: s.id, name: s.name })), value: 'modern' }
      ]
    },
    model: {
      init() {
        const traitMap: Record<string, string> = {
          showDrawer: 'data-show-drawer',
          showThumbnails: 'data-show-thumbnails',
          autoSave: 'data-auto-save',
          showCoupons: 'data-show-coupons',
          showShipping: 'data-show-shipping',
          checkoutUrl: 'data-checkout-url',
          colorScheme: 'data-color-scheme'
        }
        
        this.on('change:traits', () => {
          const traits = this.get('traits') || []
          traits.forEach((trait: any) => {
            const traitName = trait.get && trait.get('name')
            const dataAttr = traitMap[traitName]
            if (dataAttr) {
              const val = trait.get('value')
              const attrs = this.getAttributes() || {}
              this.set({ attributes: { ...attrs, [dataAttr]: val } })
              
              if (traitName === 'colorScheme') this.updateColorScheme()
            }
          })
        })
      },
      
      updateColorScheme() {
        const schemeId = this.getAttributes()['data-color-scheme']
        const scheme = COLOR_SCHEMES.find(s => s.id === schemeId)
        if (scheme && this.view?.$el) {
          const el = this.view.$el.get(0)
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
      { id: 'drawer', name: 'Slide-out Drawer', direction: 'vertical', alignment: 'right', spacing: 'normal' },
      { id: 'page', name: 'Full Page Cart', direction: 'vertical', alignment: 'center', spacing: 'spacious' },
      { id: 'mini', name: 'Mini Cart', direction: 'vertical', alignment: 'right', spacing: 'compact' }
    ],
    sizes: SIZE_VARIANTS,
    animations: ANIMATION_OPTIONS
  },
  
  advancedCustomization: {
    spacing: { min: 0, max: 40, step: 4, unit: 'px', default: 16 },
    typography: {
      fontFamily: ['Inter', 'Roboto', 'Arial'],
      fontSize: { min: 12, max: 18, step: 1, unit: 'px', default: 14 },
      fontWeight: [400, 500, 600, 700],
      lineHeight: { min: 1.3, max: 1.8, step: 0.1, unit: '', default: 1.5 },
      letterSpacing: { min: -0.01, max: 0.02, step: 0.005, unit: 'em', default: 0 }
    },
    borders: {
      width: { min: 0, max: 3, step: 1, unit: 'px', default: 1 },
      style: ['solid', 'dashed'],
      radius: { min: 0, max: 15, step: 1, unit: 'px', default: 6 },
      color: '#e2e8f0'
    },
    shadows: {
      presets: ['none', 'sm', 'md', 'lg'],
      custom: {
        offsetX: { min: -10, max: 10, step: 1, unit: 'px', default: 0 },
        offsetY: { min: -10, max: 10, step: 1, unit: 'px', default: 4 },
        blur: { min: 0, max: 30, step: 1, unit: 'px', default: 8 },
        spread: { min: -5, max: 5, step: 1, unit: 'px', default: 0 },
        color: '#000000',
        opacity: { min: 0, max: 0.4, step: 0.05, unit: '', default: 0.15 }
      }
    }
  },
  
  dataBinding: {
    source: 'ecommerce',
    schema: {
      items: {
        type: 'array',
        items: {
          id: 'number',
          name: 'string',
          price: 'number',
          quantity: 'number',
          image: 'string',
          variant: 'string'
        }
      },
      subtotal: 'number',
      shipping: 'number',
      tax: 'number',
      total: 'number',
      discounts: {
        type: 'array',
        items: {
          code: 'string',
          amount: 'number',
          type: 'string'
        }
      }
    },
    sampleData: {
      items: [
        {
          id: 1,
          name: 'Premium Headphones',
          price: 299.99,
          quantity: 1,
          image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100&h=100&fit=crop',
          variant: 'Black'
        }
      ],
      subtotal: 299.99,
      shipping: 9.99,
      tax: 27.00,
      total: 336.98,
      discounts: []
    }
  }
}

// Export all smart objects
export const SMART_OBJECTS: SmartObjectTemplate[] = [
  SMART_PRODUCT_SHOWCASE,
  SMART_PRODUCT_CARD,
  SMART_PRODUCT_GRID,
  SMART_HERO_SECTION,
  SMART_CTA_BANNER,
  SMART_TESTIMONIAL_CAROUSEL,
  SMART_FAQ_ACCORDION,
  SMART_SHOPPING_CART
]

export const SMART_OBJECTS_BY_CATEGORY = {
  ecommerce: [SMART_PRODUCT_SHOWCASE, SMART_PRODUCT_CARD, SMART_PRODUCT_GRID, SMART_SHOPPING_CART],
  content: [SMART_HERO_SECTION, SMART_CTA_BANNER, SMART_TESTIMONIAL_CAROUSEL, SMART_FAQ_ACCORDION],
  layout: [],
  interactive: []
}