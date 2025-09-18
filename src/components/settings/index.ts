import { SettingField, SettingGroup } from './types'
import { ECOMMERCE_SETTINGS } from './ecommerce'
import { CONTENT_SETTINGS } from './content'
import { BASIC_SETTINGS } from './basic'

// Combine all settings
export const ALL_SETTINGS: Record<string, SettingField[]> = {
  ...ECOMMERCE_SETTINGS,
  ...CONTENT_SETTINGS,
  ...BASIC_SETTINGS
}

// Group definitions for UI organization
export const SETTING_GROUPS: Record<string, SettingGroup> = {
  content: {
    name: 'Content',
    icon: '📝',
    fields: []
  },
  media: {
    name: 'Media',
    icon: '🖼️',
    fields: []
  },
  layout: {
    name: 'Layout',
    icon: '📐',
    fields: []
  },
  style: {
    name: 'Style',
    icon: '🎨',
    fields: []
  },
  typography: {
    name: 'Typography',
    icon: '🔤',
    fields: []
  },
  configuration: {
    name: 'Configuration',
    icon: '⚙️',
    fields: []
  },
  display: {
    name: 'Display',
    icon: '👁️',
    fields: []
  },
  features: {
    name: 'Features',
    icon: '✨',
    fields: []
  },
  dimensions: {
    name: 'Dimensions',
    icon: '📏',
    fields: []
  },
  attributes: {
    name: 'Attributes',
    icon: '🏷️',
    fields: []
  },
  product: {
    name: 'Product',
    icon: '📦',
    fields: []
  },
  rating: {
    name: 'Rating',
    icon: '⭐',
    fields: []
  },
  badge: {
    name: 'Badge',
    icon: '🏷️',
    fields: []
  },
  cta: {
    name: 'Call to Action',
    icon: '🎯',
    fields: []
  },
  navigation: {
    name: 'Navigation',
    icon: '🧭',
    fields: []
  },
  animation: {
    name: 'Animation',
    icon: '🎬',
    fields: []
  },
  playback: {
    name: 'Playback',
    icon: '▶️',
    fields: []
  }
}

// Function to group fields by their group property
export const groupFieldsByGroup = (fields: SettingField[]): Record<string, SettingField[]> => {
  const grouped: Record<string, SettingField[]> = {}
  
  fields.forEach(field => {
    const group = field.group || 'general'
    if (!grouped[group]) {
      grouped[group] = []
    }
    grouped[group].push(field)
  })
  
  return grouped
}

// Function to get settings for a component
export const getComponentSettings = (smartObjectId?: string, componentType?: string): SettingField[] => {
  // Try smart object settings first
  if (smartObjectId && ALL_SETTINGS[smartObjectId]) {
    return ALL_SETTINGS[smartObjectId]
  }
  
  // Try basic component type
  if (componentType && ALL_SETTINGS[componentType]) {
    return ALL_SETTINGS[componentType]
  }
  
  // Return default settings
  return ALL_SETTINGS.default || []
}

export { ECOMMERCE_SETTINGS, CONTENT_SETTINGS, BASIC_SETTINGS }
export * from './types'
