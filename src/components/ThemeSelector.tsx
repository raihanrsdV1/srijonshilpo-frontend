import React, { useState } from 'react'

interface Theme {
  id: string
  name: string
  description: string
  preview: string
  category: string
  colors: {
    primary: string
    secondary: string
    accent: string
  }
}

interface ThemeSelectorProps {
  onSelectTheme: (theme: Theme) => void
  currentTheme?: Theme
}

const predefinedThemes: Theme[] = [
  {
    id: 'modern-business',
    name: 'Modern Business',
    description: 'Clean and professional design for business websites',
    preview: '🏢',
    category: 'Business',
    colors: {
      primary: '#3B82F6',
      secondary: '#1F2937',
      accent: '#10B981'
    }
  },
  {
    id: 'ecommerce-minimal',
    name: 'E-commerce Minimal',
    description: 'Minimalist design perfect for online stores',
    preview: '🛍️',
    category: 'E-commerce',
    colors: {
      primary: '#EC4899',
      secondary: '#374151',
      accent: '#F59E0B'
    }
  },
  {
    id: 'creative-portfolio',
    name: 'Creative Portfolio',
    description: 'Bold and artistic design for creative professionals',
    preview: '🎨',
    category: 'Portfolio',
    colors: {
      primary: '#8B5CF6',
      secondary: '#1F2937',
      accent: '#EF4444'
    }
  },
  {
    id: 'restaurant-warm',
    name: 'Restaurant Warm',
    description: 'Warm and inviting design for restaurants and cafes',
    preview: '🍽️',
    category: 'Restaurant',
    colors: {
      primary: '#F97316',
      secondary: '#92400E',
      accent: '#FEF3C7'
    }
  },
  {
    id: 'tech-startup',
    name: 'Tech Startup',
    description: 'Modern and innovative design for tech companies',
    preview: '💻',
    category: 'Technology',
    colors: {
      primary: '#06B6D4',
      secondary: '#0F172A',
      accent: '#84CC16'
    }
  },
  {
    id: 'fashion-elegant',
    name: 'Fashion Elegant',
    description: 'Sophisticated design for fashion and luxury brands',
    preview: '👗',
    category: 'Fashion',
    colors: {
      primary: '#EC4899',
      secondary: '#111827',
      accent: '#D1D5DB'
    }
  },
  {
    id: 'healthcare-trust',
    name: 'Healthcare Trust',
    description: 'Clean and trustworthy design for healthcare services',
    preview: '🏥',
    category: 'Healthcare',
    colors: {
      primary: '#059669',
      secondary: '#1F2937',
      accent: '#3B82F6'
    }
  },
  {
    id: 'education-friendly',
    name: 'Education Friendly',
    description: 'Friendly and approachable design for educational websites',
    preview: '📚',
    category: 'Education',
    colors: {
      primary: '#7C3AED',
      secondary: '#374151',
      accent: '#F59E0B'
    }
  }
]

export default function ThemeSelector({ onSelectTheme, currentTheme }: ThemeSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All')
  const [showPreview, setShowPreview] = useState<string | null>(null)

  const categories = ['All', ...Array.from(new Set(predefinedThemes.map(t => t.category)))]
  
  const filteredThemes = selectedCategory === 'All' 
    ? predefinedThemes 
    : predefinedThemes.filter(t => t.category === selectedCategory)

  const generateThemeCSS = (theme: Theme) => {
    return `
      :root {
        --primary-color: ${theme.colors.primary};
        --secondary-color: ${theme.colors.secondary};
        --accent-color: ${theme.colors.accent};
      }
      
      .theme-preview {
        background: linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary});
        color: white;
        padding: 20px;
        border-radius: 8px;
        margin-bottom: 10px;
      }
      
      .theme-accent {
        background-color: ${theme.colors.accent};
        color: ${theme.colors.secondary};
        padding: 5px 10px;
        border-radius: 4px;
        display: inline-block;
        margin-top: 10px;
      }
    `
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Choose a Theme</h3>
        <p className="text-sm text-gray-600">
          Select a pre-designed theme to get started quickly. You can customize colors and layout later.
        </p>
        
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                selectedCategory === category
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Theme Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredThemes.map(theme => (
          <div
            key={theme.id}
            className={`relative bg-white border-2 rounded-lg overflow-hidden cursor-pointer transition-all ${
              currentTheme?.id === theme.id
                ? 'border-primary shadow-lg'
                : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
            }`}
            onClick={() => onSelectTheme(theme)}
            onMouseEnter={() => setShowPreview(theme.id)}
            onMouseLeave={() => setShowPreview(null)}
          >
            {/* Theme Preview */}
            <div
              className="h-32 flex items-center justify-center text-4xl"
              style={{
                background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.secondary})`
              }}
            >
              {theme.preview}
            </div>
            
            {/* Theme Info */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{theme.name}</h4>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                  {theme.category}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3">{theme.description}</p>
              
              {/* Color Palette */}
              <div className="flex space-x-2">
                <div
                  className="w-4 h-4 rounded-full border border-gray-300"
                  style={{ backgroundColor: theme.colors.primary }}
                  title="Primary Color"
                />
                <div
                  className="w-4 h-4 rounded-full border border-gray-300"
                  style={{ backgroundColor: theme.colors.secondary }}
                  title="Secondary Color"
                />
                <div
                  className="w-4 h-4 rounded-full border border-gray-300"
                  style={{ backgroundColor: theme.colors.accent }}
                  title="Accent Color"
                />
              </div>
            </div>

            {/* Selection Indicator */}
            {currentTheme?.id === theme.id && (
              <div className="absolute top-2 right-2 bg-primary text-white rounded-full w-6 h-6 flex items-center justify-center">
                ✓
              </div>
            )}

            {/* Hover Preview */}
            {showPreview === theme.id && (
              <div className="absolute inset-0 bg-black bg-opacity-75 flex items-center justify-center">
                <div className="bg-white rounded-lg p-4 m-4 max-w-xs">
                  <style dangerouslySetInnerHTML={{ __html: generateThemeCSS(theme) }} />
                  <div className="theme-preview">
                    <h5 className="font-bold">Sample Header</h5>
                    <p className="text-sm opacity-90">This is how your content will look</p>
                    <div className="theme-accent">Call to Action</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Custom Theme Option */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
        <div className="text-2xl mb-2">⚙️</div>
        <h4 className="font-medium text-gray-900 mb-2">Start from Scratch</h4>
        <p className="text-sm text-gray-600 mb-4">
          Create a completely custom design with full control over every element
        </p>
        <button
          onClick={() => onSelectTheme({
            id: 'custom',
            name: 'Custom Theme',
            description: 'Build your own unique design',
            preview: '⚙️',
            category: 'Custom',
            colors: {
              primary: '#3B82F6',
              secondary: '#1F2937',
              accent: '#10B981'
            }
          })}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Choose Custom
        </button>
      </div>
    </div>
  )
}
