# Edit Outfit Feature

## Overview

The Edit Outfit feature allows users to modify their existing saved outfits by adding, removing, repositioning, scaling, and rotating items on the canvas. All changes are saved back to the existing outfit, maintaining the outfit ID.

---

## Route Information

**Path:** `/outfits/edit/:outfitId`

**Component:** `OutfitCreator.vue`

**Sub-route:** `edit`

**Example:** `/outfits/edit/550e8400-e29b-41d4-a716-446655440000`

---

## Features

### 1. Canvas Display
- ✅ **Load Existing Items**: All items from the outfit are loaded onto canvas
- ✅ **Preserved Positions**: Items appear at their saved positions
- ✅ **Preserved Transformations**: Scale, rotation, and z-index are maintained

### 2. Items Source
- ✅ **Dropdown**: Shows "My Closet"
- ✅ **User's Items**: Sidebar displays user's own clothing items
- ✅ **Add More Items**: Can add additional items from closet

### 3. Full Editing Capabilities
- ✅ **Remove Items**: Delete items from canvas
- ✅ **Add Items**: Drag new items from sidebar
- ✅ **Reposition**: Drag items to new positions
- ✅ **Scale**: Zoom in/out on items
- ✅ **Rotate**: Rotate items left/right
- ✅ **Layer**: Change z-index (move forward/backward)
- ✅ **Undo/Redo**: Full history support

### 4. Save Changes
- ✅ **Update Button**: Shows "Update Outfit" instead of "Save Outfit"
- ✅ **Pre-filled Name**: Outfit name is pre-filled with existing name
- ✅ **Database Update**: Updates existing outfit record
- ✅ **Return to Gallery**: Navigates back to `/outfits` after save

---

## User Flow

```
User on /outfits gallery page
  ↓
Clicks "Edit" button on outfit card or within detail modal
  ↓
Routes to /outfits/edit/:outfitId
  ↓
Page loads outfit data from database
  ↓
Canvas displays all outfit items with positions
  ↓
Sidebar shows user's closet items
  ↓
User can:
  - Drag items to reposition
  - Scale items up/down
  - Rotate items
  - Delete items
  - Add new items from sidebar
  - Change z-index (layering)
  ↓
User clicks "Update Outfit" button
  ↓
Prompted to confirm/edit outfit name
  ↓
Outfit updated in database
  ↓
Navigates back to /outfits gallery
  ↓
Updated outfit visible in gallery
```

---

## UI Components

### 1. Canvas Display

**Initial Load:**
- All items from `outfit_items` table are loaded
- Each item positioned at `position_x`, `position_y`
- Transformations applied: `scale`, `rotation`, `z_index`

**Visual:**
```
┌────────────────────────────────┐
│  [T-shirt at (100, 100)]       │
│                                │
│       [Jeans at (150, 250)]    │
│                                │
│  [Shoes at (120, 400)]         │
└────────────────────────────────┘
```

### 2. Dropdown Badge

**Display:**
```vue
<select v-model="itemsSource">
  <option value="my-cabinet">My Closet</option>
</select>
```

**Features:**
- Shows "My Closet" by default
- Loads user's own items in sidebar
- Same as personal creation mode

### 3. Update Button

**Label:** "Update Outfit" (instead of "Save Outfit")

**Visual:**
```vue
<button @click="saveOutfit">
  <Save class="w-5 h-5" />
  <span>Update Outfit</span>
</button>
```

---

## Technical Implementation

### Data Flow

#### 1. Loading Outfit
```javascript
const loadExistingOutfit = async (outfitId) => {
  // Fetch outfit from database
  const outfit = await outfitsService.getOutfit(outfitId)
  
  // Store outfit ID and name for editing
  currentOutfitId.value = outfit.id
  currentOutfitName.value = outfit.outfit_name
  
  // Load items onto canvas
  canvasItems.value = outfit.outfit_items.map(outfitItem => ({
    ...outfitItem.clothing_item,
    id: `${outfitItem.clothing_item.id}-${Date.now()}-${Math.random()}`,
    x: outfitItem.position_x,
    y: outfitItem.position_y,
    scale: outfitItem.scale,
    rotation: outfitItem.rotation,
    zIndex: outfitItem.z_index
  }))
}
```

#### 2. Saving Changes
```javascript
const saveOwnOutfit = async () => {
  const isEditing = !!currentOutfitId.value
  
  if (isEditing) {
    // Update existing outfit
    await outfitsService.updateOutfit(currentOutfitId.value, {
      outfit_name: outfitName,
      description: 'Created in Outfit Creator',
      items: canvasItems.value.map(item => ({
        clothing_item_id: item.id.split('-')[0],
        position_x: item.x,
        position_y: item.y,
        z_index: item.zIndex,
        rotation: item.rotation,
        scale: item.scale
      }))
    })
    
    alert('Outfit updated successfully!')
    router.push('/outfits')
  }
}
```

