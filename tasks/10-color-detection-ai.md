# Task 10: Color Detection AI

**Status:** 🚧 In Progress  
**Priority:** Medium  
**Estimated Time:** 2-3 days  
**Dependencies:** Task 3 (Closet CRUD & Image Management)

---

## 📋 Overview

Implement AI-powered color detection that automatically identifies and tags the dominant colors in clothing items when users upload photos. This feature enhances searchability and outfit matching capabilities.

**Key Benefits:**
- Automatic color tagging (no manual input)
- Improved search and filtering
- Better outfit matching algorithms
- Enhanced user experience

---

## 🎯 Acceptance Criteria

### Color Detection
- [ ] Integrate color analysis library (e.g., Color Thief, Vibrant.js)
- [ ] Extract dominant colors from uploaded images
- [ ] Map detected colors to predefined color palette
- [ ] Store primary and secondary colors in database
- [ ] Process colors client-side (before upload) or server-side

### Database
- [ ] Add `primary_color` field to `clothes` table
- [ ] Add `secondary_colors` array field to `clothes` table
- [ ] Create color index for filtering
- [ ] Migration file: `sql/006_color_detection.sql`

### Frontend
- [ ] Auto-detect colors on image upload
- [ ] Display detected colors to user
- [ ] Allow manual color correction/override
- [ ] Color picker component for manual selection
- [ ] Visual color indicators on item cards

### API
- [ ] Update `POST /api/clothes` to include color data
- [ ] Update `PUT /api/clothes/:id` to allow color updates
- [ ] Add color filter to `GET /api/clothes` endpoint

### Performance
- [ ] Color detection < 500ms per image
- [ ] Process colors before image upload
- [ ] Cache color detection results
- [ ] Optimize color analysis algorithm

---

## 🎨 Color Palette (Standardized)

```javascript
const COLOR_PALETTE = {
  // Neutrals
  'black': { hex: '#000000', rgb: [0, 0, 0] },
  'white': { hex: '#FFFFFF', rgb: [255, 255, 255] },
  'gray': { hex: '#808080', rgb: [128, 128, 128] },
  'beige': { hex: '#F5F5DC', rgb: [245, 245, 220] },
  'brown': { hex: '#8B4513', rgb: [139, 69, 19] },
  
  // Primary Colors
  'red': { hex: '#FF0000', rgb: [255, 0, 0] },
  'blue': { hex: '#0000FF', rgb: [0, 0, 255] },
  'yellow': { hex: '#FFFF00', rgb: [255, 255, 0] },
  
  // Secondary Colors
  'green': { hex: '#00FF00', rgb: [0, 255, 0] },
  'orange': { hex: '#FFA500', rgb: [255, 165, 0] },
  'purple': { hex: '#800080', rgb: [128, 0, 128] },
  'pink': { hex: '#FFC0CB', rgb: [255, 192, 203] },
  
  // Additional
  'navy': { hex: '#000080', rgb: [0, 0, 128] },
  'teal': { hex: '#008080', rgb: [0, 128, 128] },
  'maroon': { hex: '#800000', rgb: [128, 0, 0] },
  'olive': { hex: '#808000', rgb: [128, 128, 0] },
  'gold': { hex: '#FFD700', rgb: [255, 215, 0] },
  'silver': { hex: '#C0C0C0', rgb: [192, 192, 192] }
};
```

---

## 📊 Database Changes

### Migration: `sql/006_color_detection.sql`

```sql
-- Add color fields to clothes table
ALTER TABLE clothes 
  ADD COLUMN primary_color VARCHAR(50),
  ADD COLUMN secondary_colors VARCHAR(50)[];

-- Create index for color filtering
CREATE INDEX idx_clothes_primary_color ON clothes(primary_color);
CREATE INDEX idx_clothes_secondary_colors ON clothes USING gin(secondary_colors);

-- Add color validation constraint
ALTER TABLE clothes 
  ADD CONSTRAINT check_primary_color 
  CHECK (primary_color IN (
    'black', 'white', 'gray', 'beige', 'brown',
    'red', 'blue', 'yellow', 'green', 'orange', 
    'purple', 'pink', 'navy', 'teal', 'maroon',
    'olive', 'gold', 'silver'
  ));
```

