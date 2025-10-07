-- Batch 9: Advanced Features - Database Schema
-- Migration: 004_advanced_features.sql
-- Date: October 5, 2025
-- This file is re-runnable - safe to execute multiple times

-- =============================================================================
-- DROP EXISTING OBJECTS (in reverse dependency order)
-- =============================================================================

-- Drop triggers first
DO $$ BEGIN
  DROP TRIGGER IF EXISTS trigger_outfit_collections_updated_at ON outfit_collections;
  EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DO $$ BEGIN
  DROP TRIGGER IF EXISTS trigger_outfit_history_updated_at ON outfit_history;
  EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DO $$ BEGIN
  DROP TRIGGER IF EXISTS trigger_shared_outfits_updated_at ON shared_outfits;
  EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DO $$ BEGIN
  DROP TRIGGER IF EXISTS trigger_outfit_comments_updated_at ON outfit_comments;
  EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DO $$ BEGIN
  DROP TRIGGER IF EXISTS trigger_style_preferences_updated_at ON style_preferences;
  EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DO $$ BEGIN
  DROP TRIGGER IF EXISTS trigger_update_collection_outfits_count ON collection_outfits;
  EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DO $$ BEGIN
  DROP TRIGGER IF EXISTS trigger_update_outfit_comments_count ON outfit_comments;
  EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DO $$ BEGIN
  DROP TRIGGER IF EXISTS trigger_update_outfit_likes_count ON shared_outfit_likes;
  EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- Drop functions
DO $$ BEGIN
  DROP FUNCTION IF EXISTS extract_cloth_ids_from_outfit(JSONB) CASCADE;
  EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DO $$ BEGIN
  DROP FUNCTION IF EXISTS get_user_outfit_stats(UUID) CASCADE;
  EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DO $$ BEGIN
  DROP FUNCTION IF EXISTS get_most_worn_items(UUID, INTEGER) CASCADE;
  EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DO $$ BEGIN
  DROP FUNCTION IF EXISTS get_unworn_combinations(UUID) CASCADE;
  EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DO $$ BEGIN
  DROP FUNCTION IF EXISTS update_outfit_likes_count() CASCADE;
  EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DO $$ BEGIN
  DROP FUNCTION IF EXISTS update_outfit_comments_count() CASCADE;
  EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DROP FUNCTION IF EXISTS update_collection_outfits_count() CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Drop tables in correct order
DO $$ BEGIN
  DROP TABLE IF EXISTS outfit_history CASCADE;
  EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DO $$ BEGIN
  DROP TABLE IF EXISTS outfit_collections CASCADE;
  EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DO $$ BEGIN
  DROP TABLE IF EXISTS suggestion_feedback CASCADE;
  EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DO $$ BEGIN
  DROP TABLE IF EXISTS style_preferences CASCADE;
  EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DO $$ BEGIN
  DROP TABLE IF EXISTS outfit_comments CASCADE;
  EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DO $$ BEGIN
  DROP TABLE IF EXISTS shared_outfit_likes CASCADE;
  EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DO $$ BEGIN
  DROP TABLE IF EXISTS shared_outfits CASCADE;
  EXCEPTION WHEN undefined_table THEN NULL;
END $$;
DO $$ BEGIN
  DROP TABLE IF EXISTS outfit_history CASCADE;
  EXCEPTION WHEN undefined_table THEN NULL;
END $$;

-- =============================================================================
-- 1. OUTFIT HISTORY & ANALYTICS
-- =============================================================================

-- Track when users actually wear suggested outfits
CREATE TABLE outfit_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  suggestion_id UUID REFERENCES suggestions(id) ON DELETE SET NULL,
  
  -- Outfit details (denormalized for history preservation)
  outfit_name VARCHAR(255),
  outfit_items JSONB NOT NULL, -- Array of {cloth_id, name, category, image_url}
  
  -- Wear details
  worn_date DATE NOT NULL DEFAULT CURRENT_DATE,
  occasion VARCHAR(100), -- e.g., 'work', 'date night', 'casual', 'party'
  weather_temp INTEGER, -- Temperature in Fahrenheit
  weather_condition VARCHAR(50), -- e.g., 'sunny', 'rainy', 'cloudy'
  
  -- User feedback
  rating INTEGER CHECK (rating BETWEEN 1 AND 5),
  notes TEXT,
  
  -- Photo of actual outfit (optional)
  photo_url TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Indexes
  CONSTRAINT valid_outfit_items CHECK (jsonb_array_length(outfit_items) > 0)
);

