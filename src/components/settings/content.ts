import { SettingField } from './types'

// Content object settings with icons and groups
export const CONTENT_SETTINGS: Record<string, SettingField[]> = {
  'smart-hero-section': [
    // Content Group
    { 
      type: 'text', 
      name: 'mainTitle', 
      label: 'Main Title',
      placeholder: 'Enter hero title',
      icon: 'message',
      group: 'content'
    },
    { 
      type: 'text', 
      name: 'subtitle', 
      label: 'Subtitle',
      placeholder: 'Enter subtitle',
      icon: '📝',
      group: 'content'
    },
    { 
      type: 'textarea', 
      name: 'description', 
      label: 'Description',
      placeholder: 'Enter description',
      icon: '📄',
      group: 'content'
    },
    
    // Media Group
    { 
      type: 'image-asset', 
      name: 'backgroundImage', 
      label: 'Background Image',
      icon: '🖼️',
      group: 'media'
    },
    { 
      type: 'image-asset', 
      name: 'heroImage', 
      label: 'Hero Image',
      icon: '🖼️',
      group: 'media'
    },
    
    // Call to Action Group
    { 
      type: 'text', 
      name: 'ctaText', 
      label: 'CTA Button Text',
      icon: '🔘',
      group: 'cta'
    },
    { 
      type: 'text', 
      name: 'ctaLink', 
      label: 'CTA Link',
      icon: '🔗',
      group: 'cta'
    },
    { 
      type: 'checkbox', 
      name: 'showSecondaryButton', 
      label: 'Show Secondary Button',
      icon: '🔘',
      group: 'cta'
    },
    
    // Layout Group
    { 
      type: 'select', 
      name: 'layout', 
      label: 'Layout Style',
      icon: '📐',
      group: 'layout',
      options: [
        { value: 'centered', name: 'Centered' },
        { value: 'left-aligned', name: 'Left Aligned' },
        { value: 'right-aligned', name: 'Right Aligned' },
        { value: 'split', name: 'Split Layout' }
      ]
    },
    { 
      type: 'select', 
      name: 'height', 
      label: 'Section Height',
      icon: '↕️',
      group: 'layout',
      options: [
        { value: 'small', name: 'Small (400px)' },
        { value: 'medium', name: 'Medium (600px)' },
        { value: 'large', name: 'Large (800px)' },
        { value: 'fullscreen', name: 'Full Screen' }
      ]
    },
    
    // Common Properties
    { 
      type: 'number', 
      name: 'width', 
      label: 'Width (px)', 
      min: 0,
      icon: '↔️',
      group: 'dimensions'
    }
  ],

  'smart-cta-banner': [
    // Content Group
    { 
      type: 'text', 
      name: 'title', 
      label: 'Banner Title',
      icon: '📰',
      group: 'content'
    },
    { 
      type: 'textarea', 
      name: 'description', 
      label: 'Description',
      icon: '📄',
      group: 'content'
    },
    { 
      type: 'text', 
      name: 'buttonText', 
      label: 'Button Text',
      icon: '🔘',
      group: 'content'
    },
    { 
      type: 'text', 
      name: 'buttonLink', 
      label: 'Button Link',
      icon: '🔗',
      group: 'content'
    },
    
    // Style Group
    { 
      type: 'select', 
      name: 'bannerStyle', 
      label: 'Banner Style',
      icon: '🎨',
      group: 'style',
      options: [
        { value: 'modern', name: 'Modern' },
        { value: 'classic', name: 'Classic' },
        { value: 'minimal', name: 'Minimal' },
        { value: 'gradient', name: 'Gradient' }
      ]
    },
    { 
      type: 'color', 
      name: 'backgroundColor', 
      label: 'Background Color',
      icon: '🎨',
      group: 'style'
    },
    
    // Common Properties
    { 
      type: 'number', 
      name: 'width', 
      label: 'Width (px)', 
      min: 0,
      icon: '↔️',
      group: 'dimensions'
    },
    { 
      type: 'number', 
      name: 'height', 
      label: 'Height (px)', 
      min: 0,
      icon: '↕️',
      group: 'dimensions'
    }
  ],

  'smart-testimonials': [
    // Configuration Group
    { 
      type: 'number', 
      name: 'itemsToShow', 
      label: 'Items to Show',
      min: 1,
      max: 5,
      icon: '🔢',
      group: 'configuration'
    },
    { 
      type: 'checkbox', 
      name: 'autoPlay', 
      label: 'Auto Play',
      icon: '▶️',
      group: 'configuration'
    },
    { 
      type: 'number', 
      name: 'autoPlaySpeed', 
      label: 'Auto Play Speed (ms)',
      min: 1000,
      max: 10000,
      icon: '⏱️',
      group: 'configuration'
    },
    
    // Display Options Group
    { 
      type: 'checkbox', 
      name: 'showRatings', 
      label: 'Show Ratings',
      icon: '⭐',
      group: 'display'
    },
    { 
      type: 'checkbox', 
      name: 'showAvatars', 
      label: 'Show Customer Photos',
      icon: '👤',
      group: 'display'
    },
    { 
      type: 'checkbox', 
      name: 'showCompany', 
      label: 'Show Company Info',
      icon: '🏢',
      group: 'display'
    },
    
    // Navigation Group
    { 
      type: 'checkbox', 
      name: 'showArrows', 
      label: 'Show Navigation Arrows',
      icon: '←→',
      group: 'navigation'
    },
    { 
      type: 'checkbox', 
      name: 'showDots', 
      label: 'Show Dots Navigation',
      icon: '•••',
      group: 'navigation'
    },
    
    // Common Properties
    { 
      type: 'number', 
      name: 'width', 
      label: 'Width (px)', 
      min: 0,
      icon: '↔️',
      group: 'dimensions'
    },
    { 
      type: 'number', 
      name: 'height', 
      label: 'Height (px)', 
      min: 0,
      icon: '↕️',
      group: 'dimensions'
    }
  ],

  'smart-faq-accordion': [
    // Configuration Group
    { 
      type: 'checkbox', 
      name: 'allowMultipleOpen', 
      label: 'Allow Multiple Open',
      icon: '📂',
      group: 'configuration'
    },
    { 
      type: 'checkbox', 
      name: 'enableSearch', 
      label: 'Enable Search',
      icon: '🔍',
      group: 'configuration'
    },
    { 
      type: 'text', 
      name: 'searchPlaceholder', 
      label: 'Search Placeholder',
      icon: '🔍',
      group: 'configuration'
    },
    
    // Animation Group
    { 
      type: 'select', 
      name: 'animationSpeed', 
      label: 'Animation Speed',
      icon: '⚡',
      group: 'animation',
      options: [
        { value: 'slow', name: 'Slow' },
        { value: 'normal', name: 'Normal' },
        { value: 'fast', name: 'Fast' }
      ]
    },
    { 
      type: 'select', 
      name: 'animationType', 
      label: 'Animation Type',
      icon: '🎬',
      group: 'animation',
      options: [
        { value: 'slide', name: 'Slide' },
        { value: 'fade', name: 'Fade' },
        { value: 'scale', name: 'Scale' }
      ]
    },
    
    // Style Group
    { 
      type: 'select', 
      name: 'iconStyle', 
      label: 'Expand Icon Style',
      icon: '➕',
      group: 'style',
      options: [
        { value: 'plus', name: 'Plus/Minus' },
        { value: 'arrow', name: 'Arrow' },
        { value: 'chevron', name: 'Chevron' }
      ]
    },
    
    // Common Properties
    { 
      type: 'number', 
      name: 'width', 
      label: 'Width (px)', 
      min: 0,
      icon: '↔️',
      group: 'dimensions'
    },
    { 
      type: 'number', 
      name: 'height', 
      label: 'Height (px)', 
      min: 0,
      icon: 'height',
      group: 'dimensions'
    }
  ],

  // Common elements with style settings
  'div': [
    // Dimensions Group
    { 
      type: 'number', 
      name: 'width', 
      label: 'Width (px)', 
      min: 0,
      icon: 'width',
      group: 'dimensions'
    },
    { 
      type: 'number', 
      name: 'height', 
      label: 'Height (px)', 
      min: 0,
      icon: 'height',
      group: 'dimensions'
    },
    { 
      type: 'number', 
      name: 'padding', 
      label: 'Padding (px)', 
      min: 0,
      icon: 'ruler',
      group: 'dimensions'
    },
    { 
      type: 'number', 
      name: 'margin', 
      label: 'Margin (px)', 
      min: 0,
      icon: 'ruler',
      group: 'dimensions'
    },

    // Style Group
    { 
      type: 'color', 
      name: 'backgroundColor', 
      label: 'Background Color',
      icon: 'config',
      group: 'style'
    },
    { 
      type: 'color', 
      name: 'borderColor', 
      label: 'Border Color',
      icon: 'config',
      group: 'style'
    },
    { 
      type: 'number', 
      name: 'borderWidth', 
      label: 'Border Width (px)', 
      min: 0,
      icon: 'ruler',
      group: 'style'
    },
    { 
      type: 'number', 
      name: 'borderRadius', 
      label: 'Border Radius (px)', 
      min: 0,
      icon: 'config',
      group: 'style'
    }
  ],

  'text': [
    // Style Group  
    { 
      type: 'color', 
      name: 'color', 
      label: 'Text Color',
      icon: 'config',
      group: 'style'
    },
    { 
      type: 'select', 
      name: 'fontSize', 
      label: 'Font Size',
      icon: 'config',
      group: 'style',
      options: [
        { value: '12px', name: 'Small (12px)' },
        { value: '14px', name: 'Default (14px)' },
        { value: '16px', name: 'Medium (16px)' },
        { value: '18px', name: 'Large (18px)' },
        { value: '24px', name: 'X-Large (24px)' },
        { value: '32px', name: 'XX-Large (32px)' }
      ]
    },
    { 
      type: 'select', 
      name: 'fontWeight', 
      label: 'Font Weight',
      icon: 'config',
      group: 'style',
      options: [
        { value: 'normal', name: 'Normal' },
        { value: 'bold', name: 'Bold' },
        { value: '100', name: 'Thin' },
        { value: '300', name: 'Light' },
        { value: '500', name: 'Medium' },
        { value: '600', name: 'Semi Bold' },
        { value: '700', name: 'Bold' },
        { value: '900', name: 'Black' }
      ]
    },
    { 
      type: 'select', 
      name: 'textAlign', 
      label: 'Text Alignment',
      icon: 'config',
      group: 'style',
      options: [
        { value: 'left', name: 'Left' },
        { value: 'center', name: 'Center' },
        { value: 'right', name: 'Right' },
        { value: 'justify', name: 'Justify' }
      ]
    }
  ]
}