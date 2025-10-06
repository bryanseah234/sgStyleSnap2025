-- Migration 007: Outfit Generation System (Permutation-based)
-- Creates tables and functions for automatic outfit generation
-- This file is re-runnable - safe to execute multiple times

-- ============================================
-- DROP EXISTING OBJECTS (in reverse dependency order)
-- ============================================
DROP TRIGGER IF EXISTS increment_outfit_likes_trigger ON outfit_likes CASCADE;
DROP TRIGGER IF EXISTS decrement_outfit_likes_trigger ON outfit_likes CASCADE;
DROP TRIGGER IF EXISTS prevent_self_like_outfit_trigger ON outfit_likes CASCADE;

DROP FUNCTION IF EXISTS increment_outfit_likes_count() CASCADE;
DROP FUNCTION IF EXISTS decrement_outfit_likes_count() CASCADE;
DROP FUNCTION IF EXISTS prevent_self_like_outfit() CASCADE;
DROP FUNCTION IF EXISTS get_outfit_likers(UUID, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS get_popular_outfits(UUID, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS generate_outfit_permutations(UUID, VARCHAR, VARCHAR, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS score_outfit_color_harmony(UUID[]) CASCADE;
DROP FUNCTION IF EXISTS score_outfit_style_compatibility(UUID[]) CASCADE;

DROP POLICY IF EXISTS "Users can view own generated outfits" ON generated_outfits;
DROP POLICY IF EXISTS "Users can view friends generated outfits" ON generated_outfits;
DROP POLICY IF EXISTS "Users can create own outfits" ON generated_outfits;
DROP POLICY IF EXISTS "Users can update own outfits" ON generated_outfits;
DROP POLICY IF EXISTS "Users can delete own outfits" ON generated_outfits;
DROP POLICY IF EXISTS "Users can like any outfit" ON outfit_likes;
DROP POLICY IF EXISTS "Users can unlike own likes" ON outfit_likes;
DROP POLICY IF EXISTS "Users can view outfit likes" ON outfit_likes;

DROP INDEX IF EXISTS idx_generated_outfits_user_id;
DROP INDEX IF EXISTS idx_generated_outfits_created_at;
DROP INDEX IF EXISTS idx_generated_outfits_occasion;
DROP INDEX IF EXISTS idx_generated_outfits_weather;
DROP INDEX IF EXISTS idx_generated_outfits_is_saved;
DROP INDEX IF EXISTS idx_generated_outfits_saved_collection;
DROP INDEX IF EXISTS idx_generated_outfits_rating;
DROP INDEX IF EXISTS idx_generated_outfits_item_ids;
DROP INDEX IF EXISTS idx_outfit_likes_outfit_id;
DROP INDEX IF EXISTS idx_outfit_likes_user_id;
DROP INDEX IF EXISTS idx_outfit_likes_user_outfit;

-- Note: This outfit_likes is for generated outfits (Task 11)
-- Different from shared_outfit_likes in 004 (Task 13)
DROP TABLE IF EXISTS outfit_likes CASCADE;
DROP TABLE IF EXISTS outfit_generation_history CASCADE;
DROP TABLE IF EXISTS generated_outfits CASCADE;

-- ============================================
-- GENERATED OUTFITS TABLE
-- ============================================

CREATE TABLE generated_outfits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item_ids UUID[] NOT NULL, -- Array of clothes IDs in the outfit
  generation_params JSONB, -- Weather, occasion, style preferences
  color_scheme VARCHAR(50), -- monochromatic, complementary, analogous, triadic, neutral, mixed
  style_theme VARCHAR(50), -- casual, formal, sporty, business, mixed
  occasion VARCHAR(50), -- work, casual, date, workout, formal
  weather_condition VARCHAR(50), -- hot, warm, cool, cold
  ai_score INTEGER CHECK (ai_score BETWEEN 0 AND 100), -- AI-generated outfit score
  user_rating INTEGER CHECK (user_rating BETWEEN 1 AND 5), -- User feedback rating
  is_saved BOOLEAN DEFAULT false,
  saved_to_collection_id UUID REFERENCES outfit_collections(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  rated_at TIMESTAMP WITH TIME ZONE,
  saved_at TIMESTAMP WITH TIME ZONE,
  
  -- Constraints
  CONSTRAINT check_item_ids_not_empty CHECK (array_length(item_ids, 1) >= 3), -- Minimum 3 items (top+bottom+shoes)
  CONSTRAINT check_item_ids_max CHECK (array_length(item_ids, 1) <= 6) -- Maximum 6 items
);

-- ============================================
-- OUTFIT GENERATION HISTORY
-- ============================================

-- Track all generation requests for analytics and learning
CREATE TABLE outfit_generation_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  request_params JSONB NOT NULL, -- Full request parameters
  generated_outfit_id UUID REFERENCES generated_outfits(id),
  generation_time_ms INTEGER, -- Time taken to generate
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- OUTFIT LIKES TABLE
-- ============================================

-- Likes on AI-generated outfits (different from shared_outfit_likes in Task 13)
CREATE TABLE outfit_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  outfit_id UUID NOT NULL REFERENCES generated_outfits(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- One like per user per outfit
  UNIQUE(user_id, outfit_id)
);

-- ============================================
-- INDEXES
-- ============================================

-- Generated outfits indexes
CREATE INDEX idx_generated_outfits_user ON generated_outfits(user_id);
CREATE INDEX idx_generated_outfits_rating ON generated_outfits(user_rating) WHERE user_rating IS NOT NULL;
CREATE INDEX idx_generated_outfits_saved ON generated_outfits(is_saved) WHERE is_saved = true;
CREATE INDEX idx_generated_outfits_item_ids ON generated_outfits USING gin(item_ids);
CREATE INDEX idx_generated_outfits_occasion ON generated_outfits(occasion);
CREATE INDEX idx_generated_outfits_weather ON generated_outfits(weather_condition);
CREATE INDEX idx_generated_outfits_created ON generated_outfits(created_at DESC);

-- Generation history indexes
CREATE INDEX idx_outfit_gen_history_user ON outfit_generation_history(user_id);
CREATE INDEX idx_outfit_gen_history_created ON outfit_generation_history(created_at DESC);
CREATE INDEX idx_outfit_gen_history_success ON outfit_generation_history(success) WHERE success = false;

-- Outfit likes indexes
CREATE INDEX idx_outfit_likes_outfit_id ON outfit_likes(outfit_id);
CREATE INDEX idx_outfit_likes_user_id ON outfit_likes(user_id);
CREATE INDEX idx_outfit_likes_user_outfit ON outfit_likes(user_id, outfit_id);

-- ============================================
-- VALIDATION FUNCTIONS
-- ============================================

-- Function to validate outfit items exist and belong to user
CREATE OR REPLACE FUNCTION validate_outfit_items()
RETURNS TRIGGER AS $$
DECLARE
  item_count INTEGER;
BEGIN
  -- Check if all items exist and belong to user
  SELECT COUNT(*) INTO item_count
  FROM clothes
  WHERE id = ANY(NEW.item_ids)
    AND owner_id = NEW.user_id
    AND removed_at IS NULL;
  
  IF item_count != array_length(NEW.item_ids, 1) THEN
    RAISE EXCEPTION 'One or more items do not exist, do not belong to user, or have been removed';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to validate outfit items before insert/update
CREATE TRIGGER validate_outfit_items_trigger
  BEFORE INSERT OR UPDATE ON generated_outfits
  FOR EACH ROW
  EXECUTE FUNCTION validate_outfit_items();

-- ============================================
-- OUTFIT SCORING FUNCTIONS
-- ============================================

-- Function to calculate color harmony score
CREATE OR REPLACE FUNCTION calculate_color_harmony_score(
  item_ids_param UUID[]
)
RETURNS NUMERIC
LANGUAGE plpgsql
AS $$
DECLARE
  colors VARCHAR(50)[];
  unique_colors INTEGER;
  neutral_count INTEGER;
  score NUMERIC := 0.5;
BEGIN
  -- Get all primary colors
  SELECT array_agg(DISTINCT primary_color)
  INTO colors
  FROM clothes
  WHERE id = ANY(item_ids_param)
    AND primary_color IS NOT NULL;
  
  IF colors IS NULL OR array_length(colors, 1) = 0 THEN
    RETURN 0.5; -- Neutral score if no colors
  END IF;
  
  unique_colors := array_length(colors, 1);
  
  -- Monochromatic (all same color) = 1.0
  IF unique_colors = 1 THEN
    RETURN 1.0;
  END IF;
  
  -- Count neutral colors
  SELECT COUNT(*)
  INTO neutral_count
  FROM unnest(colors) AS color
  WHERE color IN ('black', 'white', 'gray', 'beige', 'brown');
  
  -- All neutrals = 0.9
  IF neutral_count = unique_colors THEN
    RETURN 0.9;
  END IF;
  
  -- Mixed neutrals and colors = 0.7
  IF neutral_count > 0 THEN
    RETURN 0.7;
  END IF;
  
  -- Multiple non-neutral colors = 0.5 (could clash)
  RETURN 0.5;
END;
$$;

-- Function to check outfit completeness
CREATE OR REPLACE FUNCTION check_outfit_completeness(
  item_ids_param UUID[]
)
RETURNS NUMERIC
LANGUAGE plpgsql
AS $$
DECLARE
  categories TEXT[];
  has_top BOOLEAN;
  has_bottom BOOLEAN;
  has_shoes BOOLEAN;
  has_outerwear BOOLEAN;
  has_accessory BOOLEAN;
BEGIN
  -- Get all categories
  SELECT array_agg(category)
  INTO categories
  FROM clothes
  WHERE id = ANY(item_ids_param);
  
  -- Check required categories
  has_top := 'top' = ANY(categories);
  has_bottom := 'bottom' = ANY(categories);
  has_shoes := 'shoes' = ANY(categories);
  has_outerwear := 'outerwear' = ANY(categories);
  has_accessory := 'accessory' = ANY(categories);
  
  -- Must have top, bottom, shoes
  IF NOT (has_top AND has_bottom AND has_shoes) THEN
    RETURN 0.0;
  END IF;
  
  -- Full outfit with outerwear and accessory
  IF has_outerwear AND has_accessory THEN
    RETURN 1.0;
  END IF;
  
  -- Outfit with one optional item
  IF has_outerwear OR has_accessory THEN
    RETURN 0.8;
  END IF;
  
  -- Just required items
  RETURN 0.6;
END;
$$;

-- Function to calculate overall outfit score
CREATE OR REPLACE FUNCTION calculate_outfit_score(
  item_ids_param UUID[]
)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  color_score NUMERIC;
  completeness_score NUMERIC;
  total_score NUMERIC;
BEGIN
  -- Calculate component scores
  color_score := calculate_color_harmony_score(item_ids_param);
  completeness_score := check_outfit_completeness(item_ids_param);
  
  -- Weighted average (color: 40%, completeness: 60%)
  total_score := (color_score * 0.4 + completeness_score * 0.6) * 100;
  
  RETURN ROUND(total_score)::INTEGER;
END;
$$;

-- ============================================
-- OUTFIT RECOMMENDATION FUNCTIONS
-- ============================================

-- Function to get user's recent outfit preferences
CREATE OR REPLACE FUNCTION get_user_outfit_preferences(
  user_id_param UUID
)
RETURNS TABLE (
  preferred_occasion VARCHAR(50),
  preferred_style VARCHAR(50),
  preferred_color_scheme VARCHAR(50),
  avg_rating NUMERIC
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    go.occasion,
    go.style_theme,
    go.color_scheme,
    AVG(go.user_rating)::NUMERIC
  FROM generated_outfits go
  WHERE 
    go.user_id = user_id_param
    AND go.user_rating IS NOT NULL
    AND go.created_at > NOW() - INTERVAL '90 days'
  GROUP BY go.occasion, go.style_theme, go.color_scheme
  HAVING AVG(go.user_rating) >= 4
  ORDER BY AVG(go.user_rating) DESC
  LIMIT 10;
END;
$$;

-- Function to find similar outfits
CREATE OR REPLACE FUNCTION find_similar_outfits(
  outfit_id_param UUID,
  limit_param INTEGER DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  similarity_score NUMERIC,
  color_scheme VARCHAR(50),
  style_theme VARCHAR(50),
  ai_score INTEGER,
  user_rating INTEGER
)
LANGUAGE plpgsql
AS $$
DECLARE
  target_outfit RECORD;
BEGIN
  -- Get target outfit details
  SELECT * INTO target_outfit
  FROM generated_outfits
  WHERE id = outfit_id_param;
  
  IF NOT FOUND THEN
    RETURN;
  END IF;
  
  -- Find similar outfits
  RETURN QUERY
  SELECT 
    go.id,
    -- Calculate similarity (0-1)
    (
      CASE WHEN go.occasion = target_outfit.occasion THEN 0.3 ELSE 0 END +
      CASE WHEN go.style_theme = target_outfit.style_theme THEN 0.3 ELSE 0 END +
      CASE WHEN go.color_scheme = target_outfit.color_scheme THEN 0.2 ELSE 0 END +
      CASE WHEN go.weather_condition = target_outfit.weather_condition THEN 0.2 ELSE 0 END
    )::NUMERIC AS similarity_score,
    go.color_scheme,
    go.style_theme,
    go.ai_score,
    go.user_rating
  FROM generated_outfits go
  WHERE 
    go.user_id = target_outfit.user_id
    AND go.id != outfit_id_param
  ORDER BY similarity_score DESC
  LIMIT limit_param;
END;
$$;

-- ============================================
-- ANALYTICS VIEWS
-- ============================================

-- View: Top-rated outfit combinations
CREATE OR REPLACE VIEW top_rated_outfits AS
SELECT 
  go.id,
  go.user_id,
  go.item_ids,
  go.color_scheme,
  go.style_theme,
  go.occasion,
  go.user_rating,
  go.ai_score,
  array_length(go.item_ids, 1) AS item_count,
  go.created_at
FROM generated_outfits go
WHERE 
  go.user_rating >= 4
ORDER BY go.user_rating DESC, go.ai_score DESC;

-- View: Outfit generation success rate
CREATE OR REPLACE VIEW outfit_generation_stats AS
SELECT 
  DATE_TRUNC('day', created_at) AS date,
  COUNT(*) AS total_generations,
  COUNT(*) FILTER (WHERE success = true) AS successful,
  COUNT(*) FILTER (WHERE success = false) AS failed,
  ROUND(AVG(generation_time_ms))::INTEGER AS avg_generation_time_ms,
  ROUND((COUNT(*) FILTER (WHERE success = true) * 100.0 / COUNT(*))::NUMERIC, 2) AS success_rate
FROM outfit_generation_history
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY date DESC;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on generated_outfits
ALTER TABLE generated_outfits ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own generated outfits
CREATE POLICY "Users can view own generated outfits"
ON generated_outfits FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can insert their own generated outfits
CREATE POLICY "Users can create own generated outfits"
ON generated_outfits FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own generated outfits
CREATE POLICY "Users can update own generated outfits"
ON generated_outfits FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own generated outfits
CREATE POLICY "Users can delete own generated outfits"
ON generated_outfits FOR DELETE
USING (auth.uid() = user_id);

-- Enable RLS on outfit_generation_history
ALTER TABLE outfit_generation_history ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own generation history
CREATE POLICY "Users can view own generation history"
ON outfit_generation_history FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can insert their own generation history
CREATE POLICY "Users can create own generation history"
ON outfit_generation_history FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Enable RLS on outfit_likes
ALTER TABLE outfit_likes ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view likes on any outfit
CREATE POLICY "Users can view outfit likes"
ON outfit_likes FOR SELECT
USING (true);

-- Policy: Users can like any generated outfit
CREATE POLICY "Users can like any outfit"
ON outfit_likes FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only unlike their own likes
CREATE POLICY "Users can unlike own likes"
ON outfit_likes FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger to update saved_at timestamp when outfit is saved
CREATE OR REPLACE FUNCTION update_outfit_saved_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_saved = true AND OLD.is_saved = false THEN
    NEW.saved_at := NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_outfit_saved_at_trigger
  BEFORE UPDATE ON generated_outfits
  FOR EACH ROW
  EXECUTE FUNCTION update_outfit_saved_at();

-- Trigger to update rated_at timestamp when outfit is rated
CREATE OR REPLACE FUNCTION update_outfit_rated_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.user_rating IS NOT NULL AND OLD.user_rating IS NULL THEN
    NEW.rated_at := NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_outfit_rated_at_trigger
  BEFORE UPDATE ON generated_outfits
  FOR EACH ROW
  EXECUTE FUNCTION update_outfit_rated_at();

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE generated_outfits IS 'AI-generated outfit combinations with scoring and user feedback';
COMMENT ON TABLE outfit_generation_history IS 'Audit log of all outfit generation requests for analytics and learning';
COMMENT ON TABLE outfit_likes IS 'Likes on AI-generated outfits (different from shared_outfit_likes in Task 13)';
COMMENT ON COLUMN generated_outfits.ai_score IS 'Algorithm-generated score (0-100) based on color harmony, completeness, style';
COMMENT ON COLUMN generated_outfits.user_rating IS 'User feedback rating (1-5 stars) to improve future recommendations';
COMMENT ON FUNCTION calculate_color_harmony_score IS 'Score color compatibility of outfit items (0-1)';
COMMENT ON FUNCTION calculate_outfit_score IS 'Calculate overall outfit score (0-100) from color harmony and completeness';
COMMENT ON FUNCTION get_user_outfit_preferences IS 'Learn user preferences from highly-rated past outfits';
COMMENT ON FUNCTION find_similar_outfits IS 'Find outfits similar to a given outfit based on occasion, style, colors, weather';
COMMENT ON VIEW top_rated_outfits IS 'Highly-rated outfits for recommendations and inspiration';
COMMENT ON VIEW outfit_generation_stats IS 'Analytics on outfit generation success rates and performance';