-- Indexes for outfit history
CREATE INDEX idx_outfit_history_user_id ON outfit_history(user_id);
CREATE INDEX idx_outfit_history_worn_date ON outfit_history(worn_date DESC);
CREATE INDEX idx_outfit_history_occasion ON outfit_history(occasion);
CREATE INDEX idx_outfit_history_suggestion_id ON outfit_history(suggestion_id);
CREATE INDEX idx_outfit_history_rating ON outfit_history(rating);
CREATE INDEX idx_outfit_history_items_gin ON outfit_history USING GIN (outfit_items);

-- =============================================================================
-- 2. OUTFIT SHARING & SOCIAL FEED
-- =============================================================================

-- Shared outfits (posts to social feed)
CREATE TABLE shared_outfits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  suggestion_id UUID REFERENCES suggestions(id) ON DELETE SET NULL,
  outfit_history_id UUID REFERENCES outfit_history(id) ON DELETE SET NULL,
  
  -- Content
  caption TEXT,
  outfit_items JSONB NOT NULL, -- Denormalized outfit data
  
  -- Visibility
  visibility VARCHAR(20) NOT NULL DEFAULT 'friends' CHECK (visibility IN ('public', 'friends', 'private')),
  
  -- Share link (for public sharing)
  share_token VARCHAR(32) UNIQUE, -- Random token for public links
  
  -- Stats
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for shared outfits
CREATE INDEX idx_shared_outfits_user_id ON shared_outfits(user_id);
CREATE INDEX idx_shared_outfits_created_at ON shared_outfits(created_at DESC);
CREATE INDEX idx_shared_outfits_visibility ON shared_outfits(visibility);
CREATE INDEX idx_shared_outfits_share_token ON shared_outfits(share_token);
CREATE INDEX idx_shared_outfits_items_gin ON shared_outfits USING GIN (outfit_items);

-- Likes on shared outfits (separate from generated outfit likes in 007)
CREATE TABLE shared_outfit_likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  outfit_id UUID NOT NULL REFERENCES shared_outfits(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- One like per user per outfit
  UNIQUE(outfit_id, user_id)
);

CREATE INDEX idx_shared_outfit_likes_outfit_id ON shared_outfit_likes(outfit_id);
CREATE INDEX idx_shared_outfit_likes_user_id ON shared_outfit_likes(user_id);

-- Comments on shared outfits
CREATE TABLE outfit_comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  outfit_id UUID NOT NULL REFERENCES shared_outfits(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  comment_text TEXT NOT NULL CHECK (LENGTH(comment_text) <= 1000),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_outfit_comments_outfit_id ON outfit_comments(outfit_id);
CREATE INDEX idx_outfit_comments_user_id ON outfit_comments(user_id);
CREATE INDEX idx_outfit_comments_created_at ON outfit_comments(created_at DESC);

-- =============================================================================
-- 3. STYLE PREFERENCES & AI LEARNING
-- =============================================================================

-- User style preferences
CREATE TABLE style_preferences (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  
  -- Color preferences
  favorite_colors TEXT[], -- e.g., ['black', 'navy', 'gray']
  avoid_colors TEXT[],
  
  -- Style preferences
  preferred_styles TEXT[], -- e.g., ['casual', 'business', 'streetwear']
  preferred_brands TEXT[],
  
  -- Fit preferences
  fit_preference VARCHAR(20) CHECK (fit_preference IN ('tight', 'fitted', 'regular', 'loose', 'oversized')),
  
  -- Occasion preferences
  common_occasions TEXT[], -- e.g., ['work', 'casual', 'gym']
  
  -- AI learning data
  suggestion_feedback JSONB DEFAULT '[]'::JSONB, -- Track likes/dislikes
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Suggestion feedback (thumbs up/down on suggestions)
CREATE TABLE suggestion_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  suggestion_id UUID NOT NULL REFERENCES suggestions(id) ON DELETE CASCADE,
  
  -- Feedback
  feedback_type VARCHAR(20) NOT NULL CHECK (feedback_type IN ('like', 'dislike', 'love')),
  feedback_reason TEXT, -- Why they liked/disliked it
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- One feedback per user per suggestion
  UNIQUE(user_id, suggestion_id)
);

CREATE INDEX idx_suggestion_feedback_user_id ON suggestion_feedback(user_id);
CREATE INDEX idx_suggestion_feedback_suggestion_id ON suggestion_feedback(suggestion_id);
CREATE INDEX idx_suggestion_feedback_type ON suggestion_feedback(feedback_type);

-- =============================================================================
-- 4. OUTFIT COLLECTIONS & LOOKBOOKS
-- =============================================================================

-- Collections/Lookbooks
CREATE TABLE outfit_collections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Collection details
  name VARCHAR(255) NOT NULL,
  description TEXT,
  theme VARCHAR(100), -- e.g., 'Work', 'Vacation', 'Date Night'
  cover_image_url TEXT,
  
  -- Settings
  visibility VARCHAR(20) NOT NULL DEFAULT 'private' CHECK (visibility IN ('public', 'friends', 'private')),
  is_favorite BOOLEAN DEFAULT FALSE,
  
  -- Stats
  outfits_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_outfit_collections_user_id ON outfit_collections(user_id);
CREATE INDEX idx_outfit_collections_created_at ON outfit_collections(created_at DESC);
CREATE INDEX idx_outfit_collections_is_favorite ON outfit_collections(is_favorite);

-- Outfits in collections (junction table)
CREATE TABLE collection_outfits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  collection_id UUID NOT NULL REFERENCES outfit_collections(id) ON DELETE CASCADE,
  suggestion_id UUID REFERENCES suggestions(id) ON DELETE CASCADE,
  
  -- Outfit details (denormalized)
  outfit_name VARCHAR(255),
  outfit_items JSONB NOT NULL,
  
  -- Position in collection
  position INTEGER DEFAULT 0,
  
  -- Notes for this outfit in the collection
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure unique suggestions per collection
  UNIQUE(collection_id, suggestion_id)
);

