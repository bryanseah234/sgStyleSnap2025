# Manual Outfit Creator - Component Specifications

## Overview
The Manual Outfit Creator allows users to create custom outfit combinations by dragging and dropping items from their closet onto a blank canvas. This provides full creative control beyond the rule-based auto-generation system.

## Components

### 1. ManualOutfitCreator.vue (Page/Modal)

**Purpose**: Main interface for manual outfit creation with drag-and-drop functionality

**Layout**: Split view with sidebar and canvas
```
┌────────────────────────────────────────────┐
│  Create Outfit                    [X]      │
├──────────────┬─────────────────────────────┤
│              │                             │
│   SIDEBAR    │         CANVAS              │
│   (Items)    │      (Blank Area)           │
│              │                             │
│  [Search]    │    [Dropped Items Here]     │
│  [Filters]   │                             │
│              │                             │
│  [Item Grid] │                             │
│              │                             │
├──────────────┴─────────────────────────────┤
│  [Clear] [Cancel]              [Save]      │
└────────────────────────────────────────────┘
```

**Props**:
- `editingOutfitId` (String, optional) - ID of outfit being edited
- `initialItems` (Array, optional) - Pre-loaded items for editing

**State**:
```javascript
{
  canvasItems: [], // Items on canvas with positions
  searchQuery: '',
  categoryFilter: 'all',
  colorFilter: '',
  closetItems: [], // All user's items
  filteredItems: [], // Filtered closet items
  isDirty: false, // Has unsaved changes
  isSaving: false,
  autoSaveTimer: null
}
```

**Methods**:
- `handleItemDragStart(item)` - Start dragging item from sidebar
- `handleCanvasDrop(event)` - Drop item onto canvas
- `handleItemMove(itemId, x, y)` - Update item position
- `handleItemRemove(itemId)` - Remove item from canvas
- `handleZIndexChange(itemId, direction)` - Reorder items
- `handleSearch(query)` - Filter closet items
- `handleCategoryFilter(category)` - Filter by category
- `handleSave()` - Show save dialog
- `handleClear()` - Clear canvas with confirmation
- `autoSave()` - Save draft every 30 seconds

**Emits**:
- `save` - Outfit saved successfully
- `cancel` - User cancelled creation
- `error` - Error occurred

**Template Structure**:
```vue
<template>
  <div class="manual-outfit-creator">
    <div class="creator-header">
      <h2>{{ editingOutfitId ? 'Edit Outfit' : 'Create Outfit' }}</h2>
      <button @click="$emit('cancel')" class="close-btn">×</button>
    </div>

    <div class="creator-body">
      <!-- Sidebar -->
      <ClosetItemsSidebar
        :items="filteredItems"
        :search-query="searchQuery"
        :category-filter="categoryFilter"
        @item-drag-start="handleItemDragStart"
        @search="handleSearch"
        @filter="handleCategoryFilter"
      />

      <!-- Canvas -->
      <OutfitCanvas
        :items="canvasItems"
        :editable="true"
        @item-moved="handleItemMove"
        @item-removed="handleItemRemove"
        @item-reordered="handleZIndexChange"
      />
    </div>

    <div class="creator-footer">
      <div class="footer-left">
        <button @click="handleClear" class="btn-secondary">
          Clear Canvas
        </button>
        <span v-if="isDirty" class="auto-save-indicator">
          Auto-saving...
        </span>
      </div>
      <div class="footer-right">
        <button @click="$emit('cancel')" class="btn-secondary">
          Cancel
        </button>
        <button @click="handleSave" :disabled="canvasItems.length === 0" class="btn-primary">
          Save Outfit
        </button>
      </div>
    </div>

    <!-- Save Dialog -->
    <SaveOutfitDialog
      v-if="showSaveDialog"
      :outfit-items="canvasItems"
      @save="saveFinal"
      @cancel="showSaveDialog = false"
    />
  </div>
</template>
```

---

### 2. OutfitCanvas.vue (Component)

**Purpose**: Canvas area where items are positioned and arranged

**Props**:
- `items` (Array) - Items with positions `[{item_id, x, y, z_index, ...}]`
- `editable` (Boolean, default: true) - Can items be moved/removed
- `width` (Number, default: 800) - Canvas width in pixels
- `height` (Number, default: 1200) - Canvas height in pixels

**State**:
```javascript
{
  draggedItemId: null,
  dragOffset: { x: 0, y: 0 },
  canvasBounds: null
}
```

**Features**:
1. **Drag and Drop**:
   - Items draggable from sidebar onto canvas
   - Items can be repositioned on canvas
   - Snap to grid (optional, 10px grid)

