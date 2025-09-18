import { SettingField } from './types'

// Basic component settings with icons and groups
export const BASIC_SETTINGS: Record<string, SettingField[]> = {
  // Text Components
  'text': [
    // Content Group
    { 
      type: 'textarea', 
      name: 'content', 
      label: 'Text Content',
      placeholder: 'Enter your text',
      icon: 'text',
      group: 'content'
    },
    
    // Typography Group
    { 
      type: 'select', 
      name: 'fontSize', 
      label: 'Font Size',
      icon: 'text',
      group: 'typography',
      options: [
        { value: 'xs', name: 'Extra Small' },
        { value: 'sm', name: 'Small' },
        { value: 'base', name: 'Normal' },
        { value: 'lg', name: 'Large' },
        { value: 'xl', name: 'Extra Large' },
        { value: '2xl', name: '2X Large' }
      ]
    },
    { 
      type: 'select', 
      name: 'fontWeight', 
      label: 'Font Weight',
      icon: 'text',
      group: 'typography',
      options: [
        { value: 'normal', name: 'Normal' },
        { value: 'medium', name: 'Medium' },
        { value: 'semibold', name: 'Semi Bold' },
        { value: 'bold', name: 'Bold' }
      ]
    },
    { 
      type: 'select', 
      name: 'textAlign', 
      label: 'Text Alignment',
      icon: 'align',
      group: 'typography',
      options: [
        { value: 'left', name: 'Left' },
        { value: 'center', name: 'Center' },
        { value: 'right', name: 'Right' },
        { value: 'justify', name: 'Justify' }
      ]
    },
    { 
      type: 'color', 
      name: 'textColor', 
      label: 'Text Color',
      icon: 'color',
      group: 'typography'
    }
  ],

  // Image Components
  'image': [
    // Media Group
    { 
      type: 'image-asset', 
      name: 'src', 
      label: 'Image Source',
      icon: 'image',
      group: 'media'
    },
    { 
      type: 'text', 
      name: 'alt', 
      label: 'Alt Text',
      placeholder: 'Describe the image',
      icon: 'text',
      group: 'media'
    },
    { 
      type: 'text', 
      name: 'title', 
      label: 'Image Title',
      placeholder: 'Image title for tooltip',
      icon: 'text',
      group: 'media'
    },
    
    // Configuration Group
    { 
      type: 'select', 
      name: 'objectFit', 
      label: 'Object Fit',
      icon: 'fit',
      group: 'configuration',
      options: [
        { value: 'contain', name: 'Contain' },
        { value: 'cover', name: 'Cover' },
        { value: 'fill', name: 'Fill' },
        { value: 'scale-down', name: 'Scale Down' }
      ]
    },
    { 
      type: 'checkbox', 
      name: 'lazyLoad', 
      label: 'Lazy Loading',
      icon: 'lazy',
      group: 'configuration'
    }
  ],

  // Button Components
  'button': [
    // Content Group
    { 
      type: 'text', 
      name: 'text', 
      label: 'Button Text',
      placeholder: 'Click me',
      icon: 'button',
      group: 'content'
    },
    { 
      type: 'text', 
      name: 'href', 
      label: 'Link URL',
      placeholder: 'https://example.com',
      icon: 'link',
      group: 'content'
    },
    
    // Configuration Group
    { 
      type: 'select', 
      name: 'size', 
      label: 'Button Size',
      icon: 'size',
      group: 'configuration',
      options: [
        { value: 'sm', name: 'Small' },
        { value: 'md', name: 'Medium' },
        { value: 'lg', name: 'Large' },
        { value: 'xl', name: 'Extra Large' }
      ]
    },
    { 
      type: 'select', 
      name: 'variant', 
      label: 'Button Style',
      icon: 'style',
      group: 'configuration',
      options: [
        { value: 'primary', name: 'Primary' },
        { value: 'secondary', name: 'Secondary' },
        { value: 'outline', name: 'Outline' },
        { value: 'ghost', name: 'Ghost' }
      ]
    },
    { 
      type: 'checkbox', 
      name: 'disabled', 
      label: 'Disabled',
      icon: 'disabled',
      group: 'configuration'
    }
  ],

  // Container/Div Components
  'container': [
    // Layout Group
    { 
      type: 'select', 
      name: 'display', 
      label: 'Display',
      icon: 'layout',
      group: 'layout',
      options: [
        { value: 'block', name: 'Block' },
        { value: 'flex', name: 'Flex' },
        { value: 'grid', name: 'Grid' },
        { value: 'inline-block', name: 'Inline Block' }
      ]
    },
    { 
      type: 'select', 
      name: 'flexDirection', 
      label: 'Flex Direction',
      icon: 'direction',
      group: 'layout',
      options: [
        { value: 'row', name: 'Row' },
        { value: 'column', name: 'Column' },
        { value: 'row-reverse', name: 'Row Reverse' },
        { value: 'column-reverse', name: 'Column Reverse' }
      ]
    },
    { 
      type: 'select', 
      name: 'justifyContent', 
      label: 'Justify Content',
      icon: 'align',
      group: 'layout',
      options: [
        { value: 'flex-start', name: 'Start' },
        { value: 'center', name: 'Center' },
        { value: 'flex-end', name: 'End' },
        { value: 'space-between', name: 'Space Between' },
        { value: 'space-around', name: 'Space Around' }
      ]
    }
  ],

  // Form Input Components
  'input': [
    // Content Group
    { 
      type: 'text', 
      name: 'placeholder', 
      label: 'Placeholder Text',
      placeholder: 'Enter placeholder text',
      icon: 'text',
      group: 'content'
    },
    { 
      type: 'text', 
      name: 'name', 
      label: 'Input Name',
      placeholder: 'input_name',
      icon: 'name',
      group: 'content'
    },
    
    // Configuration Group
    { 
      type: 'select', 
      name: 'type', 
      label: 'Input Type',
      icon: 'type',
      group: 'configuration',
      options: [
        { value: 'text', name: 'Text' },
        { value: 'email', name: 'Email' },
        { value: 'password', name: 'Password' },
        { value: 'number', name: 'Number' },
        { value: 'tel', name: 'Phone' },
        { value: 'url', name: 'URL' }
      ]
    },
    { 
      type: 'checkbox', 
      name: 'required', 
      label: 'Required Field',
      icon: 'required',
      group: 'configuration'
    }
  ],

  // Form Components
  'form': [
    // Configuration Group
    { 
      type: 'text', 
      name: 'action', 
      label: 'Form Action URL',
      placeholder: '/submit',
      icon: 'link',
      group: 'configuration'
    },
    { 
      type: 'select', 
      name: 'method', 
      label: 'Form Method',
      icon: 'method',
      group: 'configuration',
      options: [
        { value: 'POST', name: 'POST' },
        { value: 'GET', name: 'GET' }
      ]
    },
    { 
      type: 'text', 
      name: 'name', 
      label: 'Form Name',
      placeholder: 'contact_form',
      icon: 'name',
      group: 'configuration'
    }
  ],

  // Section/Wrapper Components
  'section': [
    // Content Group
    { 
      type: 'text', 
      name: 'sectionTitle', 
      label: 'Section Title',
      placeholder: 'Section Title',
      icon: 'text',
      group: 'content'
    },
    
    // Layout Group
    { 
      type: 'select', 
      name: 'maxWidth', 
      label: 'Max Width',
      icon: 'width',
      group: 'layout',
      options: [
        { value: 'none', name: 'None' },
        { value: 'sm', name: 'Small (640px)' },
        { value: 'md', name: 'Medium (768px)' },
        { value: 'lg', name: 'Large (1024px)' },
        { value: 'xl', name: 'Extra Large (1280px)' },
        { value: 'full', name: 'Full Width' }
      ]
    },
    { 
      type: 'select', 
      name: 'padding', 
      label: 'Section Padding',
      icon: 'spacing',
      group: 'layout',
      options: [
        { value: 'none', name: 'None' },
        { value: 'sm', name: 'Small' },
        { value: 'md', name: 'Medium' },
        { value: 'lg', name: 'Large' },
        { value: 'xl', name: 'Extra Large' }
      ]
    }
  ],

  // Navigation Components
  'nav': [
    // Content Group
    { 
      type: 'text', 
      name: 'brand', 
      label: 'Brand Name',
      placeholder: 'Your Brand',
      icon: 'brand',
      group: 'content'
    },
    
    // Configuration Group
    { 
      type: 'select', 
      name: 'layout', 
      label: 'Navigation Layout',
      icon: 'layout',
      group: 'configuration',
      options: [
        { value: 'horizontal', name: 'Horizontal' },
        { value: 'vertical', name: 'Vertical' },
        { value: 'sidebar', name: 'Sidebar' }
      ]
    },
    { 
      type: 'checkbox', 
      name: 'sticky', 
      label: 'Sticky Navigation',
      icon: 'sticky',
      group: 'configuration'
    },
    { 
      type: 'checkbox', 
      name: 'collapsed', 
      label: 'Mobile Collapsed',
      icon: 'mobile',
      group: 'configuration'
    }
  ],

  // List Components
  'list': [
    // Configuration Group
    { 
      type: 'select', 
      name: 'listType', 
      label: 'List Type',
      icon: 'list',
      group: 'configuration',
      options: [
        { value: 'ul', name: 'Unordered List' },
        { value: 'ol', name: 'Ordered List' }
      ]
    },
    { 
      type: 'select', 
      name: 'listStyle', 
      label: 'List Style',
      icon: 'style',
      group: 'configuration',
      options: [
        { value: 'disc', name: 'Disc' },
        { value: 'circle', name: 'Circle' },
        { value: 'square', name: 'Square' },
        { value: 'decimal', name: 'Numbers' },
        { value: 'none', name: 'None' }
      ]
    }
  ],

  // Video Components
  'video': [
    // Media Group
    { 
      type: 'text', 
      name: 'src', 
      label: 'Video URL',
      placeholder: 'https://example.com/video.mp4',
      icon: 'video',
      group: 'media'
    },
    { 
      type: 'image-asset', 
      name: 'poster', 
      label: 'Video Thumbnail',
      icon: 'image',
      group: 'media'
    },
    
    // Configuration Group
    { 
      type: 'checkbox', 
      name: 'autoplay', 
      label: 'Autoplay',
      icon: 'play',
      group: 'playback'
    },
    { 
      type: 'checkbox', 
      name: 'loop', 
      label: 'Loop Video',
      icon: 'loop',
      group: 'playback'
    },
    { 
      type: 'checkbox', 
      name: 'muted', 
      label: 'Muted',
      icon: 'mute',
      group: 'playback'
    },
    { 
      type: 'checkbox', 
      name: 'controls', 
      label: 'Show Controls',
      icon: 'controls',
      group: 'playback'
    }
  ],

  // Link Components
  'link': [
    // Content Group
    { 
      type: 'text', 
      name: 'href', 
      label: 'Link URL',
      placeholder: 'https://example.com',
      icon: 'link',
      group: 'content'
    },
    { 
      type: 'text', 
      name: 'text', 
      label: 'Link Text',
      placeholder: 'Click here',
      icon: 'text',
      group: 'content'
    },
    
    // Configuration Group
    { 
      type: 'select', 
      name: 'target', 
      label: 'Link Target',
      icon: 'target',
      group: 'configuration',
      options: [
        { value: '_self', name: 'Same Window' },
        { value: '_blank', name: 'New Window' },
        { value: '_parent', name: 'Parent Frame' },
        { value: '_top', name: 'Top Frame' }
      ]
    },
    { 
      type: 'text', 
      name: 'title', 
      label: 'Link Title',
      placeholder: 'Tooltip text',
      icon: 'tooltip',
      group: 'configuration'
    }
  ],

  // Table Components
  'table': [
    // Configuration Group
    { 
      type: 'number', 
      name: 'rows', 
      label: 'Number of Rows',
      min: 1,
      max: 20,
      placeholder: '3',
      icon: 'rows',
      group: 'configuration'
    },
    { 
      type: 'number', 
      name: 'columns', 
      label: 'Number of Columns',
      min: 1,
      max: 10,
      placeholder: '3',
      icon: 'columns',
      group: 'configuration'
    },
    { 
      type: 'checkbox', 
      name: 'showHeader', 
      label: 'Show Header Row',
      icon: 'header',
      group: 'configuration'
    },
    { 
      type: 'checkbox', 
      name: 'striped', 
      label: 'Striped Rows',
      icon: 'striped',
      group: 'configuration'
    }
  ],

  // Default/Generic Components
  'default': [
    { 
      type: 'text', 
      name: 'id', 
      label: 'Element ID',
      icon: 'id',
      group: 'attributes'
    },
    { 
      type: 'text', 
      name: 'classes', 
      label: 'CSS Classes',
      icon: 'class',
      group: 'attributes'
    },
    { 
      type: 'text', 
      name: 'tagName', 
      label: 'HTML Tag',
      icon: 'tag',
      group: 'attributes'
    },
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
    }
  ]
}