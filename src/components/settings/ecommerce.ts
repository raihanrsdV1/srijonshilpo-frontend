import { SettingField } from './types'

// E-commerce and Smart Object settings with modern SVG icons
export const ECOMMERCE_SETTINGS: Record<string, SettingField[]> = {
  'smart-product-showcase': [
    // Content Group
    { 
      type: 'text', 
      name: 'productTitle', 
      label: 'Product Title', 
      placeholder: 'Premium Wireless Headphones',
      icon: 'text',
      group: 'content'
    },
    { 
      type: 'number', 
      name: 'productPrice', 
      label: 'Price ($)', 
      min: 0,
      step: 0.01,
      placeholder: '299.99',
      icon: 'price',
      group: 'content'
    },
    { 
      type: 'textarea', 
      name: 'productDescription', 
      label: 'Description', 
      placeholder: 'Professional-grade wireless headphones...',
      icon: 'text',
      group: 'content'
    },
    { 
      type: 'image-asset', 
      name: 'mainImage', 
      label: 'Main Product Image',
      icon: 'image',
      group: 'media'
    },
    
    // Configuration Group
    { 
      type: 'select', 
      name: 'layout', 
      label: 'Layout',
      icon: 'layout',
      group: 'configuration',
      options: [
        { value: 'horizontal', name: 'Horizontal (Image + Content)' },
        { value: 'vertical', name: 'Vertical (Image Top)' },
        { value: 'centered', name: 'Centered Layout' }
      ]
    },
    { 
      type: 'checkbox', 
      name: 'enableZoom', 
      label: 'Enable Image Zoom',
      icon: 'zoom',
      group: 'configuration'
    },
    { 
      type: 'checkbox', 
      name: 'enableGallery', 
      label: 'Enable Image Gallery',
      icon: 'gallery',
      group: 'configuration'
    },
    { 
      type: 'checkbox', 
      name: 'showBadges', 
      label: 'Show Product Badges',
      icon: 'badge',
      group: 'display'
    }
  ],

  'smart-product-card': [
    // Content Group
    { 
      type: 'text', 
      name: 'productTitle', 
      label: 'Product Title', 
      placeholder: 'Amazing Product',
      icon: 'text',
      group: 'content'
    },
    { 
      type: 'number', 
      name: 'productPrice', 
      label: 'Price ($)', 
      min: 0,
      step: 0.01,
      placeholder: '99.99',
      icon: 'price',
      group: 'content'
    },
    { 
      type: 'textarea', 
      name: 'productDescription', 
      label: 'Description', 
      placeholder: 'High-quality product with amazing features',
      icon: 'text',
      group: 'content'
    },
    { 
      type: 'image-asset', 
      name: 'productImage', 
      label: 'Product Image',
      icon: 'image',
      group: 'media'
    },
    
    // Configuration Group
    { 
      type: 'select', 
      name: 'colorScheme', 
      label: 'Color Scheme',
      icon: 'color',
      group: 'configuration',
      options: [
        { value: 'modern', name: 'Modern' },
        { value: 'elegant', name: 'Elegant' },
        { value: 'bold', name: 'Bold' },
        { value: 'minimalist', name: 'Minimalist' }
      ]
    },
    { 
      type: 'select', 
      name: 'layout', 
      label: 'Layout',
      icon: 'layout',
      group: 'configuration',
      options: [
        { value: 'vertical-center', name: 'Vertical Center' },
        { value: 'horizontal', name: 'Horizontal' },
        { value: 'compact', name: 'Compact' }
      ]
    },
    { 
      type: 'select', 
      name: 'size', 
      label: 'Size',
      icon: 'size',
      group: 'configuration',
      options: [
        { value: 'small', name: 'Small' },
        { value: 'medium', name: 'Medium' },
        { value: 'large', name: 'Large' }
      ]
    }
  ],

  'smart-product-grid': [
    // Configuration Group
    { 
      type: 'number', 
      name: 'columns', 
      label: 'Columns', 
      min: 1,
      max: 6,
      placeholder: '3',
      icon: 'grid',
      group: 'configuration'
    },
    { 
      type: 'number', 
      name: 'productsCount', 
      label: 'Products to Show', 
      min: 1,
      max: 20,
      placeholder: '6',
      icon: 'counter',
      group: 'configuration'
    },
    { 
      type: 'select', 
      name: 'spacing', 
      label: 'Grid Spacing',
      icon: 'spacing',
      group: 'configuration',
      options: [
        { value: 'tight', name: 'Tight' },
        { value: 'normal', name: 'Normal' },
        { value: 'loose', name: 'Loose' }
      ]
    },
    { 
      type: 'select', 
      name: 'colorScheme', 
      label: 'Color Scheme',
      icon: 'color',
      group: 'configuration',
      options: [
        { value: 'modern', name: 'Modern' },
        { value: 'elegant', name: 'Elegant' },
        { value: 'bold', name: 'Bold' }
      ]
    },
    
    // Display Group
    { 
      type: 'checkbox', 
      name: 'showFilters', 
      label: 'Show Category Filters',
      icon: 'filter',
      group: 'display'
    },
    { 
      type: 'checkbox', 
      name: 'showPagination', 
      label: 'Show Pagination',
      icon: 'pagination',
      group: 'display'
    }
  ],

  'smart-shopping-cart': [
    // Configuration Group
    { 
      type: 'select', 
      name: 'cartType', 
      label: 'Cart Type',
      icon: 'cart',
      group: 'configuration',
      options: [
        { value: 'mini', name: 'Mini Cart' },
        { value: 'full', name: 'Full Cart' },
        { value: 'sidebar', name: 'Sidebar Cart' }
      ]
    },
    { 
      type: 'text', 
      name: 'checkoutButton', 
      label: 'Checkout Button Text', 
      placeholder: 'Proceed to Checkout',
      icon: 'checkout',
      group: 'configuration'
    },
    { 
      type: 'text', 
      name: 'emptyCartMessage', 
      label: 'Empty Cart Message', 
      placeholder: 'Your cart is empty',
      icon: 'message',
      group: 'configuration'
    },
    
    // Display Group
    { 
      type: 'checkbox', 
      name: 'showCounter', 
      label: 'Show Item Counter',
      icon: 'counter',
      group: 'display'
    },
    { 
      type: 'checkbox', 
      name: 'showImages', 
      label: 'Show Product Images',
      icon: 'image',
      group: 'display'
    },
    { 
      type: 'checkbox', 
      name: 'enableCoupons', 
      label: 'Enable Coupon Codes',
      icon: 'coupon',
      group: 'features'
    }
  ],

  'smart-hero-section': [
    // Content Group
    { 
      type: 'text', 
      name: 'heroTitle', 
      label: 'Main Title', 
      placeholder: 'Welcome to Our Store',
      icon: 'text',
      group: 'content'
    },
    { 
      type: 'textarea', 
      name: 'heroSubtitle', 
      label: 'Subtitle', 
      placeholder: 'Discover amazing products and services',
      icon: 'text',
      group: 'content'
    },
    { 
      type: 'text', 
      name: 'ctaText', 
      label: 'CTA Button Text', 
      placeholder: 'Shop Now',
      icon: 'button',
      group: 'cta'
    },
    { 
      type: 'text', 
      name: 'ctaLink', 
      label: 'CTA Link', 
      placeholder: '#',
      icon: 'link',
      group: 'cta'
    },
    { 
      type: 'image-asset', 
      name: 'backgroundImage', 
      label: 'Background Image',
      icon: 'image',
      group: 'media'
    },
    
    // Configuration Group
    { 
      type: 'select', 
      name: 'textPosition', 
      label: 'Text Position',
      icon: 'layout',
      group: 'configuration',
      options: [
        { value: 'left', name: 'Left' },
        { value: 'center', name: 'Center' },
        { value: 'right', name: 'Right' }
      ]
    },
    { 
      type: 'select', 
      name: 'overlayOpacity', 
      label: 'Overlay Opacity',
      icon: 'opacity',
      group: 'configuration',
      options: [
        { value: '0', name: 'None' },
        { value: '0.3', name: 'Light' },
        { value: '0.5', name: 'Medium' },
        { value: '0.7', name: 'Dark' }
      ]
    }
  ],

  'smart-cta-banner': [
    // Content Group
    { 
      type: 'text', 
      name: 'title', 
      label: 'Title', 
      placeholder: 'Level-up your storefront',
      icon: 'text',
      group: 'content'
    },
    { 
      type: 'textarea', 
      name: 'subtitle', 
      label: 'Subtitle', 
      placeholder: 'Launch fast with beautiful, smart components',
      icon: 'text',
      group: 'content'
    },
    { 
      type: 'text', 
      name: 'ctaText', 
      label: 'CTA Text', 
      placeholder: 'Get Started',
      icon: 'button',
      group: 'cta'
    },
    { 
      type: 'text', 
      name: 'ctaLink', 
      label: 'CTA Link', 
      placeholder: '#',
      icon: 'link',
      group: 'cta'
    },
    
    // Configuration Group
    { 
      type: 'select', 
      name: 'layout', 
      label: 'Layout',
      icon: 'layout',
      group: 'configuration',
      options: [
        { value: 'horizontal', name: 'Horizontal' },
        { value: 'vertical', name: 'Vertical' },
        { value: 'centered', name: 'Centered' }
      ]
    },
    { 
      type: 'select', 
      name: 'colorScheme', 
      label: 'Color Scheme',
      icon: 'color',
      group: 'configuration',
      options: [
        { value: 'modern', name: 'Modern' },
        { value: 'elegant', name: 'Elegant' },
        { value: 'bold', name: 'Bold' }
      ]
    }
  ],

  'smart-testimonial-carousel': [
    // Content Group
    { 
      type: 'text', 
      name: 'sectionTitle', 
      label: 'Section Title', 
      placeholder: 'What Our Customers Say',
      icon: 'text',
      group: 'content'
    },
    
    // Configuration Group
    { 
      type: 'checkbox', 
      name: 'autoPlay', 
      label: 'Auto Play',
      icon: 'play',
      group: 'playback'
    },
    { 
      type: 'number', 
      name: 'autoPlayDelay', 
      label: 'Auto Play Delay (seconds)', 
      min: 1,
      max: 10,
      placeholder: '5',
      icon: 'timer',
      group: 'playback'
    },
    { 
      type: 'checkbox', 
      name: 'showDots', 
      label: 'Show Navigation Dots',
      icon: 'dots',
      group: 'navigation'
    },
    { 
      type: 'checkbox', 
      name: 'showArrows', 
      label: 'Show Navigation Arrows',
      icon: 'arrows',
      group: 'navigation'
    },
    { 
      type: 'select', 
      name: 'transition', 
      label: 'Transition Effect',
      icon: 'animation',
      group: 'animation',
      options: [
        { value: 'slide', name: 'Slide' },
        { value: 'fade', name: 'Fade' },
        { value: 'scale', name: 'Scale' }
      ]
    }
  ],

  'smart-faq-accordion': [
    // Content Group
    { 
      type: 'text', 
      name: 'sectionTitle', 
      label: 'Section Title', 
      placeholder: 'Frequently Asked Questions',
      icon: 'text',
      group: 'content'
    },
    
    // Configuration Group
    { 
      type: 'checkbox', 
      name: 'allowMultiple', 
      label: 'Allow Multiple Open',
      icon: 'accordion',
      group: 'configuration'
    },
    { 
      type: 'checkbox', 
      name: 'showSearch', 
      label: 'Show Search Box',
      icon: 'search',
      group: 'features'
    },
    { 
      type: 'select', 
      name: 'colorScheme', 
      label: 'Color Scheme',
      icon: 'color',
      group: 'configuration',
      options: [
        { value: 'modern', name: 'Modern' },
        { value: 'elegant', name: 'Elegant' },
        { value: 'minimalist', name: 'Minimalist' }
      ]
    },
    { 
      type: 'select', 
      name: 'animation', 
      label: 'Animation Style',
      icon: 'animation',
      group: 'animation',
      options: [
        { value: 'slide', name: 'Slide Down' },
        { value: 'fade', name: 'Fade In' },
        { value: 'scale', name: 'Scale Up' }
      ]
    }
  ]
}