2. **Item Controls**:
   - Remove button (X) in top-right corner
   - Z-index controls (right-click menu or buttons)
   - Hover highlight

3. **Visual Feedback**:
   - Drop zone indicator when dragging
   - Item shadows for depth
   - Grid lines (optional)

**Template**:
```vue
<template>
  <div 
    class="outfit-canvas"
    :style="{ width: `${width}px`, height: `${height}px` }"
    @drop="handleDrop"
    @dragover.prevent
  >
    <!-- Grid Background (optional) -->
    <div class="canvas-grid"></div>

    <!-- Empty State -->
    <div v-if="items.length === 0" class="canvas-empty-state">
      <div class="empty-icon">👕</div>
      <p>Drag items here to create your outfit</p>
    </div>

    <!-- Positioned Items -->
    <div
      v-for="item in sortedItems"
      :key="item.item_id"
      class="canvas-item"
      :class="{ 'is-dragging': draggedItemId === item.item_id }"
      :style="{
        left: `${item.x}px`,
        top: `${item.y}px`,
        zIndex: item.z_index
      }"
      :draggable="editable"
      @dragstart="startDrag(item, $event)"
      @dragend="endDrag"
    >
      <!-- Item Image -->
      <img
        :src="item.thumbnail_url || item.image_url"
        :alt="item.name"
        class="canvas-item-image"
      />

      <!-- Remove Button -->
      <button
        v-if="editable"
        class="remove-btn"
        @click="$emit('item-removed', item.item_id)"
      >
        ×
      </button>

      <!-- Z-Index Controls -->
      <div v-if="editable" class="z-index-controls">
        <button @click="$emit('item-reordered', item.item_id, 'up')" title="Bring forward">
          ▲
        </button>
        <button @click="$emit('item-reordered', item.item_id, 'down')" title="Send backward">
          ▼
        </button>
      </div>

      <!-- Item Name -->
      <div class="canvas-item-name">{{ item.name }}</div>
    </div>
  </div>
</template>
```

**Methods**:
- `handleDrop(event)` - Handle item drop on canvas
- `startDrag(item, event)` - Start dragging existing item
- `endDrag()` - Finish drag operation
- `getDropPosition(event)` - Calculate x, y from drop event

**Emits**:
- `item-moved` - `(itemId, x, y)`
- `item-removed` - `(itemId)`
- `item-reordered` - `(itemId, direction)` // 'up' or 'down'

---

### 3. ClosetItemsSidebar.vue (Component)

**Purpose**: Sidebar showing all closet items as draggable thumbnails

**Props**:
- `items` (Array) - Closet items to display
- `searchQuery` (String) - Current search query
- `categoryFilter` (String) - Current category filter

**Template**:
```vue
<template>
  <div class="closet-sidebar">
    <!-- Search -->
    <div class="sidebar-search">
      <input
        type="text"
        :value="searchQuery"
        @input="$emit('search', $event.target.value)"
        placeholder="Search items..."
        class="search-input"
      />
      <span class="search-icon">🔍</span>
    </div>

    <!-- Category Filters -->
    <div class="sidebar-filters">
      <button
        v-for="category in categories"
        :key="category.value"
        :class="{ active: categoryFilter === category.value }"
        @click="$emit('filter', category.value)"
        class="filter-chip"
      >
        {{ category.label }}
      </button>
    </div>

    <!-- Item Count -->
    <div class="sidebar-count">
      {{ items.length }} item{{ items.length !== 1 ? 's' : '' }}
    </div>

    <!-- Items Grid -->
    <div class="sidebar-items-grid">
      <div
        v-for="item in items"
        :key="item.id"
        class="sidebar-item"
        :draggable="true"
        @dragstart="handleDragStart(item, $event)"
      >
        <img
          :src="item.thumbnail_url || item.image_url"
          :alt="item.name"
          class="sidebar-item-image"
        />
        <div class="sidebar-item-name">{{ item.name }}</div>
        <div class="sidebar-item-category">{{ item.category }}</div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="items.length === 0" class="sidebar-empty">
      <p>No items found</p>
      <p class="text-sm">Try different filters</p>
    </div>
  </div>
</template>
```

**Data**:
```javascript
{
  categories: [
    { value: 'all', label: 'All' },
    { value: 'top', label: 'Tops' },
    { value: 'bottom', label: 'Bottoms' },
    { value: 'shoes', label: 'Shoes' },
    { value: 'outerwear', label: 'Outerwear' },
    { value: 'accessories', label: 'Accessories' }
  ]
}
```

