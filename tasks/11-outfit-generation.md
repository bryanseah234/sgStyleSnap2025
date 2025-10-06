# Task 11: Outfit Generation from Permutations

**Status:** ✅ Complete (Documentation & SQL)  
**Priority:** High  
**Estimated Time:** 4-5 days  
**Dependencies:** Task 3, Task 5, Task 10 (Color Detection)

---

## 📋 Overview

Implement a **permutation-based outfit generation system** that automatically creates complete outfit suggestions from a user's closet items. The system uses **local algorithms** (no external AI APIs) to generate outfit combinations based on color harmony, style compatibility, weather conditions, and occasion.

**Key Benefits:**
- Helps users discover new outfit combinations
- Reduces decision fatigue ("What should I wear?")
- Maximizes wardrobe utility
- Personalized style recommendations
- **100% Free** - No external API costs
- **Fast** - Generates outfits in milliseconds
- **Privacy** - All processing happens locally

**How It Works:**
1. Generate all valid permutations of user's items (top + bottom + shoes + optional outerwear/accessories)
2. Score each permutation using color harmony rules and style compatibility
3. Filter by weather, occasion, and user preferences
4. Return top-scoring outfit combinations

---

## 🎯 Acceptance Criteria

### AI Algorithm
- [ ] Outfit generation algorithm implemented
- [ ] Color harmony rules defined
- [ ] Style compatibility matrix created
- [ ] Weather-based filtering
- [ ] Occasion-based filtering
- [ ] Learning from user feedback

### Database
- [ ] `generated_outfits` table created
- [ ] Store outfit combinations
- [ ] Track generation parameters
- [ ] Store user ratings/feedback
- [ ] Migration file: `sql/007_outfit_generation.sql`

### API Endpoints
- [ ] `POST /api/outfits/generate` - Generate new outfit
- [ ] `GET /api/outfits/suggested` - Get pre-generated outfits
- [ ] `POST /api/outfits/:id/rate` - Rate generated outfit
- [ ] `POST /api/outfits/:id/save` - Save to collections

### Frontend
- [ ] "Generate Outfit" button/page
- [ ] Outfit generation parameters (occasion, weather, style)
- [ ] Display generated outfit with reasoning
- [ ] Accept/reject/regenerate options
- [ ] Save outfit to collection

### AI Features
- [ ] Color harmony matching (complementary, analogous, triadic)
- [ ] Style consistency (casual, formal, sporty, etc.)
- [ ] Category requirements (top + bottom + shoes minimum)
- [ ] Weather appropriateness
- [ ] User preference learning

---

## 🧠 AI Algorithm Design

### Outfit Generation Rules

```javascript
const OUTFIT_RULES = {
  // Required categories for complete outfit
  required: ['top', 'bottom', 'shoes'],
  optional: ['outerwear', 'accessory'],
  
  // Color harmony schemes
  colorSchemes: {
    monochromatic: 'Single color in different shades',
    analogous: 'Adjacent colors on color wheel',
    complementary: 'Opposite colors on color wheel',
    triadic: 'Three evenly spaced colors',
    neutral: 'Blacks, whites, grays, beige'
  },
  
  // Style compatibility matrix
  styleMatrix: {
    casual: ['casual', 'sporty'],
    formal: ['formal', 'business'],
    sporty: ['sporty', 'casual'],
    business: ['business', 'formal', 'casual']
  },
  
  // Weather appropriateness
  weatherRules: {
    hot: { temp: '> 25°C', categories: ['top', 'bottom', 'shoes'], avoid: ['outerwear'] },
    warm: { temp: '15-25°C', categories: ['top', 'bottom', 'shoes'], optional: ['outerwear'] },
    cool: { temp: '5-15°C', categories: ['top', 'bottom', 'shoes', 'outerwear'] },
    cold: { temp: '< 5°C', categories: ['top', 'bottom', 'shoes', 'outerwear'], required: ['outerwear'] }
  },
  
  // Occasion requirements
  occasions: {
    work: { styles: ['formal', 'business'], avoid: ['sporty'] },
    casual: { styles: ['casual'], avoid: ['formal'] },
    workout: { styles: ['sporty'], require: ['shoes-sneakers'] },
    formal: { styles: ['formal'], avoid: ['casual', 'sporty'] },
    date: { styles: ['formal', 'business', 'casual'] }
  }
};
```

---

## 📊 Database Schema

### New Table: `generated_outfits`

