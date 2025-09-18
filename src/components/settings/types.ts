// Base types for settings
export interface SettingField {
  type: 'text' | 'number' | 'textarea' | 'select' | 'checkbox' | 'color' | 'image-asset'
  name: string
  label: string
  value?: any
  defaultValue?: any
  options?: Array<{ value: string, name: string }>
  min?: number
  max?: number
  step?: number
  placeholder?: string
  icon?: string
  group?: string
}

export interface ComponentSettings {
  componentId: string
  componentType: string
  smartObjectId?: string
  fields: SettingField[]
}

export interface SettingGroup {
  name: string
  icon: string
  fields: SettingField[]
}
