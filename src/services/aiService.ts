// AI Service for handling component modifications

export interface AICommandRequest {
  command: string
  componentId: string
  componentType: string
  currentStyles: Record<string, any>
  currentContent: string
  pageContext?: {
    device: 'desktop' | 'tablet' | 'mobile'
    theme: string
    totalComponents: number
    parentContext?: {
      type: string
      styles: Record<string, any>
    }
    elementHTML?: string
    isSelected?: boolean
    builderMode?: string
  }
}

export interface AICommandResponse {
  success: boolean
  action: 'style_change' | 'content_update' | 'visibility_toggle' | 'layout_modification'
  changes: Record<string, any>
  reasoning: string
  confidence: number
  suggestions?: string[]
  error?: string
}

class AIBuilderService {
  private baseURL: string
  private mockMode: boolean
  
  constructor() {
    this.baseURL = (import.meta as any).env.VITE_BUILDER_API_URL || 'http://localhost:8082'
    
    const geminiKey = (import.meta as any).env.VITE_GEMINI_API_KEY
    const hasValidGemini = geminiKey && geminiKey.startsWith('AIza')
    this.mockMode = !hasValidGemini
    
    if (hasValidGemini) {
      console.log('🚀 AI Builder running with Google Gemini AI')
    } else {
      console.log('🤖 AI Builder running in MOCK mode')
    }
  }

  async processCommand(request: AICommandRequest): Promise<AICommandResponse> {
    const geminiKey = (import.meta as any).env.VITE_GEMINI_API_KEY
    if (geminiKey && geminiKey.startsWith('AIza')) {
      return this.processWithGemini(request)
    }
    return this.mockAIProcess(request)
  }