#### 3. Updating in Database
```javascript
// In OutfitsService
async updateOutfit(outfitId, outfitData) {
  // 1. Update outfit metadata
  await supabase
    .from('outfits')
    .update({
      outfit_name: outfitData.outfit_name,
      description: outfitData.description,
      ...
    })
    .eq('id', outfitId)
  
  // 2. Delete existing items
  await supabase
    .from('outfit_items')
    .delete()
    .eq('outfit_id', outfitId)
  
  // 3. Insert new items
  await supabase
    .from('outfit_items')
    .insert(outfitItems)
}
```

---

## Database Schema

### `outfits` Table
```sql
UPDATE outfits
SET 
  outfit_name = 'Updated Name',
  description = 'Updated description',
  updated_at = NOW()
WHERE id = :outfitId
  AND owner_id = :userId
```

### `outfit_items` Table
```sql
-- Delete existing items
DELETE FROM outfit_items
WHERE outfit_id = :outfitId;

-- Insert updated items
INSERT INTO outfit_items (
  outfit_id,
  clothing_item_id,
  position_x,
  position_y,
  z_index,
  rotation,
  scale
) VALUES (...);
```

---

## State Management

### Edit Mode State

**Variables:**
```javascript
const currentOutfitId = ref(null)       // Set when loading existing outfit
const currentOutfitName = ref(null)     // Pre-fill outfit name
```

**Detection:**
```javascript
const isEditing = computed(() => !!currentOutfitId.value)

// Or in save function
const isEditing = !!currentOutfitId.value
```

**Button Label:**
```javascript
const saveButtonLabel = computed(() => {
  if (currentSubRoute.value === 'edit' && currentOutfitId.value) {
    return 'Update Outfit'
  }
  return 'Save Outfit'
})
```

---

## User Experience

### Pre-filled Name
When saving changes, the prompt shows the current outfit name:

```javascript
const defaultName = isEditing 
  ? currentOutfitName.value              // "Summer Casual Look"
  : `Outfit ${new Date().toLocaleDateString()}`

const outfitName = prompt('Enter a name for your outfit:', defaultName)
```

**User sees:**
```
┌────────────────────────────────────┐
│ Enter a name for your outfit:      │
│ ┌────────────────────────────────┐ │
│ │ Summer Casual Look             │ │
│ └────────────────────────────────┘ │
│         [OK]        [Cancel]        │
└────────────────────────────────────┘
```

### Success Messages

**On Update:**
- Alert: "Outfit updated successfully!"
- Navigation: Redirects to `/outfits`
- Gallery: Updated outfit visible with changes

**On Error:**
- Alert: "Failed to update outfit. Please try again."
- User remains on edit page
- Can retry saving

---

## Editing Capabilities

### 1. Remove Items
```javascript
const deleteSelectedItem = () => {
  if (!selectedItemId.value) return
  
  canvasItems.value = canvasItems.value.filter(
    item => item.id !== selectedItemId.value
  )
  
  selectedItemId.value = null
  saveToHistory()
}
```

**User Action:**
- Select item on canvas
- Click delete button (trash icon)
- Item removed immediately

---

### 2. Add Items
```javascript
const addItemToCanvas = (item) => {
  const newItem = {
    ...item,
    id: `${item.id}-${Date.now()}`,
    x: 200,
    y: 200,
    scale: 1,
    rotation: 0,
    zIndex: canvasItems.value.length + 1
  }
  
  canvasItems.value.push(newItem)
  saveToHistory()
}
```

**User Action:**
- Browse items in sidebar
- Click item to add
- Item appears on canvas
- User can then position it

---

### 3. Reposition
```javascript
const startDrag = (item, event) => {
  // Enable dragging
  isDragging.value = true
  draggedItem.value = item
}

const handleDrop = (event) => {
  // Update item position
  item.x = event.offsetX
  item.y = event.offsetY
  saveToHistory()
}
```

---

### 4. Scale
```javascript
const scaleSelectedItem = (direction) => {
  const item = selectedItem.value
  if (!item) return
  
  const scaleFactor = direction === 'in' ? 1.1 : 0.9
  item.scale = (item.scale || 1) * scaleFactor
  
  saveToHistory()
}
```

---

### 5. Rotate
```javascript
const rotateSelectedItem = (direction) => {
  const item = selectedItem.value
  if (!item) return
  
  const rotation = direction === 'left' ? -15 : 15
  item.rotation = (item.rotation || 0) + rotation
  
  saveToHistory()
}
```

---

### 6. Layer (Z-Index)
```javascript
const moveSelectedItemForward = () => {
  const item = selectedItem.value
  if (!item) return
  
  item.zIndex = (item.zIndex || 1) + 1
  saveToHistory()
}

const moveSelectedItemBackward = () => {
  const item = selectedItem.value
  if (!item) return
  
  item.zIndex = Math.max((item.zIndex || 1) - 1, 1)
  saveToHistory()
}
```

---

## Navigation

### Entry Points