---

## 🔧 Implementation: Color Detection Utility

### File: `src/utils/color-detector.js`

```javascript
import ColorThief from 'colorthief';

/**
 * Color detector utility for extracting dominant colors from images
 */
class ColorDetector {
  constructor() {
    this.colorThief = new ColorThief();
    this.palette = COLOR_PALETTE; // Imported from config
  }

  /**
   * Detect dominant colors from an image file
   * @param {File|HTMLImageElement} image - Image to analyze
   * @param {number} colorCount - Number of colors to extract (default: 3)
   * @returns {Promise<{primary: string, secondary: string[]}>}
   */
  async detectColors(image, colorCount = 3) {
    try {
      // Convert File to Image element if needed
      const img = await this.loadImage(image);
      
      // Extract color palette
      const palette = this.colorThief.getPalette(img, colorCount);
      
      // Map RGB values to named colors
      const namedColors = palette.map(rgb => this.findClosestColor(rgb));
      
      return {
        primary: namedColors[0],
        secondary: namedColors.slice(1)
      };
    } catch (error) {
      console.error('Color detection failed:', error);
      throw new Error('Failed to detect colors from image');
    }
  }

  /**
   * Load image from File or URL
   * @private
   */
  async loadImage(source) {
    if (source instanceof HTMLImageElement) {
      return source;
    }
    
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      
      img.onload = () => resolve(img);
      img.onerror = reject;
      
      if (source instanceof File) {
        const reader = new FileReader();
        reader.onload = (e) => {
          img.src = e.target.result;
        };
        reader.readAsDataURL(source);
      } else {
        img.src = source;
      }
    });
  }

  /**
   * Find closest named color from RGB values
   * @private
   */
  findClosestColor(rgb) {
    let minDistance = Infinity;
    let closestColor = 'gray';
    
    for (const [name, value] of Object.entries(this.palette)) {
      const distance = this.colorDistance(rgb, value.rgb);
      if (distance < minDistance) {
        minDistance = distance;
        closestColor = name;
      }
    }
    
    return closestColor;
  }

  /**
   * Calculate Euclidean distance between two RGB colors
   * @private
   */
  colorDistance(rgb1, rgb2) {
    const rDiff = rgb1[0] - rgb2[0];
    const gDiff = rgb1[1] - rgb2[1];
    const bDiff = rgb1[2] - rgb2[2];
    
    return Math.sqrt(rDiff * rDiff + gDiff * gDiff + bDiff * bDiff);
  }

  /**
   * Get hex color from named color
   */
  getHexColor(colorName) {
    return this.palette[colorName]?.hex || '#808080';
  }
}

export default new ColorDetector();
```

---

## 🎨 Frontend Components

### 1. Update `AddItemForm.vue`

```vue
<template>
  <form @submit.prevent="handleSubmit" class="add-item-form">
    <!-- Existing fields... -->
    
    <!-- Image Upload -->
    <div class="form-group">
      <label>Photo</label>
      <input 
        type="file" 
        accept="image/*"
        @change="handleImageSelect"
        required
      />
      
      <!-- Image Preview -->
      <div v-if="imagePreview" class="image-preview">
        <img :src="imagePreview" alt="Preview" />
        
        <!-- Detected Colors -->
        <div v-if="detectedColors" class="detected-colors">
          <h4>Detected Colors:</h4>
          <div class="color-chips">
            <div 
              v-for="color in [detectedColors.primary, ...detectedColors.secondary]"
              :key="color"
              class="color-chip"
              :style="{ backgroundColor: getColorHex(color) }"
              :title="color"
            >
              {{ color }}
            </div>
          </div>
          
          <Button 
            type="button" 
            variant="secondary"
            @click="showColorPicker = true"
          >
            Adjust Colors
          </Button>
        </div>
      </div>
    </div>
    
    <!-- Color Picker Modal (optional override) -->
    <Modal v-if="showColorPicker" @close="showColorPicker = false">
      <ColorPicker 
        :primary="detectedColors.primary"
        :secondary="detectedColors.secondary"
        @update="handleColorUpdate"
      />
    </Modal>
    
    <!-- Existing submit button... -->
  </form>
</template>

<script setup>
import { ref } from 'vue';
import colorDetector from '@/utils/color-detector';
import { useNotification } from '@/composables/useNotification';

const imageFile = ref(null);
const imagePreview = ref(null);
const detectedColors = ref(null);
const detectingColors = ref(false);
const showColorPicker = ref(false);

const { showNotification } = useNotification();

async function handleImageSelect(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  imageFile.value = file;
  imagePreview.value = URL.createObjectURL(file);
  
  // Detect colors
  detectingColors.value = true;
  try {
    detectedColors.value = await colorDetector.detectColors(file);
  } catch (error) {
    showNotification('Failed to detect colors', 'error');
    // Set default colors
    detectedColors.value = {
      primary: 'gray',
      secondary: []
    };
  } finally {
    detectingColors.value = false;
  }
}

function handleColorUpdate(colors) {
  detectedColors.value = colors;
  showColorPicker.value = false;
}

function getColorHex(colorName) {
  return colorDetector.getHexColor(colorName);
}

async function handleSubmit() {
  // Include detected colors in form submission
  const formData = {
    // ... other fields
    primary_color: detectedColors.value.primary,
    secondary_colors: detectedColors.value.secondary,
    image: imageFile.value
  };
  
  // Submit to API...
}
</script>
```

