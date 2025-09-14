import React, { useState, useEffect } from 'react'
import { SmartObjectTemplate, ColorScheme, LayoutVariant, SizeVariant, AnimationOption } from '../types/smartObjects'

interface SmartObjectCustomizerProps {
  template: SmartObjectTemplate
  selectedComponent: any
  onCustomizationChange: (property: string, value: any) => void
}

type CustomizationLevel = 'quick' | 'advanced' | 'developer'

const SmartObjectCustomizer: React.FC<SmartObjectCustomizerProps> = ({
  template,
  selectedComponent,
  onCustomizationChange
}) => {
  const [customizationLevel, setCustomizationLevel] = useState<CustomizationLevel>('quick')
  const [activeSection, setActiveSection] = useState<string>('appearance')

  // Quick customization handlers
  const handleColorSchemeChange = (colorScheme: ColorScheme) => {
    onCustomizationChange('colorScheme', colorScheme)
  }

  const handleLayoutChange = (layout: LayoutVariant) => {
    onCustomizationChange('layout', layout)
  }

  const handleSizeChange = (size: SizeVariant) => {
    onCustomizationChange('size', size)
  }

  const handleAnimationChange = (animation: AnimationOption) => {
    onCustomizationChange('animation', animation)
  }

  // Advanced customization handlers
  const handleAdvancedChange = (section: string, property: string, value: any) => {
    onCustomizationChange(`${section}.${property}`, value)
  }

  return (
    <div className="smart-object-customizer">
      {/* Customization Level Tabs */}
      <div className="customization-tabs">
        <button
          className={`tab ${customizationLevel === 'quick' ? 'active' : ''}`}
          onClick={() => setCustomizationLevel('quick')}
        >
          <span className="tab-icon">⚡</span>
          Quick
        </button>
        <button
          className={`tab ${customizationLevel === 'advanced' ? 'active' : ''}`}
          onClick={() => setCustomizationLevel('advanced')}
        >
          <span className="tab-icon">🔧</span>
          Advanced
        </button>
        <button
          className={`tab ${customizationLevel === 'developer' ? 'active' : ''}`}
          onClick={() => setCustomizationLevel('developer')}
        >
          <span className="tab-icon">👩‍💻</span>
          Developer
        </button>
      </div>

      {/* Quick Customization */}
      {customizationLevel === 'quick' && (
        <div className="quick-customization">
          <h3>Quick Customization</h3>
          <p className="description">Easy drag-and-drop styling with pre-made options</p>

          {/* Color Schemes */}
          <div className="customization-section">
            <h4>Color Scheme</h4>
            <div className="color-scheme-grid">
              {template.quickCustomization.colorSchemes.map((scheme) => (
                <div
                  key={scheme.id}
                  className="color-scheme-option"
                  onClick={() => handleColorSchemeChange(scheme)}
                >
                  <div className="color-preview">
                    <div 
                      className="color-dot primary" 
                      style={{ backgroundColor: scheme.primary }}
                    />
                    <div 
                      className="color-dot secondary" 
                      style={{ backgroundColor: scheme.secondary }}
                    />
                    <div 
                      className="color-dot accent" 
                      style={{ backgroundColor: scheme.accent }}
                    />
                  </div>
                  <span className="scheme-name">{scheme.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Layout Options */}
          {template.quickCustomization.layouts && (
            <div className="customization-section">
              <h4>Layout</h4>
              <div className="layout-options">
                {template.quickCustomization.layouts.map((layout) => (
                  <button
                    key={layout.id}
                    className="layout-option"
                    onClick={() => handleLayoutChange(layout)}
                  >
                    <div className={`layout-preview layout-${layout.direction}`}>
                      <div className="layout-element"></div>
                      <div className="layout-element"></div>
                      <div className="layout-element"></div>
                    </div>
                    <span>{layout.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Size Options */}
          <div className="customization-section">
            <h4>Size</h4>
            <div className="size-options">
              {template.quickCustomization.sizes.map((size) => (
                <button
                  key={size.id}
                  className="size-option"
                  onClick={() => handleSizeChange(size)}
                >
                  <div 
                    className="size-preview" 
                    style={{ 
                      width: `${size.scale * 40}px`, 
                      height: `${size.scale * 30}px` 
                    }}
                  />
                  <span>{size.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Animation Options */}
          <div className="customization-section">
            <h4>Animation</h4>
            <div className="animation-options">
              {template.quickCustomization.animations.map((animation) => (
                <button
                  key={animation.id}
                  className="animation-option"
                  onClick={() => handleAnimationChange(animation)}
                >
                  <div className={`animation-preview animation-${animation.type}`}>
                    <div className="animation-element"></div>
                  </div>
                  <span>{animation.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Advanced Customization */}
      {customizationLevel === 'advanced' && (
        <div className="advanced-customization">
          <h3>Advanced Customization</h3>
          <p className="description">Fine-tune styling with precise controls</p>

          {/* Section Tabs */}
          <div className="section-tabs">
            <button
              className={`section-tab ${activeSection === 'appearance' ? 'active' : ''}`}
              onClick={() => setActiveSection('appearance')}
            >
              🎨 Appearance
            </button>
            <button
              className={`section-tab ${activeSection === 'spacing' ? 'active' : ''}`}
              onClick={() => setActiveSection('spacing')}
            >
              📏 Spacing
            </button>
            <button
              className={`section-tab ${activeSection === 'typography' ? 'active' : ''}`}
              onClick={() => setActiveSection('typography')}
            >
              📝 Typography
            </button>
            <button
              className={`section-tab ${activeSection === 'effects' ? 'active' : ''}`}
              onClick={() => setActiveSection('effects')}
            >
              ✨ Effects
            </button>
          </div>

          {/* Advanced Controls */}
          <div className="advanced-controls">
            {activeSection === 'spacing' && template.advancedCustomization.spacing && (
              <div className="control-group">
                <label>Spacing</label>
                <input
                  type="range"
                  min={template.advancedCustomization.spacing.min}
                  max={template.advancedCustomization.spacing.max}
                  step={template.advancedCustomization.spacing.step}
                  defaultValue={template.advancedCustomization.spacing.default}
                  onChange={(e) => handleAdvancedChange('spacing', 'value', parseInt(e.target.value))}
                />
                <span className="unit">{template.advancedCustomization.spacing.unit}</span>
              </div>
            )}

            {activeSection === 'typography' && template.advancedCustomization.typography && (
              <div className="typography-controls">
                <div className="control-group">
                  <label>Font Family</label>
                  <select onChange={(e) => handleAdvancedChange('typography', 'fontFamily', e.target.value)}>
                    {template.advancedCustomization.typography.fontFamily.map((font) => (
                      <option key={font} value={font}>{font}</option>
                    ))}
                  </select>
                </div>

                <div className="control-group">
                  <label>Font Size</label>
                  <input
                    type="range"
                    min={template.advancedCustomization.typography.fontSize.min}
                    max={template.advancedCustomization.typography.fontSize.max}
                    step={template.advancedCustomization.typography.fontSize.step}
                    defaultValue={template.advancedCustomization.typography.fontSize.default}
                    onChange={(e) => handleAdvancedChange('typography', 'fontSize', parseInt(e.target.value))}
                  />
                  <span className="unit">{template.advancedCustomization.typography.fontSize.unit}</span>
                </div>

                <div className="control-group">
                  <label>Font Weight</label>
                  <select onChange={(e) => handleAdvancedChange('typography', 'fontWeight', parseInt(e.target.value))}>
                    {template.advancedCustomization.typography.fontWeight.map((weight) => (
                      <option key={weight} value={weight}>{weight}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {activeSection === 'effects' && template.advancedCustomization.shadows && (
              <div className="effects-controls">
                <div className="control-group">
                  <label>Shadow Preset</label>
                  <select onChange={(e) => handleAdvancedChange('shadows', 'preset', e.target.value)}>
                    {template.advancedCustomization.shadows.presets.map((preset) => (
                      <option key={preset} value={preset}>{preset}</option>
                    ))}
                  </select>
                </div>

                <div className="control-group">
                  <label>Shadow Blur</label>
                  <input
                    type="range"
                    min={template.advancedCustomization.shadows.custom.blur.min}
                    max={template.advancedCustomization.shadows.custom.blur.max}
                    step={template.advancedCustomization.shadows.custom.blur.step}
                    defaultValue={template.advancedCustomization.shadows.custom.blur.default}
                    onChange={(e) => handleAdvancedChange('shadows', 'blur', parseInt(e.target.value))}
                  />
                  <span className="unit">{template.advancedCustomization.shadows.custom.blur.unit}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Developer Mode */}
      {customizationLevel === 'developer' && (
        <div className="developer-customization">
          <h3>Developer Mode</h3>
          <p className="description">Full access to CSS and JavaScript customization</p>
          
          <div className="developer-warning">
            <span className="warning-icon">⚠️</span>
            <span>Developer mode provides full customization access. Changes may affect component functionality.</span>
          </div>

          <div className="code-editor-section">
            <h4>Custom CSS</h4>
            <textarea
              className="code-editor"
              placeholder="Enter custom CSS for this component..."
              rows={10}
              onChange={(e) => handleAdvancedChange('developer', 'customCSS', e.target.value)}
            />
          </div>

          <div className="code-editor-section">
            <h4>Custom JavaScript</h4>
            <textarea
              className="code-editor"
              placeholder="Enter custom JavaScript for this component..."
              rows={8}
              onChange={(e) => handleAdvancedChange('developer', 'customJS', e.target.value)}
            />
          </div>

          <div className="developer-actions">
            <button className="apply-button">Apply Changes</button>
            <button className="reset-button">Reset to Default</button>
          </div>
        </div>
      )}
    </div>
  )
}

export default SmartObjectCustomizer