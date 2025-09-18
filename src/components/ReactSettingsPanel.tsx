import React, { useState, useEffect, useCallback } from 'react'
import { Editor, Component } from 'grapesjs'
import { SettingField, ComponentSettings, getComponentSettings, groupFieldsByGroup, SETTING_GROUPS } from './settings'
import SettingIcon from './settings/SettingIcon'

// Debug mode flag
const DEBUG_MODE = true

// Define which groups are style-related (should be shown in Styles tab)
const STYLE_GROUPS = ['style', 'dimensions', 'layout', 'appearance']

const debugLog = (...args: any[]) => {
  if (DEBUG_MODE) {
    console.log('⚙️ [ReactSettingsPanel]', ...args)
  }
}

const debugWarn = (...args: any[]) => {
  if (DEBUG_MODE) {
    console.warn('⚠️ [ReactSettingsPanel]', ...args)
  }
}

const debugError = (...args: any[]) => {
  if (DEBUG_MODE) {
    console.error('❌ [ReactSettingsPanel]', ...args)
  }
}

interface ReactSettingsPanelProps {
  editor: Editor | null
  selectedComponent: Component | null
  onSettingsChange?: (settings: Record<string, any>) => void
}

// Individual field components with modern styling and SVG icons
const TextFieldComponent: React.FC<{ field: SettingField; value: any; onChange: (value: any) => void }> = ({ field, value, onChange }) => (
  <div className="space-y-1">
    <label className="flex items-center text-xs text-slate-300">
      <SettingIcon icon={field.icon || 'config'} className="mr-2 text-slate-400" size={12} />
      {field.label}
    </label>
    <input
      type="text"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={field.placeholder}
      className="w-full px-2 py-1 bg-slate-700/50 border border-slate-600/50 rounded text-slate-200 text-xs placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
    />
  </div>
)

const NumberFieldComponent: React.FC<{ field: SettingField; value: any; onChange: (value: any) => void }> = ({ field, value, onChange }) => (
  <div className="space-y-1">
    <label className="flex items-center text-xs text-slate-300">
      <SettingIcon icon={field.icon || 'config'} className="mr-2 text-slate-400" size={12} />
      {field.label}
    </label>
    <input
      type="number"
      value={value || ''}
      onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
      min={field.min}
      max={field.max}
      step={field.step}
      placeholder={field.placeholder}
      className="w-full px-2 py-1 bg-slate-700/50 border border-slate-600/50 rounded text-slate-200 text-xs placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
    />
  </div>
)

const TextareaFieldComponent: React.FC<{ field: SettingField; value: any; onChange: (value: any) => void }> = ({ field, value, onChange }) => (
  <div className="space-y-1">
    <label className="flex items-center text-xs text-slate-300">
      <SettingIcon icon={field.icon || 'config'} className="mr-2 text-slate-400" size={12} />
      {field.label}
    </label>
    <textarea
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={field.placeholder}
      rows={3}
      className="w-full px-2 py-1 bg-slate-700/50 border border-slate-600/50 rounded text-slate-200 text-xs placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 resize-vertical"
    />
  </div>
)

const SelectFieldComponent: React.FC<{ field: SettingField; value: any; onChange: (value: any) => void }> = ({ field, value, onChange }) => (
  <div className="space-y-1">
    <label className="flex items-center text-xs text-slate-300">
      <SettingIcon icon={field.icon || 'config'} className="mr-2 text-slate-400" size={12} />
      {field.label}
    </label>
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-2 py-1 bg-slate-700/50 border border-slate-600/50 rounded text-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
    >
      <option value="">Select option...</option>
      {field.options?.map((option) => (
        <option key={option.value} value={option.value}>
          {option.name}
        </option>
      ))}
    </select>
  </div>
)

const CheckboxFieldComponent: React.FC<{ field: SettingField; value: any; onChange: (value: any) => void }> = ({ field, value, onChange }) => (
  <div className="flex items-center justify-between py-1">
    <div className="flex items-center text-xs text-slate-300">
      <SettingIcon icon={field.icon || 'config'} className="mr-2 text-slate-400" size={12} />
      {field.label}
    </div>
    <button
      onClick={() => onChange(!value)}
      className={`
        relative px-3 py-1 rounded-md text-xs font-medium transition-all duration-300
        ${value 
          ? 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-300 border border-blue-500/50 shadow-md shadow-blue-500/25 hover:shadow-lg hover:shadow-blue-500/40' 
          : 'bg-slate-700/50 text-slate-400 border border-slate-600/50 hover:bg-slate-600/50 hover:text-slate-300'
        }
      `}
    >
      {value ? 'ON' : 'OFF'}
      {value && (
        <div className="absolute inset-0 rounded-md bg-gradient-to-r from-blue-500/10 to-cyan-500/10 animate-pulse" />
      )}
    </button>
  </div>
)