### 2. New Component: `ColorPicker.vue`

```vue
<template>
  <div class="color-picker">
    <h2>Adjust Colors</h2>
    
    <div class="color-section">
      <h3>Primary Color</h3>
      <div class="color-grid">
        <button
          v-for="(color, name) in colorPalette"
          :key="name"
          type="button"
          class="color-button"
          :class="{ active: selectedPrimary === name }"
          :style="{ backgroundColor: color.hex }"
          @click="selectedPrimary = name"
        >
          <span class="color-name">{{ name }}</span>
        </button>
      </div>
    </div>
    
    <div class="color-section">
      <h3>Secondary Colors (Optional)</h3>
      <div class="color-grid">
        <button
          v-for="(color, name) in colorPalette"
          :key="name"
          type="button"
          class="color-button"
          :class="{ active: selectedSecondary.includes(name) }"
          :style="{ backgroundColor: color.hex }"
          @click="toggleSecondary(name)"
        >
          <span class="color-name">{{ name }}</span>
        </button>
      </div>
    </div>
    
    <div class="actions">
      <Button @click="saveColors">Save Colors</Button>
      <Button variant="secondary" @click="$emit('close')">Cancel</Button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { COLOR_PALETTE } from '@/config/colors';

const props = defineProps({
  primary: String,
  secondary: Array
});

const emit = defineEmits(['update', 'close']);

const selectedPrimary = ref(props.primary);
const selectedSecondary = ref([...props.secondary]);
const colorPalette = COLOR_PALETTE;

function toggleSecondary(colorName) {
  const index = selectedSecondary.value.indexOf(colorName);
  if (index > -1) {
    selectedSecondary.value.splice(index, 1);
  } else {
    if (selectedSecondary.value.length < 2) {
      selectedSecondary.value.push(colorName);
    }
  }
}

function saveColors() {
  emit('update', {
    primary: selectedPrimary.value,
    secondary: selectedSecondary.value
  });
}
</script>
```

### 3. Update `ClosetGrid.vue` - Add Color Indicators

```vue
<template>
  <div class="closet-grid">
    <div v-for="item in items" :key="item.id" class="item-card">
      <img :src="item.thumbnail_url" :alt="item.name" />
      
      <!-- Color Indicators -->
      <div class="color-indicators">
        <div 
          class="color-dot"
          :style="{ backgroundColor: getColorHex(item.primary_color) }"
          :title="item.primary_color"
        />
        <div 
          v-for="color in item.secondary_colors"
          :key="color"
          class="color-dot secondary"
          :style="{ backgroundColor: getColorHex(color) }"
          :title="color"
        />
      </div>
      
      <!-- Rest of card... -->
    </div>
  </div>
</template>
```

---

## 🔌 API Updates

### Update `clothes-service.js`

