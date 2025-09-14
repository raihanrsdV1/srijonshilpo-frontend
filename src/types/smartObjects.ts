// Smart Objects Type Definitions
export interface SmartObjectTemplate {
  id: string
  name: string
  description: string
  category: 'ecommerce' | 'content' | 'layout' | 'interactive'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  thumbnail: string
  preview: string
  
  // GrapeJS Component Definition
  component: {
    type: string
    defaults: any
    model: any
    view: any
  }
  
  // Quick Customization Options
  quickCustomization: {
    colorSchemes: ColorScheme[]
    layouts: LayoutVariant[]
    sizes: SizeVariant[]
    animations: AnimationOption[]
  }
  
  // Advanced Customization
  advancedCustomization: {
    spacing: RangeOption
    typography: TypographyOptions
    borders: BorderOptions
    shadows: ShadowOptions
  }
  
  // Data Binding
  dataBinding?: {
    source: 'static' | 'api' | 'ecommerce' | 'user'
    schema: any
    sampleData: any
  }
}

export interface ColorScheme {
  id: string
  name: string
  primary: string
  secondary: string
  accent: string
  background: string
  text: string
}

export interface LayoutVariant {
  id: string
  name: string
  direction: 'horizontal' | 'vertical' | 'grid'
  alignment: 'left' | 'center' | 'right' | 'justified'
  spacing: 'compact' | 'normal' | 'spacious'
}

export interface SizeVariant {
  id: string
  name: string
  width: string
  height: string
  scale: number
}

export interface AnimationOption {
  id: string
  name: string
  type: 'entrance' | 'hover' | 'scroll' | 'click'
  duration: number
  easing: string
  cssClass: string
}

export interface RangeOption {
  min: number
  max: number
  step: number
  unit: string
  default: number
}

export interface TypographyOptions {
  fontFamily: string[]
  fontSize: RangeOption
  fontWeight: number[]
  lineHeight: RangeOption
  letterSpacing: RangeOption
}

export interface BorderOptions {
  width: RangeOption
  style: string[]
  radius: RangeOption
  color: string
}

export interface ShadowOptions {
  presets: string[]
  custom: {
    offsetX: RangeOption
    offsetY: RangeOption
    blur: RangeOption
    spread: RangeOption
    color: string
    opacity: RangeOption
  }
}

// Smart Object Categories
export const SMART_OBJECT_CATEGORIES = {
  ECOMMERCE: {
    id: 'ecommerce',
    name: 'E-commerce',
    icon: '🛒',
    description: 'Ready-to-use shop components'
  },
  CONTENT: {
    id: 'content',
    name: 'Content',
    icon: '📝',
    description: 'Text and media layouts'
  },
  LAYOUT: {
    id: 'layout',
    name: 'Layout',
    icon: '📐',
    description: 'Page structure components'
  },
  INTERACTIVE: {
    id: 'interactive',
    name: 'Interactive',
    icon: '🎮',
    description: 'Forms, buttons, and widgets'
  }
} as const

// Pre-defined Color Schemes
export const COLOR_SCHEMES: ColorScheme[] = [
  {
    id: 'modern',
    name: 'Modern',
    primary: '#3B82F6',
    secondary: '#EF4444',
    accent: '#10B981',
    background: '#FFFFFF',
    text: '#1F2937'
  },
  {
    id: 'elegant',
    name: 'Elegant',
    primary: '#6366F1',
    secondary: '#EC4899',
    accent: '#F59E0B',
    background: '#F9FAFB',
    text: '#374151'
  },
  {
    id: 'bold',
    name: 'Bold',
    primary: '#DC2626',
    secondary: '#000000',
    accent: '#FBBF24',
    background: '#FFFFFF',
    text: '#111827'
  },
  {
    id: 'minimalist',
    name: 'Minimalist',
    primary: '#374151',
    secondary: '#6B7280',
    accent: '#9CA3AF',
    background: '#FFFFFF',
    text: '#1F2937'
  }
]

// Layout Variants
export const LAYOUT_VARIANTS: LayoutVariant[] = [
  {
    id: 'vertical-center',
    name: 'Vertical Center',
    direction: 'vertical',
    alignment: 'center',
    spacing: 'normal'
  },
  {
    id: 'horizontal-left',
    name: 'Horizontal Left',
    direction: 'horizontal',
    alignment: 'left',
    spacing: 'normal'
  },
  {
    id: 'grid-2x2',
    name: 'Grid 2x2',
    direction: 'grid',
    alignment: 'center',
    spacing: 'normal'
  },
  {
    id: 'compact-horizontal',
    name: 'Compact Row',
    direction: 'horizontal',
    alignment: 'justified',
    spacing: 'compact'
  }
]

// Size Variants
export const SIZE_VARIANTS: SizeVariant[] = [
  {
    id: 'small',
    name: 'Small',
    width: '250px',
    height: 'auto',
    scale: 0.8
  },
  {
    id: 'medium',
    name: 'Medium',
    width: '350px',
    height: 'auto',
    scale: 1.0
  },
  {
    id: 'large',
    name: 'Large',
    width: '500px',
    height: 'auto',
    scale: 1.2
  },
  {
    id: 'full-width',
    name: 'Full Width',
    width: '100%',
    height: 'auto',
    scale: 1.0
  }
]

// Animation Options
export const ANIMATION_OPTIONS: AnimationOption[] = [
  {
    id: 'none',
    name: 'None',
    type: 'entrance',
    duration: 0,
    easing: 'ease',
    cssClass: ''
  },
  {
    id: 'fade-in',
    name: 'Fade In',
    type: 'entrance',
    duration: 500,
    easing: 'ease-in-out',
    cssClass: 'animate-fade-in'
  },
  {
    id: 'slide-up',
    name: 'Slide Up',
    type: 'entrance',
    duration: 600,
    easing: 'ease-out',
    cssClass: 'animate-slide-up'
  },
  {
    id: 'scale-in',
    name: 'Scale In',
    type: 'entrance',
    duration: 400,
    easing: 'ease-back',
    cssClass: 'animate-scale-in'
  },
  {
    id: 'hover-lift',
    name: 'Hover Lift',
    type: 'hover',
    duration: 200,
    easing: 'ease-out',
    cssClass: 'hover-lift'
  }
]