**From Outfits Gallery:**
```vue
<button @click="editOutfit(outfit)">
  Edit
</button>

// In component
const editOutfit = (outfit) => {
  router.push(`/outfits/edit/${outfit.id}`)
}
```

**From Outfit Detail Modal:**
```vue
<button @click="editOutfit(selectedOutfit)">
  Edit Outfit
</button>
```

### Exit Points

**After Save:**
```javascript
router.push('/outfits')  // Back to gallery
```

**Cancel/Close:**
- User can manually navigate back
- Browser back button works

---

## Error Handling

### Outfit Not Found
```javascript
if (!outfit) {
  console.error('OutfitCreator: Outfit not found')
  alert('Outfit not found.')
  router.push('/outfits')  // Redirect to gallery
  return
}
```

### Permission Denied
```javascript
// Database RLS ensures user can only edit own outfits
// If update fails due to ownership:
alert('You do not have permission to edit this outfit.')
router.push('/outfits')
```

### Update Failed
```javascript
if (!result || !result.id) {
  throw new Error('Failed to update outfit')
}

// Catch block:
catch (error) {
  console.error('Error saving outfit:', error)
  alert('Failed to update outfit. Please try again.')
  // User stays on edit page to retry
}
```

---

## Testing Checklist

### Setup
- [ ] Create user account with outfits
- [ ] Ensure outfit has multiple items

### Loading
- [ ] Navigate to `/outfits/edit/:outfitId`
- [ ] Verify all items appear on canvas
- [ ] Verify items at correct positions
- [ ] Verify transformations applied (scale, rotation)
- [ ] Verify "My Closet" in dropdown
- [ ] Verify sidebar shows user's items
- [ ] Verify title shows "Edit Outfit"

### Editing
- [ ] Select item on canvas
- [ ] Drag item to new position
- [ ] Scale item up and down
- [ ] Rotate item left and right
- [ ] Move item forward/backward (z-index)
- [ ] Delete item from canvas
- [ ] Add new item from sidebar
- [ ] Use undo/redo
- [ ] Clear canvas and re-add items

### Saving
- [ ] Click "Update Outfit" button
- [ ] Verify outfit name pre-filled
- [ ] Change outfit name
- [ ] Click OK to save
- [ ] Verify success message
- [ ] Verify redirect to /outfits
- [ ] Verify outfit updated in gallery
- [ ] Open outfit to verify changes saved

### Edge Cases
- [ ] Edit outfit with no items
- [ ] Edit outfit then cancel
- [ ] Edit outfit with invalid ID
- [ ] Edit another user's outfit (should fail)
- [ ] Network error during save

---

## Future Enhancements

### Phase 1: Enhanced UX
- [ ] Confirmation dialog before leaving with unsaved changes
- [ ] Auto-save draft functionality
- [ ] "Duplicate Outfit" option
- [ ] Compare with original (show before/after)

### Phase 2: Advanced Editing
- [ ] Multi-select items
- [ ] Align items (left, center, right)
- [ ] Distribute items evenly
- [ ] Snap to grid
- [ ] Copy/paste items
- [ ] Item grouping

### Phase 3: Collaboration
- [ ] Share outfit for collaborative editing
- [ ] Version history
- [ ] Restore previous versions
- [ ] Comments on specific items

### Phase 4: Smart Features
- [ ] AI suggestions for improvements
- [ ] Color harmony analysis
- [ ] Style consistency checker
- [ ] Occasion appropriateness

---

## Performance Considerations

### Loading
- **Outfit Data**: Single query with joined items (~100ms)
- **User Items**: Separate query for sidebar (~150ms)
- **Total Load Time**: ~250ms

### Saving
- **Update Outfit**: Single update query (~50ms)
- **Delete Items**: Single delete query (~30ms)
- **Insert Items**: Batch insert (~50ms per 10 items)
- **Total Save Time**: ~150ms for typical outfit

### Optimization
- Use `select()` to fetch only needed fields
- Batch operations where possible
- Client-side validation before save
- Optimistic UI updates

---

## Security

### Row Level Security (RLS)

**Can Only Edit Own Outfits:**
```sql
CREATE POLICY "users_edit_own_outfits"
ON outfits FOR UPDATE
USING (owner_id = auth.uid());
```

**Can Only Delete Own Items:**
```sql
CREATE POLICY "users_delete_own_outfit_items"
ON outfit_items FOR DELETE
USING (
  outfit_id IN (
    SELECT id FROM outfits WHERE owner_id = auth.uid()
  )
);
```

### Validation

**Backend:**
- Verify outfit belongs to user
- Verify clothing items belong to user
- Validate item positions and transformations

**Frontend:**
- Check authentication before loading
- Validate outfit ID format
- Handle 404/403 errors gracefully

---

## Related Documentation

- [Outfit Creator Documentation](./OUTFIT_CREATOR.md)
- [Outfits Gallery](./OUTFITS_GALLERY.md)
- [Canvas Controls](./CANVAS_CONTROLS.md)
- [Outfit Creation Flow](./OUTFIT_CREATION.md)