```javascript
// Add color data to create/update methods

async createClothingItem(data) {
  const formData = new FormData();
  formData.append('name', data.name);
  formData.append('category', data.category);
  formData.append('image', data.image);
  formData.append('primary_color', data.primary_color);
  formData.append('secondary_colors', JSON.stringify(data.secondary_colors));
  // ... other fields
  
  const response = await api.post('/clothes', formData);
  return response.data;
}

// Add color filter to fetch method
async fetchClothes(filters = {}) {
  const params = {
    category: filters.category,
    color: filters.color, // NEW: Filter by color
    ...filters
  };
  
  const response = await api.get('/clothes', { params });
  return response.data;
}
```

---

## 📦 Dependencies

Add to `package.json`:

```json
{
  "dependencies": {
    "colorthief": "^2.4.0",
    // OR alternative:
    "node-vibrant": "^3.2.1"
  }
}
```

---

## 🔧 Implementation Steps

### Phase 1: Research & Setup (4 hours)
1. Research color detection libraries
2. Choose library (Color Thief vs Vibrant.js vs custom)
3. Install dependencies
4. Define color palette (standardized colors)

### Phase 2: Database (2 hours)
1. Create migration file
2. Add color fields to `clothes` table
3. Add indexes
4. Test migration

### Phase 3: Color Detection Utility (6 hours)
1. Create `color-detector.js`
2. Implement color extraction
3. Implement color mapping to palette
4. Test with various images
5. Optimize performance

### Phase 4: Frontend Integration (8 hours)
1. Update `AddItemForm.vue`
2. Add automatic color detection on upload
3. Create `ColorPicker.vue` component
4. Add color indicators to `ClosetGrid.vue`
5. Update filters to include color

### Phase 5: API Integration (4 hours)
1. Update API to accept color data
2. Add color filter to GET endpoint
3. Test all endpoints

### Phase 6: Testing & Polish (4 hours)
1. Test with various image types
2. Test color accuracy
3. Performance testing
4. UI polish
5. Error handling

---

## 📈 Performance Considerations

### Client-Side vs Server-Side

**Client-Side (Recommended for MVP):**
- ✅ Faster feedback to user
- ✅ No server load
- ✅ Works offline
- ❌ Depends on browser support

**Server-Side:**
- ✅ More consistent results
- ✅ Can use more powerful algorithms
- ❌ Adds latency
- ❌ Requires server resources

**Recommendation:** Start with client-side, migrate to server-side if needed

### Optimization Tips

- Process colors BEFORE image upload
- Use Web Workers for heavy computation
- Cache color detection results
- Limit palette to 18 colors (faster matching)
- Use color distance optimization algorithms

---

## 🧪 Testing

### Unit Tests

```javascript
describe('ColorDetector', () => {
  it('should detect dominant color', async () => {
    const image = await loadTestImage('blue-shirt.jpg');
    const colors = await colorDetector.detectColors(image);
    expect(colors.primary).toBe('blue');
  });
  
  it('should handle grayscale images', async () => {
    const image = await loadTestImage('gray-shirt.jpg');
    const colors = await colorDetector.detectColors(image);
    expect(['black', 'white', 'gray']).toContain(colors.primary);
  });
  
  it('should detect multiple colors', async () => {
    const image = await loadTestImage('striped-shirt.jpg');
    const colors = await colorDetector.detectColors(image);
    expect(colors.secondary).toHaveLength(2);
  });
});
```

---

## 🔗 Related Documentation

- **[requirements/color-detection.md](../requirements/color-detection.md)** - Detailed requirements
- **[tasks/03-closet-crud-image-management.md](./03-closet-crud-image-management.md)** - Image upload task
- **[docs/CODE_STANDARDS.md](../docs/CODE_STANDARDS.md)** - Coding conventions

---

## ✅ Definition of Done

- [ ] Color detection library integrated
- [ ] Color palette defined (18 colors)
- [ ] Database migration created and run
- [ ] `color-detector.js` utility created
- [ ] Automatic color detection on upload
- [ ] `ColorPicker.vue` component created
- [ ] Color indicators on item cards
- [ ] Color filter in closet view
- [ ] API updated to handle colors
- [ ] Performance optimized (< 500ms)
- [ ] Unit tests written
- [ ] Tested with various images
- [ ] Documentation updated

---

**Let's add some color to StyleSnap! 🎨**