**Methods**:
- `handleDragStart(item, event)` - Set drag data and emit event

**Emits**:
- `item-drag-start` - `(item)`
- `search` - `(query)`
- `filter` - `(category)`

---

### 4. SaveOutfitDialog.vue (Component)

**Purpose**: Dialog for saving outfit with name, notes, and tags

**Props**:
- `outfitItems` (Array) - Items in the outfit

**Template**:
```vue
<template>
  <Modal @close="$emit('cancel')">
    <div class="save-outfit-dialog">
      <h3>Save Outfit</h3>

      <!-- Outfit Name -->
      <div class="form-group">
        <label for="outfit-name">Outfit Name *</label>
        <input
          id="outfit-name"
          v-model="outfitName"
          type="text"
          placeholder="e.g., Summer Beach Look"
          maxlength="100"
          required
        />
      </div>

      <!-- Notes -->
      <div class="form-group">
        <label for="outfit-notes">Notes (optional)</label>
        <textarea
          id="outfit-notes"
          v-model="outfitNotes"
          placeholder="Add any notes about this outfit..."
          rows="3"
          maxlength="500"
        ></textarea>
      </div>

      <!-- Tags -->
      <div class="form-group">
        <label for="outfit-tags">Tags (optional)</label>
        <input
          id="outfit-tags"
          v-model="tagsInput"
          type="text"
          placeholder="casual, summer, beach (comma separated)"
        />
        <div class="tags-preview">
          <span v-for="tag in parsedTags" :key="tag" class="tag-chip">
            {{ tag }}
          </span>
        </div>
      </div>

      <!-- Preview -->
      <div class="outfit-preview">
        <p class="preview-label">{{ outfitItems.length }} items</p>
        <div class="preview-grid">
          <img
            v-for="item in outfitItems.slice(0, 4)"
            :key="item.item_id"
            :src="item.thumbnail_url || item.image_url"
            :alt="item.name"
            class="preview-thumbnail"
          />
          <div v-if="outfitItems.length > 4" class="preview-more">
            +{{ outfitItems.length - 4 }}
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="dialog-actions">
        <button @click="$emit('cancel')" class="btn-secondary">
          Cancel
        </button>
        <button
          @click="handleSave"
          :disabled="!outfitName.trim()"
          class="btn-primary"
        >
          Save Outfit
        </button>
      </div>
    </div>
  </Modal>
</template>
```

**Data**:
```javascript
{
  outfitName: '',
  outfitNotes: '',
  tagsInput: ''
}
```

**Computed**:
- `parsedTags` - Split tagsInput by comma and trim

**Methods**:
- `handleSave()` - Emit save with form data

**Emits**:
- `save` - `{ name, notes, tags }`
- `cancel`

---

## Service Functions

### outfit-service.js