```sql
CREATE TABLE generated_outfits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item_ids UUID[] NOT NULL, -- Array of clothes IDs
  generation_params JSONB, -- Weather, occasion, style preferences
  color_scheme VARCHAR(50), -- monochromatic, complementary, etc.
  style_theme VARCHAR(50), -- casual, formal, sporty, etc.
  occasion VARCHAR(50), -- work, casual, date, workout, etc.
  weather_condition VARCHAR(50), -- hot, warm, cool, cold
  user_rating INTEGER CHECK (user_rating BETWEEN 1 AND 5),
  is_saved BOOLEAN DEFAULT false,
  saved_to_collection_id UUID REFERENCES outfit_collections(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  rated_at TIMESTAMP WITH TIME ZONE,
  saved_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX idx_generated_outfits_user ON generated_outfits(user_id);
CREATE INDEX idx_generated_outfits_rating ON generated_outfits(user_rating) WHERE user_rating IS NOT NULL;
CREATE INDEX idx_generated_outfits_saved ON generated_outfits(is_saved) WHERE is_saved = true;
CREATE INDEX idx_generated_outfits_item_ids ON generated_outfits USING gin(item_ids);

-- Function to check if outfit items exist
CREATE OR REPLACE FUNCTION validate_outfit_items()
RETURNS TRIGGER AS $$
BEGIN
  -- Ensure all items exist and belong to user
  IF NOT EXISTS (
    SELECT 1 FROM clothes
    WHERE id = ANY(NEW.item_ids)
    AND owner_id = NEW.user_id
    AND removed_at IS NULL
  ) THEN
    RAISE EXCEPTION 'One or more items do not exist or do not belong to user';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_outfit_items_trigger
  BEFORE INSERT OR UPDATE ON generated_outfits
  FOR EACH ROW
  EXECUTE FUNCTION validate_outfit_items();
```

---

## 🔧 Implementation: Outfit Generator

### File: `src/services/outfit-generator-service.js`

