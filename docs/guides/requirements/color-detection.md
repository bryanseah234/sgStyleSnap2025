# Color Detection AI - Requirements

## Overview
The Color Detection AI feature automatically detects and extracts the dominant colors from clothing item images when users upload them. This eliminates manual color tagging, improves outfit matching accuracy, and enables powerful color-based search and filtering.

## Business Requirements

### User Stories
1. **As a user**, I want colors automatically detected when I upload a photo so I don't have to tag them manually
2. **As a user**, I want to see the detected primary and secondary colors for each item so I can verify accuracy
3. **As a user**, I want to manually adjust detected colors if they're incorrect so I have control over my data
4. **As a user**, I want to search my closet by color so I can find matching items quickly
5. **As a user**, I want color-based outfit suggestions so I can create harmonious looks
6. **As a system**, I want to normalize colors to 18 standard colors so outfit matching is consistent

### Success Criteria
- Color detection accuracy ≥ 85% (manual verification)
- Detection completes in < 2 seconds per image
- Users can manually override detected colors
- Color-based search returns results in < 300ms
- Outfit suggestions use color harmony rules

## Functional Requirements

### 1. Color Detection
- **FR-001**: Automatically detect colors when user uploads image
- **FR-002**: Extract primary color (most dominant)
- **FR-003**: Extract up to 3 secondary colors (other prominent colors)
- **FR-004**: Map detected colors to 18 standardized colors
- **FR-005**: Display confidence score for each detected color
- **FR-006**: Fall back to manual selection if detection fails

### 2. Color Palette
The system uses 18 standardized colors:

**Neutrals** (6 colors):
- Black
- White
- Gray
- Beige
- Brown
- Navy

**Primary Colors** (3 colors):
- Red
- Blue
- Yellow

**Secondary Colors** (3 colors):
- Orange
- Green
- Purple

**Extended Colors** (6 colors):
- Pink
- Burgundy
- Teal
- Olive
- Cream
- Denim

### 3. Color Storage
- **FR-007**: Store `primary_color` (single value) in database
- **FR-008**: Store `secondary_colors` (array, up to 3 values) in database
- **FR-009**: Index colors for fast querying
- **FR-010**: Allow updates to colors after initial detection

### 4. Manual Color Override
- **FR-011**: Show color picker with 18 standard colors
- **FR-012**: Allow user to change primary color
- **FR-013**: Allow user to add/remove secondary colors
- **FR-014**: Highlight currently detected colors
- **FR-015**: Save changes immediately or on form submit

### 5. Color-Based Search
- **FR-016**: Filter closet items by primary color
- **FR-017**: Filter closet items by secondary colors
- **FR-018**: Show color distribution statistics (% of items per color)
- **FR-019**: Find items with complementary colors
- **FR-020**: Find items with analogous colors

### 6. Color Harmony
- **FR-021**: Implement color wheel for complementary colors
- **FR-022**: Suggest complementary color pairs (e.g., blue ↔ orange)
- **FR-023**: Suggest analogous color groups (e.g., blue, teal, green)
- **FR-024**: Suggest triadic color schemes (3 equidistant colors)
- **FR-025**: Use color harmony in outfit suggestions

## Technical Requirements

### Database Schema
```sql
-- Alter clothes table
ALTER TABLE clothes
  ADD COLUMN primary_color VARCHAR(50),
  ADD COLUMN secondary_colors VARCHAR(50)[];

-- Add color validation constraint
ALTER TABLE clothes
  ADD CONSTRAINT valid_colors
  CHECK (
    primary_color IN (
      'black', 'white', 'gray', 'beige', 'brown', 'navy',
      'red', 'blue', 'yellow', 'orange', 'green', 'purple',
      'pink', 'burgundy', 'teal', 'olive', 'cream', 'denim'
    )
  );

-- Create indexes
CREATE INDEX idx_clothes_primary_color ON clothes(primary_color);
CREATE INDEX idx_clothes_secondary_colors ON clothes USING gin(secondary_colors);
```

### Color Detection Library
**Option 1: Color Thief** (Recommended)
- **Pros**: Simple API, accurate, browser-compatible
- **Cons**: Requires canvas API
- **Usage**:
  ```javascript
  import ColorThief from 'colorthief';
  const colorThief = new ColorThief();
  const dominantColor = colorThief.getColor(img);
  const palette = colorThief.getPalette(img, 4);
  ```