```javascript
/**
 * Create manual outfit
 * @param {Object} data - Outfit data
 * @param {string} data.name - Outfit name
 * @param {string} data.notes - Optional notes
 * @param {Array} data.items - Items with positions [{item_id, x, y, z_index}]
 * @param {Array} data.tags - Optional tags
 * @returns {Promise<Object>} Created outfit
 */
export async function createManualOutfit(data) {
  const { data: outfit, error } = await supabase
    .from('generated_outfits')
    .insert({
      is_manual: true,
      outfit_name: data.name,
      outfit_notes: data.notes || null,
      item_ids: data.items.map(item => item.item_id),
      item_positions: data.items.map(item => ({
        item_id: item.item_id,
        x: item.x,
        y: item.y,
        z_index: item.z_index
      })),
      tags: data.tags || [],
      user_id: (await getCurrentUser()).id
    })
    .select()
    .single();

  if (error) throw error;
  return outfit;
}

/**
 * Update manual outfit
 * @param {string} outfitId - Outfit ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated outfit
 */
export async function updateManualOutfit(outfitId, updates) {
  const payload = {
    updated_at: new Date().toISOString()
  };

  if (updates.name) payload.outfit_name = updates.name;
  if (updates.notes !== undefined) payload.outfit_notes = updates.notes;
  if (updates.items) {
    payload.item_ids = updates.items.map(item => item.item_id);
    payload.item_positions = updates.items.map(item => ({
      item_id: item.item_id,
      x: item.x,
      y: item.y,
      z_index: item.z_index
    }));
  }
  if (updates.tags) payload.tags = updates.tags;

  const { data: outfit, error } = await supabase
    .from('generated_outfits')
    .update(payload)
    .eq('id', outfitId)
    .eq('is_manual', true)
    .select()
    .single();

  if (error) throw error;
  return outfit;
}

/**
 * Get outfit by ID (auto or manual)
 * @param {string} outfitId - Outfit ID
 * @returns {Promise<Object>} Outfit with items
 */
export async function getOutfitById(outfitId) {
  const { data: outfit, error } = await supabase
    .from('generated_outfits')
    .select(`
      *,
      items:item_ids
    `)
    .eq('id', outfitId)
    .single();

  if (error) throw error;

  // Fetch full item details
  const { data: items } = await supabase
    .from('clothes')
    .select('*')
    .in('id', outfit.item_ids);

  // Merge positions if manual outfit
  if (outfit.is_manual && outfit.item_positions) {
    outfit.items = items.map(item => {
      const position = outfit.item_positions.find(p => p.item_id === item.id);
      return { ...item, ...position };
    });
  } else {
    outfit.items = items;
  }

  return outfit;
}

/**
 * Delete outfit
 * @param {string} outfitId - Outfit ID
 * @returns {Promise<void>}
 */
export async function deleteOutfit(outfitId) {
  const { error } = await supabase
    .from('generated_outfits')
    .delete()
    .eq('id', outfitId);

  if (error) throw error;
}

/**
 * List user's outfits (both auto and manual)
 * @param {Object} filters - Optional filters
 * @param {boolean} filters.manualOnly - Show only manual outfits
 * @param {boolean} filters.autoOnly - Show only auto-generated outfits
 * @returns {Promise<Array>} List of outfits
 */
export async function listOutfits(filters = {}) {
  let query = supabase
    .from('generated_outfits')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters.manualOnly) {
    query = query.eq('is_manual', true);
  } else if (filters.autoOnly) {
    query = query.eq('is_manual', false);
  }

  const { data: outfits, error } = await query;

  if (error) throw error;
  return outfits;
}
```

---

## Store (Pinia)

### outfit-store.js

```javascript
import { defineStore } from 'pinia';
import {
  createManualOutfit,
  updateManualOutfit,
  getOutfitById,
  deleteOutfit,
  listOutfits
} from '@/services/outfit-service';

export const useOutfitStore = defineStore('outfits', {
  state: () => ({
    outfits: [],
    currentOutfit: null,
    loading: false,
    error: null
  }),

  actions: {
    async fetchOutfits(filters = {}) {
      this.loading = true;
      this.error = null;
      try {
        this.outfits = await listOutfits(filters);
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async createManual(outfitData) {
      this.loading = true;
      this.error = null;
      try {
        const outfit = await createManualOutfit(outfitData);
        this.outfits.unshift(outfit);
        return outfit;
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateManual(outfitId, updates) {
      this.loading = true;
      this.error = null;
      try {
        const outfit = await updateManualOutfit(outfitId, updates);
        const index = this.outfits.findIndex(o => o.id === outfitId);
        if (index !== -1) {
          this.outfits[index] = outfit;
        }
        return outfit;
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async delete(outfitId) {
      this.loading = true;
      this.error = null;
      try {
        await deleteOutfit(outfitId);
        this.outfits = this.outfits.filter(o => o.id !== outfitId);
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    }
  }
});
```

---

## Styling Notes

### Canvas Styling
- Background: White or light gray (#f8f9fa)
- Grid lines: Light gray (#e0e0e0), 10px spacing
- Drop zone: Dashed border when dragging (#007bff)

### Item Styling on Canvas
- Shadow: `box-shadow: 0 2px 8px rgba(0,0,0,0.1)`
- Hover: Slightly larger shadow
- Dragging: Increased opacity (0.6)
- Remove button: Red background (#dc3545)

### Sidebar Styling
- Width: 300px (fixed)
- Background: Light gray (#f5f5f5)
- Item thumbnails: 80px × 80px
- Grid gap: 12px

---

## Mobile Responsiveness

### Small Screens (< 768px)
- Stack sidebar above canvas (vertical layout)
- Sidebar: Full width, scrollable horizontally
- Canvas: Full width, scaled proportionally
- Touch drag-and-drop support

### Touch Interactions
- Long press to start drag (500ms)
- Pinch to zoom canvas (optional)
- Double-tap item to remove

---

## Accessibility

### Keyboard Navigation
- Tab through items in sidebar
- Enter/Space to select item
- Arrow keys to position on canvas
- Delete key to remove selected item

### Screen Reader
- Announce when item added to canvas
- Announce item positions
- Describe canvas contents

### Focus Management
- Clear focus indicators
- Focus trap in modal/dialog
- Return focus after save/cancel