```javascript
import apiClient from './api';
import colorDetector from '@/utils/color-detector';

/**
 * AI-powered outfit generation service
 */
class OutfitGeneratorService {
  /**
   * Generate a complete outfit based on parameters
   * @param {Object} params - Generation parameters
   * @param {string} params.occasion - work, casual, date, workout, formal
   * @param {string} params.weather - hot, warm, cool, cold
   * @param {string} params.style - casual, formal, sporty, business
   * @param {Array} params.userItems - User's closet items
   * @returns {Promise<Object>} Generated outfit
   */
  async generateOutfit(params) {
    const {
      occasion = 'casual',
      weather = 'warm',
      style = null,
      userItems = []
    } = params;
    
    // Step 1: Filter items by weather
    const weatherAppropriate = this.filterByWeather(userItems, weather);
    
    // Step 2: Filter by occasion/style
    const styleAppropriate = this.filterByStyle(weatherAppropriate, occasion, style);
    
    // Step 3: Generate outfit combinations
    const combinations = this.generateCombinations(styleAppropriate);
    
    // Step 4: Score each combination
    const scoredOutfits = combinations.map(combo => ({
      items: combo,
      score: this.scoreOutfit(combo, { occasion, weather, style })
    }));
    
    // Step 5: Return best outfit
    const bestOutfit = scoredOutfits.sort((a, b) => b.score - a.score)[0];
    
    // Step 6: Save to database
    const response = await apiClient.post('/outfits/generate', {
      item_ids: bestOutfit.items.map(item => item.id),
      generation_params: { occasion, weather, style },
      color_scheme: this.detectColorScheme(bestOutfit.items),
      style_theme: style || this.detectStyleTheme(bestOutfit.items),
      occasion,
      weather_condition: weather
    });
    
    return response.data;
  }

  /**
   * Filter items appropriate for weather
   * @private
   */
  filterByWeather(items, weather) {
    const rules = OUTFIT_RULES.weatherRules[weather];
    
    return items.filter(item => {
      // Check if category is appropriate
      if (rules.avoid && rules.avoid.includes(item.category)) {
        return false;
      }
      
      // TODO: Add more weather logic (fabric, thickness, etc.)
      return true;
    });
  }

  /**
   * Filter items by style compatibility
   * @private
   */
  filterByStyle(items, occasion, preferredStyle) {
    const occasionRules = OUTFIT_RULES.occasions[occasion];
    
    return items.filter(item => {
      // Check style compatibility
      if (preferredStyle) {
        const compatible = OUTFIT_RULES.styleMatrix[preferredStyle];
        if (!item.style_tags.some(tag => compatible.includes(tag))) {
          return false;
        }
      }
      
      // Check occasion requirements
      if (occasionRules.avoid) {
        if (item.style_tags.some(tag => occasionRules.avoid.includes(tag))) {
          return false;
        }
      }
      
      return true;
    });
  }

  /**
   * Generate all valid outfit combinations
   * @private
   */
  generateCombinations(items) {
    const combinations = [];
    const categories = {
      top: items.filter(i => i.category === 'top'),
      bottom: items.filter(i => i.category === 'bottom'),
      shoes: items.filter(i => i.category === 'shoes'),
      outerwear: items.filter(i => i.category === 'outerwear'),
      accessory: items.filter(i => i.category === 'accessory')
    };
    
    // Generate required combinations (top + bottom + shoes)
    for (const top of categories.top) {
      for (const bottom of categories.bottom) {
        for (const shoes of categories.shoes) {
          const combo = [top, bottom, shoes];
          
          // Optionally add outerwear
          if (categories.outerwear.length > 0) {
            for (const outerwear of categories.outerwear) {
              combinations.push([...combo, outerwear]);
            }
          }
          
          // Optionally add accessory
          if (categories.accessory.length > 0) {
            for (const accessory of categories.accessory) {
              combinations.push([...combo, accessory]);
            }
          }
          
          // Base combination
          combinations.push(combo);
        }
      }
    }
    
    return combinations;
  }

  /**
   * Score an outfit combination
   * @private
   */
  scoreOutfit(items, params) {
    let score = 0;
    
    // Color harmony score (0-40 points)
    score += this.scoreColorHarmony(items) * 40;
    
    // Style consistency score (0-30 points)
    score += this.scoreStyleConsistency(items) * 30;
    
    // Completeness score (0-20 points)
    score += this.scoreCompleteness(items) * 20;
    
    // User preference score (0-10 points)
    score += this.scoreUserPreference(items) * 10;
    
    return score;
  }

  /**
   * Score color harmony (0-1)
   * @private
   */
  scoreColorHarmony(items) {
    const colors = items.map(item => item.primary_color);
    
    // Check for monochromatic (all same color)
    const uniqueColors = [...new Set(colors)];
    if (uniqueColors.length === 1) {
      return 1.0; // Perfect monochromatic
    }
    
    // Check for neutral combinations (always safe)
    const neutrals = ['black', 'white', 'gray', 'beige', 'brown'];
    if (colors.every(c => neutrals.includes(c))) {
      return 0.9; // Neutral combinations are safe
    }
    
    // Check for complementary colors
    const complementary = this.getComplementaryColor(colors[0]);
    if (colors.includes(complementary)) {
      return 0.85; // Good complementary match
    }
    
    // Check for analogous colors
    const analogous = this.getAnalogousColors(colors[0]);
    if (colors.some(c => analogous.includes(c))) {
      return 0.8; // Good analogous match
    }
    
    // Default: colors might clash
    return 0.5;
  }

  /**
   * Score style consistency (0-1)
   * @private
   */
  scoreStyleConsistency(items) {
    const styles = items.flatMap(item => item.style_tags || []);
    const uniqueStyles = [...new Set(styles)];
    
    // All items have same style
    if (uniqueStyles.length === 1) {
      return 1.0;
    }
    
    // Check style matrix compatibility
    const compatible = uniqueStyles.every((style, i, arr) => {
      return arr.every(otherStyle => {
        const compat = OUTFIT_RULES.styleMatrix[style];
        return compat && compat.includes(otherStyle);
      });
    });
    
    return compatible ? 0.8 : 0.4;
  }

  /**
   * Score outfit completeness (0-1)
   * @private
   */
  scoreCompleteness(items) {
    const categories = items.map(i => i.category);
    const required = ['top', 'bottom', 'shoes'];
    
    // Check all required categories present
    const hasRequired = required.every(cat => categories.includes(cat));
    if (!hasRequired) return 0;
    
    // Bonus for optional items
    const hasOuterwear = categories.includes('outerwear');
    const hasAccessory = categories.includes('accessory');
    
    if (hasOuterwear && hasAccessory) return 1.0;
    if (hasOuterwear || hasAccessory) return 0.8;
    return 0.6; // Just required items
  }

  /**
   * Score based on user preferences and history (0-1)
   * @private
   */
  scoreUserPreference(items) {
    // TODO: Implement based on user's wear history and ratings
    // For now, return neutral score
    return 0.5;
  }

  /**
   * Detect color scheme used in outfit
   * @private
   */
  detectColorScheme(items) {
    const colors = items.map(item => item.primary_color);
    const uniqueColors = [...new Set(colors)];
    
    if (uniqueColors.length === 1) return 'monochromatic';
    
    const neutrals = ['black', 'white', 'gray', 'beige', 'brown'];
    if (colors.every(c => neutrals.includes(c))) return 'neutral';
    
    // Check for complementary
    const complementary = this.getComplementaryColor(colors[0]);
    if (colors.includes(complementary)) return 'complementary';
    
    // Check for analogous
    const analogous = this.getAnalogousColors(colors[0]);
    if (colors.some(c => analogous.includes(c))) return 'analogous';
    
    return 'mixed';
  }

  /**
   * Detect dominant style theme
   * @private
   */
  detectStyleTheme(items) {
    const styles = items.flatMap(item => item.style_tags || []);
    const styleCounts = styles.reduce((acc, style) => {
      acc[style] = (acc[style] || 0) + 1;
      return acc;
    }, {});
    
    const dominant = Object.entries(styleCounts)
      .sort(([, a], [, b]) => b - a)[0];
    
    return dominant ? dominant[0] : 'mixed';
  }

  /**
   * Get complementary color
   * @private
   */
  getComplementaryColor(color) {
    const complementaryMap = {
      red: 'green',
      green: 'red',
      blue: 'orange',
      orange: 'blue',
      yellow: 'purple',
      purple: 'yellow'
    };
    return complementaryMap[color] || color;
  }

  /**
   * Get analogous colors
   * @private
   */
  getAnalogousColors(color) {
    const analogousMap = {
      red: ['orange', 'pink'],
      orange: ['red', 'yellow'],
      yellow: ['orange', 'green'],
      green: ['yellow', 'teal'],
      blue: ['teal', 'purple'],
      purple: ['blue', 'pink'],
      pink: ['purple', 'red']
    };
    return analogousMap[color] || [];
  }

  /**
   * Get pre-generated outfit suggestions
   */
  async getSuggestedOutfits(params = {}) {
    const response = await apiClient.get('/outfits/suggested', { params });
    return response.data;
  }

  /**
   * Rate a generated outfit
   */
  async rateOutfit(outfitId, rating) {
    const response = await apiClient.post(`/outfits/${outfitId}/rate`, { rating });
    return response.data;
  }

  /**
   * Save outfit to collection
   */
  async saveOutfit(outfitId, collectionId = null) {
    const response = await apiClient.post(`/outfits/${outfitId}/save`, { collectionId });
    return response.data;
  }
}

export default new OutfitGeneratorService();
```