**Option 2: Vibrant.js**
- **Pros**: Advanced color extraction, swatch generation
- **Cons**: Heavier library, more complex API
- **Usage**:
  ```javascript
  import Vibrant from 'node-vibrant';
  const palette = await Vibrant.from(imageUrl).getPalette();
  const dominantColor = palette.Vibrant.rgb;
  ```

### Color Mapping Algorithm
```javascript
// Map RGB to closest standard color
function mapToStandardColor(rgb) {
  const [r, g, b] = rgb;
  
  // Calculate color properties
  const brightness = (r + g + b) / 3;
  const saturation = Math.max(r, g, b) - Math.min(r, g, b);
  
  // Neutrals (low saturation)
  if (saturation < 30) {
    if (brightness < 50) return 'black';
    if (brightness > 220) return 'white';
    if (brightness > 180) return 'cream';
    if (brightness > 140) return 'beige';
    return 'gray';
  }
  
  // Colors (high saturation)
  const maxChannel = Math.max(r, g, b);
  const minChannel = Math.min(r, g, b);
  
  // Red family
  if (r === maxChannel && g < 150 && b < 150) {
    return brightness < 100 ? 'burgundy' : 'red';
  }
  
  // Blue family
  if (b === maxChannel) {
    if (r < 100 && g < 100) return brightness < 80 ? 'navy' : 'blue';
    if (g > r) return 'teal';
    return 'denim';
  }
  
  // Green family
  if (g === maxChannel && r < 150 && b < 150) {
    return brightness < 100 ? 'olive' : 'green';
  }
  
  // Mixed colors
  if (r > 200 && g > 100 && g < 200) return 'orange';
  if (r > 150 && g < 100 && b > 150) return 'purple';
  if (r > 200 && g > 150 && b > 150) return 'pink';
  if (r > 200 && g > 200 && b < 150) return 'yellow';
  
  return 'gray'; // Default fallback
}
```

### API Endpoints

#### 1. Detect Colors from Image
```
POST /api/colors/detect
Body:
  {
    "imageUrl": "https://cloudinary.com/...",
    "itemId": "uuid" (optional)
  }
Response:
  {
    "primaryColor": "blue",
    "secondaryColors": ["white", "gray"],
    "confidence": 0.92,
    "rawColors": [
      { "rgb": [45, 82, 120], "percentage": 45 },
      { "rgb": [230, 230, 230], "percentage": 30 }
    ]
  }
```

#### 2. Update Item Colors
```
PATCH /api/clothes/:id/colors
Body:
  {
    "primaryColor": "red",
    "secondaryColors": ["black", "white"]
  }
Response:
  {
    "success": true,
    "item": { ... }
  }
```

#### 3. Get Color Statistics
```
GET /api/colors/stats
Response:
  {
    "distribution": [
      { "color": "black", "count": 25, "percentage": 20 },
      { "color": "white", "count": 18, "percentage": 14.4 }
    ],
    "totalItems": 125,
    "dominantColor": "black"
  }
```

#### 4. Find Complementary Colors
```
GET /api/colors/complementary?color=blue
Response:
  {
    "inputColor": "blue",
    "complementary": "orange",
    "analogous": ["teal", "purple"],
    "triadic": ["orange", "green"]
  }
```

### Frontend Components

#### 1. ColorPicker.vue
- Visual color selection grid (18 colors)
- Props: `selectedPrimary`, `selectedSecondary`, `maxSecondary` (default: 3)
- Emits: `update:primary`, `update:secondary`
- Shows: color swatches, color names, selected state

#### 2. ColorDetector.vue (Internal Utility Component)
- Hidden component for color detection
- Uses: ColorThief library
- Props: `imageUrl`, `autoDetect`
- Emits: `colorsDetected`, `error`

#### 3. Updated AddItemForm.vue
- Integrates ColorDetector
- Shows detected colors after image upload
- Allows manual color override via ColorPicker
- Displays confidence score

#### 4. Updated ClosetGrid.vue
- Shows color badges on item cards
- Adds color filter dropdown
- Highlights items matching selected color

### Utility File (color-detector.js)