CREATE INDEX idx_collection_outfits_collection_id ON collection_outfits(collection_id);
CREATE INDEX idx_collection_outfits_suggestion_id ON collection_outfits(suggestion_id);
CREATE INDEX idx_collection_outfits_position ON collection_outfits(position);
CREATE INDEX idx_collection_outfits_items_gin ON collection_outfits USING GIN (outfit_items);

-- =============================================================================
-- 5. FUNCTIONS
-- =============================================================================

-- Function to extract clothing item IDs from outfit_items JSONB
CREATE OR REPLACE FUNCTION extract_cloth_ids_from_outfit(outfit_items JSONB)
RETURNS UUID[] AS $$
  SELECT ARRAY_AGG((item->>'cloth_id')::UUID)
  FROM jsonb_array_elements(outfit_items) AS item
  WHERE item->>'cloth_id' IS NOT NULL;
$$ LANGUAGE SQL IMMUTABLE;

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update likes count on shared_outfits
CREATE OR REPLACE FUNCTION update_outfit_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE shared_outfits
    SET likes_count = likes_count + 1
    WHERE id = NEW.outfit_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE shared_outfits
    SET likes_count = GREATEST(0, likes_count - 1)
    WHERE id = OLD.outfit_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Update comments count on shared_outfits
CREATE OR REPLACE FUNCTION update_outfit_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE shared_outfits
    SET comments_count = comments_count + 1
    WHERE id = NEW.outfit_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE shared_outfits
    SET comments_count = GREATEST(0, comments_count - 1)
    WHERE id = OLD.outfit_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Update outfits count in collections
CREATE OR REPLACE FUNCTION update_collection_outfits_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE outfit_collections
    SET outfits_count = outfits_count + 1
    WHERE id = NEW.collection_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE outfit_collections
    SET outfits_count = GREATEST(0, outfits_count - 1)
    WHERE id = OLD.collection_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Get user's outfit statistics
