/**
 * Comprehensive Trait Configuration System for Srijon Shilpo Visual Builder
 * Provides extensible, future-proof trait definitions for all component types
 */

export interface TraitOption {
  value: string
  name: string
}

export interface TraitDefinition {
  type: string
  name: string
  label: string
  options?: TraitOption[]
  min?: number
  max?: number
  step?: number
  placeholder?: string
  description?: string
}

export interface ComponentTraitConfig {
  [componentType: string]: TraitDefinition[]
}

// Smart Object Trait Configurations
export const SMART_OBJECT_TRAITS: ComponentTraitConfig = {
  'smart-product-card': [
    { type: 'text', name: 'productTitle', label: 'Product Title', placeholder: 'Enter product name' },
    { type: 'number', name: 'productPrice', label: 'Price ($)', min: 0, step: 0.01, placeholder: '0.00' },
    { type: 'textarea', name: 'productDescription', label: 'Description', placeholder: 'Product description...' },
    { type: 'text', name: 'productImage', label: 'Product Image URL', placeholder: 'https://...' },
    { type: 'checkbox', name: 'showRating', label: 'Show Rating' },
    { type: 'number', name: 'ratingValue', label: 'Rating (1-5)', min: 1, max: 5, step: 0.1 },
    { type: 'select', name: 'colorScheme', label: 'Color Scheme', options: [
      { value: 'modern', name: 'Modern Blue' },
      { value: 'warm', name: 'Warm Orange' },
      { value: 'cool', name: 'Cool Teal' },
      { value: 'dark', name: 'Dark Theme' },
      { value: 'nature', name: 'Nature Green' }
    ]},
    { type: 'select', name: 'layout', label: 'Layout Style', options: [
      { value: 'horizontal', name: 'Horizontal' },
      { value: 'vertical', name: 'Vertical' },
      { value: 'compact', name: 'Compact' }
    ]},
    { type: 'checkbox', name: 'showBadge', label: 'Show Sale Badge' },
    { type: 'text', name: 'badgeText', label: 'Badge Text', placeholder: 'SALE, NEW, etc.' },
    { type: 'checkbox', name: 'showAddToCart', label: 'Show Add to Cart Button' },
    { type: 'select', name: 'hoverEffect', label: 'Hover Effect', options: [
      { value: 'none', name: 'None' },
      { value: 'lift', name: 'Lift Up' },
      { value: 'glow', name: 'Glow' },
      { value: 'scale', name: 'Scale' }
    ]}
  ],

  'smart-product-grid': [
    { type: 'number', name: 'columns', label: 'Grid Columns', min: 1, max: 6, step: 1 },
    { type: 'number', name: 'productCount', label: 'Products to Show', min: 1, max: 50, step: 1 },
    { type: 'checkbox', name: 'showPrices', label: 'Show Product Prices' },
    { type: 'checkbox', name: 'showRatings', label: 'Show Product Ratings' },
    { type: 'checkbox', name: 'showDescriptions', label: 'Show Descriptions' },
    { type: 'select', name: 'cardStyle', label: 'Card Style', options: [
      { value: 'simple', name: 'Simple' },
      { value: 'bordered', name: 'Bordered' },
      { value: 'shadow', name: 'Shadow' },
      { value: 'glass', name: 'Glass Morphism' }
    ]},
    { type: 'select', name: 'spacing', label: 'Grid Spacing', options: [
      { value: 'tight', name: 'Tight (8px)' },
      { value: 'normal', name: 'Normal (16px)' },
      { value: 'wide', name: 'Wide (24px)' }
    ]},
    { type: 'checkbox', name: 'enableHover', label: 'Hover Effects' },
    { type: 'checkbox', name: 'enablePagination', label: 'Pagination' },
    { type: 'checkbox', name: 'enableSort', label: 'Sort Controls' },
    { type: 'checkbox', name: 'enableFilter', label: 'Filter Controls' },
    { type: 'select', name: 'loadingStyle', label: 'Loading Animation', options: [
      { value: 'skeleton', name: 'Skeleton' },
      { value: 'spinner', name: 'Spinner' },
      { value: 'fade', name: 'Fade In' }
    ]}
  ],

  'smart-shopping-cart': [
    { type: 'select', name: 'cartType', label: 'Cart Display Type', options: [
      { value: 'drawer', name: 'Side Drawer' },
      { value: 'dropdown', name: 'Dropdown' },
      { value: 'page', name: 'Full Page' },
      { value: 'modal', name: 'Modal Popup' }
    ]},
    { type: 'checkbox', name: 'showCounter', label: 'Show Item Counter Badge' },
    { type: 'checkbox', name: 'enableCoupons', label: 'Enable Coupon Codes' },
    { type: 'checkbox', name: 'showImages', label: 'Show Product Images' },
    { type: 'checkbox', name: 'allowQuantityEdit', label: 'Allow Quantity Editing' },
    { type: 'select', name: 'checkoutButton', label: 'Checkout Button Style', options: [
      { value: 'standard', name: 'Standard' },
      { value: 'prominent', name: 'Prominent' },
      { value: 'floating', name: 'Floating' }
    ]},
    { type: 'checkbox', name: 'showSubtotal', label: 'Show Subtotal' },
    { type: 'checkbox', name: 'showTax', label: 'Show Tax Calculation' },
    { type: 'checkbox', name: 'showShipping', label: 'Show Shipping Cost' },
    { type: 'checkbox', name: 'enableWishlist', label: 'Enable Save for Later' },
    { type: 'select', name: 'emptyCartMessage', label: 'Empty Cart Display', options: [
      { value: 'standard', name: 'Standard Message' },
      { value: 'illustration', name: 'With Illustration' },
      { value: 'suggestions', name: 'With Product Suggestions' }
    ]}
  ],

  'smart-hero-section': [
    { type: 'text', name: 'heroTitle', label: 'Main Headline', placeholder: 'Your amazing headline' },
    { type: 'textarea', name: 'heroSubtitle', label: 'Subheadline', placeholder: 'Supporting description...' },
    { type: 'text', name: 'buttonText', label: 'Call-to-Action Text', placeholder: 'Get Started' },
    { type: 'text', name: 'buttonUrl', label: 'Button URL', placeholder: 'https://...' },
    { type: 'text', name: 'backgroundImage', label: 'Background Image URL', placeholder: 'https://...' },
    { type: 'select', name: 'overlayOpacity', label: 'Overlay Opacity', options: [
      { value: '0', name: 'None (0%)' },
      { value: '0.2', name: 'Light (20%)' },
      { value: '0.4', name: 'Medium (40%)' },
      { value: '0.6', name: 'Heavy (60%)' },
      { value: '0.8', name: 'Very Heavy (80%)' }
    ]},
    { type: 'select', name: 'textAlignment', label: 'Text Alignment', options: [
      { value: 'left', name: 'Left' },
      { value: 'center', name: 'Center' },
      { value: 'right', name: 'Right' }
    ]},
    { type: 'select', name: 'height', label: 'Section Height', options: [
      { value: 'small', name: 'Small (400px)' },
      { value: 'medium', name: 'Medium (600px)' },
      { value: 'large', name: 'Large (800px)' },
      { value: 'fullscreen', name: 'Fullscreen (100vh)' }
    ]},
    { type: 'checkbox', name: 'enableParallax', label: 'Parallax Scrolling Effect' },
    { type: 'checkbox', name: 'enableAnimations', label: 'Text Animations' },
    { type: 'select', name: 'buttonStyle', label: 'Button Style', options: [
      { value: 'solid', name: 'Solid' },
      { value: 'outline', name: 'Outline' },
      { value: 'ghost', name: 'Ghost' },
      { value: 'gradient', name: 'Gradient' }
    ]}
  ],

  'smart-testimonial-carousel': [
    { type: 'text', name: 'sectionTitle', label: 'Section Title', placeholder: 'What Our Customers Say' },
    { type: 'number', name: 'testimonialCount', label: 'Number of Testimonials', min: 3, max: 20, step: 1 },
    { type: 'checkbox', name: 'showRatings', label: 'Show Star Ratings' },
    { type: 'checkbox', name: 'showAvatars', label: 'Show Customer Photos' },
    { type: 'checkbox', name: 'showCompany', label: 'Show Company Names' },
    { type: 'checkbox', name: 'autoPlay', label: 'Auto-play Slides' },
    { type: 'number', name: 'autoPlaySpeed', label: 'Auto-play Speed (seconds)', min: 2, max: 10, step: 0.5 },
    { type: 'checkbox', name: 'showDots', label: 'Show Dot Navigation' },
    { type: 'checkbox', name: 'showArrows', label: 'Show Arrow Navigation' },
    { type: 'select', name: 'slidesToShow', label: 'Slides Visible', options: [
      { value: '1', name: '1 Slide' },
      { value: '2', name: '2 Slides' },
      { value: '3', name: '3 Slides' }
    ]},
    { type: 'select', name: 'style', label: 'Testimonial Style', options: [
      { value: 'cards', name: 'Card Style' },
      { value: 'quotes', name: 'Quote Bubbles' },
      { value: 'minimal', name: 'Minimal' },
      { value: 'featured', name: 'Featured Customer' }
    ]}
  ],

  'smart-faq-accordion': [
    { type: 'text', name: 'sectionTitle', label: 'Section Title', placeholder: 'Frequently Asked Questions' },
    { type: 'number', name: 'faqCount', label: 'Number of FAQs', min: 3, max: 20, step: 1 },
    { type: 'checkbox', name: 'showSearch', label: 'Enable Search Bar' },
    { type: 'checkbox', name: 'allowMultiple', label: 'Allow Multiple Open' },
    { type: 'select', name: 'iconPosition', label: 'Expand Icon Position', options: [
      { value: 'left', name: 'Left Side' },
      { value: 'right', name: 'Right Side' }
    ]},
    { type: 'select', name: 'expandIcon', label: 'Expand Icon Style', options: [
      { value: 'plus', name: 'Plus/Minus' },
      { value: 'arrow', name: 'Arrow Down/Up' },
      { value: 'chevron', name: 'Chevron' },
      { value: 'caret', name: 'Caret' }
    ]},
    { type: 'checkbox', name: 'enableAnimation', label: 'Smooth Animations' },
    { type: 'select', name: 'defaultOpen', label: 'Default State', options: [
      { value: 'none', name: 'All Closed' },
      { value: 'first', name: 'First Open' },
      { value: 'all', name: 'All Open' }
    ]}
  ],

  'smart-cta-banner': [
    { type: 'text', name: 'ctaTitle', label: 'Banner Title', placeholder: 'Take Action Now!' },
    { type: 'textarea', name: 'ctaSubtitle', label: 'Banner Description', placeholder: 'Compelling description...' },
    { type: 'text', name: 'buttonText', label: 'Button Text', placeholder: 'Get Started' },
    { type: 'text', name: 'buttonUrl', label: 'Button URL', placeholder: 'https://...' },
    { type: 'text', name: 'backgroundImage', label: 'Background Image URL', placeholder: 'https://...' },
    { type: 'select', name: 'layout', label: 'Layout Style', options: [
      { value: 'horizontal', name: 'Horizontal Split' },
      { value: 'vertical', name: 'Vertical Stack' },
      { value: 'centered', name: 'Centered' },
      { value: 'overlay', name: 'Text Overlay' }
    ]},
    { type: 'checkbox', name: 'enableGradient', label: 'Background Gradient' },
    { type: 'select', name: 'urgency', label: 'Urgency Level', options: [
      { value: 'low', name: 'Subtle' },
      { value: 'medium', name: 'Moderate' },
      { value: 'high', name: 'High Impact' }
    ]},
    { type: 'checkbox', name: 'showTimer', label: 'Countdown Timer' },
    { type: 'text', name: 'timerEndDate', label: 'Timer End Date', placeholder: 'YYYY-MM-DD HH:MM' }
  ],

  'smart-newsletter-signup': [
    { type: 'text', name: 'title', label: 'Signup Title', placeholder: 'Stay Updated' },
    { type: 'textarea', name: 'description', label: 'Description', placeholder: 'Get the latest updates...' },
    { type: 'text', name: 'buttonText', label: 'Subscribe Button Text', placeholder: 'Subscribe' },
    { type: 'text', name: 'emailPlaceholder', label: 'Email Placeholder', placeholder: 'Enter your email...' },
    { type: 'checkbox', name: 'requireName', label: 'Require Name Field' },
    { type: 'text', name: 'namePlaceholder', label: 'Name Placeholder', placeholder: 'Your name...' },
    { type: 'checkbox', name: 'showPrivacyNote', label: 'Show Privacy Note' },
    { type: 'text', name: 'privacyText', label: 'Privacy Text', placeholder: 'We respect your privacy' },
    { type: 'select', name: 'layout', label: 'Form Layout', options: [
      { value: 'inline', name: 'Inline (Side by Side)' },
      { value: 'stacked', name: 'Stacked (Vertical)' }
    ]},
    { type: 'checkbox', name: 'showSuccessMessage', label: 'Show Success Message' },
    { type: 'text', name: 'successMessage', label: 'Success Message', placeholder: 'Thank you for subscribing!' }
  ]
}

