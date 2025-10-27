# Outfit Recommendation Implementation

## Overview

This document describes the AI-powered outfit recommendation system implemented in StyleSnap using the ftransformer API.

## Architecture

### Components

1. **Recommendation Service** (`src/services/recommendation-service.js`)

   - Generates outfit combinations from user's closet items
   - Applies color theory for pre-filtering
   - Scores outfits using ftransformer API
   - Ranks and returns top recommendations

2. **UI Integration** (`src/pages/OutfitCreator.vue`)
   - "Get AI Recommendations" button in header
   - Modal displaying recommendations
   - Ability to load recommended outfits onto canvas
   - Save recommended outfits functionality

### How It Works

#### 1. Outfit Generation

- Creates combinations from user's closet items
- Rules:
  - Must have at least 1 top + 1 bottom (or 1 dress)
  - Can add outerwear, shoes, or accessories
  - Maximum 50 combinations evaluated to ensure performance

#### 2. Color Theory Filtering

- Pre-filters combinations based on color compatibility
- Score rules:
  - Same color: 0.9
  - Both neutral: 0.95
  - One neutral, one colored: 0.85
  - Both warm colors: 0.8
  - Both cool colors: 0.8
  - Complementary (warm+cool): 0.6
  - Default: 0.5

#### 3. Transformer API Scoring

- Each filtered combination is scored using ftransformer API
- Uses `/recommendation/score` endpoint
- Returns compatibility score (0-1)
- Falls back to color-based score if API fails

#### 4. Ranking & Display

- Sorts by API score (highest first)
- Returns top 10 recommendations
- Shows score, items, and confidence level
- Users can load any recommendation onto canvas

## Usage

### From OutfitCreator:

1. Click "Get AI Recommendations" button
2. Wait for analysis (analyzes up to 50 combinations)
3. View recommended outfits in modal
4. Click "Load to Canvas" on any recommendation
5. Edit outfit or save it

### API Endpoints Used:

- `POST https://ftransformer-api-244539109907.us-central1.run.app/recommendation/score`
  - Scores outfit compatibility
  - Accepts: item_metadata (JSON), files (images)
  - Returns: { score: number }

## Configuration

### Options:

```javascript
{
  maxRecommendations: 10,  // Number of top recommendations to return
  maxCombinations: 50      // Maximum combinations to evaluate
}
```

### Performance:

- Typically evaluates 20-30 combinations after color filtering
- API calls: 1 per combination
- Estimated time: 10-30 seconds for 20 combinations

## Future Enhancements

1. **Caching**: Cache scores for common combinations
2. **Batch Processing**: Batch API calls if supported
3. **Progressive Loading**: Show results as they're generated
4. **User Preferences**: Learn from user's saved outfits
5. **Occasion-Based**: Filter by occasion (formal, casual, etc.)