```javascript
import ColorThief from 'colorthief';

export class ColorDetector {
  constructor() {
    this.colorThief = new ColorThief();
    this.standardColors = [ /* 18 colors */ ];
  }

  async detectColors(imageUrl) {
    const img = await this.loadImage(imageUrl);
    const dominantColor = this.colorThief.getColor(img);
    const palette = this.colorThief.getPalette(img, 4);
    
    const primaryColor = this.mapToStandardColor(dominantColor);
    const secondaryColors = palette
      .slice(1, 4)
      .map(rgb => this.mapToStandardColor(rgb))
      .filter(color => color !== primaryColor);
    
    return {
      primaryColor,
      secondaryColors,
      confidence: this.calculateConfidence(palette)
    };
  }

  mapToStandardColor(rgb) { /* Algorithm above */ }
  
  calculateConfidence(palette) {
    // Calculate based on color diversity and dominance
  }
  
  getComplementaryColor(color) { /* Color wheel logic */ }
  
  getAnalogousColors(color) { /* Color wheel logic */ }
  
  getTriadicColors(color) { /* Color wheel logic */ }
}
```

## Non-Functional Requirements

### Performance
- **NFR-001**: Color detection completes in < 2 seconds
- **NFR-002**: Detection runs in browser (no server required)
- **NFR-003**: Color-based search returns results in < 300ms
- **NFR-004**: Color picker renders all 18 colors in < 100ms

### Accuracy
- **NFR-005**: Primary color accuracy ≥ 85% (verified by manual testing)
- **NFR-006**: Secondary colors accuracy ≥ 70%
- **NFR-007**: Neutral detection accuracy ≥ 90%
- **NFR-008**: Color mapping is consistent (same input → same output)

### Usability
- **NFR-009**: Color picker is touch-friendly (44x44px swatches)
- **NFR-010**: Color names are displayed (not just swatches)
- **NFR-011**: Selected colors are clearly highlighted
- **NFR-012**: Manual override is obvious and easy to use
- **NFR-013**: Loading states show during detection

### Accessibility
- **NFR-014**: Color names are provided (not color-blind dependent)
- **NFR-015**: Color swatches have text labels
- **NFR-016**: ARIA labels for color picker
- **NFR-017**: Keyboard navigation for color selection

## Dependencies
- **Task 3**: Closet CRUD & Image Management (image uploads)
- **SQL Migration 006**: Color detection database schema
- **Library**: Color Thief or Vibrant.js (npm install)

## Testing Requirements

### Unit Tests
- Test `mapToStandardColor()` with RGB values
- Test complementary color calculations
- Test analogous color calculations
- Test color validation constraints
- Test color statistics calculations

### Integration Tests
- Test color detection API endpoint
- Test database queries with color filters
- Test color update endpoint
- Test color harmony algorithms

### E2E Tests
1. User uploads image and colors are detected automatically
2. User sees detected primary and secondary colors
3. User manually overrides primary color
4. User adds secondary color
5. User searches closet by color and sees filtered results
6. User views color statistics

## Future Enhancements
1. **Pattern Detection**: Detect patterns (stripes, polka dots, floral)
2. **Material Detection**: Detect fabric type (denim, cotton, silk)
3. **ML Model**: Train custom model on fashion images
4. **Color Trend Analysis**: Show trending colors in user's closet
5. **Color Blindness Mode**: Alternative color naming schemes
6. **Historical Color Tracking**: Track color preferences over time
7. **Season-Based Colors**: Recommend colors for current season

## Acceptance Criteria
- [ ] Colors are detected automatically on image upload
- [ ] Primary color accuracy ≥ 85%
- [ ] Secondary colors are stored (up to 3)
- [ ] User can manually override detected colors
- [ ] Color picker shows all 18 standard colors
- [ ] Color-based search works correctly
- [ ] Color statistics display user's color distribution
- [ ] Complementary colors are suggested accurately
- [ ] Loading states show during detection
- [ ] All tests pass (unit, integration, E2E)
- [ ] Code follows StyleSnap standards

## Estimated Effort
- **Database Migration**: 1 hour
- **Color Detection Utility**: 4 hours (ColorThief integration, mapping algorithm)
- **Color Picker Component**: 3 hours
- **AddItemForm Integration**: 2 hours
- **Color Search & Filter**: 3 hours
- **Color Harmony Functions**: 3 hours
- **Testing**: 3 hours
- **Total**: ~19 hours (2-3 days)