const ColorFieldComponent: React.FC<{ field: SettingField; value: any; onChange: (value: any) => void }> = ({ field, value, onChange }) => (
  <div className="space-y-1">
    <label className="flex items-center text-xs text-slate-300">
      <SettingIcon icon={field.icon || 'config'} className="mr-2 text-slate-400" size={12} />
      {field.label}
    </label>
    <div className="flex items-center space-x-2">
      <div className="relative">
        <input
          type="color"
          value={value || '#000000'}
          onChange={(e) => onChange(e.target.value)}
          className="w-8 h-8 border border-slate-600/50 rounded cursor-pointer bg-slate-700/50 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
        />
        <div className="absolute inset-1 rounded pointer-events-none" style={{ backgroundColor: value || '#000000' }} />
      </div>
      <input
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder="#000000"
        className="flex-1 px-2 py-1 bg-slate-700/50 border border-slate-600/50 rounded text-slate-200 text-xs placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
      />
    </div>
  </div>
)

const ImageAssetFieldComponent: React.FC<{ field: SettingField; value: any; onChange: (value: any) => void }> = ({ field, value, onChange }) => (
  <div className="space-y-1">
    <label className="flex items-center text-xs text-slate-300">
      <SettingIcon icon={field.icon || 'config'} className="mr-2 text-slate-400" size={12} />
      {field.label}
    </label>
    <div className="space-y-2">
      <input
        type="url"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter image URL or select asset"
        className="w-full px-2 py-1 bg-slate-700/50 border border-slate-600/50 rounded text-slate-200 text-xs placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
      />
      <button
        type="button"
        onClick={() => {
          // TODO: Integrate with asset manager
          const url = prompt('Enter image URL:')
          if (url) onChange(url)
        }}
        className="w-full px-2 py-1 bg-slate-600/50 hover:bg-slate-600/70 border border-slate-500/50 rounded text-slate-300 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-500/50 transition-all duration-200"
      >
        Select from Assets
      </button>
      {value && (
        <div className="mt-2 p-1 border border-slate-600/50 rounded bg-slate-800/50">
          <img src={value} alt="Preview" className="w-full h-16 object-cover rounded border border-slate-600/50" />
        </div>
      )}
    </div>
  </div>
)

// Field renderer component
const FieldRenderer: React.FC<{ field: SettingField; value: any; onChange: (value: any) => void }> = ({ field, value, onChange }) => {
  switch (field.type) {
    case 'text':
      return <TextFieldComponent field={field} value={value} onChange={onChange} />
    case 'number':
      return <NumberFieldComponent field={field} value={value} onChange={onChange} />
    case 'textarea':
      return <TextareaFieldComponent field={field} value={value} onChange={onChange} />
    case 'select':
      return <SelectFieldComponent field={field} value={value} onChange={onChange} />
    case 'checkbox':
      return <CheckboxFieldComponent field={field} value={value} onChange={onChange} />
    case 'color':
      return <ColorFieldComponent field={field} value={value} onChange={onChange} />
    case 'image-asset':
      return <ImageAssetFieldComponent field={field} value={value} onChange={onChange} />
    default:
      return <div className="text-red-500 text-sm">Unknown field type: {field.type}</div>
  }
}