// Basic Component Trait Configurations
export const BASIC_COMPONENT_TRAITS: ComponentTraitConfig = {
  'text': [
    { type: 'textarea', name: 'content', label: 'Text Content', placeholder: 'Enter your text...' },
    { type: 'select', name: 'tag', label: 'HTML Tag', options: [
      { value: 'p', name: 'Paragraph' },
      { value: 'h1', name: 'Heading 1' },
      { value: 'h2', name: 'Heading 2' },
      { value: 'h3', name: 'Heading 3' },
      { value: 'h4', name: 'Heading 4' },
      { value: 'h5', name: 'Heading 5' },
      { value: 'h6', name: 'Heading 6' },
      { value: 'span', name: 'Span' },
      { value: 'div', name: 'Div' }
    ]},
    { type: 'select', name: 'align', label: 'Text Alignment', options: [
      { value: 'left', name: 'Left' },
      { value: 'center', name: 'Center' },
      { value: 'right', name: 'Right' },
      { value: 'justify', name: 'Justify' }
    ]},
    { type: 'select', name: 'fontSize', label: 'Font Size', options: [
      { value: 'xs', name: 'Extra Small' },
      { value: 'sm', name: 'Small' },
      { value: 'base', name: 'Normal' },
      { value: 'lg', name: 'Large' },
      { value: 'xl', name: 'Extra Large' },
      { value: '2xl', name: '2X Large' }
    ]},
    { type: 'select', name: 'fontWeight', label: 'Font Weight', options: [
      { value: 'normal', name: 'Normal' },
      { value: 'medium', name: 'Medium' },
      { value: 'semibold', name: 'Semi Bold' },
      { value: 'bold', name: 'Bold' }
    ]}
  ],

  'image': [
    { type: 'text', name: 'src', label: 'Image URL', placeholder: 'https://example.com/image.jpg' },
    { type: 'text', name: 'alt', label: 'Alt Text (Accessibility)', placeholder: 'Describe the image...' },
    { type: 'text', name: 'title', label: 'Image Title', placeholder: 'Image tooltip...' },
    { type: 'number', name: 'width', label: 'Width (px)', min: 50, max: 2000, step: 10 },
    { type: 'number', name: 'height', label: 'Height (px)', min: 50, max: 2000, step: 10 },
    { type: 'checkbox', name: 'responsive', label: 'Responsive Sizing' },
    { type: 'select', name: 'objectFit', label: 'Image Fit', options: [
      { value: 'cover', name: 'Cover (Crop)' },
      { value: 'contain', name: 'Contain (Fit)' },
      { value: 'fill', name: 'Fill (Stretch)' },
      { value: 'scale-down', name: 'Scale Down' }
    ]},
    { type: 'select', name: 'borderRadius', label: 'Border Radius', options: [
      { value: '0', name: 'None' },
      { value: '4px', name: 'Small' },
      { value: '8px', name: 'Medium' },
      { value: '16px', name: 'Large' },
      { value: '50%', name: 'Circle' }
    ]},
    { type: 'checkbox', name: 'enableZoom', label: 'Enable Zoom on Hover' },
    { type: 'checkbox', name: 'enableLightbox', label: 'Enable Lightbox Click' }
  ],

  'link': [
    { type: 'text', name: 'href', label: 'URL Destination', placeholder: 'https://example.com' },
    { type: 'text', name: 'title', label: 'Link Title (Tooltip)', placeholder: 'Link description...' },
    { type: 'select', name: 'target', label: 'Open In', options: [
      { value: '', name: 'Same Window' },
      { value: '_blank', name: 'New Window/Tab' },
      { value: '_parent', name: 'Parent Frame' },
      { value: '_top', name: 'Top Frame' }
    ]},
    { type: 'text', name: 'rel', label: 'Rel Attribute', placeholder: 'noopener, noreferrer...' },
    { type: 'select', name: 'linkType', label: 'Link Type', options: [
      { value: 'external', name: 'External Link' },
      { value: 'internal', name: 'Internal Page' },
      { value: 'anchor', name: 'Page Anchor' },
      { value: 'email', name: 'Email Address' },
      { value: 'phone', name: 'Phone Number' }
    ]},
    { type: 'checkbox', name: 'noFollow', label: 'No Follow (SEO)' },
    { type: 'checkbox', name: 'trackClick', label: 'Track Clicks (Analytics)' }
  ],

  'button': [
    { type: 'text', name: 'text', label: 'Button Text', placeholder: 'Click me' },
    { type: 'select', name: 'type', label: 'Button Type', options: [
      { value: 'button', name: 'Regular Button' },
      { value: 'submit', name: 'Form Submit' },
      { value: 'reset', name: 'Form Reset' }
    ]},
    { type: 'select', name: 'variant', label: 'Button Style', options: [
      { value: 'primary', name: 'Primary' },
      { value: 'secondary', name: 'Secondary' },
      { value: 'outline', name: 'Outline' },
      { value: 'ghost', name: 'Ghost' },
      { value: 'link', name: 'Link Style' }
    ]},
    { type: 'select', name: 'size', label: 'Button Size', options: [
      { value: 'sm', name: 'Small' },
      { value: 'md', name: 'Medium' },
      { value: 'lg', name: 'Large' },
      { value: 'xl', name: 'Extra Large' }
    ]},
    { type: 'text', name: 'onclick', label: 'Click Action (JavaScript)', placeholder: 'alert("Hello!")' },
    { type: 'checkbox', name: 'disabled', label: 'Disabled State' },
    { type: 'checkbox', name: 'fullWidth', label: 'Full Width' },
    { type: 'text', name: 'icon', label: 'Icon Class', placeholder: 'fa-icon, material-icon...' },
    { type: 'select', name: 'iconPosition', label: 'Icon Position', options: [
      { value: 'left', name: 'Left' },
      { value: 'right', name: 'Right' },
      { value: 'only', name: 'Icon Only' }
    ]}
  ],

  'input': [
    { type: 'select', name: 'type', label: 'Input Type', options: [
      { value: 'text', name: 'Text' },
      { value: 'email', name: 'Email' },
      { value: 'password', name: 'Password' },
      { value: 'number', name: 'Number' },
      { value: 'tel', name: 'Phone' },
      { value: 'url', name: 'URL' },
      { value: 'search', name: 'Search' },
      { value: 'date', name: 'Date' },
      { value: 'time', name: 'Time' },
      { value: 'datetime-local', name: 'Date & Time' },
      { value: 'file', name: 'File Upload' }
    ]},
    { type: 'text', name: 'name', label: 'Field Name', placeholder: 'fieldName' },
    { type: 'text', name: 'placeholder', label: 'Placeholder Text', placeholder: 'Enter value...' },
    { type: 'text', name: 'value', label: 'Default Value', placeholder: 'Default...' },
    { type: 'text', name: 'label', label: 'Field Label', placeholder: 'Field Label' },
    { type: 'checkbox', name: 'required', label: 'Required Field' },
    { type: 'checkbox', name: 'disabled', label: 'Disabled' },
    { type: 'checkbox', name: 'readonly', label: 'Read Only' },
    { type: 'number', name: 'maxLength', label: 'Max Characters', min: 1, max: 1000 },
    { type: 'text', name: 'pattern', label: 'Validation Pattern (Regex)', placeholder: '[A-Za-z0-9]+' }
  ],

  'textarea': [
    { type: 'text', name: 'name', label: 'Field Name', placeholder: 'fieldName' },
    { type: 'text', name: 'placeholder', label: 'Placeholder Text', placeholder: 'Enter your message...' },
    { type: 'textarea', name: 'value', label: 'Default Content', placeholder: 'Default text...' },
    { type: 'text', name: 'label', label: 'Field Label', placeholder: 'Field Label' },
    { type: 'number', name: 'rows', label: 'Number of Rows', min: 2, max: 20, step: 1 },
    { type: 'number', name: 'cols', label: 'Number of Columns', min: 20, max: 100, step: 5 },
    { type: 'number', name: 'maxLength', label: 'Max Characters', min: 10, max: 5000 },
    { type: 'checkbox', name: 'required', label: 'Required Field' },
    { type: 'checkbox', name: 'disabled', label: 'Disabled' },
    { type: 'checkbox', name: 'readonly', label: 'Read Only' },
    { type: 'checkbox', name: 'resizable', label: 'User Resizable' }
  ],

  'select': [
    { type: 'text', name: 'name', label: 'Field Name', placeholder: 'fieldName' },
    { type: 'text', name: 'label', label: 'Field Label', placeholder: 'Choose an option' },
    { type: 'checkbox', name: 'multiple', label: 'Multiple Selection' },
    { type: 'checkbox', name: 'required', label: 'Required Field' },
    { type: 'checkbox', name: 'disabled', label: 'Disabled' },
    { type: 'number', name: 'size', label: 'Visible Options', min: 1, max: 10, step: 1 },
    { type: 'text', name: 'defaultOption', label: 'Default Selected', placeholder: 'option1' },
    { type: 'textarea', name: 'options', label: 'Options (one per line)', placeholder: 'Option 1\nOption 2\nOption 3' }
  ],

  'video': [
    { type: 'text', name: 'src', label: 'Video URL', placeholder: 'https://example.com/video.mp4' },
    { type: 'text', name: 'poster', label: 'Poster Image URL', placeholder: 'https://example.com/poster.jpg' },
    { type: 'number', name: 'width', label: 'Width (px)', min: 200, max: 1920, step: 10 },
    { type: 'number', name: 'height', label: 'Height (px)', min: 150, max: 1080, step: 10 },
    { type: 'checkbox', name: 'autoplay', label: 'Auto-play Video' },
    { type: 'checkbox', name: 'controls', label: 'Show Player Controls' },
    { type: 'checkbox', name: 'loop', label: 'Loop Video' },
    { type: 'checkbox', name: 'muted', label: 'Start Muted' },
    { type: 'select', name: 'preload', label: 'Preload Strategy', options: [
      { value: 'none', name: 'None' },
      { value: 'metadata', name: 'Metadata Only' },
      { value: 'auto', name: 'Full Video' }
    ]},
    { type: 'checkbox', name: 'responsive', label: 'Responsive Sizing' }
  ],

  'container': [
    { type: 'text', name: 'id', label: 'Container ID', placeholder: 'unique-id' },
    { type: 'text', name: 'class', label: 'CSS Classes', placeholder: 'class1 class2' },
    { type: 'select', name: 'tag', label: 'HTML Tag', options: [
      { value: 'div', name: 'Div' },
      { value: 'section', name: 'Section' },
      { value: 'article', name: 'Article' },
      { value: 'header', name: 'Header' },
      { value: 'footer', name: 'Footer' },
      { value: 'main', name: 'Main' },
      { value: 'aside', name: 'Aside' },
      { value: 'nav', name: 'Navigation' }
    ]},
    { type: 'select', name: 'display', label: 'Display Type', options: [
      { value: 'block', name: 'Block' },
      { value: 'flex', name: 'Flexbox' },
      { value: 'grid', name: 'CSS Grid' },
      { value: 'inline-block', name: 'Inline Block' }
    ]},
    { type: 'select', name: 'maxWidth', label: 'Max Width', options: [
      { value: 'none', name: 'No Limit' },
      { value: '640px', name: 'Small (640px)' },
      { value: '768px', name: 'Medium (768px)' },
      { value: '1024px', name: 'Large (1024px)' },
      { value: '1280px', name: 'XL (1280px)' },
      { value: '1536px', name: '2XL (1536px)' }
    ]},
    { type: 'checkbox', name: 'centered', label: 'Center Container' }
  ],

  'form': [
    { type: 'text', name: 'action', label: 'Form Action URL', placeholder: '/submit-form' },
    { type: 'select', name: 'method', label: 'HTTP Method', options: [
      { value: 'POST', name: 'POST' },
      { value: 'GET', name: 'GET' }
    ]},
    { type: 'text', name: 'name', label: 'Form Name', placeholder: 'contactForm' },
    { type: 'checkbox', name: 'noValidate', label: 'Disable Browser Validation' },
    { type: 'select', name: 'enctype', label: 'Encoding Type', options: [
      { value: 'application/x-www-form-urlencoded', name: 'Standard' },
      { value: 'multipart/form-data', name: 'File Upload' },
      { value: 'text/plain', name: 'Plain Text' }
    ]},
    { type: 'text', name: 'target', label: 'Submit Target', placeholder: '_blank, _self...' },
    { type: 'checkbox', name: 'autocomplete', label: 'Enable Autocomplete' }
  ]
}