---

## 🎨 Frontend Components

### 1. New Page: `OutfitGenerator.vue`

```vue
<template>
  <MainLayout>
    <div class="outfit-generator">
      <header>
        <h1>Generate Outfit</h1>
        <p>Let AI create the perfect outfit for you</p>
      </header>
      
      <!-- Generation Parameters -->
      <div class="parameters">
        <div class="param-group">
          <label>Occasion</label>
          <Select v-model="params.occasion" :options="occasionOptions" />
        </div>
        
        <div class="param-group">
          <label>Weather</label>
          <Select v-model="params.weather" :options="weatherOptions" />
        </div>
        
        <div class="param-group">
          <label>Style (Optional)</label>
          <Select v-model="params.style" :options="styleOptions" />
        </div>
      </div>
      
      <Button 
        @click="generateOutfit"
        :loading="generating"
        size="large"
        class="generate-button"
      >
        Generate Outfit
      </Button>
      
      <!-- Generated Outfit Display -->
      <div v-if="generatedOutfit" class="outfit-display">
        <h2>Your Generated Outfit</h2>
        
        <div class="outfit-items">
          <div 
            v-for="item in generatedOutfit.items"
            :key="item.id"
            class="outfit-item"
          >
            <img :src="item.thumbnail_url" :alt="item.name" />
            <p>{{ item.name }}</p>
            <Badge>{{ item.category }}</Badge>
          </div>
        </div>
        
        <!-- Outfit Details -->
        <div class="outfit-details">
          <p><strong>Color Scheme:</strong> {{ generatedOutfit.color_scheme }}</p>
          <p><strong>Style:</strong> {{ generatedOutfit.style_theme }}</p>
          <p><strong>Score:</strong> {{ generatedOutfit.score }}/100</p>
        </div>
        
        <!-- Actions -->
        <div class="outfit-actions">
          <Button @click="saveOutfit" variant="primary">
            Save to Collection
          </Button>
          <Button @click="generateOutfit" variant="secondary">
            Generate Another
          </Button>
          <Button @click="rateOutfit(5)" variant="ghost">
            👍 Love It
          </Button>
          <Button @click="rateOutfit(1)" variant="ghost">
            👎 Not For Me
          </Button>
        </div>
      </div>
      
      <!-- Previous Suggestions -->
      <div v-if="previousOutfits.length" class="previous-outfits">
        <h2>Previous Suggestions</h2>
        <div class="outfit-grid">
          <OutfitCard 
            v-for="outfit in previousOutfits"
            :key="outfit.id"
            :outfit="outfit"
            @click="viewOutfit(outfit)"
          />
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useClosetStore } from '@/stores/closet-store';
import outfitGenerator from '@/services/outfit-generator-service';
import { useNotification } from '@/composables/useNotification';

const closetStore = useClosetStore();
const { showNotification } = useNotification();

const params = ref({
  occasion: 'casual',
  weather: 'warm',
  style: null
});

const generating = ref(false);
const generatedOutfit = ref(null);
const previousOutfits = ref([]);

const occasionOptions = [
  { value: 'casual', label: 'Casual' },
  { value: 'work', label: 'Work' },
  { value: 'date', label: 'Date Night' },
  { value: 'workout', label: 'Workout' },
  { value: 'formal', label: 'Formal Event' }
];

const weatherOptions = [
  { value: 'hot', label: 'Hot (>25°C)' },
  { value: 'warm', label: 'Warm (15-25°C)' },
  { value: 'cool', label: 'Cool (5-15°C)' },
  { value: 'cold', label: 'Cold (<5°C)' }
];

const styleOptions = [
  { value: null, label: 'Any Style' },
  { value: 'casual', label: 'Casual' },
  { value: 'formal', label: 'Formal' },
  { value: 'sporty', label: 'Sporty' },
  { value: 'business', label: 'Business' }
];

async function generateOutfit() {
  generating.value = true;
  
  try {
    // Get user's closet items
    await closetStore.fetchItems();
    
    // Generate outfit
    const result = await outfitGenerator.generateOutfit({
      ...params.value,
      userItems: closetStore.items
    });
    
    generatedOutfit.value = result;
    showNotification('Outfit generated successfully!', 'success');
  } catch (error) {
    showNotification(error.message || 'Failed to generate outfit', 'error');
  } finally {
    generating.value = false;
  }
}

async function rateOutfit(rating) {
  try {
    await outfitGenerator.rateOutfit(generatedOutfit.value.id, rating);
    showNotification('Thanks for your feedback!', 'success');
  } catch (error) {
    showNotification('Failed to rate outfit', 'error');
  }
}

async function saveOutfit() {
  try {
    await outfitGenerator.saveOutfit(generatedOutfit.value.id);
    showNotification('Outfit saved to your collection!', 'success');
  } catch (error) {
    showNotification('Failed to save outfit', 'error');
  }
}

onMounted(async () => {
  // Load previous suggestions
  try {
    const result = await outfitGenerator.getSuggestedOutfits();
    previousOutfits.value = result.outfits;
  } catch (error) {
    console.error('Failed to load previous outfits:', error);
  }
});
</script>
```

