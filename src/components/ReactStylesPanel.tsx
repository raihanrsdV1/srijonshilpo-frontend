import React from 'react'
import { CONTENT_SETTINGS } from './settings/content'
import { ECOMMERCE_SETTINGS } from './settings/ecommerce'
import { SettingField } from './settings/types'
import { SettingIcon } from './settings/SettingIcon'

interface ReactStylesPanelProps {
  editor: any
  selectedComponent: any
  onSettingsChange?: (settings: Record<string, any>) => void
}

// Define which groups are style-related
const STYLE_GROUPS = ['style', 'dimensions', 'layout', 'appearance']

const ReactStylesPanel: React.FC<ReactStylesPanelProps> = ({ 
  editor, 
  selectedComponent, 
  onSettingsChange 
}) => {
  if (!selectedComponent) {
    return (
      <div className="w-full h-full flex items-center justify-center p-8">
        <div className="text-center">
          <div className="mb-4 opacity-50">
            <svg 
              width="48" 
              height="48" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className="mx-auto"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
          <p className="text-slate-400 text-sm">Select an element to edit its styles</p>
        </div>
      </div>
    )
  }

  const componentType = selectedComponent.get('type')
  const tagName = selectedComponent.get('tagName')
  
  // Get style-related settings for this component
  const getAllSettings = (): SettingField[] => {
    const allSettings: SettingField[] = []
    
    // Check content settings
    if (CONTENT_SETTINGS[componentType]) {
      allSettings.push(...CONTENT_SETTINGS[componentType])
    }
    if (CONTENT_SETTINGS[tagName]) {
      allSettings.push(...CONTENT_SETTINGS[tagName])
    }
    
    // Check e-commerce settings
    if (ECOMMERCE_SETTINGS[componentType]) {
      allSettings.push(...ECOMMERCE_SETTINGS[componentType])
    }
    
    return allSettings.filter(setting => 
      STYLE_GROUPS.includes(setting.group || '')
    )
  }

  const styleSettings = getAllSettings()

  // Group settings by their group property
  const groupedSettings = styleSettings.reduce((acc, setting) => {
    const group = setting.group || 'general'
    if (!acc[group]) acc[group] = []
    acc[group].push(setting)
    return acc
  }, {} as Record<string, SettingField[]>)

  const handleFieldChange = (fieldName: string, value: any) => {
    if (!selectedComponent) return

    try {
      // Apply the change to the component
      selectedComponent.set(fieldName, value)
      
      // Trigger re-render if needed
      if (editor) {
        editor.trigger('component:update', selectedComponent)
      }
      
      // Notify parent
      if (onSettingsChange) {
        const currentSettings = selectedComponent.getAttributes()
        onSettingsChange({ ...currentSettings, [fieldName]: value })
      }
    } catch (error) {
      console.error('Error updating component style:', error)
    }
  }

  const renderField = (field: SettingField) => {
    const currentValue = selectedComponent.get(field.name) || field.defaultValue

    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            value={currentValue || ''}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
          />
        )

      case 'number':
        return (
          <input
            type="number"
            value={currentValue || ''}
            onChange={(e) => handleFieldChange(field.name, parseInt(e.target.value) || 0)}
            min={field.min}
            max={field.max}
            placeholder={field.placeholder}
            className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
          />
        )

      case 'color':
        return (
          <div className="flex gap-2">
            <input
              type="color"
              value={currentValue || '#000000'}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              className="w-12 h-9 bg-gray-800/50 border border-gray-600/50 rounded-lg cursor-pointer"
            />
            <input
              type="text"
              value={currentValue || ''}
              onChange={(e) => handleFieldChange(field.name, e.target.value)}
              placeholder="#000000"
              className="flex-1 px-3 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
            />
          </div>
        )

      case 'select':
        return (
          <select
            value={currentValue || ''}
            onChange={(e) => handleFieldChange(field.name, e.target.value)}
            className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600/50 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
          >
            <option value="">Select...</option>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.name}
              </option>
            ))}
          </select>
        )

      case 'checkbox':
        return (
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={!!currentValue}
              onChange={(e) => handleFieldChange(field.name, e.target.checked)}
              className="sr-only peer"
            />
            <div className="relative w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-blue-600 peer-checked:shadow-lg peer-checked:shadow-blue-500/25"></div>
          </label>
        )

      default:
        return null
    }
  }

  const getGroupDisplayName = (groupKey: string) => {
    const groupNames: Record<string, string> = {
      style: 'Style',
      dimensions: 'Dimensions', 
      layout: 'Layout',
      appearance: 'Appearance',
      general: 'General'
    }
    return groupNames[groupKey] || groupKey.charAt(0).toUpperCase() + groupKey.slice(1)
  }

  const getGroupIcon = (groupKey: string) => {
    const groupIcons: Record<string, string> = {
      style: 'sparkles',
      dimensions: 'ruler',
      layout: 'group',
      appearance: 'eye',
      general: 'config'
    }
    return groupIcons[groupKey] || 'config'
  }

  if (styleSettings.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center p-8">
        <div className="text-center">
          <div className="mb-4 opacity-50">
            <svg 
              width="48" 
              height="48" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className="mx-auto"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
          <p className="text-slate-400 text-sm">No style options available for this element</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full bg-gradient-to-b from-slate-900 to-slate-800 overflow-y-auto">
      <div className="p-3 space-y-4">
        {Object.entries(groupedSettings).map(([groupKey, fields]) => (
          <div key={groupKey} className="bg-slate-800/60 backdrop-blur-sm rounded-lg border border-slate-700/50 shadow-lg shadow-black/20">
            <div className="px-3 py-2 bg-gradient-to-r from-slate-700/80 to-slate-600/80 rounded-t-lg border-b border-slate-600/50">
              <h3 className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                <SettingIcon icon={getGroupIcon(groupKey)} size={14} />
                {getGroupDisplayName(groupKey)}
              </h3>
            </div>
            <div className="p-3 space-y-3">
              {fields.map((field) => (
                <div key={field.name} className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-xs font-medium text-slate-300">
                    <SettingIcon icon={field.icon || 'config'} size={12} />
                    {field.label}
                  </label>
                  {renderField(field)}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ReactStylesPanel