// Default fallback traits for unknown components
export const DEFAULT_TRAITS: TraitDefinition[] = [
  { type: 'text', name: 'id', label: 'Element ID', placeholder: 'unique-id' },
  { type: 'text', name: 'class', label: 'CSS Classes', placeholder: 'class1 class2' },
  { type: 'text', name: 'title', label: 'Title Attribute', placeholder: 'Tooltip text...' }
]

/**
 * Get trait configuration for a specific component
 */
export function getTraitConfig(componentType: string, smartObjectId?: string): TraitDefinition[] {
  // Check for smart objects first
  if (smartObjectId && SMART_OBJECT_TRAITS[smartObjectId]) {
    return SMART_OBJECT_TRAITS[smartObjectId]
  }
  
  // Check for basic components
  if (BASIC_COMPONENT_TRAITS[componentType]) {
    return BASIC_COMPONENT_TRAITS[componentType]
  }
  
  // Return default traits
  return DEFAULT_TRAITS
}

/**
 * Get all available component types
 */
export function getAllComponentTypes(): string[] {
  return [
    ...Object.keys(SMART_OBJECT_TRAITS),
    ...Object.keys(BASIC_COMPONENT_TRAITS)
  ]
}

/**
 * Validate if a component type is supported
 */
export function isComponentTypeSupported(componentType: string, smartObjectId?: string): boolean {
  if (smartObjectId) {
    return smartObjectId in SMART_OBJECT_TRAITS
  }
  return componentType in BASIC_COMPONENT_TRAITS
}