export const ReactSettingsPanel: React.FC<ReactSettingsPanelProps> = ({ 
  editor, 
  selectedComponent, 
  onSettingsChange 
}) => {
  const [settings, setSettings] = useState<ComponentSettings | null>(null)
  const [values, setValues] = useState<Record<string, any>>({})

  // Extract component information and determine settings
  const extractComponentSettings = useCallback((component: Component): ComponentSettings | null => {
    if (!component) return null

    const componentId = component.getId() || component.cid
    const componentType = component.get('type') || 'unknown'
    const smartObjectId = component.get('attributes')?.['data-smart-object-id'] || 
                          component.get('attributes')?.['data-smart-object']

    debugLog('Extracting settings for component:', {
      componentId,
      componentType,
      smartObjectId,
      attributes: component.get('attributes')
    })

    // Get fields using the new settings system
    const allFields = getComponentSettings(smartObjectId, componentType)
    // Filter out style-related fields (they go to the Styles tab)
    const fields = allFields.filter(field => !STYLE_GROUPS.includes(field.group || ''))
    debugLog('Using non-style settings for:', smartObjectId || componentType, fields)

    return {
      componentId,
      componentType,
      smartObjectId,
      fields
    }
  }, [])

  // Extract current values from component
  const extractComponentValues = useCallback((component: Component, fields: SettingField[]): Record<string, any> => {
    if (!component) return {}

    const values: Record<string, any> = {}
    const attributes = component.get('attributes') || {}
    const traits = component.get('traits')

    // Try to get values from traits first, then attributes
    fields.forEach(field => {
      let value = undefined

      // Check traits collection
      if (traits && traits.models) {
        const trait = traits.models.find((t: any) => t.get('name') === field.name)
        if (trait) {
          value = trait.get('value')
        }
      }

      // Fallback to attributes with common prefixes
      if (value === undefined) {
        const attrKeys = [
          `data-${field.name.replace(/([A-Z])/g, '-$1').toLowerCase()}`,
          `data-${field.name}`,
          field.name
        ]
        
        for (const key of attrKeys) {
          if (attributes[key] !== undefined) {
            value = attributes[key]
            break
          }
        }
      }

      // Handle boolean values from strings
      if (field.type === 'checkbox' && typeof value === 'string') {
        value = value === 'true' || value === '1'
      }

      // Handle number values from strings
      if (field.type === 'number' && typeof value === 'string') {
        const num = parseFloat(value)
        value = isNaN(num) ? 0 : num
      }

      values[field.name] = value
    })

    debugLog('Extracted component values:', values)
    return values
  }, [])

  // Update component when values change
  const updateComponent = useCallback((component: Component, fieldName: string, newValue: any) => {
    if (!component) return

    debugLog('Updating component field:', fieldName, 'to value:', newValue)

    try {
      // Update traits if they exist
      const traits = component.get('traits')
      if (traits && traits.models) {
        const trait = traits.models.find((t: any) => t.get('name') === fieldName)
        if (trait) {
          trait.set('value', newValue)
          debugLog('Updated trait:', fieldName, 'to:', newValue)
        }
      }

      // Update attributes as well
      const attributes = { ...component.get('attributes') }
      const attrKey = `data-${fieldName.replace(/([A-Z])/g, '-$1').toLowerCase()}`
      attributes[attrKey] = newValue
      component.set('attributes', attributes)

      // Trigger component update
      component.trigger('change:traits')
      component.view?.render()

      debugLog('Component updated successfully for field:', fieldName)

      // Notify parent component
      if (onSettingsChange) {
        onSettingsChange({ [fieldName]: newValue })
      }

    } catch (error) {
      debugError('Failed to update component:', error)
    }
  }, [onSettingsChange])

  // Handle field value changes
  const handleFieldChange = useCallback((fieldName: string, newValue: any) => {
    debugLog('Field change:', fieldName, '=', newValue)
    
    setValues(prev => ({
      ...prev,
      [fieldName]: newValue
    }))

    if (selectedComponent) {
      updateComponent(selectedComponent, fieldName, newValue)
    }
  }, [selectedComponent, updateComponent])

  // Update settings when component changes
  useEffect(() => {
    debugLog('Component selection changed:', selectedComponent)
    
    if (selectedComponent) {
      const componentSettings = extractComponentSettings(selectedComponent)
      if (componentSettings) {
        setSettings(componentSettings)
        const componentValues = extractComponentValues(selectedComponent, componentSettings.fields)
        setValues(componentValues)
      } else {
        setSettings(null)
        setValues({})
      }
    } else {
      setSettings(null)
      setValues({})
    }
  }, [selectedComponent, extractComponentSettings, extractComponentValues])

  if (!settings) {
    return (
      <div className="p-4 text-center text-gray-500">
        <div className="text-sm">No component selected</div>
        <div className="text-xs mt-1">Select an element to edit its properties</div>
      </div>
    )
  }

  // Group fields by their group property
  const groupedFields = groupFieldsByGroup(settings.fields)

  return (
    <div className="h-full bg-slate-900/95 text-slate-200 overflow-y-auto">
      <div className="p-3 space-y-3">
        {/* Settings Fields - Compact Layout */}
        {Object.entries(groupedFields).map(([groupKey, fields]) => {
          const group = SETTING_GROUPS[groupKey] || { name: groupKey, icon: 'config', fields: [] }
          return (
            <div key={groupKey}>
              {/* Compact Group Header */}
              <div className="flex items-center mb-2 text-xs font-medium text-slate-400 uppercase tracking-wider">
                <SettingIcon icon={group.icon} className="mr-2 text-blue-400" size={12} />
                {group.name}
              </div>
              
              {/* Compact Fields */}
              <div className="space-y-2 ml-4">
                {fields.map((field) => (
                  <FieldRenderer
                    key={field.name}
                    field={field}
                    value={values[field.name]}
                    onChange={(value) => handleFieldChange(field.name, value)}
                  />
                ))}
              </div>
            </div>
          )
        })}

        {/* Debug Info - Compact */}
        {DEBUG_MODE && (
          <details className="mt-4 text-xs border-t border-slate-700 pt-3">
            <summary className="cursor-pointer text-slate-400 hover:text-slate-300 flex items-center">
              <SettingIcon icon="bug" className="mr-1" size={10} />
              Debug
            </summary>
            <div className="mt-2 p-2 bg-slate-800/50 rounded text-xs space-y-1">
              <div><span className="text-slate-400">ID:</span> <span className="text-slate-300 font-mono">{settings.componentId}</span></div>
              <div><span className="text-slate-400">Object:</span> <span className="text-slate-300 font-mono">{settings.smartObjectId || 'None'}</span></div>
              <div><span className="text-slate-400">Type:</span> <span className="text-slate-300 font-mono">{settings.componentType}</span></div>
              <pre className="text-xs bg-slate-900/50 p-2 rounded mt-2 overflow-auto max-h-20">
                {JSON.stringify(values, null, 2)}
              </pre>
            </div>
          </details>
        )}
      </div>
    </div>
  )
}

export default ReactSettingsPanel