# Srijonshilpo Frontend

A React-based visual website builder powered by GrapesJS with smart objects and comprehensive debugging capabilities.

## DEBUG_MODE Usage Guide

### Overview
The frontend includes a comprehensive DEBUG_MODE system that provides detailed logging for troubleshooting component selection, trait rendering, and GrapesJS manager initialization.

### Enabling DEBUG_MODE

DEBUG_MODE is controlled by a flag in `src/pages/BuilderPage.tsx`:

```typescript
const DEBUG_MODE = true  // Set to true to enable detailed logging
```

When enabled, you'll see comprehensive logs prefixed with:
- `🔍 [DEBUG]` - Information logs
- `⚠️ [DEBUG]` - Warning logs  
- `❌ [DEBUG]` - Error logs

### What DEBUG_MODE Logs

#### 1. Editor Initialization
- Container availability checking for StyleManager, TraitManager, LayerManager
- GrapesJS instance creation and configuration
- Manager rendering status

#### 2. Component Selection Events
- Component type detection (`smart-object`, `basic-component`, etc.)
- Trait configuration loading and application
- Manager synchronization (StyleManager, TraitManager)
- Component details (ID, type, attributes)

#### 3. Trait Management
- Trait configuration retrieval from `TraitConfigurations.ts`
- Trait assignment to selected components
- Manager selection and rendering
- Fallback trait creation for unsupported components

#### 4. Smart Object Handling
- Smart object type detection via `data-smart-object` attributes
- Template loading and customization
- Smart object manager initialization

### Key Debug Messages to Monitor

#### Container Issues
```
⚠️ [DEBUG] initializeEditor: Missing container #inspector-styles for StyleManager
⚠️ [DEBUG] initializeEditor: Missing container #inspector-traits for TraitManager
```
**Solution**: Ensure DOM elements with IDs `#inspector-styles`, `#inspector-traits`, `#inspector-layers` exist.

#### Component Selection Issues
```
🔍 [DEBUG] === COMPONENT SELECTION EVENT ===
🔍 [DEBUG] component:selected - Detected type: smart-object
🔍 [DEBUG] component:selected - Switching to traits tab
```
**What to look for**: Component type should be correctly identified, tab switching should occur.

#### Trait Configuration Issues
```
🔍 [DEBUG] component:selected - Loading trait configurations...
🔍 [DEBUG] component:selected - TraitConfigurations loaded successfully
🔍 [DEBUG] component:selected - Applying comprehensive trait configuration
```
**What to look for**: Trait configurations should load without errors and be applied successfully.

#### Manager Synchronization
```
🔍 [DEBUG] component:selected - Selecting component in StyleManager
🔍 [DEBUG] component:selected - Selecting component in TraitManager
```
**What to look for**: Both managers should acknowledge component selection.

### Troubleshooting Common Issues

#### Issue: Component Selection Infinite Loop
**Symptoms**: Repeated `component:selected` events, browser freezing
**Debug logs to check**:
```
🔍 [DEBUG] component:selected - Starting re-selection process...
🔍 [DEBUG] component:selected - Re-selecting component...
```
**Solution**: Remove re-selection logic that triggers `grapesEditor.select()` within the selection handler.

#### Issue: Traits Not Rendering
**Symptoms**: Empty traits panel when components are selected
**Debug logs to check**:
```
⚠️ [DEBUG] component:selected - Trait container or TraitManager not found for manual rendering
```
**Solution**: Verify DOM containers exist and TraitManager is properly initialized.

#### Issue: White Screen on Component Selection
**Symptoms**: Builder interface becomes blank when selecting components
**Debug logs to check**:
```
❌ [DEBUG] component:selected - Error in selection handler: [error details]
```
**Solution**: Check for JavaScript errors in the selection handler, ensure proper error handling.

#### Issue: Manager Containers Missing
**Symptoms**: StyleManager, TraitManager, LayerManager not rendering
**Debug logs to check**:
```
❌ [DEBUG] initializeEditor: Missing containers, retrying in 100ms: ['StyleManager', 'TraitManager', 'LayerManager']
```
**Solution**: Check DOM structure, ensure container elements are created before GrapesJS initialization.

### Performance Considerations

- DEBUG_MODE should be **disabled in production** (`DEBUG_MODE = false`)
- Extensive logging can impact performance during development
- Consider selectively enabling specific debug sections for targeted troubleshooting

### In-App Debug Console

The builder includes an in-app debug console overlay (bottom-right corner) that displays recent debug messages in the UI. This is useful for monitoring debug output without opening browser developer tools.

To use the in-app console:
1. Enable DEBUG_MODE
2. Load the builder page
3. Look for the debug overlay in the bottom-right corner
4. Recent debug messages will appear in the overlay

### Debug Message Categories

#### Critical (❌)
- Failed manager initialization
- Component selection errors
- Trait application failures

#### Warnings (⚠️)
- Missing DOM containers
- Fallback scenarios triggered
- Manager synchronization issues

#### Information (🔍)
- Successful operations
- Component type detection
- Configuration loading status

### Disabling DEBUG_MODE

To disable debug logging:

```typescript
const DEBUG_MODE = false  // Disable all debug logging
```

This will:
- Remove all debug console output
- Hide the in-app debug console overlay
- Improve performance by eliminating logging overhead

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Architecture

- **React 18.3.1** - UI framework
- **Vite 5.4.1** - Build tool with HMR
- **GrapesJS 0.21.7** - Visual builder engine
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling

## Key Files

- `src/pages/BuilderPage.tsx` - Main builder interface with DEBUG_MODE
- `src/config/TraitConfigurations.ts` - Component trait definitions
- `src/managers/SmartObjectsManager.ts` - Smart object handling
- `src/managers/ResizeManager.ts` - Component resizing
- `src/managers/MagneticGrid.ts` - Grid alignment system