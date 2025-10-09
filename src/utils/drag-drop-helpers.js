/**
 * Drag and Drop Helpers - StyleSnap
 * 
 * Purpose: Utility functions for implementing drag-and-drop in outfit suggestion canvas
 * 
 * Used By: components/social/SuggestionCanvas.vue
 * 
 * Functions:
 * - handleDragStart(event, item): Sets up drag data when drag starts
 *   - event: DragEvent
 *   - item: Object (clothing item being dragged)
 *   - Sets dataTransfer with item data
 * 
 * - handleDragOver(event): Allows dropping by preventing default
 *   - event: DragEvent
 *   - Must call event.preventDefault() to allow drop
 * 
 * - handleDrop(event): Handles drop event and calculates position
 *   - event: DragEvent
 *   - Returns: { itemId: string, x: number, y: number }
 * 
 * - calculateDropPosition(event, containerRect): Calculates item position in canvas
 *   - event: DragEvent
 *   - containerRect: DOMRect of drop zone
 *   - Returns: { x: number, y: number } (relative to container)
 * 
 * - createDraggableElement(item, position): Creates positioned element
 *   - item: Object (clothing item)
 *   - position: { x, y, z_index }
 *   - Returns: Object with style properties
 * 
 * Drag & Drop Flow:
 * 1. User drags item from sidebar
 * 2. handleDragStart() stores item data
 * 3. Canvas calls handleDragOver() to allow drop
 * 4. User drops item on canvas
 * 5. handleDrop() calculates position
 * 6. Create positioned div with item image
 * 7. Store position in items_data JSON
 * 
 * Items Data Format (saved to database):
 * [
 *   {
 *     item_id: "uuid-123",
 *     x: 100,           // pixels from left
 *     y: 150,           // pixels from top
 *     z_index: 1,       // layer order
 *     width: 120,       // optional
 *     height: 150       // optional
 *   },
 *   ...
 * ]
 * 
 * Usage:
 * import { handleDragStart, handleDragOver, handleDrop } from './drag-drop-helpers'
 * 
 * // In component:
 * <div @dragstart="(e) => handleDragStart(e, item)">
 *   <img :src="item.image_url" draggable="true" />
 * </div>
 * 
 * <div 
 *   @dragover="handleDragOver" 
 *   @drop="(e) => onDrop(handleDrop(e))"
 *   class="canvas"
 * >
 * </div>
 * 
 * Reference:
 * - tasks/05-suggestion-system.md for drag-and-drop implementation
 * - components/social/SuggestionCanvas.vue for usage
 * - MDN Drag and Drop API: https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API
 */

/**
 * Handles drag start event
 * @param {DragEvent} event - Drag start event
 * @param {Object} item - Item being dragged
 */
export function handleDragStart(event, item) {
  if (!event.dataTransfer || !item) return

  // Set drag data (item ID and info)
  event.dataTransfer.setData('application/json', JSON.stringify({
    id: item.id,
    image_url: item.image_url,
    name: item.name,
    category: item.category
  }))

  // Set effectAllowed
  event.dataTransfer.effectAllowed = 'copy'

  // Optionally set drag image (make it semi-transparent)
  if (event.target && event.target.tagName === 'IMG') {
    const img = event.target.cloneNode(true)
    img.style.opacity = '0.7'
    event.dataTransfer.setDragImage(event.target, 50, 50)
  }
}

/**
 * Handles drag over event (allows dropping)
 * @param {DragEvent} event - Drag over event
 */
export function handleDragOver(event) {
  // Prevent default to allow drop
  event.preventDefault()
  
  // Set dropEffect
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'copy'
  }
}

/**
 * Handles drop event and returns drop data
 * @param {DragEvent} event - Drop event
 * @returns {Object|null} { itemId, x, y, itemData } or null if invalid
 */
export function handleDrop(event) {
  // Prevent default
  event.preventDefault()

  try {
    // Get drag data
    const data = event.dataTransfer.getData('application/json')
    if (!data) return null

    const itemData = JSON.parse(data)
    
    // Calculate drop position relative to the container
    const container = event.currentTarget
    const containerRect = container.getBoundingClientRect()
    const position = calculateDropPosition(event, containerRect)

    // Return drop data
    return {
      itemId: itemData.id,
      x: position.x,
      y: position.y,
      itemData
    }
  } catch (error) {
    console.error('Error handling drop:', error)
    return null
  }
}

/**
 * Calculates drop position relative to container
 * @param {DragEvent} event - Drop event
 * @param {DOMRect} containerRect - Container bounding rect
 * @returns {Object} { x, y }
 */
export function calculateDropPosition(event, containerRect) {
  // Get event position (event.clientX, event.clientY)
  const eventX = event.clientX
  const eventY = event.clientY

  // Subtract container position to get relative position
  const x = eventX - containerRect.left
  const y = eventY - containerRect.top

  // Ensure position is within bounds
  const boundedX = Math.max(0, Math.min(x, containerRect.width))
  const boundedY = Math.max(0, Math.min(y, containerRect.height))

  // Return relative position
  return { x: boundedX, y: boundedY }
}

/**
 * Creates style object for draggable positioned element
 * @param {Object} item - Clothing item
 * @param {Object} position - { x, y, z_index, width, height }
 * @returns {Object} Style object
 */
export function createDraggableElement(item, position) {
  const { x = 0, y = 0, z_index = 1, width = 120, height = 150 } = position

  // Return style object with position, transform, z-index
  return {
    position: 'absolute',
    left: `${x}px`,
    top: `${y}px`,
    width: `${width}px`,
    height: `${height}px`,
    zIndex: z_index,
    backgroundImage: `url(${item.image_url})`,
    backgroundSize: 'contain',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',
    cursor: 'move',
    border: '2px solid transparent',
    borderRadius: '8px',
    transition: 'border-color 0.2s',
    // Add hover effect
    ':hover': {
      borderColor: '#667eea'
    }
  }
}

/**
 * Updates item position in canvas
 * @param {Array} items - Current items array
 * @param {string} itemId - Item ID to update
 * @param {Object} newPosition - { x, y, z_index }
 * @returns {Array} Updated items array
 */
export function updateItemPosition(items, itemId, newPosition) {
  return items.map(item => {
    if (item.item_id === itemId) {
      return {
        ...item,
        ...newPosition
      }
    }
    return item
  })
}

/**
 * Removes item from canvas
 * @param {Array} items - Current items array
 * @param {string} itemId - Item ID to remove
 * @returns {Array} Updated items array
 */
export function removeItem(items, itemId) {
  return items.filter(item => item.item_id !== itemId)
}

/**
 * Finds item at position (for selection/manipulation)
 * @param {Array} items - Current items array
 * @param {Object} position - { x, y }
 * @returns {Object|null} Item at position or null
 */
export function findItemAtPosition(items, position) {
  const { x, y } = position
  
  // Sort by z-index (highest first) to find topmost item
  const sortedItems = [...items].sort((a, b) => (b.z_index || 0) - (a.z_index || 0))
  
  for (const item of sortedItems) {
    const itemX = item.x || 0
    const itemY = item.y || 0
    const itemWidth = item.width || 120
    const itemHeight = item.height || 150
    
    if (
      x >= itemX && 
      x <= itemX + itemWidth && 
      y >= itemY && 
      y <= itemY + itemHeight
    ) {
      return item
    }
  }
  
  return null
}