  private async processWithGemini(request: AICommandRequest): Promise<AICommandResponse> {
    try {
      const geminiKey = (import.meta as any).env.VITE_GEMINI_API_KEY
      const prompt = this.createGeminiPrompt(request)
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { 
            temperature: 0.1, 
            maxOutputTokens: 1024,
            topP: 0.8,
            topK: 10
          }
        })
      })

      if (!response.ok) throw new Error(`Gemini API error: ${response.statusText}`)
      
      const data = await response.json()
      const geminiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text
      
      if (!geminiResponse) throw new Error('No response from Gemini')
      
      return this.parseGeminiResponse(geminiResponse, request)
    } catch (error) {
      console.error('Gemini API error:', error)
      return this.mockAIProcess(request)
    }
  }

  private createGeminiPrompt(request: AICommandRequest): string {
    const pageInfo = request.pageContext || { device: 'desktop', theme: 'modern', totalComponents: 5 }
    
    // Get HTML and CSS context
    const htmlContext = this.getHTMLContext(request)
    const cssContext = this.getCSSContext(request)
    const grapesRestrictions = this.getGrapesJSRestrictions()
    
    return `You are an AI web design assistant for GrapesJS visual editor.

CONTEXT:
Device: ${pageInfo.device} | Theme: ${pageInfo.theme} | Components: ${pageInfo.totalComponents}

ELEMENT:
${htmlContext}

STYLES:
${cssContext}

TARGET: ${request.componentType} (ID: ${request.componentId})
CONTENT: "${request.currentContent}"
COMMAND: "${request.command}"

${grapesRestrictions}

TASK: Analyze and modify only the selected element to fulfill the user's request.

RESPONSE (JSON only):
{
  "success": boolean,
  "action": "style_change"|"content_update"|"layout_modification"|"visibility_toggle",
  "changes": {
    // CSS properties: add/modify/remove (null to remove)
    // Examples: "color": "#3b82f6", "margin": null
  },
  "reasoning": "Brief explanation",
  "confidence": 0.0-1.0,
  "suggestions": ["suggestion1", "suggestion2"]
}`
  }

  private getHTMLContext(request: AICommandRequest): string {
    const pageContext = request.pageContext
    
    // Use actual HTML if available from GrapesJS
    if (pageContext?.elementHTML) {
      const cleanHTML = pageContext.elementHTML
        .replace(/data-gjs[^=]*="[^"]*"/g, '') // Remove GrapesJS data attributes
        .replace(/\s+/g, ' ')
        .trim()
      
      let contextText = `HTML: ${cleanHTML}`
      
      if (pageContext.parentContext) {
        contextText += `\nParent: <${pageContext.parentContext.type}> ${JSON.stringify(pageContext.parentContext.styles)}`
      }
      
      return contextText
    }
    
    // Fallback to constructed HTML structure
    const tag = request.componentType
    const content = request.currentContent
    const id = request.componentId
    
    let htmlStructure = `<${tag}`
    
    if (id && id !== 'undefined') {
      htmlStructure += ` id="${id}"`
    }
    
    htmlStructure += ` class="gjs-selected">`
    
    if (!['img', 'br', 'hr', 'input'].includes(tag.toLowerCase())) {
      htmlStructure += content || 'Element content'
      htmlStructure += `</${tag}>`
    }
    
    return `HTML: ${htmlStructure}`
  }

  private getCSSContext(request: AICommandRequest): string {
    const styles = request.currentStyles
    
    if (!styles || Object.keys(styles).length === 0) {
      return "No styles (browser defaults)"
    }
    
    const sortedStyles = Object.entries(styles).sort(([a], [b]) => a.localeCompare(b))
    const styleEntries = sortedStyles.map(([prop, val]) => `${prop}: ${val}`).join('; ')
    
    return `Current: {${styleEntries}}`
  }

  private getGrapesJSRestrictions(): string {
    return `SCOPE: Modify only the selected element. Full context provided for understanding, not modification.

ALLOWED:
- Add/modify/remove CSS properties within selected element
- Change content and text
- Reorganize child elements if requested
- Add/remove CSS classes (except gjs-* classes)
- Override existing styles when needed

FORBIDDEN:
- Modify elements outside selected component
- Change gjs-* classes or element root ID
- Modify parent/sibling elements

RULES:
- Remove conflicting CSS properties
- Make minimal necessary changes
- Prioritize user intent over existing styles`
  }

  private parseGeminiResponse(geminiText: string, request: AICommandRequest): AICommandResponse {
    try {
      const jsonMatch = geminiText.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error('No JSON found')
      
      const parsed = JSON.parse(jsonMatch[0])
      
      // Process changes to handle CSS property removal (null values)
      const processedChanges = parsed.changes || {}
      
      return {
        success: parsed.success || false,
        action: parsed.action || 'style_change',
        changes: processedChanges,
        reasoning: parsed.reasoning || 'AI processed your request',
        confidence: parsed.confidence || 0.8,
        suggestions: parsed.suggestions || ['Try more specific commands']
      }
    } catch (error) {
      return {
        success: true,
        action: 'style_change',
        changes: this.inferChangesFromCommand(request.command),
        reasoning: `Gemini AI processed: "${request.command}"`,
        confidence: 0.75,
        suggestions: ['Try more specific commands']
      }
    }
  }

  private inferChangesFromCommand(command: string): Record<string, any> {
    const lowerCommand = command.toLowerCase()
    if (lowerCommand.includes('blue')) return { color: '#3b82f6' }
    if (lowerCommand.includes('red')) return { color: '#ef4444' }
    if (lowerCommand.includes('center')) return { textAlign: 'center' }
    if (lowerCommand.includes('large')) return { fontSize: '1.5em' }
    if (lowerCommand.includes('border')) return { border: '2px solid #3b82f6' }
    return { transition: 'all 0.3s ease' }
  }

  private async mockAIProcess(request: AICommandRequest): Promise<AICommandResponse> {
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const { command, currentStyles, componentType } = request
    const lowerCommand = command.toLowerCase()

    // Enhanced mock responses that consider existing styles
    if (lowerCommand.includes('blue')) {
      const isButton = componentType === 'button'
      const hasBackground = currentStyles.backgroundColor && currentStyles.backgroundColor !== 'transparent'
      
      // Smart decision: button with background -> change background, otherwise text color
      const targetProperty = isButton && hasBackground ? 'backgroundColor' : 'color'
      const newValue = targetProperty === 'backgroundColor' ? '#3b82f6' : '#3b82f6'
      
      return {
        success: true,
        action: 'style_change',
        changes: { [targetProperty]: newValue },
        reasoning: `Applied blue ${targetProperty === 'backgroundColor' ? 'background' : 'text color'} based on element type and current styles`,
        confidence: 0.95,
        suggestions: [
          targetProperty === 'color' ? 'Try "make background blue"' : 'Try "make text blue"',
          'Use "darker blue" for emphasis'
        ]
      }
    }

    if (lowerCommand.includes('center')) {
      const currentAlign = currentStyles.textAlign || 'left'
      const isAlreadyCentered = currentAlign === 'center'
      
      if (isAlreadyCentered) {
        return {
          success: true,
          action: 'style_change',
          changes: {},
          reasoning: 'Element is already centered',
          confidence: 1.0,
          suggestions: ['Try "align left" to change', 'Use "center the entire element" for different centering']
        }
      }
      
      return {
        success: true,
        action: 'style_change',
        changes: { textAlign: 'center' },
        reasoning: `Changed text alignment from ${currentAlign} to center`,
        confidence: 0.94,
        suggestions: ['Try "align left" or "align right" to adjust']
      }
    }

    if (lowerCommand.includes('border')) {
      const hasBorder = currentStyles.border || currentStyles.borderWidth
      const borderColor = lowerCommand.includes('red') ? '#ef4444' : 
                         lowerCommand.includes('green') ? '#10b981' : '#3b82f6'
      
      return {
        success: true,
        action: 'style_change',
        changes: { 
          border: `2px solid ${borderColor}`, 
          borderRadius: '4px' 
        },
        reasoning: `${hasBorder ? 'Updated' : 'Added'} border with ${borderColor} color and rounded corners`,
        confidence: 0.89,
        suggestions: ['Try "thick border" for 3px width', 'Use "remove border" to clear']
      }
    }

    if (lowerCommand.includes('larger') || lowerCommand.includes('bigger')) {
      const currentSize = currentStyles.fontSize || '16px'
      const currentSizeNum = parseFloat(currentSize)
      const newSize = `${currentSizeNum * 1.25}px`
      
      return {
        success: true,
        action: 'style_change',
        changes: { fontSize: newSize },
        reasoning: `Increased font size from ${currentSize} to ${newSize}`,
        confidence: 0.88,
        suggestions: ['Try "smaller" to reduce size', 'Use "much larger" for bigger increase']
      }
    }

    if (lowerCommand.includes('smaller')) {
      const currentSize = currentStyles.fontSize || '16px'
      const currentSizeNum = parseFloat(currentSize)
      const newSize = `${currentSizeNum * 0.8}px`
      
      return {
        success: true,
        action: 'style_change',
        changes: { fontSize: newSize },
        reasoning: `Decreased font size from ${currentSize} to ${newSize}`,
        confidence: 0.88,
        suggestions: ['Try "larger" to increase size', 'Use "much smaller" for bigger decrease']
      }
    }

    // Default response shows awareness of current state
    const hasStyles = Object.keys(currentStyles).length > 0
    const stylesList = hasStyles ? Object.keys(currentStyles).join(', ') : 'default browser styles'
    
    return {
      success: true,
      action: 'style_change',
      changes: { transition: 'all 0.3s ease', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' },
      reasoning: `Applied subtle enhancements to ${componentType} with current styles: ${stylesList}`,
      confidence: 0.7,
      suggestions: [
        'Try "make this blue" for color changes',
        'Use "center this text" for alignment', 
        'Say "add a border" for styling'
      ]
    }
  }

  async getContextualSuggestions(componentType: string): Promise<string[]> {
    const suggestions: Record<string, string[]> = {
      'button': ['Make this blue', 'Add hover effect', 'Make it larger'],
      'h1': ['Make this larger', 'Center this heading', 'Change color to blue'],
      'p': ['Center this text', 'Make text larger', 'Change color to gray'],
      'div': ['Add a border', 'Add background color', 'Center the content']
    }
    
    return suggestions[componentType] || ['Make this blue', 'Center this element', 'Add a border']
  }
}

export const aiBuilderService = new AIBuilderService()