CREATE OR REPLACE FUNCTION get_user_outfit_stats(p_user_id UUID)
RETURNS TABLE (
  total_outfits_worn INTEGER,
  avg_rating NUMERIC(3,2),
  most_worn_occasion VARCHAR(100),
  favorite_season VARCHAR(20),
  total_items_used INTEGER,
  most_worn_item_id UUID,
  most_worn_item_count INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::INTEGER AS total_outfits_worn,
    ROUND(AVG(rating), 2) AS avg_rating,
    MODE() WITHIN GROUP (ORDER BY occasion) AS most_worn_occasion,
    CASE
      WHEN AVG(weather_temp) < 50 THEN 'winter'
      WHEN AVG(weather_temp) < 70 THEN 'spring/fall'
      ELSE 'summer'
    END AS favorite_season,
    COUNT(DISTINCT (jsonb_array_elements(outfit_items)->>'cloth_id')::UUID)::INTEGER AS total_items_used,
    (
      SELECT (item->>'cloth_id')::UUID
      FROM outfit_history oh2,
           jsonb_array_elements(oh2.outfit_items) AS item
      WHERE oh2.user_id = p_user_id
      GROUP BY (item->>'cloth_id')::UUID
      ORDER BY COUNT(*) DESC
      LIMIT 1
    ) AS most_worn_item_id,
    (
      SELECT COUNT(*)::INTEGER
      FROM outfit_history oh2,
           jsonb_array_elements(oh2.outfit_items) AS item
      WHERE oh2.user_id = p_user_id
      GROUP BY (item->>'cloth_id')::UUID
      ORDER BY COUNT(*) DESC
      LIMIT 1
    ) AS most_worn_item_count
  FROM outfit_history
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- Get most worn clothing items
CREATE OR REPLACE FUNCTION get_most_worn_items(p_user_id UUID, p_limit INTEGER DEFAULT 10)
RETURNS TABLE (
  cloth_id UUID,
  item_name VARCHAR(255),
  category VARCHAR(50),
  wear_count INTEGER,
  avg_rating NUMERIC(3,2),
  last_worn DATE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (item->>'cloth_id')::UUID AS cloth_id,
    (item->>'name')::VARCHAR(255) AS item_name,
    (item->>'category')::VARCHAR(50) AS category,
    COUNT(*)::INTEGER AS wear_count,
    ROUND(AVG(oh.rating), 2) AS avg_rating,
    MAX(oh.worn_date) AS last_worn
  FROM outfit_history oh,
       jsonb_array_elements(oh.outfit_items) AS item
  WHERE oh.user_id = p_user_id
  GROUP BY (item->>'cloth_id')::UUID, (item->>'name')::VARCHAR(255), (item->>'category')::VARCHAR(50)
  ORDER BY wear_count DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Get outfit recommendations based on wear history
CREATE OR REPLACE FUNCTION get_unworn_combinations(p_user_id UUID)
RETURNS TABLE (
  cloth_id UUID,
  item_name VARCHAR(255),
  category VARCHAR(50),
  last_worn_days_ago INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id AS cloth_id,
    c.name AS item_name,
    c.category,
    COALESCE(
      DATE_PART('day', NOW() - MAX(oh.worn_date))::INTEGER,
      999
    ) AS last_worn_days_ago
  FROM clothes c
  LEFT JOIN outfit_history oh ON oh.user_id = p_user_id
    AND EXISTS (
      SELECT 1
      FROM jsonb_array_elements(oh.outfit_items) AS item
      WHERE (item->>'cloth_id')::UUID = c.id
    )
  WHERE c.owner_id = p_user_id
    AND c.removed_at IS NULL
  GROUP BY c.id, c.name, c.category
  ORDER BY last_worn_days_ago DESC;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- 6. TRIGGERS
-- =============================================================================

-- Triggers for updated_at columns
CREATE TRIGGER trigger_outfit_history_updated_at
BEFORE UPDATE ON outfit_history
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_shared_outfits_updated_at
BEFORE UPDATE ON shared_outfits
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_outfit_comments_updated_at
BEFORE UPDATE ON outfit_comments
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_style_preferences_updated_at
BEFORE UPDATE ON style_preferences
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_outfit_collections_updated_at
BEFORE UPDATE ON outfit_collections
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Triggers for maintaining counts
CREATE TRIGGER trigger_update_outfit_likes_count
AFTER INSERT OR DELETE ON shared_outfit_likes
FOR EACH ROW EXECUTE FUNCTION update_outfit_likes_count();

CREATE TRIGGER trigger_update_outfit_comments_count
AFTER INSERT OR DELETE ON outfit_comments
FOR EACH ROW EXECUTE FUNCTION update_outfit_comments_count();

CREATE TRIGGER trigger_update_collection_outfits_count
AFTER INSERT OR DELETE ON collection_outfits
FOR EACH ROW EXECUTE FUNCTION update_collection_outfits_count();

-- =============================================================================
-- 7. ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

-- Enable RLS on all new tables
ALTER TABLE outfit_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_outfits ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_outfit_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE outfit_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE style_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE suggestion_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE outfit_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_outfits ENABLE ROW LEVEL SECURITY;

-- Outfit History Policies
CREATE POLICY "Users can view their own outfit history"
  ON outfit_history FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own outfit history"
  ON outfit_history FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own outfit history"
  ON outfit_history FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own outfit history"
  ON outfit_history FOR DELETE
  USING (user_id = auth.uid());

-- Shared Outfits Policies
CREATE POLICY "Users can view public shared outfits"
  ON shared_outfits FOR SELECT
  USING (visibility = 'public');

CREATE POLICY "Users can view friends-only outfits from friends"
  ON shared_outfits FOR SELECT
  USING (
    visibility = 'friends' AND (
      user_id = auth.uid() OR
      user_id IN (
        SELECT CASE
          WHEN requester_id = auth.uid() THEN receiver_id
          WHEN receiver_id = auth.uid() THEN requester_id
        END
        FROM friends
        WHERE status = 'accepted'
          AND (requester_id = auth.uid() OR receiver_id = auth.uid())
      )
    )
  );

CREATE POLICY "Users can view their own shared outfits"
  ON shared_outfits FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own shared outfits"
  ON shared_outfits FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own shared outfits"
  ON shared_outfits FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own shared outfits"
  ON shared_outfits FOR DELETE
  USING (user_id = auth.uid());

-- Shared Outfit Likes Policies
CREATE POLICY "Users can view likes on visible outfits"
  ON shared_outfit_likes FOR SELECT
  USING (
    outfit_id IN (
      SELECT id FROM shared_outfits
      WHERE visibility = 'public'
        OR user_id = auth.uid()
        OR (
          visibility = 'friends' AND
          user_id IN (
            SELECT CASE
              WHEN requester_id = auth.uid() THEN receiver_id
              WHEN receiver_id = auth.uid() THEN requester_id
            END
            FROM friends
            WHERE status = 'accepted'
              AND (requester_id = auth.uid() OR receiver_id = auth.uid())
          )
        )
    )
  );

CREATE POLICY "Users can like visible outfits"
  ON shared_outfit_likes FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    outfit_id IN (
      SELECT id FROM shared_outfits
      WHERE visibility IN ('public', 'friends')
    )
  );

CREATE POLICY "Users can unlike outfits they liked"
  ON shared_outfit_likes FOR DELETE
  USING (user_id = auth.uid());

-- Outfit Comments Policies
CREATE POLICY "Users can view comments on visible outfits"
  ON outfit_comments FOR SELECT
  USING (
    outfit_id IN (
      SELECT id FROM shared_outfits
      WHERE visibility = 'public'
        OR user_id = auth.uid()
        OR (
          visibility = 'friends' AND
          user_id IN (
            SELECT CASE
              WHEN requester_id = auth.uid() THEN receiver_id
              WHEN receiver_id = auth.uid() THEN requester_id
            END
            FROM friends
            WHERE status = 'accepted'
              AND (requester_id = auth.uid() OR receiver_id = auth.uid())
          )
        )
    )
  );

CREATE POLICY "Users can comment on visible outfits"
  ON outfit_comments FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    outfit_id IN (
      SELECT id FROM shared_outfits
      WHERE visibility IN ('public', 'friends')
    )
  );

CREATE POLICY "Users can update their own comments"
  ON outfit_comments FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own comments"
  ON outfit_comments FOR DELETE
  USING (user_id = auth.uid());

-- Style Preferences Policies
CREATE POLICY "Users can view their own style preferences"
  ON style_preferences FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own style preferences"
  ON style_preferences FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own style preferences"
  ON style_preferences FOR UPDATE
  USING (user_id = auth.uid());

-- Suggestion Feedback Policies
CREATE POLICY "Users can view their own suggestion feedback"
  ON suggestion_feedback FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own suggestion feedback"
  ON suggestion_feedback FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own suggestion feedback"
  ON suggestion_feedback FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own suggestion feedback"
  ON suggestion_feedback FOR DELETE
  USING (user_id = auth.uid());

-- Outfit Collections Policies
CREATE POLICY "Users can view public collections"
  ON outfit_collections FOR SELECT
  USING (visibility = 'public');

CREATE POLICY "Users can view friends' collections"
  ON outfit_collections FOR SELECT
  USING (
    visibility = 'friends' AND
    user_id IN (
      SELECT CASE
        WHEN requester_id = auth.uid() THEN receiver_id
        WHEN receiver_id = auth.uid() THEN requester_id
      END
      FROM friends
      WHERE status = 'accepted'
        AND (requester_id = auth.uid() OR receiver_id = auth.uid())
    )
  );

CREATE POLICY "Users can view their own collections"
  ON outfit_collections FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own collections"
  ON outfit_collections FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own collections"
  ON outfit_collections FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own collections"
  ON outfit_collections FOR DELETE
  USING (user_id = auth.uid());

-- Collection Outfits Policies
CREATE POLICY "Users can view outfits in visible collections"
  ON collection_outfits FOR SELECT
  USING (
    collection_id IN (
      SELECT id FROM outfit_collections
      WHERE visibility = 'public'
        OR user_id = auth.uid()
        OR (
          visibility = 'friends' AND
          user_id IN (
            SELECT CASE
              WHEN requester_id = auth.uid() THEN receiver_id
              WHEN receiver_id = auth.uid() THEN requester_id
            END
            FROM friends
            WHERE status = 'accepted'
              AND (requester_id = auth.uid() OR receiver_id = auth.uid())
          )
        )
    )
  );

CREATE POLICY "Users can add outfits to their own collections"
  ON collection_outfits FOR INSERT
  WITH CHECK (
    collection_id IN (
      SELECT id FROM outfit_collections WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update outfits in their own collections"
  ON collection_outfits FOR UPDATE
  USING (
    collection_id IN (
      SELECT id FROM outfit_collections WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete outfits from their own collections"
  ON collection_outfits FOR DELETE
  USING (
    collection_id IN (
      SELECT id FROM outfit_collections WHERE user_id = auth.uid()
    )
  );

-- =============================================================================
-- 8. DOCUMENTATION
-- =============================================================================

-- Add comments for documentation
COMMENT ON TABLE outfit_history IS 'Tracks outfits that users actually wore';
COMMENT ON TABLE shared_outfits IS 'Outfits shared to social feed';
COMMENT ON TABLE shared_outfit_likes IS 'Likes on shared outfits (social feed posts)';
COMMENT ON TABLE outfit_comments IS 'Comments on shared outfits';
COMMENT ON TABLE style_preferences IS 'User style preferences for AI suggestions';
COMMENT ON TABLE suggestion_feedback IS 'User feedback on outfit suggestions';
COMMENT ON TABLE outfit_collections IS 'User-created outfit collections/lookbooks';
COMMENT ON TABLE collection_outfits IS 'Outfits within collections';

-- =============================================================================
-- 9. HELPER FUNCTIONS FOR SOCIAL FEED
-- =============================================================================

/**
 * Get friends-only outfit feed for a user
 * Returns shared outfits from accepted friends only, sorted chronologically
 * Automatically excludes unfriended users by querying live friendship status
 * 
 * @param p_user_id - The current user's ID
 * @param p_limit - Max number of outfits to return (default 20)
 * @param p_offset - Pagination offset (default 0)
 * @returns Table of shared outfits with user info, sorted by created_at DESC
 */
CREATE OR REPLACE FUNCTION get_friends_outfit_feed(
  p_user_id UUID,
  p_limit INT DEFAULT 20,
  p_offset INT DEFAULT 0
)
RETURNS TABLE (
  outfit_id UUID,
  user_id UUID,
  username TEXT,
  user_avatar TEXT,
  caption TEXT,
  outfit_items JSONB,
  visibility TEXT,
  likes_count INT,
  comments_count INT,
  created_at TIMESTAMPTZ,
  is_liked_by_me BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    so.id AS outfit_id,
    so.user_id,
    u.username,
    u.avatar AS user_avatar,
    so.caption,
    so.outfit_items,
    so.visibility,
    so.likes_count,
    COALESCE(
      (SELECT COUNT(*)::INT FROM outfit_comments WHERE outfit_id = so.id),
      0
    ) AS comments_count,
    so.created_at,
    EXISTS(
      SELECT 1 FROM shared_outfit_likes 
      WHERE outfit_id = so.id AND user_id = p_user_id
    ) AS is_liked_by_me
  FROM shared_outfits so
  JOIN users u ON u.id = so.user_id
  WHERE so.user_id IN (
    -- Get friend IDs using bidirectional canonical ordering
    -- friends table uses requester_id < receiver_id constraint
    SELECT CASE 
      WHEN f.requester_id = p_user_id THEN f.receiver_id
      WHEN f.receiver_id = p_user_id THEN f.requester_id
    END AS friend_id
    FROM friends f
    WHERE (f.requester_id = p_user_id OR f.receiver_id = p_user_id)
      AND f.status = 'accepted'
  )
  ORDER BY so.created_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment for documentation
COMMENT ON FUNCTION get_friends_outfit_feed IS 
  'Returns chronologically sorted outfits from accepted friends only. ' ||
  'Automatically excludes unfriended users by checking live friendship status. ' ||
  'Uses bidirectional query with canonical ordering (requester_id < receiver_id).';

-- Grant permissions (if using service role)
-- GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
-- GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;