---

## 🔧 Implementation Steps

### Phase 1: Algorithm Design (Day 1)
1. Define outfit generation rules
2. Create color harmony logic
3. Create style compatibility matrix
4. Define scoring system
5. Document algorithm

### Phase 2: Database Setup (Day 1)
1. Create migration file
2. Add `generated_outfits` table
3. Add validation triggers
4. Add indexes
5. Test migration

### Phase 3: Backend Service (Day 2)
1. Create `outfit-generator-service.js`
2. Implement generation algorithm
3. Implement scoring system
4. Implement API endpoints
5. Add error handling

### Phase 4: Frontend (Day 3-4)
1. Create `OutfitGenerator.vue` page
2. Create parameter selection UI
3. Create outfit display component
4. Add rating/save functionality
5. Add previous outfits view

### Phase 5: Integration & Testing (Day 5)
1. Integrate with closet store
2. Test various scenarios
3. Test edge cases (limited items, no matches)
4. Performance optimization
5. User feedback collection

---

## ✅ Definition of Done

- [ ] Algorithm implemented and tested
- [ ] Database migration created
- [ ] API endpoints implemented
- [ ] Frontend components created
- [ ] Generation works for all occasions
- [ ] Color harmony scoring works
- [ ] Style compatibility works
- [ ] User can rate outfits
- [ ] User can save outfits
- [ ] Performance optimized
- [ ] Documentation updated

---

**Let's help users look their best! 👔✨**
