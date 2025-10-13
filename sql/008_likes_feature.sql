-- Migration 008: Likes Feature
-- Enables likes/reactions on individual clothing items
-- Date: October 6, 2025
-- This file is re-runnable - safe to execute multiple times

-- ============================================
-- DROP EXISTING OBJECTS (in reverse dependency order)
-- ============================================
DROP TRIGGER IF EXISTS increment_likes_count_trigger ON likes CASCADE;
DROP TRIGGER IF EXISTS decrement_likes_count_trigger ON likes CASCADE;
DROP TRIGGER IF EXISTS prevent_self_like_trigger ON likes CASCADE;

DROP FUNCTION IF EXISTS increment_likes_count() CASCADE;
DROP FUNCTION IF EXISTS decrement_likes_count() CASCADE;
DROP FUNCTION IF EXISTS prevent_self_like() CASCADE;
DROP FUNCTION IF EXISTS get_user_liked_items(UUID, INTEGER, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS get_item_likers(UUID, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS get_popular_items_from_friends(UUID, INTEGER) CASCADE;
DROP FUNCTION IF EXISTS has_user_liked_item(UUID, UUID) CASCADE;
DROP FUNCTION IF EXISTS get_user_likes_stats(UUID) CASCADE;

DROP VIEW IF EXISTS recent_likes CASCADE;
DROP VIEW IF EXISTS popular_items CASCADE;

DROP POLICY IF EXISTS "Users can view all likes" ON likes;
DROP POLICY IF EXISTS "Users can create own likes" ON likes;
DROP POLICY IF EXISTS "Users can delete own likes" ON likes;

DROP INDEX IF EXISTS idx_likes_user_id;
DROP INDEX IF EXISTS idx_likes_item_id;
DROP INDEX IF EXISTS idx_likes_created_at;
DROP INDEX IF EXISTS idx_likes_user_item;
DROP INDEX IF EXISTS idx_clothes_likes_count;

-- Drop likes_count column if it exists
ALTER TABLE clothes DROP COLUMN IF EXISTS likes_count;

DROP TABLE IF EXISTS likes CASCADE;

-- ============================================
-- LIKES TABLE
-- ============================================

-- Create likes table for individual clothing items
CREATE TABLE likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES clothes(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- One like per user per item
  UNIQUE(user_id, item_id)
);

-- Indexes for performance
CREATE INDEX idx_likes_user_id ON likes(user_id);
CREATE INDEX idx_likes_item_id ON likes(item_id);
CREATE INDEX idx_likes_created_at ON likes(created_at DESC);

-- Composite index for checking if user liked specific item
CREATE INDEX idx_likes_user_item ON likes(user_id, item_id);

-- ============================================
-- ADD LIKES COUNT TO CLOTHES TABLE
-- ============================================

-- Add likes_count column to clothes table for caching
ALTER TABLE clothes
  ADD COLUMN IF NOT EXISTS likes_count INTEGER DEFAULT 0;

-- Create index on likes_count for sorting by popularity
CREATE INDEX idx_clothes_likes_count ON clothes(likes_count DESC) WHERE likes_count > 0;

-- ============================================
-- TRIGGERS FOR AUTOMATIC LIKES COUNT
-- ============================================

-- Function to increment likes count
CREATE OR REPLACE FUNCTION increment_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE clothes
  SET likes_count = likes_count + 1,
      updated_at = NOW()
  WHERE id = NEW.item_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger on INSERT to likes table
CREATE TRIGGER increment_likes_count_trigger
  AFTER INSERT ON likes
  FOR EACH ROW
  EXECUTE FUNCTION increment_likes_count();

-- Function to decrement likes count
CREATE OR REPLACE FUNCTION decrement_likes_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE clothes
  SET likes_count = GREATEST(likes_count - 1, 0),
      updated_at = NOW()
  WHERE id = OLD.item_id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Trigger on DELETE from likes table
CREATE TRIGGER decrement_likes_count_trigger
  AFTER DELETE ON likes
  FOR EACH ROW
  EXECUTE FUNCTION decrement_likes_count();

-- ============================================
-- INITIALIZE EXISTING DATA
-- ============================================

-- Update likes_count for existing items (if any likes exist)
UPDATE clothes c
SET likes_count = (
  SELECT COUNT(*)
  FROM likes l
  WHERE l.item_id = c.id
)
WHERE id IN (SELECT DISTINCT item_id FROM likes);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on likes table
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view all likes
-- (Anyone can see like counts and who liked what)
CREATE POLICY "Users can view all likes"
ON likes FOR SELECT
USING (true);

-- Policy: Users can only create likes for themselves
CREATE POLICY "Users can create own likes"
ON likes FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can only delete their own likes
CREATE POLICY "Users can delete own likes"
ON likes FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Get items liked by a specific user
CREATE OR REPLACE FUNCTION get_user_liked_items(
  user_id_param UUID,
  limit_param INTEGER DEFAULT 50,
  offset_param INTEGER DEFAULT 0
)
RETURNS TABLE (
  item_id UUID,
  item_name VARCHAR(255),
  category VARCHAR(50),
  image_url TEXT,
  thumbnail_url TEXT,
  owner_id UUID,
  owner_name VARCHAR(255),
  liked_at TIMESTAMP WITH TIME ZONE,
  likes_count INTEGER
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.name,
    c.category,
    c.image_url,
    c.thumbnail_url,
    c.owner_id,
    u.name,
    l.created_at,
    c.likes_count
  FROM likes l
  JOIN clothes c ON l.item_id = c.id
  JOIN users u ON c.owner_id = u.id
  WHERE 
    l.user_id = user_id_param
    AND c.removed_at IS NULL
  ORDER BY l.created_at DESC
  LIMIT limit_param
  OFFSET offset_param;
END;
$$;

-- Get users who liked a specific item
CREATE OR REPLACE FUNCTION get_item_likers(
  item_id_param UUID,
  limit_param INTEGER DEFAULT 50
)
RETURNS TABLE (
  user_id UUID,
  user_name VARCHAR(255),
  avatar_url TEXT,
  liked_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.name,
    u.avatar_url,
    l.created_at
  FROM likes l
  JOIN users u ON l.user_id = u.id
  WHERE l.item_id = item_id_param
  ORDER BY l.created_at DESC
  LIMIT limit_param;
END;
$$;

-- Get most liked items from friends
CREATE OR REPLACE FUNCTION get_popular_items_from_friends(
  user_id_param UUID,
  limit_param INTEGER DEFAULT 20
)
RETURNS TABLE (
  item_id UUID,
  item_name VARCHAR(255),
  category VARCHAR(50),
  image_url TEXT,
  thumbnail_url TEXT,
  owner_id UUID,
  owner_name VARCHAR(255),
  likes_count INTEGER
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.name,
    c.category,
    c.image_url,
    c.thumbnail_url,
    c.owner_id,
    u.name,
    c.likes_count
  FROM clothes c
  JOIN users u ON c.owner_id = u.id
  WHERE 
    -- Item owner is a friend (accepted friendship)
    EXISTS (
      SELECT 1 FROM friends f
      WHERE 
        f.status = 'accepted'
        AND (
          (f.requester_id = user_id_param AND f.receiver_id = c.owner_id)
          OR (f.receiver_id = user_id_param AND f.requester_id = c.owner_id)
        )
    )
    AND c.removed_at IS NULL
    AND c.likes_count > 0
    -- Respect privacy: only show friends' items or public items
    AND (c.privacy = 'friends' OR c.privacy = 'public')
  ORDER BY c.likes_count DESC, c.created_at DESC
  LIMIT limit_param;
END;
$$;

-- Check if user has liked an item
CREATE OR REPLACE FUNCTION has_user_liked_item(
  user_id_param UUID,
  item_id_param UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM likes
    WHERE user_id = user_id_param
      AND item_id = item_id_param
  );
END;
$$;

-- Get like statistics for a user's closet
CREATE OR REPLACE FUNCTION get_user_likes_stats(
  user_id_param UUID
)
RETURNS TABLE (
  total_items INTEGER,
  total_likes_received INTEGER,
  avg_likes_per_item NUMERIC,
  most_liked_item_id UUID,
  most_liked_item_name VARCHAR(255),
  most_liked_item_likes INTEGER
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::INTEGER AS total_items,
    SUM(c.likes_count)::INTEGER AS total_likes_received,
    ROUND(AVG(c.likes_count), 2) AS avg_likes_per_item,
    (
      SELECT id 
      FROM clothes 
      WHERE owner_id = user_id_param 
        AND removed_at IS NULL 
      ORDER BY likes_count DESC 
      LIMIT 1
    ) AS most_liked_item_id,
    (
      SELECT name 
      FROM clothes 
      WHERE owner_id = user_id_param 
        AND removed_at IS NULL 
      ORDER BY likes_count DESC 
      LIMIT 1
    ) AS most_liked_item_name,
    (
      SELECT likes_count 
      FROM clothes 
      WHERE owner_id = user_id_param 
        AND removed_at IS NULL 
      ORDER BY likes_count DESC 
      LIMIT 1
    ) AS most_liked_item_likes
  FROM clothes c
  WHERE 
    c.owner_id = user_id_param
    AND c.removed_at IS NULL;
END;
$$;

-- ============================================
-- ANALYTICS VIEWS
-- ============================================

-- View: Most liked items overall (for admin analytics)
CREATE OR REPLACE VIEW popular_items AS
SELECT 
  c.id,
  c.name,
  c.category,
  c.image_url,
  c.thumbnail_url,
  c.owner_id,
  u.name AS owner_name,
  c.likes_count,
  c.created_at
FROM clothes c
JOIN users u ON c.owner_id = u.id
WHERE 
  c.removed_at IS NULL
  AND c.likes_count > 0
ORDER BY c.likes_count DESC, c.created_at DESC;

-- View: Like activity timeline
CREATE OR REPLACE VIEW recent_likes AS
SELECT 
  l.id,
  l.user_id,
  u.name AS user_name,
  l.item_id,
  c.name AS item_name,
  c.category,
  c.owner_id,
  owner.name AS owner_name,
  l.created_at
FROM likes l
JOIN users u ON l.user_id = u.id
JOIN clothes c ON l.item_id = c.id
JOIN users owner ON c.owner_id = owner.id
WHERE c.removed_at IS NULL
ORDER BY l.created_at DESC;

-- ============================================
-- VALIDATION CONSTRAINTS
-- ============================================

-- Prevent users from liking their own items (database-level check)
-- Note: This is also enforced in the application layer for better UX
CREATE OR REPLACE FUNCTION prevent_self_like()
RETURNS TRIGGER AS $$
DECLARE
  item_owner_id UUID;
BEGIN
  -- Get the owner of the item
  SELECT owner_id INTO item_owner_id
  FROM clothes
  WHERE id = NEW.item_id;
  
  -- Check if user is trying to like their own item
  IF item_owner_id = NEW.user_id THEN
    RAISE EXCEPTION 'Users cannot like their own items';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER prevent_self_like_trigger
  BEFORE INSERT ON likes
  FOR EACH ROW
  EXECUTE FUNCTION prevent_self_like();

-- ============================================
-- COMMENTS
-- ============================================

COMMENT ON TABLE likes IS 'User likes on individual clothing items';
COMMENT ON COLUMN likes.user_id IS 'User who liked the item';
COMMENT ON COLUMN likes.item_id IS 'Clothing item that was liked';
COMMENT ON COLUMN clothes.likes_count IS 'Cached count of likes for performance (auto-updated by triggers)';

COMMENT ON FUNCTION get_user_liked_items IS 'Get all items liked by a specific user with pagination';
COMMENT ON FUNCTION get_item_likers IS 'Get all users who liked a specific item';
COMMENT ON FUNCTION get_popular_items_from_friends IS 'Get most liked items from user''s friends';
COMMENT ON FUNCTION has_user_liked_item IS 'Check if a user has liked a specific item';
COMMENT ON FUNCTION get_user_likes_stats IS 'Get like statistics for a user''s closet';

COMMENT ON VIEW popular_items IS 'Most liked items across all users (for analytics)';
COMMENT ON VIEW recent_likes IS 'Recent like activity timeline';

COMMENT ON FUNCTION increment_likes_count IS 'Auto-increment likes_count when a like is added';
COMMENT ON FUNCTION decrement_likes_count IS 'Auto-decrement likes_count when a like is removed';
COMMENT ON FUNCTION prevent_self_like IS 'Prevent users from liking their own items';
