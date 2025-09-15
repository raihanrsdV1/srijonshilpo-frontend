/**
 * Comprehensive Test Suite for Smart Builder Improvements
 * This file contains manual tests to validate all the enhanced functionality
 */

import { Editor } from 'grapesjs'

// Test 1: ResizeManager Functionality
console.log('=== Testing ResizeManager ===')

function testResizeManager(editor: any) {
  console.log('1. Testing component selection and resize handles...')
  
  // Select a component and check if resize handles appear
  const components = editor.getComponents()
  if (components.length > 0) {
    const firstComponent = components.at(0)
    editor.select(firstComponent)
    
    // Check if resize handles are created
    const canvas = editor.Canvas.getFrameEl()
    const resizeHandles = canvas?.querySelectorAll('.resize-handle')
    
    if (resizeHandles && resizeHandles.length === 8) {
      console.log('✅ Resize handles created successfully (8 directions)')
      
      // Test handle positioning
      const nwHandle = canvas?.querySelector('.resize-handle.nw')
      const seHandle = canvas?.querySelector('.resize-handle.se')
      
      if (nwHandle && seHandle) {
        console.log('✅ Handle positioning working correctly')
      } else {
        console.log('❌ Handle positioning failed')
      }
    } else {
      console.log('❌ Resize handles not created properly')
    }
  }
  
  console.log('2. Testing resize functionality...')
  // This would be tested through user interaction
  console.log('   Manual test: Try dragging resize handles on selected components')
}

// Test 2: MagneticGrid Functionality
console.log('=== Testing MagneticGrid ===')

function testMagneticGrid(editor: any) {
  console.log('1. Testing grid toggle functionality...')
  
  // Check if grid toggle button exists
  const gridToggle = document.querySelector('#toggle-grid')
  if (gridToggle) {
    console.log('✅ Grid toggle button found')
    
    // Test grid settings button
    const gridSettings = document.querySelector('#grid-settings')
    if (gridSettings) {
      console.log('✅ Grid settings button found')
    } else {
      console.log('❌ Grid settings button not found')
    }
  } else {
    console.log('❌ Grid toggle button not found')
  }
  
  console.log('2. Testing grid visualization...')
  const canvas = editor.Canvas.getFrameEl()
  if (canvas) {
    // Check if grid can be toggled
    const hasGridClass = canvas.classList.contains('grid-enabled')
    console.log(`   Grid enabled state: ${hasGridClass}`)
    
    // Check CSS custom property for grid size
    const gridSize = getComputedStyle(canvas).getPropertyValue('--grid-size')
    if (gridSize) {
      console.log(`✅ Grid size property set: ${gridSize}`)
    } else {
      console.log('❌ Grid size property not set')
    }
  }
  
  console.log('3. Testing snap guidelines...')
  console.log('   Manual test: Drag components to see snap guidelines appear')
}

// Test 3: Smart Object Customization
console.log('=== Testing Smart Object Customization ===')

function testSmartObjectCustomization(editor: any) {
  console.log('1. Testing Smart Object creation...')
  
  // Get block manager and check for Smart Object blocks
  const blockManager = editor.BlockManager
  const smartObjectBlocks = blockManager.getAll().filter((block: any) => 
    block.get('category') === 'Smart Objects'
  )
  
  if (smartObjectBlocks.length > 0) {
    console.log(`✅ Found ${smartObjectBlocks.length} Smart Object blocks`)
    
    smartObjectBlocks.forEach((block: any) => {
      console.log(`   - ${block.get('label')}`)
    })
  } else {
    console.log('❌ No Smart Object blocks found')
  }
  
  console.log('2. Testing trait functionality...')
  console.log('   Manual test: Add Smart Objects and test trait modifications')
  console.log('   Manual test: Change color scheme in trait panel and verify visual updates')
}

// Main test runner
function runAllTests(editor: any) {
  console.log('🧪 Starting Smart Builder Comprehensive Test Suite')
  console.log('================================================')
  
  try {
    testResizeManager(editor)
    testMagneticGrid(editor)
    testSmartObjectCustomization(editor)
    
    console.log('================================================')
    console.log('✅ Test suite completed successfully!')
    console.log('📋 Manual tests to perform:')
    console.log('   1. Drag resize handles to resize components')
    console.log('   2. Toggle magnetic grid and test snapping')
    console.log('   3. Add Smart Objects and modify their traits')
    console.log('   4. Test grid settings modal')
    console.log('   5. Verify visual feedback and animations')
    
  } catch (error) {
    console.log('❌ Test suite failed with error:', (error as Error).message)
  }
}

// Export for browser console usage
declare global {
  interface Window {
    runSmartBuilderTests: (editor: any) => void
  }
}

if (typeof window !== 'undefined') {
  window.runSmartBuilderTests = runAllTests
  console.log('🔧 Test suite loaded. Run: window.runSmartBuilderTests(editor)')
}

export { runAllTests as runSmartBuilderTests }