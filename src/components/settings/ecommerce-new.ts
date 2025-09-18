import { SettingField } from './types'

// E-commerce object settings with modern SVG icons
export const ECOMMERCE_SETTINGS: Record<string, SettingField[]> = {
  'smart-product-showcase': [
    // Content Group
    { 
      type: 'text', 
      name: 'productTitle', 
      label: 'Product Title', 
      placeholder: 'Enter product name',
      icon: 'message',
      group: 'content'
    },
    { 
      type: 'number', 
      name: 'productPrice', 
      label: 'Price', 
      min: 0, 
      step: 0.01,
      icon: 'calculator',
      group: 'content'
    },
    { 
      type: 'textarea', 
      name: 'productDescription', 
      label: 'Description', 
      placeholder: 'Product description',
      icon: 'message',
      group: 'content'
    },
    { 
      type: 'image-asset', 
      name: 'mainImage', 
      label: 'Main Product Image',
      icon: 'image',
      group: 'media'
    },
    
    // Layout Group
    { 
      type: 'select', 
      name: 'layout', 
      label: 'Layout', 
      icon: 'ruler',
      group: 'layout',
      options: [
        { value: 'horizontal', name: 'Horizontal (Image + Content)' },
        { value: 'vertical', name: 'Vertical (Image Top)' },
        { value: 'centered', name: 'Centered Layout' }
      ]
    },
    { 
      type: 'select', 
      name: 'colorScheme', 
      label: 'Color Scheme',
      icon: 'config',
      group: 'style',
      options: [
        { value: 'modern', name: 'Modern' },
        { value: 'classic', name: 'Classic' },
        { value: 'minimal', name: 'Minimal' },
        { value: 'vibrant', name: 'Vibrant' }
      ]
    },
    
    // Features Group
    { 
      type: 'checkbox', 
      name: 'enableZoom', 
      label: 'Enable Image Zoom',
      icon: 'eye',
      group: 'features'
    },
    { 
      type: 'checkbox', 
      name: 'enableGallery', 
      label: 'Enable Image Gallery',
      icon: 'image',
      group: 'features'
    },
    { 
      type: 'checkbox', 
      name: 'showBadges', 
      label: 'Show Product Badges',
      icon: 'sparkles',
      group: 'features'
    }
  ],

  'smart-product-card': [
    // Content Group
    { 
      type: 'text', 
      name: 'title', 
      label: 'Product Title', 
      placeholder: 'Product name',
      icon: 'message',
      group: 'content'
    },
    { 
      type: 'number', 
      name: 'price', 
      label: 'Price', 
      min: 0, 
      step: 0.01,
      icon: 'calculator',
      group: 'content'
    },
    { 
      type: 'text', 
      name: 'buttonText', 
      label: 'Button Text', 
      placeholder: 'Add to Cart',
      icon: 'checkout',
      group: 'content'
    },
    
    // Media Group
    { 
      type: 'image-asset', 
      name: 'productImage', 
      label: 'Product Image',
      icon: 'image',
      group: 'media'
    },
    
    // Layout Group
    { 
      type: 'select', 
      name: 'cardStyle', 
      label: 'Card Style',
      icon: 'ruler',
      group: 'layout',
      options: [
        { value: 'classic', name: 'Classic Card' },
        { value: 'modern', name: 'Modern Card' },
        { value: 'minimal', name: 'Minimal Card' }
      ]
    },
    
    // Features Group
    { 
      type: 'checkbox', 
      name: 'showRating', 
      label: 'Show Rating',
      icon: 'heart',
      group: 'features'
    },
    { 
      type: 'checkbox', 
      name: 'enableQuickView', 
      label: 'Enable Quick View',
      icon: 'eye',
      group: 'features'
    },
    { 
      type: 'checkbox', 
      name: 'enableWishlist', 
      label: 'Enable Wishlist',
      icon: 'heart',
      group: 'features'
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
      defaultValue: 3,
      icon: 'counter',
      group: 'configuration'
    },
    { 
      type: 'number', 
      name: 'productsPerPage', 
      label: 'Products per Page', 
      min: 4, 
      max: 50, 
      defaultValue: 12,
      icon: 'counter',
      group: 'configuration'
    },
    
    // Layout Group
    { 
      type: 'select', 
      name: 'gridLayout', 
      label: 'Grid Layout',
      icon: 'ruler',
      group: 'layout',
      options: [
        { value: 'equal', name: 'Equal Heights' },
        { value: 'masonry', name: 'Masonry Grid' },
        { value: 'list', name: 'List View' }
      ]
    },
    
    // Features Group
    { 
      type: 'checkbox', 
      name: 'showFilters', 
      label: 'Show Filters',
      icon: 'config',
      group: 'features'
    },
    { 
      type: 'checkbox', 
      name: 'showSorting', 
      label: 'Show Sorting',
      icon: 'config',
      group: 'features'
    },
    { 
      type: 'checkbox', 
      name: 'enableSearch', 
      label: 'Enable Search',
      icon: 'config',
      group: 'features'
    },
    { 
      type: 'checkbox', 
      name: 'showPagination', 
      label: 'Show Pagination',
      icon: 'config',
      group: 'features',
      defaultValue: true
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
      name: 'showSubtotal', 
      label: 'Show Subtotal',
      icon: 'calculator',
      group: 'display'
    },
    { 
      type: 'checkbox', 
      name: 'showTax', 
      label: 'Show Tax Information',
      icon: 'tax',
      group: 'display'
    },
    { 
      type: 'checkbox', 
      name: 'showShipping', 
      label: 'Show Shipping Information',
      icon: 'shipping',
      group: 'display',
      defaultValue: true
    },
    
    // Features Group
    { 
      type: 'checkbox', 
      name: 'enableCoupons', 
      label: 'Enable Coupon Codes',
      icon: 'coupon',
      group: 'features'
    },
    { 
      type: 'checkbox', 
      name: 'allowQuantityEdit', 
      label: 'Allow Quantity Editing',
      icon: 'edit',
      group: 'features'
    },
    { 
      type: 'checkbox', 
      name: 'enableWishlist', 
      label: 'Enable Wishlist',
      icon: 'heart',
      group: 'features'
    }
  ]
}

// Group definitions for better organization
export const ECOMMERCE_GROUPS = {
  content: { name: 'Content', icon: 'message' },
  media: { name: 'Media', icon: 'image' },
  layout: { name: 'Layout', icon: 'ruler' },
  style: { name: 'Style', icon: 'config' },
  configuration: { name: 'Configuration', icon: 'config' },
  display: { name: 'Display', icon: 'eye' },
  features: { name: 'Features', icon: 'sparkles' }
}